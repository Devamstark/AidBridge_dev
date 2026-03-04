import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled calls (no user auth) by using service role
    const volunteers = await base44.asServiceRole.entities.Volunteer.list();

    const now = new Date();
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

    const stale = volunteers.filter(v => {
      // Skip inactive/offline volunteers
      if (v.status === "inactive") return false;

      // Check last activity: last mission completed, checked in, or location update
      const lastActivity = [
        v.last_mission_completed_at,
        v.checked_in_at,
        v.location_updated_at,
        v.status_confirmed_at,
      ]
        .filter(Boolean)
        .map(t => new Date(t))
        .sort((a, b) => b - a)[0];

      if (!lastActivity) return false; // Never had activity, skip

      const msSinceActivity = now - lastActivity;
      const isStale = msSinceActivity > TWO_HOURS_MS;

      // Only prompt if they're supposedly active (available, on_break) but haven't confirmed recently
      const activeStatus = ["available", "on_break", "on_mission"].includes(v.current_status || v.status);

      return isStale && activeStatus;
    });

    // Mark each stale volunteer as needing status confirmation
    const updates = await Promise.all(
      stale.map(v =>
        base44.asServiceRole.entities.Volunteer.update(v.id, {
          needs_status_confirmation: true,
        })
      )
    );

    // Audit log
    if (stale.length > 0) {
      await base44.asServiceRole.entities.AuditLog.create({
        user_email: "system@aidbridge",
        action_type: "update",
        entity_type: "Volunteer",
        description: `Status check: ${stale.length} volunteer(s) prompted to confirm status: ${stale.map(v => `${v.first_name} ${v.last_name}`).join(", ")}`,
      });
    }

    return Response.json({
      success: true,
      checked: volunteers.length,
      prompted: stale.length,
      volunteers: stale.map(v => ({ id: v.id, name: `${v.first_name} ${v.last_name}`, current_status: v.current_status })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});