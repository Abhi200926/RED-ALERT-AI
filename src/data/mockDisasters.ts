import { Alert, DisasterType, SafetyGuide, TimelineEvent } from '../types';

export const ALL_CLEAR_ALERT: Alert = {
  id: 'alert-safe-0',
  disasterType: 'Severe Storm',
  severity: 'SAFE',
  title: 'ALL CLEAR',
  description: 'Currently no critical disaster alert detected in your selected area.',
  location: 'Downtown Metro Corridor',
  latitude: 37.7749,
  longitude: -122.4194,
  timestamp: 'Just now',
  source: 'RED ALERT AI Multi-Sensor Grid',
  isDemo: false,
  confidence: 'High',
  affectedRadiusKm: 0,
  distanceKm: 0,
  officialWarning: 'Normal Operations',
  parameters: {
    'Radar Reflectivity': '12 dBZ (Clear)',
    'Seismic Threshold': '0.01g (Stable)',
    'Wind Velocity': '14 km/h (Gentle)',
    'Precipitation': '0.0 mm/h',
    'Hydrological Gauge': 'Normal Baseline',
  },
  aiAnalysis: {
    explanation:
      'All local atmospheric, seismic, and hydrological telemetry values remain well below safety warning thresholds. No hazardous environmental phenomena are presently detected.',
    safetyActions: [
      'Maintain standard household emergency readiness kit.',
      'Keep mobile device notifications active for regional weather alerts.',
      'Review family emergency rendezvous points quarterly.',
    ],
    confidenceIndicator: 'High',
    disclaimer:
      'Always follow authoritative instructions issued by local emergency management and meteorological departments.',
  },
};

