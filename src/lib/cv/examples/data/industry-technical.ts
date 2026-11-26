import type { ExampleSpec } from "../types";

/**
 * Engineering, construction, manufacturing, energy and science. UK versions
 * carry UK credentials (Chartered Engineer, SMSTS, 18th Edition, IEMA) and
 * metric units; US versions carry US ones (PE license, OSHA, EPA Section 608,
 * HAZWOPER) and US units where a US employer would expect them.
 */

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** Example CVs and cover letters, written for the UK and the US. */
export const INDUSTRY_TECHNICAL: ExampleSpec[] = [
  {
    id: "mechanical-engineer",
    industry: "engineering",
    role: "Mechanical Engineer",
    level: "experienced",
    template: "technical",
    blurb: {
      uk: "A chartered mechanical engineer who designs industrial pumps and takes them into production.",
      us: "A licensed Professional Engineer who designs industrial pumps and takes them into production.",
    },
    person: { name: "Arjun Mehta", email: "arjun.mehta@example.com", phone: { uk: "07700 900201", us: "(414) 555-0109" }, location: { uk: "Derby", us: "Milwaukee, WI" } },
    profile: {
      uk: "Chartered mechanical engineer with ten years designing pumps and agricultural machinery for production. Leads design for a family of 12 industrial pumps, from 3D models and finite element analysis to testing and release. Cut the cost of the main pump casing by 18% and warranty claims by 35% over the last 3 years. Mentors 2 graduate engineers and works closely with production, quality and suppliers.",
      us: "Licensed Professional Engineer (PE) with ten years designing pumps and agricultural machinery for production. Leads design for a family of 12 industrial pumps, from 3D models and finite element analysis to testing and release. Cut the cost of the main pump casing by 18% and warranty claims by 35% over the last 3 years. Mentors 2 entry-level engineers and works closely with manufacturing, quality and suppliers.",
    },
    experience: [
      {
        title: "Senior Mechanical Engineer",
        org: "Hartwell Pumps",
        location: { uk: "Derby", us: "Milwaukee, WI" },
        start: "2021-03",
        current: true,
        bullets: [
          {
            uk: "Lead mechanical design for a family of 12 end-suction pumps from 5 to 90 kW, taking each from concept to production release",
            us: "Lead mechanical design for a family of 12 end-suction pumps from 7 to 125 horsepower, taking each from concept to production release",
          },
          "Cut the cost of the main pump casing by 18% by redesigning it for sand casting with 3D-printed patterns",
          "Run finite element analysis (FEA) in Ansys on impellers, shafts and casings, cutting prototype rounds from 3 to 1 on the last 4 projects",
          "Investigated 14 field failures with root cause analysis, then brought in a new seal design that cut warranty claims by 35% over 2 years",
          "Chair design reviews and design failure mode and effects analysis (DFMEA) for each new pump, with 6 to 8 engineers from production, quality and purchasing",
          {
            uk: "Mentor 2 graduate engineers through their Institution of Mechanical Engineers (IMechE) development plans, with monthly reviews",
            us: "Mentor 2 entry-level engineers preparing for the Fundamentals of Engineering (FE) exam, with monthly reviews",
          },
        ],
      },
      {
        title: "Mechanical Engineer",
        org: "Corran Agricultural",
        location: { uk: "Lincoln", us: "Madison, WI" },
        start: "2018-09",
        end: "2021-02",
        bullets: [
          "Designed welded steel frames for 6 grain conveyors, checking each against fatigue loads with hand calculations and FEA",
          {
            uk: "Cut the weight of the 25-metre grain auger by 140 kg by moving from solid to tubular sections, saving £60 a unit in steel",
            us: "Cut the weight of the 80-foot grain auger by 310 pounds by moving from solid to tubular sections, saving $75 a unit in steel",
          },
          "Tested 9 prototypes on the company test rig over 2 harvests, logging loads and temperatures with strain gauges",
          {
            uk: "Raised 120 engineering change notes with drawings and bills of materials, each signed off within 10 working days",
            us: "Wrote 120 engineering change orders with drawings and bills of materials, each signed off within 10 business days",
          },
          "Brought conveyor guarding on 6 machines up to ISO 13857 safety distances after a customer audit, closing every finding within 3 months",
        ],
      },
      {
        title: { uk: "Graduate Mechanical Engineer", us: "Associate Mechanical Engineer" },
        org: "Corran Agricultural",
        location: { uk: "Lincoln", us: "Madison, WI" },
        start: "2016-09",
        end: "2018-08",
        bullets: [
          "Modelled 200 parts and assemblies in SolidWorks to company drawing standards",
          "Rotated through design, test and production teams over 2 years, working on 4 product lines",
          "Built a spreadsheet for sizing bearings that cut sizing time from 2 hours to 20 minutes",
          "Measured noise at 8 operator positions and specified acoustic panels that brought levels below 85 decibels",
        ],
      },
    ],
    education: [
      {
        title: { uk: "MEng (Hons) Mechanical Engineering", us: "Bachelor of Science in Mechanical Engineering" },
        org: { uk: "University of Nottingham", us: "Marquette University" },
        start: "2012-09",
        end: "2016-06",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      { title: { uk: "Chartered Engineer (CEng)", us: "Professional Engineer (PE) license" }, org: { uk: "Institution of Mechanical Engineers", us: "State of Wisconsin" }, end: "2021" },
      { title: { uk: "Lean Six Sigma Green Belt", us: "Certified Six Sigma Green Belt (CSSGB)" }, org: { uk: "British Quality Foundation", us: "American Society for Quality" }, end: "2019" },
    ],
    skills: ["SolidWorks", "Finite element analysis", "Ansys", "Failure mode and effects analysis", "Root cause analysis", "Pump design", "Design reviews", "Sand casting", "Prototype testing", "Bills of materials"],
    names: ["Arjun", "Mehta", "MEng", "Hartwell", "Corran", "Ansys", "SolidWorks", "IMechE", "CEng", "CSSGB", "Thornfield"],
    letter: {
      job: {
        title: "Lead Mechanical Engineer",
        employer: "Thornfield Process Equipment",
        advert: {
          uk: `Lead Mechanical Engineer
Thornfield Process Equipment, Derby

Thornfield Process Equipment designs and builds pumps and mixers for the water and food industries.

The role
You will lead a team of 4 mechanical engineers designing our next range of process pumps, from concept to production.

What we are looking for
- Chartered Engineer, or working towards it
- Experience designing rotating equipment for production
- Strong skills in SolidWorks and finite element analysis
- Experience of root cause analysis and cutting warranty costs
- Experience mentoring engineers

Salary £58,000 to £64,000, plus a 9% pension contribution`,
          us: `Lead Mechanical Engineer
Thornfield Process Equipment, Milwaukee, WI

Thornfield Process Equipment designs and builds pumps and mixers for the water and food industries.

The role
You will lead a team of 4 mechanical engineers designing our next range of process pumps, from concept to production.

What we are looking for
- Professional Engineer (PE) license, or eligible to sit for the exam
- Experience designing rotating equipment for production
- Strong skills in SolidWorks and finite element analysis
- Experience with root cause analysis and cutting warranty costs
- Experience mentoring engineers

Salary $105,000 to $120,000, plus a 401(k) match of up to 6%`,
        },
      },
      reason: "I want to lead a small design team, and pumps are the products I know best.",
      recipient: { uk: "Ms Clarke", us: "Ms. Clarke" },
      paragraphs: [
        "I am applying for the role of Lead Mechanical Engineer at Thornfield Process Equipment. I want to lead a small design team, and pumps are the products I know best.",
        {
          uk: "At Hartwell Pumps I lead mechanical design for a family of 12 end-suction pumps from 5 to 90 kW, taking each from concept to production release. I cut the cost of the main pump casing by 18% by redesigning it for sand casting with 3D-printed patterns.",
          us: "At Hartwell Pumps I lead mechanical design for a family of 12 end-suction pumps from 7 to 125 horsepower, taking each from concept to production release. I cut the cost of the main pump casing by 18% by redesigning it for sand casting with 3D-printed patterns.",
        },
        {
          uk: "Your advert asks for strong skills in SolidWorks and finite element analysis. I run finite element analysis (FEA) in Ansys on impellers, shafts and casings, cutting prototype rounds from 3 to 1 on the last 4 projects. At Corran Agricultural I modelled 200 parts and assemblies in SolidWorks to company drawing standards. I also tested 9 prototypes on the company test rig over 2 harvests, logging loads and temperatures with strain gauges.",
          us: "You are looking for strong skills in SolidWorks and finite element analysis. I run finite element analysis (FEA) in Ansys on impellers, shafts and casings, cutting prototype rounds from 3 to 1 on the last 4 projects. At Corran Agricultural I modeled 200 parts and assemblies in SolidWorks to company drawing standards. I also tested 9 prototypes on the company test rig over 2 harvests, logging loads and temperatures with strain gauges.",
        },
        {
          uk: "Your advert also asks for experience of root cause analysis and cutting warranty costs. I investigated 14 field failures with root cause analysis, then brought in a new seal design that cut warranty claims by 35% over 2 years.",
          us: "You are also looking for experience with root cause analysis and cutting warranty costs. I investigated 14 field failures with root cause analysis, then brought in a new seal design that cut warranty claims by 35% over 2 years.",
        },
        {
          uk: "I mentor 2 graduate engineers through their Institution of Mechanical Engineers (IMechE) development plans, with monthly reviews. I am a Chartered Engineer (CEng).",
          us: "I mentor 2 entry-level engineers preparing for the Fundamentals of Engineering (FE) exam, with monthly reviews. I hold a Professional Engineer (PE) license from the State of Wisconsin.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "site-manager",
    industry: "construction",
    role: { uk: "Site Manager", us: "Construction Superintendent" },
    level: "senior",
    template: "compact",
    blurb: {
      uk: "A senior site manager who runs residential schemes from start to handover, after starting out as a carpenter.",
      us: "A senior superintendent who runs multifamily projects from site work to turnover, after starting out as a carpenter.",
    },
    person: { name: "Craig Donnelly", email: "craig.donnelly@example.com", phone: { uk: "07700 900202", us: "(303) 555-0110" }, location: { uk: "Manchester", us: "Denver, CO" } },
    profile: {
      uk: "Senior site manager with 19 years in residential construction, the last 14 running sites for house builders and main contractors. Runs a £24 million, 6-storey scheme of 142 flats, with up to 18 subcontractors and 120 operatives on site each day. Reached 480,000 hours worked without a lost-time accident and cut snagging items at handover from 22 to 6 a flat. Started out as a carpenter and holds the Site Management Safety Training Scheme (SMSTS) certificate.",
      us: "Senior construction superintendent with 19 years in residential construction, the last 14 running job sites for home builders and general contractors. Runs a $38 million, 6-story building of 142 apartments, with up to 18 subcontractors and 120 workers on site each day. Reached 480,000 hours worked without a lost-time injury and cut punch list items at turnover from 22 to 6 per apartment. Started out as a carpenter and holds an Occupational Safety and Health Administration (OSHA) 30-Hour card.",
    },
    experience: [
      {
        title: { uk: "Senior Site Manager", us: "Senior Construction Superintendent" },
        org: "Ashby Lane Construction",
        location: { uk: "Salford", us: "Aurora, CO" },
        start: "2020-03",
        current: true,
        bullets: [
          {
            uk: "Run a £24 million, 6-storey scheme of 142 flats over 26 months, with up to 18 subcontractors and 120 operatives on site each day",
            us: "Run a $38 million, 6-story building of 142 apartments over 26 months, with up to 18 subcontractors and 120 workers on site each day",
          },
          {
            uk: "Plan the work 3 weeks ahead with each trade and update the master programme weekly, keeping the scheme 2 weeks ahead of the contract dates",
            us: "Plan the work 3 weeks ahead with each trade and update the master schedule weekly, keeping the project 2 weeks ahead of the contract dates",
          },
          {
            uk: "Reached 480,000 hours worked without a lost-time accident through daily briefings and weekly health and safety walks with each trade",
            us: "Reached 480,000 hours worked without a lost-time injury through daily briefings and weekly health and safety walks with each trade",
          },
          {
            uk: "Cut snagging items at handover from 22 to 6 a flat through quality inspections at 3 stages with the trades",
            us: "Cut punch list items at turnover from 22 to 6 per apartment through quality inspections at 3 stages with the trades",
          },
          {
            uk: "Control site costs to within 1.5% of the £2.1 million preliminaries budget, checking 18 subcontractor valuations with the quantity surveyor each month",
            us: "Control general conditions costs to within 1.5% of the $3.2 million budget, reviewing pay applications from 18 subcontractors with the project manager each month",
          },
          {
            uk: "Manage 2 assistant site managers and a site engineer, coaching both assistants through the SMSTS course",
            us: "Manage 2 assistant superintendents and a field engineer, coaching both assistants through OSHA 30-Hour training",
          },
        ],
      },
      {
        title: { uk: "Site Manager", us: "Construction Superintendent" },
        org: "Moorcroft Homes",
        location: { uk: "Bolton", us: "Littleton, CO" },
        start: "2015-06",
        end: "2020-02",
        bullets: [
          {
            uk: "Built 260 homes over 3 phases of a housing development, handing over 50 to 60 homes a year to buyers",
            us: "Built 260 homes over 3 phases of a subdivision, closing 50 to 60 homes a year with buyers",
          },
          {
            uk: "Cut the build time of a 3-bedroom semi-detached home from 18 to 15 weeks by reordering trades and ordering long-lead items 8 weeks earlier",
            us: "Cut the build time of a 3-bedroom single-family home from 18 to 15 weeks by reordering trades and ordering long-lead items 8 weeks earlier",
          },
          {
            uk: "Raised the share of buyers on the site who would recommend the builder from 82% to 94% over 2 years, through home demonstrations at handover",
            us: "Raised the share of buyers in the community who would recommend the builder from 82% to 94% over 2 years, through home orientations before closing",
          },
          {
            uk: "Checked around 40 risk assessments and method statements (RAMS) a month from subcontractors before work started",
            us: "Checked around 40 job hazard analysis (JHA) forms a month from subcontractors before work started",
          },
          {
            uk: "Kept each phase within 2% of its build budget by checking subcontractor valuations against work done every month",
            us: "Kept each phase within 2% of its build budget by checking subcontractor pay applications against work done every month",
          },
          {
            uk: "Ran site inductions for around 600 operatives a year and toolbox talks every week",
            us: "Ran site orientations for around 600 workers a year and toolbox talks every week",
          },
        ],
      },
      {
        title: { uk: "Assistant Site Manager", us: "Assistant Superintendent" },
        org: "Moorcroft Homes",
        location: { uk: "Bolton", us: "Littleton, CO" },
        start: "2012-04",
        end: "2015-05",
        bullets: [
          {
            uk: "Ran the build programme for 80 homes a year, booking trades and materials 2 weeks ahead",
            us: "Ran the build schedule for 80 homes a year, booking trades and materials 2 weeks ahead",
          },
          {
            uk: "Marked out roads, drainage and plots on a 9-hectare site with the site engineer",
            us: "Staked out roads, utilities and lots on a 22-acre site with the field engineer",
          },
          {
            uk: "Kept daily site diaries and logged around 120 quality checks a month for the handover files",
            us: "Kept daily logs and around 120 quality checklists a month for the closing files",
          },
        ],
      },
      {
        title: "Carpenter",
        org: "Harland Joinery",
        location: { uk: "Wigan", us: "Denver, CO" },
        start: "2007-09",
        end: "2012-03",
        bullets: [
          {
            uk: "Completed a 3-year carpentry and joinery apprenticeship with an NVQ Level 3",
            us: "Completed a 4-year union carpentry apprenticeship with 6,400 hours of on-the-job training",
          },
          {
            uk: "Cut and fitted roofs, staircases, doors and kitchens in around 150 new homes",
            us: "Framed walls and roofs and hung doors and trim in around 150 new homes",
          },
          {
            uk: "Led a gang of 4 carpenters on second-fix work for 6 months, checking every job against the drawings",
            us: "Led a crew of 4 carpenters on finish work for 6 months, checking every job against the drawings",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "HNC Construction and the Built Environment", us: "Associate of Applied Science in Construction Management" },
        org: { uk: "Bolton College", us: "Community College of Aurora" },
        start: "2013-09",
        end: "2015-06",
        grade: { uk: "Merit", us: "GPA 3.4" },
      },
    ],
    certificates: [
      { title: { uk: "Site Management Safety Training Scheme (SMSTS)", us: "OSHA 30-Hour Construction" }, org: { uk: "Construction Industry Training Board", us: "Occupational Safety and Health Administration" }, end: "2024" },
      { title: { uk: "CSCS Black Card (Manager)", us: "First Aid, CPR and AED" }, org: { uk: "Construction Skills Certification Scheme", us: "American Red Cross" }, end: "2025" },
      { title: { uk: "First Aid at Work", us: "Fall Protection Competent Person" }, org: { uk: "St John Ambulance", us: "Front Range Safety Training" }, end: "2025" },
    ],
    skills: [
      "Health and safety",
      { uk: "Programme planning", us: "Scheduling" },
      "Subcontractors",
      "Quality inspections",
      { uk: "Snagging", us: "Punch lists" },
      { uk: "Risk assessments", us: "Job hazard analysis" },
      "Cost control",
      { uk: "Valuations", us: "Pay applications" },
      { uk: "Site inductions", us: "Site orientations" },
      "Carpentry",
    ],
    names: ["Craig", "Donnelly", "Ashby", "Moorcroft", "Harland", "Salford", "Littleton", "Wigan", "Pennington", "Stockport"],
    letter: {
      job: {
        title: { uk: "Senior Site Manager", us: "Senior Construction Superintendent" },
        employer: { uk: "Pennington Build", us: "Pennington Builders" },
        advert: {
          uk: `Senior Site Manager
Pennington Build, Manchester

Pennington Build is a main contractor building apartment schemes of up to £40 million across Greater Manchester.

The role
You will run a 9-storey scheme of 210 flats in Stockport from groundworks to handover, with a site team of 4.

What we are looking for
- Experience running residential schemes over £15 million as site manager
- A strong health and safety record
- SMSTS and a CSCS Black Card
- Experience managing subcontractors and the build programme
- Attention to quality and snagging at handover

Salary £68,000 to £75,000, plus a car allowance`,
          us: `Senior Construction Superintendent
Pennington Builders, Denver, CO

Pennington Builders is a general contractor building multifamily projects of up to $60 million across the Denver metro area.

The role
You will run a 9-story building of 210 apartments in Lakewood from site work to turnover, with a field team of 4.

What we are looking for
- Experience running multifamily projects over $20 million as superintendent
- A strong safety record
- OSHA 30-Hour card
- Experience managing subcontractors and the project schedule
- Attention to quality and punch lists at turnover

Salary $125,000 to $140,000, plus a vehicle allowance`,
        },
      },
      reason: { uk: "I want to run bigger schemes of flats, and Stockport is close to home.", us: "I want to run bigger apartment projects, and Lakewood is close to home." },
      recipient: { uk: "Mr Hughes", us: "Mr. Hughes" },
      paragraphs: [
        {
          uk: "I am applying for the role of Senior Site Manager at Pennington Build. I want to run bigger schemes of flats, and Stockport is close to home.",
          us: "I am applying for the role of Senior Construction Superintendent at Pennington Builders. I want to run bigger apartment projects, and Lakewood is close to home.",
        },
        {
          uk: "At Ashby Lane Construction I run a £24 million, 6-storey scheme of 142 flats over 26 months, with up to 18 subcontractors and 120 operatives on site each day. I plan the work 3 weeks ahead with each trade and update the master programme weekly, keeping the scheme 2 weeks ahead of the contract dates.",
          us: "At Ashby Lane Construction I run a $38 million, 6-story building of 142 apartments over 26 months, with up to 18 subcontractors and 120 workers on site each day. I plan the work 3 weeks ahead with each trade and update the master schedule weekly, keeping the project 2 weeks ahead of the contract dates.",
        },
        {
          uk: "Your advert asks for a strong health and safety record. I reached 480,000 hours worked without a lost-time accident through daily briefings and weekly health and safety walks with each trade. At Moorcroft Homes I also checked around 40 risk assessments and method statements (RAMS) a month from subcontractors before work started.",
          us: "You are looking for a strong safety record. I reached 480,000 hours worked without a lost-time injury through daily briefings and weekly health and safety walks with each trade. At Moorcroft Homes I also checked around 40 job hazard analysis (JHA) forms a month from subcontractors before work started.",
        },
        {
          uk: "Your advert also asks for attention to quality and snagging at handover. I cut snagging items at handover from 22 to 6 a flat through quality inspections at 3 stages with the trades. At Moorcroft Homes I built 260 homes over 3 phases of a housing development, handing over 50 to 60 homes a year to buyers.",
          us: "You are also looking for attention to quality and punch lists at turnover. I cut punch list items at turnover from 22 to 6 per apartment through quality inspections at 3 stages with the trades. At Moorcroft Homes I built 260 homes over 3 phases of a subdivision, closing 50 to 60 homes a year with buyers.",
        },
        {
          uk: "I started out as a carpenter, and I hold the Site Management Safety Training Scheme (SMSTS) certificate and a CSCS Black Card.",
          us: "I started out as a carpenter, and I hold an OSHA 30-Hour card.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "maintenance-technician",
    industry: "manufacturing",
    role: { uk: "Maintenance Engineer", us: "Maintenance Technician" },
    level: "early",
    template: "compact",
    density: { uk: "default", us: "tighter" },
    blurb: {
      uk: "A multi-skilled maintenance engineer three years out of an apprenticeship at a bakery.",
      us: "A maintenance technician three years out of a registered apprenticeship at a commercial bakery.",
    },
    person: { name: "Kieran Walsh", email: "kieran.walsh@example.com", phone: { uk: "07700 900203", us: "(616) 555-0111" }, location: { uk: "Telford", us: "Grand Rapids, MI" } },
    profile: {
      uk: "Multi-skilled maintenance engineer with three years at a 4-line bread bakery, after a 4-year engineering apprenticeship with the same company. Finds and fixes faults in electrical, mechanical and pneumatic systems on mixers, ovens, slicers and bagging machines. Cut unplanned downtime on the busiest line from 6.5% to 3.8% in a year by rewriting 30 preventive maintenance tasks. Holds the 18th Edition wiring regulations certificate and is studying for an HNC in electrical engineering.",
      us: "Maintenance technician with three years at a 4-line commercial bakery, after a 4-year registered apprenticeship with the same company. Troubleshoots electrical, mechanical and pneumatic systems on mixers, ovens, slicers and bagging machines. Cut unplanned downtime on the busiest line from 6.5% to 3.8% in a year by rewriting 30 preventive maintenance tasks. Holds Environmental Protection Agency (EPA) Section 608 Universal certification and is studying for an associate degree in electrical technology.",
    },
    experience: [
      {
        title: { uk: "Maintenance Engineer", us: "Maintenance Technician" },
        org: "Ferncliff Foods",
        location: { uk: "Telford", us: "Grand Rapids, MI" },
        start: "2023-09",
        current: true,
        bullets: [
          {
            uk: "Maintain 4 bread lines on a 4-on, 4-off shift pattern, covering mixers, ovens, coolers, slicers and bagging machines",
            us: "Maintain 4 bread lines on 12-hour rotating shifts, covering mixers, ovens, coolers, slicers and bagging machines",
          },
          "Cut unplanned downtime on line 2 from 6.5% to 3.8% in a year by rewriting 30 preventive maintenance tasks with the line leaders",
          {
            uk: "Fault-find programmable logic controllers (PLCs), servo drives and sensors, fixing most breakdowns within 45 minutes",
            us: "Troubleshoot programmable logic controllers (PLCs), servo drives and sensors, fixing most breakdowns within 45 minutes",
          },
          "Rebuilt the gearbox and bearings on the main dough mixer during a 10-hour weekend shutdown, handing it back to production on time",
          "Log every job in the computerised maintenance management system (CMMS), keeping stock records for 1,800 spare parts accurate",
        ],
      },
      {
        title: { uk: "Engineering Maintenance Apprentice", us: "Maintenance Apprentice" },
        org: "Ferncliff Foods",
        location: { uk: "Telford", us: "Grand Rapids, MI" },
        start: "2019-09",
        end: "2023-08",
        bullets: [
          {
            uk: "Completed a Level 3 engineering maintenance apprenticeship, passing the end-point assessment with a distinction",
            us: "Completed a 4-year registered apprenticeship in industrial maintenance, logging 8,000 hours of on-the-job training",
          },
          {
            uk: "Rotated through electrical, mechanical and pneumatic work on 4 lines alongside 6 qualified engineers",
            us: "Rotated through electrical, mechanical and pneumatic work on 4 lines alongside 6 journey-level technicians",
          },
          "Built a parts board for the 8 most-changed conveyor parts, cutting the wait for parts by around 20 minutes a breakdown",
          "Wired and tested 3 new control panels for a packing line under supervision, with no faults found at commissioning",
        ],
      },
    ],
    education: [
      {
        title: { uk: "HNC Electrical and Electronic Engineering", us: "Associate of Applied Science in Electrical Technology" },
        org: { uk: "Telford College", us: "Grand Rapids Community College" },
        start: "2025-09",
        current: true,
      },
      {
        title: { uk: "BTEC Level 3 National Diploma in Engineering", us: "Certificate in Industrial Maintenance Technology" },
        org: { uk: "Telford College", us: "Grand Rapids Community College" },
        start: "2019-09",
        end: "2021-06",
      },
    ],
    certificates: [
      { title: { uk: "18th Edition Wiring Regulations (BS 7671)", us: "EPA Section 608 Universal Certification" }, org: { uk: "City & Guilds", us: "US Environmental Protection Agency" }, end: "2024" },
      { title: { uk: "IOSH Working Safely", us: "OSHA 10-Hour General Industry" }, org: { uk: "Institution of Occupational Safety and Health", us: "Occupational Safety and Health Administration" }, end: "2023" },
    ],
    skills: ["Preventive maintenance", "Programmable logic controllers", { uk: "Fault-finding", us: "Troubleshooting" }, "Servo drives", "Pneumatic systems", "Gearboxes", "Bearings", "Control panels", "Wiring", "CMMS"],
    names: ["Kieran", "Walsh", "Ferncliff", "Telford", "Severnside"],
    letter: {
      job: {
        title: { uk: "Multi-skilled Maintenance Engineer", us: "Maintenance Technician" },
        employer: "Severnside Foods",
        advert: {
          uk: `Multi-skilled Maintenance Engineer
Severnside Foods, Telford

Severnside Foods makes chilled ready meals on 6 high-speed lines.

The role
You will keep our lines running on a 4-on, 4-off shift pattern, with a focus on electrical and controls faults.

What we are looking for
- A completed engineering apprenticeship, or equal
- 18th Edition wiring regulations
- Experience fault-finding on PLCs, servo drives and sensors
- Experience with preventive maintenance in food manufacturing
- Clear written records in a CMMS

Salary £42,000, plus a shift allowance`,
          us: `Maintenance Technician
Severnside Foods, Grand Rapids, MI

Severnside Foods makes chilled ready meals on 6 high-speed lines.

The role
You will keep our lines running on 12-hour rotating shifts, with a focus on electrical and controls faults.

What we are looking for
- A completed maintenance apprenticeship or equal experience
- Experience troubleshooting PLCs, servo drives and sensors
- Experience with preventive maintenance in food manufacturing
- EPA Section 608 certification is a plus
- Clear written records in a CMMS

Pay $31 to $36 an hour, plus a shift premium`,
        },
      },
      reason: "I want to spend more of my time on electrical and controls faults, and I want to stay in food manufacturing.",
      paragraphs: [
        {
          uk: "I am applying for the role of Multi-skilled Maintenance Engineer at Severnside Foods. I want to spend more of my time on electrical and controls faults, and I want to stay in food manufacturing.",
          us: "I am applying for the role of Maintenance Technician at Severnside Foods. I want to spend more of my time on electrical and controls faults, and I want to stay in food manufacturing.",
        },
        {
          uk: "At Ferncliff Foods I maintain 4 bread lines on a 4-on, 4-off shift pattern, covering mixers, ovens, coolers, slicers and bagging machines. I cut unplanned downtime on line 2 from 6.5% to 3.8% in a year by rewriting 30 preventive maintenance tasks with the line leaders.",
          us: "At Ferncliff Foods I maintain 4 bread lines on 12-hour rotating shifts, covering mixers, ovens, coolers, slicers and bagging machines. I cut unplanned downtime on line 2 from 6.5% to 3.8% in a year by rewriting 30 preventive maintenance tasks with the line leaders.",
        },
        {
          uk: "Your advert asks for experience fault-finding on PLCs, servo drives and sensors. I fault-find programmable logic controllers (PLCs), servo drives and sensors, fixing most breakdowns within 45 minutes.",
          us: "You are looking for experience troubleshooting PLCs, servo drives and sensors. I troubleshoot programmable logic controllers (PLCs), servo drives and sensors, fixing most breakdowns within 45 minutes.",
        },
        "I rebuilt the gearbox and bearings on the main dough mixer during a 10-hour weekend shutdown, handing it back to production on time. I log every job in the computerised maintenance management system (CMMS), keeping stock records for 1,800 spare parts accurate. I also built a parts board for the 8 most-changed conveyor parts, cutting the wait for parts by around 20 minutes a breakdown.",
        {
          uk: "I completed a Level 3 engineering maintenance apprenticeship, passing the end-point assessment with a distinction. I hold the 18th Edition wiring regulations certificate, and I am studying for an HNC in electrical engineering.",
          us: "I completed a 4-year registered apprenticeship in industrial maintenance, logging 8,000 hours of on-the-job training. I hold Environmental Protection Agency (EPA) Section 608 Universal certification, and I am studying for an associate degree in electrical technology.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "environmental-consultant",
    industry: "energy",
    role: "Environmental Consultant",
    level: "experienced",
    template: "technical",
    blurb: {
      uk: "An environmental consultant who runs impact assessments and ground investigations for wind and solar farms.",
      us: "An environmental consultant who runs environmental reviews and site assessments for wind and solar projects.",
    },
    person: { name: "Rhiannon Morgan", email: "rhiannon.morgan@example.com", phone: { uk: "07700 900204", us: "(503) 555-0112" }, location: { uk: "Cardiff", us: "Portland, OR" } },
    profile: {
      uk: "Environmental consultant with nine years in renewable energy and land development, now leading impact assessments for onshore wind and solar farms. Manages environmental impact assessments (EIA) for 6 projects from 20 to 75 megawatts and runs ground investigations on around 25 sites a year. Won £420,000 of fees from 6 bids in 2025 and leads a team of 3 consultants. Chartered Environmentalist and Practitioner Member of the Institute of Environmental Management and Assessment (IEMA).",
      us: "Environmental consultant with nine years in renewable energy and land development, now leading environmental reviews for wind and solar projects. Manages National Environmental Policy Act (NEPA) reviews for 6 projects from 20 to 75 megawatts and runs site assessments on around 25 sites a year. Won $520,000 of fees from 6 proposals in 2025 and leads a team of 3 consultants. Holds the Certified Professional in Erosion and Sediment Control (CPESC) credential and 40-hour Hazardous Waste Operations and Emergency Response (HAZWOPER) training.",
    },
    experience: [
      {
        title: "Senior Environmental Consultant",
        org: "Greenhollow Environmental",
        location: { uk: "Cardiff", us: "Portland, OR" },
        start: "2022-05",
        current: true,
        bullets: [
          {
            uk: "Manage environmental impact assessments (EIA) for 6 onshore wind and solar farms from 20 to 75 megawatts, coordinating 8 specialist consultants",
            us: "Manage National Environmental Policy Act (NEPA) reviews for 6 wind and solar projects from 20 to 75 megawatts, coordinating 8 specialist consultants",
          },
          {
            uk: "Wrote 9 environmental statement chapters on hydrology, ground conditions and air quality, with no requests for further information from 5 planning authorities",
            us: "Wrote 9 environmental assessment chapters on hydrology, soils and air quality, with no requests for more information from 4 federal and state agencies",
          },
          {
            uk: "Run Phase 1 desk studies and Phase 2 ground investigations on around 25 sites a year, logging boreholes and sampling soil and groundwater",
            us: "Run Phase 1 and Phase 2 environmental site assessments on around 25 sites a year, logging boreholes and sampling soil and groundwater",
          },
          "Cut groundwater sampling costs by 22% across 4 long-term monitoring sites by switching to passive samplers",
          {
            uk: "Won £420,000 of fees from 6 bids in 2025, writing the technical and pricing sections",
            us: "Won $520,000 of fees from 6 proposals in 2025, writing the technical and pricing sections",
          },
          "Lead a team of 3 consultants, checking every report before issue and running monthly fieldwork safety briefings",
        ],
      },
      {
        title: "Environmental Consultant",
        org: "Ashworth Pryce Consulting",
        location: { uk: "Bristol", us: "Seattle, WA" },
        start: "2019-09",
        end: "2022-04",
        bullets: [
          "Monitored dust, noise and vibration at 3 major construction sites with 12 sensors, reporting results to each contractor every week",
          {
            uk: "Prepared 30 environmental permit applications for waste and water discharge sites, all granted by the regulator",
            us: "Prepared 30 storm water pollution prevention plans (SWPPPs) for construction sites, with no permit violations at later inspections",
          },
          "Calculated carbon footprints for 15 clients with the Greenhouse Gas (GHG) Protocol, each with a plan to cut emissions by 10% to 20%",
          {
            uk: "Logged 400 boreholes and trial pits on 40 sites, including 2 former gasworks with tar contamination",
            us: "Logged 400 boreholes and test pits on 40 sites, including 2 former manufactured gas plants with coal tar contamination",
          },
          {
            uk: "Wrote 12 construction environmental management plans for contractors, each approved by the local planning authority before work started",
            us: "Wrote 12 erosion and sediment control plans for contractors, each approved by the county before grading started",
          },
        ],
      },
      {
        title: { uk: "Graduate Environmental Consultant", us: "Staff Environmental Scientist" },
        org: "Ashworth Pryce Consulting",
        location: { uk: "Bristol", us: "Seattle, WA" },
        start: "2017-09",
        end: "2019-08",
        bullets: [
          "Collected 1,500 soil, water and gas samples on 60 site visits, keeping chain-of-custody records for each",
          {
            uk: "Drew 120 site plans and constraint maps in ArcGIS for reports and planning applications",
            us: "Drew 120 site plans and constraint maps in ArcGIS for reports and permit applications",
          },
          {
            uk: "Drafted 25 Phase 1 desk study reports, each signed off by a senior consultant within 2 rounds of review",
            us: "Drafted 25 Phase 1 environmental site assessment reports, each signed off by a senior consultant within 2 rounds of review",
          },
          {
            uk: "Surveyed 35 sites for invasive plants and protected species habitat, flagging 6 that needed specialist ecology surveys",
            us: "Surveyed 35 sites for invasive plants and wetland habitat, flagging 6 that needed specialist wetland delineations",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Environmental Science with Professional Placement", us: "Bachelor of Science in Environmental Science" },
        org: { uk: "Cardiff University", us: "Oregon State University" },
        start: "2013-09",
        end: "2017-06",
        grade: { uk: "First-class honours", us: "GPA 3.7" },
      },
    ],
    certificates: [
      {
        title: { uk: "Chartered Environmentalist (CEnv)", us: "Certified Professional in Erosion and Sediment Control (CPESC)" },
        org: { uk: "Society for the Environment", us: "EnviroCert International" },
        end: "2023",
      },
      {
        title: { uk: "Practitioner Member (PIEMA)", us: "40-Hour HAZWOPER, with yearly 8-hour refresher" },
        org: { uk: "Institute of Environmental Management and Assessment", us: "Cascade Safety Training" },
        end: "2021",
      },
      {
        title: { uk: "CSCS Card, Professionally Qualified Person", us: "OSHA 10-Hour Construction" },
        org: { uk: "Construction Skills Certification Scheme", us: "Occupational Safety and Health Administration" },
        end: "2019",
      },
    ],
    skills: [
      { uk: "Environmental impact assessment", us: "NEPA reviews" },
      { uk: "Ground investigations", us: "Site assessments" },
      "Groundwater sampling",
      "Hydrology",
      "Air quality",
      "Noise and vibration monitoring",
      "Carbon footprints",
      "ArcGIS",
      { uk: "Bid writing", us: "Proposal writing" },
      { uk: "Environmental permits", us: "Storm water plans" },
    ],
    names: ["Rhiannon", "Greenhollow", "Ashworth", "Pryce", "ArcGIS", "CEnv", "PIEMA", "EnviroCert", "Aldermoor"],
    letter: {
      job: {
        title: "Principal Environmental Consultant",
        employer: "Aldermoor Consulting",
        advert: {
          uk: `Principal Environmental Consultant
Aldermoor Consulting, Cardiff (hybrid)

Aldermoor Consulting advises developers of onshore wind, solar and battery storage projects across Wales and the west of England.

The role
You will lead environmental impact assessments for renewable energy projects and manage a team of 4 consultants.

What we are looking for
- Experience managing environmental impact assessments for renewable energy projects
- Experience of ground investigations and contaminated land
- A record of winning work through bids
- Chartered Environmentalist, or close to it
- Experience leading and developing a small team

Salary £52,000 to £58,000`,
          us: `Principal Environmental Consultant
Aldermoor Consulting, Portland, OR (hybrid)

Aldermoor Consulting advises developers of wind, solar and battery storage projects across Oregon and Washington.

The role
You will lead environmental reviews for renewable energy projects and manage a team of 4 consultants.

What we are looking for
- Experience managing NEPA reviews for renewable energy projects
- Experience with Phase 1 and Phase 2 environmental site assessments
- A record of winning work through proposals
- A professional credential such as CPESC
- Experience leading and developing a small team

Salary $105,000 to $120,000`,
        },
      },
      reason: "I want to spend all of my time on renewable energy projects, and I want to lead a bigger team.",
      recipient: { uk: "Dr Evans", us: "Dr. Evans" },
      paragraphs: [
        "I am applying for the role of Principal Environmental Consultant at Aldermoor Consulting. I want to spend all of my time on renewable energy projects, and I want to lead a bigger team.",
        {
          uk: "At Greenhollow Environmental I manage environmental impact assessments (EIA) for 6 onshore wind and solar farms from 20 to 75 megawatts, coordinating 8 specialist consultants. I wrote 9 environmental statement chapters on hydrology, ground conditions and air quality, with no requests for further information from 5 planning authorities.",
          us: "At Greenhollow Environmental I manage National Environmental Policy Act (NEPA) reviews for 6 wind and solar projects from 20 to 75 megawatts, coordinating 8 specialist consultants. I wrote 9 environmental assessment chapters on hydrology, soils and air quality, with no requests for more information from 4 federal and state agencies.",
        },
        {
          uk: "Your advert asks for experience of ground investigations and contaminated land. I run Phase 1 desk studies and Phase 2 ground investigations on around 25 sites a year, logging boreholes and sampling soil and groundwater. I also cut groundwater sampling costs by 22% across 4 long-term monitoring sites by switching to passive samplers. At Ashworth Pryce Consulting I logged 400 boreholes and trial pits on 40 sites, including 2 former gasworks with tar contamination.",
          us: "You are looking for experience with Phase 1 and Phase 2 environmental site assessments. I run Phase 1 and Phase 2 environmental site assessments on around 25 sites a year, logging boreholes and sampling soil and groundwater. I also cut groundwater sampling costs by 22% across 4 long-term monitoring sites by switching to passive samplers. At Ashworth Pryce Consulting I logged 400 boreholes and test pits on 40 sites, including 2 former manufactured gas plants with coal tar contamination.",
        },
        {
          uk: "Your advert also asks for a record of winning work through bids. I won £420,000 of fees from 6 bids in 2025, writing the technical and pricing sections.",
          us: "You are also looking for a record of winning work through proposals. I won $520,000 of fees from 6 proposals in 2025, writing the technical and pricing sections.",
        },
        {
          uk: "I lead a team of 3 consultants, checking every report before issue and running monthly fieldwork safety briefings. I am a Chartered Environmentalist (CEnv).",
          us: "I lead a team of 3 consultants, checking every report before issue and running monthly fieldwork safety briefings. I hold the Certified Professional in Erosion and Sediment Control (CPESC) credential.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "lab-technician",
    industry: "science",
    role: "Laboratory Technician",
    level: "early",
    template: "research",
    blurb: "A laboratory technician in an accredited testing lab, running microbiology and chemistry tests on water and food.",
    person: { name: "Zara Ahmed", email: "zara.ahmed@example.com", phone: { uk: "07700 900205", us: "(919) 555-0113" }, location: { uk: "Nottingham", us: "Raleigh, NC" } },
    profile: {
      uk: "Laboratory technician with four years in an accredited testing laboratory, running microbiology and chemistry tests on water and food samples. Tests around 120 samples a day by membrane filtration and plate counts, and runs high-performance liquid chromatography (HPLC) for preservatives and vitamins. Cut the sample backlog from 3 days to 1 and trains new starters in aseptic technique. Holds a 2:1 in Biological Sciences and Registered Science Technician status.",
      us: "Laboratory technician with four years in an accredited testing laboratory, running microbiology and chemistry tests on water and food samples. Tests around 120 samples a day by membrane filtration and plate counts, and runs high-performance liquid chromatography (HPLC) for preservatives and vitamins. Cut the sample backlog from 3 days to 1 and trains new hires in aseptic technique. Holds a Bachelor of Science in Microbiology and Good Laboratory Practice training.",
    },
    experience: [
      {
        title: "Laboratory Technician",
        org: "Linwood Analytical",
        location: { uk: "Nottingham", us: "Raleigh, NC" },
        start: "2022-08",
        current: true,
        bullets: [
          "Test around 120 water and food samples a day for Listeria, Salmonella and other bacteria by membrane filtration and plate counts",
          "Run high-performance liquid chromatography (HPLC) for preservatives and vitamins, reporting 98% of results within the 5-day turnaround",
          {
            uk: "Calibrate and maintain 14 instruments, from balances and pipettes to pH meters, with no calibration findings at the last 2 United Kingdom Accreditation Service (UKAS) audits",
            us: "Calibrate and maintain 14 instruments, from balances and pipettes to pH meters, with no calibration findings at the last 2 American Association for Laboratory Accreditation (A2LA) audits",
          },
          "Cut the sample backlog from 3 days to 1 by reorganising bench work into morning and afternoon batches with 2 analysts",
          "Record every result in the laboratory information management system (LIMS), with no data integrity findings at 4 internal audits",
          {
            uk: "Trained 5 new starters in aseptic technique and laboratory safety in 2024 and 2025",
            us: "Trained 5 new hires in aseptic technique and laboratory safety in 2024 and 2025",
          },
        ],
      },
      {
        title: { uk: "Placement Student, Quality Control Microbiology", us: "Quality Control Co-op, Microbiology" },
        org: "Brightmoor Pharmaceuticals",
        location: { uk: "Loughborough", us: "Durham, NC" },
        start: "2020-07",
        end: "2021-06",
        bullets: [
          "Tested water, air and surface samples from 4 clean rooms for environmental monitoring, reading around 300 plates a week",
          "Ran sterility tests on 60 batches of sterile eye drops, with every batch released on time",
          "Rewrote 8 standard operating procedures (SOPs) for media preparation, cutting training time for new analysts by 2 days",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Biological Sciences with a Year in Industry", us: "Bachelor of Science in Microbiology" },
        org: { uk: "University of Leicester", us: "North Carolina State University" },
        start: "2018-09",
        end: "2022-06",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "Registered Science Technician (RSciTech)", us: "Good Laboratory Practice training" },
        org: { uk: "Science Council", us: "Society of Quality Assurance" },
        end: "2024",
      },
      {
        title: { uk: "Good Laboratory Practice training", us: "Biological Safety Level 2 laboratory training" },
        org: { uk: "Research Quality Association", us: "Linwood Analytical" },
        end: "2023",
      },
    ],
    skills: ["Microbiology", "Membrane filtration", "Plate counts", "HPLC", "Calibration", "LIMS", "Aseptic technique", "Sterility testing", "Environmental monitoring", "Laboratory safety"],
    names: ["Zara", "Linwood", "Brightmoor", "Loughborough", "RSciTech", "Trentside", "Neuse"],
    letter: {
      job: {
        title: "Senior Laboratory Technician, Microbiology",
        employer: { uk: "Trentside Water", us: "Neuse Valley Water" },
        advert: {
          uk: `Senior Laboratory Technician, Microbiology
Trentside Water, Nottingham

Our accredited laboratory tests 250,000 drinking water samples a year for 3 million customers.

The role
You will run microbiology tests on drinking water, check results before release and train new technicians.

What we are looking for
- A degree in a biological science
- Experience of membrane filtration and plate counts in an accredited laboratory
- Experience with LIMS and calibration records
- Experience training others in aseptic technique
- Willingness to work 1 weekend in 4

Salary £30,500 to £33,000`,
          us: `Senior Laboratory Technician, Microbiology
Neuse Valley Water, Raleigh, NC

Our accredited laboratory tests 250,000 drinking water samples a year for 1 million customers.

The role
You will run microbiology tests on drinking water, check results before release and train new technicians.

What we are looking for
- A degree in a biological science
- Experience with membrane filtration and plate counts in an accredited laboratory
- Experience with LIMS and calibration records
- Experience training others in aseptic technique
- Willingness to work 1 weekend in 4

Salary $48,000 to $54,000`,
        },
      },
      reason: "I want to focus on microbiology, and I want my work to help keep drinking water safe.",
      paragraphs: [
        {
          uk: "I am applying for the role of Senior Laboratory Technician, Microbiology at Trentside Water. I want to focus on microbiology, and I want my work to help keep drinking water safe.",
          us: "I am applying for the role of Senior Laboratory Technician, Microbiology at Neuse Valley Water. I want to focus on microbiology, and I want my work to help keep drinking water safe.",
        },
        "At Linwood Analytical I test around 120 water and food samples a day for Listeria, Salmonella and other bacteria by membrane filtration and plate counts. I run high-performance liquid chromatography (HPLC) for preservatives and vitamins, reporting 98% of results within the 5-day turnaround.",
        {
          uk: "Your advert asks for experience with LIMS and calibration records. I record every result in the laboratory information management system (LIMS), with no data integrity findings at 4 internal audits. I also calibrate and maintain 14 instruments, from balances and pipettes to pH meters, with no calibration findings at the last 2 United Kingdom Accreditation Service (UKAS) audits.",
          us: "You are looking for experience with LIMS and calibration records. I record every result in the laboratory information management system (LIMS), with no data integrity findings at 4 internal audits. I also calibrate and maintain 14 instruments, from balances and pipettes to pH meters, with no calibration findings at the last 2 American Association for Laboratory Accreditation (A2LA) audits.",
        },
        {
          uk: "Your advert also asks for experience training others in aseptic technique. I trained 5 new starters in aseptic technique and laboratory safety in 2024 and 2025. I also cut the sample backlog from 3 days to 1 by reorganising bench work into morning and afternoon batches with 2 analysts.",
          us: "You are also looking for experience training others in aseptic technique. I trained 5 new hires in aseptic technique and laboratory safety in 2024 and 2025. I also cut the sample backlog from 3 days to 1 by reorganizing bench work into morning and afternoon batches with 2 analysts.",
        },
        {
          uk: "At Brightmoor Pharmaceuticals I tested water, air and surface samples from 4 clean rooms for environmental monitoring, reading around 300 plates a week. I studied Biological Sciences at the University of Leicester.",
          us: "At Brightmoor Pharmaceuticals I tested water, air and surface samples from 4 clean rooms for environmental monitoring, reading around 300 plates a week. I studied microbiology at North Carolina State University.",
        },
        CLOSE,
      ],
    },
  },
];
