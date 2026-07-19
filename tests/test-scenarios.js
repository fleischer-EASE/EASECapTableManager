/*
 * Independent, human-auditable scenarios for the calculation code in index.html.
 *
 * Important: Expected outcomes below are literal values derived separately from
 * the application. The project functions are loaded only to produce actual
 * results. Every scenario includes its arithmetic so a human or another AI can
 * review the expectation without executing the application.
 */

const fs = require('fs');

const source = fs.readFileSync('index.html', 'utf8');
const marker = text => {
  const index = source.indexOf(text);
  if (index < 0) throw new Error(`Project source marker not found: ${text}`);
  return index;
};

const declarationMarker = name => marker(`const ${name} =`);
const functionMarker = name => marker(`function ${name}(`);

const validDateStart = declarationMarker('validDate');
const validDateEnd = declarationMarker('roundInvestors');
const roundHelpersStart = validDateEnd;
const roundHelpersEnd = declarationMarker('chronologicalRounds');
const financeStart = declarationMarker('loanClaim');
const financeEnd = declarationMarker('reservedVsopShares');
const waterfallStart = declarationMarker('aggregateLots');
const snapshotsStart = functionMarker('snapshots');
const renderStart = functionMarker('render');
const normalizeStart = declarationMarker('normalizeRound');
const normalizeEnd = marker('// State lifecycle');
const csvStart = functionMarker('parseCsv');
const csvEnd = declarationMarker('holderKey');

const validDate = new Function(
  source.slice(validDateStart, validDateEnd) + '\nreturn validDate;'
)();
const projectRoundHelpers = new Function(
  source.slice(roundHelpersStart, roundHelpersEnd) + '\nreturn {roundInvestors,roundInvestment};'
)();
const projectFinance = new Function(
  'validDate',
  'today',
  source.slice(financeStart, financeEnd) + '\nreturn {loanClaim,addMonths,completedMonths,vestedShares};'
)(validDate, '2030-01-01');
const projectWaterfall = new Function(
  'validDate',
  source.slice(waterfallStart, snapshotsStart) + '\nreturn {preferenceClaimAtExit,calculateWaterfall};'
)(validDate);

const holderKey = name => String(name || '').trim().toLocaleLowerCase('de-DE');
const num = number => String(Math.round(number));
const snapshots = new Function(
  'holderKey',
  'aggregateLots',
  'copyLots',
  'validDate',
  'loanClaim',
  'num',
  'roundInvestors',
  'roundInvestment',
  source.slice(snapshotsStart, renderStart) + '\nreturn snapshots;'
)(
  holderKey,
  new Function('validDate', source.slice(waterfallStart, snapshotsStart) + '\nreturn aggregateLots;')(validDate),
  new Function('validDate', source.slice(waterfallStart, snapshotsStart) + '\nreturn copyLots;')(validDate),
  validDate,
  projectFinance.loanClaim,
  num,
  projectRoundHelpers.roundInvestors,
  projectRoundHelpers.roundInvestment
);
const normalizeRound = new Function(
  source.slice(normalizeStart, normalizeEnd) + '\nreturn normalizeRound;'
)();

function buildCsvImporter() {
  let generatedId = 0;
  return new Function(
    'validDate',
    'normalizeRound',
    'holderKey',
    'roundInvestment',
    'snapshots',
    'uid',
    'initialState',
    `let state=initialState,stage=0;const save=()=>{},render=()=>{};${source.slice(csvStart, csvEnd)}\nreturn {importCsv,getState:()=>state};`
  )(
    validDate,
    normalizeRound,
    holderKey,
    projectRoundHelpers.roundInvestment,
    snapshots,
    () => `generated-${++generatedId}`,
    {exit: {value: 0, debt: 0, costs: 0, date: ''}}
  );
}

function makeLot(spec) {
  const preferenceType = spec.kind === 'common' ? 'none' : spec.kind;
  const investment = spec.investment || 0;
  const preference = spec.preference || 0;
  return {
    id: spec.id,
    holderId: spec.holderId || spec.id,
    name: spec.name || spec.id,
    type: 'Investor',
    shares: spec.shares,
    isVirtual: false,
    sourceRoundId: spec.sourceRoundId || '',
    className: spec.className || (preferenceType === 'none' ? 'Common' : 'Preferred'),
    preferenceType,
    preferenceBasePerShare: spec.shares ? investment / spec.shares : 0,
    preferenceClaimPerShare: spec.shares ? preference / spec.shares : 0,
    liquidationSeniority: spec.seniority || 1,
    participationCapMultiple: spec.capMultiple || 0,
    conversionRatio: spec.conversionRatio || 1,
    cumulativeDividendRate: spec.dividendRate || 0,
    dividendStartDate: spec.dividendStartDate || '',
    redemptionEnabled: Boolean(spec.redemptionEnabled),
    redemptionDate: spec.redemptionDate || '',
    redemptionMultiple: spec.redemptionMultiple || 1
  };
}

function makeHolder(id, name, shares, options = {}) {
  return {
    id,
    name,
    type: options.type || 'Gründer',
    shares,
    isVirtual: Boolean(options.isVirtual),
    costBasis: options.costBasis || 0,
    investmentDate: options.investmentDate || ''
  };
}

function makeRound(options) {
  return {
    id: options.id,
    name: options.name,
    className: options.className || `${options.name} Preferred`,
    investors: options.investors,
    preMoney: options.preMoney,
    date: options.date,
    liquidationPreferenceType: options.preferenceType || 'non-participating',
    liquidationPreferenceMultiple: options.preferenceMultiple === undefined ? 1 : options.preferenceMultiple,
    liquidationSeniority: options.seniority === undefined ? 1 : options.seniority,
    participationCapMultiple: options.capMultiple || 0,
    conversionRatio: options.conversionRatio || 1,
    cumulativeDividendRate: options.dividendRate || 0,
    redemptionEnabled: Boolean(options.redemptionEnabled),
    redemptionDate: options.redemptionDate || '',
    redemptionMultiple: options.redemptionMultiple || 1,
    poolRefresh: options.poolRefresh || 0,
    poolRefreshTiming: options.poolRefreshTiming || 'pre',
    poolId: options.poolId || ''
  };
}