export const DEMO_PRESETS: Record<string, Alert> = {
  'Heavy Rain': {
    id: 'demo-heavy-rain-0',
    disasterType: 'Heavy Rain',
    severity: 'CRITICAL',
    title: 'TORRENTIAL HEAVY RAIN & CLOUDBURST SURGE',
    description: 'Extreme cloudburst precipitation overwhelming stormwater drainage and causing rapid surface pooling.',
    location: 'Metropolitan Valley & Drainage Basin',
    latitude: 37.7849,
    longitude: -122.4094,
    timestamp: '1 min ago',
    source: 'RED ALERT AI Multi-Sensor Doppler Radar',
    isDemo: true,
    confidence: 'High',
    affectedRadiusKm: 25,
    distanceKm: 2.1,
    officialWarning: 'Severe Heavy Rainfall & Flash Hazard Emergency',
    parameters: {
      'Precipitation Rate': '112 mm/hr (Torrential)',
      'Accumulation (3h)': '185 mm',
      'Doppler Reflectivity': '62 dBZ (Extreme Downpour)',
      'Visibility Range': '< 200 meters',
      'Drainage Load': '100% (Critical Overflow)',
    },
    aiAnalysis: {
      explanation:
        'Sustained convective cloudburst over the valley basin is delivering torrential rainfall exceeding 110 mm/hour. Rapid runoff is overloading culverts and storm drains, producing immediate street pooling and imminent floodwater inundation.',
      safetyActions: [
        'Avoid all non-essential travel; torrential rain drastically reduces visibility and roadway friction.',
        'Clear ground-level drains around your dwelling if safe to do so before water levels surge.',
        'Move electronics, vital medication, and essential kits to higher floors.',
      ],
      confidenceIndicator: 'High',
      disclaimer:
        'DEMO ALERT: In real scenarios, heed all advisories issued by national meteorological bureaus and emergency management.',
    },
  },
  Flood: {
    id: 'demo-flood-1',
    disasterType: 'Flood',
    severity: 'CRITICAL',
    title: 'FLASH FLOOD EMERGENCY',
    description: 'Potential severe flooding detected with rapid river catchment surge.',
    location: 'Riverfront Basin & Lowland Valley',
    latitude: 37.7849,
    longitude: -122.4094,
    timestamp: '2 mins ago',
    source: 'RED ALERT AI Demo Simulator',
    isDemo: true,
    confidence: 'High',
    affectedRadiusKm: 18,
    distanceKm: 3.2,
    officialWarning: 'Immediate Flash Flood Warning Issued',
    parameters: {
      'Precipitation Rate': '88 mm/hr (Extreme)',
      'River Level': '+3.6m Above Flood Stage',
      'Runoff Saturation': '98% Soil Capacity',
      'Dam Spillway Status': 'Overflow Spill Active',
    },
    aiAnalysis: {
      explanation:
        'Flood risk appears acutely elevated because sustained torrential rainfall is overwhelming municipal drainage systems while primary river levels rise at 45cm/hour. Rapid inundation of low-lying roadways and subterranean structures is imminent.',
      safetyActions: [
        'Move immediately to higher elevation or upper floors if in designated lowlands.',
        'Never drive or wade through floodwaters — turn around, do not drown.',
        'Disconnect primary electrical breakers if water approaches dwelling entryways.',
      ],
      confidenceIndicator: 'High',
      disclaimer:
        'DEMO ALERT: In real scenarios, heed all immediate evacuation notices issued by local emergency authorities.',
    },
  },
  Cyclone: {
    id: 'demo-cyclone-2',
    disasterType: 'Cyclone',
    severity: 'CRITICAL',
    title: 'SEVERE TROPICAL CYCLONE ALERT',
    description: 'Dangerous category storm system with destructive wind gusts and storm surge.',
    location: 'Coastal District & Harbor Corridor',
    latitude: 37.7949,
    longitude: -122.3994,
    timestamp: '5 mins ago',
    source: 'RED ALERT AI Demo Simulator',
    isDemo: true,
    confidence: 'High',
    affectedRadiusKm: 65,
    distanceKm: 14.8,
    officialWarning: 'Cyclone Warning / Storm Surge Advisory',
    parameters: {
      'Max Sustained Winds': '210 km/h (Category 4)',
      'Peak Gust Velocity': '245 km/h',
      'Central Pressure': '938 hPa',
      'Anticipated Surge': '3.8 meters above high tide',
    },
    aiAnalysis: {
      explanation:
        'Extreme cyclonic core circulation presents severe structural damage potential from sustained gale-force winds and devastating coastal surge. Heavy debris flight poses life-threatening hazards outdoors.',
      safetyActions: [
        'Shelter immediately in an interior, windowless room on the lowest safe floor.',
        'Close and brace all exterior storm shutters, windows, and heavy doors.',
        'Keep battery-operated radio and emergency power banks within arm’s reach.',
      ],
      confidenceIndicator: 'High',
      disclaimer:
        'DEMO ALERT: Always verify with official civil protection and national meteorological agencies.',
    },
  },
  Earthquake: {
    id: 'demo-earthquake-3',
    disasterType: 'Earthquake',
    severity: 'CRITICAL',
    title: 'MAJOR SEISMIC SHAKING DETECTED',
    description: 'Crustal fault rupture with severe ground acceleration detected.',
    location: 'Urban Metro Region & Epicenter Zone',
    latitude: 37.7549,
    longitude: -122.4294,
    timestamp: 'Just now',
    source: 'RED ALERT AI Demo Simulator',
    isDemo: true,
    confidence: 'High',
    affectedRadiusKm: 42,
    distanceKm: 6.5,
    officialWarning: 'Immediate Earthquake Safety Alert',
    parameters: {
      'Estimated Magnitude': 'M 6.8',
      'Hypocenter Depth': '9.4 km',
      'Peak Ground Accel.': '0.44g (Violent)',
      'Estimated Duration': '38 seconds',
    },
    aiAnalysis: {
      explanation:
        'High-amplitude S-waves and surface waves are radiating from shallow epicenter rupture. High risk of masonry collapse, glass breakage, infrastructure fractures, and strong subsequent aftershocks.',
      safetyActions: [
        'Drop, Cover, and Hold On under sturdy furniture immediately.',
        'Protect your head and neck; stay away from windows, unanchored shelving, and facades.',
        'Expect significant aftershocks within minutes and hours following initial rupture.',
      ],
      confidenceIndicator: 'High',
      disclaimer:
        'DEMO ALERT: Follow official guidelines from national geological surveys and local disaster responders.',
    },
  },
  Landslide: {
    id: 'demo-landslide-4',
    disasterType: 'Landslide',
    severity: 'CRITICAL',
    title: 'HIGH DEBRIS FLOW & LANDSLIDE RISK',
    description: 'Slope shear failure and mass soil movement triggered by heavy rainfall.',
    location: 'Highland Ridge & Hillside Settlement',
    latitude: 37.7649,
    longitude: -122.4494,
    timestamp: '8 mins ago',
    source: 'RED ALERT AI Demo Simulator',
    isDemo: true,
    confidence: 'Moderate',
    affectedRadiusKm: 12,
    distanceKm: 4.1,
    officialWarning: 'Geotechnical Slope Hazard Warning',
    parameters: {
      '72-Hr Rainfall Total': '240 mm',
      'Pore Water Pressure': 'Critical Saturation Level',
      'Inclinometer Drift': '14 mm/hr (Rapid Shearing)',
      'Slope Angle': '38 Degrees',
    },
    aiAnalysis: {
      explanation:
        'Geotechnical sensors confirm rapid saturation and shear slippage along high-gradient hillsides. Unstable soil mantle may liquefy into rapid-moving mud and debris flows down natural gullies.',
      safetyActions: [
        'Evacuate hillside structures and canyon valley floors without delay.',
        'Listen for telltale warning signs: cracking trees, rumbling sounds, or sudden water discoloration.',
        'Never cross mountain channels or creek beds when rainfall is torrential.',
      ],
      confidenceIndicator: 'Moderate',
      disclaimer:
        'DEMO ALERT: Coordinate with local municipality emergency services for safe evacuation corridors.',
    },
  },
  'Severe Storm': {
    id: 'demo-storm-5',
    disasterType: 'Severe Storm',
    severity: 'WARNING',
    title: 'SEVERE THUNDERSTORM & HAIL WARNING',
    description: 'Supercell cell tracking with damaging wind squalls and large hail.',
    location: 'North Valley & Airport Corridor',
    latitude: 37.8049,
    longitude: -122.4294,
    timestamp: '11 mins ago',
    source: 'RED ALERT AI Demo Simulator',
    isDemo: true,
    confidence: 'High',
    affectedRadiusKm: 30,
    distanceKm: 8.7,
    officialWarning: 'Severe Weather Warning In Effect',
    parameters: {
      'Max Gusts': '115 km/h',
      'Hail Diameter': 'Up to 4.5 cm (Golf Ball Size)',
      'Lightning Frequency': '48 strikes/min',
      'Atmospheric Shear': 'Severe Downdraft Risk',
    },
    aiAnalysis: {
      explanation:
        'Radar profiles show an intense mesocyclone structure with elevated core reflectivity. High probability of structural roof degradation, hazardous road conditions, and sudden power line breakage.',
      safetyActions: [
        'Seek substantial shelter indoors immediately; park vehicles inside garages.',
        'Unplug sensitive electronic appliances to protect against electrical surges.',
        'Stay clear of exterior windows and skylights until the storm cell passes.',
      ],
      confidenceIndicator: 'High',
      disclaimer:
        'DEMO ALERT: Check authoritative meteorological service radars for microburst updates.',
    },
  },
  Wildfire: {
    id: 'demo-wildfire-6',
    disasterType: 'Wildfire',
    severity: 'CRITICAL',
    title: 'EXTREME WILDFIRE BEHAVIOR ADVISORY',
    description: 'Rapid fire front propagation fueled by dry conditions and high winds.',
    location: 'East Canyon Foothills & Perimeter',
    latitude: 37.7449,
    longitude: -122.3894,
    timestamp: '14 mins ago',
    source: 'RED ALERT AI Demo Simulator',
    isDemo: true,
    confidence: 'High',
    affectedRadiusKm: 35,
    distanceKm: 9.3,
    officialWarning: 'Red Flag Emergency Evacuation Stage 2',
    parameters: {
      'Relative Humidity': '8% (Extreme Dryness)',
      'Wind Gusts': '58 km/h erratic',
      'Spotting Distance': 'Up to 2.5 km downwind',
      'Fuel Moisture': 'Critically Depleted',
    },
    aiAnalysis: {
      explanation:
        'Fire front is demonstrating erratic crown runs and extensive ember spotting ahead of main firelines. Shifts in wind direction create volatile perimeter expansion toward interface communities.',
      safetyActions: [
        'Prepare to evacuate immediately if ordered; back vehicle into driveway with emergency bag packed.',
        'Close all windows, roof vents, and doors; remove combustible porch furniture.',
        'Wear N95/P100 respirators to prevent inhalation of toxic particulate matter.',
      ],
      confidenceIndicator: 'High',
      disclaimer:
        'DEMO ALERT: Obey all firefighter and sheriff department evacuation orders promptly.',
    },
  },
  Tsunami: {
    id: 'demo-tsunami-7',
    disasterType: 'Tsunami',
    severity: 'CRITICAL',
    title: 'TSUNAMI WARNING — INUNDATION RISK',
    description: 'Oceanic wave surge generated by subduction zone seismic activity.',
    location: 'Coastal Lowlands & Maritime Harbor',
    latitude: 37.8149,
    longitude: -122.4094,
    timestamp: '16 mins ago',
    source: 'RED ALERT AI Demo Simulator',
    isDemo: true,
    confidence: 'High',
    affectedRadiusKm: 50,
    distanceKm: 2.1,
    officialWarning: 'Major Coastal Inundation Warning',
    parameters: {
      'Deep Sea Buoy Anomaly': '+2.9m water column shift',
      'Estimated Wave Arrival': '22 minutes',
      'Anticipated Inundation': 'Up to 6.2 meters',
      'Source Rupture': 'Offshore Trench Fault',
    },
    aiAnalysis: {
      explanation:
        'Ocean bottom pressure sensors confirm a series of high-energy tsunami waves traveling across coastal shelves. The initial wave is not necessarily the largest; successive crests may arrive over hours.',
      safetyActions: [
        'Move inland and to high ground (at least 30 meters above sea level) immediately.',
        'Never go to the coast to watch tsunami waves; if you can see the wave you are too close.',
        'Remain on elevated terrain until regional maritime authorities cancel warning status.',
      ],
      confidenceIndicator: 'High',
      disclaimer:
        'DEMO ALERT: Always rely on official coastal tsunami warning centers.',
    },
  },
  'Extreme Heat': {
    id: 'demo-heat-8',
    disasterType: 'Extreme Heat',
    severity: 'WATCH',
    title: 'EXCESSIVE HEAT OUTLOOK',
    description: 'Prolonged high thermal index with elevated heat illness danger.',
    location: 'Central Valley Basin',
    latitude: 37.7649,
    longitude: -122.4194,
    timestamp: '25 mins ago',
    source: 'RED ALERT AI Demo Simulator',
    isDemo: true,
    confidence: 'Moderate',
    affectedRadiusKm: 80,
    distanceKm: 0,
    officialWarning: 'Excessive Heat Advisory',
    parameters: {
      'Ambient Temperature': '43.2°C (110°F)',
      'Heat Index': '49.0°C',
      'Wet-Bulb Temp': '31.5°C (Dangerous)',
      'Nighttime Low': '29.0°C (Minimal Relief)',
    },
    aiAnalysis: {
      explanation:
        'Stagnant high-pressure dome is trapping intense thermal radiation. Nighttime temperatures provide insufficient physiological cooling, dramatically increasing risk of heat exhaustion and heatstroke.',
      safetyActions: [
        'Stay indoors in air-conditioned environments during peak daytime hours (11am - 5pm).',
        'Drink ample water and electrolyte-rich liquids; avoid strenuous outdoor labor.',
        'Never leave children or pets inside parked vehicles for any duration.',
      ],
      confidenceIndicator: 'Moderate',
      disclaimer:
        'DEMO ALERT: Review local public health cooling center directories.',
    },
  },
};

