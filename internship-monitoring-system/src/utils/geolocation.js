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
  // 1. Broadened POI checklist to capture campuses, schools, and major complexes
  const poi = address.university || 
              address.college ||
              address.school ||
              address.office ||
              address.amenity || 
              address.building || 
              address.shop || 
              address.tourism || 
              address.historic || 
              address.leisure ||
              address.railway ||
              address.attraction;

  // 2. Local community layer if the student is off a mapped road grid
  const localArea = address.neighbourhood || address.hamlet || address.suburb || address.village;

  // 3. Main thoroughfare
  const street = address.road;

  // 4. City and regional descriptors
  const city = address.city || address.municipality || address.town;
  const province = address.state || address.region || address.province;

  // Construct a tight, descriptive structural hierarchy
  const addressParts = [];

  if (poi) addressParts.push(poi);
  
  // Include street name, or fallback to the local neighborhood identifier if street is missing
  if (street) addressParts.push(street);
  else if (localArea) addressParts.push(localArea);

  if (city) addressParts.push(city);

  // Return the compiled micro-address if valid components were collected
  if (addressParts.length > 0) {
    return addressParts.filter(Boolean).join(', ');
  }

  // Final fallback if the data object parsing fails entirely
  return displayName;
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

  // ULTIMATE FALLBACK: Keep your original Nominatim fetch if Overpass is empty or down
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