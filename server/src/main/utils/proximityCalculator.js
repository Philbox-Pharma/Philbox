/**
 * Proximity Calculator Utility
 * Calculates distance between two addresses using various methods:
 * 1. Extract coordinates from Google Maps links
 * 2. Resolve short Google Maps links when needed
 * 2. Fall back to city/province comparison
 * 3. Haversine formula for actual distance calculation
 * 4. Road distance approximation using city-specific factors
 */

const SHORT_LINK_HOSTS = new Set(['maps.app.goo.gl', 'goo.gl']);
const resolvedLinkCache = new Map();
const safeString = value => String(value ?? '').trim();

/**
 * Road distance multiplier factors by city
 * Accounts for actual driving routes vs straight-line distance
 * Range: 1.3-1.8 depending on road density and traffic patterns
 * Default: 1.5 for most urban areas
 */
const ROAD_DISTANCE_FACTORS = {
  lahore: 1.5,
  karachi: 1.5,
  islamabad: 1.5,
  rawalpindi: 1.5,
  faisalabad: 1.5,
  multan: 1.5,
  peshawar: 1.5,
  quetta: 1.5,
  hyderabad: 1.5,
  default: 1.5, // Default factor for any city not listed
};

function extractCoordinatesFromAddress(address) {
  if (!address) return null;

  const latitude = Number(address.latitude ?? address.lat);
  const longitude = Number(address.longitude ?? address.lng);

  if (isValidCoordinate(latitude, longitude)) {
    return { latitude, longitude };
  }

  const coordinates = address.coordinates;
  if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
    return toCoordinate(coordinates[0], coordinates[1]);
  }

  return null;
}

async function resolveCoordinatesForAddress(address) {
  const storedCoordinates = extractCoordinatesFromAddress(address);
  if (storedCoordinates) {
    return storedCoordinates;
  }

  const mapLink = address?.google_map_link;
  if (!mapLink) return null;

  return extractCoordinatesFromMapLinkWithResolution(mapLink);
}

function isValidCoordinate(latitude, longitude) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function toCoordinate(latitudeValue, longitudeValue) {
  const latitude = Number.parseFloat(latitudeValue);
  const longitude = Number.parseFloat(longitudeValue);

  if (!isValidCoordinate(latitude, longitude)) {
    return null;
  }

  return { latitude, longitude };
}

function extractCoordinatePair(rawValue) {
  if (!rawValue) return null;

  const decodedValue = decodeURIComponent(String(rawValue));
  const pairMatch = decodedValue.match(
    /(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/
  );

  if (!pairMatch) {
    return null;
  }

  return toCoordinate(pairMatch[1], pairMatch[2]);
}

function extractCoordinatesFromText(rawText) {
  if (!rawText) return null;

  const text = decodeURIComponent(String(rawText));
  const textPatterns = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  ];

  for (const pattern of textPatterns) {
    const match = text.match(pattern);
    if (match) {
      const coords = toCoordinate(match[1], match[2]);
      if (coords) return coords;
    }
  }

  return extractCoordinatePair(text);
}

function shouldResolveShortLink(mapLink) {
  try {
    const url = new URL(mapLink);
    if (SHORT_LINK_HOSTS.has(url.hostname)) {
      return true;
    }

    return (
      url.hostname === 'goo.gl' &&
      url.pathname.toLowerCase().startsWith('/maps')
    );
  } catch {
    return false;
  }
}

