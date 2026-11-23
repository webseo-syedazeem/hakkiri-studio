/**
 * Word lists the upload reader uses to tell a job title from an employer, a
 * place from a qualification. They only ever decide which box a piece of the
 * person's own text goes in; they never add text.
 */

const words = (s: string) => s.trim().split(/\s+/);
const alt = (list: string[]) => list.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

/** Words that mark a job title. */
const TITLE_WORDS = words(`
manager director engineer developer analyst assistant officer executive consultant coordinator co-ordinator specialist
lead leader head intern internship associate administrator designer nurse teacher accountant advisor adviser technician
supervisor representative clerk driver chef cashier barista receptionist founder co-founder cofounder owner ceo cto cfo
coo cmo vp president partner trainee apprentice graduate volunteer tutor researcher scientist architect writer editor
producer strategist planner buyer recruiter paralegal solicitor barrister lawyer attorney lecturer professor instructor
programmer tester controller auditor bookkeeper secretary operator mechanic electrician plumber carpenter labourer
laborer agent broker trader underwriter actuary pharmacist physician doctor surgeon dentist therapist counsellor
counselor carer caregiver worker practitioner paramedic midwife librarian curator journalist reporter photographer
videographer animator illustrator copywriter marketer merchandiser stylist waiter waitress bartender porter cleaner
housekeeper steward stewardess pilot captain sergeant lieutenant chair chairperson treasurer trustee ambassador
fellow postdoc principal dean headteacher handler picker packer stocker fitter machinist welder surveyor estimator
inspector investigator detective constable guard concierge host hostess nanny coach trainer facilitator translator
interpreter economist statistician biologist chemist physicist geologist mathematician demonstrator invigilator
canvasser fundraiser organiser organizer steward member`);
export const TITLE_WORD = new RegExp(`\\b(?:${alt(TITLE_WORDS)})s?\\b`, "i");

/** Seniority and function words that only make sense in a title. */
export const TITLE_HINT = /\b(?:senior|junior|snr|jnr|sr|jr|chief|deputy|assistant|associate|interim|acting|trainee|graduate|part[- ]time|full[- ]time|freelance|contract|temporary|seasonal|head of|vp of|vice president)\b/i;

/** Endings and words that mark an organisation whatever else is on the line: "Ltd", "plc", "University", "Council". */
const ORG_STRONG_WORDS = words(`
ltd ltd. limited plc inc inc. llc llp lp corp corp. corporation co. company group holdings agency bank university
college school academy institute council nhs trust hospital clinic surgery studios partners partnership
associates foundation society association charity ministry department authority commission union federation
airlines airways gmbh ag sa bv pty pte co-operative cooperative library museum gallery theatre theater church`);
/** Industry words that often end an employer's name but also appear in job titles ("Software Engineer", "Finance Director"). */
const ORG_WEAK_WORDS = words(`
studio solutions services systems technologies technology labs laboratory laboratories consulting consultancy
board network media digital software games entertainment productions publishing press motors automotive energy
power utilities pharma pharmaceuticals healthcare health insurance capital ventures investments securities
financial finance retail stores supermarket supermarkets restaurant restaurants cafe café hotel hotels resorts
logistics freight shipping transport railway railways construction engineering industries international global
worldwide enterprises centre center club team travel foods sportswear outdoor`);
const orgPattern = (list: string[]) => new RegExp(`(?:^|[\\s,(&])(?:${alt(list)})(?=$|[\\s,).])`, "i");
export const ORG_STRONG = orgPattern(ORG_STRONG_WORDS);
export const ORG_WORD = orgPattern([...ORG_STRONG_WORDS, ...ORG_WEAK_WORDS]);

/** Schools, colleges and universities. */
export const INSTITUTION = /\b(?:university|universität|université|universidad|college|school|academy|institute|institution|polytechnic|conservatoire|conservatory|sixth form|high school|grammar|seminary|faculty|business school|law school|medical school|UCL|LSE|MIT|UCLA|NYU|KCL|SOAS|ETH|open university|community college)\b/i;

/** Degrees, school qualifications and vocational awards. */
export const QUALIFICATION = new RegExp(
  "\\b(?:" +
    [
      "B\\.?Sc", "B\\.?A", "B\\.?Eng", "B\\.?Ed", "LL\\.?B", "LL\\.?M", "M\\.?Sc", "M\\.?A", "M\\.?Eng", "M\\.?Res", "M\\.?Phil", "M\\.?B\\.?A", "M\\.?Sci", "M\\.?Ed", "M\\.?Chem", "M\\.?Phys", "M\\.?Math", "MBBS", "MBChB", "BDS", "B\\.?S", "M\\.?S", "B\\.?F\\.?A", "M\\.?F\\.?A", "B\\.?B\\.?A", "Ph\\.?D", "D\\.?Phil", "Ed\\.?D", "J\\.?D", "M\\.?D", "PGCE", "PGDip", "PGCert", "HND", "HNC", "BTEC", "NVQ", "SVQ", "GNVQ", "T[- ]?Levels?", "A[- ]?Levels?", "AS[- ]?Levels?", "GCSEs?", "IGCSEs?", "O[- ]?Levels?", "Highers?", "Advanced Highers?", "IB", "GED", "CertHE", "DipHE", "ACA", "ACCA", "CIMA", "CFA", "CIPD",
      "bachelor(?:'s|s)?", "master(?:'s|s)?", "doctorate", "doctor of", "diploma", "foundation degree", "foundation year", "associate(?:'s)? degree", "associate of", "degree", "honours", "hons", "baccalaureate", "apprenticeship", "certificate in", "certificate of", "level [1-8]", "high school diploma", "graduate diploma", "postgraduate", "undergraduate",
    ].join("|") +
    ")(?![A-Za-z])",
  "i",
);

