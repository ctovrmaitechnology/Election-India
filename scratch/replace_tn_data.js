const fs = require('fs');

// Official TN 2026 MLA data from PDF (including Page 6 additions/corrections)
const TN = {
  tiruvallur: [
    {name:'Gummidipoondi',mla:'S.VIJAYAKUMAR',party:'TVK'},
    {name:'Ponneri (SC)',mla:'DR.RAVI.M.S',party:'TVK'},
    {name:'Tiruttani',mla:'G.HARI',party:'AIADMK'},
    {name:'Thiruvallur',mla:'DR. T. ARUNKUMAR',party:'TVK'},
    {name:'Poonamallee (SC)',mla:'PRAKASAM.R',party:'TVK'},
    {name:'Avadi',mla:'R.RAMESH KUMAR',party:'TVK'},
    {name:'Maduravoyal',mla:'RHEVANTH CHARAN',party:'TVK'},
    {name:'Ambattur',mla:'BALAMURAGAN.G',party:'TVK'},
    {name:'Madavaram',mla:'M.L.VIJAYAPRABHU',party:'TVK'},
    {name:'Thiruvottiyur',mla:'SENTHIL KUMAR. N',party:'TVK'},
  ],
  chennai: [
    {name:'Dr.Radhakrishnan Nagar',mla:'N. MARIE WILSON',party:'TVK'},
    {name:'Perambur',mla:'C. JOSEPH VIJAY',party:'TVK'},
    {name:'Kolathur',mla:'V. S. BABU',party:'TVK'},
    {name:'Villivakkam',mla:'AADHAV ARJUNA',party:'TVK'},
    {name:'Thiru-Vi-Ka-Nagar (SC)',mla:'M. R. PALLAVI',party:'TVK'},
    {name:'Egmore (SC)',mla:'RAJMOHAN',party:'TVK'},
    {name:'Royapuram',mla:'K.V. VIJAY DAMU',party:'TVK'},
    {name:'Harbour',mla:'P.K SEKARBABU',party:'DMK'},
    {name:'Chepauk-Thiruvallikeni',mla:'UDHAYANIDHI STALIN',party:'DMK'},
    {name:'Thousand Lights',mla:'PRABHAKAR.J.C.D',party:'TVK'},
    {name:'Anna Nagar',mla:'V.K.RAMKUMAR',party:'TVK'},
    {name:'Virugampakkam',mla:'SABARINATHAN.R',party:'TVK'},
    {name:'Saidapet',mla:'ARUL PRAKASAM. M',party:'TVK'},
    {name:'Thiyagarayanagar',mla:'ANAND N',party:'TVK'},
    {name:'Mylapore',mla:'VENKATARAMANAN. P',party:'TVK'},
    {name:'Velachery',mla:'KUMAR. R',party:'TVK'},
  ],
  chengalpattu: [
    {name:'Shozhinganalur',mla:'ECR P SARAVANAN',party:'TVK'},
    {name:'Alandur',mla:'M.HARISH',party:'TVK'},
    {name:'Sriperumbudur (SC)',mla:'THENNARASU.K',party:'TVK'},
    {name:'Pallavaram',mla:'J.KAMATCHI',party:'TVK'},
    {name:'Tambaram',mla:'D.SARATHKUMAR',party:'TVK'},
    {name:'Chengalpattu',mla:'S. THIYAGARAJAN',party:'TVK'},
    {name:'Thiruporur',mla:'B.VIJAYARAJ',party:'TVK'},
    {name:'Cheyur (SC)',mla:'RAJASEKAR. E',party:'AIADMK'},
    {name:'Maduranthakam (SC)',mla:'MARAGATHAM KUMARAVEL.K',party:'AIADMK'},
    {name:'Uthiramerur',mla:'MUNIRATHINAM.J',party:'TVK'},
    {name:'Kancheepuram',mla:'R.V. RANJITHKUMAR',party:'TVK'},
  ],
  vellore: [
    {name:'Arakkonam (SC)',mla:'V. GANDHIRAJ',party:'TVK'},
    {name:'Sholingur',mla:'G.KAPIL',party:'TVK'},
    {name:'Katpadi',mla:'DR M SUDHAKAR',party:'TVK'},
    {name:'Ranipet',mla:'THAHIRA',party:'TVK'},
    {name:'Arcot',mla:'S.M.SUKUMAR',party:'AIADMK'},
    {name:'Vellore',mla:'M.M.VINOTH KANNAN',party:'TVK'},
    {name:'Anaikattu',mla:'D.VELAZHAGAN',party:'AIADMK'},
    {name:'Kilvaithinankuppam (SC)',mla:'THENRAL KUMAR. E',party:'TVK'},
    {name:'Gudiyatham (SC)',mla:'K.SINDU',party:'TVK'},
    {name:'Vaniyambadi',mla:'SYED FAROOQ BASHA SSB',party:'IUML'},
    {name:'Ambur',mla:'VILWANATHAN. A.C',party:'DMK'},
    {name:'Jolarpet',mla:'VEERAMANI K.C',party:'AIADMK'},
  ],
  tirupattur: [
    {name:'Tirupattur',mla:'DR THIRUPATHI. N',party:'TVK'},
    {name:'Vaniyambadi',mla:'SYED FAROOQ BASHA SSB',party:'IUML'},
    {name:'Ambur',mla:'VILWANATHAN. A.C',party:'DMK'},
  ],
  krishnagiri: [
    {name:'Uthangarai (SC)',mla:'N ELAIYARAJA',party:'TVK'},
    {name:'Bargur (SC)',mla:'E.C. GOVINDARASAN',party:'AIADMK'},
    {name:'Krishnagiri',mla:'MUKUNDHAN.P',party:'TVK'},
    {name:'Veppanahalli',mla:'SRINIVASAN.P.S',party:'DMK'},
    {name:'Hosur',mla:'BALAKRISHNAREDDY. P',party:'AIADMK'},
    {name:'Thalli',mla:'RAMACHANDRAN. T',party:'CPI'},
    {name:'Palacodu',mla:'ANBALAGAN. K.P',party:'AIADMK'},
  ],
  dharmapuri: [
    {name:'Pennagaram',mla:'GAJENDRAN. S',party:'TVK'},
    {name:'Dharmapuri',mla:'SOWMIYA ANBUMANI',party:'PMK'},
    {name:'Pappireddipatti',mla:'MARAGATHAM VETRIVEL',party:'AIADMK'},
    {name:'Harur (SC)',mla:'SAMPATHKUMAR. V',party:'TVK'},
  ],
  tiruvannamalai: [
    {name:'Chengam (SC)',mla:'S.VELU',party:'AIADMK'},
    {name:'Tiruvannamalai',mla:'VELU. E.V',party:'DMK'},
    {name:'Kilpennathur',mla:'RAMACHANDRAN.S',party:'AIADMK'},
    {name:'Kalasapakkam',mla:'AGRI KRISHNAMURTHY. S S',party:'AIADMK'},
    {name:'Polur',mla:'ABISHEK. R',party:'AIADMK'},
    {name:'Arani',mla:'JAYASUDHA. L',party:'AIADMK'},
    {name:'Cheyyar',mla:'MUKKUR N. SUBRAMANIAN',party:'AIADMK'},
    {name:'Vandavasi (SC)',mla:'AMBETHKUMAR. S',party:'DMK'},
  ],
  viluppuram: [
    {name:'Gingee',mla:'GANESHKUMAR. A',party:'PMK'},
    {name:'Mailam',mla:'SHANMUGAM C VE',party:'AIADMK'},
    {name:'Tindivanam (SC)',mla:'VANNI ARASU',party:'VCK'},
    {name:'Vanur (SC)',mla:'GOWTHAM D',party:'DMK'},
    {name:'Viluppuram',mla:'LAKSHMANAN R',party:'DMK'},
    {name:'Vikravandi',mla:'SIVAKUMAR C',party:'PMK'},
    {name:'Tirukkoyilur',mla:'PALANISAMY S',party:'AIADMK'},
    {name:'Ulundurpettai',mla:'VASANTHAVEL G R',party:'DMK'},
    {name:'Rishivandiyam',mla:'KARTHIKEYAN K',party:'DMK'},
    {name:'Sankarapuram',mla:'RAKESH R',party:'AIADMK'},
    {name:'Kallakurichi (SC)',mla:'ARUL VIGNESH C',party:'TVK'},
  ],
  kallakurichi: [
    {name:'Kallakurichi',mla:'CHINNADURAI. M',party:'TVK'},
    {name:'Ulundurpettai',mla:'VASANTHAVEL G R',party:'DMK'},
    {name:'Sankarapuram',mla:'RAKESH R',party:'AIADMK'},
  ],
  salem: [
    {name:'Gangavalli (SC)',mla:'NALLATHAMBI. A',party:'AIADMK'},
    {name:'Attur (SC)',mla:'JAYASANKARAN. A.P',party:'AIADMK'},
    {name:'Yercaud (ST)',mla:'USHARANI. P',party:'AIADMK'},
    {name:'Omalur',mla:'MANI. R',party:'AIADMK'},
    {name:'Mettur',mla:'VENKATACHALAM. G',party:'AIADMK'},
    {name:'Edappadi',mla:'EDAPPADI PALANISWAMI. K',party:'AIADMK'},
    {name:'Sankari',mla:'VETRIVEL. S',party:'AIADMK'},
    {name:'Salem (West)',mla:'LAKSHMANAN.S',party:'TVK'},
    {name:'Salem (North)',mla:'SIVAKUMAR. K',party:'TVK'},
    {name:'Salem (South)',mla:'VIJAY TAMILAN PARTHIBAN. A',party:'TVK'},
    {name:'Veerapandi',mla:'PALANIVEL. M.S',party:'TVK'},
  ],
  namakkal: [
    {name:'Rasipuram (SC)',mla:'LOGESH TAMILSELVAN D',party:'TVK'},
    {name:'Senthamangalam (ST)',mla:'P CHANDRASEKAR',party:'TVK'},
    {name:'Namakkal',mla:'DILIP C S',party:'TVK'},
    {name:'Paramathi-Velur',mla:'SEKAR S',party:'AIADMK'},
    {name:'Tiruchengodu',mla:'ARUNRAJ K G',party:'TVK'},
    {name:'Kumarapalayam',mla:'C.VIJAYALAKSHMI',party:'TVK'},
  ],
  erode: [
    {name:'Erode (East)',mla:'M.VIJAY BALAJI',party:'TVK'},
    {name:'Erode (West)',mla:'ANANTH MOGHAN K.K',party:'TVK'},
    {name:'Modakkurichi',mla:'D.SHANMUGAN',party:'TVK'},
    {name:'Perundurai',mla:'JAYAKUMAR. S',party:'AIADMK'},
    {name:'Bhavani',mla:'KARUPPANAN. K.C',party:'AIADMK'},
    {name:'Anthiyur',mla:'HARIBASKAR.P',party:'AIADMK'},
    {name:'Gobichettipalayam',mla:'SENGOTTAIYAN.K.A',party:'AIADMK'},
    {name:'Bhavanisagar (SC)',mla:'V.P TAMILSELVI',party:'AIADMK'},
  ],
  tiruppur: [
    {name:'Dharapuram (SC)',mla:'SATHYABAMA.P',party:'AIADMK'},
    {name:'Kangayam',mla:'NSN NATARAJ',party:'TVK'},
    {name:'Tiruppur (North)',mla:'V.SATHYABAMA',party:'TVK'},
    {name:'Tiruppur (South)',mla:'BALAMURUGAN. S',party:'TVK'},
    {name:'Palladam',mla:'K.RAMKUMAR',party:'TVK'},
    {name:'Udumalaipettai',mla:'JAYAKUMAR M.',party:'DMK'},
    {name:'Madathukulam',mla:'R JAYARAMAKRISHNAN',party:'TVK'},
  ],
  nilgiris: [
    {name:'Udhagamandalam',mla:'BHOJARAJAN.M',party:'BJP'},
    {name:'Gudalur (SC)',mla:'DHRAVIDAMANI.M',party:'DMK'},
    {name:'Coonoor',mla:'M. RAJU',party:'DMK'},
  ],
  coimbatore: [
    {name:'Mettupalayam',mla:'SUNILANAND',party:'TVK'},
    {name:'Avanashi (SC)',mla:'KAMALI.S',party:'TVK'},
    {name:'Sulur',mla:'NM.SUKUMAR',party:'TVK'},
    {name:'Kavundampalayam',mla:'KANIMOZHI SANTHOSH',party:'TVK'},
    {name:'Coimbatore (North)',mla:'V. SAMPATHKUMAR',party:'TVK'},
    {name:'Thondamuthur',mla:'S.P VELIDA MUNIAMMAL',party:'AIADMK'},
    {name:'Coimbatore (South)',mla:'V SENTHILBALAJI',party:'DMK'},
    {name:'Singanallur',mla:'K.S.SRI GIRI PRASATH',party:'AIADMK'},
    {name:'Kinathukadavu',mla:'VIGNESH K',party:'TVK'},
    {name:'Pollachi',mla:'K. NITHIYANANDHAN',party:'DMK'},
    {name:'Valparai (SC)',mla:'KUTTY (ALIAS) SUDHAKAR. A',party:'TVK'},
  ],
  dindigul: [
    {name:'Palani',mla:'RAVIMOHARAN. K',party:'AIADMK'},
    {name:'Oddanchatram',mla:'SAKKARAPANI. R',party:'DMK'},
    {name:'Athoor',mla:'I. PERIASAMY',party:'TVK'},
    {name:'Nilakkottai (SC)',mla:'AYYANAR.R',party:'TVK'},
    {name:'Natham',mla:'NATHAM VISWANATHAN R',party:'TVK'},
    {name:'Dindigul',mla:'SENTHILKUMAR. I.P',party:'DMK'},
    {name:'Vedasandur',mla:'SAMINATHAN. T',party:'TVK'},
  ],
  karur: [
    {name:'Aravakurichi',mla:'ELANGO. R',party:'DMK'},
    {name:'Karur',mla:'M.R. VIJAYABHASKAR',party:'AIADMK'},
    {name:'Krishnarayapuram (SC)',mla:'SATHYA. M',party:'TVK'},
    {name:'Kulithalai',mla:'SURIYANUR. A. CHANDRAN',party:'DMK'},
  ],
  tiruchirappalli: [
    {name:'Manapparai',mla:'R. KATHIRAVAN',party:'TVK'},
    {name:'Srirangam',mla:'RAMESH',party:'TVK'},
    {name:'Tiruchirappalli (West)',mla:'K.N.NEHRU',party:'TVK'},
    {name:'Tiruchirappalli (East)',mla:'C. JOSEPH VIJAY',party:'TVK'},
    {name:'Thiruverumbur',mla:'VIJAYAKUMAR (A) NAVALPATTU',party:'TVK'},
    {name:'Lalgudi',mla:'LEEMAROSE MARTIN',party:'AIADMK'},
    {name:'Manachanallur',mla:'KATHIRAVAN. S',party:'DMK'},
    {name:'Musiri',mla:'M.VIGNESH',party:'TVK'},
    {name:'Thuraiyur (SC)',mla:'RAVISANKAR M.',party:'TVK'},
  ],
  perambalur: [
    {name:'Perambalur (SC)',mla:'SIVAKUMAR. K',party:'TVK'},
    {name:'Kunnam',mla:'ANNADURAI K',party:'AIADMK'},
  ],
  ariyalur: [
    {name:'Ariyalur',mla:'RAJENDRAN S',party:'AIADMK'},
    {name:'Jayankondam',mla:'VAITHILINGAM G.',party:'PMK'},
  ],
  cuddalore: [
    {name:'Tittakudi (SC)',mla:'GANESAN C.V',party:'DMK'},
    {name:'Vriddhachalam',mla:'PREMALLATHA VIJAYAKANT',party:'Desiya Murpokku'},
    {name:'Neyveli',mla:'RAJENDRAN.R',party:'AIADMK'},
    {name:'Panruti',mla:'MOHAN. K',party:'AIADMK'},
    {name:'Cuddalore',mla:'B.RAJKUMAR',party:'TVK'},
    {name:'Kurinjipadi',mla:'M.R.K.PANNEERSELVAM',party:'DMK'},
    {name:'Bhuvanagiri',mla:'ARUNMOZHITHEVAN. A',party:'AIADMK'},
    {name:'Chidambaram',mla:'THAMMUN ANSARI. M',party:'TVK'},
    {name:'Kattumannarkol (SC)',mla:'L.E. JOTHIMANI',party:'VCK'},
  ],
  nagapattinam: [
    {name:'Sirkali (SC)',mla:'SENTHILSELVAN.R',party:'TVK'},
    {name:'Mayiladuthurai',mla:'JAMAL MOHAMED YOUNOOS. Y.N',party:'INC'},
    {name:'Poompuhar',mla:'NIVEDHA M MURUGAN',party:'TVK'},
    {name:'Nagapattinam',mla:'M.H.JAWAHIRULLAH',party:'DMK'},
    {name:'Kilvelur (SC)',mla:'LATHA. T',party:'CPI(M)'},
    {name:'Vedaranyam',mla:'MANIAN. O.S',party:'AIADMK'},
  ],
  mayiladuthurai: [
    {name:'Sirkazhi',mla:'THAMBIDURAI. K',party:'TVK'},
    {name:'Mayiladuthurai (SC)',mla:'PRABAHARAN. T',party:'TVK'},
  ],
  thiruvarur: [
    {name:'Thiruthuraipoondi (SC)',mla:'MARIMUTHU K',party:'CPI'},
    {name:'Mannargudi',mla:'KAMARAJ. S',party:'AMMK'},
    {name:'Thiruvarur',mla:'KALAIVANAN POONDI K',party:'DMK'},
    {name:'Nannilam',mla:'KAMARAJ. R',party:'AIADMK'},
  ],
  tanjavur: [
    {name:'Thiruvidaimarudur (SC)',mla:'GOVI.CHEZHIAAN',party:'DMK'},
    {name:'Kumbakonam',mla:'VINOTH',party:'TVK'},
    {name:'Papanasam',mla:'A.M. SHAHJAHAN',party:'IUML'},
    {name:'Thiruvaiyaru',mla:'DURAI. CHANDRASEKARAN',party:'DMK'},
    {name:'Thanjavur',mla:'R. VIJAYSARAVANAN',party:'TVK'},
    {name:'Orathanadu',mla:'R. VAITHILINGAM',party:'TVK'},
    {name:'Pattukkotai',mla:'ANNADURAI K',party:'AIADMK'},
    {name:'Peravurani',mla:'ASHOKKUMAR. N',party:'DMK'},
  ],
  pudukkottai: [
    {name:'Gandarvakottai (SC)',mla:'N. SUBRAMANIAN',party:'TVK'},
    {name:'Viralimalai',mla:'VIJAYABASKAR. C',party:'AIADMK'},
    {name:'Pudukkottai',mla:'V. MUTHURAJA',party:'TVK'},
    {name:'Thirumayam',mla:'REGUPATHY.S',party:'DMK'},
    {name:'Alangudi',mla:'SIVA.V. MEYYANATHAN',party:'TVK'},
    {name:'Aranthangi',mla:'MOHAMED FARVAS. J',party:'TVK'},
  ],
  sivagangai: [
    {name:'Karaikudi',mla:'DR.PRABHU. TK',party:'TVK'},
    {name:'Tiruppattur',mla:'SEENIVASA SETHUPATHY. R',party:'TVK'},
    {name:'Sivaganga',mla:'KULANTHAI RANI A',party:'TVK'},
    {name:'Manamadurai (SC)',mla:'ELANGOVAN.D',party:'TVK'},
  ],
  madurai: [
    {name:'Melur',mla:'P.VISWANATHAN',party:'INC'},
    {name:'Madurai East',mla:'KARTHIKEYAN S',party:'TVK'},
    {name:'Sholavandan (SC)',mla:'KARUPPAIAH.M.V',party:'TVK'},
    {name:'Madurai North',mla:'A.KALLANAI',party:'TVK'},
    {name:'Madurai South',mla:'MM.GOPISON',party:'TVK'},
    {name:'Madurai Central',mla:'MADHAR BADHURUDEEN',party:'TVK'},
    {name:'Madurai West',mla:'THANGAPANDI SR',party:'TVK'},
    {name:'Thiruparankundram',mla:'NIRMALKUMAR. R',party:'DMK'},
    {name:'Thirumangalam',mla:'MANIMARAN.M',party:'DMK'},
    {name:'Usilampatti',mla:'VIJAY. M',party:'TVK'},
  ],
  theni: [
    {name:'Andipatti',mla:'MAHARAJAN.A',party:'DMK'},
    {name:'Periyakulam (SC)',mla:'SABARI IYNGARAN G.',party:'TVK'},
    {name:'Bodnayakanur',mla:'PANNEERSELVAM.O',party:'DMK'},
    {name:'Cumbum',mla:'JEGANATHMISHRA PLA',party:'TVK'},
  ],
  // UPDATED WITH PAGE 6 ADDITIONS:
  virudhunagar: [
    {name:'Rajapalayam',mla:'JEGADESHWARI. K',party:'TVK'},
    {name:'Srivilliputhur (SC)',mla:'KARTHIK.A',party:'TVK'},
    {name:'Sattur',mla:'KADARKARAIRAJ. A',party:'DMK'},
    {name:'Sivakasi',mla:'KEERTHANA S',party:'TVK'},
    {name:'Virudhunagar',mla:'SELVAM P',party:'TVK'},
    {name:'Aruppukkottai',mla:'RAMACHANDRAN. K.K.S.S.R',party:'DMK'},
    {name:'Tiruchuli',mla:'THANGAM THENARASU',party:'DMK'},
  ],
  ramanathapuram: [
    {name:'Paramakudi (SC)',mla:'ADVOCATE. KATHIRAVAN. K.K',party:'DMK'},
    {name:'Tiruvadanai',mla:'RAJEEV',party:'TVK'},
    {name:'Ramanathapuram',mla:'KATHARBATCHA MUTHURAMALINGAM',party:'DMK'},
    {name:'Mudhukulathur',mla:'R.S.RAJAKANNAPPAN',party:'DMK'},
  ],
  thoothukudi: [
    {name:'Vilathikulam',mla:'MARKANDAYAN G',party:'DMK'},
    {name:'Thoothukudi',mla:'SRINATH',party:'TVK'},
    {name:'Tiruchendur',mla:'ANITHA R. RADHAKRISHNAN',party:'DMK'},
    {name:'Srivaikuntam',mla:'SARAVANAN. G',party:'TVK'},
    {name:'Ottapidaram (SC)',mla:'P .MATHANRAJA',party:'TVK'},
    {name:'Kovilpatti',mla:'KARUNANITHI.K',party:'DMK'},
  ],
  tenkasi: [
    {name:'Sankarankovil (SC)',mla:'DR. DHILIPAN JAISHANKAR',party:'AIADMK'},
    {name:'Vasudevanallur (SC)',mla:'E. RAJA',party:'DMK'},
    {name:'Kadayanallur',mla:'RAJENDRAN. T. M',party:'DMK'},
    {name:'Tenkasi',mla:'DR.KALAI KATHIRAVAN',party:'DMK'},
    {name:'Alangulam',mla:'PAUL MANOJ PANDIAN',party:'DMK'},
  ],
  tirunelveli: [
    {name:'Tirunelveli',mla:'MURUGHAN.R.S.',party:'TVK'},
    {name:'Ambasamudram',mla:'DR.ESAKKI SUBAYA',party:'AIADMK'},
    {name:'Palayamkottai',mla:'M.ABDUL WAHAB',party:'DMK'},
    {name:'Nanguneri',mla:'REDDIARPATTI V. NARAYANAN',party:'TVK'},
    {name:'Radhapuram',mla:'DR.SATHISH CHRISTOPHER',party:'TVK'},
  ],
  kanyakumari: [
    {name:'Kanniyakumari',mla:'THALAVAI SUNDARAM. N',party:'AIADMK'},
    {name:'Nagercoil',mla:'AUSTIN',party:'DMK'},
    {name:'Colachel',mla:'THARAHAI CUTHBERT',party:'INC'},
    {name:'Padmanabhapuram',mla:'CHELLASWAMY. R',party:'CPI(M)'},
    {name:'Vilavancode',mla:'PRAVEEN T.T',party:'INC'},
    {name:'Killiyoor',mla:'RAJESH KUMAR. S',party:'INC'},
  ],
  ranipet: [
    {name:'Sholingur',mla:'G.KAPIL',party:'TVK'},
    {name:'Arcot',mla:'SRINIVASAN. S',party:'TVK'},
    {name:'Ranipet',mla:'JAYAKUMAR. T',party:'TVK'},
    {name:'Walajah',mla:'DHANUSH. K.R',party:'TVK'},
  ],
  karaikal: [
    {name:'Karaikal North',mla:'A. JOHN KUMAR',party:'TVK'},
    {name:'Karaikal South',mla:'S. DHIVAGAR',party:'TVK'},
    {name:'Thirunallar',mla:'P. RAJU',party:'TVK'},
  ],
};

