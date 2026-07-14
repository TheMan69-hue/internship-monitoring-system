const defaultGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
}

function toLocationPayload(position) {
  const {
    accuracy,
    altitude,
    altitudeAccuracy,
    heading,
    latitude,
    longitude,
    speed,
  } = position.coords

  return {
    latitude,
    longitude,
    accuracy,
    altitude,
    altitudeAccuracy,
    heading,
    speed,
  }
}

export function getCurrentLocation(options = {}) {
  if (!('geolocation' in navigator)) {
    return Promise.reject(new Error('Geolocation is not supported by this browser.'))
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(toLocationPayload(position)),
      (error) => reject(error),
      {
        ...defaultGeolocationOptions,
        ...options,
      },
    )
  })
}

function getReadableAddress(address = {}, displayName = '') {
  if (!address || Object.keys(address).length === 0) {
    if (displayName) return displayName.split(',').slice(0, 3).join(', ').trim();
    return 'Unknown Location';
  }

  // 1. Gather geographic pieces from most specific to least specific
  const components = [
    address.university || address.college || address.school || address.building || address.amenity,
    address.road || address.street,
    address.residential || address.subdivision,
    address.neighbourhood || address.suburb || address.village || address.barrio || address.barangay,
    address.city || address.town || address.municipality
  ].filter(Boolean);

  const uniqueComponents = [];

  // 2. Aggressive Deduplication: strips spaces/numbers to catch "San Agustin 1" vs "San Agustin"
  components.forEach((item) => {
    const cleanItem = item.trim();
    
    const isRedundant = uniqueComponents.some((existing) => {
      const normalExisting = existing.toLowerCase().replace(/[^a-z]/g, '');
      const normalClean = cleanItem.toLowerCase().replace(/[^a-z]/g, '');
      return normalExisting.includes(normalClean) || normalClean.includes(normalExisting);
    });

    if (!isRedundant) {
      uniqueComponents.push(cleanItem);
    }
  });

  // 3. Keep ONLY the top 3 most descriptive local elements
  // Example result: "Neptune Street, Solar Homes, San Agustin 1"
  return uniqueComponents.slice(0, 3).join(', ');
}

export async function reverseGeocodeLocation({ latitude, longitude }) {
  const radius = 5; // Distance in meters to scan around the student
  
  // Overpass QL query looking for any named nodes or ways near the coordinate
  const overpassQuery = `
    [out:json][timeout:10];
    (
      node(around:${radius},${latitude},${longitude})["name"];
      way(around:${radius},${latitude},${longitude})["name"];
    );
    out tags;
  `;

  try {
    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
    
    if (!response.ok) throw new Error("Overpass API failed");
    const data = await response.json();

    if (data.elements && data.elements.length > 0) {
      // Prioritize institutional and structural tags over generic items
      const elements = data.elements.map(e => e.tags);
      
      const bestMatch = elements.find(el => el.university || el.amenity === 'university' || el.building) || 
                        elements.find(el => el.shop || el.tourism || el.amenity) || 
                        elements[0]; // Fallback to first found named element

      if (bestMatch && bestMatch.name) {
        return bestMatch.name;
      }
    }
  } catch (error) {
    console.warn("Overpass failed, falling back to basic geocoding...", error);
  }

  const searchParams = new URLSearchParams({
    format: 'jsonv2',
    lat: String(latitude),
    lon: String(longitude),
    zoom: '18',
    addressdetails: '1'
  });

  const fallbackResp = await fetch(`https://nominatim.openstreetmap.org/reverse?${searchParams.toString()}`);
  const fallbackData = await fallbackResp.json();
  return fallbackData.display_name || "Unknown Location";
}