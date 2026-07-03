import { constituencyWardsData } from '../data/mockData.js';
import { newStatesConstituencyData } from '../data/newStatesMockData.js';

// Simple PRNG to generate deterministic random numbers based on a seed string
function getSeededRandom(seedStr) {
  let h = 0xdeadbeef;
  for(let i = 0; i < seedStr.length; i++)
    h = Math.imul(h ^ seedStr.charCodeAt(i), 2654435761);
  let seed = ((h ^ h >>> 16) >>> 0);
  
  return function() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return ((seed < 0 ? ~seed + 1 : seed) % 100000) / 100000;
  }
}

const sample = (arr, randFn = Math.random) => arr[Math.floor(randFn() * arr.length)];

export function getConstituenciesForDistrict(districtId, districtObj) {
  if (typeof window !== 'undefined' && window.__UPLOADED_DATA__ && window.__UPLOADED_DATA__.constituencies && window.__UPLOADED_DATA__.constituencies[districtId]) {
    return window.__UPLOADED_DATA__.constituencies[districtId];
  }

  const rand = getSeededRandom(districtId);

  let list = newStatesConstituencyData[districtId] || constituencyWardsData[districtId];
  if (!list) {
    // Use districtObj directly — works for ALL 5 states (not just Karnataka)
    const dist = districtObj;
    if (!dist) return [];
    const count = dist.constituenciesCount || 5;
    list = Array.from({ length: count }).map((_, i) => ({
      name: `${dist.name} Constituency ${i + 1}`,
      mla: "Pending Election", party: "N/A", wards: Math.floor((dist.wardsCount || 50) / count),
      major: Math.floor((dist.complaintsMajor || 200) / count), minor: Math.floor((dist.complaintsMinor || 100) / count),
      visited: i % 2 === 0
    }));
  }
  
  return list.map(c => {
    const pendingIssues = Math.floor(c.major * 0.7 + c.minor * 0.4);
    const resolvedIssues = (c.major + c.minor) - pendingIssues;
    return {
    ...c,
    sentimentScore: Math.floor(rand() * 40) + 40, // 40-80 score
    pendingIssues,
    resolvedIssues,
    candidatePerformance: sample(["Excellent", "Good", "Average", "Needs Improvement"], rand),
    aiInsights: {
      topIssues: [
        { name: "Water Supply", count: Math.floor(c.major * 0.4) },
        { name: "Road Conditions", count: Math.floor(c.major * 0.3) },
        { name: "Garbage Clearance", count: Math.floor(c.minor * 0.5) }
      ],
      criticalArea: `${c.name} Ward ${Math.floor(rand() * c.wards) + 1}`,
      reason: "Water complaints increased by 42% this month due to pipeline burst.",
      action: "Deploy field team within 48 hours to assess water pipeline damage."
    }
  };
});
}

// List of Tamil Nadu district IDs
const TN_DISTRICTS = [
  'ariyalur','chengalpattu','chennai','coimbatore','cuddalore','dharmapuri','dindigul','erode',
  'kallakurichi','kanchipuram','kanyakumari','karur','krishnagiri','madurai','mayiladuthurai',
  'nagapattinam','namakkal','nilgiris','perambalur','pudukkottai','ramanathapuram','ranipet','salem',
  'sivagangai','tenkasi','tanjavur','theni','thiruvarur','tiruppur','thoothukudi','tiruchirappalli',
  'tirunelveli','tirupattur','tiruvallur','tiruvannamalai','vellore','viluppuram','virudhunagar'
];

// Dynamically collect all TN constituencies to detect them
const tnConstituenciesSet = new Set();
for (const dist of TN_DISTRICTS) {
  const list = newStatesConstituencyData[dist];
  if (list) {
    list.forEach(c => tnConstituenciesSet.add(c.name));
  }
}
const isTN = (constituencyName) => {
  if (!constituencyName) return false;
  const normalized = constituencyName.toLowerCase().replace(/[\s-]/g, '');
  for (const name of tnConstituenciesSet) {
    if (name.toLowerCase().replace(/[\s-]/g, '') === normalized) {
      return true;
    }
  }
  return false;
};

