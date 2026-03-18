// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Endings System
// 12 Campaign Endings + 8 NG+ Endings = 20 Total
// Each ending has sub-variants and quality grades (S/A/B/C)
// ============================================================

const CAMPAIGN_ENDINGS = [
  {
    id: 'kingpin', name: 'The Kingpin', emoji: '👑',
    desc: 'You rule Miami. Every district, every faction, every dollar flows through you.',
    requirements: {
      netWorth: 5000000,
      territoriesControlled: 10,
      factionAlliances: 3,
      crewSize: 15,
      reputation: 80,
    },
    endingMissions: [
      { id: 'E_K1', name: 'The Coronation', desc: 'Force all remaining factions to submit or fall.' },
      { id: 'E_K2', name: 'Absolute Power', desc: 'Establish undisputed control over Miami.' },
    ],
    outcome: 'You sit atop Miami\'s criminal underworld. Every move, every deal, every dollar — it all comes back to you. The question is: how long can you hold the crown?',
    grades: {
      S: 'Zero enemies remaining. All factions allied. Net worth $10M+.',
      A: 'Most factions allied. Strong empire. Few loose ends.',
      B: 'Dominant position but with ongoing threats.',
      C: 'Kingpin in name but constantly under siege.',
    },
  },
  {
    id: 'escape', name: 'The Escape', emoji: '✈️',
    desc: 'You get out. New identity, offshore millions, a beach somewhere nobody knows your name.',
    requirements: {
      netWorth: 2000000,
      launderedCash: 1000000,
      offshoreAccounts: true,
      heat: { max: 30 },
    },
    endingMissions: [
      { id: 'E_E1', name: 'The Extraction Plan', desc: 'Prepare your exit strategy. Passports, accounts, safe houses.' },
      { id: 'E_E2', name: 'Ghost Protocol', desc: 'Disappear completely. Tie up loose ends.' },
    ],
    outcome: 'A beach. A drink. A new name. The empire you built is a ghost story now — and so are you.',
    grades: {
      S: 'Clean escape. No one suspects. Perfect new identity.',
      A: 'Successful escape but some loose ends.',
      B: 'Escaped but under suspicion. Looking over your shoulder.',
      C: 'Barely made it out. Living in constant fear.',
    },
  },
  {
    id: 'going_straight', name: 'Going Straight', emoji: '🕊️',
    desc: 'You leave the game. Legitimate business, clean money, a chance at a real life.',
    requirements: {
      frontBusinesses: 5,
      launderedCash: 500000,
      heat: { max: 10 },
      reputation: { min: 30 },
    },
    endingMissions: [
      { id: 'E_G1', name: 'The Transition', desc: 'Convert criminal operations to legitimate business.' },
      { id: 'E_G2', name: 'Clean Hands', desc: 'Eliminate all criminal evidence and connections.' },
    ],
    outcome: 'The suits are real now. The money is clean. You built an empire and walked away before it consumed you.',
    grades: {
      S: 'Zero criminal connections remaining. Thriving businesses.',
      A: 'Mostly clean. A few old debts remain.',
      B: 'Legitimate on paper but the past lingers.',
      C: 'Half-in, half-out. The streets keep calling.',
    },
  },
  {
    id: 'informant', name: 'The Informant', emoji: '🐀',
    desc: 'You flip. Witness protection. Testimony that brings down everyone you built with.',
    requirements: {
      factionRelation: { any: -40 }, // At war with at least one faction
      arrestCount: { min: 1 },
      heat: { min: 60 },
    },
    endingMissions: [
      { id: 'E_I1', name: 'The Deal', desc: 'Negotiate with the FBI. Everything for freedom.' },
      { id: 'E_I2', name: 'The Testimony', desc: 'Take the stand. Name names. Burn it all down.' },
    ],
    outcome: 'A new name, a new city, a lifetime of looking over your shoulder. You survived — but at what cost?',
    grades: {
      S: 'Everyone goes down. Perfect witness protection.',
      A: 'Major convictions. Adequate protection.',
      B: 'Some convictions. Shaky protection.',
      C: 'Minimal results. Constant danger of retribution.',
    },
  },
  {
    id: 'blaze_of_glory', name: 'Blaze of Glory', emoji: '🔥',
    desc: 'You go out fighting. Outnumbered, outgunned, legendary.',
    requirements: {
      combat: { min: 4 },
      reputation: 60,
      heat: { min: 80 },
      enemies: { min: 3 }, // At war with 3+ factions
    },
    endingMissions: [
      { id: 'E_B1', name: 'Last Stand', desc: 'Prepare for the final battle. Arm up.' },
      { id: 'E_B2', name: 'The Siege', desc: 'They come for you. All of them. Fight to the last.' },
    ],
    outcome: 'They came with everything. You went down swinging. The legend of your last stand will be told on every corner in Miami.',
    grades: {
      S: 'Legendary last stand. Took dozens with you. Immortalized.',
      A: 'Epic battle. Remembered by many.',
      B: 'Fought hard but overwhelmed.',
      C: 'Brief, violent end. Forgotten quickly.',
    },
  },
  {
    id: 'the_fall', name: 'The Fall', emoji: '📉',
    desc: 'It all collapses. Prison, poverty, or worse. The empire crumbles.',
    requirements: {
      netWorth: { max: 10000 },
      debt: { min: 50000 },
      reputation: { max: -20 },
    },
    endingMissions: [
      { id: 'E_F1', name: 'Rock Bottom', desc: 'Everything you built is gone. What\'s left?' },
    ],
    outcome: 'Concrete walls or empty pockets — either way, the game beat you. The streets have no loyalty, and neither did fortune.',
    grades: {
      S: null, // Can't get S on The Fall
      A: null,
      B: 'Hit rock bottom but survived.',
      C: 'Complete and total ruin.',
    },
  },
  {
    id: 'partnership', name: 'The Partnership', emoji: '🤝',
    desc: 'You share power. A faction alliance where you co-rule Miami.',
    requirements: {
      factionAlliance: { any: 80 }, // Allied with at least one faction
      territories: { min: 5 },
      reputation: 50,
    },
    endingMissions: [
      { id: 'E_P1', name: 'The Treaty', desc: 'Formalize the alliance. Divide Miami between partners.' },
      { id: 'E_P2', name: 'Shared Throne', desc: 'Establish co-rule. Trust but verify.' },
    ],
    outcome: 'Power shared is power vulnerable. But two crowns are harder to knock off than one.',
    grades: {
      S: 'Perfect partnership. Mutual prosperity. Miami at peace.',
      A: 'Strong alliance with minor tensions.',
      B: 'Uneasy partnership. Trust issues.',
      C: 'Partnership in name only. Inevitable betrayal looming.',
    },
  },
  {
    id: 'politician', name: 'The Politician', emoji: '🏛️',
    desc: 'You go legitimate — into politics. The most dangerous game of all.',
    requirements: {
      politicalConnections: { min: 5 },
      publicImage: { min: 40 },
      launderedCash: 2000000,
      heat: { max: 15 },
    },
    endingMissions: [
      { id: 'E_PO1', name: 'The Campaign', desc: 'Run for office. Hide everything.' },
      { id: 'E_PO2', name: 'Elected', desc: 'Win the election. Begin the real game.' },
    ],
    outcome: 'From drug lord to elected official. The most American story ever told.',
    grades: {
      S: 'Clean record. Beloved politician. No one suspects.',
      A: 'Elected but with rumors.',
      B: 'In office but under investigation.',
      C: 'Barely elected. Scandal imminent.',
    },
  },
  {
    id: 'family_first', name: 'Family First', emoji: '👨‍👩‍👧‍👦',
    desc: 'You choose family over empire. Walk away for the people who matter.',
    requirements: {
      dependents: { min: 1 },
      netWorth: 500000,
      crewLoyalty: { avg: 60 },
    },
    endingMissions: [
      { id: 'E_FF1', name: 'The Choice', desc: 'Empire or family. You can\'t have both.' },
      { id: 'E_FF2', name: 'New Beginnings', desc: 'Leave Miami. Start over somewhere clean.' },
    ],
    outcome: 'They were the reason you started. They\'re the reason you stopped. Somewhere quiet, a family heals.',
    grades: {
      S: 'Perfect exit. Family safe. Clean start.',
      A: 'Family safe but some lingering danger.',
      B: 'Difficult transition. Family strained.',
      C: 'Barely escaped with family intact.',
    },
  },
  {
    id: 'martyr', name: 'The Martyr', emoji: '⚰️',
    desc: 'You die protecting your people. Your crew, your community, your family.',
    requirements: {
      crewLoyalty: { avg: 85 },
      communityRep: { min: 50 },
      combat: { min: 3 },
    },
    endingMissions: [
      { id: 'E_M1', name: 'The Threat', desc: 'An existential threat to your people. Only you can stop it.' },
      { id: 'E_M2', name: 'The Sacrifice', desc: 'Give everything so they can have everything.' },
    ],
    outcome: 'They built a shrine on the corner. They named children after you. You gave everything — and it was enough.',
    grades: {
      S: 'Everyone saved. Legendary sacrifice. Immortalized.',
      A: 'Most people saved. Remembered forever.',
      B: 'Meaningful sacrifice but losses on both sides.',
      C: 'Died trying. Mixed results.',
    },
  },
  {
    id: 'hostile_takeover', name: 'Hostile Takeover', emoji: '🏴',
    desc: 'You overthrow every faction. Total war. Miami is yours alone.',
    requirements: {
      factionsDestroyed: { min: 3 },
      combat: { min: 5 },
      crewSize: 20,
      reputation: 90,
    },
    endingMissions: [
      { id: 'E_H1', name: 'Total War', desc: 'Declare war on all remaining factions simultaneously.' },
      { id: 'E_H2', name: 'Absolute Dominion', desc: 'Crush the last resistance. Rule through fear.' },
    ],
    outcome: 'No allies, no partners, no competition. Just you and an empire built on blood. Every throne built on skulls eventually crumbles.',
    grades: {
      S: 'Every faction destroyed. Absolute control. Zero opposition.',
      A: 'Most factions eliminated. A few pockets of resistance.',
      B: 'Dominant but bleeding. Empire is unstable.',
      C: 'Won the war but lost the peace.',
    },
  },
  {
    id: 'the_deal', name: 'The Deal', emoji: '🤫',
    desc: 'You cut a deal with the feds. Not snitching — mutual benefit. Corruption at the highest levels.',
    requirements: {
      politicalConnections: { min: 3 },
      netWorth: 3000000,
      federalContact: true,
    },
    endingMissions: [
      { id: 'E_D1', name: 'The Arrangement', desc: 'Negotiate protection with federal agents.' },
      { id: 'E_D2', name: 'Untouchable', desc: 'Establish a relationship that protects your empire.' },
    ],
    outcome: 'The feds get their stats. You keep your empire. Everyone gets rich. The system works — if you know how to play it.',
    grades: {
      S: 'Perfect arrangement. Fully protected. Empire thrives.',
      A: 'Strong deal but some exposure risk.',
      B: 'Unstable arrangement. Dependent on one contact.',
      C: 'Barely maintained. Could collapse any day.',
    },
  },
];

