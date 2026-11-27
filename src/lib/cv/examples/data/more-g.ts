import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** More examples, added 27 Nov 2026 so every industry has at least two. */
export const MORE_G: ExampleSpec[] = [
  {
    id: "hgv-driver",
    industry: "logistics",
    role: { uk: "HGV Class 1 Driver", us: "CDL Class A Truck Driver" },
    level: "experienced",
    template: "fieldwork",
    blurb: {
      uk: "An HGV Class 1 driver with 8 years on night trunking and multi-drop work, a clean licence and no accidents.",
      us: "A CDL Class A truck driver with 8 years on regional and multi-stop routes, a clean license and no accidents.",
    },
    person: { name: "Darren Rushworth", email: "darren.rushworth@example.com", phone: { uk: "07700 900643", us: "(402) 555-0165" }, location: { uk: "Lutterworth", us: "Omaha, NE" } },
    profile: {
      uk: "Heavy goods vehicle (HGV) Class 1 driver with 8 years on night trunking and multi-drop work, covering around 500,000 miles with no accidents or insurance claims. Holds a clean Category C+E licence, a Driver Certificate of Professional Competence (CPC) and a dangerous goods licence (ADR). Delivered 99.1% of loads on time in 2025 and raised fuel economy from 8.6 to 9.4 miles per gallon in 2 years. Has had no drivers' hours or tachograph infringements in 5 years of monthly checks.",
      us: "Truck driver with 8 years on regional and multi-stop routes, covering around 750,000 miles with no accidents or insurance claims. Holds a clean commercial driver's license (CDL) Class A with hazardous materials and tanker endorsements, and a current Department of Transportation (DOT) medical card. Delivered 99.1% of loads on time in 2025 and raised fuel economy from 6.6 to 7.2 miles per gallon in 2 years. Has had no hours-of-service violations in 5 years of electronic logging device (ELD) records.",
    },
    experience: [
      {
        title: { uk: "HGV Class 1 Driver", us: "CDL Class A Driver" },
        org: { uk: "Garside Haulage", us: "Garside Trucking" },
        location: { uk: "Lutterworth", us: "Omaha, NE" },
        start: "2021-03",
        current: true,
        bullets: [
          {
            uk: "Drive night trunking runs of around 280 miles between the Lutterworth hub and depots in Leeds and Bristol, 5 nights a week",
            us: "Drive regional routes of around 450 miles a day from the Omaha terminal to Kansas City, Des Moines and Sioux Falls, 5 days a week",
          },
          {
            uk: "Delivered 99.1% of loads on time in 2025 against a company target of 97%, planning breaks and routes around known roadworks",
            us: "Delivered 99.1% of loads on time in 2025 against a company target of 97%, planning breaks and routes around known construction zones",
          },
          {
            uk: "Raised fuel economy from 8.6 to 9.4 miles per gallon in 2 years through smoother driving and less idling, shown in the fleet's monthly fuel reports",
            us: "Raised fuel economy from 6.6 to 7.2 miles per gallon in 2 years through smoother driving and less idling, shown in the fleet's monthly fuel reports",
          },
          {
            uk: "Haul around 30 loads of packaged dangerous goods a month, such as paints, aerosols and cleaning chemicals, with no spills or incidents in 5 years",
            us: "Haul around 30 hazardous materials loads a month, from packaged paint and aerosols to tankers of cleaning chemicals, with no spills or incidents in 5 years",
          },
          {
            uk: "Kept a clean drivers' hours record over 5 years, with no infringements found in the transport office's monthly tachograph checks",
            us: "Kept a clean hours-of-service record over 5 years, with no violations found in the safety team's monthly electronic logging device checks",
          },
          {
            uk: "Mentored 6 new drivers since 2023, riding with each for 2 weeks of night runs before they drove alone",
            us: "Mentored 6 new drivers since 2023, riding with each for 2 weeks of regional runs before they drove alone",
          },
        ],
      },
      {
        title: { uk: "HGV Class 1 Multi-drop Driver", us: "CDL Class A Delivery Driver" },
        org: "Ellerton Foods",
        location: { uk: "Leicester", us: "Lincoln, NE" },
        start: "2018-04",
        end: "2021-02",
        bullets: [
          {
            uk: "Delivered chilled and frozen food on multi-drop routes to 12 to 18 restaurants, schools and care homes a day across Leicestershire",
            us: "Delivered refrigerated and frozen food on multi-stop routes to 12 to 18 restaurants, schools and nursing homes a day across eastern Nebraska",
          },
          {
            uk: "Cut missed delivery slots on the route from 6% to 2% in a year by agreeing the drop order with the transport planner each morning",
            us: "Cut missed delivery windows on the route from 6% to 2% in a year by agreeing the stop order with the dispatcher each morning",
          },
          "Logged around 4,000 temperature checks a year on a handheld scanner, with no deliveries rejected in 3 years of food safety audits",
          {
            uk: "Unloaded around 9 tonnes a day by tail lift and pallet truck, with no manual handling injuries in 3 years",
            us: "Unloaded around 10 tons a day by ramp and hand truck, with no lifting injuries in 3 years",
          },
        ],
      },
      {
        title: { uk: "Class 2 Driver", us: "CDL Class B Driver" },
        org: { uk: "Holroyd Building Supplies", us: "Holroyd Building Supply" },
        location: { uk: "Market Harborough", us: "Fremont, NE" },
        start: "2015-06",
        end: "2018-03",
        bullets: [
          {
            uk: "Delivered timber, bricks and plasterboard to around 10 building sites and homes a day in a 26-tonne rigid lorry",
            us: "Delivered lumber, drywall and roofing to around 10 job sites and homes a day in a 26-ton straight truck",
          },
          {
            uk: "Unloaded around 40 pallets a day with the lorry's crane, with no damage claims from customers in 3 years",
            us: "Unloaded around 40 pallets a day with the truck's crane, with no damage claims from customers in 3 years",
          },
          {
            uk: "Passed the Class 1 test first time in 2018 through the company's driver training scheme, after 2 years of Class 2 driving",
            us: "Passed the Class A skills test first time in 2018 through the company's driver training program, after 2 years of Class B driving",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "GCSEs", us: "High School Diploma" },
        org: { uk: "Brockhurst Community College", us: "Brockhurst High School" },
        location: { uk: "Leicester", us: "Fremont, NE" },
        end: "2012",
        grade: { uk: "6 at grades A to C, including English and Maths", us: "" },
      },
    ],
    certificates: [
      {
        title: { uk: "Category C+E Driving Licence", us: "Commercial Driver's License, Class A" },
        org: { uk: "Driver and Vehicle Licensing Agency", us: "Nebraska Department of Motor Vehicles" },
        end: "2018",
      },
      {
        title: { uk: "ADR Dangerous Goods Licence (Packages)", us: "Hazardous Materials and Tanker Endorsements" },
        org: { uk: "Scottish Qualifications Authority", us: "Nebraska Department of Motor Vehicles" },
        end: "2021",
      },
      {
        title: { uk: "Driver Certificate of Professional Competence", us: "Department of Transportation Medical Card" },
        org: { uk: "Driver and Vehicle Standards Agency", us: "Federal Motor Carrier Safety Administration" },
        end: "2025",
      },
    ],
    skills: [
      { uk: "Night trunking", us: "Regional routes" },
      { uk: "Multi-drop routes", us: "Multi-stop routes" },
      "Route planning",
      { uk: "Drivers' hours", us: "Hours of service" },
      { uk: "Tachograph checks", us: "Electronic logging devices" },
      { uk: "Dangerous goods", us: "Hazardous materials" },
      "Fuel economy",
      "Temperature checks",
      "Crane unloading",
      "Mentoring new drivers",
    ],
    names: ["Darren", "Rushworth", "Garside", "Ellerton", "Holroyd", "Brockhurst", "Oakden", "Lutterworth", "Harborough", "Leicestershire", "Omaha", "Fremont", "Des", "Moines"],
    letter: {
      job: {
        title: { uk: "HGV Class 1 Driver (Nights)", us: "CDL Class A Driver (Regional)" },
        employer: "Oakden Logistics",
        advert: {
          uk: `HGV Class 1 Driver (Nights)
Oakden Logistics, Lutterworth

Oakden Logistics runs trunking and store deliveries for 3 national retailers from its Lutterworth hub, with a fleet of 160 lorries.

The role
You will drive night trunking runs between our hub and regional depots, 5 nights a week.

What we are looking for
- A Category C+E licence with no more than 3 points
- A current Driver CPC card
- An ADR licence, or willingness to train for one
- A strong record on drivers' hours and tachograph rules
- A safe and fuel-efficient driving style

Pay £17.50 an hour, with night and weekend premiums`,
          us: `CDL Class A Driver (Regional)
Oakden Logistics, Omaha, NE

Oakden Logistics runs regional freight and store deliveries for 3 national retailers from its Omaha terminal, with a fleet of 160 trucks.

The role
You will drive regional routes across Nebraska, Iowa and Kansas, home most nights.

What we are looking for
- A Class A CDL with a clean driving record
- Hazardous materials and tanker endorsements, or willingness to obtain them
- A current DOT medical card
- A strong record on hours of service
- A safe and fuel-efficient driving style

Pay $0.68 a mile, with home time most nights`,
        },
      },
      reason: {
        uk: "I want to keep driving night trunking runs for a larger haulier. I also enjoy the planning that keeps loads on time.",
        us: "I want to keep driving regional routes for a larger carrier. I also enjoy the planning that keeps loads on time.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of HGV Class 1 Driver (Nights) at Oakden Logistics. I want to keep driving night trunking runs for a larger haulier. I also enjoy the planning that keeps loads on time.",
          us: "I am applying for the role of CDL Class A Driver (Regional) at Oakden Logistics. I want to keep driving regional routes for a larger carrier. I also enjoy the planning that keeps loads on time.",
        },
        {
          uk: "At Garside Haulage I drive night trunking runs of around 280 miles between the Lutterworth hub and depots in Leeds and Bristol, 5 nights a week. I delivered 99.1% of loads on time in 2025 against a company target of 97%, planning breaks and routes around known roadworks. In 8 years of night trunking and multi-drop work, I have covered around 500,000 miles with no accidents or insurance claims.",
          us: "At Garside Trucking I drive regional routes of around 450 miles a day from the Omaha terminal to Kansas City, Des Moines and Sioux Falls, 5 days a week. I delivered 99.1% of loads on time in 2025 against a company target of 97%, planning breaks and routes around known construction zones. In 8 years on regional and multi-stop routes, I have covered around 750,000 miles with no accidents or insurance claims.",
        },
        {
          uk: "Your advert asks for a strong record on drivers' hours and tachograph rules. I have kept a clean drivers' hours record over 5 years, with no infringements found in the transport office's monthly tachograph checks. I hold a clean Category C+E licence, a Driver Certificate of Professional Competence (CPC) and a dangerous goods licence (ADR).",
          us: "Your advert asks for a strong record on hours of service. I have kept a clean hours-of-service record over 5 years, with no violations found in the safety team's monthly electronic logging device checks. I hold a clean commercial driver's license (CDL) Class A with hazardous materials and tanker endorsements, and a current Department of Transportation (DOT) medical card.",
        },
        {
          uk: "You are also looking for a safe and fuel-efficient driving style. I raised fuel economy from 8.6 to 9.4 miles per gallon in 2 years through smoother driving and less idling, shown in the fleet's monthly fuel reports. I also haul around 30 loads of packaged dangerous goods a month, with no spills or incidents in 5 years.",
          us: "You are also looking for a safe and fuel-efficient driving style. I raised fuel economy from 6.6 to 7.2 miles per gallon in 2 years through smoother driving and less idling, shown in the fleet's monthly fuel reports. I also haul around 30 hazardous materials loads a month, with no spills or incidents in 5 years.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "renewable-energy-engineer",
    industry: "energy",
    role: "Renewable Energy Engineer",
    level: "early",
    template: "sapling",
    blurb: "A renewable energy engineer two years into designing, modelling and commissioning solar farms and battery storage sites.",
    person: { name: "Anjali Ramanathan", email: "anjali.ramanathan@example.com", phone: { uk: "07700 900644", us: "(806) 555-0166" }, location: { uk: "Bristol", us: "Lubbock, TX" } },
    profile: {
      uk: "Renewable energy engineer with 2 years at a solar and battery storage developer, surveying 14 sites from 5 to 50 megawatts (MW). Models energy yield in PVsyst, prepares grid connection applications and designs cable layouts in AutoCAD. Commissioned 2 solar farms with the site team in 2025. First-class MEng graduate, working towards Chartered Engineer status with the Institution of Engineering and Technology (IET).",
      us: "Renewable energy engineer with 2 years at a solar and battery storage developer, surveying 14 sites from 5 to 50 megawatts (MW). Models energy yield in PVsyst, prepares interconnection applications and designs cable layouts in AutoCAD. Commissioned 2 solar farms with the site team in 2025. Passed the Fundamentals of Engineering exam in 2024 and is a registered Engineer in Training (EIT) in Texas.",
    },
    experience: [
      {
        title: "Renewable Energy Engineer",
        org: "Greyfield Renewables",
        location: { uk: "Bristol", us: "Lubbock, TX" },
        start: "2024-09",
        current: true,
        bullets: [
          "Surveyed 14 proposed solar and battery storage sites from 5 to 50 MW, checking shading, ground conditions, access and the distance to the nearest substation",
          "Modelled energy yield for 22 solar farm layouts in PVsyst, testing row spacing and panel tilt to raise expected yearly output by up to 4%",
          {
            uk: "Prepared 9 grid connection applications for the distribution network operator, gaining 7 connection offers so far",
            us: "Prepared 9 interconnection applications for 2 local utilities, with 7 approved for study so far",
          },
          "Commissioned 2 solar farms of 18 and 32 MW with the site team in 2025, testing 2,600 panel strings and 14 inverters before switch-on",
          {
            uk: "Designed the cable layout for a 20 MW battery storage site in AutoCAD, cutting cable length by 12% from the original design and saving about £85,000",
            us: "Designed the cable layout for a 20 MW battery storage site in AutoCAD, cutting cable length by 12% from the original design and saving about $110,000",
          },
        ],
      },
      {
        title: "Engineering Intern",
        org: "Ravensworth Electrical",
        location: { uk: "Swindon", us: "Amarillo, TX" },
        start: "2023-06",
        end: "2023-09",
        bullets: [
          "Drew single-line diagrams for 6 rooftop solar systems from 50 to 250 kilowatts for schools and warehouses",
          "Checked cable sizes and voltage drop for the 6 rooftop systems in a spreadsheet, finding 2 undersized cables before installation",
          "Measured roofs and shading at 8 customer sites, writing up a survey report for each",
        ],
      },
    ],
    education: [
      {
        title: { uk: "MEng (Hons) Electrical and Electronic Engineering", us: "Bachelor of Science in Electrical Engineering" },
        org: { uk: "University of Bath", us: "Texas Tech University" },
        start: "2020-09",
        end: "2024-06",
        grade: { uk: "First", us: "GPA 3.7" },
      },
    ],
    certificates: [
      {
        title: { uk: "Graduate Member", us: "Engineer in Training (EIT)" },
        org: { uk: "Institution of Engineering and Technology", us: "Texas Board of Professional Engineers and Land Surveyors" },
        end: "2024",
      },
      {
        title: { uk: "Construction Skills Certification Scheme (CSCS) Card", us: "OSHA 30-Hour Construction Safety" },
        org: { uk: "Construction Industry Training Board", us: "Occupational Safety and Health Administration" },
        end: "2024",
      },
    ],
    skills: [
      "Site surveys",
      "Energy yield modelling",
      "PVsyst",
      { uk: "Grid connection applications", us: "Interconnection applications" },
      "Commissioning",
      "Battery storage",
      "Cable layout design",
      "AutoCAD",
      "Single-line diagrams",
    ],
    names: ["Anjali", "Ramanathan", "Greyfield", "Ravensworth", "Heronsgate", "PVsyst", "AutoCAD", "MEng", "Lubbock", "Amarillo", "Swindon"],
    letter: {
      job: {
        title: "Renewable Energy Engineer",
        employer: "Heronsgate Energy",
        advert: {
          uk: `Renewable Energy Engineer
Heronsgate Energy, Bristol (hybrid)

Heronsgate Energy develops and builds solar farms and battery storage sites across southern England, with 600 MW in planning.

The role
You will design and model new solar and battery storage sites, from the first site survey to grid connection and commissioning.

What we are looking for
- A degree in electrical engineering or a related subject
- At least 1 year in solar or battery storage design
- Experience with PVsyst and AutoCAD
- Knowledge of grid connection applications
- Working towards chartered status

Salary £36,000 to £42,000`,
          us: `Renewable Energy Engineer
Heronsgate Energy, Lubbock, TX (hybrid)

Heronsgate Energy develops and builds solar farms and battery storage sites across West Texas, with 600 MW in development.

The role
You will design and model new solar and battery storage sites, from the first site survey to interconnection and commissioning.

What we are looking for
- A bachelor's degree in electrical engineering or a related field
- At least 1 year in solar or battery storage design
- Experience with PVsyst and AutoCAD
- Knowledge of interconnection applications
- Engineer in Training (EIT) certification

Salary $78,000 to $90,000`,
        },
      },
      reason: "I want to design larger solar and battery storage sites. I also enjoy seeing a site through from survey to commissioning.",
      paragraphs: [
        "I am applying for the role of Renewable Energy Engineer at Heronsgate Energy. I want to design larger solar and battery storage sites. I also enjoy seeing a site through from survey to commissioning.",
        {
          uk: "At Greyfield Renewables I have surveyed 14 proposed solar and battery storage sites from 5 to 50 MW, checking shading, ground conditions, access and the distance to the nearest substation. Your advert asks for experience with PVsyst and AutoCAD. I modelled energy yield for 22 solar farm layouts in PVsyst, testing row spacing and panel tilt to raise expected yearly output by up to 4%. I also designed the cable layout for a 20 MW battery storage site in AutoCAD, cutting cable length by 12% from the original design and saving about £85,000.",
          us: "At Greyfield Renewables I have surveyed 14 proposed solar and battery storage sites from 5 to 50 MW, checking shading, ground conditions, access and the distance to the nearest substation. Your advert asks for experience with PVsyst and AutoCAD. I modeled energy yield for 22 solar farm layouts in PVsyst, testing row spacing and panel tilt to raise expected yearly output by up to 4%. I also designed the cable layout for a 20 MW battery storage site in AutoCAD, cutting cable length by 12% from the original design and saving about $110,000.",
        },
        {
          uk: "You are also looking for knowledge of grid connection applications. I prepared 9 grid connection applications for the distribution network operator, gaining 7 connection offers so far. In 2025 I commissioned 2 solar farms of 18 and 32 MW with the site team, testing 2,600 panel strings and 14 inverters before switch-on.",
          us: "You are also looking for knowledge of interconnection applications. I prepared 9 interconnection applications for 2 local utilities, with 7 approved for study so far. In 2025 I commissioned 2 solar farms of 18 and 32 MW with the site team, testing 2,600 panel strings and 14 inverters before switch-on.",
        },
        {
          uk: "I studied Electrical and Electronic Engineering at the University of Bath, graduating with a First in 2024. I am working towards Chartered Engineer status with the Institution of Engineering and Technology (IET).",
          us: "I studied electrical engineering at Texas Tech University, graduating in 2024 with a GPA of 3.7. I passed the Fundamentals of Engineering exam in 2024 and am a registered Engineer in Training (EIT) in Texas.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "soc-analyst",
    industry: "cyber",
    role: { uk: "Security Operations Centre Analyst", us: "Security Operations Center Analyst" },
    level: "early",
    template: "index",
    blurb: {
      uk: "A security operations centre analyst two years into triaging alerts for a managed security provider, after a start on the IT service desk.",
      us: "A security operations center analyst two years into triaging alerts for a managed security provider, after a start on the IT help desk.",
    },
    person: { name: "Tariq Mahmood", email: "tariq.mahmood@example.com", phone: { uk: "07700 900645", us: "(703) 555-0167" }, location: { uk: "Cheltenham", us: "Herndon, VA" } },
    profile: {
      uk: "Security operations centre (SOC) analyst with 2 years at a managed security provider, after 2 years on an IT service desk. Reviews around 70 alerts a shift in Microsoft Sentinel and Defender for Endpoint for 9 client organisations. Cut false positives from the 20 noisiest detection rules by 45% and wrote 8 response playbooks that brought the team's mean time to respond down from 52 to 31 minutes. Holds CompTIA Security+ and Blue Team Level 1 (BTL1).",
      us: "Security operations center (SOC) analyst with 2 years at a managed security provider, after 2 years on an IT help desk. Reviews around 70 alerts a shift in Microsoft Sentinel and Defender for Endpoint for 9 client organizations. Cut false positives from the 20 noisiest detection rules by 45% and wrote 8 response playbooks that brought the team's mean time to respond down from 52 to 31 minutes. Holds CompTIA Security+ and Blue Team Level 1 (BTL1).",
    },
    experience: [
      {
        title: { uk: "Security Operations Centre Analyst", us: "Security Operations Center Analyst" },
        org: "Quillon Security",
        location: { uk: "Cheltenham", us: "Herndon, VA" },
        start: "2024-08",
        current: true,
        bullets: [
          "Triage around 70 alerts a shift in Microsoft Sentinel and Defender for Endpoint for 9 client organisations, escalating 4 to 6 confirmed incidents a week",
          "Investigate around 40 reported phishing emails a week, testing links and attachments in a sandbox, and blocked 120 malicious senders in 2025",
          "Tuned the 20 noisiest detection rules with the detection engineering lead, cutting false positives from them by 45% in 6 months",
          "Wrote 8 response playbooks for incidents such as account compromise and malware, cutting the team's mean time to respond from 52 to 31 minutes",
          "Built 14 threat hunting queries in Kusto Query Language (KQL), finding 3 compromised accounts that no alert had caught",
        ],
      },
      {
        title: { uk: "IT Service Desk Analyst", us: "IT Help Desk Analyst" },
        org: "Brockwell Insurance",
        location: { uk: "Gloucester", us: "Fairfax, VA" },
        start: "2022-09",
        end: "2024-07",
        bullets: [
          "Resolved around 30 support tickets a day for 1,200 staff across 14 offices, closing 96% within the 8-hour target",
          "Reset passwords and multi-factor authentication for around 150 users a month, checking identity on each call",
          "Reported 30 suspicious emails to the security team in 2023, 6 of them confirmed phishing, which led to a move into security operations",
          "Wrote 20 knowledge base articles on common faults, cutting repeat tickets for those faults by 25% in 6 months",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Computer Networks and Security", us: "Bachelor of Science in Information Technology" },
        org: { uk: "University of Gloucestershire", us: "Old Dominion University" },
        end: "2022",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    certificates: [
      { title: "CompTIA Security+", org: "CompTIA", end: "2024" },
      { title: "Blue Team Level 1 (BTL1)", org: "Security Blue Team", end: "2025" },
      { title: "Microsoft Certified: Security Operations Analyst Associate", org: "Microsoft", end: "2025" },
    ],
    skills: [
      "Microsoft Sentinel",
      "Defender for Endpoint",
      "Alert triage",
      "Phishing",
      "Sandbox testing",
      "Detection rule tuning",
      "Response playbooks",
      "Threat hunting",
      "Kusto Query Language",
      "Multi-factor authentication",
    ],
    names: ["Tariq", "Mahmood", "Quillon", "Brockwell", "Merlin", "CompTIA", "Kusto", "Endpoint", "Herndon", "Gloucestershire", "Cheltenham", "Fairfax"],
    letter: {
      job: {
        title: { uk: "Security Operations Centre Analyst", us: "Security Operations Center Analyst" },
        employer: { uk: "Merlin Building Society", us: "Merlin Credit Union" },
        advert: {
          uk: `Security Operations Centre Analyst
Merlin Building Society, Cheltenham

Merlin Building Society serves 400,000 members from 60 branches, with an in-house security operations centre (SOC) of 8 analysts.

The role
You will monitor and investigate alerts across our systems on a 4-on, 4-off shift pattern, and help us improve our detection rules.

What we are looking for
- At least 1 year in a SOC
- Hands-on experience with Microsoft Sentinel and Defender
- Experience investigating phishing
- Knowledge of KQL
- CompTIA Security+ or similar

Salary £38,000 to £44,000, plus shift allowance`,
          us: `Security Operations Center Analyst
Merlin Credit Union, Herndon, VA

Merlin Credit Union serves 400,000 members from 60 branches, with an in-house security operations center (SOC) of 8 analysts.

The role
You will monitor and investigate alerts across our systems on a rotating shift schedule, and help us improve our detection rules.

What we are looking for
- At least 1 year in a SOC
- Hands-on experience with Microsoft Sentinel and Defender
- Experience investigating phishing
- Knowledge of KQL
- CompTIA Security+ or similar

Salary $82,000 to $95,000, plus shift differential`,
        },
      },
      reason: "I want to work in an in-house SOC, where I can learn one organisation's systems in depth. I also enjoy tuning detection rules so the team chases fewer false alarms.",
      paragraphs: [
        {
          uk: "I am applying for the role of Security Operations Centre Analyst at Merlin Building Society. I want to work in an in-house SOC, where I can learn one organisation's systems in depth. I also enjoy tuning detection rules so the team chases fewer false alarms.",
          us: "I am applying for the role of Security Operations Center Analyst at Merlin Credit Union. I want to work in an in-house SOC, where I can learn one organization's systems in depth. I also enjoy tuning detection rules so the team chases fewer false alarms.",
        },
        "At Quillon Security I triage around 70 alerts a shift in Microsoft Sentinel and Defender for Endpoint for 9 client organisations, escalating 4 to 6 confirmed incidents a week. Your advert asks for experience investigating phishing. I investigate around 40 reported phishing emails a week, testing links and attachments in a sandbox, and I blocked 120 malicious senders in 2025.",
        "You are also looking for knowledge of KQL. I built 14 threat hunting queries in Kusto Query Language (KQL), finding 3 compromised accounts that no alert had caught. I also tuned the 20 noisiest detection rules with the detection engineering lead, cutting false positives from them by 45% in 6 months.",
        "I wrote 8 response playbooks for incidents such as account compromise and malware, cutting the team's mean time to respond from 52 to 31 minutes. I hold CompTIA Security+ and Blue Team Level 1 (BTL1).",
        CLOSE,
      ],
    },
  },
];