/** A degree class, school grades or a GPA. Captures the grade as written. */
export const GRADE = new RegExp(
  [
    "\\b(?:first|1st)[- ]class(?: honours| hons)?\\b",
    "\\b(?:upper|lower) second(?:[- ]class)?(?: honours| hons)?\\b",
    "\\b(?:second|third)[- ]class(?: honours| hons)?(?:,? (?:upper|lower) division)?\\b",
    "(?<![\\d:])(?:2[:.][12]|1st|2nd|3rd)(?![\\d:])(?: class)?(?: honours| hons)?",
    "\\b(?:first|distinction\\*?|merit|pass|commendation)\\b(?: with (?:honours|distinction))?",
    "\\b(?:summa|magna) cum laude\\b|\\bcum laude\\b",
    "\\bGPA:?\\s*\\d(?:\\.\\d{1,2})?(?:\\s*/\\s*\\d(?:\\.\\d)?)?",
    "\\b\\d(?:\\.\\d{1,2})\\s*GPA\\b",
    "\\b\\d(?:\\.\\d{1,2})?\\s*/\\s*[45](?:\\.0)?\\b",
    "\\((?:A\\*|[A-E]){2,5}\\)",
    "(?<![A-Za-z*])(?:A\\*)+[A-E]{0,3}(?![A-Za-z*])",
    "(?<![A-Za-z])(?:A\\*|[A-E])(?:\\s*,\\s*(?:A\\*|[A-E])){1,5}(?![A-Za-z*])",
    "\\b\\d{1,2}\\s*GCSEs?[^,;\\n]{0,60}",
    "\\bgrades?:?\\s*[A-E1-9*][A-E1-9*\\s,–-]{0,20}",
    "\\b\\d{2,3}%",
  ].join("|"),
  "i",
);

const UK_PLACES = `london manchester birmingham leeds glasgow edinburgh liverpool bristol sheffield newcastle nottingham leicester
cardiff belfast southampton portsmouth brighton oxford cambridge york bath reading coventry hull stoke derby plymouth
wolverhampton swansea aberdeen dundee norwich exeter luton sunderland milton keynes bournemouth swindon peterborough
middlesbrough bolton huddersfield bradford preston blackpool ipswich northampton guildford cheltenham gloucester
chester lancaster durham canterbury inverness stirling slough watford croydon wakefield doncaster salford warrington
colchester chelmsford maidstone worcester lincoln carlisle wigan stockport oldham rochdale blackburn burnley telford
harrogate basingstoke woking crawley southend dublin cork galway`;
const US_PLACES = `new york los angeles chicago houston phoenix philadelphia san antonio san diego dallas san jose austin
jacksonville fort worth columbus charlotte san francisco indianapolis seattle denver washington boston nashville
detroit portland memphis las vegas louisville baltimore milwaukee albuquerque tucson fresno sacramento atlanta
kansas city miami raleigh omaha oakland minneapolis tulsa cleveland tampa new orleans pittsburgh cincinnati
st louis orlando salt lake city brooklyn palo alto mountain view menlo park cupertino redmond ann arbor madison
boulder durham chapel hill princeton ithaca toronto vancouver montreal ottawa calgary`;
const WORLD_PLACES = `paris berlin munich hamburg frankfurt amsterdam rotterdam brussels madrid barcelona lisbon porto rome milan
zurich geneva vienna prague warsaw budapest stockholm oslo copenhagen helsinki athens istanbul dubai abu dhabi doha
riyadh tel aviv cairo lagos accra nairobi johannesburg cape town mumbai delhi new delhi bangalore bengaluru hyderabad
chennai pune kolkata karachi lahore dhaka singapore hong kong shanghai beijing shenzhen tokyo osaka seoul bangkok
jakarta manila kuala lumpur sydney melbourne brisbane perth auckland wellington mexico city são paulo sao paulo
rio de janeiro buenos aires bogotá bogota santiago lima`;
const COUNTRIES = `uk u.k. united kingdom great britain england scotland wales northern ireland ireland usa u.s.a. u.s. us
united states united states of america canada australia new zealand france germany spain portugal italy netherlands
belgium switzerland austria sweden norway denmark finland poland czech republic hungary greece turkey uae
united arab emirates qatar saudi arabia israel egypt nigeria ghana kenya south africa india pakistan bangladesh
singapore china japan south korea thailand indonesia philippines malaysia mexico brazil argentina colombia chile peru`;
const REGIONS = `greater london greater manchester west midlands west yorkshire south yorkshire merseyside tyne and wear kent
essex surrey sussex hampshire berkshire oxfordshire cambridgeshire norfolk suffolk devon cornwall somerset dorset
lancashire cheshire derbyshire nottinghamshire leicestershire yorkshire hertfordshire buckinghamshire california
texas florida new jersey massachusetts illinois pennsylvania ohio georgia north carolina michigan virginia
washington dc d.c. colorado arizona oregon ontario quebec british columbia`;

