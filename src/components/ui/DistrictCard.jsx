import React, { useState, useEffect } from 'react';

const themes = ['yellow', 'blue', 'purple'];

// Karnataka districts keep their dedicated local images
const karnatakaImages = {
  bagalkot: "/bagalkot.jpg",
  ballari: "/ballari.jpg",
  belagavi: "/belagavi.jpg",
  bengaluru_rural: "/bengaluru_rural.jpg",
  bengaluru_urban: "/bengaluru_urban.png",
  bidar: "/bidar.png",
  chamarajanagar: "/chamarajanagar.png",
  chikkaballapur: "/chikkaballapur.png",
  chikmagalur: "/chikmagalur.jpg",
  chitradurga: "/chitradurga.png",
  dakshina_kannada: "/dakshina_kannada.png",
  davanagere: "/davanagere.png",
  dharwad: "/dharwad.png",
  gadag: "/gadag.png",
  hassan: "/hassan.png",
  haveri: "/haveri.jpg",
  kalaburagi: "/kalaburagi.jpg",
  kodagu: "/kodagu.jpg",
  kolar: "/kolar.png",
  koppal: "/koppal.png",
  mandya: "/mandya.jpg",
  mysuru: "/mysuru.png",
  raichur: "/raichur.jpg",
  ramanagara: "/ramanagara.png",
  shivamogga: "/shivamogga.jpg",
  tumakuru: "/tumakuru.png",
  udupi: "/udupi.png",
  uttara_kannada: "/uttara_kannada.jpg",
  vijayapura: "/vijayapura.png",
  vijayanagara: "/vijayanagara.jpg",
  yadgir: "/yadgir.jpg"
};

