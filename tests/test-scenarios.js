/*
 * SPDX-License-Identifier: AGPL-3.0-only
 *
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
[
  '<html lang="en">',
  'id="erm-import-example"',
  'id="erm-export-ocf"',
  'id="erm-import-ocf"',
  'id="erm-ocf-file"',
  'id="erm-ocf-export-dialog"',
  'id="erm-example-dialog"',
  'id="erm-example-without-save"',
  'id="erm-example-save"',
  'id="erm-open-guide"',
  'id="erm-report-bug"',
  'href="mailto:captable@ease-systems.de?subject=EASE%20Cap%20Table%20Manager%20-%20Bug%20report"',
  'id="erm-guide-dialog"',
  'id="erm-guide-content"',
  'const guideSections =',
  'function renderGuide()',
  "guide/screenshots/${language}/${section.image}",
  "['Beispiel laden', 'Load example']",
  "['Beispieldaten laden?', 'Load example data?']",
  "['Fehler melden', 'Report bug']",
  "return supportedLanguages.has(savedLanguage) ? savedLanguage : 'en';",
  'Bug reports and other inquiries can be sent to captable@ease-systems.de.',
  'Fehlerberichte und andere Anfragen können an captable@ease-systems.de gesendet werden.',
  "img-src 'self'",
  'AGPL-3.0-only',
  '.erm-development .erm-panel-tools',
  'https://raw.githubusercontent.com/fleischer-EASE/EASECapTableManager/main/examples/ease-cap-table-example.csv',
  'connect-src blob: data: https://raw.githubusercontent.com',
  'importExampleCsv(false)',
  'importExampleCsv(true)'
].forEach(contract => marker(contract));
const guideSectionsSource = source.slice(
  marker('const guideSections ='),
  marker('function renderGuide()')
);
const guideSectionNumbers = [
  ...guideSectionsSource.matchAll(/number: '(\d{2})'/g)
].map(match => match[1]);
const expectedGuideSectionNumbers = Array.from(
  {length: 13},
  (_, index) => String(index + 1).padStart(2, '0')
);
if (guideSectionNumbers.join(',') !== expectedGuideSectionNumbers.join(','))
  throw new Error(
    `Expected mirrored guide sections 01–13, found ${guideSectionNumbers.join(',')}.`
  );
const guideScreenshotNames = [
  ...guideSectionsSource.matchAll(/image: '([^']+\.png)'/g)
].map(match => match[1]);
if (guideScreenshotNames.length !== 13 || new Set(guideScreenshotNames).size !== 13)
  throw new Error('The illustrated guide must reference 13 unique screenshots.');
for (const language of ['de', 'en']) {
  for (const screenshot of guideScreenshotNames) {
    const screenshotPath = `guide/screenshots/${language}/${screenshot}`;
    if (!fs.existsSync(screenshotPath))
      throw new Error(`Guide screenshot is missing: ${screenshotPath}`);
    if (fs.statSync(screenshotPath).size < 45000)
      throw new Error(`Guide screenshot appears incomplete: ${screenshotPath}`);
  }
}
const renderGuideSource = source.slice(
  marker('function renderGuide()'),
  marker('function refreshIcons()')
);
['erm-guide-terminology', '<span>14</span>', 'guideTerms'].forEach(section14Marker => {
  if (renderGuideSource.includes(section14Marker))
    throw new Error(`Guide section 14 is still rendered: ${section14Marker}`);
});
[
  'GitHub-Beispiel',
  'GitHub-Beispieldaten',
  'Load GitHub example',
  'GitHub example data',
  'Praxisanleitung · GitHub-Beispiel',
  'Practical guide · GitHub example'
].forEach(removedExampleLabel => {
  if (source.includes(removedExampleLabel))
    throw new Error(`Removed example label is still present: ${removedExampleLabel}`);
});
if (source.includes('<span class="erm-page-kicker">EASE Cap Table Manager</span>'))
  throw new Error('Redundant main-section product label is still present.');
const license = fs.readFileSync('LICENSE', 'utf8');
if (!license.includes('GNU AFFERO GENERAL PUBLIC LICENSE') || !license.includes('Version 3, 19 November 2007'))
  throw new Error('The full GNU AGPL version 3 license text is missing.');

const declarationMarker = name => marker(`const ${name} =`);
const functionMarker = name => marker(`function ${name}(`);

const validDateStart = declarationMarker('validDate');
const validDateEnd = declarationMarker('roundInvestors');
const roundHelpersStart = validDateEnd;
const roundHelpersEnd = declarationMarker('chronologicalRounds');
const financeStart = declarationMarker('loanClaim');
const financeEnd = declarationMarker('vsopPools');
const waterfallStart = declarationMarker('aggregateLots');
const snapshotsStart = functionMarker('snapshots');
const renderStart = functionMarker('render');
const normalizeStart = declarationMarker('normalizeRound');
const normalizeEnd = marker('// State lifecycle');
const csvStart = functionMarker('parseCsv');
const csvEnd = declarationMarker('holderKey');
const ocfStart = declarationMarker('ocfVersion');
const ocfEnd = csvStart;

const validDate = new Function(
  source.slice(validDateStart, validDateEnd) + '\nreturn validDate;'
)();
const projectRoundHelpers = new Function(
  source.slice(roundHelpersStart, roundHelpersEnd) + '\nreturn {roundInvestors,roundInvestment};'
)();
const projectFinance = new Function(
  'validDate',
  'today',
  source.slice(financeStart, financeEnd) + '\nreturn {loanClaim,addMonths,completedMonths,earnedVsopShares,vestedShares,vsopEntitlement,calculateVsopPayout,reservedVsopShares};'
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
const projectNormalizers = new Function(
  source.slice(normalizeStart, normalizeEnd) + '\nreturn {normalizeRound,normalizeVsopGrant};'
)();
const normalizeRound = projectNormalizers.normalizeRound;
const normalizeVsopGrant = projectNormalizers.normalizeVsopGrant;
const projectOcf = new Function(
  'validDate',
  'today',
  'addMonths',
  'snapshots',
  'roundInvestors',
  'normalizeRound',
  'normalizeVsopGrant',
  'completedMonths',
  source.slice(ocfStart, ocfEnd) +
    '\nreturn {ocfVersion,md5Bytes,crc32,createStoredZip,createOcfPackage,readOcfZip,parseOcfPackage,stateFromGenericOcf};'
)(
  validDate,
  '2030-01-01',
  projectFinance.addMonths,
  snapshots,
  projectRoundHelpers.roundInvestors,
  normalizeRound,
  normalizeVsopGrant,
  projectFinance.completedMonths
);

function buildCsvImporter() {
  let generatedId = 0;
  return new Function(
    'validDate',
    'normalizeRound',
    'normalizeVsopGrant',
    'holderKey',
    'num',
    'reservedVsopShares',
    'roundInvestment',
    'snapshots',
    'uid',
    'initialState',
    `let state=initialState,stage=0;const save=()=>{},render=()=>{};${source.slice(csvStart, csvEnd)}\nreturn {importCsv,getState:()=>state};`
  )(
    validDate,
    normalizeRound,
    normalizeVsopGrant,
    holderKey,
    num,
    projectFinance.reservedVsopShares,
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
    poolId: options.poolId || '',
    includeConvertiblesInFullyDiluted: Boolean(options.includeConvertiblesInFullyDiluted)
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
    fullyDilutedConversion: options.fullyDilutedConversion !== false,
    fullyDilutedGrantedVsopOnly: Boolean(options.fullyDilutedGrantedVsopOnly)
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
    title: 'Rank 2 is paid before rank 1 regardless of input order',
    calculation: 'The rank-2 claim receives €100 first; the remaining €50 partially pays the rank-1 claim.',
    input: {
      proceeds: 150,
      exitDate: '2027-01-01',
      lots: [
        {id: 'rank-one', kind: 'participating', shares: 20, investment: 100, preference: 100, seniority: 1},
        {id: 'rank-two', kind: 'participating', shares: 20, investment: 100, preference: 100, seniority: 2},
        {id: 'common', kind: 'common', shares: 60}
      ]
    },
    expected: {payouts: {'rank-one': 50, 'rank-two': 100, common: 0}, preferencePaid: {'rank-one': 50, 'rank-two': 100}, elected: [], converted: [], unallocated: 0}
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
    title: 'Same-name convertible holdings are bundled after separate conversions',
    calculation: 'One €50k note converts at the €8 discount price into 6,250 shares; another converts at the €7 cap price into 7,142.857143 shares, bundled as 13,392.857143 Angel shares.',
    input: makeState({
      convertibles: [
        makeConvertible({id: 'discount-note', name: 'Discount Note', lender: 'Angel', principal: 50000, date: '2024-01-01', discount: 20}),
        makeConvertible({id: 'cap-note', name: 'Cap Note', lender: 'Angel', principal: 50000, date: '2024-02-01', valuationCap: 7000000})
      ],
      rounds: [makeRound({id: 'round-a', name: 'Seed', preMoney: 10000000, date: '2025-01-01', investors: [{id: 'fund', name: 'Fund', investment: 1000000}]})]
    }),
    expected: {
      price: 10,
      raised: 1100000,
      valuation: 11000000,
      capShares: {Founder: 1000000, Angel: 13392.8571428571, Fund: 100000},
      conversions: {
        'discount-note': {price: 8, claim: 50000, shares: 6250},
        'cap-note': {price: 7, claim: 50000, shares: 7142.8571428571}
      }
    }
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
    id: 'CT-63',
    title: 'A convertible included in fully diluted pricing converts at the round price',
    calculation: 'The €100k CLA represents 1% of the €10m pre-money valuation. Its simultaneous as-converted amount is 10,101.010101 shares, so €10m / 1,010,101.010101 = €9.90 per share for both the CLA and the new investor.',
    input: makeState({
      convertibles: [makeConvertible({id: 'note', name: 'Angel Note', lender: 'Angel', principal: 100000, date: '2024-01-01'})],
      rounds: [makeRound({id: 'round-a', name: 'Seed', preMoney: 10000000, date: '2025-01-01', includeConvertiblesInFullyDiluted: true, investors: [{id: 'fund', name: 'Fund', investment: 1000000}]})]
    }),
    expected: {
      price: 9.9,
      raised: 1100000,
      valuation: 11000000,
      capShares: {Founder: 1000000, Angel: 10101.0101010101, Fund: 101010.101010101},
      conversions: {note: {price: 9.9, claim: 100000, shares: 10101.0101010101}}
    }
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
    id: 'CT-62',
    title: 'A fully diluted convertible can count granted VSOP shares only',
    calculation: 'Only the 40-share grant issued before conversion counts: €1m / (900 equity + 40 granted) = €1,063.829787 per share, so €100k converts into 94 shares. Planned shares, a future grant and a cancelled grant are excluded.',
    input: makeState({
      holders: [makeHolder('founder', 'Founder', 900), makeHolder('pool', 'Pool', 100, {type: 'VSOP-Pool', isVirtual: true})],
      convertibles: [makeConvertible({id: 'note', name: 'Angel Note', lender: 'Angel', principal: 100000, date: '2024-01-01', fullyDilutedGrantedVsopOnly: true})],
      vsopParticipants: [
        {id: 'granted', name: 'Employee', poolId: 'pool', shares: 40, plannedShares: 20, grantDate: '2024-06-01', status: 'Aktiv'},
        {id: 'future', name: 'Future employee', poolId: 'pool', shares: 30, plannedShares: 0, grantDate: '2026-01-01', status: 'Aktiv'},
        {id: 'cancelled', name: 'Cancelled employee', poolId: 'pool', shares: 10, plannedShares: 0, grantDate: '2024-07-01', status: 'Storniert'}
      ],
      rounds: [makeRound({id: 'round-a', name: 'Seed', preMoney: 1000000, date: '2025-01-01', investors: [{id: 'fund', name: 'Fund', investment: 100000}]})]
    }),
    expected: {price: 1000, raised: 200000, valuation: 1100000, capShares: {Founder: 900, Pool: 100, Angel: 94, Fund: 100}, conversions: {note: {price: 1063.829787234, claim: 100000, shares: 94}}}
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
    title: 'Same-name investments bundle ownership but retain lot-specific exit terms',
    calculation: 'Two Fund subscriptions in Series A combine to €100/10 shares; Series B adds 10 shares. At a €150 exit, rank-2 participating Series B receives €100 before rank-1 non-participating Series A receives €50.',
    input: makeState({
      holders: [makeHolder('founder', 'Founder', 100)],
      rounds: [
        makeRound({
          id: 'round-a',
          name: 'Series A',
          preMoney: 1000,
          date: '2025-01-01',
          preferenceType: 'non-participating',
          seniority: 1,
          investors: [
            {id: 'fund-a-1', name: 'Fund', investment: 40},
            {id: 'fund-a-2', name: ' Fund ', investment: 60}
          ]
        }),
        makeRound({
          id: 'round-b',
          name: 'Series B',
          preMoney: 1100,
          date: '2026-01-01',
          preferenceType: 'participating',
          seniority: 2,
          investors: [{id: 'fund-b', name: 'fund', investment: 100}]
        })
      ]
    }),
    expected: {
      price: 10,
      capShares: {Founder: 100, Fund: 20},
      capLegalShares: {Fund: 20},
      bundledRoundInvestors: {'round-a': {count: 1, investment: 100}},
      lots: [
        {name: 'Fund', sourceRoundId: 'round-a', holderId: 'inv-round-a-fund-a-1', shares: 10, preferenceType: 'non-participating', liquidationSeniority: 1},
        {name: 'fund', sourceRoundId: 'round-b', holderId: 'inv-round-a-fund-a-1', shares: 10, preferenceType: 'participating', liquidationSeniority: 2}
      ],
      waterfall: {
        proceeds: 150,
        exitDate: '2027-01-01',
        lotPayouts: {'round-a': 50, 'round-b': 100},
        holderPayouts: {Fund: 150, Founder: 0}
      }
    }
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
  },
  {
    id: 'VSOP-51',
    title: 'A grant cannot vest before its grant date',
    calculation: 'The vesting start is earlier, but the grant is not issued until 1 January 2025, so the 2024 entitlement is zero.',
    kind: 'vesting',
    input: {asOf: '2024-12-31', grant: {shares: 4800, grantDate: '2025-01-01', startDate: '2024-01-01', vestingMonths: 48, cliffMonths: 0, status: 'Aktiv'}},
    expected: {shares: 0}
  },
  {
    id: 'VSOP-52',
    title: 'Quarterly vesting credits only completed quarters',
    calculation: 'Thirteen service months round down to twelve under a three-month cadence; 4,800 × 12/48 = 1,200.',
    kind: 'vesting',
    input: {asOf: '2026-02-01', grant: {shares: 4800, grantDate: '2025-01-01', startDate: '2025-01-01', vestingMonths: 48, cliffMonths: 0, vestingIntervalMonths: 3, status: 'Aktiv'}},
    expected: {shares: 1200}
  },
  {
    id: 'VSOP-53',
    title: 'A vesting pause delays credited service',
    calculation: 'Fourteen elapsed months less a two-month pause equals twelve credited months; 4,800 × 12/48 = 1,200.',
    kind: 'vesting',
    input: {asOf: '2026-03-01', grant: {shares: 4800, grantDate: '2025-01-01', startDate: '2025-01-01', vestingMonths: 48, cliffMonths: 12, vestingPauseMonths: 2, status: 'Aktiv'}},
    expected: {shares: 1200}
  },
  {
    id: 'VSOP-54',
    title: 'A leaver can retain only a contractual share of vested claims',
    calculation: 'Eighteen months vest 1,800 shares; a 50% retention term leaves 900 payable shares.',
    kind: 'vesting',
    input: {asOf: '2028-01-01', grant: {shares: 4800, grantDate: '2025-01-01', startDate: '2025-01-01', vestingMonths: 48, cliffMonths: 12, status: 'Ausgeschieden', leaverDate: '2026-07-01', leaverType: 'neutral', vestedRetentionPct: 50}},
    expected: {shares: 900}
  },
  {
    id: 'VSOP-55',
    title: 'Zero retention removes a bad leaver payout entitlement',
    calculation: 'Eighteen months have vested, but a 0% entered retention factor results in zero retained shares.',
    kind: 'vesting',
    input: {asOf: '2028-01-01', grant: {shares: 4800, grantDate: '2025-01-01', startDate: '2025-01-01', vestingMonths: 48, cliffMonths: 12, status: 'Ausgeschieden', leaverDate: '2026-07-01', leaverType: 'bad', vestedRetentionPct: 0}},
    expected: {shares: 0}
  },
  {
    id: 'VSOP-56',
    title: 'An expired grant has no exit entitlement',
    calculation: 'The grant expired on 31 December 2026, so its payable balance on 1 January 2027 is zero.',
    kind: 'vsop-entitlement',
    input: {asOf: '2027-01-01', grant: {shares: 4800, grantDate: '2025-01-01', startDate: '2025-01-01', vestingMonths: 48, cliffMonths: 12, status: 'Aktiv', expiryDate: '2026-12-31'}},
    expected: {payable: 0, expired: true}
  },
  {
    id: 'VSOP-57',
    title: 'Single-trigger acceleration applies to unvested shares at exit',
    calculation: 'At month 24, 2,400 shares are vested and 2,400 remain; 50% acceleration adds 1,200 for 3,600 payable shares.',
    kind: 'vsop-entitlement',
    input: {asOf: '2027-01-01', grant: {shares: 4800, grantDate: '2025-01-01', startDate: '2025-01-01', vestingMonths: 48, cliffMonths: 12, status: 'Aktiv', accelerationTrigger: 'single', accelerationPct: 50}},
    expected: {earned: 2400, accelerated: 1200, payable: 3600}
  },
  {
    id: 'VSOP-58',
    title: 'Double-trigger acceleration waits for the second event',
    calculation: 'The good leaver retains 1,800 vested shares, but without a dated second trigger no additional shares accelerate.',
    kind: 'vsop-entitlement',
    input: {asOf: '2027-01-01', grant: {shares: 4800, grantDate: '2025-01-01', startDate: '2025-01-01', vestingMonths: 48, cliffMonths: 12, status: 'Ausgeschieden', leaverDate: '2026-07-01', leaverType: 'good', vestedRetentionPct: 100, accelerationTrigger: 'double', accelerationPct: 100}},
    expected: {earned: 1800, accelerated: 0, payable: 1800}
  },
  {
    id: 'VSOP-59',
    title: 'A completed double trigger accelerates the remaining grant',
    calculation: 'The leaver has 1,800 naturally vested shares and the dated second trigger accelerates all 3,000 unvested shares.',
    kind: 'vsop-entitlement',
    input: {asOf: '2027-01-01', grant: {shares: 4800, grantDate: '2025-01-01', startDate: '2025-01-01', vestingMonths: 48, cliffMonths: 12, status: 'Ausgeschieden', leaverDate: '2026-07-01', leaverType: 'good', vestedRetentionPct: 100, accelerationTrigger: 'double', accelerationPct: 100, secondTriggerDate: '2026-12-01'}},
    expected: {earned: 1800, accelerated: 3000, payable: 4800}
  },
  {
    id: 'VSOP-60',
    title: 'The grant-specific strike price reduces the virtual payout',
    calculation: '100 payable virtual shares × (€10 reference value − €3 strike price) = €700.',
    kind: 'vsop-payout',
    input: {asOf: '2027-01-01', valuePerShare: 10, grant: {shares: 100, grantDate: '2025-01-01', startDate: '2025-01-01', vestingMonths: 12, cliffMonths: 0, status: 'Aktiv', hurdle: 3}},
    expected: {payable: 100, spread: 7, payout: 700}
  }
];

const csvScenarios = [
  {
    id: 'CSV-47',
    title: 'The repository example imports as the documented financing path',
    calculation: 'The German example starts with 25,000 founder shares and contains 2 pre-seed angel notes plus Bridge €1m + Seed €3m + Series A €8m = €12m of equity rounds.',
    input: {csv: fs.readFileSync('examples/ease-cap-table-example.csv', 'utf8')},
    expected: {
      holders: 3,
      founderShares: 25000,
      convertibles: 2,
      rounds: 3,
      roundInvestments: {'round-bridge': 1000000, 'round-seed': 3000000, 'round-series-a': 8000000},
      roundInvestorCounts: {'round-bridge': 4, 'round-seed': 2, 'round-series-a': 2},
      roundSeniorities: {'round-bridge': 1, 'round-seed': 2, 'round-series-a': 3},
      roundIncludeConvertibles: {'round-bridge': true, 'round-seed': true, 'round-series-a': true},
      convertible: {
        id: 'convertible-angel-anna',
        fullyDilutedConversion: true,
        fullyDilutedGrantedVsopOnly: false
      },
      vsopGrant: {
        id: 'vsop-mira',
        vestingIntervalMonths: 1,
        vestingPauseMonths: 0,
        leaverType: 'none',
        vestedRetentionPct: 100,
        accelerationTrigger: 'none',
        accelerationPct: 0
      },
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
    expected: {holders: 1, convertibles: 0, rounds: 1, roundInvestments: {seed: 250000}, roundInvestorCounts: {seed: 1}, roundIncludeConvertibles: {seed: false}}
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
  },
  {
    id: 'CSV-61',
    title: 'CSV import rejects an over-allocated VSOP pool',
    calculation: 'The grant reserves 150 virtual shares against a pool capacity of only 100 shares.',
    input: {csv: makeCsv(
      ['record_type', 'id', 'name', 'category', 'shares', 'planned_shares', 'cost_basis_eur', 'investment_date', 'is_virtual', 'pool_id', 'grant_date', 'vesting_start', 'vesting_months', 'cliff_months', 'strike_price_eur', 'status'],
      [
        {record_type: 'holder', id: 'founder', name: 'Founder', category: 'Gründer', shares: 1000, is_virtual: 'false'},
        {record_type: 'holder', id: 'pool', name: 'Employee Pool', category: 'VSOP-Pool', shares: 100, is_virtual: 'true'},
        {record_type: 'vsop', id: 'grant', name: 'Employee', shares: 150, pool_id: 'pool', grant_date: '2025-01-01', vesting_start: '2025-01-01', vesting_months: 48, cliff_months: 12, strike_price_eur: 0, status: 'Aktiv'}
      ]
    )},
    expected: {errorIncludes: 'überbelegt'}
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
  Object.entries(expected.bundledRoundInvestors || {}).forEach(([roundId, values]) => {
    const round = scenario.input.rounds.find(item => item.id === roundId);
    if (!round) throw new Error(`${scenario.id}: round ${roundId} missing`);
    const investors = projectRoundHelpers.roundInvestors(round);
    assertEqual(investors.length, values.count, `${scenario.id} ${roundId} bundled investor count`);
    assertNear(projectRoundHelpers.roundInvestment(round), values.investment, `${scenario.id} ${roundId} bundled investment`);
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
  if (expected.waterfall) {
    const exitLots = actual.lots.filter(lot => !lot.isVirtual && lot.shares > 0);
    const result = projectWaterfall.calculateWaterfall(
      exitLots,
      expected.waterfall.proceeds,
      expected.waterfall.exitDate
    );
    Object.entries(expected.waterfall.lotPayouts || {}).forEach(([sourceRoundId, payout]) => {
      const lot = exitLots.find(item => item.sourceRoundId === sourceRoundId);
      if (!lot) throw new Error(`${scenario.id}: exit lot ${sourceRoundId} missing`);
      assertNear(result.payoutByLot.get(lot.id) || 0, payout, `${scenario.id} ${sourceRoundId} lot payout`);
    });
    Object.entries(expected.waterfall.holderPayouts || {}).forEach(([name, payout]) => {
      const holder = findNamed(actual.cap, name, scenario.id, 'cap table');
      const actualPayout = exitLots
        .filter(lot => lot.holderId === holder.id)
        .reduce((sum, lot) => sum + (result.payoutByLot.get(lot.id) || 0), 0);
      assertNear(actualPayout, payout, `${scenario.id} ${name} bundled exit payout`);
    });
  }
}

function runUtilityScenario(scenario) {
  if (scenario.kind === 'vesting') {
    const actual = projectFinance.vestedShares(scenario.input.grant, scenario.input.asOf);
    assertNear(actual, scenario.expected.shares, `${scenario.id} vested shares`);
    return;
  }
  if (scenario.kind === 'vsop-entitlement') {
    const actual = projectFinance.vsopEntitlement(
      scenario.input.grant,
      scenario.input.asOf,
      true
    );
    Object.entries(scenario.expected).forEach(([key, value]) => {
      if (typeof value === 'number')
        assertNear(actual[key], value, `${scenario.id} ${key}`);
      else assertEqual(actual[key], value, `${scenario.id} ${key}`);
    });
    return;
  }
  if (scenario.kind === 'vsop-payout') {
    const actual = projectFinance.calculateVsopPayout(
      scenario.input.grant,
      scenario.input.asOf,
      scenario.input.valuePerShare
    );
    Object.entries(scenario.expected).forEach(([key, value]) =>
      assertNear(actual[key], value, `${scenario.id} ${key}`)
    );
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
  if (scenario.expected.founderShares !== undefined)
    assertNear(
      state.holders
        .filter(holder => holder.type === 'Gründer')
        .reduce((total, holder) => total + Number(holder.shares || 0), 0),
      scenario.expected.founderShares,
      `${scenario.id} founder shares`
    );
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
  Object.entries(scenario.expected.roundSeniorities || {}).forEach(([id, expected]) => {
    const round = state.rounds.find(item => item.id === id);
    if (!round) throw new Error(`${scenario.id}: round ${id} missing`);
    assertEqual(round.liquidationSeniority, expected, `${scenario.id} ${id} seniority`);
  });
  Object.entries(scenario.expected.roundIncludeConvertibles || {}).forEach(([id, expected]) => {
    const round = state.rounds.find(item => item.id === id);
    if (!round) throw new Error(`${scenario.id}: round ${id} missing`);
    assertEqual(
      round.includeConvertiblesInFullyDiluted,
      expected,
      `${scenario.id} ${id} convertible rights in fully diluted basis`
    );
  });
  if (scenario.expected.convertible) {
    const convertible = state.convertibles.find(
      item => item.id === scenario.expected.convertible.id
    );
    if (!convertible)
      throw new Error(
        `${scenario.id}: convertible ${scenario.expected.convertible.id} missing`
      );
    Object.entries(scenario.expected.convertible).forEach(([key, expected]) =>
      assertEqual(convertible[key], expected, `${scenario.id} convertible ${key}`)
    );
  }
  if (scenario.expected.vsopGrant) {
    const grant = state.vsopParticipants.find(item => item.id === scenario.expected.vsopGrant.id);
    if (!grant) throw new Error(`${scenario.id}: VSOP grant ${scenario.expected.vsopGrant.id} missing`);
    Object.entries(scenario.expected.vsopGrant).forEach(([key, expected]) =>
      assertEqual(grant[key], expected, `${scenario.id} VSOP ${key}`)
    );
  }
  if (scenario.expected.exitValue !== undefined) assertNear(state.exit.value, scenario.expected.exitValue, `${scenario.id} exit value`);
  if (scenario.expected.exitDate !== undefined) assertEqual(state.exit.date, scenario.expected.exitDate, `${scenario.id} exit date`);
}

async function runOcfContractTests() {
  const encoder = new TextEncoder();
  assertEqual(
    projectOcf.md5Bytes(encoder.encode('hello')),
    '5d41402abc4b2a76b9719d911017c592',
    'OCF MD5 implementation'
  );
  assertEqual(projectOcf.crc32(encoder.encode('123456789')), 0xcbf43926, 'OCF CRC-32 implementation');

  const ocfState = {
    founderSetVersion: 'mf-ch-ng-jb-v3',
    financingSetVersion: 'preseed-seed-v1',
    vsopSetVersion: 'vsop-standard-v3',
    holders: [
      makeHolder('founder', 'Founder', 1000, {
        type: 'Gründer',
        costBasis: 25000,
        investmentDate: '2024-01-01'
      }),
      makeHolder('pool', 'Employee Pool', 100, {type: 'VSOP-Pool', isVirtual: true})
    ],
    rounds: [
      makeRound({
        id: 'seed',
        name: 'Seed',
        investors: [{id: 'seed-investor', name: 'Seed VC', investment: 200000}],
        preMoney: 1000000,
        date: '2025-01-01',
        poolRefresh: 20,
        poolRefreshTiming: 'pre',
        poolId: 'pool'
      })
    ],
    convertibles: [
      {
        id: 'note',
        name: 'CN-1',
        lender: 'Angel',
        principal: 50000,
        date: '2024-06-01',
        interest: 5,
        discount: 20,
        valuationCap: 800000,
        fullyDilutedConversion: true,
        fullyDilutedGrantedVsopOnly: true
      }
    ],
    secondaries: [],
    vsopParticipants: [
      normalizeVsopGrant({
        id: 'grant',
        name: 'Employee',
        poolId: 'pool',
        shares: 24,
        plannedShares: 0,
        grantDate: '2024-02-01',
        startDate: '2024-02-01',
        vestingMonths: 24,
        cliffMonths: 12,
        vestingIntervalMonths: 1,
        vestingPauseMonths: 0,
        hurdle: 1,
        status: 'Aktiv',
        leaverDate: '',
        leaverType: 'none',
        vestedRetentionPct: 100,
        expiryDate: '',
        accelerationTrigger: 'none',
        accelerationPct: 0,
        secondTriggerDate: ''
      })
    ],
    exit: {value: 3000000, debt: 0, costs: 0, date: '2028-01-01'}
  };
  const issuer = {
    legal_name: 'Example GmbH',
    formation_date: '2024-01-01',
    country_of_formation: 'DE'
  };
  const generatedAt = new Date('2026-01-02T03:04:05.000Z');
  const packageData = projectOcf.createOcfPackage(ocfState, issuer, generatedAt);
  assertEqual(packageData.manifest.ocf_version, '1.2.0', 'OCF version');
  assertEqual(packageData.manifest.file_type, 'OCF_MANIFEST_FILE', 'OCF manifest type');
  assertEqual(packageData.manifest.issuer.legal_name, 'Example GmbH', 'OCF issuer name');
  assertEqual(packageData.files.length, 6, 'OCF package file count');
  assertEqual(
    new DataView(
      packageData.archive.buffer,
      packageData.archive.byteOffset,
      packageData.archive.byteLength
    ).getUint32(0, true),
    0x04034b50,
    'OCF ZIP local header'
  );
  const files = new Map(packageData.files.map(file => [file.name, file.data]));
  const zipFiles = await projectOcf.readOcfZip(packageData.archive);
  assertEqual(zipFiles.size, packageData.files.length, 'OCF ZIP entry count');
  const parsed = projectOcf.parseOcfPackage(zipFiles);
  assertEqual(parsed.stakeholders.length, 4, 'OCF stakeholder count');
  assertEqual(parsed.stockClasses.length, 2, 'OCF stock class count');
  assertEqual(parsed.stockPlans.length, 1, 'OCF stock plan count');
  assertEqual(parsed.financings.length, 1, 'OCF financing count');
  [
    'TX_STOCK_ISSUANCE',
    'TX_CONVERTIBLE_ISSUANCE',
    'TX_CONVERTIBLE_CONVERSION',
    'TX_STOCK_PLAN_POOL_ADJUSTMENT',
    'TX_EQUITY_COMPENSATION_ISSUANCE'
  ].forEach(type => {
    if (!parsed.transactions.some(transaction => transaction.object_type === type))
      throw new Error(`OCF transaction type missing: ${type}`);
  });
  [
    ...packageData.manifest.stakeholders_files,
    ...packageData.manifest.stock_classes_files,
    ...packageData.manifest.stock_plans_files,
    ...packageData.manifest.transactions_files,
    ...packageData.manifest.financings_files
  ].forEach(reference => {
    assertEqual(
      reference.md5,
      projectOcf.md5Bytes(files.get(reference.filepath)),
      `OCF manifest checksum ${reference.filepath}`
    );
  });
  const stateComment = packageData.manifest.comments.find(comment =>
    comment.startsWith('CAP_TABLE_MANAGER_STATE_V1:')
  );
  if (!stateComment) throw new Error('OCF lossless state metadata is missing');
  const metadata = JSON.parse(stateComment.slice('CAP_TABLE_MANAGER_STATE_V1:'.length));
  assertEqual(JSON.stringify(metadata.state), JSON.stringify(ocfState), 'OCF lossless state payload');

  const genericOcf = {
    ...parsed,
    transactions: parsed.transactions.filter(
      transaction => transaction.object_type !== 'TX_CONVERTIBLE_CONVERSION'
    )
  };
  const genericState = projectOcf.stateFromGenericOcf(genericOcf);
  assertEqual(genericState.rounds.length, 1, 'generic OCF round count');
  assertEqual(genericState.convertibles.length, 1, 'generic OCF convertible count');
  assertEqual(genericState.vsopParticipants.length, 1, 'generic OCF grant count');
  assertEqual(
    genericState.convertibles[0].fullyDilutedGrantedVsopOnly,
    true,
    'generic OCF granted-only conversion basis'
  );
  process.stdout.write('ok OCF - package, checksums, lossless metadata and generic import\n');
}

function runScenario(scenario) {
  if (scenario.id.startsWith('WF-')) runWaterfallScenario(scenario);
  else if (scenario.id.startsWith('PC-')) runPreferenceClaimScenario(scenario);
  else if (scenario.id.startsWith('CT-')) runSnapshotScenario(scenario);
  else if (scenario.id.startsWith('UT-') || scenario.id.startsWith('VSOP-'))
    runUtilityScenario(scenario);
  else if (scenario.id.startsWith('CSV-')) runCsvScenario(scenario);
  else throw new Error(`Unknown scenario category: ${scenario.id}`);
}

async function main() {
  if (scenarios.length !== 63)
    throw new Error(`Expected exactly 63 scenarios, found ${scenarios.length}.`);

  await runOcfContractTests();

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
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