function makeConvertible(options) {
  return {
    id: options.id,
    name: options.name,
    lender: options.lender,
    principal: options.principal,
    date: options.date,
    interest: options.interest || 0,
    discount: options.discount || 0,
    valuationCap: options.valuationCap || 0,
    fullyDilutedConversion: options.fullyDilutedConversion !== false
  };
}

function makeState(options = {}) {
  return {
    holders: options.holders || [makeHolder('founder', 'Founder', 1000000)],
    rounds: options.rounds || [],
    convertibles: options.convertibles || [],
    secondaries: options.secondaries || [],
    vsopParticipants: options.vsopParticipants || [],
    exit: options.exit || {value: 0, debt: 0, costs: 0, date: ''}
  };
}

function makeCsv(headers, rows, delimiter = ';') {
  return [
    headers.join(delimiter),
    ...rows.map(row => headers.map(header => row[header] === undefined ? '' : row[header]).join(delimiter))
  ].join('\n');
}

const waterfallScenarios = [
  {
    id: 'WF-01',
    title: 'Common proceeds follow a 60/40 ownership split',
    calculation: '€1,000 × 60/100 = €600; €1,000 × 40/100 = €400.',
    input: {
      proceeds: 1000,
      exitDate: '2027-01-01',
      lots: [
        {id: 'common-a', kind: 'common', shares: 60},
        {id: 'common-b', kind: 'common', shares: 40}
      ]
    },
    expected: {payouts: {'common-a': 600, 'common-b': 400}, elected: [], converted: [], unallocated: 0}
  },
  {
    id: 'WF-02',
    title: 'Conversion ratios weight residual ownership',
    calculation: 'Equivalent shares are 100 and 200; €900 is therefore split one-third/two-thirds.',
    input: {
      proceeds: 900,
      exitDate: '2027-01-01',
      lots: [
        {id: 'ratio-one', kind: 'common', shares: 100, conversionRatio: 1},
        {id: 'ratio-two', kind: 'common', shares: 100, conversionRatio: 2}
      ]
    },
    expected: {payouts: {'ratio-one': 300, 'ratio-two': 600}, elected: [], converted: [], unallocated: 0}
  },
  {
    id: 'WF-03',
    title: 'A non-participating preference absorbs a very low exit',
    calculation: 'The €100 preference claim is larger than the €16 conversion value, so all €80 goes to preferred.',
    input: {
      proceeds: 80,
      exitDate: '2027-01-01',
      lots: [
        {id: 'common', kind: 'common', shares: 80},
        {id: 'preferred', kind: 'non-participating', shares: 20, investment: 100, preference: 100}
      ]
    },
    expected: {payouts: {common: 0, preferred: 80}, preferencePaid: {preferred: 80}, elected: ['preferred'], converted: [], unallocated: 0}
  },
  {
    id: 'WF-04',
    title: 'A non-participating preference receives its exact claim',
    calculation: 'At €100 of proceeds the €100 preference beats the €20 conversion value.',
    input: {
      proceeds: 100,
      exitDate: '2027-01-01',
      lots: [
        {id: 'common', kind: 'common', shares: 80},
        {id: 'preferred', kind: 'non-participating', shares: 20, investment: 100, preference: 100}
      ]
    },
    expected: {payouts: {common: 0, preferred: 100}, preferencePaid: {preferred: 100}, elected: ['preferred'], converted: [], unallocated: 0}
  },
  {
    id: 'WF-05',
    title: 'A non-participating preference converts at a high exit',
    calculation: '20% of €1,000 is €200, which exceeds the €100 preference.',
    input: {
      proceeds: 1000,
      exitDate: '2027-01-01',
      lots: [
        {id: 'common', kind: 'common', shares: 80},
        {id: 'preferred', kind: 'non-participating', shares: 20, investment: 100, preference: 100}
      ]
    },
    expected: {payouts: {common: 800, preferred: 200}, elected: [], converted: [], unallocated: 0}
  },
  {
    id: 'WF-06',
    title: 'A non-participating preference is indifferent at break-even',
    calculation: '20% of €500 equals the €100 preference; either path pays €100.',
    input: {
      proceeds: 500,
      exitDate: '2027-01-01',
      lots: [
        {id: 'common', kind: 'common', shares: 80},
        {id: 'preferred', kind: 'non-participating', shares: 20, investment: 100, preference: 100}
      ]
    },
    expected: {payouts: {common: 400, preferred: 100}, elected: [], converted: [], unallocated: 0}
  },
  {
    id: 'WF-07',
    title: 'An uncapped participating preference receives preference plus residual',
    calculation: 'Preferred gets €100 first, then 20% of the €100 remainder: €100 + €20 = €120.',
    input: {
      proceeds: 200,
      exitDate: '2027-01-01',
      lots: [
        {id: 'common', kind: 'common', shares: 80},
        {id: 'preferred', kind: 'participating', shares: 20, investment: 100, preference: 100}
      ]
    },
    expected: {payouts: {common: 80, preferred: 120}, preferencePaid: {preferred: 100}, elected: [], converted: [], unallocated: 0}
  },
  {
    id: 'WF-08',
    title: 'An underfunded participating claim takes all available proceeds',
    calculation: 'Only €60 is available against a €100 preference claim, leaving no residual.',
    input: {
      proceeds: 60,
      exitDate: '2027-01-01',
      lots: [
        {id: 'common', kind: 'common', shares: 80},
        {id: 'preferred', kind: 'participating', shares: 20, investment: 100, preference: 100}
      ]
    },
    expected: {payouts: {common: 0, preferred: 60}, preferencePaid: {preferred: 60}, elected: [], converted: [], unallocated: 0}
  },
  {
    id: 'WF-09',
    title: 'A 1.5x participation cap limits total preferred payout',
    calculation: 'The €100 investment caps payout at €150; common receives the remaining €450.',
    input: {
      proceeds: 600,
      exitDate: '2027-01-01',
      lots: [
        {id: 'common', kind: 'common', shares: 80},
        {id: 'preferred', kind: 'participating', shares: 20, investment: 100, preference: 100, capMultiple: 1.5}
      ]
    },
    expected: {payouts: {common: 450, preferred: 150}, preferencePaid: {preferred: 100}, elected: [], converted: [], unallocated: 0}
  },
  {
    id: 'WF-10',
    title: 'A capped participant converts when conversion is better',
    calculation: 'The cap pays €150, while conversion pays 20% of €1,000 = €200.',
    input: {
      proceeds: 1000,
      exitDate: '2027-01-01',
      lots: [
        {id: 'common', kind: 'common', shares: 80},
        {id: 'preferred', kind: 'participating', shares: 20, investment: 100, preference: 100, capMultiple: 1.5}
      ]
    },
    expected: {payouts: {common: 800, preferred: 200}, elected: [], converted: ['preferred'], unallocated: 0}
  },
  {
    id: 'WF-11',
    title: 'A 2x cap does not bind below the cap',
    calculation: 'Preferred gets €100 plus 20% of the €100 remainder = €120, below the €200 cap.',
    input: {
      proceeds: 200,
      exitDate: '2027-01-01',
      lots: [
        {id: 'common', kind: 'common', shares: 80},
        {id: 'preferred', kind: 'participating', shares: 20, investment: 100, preference: 100, capMultiple: 2}
      ]
    },
    expected: {payouts: {common: 80, preferred: 120}, preferencePaid: {preferred: 100}, elected: [], converted: [], unallocated: 0}
  },
  {
    id: 'WF-12',
    title: 'A 2x cap binds before conversion becomes attractive',
    calculation: 'Participation reaches its €200 cap; conversion would pay only 20% of €700 = €140.',
    input: {
      proceeds: 700,
      exitDate: '2027-01-01',
      lots: [
        {id: 'common', kind: 'common', shares: 80},
        {id: 'preferred', kind: 'participating', shares: 20, investment: 100, preference: 100, capMultiple: 2}
      ]
    },
    expected: {payouts: {common: 500, preferred: 200}, preferencePaid: {preferred: 100}, elected: [], converted: [], unallocated: 0}
  },
  {
    id: 'WF-13',
    title: 'Senior preference is paid before junior preference',
    calculation: 'Senior receives €100 first; the remaining €50 partially pays the junior €100 claim.',
    input: {
      proceeds: 150,
      exitDate: '2027-01-01',
      lots: [
        {id: 'senior', kind: 'participating', shares: 20, investment: 100, preference: 100, seniority: 1},
        {id: 'junior', kind: 'participating', shares: 20, investment: 100, preference: 100, seniority: 2},
        {id: 'common', kind: 'common', shares: 60}
      ]
    },
    expected: {payouts: {senior: 100, junior: 50, common: 0}, preferencePaid: {senior: 100, junior: 50}, elected: [], converted: [], unallocated: 0}
  },
  {
    id: 'WF-14',
    title: 'Residual proceeds follow both seniority layers',
    calculation: 'After two €100 claims, €50 remains and splits 20/20/60: €10, €10, and €30.',
    input: {
      proceeds: 250,
      exitDate: '2027-01-01',
      lots: [
        {id: 'senior', kind: 'participating', shares: 20, investment: 100, preference: 100, seniority: 1},
        {id: 'junior', kind: 'participating', shares: 20, investment: 100, preference: 100, seniority: 2},
        {id: 'common', kind: 'common', shares: 60}
      ]
    },
    expected: {payouts: {senior: 110, junior: 110, common: 30}, preferencePaid: {senior: 100, junior: 100}, elected: [], converted: [], unallocated: 0}
  },
  {
    id: 'WF-15',
    title: 'Equal-rank claims are reduced pari passu',
    calculation: 'Claims of €100 and €200 exceed €150; a 50% scale pays €50 and €100.',
    input: {
      proceeds: 150,
      exitDate: '2027-01-01',
      lots: [
        {id: 'pref-a', kind: 'participating', shares: 20, investment: 100, preference: 100, seniority: 1},
        {id: 'pref-b', kind: 'participating', shares: 20, investment: 200, preference: 200, seniority: 1}
      ]
    },
    expected: {payouts: {'pref-a': 50, 'pref-b': 100}, preferencePaid: {'pref-a': 50, 'pref-b': 100}, elected: [], converted: [], unallocated: 0}
  },
  {
    id: 'WF-16',
    title: 'Equal-rank claims share a later residual',
    calculation: 'After €300 of claims, €100 splits over 20/40/40 shares as €20/€40/€40.',
    input: {
      proceeds: 400,
      exitDate: '2027-01-01',
      lots: [
        {id: 'pref-a', kind: 'participating', shares: 20, investment: 100, preference: 100, seniority: 1},
        {id: 'pref-b', kind: 'participating', shares: 40, investment: 200, preference: 200, seniority: 1},
        {id: 'common', kind: 'common', shares: 40}
      ]
    },
    expected: {payouts: {'pref-a': 120, 'pref-b': 240, common: 40}, preferencePaid: {'pref-a': 100, 'pref-b': 200}, elected: [], converted: [], unallocated: 0}
  },
  {
    id: 'WF-17',
    title: 'Two non-participating claims elect preference together',
    calculation: '€150 scales €100/€200 equal-rank claims by 50%, paying €50 and €100.',
    input: {
      proceeds: 150,
      exitDate: '2027-01-01',
      lots: [
        {id: 'common', kind: 'common', shares: 60},
        {id: 'pref-a', kind: 'non-participating', shares: 20, investment: 100, preference: 100},
        {id: 'pref-b', kind: 'non-participating', shares: 20, investment: 200, preference: 200}
      ]
    },
    expected: {payouts: {common: 0, 'pref-a': 50, 'pref-b': 100}, preferencePaid: {'pref-a': 50, 'pref-b': 100}, elected: ['pref-a', 'pref-b'], converted: [], unallocated: 0}
  },
  {
    id: 'WF-18',
    title: 'Two non-participating classes convert at a high exit',
    calculation: 'At €1,000 the 60/20/20 ownership split pays €600/€200/€200; neither preference improves this.',
    input: {
      proceeds: 1000,
      exitDate: '2027-01-01',
      lots: [
        {id: 'common', kind: 'common', shares: 60},
        {id: 'pref-a', kind: 'non-participating', shares: 20, investment: 100, preference: 100},
        {id: 'pref-b', kind: 'non-participating', shares: 20, investment: 200, preference: 200}
      ]
    },
    expected: {payouts: {common: 600, 'pref-a': 200, 'pref-b': 200}, elected: [], converted: [], unallocated: 0}
  },
  {
    id: 'WF-19',
    title: 'Common held beside preferred remains in the residual',
    calculation: 'After a €100 preference, €20 splits over 20 holder-common and 60 other-common shares: €5 and €15.',
    input: {
      proceeds: 120,
      exitDate: '2027-01-01',
      lots: [
        {id: 'holder-common', holderId: 'holder', kind: 'common', shares: 20},
        {id: 'holder-pref', holderId: 'holder', kind: 'non-participating', shares: 20, investment: 100, preference: 100},
        {id: 'other-common', kind: 'common', shares: 60}
      ]
    },
    expected: {payouts: {'holder-common': 5, 'holder-pref': 100, 'other-common': 15}, preferencePaid: {'holder-pref': 100}, elected: ['holder-pref'], converted: [], unallocated: 0}
  },
  {
    id: 'WF-20',
    title: 'Zero proceeds produce zero payouts',
    calculation: 'With €0 available, every claim and residual payout is €0.',
    input: {
      proceeds: 0,
      exitDate: '2027-01-01',
      lots: [
        {id: 'common', kind: 'common', shares: 80},
        {id: 'preferred', kind: 'participating', shares: 20, investment: 100, preference: 100}
      ]
    },
    expected: {payouts: {common: 0, preferred: 0}, elected: [], converted: [], unallocated: 0}
  }
];