// Add stats to each constituency
function addStats(list) {
  return list.map(c => ({
    ...c,
    wards: Math.floor(Math.random()*12+12),
    major: Math.floor(Math.random()*600+200),
    minor: Math.floor(Math.random()*300+80),
    visited: Math.random() > 0.5,
  }));
}

// Read the file
const file = './src/data/newStatesMockData.js';
let content = fs.readFileSync(file, 'utf8');

let replaced = 0;
for (const [district, rows] of Object.entries(TN)) {
  const newRows = addStats(rows);
  const jsonRows = JSON.stringify(newRows, null, 2)
    .replace(/^\[/, '').replace(/\]$/, '')
    .split('\n').map(l => '    ' + l).join('\n');

  // Match "district": [ ... ] block
  const pattern = new RegExp(`("${district}"\\s*:\\s*\\[)[\\s\\S]*?(\\])\\s*[,\\n]`, 'm');
  const replacement = `"${district}": [\n${jsonRows}\n  ],`;
  if (pattern.test(content)) {
    content = content.replace(pattern, replacement);
    replaced++;
    console.log(`✓ Replaced ${district} (${rows.length} constituencies)`);
  } else {
    console.log(`✗ NOT FOUND: ${district}`);
  }
}

fs.writeFileSync(file, content, 'utf8');
console.log(`\nDone. Replaced ${replaced}/${Object.keys(TN).length} districts.`);
