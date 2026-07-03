import { fetchWithRetry } from './helpers';

let currentRequestStateId = null;

// Maps ISO state codes to their district JSON file names in /public/data/
const STATE_FILE_MAP = {
  'IN-KA': 'karnataka',
  'IN-TN': 'tamilnadu',
  'IN-KL': 'kerala',
  'IN-TG': 'telangana',
  'IN-AP': 'andhrapradesh',
  'IN-MH': 'maharashtra',
  'IN-CG': 'chhattisgarh',
  'IN-OD': 'odisha',
  'IN-GJ': 'gujarat',
  'IN-MP': 'madhyapradesh',
  'IN-WB': 'westbengal',
  'IN-PY': 'puducherry',
  'IN-JH': 'jharkhand',
  'IN-RJ': 'rajasthan',
  'IN-GA': 'goa',
  'IN-AN': 'andaman',
  'IN-LD': 'lakshadweep',
  'IN-DN': 'dadra_nagar_haveli',
  'IN-BR': 'bihar',
  'IN-UP': 'uttarpradesh',
  'IN-PB': 'punjab',
  'IN-HR': 'haryana',
  'IN-HP': 'himachalpradesh',
  'IN-UT': 'uttarakhand',
  'IN-AS': 'assam',
  'IN-TR': 'tripura',
  'IN-MN': 'manipur',
  'IN-ML': 'meghalaya',
  'IN-MZ': 'mizoram',
  'IN-NL': 'nagaland',
  'IN-AR': 'arunachalpradesh',
  'IN-SK': 'sikkim',
  'IN-JK': 'jammu_kashmir',
};


/**
 * Fetches district data for a state with safety guards against out-of-order race conditions
 * @param {string} stateId - The state ID (e.g., 'IN-TN')
 * @param {AbortSignal} signal - The abort signal for fetch cancellation
 * @returns {Promise<Array>} The districts data array
 */
export async function fetchStateDistricts(stateId, signal) {
  currentRequestStateId = stateId;

  const fileName = STATE_FILE_MAP[stateId];
  if (!fileName) {
    throw new Error(`No district data file mapped for state: ${stateId}`);
  }

  const url = `/data/${fileName}_districts.json`;
  const res = await fetchWithRetry(url, { signal });
  const data = await res.json();

  // Stale request version guard
  if (currentRequestStateId !== stateId) {
    throw new Error(`Request for state ${stateId} was superseded by a newer request.`);
  }

  return data;
}