const NG_PLUS_ENDINGS = [
  { id: 'dynasty', name: 'The Dynasty', emoji: '🏰', desc: 'Build a criminal dynasty spanning generations. Legacy character carries the torch.', ngPlusOnly: true },
  { id: 'secret', name: 'The Secret Ending', emoji: '❓', desc: 'Complete all 12 campaign endings + specific NG+ conditions.', ngPlusOnly: true, hidden: true },
  { id: 'revolution', name: 'The Revolution', emoji: '✊', desc: 'Overthrow the entire system. Transform Miami from the ground up.', ngPlusOnly: true },
  { id: 'ghost', name: 'The Ghost', emoji: '👻', desc: 'Become truly invisible. Run everything from the shadows. No one knows you exist.', ngPlusOnly: true },
  { id: 'empire_abroad', name: 'Empire Abroad', emoji: '🌍', desc: 'Take your operation international. Miami is just the beginning.', ngPlusOnly: true },
  { id: 'redemption', name: 'The Redemption Arc', emoji: '🌅', desc: 'Use your criminal empire to genuinely help the community.', ngPlusOnly: true },
  { id: 'puppet_master', name: 'The Puppet Master', emoji: '🎭', desc: 'Control everything without anyone knowing. The ultimate shadow ruler.', ngPlusOnly: true },
  { id: 'true_ending', name: 'The True Ending', emoji: '⭐', desc: 'The canonical ending. Requires specific conditions across multiple runs.', ngPlusOnly: true, hidden: true },
];

