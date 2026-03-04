import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SKILL_MAP = {
  MEDICAL: "medical",
  FIRE: "firefighting",
  FLOOD: "water_rescue",
  RESCUE: "search_rescue",
  OTHER: null,
};

function haversineKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function scoreVolunteer(v, request) {
  let score = 0;
  const requiredSkill = SKILL_MAP[request.emergency_type];
  if (requiredSkill && v.skills && v.skills.includes(requiredSkill)) score += 40;

  const dist = haversineKm(request.latitude, request.longitude, v.current_latitude, v.current_longitude);
  if (dist !== null) {
    if (dist < 5) score += 30;
    else if (dist < 15) score += 20;
    else if (dist < 30) score += 10;
    else if (dist < 50) score += 5;
    // >50km = 0
  }

  if (v.response_rate != null) score += (v.response_rate / 100) * 20;

  const fatigue = v.missions_last_6_hours || 0;
  if (fatigue === 0) score += 10;
  else if (fatigue === 1) score += 7;
  else if (fatigue === 2) score += 4;

  return { score, dist };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { event, data, old_data } = payload;

    // ── Handle Mission update (accepted) ──────────────────────────
    if (event?.entity_name === "Mission" && event?.type === "update") {
      const mission = data;
      if (mission?.response_type !== "accept" || mission?.status !== "accepted") {
        return Response.json({ skipped: true, reason: "Not an acceptance event" });
      }

      // Cancel other notified missions for same request
      const allMissions = await base44.asServiceRole.entities.Mission.filter({
        emergency_request_id: mission.emergency_request_id,
        status: "notified",
      });

      const cancellations = allMissions.filter(m => m.id !== mission.id);
      await Promise.all(cancellations.map(m =>
        base44.asServiceRole.entities.Mission.update(m.id, { status: "timeout", response_type: "timeout" })
      ));

      // Update emergency request
      await base44.asServiceRole.entities.EmergencyRequest.update(mission.emergency_request_id, {
        status: "assigned",
        volunteer_id: mission.volunteer_id,
        assigned_at: new Date().toISOString(),
      });

      // Log
      await base44.asServiceRole.entities.AuditLog.create({
        user_email: "system@aidbridge",
        action_type: "update",
        entity_type: "EmergencyRequest",
        entity_id: mission.emergency_request_id,
        description: `Volunteer ${mission.volunteer_id} accepted mission. ${cancellations.length} other notifications cancelled.`,
      });

      return Response.json({ success: true, cancelled: cancellations.length });
    }

    // ── Handle EmergencyRequest create (status=pending) ───────────
    if (event?.entity_name !== "EmergencyRequest" || event?.type !== "create") {
      return Response.json({ skipped: true, reason: "Not a new EmergencyRequest" });
    }

    const request = data;
    if (!request || request.status !== "pending") {
      return Response.json({ skipped: true, reason: "Request not in pending status" });
    }

    // Query available, non-fatigued volunteers
    const allVolunteers = await base44.asServiceRole.entities.Volunteer.list();
    const eligible = allVolunteers.filter(v =>
      (v.current_status === "available" || v.status === "available") &&
      (v.missions_last_6_hours || 0) < 3
    );

    // Score and rank
    const ranked = eligible
      .map(v => {
        const { score, dist } = scoreVolunteer(v, request);
        return { ...v, _score: score, _dist: dist };
      })
      .sort((a, b) => b._score - a._score);

    // Check if any within 50km
    const within50 = ranked.filter(v => v._dist !== null && v._dist <= 50);

    // Escalation path
    if (within50.length === 0) {
      await base44.asServiceRole.entities.AuditLog.create({
        user_email: "system@aidbridge",
        action_type: "create",
        entity_type: "EmergencyRequest",
        entity_id: request.id,
        description: `ESCALATION: No volunteers within 50km for ${request.emergency_type} at ${request.address || "unknown location"}. External emergency services required.`,
      });
      return Response.json({
        success: true,
        escalated: true,
        message: `ESCALATION REQUIRED: No volunteers available within 50km for ${request.emergency_type}. Recommend immediate escalation to external emergency services.`,
      });
    }

    // Select top N
    const isPriority = ["P0", "P1"].includes(request.priority);
    const topN = within50.slice(0, isPriority ? 5 : 3);

    // Create Mission records
    const now = new Date().toISOString();
    await Promise.all(topN.map(v =>
      base44.asServiceRole.entities.Mission.create({
        emergency_request_id: request.id,
        volunteer_id: v.id,
        status: "notified",
        notification_sent_at: now,
      })
    ));

    // Update EmergencyRequest to notifying
    await base44.asServiceRole.entities.EmergencyRequest.update(request.id, {
      status: "notifying",
    });

    // Build response message
    const names = topN.map(v => `${v.first_name} ${v.last_name}`).join(", ");
    const avgDist = topN.reduce((sum, v) => sum + (v._dist || 0), 0) / topN.length;
    const estTime = Math.round(avgDist * 3 + 5);

    const message = `Notified ${topN.length} volunteers: ${names}. Average distance: ${avgDist.toFixed(1)}km. Estimated response time: ~${estTime} minutes.`;

    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: "system@aidbridge",
      action_type: "create",
      entity_type: "EmergencyRequest",
      entity_id: request.id,
      description: message,
    });

    return Response.json({ success: true, notified: topN.length, message });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});