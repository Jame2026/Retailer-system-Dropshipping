export interface NormalizedAddress {
  name: string;
  address1: string;
  address2?: string | null;
  city: string;
  stateCode: string;
  stateName: string;
  zipCode: string;
  country: string;
  countryCode: string;
  phone: string;
  isValid: boolean;
  validationErrors: string[];
}

const US_STATES: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'District of Columbia',
};

const STATE_NAMES_TO_CODE: Record<string, string> = Object.entries(US_STATES).reduce(
  (acc, [code, name]) => {
    acc[name.toLowerCase()] = code;
    return acc;
  },
  {} as Record<string, string>
);

export function normalizeAddress(raw: {
  name?: string;
  address1?: string;
  address2?: string | null;
  city?: string;
  province?: string;
  province_code?: string | null;
  zip?: string;
  country?: string;
  country_code?: string;
  phone?: string | null;
}): NormalizedAddress {
  const errors: string[] = [];

  const name = (raw.name || '').trim();
  if (!name) errors.push('Recipient name is required');

  const address1 = (raw.address1 || '').trim();
  if (!address1) errors.push('Street address line 1 is required');

  const address2 = raw.address2 ? raw.address2.trim() : null;

  const city = (raw.city || '').trim();
  if (!city) errors.push('City is required');

  // Normalize ZIP to 5 digits (e.g., 90210 or 90210-1234 -> 90210)
  const rawZip = (raw.zip || '').trim();
  const zipMatch = rawZip.match(/\b\d{5}\b/);
  const zipCode = zipMatch ? zipMatch[0] : rawZip;
  if (!/^\d{5}$/.test(zipCode)) {
    errors.push(`Invalid US 5-digit ZIP code: ${rawZip}`);
  }

  // Normalize State
  let stateCode = (raw.province_code || '').toUpperCase().trim();
  let stateName = (raw.province || '').trim();

  if (stateCode && US_STATES[stateCode]) {
    stateName = US_STATES[stateCode];
  } else if (stateName && STATE_NAMES_TO_CODE[stateName.toLowerCase()]) {
    stateCode = STATE_NAMES_TO_CODE[stateName.toLowerCase()];
    stateName = US_STATES[stateCode];
  } else {
    errors.push(`Invalid US state/province: ${stateName || stateCode}`);
  }

  // Normalize Phone (remove characters, ensure fallback)
  const cleanPhone = (raw.phone || '').replace(/[^\d+]/g, '');
  const phone = cleanPhone.length >= 10 ? cleanPhone : '+10000000000';

  const countryCode = (raw.country_code || 'US').toUpperCase();
  const country = raw.country || 'United States';

  return {
    name,
    address1,
    address2,
    city,
    stateCode,
    stateName,
    zipCode,
    country,
    countryCode,
    phone,
    isValid: errors.length === 0,
    validationErrors: errors,
  };
}