const TN_STREETS = [
  "Anna Nagar", "Kamarajar Salai", "Gandhi Road", "Netaji Nagar", "Periyar Salai",
  "Kalaignar Street", "Bazaar Road", "MGR Nagar", "Bharathi Street", "Temple Road",
  "High School Road", "West Car Street", "East Car Street", "Sannathi Street",
  "North Street", "South Street", "Hospital Road", "Railway Station Road",
  "Pillayar Kovil Street", "VOC Nagar", "Nehru Salai", "Kamaraj Nagar",
  "Vivekanandar Street", "Subramaniam Nagar", "Anna Salai", "Chetty Street",
  "Pudhur Colony", "Agraharam Road", "Amman Kovil Street", "Sastri Nagar"
];

const TN_VILLAGES = [
  "Pudupattinam", "Alangudi", "Nallur", "Melur", "Keezhur", "Perur", "Somanur", 
  "Vadasery", "Kottar", "Vannarpettai", "Palayamkottai", "Tallakulam", "Sellur", 
  "Simmakkal", "Goripalayam", "Aarappalayam", "Pudur", "Pasumalai", "Thirunagar", 
  "Shevapet", "Hasthampatti", "Ammapet", "Suramangalam", "Fairlands", "Gugai", 
  "Meyyanur", "Srirangam", "Woraiyur", "Peelamedu", "RS Puram", "Saibaba Colony", 
  "Singanallur", "Kuniamuthur", "Kovaipudur", "Saravanampatti", "Athipattu",
  "Minjur", "Sholavaram", "Gummidipoondi", "Kavaraipettai", "Elavur", "Arambakkam"
];

const TN_CORPORATORS = [
  "M. K. Kabilan", "S. Ponnusamy", "R. Selvakumar", "A. Meenakshi", "K. Anbazhagan",
  "T. Sathiyamoorthy", "P. Vadivelu", "S. Soundararajan", "G. Palanivel", "K. Saravanan",
  "R. Jayakumar", "M. Karuppasamy", "S. Muthumanickam", "P. Chidambaram", "V. Elangovan",
  "N. Thirumavalavan", "K. Balakrishnan", "R. S. Pandian", "V. Vijayaraghavan", "M. K. Stalin"
];

const TN_INCHARGES = [
  "Karthikeyan", "Muthuvel", "Soundar", "Palanisamy", "Rajesh", "Elangovan",
  "Venkatesan", "Saravanan", "Ganesan", "Marimuthu", "Selvam", "Senthil",
  "Murugan", "Kandasamy", "Chinnasamy", "Arumugam", "Duraisamy", "Ponnusamy"
];

const TN_BOOTH_TYPES = [
  "Panchayat Union Primary School",
  "Government Higher Secondary School",
  "Municipal Middle School",
  "Government Primary School",
  "Panchayat Union Elementary School",
  "Government Girls Higher Secondary School",
  "Anganwadi Centre",
  "Community Hall"
];