// All endings combined
const ALL_ENDINGS = [...CAMPAIGN_ENDINGS, ...NG_PLUS_ENDINGS];

// Determine which endings the player qualifies for
function getAvailableEndings(state) {
  const available = [];

  for (const ending of CAMPAIGN_ENDINGS) {
    if (meetsEndingRequirements(state, ending)) {
      const grade = calculateEndingGrade(state, ending);
      available.push({ ...ending, grade });
    }
  }

  // NG+ endings
  if (state.newGamePlus && state.newGamePlus.active) {
    for (const ending of NG_PLUS_ENDINGS) {
      if (!ending.hidden || meetsSecretEndingConditions(state)) {
        available.push({ ...ending, grade: 'A' });
      }
    }
  }

  return available;
}

// Check if player meets ending requirements
function meetsEndingRequirements(state, ending) {
  if (!ending.requirements) return true;
  const req = ending.requirements;

  if (req.netWorth) {
    const nw = typeof calculateNetWorth === 'function' ? calculateNetWorth(state) : (state.cash || 0);
    if (typeof req.netWorth === 'number' && nw < req.netWorth) return false;
    if (typeof req.netWorth === 'object' && req.netWorth.max && nw > req.netWorth.max) return false;
  }

  if (req.reputation) {
    const rep = state.reputation || 0;
    if (typeof req.reputation === 'number' && rep < req.reputation) return false;
    if (typeof req.reputation === 'object' && req.reputation.max && rep > req.reputation.max) return false;
  }

  if (req.heat) {
    const heat = state.heat || 0;
    if (req.heat.max && heat > req.heat.max) return false;
    if (req.heat.min && heat < req.heat.min) return false;
  }

  if (req.combat) {
    const combatSkill = (state.skills && state.skills.combat) || 0;
    if (req.combat.min && combatSkill < req.combat.min) return false;
  }

  if (req.crewSize && (state.henchmen || []).length < req.crewSize) return false;

  if (req.territoriesControlled) {
    const terrs = typeof getControlledTerritories === 'function' ? getControlledTerritories(state) : [];
    if (terrs.length < req.territoriesControlled) return false;
  }

  if (req.factionAlliances) {
    let allianceCount = 0;
    if (state.factions) {
      for (const fid of Object.keys(state.factions)) {
        if (state.factions[fid].relation >= 80) allianceCount++;
      }
    }
    if (allianceCount < req.factionAlliances) return false;
  }

  return true;
}

// Calculate ending quality grade
function calculateEndingGrade(state, ending) {
  // Simplified grade calculation based on overall state quality
  const nw = typeof calculateNetWorth === 'function' ? calculateNetWorth(state) : (state.cash || 0);
  const rep = state.reputation || 0;
  const crewSize = (state.henchmen || []).length;

  let score = 0;
  score += Math.min(40, nw / 250000); // Up to 40 points for wealth
  score += Math.min(20, rep / 5); // Up to 20 points for reputation
  score += Math.min(20, crewSize * 2); // Up to 20 points for crew
  score += Math.min(20, ((state.campaign && state.campaign.totalMissionsCompleted) || 0) * 2); // Up to 20 for missions

  if (score >= 85) return 'S';
  if (score >= 65) return 'A';
  if (score >= 40) return 'B';
  return 'C';
}

function meetsSecretEndingConditions(state) {
  if (!state.newGamePlus) return false;
  return (state.newGamePlus.completedEndings || []).length >= 12;
}

// Initialize endings state
function initEndingsState() {
  return {
    currentEnding: null,
    endingGrade: null,
    endingPath: null,
    completedEndings: [], // For NG+ tracking
    endingChoices: [],
  };
}
