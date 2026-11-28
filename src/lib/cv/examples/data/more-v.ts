import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** Phase 3, batch 3 (28 Nov 2026): 30 roles added to the industry packs. */
export const MORE_V: ExampleSpec[] = [
  {
    id: "warehouse-supervisor",
    industry: "logistics",
    role: "Warehouse Supervisor",
    level: "experienced",
    template: "framework",
    blurb: "A warehouse supervisor who runs a day shift of 24 at a retail distribution centre, with picking accuracy at 99.8% and no lost-time accidents in 26 months.",
    person: { name: "Shauna Brierley", email: "shauna.brierley@example.com", phone: { uk: "07700 900732", us: "(409) 555-0155" }, location: { uk: "Rugby", us: "Beaumont, TX" } },
    profile: {
      uk: "Warehouse supervisor with 12 years in warehousing, the last 5 running a day shift of 24 pickers, packers and loaders at a distribution centre serving 140 health and beauty stores. Plans labour for around 9,000 picks and 45 trailer dispatches a day, using the warehouse management system (WMS) and the order forecast. Raised picking accuracy from 99.2% to 99.8% in 18 months, cut overtime hours on the shift by 35% in a year and has gone 26 months without a lost-time accident. Holds the Institution of Occupational Safety and Health (IOSH) Managing Safely certificate.",
      us: "Warehouse supervisor with 12 years in warehousing, the last 5 running a day shift of 24 pickers, packers and loaders at a distribution center serving 140 health and beauty stores. Plans labor for around 9,000 picks and 45 trailer dispatches a day, using the warehouse management system (WMS) and the order forecast. Raised picking accuracy from 99.2% to 99.8% in 18 months, cut overtime hours on the shift by 35% in a year and has gone 26 months without a lost-time accident. Holds the Occupational Safety and Health Administration (OSHA) 30-Hour General Industry card.",
    },
    experience: [
      {
        title: "Warehouse Supervisor",
        org: "Halverton Distribution",
        location: { uk: "Rugby", us: "Beaumont, TX" },
        start: "2021-05",
        current: true,
        bullets: [
          "Supervise a day shift of 24 pickers, packers and loaders at a 400,000 square foot distribution centre serving 140 health and beauty stores",
          "Plan labour each morning for around 9,000 picks and 45 trailer dispatches a day, moving staff between areas as the order forecast changes",
          "Raised picking accuracy from 99.2% to 99.8% in 18 months by adding a scan check at packing and retraining the 6 pickers with the most errors",
          {
            uk: "Dispatched 98.9% of store orders on time in 2025 against a target of 98%, agreeing trailer cut-off times with the transport planners",
            us: "Dispatched 98.9% of store orders on time in 2025 against a target of 98%, agreeing trailer cut-off times with the transportation planners",
          },
          "Cut overtime hours on the shift by 35% in a year by moving 4 staff to an early start and planning breaks around the dispatch peaks",
          "Kept the shift free of lost-time accidents for 26 months through daily safety walks and a near-miss board that logged 140 reports in 2025",
        ],
      },
      {
        title: { uk: "Team Leader", us: "Team Lead" },
        org: "Brightwell Direct",
        location: { uk: "Northampton", us: "Port Arthur, TX" },
        start: "2017-08",
        end: "2021-04",
        bullets: [
          "Led a night shift team of 10 pickers at an online fashion warehouse, picking up to 12,000 items a night at peak",
          "Raised picks per hour on the team from 95 to 118 by moving 2,000 fast-selling lines to pick faces nearer the packing benches",
          "Ran the returns area of 4 staff, cutting the time to put a returned item back on sale from 6 days to 2",
          {
            uk: "Trained 18 new starters on the warehouse management system and handheld scanners, each picking to target within 3 weeks",
            us: "Trained 18 new hires on the warehouse management system and handheld scanners, each picking to target within 3 weeks",
          },
          "Counted 400 pick locations a week, keeping stock records 99.5% accurate over 2 years of audits",
        ],
      },
      {
        title: { uk: "Warehouse Operative", us: "Warehouse Associate" },
        org: "Brightwell Direct",
        location: { uk: "Northampton", us: "Port Arthur, TX" },
        start: "2014-03",
        end: "2017-07",
        bullets: [
          "Picked and packed around 1,100 items a shift for online orders, against a site target of 950",
          {
            uk: "Gained counterbalance and reach truck licences in 2015 and unloaded around 20 trailers a week",
            us: "Earned forklift certification on counterbalance and reach trucks in 2015 and unloaded around 20 trailers a week",
          },
          {
            uk: "Covered the team leader's role on 30 night shifts in 2017 before taking it on full time",
            us: "Covered the team lead's role on 30 night shifts in 2017 before taking it on full time",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "GCSEs", us: "High School Diploma" },
        org: { uk: "Caldecott Academy", us: "Caldecott High School" },
        location: { uk: "Rugby", us: "Beaumont, TX" },
        end: "2013",
        grade: { uk: "8 at grades A to C, including English and Maths", us: "" },
      },
    ],
    certificates: [
      {
        title: { uk: "IOSH Managing Safely", us: "OSHA 30-Hour General Industry" },
        org: { uk: "Institution of Occupational Safety and Health", us: "Occupational Safety and Health Administration" },
        end: "2022",
      },
      {
        title: { uk: "Level 3 Certificate in Leadership and Management", us: "Certified Logistics Technician" },
        org: { uk: "Institute of Leadership", us: "Manufacturing Skill Standards Council" },
        end: "2021",
      },
      {
        title: { uk: "Emergency First Aid at Work", us: "First Aid, CPR and AED" },
        org: { uk: "St John Ambulance", us: "American Red Cross" },
        end: "2025",
      },
    ],
    skills: [
      "Labour planning",
      "Picking accuracy",
      "Dispatch",
      "Warehouse management systems",
      "Handheld scanners",
      "Safety walks",
      "Near-miss reporting",
      "Returns",
      "Stock counts",
      { uk: "Training new starters", us: "Training new hires" },
    ],
    names: ["Shauna", "Brierley", "Halverton", "Brightwell", "Caldecott", "Penwell", "Rugby", "Beaumont"],
    letter: {
      job: {
        title: "Warehouse Supervisor",
        employer: "Penwell Home and Garden",
        advert: {
          uk: `Warehouse Supervisor
Penwell Home and Garden, Rugby

Penwell Home and Garden sells furniture, garden and kitchen products in 90 stores and online. Our new distribution centre in Rugby opens this spring and will serve every store from one site.

The role
You will lead a day shift of around 30 pickers, packers and loaders, reporting to the warehouse manager.

What we are looking for
- At least 2 years supervising a warehouse shift
- A record of improving picking accuracy and on-time dispatch
- Strong health and safety leadership
- Experience with a warehouse management system
- Confidence training new starters

Salary £34,000 to £37,000, plus shift allowance`,
          us: `Warehouse Supervisor
Penwell Home and Garden, Beaumont, TX

Penwell Home and Garden sells furniture, patio and kitchen products in 90 stores and online. Our new distribution center in Beaumont opens this spring and will serve every store from one site.

The role
You will lead a day shift of around 30 pickers, packers and loaders, reporting to the warehouse manager.

What we are looking for
- At least 2 years supervising a warehouse shift
- A record of improving picking accuracy and on-time dispatch
- Strong workplace safety leadership
- Experience with a warehouse management system
- Confidence training new hires

Salary $52,000 to $58,000, plus shift differential`,
        },
      },
      reason: {
        uk: "I want to lead a larger shift at a new site and train its new starters from the first day.",
        us: "I want to lead a larger shift at a new site and train its new hires from the first day.",
      },
      paragraphs: [
        {
          uk: "Your new distribution centre in Rugby opens this spring, and I would like to run one of its shifts as Warehouse Supervisor. I want to lead a larger shift at a new site and train its new starters from the first day.",
          us: "Your new distribution center in Beaumont opens this spring, and I would like to run one of its shifts as Warehouse Supervisor. I want to lead a larger shift at a new site and train its new hires from the first day.",
        },
        "At Halverton Distribution I supervise a day shift of 24 pickers, packers and loaders at a 400,000 square foot distribution centre serving 140 health and beauty stores. I plan labour each morning for around 9,000 picks and 45 trailer dispatches a day, moving staff between areas as the order forecast changes.",
        {
          uk: "Your advert asks for a record of improving picking accuracy and on-time dispatch. I raised picking accuracy from 99.2% to 99.8% in 18 months by adding a scan check at packing and retraining the 6 pickers with the most errors. I dispatched 98.9% of store orders on time in 2025 against a target of 98%, agreeing trailer cut-off times with the transport planners.",
          us: "Your advert asks for a record of improving picking accuracy and on-time dispatch. I raised picking accuracy from 99.2% to 99.8% in 18 months by adding a scan check at packing and retraining the 6 pickers with the most errors. I dispatched 98.9% of store orders on time in 2025 against a target of 98%, agreeing trailer cut-off times with the transportation planners.",
        },
        {
          uk: "You are also looking for strong health and safety leadership. I have kept the shift free of lost-time accidents for 26 months through daily safety walks and a near-miss board that logged 140 reports in 2025. As a team leader, I trained 18 new starters on the warehouse management system and handheld scanners, each picking to target within 3 weeks.",
          us: "You are also looking for strong workplace safety leadership. I have kept the shift free of lost-time accidents for 26 months through daily safety walks and a near-miss board that logged 140 reports in 2025. As a team lead, I trained 18 new hires on the warehouse management system and handheld scanners, each picking to target within 3 weeks.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "forklift-driver",
    industry: "logistics",
    role: { uk: "Forklift Driver", us: "Forklift Operator" },
    level: "early",
    template: "fieldwork",
    blurb: {
      uk: "A forklift driver with 4 years on reach and counterbalance trucks in a frozen food store, and no damage to stock or racking in 2025.",
      us: "A forklift operator with 4 years on reach and counterbalance trucks in a frozen food warehouse, and no damage to product or racking in 2025.",
    },
    person: { name: "Callan Westerby", email: "callan.westerby@example.com", phone: { uk: "07700 900733", us: "(337) 555-0156" }, location: { uk: "Grimsby", us: "Lake Charles, LA" } },
    profile: {
      uk: "Forklift driver with 4 years on reach and counterbalance trucks in a frozen food store kept at minus 25 degrees. Puts away and picks around 160 pallets a shift across racking 10 metres high, and moved around 31,000 pallets in 2025 with no damage to stock, racking or trucks. Holds Road Transport Industry Training Board (RTITB) licences for reach and counterbalance trucks.",
      us: "Forklift operator with 4 years on reach and counterbalance trucks in a frozen food warehouse kept at minus 13 degrees Fahrenheit. Puts away and picks around 160 pallets a shift across racking 33 feet high, and moved around 31,000 pallets in 2025 with no damage to product, racking or trucks. Certified on reach and counterbalance trucks to the Occupational Safety and Health Administration (OSHA) standard.",
    },
    experience: [
      {
        title: { uk: "Forklift Driver", us: "Forklift Operator" },
        org: { uk: "Kessington Cold Store", us: "Kessington Cold Storage" },
        location: { uk: "Grimsby", us: "Lake Charles, LA" },
        start: "2022-09",
        current: true,
        bullets: [
          {
            uk: "Drive a reach truck in a frozen store kept at minus 25 degrees, putting away and picking around 160 pallets a shift across racking 10 metres high",
            us: "Drive a reach truck in a freezer kept at minus 13 degrees Fahrenheit, putting away and picking around 160 pallets a shift across racking 33 feet high",
          },
          {
            uk: "Unload around 12 trailers a shift by counterbalance truck, checking each pallet's count and temperature against the delivery note",
            us: "Unload around 12 trailers a shift by counterbalance forklift, checking each pallet's count and temperature against the bill of lading",
          },
          {
            uk: "Moved around 31,000 pallets in 2025 with no damage to stock, racking or trucks, shown in the site's monthly damage reports",
            us: "Moved around 31,000 pallets in 2025 with no damage to product, racking or trucks, shown in the site's monthly damage reports",
          },
          "Cut misplaced pallets on the shift from around 15 a month to 2 by scanning each pallet into its rack location before leaving it",
          "Complete pre-use checks on 2 trucks at the start of each shift, reporting 9 faults to the engineers in 2025 before they caused a breakdown",
          {
            uk: "Trained 4 new starters on the put-away routes and handheld scanner during their first week on the reach truck",
            us: "Trained 4 new hires on the put-away routes and handheld scanner during their first week on the reach truck",
          },
        ],
      },
      {
        title: { uk: "Warehouse Operative", us: "Warehouse Associate" },
        org: "Garrow Foods",
        location: { uk: "Cleethorpes", us: "Sulphur, LA" },
        start: "2020-07",
        end: "2022-08",
        bullets: [
          {
            uk: "Picked around 90 pallets a shift of chilled and frozen food for supermarket deliveries using a powered pallet truck",
            us: "Picked around 90 pallets a shift of refrigerated and frozen food for grocery store deliveries using an electric pallet jack",
          },
          {
            uk: "Gained a counterbalance licence in 2021 through the company's training scheme, then unloaded 6 to 8 trailers a shift",
            us: "Earned counterbalance forklift certification in 2021 through the company's training program, then unloaded 6 to 8 trailers a shift",
          },
          "Loaded 8 to 10 trailers a shift to the load plan, with no short or wrong deliveries reported against the shift in 18 months",
        ],
      },
    ],
    education: [
      {
        title: { uk: "GCSEs", us: "High School Diploma" },
        org: { uk: "Ravendale Academy", us: "Ravendale High School" },
        location: { uk: "Grimsby", us: "Lake Charles, LA" },
        end: "2020",
        grade: { uk: "5 at grades 9 to 4, including English and Maths", us: "" },
      },
    ],
    certificates: [
      {
        title: { uk: "RTITB Reach Truck Licence (D1)", us: "OSHA Forklift Certification, Stand-Up Reach Truck" },
        org: { uk: "Road Transport Industry Training Board", us: "Kessington Cold Storage" },
        end: "2022",
      },
      {
        title: { uk: "RTITB Counterbalance Lift Truck Licence (B1)", us: "OSHA Forklift Certification, Sit-Down Counterbalance" },
        org: { uk: "Road Transport Industry Training Board", us: "Garrow Foods" },
        end: "2021",
      },
      {
        title: { uk: "Emergency First Aid at Work", us: "First Aid and CPR" },
        org: { uk: "St John Ambulance", us: "American Red Cross" },
        end: "2024",
      },
    ],
    skills: [
      "Reach trucks",
      { uk: "Counterbalance trucks", us: "Counterbalance forklifts" },
      "Frozen food",
      "Put-away",
      "Pallet picking",
      "Trailer unloading",
      "Load plans",
      "Pre-use checks",
      "Handheld scanners",
    ],
    names: ["Callan", "Westerby", "Kessington", "Garrow", "Ravendale", "Northcote", "Grimsby", "Cleethorpes", "Immingham", "Sulphur"],
    letter: {
      job: {
        title: { uk: "Reach Truck Driver (Cold Store)", us: "Forklift Operator (Freezer)" },
        employer: "Northcote Frozen Foods",
        advert: {
          uk: `Reach Truck Driver (Cold Store)
Northcote Frozen Foods, Immingham

Northcote Frozen Foods makes and stores frozen ready meals and desserts for 4 supermarket chains. Our Immingham cold store holds 18,000 pallets at minus 25 degrees.

The role
You will put away, pick and load pallets in the cold store on a 4-on, 4-off shift pattern.

What we are looking for
- A current reach truck licence (RTITB or similar)
- Experience driving in a cold store or freezer
- A safe driving record with little or no damage
- Accurate use of a handheld scanner
- A counterbalance licence would be useful

Pay £14.20 an hour, plus a cold store allowance`,
          us: `Forklift Operator (Freezer)
Northcote Frozen Foods, Lake Charles, LA

Northcote Frozen Foods makes and stores frozen meals and desserts for 4 grocery chains. Our Lake Charles freezer holds 18,000 pallets at minus 13 degrees Fahrenheit.

The role
You will put away, pick and load pallets in the freezer on a rotating 12-hour shift schedule.

What we are looking for
- Forklift certification on a stand-up reach truck
- Experience driving in a freezer or cold storage warehouse
- A safe driving record with little or no damage
- Accurate use of a handheld scanner
- Counterbalance forklift certification is a plus

Pay $19.50 an hour, plus a freezer differential`,
        },
      },
      reason: {
        uk: "I want to keep driving reach trucks in a cold store, on a shift pattern that gives me more time at home.",
        us: "I want to keep driving reach trucks in a freezer, on a shift schedule that gives me more time at home.",
      },
      paragraphs: [
        {
          uk: "I drive a reach truck in a frozen store kept at minus 25 degrees, and I would like to do the same at Northcote Frozen Foods as a Reach Truck Driver. I want to keep driving reach trucks in a cold store, on a shift pattern that gives me more time at home.",
          us: "I drive a reach truck in a freezer kept at minus 13 degrees Fahrenheit, and I would like to do the same at Northcote Frozen Foods as a Forklift Operator. I want to keep driving reach trucks in a freezer, on a shift schedule that gives me more time at home.",
        },
        {
          uk: "At Kessington Cold Store I put away and pick around 160 pallets a shift across racking 10 metres high. I also unload around 12 trailers a shift by counterbalance truck, checking each pallet's count and temperature against the delivery note.",
          us: "At Kessington Cold Storage I put away and pick around 160 pallets a shift across racking 33 feet high. I also unload around 12 trailers a shift by counterbalance forklift, checking each pallet's count and temperature against the bill of lading.",
        },
        {
          uk: "Your advert asks for a safe driving record with little or no damage. I moved around 31,000 pallets in 2025 with no damage to stock, racking or trucks, shown in the site's monthly damage reports. I complete pre-use checks on 2 trucks at the start of each shift, reporting 9 faults to the engineers in 2025 before they caused a breakdown.",
          us: "Your advert asks for a safe driving record with little or no damage. I moved around 31,000 pallets in 2025 with no damage to product, racking or trucks, shown in the site's monthly damage reports. I complete pre-use checks on 2 trucks at the start of each shift, reporting 9 faults to the engineers in 2025 before they caused a breakdown.",
        },
        {
          uk: "You are also looking for accurate use of a handheld scanner. I cut misplaced pallets on the shift from around 15 a month to 2 by scanning each pallet into its rack location before leaving it. I have also trained 4 new starters on the put-away routes and handheld scanner during their first week on the reach truck. I hold Road Transport Industry Training Board (RTITB) licences for reach and counterbalance trucks.",
          us: "You are also looking for accurate use of a handheld scanner. I cut misplaced pallets on the shift from around 15 a month to 2 by scanning each pallet into its rack location before leaving it. I have also trained 4 new hires on the put-away routes and handheld scanner during their first week on the reach truck. I am certified on reach and counterbalance trucks to the Occupational Safety and Health Administration (OSHA) standard.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "production-supervisor",
    industry: "manufacturing",
    role: "Production Supervisor",
    level: "experienced",
    template: "compact",
    blurb: "A production supervisor who leads a shift of 32 on 3 filling lines at a sauce factory, with less waste, faster changeovers and no lost-time injuries since 2022.",
    person: { name: "Rebecca Hollingsworth", email: "rebecca.hollingsworth@example.com", phone: { uk: "07700 900734", us: "(601) 555-0157" }, location: { uk: "Stafford", us: "Jackson, MS" } },
    profile: {
      uk: "Production supervisor with 11 years in food manufacturing, the last 5 leading a shift of 32 operators across 3 jar and pouch filling lines. Raised overall equipment effectiveness (OEE) on the lines from 61% to 72% in 2 years and cut ingredient and packaging waste from 4.8% to 3.1%. Led 14 lean improvement projects, including 5S on all 3 lines, and has had no lost-time injuries on the shift since 2022. Holds a Lean Six Sigma Green Belt and a Level 3 Award in Hazard Analysis and Critical Control Points (HACCP).",
      us: "Production supervisor with 11 years in food manufacturing, the last 5 leading a shift of 32 operators across 3 jar and pouch filling lines. Raised overall equipment effectiveness (OEE) on the lines from 61% to 72% in 2 years and cut ingredient and packaging waste from 4.8% to 3.1%. Led 14 lean improvement projects, including 5S on all 3 lines, and has had no lost-time injuries on the shift since 2022. Holds a Lean Six Sigma Green Belt and Hazard Analysis and Critical Control Points (HACCP) certification.",
    },
    experience: [
      {
        title: "Production Supervisor",
        org: "Morwick Foods",
        location: { uk: "Stafford", us: "Jackson, MS" },
        start: "2021-06",
        current: true,
        bullets: [
          "Lead a shift of 32 operators and 3 line leaders across 3 filling lines, making around 140,000 jars and pouches of sauce a shift",
          "Raised overall equipment effectiveness on the 3 lines from 61% to 72% in 2 years by tracking every stop on a shift board and fixing the top 3 causes each month",
          "Cut ingredient and packaging waste from 4.8% to 3.1% of materials used by setting filler weights at each start-up and checking them every hour",
          {
            uk: "Cut changeover time between recipes from 75 minutes to 40 with a single-minute exchange of die (SMED) workshop and pre-staged parts trolleys",
            us: "Cut changeover time between recipes from 75 minutes to 40 with a single-minute exchange of die (SMED) workshop and pre-staged parts carts",
          },
          "Kept the shift free of lost-time injuries since 2022 through daily safety briefings and weekly 5S audits on all 3 lines",
          "Prepared the shift for 6 customer and food safety audits since 2021, with no major findings in any of them",
        ],
      },
      {
        title: { uk: "Shift Team Leader", us: "Shift Lead" },
        org: "Morwick Foods",
        location: { uk: "Stafford", us: "Jackson, MS" },
        start: "2018-03",
        end: "2021-05",
        bullets: [
          "Ran the pouch filling line with 9 operators, filling around 45,000 pouches a shift",
          "Raised line output by 14% in a year by bringing in a start-up checklist and staggering breaks so the line kept running",
          {
            uk: "Trained 22 operators on the filler, capper and labeller, cutting new starters' time to sign-off from 8 weeks to 5",
            us: "Trained 22 operators on the filler, capper and labeler, cutting new hires' time to sign-off from 8 weeks to 5",
          },
          "Ran 6 root cause investigations into foreign body complaints, closing each with a fix that stopped it happening again",
        ],
      },
      {
        title: { uk: "Production Operative", us: "Production Worker" },
        org: "Morwick Foods",
        location: { uk: "Stafford", us: "Jackson, MS" },
        start: "2015-09",
        end: "2018-02",
        bullets: [
          "Operated the jar filler and capper on a line making around 50,000 jars a shift",
          "Checked fill weights and seal quality every 30 minutes, logging around 20 checks a shift for the quality team",
          {
            uk: "Covered the line leader's role on 40 shifts in 2017, leading to promotion to shift team leader in 2018",
            us: "Covered the line leader's role on 40 shifts in 2017, leading to promotion to shift lead in 2018",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "HNC in Manufacturing Engineering", us: "Associate of Applied Science in Industrial Technology" },
        org: { uk: "Penkridge College", us: "Rankin Valley Community College" },
        location: { uk: "Stafford", us: "Jackson, MS" },
        end: "2019",
        grade: { uk: "Distinction", us: "GPA 3.5" },
      },
    ],
    certificates: [
      { title: "Lean Six Sigma Green Belt", org: { uk: "British Quality Foundation", us: "American Society for Quality" }, end: "2022" },
      {
        title: { uk: "Level 3 Award in HACCP for Food Manufacturing", us: "HACCP Certification" },
        org: { uk: "Highfield Qualifications", us: "International HACCP Alliance" },
        end: "2020",
      },
      {
        title: { uk: "IOSH Managing Safely", us: "OSHA 10-Hour General Industry" },
        org: { uk: "Institution of Occupational Safety and Health", us: "Occupational Safety and Health Administration" },
        end: "2021",
      },
    ],
    skills: [
      "Overall equipment effectiveness",
      "Lean improvement projects",
      "5S audits",
      "Changeovers",
      "Packaging waste",
      "Filler weights",
      "Root cause investigations",
      "Food safety audits",
      "Training operators",
      "Shift boards",
    ],
    names: ["Rebecca", "Hollingsworth", "Morwick", "Drayford", "Penkridge", "Rankin", "Stafford", "Highfield", "capper", "labeller", "labeler"],
    letter: {
      job: {
        title: "Production Supervisor (Nights)",
        employer: "Drayford Foods",
        advert: {
          uk: `Production Supervisor (Nights)
Drayford Foods, Stafford

Drayford Foods makes chilled soups and sauces for 3 supermarket chains. We are adding a night shift to our Stafford site in the new year to keep up with demand.

The role
You will lead a night shift of around 35 operators on 4 filling and packing lines, reporting to the production manager.

What we are looking for
- At least 2 years supervising a production shift in food manufacturing
- A record of improving OEE and cutting waste
- Experience with lean tools such as 5S and SMED
- Strong food safety and health and safety knowledge
- Experience training and developing operators

Salary £40,000 to £44,000, plus night shift allowance`,
          us: `Production Supervisor (Nights)
Drayford Foods, Jackson, MS

Drayford Foods makes refrigerated soups and sauces for 3 grocery chains. We are adding a night shift to our Jackson plant in the new year to keep up with demand.

The role
You will lead a night shift of around 35 operators on 4 filling and packing lines, reporting to the production manager.

What we are looking for
- At least 2 years supervising a production shift in food manufacturing
- A record of improving OEE and cutting waste
- Experience with lean tools such as 5S and SMED
- Strong food safety and workplace safety knowledge
- Experience training and developing operators

Salary $62,000 to $68,000, plus night shift differential`,
        },
      },
      reason: "I want to lead a larger shift and build a new night team from the start.",
      paragraphs: [
        {
          uk: "Setting up a new night shift is work I would like to lead, and the Production Supervisor (Nights) post at Drayford Foods offers that chance. I want to lead a larger shift and build a new night team from the start.",
          us: "Setting up a new night shift is work I would like to lead, and the Production Supervisor (Nights) position at Drayford Foods offers that chance. I want to lead a larger shift and build a new night team from the start.",
        },
        "At Morwick Foods I lead a shift of 32 operators and 3 line leaders across 3 filling lines, making around 140,000 jars and pouches of sauce a shift. Your advert asks for a record of improving OEE and cutting waste. I raised overall equipment effectiveness on the 3 lines from 61% to 72% in 2 years by tracking every stop on a shift board and fixing the top 3 causes each month.",
        {
          uk: "I also cut ingredient and packaging waste from 4.8% to 3.1% of materials used by setting filler weights at each start-up and checking them every hour. You are also looking for experience with lean tools such as 5S and SMED. I cut changeover time between recipes from 75 minutes to 40 with a single-minute exchange of die (SMED) workshop and pre-staged parts trolleys.",
          us: "I also cut ingredient and packaging waste from 4.8% to 3.1% of materials used by setting filler weights at each start-up and checking them every hour. You are also looking for experience with lean tools such as 5S and SMED. I cut changeover time between recipes from 75 minutes to 40 with a single-minute exchange of die (SMED) workshop and pre-staged parts carts.",
        },
        {
          uk: "As a shift team leader, I trained 22 operators on the filler, capper and labeller, cutting new starters' time to sign-off from 8 weeks to 5. I hold a Lean Six Sigma Green Belt and a Level 3 Award in Hazard Analysis and Critical Control Points (HACCP).",
          us: "As a shift lead, I trained 22 operators on the filler, capper and labeler, cutting new hires' time to sign-off from 8 weeks to 5. I hold a Lean Six Sigma Green Belt and Hazard Analysis and Critical Control Points (HACCP) certification.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "prison-officer",
    industry: "public-sector",
    role: { uk: "Prison Officer", us: "Correctional Officer" },
    level: "experienced",
    template: "standard",
    blurb: {
      uk: "A prison officer with 6 years on the wings of a busy local prison, from key work and cell searches to calming incidents without force.",
      us: "A correctional officer with 6 years in the housing units of a medium-security state prison, from cell searches to calming incidents without force.",
    },
    person: { name: "Leon Maddox", email: "leon.maddox@example.com", phone: { uk: "07700 900735", us: "(334) 555-0158" }, location: { uk: "Lincoln", us: "Montgomery, AL" } },
    profile: {
      uk: "Prison officer with 6 years at a Category B local prison holding 900 men, running a wing of 160 as one of 7 officers a shift. Calms tense situations by talking first, resolving 43 of the 52 incidents attended in 2025 without using force, and searches around 15 cells a week. Holds weekly key worker sessions with 6 men and opens Assessment, Care in Custody and Teamwork (ACCT) plans for men at risk of self-harm. Came to the prison service after 3 years as a hospital security officer.",
      us: "Correctional officer with 6 years at a medium-security state prison holding 1,400 men, supervising a housing unit of 160 as one of 4 officers a shift. Calms tense situations by talking first, resolving 43 of the 52 incidents attended in 2025 without using force, and searches around 15 cells a week. Runs suicide watch checks for men at risk of self-harm after Crisis Intervention Team (CIT) training. Came to corrections after 3 years as a hospital security officer.",
    },
    experience: [
      {
        title: { uk: "Prison Officer", us: "Correctional Officer" },
        org: { uk: "HMP Wealdmoor", us: "Coosa Ridge Correctional Facility" },
        location: { uk: "Lincoln", us: "Montgomery, AL" },
        start: "2020-04",
        current: true,
        bullets: [
          {
            uk: "Run the daily regime on a wing of 160 men as one of 7 officers a shift, from unlock and roll checks to work, meals and evening lock-up",
            us: "Supervise a housing unit of 160 men as one of 4 officers a shift, running 5 formal counts and controlling movement to meals, work and programs",
          },
          "Calmed tense situations by talking first, resolving 43 of the 52 incidents attended in 2025 without using force",
          {
            uk: "Search around 15 cells a week, finding 31 mobile phones, 18 drug packages and 6 weapons in 2025",
            us: "Search around 15 cells a week, finding 31 cell phones, 18 drug packages and 6 weapons in 2025",
          },
          {
            uk: "Hold weekly key worker sessions with 6 men, setting goals for work, education and family contact and recording each session in their case notes",
            us: "Escorted 64 men to court and hospital appointments in 2025, with no escape attempts and no use of force",
          },
          {
            uk: "Opened 24 Assessment, Care in Custody and Teamwork (ACCT) plans in 2025 for men at risk of self-harm, and attended 40 ACCT case reviews",
            us: "Completed 15-minute suicide watch checks on 30 men in 2025 after Crisis Intervention Team training, logging each check on the watch sheet",
          },
          {
            uk: "Wrote around 60 incident and adjudication reports in 2025, none returned by the adjudicating governor for missing detail",
            us: "Wrote around 60 incident and disciplinary reports in 2025, none returned by the hearing officer for missing detail",
          },
        ],
      },
      {
        title: "Security Officer",
        org: { uk: "Selwood Hospital", us: "Selwood Medical Center" },
        location: { uk: "Lincoln", us: "Montgomery, AL" },
        start: "2017-05",
        end: "2020-03",
        bullets: [
          {
            uk: "Patrolled a 600-bed hospital on day and night shifts, answering around 25 calls a week from wards and the emergency department",
            us: "Patrolled a 600-bed hospital on day and night shifts, answering around 25 calls a week from units and the emergency room",
          },
          "Calmed around 10 aggressive patients and visitors a month by talking first, needing physical restraint in 6 cases over 3 years",
          "Wrote around 15 incident reports a month for the security manager, with 4 used as evidence in police cases",
          {
            uk: "Trained 40 nurses in conflict resolution over 2 years, with reported assaults on staff on the 4 busiest wards falling by 20%",
            us: "Trained 40 nurses in conflict resolution over 2 years, with reported assaults on staff on the 4 busiest units falling by 20%",
          },
        ],
      },
    ],
    volunteering: [
      {
        title: "Volunteer Boxing Coach",
        org: { uk: "Witham Valley Boxing Club", us: "Witham Valley Boxing Gym" },
        location: { uk: "Lincoln", us: "Montgomery, AL" },
        start: "2019-09",
        current: true,
        bullets: [
          "Coach 2 evening sessions a week for around 25 young people aged 11 to 16, many referred by their schools",
          "Trained 4 young boxers to their first competitive bouts in 2024 and 2025",
          {
            uk: "Raised £3,200 for new gloves, pads and a ring floor through 2 sponsored walks in 2023",
            us: "Raised $4,000 for new gloves, pads and a ring floor through 2 sponsored walks in 2023",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BTEC Level 3 Extended Diploma in Uniformed Protective Services", us: "Associate of Science in Criminal Justice" },
        org: { uk: "Lindale College", us: "Lindale Community College" },
        location: { uk: "Lincoln", us: "Montgomery, AL" },
        end: "2017",
        grade: { uk: "Distinction, Distinction, Merit", us: "GPA 3.3" },
      },
    ],
    certificates: [
      {
        title: { uk: "Prison Officer Entry Level Training", us: "Correctional Officer Certification" },
        org: { uk: "His Majesty's Prison and Probation Service", us: "Alabama Corrections Academy" },
        end: "2020",
      },
      {
        title: { uk: "Use of Force Refresher Training", us: "Crisis Intervention Team Training" },
        org: { uk: "His Majesty's Prison and Probation Service", us: "Coosa Ridge Correctional Facility" },
        end: "2025",
      },
      {
        title: { uk: "Emergency First Aid at Work", us: "First Aid, CPR and AED" },
        org: { uk: "St John Ambulance", us: "American Red Cross" },
        end: "2025",
      },
    ],
    skills: [
      { uk: "Wing regime", us: "Formal counts" },
      "Calming tense situations",
      "Cell searches",
      { uk: "Key worker sessions", us: "Court and hospital escorts" },
      { uk: "ACCT case reviews", us: "Suicide watch" },
      { uk: "Incident reports", us: "Crisis intervention" },
      { uk: "Adjudication reports", us: "Disciplinary reports" },
      "Conflict resolution",
      "Patrolling",
    ],
    names: ["Leon", "Maddox", "Witham", "Wealdmoor", "Lowmoor", "Coosa", "Brookmere", "Selwood", "Lindale", "Lincoln", "Montgomery"],
    letter: {
      job: {
        title: { uk: "Prison Officer", us: "Correctional Officer" },
        employer: { uk: "HMP Lowmoor", us: "Brookmere Correctional Facility" },
        advert: {
          uk: `Prison Officer
HMP Lowmoor, near Lincoln

HMP Lowmoor is a Category C training prison for 1,100 men, with workshops, a college and a resettlement unit to prepare men for release.

The role
You will run the daily regime on a residential wing, hold key worker sessions and keep the wing safe, decent and secure.

What we are looking for
- Experience as a prison officer, or of working with people in a custodial setting
- The ability to calm tense situations without force
- Experience of searching and security procedures
- Clear, accurate report writing
- A commitment to helping men prepare for release

Salary £33,000 to £37,000, depending on shift pattern`,
          us: `Correctional Officer
Brookmere Correctional Facility, Montgomery, AL

Brookmere Correctional Facility is a medium-security state prison for 1,100 men, with vocational programs, a high school equivalency program and a re-entry unit to prepare men for release.

The role
You will supervise a housing unit, run counts and searches and keep the unit safe and secure.

What we are looking for
- Correctional officer certification, or willingness to complete the state academy
- The ability to calm tense situations without force
- Experience with searches and security procedures
- Clear, accurate report writing
- A commitment to helping men prepare for release

Salary $45,000 to $52,000, plus overtime`,
        },
      },
      reason: {
        uk: "A training prison is where I want to work next, so I can do more key work with men getting ready for release.",
        us: "A facility with more programs is where I want to work next, so I can do more to prepare men for release.",
      },
      paragraphs: [
        {
          uk: "A training prison is where I want to work next, so I can do more key work with men getting ready for release. That is why I am applying for the Prison Officer post at HMP Lowmoor.",
          us: "A facility with more programs is where I want to work next, so I can do more to prepare men for release. That is why I am applying for the Correctional Officer position at Brookmere Correctional Facility.",
        },
        {
          uk: "At HMP Wealdmoor I run the daily regime on a wing of 160 men as one of 7 officers a shift, from unlock and roll checks to work, meals and evening lock-up. Your advert asks for the ability to calm tense situations without force. I calmed tense situations by talking first, resolving 43 of the 52 incidents attended in 2025 without using force.",
          us: "At Coosa Ridge Correctional Facility I supervise a housing unit of 160 men as one of 4 officers a shift, running 5 formal counts and controlling movement to meals, work and programs. Your advert asks for the ability to calm tense situations without force. I calmed tense situations by talking first, resolving 43 of the 52 incidents attended in 2025 without using force.",
        },
        {
          uk: "You are also looking for experience of searching and security procedures. I search around 15 cells a week, finding 31 mobile phones, 18 drug packages and 6 weapons in 2025. I wrote around 60 incident and adjudication reports in 2025, none returned by the adjudicating governor for missing detail.",
          us: "You are also looking for experience with searches and security procedures. I search around 15 cells a week, finding 31 cell phones, 18 drug packages and 6 weapons in 2025. I wrote around 60 incident and disciplinary reports in 2025, none returned by the hearing officer for missing detail.",
        },
        {
          uk: "I hold weekly key worker sessions with 6 men, setting goals for work, education and family contact and recording each session in their case notes. I opened 24 Assessment, Care in Custody and Teamwork (ACCT) plans in 2025 for men at risk of self-harm.",
          us: "I escorted 64 men to court and hospital appointments in 2025, with no escape attempts and no use of force. I completed 15-minute suicide watch checks on 30 men in 2025 after Crisis Intervention Team training, logging each check on the watch sheet.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "interior-designer",
    industry: "design",
    role: "Interior Designer",
    level: "experienced",
    template: "portfolio",
    blurb: "An interior designer with 8 years in homes and hospitality, from family houses to a 22-bedroom boutique hotel handed over early.",
    person: {
      name: "Abigail Odell",
      email: "abigail.odell@example.com",
      phone: { uk: "07700 900736", us: "(706) 555-0159" },
      location: { uk: "Bath", us: "Athens, GA" },
      links: ["portfolio.example.com/abigailodell"],
    },
    profile: {
      uk: "Interior designer with 8 years in homes and hospitality, the last 5 leading residential and hospitality projects with budgets of £40,000 to £650,000. Has handed over 34 homes, 4 restaurants and a 22-bedroom boutique hotel, with 31 of the 34 homes on or before the agreed date. Draws plans in AutoCAD and 3D models in SketchUp, and sources furniture, lighting and finishes from around 60 suppliers. Registered Interior Designer with the British Institute of Interior Design (BIID).",
      us: "Interior designer with 8 years in homes and hospitality, the last 5 leading residential and hospitality projects with budgets of $50,000 to $800,000. Has handed over 34 homes, 4 restaurants and a 22-room boutique hotel, with 31 of the 34 homes on or before the agreed date. Draws plans in AutoCAD and 3D models in SketchUp, and sources furniture, lighting and finishes from around 60 suppliers. Holds National Council for Interior Design Qualification (NCIDQ) certification.",
    },
    projects: [
      {
        title: "Boutique hotel refurbishment",
        org: "Fennick Interiors",
        start: "2024-03",
        end: "2025-04",
        bullets: [
          {
            uk: "Redesigned 22 bedrooms, a bar and a restaurant for 70 covers in a Georgian townhouse hotel, within a £650,000 budget",
            us: "Redesigned 22 guest rooms, a bar and a restaurant for 70 diners in a 1920s downtown hotel, within an $800,000 budget",
          },
          {
            uk: "Agreed listed building changes with the conservation officer, keeping the original cornices and window shutters in 14 rooms",
            us: "Agreed historic district changes with the city's preservation office, keeping the original plaster moldings and windows in 14 rooms",
          },
          "Handed the hotel over 2 days early, with room bookings up 18% in the first 6 months after reopening",
        ],
      },
      {
        title: "Family home renovation",
        org: "Fennick Interiors",
        start: "2023-01",
        end: "2023-09",
        bullets: [
          {
            uk: "Redesigned the ground floor of a 1930s family home, opening the kitchen, dining room and living room into one space",
            us: "Redesigned the first floor of a 1930s family home, opening the kitchen, dining room and living room into one space",
          },
          {
            uk: "Managed a £120,000 budget across 14 suppliers and 3 trades, finishing £4,000 under budget",
            us: "Managed a $150,000 budget across 14 suppliers and 3 trades, finishing $5,000 under budget",
          },
          "Presented 3 layout options in SketchUp, with the clients choosing one at the second meeting",
        ],
      },
    ],
    experience: [
      {
        title: "Interior Designer",
        org: "Fennick Interiors",
        location: { uk: "Bath", us: "Athens, GA" },
        start: "2021-02",
        current: true,
        bullets: [
          {
            uk: "Lead around 8 residential and hospitality projects a year from brief to handover, with budgets from £40,000 to £650,000",
            us: "Lead around 8 residential and hospitality projects a year from brief to handover, with budgets from $50,000 to $800,000",
          },
          "Handed over 31 of 34 homes on or before the agreed date since 2021, holding weekly site meetings with contractors to catch delays early",
          "Draw plans, elevations and lighting layouts in AutoCAD and build 3D models in SketchUp for around 20 client presentations a year",
          "Source furniture, lighting and finishes from around 60 suppliers, cutting average lead times from 12 weeks to 8 by ordering long-lead items at concept stage",
          {
            uk: "Won 9 new clients in 2025 through referrals from past clients, adding around £310,000 in design and supply fees",
            us: "Won 9 new clients in 2025 through referrals from past clients, adding around $390,000 in design and supply fees",
          },
          "Mentored 2 junior designers, reviewing their drawings and specifications each week",
        ],
      },
      {
        title: "Junior Interior Designer",
        org: "Ledley Studio",
        location: { uk: "Bristol", us: "Atlanta, GA" },
        start: "2018-07",
        end: "2021-01",
        bullets: [
          {
            uk: "Prepared mood boards, sample boards and furniture schedules for 12 hotel and restaurant projects across the south west",
            us: "Prepared mood boards, sample boards and furniture schedules for 12 hotel and restaurant projects across the Southeast",
          },
          {
            uk: "Drew 140 joinery and furniture details in AutoCAD for bars, receptions and guest bedrooms",
            us: "Drew 140 cabinetry and furniture details in AutoCAD for bars, lobbies and guest rooms",
          },
          "Ran the sample library of around 2,000 fabrics and finishes, cutting the time to pull samples for a scheme from 2 days to half a day",
          "Checked deliveries against the furniture schedule on 6 hotel openings, logging and resolving 85 damaged or wrong items before handover",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Interior Design", us: "Bachelor of Fine Arts in Interior Design" },
        org: { uk: "Nottingham Trent University", us: "University of Georgia" },
        end: "2018",
        grade: { uk: "First", us: "GPA 3.8" },
      },
    ],
    certificates: [
      {
        title: { uk: "Registered Interior Designer", us: "NCIDQ Certification" },
        org: { uk: "British Institute of Interior Design", us: "Council for Interior Design Qualification" },
        end: "2022",
      },
    ],
    skills: [
      "AutoCAD",
      "SketchUp",
      "Lighting layouts",
      "Furniture schedules",
      "Mood boards",
      "Supplier sourcing",
      "Budget management",
      "Client presentations",
      "Site meetings",
      { uk: "Joinery details", us: "Cabinetry details" },
    ],
    names: ["Abigail", "Odell", "abigailodell", "Fennick", "Ledley", "Halcyon", "AutoCAD", "SketchUp", "Athens"],
    letter: {
      job: {
        title: "Senior Interior Designer",
        employer: "Halcyon Interiors",
        advert: {
          uk: `Senior Interior Designer
Halcyon Interiors, Bath

Halcyon Interiors designs hotels, restaurants and private homes across the south of England, with a team of 9 designers.

The role
You will lead hotel and restaurant projects from concept to handover, and mentor 2 junior designers.

What we are looking for
- At least 6 years in interior design, including hospitality projects
- Strong AutoCAD and SketchUp skills
- Experience managing budgets and suppliers
- A record of handing projects over on time
- A portfolio of completed work

Salary £42,000 to £48,000`,
          us: `Senior Interior Designer
Halcyon Interiors, Athens, GA

Halcyon Interiors designs hotels, restaurants and private homes across Georgia and the Carolinas, with a team of 9 designers.

The role
You will lead hotel and restaurant projects from concept to handover, and mentor 2 junior designers.

What we are looking for
- At least 6 years in interior design, including hospitality projects
- Strong AutoCAD and SketchUp skills
- Experience managing budgets and suppliers
- A record of handing projects over on time
- NCIDQ certification and a portfolio of completed work

Salary $68,000 to $78,000`,
        },
      },
      reason: "Hotels and restaurants are the projects I enjoy most, and I want to lead more of them.",
      paragraphs: [
        {
          uk: "Hotels and restaurants are the projects I enjoy most, and I would like to lead more of them as Senior Interior Designer at Halcyon Interiors. To date I have handed over 34 homes, 4 restaurants and a 22-bedroom boutique hotel.",
          us: "Hotels and restaurants are the projects I enjoy most, and I would like to lead more of them as Senior Interior Designer at Halcyon Interiors. To date I have handed over 34 homes, 4 restaurants and a 22-room boutique hotel.",
        },
        {
          uk: "At Fennick Interiors I lead around 8 residential and hospitality projects a year from brief to handover, with budgets from £40,000 to £650,000. On a boutique hotel refurbishment, I redesigned 22 bedrooms, a bar and a restaurant for 70 covers in a Georgian townhouse hotel, within a £650,000 budget.",
          us: "At Fennick Interiors I lead around 8 residential and hospitality projects a year from brief to handover, with budgets from $50,000 to $800,000. On a boutique hotel refurbishment, I redesigned 22 guest rooms, a bar and a restaurant for 70 diners in a 1920s downtown hotel, within an $800,000 budget.",
        },
        "Your advert asks for a record of handing projects over on time. I have handed over 31 of 34 homes on or before the agreed date since 2021, holding weekly site meetings with contractors to catch delays early. I handed the hotel over 2 days early, with room bookings up 18% in the first 6 months after reopening.",
        "You are also looking for strong AutoCAD and SketchUp skills. I draw plans, elevations and lighting layouts in AutoCAD and build 3D models in SketchUp for around 20 client presentations a year. I source furniture, lighting and finishes from around 60 suppliers, cutting average lead times from 12 weeks to 8 by ordering long-lead items at concept stage.",
        {
          uk: "I am a Registered Interior Designer with the British Institute of Interior Design (BIID). My CV and portfolio are attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
          us: "I hold National Council for Interior Design Qualification (NCIDQ) certification. My resume and portfolio are attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
        },
      ],
    },
  },
  {
    id: "lettings-negotiator",
    industry: "property",
    role: { uk: "Lettings Negotiator", us: "Leasing Consultant" },
    level: "early",
    template: "modern",
    blurb: {
      uk: "A lettings negotiator two years into the job, letting 64 homes in 2025 and cutting the average time to let from 26 days to 17.",
      us: "A leasing consultant two years into the job, signing 64 new leases in 2025 and cutting the average time to lease from 26 days to 17.",
    },
    person: { name: "Amber Rothley", email: "amber.rothley@example.com", phone: { uk: "07700 900737", us: "(803) 555-0160" }, location: { uk: "Leicester", us: "Columbia, SC" } },
    profile: {
      uk: "Lettings negotiator with 2 years at a high street agency managing 280 rental homes, booking and carrying out around 25 viewings a week. Let 64 properties in 2025, the most of the branch's 3 negotiators, and cut the average time to let from 26 days to 17. Prepares tenancy agreements, runs tenant referencing and holds the Association of Residential Letting Agents (ARLA) Level 3 Award in Residential Letting and Property Management.",
      us: "Leasing consultant with 2 years at a 312-unit apartment community, leading around 25 tours a week. Signed 64 new leases in 2025, the most of the community's 3 leasing consultants, and cut the average time to lease a vacant unit from 26 days to 17. Processes rental applications in Yardi, agrees lease renewals and holds the National Apartment Leasing Professional (NALP) credential.",
    },
    experience: [
      {
        title: { uk: "Lettings Negotiator", us: "Leasing Consultant" },
        org: { uk: "Hebden Lettings", us: "Riverstone Apartments" },
        location: { uk: "Leicester", us: "Columbia, SC" },
        start: "2024-06",
        current: true,
        bullets: [
          {
            uk: "Book and carry out around 25 viewings a week for a branch managing 280 rental homes, from studio flats to family houses",
            us: "Lead around 25 tours a week of a 312-unit apartment community, from studios to 3-bedroom townhomes",
          },
          {
            uk: "Let 64 properties in 2025, the most of the branch's 3 negotiators, against a target of 50",
            us: "Signed 64 new leases in 2025, the most of the community's 3 leasing consultants, against a target of 50",
          },
          {
            uk: "Cut the average time to let from 26 days to 17 in a year by following up every new enquiry within 2 hours and booking block viewings",
            us: "Cut the average time to lease a vacant unit from 26 days to 17 in a year by following up every new lead within 2 hours",
          },
          {
            uk: "Prepare tenancy agreements and run tenant referencing for around 6 new tenancies a month, checking income, credit and past landlords",
            us: "Process around 6 rental applications a week in Yardi, checking income, credit and rental history",
          },
          {
            uk: "Registered 70 tenancy deposits with the Deposit Protection Service in 2025, each within the 30-day legal deadline",
            us: "Raised occupancy from 92% to 96% in 2025 by booking same-day tours and calling back every applicant who had not signed a lease",
          },
          {
            uk: "Agreed renewals on 48 of the 60 tenancies due to end in 2025, negotiating rent reviews between landlords and tenants",
            us: "Agreed renewals on 148 of the 190 leases due to end in 2025 by contacting each resident 90 days before the lease ended",
          },
        ],
      },
      {
        title: { uk: "Sales Assistant", us: "Sales Associate" },
        org: { uk: "Vickers Mobile", us: "Vickers Wireless" },
        location: { uk: "Leicester", us: "Columbia, SC" },
        start: "2022-07",
        end: "2024-05",
        bullets: [
          {
            uk: "Sold around 40 phone contracts a month, above the store target of 30",
            us: "Sold around 40 phone plans a month, above the store target of 30",
          },
          "Kept an average rating of 4.8 out of 5 in 220 customer reviews over 2 years",
          {
            uk: "Trained 3 new starters on the till and the contract system, each selling alone within 2 weeks",
            us: "Trained 3 new hires on the register and the plan system, each selling alone within 2 weeks",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "A levels in Business, Psychology and English Language", us: "Associate of Arts in Business Administration" },
        org: { uk: "Trowell Sixth Form College", us: "Saluda Valley Technical College" },
        location: { uk: "Leicester", us: "Columbia, SC" },
        end: "2022",
        grade: { uk: "B, B, C", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "ARLA Propertymark Level 3 Award in Residential Letting and Property Management", us: "National Apartment Leasing Professional (NALP)" },
        org: { uk: "Propertymark", us: "National Apartment Association" },
        end: "2025",
      },
    ],
    skills: [
      { uk: "Viewings", us: "Apartment tours" },
      { uk: "Enquiry follow-up", us: "Lead follow-up" },
      { uk: "Tenancy agreements", us: "Yardi" },
      { uk: "Tenant referencing", us: "Rental applications" },
      { uk: "Deposit protection", us: "Credit checks" },
      { uk: "Tenancy renewals", us: "Lease renewals" },
      { uk: "Rent reviews", us: "Occupancy" },
      { uk: "Time to let", us: "Time to lease" },
      "Customer reviews",
    ],
    names: ["Amber", "Rothley", "Hebden", "Riverstone", "Vickers", "Larkin", "Trowell", "Saluda", "Propertymark", "Yardi", "townhomes"],
    letter: {
      job: {
        title: { uk: "Lettings Negotiator", us: "Leasing Consultant" },
        employer: { uk: "Larkin Lettings", us: "Larkin Residential" },
        advert: {
          uk: `Lettings Negotiator
Larkin Lettings, Leicester

Larkin Lettings manages 900 rental homes across Leicester from 3 branches, for around 400 landlords.

The role
You will book and carry out viewings, agree new tenancies and see each one through referencing to move-in day.

What we are looking for
- At least 1 year in lettings
- A record of letting properties quickly
- Knowledge of tenancy agreements, referencing and deposit rules
- Confidence talking to landlords and tenants
- An ARLA Level 3 qualification, or willingness to work towards one

Salary £24,000 plus commission, with on-target earnings of £32,000`,
          us: `Leasing Consultant
Larkin Residential, Columbia, SC

Larkin Residential manages 6 apartment communities in Columbia, with 1,900 homes. Our newest community opens to residents in March.

The role
You will lead tours, process rental applications and see each new resident through to move-in day.

What we are looking for
- At least 1 year in leasing or sales
- A record of turning tours into signed leases
- Experience with Yardi or similar property management software
- Knowledge of rental applications and screening
- The NALP credential, or willingness to earn it

Pay $17 to $19 an hour, plus leasing bonuses`,
        },
      },
      reason: {
        uk: "I want to work for a larger agency with more landlords, and keep cutting the time it takes to let a home.",
        us: "I want to work for a larger company with more communities, and keep cutting the time it takes to lease a home.",
      },
      paragraphs: [
        {
          uk: "In 2025 I let 64 properties for a Leicester agency, the most of the branch's 3 negotiators, and I would like to do the same for Larkin Lettings as a Lettings Negotiator. I want to work for a larger agency with more landlords, and keep cutting the time it takes to let a home.",
          us: "In 2025 I signed 64 new leases at an apartment community in Columbia, the most of the community's 3 leasing consultants, and I would like to do the same for Larkin Residential as a Leasing Consultant. I want to work for a larger company with more communities, and keep cutting the time it takes to lease a home.",
        },
        {
          uk: "At Hebden Lettings I book and carry out around 25 viewings a week for a branch managing 280 rental homes, from studio flats to family houses. Your advert asks for a record of letting properties quickly. I cut the average time to let from 26 days to 17 in a year by following up every new enquiry within 2 hours and booking block viewings.",
          us: "At Riverstone Apartments I lead around 25 tours a week of a 312-unit apartment community, from studios to 3-bedroom townhomes. Your advert asks for a record of turning tours into signed leases. I raised occupancy from 92% to 96% in 2025 by booking same-day tours and calling back every applicant who had not signed a lease.",
        },
        {
          uk: "You are also looking for knowledge of tenancy agreements, referencing and deposit rules. I prepare tenancy agreements and run tenant referencing for around 6 new tenancies a month, checking income, credit and past landlords. I registered 70 tenancy deposits with the Deposit Protection Service in 2025, each within the 30-day legal deadline.",
          us: "You are also looking for experience with Yardi. I process around 6 rental applications a week in Yardi, checking income, credit and rental history. I cut the average time to lease a vacant unit from 26 days to 17 in a year by following up every new lead within 2 hours.",
        },
        {
          uk: "I agreed renewals on 48 of the 60 tenancies due to end in 2025, negotiating rent reviews between landlords and tenants. I hold the Association of Residential Letting Agents (ARLA) Level 3 Award in Residential Letting and Property Management.",
          us: "I agreed renewals on 148 of the 190 leases due to end in 2025 by contacting each resident 90 days before the lease ended. I hold the National Apartment Leasing Professional (NALP) credential.",
        },
        CLOSE,
      ],
    },
  },
];