export const DISASTER_TYPES_METADATA: Array<{
  type: DisasterType;
  icon: string;
  defaultSeverity: 'SAFE' | 'WATCH' | 'WARNING' | 'CRITICAL';
  description: string;
}> = [
  { type: 'Heavy Rain', icon: 'CloudRain', defaultSeverity: 'SAFE', description: 'Torrential downpours, cloudbursts & drainage overload' },
  { type: 'Flood', icon: 'Waves', defaultSeverity: 'SAFE', description: 'River surges, flash floods & urban runoff' },
  { type: 'Cyclone', icon: 'Wind', defaultSeverity: 'SAFE', description: 'Tropical cyclones, typhoons & hurricanes' },
  { type: 'Earthquake', icon: 'Activity', defaultSeverity: 'SAFE', description: 'Tectonic faults, tremors & shaking' },
  { type: 'Landslide', icon: 'Mountain', defaultSeverity: 'SAFE', description: 'Slope failures, mudslides & debris flows' },
  { type: 'Severe Storm', icon: 'CloudLightning', defaultSeverity: 'SAFE', description: 'Supercells, damaging winds & hail' },
  { type: 'Wildfire', icon: 'Flame', defaultSeverity: 'SAFE', description: 'Brushfires, forest fires & ember fronts' },
  { type: 'Tsunami', icon: 'Anchor', defaultSeverity: 'SAFE', description: 'Oceanic surges & coastal inundation' },
  { type: 'Extreme Heat', icon: 'SunMedium', defaultSeverity: 'SAFE', description: 'Thermal domes & deadly wet-bulb spikes' },
];