const preferenceClaimScenarios = [
  {
    id: 'PC-21',
    title: 'Common shares have no preference claim',
    calculation: 'Common has no contractual preference, so the claim is €0.',
    input: {exitDate: '2026-01-01', lot: {id: 'common', kind: 'common', shares: 20, investment: 100, preference: 100}},
    expected: {claim: 0}
  },
  {
    id: 'PC-22',
    title: 'A 1x preference equals invested capital',
    calculation: '20 shares × €5 preference per share = €100.',
    input: {exitDate: '2026-01-01', lot: {id: 'preferred', kind: 'non-participating', shares: 20, investment: 100, preference: 100}},
    expected: {claim: 100}
  },
  {
    id: 'PC-23',
    title: 'A 2x preference doubles invested capital',
    calculation: '20 shares × €10 preference per share = €200.',
    input: {exitDate: '2026-01-01', lot: {id: 'preferred', kind: 'non-participating', shares: 20, investment: 100, preference: 200}},
    expected: {claim: 200}
  },
  {
    id: 'PC-24',
    title: 'A 10% cumulative dividend accrues for one ordinary year',
    calculation: '€100 base + €100 × 10% × 365/365 = €110.',
    input: {exitDate: '2026-01-01', lot: {id: 'preferred', kind: 'non-participating', shares: 20, investment: 100, preference: 100, dividendRate: 10, dividendStartDate: '2025-01-01'}},
    expected: {claim: 110}
  },
  {
    id: 'PC-25',
    title: 'A 5% cumulative dividend accrues for two ordinary years',
    calculation: '€100 base + €100 × 5% × 730/365 = €110.',
    input: {exitDate: '2027-01-01', lot: {id: 'preferred', kind: 'non-participating', shares: 20, investment: 100, preference: 100, dividendRate: 5, dividendStartDate: '2025-01-01'}},
    expected: {claim: 110}
  },
  {
    id: 'PC-26',
    title: 'A leap-year dividend uses actual elapsed days',
    calculation: '€100 + €100 × 10% × 366/365 = €110.0273972603.',
    input: {exitDate: '2025-01-01', lot: {id: 'preferred', kind: 'non-participating', shares: 20, investment: 100, preference: 100, dividendRate: 10, dividendStartDate: '2024-01-01'}},
    expected: {claim: 110.0273972603}
  },
  {
    id: 'PC-27',
    title: 'A redemption floor is inactive before its date',
    calculation: 'The 2x €200 floor is unavailable, so the ordinary €100 preference remains.',
    input: {exitDate: '2026-12-31', lot: {id: 'preferred', kind: 'non-participating', shares: 20, investment: 100, preference: 100, redemptionEnabled: true, redemptionDate: '2027-01-01', redemptionMultiple: 2}},
    expected: {claim: 100}
  },
  {
    id: 'PC-28',
    title: 'Redemption floor and cumulative dividend combine',
    calculation: 'The active 1.5x floor is €150; one year of 10% dividend adds €10, giving €160.',
    input: {exitDate: '2026-01-01', lot: {id: 'preferred', kind: 'non-participating', shares: 20, investment: 100, preference: 100, dividendRate: 10, dividendStartDate: '2025-01-01', redemptionEnabled: true, redemptionDate: '2026-01-01', redemptionMultiple: 1.5}},
    expected: {claim: 160}
  }
];

