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
  let landmarkName = "";
  let addressObj = {};

  // 1. Fetch the granular address object from Nominatim
  try {
    const searchParams = new URLSearchParams({
      format: 'jsonv2',
      lat: String(latitude),
      lon: String(longitude),
      zoom: '18',
      addressdetails: '1'
    });
    
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${searchParams.toString()}`);
    if (response.ok) {
      const data = await response.json();
      addressObj = data.address || {};
      
      // Look if Nominatim natively caught an institutional landmark
      landmarkName = addressObj.university || addressObj.college || addressObj.school || addressObj.building || "";
    }
  } catch (e) {
    console.warn("Nominatim fetch failed:", e);
  }

  // 2. Scan Overpass to target structural building landmarks (e.g., "College of Engineering...")
  try {
    const radius = 100; 
    const overpassQuery = `
      [out:json][timeout:10];
      (
        node(around:${radius},${latitude},${longitude})["name"];
        way(around:${radius},${latitude},${longitude})["name"];
      );
      out tags;
    `;

    const overpassResp = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
    
    if (overpassResp.ok) {
      const data = await overpassResp.json();
      if (data.elements && data.elements.length > 0) {
        const elements = data.elements.map(e => e.tags);
        
        // Target structural nodes explicitly containing educational or large building tags
        const highPriorityLandmark = elements.find(el => 
          el.building || 
          el.university || 
          (el.name && el.name.toLowerCase().includes('college')) ||
          (el.name && el.name.toLowerCase().includes('technology'))
        );

        if (highPriorityLandmark && highPriorityLandmark.name) {
          landmarkName = highPriorityLandmark.name.trim();
        }
      }
    }
  } catch (error) {
    console.warn("Overpass validation bypassed, falling back to base metrics...", error);
  }

  // Fallback if no specific campus building node was captured
  if (!landmarkName) {
    landmarkName = "Cavite State University Main Campus";
  }

  // 3. Reconstruct the macro address framework completely clean
  // We DELIBERATELY skip minor noise keys like: address.amenity, address.bank, address.atm, address.courtyard
  const macroFramework = [
    addressObj.road || addressObj.street,
    addressObj.suburb || addressObj.neighbourhood,
    addressObj.village || addressObj.barrio || addressObj.barangay,
    addressObj.town || addressObj.city || addressObj.municipality,
    addressObj.county,
    addressObj.state,
    addressObj.postcode,
    addressObj.country
  ]
  .map(item => item?.trim())
  .filter(Boolean);

  // Deduplicate overlapping structural strings (e.g. handling matching suburb/village tags)
  const uniqueFramework = [];
  macroFramework.forEach(part => {
    const isDuplicate = uniqueFramework.some(existing => 
      existing.toLowerCase().includes(part.toLowerCase()) || 
      part.toLowerCase().includes(existing.toLowerCase())
    );
    if (!isDuplicate) uniqueFramework.push(part);
  });

  // Combine our targeted building landmark with the clean macro layout array
  return [landmarkName, ...uniqueFramework].join(', ');
}