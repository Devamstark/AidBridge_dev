/**
 * Utility functions for generating Situation Reports (SITREPs)
 */

/**
 * Generates a textual summary of the current operation
 * @param {Object} data Object containing requests, resources, volunteers, and disasters
 * @returns {String} A professional executive summary
 */
export function generateOperationSummary(data) {
    const { requests = [], resources = [], volunteers = [], disasters = [] } = data;

    const activeRequests = requests.filter(r => ['PENDING', 'IN_PROGRESS', 'ASSIGNED'].includes(r.status));
    const p0Requests = activeRequests.filter(r => r.priority === 'P0');
    const resolvedRequests = requests.filter(r => r.status === 'RESOLVED').length;

    const availableVolunteers = volunteers.filter(v => v.status === 'AVAILABLE').length;
    const onDutyVolunteers = volunteers.filter(v => v.status === 'ON_DUTY').length;

    const criticalResources = resources.filter(res => {
        const percentage = (res.currentStock / res.minThreshold) * 100;
        return percentage < 25;
    });

    const activeDisasters = disasters.filter(d => d.status === 'ACTIVE' || !d.status).length; // Assuming disasters have status

    let summary = `EXECUTIVE SUMMARY: AS OF ${new Date().toLocaleString()}\n\n`;

    summary += `STATUS: There are currently ${activeDisasters} active disaster events being managed. `;
    summary += `A total of ${activeRequests.length} emergency requests are active, including ${p0Requests.length} critical (P0) alerts. `;
    summary += `${resolvedRequests} requests have been successfully resolved during this period.\n\n`;

    summary += `PERSONNEL: ${availableVolunteers} volunteers are currently available for dispatch, with ${onDutyVolunteers} personnel active in the field. `;
    if (p0Requests.length > availableVolunteers) {
        summary += `CRITICAL: Current P0 request volume (${p0Requests.length}) exceeds available quick-response personnel.\n\n`;
    } else {
        summary += `Capacity is currently sufficient for active requests.\n\n`;
    }

    summary += `RESOURCES: `;
    if (criticalResources.length > 0) {
        summary += `${criticalResources.length} resource categories are below critical thresholds (<25%). `;
        summary += `Urgent replenishment required for: ${criticalResources.map(r => r.name).join(', ')}.\n\n`;
    } else {
        summary += `Resource levels remain within stable operating parameters.\n\n`;
    }

    summary += `OPERATIONAL FOCUS: Immediate priority remains the resolution of P0 requests in affected sectors and stabilizing resource supply lines.`;

    return summary;
}

/**
 * Filters data for a specific time range
 * @param {Array} items List of items with createdAt/timestamp
 * @param {String} range 'day', 'week', 'month'
 * @returns {Array} Filtered list
 */
export function filterByRange(items, range) {
    const now = new Date();
    let startTime;

    if (range === 'day') {
        startTime = new Date(now.setHours(0, 0, 0, 0));
    } else if (range === 'week') {
        const day = now.getDay();
        startTime = new Date(now.setDate(now.getDate() - day));
        startTime.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
        startTime = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
        return items;
    }

    return items.filter(item => {
        const itemDate = new Date(item.createdAt || item.updatedAt || item.timestamp);
        return itemDate >= startTime;
    });
}