const snapshotScenarios = [
  {
    id: 'CT-29',
    title: 'A single investor receives shares at the fixed round price',
    calculation: '€10m pre-money / 1m FD shares = €10 per share; €2m buys 200,000 shares.',
    input: makeState({rounds: [makeRound({id: 'round-a', name: 'Series A', preMoney: 10000000, date: '2025-01-01', investors: [{id: 'fund', name: 'Fund', investment: 2000000}]})]}),
    expected: {snapshotCount: 2, price: 10, raised: 2000000, valuation: 12000000, capShares: {Founder: 1000000, Fund: 200000}, allocations: {Fund: {shares: 200000, equivalentShares: 200000}}}
  },
  {
    id: 'CT-30',
    title: 'Multiple investors share one round price',
    calculation: 'At €10 per share, €1m buys 100,000 shares and €2m buys 200,000 shares.',
    input: makeState({rounds: [makeRound({id: 'round-a', name: 'Series A', preMoney: 10000000, date: '2025-01-01', investors: [{id: 'a', name: 'Fund A', investment: 1000000}, {id: 'b', name: 'Fund B', investment: 2000000}]})]}),
    expected: {snapshotCount: 2, price: 10, raised: 3000000, valuation: 13000000, capShares: {Founder: 1000000, 'Fund A': 100000, 'Fund B': 200000}, allocations: {'Fund A': {shares: 100000}, 'Fund B': {shares: 200000}}}
  },
  {
    id: 'CT-31',
    title: 'A pre-money pool refresh enters the pricing denominator',
    calculation: '900 founder + 100 pool + 100 refresh = 1,100 FD shares; €1,100 / 1,100 = €1 per share.',
    input: makeState({
      holders: [makeHolder('founder', 'Founder', 900), makeHolder('pool', 'Pool', 100, {type: 'VSOP-Pool', isVirtual: true})],
      rounds: [makeRound({id: 'round-a', name: 'Seed', preMoney: 1100, date: '2025-01-01', investors: [{id: 'fund', name: 'Fund', investment: 110}], poolId: 'pool', poolRefresh: 100, poolRefreshTiming: 'pre'})]
    }),
    expected: {price: 1, raised: 110, valuation: 1210, capShares: {Founder: 900, Pool: 200, Fund: 110}}
  },
  {
    id: 'CT-32',
    title: 'A post-money pool refresh does not change round pricing',
    calculation: '€1,000 pre-money / 1,000 existing FD shares = €1; the 100-share refresh is added afterward.',
    input: makeState({
      holders: [makeHolder('founder', 'Founder', 900), makeHolder('pool', 'Pool', 100, {type: 'VSOP-Pool', isVirtual: true})],
      rounds: [makeRound({id: 'round-a', name: 'Seed', preMoney: 1000, date: '2025-01-01', investors: [{id: 'fund', name: 'Fund', investment: 100}], poolId: 'pool', poolRefresh: 100, poolRefreshTiming: 'post'})]
    }),
    expected: {price: 1, raised: 100, valuation: 1100, capShares: {Founder: 900, Pool: 200, Fund: 100}}
  },
  {
    id: 'CT-33',
    title: 'A convertible uses the better valuation cap price',
    calculation: '20% discount gives €8/share; the €7m cap gives €7/share, so €100k converts into 14,285.714286 shares.',
    input: makeState({
      convertibles: [makeConvertible({id: 'note', name: 'Angel Note', lender: 'Angel', principal: 100000, date: '2024-01-01', discount: 20, valuationCap: 7000000})],
      rounds: [makeRound({id: 'round-a', name: 'Seed', preMoney: 10000000, date: '2025-01-01', investors: [{id: 'fund', name: 'Fund', investment: 1000000}]})]
    }),
    expected: {price: 10, raised: 1100000, valuation: 11000000, capShares: {Founder: 1000000, Angel: 14285.7142857143, Fund: 100000}, conversions: {note: {price: 7, claim: 100000, shares: 14285.7142857143}}}
  },
  {
    id: 'CT-34',
    title: 'Convertible simple interest increases conversion shares',
    calculation: '€100k × (1 + 8% × 365/365) = €108k; at €10/share this becomes 10,800 shares.',
    input: makeState({
      convertibles: [makeConvertible({id: 'note', name: 'Angel Note', lender: 'Angel', principal: 100000, date: '2025-01-01', interest: 8})],
      rounds: [makeRound({id: 'round-a', name: 'Seed', preMoney: 10000000, date: '2026-01-01', investors: [{id: 'fund', name: 'Fund', investment: 1000000}]})]
    }),
    expected: {price: 10, raised: 1100000, valuation: 11000000, capShares: {Founder: 1000000, Angel: 10800, Fund: 100000}, conversions: {note: {price: 10, claim: 108000, shares: 10800}}}
  },
  {
    id: 'CT-35',
    title: 'A non-fully-diluted convertible excludes the virtual pool',
    calculation: '€1m / 900 equity shares = €1,111.111111 per share; €100k converts into 90 shares.',
    input: makeState({
      holders: [makeHolder('founder', 'Founder', 900), makeHolder('pool', 'Pool', 100, {type: 'VSOP-Pool', isVirtual: true})],
      convertibles: [makeConvertible({id: 'note', name: 'Angel Note', lender: 'Angel', principal: 100000, date: '2024-01-01', fullyDilutedConversion: false})],
      rounds: [makeRound({id: 'round-a', name: 'Seed', preMoney: 1000000, date: '2025-01-01', investors: [{id: 'fund', name: 'Fund', investment: 100000}]})]
    }),
    expected: {price: 1000, raised: 200000, valuation: 1100000, capShares: {Founder: 900, Pool: 100, Angel: 90, Fund: 100}, conversions: {note: {price: 1111.1111111111, claim: 100000, shares: 90}}}
  },
  {
    id: 'CT-36',
    title: 'A 2:1 conversion ratio doubles fully diluted shares',
    calculation: '€1m / €10 = 100,000 legal shares; 100,000 × 2 = 200,000 FD shares.',
    input: makeState({rounds: [makeRound({id: 'round-a', name: 'Series A', preMoney: 10000000, date: '2025-01-01', conversionRatio: 2, investors: [{id: 'fund', name: 'Fund', investment: 1000000}]})]}),
    expected: {price: 10, capShares: {Founder: 1000000, Fund: 200000}, capLegalShares: {Fund: 100000}, allocations: {Fund: {shares: 100000, equivalentShares: 200000}}}
  },
  {
    id: 'CT-37',
    title: 'An existing holder aggregates newly purchased shares',
    calculation: 'Founder starts with 1,000,000 and buys €1m / €10 = 100,000 more, totaling 1,100,000.',
    input: makeState({rounds: [makeRound({id: 'round-a', name: 'Series A', preMoney: 10000000, date: '2025-01-01', investors: [{id: 'founder-follow-on', name: 'Founder', investment: 1000000}]})]}),
    expected: {price: 10, capShares: {Founder: 1100000}, capLegalShares: {Founder: 1100000}}
  },
  {
    id: 'CT-38',
    title: 'A common secondary transfers shares without changing totals',
    calculation: 'Alice transfers 250 of 1,000 shares, leaving 750 for Alice and 250 for Buyer.',
    input: makeState({
      holders: [makeHolder('alice', 'Alice', 1000)],
      secondaries: [{id: 'secondary', name: 'Founder Secondary', seller: 'Alice', buyer: 'Buyer', shares: 250, pricePerShare: 5, date: '2025-01-01', sourceRoundId: 'common'}]
    }),
    expected: {snapshotCount: 2, capShares: {Alice: 750, Buyer: 250}, lots: [{name: 'Buyer', sourceRoundId: '', shares: 250, className: 'Common', preferenceType: 'none'}]}
  },
  {
    id: 'CT-39',
    title: 'A preferred secondary transfers its economic rights',
    calculation: 'Fund transfers 25,000 of 100,000 preferred shares, leaving 75,000 and moving 25,000 with identical terms.',
    input: makeState({
      rounds: [makeRound({id: 'round-a', name: 'Series A', className: 'Series A Preferred', preMoney: 10000000, date: '2025-01-01', preferenceType: 'participating', capMultiple: 2, dividendRate: 8, redemptionEnabled: true, redemptionDate: '2028-01-01', redemptionMultiple: 1.5, investors: [{id: 'fund', name: 'Fund', investment: 1000000}]})],
      secondaries: [{id: 'secondary', name: 'Preferred Secondary', seller: 'Fund', buyer: 'Buyer', shares: 25000, pricePerShare: 12, date: '2026-01-01', sourceRoundId: 'round-a'}]
    }),
    expected: {snapshotCount: 3, capShares: {Founder: 1000000, Fund: 75000, Buyer: 25000}, lots: [{name: 'Buyer', sourceRoundId: 'round-a', shares: 25000, className: 'Series A Preferred', preferenceType: 'participating', participationCapMultiple: 2, cumulativeDividendRate: 8, redemptionMultiple: 1.5}]}
  }
];

