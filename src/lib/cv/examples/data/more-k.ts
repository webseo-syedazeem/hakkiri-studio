import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** Phase 3, batch 1 (28 Nov 2026): roles the industry packs list that had no example. */
export const MORE_K: ExampleSpec[] = [
  {
    id: "plumber",
    industry: "construction",
    role: "Plumber",
    level: "experienced",
    template: "fieldwork",
    blurb: {
      uk: "A plumber with 14 years in domestic and commercial work, from bathroom installations to mains-pressure hot water, with very few callbacks.",
      us: "A journeyman plumber with 14 years in residential service and remodels, from water heaters to new homes, with very few callbacks.",
    },
    person: { name: "Rhys Pengelly", email: "rhys.pengelly@example.com", phone: { uk: "07700 900665", us: "(405) 555-0189" }, location: { uk: "Plymouth", us: "Oklahoma City, OK" } },
    profile: {
      uk: "Plumber with 14 years in domestic and commercial plumbing, including a 4-year apprenticeship, holding an NVQ Level 3 and Gas Safe registration. Completes around 12 jobs a week, from leaks and boiler swaps to bathroom installations and mains-pressure hot water cylinders. Kept callbacks to 1.5% of jobs in 2025 against a company target of 4%, and earned a 4.9 out of 5 rating from 310 customer reviews. Replaced the pipework in a 40-bedroom care home over 6 weekends without cutting off the water for a day.",
      us: "Journeyman plumber with 14 years in residential and light commercial plumbing, including a 4-year apprenticeship, licensed in Oklahoma since 2017. Completes around 12 service calls a week, from leaks and clogged drains to water heater replacements and kitchen and bathroom remodels. Kept callbacks to 1.5% of jobs in 2025 against a company target of 4%, and earned a 4.9 out of 5 rating from 310 customer reviews. Replaced the water lines in a 40-room assisted living facility over 6 weekends without cutting off the water for a day.",
    },
    experience: [
      {
        title: { uk: "Plumber", us: "Journeyman Plumber" },
        org: { uk: "Sallowfield Plumbing and Heating", us: "Sallowfield Plumbing" },
        location: { uk: "Plymouth", us: "Oklahoma City, OK" },
        start: "2020-03",
        current: true,
        bullets: [
          {
            uk: "Complete around 12 jobs a week for homes, landlords and small businesses, from leaks and blocked drains to boiler swaps and full bathroom installations",
            us: "Complete around 12 service calls a week for homes, landlords and small businesses, from leaks and clogged drains to water heater replacements",
          },
          {
            uk: "Fit around 40 mains-pressure hot water cylinders a year, commissioning each one and registering it with building control",
            us: "Install around 40 gas and electric water heaters a year, each passing city inspection the first time",
          },
          {
            uk: "Kept callbacks to 1.5% of jobs in 2025 against a company target of 4% by pressure testing every new pipe run before leaving site",
            us: "Kept callbacks to 1.5% of jobs in 2025 against a company target of 4% by pressure testing every new pipe run before leaving the job",
          },
          "Earned a 4.9 out of 5 rating from 310 customer reviews in 2025, the highest of the firm's 9 plumbers",
          {
            uk: "Fitted 26 bathrooms and 18 kitchens in 2025, worth £4,000 to £15,000 each, all finished within the quoted price",
            us: "Plumbed 26 bathroom and 18 kitchen remodels in 2025, worth $5,000 to $20,000 each, all finished within the quoted price",
          },
          {
            uk: "Replaced the hot and cold water pipework in a 40-bedroom care home over 6 weekends, keeping water on for residents every day",
            us: "Replaced the water lines in a 40-room assisted living facility over 6 weekends, keeping water on for residents every day",
          },
        ],
      },
      {
        title: "Plumber",
        org: "Torbridge Building Services",
        location: { uk: "Exeter", us: "Norman, OK" },
        start: "2016-09",
        end: "2020-02",
        bullets: [
          {
            uk: "Installed first and second fix plumbing in around 120 new-build homes a year across 3 housing sites, keeping pace with a 6-week build programme for each house",
            us: "Installed rough-in and finish plumbing in around 120 new homes a year across 3 subdivisions",
          },
          {
            uk: "Plumbed 4 blocks with 160 flats in total, from soil stacks to final connections",
            us: "Plumbed 4 apartment buildings with 160 units in total, from drain lines to final connections",
          },
          {
            uk: "Led a team of 2 on the plumbing for a 3-storey school extension, finishing 2 weeks ahead of programme",
            us: "Led a crew of 2 on the plumbing for a 3-story school addition, finishing 2 weeks ahead of schedule",
          },
          {
            uk: "Pressure tested around 500 homes and flats before handover, with no leaks reported by buyers in 3 years",
            us: "Pressure tested around 500 homes and apartments before final inspection, with no leaks reported by buyers in 3 years",
          },
        ],
      },
      {
        title: { uk: "Apprentice Plumber", us: "Plumbing Apprentice" },
        org: "Torbridge Building Services",
        location: { uk: "Exeter", us: "Norman, OK" },
        start: "2012-09",
        end: "2016-08",
        bullets: [
          {
            uk: "Completed a 4-year apprenticeship with an NVQ Level 3 in Plumbing and Domestic Heating, passing the final assessment first time",
            us: "Completed a 4-year apprenticeship of 8,000 hours on the job and around 600 hours in the classroom",
          },
          {
            uk: "Fitted copper and plastic pipework, radiators, baths and basins in around 80 new-build homes under a qualified plumber",
            us: "Ran copper and plastic water lines and set tubs, sinks and toilets in around 80 new homes under a journeyman plumber",
          },
          {
            uk: "Marked up as-fitted drawings for 12 site handovers, checked and signed off by the site manager",
            us: "Marked up as-built drawings for 12 project closeouts, checked and signed off by the superintendent",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "NVQ Level 3 Diploma in Plumbing and Domestic Heating", us: "Certificate in Plumbing Technology" },
        org: { uk: "City College Plymouth", us: "Metro Technology Centers" },
        end: "2016",
      },
    ],
    certificates: [
      {
        title: { uk: "Gas Safe Registered Engineer (domestic gas)", us: "Journeyman Plumber License, Oklahoma" },
        org: { uk: "Gas Safe Register", us: "Oklahoma Construction Industries Board" },
        end: "2017",
      },
      {
        title: { uk: "G3 Hot Water Storage Systems", us: "Backflow Prevention Assembly Tester" },
        org: { uk: "BPEC", us: "American Society of Sanitary Engineering" },
        end: "2020",
      },
      {
        title: { uk: "Water Regulations", us: "OSHA 10-Hour Construction" },
        org: { uk: "BPEC", us: "Occupational Safety and Health Administration" },
        end: "2018",
      },
    ],
    skills: [
      { uk: "Bathroom installations", us: "Bathroom remodels" },
      { uk: "Mains-pressure hot water cylinders", us: "Gas and electric water heaters" },
      { uk: "Boiler swaps", us: "Water heater replacements" },
      { uk: "Blocked drains", us: "Clogged drains" },
      "Pressure testing",
      { uk: "New-build plumbing", us: "New home plumbing" },
      { uk: "Commercial pipework", us: "Light commercial plumbing" },
      { uk: "Copper and plastic pipework", us: "Copper and plastic water lines" },
      { uk: "As-fitted drawings", us: "As-built drawings" },
    ],
    names: ["Rhys", "Pengelly", "Sallowfield", "Torbridge", "Penrice", "Exeter", "Backflow"],
    letter: {
      job: {
        title: "Plumber",
        employer: { uk: "Penrice Plumbing and Heating", us: "Penrice Plumbing" },
        advert: {
          uk: `Plumber
Penrice Plumbing and Heating, Plymouth

Penrice Plumbing and Heating has 14 plumbers working on homes, landlords' properties and commercial buildings across Devon and Cornwall.

The role
You will carry out repairs, installations and planned work, from bathroom refits to mains-pressure hot water systems and commercial pipework.

What we are looking for
- An NVQ Level 3 in plumbing, or equivalent
- Gas Safe registration
- Experience with mains-pressure hot water systems
- A record of getting jobs right first time
- Good feedback from customers

Pay £38,000 to £42,000, plus van and fuel card`,
          us: `Plumber
Penrice Plumbing, Oklahoma City, OK

Penrice Plumbing has 14 plumbers on residential service, remodels and light commercial work across central Oklahoma.

The role
You will carry out service calls, water heater installations and remodel plumbing for homeowners and property managers.

What we are looking for
- An Oklahoma journeyman plumber license
- At least 5 years of residential service experience
- Experience with gas and electric water heaters
- A record of getting jobs right the first time
- Strong customer reviews

Pay $28 to $34 an hour, plus a company truck`,
        },
      },
      reason: {
        uk: "I want to do more commercial work for a firm that cares about getting jobs right first time.",
        us: "I want to do more remodels and water heater work for a company that cares about getting jobs right the first time.",
      },
      paragraphs: [
        {
          uk: "Please consider me for the Plumber vacancy at Penrice Plumbing and Heating. I want to do more commercial work for a firm that cares about getting jobs right first time.",
          us: "Please consider me for the Plumber vacancy at Penrice Plumbing. I want to do more remodels and water heater work for a company that cares about getting jobs right the first time.",
        },
        {
          uk: "At Sallowfield Plumbing and Heating I complete around 12 jobs a week for homes, landlords and small businesses, from leaks and blocked drains to boiler swaps and full bathroom installations. Your advert asks for experience with mains-pressure hot water systems. I fit around 40 mains-pressure hot water cylinders a year, commissioning each one and registering it with building control.",
          us: "At Sallowfield Plumbing I complete around 12 service calls a week for homes, landlords and small businesses, from leaks and clogged drains to water heater replacements. Your advert asks for experience with gas and electric water heaters. I install around 40 gas and electric water heaters a year, each passing city inspection the first time.",
        },
        {
          uk: "You are also looking for a record of getting jobs right first time. I kept callbacks to 1.5% of jobs in 2025 against a company target of 4% by pressure testing every new pipe run before leaving site. I also earned a 4.9 out of 5 rating from 310 customer reviews in 2025, the highest of the firm's 9 plumbers.",
          us: "You are also looking for a record of getting jobs right the first time. I kept callbacks to 1.5% of jobs in 2025 against a company target of 4% by pressure testing every new pipe run before leaving the job. I also earned a 4.9 out of 5 rating from 310 customer reviews in 2025, the highest of the firm's 9 plumbers.",
        },
        {
          uk: "On commercial work, I replaced the hot and cold water pipework in a 40-bedroom care home over 6 weekends, keeping water on for residents every day. I hold an NVQ Level 3 Diploma in Plumbing and Domestic Heating and Gas Safe registration.",
          us: "In 2025 I plumbed 26 bathroom and 18 kitchen remodels, worth $5,000 to $20,000 each, all finished within the quoted price. I also replaced the water lines in a 40-room assisted living facility over 6 weekends, keeping water on for residents every day. I have held an Oklahoma journeyman plumber license since 2017.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "electrical-engineer",
    industry: "engineering",
    role: "Senior Electrical Engineer",
    level: "senior",
    template: "chronicle",
    blurb: {
      uk: "A chartered senior electrical engineer who leads building services design for hospitals, data centres and offices.",
      us: "A licensed senior electrical engineer who leads electrical design for hospitals, data centers and offices.",
    },
    person: { name: "Samuel Adebayo", email: "samuel.adebayo@example.com", phone: { uk: "07700 900666", us: "(313) 555-0190" }, location: { uk: "Birmingham", us: "Detroit, MI" } },
    profile: {
      uk: "Senior electrical engineer with 13 years in building services design, the last 5 leading the electrical team at a consulting engineers' practice. Designs power distribution, lighting and standby power for hospitals, data centres and offices worth up to £85 million. Leads a team of 6 engineers and designers across around 10 live projects at a time. Chartered Engineer (CEng) and Member of the Institution of Engineering and Technology (MIET).",
      us: "Senior electrical engineer with 13 years in building systems design, the last 5 leading the electrical team at a consulting engineering firm. Designs power distribution, lighting and standby power for hospitals, data centers and offices worth up to $110 million, to the National Electrical Code (NEC). Leads a team of 6 engineers and designers across around 10 active projects at a time. Licensed Professional Engineer (PE) in Michigan.",
    },
    experience: [
      {
        title: "Senior Electrical Engineer",
        org: "Corrington Partnership",
        location: { uk: "Birmingham", us: "Detroit, MI" },
        start: "2021-04",
        current: true,
        bullets: [
          {
            uk: "Lead the electrical design team of 6 engineers and designers, taking around 10 live projects at a time through design and construction, worth £2 million to £85 million each",
            us: "Lead the electrical design team of 6 engineers and designers, taking around 10 active projects at a time through design and construction, worth $2.5 million to $110 million each",
          },
          {
            uk: "Led the electrical design of a hospital wing worth £85 million over 3 years, including 2 standby generators and uninterruptible power supplies (UPS) for critical care",
            us: "Led the electrical design of a hospital addition worth $110 million over 3 years, including 2 standby generators and uninterruptible power supplies (UPS) for critical care",
          },
          "Designed the power distribution for a 6 megawatt (MW) data centre, with 2 independent supplies to every rack to keep it running through any single fault",
          {
            uk: "Saved £1.2 million on a 9-storey office building by redesigning the main cable routes and sizing cables from a full load study",
            us: "Saved $1.5 million on a 9-story office building by redesigning the main cable routes and sizing cables from a full load study",
          },
          "Cut design hours on each project by 20% by building a shared library of standard details and Revit families for the team",
          {
            uk: "Mentored 3 graduate engineers through to Chartered Engineer status since 2022",
            us: "Mentored 3 junior engineers through the Professional Engineer exam since 2022",
          },
        ],
      },
      {
        title: "Electrical Engineer",
        org: "Vantridge Consulting",
        location: { uk: "Coventry", us: "Ann Arbor, MI" },
        start: "2016-07",
        end: "2021-03",
        bullets: [
          {
            uk: "Designed lighting, small power and fire alarm systems for 25 schools, offices and laboratories over 4 years, worth up to £30 million each",
            us: "Designed lighting, power and fire alarm systems for 25 schools, offices and laboratories over 4 years, worth up to $38 million each",
          },
          {
            uk: "Ran cable sizing, voltage drop and fault level calculations in Amtech for around 40 projects, checked to British Standard 7671",
            us: "Ran cable sizing, voltage drop and fault current calculations in EasyPower for around 40 projects, checked to the National Electrical Code",
          },
          {
            uk: "Cut lighting energy use by 40% across 12 school buildings by designing light-emitting diode (LED) lighting with daylight and presence controls",
            us: "Cut lighting energy use by 40% across 12 school buildings by designing light-emitting diode (LED) lighting with daylight and occupancy controls",
          },
          {
            uk: "Inspected installations on site and raised around 300 snagging items a year, all closed out before handover",
            us: "Inspected installations in the field and raised around 300 punch list items a year, all closed out before turnover",
          },
          {
            uk: "Designed the electrical services for a £24 million university laboratory building, with a new substation and supplies for 60 fume cupboards",
            us: "Designed the electrical systems for a $30 million university laboratory building, with a new substation and power for 60 fume hoods",
          },
        ],
      },
      {
        title: { uk: "Graduate Electrical Engineer", us: "Junior Electrical Engineer" },
        org: "Kingsmere Electrical Design",
        location: { uk: "Birmingham", us: "Detroit, MI" },
        start: "2013-09",
        end: "2016-06",
        bullets: [
          {
            uk: "Drew single-line diagrams and distribution board schedules for 30 projects in AutoCAD",
            us: "Drew single-line diagrams and panel schedules for 30 projects in AutoCAD",
          },
          {
            uk: "Surveyed the electrical installations in 15 buildings ahead of refurbishment, recording every distribution board and its condition",
            us: "Surveyed the electrical systems in 15 buildings ahead of renovation, recording every panel and its condition",
          },
          {
            uk: "Designed the lighting and power for 6 retail fit-outs, each signed off by the senior engineer without changes",
            us: "Designed the lighting and power for 6 retail tenant build-outs, each signed off by the senior engineer without changes",
          },
          {
            uk: "Visited 8 sites a month to check cable and containment installation against the drawings, logging defects for each contractor",
            us: "Visited 8 job sites a month to check conduit and cable installation against the drawings, logging defects for each contractor",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "MEng (Hons) Electrical and Electronic Engineering", us: "Bachelor of Science in Electrical Engineering" },
        org: { uk: "University of Birmingham", us: "Wayne State University" },
        end: "2013",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "Chartered Engineer (CEng), Member of the IET", us: "Professional Engineer (PE), Michigan" },
        org: { uk: "Institution of Engineering and Technology", us: "Michigan Department of Licensing and Regulatory Affairs" },
        end: "2019",
      },
      {
        title: { uk: "18th Edition Wiring Regulations (BS 7671)", us: "LEED Green Associate" },
        org: { uk: "City & Guilds", us: "Green Business Certification Inc." },
        end: "2022",
      },
    ],
    skills: [
      "Power distribution",
      "Standby power",
      "Lighting design",
      "Fire alarm systems",
      "Cable sizing",
      { uk: "Amtech", us: "EasyPower" },
      "Revit",
      "AutoCAD",
      { uk: "Snagging", us: "Punch lists" },
      "Mentoring engineers",
    ],
    names: ["Samuel", "Adebayo", "Corrington", "Vantridge", "Kingsmere", "Kelburn", "Wardlaw", "Amtech", "EasyPower", "Revit", "AutoCAD", "MEng", "CEng", "MIET"],
    letter: {
      job: {
        title: "Senior Electrical Engineer",
        employer: "Kelburn Associates",
        advert: {
          uk: `Senior Electrical Engineer
Kelburn Associates, Birmingham (hybrid)

Kelburn Associates is a building services consultancy of 90 engineers, designing hospitals, universities and data centres across the Midlands.

The role
You will lead the electrical design on healthcare and data centre projects and manage a team of 4 to 6 engineers.

What we are looking for
- Chartered Engineer status with the IET
- At least 8 years in building services electrical design
- Experience designing power distribution and standby power for hospitals or data centres
- Strong knowledge of BS 7671
- Experience mentoring junior engineers

Salary £62,000 to £70,000, plus car allowance`,
          us: `Senior Electrical Engineer
Kelburn Associates, Detroit, MI (hybrid)

Kelburn Associates is a building systems engineering firm of 90 engineers, designing hospitals, universities and data centers across the Midwest.

The role
You will lead the electrical design on healthcare and data center projects and manage a team of 4 to 6 engineers.

What we are looking for
- A Professional Engineer (PE) license in Michigan
- At least 8 years in electrical design for buildings
- Experience designing power distribution and standby power for hospitals or data centers
- Strong knowledge of the National Electrical Code (NEC)
- Experience mentoring junior engineers

Salary $120,000 to $140,000, plus bonus`,
        },
      },
      reason: "I want to focus on hospitals and data centres, where the power design has to keep working when something fails.",
      recipient: { uk: "Ms Wardlaw", us: "Ms. Wardlaw" },
      paragraphs: [
        {
          uk: "I was interested to read that Kelburn Associates needs a Senior Electrical Engineer to lead its healthcare and data centre work. I want to focus on hospitals and data centres, where the power design has to keep working when something fails.",
          us: "I was interested to read that Kelburn Associates needs a Senior Electrical Engineer to lead its healthcare and data center work. I want to focus on hospitals and data centers, where the power design has to keep working when something fails.",
        },
        {
          uk: "At Corrington Partnership I lead the electrical design team of 6 engineers and designers, taking around 10 live projects at a time through design and construction. Your advert asks for experience designing power distribution and standby power for hospitals or data centres. Over 3 years I led the electrical design of a hospital wing worth £85 million, including 2 standby generators and uninterruptible power supplies (UPS) for critical care. I also designed the power distribution for a 6 megawatt (MW) data centre, with 2 independent supplies to every rack.",
          us: "At Corrington Partnership I lead the electrical design team of 6 engineers and designers, taking around 10 active projects at a time through design and construction. Your advert asks for experience designing power distribution and standby power for hospitals or data centers. Over 3 years I led the electrical design of a hospital addition worth $110 million, including 2 standby generators and uninterruptible power supplies (UPS) for critical care. I also designed the power distribution for a 6 megawatt (MW) data center, with 2 independent supplies to every rack.",
        },
        {
          uk: "You are also looking for strong knowledge of BS 7671. At Vantridge Consulting I ran cable sizing, voltage drop and fault level calculations in Amtech for around 40 projects, checked to BS 7671. On a 9-storey office building, I saved £1.2 million by redesigning the main cable routes and sizing cables from a full load study.",
          us: "You are also looking for strong knowledge of the National Electrical Code (NEC). At Vantridge Consulting I ran cable sizing, voltage drop and fault current calculations in EasyPower for around 40 projects, checked to the National Electrical Code. On a 9-story office building, I saved $1.5 million by redesigning the main cable routes and sizing cables from a full load study.",
        },
        {
          uk: "Your advert also mentions mentoring junior engineers. Since 2022 I have mentored 3 graduate engineers through to Chartered Engineer status. I am a Chartered Engineer (CEng) and Member of the Institution of Engineering and Technology (MIET).",
          us: "Your advert also mentions mentoring junior engineers. Since 2022 I have mentored 3 junior engineers through the Professional Engineer exam. I am a licensed Professional Engineer (PE) in Michigan.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "quantity-surveyor",
    industry: "construction",
    role: { uk: "Senior Quantity Surveyor", us: "Senior Cost Estimator" },
    level: "senior",
    template: "executive",
    blurb: {
      uk: "A chartered senior quantity surveyor who runs cost plans, valuations and final accounts for a main contractor.",
      us: "A senior cost estimator who prepares bids and estimates for commercial builds at a general contractor.",
    },
    person: { name: "Fiona Galbraith", email: "fiona.galbraith@example.com", phone: { uk: "07700 900667", us: "(616) 555-0192" }, location: { uk: "Glasgow", us: "Grand Rapids, MI" } },
    profile: {
      uk: "Senior quantity surveyor with 14 years in construction cost management, a Chartered Member of the Royal Institution of Chartered Surveyors (MRICS). Runs the commercial side of 3 to 4 projects at a time worth £8 million to £45 million, from cost plans to valuations and final accounts. Settled 22 final accounts in 4 years within 2% of forecast, and saved clients £3.1 million through value engineering since 2022. Leads a team of 3 quantity surveyors, 2 of whom have become chartered since 2023.",
      us: "Senior cost estimator with 14 years in construction cost management, holding the Certified Professional Estimator (CPE) credential. Prepares bids and estimates for commercial builds worth $10 million to $55 million, winning 31% of bids over the last 3 years. Kept final costs within 2% of estimate on 22 projects in 4 years, and found $3.8 million in savings through value engineering since 2022. Leads a team of 3 estimators, 2 of whom have earned the CPE credential since 2023.",
    },
    experience: [
      {
        title: { uk: "Senior Quantity Surveyor", us: "Senior Cost Estimator" },
        org: "Dunmarlow Construction",
        location: { uk: "Glasgow", us: "Grand Rapids, MI" },
        start: "2020-01",
        current: true,
        bullets: [
          {
            uk: "Run the commercial side of 3 to 4 projects at a time from tender to final account, worth £8 million to £45 million each, including schools, a hospital car park and student housing",
            us: "Prepare estimates from concept to bid for commercial builds worth $10 million to $55 million, including schools, a hospital parking structure and student housing",
          },
          {
            uk: "Prepare monthly valuations and cost reports for each project, keeping cash flow within 3% of forecast on 14 projects since 2020",
            us: "Won 31% of 84 bids over the last 3 years against a company average of 22%, adding $260 million in contracts",
          },
          {
            uk: "Settled 22 final accounts in 4 years within 2% of forecast, with no disputes taken to adjudication",
            us: "Kept final costs within 2% of estimate on 22 completed projects in 4 years, reviewing costs with the project managers each month",
          },
          {
            uk: "Saved clients £3.1 million since 2022 through value engineering, such as switching a 6-storey frame from concrete to steel",
            us: "Found $3.8 million in savings since 2022 through value engineering, such as switching a 6-story frame from concrete to steel",
          },
          {
            uk: "Tender and place around 60 subcontract packages a year, saving an average of 4% against the cost plan",
            us: "Bid out around 60 subcontract packages a year, saving an average of 4% against the budget estimate",
          },
          {
            uk: "Lead a team of 3 quantity surveyors, 2 of whom have passed their Assessment of Professional Competence (APC) since 2023",
            us: "Lead a team of 3 estimators, 2 of whom have earned the Certified Professional Estimator credential since 2023",
          },
        ],
      },
      {
        title: { uk: "Quantity Surveyor", us: "Cost Estimator" },
        org: "Brackenhill Cost Consulting",
        location: { uk: "Edinburgh", us: "Lansing, MI" },
        start: "2015-03",
        end: "2019-12",
        bullets: [
          {
            uk: "Prepared cost plans from concept to tender for 35 projects worth up to £30 million each",
            us: "Prepared design estimates from concept to bid for 35 projects worth up to $38 million each",
          },
          {
            uk: "Measured and wrote bills of quantities for 18 tenders in CostX",
            us: "Measured quantities from drawings for 18 bids in CostX",
          },
          {
            uk: "Agreed monthly valuations with contractors on 12 projects worth £95 million in total, using site visits to check work in place",
            us: "Reviewed monthly pay applications from contractors on 12 projects worth $120 million in total, using site visits to check work in place",
          },
          {
            uk: "Kept tender returns within 5% of the pre-tender estimate on 16 of 18 projects",
            us: "Kept bid results within 5% of the final design estimate on 16 of 18 projects",
          },
          {
            uk: "Wrote monthly cost reports for clients on 12 live projects, with 11 finishing within budget",
            us: "Wrote monthly cost reports for owners on 12 active projects, with 11 finishing within budget",
          },
          {
            uk: "Trained 2 graduate surveyors in measurement and CostX, both promoted within 2 years",
            us: "Trained 2 junior estimators in quantity measurement and CostX, both promoted within 2 years",
          },
        ],
      },
      {
        title: { uk: "Assistant Quantity Surveyor", us: "Assistant Estimator" },
        org: "Brackenhill Cost Consulting",
        location: { uk: "Edinburgh", us: "Lansing, MI" },
        start: "2012-07",
        end: "2015-02",
        bullets: [
          {
            uk: "Measured concrete, brickwork and roofing packages for around 20 tenders",
            us: "Measured concrete, masonry and roofing quantities for around 20 bids",
          },
          {
            uk: "Built a database of rates from 40 tender returns, used by the whole team for early cost plans",
            us: "Built a database of unit costs from 40 bid results, used by the whole team for early estimates",
          },
          {
            uk: "Priced around 150 variations a year from site instructions, agreeing each with the contractor within 4 weeks",
            us: "Priced around 150 change orders a year from field changes, agreeing each with the contractor within 4 weeks",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Quantity Surveying", us: "Bachelor of Science in Construction Management" },
        org: { uk: "Glasgow Caledonian University", us: "Ferris State University" },
        end: "2012",
        grade: { uk: "First", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "Chartered Member (MRICS)", us: "Certified Professional Estimator (CPE)" },
        org: { uk: "Royal Institution of Chartered Surveyors", us: "American Society of Professional Estimators" },
        end: "2017",
      },
      {
        title: { uk: "NEC4 Engineering and Construction Contract", us: "OSHA 30-Hour Construction" },
        org: { uk: "NEC Contracts", us: "Occupational Safety and Health Administration" },
        end: "2021",
      },
    ],
    skills: [
      { uk: "Cost plans", us: "Estimates" },
      { uk: "Valuations", us: "Bids" },
      { uk: "Variations", us: "Change orders" },
      { uk: "Final accounts", us: "Final costs" },
      "Value engineering",
      "Subcontract packages",
      { uk: "Bills of quantities", us: "Pay applications" },
      "CostX",
      { uk: "Cost reports", us: "Unit costs" },
      { uk: "Leading a team of surveyors", us: "Leading a team of estimators" },
    ],
    names: ["Fiona", "Galbraith", "Dunmarlow", "Brackenhill", "Glenarrow", "Brannigan", "CostX", "Caledonian", "MRICS"],
    letter: {
      job: {
        title: { uk: "Senior Quantity Surveyor", us: "Senior Cost Estimator" },
        employer: "Glenarrow Construction",
        advert: {
          uk: `Senior Quantity Surveyor
Glenarrow Construction, Glasgow

Glenarrow Construction is a main contractor building schools, healthcare and housing projects across central Scotland, with a turnover of £180 million.

The role
You will run the commercial side of 2 to 4 projects worth up to £50 million, from tender handover to final account, and lead a small team of quantity surveyors.

What we are looking for
- MRICS, or working towards it
- At least 10 years as a quantity surveyor
- A record of settling final accounts without disputes
- Experience of value engineering
- Experience leading and developing quantity surveyors

Salary £65,000 to £75,000, plus car allowance and bonus`,
          us: `Senior Cost Estimator
Glenarrow Construction, Grand Rapids, MI

Glenarrow Construction is a general contractor building schools, healthcare and housing projects across West Michigan, with $230 million in yearly revenue.

The role
You will lead bids and estimates for commercial projects worth up to $60 million and lead a small team of estimators.

What we are looking for
- At least 10 years in commercial construction estimating
- A strong record of winning bids
- Experience with value engineering
- Certified Professional Estimator (CPE) credential preferred
- Experience leading and developing estimators

Salary $115,000 to $135,000, plus bonus`,
        },
      },
      reason: {
        uk: "I want to run larger projects for a contractor that builds schools and hospitals, and to keep developing the surveyors I lead.",
        us: "I want to estimate larger projects for a contractor that builds schools and hospitals, and to keep developing the estimators I lead.",
      },
      recipient: { uk: "Mr Brannigan", us: "Mr. Brannigan" },
      paragraphs: [
        {
          uk: "With 14 years as a quantity surveyor, I would like to apply for the Senior Quantity Surveyor post at Glenarrow Construction. I want to run larger projects for a contractor that builds schools and hospitals, and to keep developing the surveyors I lead.",
          us: "With 14 years in construction cost management, I would like to apply for the Senior Cost Estimator position at Glenarrow Construction. I want to estimate larger projects for a contractor that builds schools and hospitals, and to keep developing the estimators I lead.",
        },
        {
          uk: "At Dunmarlow Construction I run the commercial side of 3 to 4 projects at a time worth £8 million to £45 million, including schools, a hospital car park and student housing. Your advert asks for a record of settling final accounts without disputes. I have settled 22 final accounts in 4 years within 2% of forecast, with no disputes taken to adjudication.",
          us: "At Dunmarlow Construction I prepare bids and estimates for commercial builds worth $10 million to $55 million, including schools, a hospital parking structure and student housing. Your advert asks for a strong record of winning bids. I won 31% of 84 bids over the last 3 years against a company average of 22%, adding $260 million in contracts.",
        },
        {
          uk: "You are also looking for experience of value engineering. I saved clients £3.1 million since 2022 through value engineering, such as switching a 6-storey frame from concrete to steel. I also tender and place around 60 subcontract packages a year, saving an average of 4% against the cost plan.",
          us: "You are also looking for experience with value engineering. I found $3.8 million in savings since 2022 through value engineering, such as switching a 6-story frame from concrete to steel. I also kept final costs within 2% of estimate on 22 completed projects in 4 years, reviewing costs with the project managers each month.",
        },
        {
          uk: "I lead a team of 3 quantity surveyors, 2 of whom have passed their Assessment of Professional Competence (APC) since 2023. I am a Chartered Member of the Royal Institution of Chartered Surveyors (MRICS), with a BSc in Quantity Surveying from Glasgow Caledonian University.",
          us: "I lead a team of 3 estimators, 2 of whom have earned the Certified Professional Estimator credential since 2023. I also hold the Certified Professional Estimator (CPE) credential, and a Bachelor of Science in Construction Management from Ferris State University.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "logistics-coordinator",
    industry: "logistics",
    role: "Logistics Coordinator",
    level: "early",
    template: "compact",
    blurb: "A logistics coordinator two years into booking freight, carriers and customs paperwork for 25 importers at a freight forwarder.",
    person: { name: "Connor Healy", email: "connor.healy@example.com", phone: { uk: "07700 900668", us: "(901) 555-0193" }, location: { uk: "Ipswich", us: "Memphis, TN" } },
    profile: {
      uk: "Logistics coordinator with 2 years at a freight forwarder, booking around 60 container and road freight shipments a week for 25 importers. Books hauliers and shipping lines in the transport management system (TMS) and prepares the paperwork for customs entries. Raised on-time delivery for those importers from 91% to 96% in 2025. Holds a degree in business management and a Level 3 certificate in logistics.",
      us: "Logistics coordinator with 2 years at a freight forwarder, booking around 60 truckload, less-than-truckload (LTL) and ocean shipments a week for 25 importers. Books carriers in the transportation management system (TMS) and prepares the documents for customs entries. Raised on-time delivery for those importers from 91% to 96% in 2025. Holds a bachelor's degree in supply chain management and a customs specialist certificate.",
    },
    experience: [
      {
        title: "Logistics Coordinator",
        org: "Saxonbridge Freight",
        location: { uk: "Ipswich", us: "Memphis, TN" },
        start: "2024-08",
        current: true,
        bullets: [
          {
            uk: "Book around 60 container and road freight shipments a week for 25 importers, from quote to proof of delivery",
            us: "Book around 60 truckload, LTL and ocean shipments a week for 25 importers, from quote to proof of delivery",
          },
          {
            uk: "Book 12 regular hauliers and 4 shipping lines in the TMS, comparing at least 3 rates for each load",
            us: "Book 12 regular trucking companies and 4 ocean carriers in the TMS, comparing at least 3 rates for each load",
          },
          {
            uk: "Prepare commercial invoices, packing lists and import entries for the customs broker, with no entries held for missing paperwork in 2025",
            us: "Prepare commercial invoices and packing lists for the customs broker, with no entries held for missing documents in 2025",
          },
          {
            uk: "Raised on-time delivery for 25 importers from 91% to 96% in 2025 by booking haulage 48 hours before vessels arrive",
            us: "Raised on-time delivery for 25 importers from 91% to 96% in 2025 by booking trucks 48 hours before vessels arrive",
          },
          {
            uk: "Cut port storage charges by £14,000 in 2025 by tracking containers daily and collecting them within the free days",
            us: "Cut port storage and late container return charges by $18,000 in 2025 by tracking containers daily and returning them within the free days",
          },
        ],
      },
      {
        title: { uk: "Transport Office Assistant (Part-time)", us: "Dispatch Assistant (Part-time)" },
        org: "Harwick Parcels",
        location: { uk: "Ipswich", us: "Memphis, TN" },
        start: "2022-09",
        end: "2024-06",
        bullets: [
          "Planned routes for 14 delivery vans each evening in the routing software, cutting average route length by 8% in a year",
          "Chased around 30 missing proofs of delivery a shift with drivers, closing 98% within a day",
          "Answered around 50 customer calls a shift about late or missed deliveries, arranging a new delivery for each one before the end of the call",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Business Management", us: "Bachelor of Business Administration in Supply Chain Management" },
        org: { uk: "University of Suffolk", us: "University of Memphis" },
        end: "2024",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 3 Certificate in Logistics and Transport", us: "Certified Customs Specialist (CCS)" },
        org: { uk: "Chartered Institute of Logistics and Transport", us: "National Customs Brokers and Forwarders Association of America" },
        end: "2025",
      },
    ],
    skills: [
      "Freight booking",
      { uk: "Haulier booking", us: "Carrier booking" },
      { uk: "Transport management system", us: "Transportation management system" },
      { uk: "Customs paperwork", us: "Customs documents" },
      "Commercial invoices",
      "Container tracking",
      "Comparing rates",
      "On-time delivery",
      "Route planning",
    ],
    names: ["Connor", "Healy", "Saxonbridge", "Harwick", "Meridale", "Felixstowe"],
    letter: {
      job: {
        title: "Logistics Coordinator",
        employer: "Meridale Logistics",
        advert: {
          uk: `Logistics Coordinator
Meridale Logistics, Felixstowe

Meridale Logistics is a freight forwarder moving sea and road freight for 300 importers and exporters through Felixstowe and Southampton.

The role
You will join a team of 12 coordinators, booking and tracking shipments for a set of customer accounts from quote to delivery.

What we are looking for
- At least 1 year booking freight or transport
- Experience with a transport management system
- Knowledge of import paperwork and customs entries
- A record of on-time deliveries
- Clear, prompt communication with customers and hauliers

Salary £27,000 to £31,000`,
          us: `Logistics Coordinator
Meridale Logistics, Memphis, TN

Meridale Logistics is a freight forwarder moving ocean, truckload and LTL freight for 300 importers and exporters through Memphis and Savannah.

The role
You will join a team of 12 coordinators, booking and tracking shipments for a set of customer accounts from quote to delivery.

What we are looking for
- At least 1 year booking freight or transportation
- Experience with a transportation management system (TMS)
- Knowledge of import documents and customs entries
- A record of on-time deliveries
- Clear, prompt communication with customers and carriers

Pay $46,000 to $52,000 a year`,
        },
      },
      reason: "I want to handle more accounts at a larger forwarder and learn export work too.",
      paragraphs: [
        "I hope to join Meridale Logistics as a Logistics Coordinator. I want to handle more accounts at a larger forwarder and learn export work too.",
        {
          uk: "At Saxonbridge Freight I book around 60 container and road freight shipments a week for 25 importers, from quote to proof of delivery. Your advert asks for experience with a transport management system. I book 12 regular hauliers and 4 shipping lines in the transport management system (TMS), comparing at least 3 rates for each load.",
          us: "At Saxonbridge Freight I book around 60 truckload, less-than-truckload (LTL) and ocean shipments a week for 25 importers, from quote to proof of delivery. Your advert asks for experience with a transportation management system (TMS). I book 12 regular trucking companies and 4 ocean carriers in the TMS, comparing at least 3 rates for each load.",
        },
        {
          uk: "You are also looking for knowledge of import paperwork and customs entries. I prepare commercial invoices, packing lists and import entries for the customs broker, with no entries held for missing paperwork in 2025.",
          us: "You are also looking for knowledge of import documents and customs entries. I prepare commercial invoices and packing lists for the customs broker, with no entries held for missing documents in 2025.",
        },
        {
          uk: "I raised on-time delivery for my 25 importers from 91% to 96% in 2025 by booking haulage 48 hours before vessels arrive. I also cut port storage charges by £14,000 in 2025 by tracking containers daily and collecting them within the free days.",
          us: "I raised on-time delivery for my 25 importers from 91% to 96% in 2025 by booking trucks 48 hours before vessels arrive. I also cut port storage and late container return charges by $18,000 in 2025 by tracking containers daily and returning them within the free days.",
        },
        "Your advert also mentions clear, prompt communication with customers. In my part-time role at Harwick Parcels, I answered around 50 customer calls a shift about late or missed deliveries, arranging a new delivery for each one before the end of the call.",
        CLOSE,
      ],
    },
  },
  {
    id: "supply-chain-analyst",
    industry: "logistics",
    role: "Supply Chain Analyst",
    level: "experienced",
    template: "framework",
    blurb: {
      uk: "A supply chain analyst who forecasts demand and sets stock for a food and drink maker, cutting stock while raising service levels.",
      us: "A supply chain analyst who forecasts demand and sets inventory for a food and beverage maker, cutting inventory while raising service levels.",
    },
    person: { name: "Aisha Karim", email: "aisha.karim@example.com", phone: { uk: "07700 900669", us: "(614) 555-0194" }, location: { uk: "Manchester", us: "Columbus, OH" } },
    profile: {
      uk: "Supply chain analyst with 6 years in demand planning and inventory, the last 4 at a food and drink manufacturer that supplies 8 supermarket chains. Forecasts weekly demand for 420 product lines in Excel and SQL, and raised forecast accuracy from 68% to 81% in 2 years. Cut stock held by £2.4 million while raising the service level to customers from 95.1% to 98.3%. Builds the Power BI dashboards that 40 planners, buyers and sales managers use each week.",
      us: "Supply chain analyst with 6 years in demand planning and inventory, the last 4 at a food and beverage manufacturer that supplies 8 grocery chains. Forecasts weekly demand for 420 products in Excel and SQL, and raised forecast accuracy from 68% to 81% in 2 years. Cut inventory by $3.1 million while raising the service level to customers from 95.1% to 98.3%. Builds the Power BI dashboards that 40 planners, buyers and sales managers use each week.",
    },
    experience: [
      {
        title: "Supply Chain Analyst",
        org: "Pennacott Foods",
        location: { uk: "Manchester", us: "Columbus, OH" },
        start: "2022-05",
        current: true,
        bullets: [
          {
            uk: "Forecast weekly demand for 420 product lines across 8 supermarket chains, using 3 years of sales history and planned promotions",
            us: "Forecast weekly demand for 420 products across 8 grocery chains, using 3 years of sales history and planned promotions",
          },
          "Raised forecast accuracy from 68% to 81% in 2 years by adding promotion plans to the forecast and reviewing the 50 worst-forecast lines with sales each week",
          {
            uk: "Cut stock held by £2.4 million in 18 months by resetting safety stock for every line from its demand and lead time",
            us: "Cut inventory by $3.1 million in 18 months by resetting safety stock for every item from its demand and lead time",
          },
          {
            uk: "Raised the service level to customers from 95.1% to 98.3% over the same 18 months, while stock fell",
            us: "Raised the service level to customers from 95.1% to 98.3% over the same 18 months, while inventory fell",
          },
          "Built 6 Power BI dashboards on stock, service and forecast accuracy, used each week by 40 planners, buyers and sales managers",
          "Wrote SQL queries that replaced a 6-hour manual Excel report each week, freeing a day a week for the planning team",
        ],
      },
      {
        title: "Inventory Planner",
        org: "Northwold Home",
        location: { uk: "Warrington", us: "Dayton, OH" },
        start: "2020-06",
        end: "2022-04",
        bullets: [
          {
            uk: "Planned stock for 2 distribution centres and 180 stores across 1,500 household goods lines",
            us: "Planned inventory for 2 distribution centers and 180 stores across 1,500 household goods items",
          },
          {
            uk: "Placed weekly orders with 35 suppliers worth around £400,000 a week",
            us: "Placed weekly orders with 35 suppliers worth around $500,000 a week",
          },
          {
            uk: "Cut excess stock in the distribution centres by 18% in a year by lowering order quantities on 300 slow-selling lines",
            us: "Cut excess inventory in the distribution centers by 18% in a year by lowering order quantities on 300 slow-selling items",
          },
          "Raised store availability from 93% to 96% by changing the reorder points for the top 200 lines",
          "Ran the weekly stock meeting with 6 buyers, agreeing actions on the 20 lines most at risk of running out",
        ],
      },
      {
        title: "Supply Chain Intern",
        org: "Dovecote Drinks",
        location: { uk: "Stockport", us: "Cincinnati, OH" },
        start: "2019-06",
        end: "2019-09",
        bullets: [
          "Built an Excel model of safety stock for 250 drinks lines, which the planners used to set new reorder points",
          {
            uk: "Counted and checked stock in 2 warehouses each week, finding £60,000 of stock recorded in the wrong place",
            us: "Counted and checked inventory in 2 warehouses each week, finding $75,000 of inventory recorded in the wrong place",
          },
          "Listed the lead times of 40 suppliers from 12 months of orders, used to update the planning system",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Economics", us: "Bachelor of Science in Economics" },
        org: { uk: "University of Manchester", us: "Ohio State University" },
        end: "2020",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      { title: "Certified in Planning and Inventory Management (CPIM)", org: "Association for Supply Chain Management", end: "2023" },
      { title: "Microsoft Certified: Power BI Data Analyst Associate", org: "Microsoft", end: "2024" },
    ],
    skills: [
      "Demand planning",
      "Demand forecasting",
      "Inventory planning",
      "Safety stock",
      "Service levels",
      "Excel",
      "SQL",
      "Power BI",
      "Supplier orders",
      "Reorder points",
    ],
    names: ["Aisha", "Karim", "Pennacott", "Northwold", "Dovecote", "Hartgrove", "Fairweather", "Warrington", "Stockport", "BI"],
    letter: {
      job: {
        title: "Supply Chain Analyst",
        employer: "Hartgrove Brands",
        advert: {
          uk: `Supply Chain Analyst
Hartgrove Brands, Manchester (hybrid)

Hartgrove Brands makes snacks and soft drinks sold in 9 supermarket chains, with 650 product lines made at 2 factories.

The role
You will forecast demand, set stock levels and build the reports our planning and sales teams use every week.

What we are looking for
- At least 4 years in demand planning or inventory analysis
- Advanced Excel and SQL
- Experience building Power BI dashboards
- A record of cutting stock while keeping service levels high
- CPIM, or working towards it

Salary £45,000 to £52,000`,
          us: `Supply Chain Analyst
Hartgrove Brands, Columbus, OH (hybrid)

Hartgrove Brands makes snacks and soft drinks sold in 9 grocery chains, with 650 products made at 2 plants.

The role
You will forecast demand, set inventory levels and build the reports our planning and sales teams use every week.

What we are looking for
- At least 4 years in demand planning or inventory analysis
- Advanced Excel and SQL
- Experience building Power BI dashboards
- A record of cutting inventory while keeping service levels high
- CPIM, or working toward it

Salary $78,000 to $90,000`,
        },
      },
      reason: "I want to plan for a bigger range and spend more of my week improving forecasts.",
      recipient: { uk: "Ms Fairweather", us: "Ms. Fairweather" },
      paragraphs: [
        "Hartgrove Brands is looking for a Supply Chain Analyst, and I would like to be considered for the role. I want to plan for a bigger range and spend more of my week improving forecasts.",
        {
          uk: "At Pennacott Foods I forecast weekly demand for 420 product lines across 8 supermarket chains, using 3 years of sales history and planned promotions. I raised forecast accuracy from 68% to 81% in 2 years by adding promotion plans to the forecast and reviewing the 50 worst-forecast lines with sales each week.",
          us: "At Pennacott Foods I forecast weekly demand for 420 products across 8 grocery chains, using 3 years of sales history and planned promotions. I raised forecast accuracy from 68% to 81% in 2 years by adding promotion plans to the forecast and reviewing the 50 worst-forecast lines with sales each week.",
        },
        {
          uk: "Your advert asks for a record of cutting stock while keeping service levels high. I cut stock held by £2.4 million in 18 months by resetting safety stock for every line from its demand and lead time. Over the same 18 months, I raised the service level to customers from 95.1% to 98.3%.",
          us: "Your advert asks for a record of cutting inventory while keeping service levels high. I cut inventory by $3.1 million in 18 months by resetting safety stock for every item from its demand and lead time. Over the same 18 months, I raised the service level to customers from 95.1% to 98.3%.",
        },
        "You also want experience building Power BI dashboards. I built 6 Power BI dashboards on stock, service and forecast accuracy, used each week by 40 planners, buyers and sales managers. I also wrote SQL queries that replaced a 6-hour manual Excel report each week. I am Certified in Planning and Inventory Management (CPIM).",
        CLOSE,
      ],
    },
  },
  {
    id: "production-operative",
    industry: "manufacturing",
    role: { uk: "Production Operative", us: "Production Worker" },
    level: "early",
    template: "fieldwork",
    blurb: {
      uk: "A production operative who runs a bakery bagging line, with quality checks, quick changeovers and a forklift licence.",
      us: "A production worker who runs a bakery bagging line, with quality checks, quick changeovers and forklift certification.",
    },
    person: { name: "Kayleigh Sowerby", email: "kayleigh.sowerby@example.com", phone: { uk: "07700 900670", us: "(419) 555-0195" }, location: { uk: "Hull", us: "Toledo, OH" } },
    profile: {
      uk: "Production operative with 3 years on the bagging line at a bakery that makes 1.2 million rolls a day for supermarkets. Runs the bagging machine, metal detector and check scales at up to 70 bags a minute, checking weight, seals and date codes every 30 minutes. Cut changeover time from 25 to 15 minutes with the team leader. Holds a counterbalance forklift licence and a Level 2 food hygiene certificate.",
      us: "Production worker with 3 years on the bagging line at a bakery that makes 1.2 million rolls a day for grocery chains. Runs the bagging machine, metal detector and check scales at up to 70 bags a minute, checking weight, seals and date codes every 30 minutes. Cut changeover time from 25 to 15 minutes with the team leader. Certified on sit-down forklifts and holds a food handler certificate.",
    },
    experience: [
      {
        title: { uk: "Production Operative", us: "Production Worker" },
        org: "Humbleton Bakeries",
        location: { uk: "Hull", us: "Toledo, OH" },
        start: "2023-10",
        current: true,
        bullets: [
          {
            uk: "Run the bagging line on a 4-on, 4-off shift pattern, packing up to 70 bags of rolls a minute through the bagging machine, metal detector and check scales",
            us: "Run the bagging line on rotating 12-hour shifts, packing up to 70 bags of rolls a minute through the bagging machine, metal detector and check scales",
          },
          "Carry out quality checks every 30 minutes on weight, seals, date codes and labels, recording each one on the line tablet",
          "Cut changeover time between products from 25 to 15 minutes by setting out film, labels and tools before each change with the team leader",
          "Kept packaging waste on the line to 1.8% in 2025 against a site target of 2.5%",
          {
            uk: "Drive a counterbalance forklift to bring film and cases to the line and move around 60 finished pallets a shift to dispatch",
            us: "Drive a sit-down forklift to bring film and cases to the line and move around 60 finished pallets a shift to shipping",
          },
          "Reported 8 near misses in 2025, 3 of which led to new guarding on the bagging machine",
        ],
      },
      {
        title: { uk: "Kitchen Assistant (Part-time)", us: "Prep Cook (Part-time)" },
        org: "Pickwell's Kitchen",
        location: { uk: "Hull", us: "Toledo, OH" },
        start: "2021-06",
        end: "2023-09",
        bullets: [
          {
            uk: "Prepared food for around 150 covers on Friday and Saturday nights, keeping allergen and fridge temperature records",
            us: "Prepared food for around 150 guests on Friday and Saturday nights, keeping allergen and cooler temperature records",
          },
          {
            uk: "Cleaned the kitchen to a written schedule after every shift, and the kitchen kept its 5-star food hygiene rating at 2 council inspections",
            us: "Cleaned the kitchen to a written schedule after every shift, and the kitchen passed 2 health department inspections with no violations",
          },
          {
            uk: "Trained 2 new kitchen assistants on allergen records and safe knife use",
            us: "Trained 2 new prep cooks on allergen records and safe knife use",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "GCSEs: 5 at grades 9 to 4, including English and maths", us: "High School Diploma" },
        org: { uk: "Holderness Park Academy", us: "Maplewood Heights High School" },
        end: "2021",
      },
    ],
    certificates: [
      {
        title: { uk: "Counterbalance Forklift Licence, RTITB accredited", us: "Forklift Certification, sit-down counterbalance" },
        org: "Humbleton Bakeries",
        end: "2024",
      },
      {
        title: { uk: "Level 2 Food Hygiene and Safety for Manufacturing", us: "Food Handler Certificate" },
        org: { uk: "Highfield Qualifications", us: "ServSafe" },
        end: "2023",
      },
    ],
    skills: [
      "Bagging line",
      "Metal detector",
      "Quality checks",
      "Changeovers",
      { uk: "Counterbalance forklift", us: "Sit-down forklift" },
      "Packaging waste",
      "Near miss reporting",
      "Date codes",
      "Allergen records",
    ],
    names: ["Kayleigh", "Sowerby", "Humbleton", "Pickwell", "Holderness", "Maplewood", "Seaholme", "Highfield", "ServSafe", "RTITB"],
    letter: {
      job: {
        title: { uk: "Production Operative", us: "Production Worker" },
        employer: "Seaholme Foods",
        advert: {
          uk: `Production Operative
Seaholme Foods, Hull

Seaholme Foods makes chilled ready meals for 4 supermarket chains, and is recruiting for a new packing line opening in March.

The role
You will run and check a high-speed packing line, carry out changeovers and keep the line clean and safe, on a 4-on, 4-off shift pattern.

What we are looking for
- At least 1 year on a food or packaging production line
- Experience of quality checks such as weight, seal and date code checks
- Experience of changeovers
- A good safety record
- A forklift licence would be useful

Pay £12.80 an hour, plus shift allowance`,
          us: `Production Worker
Seaholme Foods, Toledo, OH

Seaholme Foods makes frozen meals for 4 grocery chains, and is hiring for a new packing line opening in March.

The role
You will run and check a high-speed packing line, complete changeovers and keep the line clean and safe, on rotating 12-hour shifts.

What we are looking for
- At least 1 year on a food or packaging production line
- Experience with quality checks such as weight, seal and date code checks
- Experience with changeovers
- A strong safety record
- Forklift certification is a plus

Pay $19.50 an hour, plus shift differential`,
        },
      },
      reason: "I want to help start up a new line and learn to set up the machines myself.",
      paragraphs: [
        {
          uk: "I am writing about the Production Operative jobs on the new packing line that Seaholme Foods is opening in March. I want to help start up a new line and learn to set up the machines myself.",
          us: "I am writing about the Production Worker jobs on the new packing line that Seaholme Foods is opening in March. I want to help start up a new line and learn to set up the machines myself.",
        },
        {
          uk: "At Humbleton Bakeries I run the bagging line on a 4-on, 4-off shift pattern, packing up to 70 bags of rolls a minute through the bagging machine, metal detector and check scales. Your advert asks for experience of quality checks such as weight, seal and date code checks. I carry out quality checks every 30 minutes on weight, seals, date codes and labels, recording each one on the line tablet.",
          us: "At Humbleton Bakeries I run the bagging line on rotating 12-hour shifts, packing up to 70 bags of rolls a minute through the bagging machine, metal detector and check scales. Your advert asks for experience with quality checks such as weight, seal and date code checks. I carry out quality checks every 30 minutes on weight, seals, date codes and labels, recording each one on the line tablet.",
        },
        {
          uk: "You are also looking for experience of changeovers. I cut changeover time between products from 25 to 15 minutes by setting out film, labels and tools before each change with the team leader. I also kept packaging waste on the line to 1.8% in 2025 against a site target of 2.5%.",
          us: "You are also looking for experience with changeovers. I cut changeover time between products from 25 to 15 minutes by setting out film, labels and tools before each change with the team leader. I also kept packaging waste on the line to 1.8% in 2025 against a site target of 2.5%.",
        },
        {
          uk: "You mention that a forklift licence would be useful. I hold a counterbalance forklift licence and drive the forklift to move around 60 finished pallets a shift to dispatch. I reported 8 near misses in 2025, 3 of which led to new guarding on the bagging machine.",
          us: "You mention that forklift certification is a plus. I am certified on sit-down forklifts and drive one to move around 60 finished pallets a shift to shipping. I reported 8 near misses in 2025, 3 of which led to new guarding on the bagging machine.",
        },
        CLOSE,
      ],
    },
  },
];