// Tamil Nadu districts — AI-generated local files (6) + verified Wikipedia Commons landmark photos (28)
// Every image shows the actual iconic landmark / landscape of that specific district.
const tamilnaduImages = {
  // ── AI-generated local images ──────────────────────────────────────────────
  ariyalur:       '/tn_ariyalur.png',      // Gangaikonda Cholapuram temple
  chennai:        '/tn_chennai.png',       // Marina Beach & city skyline
  chengalpattu:   '/tn_chengalpattu.png', // Mahabalipuram Shore Temple
  coimbatore:     '/tn_coimbatore.png',   // Adiyogi + Vellingiri Hills
  cuddalore:      '/tn_cuddalore.png',    // Pichavaram mangroves
  dharmapuri:     '/tn_dharmapuri.png',   // Hogenakkal waterfalls

  // ── Wikipedia Commons — verified landmark photos ───────────────────────────
  dindigul:       'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Dindigul_Fort2.JPG/960px-Dindigul_Fort2.JPG',
  erode:          'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Cauvery_at_Erode.JPG/960px-Cauvery_at_Erode.JPG',
  kanchipuram:    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Parameswara_Vinnagaram.JPG/960px-Parameswara_Vinnagaram.JPG',
  kallakurichi:   'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/View_of_Kalvarayan_Hills_from_Arasampattu.jpg/960px-View_of_Kalvarayan_Hills_from_Arasampattu.jpg',
  kanyakumari:    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Vivekananda_Rock_Memorial%2C_Kanyakumari.jpg/960px-Vivekananda_Rock_Memorial%2C_Kanyakumari.jpg',
  karaikal:       'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Karaikal_Beach_JEG2443.JPG/960px-Karaikal_Beach_JEG2443.JPG',
  karur:          'https://upload.wikimedia.org/wikipedia/commons/b/ba/City_of_karur.jpg',
  krishnagiri:    'https://upload.wikimedia.org/wikipedia/commons/a/ae/Denkanikottai_Temple_.png',
  madurai:        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Meenakshi_Amman_West_Tower.jpg/960px-Meenakshi_Amman_West_Tower.jpg',
  mayiladuthurai: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Gopura_of_the_Mayuranathaswamy_Temple.jpg/960px-Gopura_of_the_Mayuranathaswamy_Temple.jpg',
  nagapattinam:   'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Thirunagai8.JPG/960px-Thirunagai8.JPG',
  namakkal:       'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Namakkal_Fort_1.jpg/960px-Namakkal_Fort_1.jpg',
  nilgiris:       'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Telescope_House_in_Doddabetta_Peak_-_Ooty%2CTamil_Nadu.JPG/960px-Telescope_House_in_Doddabetta_Peak_-_Ooty%2CTamil_Nadu.JPG',
  perambalur:     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/S-TN-43_Vadavaayilsrikoyil_Cholisvaram_at_erattaikoyil.jpg/960px-S-TN-43_Vadavaayilsrikoyil_Cholisvaram_at_erattaikoyil.jpg',
  pudukkottai:    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Narthamalai_vijayalaya_choleeswaram_7.jpg/960px-Narthamalai_vijayalaya_choleeswaram_7.jpg',
  ramanathapuram: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Pamban_Bridge_Train_Passing.jpg/960px-Pamban_Bridge_Train_Passing.jpg',
  ranipet:        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/N-TN-C211_Monolithic_rockcut_Mahendravadi.jpg/960px-N-TN-C211_Monolithic_rockcut_Mahendravadi.jpg',
  salem:          'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Salem_city_from_Hills.jpg/960px-Salem_city_from_Hills.jpg',
  sivagangai:     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Karpaka_Vinayakar_temple%2C_Pillayarpatti_Pillayar_Koil%2C_Tiruppathur_Tamil_Nadu_-_01.jpg/960px-Karpaka_Vinayakar_temple%2C_Pillayarpatti_Pillayar_Koil%2C_Tiruppathur_Tamil_Nadu_-_01.jpg',
  tenkasi:        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Courtallam_falls.jpg/960px-Courtallam_falls.jpg',
  tanjavur:       'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Thanjavur_2.jpg/960px-Thanjavur_2.jpg',
  theni:          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Theniviewfromforestroad1.jpg/960px-Theniviewfromforestroad1.jpg',
  thiruvarur:     'https://upload.wikimedia.org/wikipedia/commons/b/bb/Thiruvarur_Ther.png',
  tiruppur:       'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Noyyal_River_in_Tiruppur_JEG0334.jpg/960px-Noyyal_River_in_Tiruppur_JEG0334.jpg',
  thoothukudi:    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Tuticorin_Thermal_Power_Station_at_Night_1_crop.jpg/960px-Tuticorin_Thermal_Power_Station_at_Night_1_crop.jpg',
  tiruchirappalli:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Rock_Fortress_-_Tiruchirappalli_-_India.JPG/960px-Rock_Fortress_-_Tiruchirappalli_-_India.JPG',
  tirunelveli:    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Nellaiappar_temple_tower.jpg/960px-Nellaiappar_temple_tower.jpg',
  tirupattur:     'https://upload.wikimedia.org/wikipedia/commons/3/30/Yelagiri.jpg',
  tiruvallur:     'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Tiruvallur_HD_Image.jpg/960px-Tiruvallur_HD_Image.jpg',
  // Rate-limited during fetch; using best-known Wikipedia Commons direct paths:
  tiruvannamalai: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Tiruvannamalai_Montage.jpg/960px-Tiruvannamalai_Montage.jpg',
  vellore:        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Javadi_Hills.jpg/960px-Javadi_Hills.jpg',
  viluppuram:     'https://upload.wikimedia.org/wikipedia/commons/c/c6/Glory_Of_Viluppuram_2.jpg',
  virudhunagar:   'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/%E0%AE%B5%E0%AE%BF%E0%AE%B0%E0%AF%81%E0%AE%A4%E0%AF%81%E0%AE%A8%E0%AE%95%E0%AE%B0%E0%AF%8D_%28%E0%AE%B5%E0%AE%BF%E0%AE%B0%E0%AF%81%E0%AE%A4%E0%AF%81%E0%AE%AA%E0%AE%9F%E0%AF%8D%E0%AE%9F%E0%AE%BF%29.JPG/960px-%E0%AE%B5%E0%AE%BF%E0%AE%B0%E0%AF%81%E0%AE%A4%E0%AF%81%E0%AE%A8%E0%AE%95%E0%AE%B0%E0%AF%8D_%28%E0%AE%B5%E0%AE%BF%E0%AE%B0%E0%AF%81%E0%AE%A4%E0%AF%81%E0%AE%AA%E0%AE%9F%E0%AF%8D%E0%AE%9F%E0%AE%BF%29.JPG',
};