const utilityScenarios = [
  {
    id: 'UT-40',
    title: 'Vesting remains zero before a 12-month cliff',
    calculation: 'Only 11 full months have elapsed, which is below the 12-month cliff.',
    kind: 'vesting',
    input: {asOf: '2025-12-31', grant: {shares: 4800, startDate: '2025-01-01', vestingMonths: 48, cliffMonths: 12, status: 'Aktiv', leaverDate: ''}},
    expected: {shares: 0}
  },
  {
    id: 'UT-41',
    title: 'Vesting releases twelve months at the cliff',
    calculation: '4,800 × 12/48 = 1,200 vested shares.',
    kind: 'vesting',
    input: {asOf: '2026-01-01', grant: {shares: 4800, startDate: '2025-01-01', vestingMonths: 48, cliffMonths: 12, status: 'Aktiv', leaverDate: ''}},
    expected: {shares: 1200}
  },
  {
    id: 'UT-42',
    title: 'Month-end vesting clamps to February month-end',
    calculation: '31 January to 28 February counts as one full month; 4,800 × 1/48 = 100.',
    kind: 'vesting',
    input: {asOf: '2025-02-28', grant: {shares: 4800, startDate: '2025-01-31', vestingMonths: 48, cliffMonths: 0, status: 'Aktiv', leaverDate: ''}},
    expected: {shares: 100}
  },
  {
    id: 'UT-43',
    title: 'A leaver stops vesting on the departure date',
    calculation: '18 full months elapsed by 1 July 2026; 4,800 × 18/48 = 1,800.',
    kind: 'vesting',
    input: {asOf: '2028-01-01', grant: {shares: 4800, startDate: '2025-01-01', vestingMonths: 48, cliffMonths: 12, status: 'Ausgeschieden', leaverDate: '2026-07-01'}},
    expected: {shares: 1800}
  },
  {
    id: 'UT-44',
    title: 'A cancelled grant has no vested shares',
    calculation: 'Cancellation overrides elapsed time, so vested shares are zero.',
    kind: 'vesting',
    input: {asOf: '2029-01-01', grant: {shares: 4800, startDate: '2025-01-01', vestingMonths: 48, cliffMonths: 12, status: 'Storniert', leaverDate: ''}},
    expected: {shares: 0}
  },
  {
    id: 'UT-45',
    title: 'A zero-interest loan remains at principal',
    calculation: '€100,000 × (1 + 0%) = €100,000.',
    kind: 'loan',
    input: {toDate: '2028-01-01', loan: {principal: 100000, date: '2025-01-01', interest: 0}},
    expected: {claim: 100000}
  },
  {
    id: 'UT-46',
    title: 'A loan accrues simple interest for one ordinary year',
    calculation: '€100,000 × (1 + 8% × 365/365) = €108,000.',
    kind: 'loan',
    input: {toDate: '2026-01-01', loan: {principal: 100000, date: '2025-01-01', interest: 8}},
    expected: {claim: 108000}
  }
];

