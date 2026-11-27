import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** More examples, added 27 Nov 2026 to fill gaps by level and industry. */
export const MORE_E: ExampleSpec[] = [
  {
    id: "operations-manager",
    industry: "business",
    role: { uk: "Head of Operations", us: "Director of Operations" },
    level: "senior",
    template: "chronicle",
    blurb: {
      uk: "A head of operations who runs the warehouse, delivery and customer service teams of a growing online retailer.",
      us: "A director of operations who runs the warehouse, delivery and customer service teams of a growing online retailer.",
    },
    person: { name: "Joanna Fairclough", email: "joanna.fairclough@example.com", phone: { uk: "07700 900628", us: "(718) 555-0154" }, location: { uk: "Leeds", us: "Brooklyn, NY" } },
    profile: {
      uk: "Head of operations with 15 years in e-commerce and distribution, the last 6 running the warehouse, delivery and customer service teams of an online furniture retailer. Leads 4 managers and 140 staff with a £9.5 million operating budget. Cut the cost to deliver an order from £7.40 to £5.90 and raised on-time delivery from 88% to 97% in 2 years. Trained 20 team leaders in Lean Six Sigma and moved the warehouse to a site twice the size without stopping dispatch.",
      us: "Director of operations with 15 years in e-commerce and distribution, the last 6 running the warehouse, delivery and customer service teams of an online furniture retailer. Leads 4 managers and 140 staff with a $12 million operating budget. Cut the cost to deliver an order from $9.30 to $7.40 and raised on-time delivery from 88% to 97% in 2 years. Trained 20 team leaders in Lean Six Sigma and moved the warehouse to a site twice the size without stopping dispatch.",
    },
    experience: [
      {
        title: { uk: "Head of Operations", us: "Director of Operations" },
        org: "Wrenfield Home",
        location: { uk: "Leeds", us: "Brooklyn, NY" },
        start: "2020-04",
        current: true,
        bullets: [
          {
            uk: "Lead the warehouse, delivery and customer service teams of an online furniture retailer with £62 million in sales in 2025: 4 managers and 140 staff",
            us: "Lead the warehouse, delivery and customer service teams of an online furniture retailer with $78 million in sales in 2025: 4 managers and 140 staff",
          },
          {
            uk: "Run an operating budget of £9.5 million, finishing within 1% of budget in each of the last 4 years",
            us: "Run an operating budget of $12 million, finishing within 1% of budget in each of the last 4 years",
          },
          {
            uk: "Cut the cost to pick, pack and deliver an order from £7.40 to £5.90 in 2 years by redesigning pick routes and renegotiating 3 courier contracts",
            us: "Cut the cost to pick, pack and deliver an order from $9.30 to $7.40 in 2 years by redesigning pick routes and renegotiating 3 courier contracts",
          },
          "Raised on-time delivery from 88% to 97% by booking next-day courier collections and adding a late shift in the warehouse",
          "Cut customer contacts per 100 orders from 14 to 8 by fixing the top 5 causes of contact with the product and web teams",
          "Moved the warehouse to a site twice the size in 2023, transferring 18,000 product lines over 3 weekends without stopping dispatch for a day",
        ],
      },
      {
        title: "Operations Manager",
        org: "Wrenfield Home",
        location: { uk: "Wakefield", us: "Secaucus, NJ" },
        start: "2017-06",
        end: "2020-03",
        bullets: [
          "Managed the warehouse and returns teams of 60 staff, dispatching up to 4,000 orders a day at peak",
          "Introduced a warehouse management system with the IT team, raising picking accuracy from 98.1% to 99.6% in a year",
          "Designed a returns process that resold 70% of returned items within 5 days, up from 45%",
          "Built weekly staffing plans from sales forecasts, cutting agency labour spend by 22% in a year",
          "Trained 20 team leaders in Lean Six Sigma, who then ran 35 process improvement projects in 2 years",
        ],
      },
      {
        title: "Shift Manager",
        org: "Coldharbour Distribution",
        location: { uk: "Doncaster", us: "Edison, NJ" },
        start: "2014-03",
        end: "2017-05",
        bullets: [
          "Ran the night shift of 45 staff at a distribution centre for 3 retail clients, picking 25,000 order lines a night",
          "Raised lines picked per hour from 110 to 135 in a year through daily shift huddles and moving fast-selling lines nearer the packing benches",
          "Cut lost-time accidents on the shift from 6 to 1 a year by retraining forklift drivers and marking out walkways",
        ],
      },
      {
        title: "Operations Analyst",
        org: "Coldharbour Distribution",
        location: { uk: "Doncaster", us: "Edison, NJ" },
        start: "2011-09",
        end: "2014-02",
        bullets: [
          "Built weekly reports on cost, accuracy and service for 3 retail clients from warehouse data in Excel and SQL",
          "Modelled a new picking layout that cut walking distance per order by 18% after the site adopted it in 2013",
          {
            uk: "Wrote 40 standard operating procedures for receiving, picking and dispatch, used to train around 150 new starters a year",
            us: "Wrote 40 standard operating procedures for receiving, picking and dispatch, used to train around 150 new hires a year",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Logistics and Supply Chain Management", us: "Bachelor of Science in Supply Chain Management" },
        org: { uk: "Aston University", us: "Rutgers University" },
        start: "2008-09",
        end: "2011-06",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      { title: "Lean Six Sigma Green Belt", org: { uk: "British Quality Foundation", us: "American Society for Quality" }, end: "2018" },
      {
        title: { uk: "Level 7 Diploma in Strategic Management and Leadership", us: "Certified in Logistics, Transportation and Distribution" },
        org: { uk: "Chartered Management Institute", us: "Association for Supply Chain Management" },
        end: "2021",
      },
    ],
    skills: [
      "Operating budgets",
      "Warehouse operations",
      "Courier contracts",
      "On-time delivery",
      "Returns",
      "Staffing plans",
      "Customer service",
      "Lean Six Sigma",
      "Process improvement",
      "Warehouse management systems",
    ],
    names: ["Joanna", "Fairclough", "Wrenfield", "Coldharbour", "Larkmead", "Secaucus", "Wakefield", "Doncaster"],
    letter: {
      job: {
        title: { uk: "Head of Operations", us: "Director of Operations" },
        employer: "Larkmead Outdoor",
        advert: {
          uk: `Head of Operations
Larkmead Outdoor, Leeds

Larkmead Outdoor sells garden furniture and outdoor living products online, with £90 million in yearly sales and plans to double in 4 years.

The role
You will lead our warehouse, delivery and customer service teams of 200 staff, reporting to the chief executive.

What we are looking for
- Experience leading operations for an online retailer
- A record of cutting the cost per order while improving delivery
- Strong control of an operating budget
- Experience moving or opening a warehouse
- Experience developing managers and team leaders

Salary £95,000 to £105,000, plus bonus`,
          us: `Director of Operations
Larkmead Outdoor, Newark, NJ

Larkmead Outdoor sells patio furniture and outdoor living products online, with $110 million in yearly sales and plans to double in 4 years.

The role
You will lead our warehouse, delivery and customer service teams of 200 employees, reporting to the chief executive officer.

What we are looking for
- Experience leading operations for an online retailer
- A record of cutting the cost per order while improving delivery
- Strong control of an operating budget
- Experience moving or opening a warehouse
- Experience developing managers and team leaders

Salary $165,000 to $185,000, plus bonus`,
        },
      },
      reason: "I want to run operations for a larger online retailer that is growing fast. I also enjoy building teams that fix problems at the source.",
      paragraphs: [
        {
          uk: "I am applying for the role of Head of Operations at Larkmead Outdoor. I want to run operations for a larger online retailer that is growing fast. I also enjoy building teams that fix problems at the source.",
          us: "I am applying for the role of Director of Operations at Larkmead Outdoor. I want to run operations for a larger online retailer that is growing fast. I also enjoy building teams that fix problems at the source.",
        },
        {
          uk: "At Wrenfield Home I lead the warehouse, delivery and customer service teams of an online furniture retailer with £62 million in sales in 2025: 4 managers and 140 staff. I run an operating budget of £9.5 million, finishing within 1% of budget in each of the last 4 years.",
          us: "At Wrenfield Home I lead the warehouse, delivery and customer service teams of an online furniture retailer with $78 million in sales in 2025: 4 managers and 140 staff. I run an operating budget of $12 million, finishing within 1% of budget in each of the last 4 years.",
        },
        {
          uk: "Your advert asks for a record of cutting the cost per order while improving delivery. I cut the cost to pick, pack and deliver an order from £7.40 to £5.90 in 2 years by redesigning pick routes and renegotiating 3 courier contracts. I also raised on-time delivery from 88% to 97% by booking next-day courier collections and adding a late shift in the warehouse.",
          us: "Your advert asks for a record of cutting the cost per order while improving delivery. I cut the cost to pick, pack and deliver an order from $9.30 to $7.40 in 2 years by redesigning pick routes and renegotiating 3 courier contracts. I also raised on-time delivery from 88% to 97% by booking next-day courier collections and adding a late shift in the warehouse.",
        },
        "Your advert also asks for experience moving or opening a warehouse. In 2023 I moved the warehouse to a site twice the size, transferring 18,000 product lines over 3 weekends without stopping dispatch for a day. As operations manager I trained 20 team leaders in Lean Six Sigma, who then ran 35 process improvement projects in 2 years.",
        CLOSE,
      ],
    },
  },
  {
    id: "people-partner",
    industry: "hr",
    role: { uk: "Head of People", us: "Director of People" },
    level: "senior",
    template: "margin-notes",
    blurb: {
      uk: "A head of people who leads HR for a 600-person company, from engagement and pay to a restructure.",
      us: "A director of people who leads HR for a 600-person company, from engagement and pay to a reorganization.",
    },
    person: { name: "Claire Ashdown", email: "claire.ashdown@example.com", phone: { uk: "07700 900629", us: "(646) 555-0155" }, location: { uk: "Bristol", us: "New York, NY" } },
    profile: {
      uk: "Head of people with 14 years in HR, leading a team of 9 for a 600-person facilities services company across 5 sites. Raised employee engagement from 61% to 74% and cut staff turnover from 24% to 15% in 2 years. Led a restructure of 3 regional offices into 2, placing 31 of 38 people at risk in new roles. Chartered Member of the Chartered Institute of Personnel and Development (CIPD), with a master's degree in human resource management.",
      us: "Director of people with 14 years in HR, leading a team of 9 for a 600-person facilities services company across 5 sites. Raised employee engagement from 61% to 74% and cut employee turnover from 24% to 15% in 2 years. Led a reorganization of 3 regional offices into 2, placing 31 of 38 affected people in new roles. Holds the Society for Human Resource Management Senior Certified Professional (SHRM-SCP) credential and a master's degree in human resource management.",
    },
    experience: [
      {
        title: { uk: "Head of People", us: "Director of People" },
        org: "Ravelstone Group",
        location: { uk: "Bristol", us: "New York, NY" },
        start: "2021-01",
        current: true,
        bullets: [
          {
            uk: "Lead HR for a 600-person facilities services company across 5 sites, with a team of 9 and a £1.1 million people budget",
            us: "Lead HR for a 600-person facilities services company across 5 sites, with a team of 9 and a $1.4 million people budget",
          },
          "Raised employee engagement from 61% to 74% in 2 years by acting on survey results with each site's managers every quarter",
          {
            uk: "Led a restructure of 3 regional offices into 2 in 2024, consulting 140 staff and placing 31 of 38 people at risk in new roles",
            us: "Led a reorganization of 3 regional offices into 2 in 2024, briefing 140 employees and placing 31 of 38 affected people in new roles",
          },
          {
            uk: "Introduced a pay framework with 8 bands and published salary ranges, closing the gender pay gap from 14% to 8% in 3 years",
            us: "Introduced a pay structure with 8 bands and published salary ranges, closing the gender pay gap from 14% to 8% in 3 years",
          },
          {
            uk: "Rewrote 24 HR policies in plain English with the employee forum, cutting policy questions to the HR team by 40%",
            us: "Rewrote 24 HR policies in plain English with the employee council, cutting policy questions to the HR team by 40%",
          },
          {
            uk: "Cut staff turnover from 24% to 15% in 2 years through stay interviews, a career framework for each job family and monthly reviews of exit data",
            us: "Cut employee turnover from 24% to 15% in 2 years through stay interviews, a career framework for each job family and monthly reviews of exit data",
          },
        ],
      },
      {
        title: "Senior HR Business Partner",
        org: "Quarrymoor Housing",
        location: { uk: "Bristol", us: "Newark, NJ" },
        start: "2016-04",
        end: "2020-12",
        bullets: [
          "Advised 4 directors on workforce planning, employee relations and organisation design for 350 staff",
          {
            uk: "Managed around 30 employee relations cases a year, settling all but 2 without an employment tribunal claim",
            us: "Managed around 30 employee relations cases a year, settling all but 2 without a lawsuit",
          },
          "Cut average absence from 9.1 to 6.4 days per person a year by training 60 managers to hold return-to-work meetings",
          {
            uk: "Trained 70 managers in employment law over 2 years, from discipline to flexible working requests",
            us: "Trained 70 managers in employment law over 2 years, from discipline to leave requests",
          },
          "Brought in a new HR system with the finance team, moving 350 staff records online and replacing 12 paper forms",
        ],
      },
      {
        title: { uk: "HR Adviser", us: "HR Generalist" },
        org: "Haldon Foods",
        location: { uk: "Exeter", us: "Hartford, CT" },
        start: "2012-09",
        end: "2016-03",
        bullets: [
          "Advised line managers at 2 food factories with 500 staff on discipline, grievance and absence cases",
          "Recruited around 120 production staff a year, cutting time to hire from 6 to 4 weeks",
          {
            uk: "Rewrote the induction pack and ran inductions for every new starter, cutting first-year leavers by 15%",
            us: "Rewrote the orientation pack and ran orientation for every new hire, cutting first-year turnover by 15%",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "MSc Human Resource Management", us: "Master of Science in Human Resource Management" },
        org: { uk: "University of the West of England", us: "New York University" },
        start: "2014-09",
        end: "2016-06",
        grade: { uk: "Merit", us: "GPA 3.8" },
      },
      {
        title: { uk: "BA (Hons) Psychology", us: "Bachelor of Arts in Psychology" },
        org: { uk: "University of Exeter", us: "University of Connecticut" },
        start: "2009-09",
        end: "2012-06",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "Chartered Member (MCIPD)", us: "SHRM Senior Certified Professional (SHRM-SCP)" },
        org: { uk: "Chartered Institute of Personnel and Development", us: "Society for Human Resource Management" },
        end: "2019",
      },
      {
        title: { uk: "Mental Health First Aid Certificate", us: "Certified Compensation Professional" },
        org: { uk: "Mental Health First Aid England", us: "WorldatWork" },
        end: "2023",
      },
    ],
    skills: [
      "Employee engagement",
      { uk: "Pay frameworks", us: "Pay structures" },
      { uk: "Restructuring", us: "Reorganization" },
      "Employee relations",
      "Workforce planning",
      "HR policies",
      "Absence management",
      { uk: "Recruitment", us: "Recruiting" },
      "Gender pay gap",
      "Employment law",
    ],
    names: ["Claire", "Ashdown", "Ravelstone", "Quarrymoor", "Haldon", "Halsey", "WorldatWork", "Exeter"],
    letter: {
      job: {
        title: { uk: "Head of People", us: "Director of People" },
        employer: "Halsey Care",
        advert: {
          uk: `Head of People
Halsey Care, Bath

Halsey Care runs 14 care homes in the South West with 1,100 staff, and is merging with a smaller provider in 2027.

The role
You will lead a people team of 12 and advise the executive team on the merger.

What we are looking for
- Experience leading HR for an organisation of 500 or more staff
- A record of raising engagement and cutting staff turnover
- Experience leading a restructure, including consultation
- Knowledge of pay frameworks and the gender pay gap
- Chartered membership of the CIPD

Salary £78,000 to £86,000`,
          us: `Director of People
Halsey Care, Stamford, CT

Halsey Care runs 14 senior living communities in Connecticut and New York with 1,100 employees, and is merging with a smaller provider in 2027.

The role
You will lead a people team of 12 and advise the executive team on the merger.

What we are looking for
- Experience leading HR for an organization of 500 or more employees
- A record of raising engagement and reducing employee turnover
- Experience leading a reorganization
- Knowledge of pay structures and pay equity
- SHRM-CP or SHRM-SCP certification

Salary $150,000 to $170,000`,
        },
      },
      reason: "I want to lead HR through a merger. I also enjoy helping managers lead their teams well.",
      paragraphs: [
        {
          uk: "I am applying for the role of Head of People at Halsey Care. I want to lead HR through a merger. I also enjoy helping managers lead their teams well.",
          us: "I am applying for the role of Director of People at Halsey Care. I want to lead HR through a merger. I also enjoy helping managers lead their teams well.",
        },
        {
          uk: "At Ravelstone Group I lead HR for a 600-person facilities services company across 5 sites, with a team of 9 and a £1.1 million people budget. Your advert asks for a record of raising engagement and cutting staff turnover. I raised employee engagement from 61% to 74% in 2 years by acting on survey results with each site's managers every quarter. I also cut staff turnover from 24% to 15% in 2 years through stay interviews, a career framework for each job family and monthly reviews of exit data.",
          us: "At Ravelstone Group I lead HR for a 600-person facilities services company across 5 sites, with a team of 9 and a $1.4 million people budget. Your advert asks for a record of raising engagement and reducing employee turnover. I raised employee engagement from 61% to 74% in 2 years by acting on survey results with each site's managers every quarter. I also cut employee turnover from 24% to 15% in 2 years through stay interviews, a career framework for each job family and monthly reviews of exit data.",
        },
        {
          uk: "Your advert also asks for experience leading a restructure, including consultation. I led a restructure of 3 regional offices into 2 in 2024, consulting 140 staff and placing 31 of 38 people at risk in new roles. I also introduced a pay framework with 8 bands and published salary ranges, closing the gender pay gap from 14% to 8% in 3 years.",
          us: "You are also looking for experience leading a reorganization. I led a reorganization of 3 regional offices into 2 in 2024, briefing 140 employees and placing 31 of 38 affected people in new roles. I also introduced a pay structure with 8 bands and published salary ranges, closing the gender pay gap from 14% to 8% in 3 years.",
        },
        {
          uk: "I am a Chartered Member of the Chartered Institute of Personnel and Development (CIPD), and I hold a master's degree in human resource management.",
          us: "I hold the Society for Human Resource Management Senior Certified Professional (SHRM-SCP) credential and a master's degree in human resource management.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "restaurant-manager",
    industry: "hospitality",
    role: { uk: "General Manager", us: "Restaurant General Manager" },
    level: "senior",
    template: "fieldwork",
    blurb: {
      uk: "A general manager who runs a 190-cover restaurant and bar, growing sales while keeping food and labour costs in check.",
      us: "A restaurant general manager who runs a 190-seat restaurant and bar, growing sales while keeping food and labor costs in check.",
    },
    person: { name: "Luca Ferraro", email: "luca.ferraro@example.com", phone: { uk: "07700 900630", us: "(202) 555-0157" }, location: { uk: "Brighton", us: "Washington, DC" } },
    profile: {
      uk: "General manager with 14 years in restaurants, running a 190-cover restaurant and bar with a team of 68 and £4.6 million in yearly sales. Grew sales by 18% in 2 years while bringing food cost down from 31% to 27% and holding labour cost at 29% of sales. Cut staff turnover from 85% to 48% a year and has promoted 11 team members to supervisor or above. Holds a personal licence and a Level 4 award in food safety management.",
      us: "Restaurant general manager with 14 years in restaurants, running a 190-seat restaurant and bar with a team of 68 and $5.8 million in yearly sales. Grew sales by 18% in 2 years while bringing food cost down from 31% to 27% and holding labor cost at 29% of sales. Cut staff turnover from 85% to 48% a year and has promoted 11 team members to supervisor or above. Holds ServSafe Food Protection Manager certification and a District of Columbia alcohol manager's license.",
    },
    experience: [
      {
        title: { uk: "General Manager", us: "Restaurant General Manager" },
        org: "Driftwood Kitchen",
        location: { uk: "Brighton", us: "Washington, DC" },
        start: "2020-02",
        current: true,
        bullets: [
          {
            uk: "Run a 190-cover restaurant and bar with a team of 68, serving 1,900 covers a week and £4.6 million in sales in 2025",
            us: "Run a 190-seat restaurant and bar with a team of 68, serving 1,900 guests a week and $5.8 million in sales in 2025",
          },
          "Grew sales by 18% in 2 years by adding a weekend brunch, a private dining room and a set lunch menu",
          "Cut food cost from 31% to 27% of food sales by costing every dish, ordering against forecasts and cutting waste by a third",
          {
            uk: "Kept labour cost at 29% of sales for 3 years by planning rotas from booking data each week",
            us: "Kept labor cost at 29% of sales for 3 years by planning schedules from reservation data each week",
          },
          {
            uk: "Held a 5-star food hygiene rating through 4 council inspections and scored above 95% in every internal food safety audit",
            us: "Scored above 95% in every internal food safety audit over 6 years, with no critical violations in 4 health department inspections",
          },
          "Cut staff turnover from 85% to 48% a year by paying above the local rate, sharing tips fairly and promoting 11 team members to supervisor or above",
        ],
      },
      {
        title: "Assistant General Manager",
        org: "Sorrel & Rye",
        location: { uk: "London", us: "Arlington, VA" },
        start: "2016-05",
        end: "2020-01",
        bullets: [
          {
            uk: "Ran a 140-cover brasserie in the general manager's absence, with yearly sales of £3.1 million and 50 staff",
            us: "Ran a 140-seat brasserie in the general manager's absence, with yearly sales of $3.9 million and 50 staff",
          },
          {
            uk: "Opened the group's second site in 2018, hiring and training 45 staff in 5 weeks for an on-time launch",
            us: "Opened the group's second restaurant in 2018, hiring and training 45 staff in 5 weeks for an on-time launch",
          },
          {
            uk: "Raised average spend per head from £38 to £44 by training servers in upselling wine and desserts",
            us: "Raised average check per guest from $46 to $54 by training servers in upselling wine and desserts",
          },
          {
            uk: "Introduced a booking system with card deposits for large tables, cutting no-shows from 9% to 4%",
            us: "Introduced a reservation system with card deposits for large parties, cutting no-shows from 9% to 4%",
          },
          "Trained 50 staff a year in allergen handling, with no allergen incidents in 4 years",
        ],
      },
      {
        title: "Restaurant Manager",
        org: "Corrigan's Grill",
        location: { uk: "Lewes", us: "Alexandria, VA" },
        start: "2012-09",
        end: "2016-04",
        bullets: [
          {
            uk: "Managed a 90-cover grill restaurant with a team of 25 and £1.6 million in yearly sales",
            us: "Managed a 90-seat grill restaurant with a team of 25 and $2 million in yearly sales",
          },
          "Raised the restaurant's online review score from 3.9 to 4.6 out of 5 in 18 months by cutting ticket times and retraining hosts",
          {
            uk: "Cut bar stock losses by 30% in a year through weekly counts, tighter stock control and locked storage for spirits",
            us: "Cut bar inventory losses by 30% in a year through weekly counts, tighter inventory control and locked storage for liquor",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) International Hospitality Management", us: "Bachelor of Science in Hospitality and Tourism Management" },
        org: { uk: "Oxford Brookes University", us: "Virginia Tech" },
        start: "2009-09",
        end: "2012-06",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 4 Award in Food Safety Management", us: "ServSafe Food Protection Manager Certification" },
        org: { uk: "Highfield Qualifications", us: "National Restaurant Association" },
        end: "2022",
      },
      {
        title: { uk: "Personal Licence", us: "Alcoholic Beverage Control Manager's License" },
        org: { uk: "Brighton and Hove City Council", us: "District of Columbia Alcoholic Beverage and Cannabis Administration" },
        end: "2013",
      },
    ],
    skills: [
      "Food safety",
      "Food cost",
      "Labour costs",
      { uk: "Rota planning", us: "Scheduling" },
      { uk: "Stock control", us: "Inventory control" },
      "Upselling",
      "Private dining",
      "Allergen handling",
      "Staff training",
      { uk: "Site openings", us: "Restaurant openings" },
    ],
    languages: [{ name: "Italian", level: "Fluent" }],
    names: ["Luca", "Ferraro", "Driftwood", "Sorrel", "Corrigan", "Ember", "Lewes", "Hove", "Brookes", "Highfield", "ServSafe"],
    letter: {
      job: {
        title: { uk: "General Manager", us: "Restaurant General Manager" },
        employer: "Ember and Vine",
        advert: {
          uk: `General Manager
Ember and Vine, Brighton

Ember and Vine is opening its second restaurant, a 240-cover site on the seafront, in spring 2027.

The role
You will open and run the new site, leading a team of 80 and reporting to the operations director.

What we are looking for
- Experience running a restaurant with sales of over £4 million
- A record of growing sales while controlling food and labour costs
- Strong food safety standards and a personal licence
- Experience opening a new site and training a team
- Experience developing supervisors and managers

Salary £58,000 to £64,000, plus bonus`,
          us: `Restaurant General Manager
Ember and Vine, Washington, DC

Ember and Vine is opening its second restaurant, a 240-seat location on the waterfront, in spring 2027.

The role
You will open and run the new restaurant, leading a team of 80 and reporting to the director of operations.

What we are looking for
- Experience running a restaurant with sales of over $5 million
- A record of growing sales while controlling food and labor costs
- Strong food safety standards and ServSafe certification
- Experience opening a new restaurant and training a team
- Experience developing supervisors and managers

Salary $95,000 to $110,000, plus bonus`,
        },
      },
      reason: "I want to run a bigger restaurant with a larger team. I also enjoy opening new restaurants and training the people who run them.",
      paragraphs: [
        {
          uk: "I am applying for the role of General Manager at Ember and Vine. I want to run a bigger restaurant with a larger team. I also enjoy opening new restaurants and training the people who run them.",
          us: "I am applying for the role of Restaurant General Manager at Ember and Vine. I want to run a bigger restaurant with a larger team. I also enjoy opening new restaurants and training the people who run them.",
        },
        {
          uk: "At Driftwood Kitchen I run a 190-cover restaurant and bar with a team of 68, serving 1,900 covers a week and £4.6 million in sales in 2025. Your advert asks for a record of growing sales while controlling food and labour costs. I grew sales by 18% in 2 years by adding a weekend brunch, a private dining room and a set lunch menu. I also cut food cost from 31% to 27% of food sales by costing every dish, ordering against forecasts and cutting waste by a third.",
          us: "At Driftwood Kitchen I run a 190-seat restaurant and bar with a team of 68, serving 1,900 guests a week and $5.8 million in sales in 2025. Your advert asks for a record of growing sales while controlling food and labor costs. I grew sales by 18% in 2 years by adding a weekend brunch, a private dining room and a set lunch menu. I also cut food cost from 31% to 27% of food sales by costing every dish, ordering against forecasts and cutting waste by a third.",
        },
        {
          uk: "Your advert also asks for experience opening a new site and training a team. As assistant general manager at Sorrel & Rye I opened the group's second site in 2018, hiring and training 45 staff in 5 weeks for an on-time launch. At Driftwood Kitchen I have promoted 11 team members to supervisor or above.",
          us: "You are also looking for experience opening a new restaurant and training a team. As assistant general manager at Sorrel & Rye I opened the group's second restaurant in 2018, hiring and training 45 staff in 5 weeks for an on-time launch. At Driftwood Kitchen I have promoted 11 team members to supervisor or above.",
        },
        {
          uk: "I held a 5-star food hygiene rating through 4 council inspections and scored above 95% in every internal food safety audit. I hold a personal licence and a Level 4 award in food safety management.",
          us: "I scored above 95% in every internal food safety audit over 6 years, with no critical violations in 4 health department inspections. I hold ServSafe Food Protection Manager certification and a District of Columbia alcohol manager's license.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "brand-manager",
    industry: "marketing",
    role: { uk: "Head of Brand", us: "Director of Brand" },
    level: "senior",
    template: "harbour",
    blurb: {
      uk: "A head of brand at a soft drinks company who led a full brand relaunch, its agencies and its national campaigns.",
      us: "A director of brand at a beverage company who led a full brand relaunch, its agencies and its national campaigns.",
    },
    person: { name: "Sasha Merriman", email: "sasha.merriman@example.com", phone: { uk: "07700 900631", us: "(305) 555-0158" }, location: { uk: "London", us: "Miami, FL" } },
    profile: {
      uk: "Head of brand with 14 years in consumer goods marketing, leading brand strategy for a £140 million soft drinks company with a team of 7. Led a full brand relaunch in 2023, then grew sales by 22% in the year after it against 6% growth in the category. Raised brand awareness from 34% to 51% in 2 years and cut agency fees by £600,000 a year after a pitch. Holds the Chartered Institute of Marketing Professional Diploma in Marketing.",
      us: "Director of brand with 14 years in consumer goods marketing, leading brand strategy for a $175 million beverage company with a team of 7. Led a full brand relaunch in 2023, then grew sales by 22% in the year after it against 6% growth in the category. Raised brand awareness from 34% to 51% in 2 years and cut agency fees by $750,000 a year after an agency review. Holds the American Marketing Association Professional Certified Marketer credential.",
    },
    experience: [
      {
        title: { uk: "Head of Brand", us: "Director of Brand" },
        org: "Brightspring Drinks",
        location: { uk: "London", us: "Miami, FL" },
        start: "2021-03",
        current: true,
        bullets: [
          {
            uk: "Lead brand strategy for a soft drinks company with £140 million in sales, with a team of 7 and an £8 million media and agency budget",
            us: "Lead brand strategy for a beverage company with $175 million in sales, with a team of 7 and a $10 million media and agency budget",
          },
          "Led a full brand relaunch in 2023, from research with 3,000 shoppers to new positioning, packaging and logo across 40 products in 9 months",
          "Raised brand awareness from 34% to 51% in 2 years, measured by quarterly tracking with 1,000 shoppers",
          {
            uk: "Grew sales by 22% in the year after the relaunch, against 6% growth in the soft drinks category",
            us: "Grew sales by 22% in the year after the relaunch, against 6% growth in the beverage category",
          },
          "Launched 6 national campaigns across TV, outdoor and social media, with the summer 2024 campaign lifting sales by 14% in 8 weeks",
          {
            uk: "Ran a pitch for the creative and media agencies in 2022, appointing 2 new agencies and cutting fees by £600,000 a year",
            us: "Ran a review of the creative and media agencies in 2022, appointing 2 new agencies and cutting fees by $750,000 a year",
          },
        ],
      },
      {
        title: "Senior Brand Manager",
        org: "Hambleton Foods",
        location: { uk: "Leicester", us: "Fort Lauderdale, FL" },
        start: "2016-06",
        end: "2021-02",
        bullets: [
          {
            uk: "Managed 3 snack brands with a team of 2 brand managers and £65 million in yearly sales",
            us: "Managed 3 snack brands with a team of 2 brand managers and $80 million in yearly sales",
          },
          {
            uk: "Led the repositioning of the main crisp brand around simple ingredients, lifting its sales by 15% in 18 months",
            us: "Led the repositioning of the main chip brand around simple ingredients, lifting its sales by 15% in 18 months",
          },
          "Launched 12 new products in 4 years, with 9 still on shelves after 2 years",
          {
            uk: "Cut packaging costs by 8% by moving 3 ranges to recyclable paper packs with the buying team",
            us: "Cut packaging costs by 8% by moving 3 product lines to recyclable paper packs with the purchasing team",
          },
          "Wrote brand guidelines for all 3 brands, used by 4 agencies and 30 marketers across the company",
        ],
      },
      {
        title: "Brand Manager",
        org: "Clearbrook Household",
        location: { uk: "Manchester", us: "Orlando, FL" },
        start: "2012-09",
        end: "2016-05",
        bullets: [
          {
            uk: "Ran the brand plan for a household cleaning range with £20 million in sales in 2015",
            us: "Ran the brand plan for a household cleaning range with $25 million in sales in 2015",
          },
          "Planned in-store promotions with the sales team, lifting promoted sales by 11% while cutting discount spend by 9%",
          "Briefed and managed 2 agencies on around 20 projects a year, from packaging to in-store displays",
          "Tested 3 new pack designs with 600 shoppers before launch, choosing the one that lifted purchase intent by 12%",
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Marketing", us: "Bachelor of Business Administration in Marketing" },
        org: { uk: "University of Leeds", us: "University of Florida" },
        start: "2009-09",
        end: "2012-06",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "Professional Diploma in Marketing", us: "Professional Certified Marketer" },
        org: { uk: "Chartered Institute of Marketing", us: "American Marketing Association" },
        end: "2015",
      },
    ],
    skills: ["Brand strategy", "Positioning", "Brand relaunches", "Brand tracking", "National campaigns", "Agency management", "Packaging", "Product launches", "Media budgets", "Shopper research"],
    names: ["Sasha", "Merriman", "Brightspring", "Hambleton", "Clearbrook", "Roastwell", "Lauderdale"],
    letter: {
      job: {
        title: { uk: "Head of Brand", us: "Director of Brand" },
        employer: "Roastwell Coffee",
        advert: {
          uk: `Head of Brand
Roastwell Coffee, London

Roastwell Coffee makes coffee pods and ground coffee sold in 4,000 shops, with £210 million in yearly sales.

The role
You will lead our brand team of 9 and our creative and media agencies, reporting to the marketing director.

What we are looking for
- Experience leading a consumer brand through a relaunch
- A record of building brand awareness and sales
- Experience running national campaigns across TV, outdoor and social media
- Experience managing agencies and a large media budget
- A Chartered Institute of Marketing qualification is desirable

Salary £95,000 to £110,000, plus bonus`,
          us: `Director of Brand
Roastwell Coffee, Miami, FL

Roastwell Coffee makes coffee pods and ground coffee sold in 4,000 stores, with $260 million in yearly sales.

The role
You will lead our brand team of 9 and our creative and media agencies, reporting to the chief marketing officer.

What we are looking for
- Experience leading a consumer brand through a relaunch
- A record of building brand awareness and sales
- Experience running national campaigns across TV, outdoor and social media
- Experience managing agencies and a large media budget
- A marketing degree or professional certification is desirable

Salary $170,000 to $195,000, plus bonus`,
        },
      },
      reason: "I want to lead a bigger brand with a larger team. I also enjoy working with creative agencies on campaigns that sell.",
      paragraphs: [
        {
          uk: "I am applying for the role of Head of Brand at Roastwell Coffee. I want to lead a bigger brand with a larger team. I also enjoy working with creative agencies on campaigns that sell.",
          us: "I am applying for the role of Director of Brand at Roastwell Coffee. I want to lead a bigger brand with a larger team. I also enjoy working with creative agencies on campaigns that sell.",
        },
        {
          uk: "At Brightspring Drinks I lead brand strategy for a soft drinks company with £140 million in sales, with a team of 7 and an £8 million media and agency budget. Your advert asks for experience leading a consumer brand through a relaunch. I led a full brand relaunch in 2023, from research with 3,000 shoppers to new positioning, packaging and logo across 40 products in 9 months. I then grew sales by 22% in the year after the relaunch, against 6% growth in the soft drinks category.",
          us: "At Brightspring Drinks I lead brand strategy for a beverage company with $175 million in sales, with a team of 7 and a $10 million media and agency budget. Your advert asks for experience leading a consumer brand through a relaunch. I led a full brand relaunch in 2023, from research with 3,000 shoppers to new positioning, packaging and logo across 40 products in 9 months. I then grew sales by 22% in the year after the relaunch, against 6% growth in the beverage category.",
        },
        "Your advert also asks for a record of building brand awareness and sales. I raised brand awareness from 34% to 51% in 2 years, measured by quarterly tracking with 1,000 shoppers. I launched 6 national campaigns across TV, outdoor and social media, with the summer 2024 campaign lifting sales by 14% in 8 weeks.",
        {
          uk: "I ran a pitch for the creative and media agencies in 2022, appointing 2 new agencies and cutting fees by £600,000 a year. I hold the Chartered Institute of Marketing Professional Diploma in Marketing.",
          us: "I ran a review of the creative and media agencies in 2022, appointing 2 new agencies and cutting fees by $750,000 a year. I hold the American Marketing Association Professional Certified Marketer credential.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "civil-engineer",
    industry: "engineering",
    role: { uk: "Principal Civil Engineer", us: "Senior Civil Engineer" },
    level: "senior",
    template: "chronicle",
    blurb: {
      uk: "A chartered principal civil engineer who leads a team designing highway, drainage and flood schemes.",
      us: "A licensed senior civil engineer who leads a team designing roadway, drainage and flood control projects.",
    },
    person: { name: "Adrian Halloran", email: "adrian.halloran@example.com", phone: { uk: "07700 900632", us: "(407) 555-0159" }, location: { uk: "Birmingham", us: "Orlando, FL" } },
    profile: {
      uk: "Chartered civil engineer with 16 years in highway and drainage design, leading a team of 11 engineers and technicians at a consultancy. Led the design of a £32 million bypass with 3 bridges, saving £1.4 million on earthworks by redesigning the road levels. Has delivered 14 highway and drainage schemes worth £85 million since 2019 and mentored 5 graduates to chartered membership. Chartered Engineer through the Institution of Civil Engineers (ICE), with a master's degree in civil engineering.",
      us: "Licensed Professional Engineer (PE) with 16 years in roadway and drainage design, leading a team of 11 engineers and designers at a consulting firm. Led the design of a $40 million bypass with 3 bridges, saving $1.8 million on earthwork by redesigning the road profile. Has delivered 14 roadway and drainage projects worth $110 million since 2019 and mentored 5 engineers in training to their PE licenses. Licensed in Florida, with an Occupational Safety and Health Administration (OSHA) 30-Hour card.",
    },
    experience: [
      {
        title: { uk: "Principal Civil Engineer", us: "Senior Civil Engineer" },
        org: "Kingswell Engineering",
        location: { uk: "Birmingham", us: "Orlando, FL" },
        start: "2019-05",
        current: true,
        bullets: [
          {
            uk: "Lead a design team of 11 engineers and technicians, delivering 14 highway and drainage schemes worth £85 million in construction in 7 years",
            us: "Lead a design team of 11 engineers and designers, delivering 14 roadway and drainage projects worth $110 million in construction in 7 years",
          },
          {
            uk: "Led the design of a £32 million, 4.2-kilometre bypass with 3 bridges in 18 months, issuing construction drawings 6 weeks ahead of programme",
            us: "Led the design of a $40 million, 2.6-mile bypass with 3 bridges in 18 months, issuing construction plans 6 weeks ahead of schedule",
          },
          {
            uk: "Cut the bypass's earthworks cost by £1.4 million by redesigning the road levels to balance cut and fill on site",
            us: "Cut the bypass's earthwork cost by $1.8 million by redesigning the road profile to balance cut and fill on site",
          },
          {
            uk: "Designed sustainable drainage for a 600-home development in 2022, holding runoff to greenfield rates, approved by the council at first submission",
            us: "Designed storm water management for a 600-home subdivision in 2022, holding runoff to pre-development rates, approved by the county at first submission",
          },
          {
            uk: "Checked and signed off designs from 4 junior engineers each month, with no design errors reaching site in 3 years",
            us: "Checked and approved designs from 4 junior engineers each month, with no design errors reaching construction in 3 years",
          },
          {
            uk: "Mentored 5 graduate engineers to chartered membership of the Institution of Civil Engineers (ICE) over 4 years",
            us: "Mentored 5 engineers in training to their Professional Engineer (PE) licenses over 4 years",
          },
        ],
      },
      {
        title: { uk: "Senior Civil Engineer", us: "Project Engineer" },
        org: "Brackenfield Consulting",
        location: { uk: "Coventry", us: "Tampa, FL" },
        start: "2014-08",
        end: "2019-04",
        bullets: [
          {
            uk: "Designed junction upgrades on 6 trunk road schemes for 2 county councils, worth £40 million over 5 years",
            us: "Designed interchange upgrades on 6 state highway projects for 2 counties, worth $50 million over 5 years",
          },
          {
            uk: "Ran the design of a £9 million flood scheme protecting 420 homes in 3 years, from feasibility to tender",
            us: "Ran the design of a $12 million flood control project protecting 420 homes in 3 years, from feasibility to bid",
          },
          "Cut design hours on drainage models by 30% by building standard templates in Civil 3D and training 12 colleagues",
          {
            uk: "Wrote designer's risk assessments for 25 schemes a year under the Construction (Design and Management) Regulations 2015",
            us: "Wrote safety and design risk reviews for 25 projects a year, flagging site hazards before each bid",
          },
          {
            uk: "Presented 3 schemes at 15 public exhibitions, changing 2 junction designs after residents' feedback on access",
            us: "Presented 3 projects at 15 public meetings, changing 2 interchange designs after residents' feedback on access",
          },
        ],
      },
      {
        title: "Civil Engineer",
        org: "Brackenfield Consulting",
        location: { uk: "Coventry", us: "Tampa, FL" },
        start: "2010-09",
        end: "2014-07",
        bullets: [
          "Designed drainage and road layouts for 30 housing and retail sites using computer-aided design",
          {
            uk: "Supervised works on a £14 million road scheme as resident engineer over 18 months, checking quality against the drawings",
            us: "Inspected construction of an $18 million road project as resident engineer over 18 months, checking quality against the plans",
          },
          {
            uk: "Completed the Institution of Civil Engineers training scheme in 4 years, logging site and design experience on 12 schemes",
            us: "Passed the Fundamentals of Engineering (FE) exam in 2010 and logged 4 years of supervised design and site experience",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "Master of Engineering (Hons) in Civil Engineering", us: "Bachelor of Science in Civil Engineering" },
        org: { uk: "University of Birmingham", us: "University of Central Florida" },
        start: "2006-09",
        end: "2010-06",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "Chartered Engineer", us: "Professional Engineer License, Florida" },
        org: { uk: "Institution of Civil Engineers", us: "Florida Board of Professional Engineers" },
        end: "2015",
      },
      {
        title: { uk: "Professionally Qualified Person Card", us: "OSHA 30-Hour Construction" },
        org: { uk: "Construction Skills Certification Scheme", us: "Occupational Safety and Health Administration" },
        end: "2024",
      },
    ],
    skills: [
      { uk: "Highway design", us: "Roadway design" },
      "Drainage design",
      { uk: "Sustainable drainage", us: "Storm water management" },
      { uk: "Flood schemes", us: "Flood control" },
      { uk: "Earthworks", us: "Earthwork" },
      "Civil 3D",
      "Computer-aided design",
      "Design checks",
      { uk: "Design risk assessments", us: "Safety reviews" },
      "Mentoring",
    ],
    names: ["Adrian", "Halloran", "Kingswell", "Brackenfield", "Westerleigh"],
    letter: {
      job: {
        title: { uk: "Principal Civil Engineer, Highways and Drainage", us: "Senior Civil Engineer, Transportation and Drainage" },
        employer: "Westerleigh Infrastructure",
        advert: {
          uk: `Principal Civil Engineer, Highways and Drainage
Westerleigh Infrastructure, Birmingham (hybrid)

Westerleigh Infrastructure designs road, rail and flood schemes for councils across the Midlands.

The role
You will lead a team of 12 engineers on highway and drainage schemes, from feasibility to construction.

What we are looking for
- Chartered Engineer with the Institution of Civil Engineers
- Experience leading the design of major highway schemes
- Experience in drainage and flood schemes
- Experience leading and developing a design team
- Experience in Civil 3D

Salary £68,000 to £76,000`,
          us: `Senior Civil Engineer, Transportation and Drainage
Westerleigh Infrastructure, Orlando, FL (hybrid)

Westerleigh Infrastructure designs roadway, transit and flood control projects for cities and counties across Central Florida.

The role
You will lead a team of 12 engineers on roadway and drainage projects, from feasibility to construction.

What we are looking for
- Professional Engineer (PE) license in Florida
- Experience leading the design of major roadway projects
- Experience in drainage and storm water management
- Experience leading and developing a design team
- Experience in Civil 3D

Salary $125,000 to $145,000`,
        },
      },
      reason: {
        uk: "I want to lead a bigger design team on larger highway and flood schemes. I also enjoy mentoring graduate engineers.",
        us: "I want to lead a bigger design team on larger roadway and flood control projects. I also enjoy mentoring young engineers.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Principal Civil Engineer, Highways and Drainage at Westerleigh Infrastructure. I want to lead a bigger design team on larger highway and flood schemes. I also enjoy mentoring graduate engineers.",
          us: "I am applying for the role of Senior Civil Engineer, Transportation and Drainage at Westerleigh Infrastructure. I want to lead a bigger design team on larger roadway and flood control projects. I also enjoy mentoring young engineers.",
        },
        {
          uk: "At Kingswell Engineering I lead a design team of 11 engineers and technicians, delivering 14 highway and drainage schemes worth £85 million in construction in 7 years. Your advert asks for experience leading the design of major highway schemes. I led the design of a £32 million, 4.2-kilometre bypass with 3 bridges in 18 months, issuing construction drawings 6 weeks ahead of programme. I also cut the bypass's earthworks cost by £1.4 million by redesigning the road levels to balance cut and fill on site.",
          us: "At Kingswell Engineering I lead a design team of 11 engineers and designers, delivering 14 roadway and drainage projects worth $110 million in construction in 7 years. Your advert asks for experience leading the design of major roadway projects. I led the design of a $40 million, 2.6-mile bypass with 3 bridges in 18 months, issuing construction plans 6 weeks ahead of schedule. I also cut the bypass's earthwork cost by $1.8 million by redesigning the road profile to balance cut and fill on site.",
        },
        {
          uk: "Your advert also asks for experience in drainage and flood schemes. At Brackenfield Consulting I ran the design of a £9 million flood scheme protecting 420 homes in 3 years, from feasibility to tender. I also cut design hours on drainage models by 30% by building standard templates in Civil 3D and training 12 colleagues.",
          us: "Your advert also asks for experience in drainage and storm water management. At Brackenfield Consulting I ran the design of a $12 million flood control project protecting 420 homes in 3 years, from feasibility to bid. I also cut design hours on drainage models by 30% by building standard templates in Civil 3D and training 12 colleagues.",
        },
        {
          uk: "I check and sign off designs from 4 junior engineers each month, with no design errors reaching site in 3 years. I mentored 5 graduate engineers to chartered membership of the Institution of Civil Engineers (ICE) over 4 years, and I am a Chartered Engineer.",
          us: "I check and approve designs from 4 junior engineers each month, with no design errors reaching construction in 3 years. I mentored 5 engineers in training to their Professional Engineer (PE) licenses over 4 years, and I am licensed in Florida.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "lecturer",
    industry: "education",
    role: { uk: "Senior Lecturer", us: "Associate Professor" },
    level: "senior",
    template: "research",
    blurb: {
      uk: "A senior lecturer in environmental science who leads modules and a master's programme, wins research funding and supervises PhD students.",
      us: "A tenured associate professor of environmental science who teaches, directs a master's program, wins research funding and advises doctoral students.",
    },
    person: { name: "Eleanor Marsh", email: "eleanor.marsh@example.com", phone: { uk: "07700 900633", us: "(713) 555-0160" }, location: { uk: "Sheffield", us: "Houston, TX" } },
    profile: {
      uk: "Senior lecturer in environmental science with 15 years in university teaching and research on water quality and catchment management. Leads teaching on 3 undergraduate modules and the MSc Environmental Management programme, which grew from 28 to 45 students in 3 years. Has won £1.2 million in research funding as principal investigator, published 22 peer-reviewed journal articles and led the supervision of 7 PhD students to completion. Senior Fellow of the Higher Education Academy, with a Postgraduate Certificate in Higher Education.",
      us: "Tenured associate professor of environmental science with 15 years in university teaching and research on water quality and watershed management. Teaches 3 undergraduate courses and directs the Master of Science in Environmental Management program, which grew from 28 to 45 students in 3 years. Has won $1.5 million in research funding as principal investigator, published 22 peer-reviewed journal articles and advised 7 doctoral students to completion. Holds a certificate in college teaching and is a Certified Floodplain Manager.",
    },
    experience: [
      {
        title: { uk: "Senior Lecturer in Environmental Science", us: "Associate Professor of Environmental Science" },
        org: "Thornleigh University",
        location: { uk: "Sheffield", us: "Houston, TX" },
        start: "2019-09",
        current: true,
        bullets: [
          {
            uk: "Lead teaching on 3 undergraduate modules for 180 students a year, raising module satisfaction from 78% to 91% by adding fieldwork and weekly data labs",
            us: "Teach 3 undergraduate courses for 180 students a year, raising average course evaluations from 4.1 to 4.6 out of 5 by adding fieldwork and weekly data labs",
          },
          {
            uk: "Lead the MSc Environmental Management programme, growing intake from 28 to 45 students in 3 years through placements with 6 employers",
            us: "Direct the Master of Science in Environmental Management program, growing enrollment from 28 to 45 students in 3 years through internships with 6 employers",
          },
          {
            uk: "Won £1.2 million in research funding as principal investigator over 6 years, from 4 funding bodies including the Natural Environment Research Council",
            us: "Won $1.5 million in research funding as principal investigator over 6 years, from 4 funding agencies including the National Science Foundation",
          },
          "Published 22 peer-reviewed journal articles since 2014, 9 as lead author, cited 1,400 times in total",
          {
            uk: "Led the supervision of 7 PhD students to completion, all passing their viva with minor or no corrections",
            us: "Advised 7 doctoral students to completion as committee chair, all graduating within 5 years",
          },
          {
            uk: "Led a 3-year study of farm runoff with 60 farms in 4 river catchments, which the regional water company used to target £2 million of grants",
            us: "Led a 3-year study of farm runoff with 60 farms in 4 watersheds, which the regional water authority used to target $2.5 million of grants",
          },
        ],
      },
      {
        title: { uk: "Lecturer in Environmental Science", us: "Assistant Professor of Environmental Science" },
        org: "Thornleigh University",
        location: { uk: "Sheffield", us: "Houston, TX" },
        start: "2014-09",
        end: "2019-08",
        bullets: [
          {
            uk: "Designed and led 2 new modules on water quality and field methods, taken by 300 students over 5 years",
            us: "Designed and taught 2 new courses on water quality and field methods, taken by 300 students over 5 years",
          },
          {
            uk: "Tutored 30 first-year students a year, cutting first-year withdrawals from 9% to 5% through fortnightly check-ins",
            us: "Advised 30 first-year students a year, cutting first-year withdrawals from 9% to 5% through check-ins every 2 weeks",
          },
          {
            uk: "Wrote and won a £240,000 early career grant in 2016 to set up a river monitoring lab with 12 sensors",
            us: "Wrote and won a $300,000 early career grant in 2016 to set up a river monitoring lab with 12 sensors",
          },
          {
            uk: "Co-supervised 4 PhD students to completion and supervised 25 master's dissertations",
            us: "Served on 4 PhD committees and supervised 25 master's theses",
          },
          {
            uk: "Ran undergraduate admissions for the department for 2 years, raising applications by 25% through new open day field trips",
            us: "Led undergraduate recruitment for the department for 2 years, raising applications by 25% through new campus visit field trips",
          },
        ],
      },
      {
        title: "Postdoctoral Research Associate",
        org: "Bramblegate University",
        location: { uk: "Lancaster", us: "Austin, TX" },
        start: "2011-10",
        end: "2014-08",
        bullets: [
          "Ran field sampling at 40 river sites every month for a 3-year study of nitrate pollution",
          "Built a water quality model in Python that cut the team's analysis time from 2 weeks to 2 days",
          "Co-wrote 6 journal papers and presented the project's findings at 4 international conferences",
        ],
      },
    ],
    education: [
      {
        title: { uk: "PhD Environmental Science", us: "Doctor of Philosophy in Environmental Science" },
        org: { uk: "Lancaster University", us: "University of Texas at Austin" },
        start: "2007-10",
        end: "2011-09",
      },
      {
        title: { uk: "BSc (Hons) Geography", us: "Bachelor of Science in Geography" },
        org: { uk: "Durham University", us: "University of Houston" },
        start: "2004-09",
        end: "2007-06",
        grade: { uk: "First", us: "GPA 3.8" },
      },
    ],
    certificates: [
      {
        title: { uk: "Postgraduate Certificate in Higher Education", us: "Certificate in College Teaching" },
        org: "Thornleigh University",
        end: "2016",
      },
      {
        title: { uk: "Senior Fellow of the Higher Education Academy", us: "Certified Floodplain Manager" },
        org: { uk: "Advance HE", us: "Association of State Floodplain Managers" },
        end: "2021",
      },
    ],
    skills: [
      "Undergraduate teaching",
      "Fieldwork",
      "Research funding",
      "Grant writing",
      "Journal articles",
      { uk: "PhD supervision", us: "Doctoral advising" },
      "Water quality",
      { uk: "Catchment management", us: "Watershed management" },
      "Field sampling",
      "Python",
    ],
    names: ["Thornleigh", "Bramblegate", "Marchbank"],
    letter: {
      job: {
        title: { uk: "Senior Lecturer in Environmental Science", us: "Associate Professor of Environmental Science" },
        employer: "Marchbank University",
        advert: {
          uk: `Senior Lecturer in Environmental Science
Marchbank University, Department of Geography and Environment, York

We are growing our water research group and our taught programmes in environmental science.

The role
You will teach undergraduate and master's modules, lead a programme, supervise PhD students and lead research on freshwater systems.

What we are looking for
- A PhD in environmental science or a related subject
- A record of teaching and module leadership in higher education
- A strong record of research funding and peer-reviewed journal articles
- Experience supervising PhD students to completion
- Fellowship or Senior Fellowship of the Higher Education Academy

Salary £58,000 to £66,000`,
          us: `Associate Professor of Environmental Science (tenured)
Marchbank University, Department of Earth and Environmental Sciences, Austin, TX

We are growing our water research group and our graduate programs in environmental science.

The role
You will teach undergraduate and graduate courses, direct a graduate program, advise PhD students and lead research on freshwater systems.

What we are looking for
- A PhD in environmental science or a related field
- A record of strong teaching at the university level
- A strong record of external research funding and peer-reviewed journal articles
- Experience advising PhD students to completion
- Tenure at the rank of associate professor, or a record that meets it

Salary $105,000 to $125,000 for a 9-month appointment`,
        },
      },
      reason: {
        uk: "I want to lead research on freshwater systems in a growing water research group. I also enjoy building taught programmes that prepare students for work.",
        us: "I want to lead research on freshwater systems in a growing water research group. I also enjoy building graduate programs that prepare students for work.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Senior Lecturer in Environmental Science at Marchbank University. I want to lead research on freshwater systems in a growing water research group. I also enjoy building taught programmes that prepare students for work.",
          us: "I am applying for the role of Associate Professor of Environmental Science at Marchbank University. I want to lead research on freshwater systems in a growing water research group. I also enjoy building graduate programs that prepare students for work.",
        },
        {
          uk: "At Thornleigh University I lead teaching on 3 undergraduate modules for 180 students a year, raising module satisfaction from 78% to 91% by adding fieldwork and weekly data labs. I also lead the MSc Environmental Management programme, growing intake from 28 to 45 students in 3 years through placements with 6 employers.",
          us: "At Thornleigh University I teach 3 undergraduate courses for 180 students a year, raising average course evaluations from 4.1 to 4.6 out of 5 by adding fieldwork and weekly data labs. I also direct the Master of Science in Environmental Management program, growing enrollment from 28 to 45 students in 3 years through internships with 6 employers.",
        },
        {
          uk: "Your advert asks for a strong record of research funding and peer-reviewed journal articles. I have won £1.2 million in research funding as principal investigator over 6 years, from 4 funding bodies including the Natural Environment Research Council. I have published 22 peer-reviewed journal articles since 2014, 9 as lead author, cited 1,400 times in total. I also led a 3-year study of farm runoff with 60 farms in 4 river catchments, which the regional water company used to target £2 million of grants.",
          us: "Your advert asks for a strong record of external research funding and peer-reviewed journal articles. I have won $1.5 million in research funding as principal investigator over 6 years, from 4 funding agencies including the National Science Foundation. I have published 22 peer-reviewed journal articles since 2014, 9 as lead author, cited 1,400 times in total. I also led a 3-year study of farm runoff with 60 farms in 4 watersheds, which the regional water authority used to target $2.5 million of grants.",
        },
        {
          uk: "I led the supervision of 7 PhD students to completion, all passing their viva with minor or no corrections. I am a Senior Fellow of the Higher Education Academy, and I hold a Postgraduate Certificate in Higher Education.",
          us: "I advised 7 doctoral students to completion as committee chair, all graduating within 5 years. I am a tenured associate professor, and I hold a certificate in college teaching.",
        },
        CLOSE,
      ],
    },
  },
];
