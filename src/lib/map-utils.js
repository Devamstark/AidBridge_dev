/**
 * Utility functions for map calculations and volunteer matching
 */

/**
 * Calculates the distance between two points on Earth using the Haversine formula
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Ranks volunteers for a specific emergency request based on proximity, skills, and availability
 * @param {Object} request The emergency request object
 * @param {Array} volunteers List of available volunteers
 * @returns {Array} Ranked list of volunteers with scores
 */
export function rankVolunteers(request, volunteers) {
    if (!request || !volunteers || volunteers.length === 0) return [];

    return volunteers
        .map(volunteer => {
            let score = 0;

            // 1. Proximity Score (Weight: 50%)
            // Closer is better. We'll use 1 / (distance + 1) as a base
            const distance = calculateDistance(
                request.latitude,
                request.longitude,
                volunteer.currentLat,
                volunteer.currentLng
            );
            const proximityScore = Math.max(0, 100 - (distance * 10)); // 0 score if more than 10km away
            score += proximityScore * 0.5;

            // 2. Skill Match Score (Weight: 30%)
            const reqType = request.type?.toLowerCase() || "";
            const volunteerSkills = volunteer.skills || []; // Assuming skills is an array

            let skillMatch = 0;
            if (reqType.includes('medical') || reqType.includes('injury')) {
                if (volunteerSkills.some(s => s.toLowerCase().includes('medical') || s.toLowerCase().includes('first aid'))) {
                    skillMatch = 100;
                }
            } else if (reqType.includes('fire') || reqType.includes('rescue')) {
                if (volunteerSkills.some(s => s.toLowerCase().includes('rescue') || s.toLowerCase().includes('safety'))) {
                    skillMatch = 100;
                }
            } else if (volunteerSkills.length > 0) {
                skillMatch = 50; // General bonus for having any skills
            }
            score += skillMatch * 0.3;

            // 3. Availability/Experience Score (Weight: 20%)
            // Since they are already filtered by 'AVAILABLE', we can use experience or status
            const experienceScore = volunteer.experienceLevel === 'ADVANCED' ? 100 :
                volunteer.experienceLevel === 'INTERMEDIATE' ? 70 : 40;
            score += experienceScore * 0.2;

            return {
                ...volunteer,
                matchScore: Math.round(score),
                distance: distance.toFixed(2)
            };
        })
        .sort((a, b) => b.matchScore - a.matchScore);
}