const csvScenarios = [
  {
    id: 'CSV-47',
    title: 'The repository example imports as the documented financing path',
    calculation: 'The file contains 2 notes and Bridge €1m + Seed €3m + Series A €8m = €12m of equity rounds.',
    input: {csv: fs.readFileSync('examples/ease-cap-table-example.csv', 'utf8')},
    expected: {
      holders: 3,
      convertibles: 2,
      rounds: 3,
      roundInvestments: {'round-bridge': 1000000, 'round-seed': 3000000, 'round-series-a': 8000000},
      roundInvestorCounts: {'round-bridge': 4, 'round-seed': 2, 'round-series-a': 2},
      exitValue: 120000000,
      exitDate: '2029-10-01'
    }
  },
  {
    id: 'CSV-48',
    title: 'Comma-delimited schema v2 data imports correctly',
    calculation: 'The round investor contributes €250,000 to a €1m pre-money round.',
    input: {csv: makeCsv(
      ['schema_version', 'record_type', 'id', 'round_id', 'name', 'share_class', 'category', 'shares', 'cost_basis_eur', 'investment_date', 'is_virtual', 'counterparty', 'pre_money_eur', 'investment_eur', 'closing_date', 'liquidation_preference_type', 'liquidation_preference_multiple', 'pool_refresh_timing'],
      [
        {schema_version: 2, record_type: 'holder', id: 'founder', name: 'Founder', category: 'Gründer', shares: 1000, is_virtual: 'false'},
        {schema_version: 2, record_type: 'round', id: 'seed', name: 'Seed', share_class: 'Seed Preferred', pre_money_eur: 1000000, investment_eur: 250000, closing_date: '2025-01-01', liquidation_preference_type: 'non-participating', liquidation_preference_multiple: 1},
        {schema_version: 2, record_type: 'round_investor', id: 'seed-fund', round_id: 'seed', counterparty: 'Fund', investment_eur: 250000}
      ],
      ','
    )},
    expected: {holders: 1, convertibles: 0, rounds: 1, roundInvestments: {seed: 250000}, roundInvestorCounts: {seed: 1}}
  },
  {
    id: 'CSV-49',
    title: 'Duplicate IDs are rejected across record types',
    calculation: 'The holder and round investor both use ID "duplicate", violating global uniqueness.',
    input: {csv: makeCsv(
      ['record_type', 'id', 'round_id', 'name', 'category', 'shares', 'cost_basis_eur', 'investment_date', 'is_virtual', 'counterparty', 'pre_money_eur', 'investment_eur', 'closing_date', 'liquidation_preference_type', 'liquidation_preference_multiple', 'pool_refresh_timing'],
      [
        {record_type: 'holder', id: 'duplicate', name: 'Founder', category: 'Gründer', shares: 1000, is_virtual: 'false'},
        {record_type: 'round', id: 'seed', name: 'Seed', pre_money_eur: 1000000, investment_eur: 250000, closing_date: '2025-01-01'},
        {record_type: 'round_investor', id: 'duplicate', round_id: 'seed', counterparty: 'Fund', investment_eur: 250000}
      ]
    )},
    expected: {errorIncludes: 'IDs müssen über alle Datensätze eindeutig sein.'}
  },
  {
    id: 'CSV-50',
    title: 'A redemption date before closing is rejected',
    calculation: 'The 2024-12-31 redemption date precedes the 2025-01-01 round closing.',
    input: {csv: makeCsv(
      ['record_type', 'id', 'name', 'category', 'shares', 'cost_basis_eur', 'investment_date', 'is_virtual', 'counterparty', 'pre_money_eur', 'investment_eur', 'closing_date', 'liquidation_preference_type', 'liquidation_preference_multiple', 'redemption_enabled', 'redemption_date', 'pool_refresh_timing'],
      [
        {record_type: 'holder', id: 'founder', name: 'Founder', category: 'Gründer', shares: 1000, is_virtual: 'false'},
        {record_type: 'round', id: 'seed', name: 'Seed', counterparty: 'Fund', pre_money_eur: 1000000, investment_eur: 250000, closing_date: '2025-01-01', liquidation_preference_type: 'non-participating', redemption_enabled: 'true', redemption_date: '2024-12-31'}
      ]
    )},
    expected: {errorIncludes: 'Ungültiger Redemption-Stichtag'}
  }
];

