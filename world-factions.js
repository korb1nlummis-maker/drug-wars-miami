// ============================================================
// Drug Wars: Miami Vice Edition — World Factions
// 26 factions across 10 global regions (including Miami)
// ============================================================

// WORLD_REGIONS is defined in world-regions.js (loaded before this file)

const WORLD_FACTIONS = [

  // ========== CARIBBEAN (3) ==========

  {
    id: "yardie_massive",
    name: "Yardie Massive",
    emoji: "🇯🇲",
    territory: ["kingston"],
    specialty: "cocaine",
    leader: {
      name: "Buju 'Bullet' Thompson",
      title: "Don Dada",
      age: 45,
      style: "Charismatic and feared. Rules through respect and extreme violence against betrayers."
    },
    strength: 6,
    soldiers: [15, 30],
    dmg: [8, 16],
    strengths: "Caribbean shipping network. Deep community ties in Kingston. Weed supply monopoly in Jamaica. Loyal foot soldiers.",
    weaknesses: "Limited reach outside Caribbean. Prone to internal feuds. Under constant Jamaican police pressure.",
    operatingStyle: "Community-embedded gangsterism. Music culture as front. Explosive retaliation. Code of silence.",
    color: "#FFD700",
    region: "caribbean",
    characterRelations: {},
    factionRelations: {
      zoe_pound: 30,
      dominican_don: 10,
      bahamian_syndicate: 20,
      medellin_cartel: -10,
      bloods_crips: 10,
      los_cubanos: -10
    },
    trades: { sells: ["weed", "cocaine"], buys: ["firearms"] },
    missionTypes: ["smuggling_run", "turf_defense", "shipment_escort", "rival_hit"],
    warTriggers: ["attack_territory", "steal_shipment", "disrespect_culture", "snitch"],
    uniqueMechanic: "caribbean_shipping",
    desc: "Jamaican drug gang with deep roots in Kingston. Their Caribbean shipping network moves product through island chains into Miami and the US East Coast."
  },

  {
    id: "dominican_don",
    name: "The Dominican Don",
    emoji: "🇩🇴",
    territory: ["santo_domingo"],
    specialty: "cocaine",
    leader: {
      name: "Rafael 'El Rey' Santana",
      title: "El Rey",
      age: 52,
      style: "Regal and calculating. Runs his operation like a kingdom with feudal loyalty."
    },
    strength: 5,
    soldiers: [10, 20],
    dmg: [10, 18],
    strengths: "Island hopping distribution. Strong connections to Colombian suppliers. Controls Dominican ports.",
    weaknesses: "Smaller operation than competitors. Contested territory with local rivals. Limited military hardware.",
    operatingStyle: "Island-based distribution. Uses fishing fleets and tourist boats. Moves product through multiple island hops to avoid interdiction.",
    color: "#CE1126",
    region: "caribbean",
    characterRelations: {},
    factionRelations: {
      yardie_massive: 10,
      bahamian_syndicate: 20,
      medellin_cartel: 30,
      cali_organization: 20,
      five_families: -20,
      los_cubanos: -30
    },
    trades: { sells: ["cocaine", "ecstasy"], buys: ["weed", "firearms"] },
    missionTypes: ["island_run", "port_bribe", "supply_escort", "territory_expansion"],
    warTriggers: ["undercut_prices", "attack_shipments", "betray_deal", "federal_exposure"],
    uniqueMechanic: "island_hopping",
    desc: "Dominican Republic cartel running cocaine and ecstasy through an island-hopping distribution network. Multiple stops, harder to intercept."
  },

  {
    id: "bahamian_syndicate",
    name: "The Bahamian Syndicate",
    emoji: "🇧🇸",
    territory: ["nassau"],
    specialty: "money_laundering",
    leader: {
      name: "Marcus Sterling III",
      title: "The Banker",
      age: 58,
      style: "Refined, educated at Oxford. Speaks softly but controls billions in offshore accounts."
    },
    strength: 4,
    soldiers: [5, 10],
    dmg: [6, 12],
    strengths: "Offshore banking access. Legitimate business fronts. Political connections in Bahamas. Clean image.",
    weaknesses: "Almost no muscle. Dependent on other factions for protection. Vulnerable if banking secrecy laws change.",
    operatingStyle: "White-collar criminal operation. Suits and spreadsheets. Violence is outsourced, never direct.",
    color: "#00778B",
    region: "caribbean",
    characterRelations: {},
    factionRelations: {
      yardie_massive: 20,
      dominican_don: 20,
      medellin_cartel: 40,
      cali_organization: 40,
      eastern_bloc: 30,
      five_families: 30,
      port_authority: 20
    },
    trades: { sells: ["money_laundering", "offshore_accounts"], buys: ["cocaine"] },
    missionTypes: ["laundering_operation", "bank_setup", "diplomatic_meet", "evidence_destruction"],
    warTriggers: ["expose_accounts", "federal_investigation", "steal_funds", "betray_client"],
    uniqueMechanic: "offshore_banking",
    desc: "Bahamas-based laundering network. They clean money for half the cartels in the Western Hemisphere through offshore banking channels."
  },

  // ========== SOUTH AMERICA (3) ==========

  {
    id: "medellin_cartel",
    name: "Medellín Cartel",
    emoji: "🇨🇴",
    territory: ["medellin", "bogota"],
    specialty: "cocaine",
    leader: {
      name: "Don Alejandro Reyes",
      title: "El Patrón",
      age: 63,
      style: "Old-school narco king. Builds hospitals for the poor, buries enemies in concrete."
    },
    strength: 10,
    soldiers: [50, 100],
    dmg: [20, 35],
    strengths: "Unlimited cocaine supply. Massive infrastructure. Sicario armies. Political and military corruption. Generational wealth.",
    weaknesses: "High-profile target for DEA. Internal power struggles. Increasing pressure from Colombian government.",
    operatingStyle: "Total domination. Controls production, processing, and primary export. Plata o plomo — silver or lead.",
    color: "#FFFFFF",
    region: "south_america",
    characterRelations: {},
    factionRelations: {
      cali_organization: -60,
      pcc_brazil: 20,
      colombian_connection: 60,
      sinaloa_cartel: 30,
      los_cubanos: 30,
      bahamian_syndicate: 40,
      dominican_don: 30,
      ms_13: 10
    },
    trades: { sells: ["cocaine"], buys: ["weapons", "precursors"] },
    missionTypes: ["massive_shipment", "sicario_hit", "lab_defense", "political_bribe"],
    warTriggers: ["steal_cocaine", "betray_cartel", "work_with_cali", "dea_cooperation"],
    uniqueMechanic: "unlimited_cocaine",
    desc: "The Medellín Cartel. Unlimited cocaine supply from Colombian highlands. The source of the source. Getting a direct line means never worrying about supply again."
  },

  {
    id: "pcc_brazil",
    name: "Primeiro Comando da Capital",
    emoji: "🇧🇷",
    territory: ["sao_paulo"],
    specialty: "multi",
    leader: {
      name: "Marcos 'O Professor' Santos",
      title: "O Professor",
      age: 48,
      style: "Intellectual criminal mastermind. Runs the organization from inside prison with a philosophy degree."
    },
    strength: 8,
    soldiers: [40, 80],
    dmg: [12, 22],
    strengths: "Prison network intelligence. Massive membership. Controls Brazilian drug trade. Can coordinate prison riots as leverage.",
    weaknesses: "Leadership frequently imprisoned. Internal factions. Operations concentrated in Brazil. Language barrier for international ops.",
    operatingStyle: "Organized from within prisons. Uses burner phones, coded messages. Membership is lifelong — leave and you die.",
    color: "#009C3B",
    region: "south_america",
    characterRelations: {},
    factionRelations: {
      medellin_cartel: 20,
      cali_organization: 10,
      lagos_syndicate: 20,
      guinea_partners: 10,
      camorra: 10,
      vice_lords: -10
    },
    trades: { sells: ["cocaine", "weed", "crack"], buys: ["weapons", "ecstasy"] },
    missionTypes: ["prison_coordination", "mass_smuggling", "territory_war", "intelligence_op"],
    warTriggers: ["attack_members", "prison_betrayal", "undercut_territory", "snitch"],
    uniqueMechanic: "prison_network",
    desc: "Brazil's most powerful criminal faction. Their prison network provides intelligence on every criminal in South America. Information is power."
  },

  {
    id: "cali_organization",
    name: "Cali Organization",
    emoji: "🇨🇴",
    territory: ["cali"],
    specialty: "cocaine",
    leader: {
      name: "Isabella 'La Viuda' Morales",
      title: "La Viuda (The Widow)",
      age: 44,
      style: "Took over after her husband was killed. Twice as ruthless, ten times smarter. Masters political manipulation."
    },
    strength: 9,
    soldiers: [30, 60],
    dmg: [18, 30],
    strengths: "Political infiltration at every level. Sophisticated logistics. Intelligence network rivals state agencies. Clean public image.",
    weaknesses: "Rivalry with Medellín limits expansion. Dependent on political allies who can flip. Less street muscle than competitors.",
    operatingStyle: "Gentleman criminals. Bribes over bullets. Own politicians, judges, generals. Violence is a last resort but absolutely devastating.",
    color: "#4B0082",
    region: "south_america",
    characterRelations: {},
    factionRelations: {
      medellin_cartel: -60,
      pcc_brazil: 10,
      colombian_connection: 30,
      five_families: 20,
      bahamian_syndicate: 40,
      mocro_mafia: 20,
      dominican_don: 20
    },
    trades: { sells: ["cocaine"], buys: ["precursors", "intelligence"] },
    missionTypes: ["political_operation", "intelligence_gathering", "supply_deal", "rival_sabotage"],
    warTriggers: ["political_exposure", "work_with_medellin", "betray_trust", "attack_infrastructure"],
    uniqueMechanic: "political_infiltration",
    desc: "The Cali Organization. Where Medellín uses bombs, Cali uses bribes. They own senators, judges, and generals. Their political reach is their deadliest weapon."
  },

  // ========== CENTRAL AMERICA (2) ==========

  {
    id: "ms_13",
    name: "Mara Salvatrucha (MS-13)",
    emoji: "🔪",
    territory: ["guatemala_city", "tegucigalpa", "san_salvador"],
    specialty: "multi",
    leader: {
      name: "El Diablo",
      title: "Primera Palabra",
      age: 38,
      style: "Born in gang warfare. Face covered in tattoos. Rules through absolute terror and religious fanaticism."
    },
    strength: 7,
    soldiers: [50, 100],
    dmg: [10, 20],
    strengths: "Cross-border gang network. Massive membership across three countries. Extreme violence as deterrent. Recruitment pipeline from poverty.",
    weaknesses: "Decentralized command. Members easily identified by tattoos. Constant law enforcement targeting. Internal clique rivalries.",
    operatingStyle: "Terror-based control. Machete justice. Initiation through murder. Cliques operate semi-independently under shared banner.",
    color: "#0000CD",
    region: "central_america",
    characterRelations: {},
    factionRelations: {
      zetas_remnants: -30,
      sinaloa_cartel: 20,
      los_chapitos: 10,
      bloods_crips: -40,
      southern_boys: -30,
      medellin_cartel: 10
    },
    trades: { sells: ["cocaine", "meth", "extortion"], buys: ["firearms", "cocaine"] },
    missionTypes: ["cross_border_run", "extortion_racket", "territory_war", "recruitment_drive"],
    warTriggers: ["enter_territory", "disrespect_gang", "rival_gang_alliance", "police_cooperation"],
    uniqueMechanic: "cross_border_network",
    desc: "Mara Salvatrucha. A cross-border gang network spanning Guatemala, Honduras, and El Salvador. Their reach and brutality make them kingmakers in Central American drug transit."
  },

  {
    id: "zetas_remnants",
    name: "Los Zetas Remnants",
    emoji: "💀",
    territory: ["managua"],
    specialty: "cocaine",
    leader: {
      name: "Comandante Zero",
      title: "Comandante",
      age: 50,
      style: "Ex-special forces. Treats the cartel like a military unit. Discipline through fear and execution."
    },
    strength: 6,
    soldiers: [15, 25],
    dmg: [20, 30],
    strengths: "Military-trained soldiers. Superior tactics and weapons handling. High damage per soldier. Discipline.",
    weaknesses: "Reduced numbers after cartel wars. No community support. Hunted by multiple governments. Paranoid leadership.",
    operatingStyle: "Military precision. Convoys, checkpoints, executions. Treat drug trade like counterinsurgency warfare.",
    color: "#333333",
    region: "central_america",
    characterRelations: {},
    factionRelations: {
      ms_13: -30,
      sinaloa_cartel: -50,
      cjng: -60,
      medellin_cartel: -20,
      russian_bratva: 20,
      biker_mc: 10
    },
    trades: { sells: ["cocaine", "weapons"], buys: ["intelligence", "safe_passage"] },
    missionTypes: ["military_operation", "ambush", "weapons_deal", "territory_seizure"],
    warTriggers: ["military_challenge", "territory_incursion", "betray_deal", "weakness_shown"],
    uniqueMechanic: "military_training",
    desc: "Remnants of Los Zetas. Military-trained and the most tactically dangerous cartel fighters in the game. Fewer soldiers, but each one hits like a squad."
  },

  // ========== MEXICO (3) ==========

  {
    id: "sinaloa_cartel",
    name: "Sinaloa Cartel",
    emoji: "🦅",
    territory: ["tijuana", "juarez", "culiacan"],
    specialty: "meth",
    leader: {
      name: "El Ingeniero",
      title: "The Engineer",
      age: 47,
      style: "Logistics genius. Designed the tunnel network. Runs the cartel like a Fortune 500 company."
    },
    strength: 10,
    soldiers: [100, 200],
    dmg: [25, 40],
    strengths: "Tunnel network for cross-border shipping. Massive territory. Multi-drug portfolio. Corrupted officials on both sides of the border.",
    weaknesses: "Size makes them a prime DEA target. Internal factional disputes. Rivalry with CJNG escalating.",
    operatingStyle: "Corporate cartel. Logistics-driven. Uses technology, tunnels, drones, submarines. Business first, violence when necessary.",
    color: "#C41E3A",
    region: "mexico",
    characterRelations: {},
    factionRelations: {
      cjng: -80,
      los_chapitos: 30,
      ms_13: 20,
      medellin_cartel: 30,
      five_families: 10,
      bloods_crips: 20,
      biker_mc: 20,
      colombian_connection: 20
    },
    trades: { sells: ["meth", "fentanyl", "cocaine", "heroin"], buys: ["precursors", "weapons"] },
    missionTypes: ["tunnel_shipment", "border_crossing", "super_lab_defense", "rival_cartel_war"],
    warTriggers: ["tunnel_discovery", "territory_incursion", "dea_cooperation", "work_with_cjng"],
    uniqueMechanic: "tunnel_network",
    desc: "The Sinaloa Cartel. Their tunnel network under the US-Mexico border means faster, safer cross-border shipping. The largest drug trafficking organization in the Western Hemisphere."
  },

  {
    id: "cjng",
    name: "Jalisco New Generation Cartel",
    emoji: "🔥",
    territory: ["mexico_city", "guadalajara"],
    specialty: "meth",
    leader: {
      name: "El Mencho Jr.",
      title: "El Señor",
      age: 35,
      style: "Young, ruthless, and expansionist. Inherited his father's empire and doubled it. Uses social media for propaganda."
    },
    strength: 9,
    soldiers: [80, 150],
    dmg: [22, 38],
    strengths: "Armored vehicle fleet. Aggressive expansion. Massive meth production. Military-grade weapons. Media intimidation.",
    weaknesses: "Too many fronts in too many wars. Government crackdowns. Young leadership makes impulsive decisions.",
    operatingStyle: "Shock and awe. Armored convoys, narco-banners, public executions. Designed to terrify competitors into submission.",
    color: "#FF4500",
    region: "mexico",
    characterRelations: {},
    factionRelations: {
      sinaloa_cartel: -80,
      los_chapitos: -40,
      zetas_remnants: -60,
      medellin_cartel: 10,
      cali_organization: 10,
      russian_bratva: 10,
      shan_warlords: 20
    },
    trades: { sells: ["meth", "fentanyl"], buys: ["precursors", "weapons", "cocaine"] },
    missionTypes: ["convoy_operation", "cartel_war", "lab_raid", "intimidation_campaign"],
    warTriggers: ["territory_challenge", "disrespect_cartel", "government_cooperation", "rival_alliance"],
    uniqueMechanic: "armored_fleet",
    desc: "CJNG. Their armored vehicle fleet — narco tanks, mounted guns, bulletproof convoys — gives them a combat edge no other faction can match on open ground."
  },

  {
    id: "los_chapitos",
    name: "Los Chapitos",
    emoji: "👑",
    territory: ["cancun"],
    specialty: "fentanyl",
    leader: {
      name: "Junior Guzmán",
      title: "El Junior",
      age: 30,
      style: "Flashy, social-media savvy. Posts threats on Instagram. Dangerous mix of privilege and brutality."
    },
    strength: 7,
    soldiers: [40, 80],
    dmg: [18, 28],
    strengths: "Fentanyl production dominance. Social media intimidation. Tourist corridor control in Cancún. Family name recognition.",
    weaknesses: "Seen as spoiled inheritors. US extradition pressure. Reliance on father's legacy. Sinaloa factional tensions.",
    operatingStyle: "Flashy narco culture. Gold-plated guns, exotic animals, Instagram posts. Use social media to terrorize rivals and recruit.",
    color: "#FFD700",
    region: "mexico",
    characterRelations: {},
    factionRelations: {
      sinaloa_cartel: 30,
      cjng: -40,
      medellin_cartel: 20,
      bloods_crips: 10,
      five_families: -10,
      ms_13: 10
    },
    trades: { sells: ["fentanyl", "cocaine"], buys: ["precursors", "luxury_goods"] },
    missionTypes: ["fentanyl_production", "social_media_op", "tourist_corridor_control", "extradition_evasion"],
    warTriggers: ["disrespect_family", "fentanyl_competition", "social_media_challenge", "territory_incursion"],
    uniqueMechanic: "social_media_intimidation",
    desc: "Los Chapitos. The next generation. Their social media intimidation campaigns can tank a rival's reputation and recruitment before a single shot is fired."
  },

  // ========== US CITIES (4) ==========

  {
    id: "five_families",
    name: "The Five Families",
    emoji: "🤵",
    territory: ["new_york", "las_vegas"],
    specialty: "cocaine",
    leader: {
      name: "Don Salvatore Bianchi",
      title: "The Don",
      age: 72,
      style: "Old-world Sicilian values. Never raises his voice. A whisper from him is a death sentence."
    },
    strength: 7,
    soldiers: [20, 40],
    dmg: [14, 24],
    strengths: "Union and construction money laundering. Political connections. Decades of infrastructure. Legal front businesses worth billions.",
    weaknesses: "RICO prosecutions thinning ranks. Aging membership. Struggling to compete with newer, more violent organizations.",
    operatingStyle: "Classic mob. Sit-downs, made men, codes of honor. Violence is surgical and deniable. Fronted by legitimate businesses.",
    color: "#1C1C1C",
    region: "us_cities",
    characterRelations: {},
    factionRelations: {
      bloods_crips: -30,
      vice_lords: -20,
      biker_mc: 10,
      cali_organization: 20,
      bahamian_syndicate: 30,
      camorra: 40,
      albanian_mafia: -20,
      sinaloa_cartel: 10,
      los_cubanos: 10,
      eastern_bloc: -20
    },
    trades: { sells: ["cocaine", "gambling"], buys: ["heroin", "ecstasy"] },
    missionTypes: ["construction_launder", "sit_down", "contract_hit", "union_operation"],
    warTriggers: ["disrespect_family", "territory_encroachment", "snitch", "attack_business"],
    uniqueMechanic: "union_laundering",
    desc: "Italian-American Mafia. The Five Families. Their union and construction rackets clean more money than most banks. Old power that still commands respect."
  },

  {
    id: "bloods_crips",
    name: "Blood & Crip Alliance",
    emoji: "🔴🔵",
    territory: ["los_angeles", "atlanta"],
    specialty: "crack",
    leader: {
      name: "Big Smoke Williams",
      title: "OG",
      age: 42,
      style: "United rival gangs under a truce. Charismatic, street-smart. The only man both sides listen to."
    },
    strength: 6,
    soldiers: [30, 60],
    dmg: [10, 18],
    strengths: "Nationwide street distribution. Massive numbers. Deep community presence. Established crack and weed markets.",
    weaknesses: "Fragile alliance between historic rivals. Decentralized command. Constant law enforcement pressure. Internal violence.",
    operatingStyle: "Street-level distribution. Set-based territories. Reputation-driven. Corner boys to OGs. Volume over price.",
    color: "#8B008B",
    region: "us_cities",
    characterRelations: {},
    factionRelations: {
      vice_lords: -20,
      five_families: -30,
      biker_mc: -40,
      ms_13: -40,
      sinaloa_cartel: 20,
      southern_boys: -30,
      zoe_pound: 10,
      yardie_massive: 10
    },
    trades: { sells: ["crack", "weed"], buys: ["cocaine", "firearms"] },
    missionTypes: ["street_distribution", "territory_war", "supply_run", "recruitment_drive"],
    warTriggers: ["enter_territory", "disrespect_set", "steal_customers", "snitch"],
    uniqueMechanic: "nationwide_distribution",
    desc: "Blood and Crip alliance. Nationwide street distribution network spanning LA to Atlanta. Nobody moves more product at street level."
  },

  {
    id: "vice_lords",
    name: "The Vice Lords",
    emoji: "♠️",
    territory: ["chicago", "detroit"],
    specialty: "heroin",
    leader: {
      name: "King Malik",
      title: "Supreme Chief",
      age: 46,
      style: "Prison-forged leader. Runs operations from both inside and outside. Commands through an iron hierarchy."
    },
    strength: 6,
    soldiers: [25, 50],
    dmg: [12, 20],
    strengths: "Prison recruitment pipeline. Strong hierarchy. Controls heroin and crack markets in Midwest. Deep institutional knowledge.",
    weaknesses: "Leadership frequently incarcerated. Rival Chicago gangs. Federal RICO attention. Territory limited to Midwest.",
    operatingStyle: "Hierarchical gang structure. Kings, elites, soldiers. Prison and street operations run in parallel.",
    color: "#B22222",
    region: "us_cities",
    characterRelations: {},
    factionRelations: {
      bloods_crips: -20,
      five_families: -20,
      biker_mc: -10,
      pcc_brazil: -10,
      southern_boys: -40,
      sinaloa_cartel: 10,
      chechen_network: 10
    },
    trades: { sells: ["heroin", "crack"], buys: ["cocaine", "firearms", "meth"] },
    missionTypes: ["prison_recruitment", "heroin_distribution", "territory_defense", "hierarchy_mission"],
    warTriggers: ["attack_territory", "disrespect_king", "recruit_poaching", "snitch"],
    uniqueMechanic: "prison_pipeline",
    desc: "The Vice Lords. Their prison recruitment pipeline means they never run out of soldiers. Every prison sentence is a recruitment opportunity."
  },

  {
    id: "biker_mc",
    name: "Iron Serpents MC",
    emoji: "🏍️",
    territory: ["houston"],
    specialty: "meth",
    leader: {
      name: "Axle 'Mad Dog' Henderson",
      title: "National President",
      age: 55,
      style: "Vietnam vet's son. Covered in scars and tattoos. Rides at the front of every run. Earned his patch in blood."
    },
    strength: 5,
    soldiers: [15, 30],
    dmg: [16, 26],
    strengths: "Highway transport network. Meth production expertise. Weapons cache. Brotherhood loyalty. Cross-state chapters.",
    weaknesses: "ATF surveillance. Aging membership. Limited urban presence. White-only membership limits recruitment pool.",
    operatingStyle: "Chapter-based hierarchy. Rides are cover for transport. Clubhouses double as stash houses. Brotherhood above all.",
    color: "#696969",
    region: "us_cities",
    characterRelations: {},
    factionRelations: {
      bloods_crips: -40,
      vice_lords: -10,
      five_families: 10,
      sinaloa_cartel: 20,
      zetas_remnants: 10,
      dixie_mafia: 30,
      russian_bratva: 10,
      southern_boys: 10
    },
    trades: { sells: ["meth", "weapons"], buys: ["cocaine", "weed"] },
    missionTypes: ["highway_run", "meth_cook", "weapons_deal", "chapter_defense"],
    warTriggers: ["attack_clubhouse", "steal_shipment", "disrespect_patch", "rat"],
    uniqueMechanic: "highway_transport",
    desc: "Outlaw Motorcycle Club. Their highway transport network moves meth and weapons across state lines using chapter-to-chapter relay runs."
  },

  // ========== MIAMI (1) ==========

  {
    id: "los_cubanos",
    name: "Los Cubanos",
    emoji: "🇨🇺",
    territory: ["little_havana", "hialeah"],
    specialty: "cocaine",
    leader: {
      name: "Reynaldo 'El Viejo' Castillo",
      title: "El Viejo",
      age: 70,
      style: "Old-guard exile patriarch. Patient as stone, ruthless when crossed. Runs Little Havana like a second homeland. Loyalty is earned, betrayal is buried."
    },
    strength: 6,
    soldiers: [12, 25],
    dmg: [12, 22],
    strengths: "Best cocaine pipeline in Miami — direct from Colombia through old exile networks. Deep political connections in Dade County. Generational loyalty. Established infrastructure.",
    weaknesses: "Aging leadership facing succession crisis. Slow to adapt to new markets. Two sons vying for control creates internal instability. Limited reach outside South Florida.",
    operatingStyle: "Old school. Handshake deals, face-to-face. Honor-based code — a man's word is everything. Betrayal means death, loyalty means family. Operates through legitimate Cuban businesses as fronts.",
    color: "#D4A017",
    region: "miami",
    characterRelations: {},
    factionRelations: {
      medellin_cartel: 30,
      cali_organization: 20,
      five_families: 10,
      yardie_massive: -10,
      dominican_don: -30,
      bahamian_syndicate: 20,
      bloods_crips: -20,
      sinaloa_cartel: 10,
      los_chapitos: -10
    },
    trades: { sells: ["cocaine"], buys: ["weed", "heroin", "firearms"] },
    missionTypes: ["supply_run", "territory_defense", "diplomatic_meet", "honor_kill"],
    warTriggers: ["betray_trust", "attack_territory", "disrespect_elder", "snitch"],
    uniqueMechanic: "succession_crisis",
    desc: "The oldest cocaine pipeline in Miami. Cuban exile network with a direct line from Colombia through Havana. Tradition is law in Little Havana — El Viejo's word moves mountains, but his two sons circle each other like sharks."
  },

  // ========== WESTERN EUROPE (3) ==========

  {
    id: "mocro_mafia",
    name: "Mocro Mafia",
    emoji: "🇳🇱",
    territory: ["amsterdam", "antwerp"],
    specialty: "ecstasy",
    leader: {
      name: "Ridouan 'The Phantom' Taghi",
      title: "The Phantom",
      age: 46,
      style: "Never stays in one place. Commands through encrypted messages. Has evaded Interpol for years."
    },
    strength: 8,
    soldiers: [20, 40],
    dmg: [16, 28],
    strengths: "Port control at Antwerp and Rotterdam. European ecstasy production monopoly. Sophisticated encrypted communications. Deep infiltration of port workers.",
    weaknesses: "Dutch and Belgian law enforcement cooperation intensifying. High-profile assassinations attract attention. Internal paranoia.",
    operatingStyle: "Ghost operations. Encrypted phones, compartmentalized cells. Controls the ports that feed all of Europe. Assassinations send messages.",
    color: "#FF6600",
    region: "western_europe",
    characterRelations: {},
    factionRelations: {
      camorra: 10,
      albanian_mafia: -30,
      cali_organization: 20,
      medellin_cartel: 20,
      russian_bratva: -10,
      triad_14k: 10,
      eastern_bloc: 20
    },
    trades: { sells: ["ecstasy", "cocaine"], buys: ["cocaine", "hashish"] },
    missionTypes: ["port_operation", "lab_production", "encrypted_deal", "assassination"],
    warTriggers: ["port_interference", "market_encroachment", "informant_discovered", "territory_challenge"],
    uniqueMechanic: "port_control",
    desc: "Mocro Mafia. They control the ports of Antwerp and Rotterdam — the gateway for cocaine into Europe. If it enters Europe by sea, they get a cut."
  },

  {
    id: "camorra",
    name: "The Camorra",
    emoji: "🇮🇹",
    territory: ["marseille", "barcelona"],
    specialty: "heroin",
    leader: {
      name: "Don Ciro Ferrante",
      title: "Don Ciro",
      age: 67,
      style: "Neapolitan old guard. Controls from a villa overlooking the Mediterranean. Speaks in metaphors, kills without them."
    },
    strength: 7,
    soldiers: [25, 50],
    dmg: [14, 24],
    strengths: "Mediterranean shipping routes. Centuries of organized crime experience. Deep political corruption. Legitimate business empire.",
    weaknesses: "Internal clan wars. Italian anti-mafia prosecution. Competition from newer organizations. Aging leadership.",
    operatingStyle: "Clan-based structure. Each clan controls specific territories and trades. United against outsiders, warring among themselves.",
    color: "#006400",
    region: "western_europe",
    characterRelations: {},
    factionRelations: {
      mocro_mafia: 10,
      albanian_mafia: -20,
      five_families: 40,
      russian_bratva: -10,
      pcc_brazil: 10,
      serbian_mafia: 10,
      cali_organization: 10
    },
    trades: { sells: ["heroin", "cocaine"], buys: ["hashish", "weapons"] },
    missionTypes: ["shipping_operation", "clan_politics", "territory_defense", "corruption_deal"],
    warTriggers: ["clan_disrespect", "shipping_interference", "territory_incursion", "police_cooperation"],
    uniqueMechanic: "mediterranean_shipping",
    desc: "The Camorra. Mediterranean shipping routes perfected over centuries. Their network moves product from North Africa through Southern Europe with clockwork precision."
  },

  {
    id: "albanian_mafia",
    name: "Albanian Mafia",
    emoji: "🇦🇱",
    territory: ["london", "hamburg"],
    specialty: "cocaine",
    leader: {
      name: "Arben 'The Wolf' Krasniqi",
      title: "The Wolf",
      age: 41,
      style: "Came from nothing in post-war Kosovo. Built an empire on pure ruthlessness. Never forgives, never forgets."
    },
    strength: 7,
    soldiers: [15, 30],
    dmg: [18, 30],
    strengths: "Ruthless reputation provides intimidation bonus. Tight clan loyalty. Control of UK cocaine market. Expanding aggressively across Europe.",
    weaknesses: "Relatively new to the game. Makes enemies fast. UK National Crime Agency focus. Clan disputes.",
    operatingStyle: "Clan-based, blood-oath loyalty. Extreme violence as brand strategy. Expanding into territories others consider settled.",
    color: "#E41E20",
    region: "western_europe",
    characterRelations: {},
    factionRelations: {
      mocro_mafia: -30,
      camorra: -20,
      five_families: -20,
      serbian_mafia: -50,
      chechen_network: -20,
      russian_bratva: -30,
      medellin_cartel: 20,
      cali_organization: 10
    },
    trades: { sells: ["cocaine", "weapons"], buys: ["heroin", "cannabis"] },
    missionTypes: ["territory_takeover", "intimidation_op", "cocaine_distribution", "clan_war"],
    warTriggers: ["territory_challenge", "disrespect_clan", "betray_blood_oath", "weakness_shown"],
    uniqueMechanic: "intimidation_bonus",
    desc: "Albanian Mafia. Their ruthless reputation precedes them — intimidation bonuses in negotiations and combat. When the Wolf sends a message, people listen."
  },

  // ========== EASTERN EUROPE (3) ==========

  {
    id: "russian_bratva",
    name: "Russian Bratva",
    emoji: "🇷🇺",
    territory: ["moscow"],
    specialty: "weapons",
    leader: {
      name: "Viktor 'The Bear' Volkov",
      title: "Pakhan",
      age: 58,
      style: "Former KGB. Runs the Bratva like an intelligence agency. Has files on everyone. Patience of a glacier, violence of an avalanche."
    },
    strength: 9,
    soldiers: [30, 60],
    dmg: [20, 35],
    strengths: "Weapons dealing — cheapest firearms anywhere. Ex-military arsenal. State-level connections. Cyber capabilities. Global reach.",
    weaknesses: "Kremlin entanglements cut both ways. Internal vory v zakone power struggles. Western sanctions limit financial operations.",
    operatingStyle: "Intelligence-driven. Blackmail, leverage, strategic violence. Treat crime like statecraft. Every move has three purposes.",
    color: "#B22222",
    region: "eastern_europe",
    characterRelations: {},
    factionRelations: {
      chechen_network: -40,
      serbian_mafia: 20,
      albanian_mafia: -30,
      eastern_bloc: 50,
      mocro_mafia: -10,
      camorra: -10,
      cjng: 10,
      sinaloa_cartel: 10,
      biker_mc: 10,
      shan_warlords: 20
    },
    trades: { sells: ["weapons", "heroin"], buys: ["cocaine", "ecstasy"] },
    missionTypes: ["arms_deal", "intelligence_op", "political_leverage", "cyber_operation"],
    warTriggers: ["betray_bratva", "steal_weapons", "work_with_chechens", "federal_cooperation"],
    uniqueMechanic: "weapons_dealer",
    desc: "Russian Bratva. The cheapest firearms in the world. Their ex-Soviet arsenal means you can arm an army for pennies on the dollar. The Bear always collects his debts."
  },

  {
    id: "chechen_network",
    name: "Chechen Network",
    emoji: "🐺",
    territory: ["kyiv", "istanbul"],
    specialty: "heroin",
    leader: {
      name: "Ramzan 'The Shadow' Dudayev",
      title: "The Shadow",
      age: 39,
      style: "Forged in two wars. Moves like smoke. His fighters would die before surrendering. Merciless but honors agreements."
    },
    strength: 7,
    soldiers: [15, 30],
    dmg: [22, 35],
    strengths: "Fearless fighters with combat bonus. War-hardened soldiers. Control heroin routes from Afghanistan through Turkey. Extreme loyalty.",
    weaknesses: "Small numbers. Multiple enemies. Constantly hunted. Limited infrastructure outside conflict zones.",
    operatingStyle: "Guerrilla-style operations. Small, deadly cells. Hit hard, disappear. Treat every operation like a military mission.",
    color: "#556B2F",
    region: "eastern_europe",
    characterRelations: {},
    factionRelations: {
      russian_bratva: -40,
      serbian_mafia: -10,
      albanian_mafia: -20,
      vice_lords: 10,
      shan_warlords: 20,
      sam_gor: 10,
      zetas_remnants: 10
    },
    trades: { sells: ["heroin", "hashish"], buys: ["weapons", "safe_passage"] },
    missionTypes: ["guerrilla_op", "heroin_convoy", "combat_mission", "border_crossing"],
    warTriggers: ["attack_cell", "betray_agreement", "work_with_russians", "territory_incursion"],
    uniqueMechanic: "combat_bonus",
    desc: "Chechen Network. Fearless fighters forged in two wars. Combat bonus in every engagement. They don't retreat, they don't surrender, and they never forget."
  },

  {
    id: "serbian_mafia",
    name: "Serbian Mafia",
    emoji: "🇷🇸",
    territory: ["prague", "belgrade"],
    specialty: "arms",
    leader: {
      name: "Dragan 'The Butcher' Petrovic",
      title: "The Butcher",
      age: 53,
      style: "Yugoslav War veteran. Built his empire on wartime weapons stockpiles. Methodical, cold, business-oriented."
    },
    strength: 6,
    soldiers: [10, 20],
    dmg: [16, 26],
    strengths: "Balkan route control for drugs flowing from Asia to Europe. Arms stockpiles from Yugoslav Wars. Strategic geographic position.",
    weaknesses: "Smaller than major competitors. EU law enforcement cooperation. Internal clan politics. Limited presence outside Balkans.",
    operatingStyle: "Transit-focused. Control the roads and borders, tax everything that passes through. Strategic alliances over brute force.",
    color: "#C6363C",
    region: "eastern_europe",
    characterRelations: {},
    factionRelations: {
      russian_bratva: 20,
      chechen_network: -10,
      albanian_mafia: -50,
      camorra: 10,
      sam_gor: 10,
      shan_warlords: 10,
      mocro_mafia: 10
    },
    trades: { sells: ["arms", "smuggling_routes"], buys: ["cocaine", "heroin"] },
    missionTypes: ["border_control", "arms_deal", "transit_operation", "route_defense"],
    warTriggers: ["route_interference", "territory_challenge", "albanian_alliance", "betrayal"],
    uniqueMechanic: "balkan_route",
    desc: "Serbian Mafia. They control the Balkan Route — the highway for heroin and arms flowing from Asia into Europe. Toll collectors of the underworld."
  },

  // ========== WEST AFRICA (2) ==========

  {
    id: "lagos_syndicate",
    name: "Lagos Syndicate",
    emoji: "🇳🇬",
    territory: ["lagos", "accra"],
    specialty: "cocaine_transit",
    leader: {
      name: "Chief Okonkwo 'The Godfather'",
      title: "The Godfather",
      age: 60,
      style: "Legitimate businessman by day. Philanthropist. Politician's best friend. Runs the largest cocaine transit network in West Africa."
    },
    strength: 6,
    soldiers: [20, 40],
    dmg: [8, 16],
    strengths: "Cyber fraud income stream. Cocaine transit hub between South America and Europe. Political corruption. Legitimate business fronts.",
    weaknesses: "Low combat capability. Dependent on South American supply. International fraud investigations. Internal corruption.",
    operatingStyle: "Business-oriented. Uses legitimate trade infrastructure for smuggling. Cyber fraud funds operations. Political protection above all.",
    color: "#008751",
    region: "west_africa",
    characterRelations: {},
    factionRelations: {
      guinea_partners: 30,
      medellin_cartel: 20,
      pcc_brazil: 20,
      camorra: 10,
      mocro_mafia: 10,
      bahamian_syndicate: 20,
      cali_organization: 10
    },
    trades: { sells: ["cocaine_transit", "fraud_services"], buys: ["cocaine", "precursors"] },
    missionTypes: ["transit_operation", "cyber_fraud", "political_bribe", "logistics_run"],
    warTriggers: ["expose_network", "steal_shipment", "political_betrayal", "fraud_interference"],
    uniqueMechanic: "cyber_fraud",
    desc: "Lagos Syndicate. Their cyber fraud income stream funds the operation even when drug shipments are seized. Two revenue streams, twice as resilient."
  },

  {
    id: "guinea_partners",
    name: "Guinea-Bissau Cartel Partners",
    emoji: "🇬🇼",
    territory: ["dakar", "conakry"],
    specialty: "cocaine_transit",
    leader: {
      name: "Capitão Silva",
      title: "Capitão",
      age: 50,
      style: "Former military officer. Staged a coup to protect the drug trade. The state IS the cartel."
    },
    strength: 5,
    soldiers: [10, 20],
    dmg: [10, 18],
    strengths: "Military government protection — the state protects the trade. Airstrips and ports for transatlantic cocaine. Immunity from local law enforcement.",
    weaknesses: "Dependent on South American suppliers. Political instability. International pressure. Limited infrastructure.",
    operatingStyle: "Narco-state operations. Military provides security, government provides cover. Cocaine planes land on military airstrips.",
    color: "#CE1126",
    region: "west_africa",
    characterRelations: {},
    factionRelations: {
      lagos_syndicate: 30,
      medellin_cartel: 30,
      cali_organization: 20,
      pcc_brazil: 10,
      camorra: 20,
      mocro_mafia: 10
    },
    trades: { sells: ["cocaine_transit", "airstrip_access"], buys: ["cocaine", "weapons"] },
    missionTypes: ["airstrip_operation", "military_escort", "transatlantic_run", "government_deal"],
    warTriggers: ["coup_attempt", "supply_cut", "international_exposure", "military_betrayal"],
    uniqueMechanic: "military_protection",
    desc: "Guinea-Bissau Cartel Partners. Military government protection means the state IS the cartel. Cocaine planes land on military airstrips untouched."
  },

  // ========== SOUTHEAST ASIA (3) ==========

  {
    id: "shan_warlords",
    name: "Shan State Warlords",
    emoji: "🇲🇲",
    territory: ["shan_state", "phnom_penh"],
    specialty: "opium",
    leader: {
      name: "General Khun Sa II",
      title: "The General",
      age: 55,
      style: "Warlord controlling a private army in the Golden Triangle. Commands from a mountain fortress. Rules like a feudal king."
    },
    strength: 8,
    soldiers: [50, 100],
    dmg: [12, 22],
    strengths: "Golden Triangle opium monopoly. Private army. Mountain fortress territory. Generational poppy farming expertise.",
    weaknesses: "Isolated geography. Limited international reach without partners. Myanmar civil war instability. DEA targeting.",
    operatingStyle: "Warlord feudalism. Controls poppy fields and processing labs in mountain territory. Private army provides security. Trades through intermediaries.",
    color: "#FFD700",
    region: "southeast_asia",
    characterRelations: {},
    factionRelations: {
      triad_14k: 30,
      sam_gor: 40,
      russian_bratva: 20,
      chechen_network: 20,
      cjng: 20,
      serbian_mafia: 10,
      medellin_cartel: 10
    },
    trades: { sells: ["opium", "heroin", "meth"], buys: ["weapons", "precursors"] },
    missionTypes: ["opium_harvest", "mountain_defense", "caravan_escort", "lab_operation"],
    warTriggers: ["attack_fields", "steal_opium", "rival_warlord", "government_offensive"],
    uniqueMechanic: "opium_monopoly",
    desc: "Shan State Warlords. Golden Triangle opium monopoly. They control the source — poppy fields stretching across mountain valleys. The original drug lords."
  },

  {
    id: "triad_14k",
    name: "14K Triad",
    emoji: "🐉",
    territory: ["hong_kong"],
    specialty: "multi",
    leader: {
      name: "Dragon Head Chen Wei",
      title: "Dragon Head",
      age: 65,
      style: "Ancient traditions meet modern finance. Ritual-bound leadership. Every member is blood-sworn. Centuries of criminal heritage."
    },
    strength: 8,
    soldiers: [30, 60],
    dmg: [14, 24],
    strengths: "Global laundering network. Centuries of infrastructure. Hong Kong financial hub access. Legitimate business empire spanning casinos and real estate.",
    weaknesses: "Chinese government crackdowns. Generational leadership transitions. Competition from mainland Chinese gangs. Tradition slows adaptation.",
    operatingStyle: "Ancient hierarchy with modern methods. Blood oaths, ritual initiation. Criminal conglomerate running drugs, gambling, laundering, and extortion.",
    color: "#FF0000",
    region: "southeast_asia",
    characterRelations: {},
    factionRelations: {
      sam_gor: 20,
      shan_warlords: 30,
      mocro_mafia: 10,
      five_families: 10,
      bahamian_syndicate: 20,
      russian_bratva: 10,
      eastern_bloc: 10
    },
    trades: { sells: ["heroin", "meth", "money_laundering"], buys: ["cocaine", "ecstasy"] },
    missionTypes: ["laundering_operation", "casino_run", "heroin_distribution", "triad_ritual"],
    warTriggers: ["disrespect_tradition", "territory_encroachment", "betray_blood_oath", "government_cooperation"],
    uniqueMechanic: "global_laundering",
    desc: "14K Triad. Their global laundering network spans Hong Kong, Macau, Vancouver, and Sydney. Money goes in dirty, comes out pristine. Centuries of practice."
  },

  {
    id: "sam_gor",
    name: "Sam Gor (The Company)",
    emoji: "💎",
    territory: ["bangkok", "ho_chi_minh", "manila"],
    specialty: "meth",
    leader: {
      name: "Tse Chi Lop",
      title: "The Phantom",
      age: 60,
      style: "The most wanted drug lord most people have never heard of. Runs the largest meth syndicate in the world from the shadows."
    },
    strength: 9,
    soldiers: [40, 80],
    dmg: [16, 28],
    strengths: "Largest meth syndicate in the world. Multi-national operation across five countries. Massive production capacity. Near-invisible leadership.",
    weaknesses: "Scale makes coordination complex. Multiple national law enforcement agencies targeting. Dependent on precursor chemical supply chains.",
    operatingStyle: "Corporate syndicate. Multi-national structure. Each country handles a piece: production, distribution, laundering. The Company runs like a Fortune 500.",
    color: "#9400D3",
    region: "southeast_asia",
    characterRelations: {},
    factionRelations: {
      triad_14k: 20,
      shan_warlords: 40,
      chechen_network: 10,
      serbian_mafia: 10,
      russian_bratva: 10,
      mocro_mafia: 10,
      cjng: 10,
      sinaloa_cartel: -20
    },
    trades: { sells: ["meth", "heroin"], buys: ["precursors", "cocaine"] },
    missionTypes: ["mega_production", "multi_national_op", "precursor_acquisition", "distribution_network"],
    warTriggers: ["precursor_interference", "market_competition", "expose_leadership", "law_enforcement_cooperation"],
    uniqueMechanic: "meth_syndicate",
    desc: "Sam Gor — The Company. The largest meth syndicate in the world. Their production capacity dwarfs everyone else. When they flood a market, prices collapse overnight."
  }

];

// ============================================================
// Utility Functions
// ============================================================

/**
 * Find a world faction by its id.
 * @param {string} id — faction id
 * @returns {object|null}
 */
function getWorldFactionById(id) {
  return WORLD_FACTIONS.find(f => f.id === id) || null;
}

/**
 * Return all world factions belonging to a given region.
 * @param {string} regionId — WORLD_REGIONS id
 * @returns {object[]}
 */
function getFactionsInRegion(regionId) {
  return WORLD_FACTIONS.filter(f => f.region === regionId);
}

/**
 * Initialize world faction standings on the game state object.
 * Only writes if state.worldFactions does not already exist.
 * Each faction gets a neutral standing record.
 * @param {object} state — the game state object
 */
function initWorldFactionState(state) {
  if (state.worldFactions) return;

  state.worldFactions = {};

  for (const faction of WORLD_FACTIONS) {
    state.worldFactions[faction.id] = {
      relation: 0,
      discovered: false,
      atWar: false,
      warDay: 0,
      missionsCompleted: 0,
      betrayals: 0,
      lastInteraction: 0,
      tradeAccess: false,
      supplierAccess: false,
      territoryPact: false
    };
  }
}
