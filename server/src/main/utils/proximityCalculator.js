/**
 * Proximity Calculator Utility
 * Calculates distance between two addresses using various methods:
 * 1. Extract coordinates from Google Maps links
 * 2. Fall back to city/province comparison
 * 3. Haversine formula for actual distance calculation
 */

/**
 * Extract coordinates from Google Maps link
 * Supports formats:
 * - https://www.google.com/maps/@40.7128,-74.0060,15z
 * - https://maps.google.com/?q=40.7128,-74.0060
 * - https://goo.gl/maps/xxxxx
 */
function extractCoordinatesFromMapLink(mapLink) {
  if (!mapLink) return null;

  try {
    // Format: .../@lat,lng,...
    const atPattern = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/;
    const atMatch = mapLink.match(atPattern);

    if (atMatch) {
      return {
        latitude: parseFloat(atMatch[1]),
        longitude: parseFloat(atMatch[2]),
      };
    }

    // Try URL parsing for query parameter
    const url = new URL(mapLink);
    const qParam = url.searchParams.get('q');
    if (qParam) {
      const [lat, lng] = qParam.split(',').map(c => parseFloat(c.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        return { latitude: lat, longitude: lng };
      }
    }
  } catch (error) {
    console.error('Error extracting coordinates:', error);
  }

  return null;
}

/**
 * Haversine formula to calculate distance between two coordinates
 * Returns distance in kilometers
 */
function calculateDistance(coord1, coord2) {
  const R = 6371; // Earth's radius in kilometers

  const lat1 = (coord1.latitude * Math.PI) / 180;
  const lat2 = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Fallback proximity scoring based on location hierarchy
 * Returns a score (lower is closer)
 */
function calculateLocationProximityScore(userAddress, branchAddress) {
  let score = 0;

  // Country match: 0 points
  if (userAddress.country !== branchAddress.country) {
    return 999; // Very far
  }

  // Province/State match: 10 points
  if (userAddress.province !== branchAddress.province) {
    score += 100;
  }

  // City match: 50 points
  if (userAddress.city !== branchAddress.city) {
    score += 50;
  }

  // Town match: 10 points
  if (userAddress.town && branchAddress.town) {
    if (userAddress.town !== branchAddress.town) {
      score += 10;
    }
  }

  return score;
}

/**
 * Main function to calculate proximity and rank branches
 * @param {Object} userAddress - Customer's address object
 * @param {Array} branches - Array of branch objects with addresses
 * @returns {Array} Ranked branches sorted by proximity
 */
export function rankBranchesByProximity(userAddress, branches) {
  if (!branches || branches.length === 0) {
    return [];
  }

  const userCoordinates = extractCoordinatesFromMapLink(
    userAddress?.google_map_link
  );

  // Rank each branch
  const rankedBranches = branches.map(branch => {
    const branchObj =
      typeof branch.toObject === 'function' ? branch.toObject() : branch;
    const branchAddress = branchObj.address_id || branchObj.address;

    let proximityScore = Infinity;
    let method = 'location_hierarchy'; // scoring method used

    // Try to calculate using coordinates if available
    if (userCoordinates) {
      const branchCoordinates = extractCoordinatesFromMapLink(
        branchAddress?.google_map_link
      );

      if (branchCoordinates) {
        proximityScore = calculateDistance(userCoordinates, branchCoordinates);
        method = 'haversine'; // actual distance in km
      }
    }

    // Fallback to location hierarchy scoring
    if (proximityScore === Infinity && branchAddress) {
      proximityScore = calculateLocationProximityScore(
        userAddress,
        branchAddress
      );
      method = 'location_hierarchy';
    }

    return {
      ...branchObj,
      proximityScore,
      proximityMethod: method,
    };
  });

  // Sort by proximity score (lowest = closest)
  return rankedBranches.sort((a, b) => a.proximityScore - b.proximityScore);
}

export {
  extractCoordinatesFromMapLink,
  calculateDistance,
  calculateLocationProximityScore,
};