const scenarios = [
  ...waterfallScenarios,
  ...preferenceClaimScenarios,
  ...snapshotScenarios,
  ...utilityScenarios,
  ...csvScenarios
];

function assertNear(actual, expected, label, tolerance = 0.000001) {
  if (!Number.isFinite(actual) || Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, received ${actual}`);
}

function assertSet(actual, expected, label) {
  const actualValues = [...actual].sort();
  const expectedValues = [...expected].sort();
  assertEqual(JSON.stringify(actualValues), JSON.stringify(expectedValues), label);
}

function runWaterfallScenario(scenario) {
  const lots = scenario.input.lots.map(makeLot);
  const result = projectWaterfall.calculateWaterfall(lots, scenario.input.proceeds, scenario.input.exitDate);
  Object.entries(scenario.expected.payouts).forEach(([id, expected]) => {
    assertNear(result.payoutByLot.get(id) || 0, expected, `${scenario.id} payout ${id}`);
  });
  Object.entries(scenario.expected.preferencePaid || {}).forEach(([id, expected]) => {
    assertNear(result.preferencePaid.get(id) || 0, expected, `${scenario.id} preference ${id}`);
  });
  assertSet(result.elected, scenario.expected.elected, `${scenario.id} non-participating elections`);
  assertSet(result.convertedParticipating, scenario.expected.converted, `${scenario.id} participating conversions`);
  assertNear(result.unallocated, scenario.expected.unallocated, `${scenario.id} unallocated proceeds`);
}

function runPreferenceClaimScenario(scenario) {
  const actual = projectWaterfall.preferenceClaimAtExit(makeLot(scenario.input.lot), scenario.input.exitDate);
  assertNear(actual, scenario.expected.claim, `${scenario.id} preference claim`, 0.0000001);
}

function findNamed(items, name, scenarioId, collection) {
  const item = items.find(candidate => candidate.name === name);
  if (!item) throw new Error(`${scenarioId}: ${name} missing from ${collection}`);
  return item;
}

function runSnapshotScenario(scenario) {
  const allSnapshots = snapshots(scenario.input);
  const actual = allSnapshots.at(-1);
  const expected = scenario.expected;
  if (expected.snapshotCount !== undefined) assertEqual(allSnapshots.length, expected.snapshotCount, `${scenario.id} snapshot count`);
  if (expected.price !== undefined) assertNear(actual.price, expected.price, `${scenario.id} price`);
  if (expected.raised !== undefined) assertNear(actual.raised, expected.raised, `${scenario.id} raised`);
  if (expected.valuation !== undefined) assertNear(actual.valuation, expected.valuation, `${scenario.id} valuation`);
  Object.entries(expected.capShares || {}).forEach(([name, shares]) => {
    assertNear(findNamed(actual.cap, name, scenario.id, 'cap table').shares, shares, `${scenario.id} ${name} FD shares`, 0.0001);
  });
  Object.entries(expected.capLegalShares || {}).forEach(([name, shares]) => {
    assertNear(findNamed(actual.cap, name, scenario.id, 'cap table').legalShares, shares, `${scenario.id} ${name} legal shares`, 0.0001);
  });
  Object.entries(expected.allocations || {}).forEach(([name, values]) => {
    const allocation = findNamed(actual.roundAllocations || [], name, scenario.id, 'round allocations');
    Object.entries(values).forEach(([key, value]) => assertNear(allocation[key], value, `${scenario.id} ${name} allocation ${key}`, 0.0001));
  });
  Object.entries(expected.conversions || {}).forEach(([id, values]) => {
    const conversion = (actual.conversions || []).find(candidate => candidate.id === id);
    if (!conversion) throw new Error(`${scenario.id}: conversion ${id} missing`);
    Object.entries(values).forEach(([key, value]) => assertNear(conversion[key], value, `${scenario.id} conversion ${id} ${key}`, 0.0001));
  });
  (expected.lots || []).forEach(expectedLot => {
    const actualLot = actual.lots.find(lot => lot.name === expectedLot.name && lot.sourceRoundId === expectedLot.sourceRoundId);
    if (!actualLot) throw new Error(`${scenario.id}: lot ${expectedLot.name}/${expectedLot.sourceRoundId} missing`);
    Object.entries(expectedLot).forEach(([key, value]) => {
      if (key === 'name' || key === 'sourceRoundId') return;
      if (typeof value === 'number') assertNear(actualLot[key], value, `${scenario.id} lot ${expectedLot.name} ${key}`, 0.0001);
      else assertEqual(actualLot[key], value, `${scenario.id} lot ${expectedLot.name} ${key}`);
    });
  });
}

function runUtilityScenario(scenario) {
  if (scenario.kind === 'vesting') {
    const actual = projectFinance.vestedShares(scenario.input.grant, scenario.input.asOf);
    assertNear(actual, scenario.expected.shares, `${scenario.id} vested shares`);
    return;
  }
  const actual = projectFinance.loanClaim(scenario.input.loan, scenario.input.toDate);
  assertNear(actual, scenario.expected.claim, `${scenario.id} loan claim`);
}

function runCsvScenario(scenario) {
  const importer = buildCsvImporter();
  if (scenario.expected.errorIncludes) {
    let error;
    try {
      importer.importCsv(scenario.input.csv);
    } catch (caught) {
      error = caught;
    }
    if (!error || !String(error.message).includes(scenario.expected.errorIncludes)) {
      throw new Error(`${scenario.id}: expected error containing "${scenario.expected.errorIncludes}", received "${error?.message || 'no error'}"`);
    }
    return;
  }
  importer.importCsv(scenario.input.csv);
  const state = importer.getState();
  assertEqual(state.holders.length, scenario.expected.holders, `${scenario.id} holder count`);
  assertEqual(state.convertibles.length, scenario.expected.convertibles, `${scenario.id} convertible count`);
  assertEqual(state.rounds.length, scenario.expected.rounds, `${scenario.id} round count`);
  Object.entries(scenario.expected.roundInvestments || {}).forEach(([id, expected]) => {
    const round = state.rounds.find(item => item.id === id);
    if (!round) throw new Error(`${scenario.id}: round ${id} missing`);
    assertNear(projectRoundHelpers.roundInvestment(round), expected, `${scenario.id} ${id} investment`);
  });
  Object.entries(scenario.expected.roundInvestorCounts || {}).forEach(([id, expected]) => {
    const round = state.rounds.find(item => item.id === id);
    if (!round) throw new Error(`${scenario.id}: round ${id} missing`);
    assertEqual(projectRoundHelpers.roundInvestors(round).length, expected, `${scenario.id} ${id} investor count`);
  });
  if (scenario.expected.exitValue !== undefined) assertNear(state.exit.value, scenario.expected.exitValue, `${scenario.id} exit value`);
  if (scenario.expected.exitDate !== undefined) assertEqual(state.exit.date, scenario.expected.exitDate, `${scenario.id} exit date`);
}

function runScenario(scenario) {
  if (scenario.id.startsWith('WF-')) runWaterfallScenario(scenario);
  else if (scenario.id.startsWith('PC-')) runPreferenceClaimScenario(scenario);
  else if (scenario.id.startsWith('CT-')) runSnapshotScenario(scenario);
  else if (scenario.id.startsWith('UT-')) runUtilityScenario(scenario);
  else if (scenario.id.startsWith('CSV-')) runCsvScenario(scenario);
  else throw new Error(`Unknown scenario category: ${scenario.id}`);
}

if (scenarios.length !== 50) throw new Error(`Expected exactly 50 scenarios, found ${scenarios.length}.`);

let passed = 0;
scenarios.forEach((scenario, index) => {
  try {
    runScenario(scenario);
    passed++;
    process.stdout.write(`ok ${index + 1} - ${scenario.id}: ${scenario.title}\n`);
  } catch (error) {
    error.message = `${scenario.id} - ${scenario.title}\nIndependent calculation: ${scenario.calculation}\n${error.message}`;
    throw error;
  }
});

process.stdout.write(`PASS ${passed} independently calculated, human-auditable scenarios\n`);
