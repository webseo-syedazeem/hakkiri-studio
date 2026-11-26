import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/**
 * Work with people: care, teaching, HR, a store and a kitchen. UK versions
 * carry the UK's own checks and qualifications (the Care Certificate, an
 * enhanced DBS check, Qualified Teacher Status, CIPD, a Level 3 food safety
 * award); US versions carry state licences and US credentials (a home health
 * aide certificate, a state teaching license, SHRM, ServSafe).
 */
export const INDUSTRY_PEOPLE: ExampleSpec[] = [
  {
    id: "care-worker",
    industry: "care",
    role: { uk: "Care Worker", us: "Caregiver" },
    level: "early",
    template: "minimal",
    blurb: {
      uk: "A home care worker with nearly three years caring for older people, including people living with dementia.",
      us: "A home caregiver with nearly three years caring for older adults, including people living with dementia.",
    },
    person: { name: "Abena Mensah", email: "abena.mensah@example.com", phone: { uk: "07700 900101", us: "(614) 555-0100" }, location: { uk: "Nottingham", us: "Columbus, OH" } },
    profile: {
      uk: "Care worker with nearly three years in home care and residential care for older people, including people living with dementia. Visits 8 to 10 clients a day, giving personal care, meals and medication support in line with each care plan. Holds the Care Certificate, an enhanced DBS check and a full UK driving licence, and is working towards a Level 3 Diploma in Adult Care.",
      us: "Caregiver with nearly three years in home care and memory care for older adults, including people living with dementia. Visits 3 to 4 clients a day, providing personal care, meals and medication reminders in line with each care plan. Certified home health aide with a clean background check and a valid Ohio driver's license, studying part-time for an associate degree in nursing.",
    },
    experience: [
      {
        title: { uk: "Care Worker", us: "Caregiver" },
        org: "Willowbank Home Care",
        location: { uk: "Nottingham", us: "Columbus, OH" },
        start: "2025-01",
        current: true,
        bullets: [
          {
            uk: "Visit 8 to 10 clients a day in their own homes, giving personal care, meals and medication support in line with each care plan",
            us: "Visit 3 to 4 clients a day in their homes, providing personal care, meals and medication reminders in line with each care plan",
          },
          {
            uk: "Care for 4 clients with dementia using life story work, cutting distressed calls from weekly to monthly",
            us: "Care for 4 clients with dementia using memory books, cutting distressed calls from weekly to monthly",
          },
          {
            uk: "Raise 2 to 3 health concerns a month with the office, leading to earlier GP or district nurse visits",
            us: "Raise 2 to 3 health concerns a month with the office, leading to earlier nurse or doctor visits",
          },
          {
            uk: "Keep clear records of each visit and medicine in the care app, with no gaps in 18 months of audits",
            us: "Keep clear records of each visit in the care app, with no gaps in 18 months of monthly audits",
          },
          {
            uk: "Reported 3 safeguarding concerns, each logged the same day and referred to the local authority",
            us: "Reported 3 cases of suspected neglect the same day, each referred to Adult Protective Services",
          },
        ],
      },
      {
        title: { uk: "Care Assistant", us: "Memory Care Aide" },
        org: { uk: "Elmhurst House Care Home", us: "Elmhurst Senior Living" },
        location: { uk: "Nottingham", us: "Columbus, OH" },
        start: "2024-01",
        end: "2024-12",
        bullets: [
          {
            uk: "Cared for 10 to 12 residents a shift on a 40-bed dementia unit, from washing and dressing to meals",
            us: "Cared for 10 to 12 residents a shift in a 40-bed memory care unit, from bathing to meals",
          },
          {
            uk: "Moved residents safely by following each moving and handling plan, with no falls in 12 months",
            us: "Transferred residents safely with lifts and gait belts, with no falls during transfers in 12 months",
          },
          {
            uk: "Turned at-risk residents every 2 hours, with no new pressure sores on the unit in 6 months",
            us: "Turned at-risk residents every 2 hours, with no new pressure injuries on the unit in 6 months",
          },
          "Recorded food and fluid intake for 12 residents a shift, flagging 2 cases of weight loss to the nurse",
        ],
      },
    ],
    education: [
      {
        title: { uk: "Level 3 Diploma in Adult Care (part-time)", us: "Associate of Applied Science in Nursing (part-time)" },
        org: { uk: "Nottingham College", us: "Columbus State Community College" },
        start: "2025-09",
        current: true,
      },
      {
        title: { uk: "Level 2 Diploma in Health and Social Care", us: "High School Diploma" },
        org: { uk: "Nottingham College", us: "Linden Park High School" },
        end: "2023",
        grade: { uk: "Merit", us: "GPA 3.2" },
      },
    ],
    certificates: [
      { title: { uk: "Care Certificate", us: "Home Health Aide certificate (75 hours)" }, org: { uk: "Elmhurst House Care Home", us: "Columbus State Community College" }, end: "2024" },
      { title: { uk: "Enhanced DBS check (Update Service)", us: "Background check, state and federal fingerprints" }, org: { uk: "Disclosure and Barring Service", us: "Ohio Bureau of Criminal Investigation" }, end: "2024" },
    ],
    skills: [
      "Personal care",
      { uk: "Medication support", us: "Medication reminders" },
      "Dementia care",
      "Care plans",
      { uk: "Safeguarding", us: "Reporting neglect" },
      "Record keeping",
      { uk: "Moving and handling", us: "Safe transfers" },
      "Food and fluid intake",
    ],
    names: ["Abena", "Mensah", "Willowbank", "Elmhurst", "Meadowside"],
    letter: {
      job: {
        title: { uk: "Home Care Worker", us: "Caregiver" },
        employer: "Meadowside Home Care",
        advert: {
          uk: `Home Care Worker
Meadowside Home Care, Nottingham

Meadowside Home Care helps 150 older people live well in their own homes across Nottingham.

The role
You will visit clients on a regular round, giving personal care, meals and medication support. Pay is £13.20 an hour, plus mileage.

What we are looking for
- Experience in home care or residential care
- Experience caring for people living with dementia
- Clear and accurate record keeping
- A full UK driving licence and access to a car`,
          us: `Caregiver
Meadowside Home Care, Columbus, OH

Meadowside Home Care helps 150 older adults live well in their own homes across Columbus.

The role
You will visit clients on a regular route, providing personal care, meals and medication reminders. Pay is $17.50 an hour, plus mileage.

What we are looking for
- Experience in home care or assisted living
- Experience caring for people living with dementia
- Clear and accurate record keeping
- A valid driver's license and a reliable car`,
        },
      },
      reason: "I want to keep working in home care, where I can get to know each client well. I also want to learn more about dementia care.",
      paragraphs: [
        {
          uk: "I am applying for the role of Home Care Worker at Meadowside Home Care. I want to keep working in home care, where I can get to know each client well. I also want to learn more about dementia care.",
          us: "I am applying for the role of Caregiver at Meadowside Home Care. I want to keep working in home care, where I can get to know each client well. I also want to learn more about dementia care.",
        },
        {
          uk: "At Willowbank Home Care I visit 8 to 10 clients a day in their own homes, giving personal care, meals and medication support in line with each care plan. I raise 2 to 3 health concerns a month with the office, leading to earlier GP or district nurse visits.",
          us: "At Willowbank Home Care I visit 3 to 4 clients a day in their homes, providing personal care, meals and medication reminders in line with each care plan. I raise 2 to 3 health concerns a month with the office, leading to earlier nurse or doctor visits.",
        },
        {
          uk: "Your advert asks for experience caring for people living with dementia. I care for 4 clients with dementia using life story work, cutting distressed calls from weekly to monthly. At Elmhurst House Care Home I cared for 10 to 12 residents a shift on a 40-bed dementia unit, from washing and dressing to meals.",
          us: "Your advert asks for experience caring for people living with dementia. I care for 4 clients with dementia using memory books, cutting distressed calls from weekly to monthly. At Elmhurst Senior Living I cared for 10 to 12 residents a shift in a 40-bed memory care unit, from bathing to meals.",
        },
        {
          uk: "Your advert also asks for clear and accurate record keeping. I keep clear records of each visit and medicine in the care app, with no gaps in 18 months of audits. I also hold a full UK driving licence, the Care Certificate and an enhanced DBS check, and I am working towards a Level 3 Diploma in Adult Care.",
          us: "Your advert also asks for clear and accurate record keeping. I keep clear records of each visit in the care app, with no gaps in 18 months of monthly audits. I also have a clean background check and a valid Ohio driver's license, and I am studying part-time for an associate degree in nursing.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "primary-teacher",
    industry: "education",
    role: { uk: "Primary School Teacher", us: "Elementary School Teacher" },
    level: "experienced",
    template: "standard",
    blurb: {
      uk: "A primary teacher with seven years in Key Stage 1 and 2 classrooms who leads maths across the school.",
      us: "An elementary teacher with seven years in second and fourth grade classrooms who leads math across the school.",
    },
    person: { name: "Emily Fraser", email: "emily.fraser@example.com", phone: { uk: "07700 900102", us: "(503) 555-0101" }, location: { uk: "Norwich", us: "Portland, OR" } },
    profile: {
      uk: "Primary school teacher with seven years in Key Stage 1 and 2 classrooms and four years as maths lead. Raised the share of Year 4 pupils meeting the expected standard in maths from 68% to 84% in two years. Adapts lessons for pupils with special educational needs and disabilities (SEND) and works closely with parents. Runs staff training in maths and mentors trainee teachers.",
      us: "Elementary school teacher with seven years in second and fourth grade classrooms and four years as the school's math lead. Raised the share of fourth graders meeting state math standards from 58% to 71% in two years. Adapts lessons for students with Individualized Education Programs (IEPs) and works closely with families. Leads math training for teachers and mentors student teachers.",
    },
    experience: [
      {
        title: { uk: "Year 4 Teacher and Maths Lead", us: "Fourth Grade Teacher and Math Lead" },
        org: { uk: "Oakfield Primary School", us: "Oakfield Elementary School" },
        location: { uk: "Norwich", us: "Portland, OR" },
        start: "2022-09",
        current: true,
        bullets: [
          {
            uk: "Plan lessons and teach the full curriculum to a class of 30 Year 4 pupils, sharing weekly planning with 2 other Year 4 teachers",
            us: "Plan lessons and teach all core subjects to a class of 28 fourth graders, sharing weekly planning with 2 other fourth grade teachers",
          },
          {
            uk: "Raised the share of pupils meeting the expected standard in maths from 68% to 84% in 2 years through daily arithmetic practice and small-group catch-up sessions",
            us: "Raised the share of students meeting state math standards from 58% to 71% in 2 years through daily number fluency practice and small-group intervention",
          },
          {
            uk: "Lead maths across the school, running 6 staff training sessions a year for 14 teachers and teaching assistants",
            us: "Lead math across the school, running 6 professional development sessions a year for 14 teachers and instructional assistants",
          },
          {
            uk: "Assess pupils in reading, writing and maths each term, using the results to set up catch-up groups for 8 to 10 pupils",
            us: "Assess students in reading, writing and math each quarter, using the results to set up intervention groups for 8 to 10 students",
          },
          {
            uk: "Adapt lessons for 6 pupils with special educational needs and disabilities (SEND), working with the special educational needs coordinator and parents each term",
            us: "Adapt lessons for 6 students with Individualized Education Programs (IEPs), working with the special education teacher and families each quarter",
          },
          {
            uk: "Meet the parents of all 30 pupils at 2 parents' evenings a year and send a weekly class update through the school app",
            us: "Hold conferences with the families of all 28 students twice a year and send a weekly class newsletter through the school app",
          },
        ],
      },
      {
        title: { uk: "Year 2 Class Teacher", us: "Second Grade Teacher" },
        org: { uk: "Hollybrook Primary School", us: "Hollybrook Elementary School" },
        location: { uk: "Ipswich", us: "Salem, OR" },
        start: "2019-09",
        end: "2022-08",
        bullets: [
          {
            uk: "Taught a class of 28 Year 2 pupils, with 82% meeting the expected standard in reading at the end of Key Stage 1 in 2022",
            us: "Taught a class of 26 second graders, with 82% reading at grade level by the end of the year in 2022, up from 61% in the fall",
          },
          {
            uk: "Ran daily phonics groups for 8 pupils who were behind in reading, with 7 of 8 passing the phonics screening check in Year 2",
            us: "Ran daily phonics groups for 8 students reading below grade level, with 7 of 8 reaching grade level by spring",
          },
          {
            uk: "Managed behaviour with clear routines and a class reward system, cutting logged incidents from 40 to 12 a term",
            us: "Managed behavior with clear routines and a class reward system, cutting logged incidents from 40 to 12 a quarter",
          },
          {
            uk: "Taught the class remotely during school closures in 2020 and 2021, setting daily lessons and video check-ins for 28 pupils",
            us: "Taught the class remotely during school closures in 2020 and 2021, with daily lessons and video check-ins for 26 students",
          },
          {
            uk: "Planned and led 3 school trips a year for 60 pupils, including a museum visit and a day on a working farm",
            us: "Planned and led 3 field trips a year for 60 students, including a visit to the state capitol",
          },
          {
            uk: "Mentored 2 trainee teachers through their final placements, both going on to qualify in 2022",
            us: "Mentored 2 student teachers through their final term, both earning their teaching licenses in 2022",
          },
        ],
      },
    ],
    volunteering: [
      {
        title: "Summer reading club volunteer",
        org: { uk: "Norwich Library", us: "Portland Public Library" },
        start: "2021-06",
        current: true,
        bullets: [
          "Run weekly reading sessions each summer for 15 to 20 children aged 5 to 9, using games and book quizzes",
          "Wrote 10 story-time plans for younger readers, still used by library staff each summer",
        ],
      },
    ],
    education: [
      {
        title: { uk: "PGCE Primary (5 to 11)", us: "Master of Arts in Teaching, Elementary Education" },
        org: { uk: "University of East Anglia", us: "Portland State University" },
        end: "2019",
      },
      {
        title: { uk: "BA (Hons) English Literature", us: "Bachelor of Arts in English" },
        org: { uk: "University of Leicester", us: "Oregon State University" },
        end: "2018",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      { title: { uk: "Qualified Teacher Status (QTS)", us: "Oregon Teaching License, Elementary Multiple Subjects" }, org: { uk: "Department for Education", us: "Teacher Standards and Practices Commission" }, end: "2019" },
      { title: { uk: "Enhanced DBS check with barred list (Update Service)", us: "Fingerprint background check" }, org: { uk: "Disclosure and Barring Service", us: "Teacher Standards and Practices Commission" }, end: "2025" },
      { title: { uk: "Paediatric First Aid", us: "Pediatric First Aid, CPR and AED" }, org: { uk: "St John Ambulance", us: "American Red Cross" }, end: "2025" },
    ],
    skills: [
      "Lesson planning",
      "Assessment",
      "Phonics",
      "Behaviour management",
      { uk: "Special educational needs", us: "Individualized Education Programs" },
      { uk: "Working with parents", us: "Working with families" },
      { uk: "Staff training", us: "Professional development" },
      "Mentoring",
      "Remote teaching",
    ],
    names: ["Oakfield", "Hollybrook", "Thornbury"],
    letter: {
      job: {
        title: { uk: "Key Stage 2 Teacher and Maths Lead", us: "Fifth Grade Teacher and Math Lead" },
        employer: { uk: "Thornbury Primary Academy", us: "Thornbury Elementary School" },
        advert: {
          uk: `Key Stage 2 Teacher and Maths Lead
Thornbury Primary Academy, Norwich

Thornbury is a two-form entry primary school with 420 pupils.

The role
You will teach a Year 5 class and lead maths across the school. Main or upper pay range, plus a teaching and learning responsibility payment.

What we are looking for
- Qualified Teacher Status and experience teaching in Key Stage 2
- A record of raising attainment in maths
- Experience leading a subject and training staff
- Commitment to pupils with special educational needs and disabilities`,
          us: `Fifth Grade Teacher and Math Lead
Thornbury Elementary School, Portland, OR

Thornbury is a K-5 school with 420 students.

The role
You will teach a fifth grade class and lead math across the school, with a stipend of $3,000 a year for the math lead role.

What we are looking for
- An Oregon teaching license and experience teaching grades 3 to 5
- A record of raising student achievement in math
- Experience leading professional development for teachers
- Experience supporting students with IEPs and English language learners`,
        },
      },
      reason: { uk: "I want to lead maths in a bigger school. I also enjoy teaching older children.", us: "I want to lead math in a bigger school. I also enjoy teaching older children." },
      paragraphs: [
        {
          uk: "I am applying for the role of Key Stage 2 Teacher and Maths Lead at Thornbury Primary Academy. I want to lead maths in a bigger school. I also enjoy teaching older children.",
          us: "I am applying for the role of Fifth Grade Teacher and Math Lead at Thornbury Elementary School. I want to lead math in a bigger school. I also enjoy teaching older children.",
        },
        {
          uk: "At Oakfield Primary School I plan lessons and teach the full curriculum to a class of 30 Year 4 pupils. Your advert asks for a record of raising attainment in maths. I raised the share of pupils meeting the expected standard in maths from 68% to 84% in 2 years through daily arithmetic practice and small-group catch-up sessions.",
          us: "At Oakfield Elementary School I plan lessons and teach all core subjects to a class of 28 fourth graders. Your advert asks for a record of raising student achievement in math. I raised the share of students meeting state math standards from 58% to 71% in 2 years through daily number fluency practice and small-group intervention.",
        },
        {
          uk: "Your advert also asks for experience leading a subject and training staff. I lead maths across the school, running 6 staff training sessions a year for 14 teachers and teaching assistants. I also assess pupils in reading, writing and maths each term, using the results to set up catch-up groups for 8 to 10 pupils.",
          us: "Your advert also asks for experience leading professional development for teachers. I lead math across the school, running 6 professional development sessions a year for 14 teachers and instructional assistants. I also assess students in reading, writing and math each quarter, using the results to set up intervention groups for 8 to 10 students.",
        },
        {
          uk: "I adapt lessons for 6 pupils with special educational needs and disabilities (SEND), working with the special educational needs coordinator and parents each term. At Hollybrook Primary School I ran daily phonics groups for 8 pupils who were behind in reading, with 7 of 8 passing the phonics screening check in Year 2. I also mentored 2 trainee teachers through their final placements.",
          us: "I adapt lessons for 6 students with Individualized Education Programs (IEPs), working with the special education teacher and families each quarter. At Hollybrook Elementary School I ran daily phonics groups for 8 students reading below grade level, with 7 of 8 reaching grade level by spring. I also mentored 2 student teachers through their final term.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "hr-adviser",
    industry: "hr",
    role: { uk: "HR Adviser", us: "HR Generalist" },
    level: "experienced",
    template: "standard",
    blurb: {
      uk: "An HR adviser with seven years in HR who handles employee relations cases for a logistics company with 1,200 employees.",
      us: "An HR generalist with seven years in HR who handles employee relations and leave for a logistics company with 1,200 employees.",
    },
    person: { name: "Meera Shah", email: "meera.shah@example.com", phone: { uk: "07700 900103", us: "(404) 555-0102" }, location: { uk: "Birmingham", us: "Atlanta, GA" } },
    profile: {
      uk: "HR adviser with seven years in HR, the last four advising managers at a logistics company with 1,200 employees across 6 sites. Handles absence, conduct, grievance and performance cases from first meeting to outcome letter. Cut sickness absence from 6.1% to 4.3% in 18 months and new-starter turnover from 28% to 17%. Associate member of the Chartered Institute of Personnel and Development (CIPD), with the Level 5 Associate Diploma in People Management.",
      us: "HR generalist with seven years in HR, the last four advising managers at a logistics company with 1,200 employees across 6 sites. Handles employee relations, leave and performance cases from intake to written outcome. Cut unplanned absence from 6.1% to 4.3% in 18 months and 90-day turnover for new hires from 28% to 17%. Holds the SHRM Certified Professional credential from the Society for Human Resource Management (SHRM).",
    },
    experience: [
      {
        title: { uk: "HR Adviser", us: "HR Generalist" },
        org: "Calder Logistics",
        location: { uk: "Birmingham", us: "Atlanta, GA" },
        start: "2022-04",
        current: true,
        bullets: [
          {
            uk: "Advise 85 managers across 6 warehouse sites and 1,200 employees on absence, conduct, grievance and performance cases",
            us: "Advise 85 managers across 6 warehouse sites and 1,200 employees on attendance, conduct, complaints and performance issues",
          },
          {
            uk: "Manage around 40 open employee relations cases at a time, from first meeting to outcome letter, with 90% closed within 8 weeks",
            us: "Manage around 40 open employee relations and leave cases at a time, including Family and Medical Leave Act (FMLA) requests, with 90% closed within 8 weeks",
          },
          {
            uk: "Cut sickness absence from 6.1% to 4.3% in 18 months by introducing return-to-work meetings and training managers to hold them",
            us: "Cut unplanned absence from 6.1% to 4.3% in 18 months by introducing return-to-work meetings and training managers to hold them",
          },
          {
            uk: "Run 25 disciplinary and grievance investigations a year, with no employment tribunal claims upheld in 3 years",
            us: "Run 25 workplace investigations a year, from harassment complaints to pay disputes, with no Equal Employment Opportunity Commission (EEOC) charges filed in 3 years",
          },
          {
            uk: "Rewrote 14 HR policies in line with changes in employment law, including flexible working requests from day one, and briefed 85 managers on them",
            us: "Rewrote 14 HR policies in the employee handbook in line with changes in federal and Georgia employment law, and briefed 85 managers on them",
          },
          {
            uk: "Cut new-starter turnover in the first 90 days from 28% to 17% by redesigning onboarding for warehouse staff with site managers",
            us: "Cut 90-day turnover for new hires from 28% to 17% by redesigning onboarding for warehouse staff with site managers",
          },
        ],
      },
      {
        title: { uk: "HR Assistant", us: "HR Coordinator" },
        org: "Fairhaven Hotels",
        location: { uk: "Birmingham", us: "Atlanta, GA" },
        start: "2019-08",
        end: "2022-03",
        bullets: [
          {
            uk: "Ran recruitment for 4 hotels, posting around 150 jobs a year and booking 600 interviews with hiring managers",
            us: "Ran recruiting for 4 hotels, posting around 150 jobs a year and scheduling 600 interviews with hiring managers",
          },
          {
            uk: "Prepared contracts and offer letters for 220 new starters a year, each sent within 2 working days of the offer",
            us: "Prepared offer letters and new hire paperwork for 220 employees a year, each sent within 2 business days of the offer",
          },
          {
            uk: "Checked right to work documents for every new starter, with no errors found in an internal audit of 300 files",
            us: "Completed employment eligibility checks for every new hire, with no errors found in an internal audit of 300 files",
          },
          {
            uk: "Took notes at 60 disciplinary and grievance hearings, writing up each one within 48 hours",
            us: "Took notes at 60 investigation and disciplinary meetings, writing up each one within 48 hours",
          },
          {
            uk: "Answered around 50 HR questions a week from staff by email and phone, from holiday pay to sick leave",
            us: "Answered around 50 HR questions a week from employees by email and phone, from vacation pay to sick leave",
          },
          {
            uk: "Ran a monthly induction day for around 20 new starters across 4 hotels, covering policies, pay and health and safety",
            us: "Ran a monthly orientation day for around 20 new hires across 4 hotels, covering policies, pay and benefits",
          },
        ],
      },
      {
        title: { uk: "HR Placement Student", us: "HR Intern (part-time)" },
        org: { uk: "Brindley Housing Group", us: "Brindley Property Management" },
        location: { uk: "Birmingham", us: "Atlanta, GA" },
        start: "2017-07",
        end: "2018-06",
        bullets: [
          "Screened around 1,200 applications for 40 jobs, building shortlists for 6 hiring managers",
          "Built a tracker for 300 staff training records in Excel, cutting missed refresher courses from 25% to 5% in 6 months",
          {
            uk: "Organised 4 open days for apprentices and graduates, each attended by around 80 people",
            us: "Organized 4 campus recruiting events for interns and graduates, each attended by around 80 students",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Business and Human Resource Management", us: "Bachelor of Business Administration in Human Resources" },
        org: { uk: "Aston University", us: "Georgia State University" },
        end: "2019",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [
      { title: { uk: "CIPD Level 5 Associate Diploma in People Management", us: "SHRM Certified Professional (SHRM-CP)" }, org: { uk: "Chartered Institute of Personnel and Development", us: "Society for Human Resource Management" }, end: "2023" },
      { title: "Mental Health First Aid", org: { uk: "MHFA England", us: "National Council for Mental Wellbeing" }, end: "2024" },
    ],
    skills: [
      "Employee relations",
      { uk: "Absence management", us: "Leave management" },
      "Investigations",
      "Employment law",
      "HR policies",
      "Onboarding",
      { uk: "Recruitment", us: "Recruiting" },
      { uk: "Contracts", us: "Offer letters" },
      { uk: "Right to work checks", us: "Employment eligibility checks" },
    ],
    names: ["Fairhaven", "Hartwell", "Brindley", "Wellbeing", "Meera"],
    letter: {
      job: {
        title: { uk: "Senior HR Adviser", us: "Senior HR Generalist" },
        employer: "Hartwell Foods",
        advert: {
          uk: `Senior HR Adviser
Hartwell Foods, Birmingham

Hartwell Foods makes bread and cakes for supermarkets, with 900 employees across 3 sites in the Midlands.

The role
You will advise managers on employee relations cases, lead our work on absence and keep our HR policies up to date. Salary £38,000 to £42,000.

What we are looking for
- CIPD Level 5 or above
- Experience managing employee relations cases from start to finish
- A record of reducing sickness absence
- Up-to-date knowledge of employment law`,
          us: `Senior HR Generalist
Hartwell Foods, Atlanta, GA

Hartwell Foods makes bread and baked goods for grocery chains, with 900 employees across 3 plants in Georgia.

The role
You will advise managers on employee relations cases, lead our work on attendance and leave, and keep our HR policies up to date. Salary $72,000 to $80,000.

What we are looking for
- SHRM-CP, SHRM-SCP or PHR certification
- Experience managing employee relations cases from start to finish
- A record of reducing absence
- Up-to-date knowledge of federal and state employment law`,
        },
      },
      reason: "I want to take on more complex cases and coach managers. I also like working on busy sites with shift workers.",
      paragraphs: [
        {
          uk: "I am applying for the role of Senior HR Adviser at Hartwell Foods. I want to take on more complex cases and coach managers. I also like working on busy sites with shift workers.",
          us: "I am applying for the role of Senior HR Generalist at Hartwell Foods. I want to take on more complex cases and coach managers. I also like working on busy sites with shift workers.",
        },
        {
          uk: "At Calder Logistics I advise 85 managers across 6 warehouse sites and 1,200 employees on absence, conduct, grievance and performance cases. I manage around 40 open employee relations cases at a time, from first meeting to outcome letter, with 90% closed within 8 weeks.",
          us: "At Calder Logistics I advise 85 managers across 6 warehouse sites and 1,200 employees on attendance, conduct, complaints and performance issues. I manage around 40 open employee relations and leave cases at a time, including Family and Medical Leave Act (FMLA) requests, with 90% closed within 8 weeks.",
        },
        {
          uk: "Your advert asks for a record of reducing sickness absence. I cut sickness absence from 6.1% to 4.3% in 18 months by introducing return-to-work meetings and training managers to hold them. I also cut new-starter turnover in the first 90 days from 28% to 17% by redesigning onboarding for warehouse staff with site managers.",
          us: "Your advert asks for a record of reducing absence. I cut unplanned absence from 6.1% to 4.3% in 18 months by introducing return-to-work meetings and training managers to hold them. I also cut 90-day turnover for new hires from 28% to 17% by redesigning onboarding for warehouse staff with site managers.",
        },
        {
          uk: "Your advert also asks for up-to-date knowledge of employment law. I rewrote 14 HR policies in line with changes in employment law, including flexible working requests from day one, and briefed 85 managers on them. I am an associate member of the Chartered Institute of Personnel and Development (CIPD), with the Level 5 Associate Diploma in People Management.",
          us: "Your advert also asks for up-to-date knowledge of federal and state employment law. I rewrote 14 HR policies in the employee handbook in line with changes in federal and Georgia employment law, and briefed 85 managers on them. I hold the SHRM Certified Professional credential from the Society for Human Resource Management (SHRM).",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "store-manager",
    industry: "retail",
    role: "Store Manager",
    level: "senior",
    template: "minimal",
    blurb: {
      uk: "A store manager with 13 years in retail who runs a £14 million home and garden store.",
      us: "A store manager with 13 years in retail who runs a $17 million home and garden store.",
    },
    person: { name: "Michael Doyle", email: "michael.doyle@example.com", phone: { uk: "07700 900104", us: "(602) 555-0103" }, location: { uk: "Manchester", us: "Phoenix, AZ" } },
    profile: {
      uk: "Store manager with 13 years in retail, the last five running a £14 million home and garden store with 70 staff. Grew sales by 11% in 2025 against 4% growth across the region, and cut stock loss from 2.4% to 1.3% of sales in two years. Plans rotas that keep labour costs on budget, and has promoted 9 staff into supervisor and manager roles. Opened a new store in 2019, recruiting and training 40 staff in 6 weeks.",
      us: "Store manager with 13 years in retail, the last five running a $17 million home and garden store with 70 associates. Grew sales by 11% in 2025 against 4% growth across the region, and cut shrink from 2.4% to 1.3% of sales in two years. Builds schedules that keep labor costs on budget, and has promoted 9 associates into supervisor and manager roles. Opened a new store in 2019, recruiting and training 40 associates in 6 weeks.",
    },
    experience: [
      {
        title: "Store Manager",
        org: "Larchfield Home",
        location: { uk: "Stockport", us: "Phoenix, AZ" },
        start: "2021-03",
        current: true,
        bullets: [
          {
            uk: "Run a £14 million home and garden store with a team of 70 staff and 6 department managers, open 7 days a week",
            us: "Run a $17 million home and garden store with a team of 70 associates and 6 department managers, open 7 days a week",
          },
          {
            uk: "Grew sales by 11% in 2025, against 4% growth across the region, by giving more floor space to garden furniture and seasonal ranges",
            us: "Grew sales by 11% in 2025, against 4% growth across the region, by giving more floor space to patio furniture and seasonal goods",
          },
          {
            uk: "Cut stock loss from 2.4% to 1.3% of sales in 2 years through a loss prevention plan of weekly counts on high-theft lines and tag checks at the doors",
            us: "Cut shrink from 2.4% to 1.3% of sales in 2 years through a loss prevention plan of weekly counts on high-theft items and tag checks at the doors",
          },
          {
            uk: "Plan weekly rotas for 70 staff, keeping labour costs within 0.5% of budget for 3 years in a row",
            us: "Build weekly schedules for 70 associates, keeping labor costs within 0.5% of budget for 3 years in a row",
          },
          {
            uk: "Raised customer satisfaction from 78% to 89% in 18 months by adding staff on the tills at peak times and training every team member in service standards",
            us: "Raised customer satisfaction from 78% to 89% in 18 months by adding cashiers at peak times and training every associate in service standards",
          },
          {
            uk: "Promoted 9 staff to supervisor or manager roles in 4 years through a store training plan",
            us: "Promoted 9 associates to supervisor or manager roles in 4 years through a store training plan",
          },
        ],
      },
      {
        title: { uk: "Deputy Store Manager", us: "Assistant Store Manager" },
        org: "Larchfield Home",
        location: { uk: "Warrington", us: "Mesa, AZ" },
        start: "2017-06",
        end: "2021-02",
        bullets: [
          {
            uk: "Ran the store in the manager's absence, with yearly sales of £9 million and 45 staff",
            us: "Ran the store in the manager's absence, with yearly sales of $11 million and 45 associates",
          },
          {
            uk: "Opened a new store in 2019, recruiting and training 40 staff in 6 weeks for an on-time launch",
            us: "Opened a new store in 2019, recruiting and training 40 associates in 6 weeks for an on-time launch",
          },
          {
            uk: "Led a stock team of 8, cutting the time from delivery to shop floor from 48 to 24 hours",
            us: "Led an inventory team of 8, cutting the time from delivery to sales floor from 48 to 24 hours",
          },
          {
            uk: "Trained 30 new starters a year on tills, customer service and stock",
            us: "Trained 30 new hires a year on registers, customer service and inventory",
          },
          "Ran 4 seasonal events a year, including the Christmas launch, each adding around 6% to sales that month",
        ],
      },
      {
        title: { uk: "Department Manager", us: "Department Supervisor" },
        org: "Kendrick's Department Store",
        location: { uk: "Manchester", us: "Phoenix, AZ" },
        start: "2013-09",
        end: "2017-05",
        bullets: [
          {
            uk: "Managed a team of 12 in the kitchen and dining department, with £2.2 million in yearly sales",
            us: "Managed a team of 12 in the kitchen and dining department, with $2.7 million in yearly sales",
          },
          {
            uk: "Cut overtime by 20% in a year by matching rotas to footfall data",
            us: "Cut overtime by 20% in a year by matching schedules to store traffic data",
          },
          {
            uk: "Reset the department layout 4 times a year with the visual merchandising team, lifting sales per square metre by 8%",
            us: "Reset the department layout 4 times a year with the visual merchandising team, lifting sales per square foot by 8%",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Business Management", us: "Bachelor of Science in Business Administration" },
        org: { uk: "Manchester Metropolitan University", us: "Arizona State University" },
        end: "2013",
        grade: { uk: "2:1", us: "GPA 3.3" },
      },
    ],
    certificates: [
      { title: { uk: "IOSH Managing Safely", us: "OSHA 10-Hour General Industry" }, org: { uk: "Institution of Occupational Safety and Health", us: "Occupational Safety and Health Administration" }, end: "2022" },
    ],
    skills: [
      "Sales growth",
      "Loss prevention",
      { uk: "Rota planning", us: "Scheduling" },
      "Labour costs",
      "Customer service",
      { uk: "Recruitment", us: "Recruiting" },
      { uk: "Staff training", us: "Associate training" },
      "Visual merchandising",
      "Store openings",
      "Seasonal events",
    ],
    names: ["Larchfield", "Ashworth", "Stockport", "Warrington", "Trafford", "Kendrick"],
    letter: {
      job: {
        title: "Store Manager",
        employer: "Ashworth Home and Garden",
        advert: {
          uk: `Store Manager
Ashworth Home and Garden, Trafford, Manchester

Our largest store, with £18 million in yearly sales and a team of 90.

The role
You will lead the store's sales, people and operations, reporting to the regional manager. Salary £48,000 plus bonus.

What we are looking for
- Experience managing a store with sales of over £10 million
- A record of growing sales and cutting stock loss
- Strong control of rotas and labour costs
- Experience developing managers and opening new stores`,
          us: `Store Manager
Ashworth Home and Garden, Scottsdale, AZ

Our largest store, with $22 million in yearly sales and a team of 90.

The role
You will lead the store's sales, people and operations, reporting to the district manager. Salary $85,000 plus bonus.

What we are looking for
- Experience managing a store with sales of over $10 million
- A record of growing sales and reducing shrink
- Strong control of scheduling and labor costs
- Experience developing managers and opening new stores`,
        },
      },
      reason: "I want to run a bigger store with a larger team. I also enjoy selling home and garden products.",
      paragraphs: [
        "I am applying for the role of Store Manager at Ashworth Home and Garden. I want to run a bigger store with a larger team. I also enjoy selling home and garden products.",
        {
          uk: "At Larchfield Home I run a £14 million home and garden store with a team of 70 staff and 6 department managers, open 7 days a week. Your advert asks for a record of growing sales and cutting stock loss. I grew sales by 11% in 2025, against 4% growth across the region, by giving more floor space to garden furniture and seasonal ranges. I also cut stock loss from 2.4% to 1.3% of sales in 2 years through a loss prevention plan of weekly counts on high-theft lines and tag checks at the doors.",
          us: "At Larchfield Home I run a $17 million home and garden store with a team of 70 associates and 6 department managers, open 7 days a week. Your advert asks for a record of growing sales and reducing shrink. I grew sales by 11% in 2025, against 4% growth across the region, by giving more floor space to patio furniture and seasonal goods. I also cut shrink from 2.4% to 1.3% of sales in 2 years through a loss prevention plan of weekly counts on high-theft items and tag checks at the doors.",
        },
        {
          uk: "I plan weekly rotas for 70 staff, keeping labour costs within 0.5% of budget for 3 years in a row. Your advert also asks for experience developing managers and opening new stores. I promoted 9 staff to supervisor or manager roles in 4 years through a store training plan. As deputy store manager I opened a new store in 2019, recruiting and training 40 staff in 6 weeks for an on-time launch.",
          us: "I build weekly schedules for 70 associates, keeping labor costs within 0.5% of budget for 3 years in a row. Your advert also asks for experience developing managers and opening new stores. I promoted 9 associates to supervisor or manager roles in 4 years through a store training plan. As assistant store manager I opened a new store in 2019, recruiting and training 40 associates in 6 weeks for an on-time launch.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "chef",
    industry: "hospitality",
    role: "Chef",
    level: "experienced",
    template: "minimal",
    blurb: {
      uk: "A head chef with 11 years in restaurant and hotel kitchens who runs a 70-cover restaurant kitchen.",
      us: "An executive chef with 11 years in restaurant and hotel kitchens who runs a 70-seat restaurant kitchen.",
    },
    person: { name: "Nathan Cole", email: "nathan.cole@example.com", phone: { uk: "07700 900105", us: "(615) 555-0104" }, location: { uk: "Bath", us: "Nashville, TN" } },
    profile: {
      uk: "Head chef with 11 years in restaurant and hotel kitchens, the last four running the kitchen of a 70-cover restaurant with 8 chefs. Writes 4 seasonal menus a year, with every dish costed to a food gross profit of 70% or more. Cut food waste by 35% in a year and raised food gross profit from 64% to 71% in 18 months. Holds a Level 3 award in supervising food safety, and has kept the top food hygiene rating of 5 through 3 council inspections.",
      us: "Executive chef with 11 years in restaurant and hotel kitchens, the last four running the kitchen of a 70-seat restaurant with 8 cooks. Writes 4 seasonal menus a year, with every dish costed to a food cost of 30% or less. Cut food waste by 35% in a year and lowered food cost from 34% to 29% of sales in 18 months. ServSafe Manager certified, with scores of 95 or higher in 4 health department inspections.",
    },
    experience: [
      {
        title: { uk: "Head Chef", us: "Executive Chef" },
        org: "The Linden Kitchen",
        location: { uk: "Bath", us: "Nashville, TN" },
        start: "2022-09",
        current: true,
        bullets: [
          {
            uk: "Lead a kitchen of 8 chefs in a 70-cover restaurant, serving up to 140 covers a night, 6 days a week",
            us: "Lead a kitchen of 8 cooks in a 70-seat restaurant, serving up to 140 guests a night, 6 days a week",
          },
          {
            uk: "Write 4 seasonal menus a year, costing every dish to a food gross profit of 70% or more using recipe costing sheets",
            us: "Write 4 seasonal menus a year, costing every dish to a food cost of 30% or less using recipe costing sheets",
          },
          {
            uk: "Raised food gross profit from 64% to 71% in 18 months by renegotiating with 5 suppliers and resetting portion sizes",
            us: "Lowered food cost from 34% to 29% of sales in 18 months by renegotiating with 5 vendors and resetting portion sizes",
          },
          {
            uk: "Cut food waste by 35% in a year by ordering to daily cover forecasts and using trim in staff meals and specials",
            us: "Cut food waste by 35% in a year by ordering to daily guest forecasts and using trim in staff meals and specials",
          },
          {
            uk: "Kept the top food hygiene rating of 5 through 3 council inspections over 4 years",
            us: "Scored 95 or higher in 4 health department inspections over 4 years, with no critical violations",
          },
          {
            uk: "Trained 6 commis and junior chefs, 3 of whom stepped up to chef de partie within 2 years",
            us: "Trained 6 prep and line cooks, 3 of whom stepped up to lead line cook within 2 years",
          },
        ],
      },
      {
        title: "Sous Chef",
        org: "Ashcombe House Hotel",
        location: { uk: "Bradford-on-Avon", us: "Franklin, TN" },
        start: "2018-05",
        end: "2022-08",
        bullets: [
          {
            uk: "Ran the kitchen on the head chef's 2 days off each week, serving 90 covers at dinner and up to 200 guests at weddings",
            us: "Ran the kitchen on the executive chef's 2 days off each week, serving 90 guests at dinner and up to 200 at weddings",
          },
          "Cooked for 60 weddings and events a year, planning each menu and prep list for up to 200 guests",
          {
            uk: "Ordered around £6,000 of food a week from 8 suppliers, checking every delivery for temperature and quality",
            us: "Ordered around $7,500 of food a week from 8 vendors, checking every delivery for temperature and quality",
          },
          {
            uk: "Rewrote the kitchen's food safety plan based on Hazard Analysis and Critical Control Points (HACCP), keeping a food hygiene rating of 5 at 2 inspections",
            us: "Rewrote the kitchen's food safety plan based on Hazard Analysis and Critical Control Points (HACCP), with no critical violations in 3 health inspections",
          },
          {
            uk: "Built an allergen matrix for all 14 allergens across 40 dishes, with a check at the pass on every order",
            us: "Built an allergen chart for the 9 major food allergens across 40 dishes, with a check at the pass on every ticket",
          },
          "Cut breakfast ticket times from 18 to 11 minutes by reorganising the line and preparing more the night before",
        ],
      },
      {
        title: { uk: "Chef de Partie", us: "Line Cook" },
        org: "Marlow & Finch",
        location: { uk: "Bristol", us: "Knoxville, TN" },
        start: "2015-09",
        end: "2018-04",
        bullets: [
          {
            uk: "Ran the grill and fish sections in a 60-cover restaurant, serving up to 150 covers on busy nights",
            us: "Ran the grill and fish stations in a 60-seat restaurant, serving up to 150 guests on busy nights",
          },
          {
            uk: "Prepared stocks, sauces, meat and fish for 3 sections each morning before a noon service",
            us: "Prepared stocks, sauces, meat and fish for 3 stations each morning before a noon service",
          },
          {
            uk: "Trained 4 commis chefs on knife skills, butchery and section set-up",
            us: "Trained 4 prep cooks on knife skills, butchery and station setup",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "Level 3 Diploma in Advanced Professional Cookery", us: "Associate of Applied Science in Culinary Arts" },
        org: { uk: "Bath College", us: "Nashville State Community College" },
        end: "2015",
      },
    ],
    certificates: [
      { title: { uk: "Level 3 Award in Supervising Food Safety in Catering", us: "ServSafe Manager Certification" }, org: { uk: "Highfield Qualifications", us: "National Restaurant Association" }, end: "2023" },
      { title: { uk: "Food Allergy Awareness", us: "ServSafe Allergens" }, org: { uk: "Food Standards Agency", us: "National Restaurant Association" }, end: "2024" },
    ],
    skills: [
      "Menu planning",
      "Food costing",
      { uk: "Gross profit", us: "Food cost" },
      "Food safety",
      "Allergens",
      "Food waste",
      "Ordering",
      { uk: "Training chefs", us: "Training cooks" },
      "Butchery",
      "Weddings and events",
    ],
    names: ["Ashcombe", "Marlow", "commis", "de", "partie", "Highfield", "ServSafe"],
    letter: {
      job: {
        title: { uk: "Head Chef", us: "Executive Chef" },
        employer: "Wren House",
        advert: {
          uk: `Head Chef
Wren House, Bath

Wren House is a 90-cover restaurant serving seasonal British food, open for lunch and dinner 6 days a week.

The role
You will lead a kitchen of 10, write seasonal menus and manage food costs. Salary £42,000 plus a share of tips.

What we are looking for
- Experience as a head chef or senior sous chef
- Experience writing seasonal menus
- Strong control of food costs and gross profit
- A Level 3 food safety qualification`,
          us: `Executive Chef
Wren House, Nashville, TN

Wren House is a 90-seat restaurant serving seasonal Southern food, open for lunch and dinner 6 days a week.

The role
You will lead a kitchen of 10, write seasonal menus and manage food costs. Salary $72,000 plus a bonus.

What we are looking for
- Experience as an executive chef or chef de cuisine
- Experience writing seasonal menus
- Strong control of food and labor costs
- ServSafe Manager certification`,
        },
      },
      reason: {
        uk: "I want to run a bigger kitchen that cooks with local, seasonal produce. I also want to keep training young chefs.",
        us: "I want to run a bigger kitchen that cooks with local, seasonal produce. I also want to keep training young cooks.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Head Chef at Wren House. I want to run a bigger kitchen that cooks with local, seasonal produce. I also want to keep training young chefs.",
          us: "I am applying for the role of Executive Chef at Wren House. I want to run a bigger kitchen that cooks with local, seasonal produce. I also want to keep training young cooks.",
        },
        {
          uk: "At The Linden Kitchen I lead a kitchen of 8 chefs in a 70-cover restaurant, serving up to 140 covers a night, 6 days a week. Your advert asks for experience writing seasonal menus. I write 4 seasonal menus a year, costing every dish to a food gross profit of 70% or more using recipe costing sheets.",
          us: "At The Linden Kitchen I lead a kitchen of 8 cooks in a 70-seat restaurant, serving up to 140 guests a night, 6 days a week. Your advert asks for experience writing seasonal menus. I write 4 seasonal menus a year, costing every dish to a food cost of 30% or less using recipe costing sheets.",
        },
        {
          uk: "Your advert also asks for strong control of food costs and gross profit. I raised food gross profit from 64% to 71% in 18 months by renegotiating with 5 suppliers and resetting portion sizes. I also cut food waste by 35% in a year by ordering to daily cover forecasts and using trim in staff meals and specials.",
          us: "Your advert also asks for strong control of food and labor costs. I lowered food cost from 34% to 29% of sales in 18 months by renegotiating with 5 vendors and resetting portion sizes. I also cut food waste by 35% in a year by ordering to daily guest forecasts and using trim in staff meals and specials.",
        },
        {
          uk: "I hold the Level 3 Award in Supervising Food Safety in Catering, and I kept the top food hygiene rating of 5 through 3 council inspections over 4 years. I trained 6 commis and junior chefs, 3 of whom stepped up to chef de partie within 2 years.",
          us: "I hold the ServSafe Manager Certification, and I scored 95 or higher in 4 health department inspections over 4 years, with no critical violations. I trained 6 prep and line cooks, 3 of whom stepped up to lead line cook within 2 years.",
        },
        CLOSE,
      ],
    },
  },
];