const placeList = (s: string) =>
  s
    .split("\n")
    .join(" ")
    .trim();
/** Multi-word places must be matched whole, so the lists are compiled longest first. */
function compilePlaces(...lists: string[]): RegExp {
  const multi = ["milton keynes", "new york", "los angeles", "san antonio", "san diego", "san jose", "fort worth", "san francisco", "las vegas", "kansas city", "new orleans", "st louis", "salt lake city", "palo alto", "mountain view", "menlo park", "ann arbor", "chapel hill", "abu dhabi", "tel aviv", "cape town", "new delhi", "hong kong", "kuala lumpur", "mexico city", "são paulo", "sao paulo", "rio de janeiro", "buenos aires", "united kingdom", "great britain", "northern ireland", "united states of america", "united states", "new zealand", "czech republic", "united arab emirates", "saudi arabia", "south africa", "south korea", "greater london", "greater manchester", "west midlands", "west yorkshire", "south yorkshire", "tyne and wear", "new jersey", "north carolina", "washington dc", "british columbia"];
  let rest = lists.map(placeList).join(" ");
  const found: string[] = [];
  for (const m of multi.sort((a, b) => b.length - a.length)) {
    if (rest.includes(m)) {
      found.push(m);
      rest = rest.split(m).join(" ");
    }
  }
  const single = rest.split(/\s+/).filter(Boolean);
  return new RegExp(`(?<![A-Za-z])(?:${alt([...found, ...single])})(?![A-Za-z])`, "i");
}

export const CITY = compilePlaces(UK_PLACES, US_PLACES, WORLD_PLACES);
export const COUNTRY_OR_REGION = compilePlaces(COUNTRIES, REGIONS);
const US_STATE = /\b(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/;
const WORK_MODE = /^(?:remote|hybrid|on[- ]?site|home[- ]based|work(?:ing)? from home|nationwide|various|field[- ]based)(?:\s*[(/,–-]\s*[\w\s,]+\)?)?$/i;
export const UK_POSTCODE = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i;
const STREET = /\b\d+[a-z]?\s+[\w' ]+\b(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr|close|court|ct|way|place|pl|crescent|gardens|terrace|boulevard|blvd|square|grove|hill|row|walk|mews)\b\.?/i;

/** True when a short piece of text reads as a place: "Leeds", "London, UK", "Austin, TX", "Remote". */
export function looksLikePlace(s: string): boolean {
  const t = s.trim().replace(/[.()]/g, "");
  if (!t || t.length > 60 || /\d{3}|@/.test(t)) return false;
  if (WORK_MODE.test(t)) return true;
  const bits = t.split(/\s*,\s*|\s+[–-]\s+/).filter(Boolean);
  if (bits.length > 3) return false;
  // Every part must itself be a place; "Bank of England" is not one because "Bank of" is left over.
  return bits.every((b) => {
    const rest = b.replace(CITY, "").replace(COUNTRY_OR_REGION, "").replace(US_STATE, "").replace(/\b(?:area|city|county|greater|metropolitan|region|north|south|east|west|central|upon|on|the)\b/gi, "").replace(/[\s-]/g, "");
    if (rest === "") return true;
    // A town that is not on the list still counts beside a country, region or state: "Hebden Bridge, UK".
    return bits.length === 2 && /^[A-Z][a-zà-ÿ'’-]+(?: [A-Z][a-zà-ÿ'’-]+)?$/.test(b) && !ORG_WORD.test(b) && !TITLE_WORD.test(b) && !INSTITUTION.test(b) && bits.some((x) => x !== b && (COUNTRY_OR_REGION.test(x) || US_STATE.test(x)));
  });
}

/** A full postal address: a street with a number, or a UK postcode. CVs only need the town. */
export const looksLikeStreetAddress = (s: string) => STREET.test(s) || UK_POSTCODE.test(s);

/** The town in an address line, if one from the list is named. */
export function townIn(s: string): string {
  const withoutStreet = s.replace(STREET, " ");
  const m = withoutStreet.match(CITY);
  return m ? m[0].replace(/\b\w/g, (c) => c.toUpperCase()) : "";
}

/** Personal details that do not belong on a UK or US CV, and should not be brought in. */
export const PRIVATE_DETAIL = /^(?:date of birth|d\.?o\.?b\.?|born|age|nationality|marital status|gender|sex|religion|national insurance(?: number| no\.?)?|ni number|ni no\.?|social security(?: number)?|ssn|passport(?: number| no\.?)?|place of birth)\s*[:\-–]/i;