export const SAFETY_GUIDES: Record<DisasterType, SafetyGuide> = {
  'Heavy Rain': {
    disasterType: 'Heavy Rain',
    iconName: 'CloudRain',
    summary: 'Sustained or sudden extreme precipitation that quickly overwhelms natural soil absorption and municipal storm drains.',
    before: [
      'Inspect roof gutters, downspouts, and drainage grates; clear leaves and debris.',
      'Check vehicle wiper blades and tire tread if travel is unavoidable.',
      'Charge all emergency power banks and communication devices in case of power trips.',
    ],
    during: [
      'Stay off roads; hydroplaning can occur in just 3 mm of standing water.',
      'Never attempt to drive or walk through flooded underpasses or low roadways.',
      'Stay away from storm drains, culverts, and fast-flowing drainage channels.',
    ],
    after: [
      'Inspect basement and foundation for dampness or water penetration.',
      'Avoid downed power lines which may carry live voltage through wet puddles.',
      'Report blocked municipal storm drains to local civil works crews.',
    ],
    evacuationTip: 'If water begins entering your home, safely shut off main circuit breakers and retreat to an upper floor.',
  },
  Flood: {
    disasterType: 'Flood',
    iconName: 'Waves',
    summary: 'Rapid accumulation of water over normally dry land, frequently triggered by intense precipitation or dam releases.',
    before: [
      'Know your community’s flood hazard zones and evacuation routes.',
      'Elevate essential appliances, electrical panels, and critical documents.',
      'Keep waterproof boots, life vests, and sandbags readily accessible.',
    ],
    during: [
      'Turn Around, Don’t Drown! Just 15 cm (6 inches) of moving water can knock you down.',
      'Evacuate immediately if instructed by local emergency authorities.',
      'Never drive onto flooded roadways or across low water bridges.',
      'Avoid basements and low-lying ground rooms as water levels rise.',
    ],
    after: [
      'Wait for official declaration that it is safe before returning home.',
      'Avoid standing floodwaters contaminated with sewage or hazardous chemicals.',
      'Document flood property damage with photos before clearing debris.',
    ],
    evacuationTip: 'Head directly toward designated higher ground shelters; avoid valleys and drainage ditches.',
  },
  Cyclone: {
    disasterType: 'Cyclone',
    iconName: 'Wind',
    summary: 'Organized atmospheric storm system characterized by intense cyclonic winds, torrential rain, and storm surges.',
    before: [
      'Install cyclone shutters or board up windows with marine plywood.',
      'Trim weak tree branches and secure loose outdoor patio furniture.',
      'Store at least 7 days of non-perishable food and potable water.',
    ],
    during: [
      'Stay indoors in the most reinforced interior room (e.g. hallway or bathroom).',
      'Do not be fooled by the calm eye of the storm; winds will violently reverse.',
      'Keep battery-operated radios tuned to civil defense broadcasts.',
    ],
    after: [
      'Beware of downed live electrical wires, broken glass, and weakened roofs.',
      'Report gas leaks or fallen power lines immediately.',
      'Assist injured neighbors if safe to do so.',
    ],
    evacuationTip: 'Leave coastal barrier islands and mobile home parks early before bridges close due to gale-force winds.',
  },
  Earthquake: {
    disasterType: 'Earthquake',
    iconName: 'Activity',
    summary: 'Sudden, violent shaking of the ground resulting from subterranean movements along tectonic plates or faults.',
    before: [
      'Anchor heavy furniture, water heaters, and bookshelves to wall studs.',
      'Practice "Drop, Cover, and Hold On" drills with your household regularly.',
      'Prepare a disaster supply kit with sturdy shoes near your bed.',
    ],
    during: [
      'DROP onto your hands and knees to prevent being knocked over.',
      'COVER your head and neck under a sturdy table, desk, or against an interior wall.',
      'HOLD ON to your shelter until all shaking completely ceases.',
      'Do NOT run outside while shaking is occurring; falling facade debris is deadly.',
    ],
    after: [
      'Check yourself and nearby persons for injuries; apply first aid.',
      'Inspect gas lines for leaks; turn off gas valve only if you smell or hear a leak.',
      'Expect aftershocks which may trigger further damage to weakened structures.',
    ],
    evacuationTip: 'If trapped in debris, tap on a pipe or wall so rescuers can hear you; cover mouth to avoid inhaling dust.',
  },
  Landslide: {
    disasterType: 'Landslide',
    iconName: 'Mountain',
    summary: 'Gravitational movement of a mass of rock, earth, or debris down a slope, often triggered by rainfall saturation.',
    before: [
      'Consult geotechnical maps for historical landslide paths in your area.',
      'Plant deep-rooted ground cover on slopes and build retaining walls where engineered.',
      'Watch for sticking doors, new cracks in foundations, or leaning trees.',
    ],
    during: [
      'Evacuate immediately if you notice unusual sounds like trees snapping or rumbling rocks.',
      'Move out of the direct path of the slide or debris flow as fast as possible.',
      'If escape is impossible, curl into a tight ball and protect your head.',
    ],
    after: [
      'Stay away from the slide area; secondary flows may occur hours later.',
      'Check for damaged utility lines, broken pipelines, and undermined roadbeds.',
      'Direct emergency responders to locations where trapped individuals might be.',
    ],
    evacuationTip: 'Flee perpendicular to the flow direction; never attempt to outrun a fast-moving mudflow down a ravine.',
  },
  'Severe Storm': {
    disasterType: 'Severe Storm',
    iconName: 'CloudLightning',
    summary: 'Violent atmospheric disturbances involving intense lightning, destructive microburst winds, and damaging hail.',
    before: [
      'Monitor local Doppler radar updates when severe storm watches are posted.',
      'Park vehicles inside garages or away from large overhanging trees.',
      'Secure loose outdoor items that could become airborne missiles.',
    ],
    during: [
      'Shelter inside a sturdy building away from windows, glass doors, and skylights.',
      'Avoid using corded phones or plumbing fixtures during active lightning strikes.',
      'If driving, pull safely off the road, turn on hazard flashers, and stay in vehicle.',
    ],
    after: [
      'Never touch fallen electrical cables; assume all downed lines are live and fatal.',
      'Report power outages to utility operators.',
      'Inspect your roof and chimney for hail and wind damage from a safe distance.',
    ],
    evacuationTip: 'When thunder roars, go indoors. Nowhere outside is safe during a lightning thunderstorm.',
  },
  Wildfire: {
    disasterType: 'Wildfire',
    iconName: 'Flame',
    summary: 'Uncontrolled fires spreading through combustible vegetation, exacerbated by droughts, high winds, and heat.',
    before: [
      'Maintain 30 meters of defensible space around your home by clearing brush.',
      'Clean pine needles and leaves from roofs, gutters, and under wooden decks.',
      'Pack an evacuation "Go-Bag" with N95 masks, goggles, medication, and clothes.',
    ],
    during: [
      'Evacuate immediately upon receipt of an Evacuation Order; do not hesitate.',
      'Turn on your car headlights, close vehicle vents, and drive carefully through smoke.',
      'If trapped at home, close all doors/windows, fill tubs with water, and shelter in interior rooms.',
    ],
    after: [
      'Do not enter burnt forest land until declared safe by fire officials; ash pits remain hot.',
      'Wear protective respirator masks, heavy gloves, and boots when sifting debris.',
      'Discard any food exposed to heat, smoke, or toxic soot.',
    ],
    evacuationTip: 'Leave early. Roadways quickly become congested with fleeing residents and incoming emergency fire engines.',
  },
  Tsunami: {
    disasterType: 'Tsunami',
    iconName: 'Anchor',
    summary: 'Series of enormous ocean waves caused by offshore undersea earthquakes, volcanic eruptions, or coastal landslides.',
    before: [
      'Know the tsunami evacuation zones, signage, and high ground access points.',
      'Understand natural warning signs: strong earthquake shaking or sudden ocean retreat.',
      'Prepare emergency provisions that you can carry quickly on foot.',
    ],
    during: [
      'If you feel a strong earthquake near the coast, MOVE INLAND AND UPWARD IMMEDIATELY.',
      'Never wait for an official siren if the sea noticeably recedes exposing the seabed.',
      'Climb to at least the 3rd floor of a reinforced concrete building if escape to high ground is impossible.',
    ],
    after: [
      'Stay away from the coast. Tsunami waves arrive in pulses spanning several hours.',
      'Listen to official marine VHF and emergency radio updates.',
      'Do not navigate boats back into shallow harbors until harbor masters give clearance.',
    ],
    evacuationTip: 'Go on foot if roads are jammed. Move inland at least 2 kilometers or 30 meters above sea level.',
  },
  'Extreme Heat': {
    disasterType: 'Extreme Heat',
    iconName: 'SunMedium',
    summary: 'Prolonged periods of excessively hot and humid weather with potentially fatal heat stress indices.',
    before: [
      'Check air conditioning functionality and seal window weather-stripping.',
      'Locate designated community cooling centers in your neighborhood.',
      'Stock plenty of drinking water and oral rehydration salts.',
    ],
    during: [
      'Stay in air-conditioned buildings as much as possible.',
      'Limit outdoor athletic and physical activities to dawn or late dusk.',
      'Drink cold water continuously, even if you do not feel thirsty.',
      'Recognize heatstroke symptoms: confusion, dizziness, rapid pulse, lack of sweat.',
    ],
    after: [
      'Continue hydrating and monitoring elderly relatives or isolated neighbors.',
      'Take cool showers or use damp towels to safely lower core body temperature.',
    ],
    evacuationTip: 'Visit public libraries, civic centers, or shopping malls for free air-conditioned refuge during heat emergencies.',
  },
};

