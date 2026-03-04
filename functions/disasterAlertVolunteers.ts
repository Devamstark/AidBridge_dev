import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Disaster type → required volunteer skill mapping
const DISASTER_SKILL_MAP = {
  tornado:    ["search_rescue", "first_aid"],
  hurricane:  ["search_rescue", "first_aid", "water_rescue"],
  flood:      ["water_rescue", "first_aid"],
  earthquake: ["search_rescue", "medical", "first_aid"],
  conflict:   ["medical", "first_aid"],
  famine:     ["medical", "first_aid"],
  tsunami:    ["water_rescue", "search_rescue", "first_aid"],
  wildfire:   ["firefighting", "first_aid"],
  other:      [],
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

// Returns proximity score (0-40) and distance
function proximityScore(dist) {
  if (dist === null) return { pts: 5, label: "unknown dist" }; // no GPS → still eligible, lower priority
  if (dist <= 20)  return { pts: 40, label: `${dist.toFixed(1)}km` };
  if (dist <= 50)  return { pts: 30, label: `${dist.toFixed(1)}km` };
  if (dist <= 100) return { pts: 15, label: `${dist.toFixed(1)}km` };
  if (dist <= 200) return { pts: 5,  label: `${dist.toFixed(1)}km` };
  return null; // >200km → exclude
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { event, data } = payload;

    // Only trigger on Disaster create
    if (event?.entity_name !== "Disaster" || event?.type !== "create") {
      return Response.json({ skipped: true, reason: "Not a Disaster create event" });
    }

    const disaster = data;

    // Only alert for active disasters
    if (!disaster || disaster.status !== "active") {
      return Response.json({ skipped: true, reason: "Disaster not active" });
    }

    const requiredSkills = DISASTER_SKILL_MAP[disaster.disaster_type] || [];

    // Fetch all available, non-fatigued volunteers
    const allVolunteers = await base44.asServiceRole.entities.Volunteer.list();
    const available = allVolunteers.filter(v =>
      (v.current_status === "available" || v.status === "available") &&
      (v.missions_last_6_hours || 0) < 3
    );

    // Score each volunteer
    const candidates = [];
    for (const v of available) {
      let score = 0;

      // Skill match
      const volSkills = (v.skills || "").split(",").map(s => s.trim().toLowerCase());
      const matchedSkills = requiredSkills.filter(s => volSkills.includes(s));
      const skillScore = requiredSkills.length > 0
        ? Math.round((matchedSkills.length / requiredSkills.length) * 50)
        : 25; // no required skills → all eligible with base score
      score += skillScore;

      // Proximity
      const dist = haversineKm(
        disaster.coordinates_lat, disaster.coordinates_lng,
        v.current_latitude, v.current_longitude
      );
      const prox = proximityScore(dist);
      if (prox === null) continue; // >200km → skip
      score += prox.pts;

      // Fatigue penalty
      const fatigue = v.missions_last_6_hours || 0;
      score -= fatigue * 5;

      // Only require some skill relevance if skills are defined
      if (requiredSkills.length > 0 && matchedSkills.length === 0) continue;

      candidates.push({ ...v, _score: score, _dist: dist, _matchedSkills: matchedSkills, _distLabel: prox.label });
    }

    candidates.sort((a, b) => b._score - a._score);

    if (candidates.length === 0) {
      await base44.asServiceRole.entities.AuditLog.create({
        user_email: "system@aidbridge",
        action_type: "create",
        entity_type: "Disaster",
        entity_id: disaster.id,
        description: `Disaster alert: No matching volunteers found for ${disaster.disaster_type} disaster "${disaster.name}".`,
      });
      return Response.json({ success: true, notified: 0, message: "No matching volunteers found." });
    }

    // Alert top N based on severity
    const severity = disaster.severity || 2;
    const maxAlerts = severity >= 4 ? 15 : severity === 3 ? 10 : 5;
    const toAlert = candidates.slice(0, maxAlerts);

    const now = new Date().toISOString();

    // Create Mission records and send email notifications
    const results = await Promise.allSettled(toAlert.map(async (v) => {
      // Create Mission record linked to disaster (using disaster.id as emergency_request_id placeholder)
      await base44.asServiceRole.entities.Mission.create({
        emergency_request_id: disaster.id,
        volunteer_id: v.id,
        status: "notified",
        notification_sent_at: now,
        notes: `Disaster alert: ${disaster.disaster_type} - "${disaster.name}" in ${disaster.affected_area || "unknown area"}. Matched skills: ${v._matchedSkills.join(", ") || "general"}.`,
      });

      // Send email if volunteer has an email
      if (v.email) {
        const skillList = v._matchedSkills.length > 0
          ? v._matchedSkills.map(s => s.replace(/_/g, " ")).join(", ")
          : "general response";
        const distText = v._dist !== null ? ` (~${v._distLabel} from your location)` : "";
        const severityLabel = ["", "Low", "Moderate", "High", "Severe", "Extreme"][severity] || "Unknown";

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: v.email,
          subject: `🚨 [AidBridge] Disaster Alert – ${disaster.name} (Severity: ${severityLabel})`,
          body: `
Dear ${v.first_name} ${v.last_name},

AidBridge has identified a ${severityLabel.toUpperCase()} severity disaster event requiring volunteers with your skills.

── DISASTER DETAILS ──
Name: ${disaster.name}
Type: ${disaster.disaster_type?.replace(/_/g, " ").toUpperCase()}
Severity: ${severity}/5 (${severityLabel})
Area: ${disaster.affected_area || "See coordinator for details"}
Estimated affected: ${disaster.estimated_affected ? disaster.estimated_affected.toLocaleString() + " people" : "Unknown"}
${disaster.description ? `\nDescription:\n${disaster.description}` : ""}

── YOUR MATCH ──
Your skills: ${skillList}
Distance to disaster${distText}

── WHAT TO DO ──
1. Log in to AidBridge immediately: https://app.base44.com
2. Accept or decline your mission assignment
3. Follow coordinator instructions

If you are unavailable, please update your status in AidBridge so we can assign another volunteer.

Stay safe,
AidBridge Emergency Coordination System
          `.trim(),
        });
      }

      return v.id;
    }));

    const sent = results.filter(r => r.status === "fulfilled").length;
    const withEmail = toAlert.filter(v => v.email).length;
    const names = toAlert.slice(0, 5).map(v => `${v.first_name} ${v.last_name}`).join(", ");

    const summary = `Disaster "${disaster.name}" (${disaster.disaster_type}, sev ${severity}): Alerted ${sent}/${toAlert.length} volunteers. ${withEmail} email(s) sent. Top candidates: ${names}${toAlert.length > 5 ? ` +${toAlert.length - 5} more` : ""}.`;

    await base44.asServiceRole.entities.AuditLog.create({
      user_email: "system@aidbridge",
      action_type: "create",
      entity_type: "Disaster",
      entity_id: disaster.id,
      description: summary,
    });

    return Response.json({ success: true, notified: sent, emailsSent: withEmail, message: summary });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});