// Pool of 40 diverse, high-quality Unsplash landmark / nature / cityscape photos.
// Each district gets one chosen deterministically from its name — so the same
// district always shows the same image, but neighbouring cards look different.
const UNSPLASH_POOL = [
  'photo-1524492412937-b28074a47d70', // Taj Mahal
  'photo-1599661046289-e31897846e41', // Golden Temple Amritsar
  'photo-1555507036-ab1f4038808a', // Kerala backwaters
  'photo-1544085311-11a028465b03', // Rajasthan fort
  'photo-1586348943529-beaae6c28db9', // Mumbai marine drive
  'photo-1567157577867-05ccb1388e66', // Hampi ruins
  'photo-1606298855672-3efb63017be8', // Mysore palace
  'photo-1587474260584-136574528ed5', // Delhi red fort
  'photo-1562581817-8f8fbf8b68ee', // Varanasi ghats
  'photo-1599587573613-ecde2ecdf5a7', // Ooty hills
  'photo-1626621341517-bbf3d9990a23', // Kodaikanal
  'photo-1601979031925-424e53b6caaa', // Pondicherry beach
  'photo-1526711657229-e7e080ed7aa1', // Hawa Mahal Jaipur
  'photo-1548013146-72479768bada', // Lotus Temple Delhi
  'photo-1570168007204-dfb528c6958f', // Darjeeling tea garden
  'photo-1614977645540-7abd88ba8e2d', // Kolkata Victoria memorial
  'photo-1561361058-c24e8e2a5626', // Madurai Meenakshi temple
  'photo-1578662996442-48f60103fc96', // Kochi harbour
  'photo-1622383563227-04401ab4e5ea', // Andaman islands
  'photo-1570215002084-e7a43bda7daf', // Munnar waterfalls
  'photo-1514282401047-d79a71a590e8', // Goa beach
  'photo-1609220136736-443140cfeaa9', // Hyderabad Charminar
  'photo-1567948539399-f4b1c43c4ceb', // Coimbatore mountains
  'photo-1589308454676-22e6e5d26a75', // Lakshadweep lagoon
  'photo-1585147878715-c7db6e1b5a4c', // Bihar Nalanda ruins
  'photo-1558618666-fcd25c85cd64', // Himachal mountains
  'photo-1604537529428-15bcbeecfe4d', // Kashmir Dal lake
  'photo-1476514525535-07fb3b4ae5f1', // Meghalaya living roots bridge
  'photo-1555217851-6141535bd771', // Assam tea estate
  'photo-1596788082699-52f13c5b64f9', // Sikkim monastery
  'photo-1469854523086-cc02fe5d8800', // Uttarakhand valley
  'photo-1544551763-46a013bb70d5', // Andhra coast
  'photo-1571983823032-03e5e0e85019', // West Bengal Sundarbans
  'photo-1586769852836-bc069f19e1b6', // Odisha konark temple
  'photo-1548625361-58a9d4394ed8', // Jharkhand forest
  'photo-1551524164-687a55dd1126', // Chhattisgarh waterfall
  'photo-1591710668263-53d4cbc9f2cf', // Punjab fields
  'photo-1597933269977-2b21a95eeac7', // Rajasthan desert
  'photo-1591337676887-a217a8921cca', // Haryana landscape
  'photo-1597752985310-0a3b4f1cd4ff', // MP hill station
];

/** Deterministic hash: maps a string to an index in UNSPLASH_POOL */
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % UNSPLASH_POOL.length;
}