export function generateWards(constituency) {
  if (typeof window !== 'undefined' && window.__UPLOADED_DATA__ && window.__UPLOADED_DATA__.wards && window.__UPLOADED_DATA__.wards[constituency.name]) {
    return window.__UPLOADED_DATA__.wards[constituency.name];
  }

  const rand = getSeededRandom(constituency.name);
  const isTamilNadu = isTN(constituency.name);
  
  // Tamil Nadu has about 15 wards per constituency for realistic presentation size
  const count = isTamilNadu ? 15 : (constituency.wards || 10);
  
  // Distribute the exact major and minor issues across wards
  let remainingMajor = constituency.major;
  let remainingMinor = constituency.minor;
  
  let startBoothNum = 1;

  const wards = Array.from({ length: count }).map((_, i) => {
    const baseMajor = Math.floor(constituency.major / count);
    const baseMinor = Math.floor(constituency.minor / count);
    
    remainingMajor -= baseMajor;
    remainingMinor -= baseMinor;
    
    let wardName = `${constituency.name} Ward ${i + 1}`;
    let corporator = `Corporator ${String.fromCharCode(65+i)}${i}`;
    
    if (isTamilNadu) {
      const place = i % 2 === 0 ? TN_STREETS[i % TN_STREETS.length] : TN_VILLAGES[i % TN_VILLAGES.length];
      wardName = `${place} (Ward ${i + 1})`;
      corporator = TN_CORPORATORS[i % TN_CORPORATORS.length];
    }
    
    // In TN, average 16-20 booths per ward to sum up to ~250-300 booths per constituency.
    const boothsCount = isTamilNadu ? (Math.floor(rand() * 5) + 16) : (Math.floor(rand() * 5) + 5);
    const wardStartBooth = startBoothNum;
    startBoothNum += boothsCount;
    
    return {
      id: `${constituency.name.replace(/\s+/g, '-')}-ward-${i+1}`, 
      name: wardName,
      corporator: corporator,
      booths: boothsCount,
      startBoothNum: wardStartBooth,
      major: baseMajor,
      minor: baseMinor,
      visited: i < Math.floor(count * 0.6)
    };
  });
  
  // Randomly distribute remaining major issues
  while (remainingMajor > 0) {
    const idx = Math.floor(rand() * count);
    wards[idx].major += 1;
    remainingMajor -= 1;
  }
  
  // Randomly distribute remaining minor issues
  while (remainingMinor > 0) {
    const idx = Math.floor(rand() * count);
    wards[idx].minor += 1;
    remainingMinor -= 1;
  }
  
  // Compute totalIssues and topIssues for each ward
  const CATEGORIES = ["Water Issues", "Road Issues", "Electricity Issues", "Sanitation Issues", "Healthcare Issues", "Public Safety Issues"];

  wards.forEach(w => {
    let total = w.major + w.minor;
    if (isTamilNadu) {
      total = Math.floor(rand() * 501) + 2000; // 2000 to 2500 issues per ward
    }
    let issues = [];
    let shuffled = [...CATEGORIES].sort(() => 0.5 - rand());
    let remaining = total;
    let numIssues = Math.min(total, Math.floor(rand() * 4) + 3);
    
    for (let i = 0; i < numIssues; i++) {
        let count;
        if (i === numIssues - 1) {
            count = remaining;
        } else {
            count = Math.floor(rand() * (remaining / 1.5)) + 1;
            remaining -= count;
        }
        if (count > 0) {
            issues.push({ type: shuffled[i], count });
        }
    }
    
    w.topIssues = issues.sort((a, b) => b.count - a.count);
    if (w.topIssues.length > 0) {
        let maxCount = w.topIssues[0].count;
        w.topIssues.forEach(i => {
            i.severity = i.count === maxCount ? 'major' : 'minor';
        });
    }
    
    w.major = w.topIssues.filter(i => i.severity === 'major').reduce((acc, i) => acc + i.count, 0);
    w.minor = w.topIssues.filter(i => i.severity === 'minor').reduce((acc, i) => acc + i.count, 0);
    w.totalIssues = w.major + w.minor;
  });
  
  return wards.sort((a, b) => b.totalIssues - a.totalIssues);
}