export const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'evt-1',
    time: '10:42 AM',
    title: 'Regional hydrological sensor alerts high water surge',
    source: 'National Hydrological Network',
    severity: 'WARNING',
    disasterType: 'Flood',
  },
  {
    id: 'evt-2',
    time: '10:35 AM',
    title: 'Precipitation intensity recorded at 88mm/hr in North Basin',
    source: 'Doppler Radar Telemetry',
    severity: 'WARNING',
    disasterType: 'Severe Storm',
  },
  {
    id: 'evt-3',
    time: '10:20 AM',
    title: 'Automated weather risk index updated from Low to Elevated',
    source: 'RED ALERT AI Multi-Sensor Grid',
    severity: 'WATCH',
    disasterType: 'Flood',
  },
  {
    id: 'evt-4',
    time: '09:45 AM',
    title: 'Routine seismic and atmospheric calibration check complete (All Nominal)',
    source: 'Emergency Dispatch Hub',
    severity: 'SAFE',
    disasterType: 'Earthquake',
  },
];

export const INITIAL_ALERT_HISTORY: Alert[] = [
  {
    id: 'hist-1',
    disasterType: 'Flood',
    severity: 'CRITICAL',
    title: 'River Basin Flash Flood Warning',
    description: 'High runoff triggered sudden low-lying inundation across suburban corridors.',
    location: 'Riverfront Basin & Lowland Valley',
    latitude: 37.7849,
    longitude: -122.4094,
    timestamp: '2026-09-10 10:42 AM',
    source: 'RED ALERT AI Demo Simulator',
    isDemo: true,
    confidence: 'High',
    affectedRadiusKm: 18,
    officialWarning: 'Flash Flood Emergency',
    parameters: {
      'Precipitation Rate': '88 mm/hr',
      'River Crest': '+3.6m',
    },
    aiAnalysis: {
      explanation: 'Simulated high flood telemetry triggered emergency awareness actions.',
      safetyActions: ['Evacuate lowlands', 'Avoid flooded roads', 'Disconnect power breakers'],
      confidenceIndicator: 'High',
      disclaimer: 'DEMO ALERT: Always consult local emergency services.',
    },
  },
  {
    id: 'hist-2',
    disasterType: 'Severe Storm',
    severity: 'WARNING',
    title: 'Supercell Hail & Squall Advisory',
    description: 'Wind gusts exceeding 100 km/h with 4cm hail reports.',
    location: 'North Metro Corridor',
    latitude: 37.8049,
    longitude: -122.4294,
    timestamp: '2026-09-08 04:15 PM',
    source: 'National Weather Observation Stream',
    isDemo: false,
    confidence: 'High',
    affectedRadiusKm: 28,
    officialWarning: 'Severe Weather Warning',
    parameters: {
      'Max Wind Gusts': '112 km/h',
      'Hail Diameter': '4.2 cm',
    },
    aiAnalysis: {
      explanation: 'Convective cell triggered high downdraft hazard across airport approach paths.',
      safetyActions: ['Park cars inside', 'Avoid exterior windows', 'Prepare for outages'],
      confidenceIndicator: 'High',
      disclaimer: 'Archived historical advisory for validation.',
    },
  },
  {
    id: 'hist-3',
    disasterType: 'Earthquake',
    severity: 'WATCH',
    title: 'Offshore Tremor Swarm Notice',
    description: 'M 4.6 offshore tremor detected with mild coastal ground perception.',
    location: 'Outer Shelf Subduction Zone',
    latitude: 37.6549,
    longitude: -122.5894,
    timestamp: '2026-09-02 08:30 AM',
    source: 'USGS Global Seismographic Network',
    isDemo: false,
    confidence: 'Moderate',
    affectedRadiusKm: 50,
    officialWarning: 'Informational Seismic Bulletin',
    parameters: {
      'Magnitude': 'M 4.6',
      'Depth': '14 km',
    },
    aiAnalysis: {
      explanation: 'Moderate tremor recorded without structural failure threshold breach.',
      safetyActions: ['Inspect foundation walls', 'Ensure emergency kit is stocked'],
      confidenceIndicator: 'Moderate',
      disclaimer: 'Recorded by national seismic observation networks.',
    },
  },
  {
    id: 'hist-4',
    disasterType: 'Extreme Heat',
    severity: 'WATCH',
    title: 'Heat Wave Health Caution',
    description: 'Triple-digit temperature dome settled over inland valleys.',
    location: 'Central Valley Basin',
    latitude: 37.7649,
    longitude: -122.4194,
    timestamp: '2026-08-27 12:00 PM',
    source: 'Meteorological Department Heat Outlook',
    isDemo: false,
    confidence: 'High',
    affectedRadiusKm: 75,
    officialWarning: 'Heat Health Advisory',
    parameters: {
      'Peak Temperature': '42.5°C',
      'Heat Index': '47°C',
    },
    aiAnalysis: {
      explanation: 'High wet-bulb temperatures present elevated heat exhaustion risks for vulnerable populations.',
      safetyActions: ['Stay hydrated', 'Utilize cooling centers', 'Avoid direct sun exposure'],
      confidenceIndicator: 'High',
      disclaimer: 'Official meteorological advisory record.',
    },
  },
];