async function resolveMapLink(mapLink) {
  if (!mapLink || !shouldResolveShortLink(mapLink)) {
    return mapLink;
  }

  if (resolvedLinkCache.has(mapLink)) {
    return resolvedLinkCache.get(mapLink);
  }

  if (typeof fetch !== 'function') {
    return mapLink;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(mapLink, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });

    const resolvedUrl = response.url || mapLink;
    resolvedLinkCache.set(mapLink, resolvedUrl);
    return resolvedUrl;
  } catch {
    return mapLink;
  } finally {
    clearTimeout(timeout);
  }
}

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
    const textCoordinates = extractCoordinatesFromText(mapLink);
    if (textCoordinates) {
      return textCoordinates;
    }

    const url = new URL(mapLink);
    const coordinateParams = [
      'q',
      'query',
      'll',
      'sll',
      'center',
      'destination',
      'origin',
      'daddr',
    ];

    for (const param of coordinateParams) {
      const value = url.searchParams.get(param);
      const coordinates = extractCoordinatePair(value);
      if (coordinates) {
        return coordinates;
      }
    }

    const pathCoordinates = extractCoordinatesFromText(url.pathname);
    if (pathCoordinates) {
      return pathCoordinates;
    }
  } catch {
    return extractCoordinatesFromText(mapLink);
  }

  return null;
}

async function extractCoordinatesFromMapLinkWithResolution(mapLink) {
  const directCoordinates = extractCoordinatesFromMapLink(mapLink);
  if (directCoordinates) {
    return directCoordinates;
  }

  const resolvedLink = await resolveMapLink(mapLink);
  if (!resolvedLink || resolvedLink === mapLink) {
    return null;
  }

  return extractCoordinatesFromMapLink(resolvedLink);
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
 * Get road distance factor for a specific city
 * Returns the appropriate multiplier for estimated road distance calculation
 * @param {string} city - City name
 * @returns {number} Road distance factor (1.3-1.8 range)
 */
function getRoadDistanceFactor(city) {
  if (!city) return ROAD_DISTANCE_FACTORS.default;

  const normalizedCity = String(city).toLowerCase().trim();
  return ROAD_DISTANCE_FACTORS[normalizedCity] || ROAD_DISTANCE_FACTORS.default;
}

/**
 * Calculate estimated road distance using Haversine × road factor
 * Road factor accounts for actual driving routes vs straight-line distance
 * Uses city-specific factors from ROAD_DISTANCE_FACTORS
 * Typical range: 1.3-1.8 depending on road density and traffic patterns
 * Returns distance in kilometers
 */
function calculateRoadDistance(coord1, coord2, city = null) {
  const straightLineDistance = calculateDistance(coord1, coord2);
  const roadFactor = getRoadDistanceFactor(city);
  const estimatedRoadDistance = straightLineDistance * roadFactor;
  return estimatedRoadDistance;
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
        const city = userAddress?.city || branchAddress?.city;
        proximityScore = calculateRoadDistance(
          userCoordinates,
          branchCoordinates,
          city
        );
        method = 'road_distance'; // estimated road distance in km
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

export async function rankBranchesByProximityAsync(userAddress, branches) {
  if (!branches || branches.length === 0) {
    return [];
  }

  const userCoordinates = await resolveCoordinatesForAddress(userAddress);

  const rankedBranches = await Promise.all(
    branches.map(async branch => {
      const branchObj =
        typeof branch.toObject === 'function' ? branch.toObject() : branch;
      const branchAddress = branchObj.address_id || branchObj.address;
      const userMapLink = safeString(userAddress?.google_map_link);
      const branchMapLink = safeString(branchAddress?.google_map_link);

      let proximityScore = Infinity;
      let method = 'location_hierarchy';

      if (userCoordinates) {
        const branchCoordinates =
          await resolveCoordinatesForAddress(branchAddress);

        if (branchCoordinates) {
          const city = userAddress?.city || branchAddress?.city;
          const distanceKm = calculateRoadDistance(
            userCoordinates,
            branchCoordinates,
            city
          );

          if (
            distanceKm > 0 ||
            !userMapLink ||
            !branchMapLink ||
            userMapLink === branchMapLink
          ) {
            proximityScore = distanceKm;
            method = 'road_distance';
          }
        }
      }

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
    })
  );

  return rankedBranches.sort((a, b) => a.proximityScore - b.proximityScore);
}

export {
  resolveMapLink,
  extractCoordinatesFromAddress,
  resolveCoordinatesForAddress,
  extractCoordinatesFromMapLink,
  extractCoordinatesFromMapLinkWithResolution,
  calculateDistance,
  calculateRoadDistance,
  getRoadDistanceFactor,
  calculateLocationProximityScore,
};