export function generateBooths(ward) {
  if (typeof window !== 'undefined' && window.__UPLOADED_DATA__ && window.__UPLOADED_DATA__.booths && window.__UPLOADED_DATA__.booths[ward.id]) {
    return window.__UPLOADED_DATA__.booths[ward.id];
  }

  const rand = getSeededRandom(ward.id);
  let remaining = ward.totalIssues;

  const constName = ward.id.split('-ward-')[0].replace(/-/g, ' ');
  const isTamilNadu = isTN(constName);
  const areaName = ward.name.includes(' (Ward ') ? ward.name.split(' (Ward ')[0] : ward.name;
  
  const startNum = ward.startBoothNum || 101;

  return Array.from({ length: ward.booths }).map((_, i) => {
    let issues = 0;
    if (isTamilNadu) {
      issues = Math.floor(rand() * 41) + 120; // 120 to 160 issues per booth for realistic demonstration
    } else {
      if (i === ward.booths - 1) {
        issues = remaining;
      } else {
        issues = Math.floor(rand() * (remaining / 1.5));
        remaining -= issues;
      }
    }
    
    let boothName = `Booth ${startNum + i}`;
    let incharge = `President ${sample(["Ramesh", "Suresh", "Lakshmi", "Priya", "Kumar", "Gowda"], rand)}`;
    
    if (isTamilNadu) {
      const type = TN_BOOTH_TYPES[i % TN_BOOTH_TYPES.length];
      boothName = `Booth ${startNum + i} - ${type}, ${areaName} (Room ${(i % 2) + 1})`;
      incharge = `${sample(TN_INCHARGES, rand)} (Booth Agent)`;
    }

    return {
      id: `${ward.id}-booth-${i+1}`, 
      name: boothName,
      incharge: incharge,
      voters: isTamilNadu ? (Math.floor(rand() * 2000) + 3000) : (Math.floor(rand() * 500) + 800),
      areas: isTamilNadu ? (Math.floor(rand() * 4) + 5) : (Math.floor(rand() * 3) + 2),
      issues,
      topIssues: ward.topIssues
    };
  }).sort((a, b) => b.issues - a.issues);
}

export function generateAreas(booth) {
  if (typeof window !== 'undefined' && window.__UPLOADED_DATA__ && window.__UPLOADED_DATA__.areas && window.__UPLOADED_DATA__.areas[booth.id]) {
    return window.__UPLOADED_DATA__.areas[booth.id];
  }

  const rand = getSeededRandom(booth.id);
  let remaining = booth.issues;
  const areaTypes = ["Layout", "Nagar", "Block", "Cross", "Colony", "Extension"];
  const leaderTitles = ["Dr.", "Prof.", "Mr.", "Mrs.", "Sri"];
  const leaderSurnames = ["Rao", "Reddy", "Patil", "Shetty", "Gowda", "Naik", "Kumar"];
  const youthNames = ["Ravi", "Anitha", "Kiran", "Meena", "Suresh", "Pooja", "Arun"];
  const roles = ["Local Leader", "Ward Volunteer Head", "RWA President", "Community Coordinator"];
  const youthRoles = ["Youth President", "Youth Wing Leader", "Junior Coordinator", "Social Media Head"];

  const constName = booth.id.split('-ward-')[0].replace(/-/g, ' ');
  const isTamilNadu = isTN(constName);
  return Array.from({ length: booth.areas }).map((_, i) => {
    let issues = 0;
    if (i === booth.areas - 1) {
      issues = remaining;
    } else {
      issues = Math.floor(rand() * (remaining / 1.5));
      remaining -= issues;
    }

    if (isTamilNadu) {
      issues = Math.max(issues, Math.floor(rand() * 6) + 15); // minimum 15 to 20 issues per area
    }
    
    let areaName = `Sector ${i+1} ${sample(areaTypes, rand)}`;
    let leaderName = `${sample(leaderTitles, rand)} ${sample(leaderSurnames, rand)}`;
    let youthName = sample(youthNames, rand);
    
    if (isTamilNadu) {
      const tnSurnames = ["Pillai", "Mudaliar", "Gounder", "Thevar", "Naicker", "Nadar", "Chettiar", "Selvam", "Raj"];
      const tnLeaderTitles = ["Thiru", "Dr.", "Er.", "Mr.", "Mrs."];
      const tnYouthNames = ["Karthik", "Vignesh", "Vijay", "Surya", "Anbarasan", "Deepak", "Praveen", "Priya", "Nandhini"];
      const street = sample(TN_STREETS, rand);
      areaName = `${street} (Sec ${i+1})`;
      leaderName = `${sample(tnLeaderTitles, rand)} ${sample(["Ramanathan", "Subramanian", "Palanivel", "Shanmugam", "Velayutham"], rand)} ${sample(tnSurnames, rand)}`;
      youthName = sample(tnYouthNames, rand);
    }

    return {
      id: `${booth.id}-area-${i+1}`,
      name: areaName,
      population: isTamilNadu ? (Math.floor(rand() * 6000) + 6000) : (Math.floor(rand() * 2000) + 500),
      activeVolunteers: Math.floor(rand() * 10) + 2,
      influencers: [
        {
          name: leaderName,
          role: sample(roles, rand),
          phone: `+91 9${Math.floor(rand() * 800000000 + 100000000)}`,
          influence: "High",
          support: sample(["Supportive", "Neutral", "Needs Convincing"], rand)
        },
        {
          name: youthName,
          role: sample(youthRoles, rand),
          phone: `+91 9${Math.floor(rand() * 800000000 + 100000000)}`,
          influence: "Medium",
          support: sample(["Supportive", "Neutral", "Enthusiastic"], rand)
        }
      ],
      issues,
      topIssues: booth.topIssues,
      topDiscussed: (booth.topIssues && booth.topIssues.length > 0) ? sample(booth.topIssues, rand).type : "General Issue"
    };
  }).sort((a, b) => b.issues - a.issues);
}

