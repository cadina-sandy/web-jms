type GeocodingResult = {
  country_code?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  municipality?: string;
  county?: string;
  district?: string;
  suburb?: string;
  rank?: { match_type?: string };
};

function normalize(value: string | undefined) {
  return (value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function normalizeStreet(value: string | undefined) {
  return normalize(value).replace(/^(?:av|avda) /, 'avenida ').replace(/^pje /, 'pasaje ');
}

export async function checkAddress(address: string, commune: string, apiKey: string) {
  // Block, tower and apartment are separate form fields and never enter this request.
  if (address.length > 160 || commune.length > 80 || !commune.trim()) return false;
  const [, street, houseNumber] = /^(.+?)\s+(?:(?:n[°º.]|#)\s*)?(\d{1,7}[a-z]?)$/i.exec(address.trim()) ?? [];
  if (!street || !houseNumber) return false;

  const query = new URLSearchParams({
    street, housenumber: houseNumber, city: commune,
    filter: 'countrycode:cl', format: 'json', limit: '5', apiKey,
  });
  try {
    const response = await fetch(`https://api.geoapify.com/v1/geocode/search?${query}`, {
      cache: 'no-store', signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return null;
    const { results } = await response.json() as { results?: GeocodingResult[] };
    return Array.isArray(results) && results.some(result =>
      result?.rank?.match_type === 'full_match' &&
      result.country_code === 'cl' &&
      normalizeStreet(result.street) === normalizeStreet(street) &&
      normalize(result.housenumber) === normalize(houseNumber) &&
      [result.city, result.municipality, result.county, result.district, result.suburb]
        .some(value => normalize(value) === normalize(commune))
    );
  } catch {
    return null;
  }
}

export async function isAddressFound(address: string, commune: string, apiKey: string) {
  return (await checkAddress(address, commune, apiKey)) === true;
}