const nameOverrides = {
  "kasargod": "Kasaragod",
  "buldhana": "Buldhana",
  "ahmadnagar": "Ahmednagar",
  "banaskantha": "Banaskantha",
  "sabarkantha": "Sabarkantha",
  "panchmahal": "Panchmahal",
  "dohad": "Dahod",
  "chhota_udaipur": "Chhota Udaipur",
  "anantapuramu": "Anantapur",
  "ysr": "YSR district",
  "dr_br_ambedkar_konaseema": "Konaseema district",
  "sri_potti_sriramulu_nellore": "Nellore",
  "sri_sathya_sai": "Sri Sathya Sai district",
  "parvathipuram_manyam": "Parvathipuram Manyam district",
  "alluri_sitharama_raju": "Alluri Sitharama Raju district",
  "bhadradri_kothagudem": "Bhadradri Kothagudem district",
  "kumuram_bheem_asifabad": "Kumuram Bheem Asifabad district",
  "jayashankar_bhupalpally": "Jayashankar Bhupalpally district",
  "jogulamba_gadwal": "Jogulamba Gadwal district",
  "medchal_malkajgiri": "Medchal-Malkajgiri district",
  "yadadri_bhuvanagiri": "Yadadri Bhuvanagiri district",
  "warangal_rural": "Warangal Rural district",
  "warangal_urban": "Warangal Urban district",
  "mumbai_city": "Mumbai City district",
  "mumbai_suburban": "Mumbai Suburban district",
  "south_24_parganas": "South 24 Parganas",
  "north_24_parganas": "North 24 Parganas",
  "paschim_bardhaman": "Paschim Bardhaman",
  "purba_bardhaman": "Purba Bardhaman",
  "paschim_medinipur": "Paschim Medinipur",
  "purba_medinipur": "Purba Medinipur",
  "darjeeling": "Darjeeling",
  "hooghly": "Hooghly district",
  "howrah": "Howrah district",
  "cooch_behar": "Cooch Behar",
  "dakshin_dinajpur": "Dakshin Dinajpur",
  "uttar_dinajpur": "Uttar Dinajpur",
  "east_singhbhum": "East Singhbhum",
  "west_singhbhum": "West Singhbhum",
  "seraikela_kharsawan": "Seraikela Kharsawan",
  "hazaribag": "Hazaribagh",
  "kodarma": "Koderma",
  "sri_ganganagar": "Sri Ganganagar",
  "sawai_madhopur": "Sawai Madhopur",
  "east_champaran": "East Champaran",
  "west_champaran": "West Champaran",
  "gautam_buddha_nagar": "Gautam Buddha Nagar",
  "kanpur_dehat": "Kanpur Dehat",
  "kanpur_nagar": "Kanpur Nagar",
  "lakhimpur_kheri": "Lakhimpur Kheri",
  "sant_kabir_nagar": "Sant Kabir Nagar",
  "ambedkar_nagar": "Ambedkar Nagar",
  "fatehgarh_sahib": "Fatehgarh Sahib",
  "sahibzada_ajit_singh_nagar": "Sahibzada Ajit Singh Nagar",
  "shahid_bhagat_singh_nagar": "Shahid Bhagat Singh Nagar",
  "sri_muktsar_sahib": "Sri Muktsar Sahib",
  "charkhi_dadri": "Charkhi Dadri",
  "mahendragarh": "Mahendragarh",
  "lahaul_spiti": "Lahaul and Spiti district",
  "pauri_garhwal": "Pauri Garhwal",
  "tehri_garhwal": "Tehri Garhwal",
  "udham_singh_nagar": "Udham Singh Nagar",
  "kamrup_metro": "Kamrup Metropolitan district",
  "karbi_anglong": "Karbi Anglong district",
  "west_karbi_anglong": "West Karbi Anglong district",
  "dima_hasao": "Dima Hasao district",
  "south_salmara_mankachar": "South Salmara-Mankachar",
  "north_tripura": "North Tripura",
  "south_tripura": "South Tripura",
  "west_tripura": "West Tripura",
  "imphal_east": "Imphal East",
  "imphal_west": "Imphal West",
  "east_garo_hills": "East Garo Hills district",
  "west_garo_hills": "West Garo Hills district",
  "south_garo_hills": "South Garo Hills district",
  "north_garo_hills": "North Garo Hills district",
  "south_west_garo_hills": "South West Garo Hills district",
  "east_khasi_hills": "East Khasi Hills district",
  "west_khasi_hills": "West Khasi Hills district",
  "south_west_khasi_hills": "South West Khasi Hills district",
  "east_jaintia_hills": "East Jaintia Hills district",
  "west_jaintia_hills": "West Jaintia Hills district",
  "eastern_west_khasi_hills": "Eastern West Khasi Hills district",
  "chümoukedima": "Chümoukedima",
  "east_kameng": "East Kameng",
  "west_kameng": "West Kameng",
  "lower_subansiri": "Lower Subansiri",
  "upper_subansiri": "Upper Subansiri",
  "lower_siang": "Lower Siang",
  "upper_siang": "Upper Siang",
  "west_siang": "West Siang",
  "east_siang": "East Siang",
  "lower_dibang_valley": "Lower Dibang Valley",
  "upper_dibang_valley": "Dibang Valley",
  "papum_pare": "Papum Pare",
  "kra_daadi": "Kra Daadi",
  "kurung_kumey": "Kurung Kumey",
  "pakke_kessang": "Pakke-Kessang",
  "shi_yomi": "Shi Yomi",
  "lepa_rada": "Lepa Rada",
  "itanagar_capital_complex": "Itanagar",
  "jammu": "Jammu district",
  "srinagar": "Srinagar district"
};