export function generateCitizens(area) {
  if (typeof window !== 'undefined' && window.__UPLOADED_DATA__ && window.__UPLOADED_DATA__.citizens && window.__UPLOADED_DATA__.citizens[area.id]) {
    return window.__UPLOADED_DATA__.citizens[area.id];
  }

  const rand = getSeededRandom(area.id);
  let firstNames = ["Ravi", "Arun", "Kavya", "Sneha", "Mohan", "Pooja", "Vikram", "Anjali"];
  let lastNames = ["Kumar", "Sharma", "Gowda", "Patil", "Desai", "Rao"];

  const constName = area.id.split('-ward-')[0].replace(/-/g, ' ');
  const isTamilNadu = isTN(constName);

  if (isTamilNadu) {
    firstNames = [
      "Kabilan", "Ponnusamy", "Selvakumar", "Anbazhagan", "Sathiyamoorthy", "Vadivelu", 
      "Soundararajan", "Palanivel", "Saravanan", "Jayakumar", "Karuppasamy", "Muthumanickam", 
      "Chidambaram", "Elangovan", "Thirumavalavan", "Balakrishnan", "Vijayaraghavan", "Muthuvel", 
      "Karthikeyan", "Soundar", "Rajesh", "Venkatesan", "Ganesan", "Marimuthu", "Selvam", 
      "Senthil", "Murugan", "Kandasamy", "Chinnasamy", "Arumugam", "Duraisamy", "Ramanathan", 
      "Subramanian", "Shanmugam", "Velayutham", "Meenakshi", "Soundarya", "Priya", "Kavitha", 
      "Anitha", "Nandhini", "Abirami", "Deepika", "Bhavani", "Gayathri", "Geetha", "Kokila", 
      "Revathi", "Radha", "Malathi", "Chitra", "Lakshmi", "Usha", "Sangeetha", "Uma", "Janaki"
    ];
    lastNames = [
      "M.", "S.", "R.", "A.", "K.", "T.", "P.", "G.", "V.", "N.", "D.", "C.", "J.",
      "Pillai", "Nadar", "Chettiar", "Gounder", "Thevar", "Mudaliar", "Naicker", "Rao", 
      "Reddy", "Raj", "Pandian", "Prabhu", "Babu", "Doss", "Lingam"
    ];
  }

  if (area.issues === 0 && !isTamilNadu) return [];
  
  let numIssues = area.issues;
  if (isTamilNadu) {
    numIssues = Math.max(numIssues * 3, Math.floor(rand() * 101) + 150); // minimum 150 to 250 complaints
  }
  
  let numCitizens = isTamilNadu ? Math.min(numIssues, 50) : Math.min(numIssues, 15);
  let remaining = numIssues;
  
  return Array.from({ length: numCitizens }).map((_, i) => {
    let count = 0;
    if (i === numCitizens - 1) {
       count = remaining;
    } else {
       count = Math.max(1, Math.floor(remaining / (numCitizens - i)));
       remaining -= count;
    }
    return {
      id: `${area.id}-cit-${i+1}`, 
      name: `${sample(firstNames, rand)} ${sample(lastNames, rand)}`,
      phone: `+91 9${Math.floor(rand() * 800000000 + 100000000)}`,
      problemsCount: count,
      topIssues: area.topIssues,
      followUpHistory: rand() > 0.5 ? "Called 2 days ago" : "No recent follow-up",
      sentiment: sample(["Angry", "Frustrated", "Neutral", "Hopeful"], rand)
    };
  }).sort((a, b) => b.problemsCount - a.problemsCount);
}

