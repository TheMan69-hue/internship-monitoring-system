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
  // 1. Identify the Point of Interest (POI) or specific building/landmark
  const poi = address.amenity || 
              address.building || 
              address.shop || 
              address.tourism || 
              address.historic || 
              address.leisure ||
              address.railway;

  // 2. Identify the closest thoroughfare (Road/Street Number)
  const street = address.road || address.suburb;

  // 3. Keep your existing city/province variables as fallbacks
  const city = address.city || address.municipality || address.town || address.village;
  const province = address.state || address.region || address.province;

  // 4. Build a highly descriptive address hierarchy
  // Prioritize: POI -> Street -> City -> Province
  if (poi) {
    return [poi, street, city].filter(Boolean).join(', ');
  }

  // Fallback: If no distinct POI is found, try building a micro-address
  if (street && city) {
    return [street, city, province].filter(Boolean).join(', ');
  }

  // Ultimate fallback: Use your original layout or the full display name
  return [city, province].filter(Boolean).join(', ') || displayName;
}

export async function reverseGeocodeLocation({ latitude, longitude }) {
  const searchParams = new URLSearchParams({
    format: 'jsonv2',
    lat: String(latitude),
    lon: String(longitude),
    addressdetails: '1' // Ensures detailed address breakdowns are requested
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch location name.')
  }

  const data = await response.json()
  
  // Pass both the address dictionary and full fallback display string
  return getReadableAddress(data.address, data.display_name);
}