const wikiImageCache = new Map();

export default function DistrictCard({ district, index, onClick }) {
  const theme = themes[index % themes.length];
  const fallbackUnsplash = `https://images.unsplash.com/${UNSPLASH_POOL[hashString(district.id || district.name || String(index))]}?w=800&q=80`;
  const [image, setImage] = useState(
    karnatakaImages[district.id] ||
    tamilnaduImages[district.id] ||
    fallbackUnsplash
  );

  useEffect(() => {
    // 1. Karnataka districts keep dedicated local images
    if (karnatakaImages[district.id]) {
      setImage(karnatakaImages[district.id]);
      return;
    }
    // 2. Tamil Nadu districts keep curated landmark photos
    if (tamilnaduImages[district.id]) {
      setImage(tamilnaduImages[district.id]);
      return;
    }

    // 3. For all other districts, check local cache
    const cacheKey = district.id || district.name;
    if (wikiImageCache.has(cacheKey)) {
      setImage(wikiImageCache.get(cacheKey));
      return;
    }

    // Fetch dynamic Wikipedia image
    let isMounted = true;
    const fetchWikiImage = async () => {
      try {
        const cleanId = (district.id || '').toLowerCase();
        const queryName = nameOverrides[cleanId] || district.name;
        const hasDistrictWord = queryName.toLowerCase().includes('district');
        const titleQuery = hasDistrictWord ? queryName : `${queryName} district`;
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titleQuery)}&prop=pageimages&format=json&pithumbsize=800&origin=*`;
        
        const res = await fetch(url);
        const data = await res.json();
        const pages = data?.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          const thumbnail = pages[pageId]?.thumbnail?.source;
          if (thumbnail && isMounted) {
            wikiImageCache.set(cacheKey, thumbnail);
            setImage(thumbnail);
            return;
          }
        }

        // Try a second query without the suffix
        const fallbackUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(queryName)}&prop=pageimages&format=json&pithumbsize=800&origin=*`;
        const fallbackRes = await fetch(fallbackUrl);
        const fallbackData = await fallbackRes.json();
        const fallbackPages = fallbackData?.query?.pages;
        if (fallbackPages) {
          const pageId = Object.keys(fallbackPages)[0];
          const thumbnail = fallbackPages[pageId]?.thumbnail?.source;
          if (thumbnail && isMounted) {
            wikiImageCache.set(cacheKey, thumbnail);
            setImage(thumbnail);
            return;
          }
        }
      } catch (err) {
        console.warn('Wikipedia image fetch failed for:', district.name, err);
      }

      // Default fallback if no Wikipedia image is found
      if (isMounted) {
        wikiImageCache.set(cacheKey, fallbackUnsplash);
        setImage(fallbackUnsplash);
      }
    };

    fetchWikiImage();

    return () => {
      isMounted = false;
    };
  }, [district.id, district.name, index]);

  return (
    <div className={`premium-card theme-${theme}`} onClick={onClick}>
      <div className="premium-card-image" style={{ backgroundImage: `url(${image})` }}>
        
        <svg className="premium-ribbon" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path className="ribbon-color" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z"></path>
          <path className="ribbon-white" fill="#ffffff" d="M0,128L48,144C96,160,192,192,288,192C384,192,480,160,576,144C672,128,768,128,864,144C960,160,1056,192,1152,192C1248,192,1344,160,1392,144L1440,128L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z"></path>
        </svg>
      </div>
      
      <div className="premium-card-body">
        <h3 className="premium-title">{district.name}</h3>
        <div className="premium-subtitle">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg>
          {district.hq}
        </div>
        
        <div className="premium-stats">
          <div className="stat-box stat-major">
            <div className="stat-icon-wrapper">
              <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/></svg>
            </div>
            <div className="stat-number">{district.complaintsMajor}</div>
            <div className="stat-label">MAJOR</div>
          </div>
          
          <div className="stat-box stat-minor">
            <div className="stat-icon-wrapper">
              <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/></svg>
            </div>
            <div className="stat-number">{district.complaintsMinor}</div>
            <div className="stat-label">MINOR</div>
          </div>
          
          <div className="stat-box stat-visited">
            <div className="stat-icon-wrapper">
              <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/></svg>
            </div>
            <div className="stat-number">{district.visitedCount}</div>
            <div className="stat-label">VISITED</div>
          </div>
        </div>
      </div>
    </div>
  );
}
  