export function generateProblems(citizen) {
  const rand = getSeededRandom(citizen.id);
  const descMap = {
    "Water": ["No drinking water for the past 3 days.", "Pipe leak causing water wastage.", "Contaminated water supply."],
    "Roads": ["Huge pothole causing accidents near main junction.", "Road not paved for 5 years.", "Street flooded due to bad roads."],
    "Electricity": ["Street is pitch dark, lights haven't worked for weeks.", "Frequent power cuts during day.", "Transformer sparks frequently."],
    "Sanitation": ["Waste collection truck hasn't visited this week.", "Garbage dumped near school.", "Public toilet unhygienic."],
    "Healthcare": ["Local clinic has no doctor available.", "Medicines out of stock at PHC.", "Ambulance took 2 hours to arrive."],
    "Education": ["Government school roof leaking.", "Shortage of teachers in primary school.", "Midday meal quality is poor."],
    "Agriculture": ["Crop insurance not received.", "Fertilizer shortage at cooperative.", "Irrigation canal blocked."],
    "Housing": ["PMAY funds delayed.", "Slum rehabilitation housing in bad condition."],
    "Employment": ["NREGA wages pending for 2 months.", "No local job opportunities for youth."],
    "Public Safety": ["No police patrol at night.", "Chain snatching incidents increasing."],
    "Welfare": ["Old age pension stopped.", "Ration card application pending for 6 months."],
    "Government Services": ["Long queues at Nadakacheri.", "Bribery demanded for certificates."]
  };

  return Array.from({ length: citizen.problemsCount }).map((_, i) => {
    let type = "General Issues";
    if (citizen.topIssues && citizen.topIssues.length > 0) {
      type = sample(citizen.topIssues, rand).type;
    } else {
      type = sample(Object.keys(descMap), rand) + " Issues";
    }
    const baseType = type.replace(" Issues", "");
    const descriptions = descMap[baseType] || descMap[baseType + "s"] || ["Issue reported by citizen."];
    const desc = sample(descriptions, rand);

    return {
      id: `PRB-${Math.floor(rand()*10000)}`,
      type: type,
      description: desc,
      priority: rand() > 0.6 ? 'High' : (rand() > 0.5 ? 'Medium' : 'Low'),
      status: sample(["Pending", "In Progress", "Resolved"], rand),
      raisedBy: sample(["Candidate A", "Candidate B", "Self", "Volunteer"], rand),
      assignedTo: sample(["Field Team B", "Ward Engineer", "Contractor", "Unassigned"], rand),
      date: `2026-06-${Math.floor(rand() * 18 + 1).toString().padStart(2, '0')}`
    };
  });
}
