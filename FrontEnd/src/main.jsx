import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, Menu, Mic, MicOff, Pencil, RefreshCw, UserRound, X } from 'lucide-react'
import './styles.css'

function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getSixMonthsAgo() {
  const currentDate = new Date()
  const targetMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1)
  const lastDayOfTargetMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate()
  targetMonth.setDate(Math.min(currentDate.getDate(), lastDayOfTargetMonth))
  return toDateInputValue(targetMonth)
}

function formatServiceDate(date) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`))
}

function playRequestAlertTone() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return
  let audioContext
  try { audioContext = new AudioContextClass() } catch { return }
  const startAt = audioContext.currentTime
  ;[0, 0.3, 0.6].forEach((offset, index) => {
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const toneStart = startAt + offset
    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, toneStart)
    gain.gain.exponentialRampToValueAtTime(0.12, toneStart + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.0001, toneStart + 0.18)
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(toneStart)
    oscillator.stop(toneStart + 0.19)
    if (index === 2) oscillator.onended = () => audioContext.close()
  })
}

const approvedCustomerRequests = []

const categories = [
  { name: 'Construction Service Providers', icon: '🏗️' },
  { name: 'Driving Service Providers', icon: '🚘' },
  { name: 'Farming Service Providers', icon: '🌾' },
  { name: 'Home Service Providers', icon: '🏠' },
  { name: 'Loader Service Providers', icon: '🚜' },
  { name: 'Marriage & Other Functions Service Providers', icon: '🎊' },
  { name: 'Transport Service Providers', icon: '🚚' },
  { name: 'Vehicle & Machinery Service Providers', icon: '🔧' },
]

const labourTypes = [
  'Construction Service Providers',
  'Driving Service Providers',
  'Farming Service Providers',
  'Home Service Providers',
  'Loader Service Providers',
  'Marriage & Other Functions Service Providers',
  'Transport Service Providers',
  'Vehicle & Machinery Service Providers',
]
const marriageFunctionSpecialists = [
  { name: 'Caterers', description: 'Food preparation, serving staff' },
  { name: 'Cleaning Staff', description: 'Venue maintenance before/after events' },
  { name: 'Decorators', description: 'Stage, mandap, venue decoration' },
  { name: 'Lighting Technicians', description: 'Venue lighting setup' },
  { name: 'Makeup Artists', description: 'Bridal, groom, guest makeup services' },
  { name: 'Musicians', description: 'Bands, DJs, traditional instrumentalists' },
  { name: 'Photographers', description: 'Photography, videography services' },
  { name: 'Printing Providers', description: 'Printing wedding cards, banners/flex, related services' },
  { name: 'Purohitulu', description: 'Conducting weddings, rituals, vrathas, poojas' },
  { name: '<===============================>', divider: true },
  { name: '★ Cooking Master', value: 'Cooking Master', description: 'Preparing meals for functions' },
  { name: '★ Specialist', value: 'Specialist', description: 'All Services' },
]
const musicianTypes = ['Bands', 'DJs', 'Traditional Instrumentalists']
const farmLaborTasks = ['Manual sowing', 'Manual transplanting', 'Weeding', 'Bundling/stacking support']
const vehicleSpecialists = [
  { name: 'Bike Specialist', description: 'Motorcycles, scooters repairs' },
  { name: 'Car Specialist', description: 'Engine, brakes, suspension, general car repairs' },
  { name: 'JCB Specialist', description: 'Excavator, earthmover repairs' },
  { name: 'Tractor Specialist', description: 'Agricultural tractors, clutch, gearbox, engine repairs' },
  { name: '<======================>', divider: true },
  { name: '★ Specialist', value: 'Specialist', description: 'All Services' },
]
const drivingSpecialists = [
  { name: 'Car Operator', description: 'Driving, passenger transport, vehicle handling' },
  { name: 'Dozer Operator', description: 'Shifting soil, sand, or gravel for construction or farming' },
  { name: 'JCB Operator', description: 'Land leveling, digging, farm construction' },
  { name: 'Tractor Operator', description: 'Tractor driving, ploughing, soil preparation' },
]
const transportSpecialists = [
  { name: 'Auto Service', description: 'Three-wheeler transportation service for short-distance passenger travel and small parcel deliveries within local areas.' },
  { name: 'Car Service', description: 'Transportation of passengers for personal travel, business trips, airport transfers, point-to-point commuting.' },
  { name: 'Mini Truck Service', description: 'Suitable for transporting small to medium-sized goods, household items, office equipment, local delivery services.' },
  { name: 'Van Service', description: 'Transportation of passengers or goods, ideal for group travel, school transportation, staff transportation, tourism.' },
]
const loaderSpecialists = [
  { name: 'Crop Bags Loaders', description: 'Calculate and load crop bags into lorries or other vehicles' },
  { name: 'Loading & Unloading Providers', description: 'Operating loaders to load soil, sand, cement, gravel  others.' },
]
const farmingSpecialists = [
  { name: 'Dozer Providers', description: 'Shifting soil, sand, or gravel for construction or farming' },
  { name: 'Farm Laborers', description: 'Manual sowing, manual transplanting, weeding, bundling/stacking support' },
  { name: 'Fertilizer Applicators', description: 'Fertilizer distribution, soil enrichment' },
  { name: 'Harvesting Machine Operators', description: 'Combine harvesters, threshers operation' },
  { name: 'Irrigation Technicians', description: 'Borewell, drip irrigation, sprinkler setup & maintenance' },
  { name: 'JCB Providers', description: 'Land leveling, digging, farm construction' },
  { name: 'Land Fencing', description: 'Installing barbed wire, chain link, and concrete fencing for farmland' },
  { name: 'Pesticide Sprayers', description: 'Crop spraying, pest control' },
  { name: 'Tractor Operators', description: 'Tractor ploughing, soil preparation' },
  { name: 'Seed Suppliers', description: 'Crop seeds, hybrid seeds, distribution' },
  { name: 'Transport Providers', description: 'Crop and produce transport services' },
  { name: 'Tree Cutters', description: 'Cutting and trimming Eucalyptus and Cedrus deodara trees' },
  { name: 'Tree Planters', description: 'Planting Eucalyptus and Cedrus deodara trees, ensuring proper pit' },
  { name: 'Water Pump Technicians', description: 'Motor, pump installation & repair' },
  { name: '<===============================>', divider: true },
  { name: 'Multi-Select Option', value: 'Multi-Select' },
]
const homeServiceSpecialists = [
  { name: 'Appliance Technicians', description: 'Washing machines, refrigerators, AC installation & repairs' },
  { name: 'Carpenters', description: 'Furniture repair, woodwork, fittings' },
  { name: 'Cook/Chef Services', description: 'Household cooking support' },
  { name: 'Electricians', description: 'Wiring, lighting, Fans and power issues' },
  { name: 'Gardening Helpers', description: 'Lawn care, plant maintenance' },
  { name: 'Housemaids', description: 'Daily household chores, cleaning, assistance' },
  { name: 'Laundry Services', description: 'Washing, ironing, dry cleaning' },
  { name: 'Painters', description: 'Interior & exterior painting, wall finishing' },
  { name: 'Plumbers', description: 'Water supply, taps, pipelines, drainage' },
  { name: 'Security Guards', description: 'Residential security services' },
  { name: 'Septic Tank Cleaner', description: 'Cleaning and maintaining septic tanks' },
  { name: 'TV Repair Technicians', description: 'LED, LCD, Smart TV servicing & repairs' },
  { name: 'Water Tank Cleaners', description: 'Overhead & underground tank cleaning' },
]
const constructionSpecialists = [
  { name: 'Carpenters', description: 'Shuttering, wooden molds, and joinery work' },
  { name: 'Centring Fixers', description: 'Placing reinforcement bars before concreting' },
  { name: 'Concrete Workers', description: 'Mixing, pouring, and finishing concrete' },
  { name: 'Construction Laborers', description: 'Assisting skilled workers, carrying materials, site prep' },
  { name: 'Electricians', description: 'Wiring and electrical systems in buildings' },
  { name: 'Masons', description: 'Bricklaying, blockwork, and cement plastering' },
  { name: 'Painters', description: 'Surface finishing and painting after cement work' },
  { name: 'Plumbers', description: 'Installing pipelines through cement structures' },
  { name: 'Tractor Services', description: 'Transporting bricks, sand, pebbles/gravel, and other construction materials' },
  { name: 'Tile Setters', description: 'Fixing tiles with mortar or adhesives' },
  { name: 'Welders', description: 'Metal fabrication and structural welding' },
  { name: '<===============================>', divider: true },
  { name: '★ Specialist', value: 'Specialist', description: 'Masons + Construction Laborers' },
]
const specialistsByService = {
  'Construction Service Providers': constructionSpecialists,
  'Driving Service Providers': drivingSpecialists,
  'Farming Service Providers': farmingSpecialists,
  'Home Service Providers': homeServiceSpecialists,
  'Loader Service Providers': loaderSpecialists,
  'Marriage & Other Functions Service Providers': marriageFunctionSpecialists,
  'Transport Service Providers': transportSpecialists,
  'Vehicle & Machinery Service Providers': vehicleSpecialists,
}

function getSpecialistOptions(service) {
  return (specialistsByService[service] || [])
    .map((item) => ({
      label: item.divider ? '<=====================================>' : item.name,
      value: item.value || item.name,
      description: item.description,
      disabled: Boolean(item.divider),
    }))
}

function matchVoiceChoice(transcript, choices) {
  const normalize = (value) => value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const spoken = normalize(transcript)
  if (!spoken) return null

  const matches = (choice) => [choice.label, choice.value].some((value) => normalize(value) === spoken)
  return choices.find(matches) || choices.find((choice) => [choice.label, choice.value].some((value) => {
    const normalizedOption = normalize(value)
    return normalizedOption.startsWith(spoken) || spoken.startsWith(normalizedOption)
  })) || null
}
const mandalVillages = {
  'A.S.Peta': [
    'Akbarabad',
    'Anumasamudram',
    'A.S.Peta Town',
    'Chandulurupadu',
    'Chiramana',
    'Chouta Bheemavaram',
    'Dubagunta',
    'Gudipadu',
    'Gumparlapadu',
    'Hasanapuram',
    'Jammavaram',
    'Kakarlapadu',
    'Kavali Yadavalli',
    'Kondameeda Konduru',
    'Kunalammapadu',
    'Kuppurupadu',
    'Pandipadu',
    'Pedabbipuram',
    'Ponugodu',
    'Rajavolu',
    'Srikolanu',
    'Velpulagunta',
    'Zuvvalaguntapalle',
  ],
  Sangam: [
    'Annareddy Palem',
    'Chennavarappadu',
    'Duvvuru',
    'Jandadibba',
    'Jangala Khandrika',
    'Kaligiri Konduru',
    'Kolagatla',
    'Korimerla',
    'Korimerla Khandrika',
    'Makthapuram',
    'Marripadu',
    'Neelaya Palem',
    'Padamatipalem',
    'Peramana',
    'Sangam Town',
    'Talupurupadu',
    'Tharunavaya',
    'Vangallu',
    'Veerlagudipadu',
    'Vengareddypalem',
  ],
  Seetharamapuram: [
    'Ayyavaripalle',
    'Balayapalle',
    'Basinenipalle',
    'China Nagampalle',
    'Chinthodu',
    'Devammacheruvu',
    'Devarajusurayapalle',
    'Devisettypalle',
    'Gangavaram',
    'Gundupalle',
    'Jayapuram',
    'Maramreddypalle',
    'Narayanampet',
    'Nemalladinne',
    'Pabbuletipalle',
    'Padamati Rompidodla',
    'Pandrangi',
    'Pedda Nagampalle',
    'Pokalingayapalli',
    'Seetharamapuram Town',
    'Singareddypalle',
    'Vempallethoka',
  ],
  Udayagiri: [
    'Appasamudram',
    'Arlapadiya',
    'Bandaganipalle',
    'Chowdepalle',
    'Dasari Palle',
    'Gandipalem',
    'Gangulavari Cheruvu Palle',
    'Gannepalle',
    'Gudinarava',
    'Kondayapalem',
    'Kotayapalle',
    'Krishnampalle',
    'Kurrapalle',
    'Pappulavaripalle',
    'Pullayapalle',
    'Sakunalapalle',
    'Sunnamvarichintala',
    'Thirumalapuram',
    'Udayagiri Town',
    'Vengal Rao Nagar',
  ],
  'Nellore Urban': [
    'Bujabuja Nellore',
    'Chinthareddypalem',
    'Dargamitta',
    'Jonnawada',
    'Kakutur',
    'Kommalapadu',
    'Mottadugunta',
    'Peddacherukuru',
    'Vedayapalem',
  ],
  'Nellore Rural': [
    'Akkacheruvupadu',
    'Allipuram',
    'Amancherla',
    'Ambapuram',
    'Devarapalem',
    'Donthali',
    'Gollakandukur',
    'Gudipallipadu',
    'Gundlapalem',
    'Kakupalle',
    'Kalivelaepalem',
    'Kallurpalle',
    'Kandamur',
    'Kanuparthipadu',
    'Kommarapudi',
    'Kondayampalle',
    'Kondlapudi',
    'Kotha Vellanti',
    'Madaraja Gudur',
    'Mannavarappadu',
    'Mattempadu',
    'Mogallapalem',
    'Mulumudi',
    'Nellore 1',
    'Ogurupadu',
    'Padarupalle',
    'Patha Vellanti',
    'Pedda Cherukur',
    'Penubarthi',
    'Pottepalem',
    'Sajjapuram',
    'Southmopur',
    'Upputur',
    'Vellanti',
    'Visavaviletipadu',
  ],
  Muthukur: [
    'Amudalapadu',
    'Brahmadevam',
    'Epuru',
    'Krishna Patnam',
    'Mamidi Padu',
    'Mollur',
    'Muthukur Town',
    'Narikela Palli',
    'Nelaturu',
    'Pathurivari Kandrigi',
    'Piditha Polur',
    'Pynapuram',
    'Survepalle',
    'Tallapudi',
    'Valluru',
    'Valluruvari Khandrika',
  ],
  Venkatachalam: [
    'Anikepalle',
    'Chamudugunta',
    'Edagali',
    'Epuru',
    'Idimepalle',
    'Kakuturu',
    'Kandalapadu',
    'Kantepalle',
    'Kanupuru',
    'Kasumuru',
    'Kumkumpudi',
    'Kuricherlapadu',
    'Nagulavaram',
    'Nidiguntapalem',
    'Palicherlapadu',
    'Pudiparthi',
    'Punjulurupadu',
    'Saraswathi Nagar',
    'Thatipartipalem',
    'Thikkavarappadu',
    'Thirumalamma Palem',
    'Venkatachalam Town',
  ],
  Manubolu: [
    'Akkampeta',
    'Anupallipadu',
    'Baddevolu',
    'Bandepalle',
    'Cherukumudi',
    'Gurivindapudi',
    'Gurugunda Pudi',
    'Jatlakonduru',
    'Kagithalapuru',
    'Kattuvapalle',
    'Kolanukuduru',
    'Kommalapudi',
    'Kudithipalle',
    'Madamanuru',
    'Manubolu Town',
    'Muddumudi',
    'Parlapadu',
    'Piduru',
    'Pidurupalem',
    'Vadlapudi',
    'Veerampalli',
    'Venkanapalem',
  ],
  Buchireddypalem: [
    'Buchireddypalem Town',
    'Chellayapalem',
    'Damaramadugu',
    'Isakapalem',
    'Jonnawada',
    'Kalayakagollu',
    'Kattubadipalem',
    'Kavetipalem',
    'Minagallu',
    'Munulapudi',
    'Nagamambapuram',
    'Panchedu',
    'Penuballe',
    'Rebala',
    'Sreerangaraja Puram',
  ],
  Kovur: [
    'Cherlo Palem',
    'Gangavaram',
    'Inamadugu',
    'Kovur Town',
    'Legunta Padu',
    'Modegunta',
    'Padugupadu',
    'Paturu',
    'Pothireddy Palem',
    'Veguru',
  ],
  Kaligiri: [
    'Ananthapuram',
    'China Annaluru',
    'Dubagunta',
    'Gudladona',
    'Kaligiri Town',
    'Kavali Musthapuram',
    'Kothapeta',
    'Krakuturu',
    'Kummarakonduru',
    'Lakshmipuram',
    'Laxmipuram',
    'Nagasamudram',
    'Parikota',
    'Peda Annaluru',
    'Pedakonduru',
    'Polampadu',
    'Ravulakollu',
    'Siddana Konduru',
    'Tellapadu',
    'Thellapadu',
    'Thurpu Dubagunta',
    'Veernakolu',
    'Velagapadu',
    'Venkannapalem',
    'Yepinapi',
    'Yerukulareddypalem',
  ],
  Kavali: [
    'Amudaladinne',
    'Anemadugu',
    'Budamagunta',
    'Chalamcherla',
    'Chenchuganipalem',
    'Chennayapalem',
    'Gowravaram',
    'Kavali Town',
    'Kothapalle',
    'Laxmipuram',
    'Maddurupadu',
    'Mannangidinne',
    'Musunuru',
    'Pedda Pattapu Palem',
    'Rajuvari Chintala Palem',
    'Rudrakota',
    'Sarvayapalem',
    'Siripuram',
    'Thallapalem',
    'Thummalapenta',
  ],
  Kondapuram: [
    'Audimurthipuram',
    'Bhimavarappadu',
    'Challagirigala',
    'Chinthaladeevi',
    'Chinthaladevi',
    'Ganugapenta',
    'Gariminapenta',
    'Gottigundala',
    'Gudavalluru',
    'Iskadamerla',
    'Kasturinaidupalle',
    'Kommi',
    'Kondapuram Town',
    'Kumara Venkatapuram',
    'Kunkuvaripalem',
    'Mallavarappadu',
    'Marrigunta',
    'Nekunampeta',
    'Parlapalli',
    'Ramanujapuram',
    'Renumala',
    'Saipeta',
    'Satyavolu',
    'Settipalem',
    'Thurpu- Brahmanapalle',
    'Thurpu- Jangalapalle',
    'Thurpuyerraballe',
    'Uppaluru',
    'Veligandla',
    'Yerrabotlapalle',
  ],
  Varikuntapadu: [
    'Alivelumangapuram',
    'Bhaskarapuram',
    'Bongaravulapadu',
    'Dakkanur',
    'Damancherla',
    'Ganeswarapuram',
    'Gollapalle',
    'Guvvadi',
    'Iskapalli',
    'Jadadevi',
    'Kancheruvu',
    'Kaniampadu',
    'Kondareddy Palle',
    'Kondayapalem',
    'Mohamadapuram',
    'Narasimhapuram',
    'Pamurupalle',
    'Peddireddipalle',
    'Ramadevulapadu',
    'Thodugupalle',
    'Thotalacheruvupalle',
    'Thurpu Boyamadugula',
    'Thurpu Chennampalle',
    'Thurpuboyamadugula',
    'Thurpupalem',
    'Thurpurompidodla',
    'Timmareddypalle',
    'Turpurompidodla',
    'Varikuntapadu Town',
    'Vempadu',
    'Viruvuru',
    'Yerramreddypalle',
  ],
  Duttalur: [
    'Ayyanapalle',
    'Bhyravaram',
    'Bodavaripalli',
    'Brahmeswaram',
    'Duttalur Town',
    'Kothapeta',
    'Mandallanaidupalle',
    'Mandallapalle',
    'Nandi Padu',
    'Narrawada',
    'Papampalle',
    'Rachavari Palli',
    'Somala Regada',
    'Teddu Padu',
    'Thimma Purm',
    'Venganna Palem',
    'Venkatam Peta',
    'Yerukollu',
  ],
  Jaladanki: [
    'Annavaram',
    'Brahmanakraka',
    'Chamadala',
    'China Kraka',
    'Chowdavaram',
    'Gattupalle',
    'Jaladanki Town',
    'Jammalapalem',
    'Kammavaripalem',
    'Kesavaram',
    'Kodandaramapuram',
    'Krishnampadu',
    'L.R.Agraharam',
    'Ramavarapadu',
    'Somavarappadu',
    'Vemulapadu',
  ],
  Bogole: [
    'Allimadugu',
    'Bitragunta',
    'Bogole Town',
    'Chenaraunipalem',
    'Jakkepalligudur',
    'Juvvaladinne',
    'Kovurpalle',
    'Mallayapalem',
    'Mungamur',
    'Nagulavaram',
    'Sambasivapuram',
    'Siddavarapu Venkatesu Palem',
    'Thalluru',
    'Umamaheswarapuram',
    'V.N.R Pet',
    'Yenugula Bavi',
  ],
  Dagadarthi: [
    'Ananthavaram',
    'Bodagudipadu',
    'Chennuru',
    'Choutaputhedu',
    'Dagadarthi Town',
    'Damavaram',
    'Dharamavaram',
    'Dundigam',
    'Ithampadu',
    'Kaminenipalem',
    'Katrayapadu',
    'K.K.Gunta',
    'Lingalapadu',
    'Manubolupadu',
    'Marellapadu',
    'Pedaputhedu',
    'Rangasamudram',
    'Srirama Puram',
    'Tadakalur',
    'Thiruveedhipadu',
    'Thurimerla',
    'Uchaguntapalem',
    'Ulavapalle',
    'Velupodu',
    'Yelamanchi Padu',
  ],
  Vidavalur: [
    'Alagani Padu',
    'Chowkicherla',
    'Dampuru',
    'Dandigunta',
    'Dinne',
    'Mudivarthi',
    'Parlapalle',
    'Peddapalem',
    'Utukuru',
    'Varini',
    'Vavilla',
    'Vidavalur Town',
  ],
  Kodavalur: [
    'Alurupadu',
    'Basavayapalem',
    'Bodduvaripalem',
    'Damegunta',
    'Gandavaram',
    'Gotlapalem',
    'Goutam Nagar',
    'Gundalamma Palem',
    'Kodavalur Town',
    'Kothavangallu',
    'Maneguntapadu',
    'Naidu Palem',
    'North Rajupalem',
    'Padmanabha Satram',
    'Pemmareddy Palem',
    'Ramannapalem',
    'Talamanchi',
    'Venkannapuram',
    'Yellayapalem',
  ],
  Allur: [
    'Allur Town',
    'Allurupeta',
    'Anathabotlavari Khandrika',
    'Batrakagollu',
    'Beeramgunta',
    'Gogulapalle',
    'Graddagunta',
    'Indupuru',
    'Isakapalle',
    'Kalambotlavari Khandrika',
    'North Amuluru',
    'North Mopuru',
    'Purini',
    'Singapeta',
    'Velicherla',
    'Westgogulapalli',
  ],
  Sydapuram: [
    'Adhvanna Punarayanakattubadi',
    'Ananthamadugu',
    'Chaganam',
    'Chaganam Rajupalem',
    'Cheekavolu',
    'Devaravemuru',
    'Edulakhandrika',
    'Eguva Marlapudi',
    'Griddalur',
    'Gulimcherla',
    'Jaflapuram',
    'Jogipalle',
    'Kalichedu',
    'Komatigunta Rajupalem',
    'Kommipadu',
    'Krishana Reddy Palle',
    'Linga Samuudram',
    'Linganapalem',
    'Malichedu',
    'Mittapalle',
    'Molakalapundla',
    'Munagapadu',
    'Nalabotlapalle',
    'Orupalle',
    'Palur',
    'Pathallapalle',
    'Perumallapadu',
    'Pokkandala',
    'Pothegunta',
    'Raganaramapuram',
    'Rajula Yerra Gunta Palem',
    'Samudralavari Khandrika',
    'Sydapuram Town',
    'Thippi Reddy Palle',
    'Thokalapudi',
    'Thummala Thalupur',
    'Tocham',
    'Turimerla',
    'Utukur',
    'Vemulachedu',
  ],
  Rapur: [
    'Adurupalle',
    'Akilavalasa',
    'Bandepalle',
    'Bojjanapalle',
    'Bojjanapalli',
    'Chuttupalem',
    'Gandurupalle',
    'Garimenapenta',
    'Gilakapadu',
    'Gonu Narasayapalem',
    'Gonupalle',
    'Gundavolu',
    'Gurivindapudi',
    'Jorepalle',
    'Jorepalle Akkamambapuram',
    'Kambhalapalle',
    'Kasulanativari Khandrika',
    'Khambhalapalle',
    'Koturupadu',
    'Lingapalem',
    'M.V.Puram',
    'Nayanipalle',
    'Nellepalle',
    'Pangili',
    'Penubarthi',
    'Penubarthi Gopasamudram',
    'Puligilapadu',
    'Rapur Town',
    'Raviguntapalle',
    'Sanayapalem',
    'Sankurathri Palle',
    'Sankurathripalle',
    'Siddavaram',
    'Suddamalla',
    'Tanamcherla',
    'Tegacharla',
    'Tegacherla',
    'Thatipalle',
    'Thokapalem',
    'Tumaya',
    'Veerayapalem',
    'Vepinapi',
    'Vepinapi Akkamambapuram',
    'Yepuru',
  ],
  Podalakur: [
    'Althurthi',
    'Ankupalle',
    'Ayyagaripalem',
    'Bathulapallepadu',
    'Bathulapalli',
    'Bhogasamudram',
    'Biradavolu',
    'Chatagotla',
    'Degapudi',
    'Duggunta',
    'Duggunta Rajupalem',
    'Guravayapalem',
    'Inukurthy',
    'Kanuparthi',
    'Mahammadapuram',
    'Marripalle Gopasamudram',
    'Marupuru',
    'Mogallur',
    'Mogalluru',
    'Nallapalem',
    'Nandivaya',
    'Navooru',
    'Nedurupalle',
    'Parlapalle',
    'Podalakur Town',
    'Prabagiripatnam',
    'Pulikollu',
    'R.Y.Palem',
    'Surayapalem',
    'Thatiparthi',
    'Thoderu',
    'Uchapalle',
    'Utla Palem',
    'Vavintaparthi',
    'Veligantipalem',
    'Viruvuru',
  ],
  Indukurpet: [
    'Gangapatnam',
    'Indukurpet Town',
    'Jangamvani Doruvu',
    'Koduruturu',
    'Komarika',
    'Korutur',
    'Kothuru Chinthopu',
    'Kudithipalem',
    'Lebur Bit – I',
    'Lebur Bit – II',
    'Mudivarthi Palem',
    'Mypadu',
    'Nidumusali',
    'Pallipadu',
    'Pogada Doruvu Khandrika',
    'Punnur',
    'Ramudu Palem',
    'Ravour',
    'Somarajupalle',
  ],
  'Thotapalli Gudur': [
    'Amulur',
    'Ananthapuram',
    'Chinna Cherukur',
    'Eduru - I',
    'Eduru - II',
    'Koduru',
    'Koduru Khandrika',
    'Kothapalem',
    'Mallikarjuna Puram',
    'Mandapam',
    'Mungaladoruvu',
    'Narukuru',
    'Peduru',
    'Potlapudi',
    'Sivarampuram',
    'Thotapalle',
    'Thotapalli Gudur Town',
    'Varakavipadu',
    'Varigonda',
    'Venkanapalem',
    'Vilukanipalle',
    'Vilukanipalli',
  ],
  Ananthasagaram: [
    'Amanichiruvella',
    'Ananthasagaram Town',
    'Bedusupalle',
    'Bommavaram',
    'Chapurallapalle',
    'Devarayapalle Bit- I',
    'Gowravaram',
    'Inagalur',
    'Kamireddypadu',
    'Kothapalli',
    'Lingammagunta',
    'Mangupalle',
    'Minagallu',
    'Mustapuram',
    'Padamati Kambhampadu',
    'Pathalapalle',
    'Revuru',
    'Somasila',
    'Tholijapuram',
    'Uppalapadu',
    'Varekuntapadu',
    'Vengampalli',
  ],
  Atmakur: ['Aravedu', 'Atmakur Town', 'Bandarupalle', 'Battepadu', 'Botikarlapadu', 'Boyila Chiruvella', 'Chiruvella Khandrika', 'Depuru', 'Gandlavedu', 'Jangalapalle', 'Kanupurupalle', 'Karatampadu', 'Mahimalur', 'Murugalla', 'Nabbinagaram', 'Nagulapadu', 'Nallapareddipalli', 'Narampeta', 'Narsapuram', 'Nellorepalem', 'Nuvvurupadu', 'Padakandla', 'Pamidipadu', 'Ramaswami Palli', 'Ravvalakollu', 'Vasili', 'Vennawada'],
  Chillakur: [
    'Addepalle',
    'Ankulapaturu',
    'Annambaka',
    'Ballavolu',
    'Budanam',
    'Chillakur Town',
    'Chinthavaram',
    'East Kanupuru',
    'Ippapudi',
    'Kadivedu',
    'Kalava Konda',
    'Momidi',
    'Muthyalapadu',
    'Mutyalapadu (Rural)',
    'Nakkalakalva Khandrika',
    'Nelaballi',
    'Oduru',
    'Palicherlavaripalem',
    'Pallamala',
    'Pallamala Khandrika',
    'Pentapadu',
    'Ponnavolu',
    'Thamminapatnam',
    'Theepanur',
    'Thikkavaram',
    'Thimmana Gaari Palem',
    'Thippaguntapalem',
    'Thonukumala',
    'Turpu Kanupur',
    'Udathavaripalem',
    'Udathavariparlapalle',
    'Vallipadu',
    'Varagali',
    'Vellapalem',
    'Yeruru',
    'Yogeswarunipall',
  ],
  Chejerla: [
    'Billupadu',
    'Chejerla Town',
    'Chittaluru',
    'Gollapalle',
    'Kakivaya',
    'Kalayapalem',
    'Kotitheertham',
    'Madapalli',
    'Maipativari Kandriga',
    'Mamuduru',
    'Nagula Vellaturu',
    'Nernuru',
    'Paderu',
    'Pathapadu',
    'Pelleru',
    'Perumallapadu',
    'Puttupalli',
    'Thimmayapalem',
    'Thurpupalli',
    'Turpu Khambhampadu',
    'Vavileru',
    'Yanamadala',
    'Yeturu',
  ],
  Gudur: [
    'Ayyavaripalem',
    'Chemidthi',
    'Chennuru – I',
    'Chennuru – II',
    'Gollapalle',
    'Guduru (East) (Og)',
    'Guduru (West) (Og)',
    'Gudur Town',
    'Kandali',
    'Kandra',
    'Kommaneturu',
    'Kondagunta',
    'Kundakuru',
    'Mangalapur',
    'Mekanur',
    'Mittathmakuru',
    'N. Sangameswaraswamy Khandrika',
    'Nellatur (Og) (Part)',
    'Nernur',
    'Pagadalapalli',
    'Palicherla',
    'Palicherlarajupalem',
    'Reddigunta',
    'Thimmasamudram',
    'Vedicherla',
    'Vendodu',
    'Vinduru',
  ],
  Kaluvoya: [
    'Baddevolu',
    'Brahmanapalle',
    'Cheepinapi',
    'China Gopavaram',
    'Chintalapalem',
    'Chintalatmakuru',
    'Dachuru',
    'Isakapalle',
    'Kaluvoya Town',
    'Kanupurupalle',
    'Kesamanenipalle',
    'Koturupalle',
    'Kulluru',
    'Madannagaripalle',
    'Nukana Palli',
    'Nukanapalle',
    'Pallakonda',
    'Peramakonda',
    'Telugurayapuram',
    'Thopugunta',
    'Uyyalapalle',
    'Uyyalapalli',
    'Yerraballe',
  ],
  Kota: [
    'Allampadu',
    'Chendodu',
    'Chittodu',
    'Gudali',
    'Illukurupadu',
    'Karlapudi',
    'Kesavaram',
    'Kota Town',
    'Kothapalem',
    'Kothapatnam',
    'Lakshmakka Khandriga @ Chembadipalem',
    'Maddali',
    'Nellore Palli Kotha Palem',
    'Nellorepalle',
    'Putchalapalle',
    'Rudravaram',
    'Siddavaram',
    'Thinnelapudi',
    'Uthama Nellore',
    'Vanjivaka',
  ],
  Marripadu: ['Allampadu', 'Bheemavaram', 'Brahmanapalle', 'Budawada', 'Chabolu', 'Chilakapadu', 'Chinamachanur', 'Chunchulur', 'Dharmarao Cheruvupalle', 'Irlapadu', 'Kadirinenipalle', 'Kampasamudram', 'Marripadu Town', 'Nagarajupadu', 'Naginenigunta', 'Nandavaram', 'Neradanampadu', 'Padamatinaidupalle', 'Pallavolu', 'Pegallapadu', 'Ponguru', 'Pongurukandriga', 'Ramanaidupalli', 'Singanapalle', 'Yepiligunta'],
  Vinjamur: ['Bukkapuram', 'Chakalakonda', 'Chandrapadia', 'Chinthalapalem', 'Gundemadakala', 'Janardhanapuram', 'Katepalle', 'Kistipuram', 'Nallagonda', 'Nandigunta', 'Ravipadu', 'Sankavaram', 'Thamidapadu', 'Utukuru', 'Vinjamur Town'],
}
const mandals = Object.keys(mandalVillages).sort()
const divisions = ['Atmakur', 'Gudur', 'Kavali', 'Nellore']
const atmakurDivisionMandals = ['Ananthasagaram', 'A.S.Peta', 'Atmakur', 'Chejerla', 'Kaluvoya', 'Marripadu', 'Sangam', 'Seetharamapuram', 'Udayagiri']
const gudurDivisionMandals = ['Chillakur', 'Gudur', 'Kota']
const kavaliDivisionMandals = ['Allur', 'Bogole', 'Dagadarthi', 'Duttalur', 'Jaladanki', 'Kaligiri', 'Kavali', 'Kodavalur', 'Kondapuram', 'Varikuntapadu', 'Vidavalur', 'Vinjamur']
const nelloreDivisionMandals = ['Buchireddypalem', 'Indukurpet', 'Kovur', 'Manubolu', 'Muthukur', 'Nellore Rural', 'Nellore Urban', 'Podalakur', 'Rapur', 'Sydapuram', 'Thotapalli Gudur', 'Venkatachalam']
const divisionMandals = {
  Atmakur: atmakurDivisionMandals,
  Gudur: gudurDivisionMandals,
  Kavali: kavaliDivisionMandals,
  Nellore: nelloreDivisionMandals,
}
const paymentScenarios = [
  { id: 'customer-to-app', label: 'Customer → Platform → Service Provider', methods: ['QR scan'] },
  { id: 'provider-to-app', label: 'Customer → Service Provider → Platform', methods: ['Cash in hand'] },
]
const formPaths = {
  admin: '/Admin',
  contact: '/ContactUs',
  customer: '/CustomerRequest',
  feedback: '/Feedback',
  labour: '/ServiceProviderRegistration',
  payment: '/PaymentExchange',
}
const adminViewPaths = {
  providers: '/Admin/ServiceProvidersManagement',
  payments: '/Admin/PaymentStatus',
  employers: '/Admin/Employers',
  'service-providers': '/Admin/ServiceProviders',
}
const registeredProfilesKey = 'worknear.registeredProfiles'
const activeProfileKey = 'worknear.activeProfile'
const resignationRequestsKey = 'worknear.resignationRequests'

function normalizeMobileNumber(mobile) {
  const digits = String(mobile || '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits
}

function readRegisteredProfiles() {
  try {
    const profiles = JSON.parse(window.localStorage.getItem(registeredProfilesKey) || '[]')
    return Array.isArray(profiles) ? profiles : []
  } catch {
    return []
  }
}

function readResignationRequests() {
  try {
    const requests = JSON.parse(window.localStorage.getItem(resignationRequestsKey) || '[]')
    return Array.isArray(requests) ? requests : []
  } catch {
    return []
  }
}

function readEmployerProfiles() {
  const resignationRequests = readResignationRequests().filter((request) => request?.accountType === 'Employer')
  return readRegisteredProfiles()
    .filter((profile) => profile?.profileType === 'Employer')
    .map((profile) => {
      const profileMobile = normalizeMobileNumber(profile?.mobile)
      const profileName = String(profile?.fullName || profile?.name || '').trim().toLocaleLowerCase()
      const hasResigned = resignationRequests.some((request) => {
        const requestMobile = normalizeMobileNumber(request?.mobile)
        if (profileMobile && requestMobile) return profileMobile === requestMobile
        return profileName && profileName === String(request?.fullName || '').trim().toLocaleLowerCase()
      })
      return {
        id: profileMobile || profileName || `${profile?.profileType}-${profile?.division || ''}-${profile?.mandal || ''}`,
        name: profile?.fullName || profile?.name || 'Employer',
        mobile: profile?.mobile || '',
        address: profile?.address || [profile?.village, profile?.mandal, profile?.division].filter(Boolean).join(', ') || 'Not provided yet',
        status: profile?.status === 'Resigned' || hasResigned ? 'Resigned' : 'Active',
      }
    })
}

function readActiveProfile() {
  try {
    return JSON.parse(window.localStorage.getItem(activeProfileKey) || 'null')
  } catch {
    return null
  }
}

function homePathForProfile(profileType) {
  if (profileType === 'Service Provider') return '/ServiceProviderHome'
  if (profileType === 'Admin') return '/Home'
  if (profileType === 'Employer') return '/EmployerHome'
  return '/CustomerHome'
}

function getRouteState(pathname = window.location.pathname) {
  const path = pathname.toLowerCase()
  if (path === '/signin') return { entryScreen: 'signin', activeForm: null, submitted: false, adminView: 'providers' }
  if (path === '/signup') return { entryScreen: 'signup', activeForm: null, submitted: false, adminView: 'providers' }
  if (path === '/signout') return { entryScreen: 'signout', activeForm: null, submitted: false, adminView: 'providers' }
  if (path === '/admin/paymentstatus') return { entryScreen: 'app', activeForm: 'admin', submitted: true, adminView: 'payments' }
  if (path === '/admin/employers') return { entryScreen: 'app', activeForm: 'admin', submitted: true, adminView: 'employers' }
  if (path === '/admin/serviceproviders') return { entryScreen: 'app', activeForm: 'admin', submitted: true, adminView: 'service-providers' }
  if (path === '/admin/serviceprovidersmanagement') return { entryScreen: 'app', activeForm: 'admin', submitted: true, adminView: 'providers' }
  if (path === '/admin') return { entryScreen: 'app', activeForm: 'admin', submitted: false, adminView: 'providers' }
  if (path === '/customerhome' || path === '/customer') return { entryScreen: 'app', activeForm: null, submitted: false, adminView: 'providers', profileAccountType: 'Customer' }
  if (path === '/serviceproviderhome' || path === '/serviceprovider') return { entryScreen: 'app', activeForm: null, submitted: false, adminView: 'providers', profileAccountType: 'Service Provider' }
  if (path === '/employerhome' || path === '/employer') return { entryScreen: 'app', activeForm: null, submitted: false, adminView: 'providers', profileAccountType: 'Employer' }

  const formRoute = Object.entries(formPaths).find(([, routePath]) => routePath.toLowerCase() === path)
  if (formRoute) return { entryScreen: 'app', activeForm: formRoute[0], submitted: false, adminView: 'providers' }
  if (path === '/home') return { entryScreen: 'app', activeForm: null, submitted: false, adminView: 'providers' }
  return { entryScreen: 'landing', activeForm: null, submitted: false, adminView: 'providers' }
}

function pushPath(path) {
  if (window.location.pathname !== path) window.history.pushState({}, '', path)
}

function getAppCommissionRate(amount) {
  return Number(amount) > 10000 ? 5 : 10
}

function App() {
  const initialRoute = useRef(getRouteState()).current
  const initialProfile = useRef(readActiveProfile()).current
  const [entryScreen, setEntryScreen] = useState(initialRoute.entryScreen)
  const [activeForm, setActiveForm] = useState(initialRoute.activeForm)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [serviceHistoryOpen, setServiceHistoryOpen] = useState(false)
  const [resignationDialogOpen, setResignationDialogOpen] = useState(false)
  const [resignationSubmitted, setResignationSubmitted] = useState(false)
  const [resignationError, setResignationError] = useState('')
  const [closeAccountDialogOpen, setCloseAccountDialogOpen] = useState(false)
  const [accountClosed, setAccountClosed] = useState(false)
  const [closeAccountError, setCloseAccountError] = useState('')
  const [wNPocketOpen, setWNPocketOpen] = useState(false)
  const [wNPocketBalance, setWNPocketBalance] = useState(0)
  const [wNPocketActivity, setWNPocketActivity] = useState([])
  const [initialPaymentScenario, setInitialPaymentScenario] = useState('customer-to-app')
  const [submitted, setSubmitted] = useState(initialRoute.submitted)
  const [signedIn, setSignedIn] = useState(Boolean(initialProfile))
  const [userProfile, setUserProfile] = useState(initialProfile)
  const [profileAccountType, setProfileAccountType] = useState(initialProfile?.profileType || initialRoute.profileAccountType || 'Service Provider')
  const [providerAvailability, setProviderAvailability] = useState('Active')
  const [acceptedServiceProvider, setAcceptedServiceProvider] = useState(null)
  const [adminInitialView, setAdminInitialView] = useState(initialRoute.adminView)
  const canAccessCustomerServices = !signedIn || ['Customer', 'Service Provider', 'Employer', 'Admin'].includes(profileAccountType)
  const canOpenProviderRegistration = !signedIn || profileAccountType === 'Service Provider'
  const canAccessPaymentExchange = !signedIn || ['Customer', 'Service Provider', 'Employer', 'Admin'].includes(profileAccountType)
  const canAccessContactFeedback = !signedIn || ['Customer', 'Service Provider', 'Employer', 'Admin'].includes(profileAccountType)
  const canViewEmployerDirectories = signedIn && profileAccountType === 'Employer'
  const canViewServiceHistory = !signedIn || ['Customer', 'Service Provider', 'Admin', 'Employer'].includes(profileAccountType)
  const canAccessWNPocket = signedIn && profileAccountType === 'Service Provider'
  const canCloseAccount = signedIn && ['Customer', 'Service Provider'].includes(profileAccountType)
  const showProfilePanel = profileOpen
    || (signedIn && profileAccountType === 'Service Provider' && Boolean(userProfile?.incomingServiceRequest))
    || (signedIn && profileAccountType === 'Customer' && Boolean(acceptedServiceProvider || userProfile?.acceptedServiceProvider))

  const applyRouteState = (routeState) => {
    setEntryScreen(routeState.entryScreen)
    setActiveForm(routeState.activeForm)
    setSubmitted(routeState.submitted)
    setAdminInitialView(routeState.adminView)
    if (routeState.profileAccountType) setProfileAccountType(routeState.profileAccountType)
    setMenuOpen(false)
    setProfileOpen(false)
  }

  const navigateTo = (path) => {
    pushPath(path)
    applyRouteState(getRouteState(path))
  }

  const openForm = (form, paymentScenario = 'customer-to-app') => {
    if (form === 'customer' && !canAccessCustomerServices) return
    if (form === 'labour' && !canOpenProviderRegistration) return
    if (form === 'payment' && !canAccessPaymentExchange) return
    if ((form === 'contact' || form === 'feedback') && !canAccessContactFeedback) return
    if (form === 'admin' && signedIn && profileAccountType !== 'Admin') return
    if (form === 'payment') setInitialPaymentScenario(paymentScenario)
    pushPath(formPaths[form] || '/Home')
    if (form === 'customer') setAcceptedServiceProvider(null)
    setSubmitted(false)
    setActiveForm(form)
    setEntryScreen('app')
    setMenuOpen(false)
    setProfileOpen(false)
  }

  const recordCashInHandPayment = ({ amount, customerName }) => {
    if (!canAccessWNPocket) return
    const serviceAmount = Number(amount)
    const feeAmount = Number((serviceAmount * getAppCommissionRate(serviceAmount) / 100).toFixed(2))
    if (serviceAmount <= 0 || feeAmount <= 0) return
    setWNPocketBalance((balance) => Number((balance - feeAmount).toFixed(2)))
    setWNPocketActivity((activity) => [{
      id: `cash-fee-${Date.now()}`,
      customerName,
      serviceAmount,
      feeAmount,
      createdAt: new Date().toISOString(),
    }, ...activity])
  }

  const openResignationDialog = () => {
    if (!signedIn || profileAccountType !== 'Employer') return
    setResignationSubmitted(false)
    setResignationError('')
    setResignationDialogOpen(true)
  }

  const closeResignationDialog = () => {
    setResignationDialogOpen(false)
    setResignationSubmitted(false)
    setResignationError('')
  }

  const submitResignationRequest = () => {
    if (!signedIn || profileAccountType !== 'Employer') return
    let existingRequests = []
    try {
      const parsedRequests = JSON.parse(window.localStorage.getItem(resignationRequestsKey) || '[]')
      existingRequests = Array.isArray(parsedRequests) ? parsedRequests : []
    } catch {
      existingRequests = []
    }

    const request = {
      id: `resignation-${Date.now()}`,
      fullName: userProfile?.fullName || '',
      mobile: userProfile?.mobile || '',
      accountType: profileAccountType,
      status: 'Pending review',
      submittedAt: new Date().toISOString(),
    }
    try {
      window.localStorage.setItem(resignationRequestsKey, JSON.stringify([...existingRequests, request]))
      setResignationError('')
      setResignationSubmitted(true)
    } catch {
      setResignationError('Unable to submit your request right now. Please try again.')
    }
  }

  const openCloseAccountDialog = () => {
    setAccountClosed(false)
    setCloseAccountError('')
    setCloseAccountDialogOpen(true)
  }

  const closeCloseAccountDialog = () => {
    const wasClosed = accountClosed
    setCloseAccountDialogOpen(false)
    setAccountClosed(false)
    setCloseAccountError('')
    if (wasClosed) navigateTo('/')
  }

  const confirmCloseAccount = () => {
    if (!canCloseAccount) return
    let originalRegisteredProfiles = null
    try {
      originalRegisteredProfiles = window.localStorage.getItem(registeredProfilesKey)
      const parsedProfiles = JSON.parse(originalRegisteredProfiles || '[]')
      const registeredProfiles = Array.isArray(parsedProfiles) ? parsedProfiles : []
      const mobileKey = normalizeMobileNumber(userProfile?.mobile)
      const fullName = String(userProfile?.fullName || '').trim().toLocaleLowerCase()
      const remainingProfiles = registeredProfiles.filter((profile) => {
        const registeredMobileKey = normalizeMobileNumber(profile.mobile)
        if (mobileKey && registeredMobileKey) return registeredMobileKey !== mobileKey
        return !fullName || profile.profileType !== profileAccountType || String(profile.fullName || '').trim().toLocaleLowerCase() !== fullName
      })

      window.localStorage.setItem(registeredProfilesKey, JSON.stringify(remainingProfiles))
      window.localStorage.removeItem(activeProfileKey)
      setUserProfile(null)
      setSignedIn(false)
      setProfileOpen(false)
      setCloseAccountError('')
      setAccountClosed(true)
    } catch {
      if (originalRegisteredProfiles !== null) {
        try { window.localStorage.setItem(registeredProfilesKey, originalRegisteredProfiles) } catch { /* Keep the account closure failure visible if storage cannot be restored. */ }
      }
      setCloseAccountError('Unable to close your account right now. Please try again.')
    }
  }

  const closeForm = () => {
    pushPath(signedIn ? homePathForProfile(profileAccountType) : '/Home')
    setSubmitted(false)
    setActiveForm(null)
  }

  const completeAuthentication = (authData) => {
    const enteredProfile = authData.profile
    let authenticatedProfile = enteredProfile
    const registeredProfiles = readRegisteredProfiles()

    if (authData.mode === 'signup') {
      authenticatedProfile = { ...enteredProfile, profileType: enteredProfile.profileType || 'Customer' }
      const mobileKey = normalizeMobileNumber(authenticatedProfile.mobile)
      if (mobileKey) {
        const nextProfiles = registeredProfiles.filter((profile) => normalizeMobileNumber(profile.mobile) !== mobileKey)
        nextProfiles.push(authenticatedProfile)
        try { window.localStorage.setItem(registeredProfilesKey, JSON.stringify(nextProfiles)) } catch { /* Keep the active development session usable when storage is unavailable. */ }
      }
    } else {
      const mobileKey = normalizeMobileNumber(enteredProfile.mobile)
      authenticatedProfile = registeredProfiles.find((profile) => normalizeMobileNumber(profile.mobile) === mobileKey) || {
        ...enteredProfile,
        profileType: 'Customer',
      }
    }

    try { window.localStorage.setItem(activeProfileKey, JSON.stringify(authenticatedProfile)) } catch { /* Keep the active development session usable when storage is unavailable. */ }
    setUserProfile(authenticatedProfile)
    setProfileAccountType(authenticatedProfile.profileType)
    setSignedIn(true)
    navigateTo(homePathForProfile(authenticatedProfile.profileType))
  }

  const clearSession = () => {
    try { window.localStorage.removeItem(activeProfileKey) } catch { /* Ignore storage failures during sign out. */ }
    setUserProfile(null)
    setSignedIn(false)
  }

  const handleAdminSuccess = () => {
    setAdminInitialView('providers')
    pushPath(adminViewPaths.providers)
  }

  const handleAdminViewChange = (view) => {
    setAdminInitialView(view)
    pushPath(adminViewPaths[view] || adminViewPaths.providers)
  }

  const handleHomeSignOut = () => {
    clearSession()
    navigateTo('/')
  }

  useEffect(() => {
    const handlePopState = () => applyRouteState(getRouteState())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (entryScreen === 'landing') return <WelcomeScreen onSignIn={() => navigateTo('/SignIn')} onSignUp={() => navigateTo('/SignUp')} />
  if (entryScreen === 'signout') return <SignOutScreen onHome={() => navigateTo('/')} onSignIn={() => navigateTo('/SignIn')} />
  if (entryScreen === 'signin' || entryScreen === 'signup') return <SignInFlow mode={entryScreen} onBack={() => navigateTo('/')} onSuccess={completeAuthentication} />

  const canAccessAdmin = !signedIn || profileAccountType === 'Admin'
  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="WorkNear home">
          <span className="brand-mark"><img src="/src/WN_Logo.png" alt="" /></span>
          <span>WorkNear</span>
        </a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          <a href="#categories" onClick={() => setMenuOpen(false)}>Find services</a>
          <button className="nav-cta" onClick={() => openForm('labour')} disabled={!canOpenProviderRegistration} aria-disabled={!canOpenProviderRegistration} title={!canOpenProviderRegistration ? 'Service provider registration is unavailable for this profile.' : undefined}>Join as a service provider</button>
          {canViewServiceHistory && <button className="nav-cta" onClick={() => { setServiceHistoryOpen(true); setMenuOpen(false); setProfileOpen(false) }}>Service history</button>}
          {canViewEmployerDirectories && <>
            <a className="nav-section-link" href="#approved-customer-requests" onClick={() => setMenuOpen(false)}>Approved Customer Requests</a>
          </>}
          {canAccessAdmin && <button className="text-button" onClick={() => openForm('admin')}>Admin</button>}
          <button className="nav-cta contact-cta" onClick={() => openForm('contact')} disabled={!canAccessContactFeedback} aria-disabled={!canAccessContactFeedback} title={!canAccessContactFeedback ? 'Contact Us is unavailable for Admin profiles.' : undefined}>Contact us</button>
          <button className="nav-cta feedback-cta" onClick={() => openForm('feedback')} disabled={!canAccessContactFeedback} aria-disabled={!canAccessContactFeedback} title={!canAccessContactFeedback ? 'Feedback is unavailable for Admin profiles.' : undefined}>Feedback</button>
          {canAccessWNPocket && <button className="nav-cta wnpocket-nav-link" type="button" onClick={() => { setWNPocketOpen(true); setMenuOpen(false); setProfileOpen(false) }}>WNPocket</button>}
          {canCloseAccount && <button className="nav-cta nav-close-account" type="button" onClick={() => { openCloseAccountDialog(); setMenuOpen(false) }}>Close Account</button>}
        </nav>
        <div className="profile-area">
          {signedIn && profileAccountType === 'Employer' && <button className="profile-resign" type="button" onClick={openResignationDialog}>Resign</button>}
          <button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen} aria-controls="profile-panel">
            <span className="profile-trigger-avatar"><UserRound size={17} /></span>
            <span className="profile-trigger-copy"><strong>{signedIn ? 'My profile' : 'Profile'}</strong><small>{signedIn ? 'Signed in' : 'View details'}</small></span>
            <ChevronDown size={16} className={profileOpen ? 'profile-chevron open' : 'profile-chevron'} />
          </button>
          <button className="profile-signout" onClick={handleHomeSignOut}>Sign out</button>
          {showProfilePanel && <ProfilePanel key={profileAccountType} accountType={profileAccountType} profile={userProfile} availability={providerAvailability} onAvailabilityChange={setProviderAvailability} onClose={() => setProfileOpen(false)} incomingServiceRequest={userProfile?.incomingServiceRequest} acceptedServiceProvider={profileAccountType === 'Customer' ? acceptedServiceProvider || userProfile?.acceptedServiceProvider : null} onAcceptServiceRequest={() => { setAcceptedServiceProvider({ name: userProfile?.fullName || 'Service Provider', address: userProfile?.address || [userProfile?.village, userProfile?.mandal, userProfile?.division].filter(Boolean).join(', ') || 'Address not provided' }); setUserProfile((current) => current ? { ...current, incomingServiceRequest: null } : current) }} onCancelServiceRequest={() => setUserProfile((current) => current ? { ...current, incomingServiceRequest: null } : current)} onCloseAcceptedServiceRequest={() => { setAcceptedServiceProvider(null); setUserProfile((current) => current ? { ...current, acceptedServiceProvider: null } : current) }} />}
        </div>
      </header>

      <div className="page-layout">
        <section className="category-section" id="categories">
          <div className="service-area"><p className="eyebrow">Service area</p><p>SPSR Nellore District, Andhra Pradesh</p></div>
          <div className="section-heading"><div><h2>All services</h2></div></div>
          <div className="category-grid">
            {categories.map((category) => <button className="category-card" key={category.name} onClick={() => openForm('customer')} disabled={!canAccessCustomerServices} aria-disabled={!canAccessCustomerServices}><span className="category-icon">{category.icon}</span><span className="category-name">{category.name}</span><ArrowRight className="card-arrow" size={17} /></button>)}
          </div>
        </section>

        <div className="main-content">
          <section className="hero" id="top">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-dot" />Required Services Near You</p>
              <h1>Useful hands,<br /><em>right nearby.</em></h1>
              <p className="hero-description">A simple local board for finding capable help and sharing the work you know best, one practical job at a time.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => openForm('customer')} disabled={!canAccessCustomerServices} aria-disabled={!canAccessCustomerServices}>Ask a Service<ArrowRight size={18} /></button>
                <button className="secondary-button" onClick={() => openForm('labour')} disabled={!canOpenProviderRegistration} aria-disabled={!canOpenProviderRegistration} title={!canOpenProviderRegistration ? 'Service provider registration is unavailable for this profile.' : undefined}>Service Provider<img className="service-provider-icon" src="/src/Service_Provider_Img.png" alt="" /></button>
              </div>
              <div className="payment-panel">
                <p className="eyebrow">Secure settlement</p>
                <button className="payment-button" onClick={() => openForm('payment')} disabled={!canAccessPaymentExchange} aria-disabled={!canAccessPaymentExchange} title={!canAccessPaymentExchange ? 'Payment exchange is unavailable for this profile.' : undefined}>Payment Exchange</button>
                <span>Track customer payment, service provider payout instantly.</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="image-frame">
                <img src="/src/Workers.png" alt="Local workers preparing tools for a repair" />
              </div>
            </div>
          </section>

          {canViewEmployerDirectories && <HomeDirectorySections />}
      <footer><span>© {new Date().getFullYear()} WorkNear</span><span>A small board for useful work</span></footer>
        </div>
      </div>

      {activeForm && !(activeForm === 'customer' && !canAccessCustomerServices) && !(activeForm === 'labour' && !canOpenProviderRegistration) && !(activeForm === 'payment' && !canAccessPaymentExchange) && !((activeForm === 'contact' || activeForm === 'feedback') && !canAccessContactFeedback) && !(activeForm === 'admin' && !canAccessAdmin) && <RegistrationModal type={activeForm} submitted={submitted} setSubmitted={setSubmitted} requesterProfile={userProfile} onSignedIn={() => { setSignedIn(true); if (!signedIn && activeForm === 'customer') setProfileAccountType('Customer') }} onClose={closeForm} initialAdminView={adminInitialView} initialPaymentScenario={initialPaymentScenario} onCashInHandPaymentComplete={recordCashInHandPayment} onAdminSuccess={handleAdminSuccess} onAdminViewChange={handleAdminViewChange} />}
      {serviceHistoryOpen && <ServiceHistoryModal accountType={profileAccountType} onClose={() => setServiceHistoryOpen(false)} />}
      {resignationDialogOpen && <ResignationConfirmationModal accountType={profileAccountType} submitted={resignationSubmitted} error={resignationError} onConfirm={submitResignationRequest} onClose={closeResignationDialog} />}
      {closeAccountDialogOpen && <CloseAccountConfirmationModal closed={accountClosed} error={closeAccountError} onConfirm={confirmCloseAccount} onClose={closeCloseAccountDialog} />}
      {wNPocketOpen && canAccessWNPocket && <WNPocketModal profile={userProfile} balance={wNPocketBalance} activity={wNPocketActivity} onOpenCashInHandPayment={() => { setWNPocketOpen(false); openForm('payment', 'provider-to-app') }} onClose={() => setWNPocketOpen(false)} />}
    </main>
  )
}

function HomeDirectorySections() {
  return <div className="home-directory-sections">
    <section className="home-directory-section" id="approved-customer-requests" aria-labelledby="approved-customer-requests-title">
      <div className="home-directory-heading">
        <p className="eyebrow">Approved work</p>
        <h2 id="approved-customer-requests-title">Approved Customer Requests</h2>
        <p>Approved requests and the Service Provider assigned to each one.</p>
      </div>
      <ApprovedCustomerRequestsTable />
    </section>
  </div>
}

function ApprovedCustomerRequestsTable() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'customer', direction: 'asc' })
  const columns = [
    { key: 'customer', label: 'Customer Name' },
    { key: 'customerMobile', label: 'Customer Mobile Number' },
    { key: 'address', label: 'Address' },
    { key: 'status', label: 'Approved Service Status' },
    { key: 'provider', label: 'Service Provider Name' },
    { key: 'providerMobile', label: 'Service Provider Mobile Number' },
  ]
  const searchText = search.trim().toLocaleLowerCase()
  const searchDigits = search.replace(/\D/g, '')
  const filteredRequests = approvedCustomerRequests.filter((request) => (
    request.customer.toLocaleLowerCase().includes(searchText)
    || (searchDigits && request.customerMobile.replace(/\D/g, '').includes(searchDigits))
  ))
  const sortedRequests = [...filteredRequests].sort((first, second) => {
    const comparison = String(first[sort.key] || '').localeCompare(String(second[sort.key] || ''), 'en', { numeric: true, sensitivity: 'base' })
    return sort.direction === 'asc' ? comparison : -comparison
  })
  const toggleSort = (key) => setSort((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }))

  return <div className="approved-requests-table-wrap">
    <div className="approved-requests-search">
      <label htmlFor="approved-customer-request-search">Search by Customer Name or Customer Mobile Number</label>
      <input id="approved-customer-request-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Enter a customer name or mobile number" />
    </div>
    <table className="approved-requests-table">
      <thead><tr>{columns.map((column) => <th key={column.key} scope="col" aria-sort={sort.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <button type="button" className="approved-requests-sort-button" onClick={() => toggleSort(column.key)} aria-label={`Sort by ${column.label} ${sort.key === column.key && sort.direction === 'asc' ? 'descending' : 'ascending'}`}>
          <span>{column.label}</span><span className="approved-requests-sort-indicator" aria-hidden="true">{sort.key === column.key ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
        </button>
      </th>)}</tr></thead>
      <tbody>{sortedRequests.length ? sortedRequests.map((request) => <tr key={request.id}>
        <td><strong>{request.customer}</strong></td>
        <td>{request.customerMobile}</td>
        <td>{request.address}</td>
        <td>{request.status}</td>
        <td>{request.provider}</td>
        <td>{request.providerMobile}</td>
      </tr>) : <tr><td className="approved-requests-empty" colSpan={columns.length}>No approved customer requests match “{search}”.</td></tr>}</tbody>
    </table>
  </div>
}

function WelcomeScreen({ onSignIn, onSignUp }) {
  return <main className="welcome-screen">
    <div className="welcome-content">
      <h1><span>WN</span><b>|</b><span>Work<br />Near</span></h1>
      <p className="welcome-links">Already existing user <a href="#sign-in" onClick={(event) => { event.preventDefault(); onSignIn() }}>Sign in</a></p>
      <p className="welcome-links">New user <a href="#sign-up" onClick={(event) => { event.preventDefault(); onSignUp() }}>Sign up</a></p>
    </div>
  </main>
}

function SignOutScreen({ onHome, onSignIn }) {
  return <main className="welcome-screen">
    <div className="welcome-content">
      <h1><span>WN</span><b>|</b><span>Work<br />Near</span></h1>
      <p className="welcome-links">You have signed out.</p>
      <p className="welcome-links"><a href="/" onClick={(event) => { event.preventDefault(); onHome() }}>Back to home</a></p>
      <p className="welcome-links"><a href="/SignIn" onClick={(event) => { event.preventDefault(); onSignIn() }}>Sign in again</a></p>
    </div>
  </main>
}

function SignInFlow({ mode, onBack, onSuccess }) {
  const [fullName, setFullName] = useState('')
  const [selectedDivision, setSelectedDivision] = useState('')
  const [selectedMandal, setSelectedMandal] = useState('')
  const [selectedVillage, setSelectedVillage] = useState('')
  const [selectedProfileType, setSelectedProfileType] = useState('Customer')
  const [mobile, setMobile] = useState('')
  const [signupStep, setSignupStep] = useState('profile')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const availableMandals = divisionMandals[selectedDivision] || mandals
  const availableVillages = mandalVillages[selectedMandal] || []
  const isAdminEmployerSignup = mode === 'signup' && signupStep !== 'profile'
  const isAdminEmployerVerification = isAdminEmployerSignup && signupStep === 'verification'

  const handleSubmit = (event) => {
    event.preventDefault()
    if (mode === 'signup' && signupStep === 'credentials') {
      const passwordIsValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,16}$/.test(adminPassword)
      if (!passwordIsValid) {
        setPasswordError('Use 8–16 characters with at least one letter, one number, and one special character.')
        return
      }
      setPasswordError('')
      setGeneratedOtp(String(Math.floor(100000 + Math.random() * 900000)))
      setOtp('')
      setOtpError('')
      setSignupStep('verification')
      return
    }
    if (isAdminEmployerVerification) {
      if (otp !== generatedOtp) {
        setOtpError('The OTP does not match. Enter the development OTP shown above.')
        return
      }
      onSuccess({
        mode,
        profile: { fullName, mobile, division: selectedDivision, mandal: selectedMandal, village: selectedVillage, profileType: selectedProfileType, email: adminEmail },
      })
      return
    }
    if (!generatedOtp) {
      const nextOtp = String(Math.floor(100000 + Math.random() * 900000))
      setGeneratedOtp(nextOtp)
      setOtp('')
      return
    }
    if (otp !== generatedOtp) {
      setOtpError('Enter the demo OTP shown above.')
      return
    }
    onSuccess({
      mode,
      profile: {
        fullName,
        mobile,
        division: selectedDivision,
        mandal: selectedMandal,
        village: selectedVillage,
        profileType: mode === 'signup' ? selectedProfileType : undefined,
      },
    })
  }

  const handleBack = () => {
    if (mode === 'signup' && signupStep === 'verification') {
      setSignupStep('credentials')
      setGeneratedOtp('')
      setOtp('')
      setOtpError('')
      return
    }
    if (mode === 'signup' && signupStep === 'credentials') {
      setSignupStep('profile')
      setPasswordError('')
      return
    }
    if (generatedOtp) {
      setGeneratedOtp('')
      setOtp('')
      setOtpError('')
      return
    }
    onBack()
  }

  return <main className="signin-screen">
    <section className="signin-panel">
      <h1>{isAdminEmployerVerification ? 'OTP Verification' : signupStep === 'credentials' ? 'Sign up' : generatedOtp ? 'Verify OTP' : mode === 'signup' ? 'Sign up' : 'Sign in'}</h1>
      <p className="signin-intro">{isAdminEmployerVerification ? `Development OTP for ${adminEmail}: ${generatedOtp}` : signupStep === 'credentials' ? 'Create an Admin or Employer account with your email address and password.' : generatedOtp ? `Development OTP for ${mobile || 'this test session'}: ${generatedOtp}` : 'Choose a service to continue to the local work board.'}</p>
      <form onSubmit={handleSubmit}>
        {signupStep === 'credentials' ? <>
          <label>Email Address<input type="email" autoComplete="email" required value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} placeholder="Enter your email address" /></label>
          <label>Password<input type="password" autoComplete="new-password" required minLength={8} maxLength={16} value={adminPassword} onChange={(event) => { setAdminPassword(event.target.value); setPasswordError('') }} placeholder="Create a password" /><small className="password-requirements">8–16 characters, including a letter, a number, and a special character.</small>{passwordError && <small className="otp-error">{passwordError}</small>}</label>
        </> : !generatedOtp && <>
          {mode === 'signup' && <>
            <label>Full Name<input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Enter your full name" /></label>
          </>}
          <label>Mobile Number<input type="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="Enter mobile number" /></label>
          {mode === 'signup' && <>
            <label>Division<select value={selectedDivision} onChange={(event) => { setSelectedDivision(event.target.value); setSelectedMandal(''); setSelectedVillage('') }}><option value="">Select a division</option>{divisions.map((division) => <option key={division} value={division}>{division}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
            <label>Mandal<select value={selectedMandal} onChange={(event) => { setSelectedMandal(event.target.value); setSelectedVillage('') }}><option value="">Select a mandal</option>{availableMandals.map((mandal) => <option key={mandal} value={mandal}>{mandal}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
            <label>Village / Locality<select value={selectedVillage} disabled={!selectedMandal || availableVillages.length === 0} onChange={(event) => setSelectedVillage(event.target.value)}><option value="">{selectedMandal && availableVillages.length === 0 ? 'No village options available' : 'Select a village / locality'}</option>{availableVillages.map((village) => <option key={village} value={village}>{village}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
            <label>Profile Type<select value={selectedProfileType} onChange={(event) => setSelectedProfileType(event.target.value)}><option>Customer</option><option>Service Provider</option><option>Admin</option><option>Employer</option></select><ChevronDown className="select-icon" size={16} /></label>
          </>}
        </>}
        {generatedOtp && <label>{isAdminEmployerVerification ? 'One-time password' : 'One-time password'}<input autoFocus type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" required value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, '')); setOtpError('') }} placeholder="Enter 6-digit OTP" />{otpError && <small className="otp-error">{otpError}</small>}</label>}
        <button className="primary-button form-submit" type="submit" disabled={mode === 'signup' && signupStep === 'profile' && !generatedOtp && ['Admin', 'Employer'].includes(selectedProfileType)}>{generatedOtp ? 'Verify OTP' : 'Continue to OTP'} <ArrowRight size={18} /></button>
        <div className="signin-footer-actions">
          <button className="signin-back" type="button" onClick={handleBack}>← Back</button>
          {mode === 'signup' && signupStep === 'profile' && !generatedOtp && <button className="admin-employer-signup" type="button" disabled={!['Admin', 'Employer'].includes(selectedProfileType)} onClick={() => setSignupStep('credentials')}>Admin or Employer Sign up →</button>}
        </div>
      </form>
    </section>
  </main>
}

function ProfilePanel({ accountType, profile, availability, onAvailabilityChange, onClose, incomingServiceRequest = null, acceptedServiceProvider = null, onAcceptServiceRequest, onCancelServiceRequest, onCloseAcceptedServiceRequest }) {
  const role = accountType || 'Customer'
  const isProvider = role === 'Service Provider'
  const isCustomer = role === 'Customer'
  const name = profile?.fullName || (isProvider ? 'Service Provider' : isCustomer ? 'Customer' : role)
  const mobile = profile?.mobile || 'Mobile number not provided'
  const [serviceAmount, setServiceAmount] = useState('')
  const [serviceOfferStatus, setServiceOfferStatus] = useState('pending')
  const [requestSoundEnabled, setRequestSoundEnabled] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState(() => typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'unsupported')
  const [image, setImage] = useState(accountType === 'Service Provider' ? '/src/Service_Provider_Img.png' : '/src/Workers.png')
  const fallbackImage = isProvider ? '/src/Service_Provider_Img.png' : '/src/Workers.png'

  const enableDeviceNotifications = async () => {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported')
      return
    }
    try { setNotificationPermission(await window.Notification.requestPermission()) } catch { setNotificationPermission('denied') }
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result)
    reader.readAsDataURL(file)
  }

  return <section className="profile-panel" id="profile-panel" aria-label="Profile details">
    <div className="profile-panel-heading"><div><p className="eyebrow">Your account</p><h2>Profile details</h2></div><div className="profile-panel-actions"><button className="profile-close" onClick={onClose} aria-label="Close profile"><X size={17} /></button></div></div>
    <div className="profile-preview">
      <div className="profile-avatar-wrap">
        <img src={image || fallbackImage} alt={`${role} profile`} />
        <label className="profile-image-edit" title="Change profile image">
          <Pencil size={13} aria-hidden="true" />
          <input type="file" accept="image/*" aria-label="Change profile image" onChange={handleImageChange} />
        </label>
      </div>
      <div><strong>{name || 'Your name'}</strong><span>{role}</span><small>{mobile || 'Mobile Number'}</small></div>
    </div>
    <div className="profile-fields">
      {isProvider && <label>Request accept status<select value={availability} onChange={(event) => onAvailabilityChange(event.target.value)}><option>Active</option><option>Inactive</option></select><ChevronDown className="select-icon" size={16} /></label>}
      {(isProvider || isCustomer) && <ProfileRequestActions role={role} serviceAmount={serviceAmount} onServiceAmountChange={setServiceAmount} serviceOfferStatus={serviceOfferStatus} onServiceOfferStatusChange={setServiceOfferStatus} />}
    </div>
    {isProvider && <>
      <section className="incoming-request-empty" aria-live="polite"><strong>Incoming service requests</strong><p>When a request is assigned to you, an alert will show the Customer Name and Customer Address here.</p></section>
      <section className="provider-alert-preferences" aria-label="Service request notifications">
        <strong>Request notifications</strong>
        <label><input type="checkbox" checked={requestSoundEnabled} onChange={(event) => setRequestSoundEnabled(event.target.checked)} /> Play an alert sound for new requests</label>
        <button type="button" onClick={enableDeviceNotifications} disabled={notificationPermission === 'granted'}>{notificationPermission === 'granted' ? 'Device notifications enabled' : 'Enable device notifications'}</button>
        {notificationPermission === 'denied' && <small>Notifications are blocked in browser settings.</small>}
        {notificationPermission === 'unsupported' && <small>Device notifications are not supported in this browser.</small>}
      </section>
    </>}
    <div className={isProvider && availability === 'Active' ? 'availability-note active' : 'availability-note'}><span className="status-dot" />{isProvider ? availability === 'Active' ? 'Accepting new service requests' : 'Not accepting service requests' : isCustomer ? 'Customer profile ready' : `${role} profile active`}</div>
    {isProvider && incomingServiceRequest && <ProviderIncomingRequestModal request={incomingServiceRequest} playSound={requestSoundEnabled} onAccept={onAcceptServiceRequest} onCancel={onCancelServiceRequest} />}
    {isCustomer && acceptedServiceProvider && <CustomerProviderAcceptedModal provider={acceptedServiceProvider} onClose={onCloseAcceptedServiceRequest} />}
  </section>
}

function WNPocketModal({ profile, balance, activity, onOpenCashInHandPayment, onClose }) {
  const [verified, setVerified] = useState(false)
  const [demoOtp, setDemoOtp] = useState('')
  const [enteredOtp, setEnteredOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [activeView, setActiveView] = useState('overview')
  const [amount, setAmount] = useState('')
  const [paymentApp, setPaymentApp] = useState('PhonePe')
  const [actionMessage, setActionMessage] = useState('')
  const mobileDigits = String(profile?.mobile || '').replace(/\D/g, '')
  const maskedMobile = mobileDigits.length >= 4 ? `•••• ••• ${mobileDigits.slice(-4)}` : 'your registered mobile number'
  const amountValue = Number(amount) || 0
  const formatWalletAmount = (value) => `${value < 0 ? '-' : ''}₹${Math.abs(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  const sendDemoOtp = () => {
    setDemoOtp(String(Math.floor(100000 + Math.random() * 900000)))
    setEnteredOtp('')
    setOtpError('')
  }

  const verifyDemoOtp = (event) => {
    event.preventDefault()
    if (enteredOtp !== demoOtp) {
      setOtpError('The code does not match. Please try again.')
      return
    }
    setVerified(true)
    setOtpError('')
  }

  const selectView = (view) => {
    setActiveView(view)
    setAmount('')
    setActionMessage('')
  }

  const startExternalPayment = (event) => {
    event.preventDefault()
    setActionMessage(`${paymentApp} payment connection is a preview. No payment has been started.`)
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal wnpocket-modal" role="dialog" aria-modal="true" aria-labelledby="wnpocket-title">
      <button className="close-button" type="button" onClick={onClose} aria-label="Close WNPocket"><X size={20} /></button>
      <div className="wnpocket-heading">
        <div><p className="eyebrow">Service Provider Wallet</p><h2 id="wnpocket-title">WNPocket</h2></div>
      </div>
      {!verified ? <div className="wnpocket-otp-panel">
        <h3>Verify your mobile to view your balance</h3>
        <p>A one-time code will be sent to {maskedMobile} when SMS verification is connected.</p>
        {!demoOtp ? <button className="primary-button" type="button" onClick={sendDemoOtp}>Preview mobile OTP</button> : <form className="wnpocket-form" onSubmit={verifyDemoOtp}>
          <label>Mobile OTP<input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" required value={enteredOtp} onChange={(event) => { setEnteredOtp(event.target.value.replace(/\D/g, '')); setOtpError('') }} placeholder="Enter 6-digit code" /></label>
          <p className="wnpocket-demo-code">Demo OTP: <strong>{demoOtp}</strong></p>
          <button className="primary-button" type="submit">Verify and view wallet</button>
          {otpError && <p className="wnpocket-error" role="alert">{otpError}</p>}
        </form>}
        <p className="wnpocket-preview-note">UI preview only: this code is generated in the browser. Real SMS delivery and server-side OTP verification are required for secure access.</p>
      </div> : <>
        <div className="wnpocket-balance-card">
          <span>Preview available balance</span>
          <strong>{formatWalletAmount(balance)}</strong>
          <small>{balance < 0 ? 'Cash-in-Hand platform fees are reflected in this local preview balance.' : 'Live wallet balances will appear after the wallet service is connected.'}</small>
        </div>
        <nav className="wnpocket-tabs" aria-label="WNPocket actions">
          {[['overview', 'Overview'], ['top-up', 'Top up'], ['withdraw', 'Withdraw'], ['cash-in-hand', 'Cash-in-Hand fees']].map(([view, label]) => <button key={view} type="button" className={activeView === view ? 'active' : ''} aria-pressed={activeView === view} onClick={() => selectView(view)}>{label}</button>)}
        </nav>
        {activeView === 'overview' && <div className="wnpocket-content">
          <section className="wnpocket-info-card"><h3>Wallet activity</h3>{activity.length === 0 ? <p className="wnpocket-empty">No wallet transactions are available yet.</p> : <div className="wnpocket-activity-list">{activity.map((transaction) => <article className="wnpocket-activity-item" key={transaction.id}><div><strong>Cash-in-Hand platform fee</strong><span>Service amount {formatWalletAmount(transaction.serviceAmount)}{transaction.customerName ? ` · ${transaction.customerName}` : ''}</span><time dateTime={transaction.createdAt}>{new Date(transaction.createdAt).toLocaleString()}</time></div><strong className="wnpocket-activity-debit">-{formatWalletAmount(transaction.feeAmount)}</strong></article>)}</div>}</section>
        </div>}
        {activeView === 'top-up' && <form className="wnpocket-form" onSubmit={startExternalPayment}>
          <h3>Top up WNPocket</h3>
          <label>Amount (INR)<input type="number" min="1" step="0.01" required value={amount} onChange={(event) => { setAmount(event.target.value); setActionMessage('') }} placeholder="Enter top-up amount" /></label>
          <label>Payment app<select value={paymentApp} onChange={(event) => setPaymentApp(event.target.value)}><option>PhonePe</option><option>Paytm</option><option>Other UPI app</option></select></label>
          <button className="primary-button" type="submit" disabled={amountValue <= 0}>Continue with {paymentApp}</button>
          {actionMessage && <p className="wnpocket-status" role="status">{actionMessage}</p>}
        </form>}
        {activeView === 'withdraw' && <form className="wnpocket-form" onSubmit={startExternalPayment}>
          <h3>Withdraw from WNPocket</h3>
          <p>Withdrawable preview balance: {formatWalletAmount(balance)}</p>
          <label>Amount (INR)<input type="number" min="1" step="0.01" required value={amount} onChange={(event) => { setAmount(event.target.value); setActionMessage('') }} placeholder="Enter withdrawal amount" /></label>
          <label>Send to<select value={paymentApp} onChange={(event) => setPaymentApp(event.target.value)}><option>PhonePe</option><option>Paytm</option><option>Other UPI app</option></select></label>
          <button className="primary-button" type="submit" disabled={amountValue <= 0 || amountValue > balance}>Continue with {paymentApp}</button>
          <p className="wnpocket-empty">Withdrawals are unavailable until a wallet balance is received.</p>
          {actionMessage && <p className="wnpocket-status" role="status">{actionMessage}</p>}
        </form>}
        {activeView === 'cash-in-hand' && <div className="wnpocket-form">
          <h3>Cash-in-Hand platform fee</h3>
          <p>When you record a completed Cash-in-Hand service, its platform fee is calculated and automatically deducted from WNPocket.</p>
          <div className="wnpocket-fee-summary"><span>Deduction timing</span><strong>At payment completion</strong></div>
          <button className="primary-button" type="button" onClick={onOpenCashInHandPayment}>Record Cash-in-Hand payment <ArrowRight size={18} /></button>
          <p className="wnpocket-preview-note">This UI preview records the fee in local wallet activity. A connected wallet service will post the real deduction.</p>
        </div>}
      </>}
    </section>
  </div>
}

function ProviderIncomingRequestModal({ request, playSound = true, onAccept, onCancel }) {
  const [isOpen, setIsOpen] = useState(true)
  useEffect(() => {
    if (playSound) playRequestAlertTone()
  }, [playSound])
  if (!isOpen) return null
  return <div className="request-alert-backdrop" role="presentation">
    <section className="request-alert-dialog" role="alertdialog" aria-modal="true" aria-labelledby="incoming-request-title">
      <p className="eyebrow">New service request</p>
      <h2 id="incoming-request-title">A customer needs your service</h2>
      <dl className="request-alert-details">
        <div><dt>Customer Name</dt><dd>{request.customerName}</dd></div>
        <div><dt>Customer Address</dt><dd>{request.customerAddress}</dd></div>
      </dl>
      <div className="request-alert-actions">
        <button type="button" className="request-alert-cancel" onClick={() => { onCancel?.(); setIsOpen(false) }}>Cancel</button>
        <button type="button" className="request-alert-accept" onClick={() => { onAccept?.(); setIsOpen(false) }}>Accept</button>
      </div>
    </section>
  </div>
}

function CustomerProviderAcceptedModal({ provider, onClose }) {
  const [isOpen, setIsOpen] = useState(true)
  if (!isOpen) return null
  return <div className="request-alert-backdrop" role="presentation">
    <section className="request-alert-dialog" role="dialog" aria-modal="true" aria-labelledby="provider-accepted-title">
      <button className="close-button" type="button" onClick={() => { onClose?.(); setIsOpen(false) }} aria-label="Close provider details"><X size={20} /></button>
      <p className="eyebrow">Request accepted</p>
      <h2 id="provider-accepted-title">A Service Provider has accepted your request</h2>
      <dl className="request-alert-details">
        <div><dt>Service Provider Name</dt><dd>{provider.name}</dd></div>
        <div><dt>Service Provider Address</dt><dd>{provider.address}</dd></div>
      </dl>
      <p className="request-accepted-note">The Service Provider has received your request. Service Provider: {provider.name}. The Service Provider will contact you shortly by phone.</p>
      <div className="request-alert-actions"><button type="button" className="request-alert-accept" onClick={() => { onClose?.(); setIsOpen(false) }}>Got it</button></div>
    </section>
  </div>
}

function CustomerRequestProgress({ status, onRetry }) {
  if (status === 'exhausted') return <div className="request-progress exhausted" role="alert">
    <p>All our Service Providers are currently busy. Please try again later.</p>
    <button type="button" onClick={onRetry}>Try again</button>
  </div>
  if (status === 'contacting-next') return <div className="request-progress" role="status"><span className="request-progress-spinner" aria-hidden="true" /><p>The provider is unavailable. We’re contacting the next nearby Service Provider.</p></div>
  if (status === 'cancelled') return <div className="request-progress" role="status"><p>Your service request was cancelled.</p></div>
  return <div className="request-progress" role="status"><span className="request-progress-spinner" aria-hidden="true" /><p>Looking for the nearest available Service Provider within 20 km.</p></div>
}

function ServiceHistoryModal({ accountType, onClose }) {
  const earliestHistoryDate = getSixMonthsAgo()
  const latestHistoryDate = toDateInputValue(new Date())
  const [historyStartDate, setHistoryStartDate] = useState(getSixMonthsAgo)
  const [historyEndDate, setHistoryEndDate] = useState(() => toDateInputValue(new Date()))
  const visibleHistory = []

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal service-history-modal" role="dialog" aria-modal="true" aria-labelledby="service-history-title">
      <button className="close-button" onClick={onClose} aria-label="Close service history"><X size={20} /></button>
      <div className="service-history-heading">
        <div><p className="eyebrow">{accountType} profile</p><h2 id="service-history-title">Service History</h2></div>
        <span className="service-history-summary"><span>{visibleHistory.length} records</span><CalendarDays size={16} /></span>
      </div>
      <p className="modal-intro">Review completed services associated with your profile.</p>
      <div className="service-history-content">
        <div className="service-history-dates">
          <label>Start date<input type="date" value={historyStartDate} min={earliestHistoryDate} max={historyEndDate || latestHistoryDate} onChange={(event) => setHistoryStartDate(event.target.value)} /></label>
          <label>End date<input type="date" value={historyEndDate} min={historyStartDate || earliestHistoryDate} max={latestHistoryDate} onChange={(event) => setHistoryEndDate(event.target.value)} /></label>
        </div>
        {visibleHistory.length ? <ul className="service-history-list">
          {visibleHistory.map((record) => <li key={record.id}>
            <div><strong>{record.service}</strong><span>{record.customer}</span><small>Completed · INR {record.amount.toLocaleString('en-IN')}</small></div>
            <time dateTime={record.date}>{formatServiceDate(record.date)}</time>
          </li>)}
        </ul> : <p className="service-history-empty">No service history for these dates.</p>}
      </div>
    </section>
  </div>
}

function ResignationConfirmationModal({ accountType, submitted, error, onConfirm, onClose }) {
  return <div className="admin-confirm-backdrop" role="presentation">
    <section className="admin-confirm-dialog resignation-dialog" role={submitted ? 'dialog' : 'alertdialog'} aria-modal="true" aria-labelledby="resignation-dialog-title">
      {submitted ? <>
        <p className="eyebrow">Request submitted</p>
        <h3 id="resignation-dialog-title">Resignation request submitted</h3>
        <p>Your request has been saved for review.</p>
        <div className="admin-confirm-actions"><button className="table-action approve" type="button" onClick={onClose}>Close</button></div>
      </> : <>
        <p className="eyebrow">Confirm request</p>
        <h3 id="resignation-dialog-title">Submit resignation request?</h3>
        <p>This will submit a resignation request for your {accountType} profile.</p>
        {error && <p className="resignation-error" role="alert">{error}</p>}
        <div className="admin-confirm-actions">
          <button className="table-action approve" type="button" onClick={onConfirm}>Confirm</button>
          <button className="table-action" type="button" onClick={onClose}>Cancel</button>
        </div>
      </>}
    </section>
  </div>
}

function CloseAccountConfirmationModal({ closed, error, onConfirm, onClose }) {
  return <div className="admin-confirm-backdrop" role="presentation">
    <section className="admin-confirm-dialog close-account-dialog" role={closed ? 'dialog' : 'alertdialog'} aria-modal="true" aria-labelledby="close-account-dialog-title">
      {closed ? <>
        <p className="eyebrow">Account closed</p>
        <h3 id="close-account-dialog-title">Your account is closed</h3>
        <p>Your profile and saved sign-in session have been removed.</p>
        <div className="admin-confirm-actions"><button className="table-action approve" type="button" onClick={onClose}>Close</button></div>
      </> : <>
        <p className="eyebrow">Permanent action</p>
        <h3 id="close-account-dialog-title">Close your account?</h3>
        <p>This permanently closes your account and removes its saved profile. You will be signed out.</p>
        {error && <p className="resignation-error" role="alert">{error}</p>}
        <div className="admin-confirm-actions">
          <button className="table-action block" type="button" onClick={onConfirm}>Confirm</button>
          <button className="table-action" type="button" onClick={onClose}>Cancel</button>
        </div>
      </>}
    </section>
  </div>
}

function ProfileRequestActions({ role, serviceAmount, onServiceAmountChange, serviceOfferStatus, onServiceOfferStatusChange }) {
  const isProvider = role === 'Service Provider'
  const [decision, setDecision] = useState('')
  const hasServiceAmount = Number(serviceAmount) > 0
  const formattedServiceAmount = hasServiceAmount ? Number(serviceAmount).toLocaleString('en-IN') : ''
  const customerCanReviewOffer = serviceOfferStatus === 'approved' && hasServiceAmount
  const customerPrompt = customerCanReviewOffer
    ? 'Review the service provider amount and choose Approve or Reject.'
    : serviceOfferStatus === 'rejected'
      ? 'The service provider rejected this request.'
      : 'Waiting for the service provider to approve an amount.'
  const providerPrompt = serviceOfferStatus === 'approved'
    ? 'You approved this amount. It is now visible to the customer.'
    : serviceOfferStatus === 'rejected'
      ? 'You rejected this service request.'
      : 'Enter an amount and approve it to send it to the customer.'
  const decisionPrompt = decision === 'approved'
    ? 'You approved this service amount.'
    : decision === 'cancelled'
      ? 'You cancelled this service.'
      : 'You rejected this service amount.'
  const providerDisabledReason = 'No service request is currently assigned to this service provider.'
  const message = isProvider ? providerPrompt : decision ? decisionPrompt : customerPrompt

  return <section className="profile-request-actions" aria-label={`${role} service request actions`}>
    <div className="profile-request-heading">
      <strong>{isProvider ? 'Service Request' : 'Service Offer'}</strong>
      <span>{isProvider ? 'Service Provider action' : 'Customer decision'}</span>
    </div>
    <p>{message}</p>
    <div className={isProvider ? 'profile-request-buttons provider' : 'profile-request-buttons'}>
      {isProvider ? <>
        <button type="button" className="profile-request-accept" disabled title={providerDisabledReason}>Accepted Service List</button>
        <button type="button" className="profile-request-call" disabled title={providerDisabledReason}>Call with Customer</button>
      </> : <>
        <button type="button" disabled={!customerCanReviewOffer || Boolean(decision)} onClick={() => setDecision('approved')}>Approve</button>
        <button type="button" className="reject" disabled={!customerCanReviewOffer || Boolean(decision)} onClick={() => setDecision('rejected')}>Reject</button>
      </>}
    </div>
    <label className="profile-request-amount">
      <span>Service Amount (INR)</span>
      {isProvider
        ? <input type="number" min="0" step="1" inputMode="decimal" value={serviceAmount} onChange={(event) => { onServiceAmountChange(event.target.value); onServiceOfferStatusChange('pending'); setDecision('') }} placeholder="Enter agreed amount" />
        : <input type="text" value={customerCanReviewOffer ? formattedServiceAmount : ''} readOnly placeholder={serviceOfferStatus === 'rejected' ? 'Service provider rejected this request' : 'Awaiting provider approval'} aria-label="Service Amount (INR), read only" />}
    </label>
    {isProvider && <div className="profile-request-buttons provider">
      <button type="button" disabled={!hasServiceAmount || serviceOfferStatus !== 'pending'} onClick={() => onServiceOfferStatusChange('approved')}>Service Amount</button>
      <button type="button" className="reject" disabled={!hasServiceAmount || serviceOfferStatus !== 'pending'} onClick={() => onServiceOfferStatusChange('rejected')}>Reject New Service</button>
    </div>}
    {!isProvider && <button type="button" className="profile-request-cancel" disabled={Boolean(decision)} onClick={() => setDecision('cancelled')}>Cancel Service</button>}
  </section>
}

function RegistrationModal({ type, submitted, setSubmitted, requesterProfile, onSignedIn, onClose, initialAdminView, initialPaymentScenario = 'customer-to-app', onCashInHandPaymentComplete, onAdminSuccess, onAdminViewChange }) {
  const isLabour = type === 'labour'
  const isContact = type === 'contact'
  const isFeedback = type === 'feedback'
  const isAdmin = type === 'admin'
  const isPayment = type === 'payment'
  const isCustomer = type === 'customer'
  const [selectedMandal, setSelectedMandal] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedMusicianType, setSelectedMusicianType] = useState('')
  const [selectedMultiServices, setSelectedMultiServices] = useState([])
  const [selectedFarmLaborTask, setSelectedFarmLaborTask] = useState('')
  const [customerName, setCustomerName] = useState(() => isPayment ? '' : requesterProfile?.fullName || '')
  const [customerAddress, setCustomerAddress] = useState(() => [requesterProfile?.village, requesterProfile?.mandal, requesterProfile?.division].filter(Boolean).join(', '))
  const [customerCoordinates, setCustomerCoordinates] = useState('')
  const [customerLocationError, setCustomerLocationError] = useState('')
  const [customerRequestStatus, setCustomerRequestStatus] = useState('searching')
  const [providerName, setProviderName] = useState(() => requesterProfile?.profileType === 'Service Provider' ? requesterProfile.fullName || '' : '')
  const [isListening, setIsListening] = useState(false)
  const [listeningTarget, setListeningTarget] = useState('')
  const [voiceError, setVoiceError] = useState('')
  const recognitionRef = useRef(null)
  const [adminOtp, setAdminOtp] = useState('')
  const [adminOtpStep, setAdminOtpStep] = useState(false)
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaCode, setCaptchaCode] = useState(() => Math.random().toString(36).slice(2, 7).toUpperCase())
  const [captchaError, setCaptchaError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentScenario, setPaymentScenario] = useState(initialPaymentScenario)
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentScenario === 'provider-to-app' ? 'Cash in hand' : 'QR scan')

  const refreshCaptcha = () => {
    setCaptchaCode(Math.random().toString(36).slice(2, 7).toUpperCase())
    setCaptchaAnswer('')
    setCaptchaError('')
  }

  const captureCustomerLocation = () => {
    if (!navigator.geolocation) {
      setCustomerLocationError('Location access is not available in this browser. Enter the address manually.')
      return
    }
    setCustomerLocationError('')
    navigator.geolocation.getCurrentPosition((position) => {
      setCustomerCoordinates(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`)
    }, () => {
      setCustomerLocationError('Could not get your location. Enter the address manually.')
    }, { enableHighAccuracy: true, timeout: 10000 })
  }

  useEffect(() => {
    if (!isAdmin || adminOtpStep) return undefined
    const refreshTimer = window.setInterval(refreshCaptcha, 60 * 1000)
    return () => window.clearInterval(refreshTimer)
  }, [isAdmin, adminOtpStep])

  useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

  const startVoiceInput = (target) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceError('Voice input is not supported in this browser.')
      return
    }

    if (recognitionRef.current && listeningTarget === target) {
      recognitionRef.current.stop()
      return
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')
        .trim()

      if (transcript) {
        if (target === 'service' || target === 'specialty') {
          const choices = target === 'service'
            ? labourTypes.map((value) => ({ label: value, value }))
            : getSpecialistOptions(selectedService).filter((choice) => !choice.disabled)
          const match = matchVoiceChoice(transcript, choices)
          if (match && target === 'service') {
            setSelectedService(match.value)
            setSelectedSpecialty('')
            setSelectedMusicianType('')
            setSelectedMultiServices([])
            setSelectedFarmLaborTask('')
            setVoiceError('')
          } else if (match) {
            setSelectedSpecialty(match.value)
            setSelectedMusicianType('')
            setSelectedMultiServices([])
            setSelectedFarmLaborTask('')
            setVoiceError('')
          } else {
            setVoiceError('No matching option heard. Please try again or choose from the list.')
          }
        }
      }
    }

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        setIsListening(false)
        setListeningTarget('')
      }
    }
    recognition.onerror = () => {
      setVoiceError('Voice input is unavailable right now.')
      setIsListening(false)
      setListeningTarget('')
    }

    recognitionRef.current = recognition
    setIsListening(true)
    setListeningTarget(target)
    setVoiceError('')
    recognition.start()
  }

  const numericAmount = Number(amount || 0)
  const commissionRate = getAppCommissionRate(numericAmount)
  const appCommission = numericAmount * commissionRate / 100
  const providerPayout = numericAmount - appCommission
  const activeScenarioMethods = paymentScenarios.find((scenario) => scenario.id === paymentScenario)?.methods || []
  const customerPays = paymentScenario === 'customer-to-app' || paymentScenario === 'provider-to-app' ? numericAmount : 0
  const appCollects = paymentScenario === 'customer-to-app' ? appCommission : paymentScenario === 'provider-to-app' ? appCommission : 0
  const providerReceives = paymentScenario === 'customer-to-app' ? providerPayout : paymentScenario === 'provider-to-app' ? numericAmount : 0
  const isWalletCashInHandPayment = isPayment && paymentScenario === 'provider-to-app' && paymentMethod === 'Cash in hand' && requesterProfile?.profileType === 'Service Provider' && numericAmount > 0
  const customerPaysLabel = paymentScenario === 'customer-to-app' ? 'Customer pays → Platform' : 'Customer pays → Service Provider'
  const settlementLabel = paymentScenario === 'customer-to-app' ? 'Platform pays → Service Provider' : isWalletCashInHandPayment ? 'Automatic WNPocket deduction' : 'Service Provider pays → Platform'
  const settlementAmount = paymentScenario === 'customer-to-app' ? providerPayout : appCommission
  const handleAdminBack = () => {
    if (adminOtpStep) {
      setAdminOtpStep(false)
      setAdminOtp('')
      setOtpError('')
      return
    }
    onClose()
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className={isAdmin ? 'modal admin-modal' : 'modal'} role="dialog" aria-modal="true" aria-labelledby="modal-title" onSubmitCapture={() => { if (isWalletCashInHandPayment) onCashInHandPaymentComplete?.({ amount: numericAmount, customerName }) }}>
      {!isAdmin && <button className="close-button" onClick={onClose} aria-label="Close registration form"><X size={20} /></button>}
      {submitted ? <div className="success-state admin-dashboard">
        <span className="success-icon"><Check size={26} /></span>
        <p className="eyebrow">{isPayment ? 'Payment complete' : isAdmin ? 'Admin dashboard' : isFeedback ? 'Feedback received' : isContact ? 'Message received' : isCustomer ? 'Request submitted' : 'You’re on the list'}</p>
        <h2>{isPayment ? 'Payment exchange success' : isAdmin ? 'Hello, Admin.' : isFeedback ? 'Thanks for your feedback.' : isContact ? 'Thanks for contacting us.' : isCustomer ? 'We’re finding a nearby Service Provider' : 'Thanks for reaching out.'}</h2>
        {isPayment ? <div className="payment-summary">
          <div><span>Flow</span><strong>{paymentScenarios.find((scenario) => scenario.id === paymentScenario)?.label}</strong></div>
          <div><span>Method</span><strong>{paymentMethod}</strong></div>
          <div><span>{customerPaysLabel}</span><strong>₹{customerPays.toLocaleString('en-IN')}</strong></div>
          <div><span>Provider receives</span><strong>₹{providerReceives.toLocaleString('en-IN')}</strong></div>
          <div><span>Platform fee</span><strong>₹{appCollects.toLocaleString('en-IN')}</strong></div>  
          <div><span>{settlementLabel}</span><strong>₹{settlementAmount.toLocaleString('en-IN')}</strong></div>
        </div> : isAdmin ? <AdminDashboard initialView={initialAdminView} onViewChange={onAdminViewChange} onHome={onClose} /> : isCustomer ? <div className="request-submitted-summary" role="status">
          <p>A nearby active Service Provider will be notified. You’ll see their name and address here after they accept.</p>
          <CustomerRequestProgress status={customerRequestStatus} onRetry={() => { setCustomerRequestStatus('searching'); setSubmitted(false) }} />
          <dl className="request-alert-details">
            <div><dt>Customer Name</dt><dd>{customerName}</dd></div>
            <div><dt>Customer Address</dt><dd>{customerAddress}</dd></div>
            {customerCoordinates && <div><dt>Location coordinates</dt><dd>{customerCoordinates}</dd></div>}
          </dl>
        </div> : <p>{isFeedback ? 'Your thoughts help us improve the local work board.' : isContact ? 'We’ve received your message and will get back to you shortly.' : 'We’ve received your details and will be in touch shortly.'}</p>}
        {!isAdmin && <button className="primary-button" onClick={onClose}>Back to home <ArrowRight size={18} /></button>}
      </div> : <><p className="eyebrow">{isPayment ? 'Secure transfer' : isAdmin ? adminOtpStep ? 'Mobile verification' : 'Secure access' : isFeedback ? 'Help us improve' : isContact ? 'Get in touch' : isLabour }</p><h2 id="modal-title">{isPayment ? 'Payment Exchange' : isAdmin ? adminOtpStep ? 'Enter your OTP' : 'Admin login' : isFeedback ? 'Tell us what you think' : isContact ? 'How can we help?' : isLabour ? 'Register as a service provider' : 'Tell us what you need'}</h2><p className="modal-intro">{isPayment ? 'Choose the payment flow, method, and commission split for a customer and service provider transaction.' : isAdmin ? adminOtpStep ? 'Enter the one-time password sent to your registered mobile number.' : 'Sign in with your email, password, and CAPTCHA to continue.' : isFeedback ? 'Share a quick rating and note about your experience.' : isContact ? 'Send us a note and our team will respond shortly.' : isLabour ? 'Share a few details and start finding work near you.' : 'We’ll help you connect with a trusted professional nearby.'}</p><form onSubmit={(event) => { event.preventDefault(); if (isAdmin && !adminOtpStep) { if (captchaAnswer.trim().toUpperCase() !== captchaCode) { setCaptchaError('CAPTCHA does not match.'); return } setAdminOtpStep(true); return } if (isAdmin && !/^\d{6}$/.test(adminOtp)) { setOtpError('Enter the 6-digit OTP sent to your mobile.'); return } if (!isLabour && !isContact && !isFeedback && !isPayment) onSignedIn(); if (isAdmin) onAdminSuccess(); setSubmitted(true) }}>
        {isPayment ? <>
          <label>Payment scenario<select required value={paymentScenario} onChange={(event) => {
            const nextScenario = event.target.value
            setPaymentScenario(nextScenario)
            const nextMethods = paymentScenarios.find((scenario) => scenario.id === nextScenario)?.methods || []
            setPaymentMethod(nextMethods[0] || '')
          }}><option value="" disabled>Select a scenario</option>{paymentScenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.label}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
          <label>Payment method<select required value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="" disabled>Select a method</option>{activeScenarioMethods.map((method) => <option key={method} value={method}>{method}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
          <label>Customer name<input required type="text" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="e.g. Arjun Reddy" /></label>
          <label>Service provider name<input required type="text" value={providerName} readOnly={requesterProfile?.profileType === 'Service Provider'} onChange={(event) => setProviderName(event.target.value)} placeholder="Enter service provider name" /></label>
          <label>Service amount<input required type="number" min="0" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Enter service amount" /></label>
          {(paymentScenario === 'customer-to-app' || paymentScenario === 'provider-to-app') && <label>App commission (%)<input required type="number" value={commissionRate} readOnly /></label>}
          <div className="payment-breakdown">
            <div><span>{customerPaysLabel}</span><strong>₹{customerPays.toLocaleString('en-IN')}</strong></div>
            <div><span>Service Provider receives</span><strong>₹{providerReceives.toLocaleString('en-IN')}</strong></div>
            <div><span>Platform fee</span><strong>₹{appCollects.toLocaleString('en-IN')}</strong></div>
            <div><span>{settlementLabel}</span><strong>₹{settlementAmount.toLocaleString('en-IN')}</strong></div>
          </div>
        </> : isAdmin && !adminOtpStep ? <>
          <label>Admin email<input required type="email" placeholder="Enter your admin email" /></label>
          <label>Password<input required type="password" placeholder="Enter password" /></label>
          <div className="captcha-field"><div className="captcha-code-row"><strong>{captchaCode}</strong><button className="captcha-refresh" type="button" onClick={refreshCaptcha} aria-label="Refresh CAPTCHA" title="Refresh CAPTCHA"><RefreshCw size={15} /></button></div><input required type="text" value={captchaAnswer} onChange={(event) => { setCaptchaAnswer(event.target.value); setCaptchaError('') }} placeholder="Enter CAPTCHA" aria-label="Enter CAPTCHA" />{captchaError && <small>{captchaError}</small>}</div>
        </> : isAdmin ? <>
          <div className="otp-notice">OTP sent to your registered mobile number.</div>
          <label>One-time password<input required type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={adminOtp} onChange={(event) => { setAdminOtp(event.target.value.replace(/\D/g, '')); setOtpError('') }} placeholder="Enter 6-digit OTP" />{otpError && <small className="otp-error">{otpError}</small>}</label>
        </> : null}
        {isLabour ? <>
          <label>What service do you offer<select required value={selectedService} onChange={(event) => { setSelectedService(event.target.value); setSelectedSpecialty(''); setSelectedMusicianType(''); setSelectedMultiServices([]); setSelectedFarmLaborTask('') }}><option value="" disabled>Select your service</option>{labourTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>
          {selectedService === 'Electricians' && <label>Electrician specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option><option>Home Specialist</option><option>Farming Motors Specialist</option><option>Both Specialist</option></select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Vehicle & Machinery Service Providers' && <label>Vehicle specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option>{vehicleSpecialists.map((item) => <option key={item.name} value={item.value || item.name} disabled={item.divider}>{item.divider ? item.name : `${item.name} → ${item.description}`}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Driving Service Providers' && <label>Driving specialist<select required defaultValue=""><option value="" disabled>Select a driving service</option>{drivingSpecialists.map((item) => <option key={item.name} value={item.name}>{item.name} → {item.description}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Transport Service Providers' && <label>Transport service type<select required value={selectedSpecialty} onChange={(event) => setSelectedSpecialty(event.target.value)}><option value="" disabled>Select a transport service</option>{transportSpecialists.map((item) => <option key={item.name} value={item.name}>{item.name} → {item.description}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Loader Service Providers' && <label>Loader service type<select required value={selectedSpecialty} onChange={(event) => setSelectedSpecialty(event.target.value)}><option value="" disabled>Select a loader service</option>{loaderSpecialists.map((item) => <option key={item.name} value={item.name}>{item.name} → {item.description}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Home Service Providers' && <label>Home service type<select required defaultValue=""><option value="" disabled>Select a home service</option>{homeServiceSpecialists.map((item) => <option key={item.name} value={item.name}>{item.name} → {item.description}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Farming Service Providers' && <label>Farming specialist<select required value={selectedSpecialty} onChange={(event) => { setSelectedSpecialty(event.target.value); setSelectedFarmLaborTask(''); setSelectedMultiServices([]) }}><option value="" disabled>Select a specialization</option>{farmingSpecialists.map((item) => <option key={item.name} value={item.value || item.name} disabled={item.divider}>{item.divider ? item.name : item.description ? `${item.name} → ${item.description}` : item.name}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Farming Service Providers' && selectedSpecialty === 'Multi-Select' && <fieldset className="service-multiselect"><legend>Service types</legend>{farmingSpecialists.filter((item) => !item.divider && item.value !== 'Multi-Select').map((item, index) => <label className="service-multiselect-option" key={item.name}><input type="checkbox" checked={selectedMultiServices.includes(item.name)} required={selectedMultiServices.length === 0 && index === 0} onChange={(event) => { const isChecked = event.target.checked; setSelectedMultiServices((current) => isChecked ? [...current, item.name] : current.filter((service) => service !== item.name)); if (item.name === 'Farm Laborers' && !isChecked) setSelectedFarmLaborTask('') }} /><span>{item.name}</span></label>)}</fieldset>}
          {selectedService === 'Farming Service Providers' && (selectedSpecialty === 'Farm Laborers' || (selectedSpecialty === 'Multi-Select' && selectedMultiServices.includes('Farm Laborers'))) && <label>Farm labor task<select required value={selectedFarmLaborTask} onChange={(event) => setSelectedFarmLaborTask(event.target.value)}><option value="" disabled>Select a task</option>{farmLaborTasks.map((task) => <option key={task} value={task}>{task}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Construction Service Providers' && <label>Construction specialist<select required defaultValue=""><option value="" disabled>Select a specialization</option>{constructionSpecialists.map((item) => <option key={item.name} value={item.value || item.name} disabled={item.divider}>{item.divider ? item.name : `${item.name} → ${item.description}`}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Marriage & Other Functions Service Providers' && <label>Marriage/function specialist<select required value={selectedSpecialty} onChange={(event) => { setSelectedSpecialty(event.target.value); setSelectedMusicianType(''); setSelectedMultiServices([]) }}><option value="" disabled>Select a specialization</option>{marriageFunctionSpecialists.map((item) => <option key={item.name} value={item.value || item.name} disabled={item.divider}>{item.divider ? item.name : `${item.name} → ${item.description}`}</option>)}<option value="Multi-Select">★ Multi-Select Option</option></select><ChevronDown className="select-icon" size={16} /></label>}
          {selectedService === 'Marriage & Other Functions Service Providers' && selectedSpecialty === 'Multi-Select' && <fieldset className="service-multiselect"><legend>Service types</legend>{marriageFunctionSpecialists.filter((item) => !item.divider && item.value !== 'Specialist').map((item, index) => <label className="service-multiselect-option" key={item.name}><input type="checkbox" checked={selectedMultiServices.includes(item.name)} required={selectedMultiServices.length === 0 && index === 0} onChange={(event) => { const isChecked = event.target.checked; setSelectedMultiServices((current) => isChecked ? [...current, item.name] : current.filter((service) => service !== item.name)); if (item.name === 'Musicians' && !isChecked) setSelectedMusicianType('') }} /><span>{item.name}</span></label>)}</fieldset>}
          {selectedService === 'Marriage & Other Functions Service Providers' && (selectedSpecialty === 'Musicians' || (selectedSpecialty === 'Multi-Select' && selectedMultiServices.includes('Musicians'))) && <label>Choose a music type<select required value={selectedMusicianType} onChange={(event) => setSelectedMusicianType(event.target.value)}><option value="" disabled>Select a music type</option>{musicianTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
        </> : isContact ? <><label>Your message<textarea required placeholder="Tell us how we can help" /></label></> : isFeedback ? <><label>How would you rate your experience?<select required defaultValue=""><option value="" disabled>Select a rating</option><option>Excellent</option><option>Good</option><option>Needs improvement</option></select><ChevronDown className="select-icon" size={16} /></label><label>Your feedback<textarea required placeholder="Share your thoughts" /></label></> : isCustomer ? <>
          <label>Customer Name<input required type="text" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Enter your name" /></label>
          <label>Customer Address<textarea required rows="2" value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} placeholder="Enter the service location address" /></label>
          <div className="request-location-tools">
            <button type="button" className="location-button" onClick={captureCustomerLocation}>Use my current location</button>
            {customerCoordinates && <small>Location captured: {customerCoordinates}</small>}
            {customerLocationError && <small className="voice-error">{customerLocationError}</small>}
            <small>Share the service location so the nearest available provider can be identified.</small>
          </div>
          <label>What do you need help with?<div className="voice-select-row"><select required value={selectedService} onChange={(event) => { setSelectedService(event.target.value); setSelectedSpecialty(''); setSelectedMusicianType(''); setSelectedMultiServices([]); setSelectedFarmLaborTask(''); setVoiceError('') }}><option value="" disabled>Select a service</option>{labourTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown className="select-icon" size={16} /><button className={isListening && listeningTarget === 'service' ? 'voice-button listening' : 'voice-button'} type="button" onClick={() => startVoiceInput('service')} aria-label="Choose a service by voice" title="Choose a service by voice">{isListening && listeningTarget === 'service' ? <MicOff size={16} /> : <Mic size={16} />}</button></div></label>
          {selectedService && <label>Choose a service type<div className="voice-select-row"><select required value={selectedSpecialty} onChange={(event) => { setSelectedSpecialty(event.target.value); setSelectedMusicianType(''); setSelectedMultiServices([]); setSelectedFarmLaborTask(''); setVoiceError('') }}><option value="" disabled>Select a service type</option>{getSpecialistOptions(selectedService).map((item) => <option key={item.value} value={item.value} disabled={item.disabled}>{item.disabled ? item.label : item.description ? `${item.label} → ${item.description}` : item.label}</option>)}{selectedService === 'Marriage & Other Functions Service Providers' && <option value="Multi-Select">★ Multi-Select Option</option>}</select><ChevronDown className="select-icon" size={16} /><button className={isListening && listeningTarget === 'specialty' ? 'voice-button listening' : 'voice-button'} type="button" onClick={() => startVoiceInput('specialty')} aria-label="Choose a service type by voice" title="Choose a service type by voice">{isListening && listeningTarget === 'specialty' ? <MicOff size={16} /> : <Mic size={16} />}</button></div></label>}
          {selectedService === 'Farming Service Providers' && selectedSpecialty === 'Multi-Select' && <fieldset className="service-multiselect"><legend>Service types</legend>{farmingSpecialists.filter((item) => !item.divider && item.value !== 'Multi-Select').map((item, index) => <label className="service-multiselect-option" key={item.name}><input type="checkbox" checked={selectedMultiServices.includes(item.name)} required={selectedMultiServices.length === 0 && index === 0} onChange={(event) => { const isChecked = event.target.checked; setSelectedMultiServices((current) => isChecked ? [...current, item.name] : current.filter((service) => service !== item.name)); if (item.name === 'Farm Laborers' && !isChecked) setSelectedFarmLaborTask('') }} /><span>{item.name}</span></label>)}</fieldset>}
          {selectedService === 'Farming Service Providers' && (selectedSpecialty === 'Farm Laborers' || (selectedSpecialty === 'Multi-Select' && selectedMultiServices.includes('Farm Laborers'))) && <label>Farm labor task<select required value={selectedFarmLaborTask} onChange={(event) => setSelectedFarmLaborTask(event.target.value)}><option value="" disabled>Select a task</option>{farmLaborTasks.map((task) => <option key={task} value={task}>{task}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {isCustomer && selectedService === 'Marriage & Other Functions Service Providers' && selectedSpecialty === 'Multi-Select' && <fieldset className="service-multiselect"><legend>Service types</legend>{marriageFunctionSpecialists.filter((item) => !item.divider && item.value !== 'Specialist').map((item, index) => <label className="service-multiselect-option" key={item.name}><input type="checkbox" checked={selectedMultiServices.includes(item.name)} required={selectedMultiServices.length === 0 && index === 0} onChange={(event) => { const isChecked = event.target.checked; setSelectedMultiServices((current) => isChecked ? [...current, item.name] : current.filter((service) => service !== item.name)); if (item.name === 'Musicians' && !isChecked) setSelectedMusicianType('') }} /><span>{item.name}</span></label>)}</fieldset>}
          {(selectedSpecialty === 'Musicians' || (isCustomer && selectedService === 'Marriage & Other Functions Service Providers' && selectedSpecialty === 'Multi-Select' && selectedMultiServices.includes('Musicians'))) && <label>Choose a music type<select required value={selectedMusicianType} onChange={(event) => setSelectedMusicianType(event.target.value)}><option value="" disabled>Select a music type</option>{musicianTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select><ChevronDown className="select-icon" size={16} /></label>}
          {voiceError && <small className="voice-error">{voiceError}</small>}
        </> : null}
        <button className="primary-button form-submit" type="submit">{isPayment ? 'Process payment' : isAdmin ? adminOtpStep ? 'Verify OTP' : 'Continue to OTP' : isFeedback ? 'Send feedback' : isContact ? 'Send message' : isLabour ? 'Create my profile' : 'Find a professional'} <ArrowRight size={18} /></button>
        {isAdmin && <button className="signin-back" type="button" onClick={handleAdminBack}>&lt;- Back</button>}
      </form></>}
    </section>
  </div>
}


function parseAdminApprovalDate(value) {
  if (!value) return null
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return parsed

  const localized = String(value).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (!localized) return null

  const [, day, month, year, hour, minute, second = '0', period] = localized
  let hours = Number(hour)
  if (period?.toLowerCase() === 'pm' && hours < 12) hours += 12
  if (period?.toLowerCase() === 'am' && hours === 12) hours = 0
  const date = new Date(Number(year), Number(month) - 1, Number(day), hours, Number(minute), Number(second))
  return Number.isNaN(date.getTime()) ? null : date
}

function formatAdminApprovalDateTime(value) {
  if (!value) return '—'
  const date = parseAdminApprovalDate(value)
  if (!date) return String(value)
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  }).formatToParts(date)
  const formatted = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]))
  return `${formatted.day} ${formatted.month} ${formatted.year}, ${formatted.hour}:${formatted.minute} ${formatted.dayPeriod.toUpperCase()}`
}

function formatAdminDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getAdminPaymentDateBounds(today = new Date()) {
  const monthStart = new Date(today.getFullYear(), today.getMonth() - 6, 1)
  const lastDayOfTargetMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate()
  const sixMonthsAgo = new Date(monthStart.getFullYear(), monthStart.getMonth(), Math.min(today.getDate(), lastDayOfTargetMonth))
  return { minDate: formatAdminDateInputValue(sixMonthsAgo), maxDate: formatAdminDateInputValue(today) }
}

function sortAdminTableRows(rows, columns, sort) {
  const column = columns.find(({ key }) => key === sort.key)
  if (!column) return rows
  return [...rows].sort((left, right) => {
    const leftValue = column.value(left) ?? ''
    const rightValue = column.value(right) ?? ''
    let comparison
    if (column.sortType === 'date') {
      const leftDate = parseAdminApprovalDate(leftValue)
      const rightDate = parseAdminApprovalDate(rightValue)
      if (!leftDate || !rightDate) return !leftDate && !rightDate ? 0 : !leftDate ? 1 : -1
      comparison = leftDate.getTime() - rightDate.getTime()
    } else if (column.sortType === 'number') {
      comparison = Number(leftValue) - Number(rightValue)
    } else {
      comparison = String(leftValue).localeCompare(String(rightValue), undefined, { numeric: true, sensitivity: 'base' })
    }
    return sort.direction === 'asc' ? comparison : -comparison
  })
}

function filterAdminProviderRows(rows, searchValue) {
  const search = searchValue.trim().toLocaleLowerCase()
  if (!search) return rows
  const mobileSearch = search.replace(/\D/g, '')
  return rows.filter((provider) => {
    const name = String(provider.name || '').toLocaleLowerCase()
    const mobile = String(provider.mobile || '').toLocaleLowerCase()
    const mobileDigits = mobile.replace(/\D/g, '')
    return name.includes(search) || mobile.includes(search) || Boolean(mobileSearch && mobileDigits.includes(mobileSearch))
  })
}

function SortableTableHeader({ columns, sort, onSort }) {
  return <thead><tr>{columns.map(({ key, label }) => {
    const isSorted = sort.key === key
    const direction = sort.direction
    return <th key={key} scope="col" aria-sort={isSorted ? direction === 'asc' ? 'ascending' : 'descending' : 'none'}>
      <button className="admin-sort-button" type="button" onClick={() => onSort(key)} title={`Sort ${label} ${isSorted && direction === 'asc' ? 'descending' : 'ascending'}`}>
        <span>{label}</span><span aria-hidden="true">{isSorted ? direction === 'asc' ? '↑' : '↓' : '↕'}</span>
      </button>
    </th>
  })}</tr></thead>
}

function AdminDashboard({ initialView = 'providers', onViewChange, onHome }) {
  const employers = readEmployerProfiles()
  const customers = readRegisteredProfiles()
    .filter((profile) => profile?.profileType === 'Customer')
    .map((profile, index) => ({
      id: normalizeMobileNumber(profile.mobile) || `${profile.fullName || 'customer'}-${index}`,
      name: profile.fullName || 'Customer',
      mobile: profile.mobile || '',
      address: profile.address || [profile.village, profile.mandal, profile.division].filter(Boolean).join(', ') || 'Not provided yet',
    }))
  const [adminView, setAdminView] = useState(initialView)
  const [activeProviderSort, setActiveProviderSort] = useState({ key: 'name', direction: 'asc' })
  const [accessProviderSort, setAccessProviderSort] = useState({ key: 'name', direction: 'asc' })
  const [pendingProviderSort, setPendingProviderSort] = useState({ key: 'name', direction: 'asc' })
  const [activeProviderSearch, setActiveProviderSearch] = useState('')
  const [accessProviderSearch, setAccessProviderSearch] = useState('')
  const [pendingProviderSearch, setPendingProviderSearch] = useState('')
  const [providers, setProviders] = useState([])
  const [pendingProviders, setPendingProviders] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editingAccessId, setEditingAccessId] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const adminDetails = { name: 'Admin', mobile: '' }
  const activeProviderCount = providers.filter((provider) => provider.status === 'Active' && !provider.blocked).length
  const inactiveProviderCount = providers.filter((provider) => provider.status !== 'Active').length + pendingProviders.filter((provider) => provider.status === 'Inactive').length
  const blockedProviderCount = providers.filter((provider) => provider.blocked).length

  const activeProviderColumns = [
    { key: 'name', label: 'Service Provider Name', value: (provider) => provider.name || '', render: (provider) => <strong>{provider.name}</strong> },
    { key: 'mobile', label: 'Mobile Number', value: (provider) => provider.mobile || '', render: (provider) => provider.mobile },
    { key: 'address', label: 'Address', value: (provider) => provider.address || '', render: (provider) => provider.address },
    { key: 'service', label: 'Services Knows', value: (provider) => provider.service || 'Service Provider', render: (provider) => provider.service || 'Service Provider' },
    { key: 'status', label: 'Profile Status', value: (provider) => provider.status || '', render: (provider) => <span className="table-status complete">{provider.status}</span> },
    { key: 'adminName', label: 'Approved Admin Name', value: (provider) => provider.approval?.admin || provider.accessAdmin?.name || '—', render: (provider) => provider.approval?.admin || provider.accessAdmin?.name || '—' },
    { key: 'adminMobile', label: 'Admin Mobile Number', value: (provider) => provider.approval?.mobile || provider.accessAdmin?.mobile || '—', render: (provider) => provider.approval?.mobile || provider.accessAdmin?.mobile || '—' },
    { key: 'approvedAt', label: 'Approved Date & Time', value: (provider) => provider.approval?.date || '', sortType: 'date', render: (provider) => formatAdminApprovalDateTime(provider.approval?.date) },
  ]
  const sortedActiveProviders = sortAdminTableRows(filterAdminProviderRows(providers, activeProviderSearch), activeProviderColumns, activeProviderSort)
  const sortActiveProvidersBy = (key) => setActiveProviderSort((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }))

  useEffect(() => {
    setAdminView(initialView)
  }, [initialView])

  const changeAdminView = (view) => {
    setAdminView(view)
    onViewChange?.(view)
  }

  const updateProvider = (id, field, value) => {
    setPendingProviders((current) => current.map((provider) => provider.id === id ? { ...provider, [field]: value } : provider))
  }

  const approveProvider = (provider) => {
    const approval = { admin: adminDetails.name, date: new Date().toISOString() }
    setPendingProviders((current) => current.filter((item) => item.id !== provider.id))
    setProviders((current) => [...current, { ...provider, status: 'Active', approved: true, approval, blocked: false, accessAdmin: null }])
  }

  const updateAccessProvider = (id, field, value) => {
    setProviders((current) => current.map((provider) => provider.id === id ? { ...provider, [field]: value } : provider))
  }

  const toggleProviderAccess = (provider) => {
    updateAccessProvider(provider.id, 'blocked', !provider.blocked)
    updateAccessProvider(provider.id, 'accessAdmin', { name: adminDetails.name, mobile: adminDetails.mobile, date: new Date().toISOString() })
  }

  const requestConfirmation = (action, provider, onConfirm) => setConfirmation({ action, provider, onConfirm })

  const accessProviderColumns = [
    { key: 'name', label: 'Service Provider Name', value: (provider) => provider.name || '', render: (provider) => <strong>{provider.name}</strong> },
    { key: 'mobile', label: 'Mobile Number', value: (provider) => provider.mobile || '', render: (provider) => provider.mobile },
    { key: 'address', label: 'Address', value: (provider) => provider.address || '', render: (provider) => provider.address },
    { key: 'service', label: 'Services Knows', value: (provider) => provider.service || 'Service Provider', render: (provider) => provider.service || 'Service Provider' },
    { key: 'status', label: 'Profile Status', value: (provider) => provider.blocked ? 'Blocked' : provider.status || '', render: (provider) => <span className={provider.blocked ? 'table-status blocked' : 'table-status complete'}>{provider.blocked ? 'Blocked' : provider.status}</span> },
    { key: 'accessAction', label: 'Block / Unblock', value: (provider) => provider.blocked ? 'Unblock' : 'Block', render: (provider) => <button className={provider.blocked ? 'table-action approve' : 'table-action block'} onClick={() => requestConfirmation(provider.blocked ? 'Unblock' : 'Block', provider, () => toggleProviderAccess(provider))}>{provider.blocked ? 'Unblock' : 'Block'}</button> },
    { key: 'comment', label: 'Comment', value: (provider) => provider.comment || '', render: (provider) => editingAccessId === provider.id ? <input value={provider.comment} onChange={(event) => updateAccessProvider(provider.id, 'comment', event.target.value)} aria-label={`Comment for ${provider.name}`} /> : provider.comment },
    { key: 'edit', label: 'Edit', value: (provider) => provider.name || '', render: (provider) => editingAccessId === provider.id ? <button className="table-action" onClick={() => setEditingAccessId(null)}>Save</button> : <button className="table-icon-action" onClick={() => setEditingAccessId(provider.id)} title="Edit provider comment" aria-label={`Edit ${provider.name}`}><Pencil size={14} /></button> },
    { key: 'adminName', label: 'Admin Name', value: (provider) => provider.accessAdmin?.name || 'Pending', render: (provider) => provider.accessAdmin?.name || 'Pending' },
    { key: 'adminMobile', label: 'Admin Mobile Number', value: (provider) => provider.accessAdmin?.mobile || 'Pending', render: (provider) => provider.accessAdmin?.mobile || 'Pending' },
    { key: 'accessAt', label: 'Blocked & Unblocked Date & Time', value: (provider) => provider.accessAdmin?.date || '', sortType: 'date', render: (provider) => formatAdminApprovalDateTime(provider.accessAdmin?.date) },
  ]
  const sortedAccessProviders = sortAdminTableRows(filterAdminProviderRows(providers, accessProviderSearch), accessProviderColumns, accessProviderSort)
  const sortAccessProvidersBy = (key) => setAccessProviderSort((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }))

  const pendingProviderColumns = [
    { key: 'name', label: 'Service Provider Name', value: (provider) => provider.name || '', render: (provider) => editingId === provider.id ? <input value={provider.name} onChange={(event) => updateProvider(provider.id, 'name', event.target.value)} /> : <strong>{provider.name}</strong> },
    { key: 'mobile', label: 'Mobile Number', value: (provider) => provider.mobile || '', render: (provider) => editingId === provider.id ? <input value={provider.mobile} onChange={(event) => updateProvider(provider.id, 'mobile', event.target.value)} /> : provider.mobile },
    { key: 'address', label: 'Address', value: (provider) => provider.address || '', render: (provider) => editingId === provider.id ? <input value={provider.address} onChange={(event) => updateProvider(provider.id, 'address', event.target.value)} /> : provider.address },
    { key: 'service', label: 'Services Knows', value: (provider) => provider.service || '', render: (provider) => editingId === provider.id ? <select value={provider.service} onChange={(event) => updateProvider(provider.id, 'service', event.target.value)}>{labourTypes.map((service) => <option key={service}>{service}</option>)}</select> : provider.service },
    { key: 'workPhoto', label: 'Work Images', value: (provider) => provider.workPhoto || '', render: (provider) => <img className="work-photo" src={provider.workPhoto} alt={`${provider.name} completed work`} /> },
    { key: 'status', label: 'Profile Status', value: (provider) => provider.status || '', render: (provider) => <span className="table-status progress">{provider.status}</span> },
    { key: 'adminAction', label: 'Admin Action', value: (provider) => provider.name || '', render: (provider) => <div className="approval-actions">{editingId === provider.id ? <button className="table-action" onClick={() => setEditingId(null)}>Save</button> : <button className="table-icon-action" onClick={() => setEditingId(provider.id)} title="Edit provider" aria-label={`Edit ${provider.name}`}><Pencil size={14} /></button>}<button className="table-action approve" onClick={() => requestConfirmation('Approve', provider, () => approveProvider(provider))}>Approve</button></div> },
    { key: 'adminName', label: 'Admin Name', value: (provider) => provider.approval?.admin || 'Pending', render: (provider) => provider.approval?.admin || 'Pending' },
    { key: 'adminMobile', label: 'Admin Mobile Number', value: (provider) => provider.approval?.mobile || 'Pending', render: (provider) => provider.approval?.mobile || 'Pending' },
    { key: 'requestDate', label: 'Approval Request Date & Time', value: (provider) => provider.requestDate || '', sortType: 'date', render: (provider) => formatAdminApprovalDateTime(provider.requestDate) },
  ]
  const sortedPendingProviders = sortAdminTableRows(filterAdminProviderRows(pendingProviders, pendingProviderSearch), pendingProviderColumns, pendingProviderSort)
  const sortPendingProvidersBy = (key) => setPendingProviderSort((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }))

  return <div className="admin-dashboard-content">
    <div className="admin-dashboard-header"><div><h3>{adminView === 'payments' ? 'Payment Status' : adminView === 'employers' ? 'Employers' : adminView === 'service-providers' ? 'Customers' : 'Service Providers Management'}</h3></div><div className="admin-dashboard-actions"><button className="admin-dashboard-link" type="button" onClick={() => adminView === 'providers' ? onHome?.() : changeAdminView('providers')} aria-label={adminView === 'providers' ? 'Back to home' : 'Back to Service Providers Management'}><ArrowLeft size={14} /> Back</button><button className="admin-dashboard-link" type="button" onClick={() => changeAdminView('payments')}>Payment Status</button><button className="admin-dashboard-link" type="button" onClick={() => changeAdminView('employers')}>Employers</button><button className="admin-dashboard-link" type="button" onClick={() => changeAdminView('service-providers')}>Customers</button></div></div>
    {adminView === 'payments' ? <AdminPaymentStatus providers={providers} /> : adminView === 'employers' ? <AdminEmployers employers={employers} /> : adminView === 'service-providers' ? <AdminServiceProviders customers={customers} /> : <>
    <div className="admin-dashboard-grid">
      <div className="admin-stat"><strong>{activeProviderCount}</strong><span>Active Service Providers</span></div>
      <div className="admin-stat"><strong>{inactiveProviderCount}</strong><span>Inactive Service Providers</span></div>
      <div className="admin-stat"><strong>{blockedProviderCount}</strong><span>Blocked Service Providers</span></div>
    </div>
    <AdminTableSection title="Active Service Providers" description="Monitor approved service providers profiles.">
      <div className="admin-table-search"><label><span>Search</span><input type="search" value={activeProviderSearch} onChange={(event) => setActiveProviderSearch(event.target.value)} placeholder="Name or mobile number" aria-label="Search Active Service Providers by name or mobile number" /></label></div>
      <div className="admin-table-wrap">
        <table className="admin-table" id="service-providers">
          <SortableTableHeader columns={activeProviderColumns} sort={activeProviderSort} onSort={sortActiveProvidersBy} />
          <tbody>{sortedActiveProviders.length ? sortedActiveProviders.map((provider) => <tr key={provider.id}>{activeProviderColumns.map(({ key, render }) => <td key={`${provider.id}-${key}`}>{render(provider)}</td>)}</tr>) : <tr><td className="admin-table-empty" colSpan={activeProviderColumns.length}>No service providers match your search.</td></tr>}</tbody>
        </table>
      </div>
    </AdminTableSection>
    <AdminTableSection title="Service Providers Access" description="Block or unblock service providers and record Admin comments.">
      <div className="admin-table-search"><label><span>Search</span><input type="search" value={accessProviderSearch} onChange={(event) => setAccessProviderSearch(event.target.value)} placeholder="Name or mobile number" aria-label="Search Service Providers Access by name or mobile number" /></label></div>
      <div className="admin-table-wrap">
        <table className="admin-table access-table">
          <SortableTableHeader columns={accessProviderColumns} sort={accessProviderSort} onSort={sortAccessProvidersBy} />
          <tbody>{sortedAccessProviders.length ? sortedAccessProviders.map((provider) => <tr key={provider.id}>{accessProviderColumns.map(({ key, render }) => <td key={`${provider.id}-${key}`}>{render(provider)}</td>)}</tr>) : <tr><td className="admin-table-empty" colSpan={accessProviderColumns.length}>No service providers match your search.</td></tr>}</tbody>
        </table>
      </div>
    </AdminTableSection>
    <AdminTableSection eyebrow="Admin Review Required" title="Newly Registered Service Providers" description="Review service providers details and approve new profiles.">
      <div className="admin-table-search"><label><span>Search</span><input type="search" value={pendingProviderSearch} onChange={(event) => setPendingProviderSearch(event.target.value)} placeholder="Name or mobile number" aria-label="Search Newly Registered Service Providers by name or mobile number" /></label></div>
      <div className="admin-table-wrap">
        <table className="admin-table approval-table">
          <SortableTableHeader columns={pendingProviderColumns} sort={pendingProviderSort} onSort={sortPendingProvidersBy} />
          <tbody>{sortedPendingProviders.length ? sortedPendingProviders.map((provider) => <tr key={provider.id}>{pendingProviderColumns.map(({ key, render }) => <td key={`${provider.id}-${key}`}>{render(provider)}</td>)}</tr>) : <tr><td className="admin-table-empty" colSpan={pendingProviderColumns.length}>No service providers match your search.</td></tr>}</tbody>
        </table>
      </div>
    </AdminTableSection>
    </>}
    {confirmation && <div className="admin-confirm-backdrop" role="presentation"><section className="admin-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><p className="eyebrow">Confirm action</p><h3 id="confirm-title">{confirmation.action} provider?</h3><p>{confirmation.action} {confirmation.provider.name} will update their provider access status.</p><div className="admin-confirm-actions"><button className="table-action" onClick={() => setConfirmation(null)}>Cancel</button><button className="table-action approve" onClick={() => { confirmation.onConfirm(); setConfirmation(null) }}>Confirm</button></div></section></div>}
  </div>
}

function AdminServiceProviders({ customers }) {
  const [search, setSearch] = useState('')
  const filteredCustomers = filterAdminProviderRows(customers, search)

  return <div>
    <AdminTableSection description="Customer names and contact details.">
      <div className="admin-table-search"><label><span>Search</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Customer name or mobile number" aria-label="Search customer records by customer name or mobile number" /></label></div>
      <div className="admin-table-wrap"><table className="admin-table service-provider-list-table"><thead><tr><th>Customer Name</th><th>Mobile Number</th><th>Address</th></tr></thead><tbody>{filteredCustomers.length ? filteredCustomers.map((customer) => <tr key={customer.id}><td><strong>{customer.name}</strong></td><td>{customer.mobile}</td><td>{customer.address}</td></tr>) : <tr><td className="admin-table-empty" colSpan={3}>No customer records found.</td></tr>}</tbody></table></div>
    </AdminTableSection>
  </div>
}

function AdminEmployers({ employers }) {
  return <section className="admin-employers-page" aria-label="Employers">
    <p className="admin-payment-intro">Registered employer profiles and account status.</p>
    <EmployerProfilesTable employers={employers} />
  </section>
}

function EmployerProfilesTable({ employers }) {
  return <div className="admin-table-wrap">
    <table className="admin-table employer-profiles-table">
      <thead><tr><th>Employer Name</th><th>Mobile Number</th><th>Address</th><th>Status</th></tr></thead>
      <tbody>{employers.length ? employers.map((employer) => <tr key={employer.id}>
        <td><strong>{employer.name}</strong></td>
        <td>{employer.mobile}</td>
        <td>{employer.address}</td>
        <td><span className={employer.status === 'Resigned' ? 'table-status blocked' : 'table-status complete'}>{employer.status}</span></td>
      </tr>) : <tr><td className="admin-table-empty" colSpan={4}>No employer profiles found.</td></tr>}</tbody>
    </table>
  </div>
}

function AdminPaymentStatus({ providers }) {
  const [paymentSort, setPaymentSort] = useState({ key: 'providerName', direction: 'asc' })
  const [fromPaymentDate, setFromPaymentDate] = useState('')
  const [toPaymentDate, setToPaymentDate] = useState('')
  const { minDate, maxDate } = getAdminPaymentDateBounds()
  const hasDateFilter = Boolean(fromPaymentDate || toPaymentDate)
  const invalidDateRange = Boolean(fromPaymentDate && toPaymentDate && fromPaymentDate > toPaymentDate)
  const getPaymentAmounts = (provider) => {
    const amount = Number(provider.amount) || 0
    const isPendingWithCustomer = String(provider.paymentStatus || '').toLowerCase().includes('pending with customer')
    const customerPays = isPendingWithCustomer ? 0 : amount
    const platformFee = isPendingWithCustomer ? 0 : amount * getAppCommissionRate(amount) / 100
    return { customerPays, providerReceives: customerPays - platformFee, platformFee }
  }
  const columns = [
    { key: 'providerName', label: 'Service Provider Name', value: (provider) => provider.name || '', render: (provider) => <strong>{provider.name}</strong> },
    { key: 'providerMobile', label: 'Mobile Number', value: (provider) => provider.mobile || '', render: (provider) => provider.mobile },
    { key: 'serviceAddress', label: 'Service Address', value: (provider) => provider.address || '', render: (provider) => provider.address },
    { key: 'customerName', label: 'Customer Name', value: (provider) => provider.customer || '', render: (provider) => provider.customer },
    { key: 'customerMobile', label: 'Customer Mobile Number', value: (provider) => provider.customerMobile || '', render: (provider) => provider.customerMobile },
    { key: 'customerAddress', label: 'Customer Address', value: (provider) => provider.customerAddress || '', render: (provider) => provider.customerAddress },
    { key: 'paymentStatus', label: 'Payment Status', value: (provider) => provider.paymentStatus || '', render: (provider) => <span className={String(provider.paymentStatus).includes('done') ? 'table-status complete' : 'table-status progress'}>{provider.paymentStatus}</span> },
    { key: 'paymentDate', label: 'Payment Date & Time', value: (provider) => provider.paymentDate || '', sortType: 'date', render: (provider) => formatAdminApprovalDateTime(provider.paymentDate) },
    { key: 'customerPays', label: 'Customer Pays', value: (provider) => getPaymentAmounts(provider).customerPays, sortType: 'number', render: (provider) => `₹${getPaymentAmounts(provider).customerPays.toLocaleString('en-IN')}` },
    { key: 'providerReceives', label: 'Service Provider Receives', value: (provider) => getPaymentAmounts(provider).providerReceives, sortType: 'number', render: (provider) => `₹${getPaymentAmounts(provider).providerReceives.toLocaleString('en-IN')}` },
    { key: 'platformFee', label: 'Platform Fee', value: (provider) => getPaymentAmounts(provider).platformFee, sortType: 'number', render: (provider) => `₹${getPaymentAmounts(provider).platformFee.toLocaleString('en-IN')}` },
  ]
  const filteredProviders = providers.filter((provider) => provider.paymentStatus).filter((provider) => {
    const paymentDate = parseAdminApprovalDate(provider.paymentDate)
    if (!paymentDate) return !hasDateFilter
    const paymentDay = formatAdminDateInputValue(paymentDate)
    if (paymentDay < minDate || paymentDay > maxDate) return false
    return !invalidDateRange && (!fromPaymentDate || paymentDay >= fromPaymentDate) && (!toPaymentDate || paymentDay <= toPaymentDate)
  })
  const sortedProviders = sortAdminTableRows(filteredProviders, columns, paymentSort)
  const sortByColumn = (key) => setPaymentSort((current) => ({
    key,
    direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
  }))

  return <section className="admin-payment-page" aria-label="Payment status">
    <p className="admin-payment-intro">Track resolved customer payments and pending customer payments.</p>
    <div className="admin-payment-filters" aria-label="Search payments by date">
      <label><span>From date</span><input type="date" value={fromPaymentDate} min={minDate} max={maxDate} onChange={(event) => setFromPaymentDate(event.target.value)} aria-label="Payment date from" /></label>
      <label><span>To date</span><input type="date" value={toPaymentDate} min={minDate} max={maxDate} onChange={(event) => setToPaymentDate(event.target.value)} aria-label="Payment date to" /></label>
      <p>Choose dates within the last six months.</p>
      {hasDateFilter && <button className="admin-payment-clear" type="button" onClick={() => { setFromPaymentDate(''); setToPaymentDate('') }}>Clear dates</button>}
    </div>
    {invalidDateRange && <p className="admin-payment-range-error" role="alert">From date must be on or before To date.</p>}
    <div className="admin-table-wrap">
      <table className="admin-table payment-status-table">
        <SortableTableHeader columns={columns} sort={paymentSort} onSort={sortByColumn} />
        <tbody>{sortedProviders.length ? sortedProviders.map((provider) => <tr key={provider.id}>{columns.map(({ key, render }) => <td key={`${provider.id}-${key}`}>{render(provider)}</td>)}</tr>) : <tr><td className="admin-table-empty" colSpan={columns.length}>No payment records match the selected date range.</td></tr>}</tbody>
      </table>
    </div>
  </section>
}

function AdminTableSection({ eyebrow, title, description, children }) {
  return <section className="admin-table-section"><div className="admin-section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}{title && <h3>{title}</h3>}<p>{description}</p></div></div>{children}</section>
}
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