export const PRESET_LOCATIONS = [
  { name: 'Tokyo, Japan (High Seismic / Typhoon Zone)', lat: 35.6762, lng: 139.6503 },
  { name: 'Miami, USA (Coastal Hurricane / Flood Zone)', lat: 25.7617, lng: -80.1918 },
  { name: 'Manila, Philippines (Typhoon / Volcanic Corridor)', lat: 14.5995, lng: 120.9842 },
  { name: 'San Francisco, USA (San Andreas Fault Zone)', lat: 37.7749, lng: -122.4194 },
  { name: 'Jakarta, Indonesia (Flood & Coastal Inundation)', lat: -6.2088, lng: 106.8456 },
  { name: 'Sydney, Australia (Bushfire & Severe Storm Zone)', lat: -33.8688, lng: 151.2093 },
  { name: 'Athens, Greece (Wildfire & Seismic Basin)', lat: 37.9838, lng: 23.7275 },
  { name: 'Mumbai, India (Monsoon Flash Flood Corridor)', lat: 19.0760, lng: 72.8777 },
];

export const SAFE_ALERT = ALL_CLEAR_ALERT;
export const HISTORICAL_ALERTS = INITIAL_ALERT_HISTORY;

export function generateSimulatedAlert(type: DisasterType, targetLocation?: string): Alert {
  const base = DEMO_PRESETS[type] || DEMO_PRESETS['Flood'];
  return {
    ...base,
    id: `sim-${Date.now()}`,
    location: targetLocation || base.location,
    timestamp: 'Just now',
    isDemo: true,
  };
}
