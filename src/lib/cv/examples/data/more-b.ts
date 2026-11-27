import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** More examples, added 27 Nov 2026 to fill gaps by level and industry. */
export const MORE_B: ExampleSpec[] = [
  {
    id: "junior-doctor",
    industry: "healthcare",
    role: { uk: "Foundation Year 2 Doctor", us: "Resident Physician" },
    level: "early",
    template: "ward",
    blurb: {
      uk: "A foundation doctor in his second year, with rotations in medicine, surgery, psychiatry and emergency medicine, a clinical audit and weekly teaching.",
      us: "A second-year internal medicine resident with ward, intensive care and emergency rotations, a quality improvement project and regular teaching.",
    },
    person: { name: "Imran Siddiqui", email: "imran.siddiqui@example.com", phone: { uk: "07700 900608", us: "(214) 555-0131" }, location: { uk: "Sheffield", us: "Dallas, TX" } },
    profile: {
      uk: "Foundation Year 2 doctor with 16 months of rotations in acute medicine, general surgery, psychiatry and emergency medicine. Assesses and treats 10 to 14 patients a shift in a busy emergency department, discussing each referral with a senior. Led a clinical audit of blood clot risk assessment that raised completion within 24 hours of admission from 58% to 91%. Teaches medical students every week and holds full General Medical Council (GMC) registration.",
      us: "Second-year internal medicine resident with 17 months of rotations in inpatient medicine, intensive care, cardiology and emergency medicine. Admits and manages 8 to 10 patients a day on the inpatient medicine service, presenting each plan to the attending physician. Led a quality improvement project on blood clot risk assessment that raised completion within 24 hours of admission from 58% to 91%. Teaches medical students on every inpatient block and holds a Texas Physician-in-Training permit.",
    },
    experience: [
      {
        title: { uk: "Foundation Year 2 Doctor, Emergency Medicine", us: "Resident Physician (PGY-2), Internal Medicine" },
        org: { uk: "Hallamvale Teaching Hospitals NHS Foundation Trust", us: "Trinity Ridge Medical Center" },
        location: { uk: "Sheffield", us: "Dallas, TX" },
        start: "2026",
        current: true,
        bullets: [
          {
            uk: "Assess and treat 10 to 14 patients a shift in an emergency department that sees around 320 patients a day",
            us: "Admit and manage 8 to 10 patients a day on inpatient medicine, presenting each plan to the attending physician",
          },
          {
            uk: "Discuss each referral with a senior and refer 4 to 6 patients a shift to medical, surgical and orthopaedic teams",
            us: "Lead a ward team of 2 interns and 3 medical students on night float, covering up to 60 inpatients",
          },
          {
            uk: "Screen adults with a raised National Early Warning Score (NEWS2) for sepsis, giving antibiotics within 1 hour to 94% of those with suspected sepsis",
            us: "Screen adults with a raised Modified Early Warning Score (MEWS) for sepsis, giving antibiotics within 1 hour to 94% of those with suspected sepsis",
          },
          {
            uk: "Teach 4 third-year medical students each week at the bedside, with 9 in 10 rating the sessions good or excellent",
            us: "Teach 3 third-year medical students on each inpatient block, with 9 in 10 rating the teaching good or excellent",
          },
          {
            uk: "Wrote a one-page guide to requesting head scans after a fall, now part of induction for 24 new doctors each rotation",
            us: "Wrote a one-page guide to ordering head scans after a fall, now part of orientation for 24 new interns each year",
          },
        ],
      },
      {
        title: { uk: "Foundation Year 1 Doctor", us: "Resident Physician (PGY-1), Internal Medicine" },
        org: { uk: "Hallamvale Teaching Hospitals NHS Foundation Trust", us: "Trinity Ridge Medical Center" },
        location: { uk: "Sheffield", us: "Dallas, TX" },
        start: "2025",
        end: "2026",
        bullets: [
          {
            uk: "Rotated through acute medicine, general surgery and psychiatry, caring for up to 28 inpatients a day on each ward",
            us: "Rotated through inpatient medicine, the intensive care unit, cardiology and the emergency department, caring for up to 10 patients a day",
          },
          {
            uk: "Led a clinical audit of blood clot risk assessment on 3 medical wards, raising completion within 24 hours of admission from 58% to 91% on re-audit",
            us: "Led a quality improvement project on blood clot risk assessment on 3 medicine units, raising completion within 24 hours of admission from 58% to 91%",
          },
          {
            uk: "Prescribed and reviewed medicines on daily ward rounds for up to 24 patients, with no prescribing incidents in 12 months",
            us: "Ordered and reviewed medications on daily rounds for up to 10 patients, with no medication errors in 12 months",
          },
          {
            uk: "Wrote around 40 discharge summaries a week, cutting the average wait for a summary from 3 days to 1 day",
            us: "Wrote around 40 discharge summaries a week, cutting the average wait for a summary from 3 days to 1 day",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "Bachelor of Medicine, Bachelor of Surgery (MBChB)", us: "Doctor of Medicine (MD)" },
        org: { uk: "University of Sheffield", us: "University of Texas Medical Branch" },
        end: "2025",
      },
    ],
    certificates: [
      {
        title: { uk: "Full registration with a licence to practise", us: "Physician-in-Training permit" },
        org: { uk: "General Medical Council, number 7812345", us: "Texas Medical Board" },
      },
      { title: { uk: "Advanced Life Support", us: "Advanced Cardiovascular Life Support (ACLS)" }, org: { uk: "Resuscitation Council UK", us: "American Heart Association" }, end: "2025" },
      {
        title: { uk: "Prescribing Safety Assessment, passed", us: "Step 1 and Step 2 Clinical Knowledge, passed" },
        org: { uk: "British Pharmacological Society", us: "United States Medical Licensing Examination (USMLE)" },
        end: "2025",
      },
    ],
    skills: [
      { uk: "Emergency medicine", us: "Internal medicine" },
      { uk: "Clinical audit", us: "Quality improvement" },
      "Sepsis screening",
      { uk: "NEWS2", us: "MEWS" },
      "Risk assessment",
      "Teaching",
      "Discharge summaries",
      { uk: "Prescribing", us: "Medication review" },
      { uk: "Ward rounds", us: "Night float" },
      { uk: "Acute medicine", us: "Intensive care" },
    ],
    names: ["Imran", "Siddiqui", "Hallamvale", "Ridgeway", "MBChB", "MEWS", "Bayou"],
    letter: {
      job: {
        title: { uk: "Clinical Fellow in Emergency Medicine", us: "Resident Physician, Internal Medicine (PGY-3)" },
        employer: { uk: "Ridgeway General Hospital NHS Trust", us: "Bayou Crest University Hospital" },
        advert: {
          uk: `Clinical Fellow in Emergency Medicine
Ridgeway General Hospital NHS Trust, Sheffield

Our emergency department sees around 300 patients a day.

The role
This is a 12-month post from August 2027 for doctors who have completed the Foundation Programme. You will assess and treat patients across majors, minors and resuscitation, with protected time for teaching and audit.

What we are looking for
- Full GMC registration with a licence to practise
- Experience in emergency medicine
- An interest in teaching medical students
- Experience of clinical audit or quality improvement`,
          us: `Resident Physician, Internal Medicine (PGY-3)
Bayou Crest University Hospital, Houston, TX

We have one PGY-3 position open in our internal medicine residency, starting July 2027.

The role
You will lead inpatient teams of interns and medical students, with time for teaching and quality improvement.

What we are looking for
- Two years of internal medicine residency in an accredited program
- Experience leading a ward team
- An interest in teaching medical students
- Experience with quality improvement projects`,
        },
      },
      reason: {
        uk: "I want a further year in emergency medicine before I apply for a training post. I also want to keep teaching medical students.",
        us: "My family is moving to Houston next summer, and I want to finish my internal medicine training there. I also want to keep teaching medical students.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Clinical Fellow in Emergency Medicine at Ridgeway General Hospital NHS Trust. I want a further year in emergency medicine before I apply for a training post. I also want to keep teaching medical students.",
          us: "I am applying for the role of Resident Physician, Internal Medicine (PGY-3) at Bayou Crest University Hospital. My family is moving to Houston next summer, and I want to finish my internal medicine training there. I also want to keep teaching medical students.",
        },
        {
          uk: "At Hallamvale Teaching Hospitals I assess and treat 10 to 14 patients a shift in an emergency department that sees around 320 patients a day. I discuss each referral with a senior and refer 4 to 6 patients a shift to medical, surgical and orthopaedic teams. I also screen adults with a raised National Early Warning Score (NEWS2) for sepsis, giving antibiotics within 1 hour to 94% of those with suspected sepsis.",
          us: "At Trinity Ridge Medical Center I admit and manage 8 to 10 patients a day on inpatient medicine, presenting each plan to the attending physician. Your advert asks for experience leading a ward team. I lead a ward team of 2 interns and 3 medical students on night float, covering up to 60 inpatients.",
        },
        {
          uk: "Your advert asks for experience of clinical audit or quality improvement. I led a clinical audit of blood clot risk assessment on 3 medical wards, raising completion within 24 hours of admission from 58% to 91% on re-audit.",
          us: "Your advert also asks for experience with quality improvement projects. I led a quality improvement project on blood clot risk assessment on 3 medicine units, raising completion within 24 hours of admission from 58% to 91%.",
        },
        {
          uk: "Your advert also asks for an interest in teaching medical students. I teach 4 third-year medical students each week at the bedside, with 9 in 10 rating the sessions good or excellent. I also wrote a one-page guide to requesting head scans after a fall, now part of induction for 24 new doctors each rotation. I hold full registration with a licence to practise from the General Medical Council.",
          us: "Your advert also asks for an interest in teaching medical students. I teach 3 third-year medical students on each inpatient block, with 9 in 10 rating the teaching good or excellent. I also wrote a one-page guide to ordering head scans after a fall, now part of orientation for 24 new interns each year. I hold a Physician-in-Training permit from the Texas Medical Board.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "healthcare-assistant",
    industry: "healthcare",
    role: { uk: "Healthcare Assistant", us: "Certified Nursing Assistant" },
    level: "early",
    template: "ward",
    blurb: {
      uk: "A healthcare assistant with two years on an acute ward for older people, after 18 months in a care home.",
      us: "A certified nursing assistant with two years on a medical-surgical unit, after 18 months in assisted living.",
    },
    person: { name: "Bethany Kowalski", email: "bethany.kowalski@example.com", phone: { uk: "07700 900609", us: "(602) 555-0132" }, location: { uk: "Derby", us: "Phoenix, AZ" } },
    profile: {
      uk: "Healthcare assistant with two years on a busy acute medical ward for older people, after 18 months in residential care. Records observations and food and fluid charts for up to 10 patients a shift, escalating changes to the nurse in charge. Cut falls on the ward by 30% in 6 months by setting up bay tagging for patients at high risk. Holds the Care Certificate and a Level 3 Diploma in Adult Care, and is applying to study nursing.",
      us: "Certified nursing assistant with two years on a busy medical-surgical unit, after 18 months as a caregiver in assisted living. Takes vital signs and records intake and output for up to 12 patients a shift, reporting changes to the charge nurse. Cut falls on the unit by 30% in 6 months by setting up hourly rounding for patients at high risk. Holds Arizona nursing assistant certification and Basic Life Support (BLS), and is applying to nursing school.",
    },
    experience: [
      {
        title: { uk: "Healthcare Assistant, Acute Medical Ward", us: "Certified Nursing Assistant, Medical-Surgical Unit" },
        org: { uk: "Derwent Valley Hospitals NHS Trust", us: "Saguaro Valley Medical Center" },
        location: { uk: "Derby", us: "Phoenix, AZ" },
        start: "2024-09",
        current: true,
        bullets: [
          {
            uk: "Care for 8 to 10 older patients a shift on a 30-bed acute medical ward, giving personal care and help with meals and walking",
            us: "Care for 10 to 12 patients a shift on a 30-bed medical-surgical unit, from bathing and dressing to meals and walking",
          },
          {
            uk: "Record observations with the National Early Warning Score (NEWS2) for up to 10 patients a shift, escalating 2 to 3 changes a week to the nurse in charge",
            us: "Take vital signs for up to 12 patients a shift, reporting 2 to 3 abnormal readings a week to the charge nurse",
          },
          {
            uk: "Set up bay tagging for patients at high risk of falls with the ward manager, cutting falls on the ward by 30% in 6 months",
            us: "Set up hourly rounding for patients at high risk of falls with the nurse manager, cutting falls on the unit by 30% in 6 months",
          },
          {
            uk: "Keep food and fluid charts for up to 10 patients a shift, with no gaps in 12 months of ward audits",
            us: "Record intake and output for up to 12 patients a shift, with no gaps in 12 months of unit audits",
          },
          {
            uk: "Give pressure area care to 6 patients at risk every 2 hours, with no new pressure ulcers on the ward in 9 months",
            us: "Turn and check the skin of 6 patients at risk of pressure injuries every 2 hours, with no new pressure injuries on the unit in 9 months",
          },
        ],
      },
      {
        title: { uk: "Care Assistant", us: "Caregiver" },
        org: { uk: "Larchfield House Care Home", us: "Larchfield Assisted Living" },
        location: { uk: "Derby", us: "Phoenix, AZ" },
        start: "2023-03",
        end: "2024-08",
        bullets: [
          {
            uk: "Cared for 8 to 12 residents a shift in a 45-bed care home, including 15 people living with dementia",
            us: "Cared for 8 to 12 residents a shift in a 45-bed assisted living community, including 15 people living with dementia",
          },
          {
            uk: "Moved residents safely with hoists and slide sheets, following each moving and handling plan, with no injuries in 18 months",
            us: "Moved residents with safe transfers using gait belts and mechanical lifts, with no injuries in 18 months",
          },
          "Recorded care notes for 12 residents a shift in the care app, with no gaps in 18 months of audits",
          { uk: "Trained 4 new care assistants on the morning routine, with all 4 working alone within 2 weeks", us: "Trained 4 new caregivers on the morning routine, with all 4 working alone within 2 weeks" },
        ],
      },
    ],
    education: [
      {
        title: { uk: "Level 3 Diploma in Adult Care", us: "Nursing Assistant Training Program (120 hours)" },
        org: { uk: "Derby College", us: "Phoenix College" },
        end: "2024",
      },
      {
        title: { uk: "9 GCSEs, including English and maths", us: "High School Diploma" },
        org: { uk: "Oakwood Park Academy", us: "Desert Vista High School" },
        end: "2022",
        grade: { uk: "Grades 7 to 5", us: "GPA 3.4" },
      },
    ],
    certificates: [
      { title: { uk: "Care Certificate", us: "Certified Nursing Assistant" }, org: { uk: "Derwent Valley Hospitals NHS Trust", us: "Arizona State Board of Nursing" }, end: "2024" },
      { title: { uk: "Basic Life Support", us: "Basic Life Support (BLS)" }, org: { uk: "Derwent Valley Hospitals NHS Trust", us: "American Heart Association" }, end: "2025" },
      {
        title: { uk: "Enhanced DBS check (Update Service)", us: "Level One Fingerprint Clearance Card" },
        org: { uk: "Disclosure and Barring Service", us: "Arizona Department of Public Safety" },
        end: "2023",
      },
    ],
    skills: [
      { uk: "Personal care", us: "Patient care" },
      { uk: "Observations", us: "Vital signs" },
      { uk: "NEWS2", us: "Intake and output" },
      { uk: "Falls risk", us: "Fall risk" },
      { uk: "Bay tagging", us: "Hourly rounding" },
      { uk: "Food and fluid charts", us: "Skin checks" },
      { uk: "Pressure area care", us: "Safe transfers" },
      "Dementia care",
      { uk: "Moving and handling", us: "Care notes" },
      { uk: "Care notes", us: "Training new caregivers" },
    ],
    names: ["Bethany", "Kowalski", "Derwent", "Oakwood", "Larchfield", "Peakmoor", "Saguaro", "Sonoran"],
    letter: {
      job: {
        title: { uk: "Senior Healthcare Assistant", us: "Certified Nursing Assistant, Acute Care for Elders Unit" },
        employer: { uk: "Peakmoor General Hospital NHS Trust", us: "Sonoran Ridge Hospital" },
        advert: {
          uk: `Senior Healthcare Assistant, Older People's Medicine
Peakmoor General Hospital NHS Trust, Derby

Our 28-bed ward cares for older people admitted with acute illness, many of them living with dementia.

The role
This is a Band 3 post at £25,200 a year. You will lead care on a bay of patients, take observations and support new healthcare assistants.

What we are looking for
- Experience as a healthcare assistant on a hospital ward
- The Care Certificate
- Experience caring for people living with dementia
- A record of improving patient safety, such as falls or pressure ulcer prevention`,
          us: `Certified Nursing Assistant, Acute Care for Elders Unit
Sonoran Ridge Hospital, Phoenix, AZ

Our 28-bed unit cares for older adults admitted with acute illness, many of them living with dementia.

The role
You will care for a group of patients each shift, take vital signs and help train new nursing assistants. Pay is $21.50 an hour.

What we are looking for
- Active Arizona CNA certification
- Hospital experience as a nursing assistant
- Experience caring for people living with dementia
- A record of improving patient safety, such as fall or pressure injury prevention`,
        },
      },
      reason: {
        uk: "I want a step up on the ward while I apply to study nursing, and I want to keep caring for older people.",
        us: "I want more responsibility on a hospital unit while I apply to nursing school, and I want to keep caring for older adults.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Senior Healthcare Assistant at Peakmoor General Hospital NHS Trust. I want a step up on the ward while I apply to study nursing, and I want to keep caring for older people.",
          us: "I am applying for the role of Certified Nursing Assistant, Acute Care for Elders Unit at Sonoran Ridge Hospital. I want more responsibility on a hospital unit while I apply to nursing school, and I want to keep caring for older adults.",
        },
        {
          uk: "At Derwent Valley Hospitals I care for 8 to 10 older patients a shift on a 30-bed acute medical ward, giving personal care and help with meals and walking. I record observations with the National Early Warning Score (NEWS2) for up to 10 patients a shift, escalating 2 to 3 changes a week to the nurse in charge.",
          us: "At Saguaro Valley Medical Center I care for 10 to 12 patients a shift on a 30-bed medical-surgical unit, from bathing and dressing to meals and walking. I take vital signs for up to 12 patients a shift, reporting 2 to 3 abnormal readings a week to the charge nurse.",
        },
        {
          uk: "Your advert asks for a record of improving patient safety. I set up bay tagging for patients at high risk of falls with the ward manager, cutting falls on the ward by 30% in 6 months. I also give pressure area care to 6 patients at risk every 2 hours, with no new pressure ulcers on the ward in 9 months.",
          us: "Your advert asks for a record of improving patient safety. I set up hourly rounding for patients at high risk of falls with the nurse manager, cutting falls on the unit by 30% in 6 months. I also turn and check the skin of 6 patients at risk of pressure injuries every 2 hours, with no new pressure injuries on the unit in 9 months.",
        },
        {
          uk: "Your advert also asks for experience caring for people living with dementia. At Larchfield House Care Home I cared for 8 to 12 residents a shift, including 15 people living with dementia. I hold the Care Certificate and a Level 3 Diploma in Adult Care.",
          us: "Your advert also asks for experience caring for people living with dementia. At Larchfield Assisted Living I cared for 8 to 12 residents a shift, including 15 people living with dementia. I am a Certified Nursing Assistant with the Arizona State Board of Nursing, and I hold Basic Life Support (BLS) certification.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "customer-service-adviser",
    industry: "customer-service",
    role: { uk: "Customer Service Adviser", us: "Customer Service Representative" },
    level: "early",
    template: "fieldwork",
    blurb: {
      uk: "A contact centre adviser with two and a half years on phones and live chat for a broadband provider.",
      us: "A contact center representative with two and a half years on phones and live chat for an internet provider.",
    },
    person: { name: "Jade Whitlock", email: "jade.whitlock@example.com", phone: { uk: "07700 900610", us: "(619) 555-0134" }, location: { uk: "Cardiff", us: "San Diego, CA" } },
    profile: {
      uk: "Customer service adviser with two and a half years in a broadband contact centre, answering 45 to 55 phone calls and live chats a day. Reaches a first contact resolution rate of 82% against a team average of 74%. Raised customer retention on calls to leave from 51% to 62% in 9 months. Before that, sold phone contracts and resolved returns and complaints in a busy phone shop.",
      us: "Customer service representative with two and a half years in an internet provider's contact center, answering 45 to 55 phone calls and live chats a day. Reaches a first contact resolution rate of 82% against a team average of 74%. Raised customer retention on calls to cancel from 51% to 62% in 9 months. Before that, sold phone plans and resolved returns and complaints in a busy phone store.",
    },
    experience: [
      {
        title: { uk: "Customer Service Adviser", us: "Customer Service Representative" },
        org: { uk: "Northwire Broadband", us: "Northwire Internet" },
        location: { uk: "Cardiff", us: "San Diego, CA" },
        start: "2024-05",
        current: true,
        bullets: [
          {
            uk: "Answer 45 to 55 phone calls and live chats a day about bills, broadband faults and moving home, for 600,000 customers",
            us: "Answer 45 to 55 phone calls and live chats a day about bills, internet outages and moving service, for 600,000 customers",
          },
          {
            uk: "Reach a first contact resolution rate of 82%, against a team average of 74%, by running line tests during the call",
            us: "Reach a first contact resolution rate of 82%, against a team average of 74%, by troubleshooting modems during the call",
          },
          {
            uk: "Raised customer retention on calls to leave from 51% to 62% in 9 months by offering cheaper or faster packages",
            us: "Raised customer retention on calls to cancel from 51% to 62% in 9 months by offering cheaper or faster plans",
          },
          "Run up to 3 live chats at once, keeping an average customer satisfaction score of 4.7 out of 5 over 12 months",
          "Handle 8 to 12 complaints a week through to a written reply, closing 4 in 5 within 5 working days",
          "Wrote 12 saved replies for the live chat team, cutting average chat time from 9 to 7 minutes",
        ],
      },
      {
        title: { uk: "Sales Assistant", us: "Sales Associate" },
        org: "Pennant Mobile",
        location: { uk: "Cardiff", us: "San Diego, CA" },
        start: "2022-09",
        end: "2024-04",
        bullets: [
          { uk: "Served 60 to 80 customers a day on the shop floor, from phone repairs to upgrades", us: "Served 60 to 80 customers a day on the sales floor, from phone repairs to upgrades" },
          { uk: "Sold 20 to 25 phone contracts a month, beating the store target in 9 of 12 months", us: "Sold 20 to 25 phone plans a month, beating the store goal in 9 of 12 months" },
          "Resolved 10 to 15 returns and complaints a week at the service desk, passing 1 in 20 to the manager",
          { uk: "Trained 3 new starters on the till and returns process within their first 2 weeks", us: "Trained 3 new hires on the register and returns process within their first 2 weeks" },
        ],
      },
    ],
    education: [
      {
        title: { uk: "A levels in English, Business and Psychology", us: "High School Diploma" },
        org: { uk: "Riverside Sixth Form College", us: "Bayview High School" },
        end: "2022",
        grade: { uk: "Grades B, B and C", us: "GPA 3.3" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 2 Certificate in Customer Service", us: "Customer Service and Sales Certification" },
        org: { uk: "City and Guilds", us: "National Retail Federation Foundation" },
        end: "2023",
      },
    ],
    skills: [
      "First contact resolution",
      "Customer retention",
      "Customer satisfaction",
      "Complaint handling",
      "Live chat",
      { uk: "Line tests", us: "Troubleshooting" },
      { uk: "Phone contracts", us: "Phone plans" },
      "Returns",
      { uk: "Training new starters", us: "Training new hires" },
    ],
    names: ["Whitlock", "Northwire", "Sunhollow", "Bayview"],
    letter: {
      job: {
        title: { uk: "Customer Service Adviser, Complaints Team", us: "Customer Service Representative, Complaints Team" },
        employer: "Sunhollow Energy",
        advert: {
          uk: `Customer Service Adviser, Complaints Team
Sunhollow Energy, Cardiff

Sunhollow Energy supplies gas and electricity to 900,000 homes across Wales and the South West.

The role
You will take complaints by phone, email and live chat and see each one through to a written reply. Pay is £24,500 a year, with hybrid working after training.

What we are looking for
- Experience in a contact centre, on phones or live chat
- Experience handling complaints
- A strong record of resolving issues at first contact
- Clear written replies to customers`,
          us: `Customer Service Representative, Complaints Team
Sunhollow Energy, San Diego, CA

Sunhollow Energy supplies electricity and gas to 900,000 homes across Southern California.

The role
You will take complaints by phone, email and live chat and see each one through to a written reply. Pay is $22.50 an hour, with a hybrid schedule after training.

What we are looking for
- Experience in a contact center, on phones or live chat
- Experience handling complaints
- A strong record of resolving issues at first contact
- Clear written replies to customers`,
        },
      },
      reason: "I want to focus on complaints, where I can put things right for customers. I also want to keep working on phones and live chat.",
      paragraphs: [
        {
          uk: "I am applying for the role of Customer Service Adviser, Complaints Team at Sunhollow Energy. I want to focus on complaints, where I can put things right for customers. I also want to keep working on phones and live chat.",
          us: "I am applying for the role of Customer Service Representative, Complaints Team at Sunhollow Energy. I want to focus on complaints, where I can put things right for customers. I also want to keep working on phones and live chat.",
        },
        {
          uk: "At Northwire Broadband I answer 45 to 55 phone calls and live chats a day about bills, broadband faults and moving home, for 600,000 customers. I reach a first contact resolution rate of 82%, against a team average of 74%, by running line tests during the call.",
          us: "At Northwire Internet I answer 45 to 55 phone calls and live chats a day about bills, internet outages and moving service, for 600,000 customers. I reach a first contact resolution rate of 82%, against a team average of 74%, by troubleshooting modems during the call.",
        },
        "Your advert asks for experience handling complaints. I handle 8 to 12 complaints a week through to a written reply, closing 4 in 5 within 5 working days. At Pennant Mobile I also resolved 10 to 15 returns and complaints a week at the service desk.",
        {
          uk: "I run up to 3 live chats at once, keeping an average customer satisfaction score of 4.7 out of 5 over 12 months. I also wrote 12 saved replies for the live chat team, cutting average chat time from 9 to 7 minutes. I raised customer retention on calls to leave from 51% to 62% in 9 months by offering cheaper or faster packages.",
          us: "I run up to 3 live chats at once, keeping an average customer satisfaction score of 4.7 out of 5 over 12 months. I also wrote 12 saved replies for the live chat team, cutting average chat time from 9 to 7 minutes. I raised customer retention on calls to cancel from 51% to 62% in 9 months by offering cheaper or faster plans.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "administrator",
    industry: "admin",
    role: { uk: "Administrator", us: "Administrative Assistant" },
    level: "early",
    template: "minimal",
    blurb: {
      uk: "An administrator with four years in small offices, looking after diaries, invoices and records for a 14-person firm.",
      us: "An administrative assistant with four years in small offices, managing calendars, invoices and records for a 14-person firm.",
    },
    person: { name: "Rosie Tremaine", email: "rosie.tremaine@example.com", phone: { uk: "07700 900611", us: "(503) 555-0135" }, location: { uk: "Bristol", us: "Portland, OR" } },
    profile: {
      uk: "Administrator with four years in small offices, now the only administrator at a 14-person architecture firm. Manages the diaries of 3 directors and raises 60 to 80 invoices a month in Xero, cutting average payment time from 41 to 29 days. Moved 1,200 paper project files onto SharePoint with a clear naming system. Holds a Level 3 Diploma in Business Administration and a Microsoft Office Specialist certificate in Excel.",
      us: "Administrative assistant with four years in small offices, now the only administrative assistant at a 14-person architecture firm. Manages the calendars of 3 principals and creates 60 to 80 invoices a month in QuickBooks, cutting average payment time from 41 to 29 days. Moved 1,200 paper project files onto SharePoint with a clear naming system. Holds an associate degree in office administration and a Microsoft Office Specialist certification in Excel.",
    },
    experience: [
      {
        title: { uk: "Administrator", us: "Administrative Assistant" },
        org: "Fenwick Hale Architects",
        location: { uk: "Bristol", us: "Portland, OR" },
        start: "2024-02",
        current: true,
        bullets: [
          {
            uk: "Manage the diaries of 3 directors, booking 40 to 50 client meetings a month across 2 offices with no double bookings",
            us: "Manage the calendars of 3 principals, scheduling 40 to 50 client meetings a month across 2 offices with no double bookings",
          },
          {
            uk: "Raise 60 to 80 invoices a month in Xero and chase overdue ones each week, cutting average payment time from 41 to 29 days",
            us: "Create 60 to 80 invoices a month in QuickBooks and follow up on overdue ones each week, cutting average payment time from 41 to 29 days",
          },
          "Moved 1,200 paper project files onto SharePoint with a clear naming system, freeing a storeroom for 2 new desks",
          { uk: "Take minutes at the monthly directors' meeting, tracking 15 to 20 actions a month in Excel", us: "Take minutes at the monthly principals' meeting, tracking 15 to 20 action items a month in Excel" },
          {
            uk: "Order stationery and office supplies for 14 staff within a £350 monthly budget, saving 15% in a year by moving to a single supplier",
            us: "Order office supplies for 14 staff within a $450 monthly budget, saving 15% in a year by moving to a single supplier",
          },
        ],
      },
      {
        title: "Receptionist",
        org: { uk: "Kingsdown Dental Practice", us: "Kingsdown Family Dental" },
        location: { uk: "Bristol", us: "Portland, OR" },
        start: "2022-07",
        end: "2024-01",
        bullets: [
          { uk: "Booked 50 to 70 patient appointments a day by phone and online for 6 dentists", us: "Scheduled 50 to 70 patient appointments a day by phone and online for 6 dentists" },
          "Cut missed appointments from 9% to 4% in 6 months by setting up text reminders",
          "Scanned and filed 2,000 paper patient records in 5 months, with no records lost",
          { uk: "Took 40 to 60 payments a day and balanced the till each evening, with no cash differences in 18 months", us: "Took 40 to 60 payments a day and balanced the cash drawer each evening, with no cash differences in 18 months" },
        ],
      },
    ],
    education: [
      {
        title: { uk: "Level 3 Diploma in Business Administration", us: "Associate of Applied Science, Office Administration" },
        org: { uk: "City of Bristol College", us: "Portland Community College" },
        end: "2022",
        grade: { uk: "Distinction", us: "GPA 3.6" },
      },
    ],
    certificates: [{ title: { uk: "Microsoft Office Specialist: Excel Associate", us: "Microsoft Office Specialist: Excel Associate" }, org: "Microsoft", end: "2024" }],
    skills: [
      { uk: "Diary management", us: "Calendar management" },
      "Invoicing",
      { uk: "Xero", us: "QuickBooks" },
      "SharePoint",
      "Excel",
      "Minutes",
      "Office supplies",
      { uk: "Appointment booking", us: "Appointment scheduling" },
      "Filing",
    ],
    names: ["Tremaine", "Fenwick", "Kingsdown", "Brennan", "Wyatt"],
    letter: {
      job: {
        title: { uk: "Office Administrator", us: "Administrative Assistant" },
        employer: { uk: "Brennan Wyatt Accountants", us: "Brennan Wyatt CPAs" },
        advert: {
          uk: `Office Administrator
Brennan Wyatt Accountants, Bristol

We are a firm of 20 accountants and tax advisers in central Bristol.

The role
You will manage diaries for the partners, raise client invoices in Xero and keep our records in order. Pay is £26,000 a year.

What we are looking for
- Experience in office administration
- Diary management for senior staff
- Experience with Xero or similar software
- Accurate record keeping`,
          us: `Administrative Assistant
Brennan Wyatt CPAs, Portland, OR

We are a firm of 20 accountants and tax advisors in downtown Portland.

The role
You will manage calendars for the partners, create client invoices in QuickBooks and keep our records in order. Pay is $25.00 an hour.

What we are looking for
- Experience in office administration
- Calendar management for senior staff
- Experience with QuickBooks or similar software
- Accurate record keeping`,
        },
      },
      reason: "I want to work for a larger firm with more variety in the role. I also want to learn more about finance and bookkeeping.",
      paragraphs: [
        {
          uk: "I am applying for the role of Office Administrator at Brennan Wyatt Accountants. I want to work for a larger firm with more variety in the role. I also want to learn more about finance and bookkeeping.",
          us: "I am applying for the role of Administrative Assistant at Brennan Wyatt CPAs. I want to work for a larger firm with more variety in the role. I also want to learn more about finance and bookkeeping.",
        },
        {
          uk: "At Fenwick Hale Architects I manage the diaries of 3 directors, booking 40 to 50 client meetings a month across 2 offices with no double bookings. I also take minutes at the monthly directors' meeting, tracking 15 to 20 actions a month in Excel. Before that, I booked 50 to 70 patient appointments a day by phone and online for 6 dentists.",
          us: "At Fenwick Hale Architects I manage the calendars of 3 principals, scheduling 40 to 50 client meetings a month across 2 offices with no double bookings. I also take minutes at the monthly principals' meeting, tracking 15 to 20 action items a month in Excel. Before that, I scheduled 50 to 70 patient appointments a day by phone and online for 6 dentists.",
        },
        {
          uk: "Your advert asks for experience with Xero. I raise 60 to 80 invoices a month in Xero and chase overdue ones each week, cutting average payment time from 41 to 29 days. I also order stationery and office supplies for 14 staff within a £350 monthly budget, saving 15% in a year by moving to a single supplier.",
          us: "Your advert asks for experience with QuickBooks. I create 60 to 80 invoices a month in QuickBooks and follow up on overdue ones each week, cutting average payment time from 41 to 29 days. I also order office supplies for 14 staff within a $450 monthly budget, saving 15% in a year by moving to a single supplier.",
        },
        {
          uk: "Your advert also asks for accurate record keeping. I moved 1,200 paper project files onto SharePoint with a clear naming system, freeing a storeroom for 2 new desks. At Kingsdown Dental Practice I scanned and filed 2,000 paper patient records in 5 months, with no records lost.",
          us: "Your advert also asks for accurate record keeping. I moved 1,200 paper project files onto SharePoint with a clear naming system, freeing a storeroom for 2 new desks. At Kingsdown Family Dental I scanned and filed 2,000 paper patient records in 5 months, with no records lost.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "front-end-developer",
    industry: "software",
    role: "Junior Front-end Developer",
    level: "early",
    template: "technical",
    blurb: "A junior front-end developer who moved from customer support into code, with accessibility and page speed work behind him.",
    person: { name: "Callum Ferreira", email: "callum.ferreira@example.com", phone: { uk: "07700 900612", us: "(612) 555-0136" }, location: { uk: "Manchester", us: "Minneapolis, MN" }, links: ["github.com/callumferreira-example"] },
    profile:
      "Junior front-end developer with 20 months building React and TypeScript apps, after nearly 3 years in customer support at the same software company. Fixed 46 accessibility issues against the Web Content Accessibility Guidelines (WCAG) 2.2 and cut mobile load time on the booking page from 4.2 to 1.9 seconds. Writes unit and end-to-end tests in Jest and Playwright. Retrained through a part-time JavaScript course in 2024.",
    experience: [
      {
        title: "Junior Front-end Developer",
        org: "Tidewell Bookings",
        location: { uk: "Manchester", us: "Minneapolis, MN" },
        start: "2025-03",
        current: true,
        bullets: [
          "Build React and TypeScript components for a gym booking app used by 1,400 gyms and 300,000 members",
          "Fixed 46 accessibility issues found in an audit against the Web Content Accessibility Guidelines (WCAG) 2.2, raising the app's Lighthouse accessibility score from 71 to 98",
          "Improved mobile performance on the booking page, cutting load time from 4.2 to 1.9 seconds by lazy-loading images and splitting the code bundle",
          "Added keyboard support and screen reader labels to all 6 steps of checkout, cutting abandoned bookings by 8% in 3 months",
          "Wrote 180 unit tests in Jest and 25 end-to-end tests in Playwright, raising test coverage of the front end from 38% to 74%",
          "Review code in 6 to 8 pull requests a week and release to production 3 times a week with GitHub Actions",
        ],
      },
      {
        title: { uk: "Customer Support Agent", us: "Customer Support Specialist" },
        org: "Tidewell Bookings",
        location: { uk: "Manchester", us: "Minneapolis, MN" },
        start: "2022-06",
        end: "2025-02",
        bullets: [
          "Answered 35 to 45 support tickets a day from gym owners in Zendesk, with a satisfaction score of 94%",
          "Wrote 30 help centre articles with screenshots, cutting tickets about setting up classes by 25% in 4 months",
          "Reported 120 bugs in Jira with clear steps to reproduce, checking each fix in testing before release",
        ],
      },
    ],
    education: [
      { title: "Front-end Web Development (24-week part-time course)", org: "Codeyard Academy", end: "2024" },
      {
        title: { uk: "BA (Hons) Music", us: "Bachelor of Arts in Music" },
        org: { uk: "University of Salford", us: "University of Minnesota" },
        end: "2022",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    skills: ["React", "TypeScript", "JavaScript", "Accessibility", "WCAG 2.2", "Performance", "Jest", "Playwright", "Code review", "GitHub Actions"],
    names: ["Callum", "Ferreira", "Tidewell", "Codeyard", "Salford", "Kettlewell"],
    letter: {
      job: {
        title: "Front-end Developer",
        employer: "Kettlewell Health",
        advert: {
          uk: `Front-end Developer
Kettlewell Health, Manchester (hybrid)

We build the app that 2 million patients use to book GP appointments and order repeat prescriptions.

The role
You will build new features in React and TypeScript, with a focus on accessibility and speed on low-end phones. Salary is £38,000 to £42,000.

What we are looking for
- At least a year of professional experience with React and TypeScript
- Experience meeting WCAG 2.2 AA
- Experience improving page load times
- Automated testing with Jest, Playwright or similar`,
          us: `Front-end Developer
Kettlewell Health, Minneapolis, MN (hybrid)

We build the app that 2 million patients use to book doctor appointments and refill prescriptions.

The role
You will build new features in React and TypeScript, with a focus on accessibility and speed on low-end phones. Salary is $85,000 to $95,000.

What we are looking for
- At least a year of professional experience with React and TypeScript
- Experience meeting WCAG 2.2 AA
- Experience improving page load times
- Automated testing with Jest, Playwright or similar`,
        },
      },
      reason: "I want to build software that more people can use, especially people who rely on screen readers or keyboards. I also want to work on healthcare products.",
      paragraphs: [
        "I am applying for the role of Front-end Developer at Kettlewell Health. I want to build software that more people can use, especially people who rely on screen readers or keyboards. I also want to work on healthcare products.",
        "At Tidewell Bookings I build React and TypeScript components for a gym booking app used by 1,400 gyms and 300,000 members. I review code in 6 to 8 pull requests a week and release to production 3 times a week with GitHub Actions.",
        "Your advert asks for experience meeting WCAG 2.2 AA. I fixed 46 accessibility issues found in an audit against the Web Content Accessibility Guidelines (WCAG) 2.2, raising the app's Lighthouse accessibility score from 71 to 98. I also added keyboard support and screen reader labels to all 6 steps of checkout, cutting abandoned bookings by 8% in 3 months.",
        "Your advert also asks for experience improving page load times. I improved mobile performance on the booking page, cutting load time from 4.2 to 1.9 seconds by lazy-loading images and splitting the code bundle. I also wrote 180 unit tests in Jest and 25 end-to-end tests in Playwright, raising test coverage of the front end from 38% to 74%.",
        CLOSE,
      ],
    },
  },
  {
    id: "hotel-receptionist",
    industry: "hospitality",
    role: { uk: "Hotel Receptionist", us: "Front Desk Agent" },
    level: "early",
    template: "harbour",
    blurb: {
      uk: "A hotel receptionist with two and a half years on the front desk of a busy city centre hotel, after a year and a half front of house.",
      us: "A front desk agent with two and a half years at a busy Las Vegas hotel, after a year and a half as a restaurant host.",
    },
    person: { name: "Mariana Costa", email: "mariana.costa@example.com", phone: { uk: "07700 900613", us: "(702) 555-0137" }, location: { uk: "Edinburgh", us: "Las Vegas, NV" } },
    profile: {
      uk: "Hotel receptionist with two and a half years on the front desk of a 240-room city centre hotel, after a year and a half front of house in a restaurant. Checks in and checks out 80 to 120 guests a shift and resolves 10 to 15 guest issues, from room moves to billing errors. Cut overbooked rooms from 6 to 1 a month and raised the front desk review score from 8.4 to 9.1. Speaks Portuguese and Spanish and holds an HNC in Hospitality Management.",
      us: "Front desk agent with two and a half years at a 480-room hotel near the Las Vegas Strip, after a year and a half as a restaurant host. Checks in and checks out 80 to 120 guests a shift and resolves 10 to 15 guest issues, from room moves to billing errors. Cut overbooked rooms from 6 to 1 a month and raised the front desk review score from 8.4 to 9.1. Speaks Portuguese and Spanish and holds a certificate in hospitality management.",
    },
    experience: [
      {
        title: { uk: "Hotel Receptionist", us: "Front Desk Agent" },
        org: "Calder Grand Hotel",
        location: { uk: "Edinburgh", us: "Las Vegas, NV" },
        start: "2024-04",
        current: true,
        bullets: [
          {
            uk: "Check in and check out 80 to 120 guests a shift at a 240-room city centre hotel, with an average wait under 5 minutes",
            us: "Check in and check out 80 to 120 guests a shift at a 480-room hotel near the Strip, with an average wait under 5 minutes",
          },
          "Resolve 10 to 15 guest issues a shift, from room moves to billing errors, raising the hotel's review score for front desk service from 8.4 to 9.1",
          "Manage 200 to 250 reservations a day in the Opera property management system (PMS)",
          {
            uk: "Sell room upgrades and late check-outs at check-in, adding £2,400 a month in room revenue",
            us: "Sell room upgrades and late check-outs at check-in, adding $3,100 a month in room revenue",
          },
          "Cut overbooked rooms from 6 to 1 a month by checking no-shows and cancellations against the channel manager each evening",
          "Trained 5 new receptionists on Opera and check-in, each working shifts alone within 3 weeks",
        ],
      },
      {
        title: { uk: "Front of House Assistant", us: "Restaurant Host" },
        org: "Kelvin Street Kitchen",
        location: { uk: "Edinburgh", us: "Las Vegas, NV" },
        start: "2022-09",
        end: "2024-03",
        bullets: [
          { uk: "Greeted and seated 150 to 200 diners a day at a 90-cover restaurant, managing the waiting list at peak times", us: "Greeted and seated 150 to 200 diners a day at a 90-seat restaurant, managing the waiting list at peak times" },
          { uk: "Took 60 to 80 table bookings a day by phone and online, cutting no-shows from 12% to 5% with reminder texts", us: "Took 60 to 80 table reservations a day by phone and online, cutting no-shows from 12% to 5% with reminder texts" },
          "Kept the allergen book up to date for 40 dishes, answering 10 to 20 allergen questions a day",
        ],
      },
    ],
    education: [
      {
        title: { uk: "HNC Hospitality Management", us: "Certificate in Hospitality Management" },
        org: { uk: "Edinburgh College", us: "College of Southern Nevada" },
        end: "2022",
      },
    ],
    certificates: [
      {
        title: { uk: "Elementary Food Hygiene Certificate", us: "Food Handler Card" },
        org: { uk: "Royal Environmental Health Institute of Scotland", us: "Southern Nevada Health District" },
        end: "2022",
      },
    ],
    skills: [
      "Check-in and check-out",
      "Opera PMS",
      "Reservations",
      "Guest issues",
      "Room upgrades",
      "Channel manager",
      { uk: "Table bookings", us: "Table reservations" },
      "Allergens",
      "Portuguese and Spanish",
    ],
    names: ["Costa", "Aldermoor"],
    letter: {
      job: {
        title: { uk: "Senior Receptionist", us: "Lead Front Desk Agent" },
        employer: { uk: "Aldermoor House Hotel", us: "Aldermoor Resort and Spa" },
        advert: {
          uk: `Senior Receptionist
Aldermoor House Hotel, Edinburgh

Aldermoor House is a 180-room five-star hotel in the city centre, welcoming guests from around the world.

The role
You will run the front desk on your shift, look after guests from arrival to departure and train new receptionists. Pay is £27,000 a year, plus service charge.

What we are looking for
- At least 2 years on a hotel front desk
- Experience with Opera or a similar property management system
- Calm handling of guest complaints
- A second language is an advantage`,
          us: `Lead Front Desk Agent
Aldermoor Resort and Spa, Las Vegas, NV

Aldermoor is a 900-room resort on the Las Vegas Strip, welcoming guests from around the world.

The role
You will lead the front desk on your shift, look after guests from arrival to departure and train new agents. Pay is $21.50 an hour, with full benefits.

What we are looking for
- At least 2 years on a hotel front desk
- Experience with Opera or a similar property management system
- Calm handling of guest complaints
- A second language is a plus`,
        },
      },
      reason: {
        uk: "I want to move into a five-star hotel and take on more responsibility on the front desk. I also want to use my Portuguese and Spanish with guests every day.",
        us: "I want to move into a larger resort and take on more responsibility on the front desk. I also want to use my Portuguese and Spanish with guests every day.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Senior Receptionist at Aldermoor House Hotel. I want to move into a five-star hotel and take on more responsibility on the front desk. I also want to use my Portuguese and Spanish with guests every day.",
          us: "I am applying for the role of Lead Front Desk Agent at Aldermoor Resort and Spa. I want to move into a larger resort and take on more responsibility on the front desk. I also want to use my Portuguese and Spanish with guests every day.",
        },
        {
          uk: "At Calder Grand Hotel I check in and check out 80 to 120 guests a shift at a 240-room city centre hotel, with an average wait under 5 minutes. I manage 200 to 250 reservations a day in the Opera property management system (PMS), and I trained 5 new receptionists on Opera and check-in.",
          us: "At Calder Grand Hotel I check in and check out 80 to 120 guests a shift at a 480-room hotel near the Strip, with an average wait under 5 minutes. I manage 200 to 250 reservations a day in the Opera property management system (PMS), and I trained 5 new receptionists on Opera and check-in.",
        },
        "Your advert asks for calm handling of guest complaints. I resolve 10 to 15 guest issues a shift, from room moves to billing errors, raising the hotel's review score for front desk service from 8.4 to 9.1. I also cut overbooked rooms from 6 to 1 a month by checking no-shows and cancellations against the channel manager each evening.",
        {
          uk: "I sell room upgrades and late check-outs at check-in, adding £2,400 a month in room revenue. Your advert also says a second language is an advantage. I speak Portuguese and Spanish.",
          us: "I sell room upgrades and late check-outs at check-in, adding $3,100 a month in room revenue. Your advert also says a second language is a plus. I speak Portuguese and Spanish.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "bank-customer-adviser",
    industry: "banking",
    role: { uk: "Customer Adviser", us: "Personal Banker" },
    level: "early",
    template: "ledger",
    blurb: {
      uk: "A customer adviser with nearly three years in a high street bank branch, opening accounts, running appointments and stopping scams.",
      us: "A personal banker with nearly three years in a bank branch, opening accounts, running appointments and stopping scams.",
    },
    person: { name: "Hollie Pritchard", email: "hollie.pritchard@example.com", phone: { uk: "07700 900614", us: "(919) 555-0138" }, location: { uk: "Leicester", us: "Raleigh, NC" } },
    profile: {
      uk: "Customer adviser with nearly three years in a busy high street bank branch, after 18 months on a supermarket customer service desk. Opens 25 to 30 accounts a month and runs 12 to 15 financial review appointments a week. Stopped 9 scam payments in 12 months, protecting £86,000 of customers' savings. Studying for the Certificate in Mortgage Advice and Practice (CeMAP).",
      us: "Personal banker with nearly three years in a busy bank branch, after 18 months on a grocery store customer service desk. Opens 25 to 30 accounts a month and runs 12 to 15 financial review appointments a week. Stopped 9 scam payments in 12 months, protecting $110,000 of customers' savings. Has passed the Securities Industry Essentials (SIE) exam.",
    },
    experience: [
      {
        title: { uk: "Customer Adviser", us: "Personal Banker" },
        org: "Merrow Bank",
        location: { uk: "Leicester", us: "Raleigh, NC" },
        start: "2024-01",
        current: true,
        bullets: [
          {
            uk: "Open 25 to 30 current and savings accounts a month for new customers, checking identity and completing anti-money laundering checks on each one",
            us: "Open 25 to 30 checking and savings accounts a month for new customers, checking identity and completing anti-money laundering checks on each one",
          },
          {
            uk: "Book and run 12 to 15 financial review appointments a week, referring 4 to 6 customers a month to the branch mortgage adviser",
            us: "Schedule and run 12 to 15 financial review appointments a week, referring 4 to 6 customers a month to the branch loan officer",
          },
          {
            uk: "Stopped 9 scam payments in 12 months by asking scripted questions, calling the police under the Banking Protocol 3 times and protecting £86,000 of savings",
            us: "Stopped 9 scam payments in 12 months by asking scripted questions before large withdrawals, protecting $110,000 of customers' savings",
          },
          {
            uk: "Ran 6 fraud awareness talks for 140 older customers at the branch and 2 local community groups",
            us: "Ran 6 talks on fraud awareness and elder fraud for 140 older customers at the branch and 2 senior centers",
          },
          {
            uk: "Resolve 8 to 10 complaints a week at the counter or by phone, closing 9 in 10 within 3 working days",
            us: "Resolve 8 to 10 complaints a week at the teller line or by phone, closing 9 in 10 within 3 business days",
          },
          {
            uk: "Moved 300 customers onto the mobile banking app with one-to-one demos, cutting queues at the counter by 15% in 6 months",
            us: "Moved 300 customers onto the mobile banking app with one-to-one demos, cutting wait times in the branch by 15% in 6 months",
          },
        ],
      },
      {
        title: { uk: "Customer Service Assistant", us: "Customer Service Associate" },
        org: { uk: "Greenhill Foods", us: "Greenhill Market" },
        location: { uk: "Leicester", us: "Raleigh, NC" },
        start: "2022-06",
        end: "2023-12",
        bullets: [
          {
            uk: "Served 100 to 150 customers a shift at the customer service desk, from refunds to parcel collections and lottery sales",
            us: "Served 100 to 150 customers a shift at the customer service desk, from refunds to money orders and package pickups",
          },
          { uk: "Cashed up 4 tills each night, with no differences over £5 in 18 months", us: "Counted down 4 registers each night, with no differences over $5 in 18 months" },
          "Trained 6 new staff on refunds and the service desk, each working alone within 2 weeks",
        ],
      },
    ],
    education: [
      {
        title: { uk: "A levels in Maths, Economics and Business", us: "Associate of Arts in Business Administration" },
        org: { uk: "Abbey Park Sixth Form College", us: "Wake Technical Community College" },
        end: "2022",
        grade: { uk: "Grades A, B and B", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "Certificate in Mortgage Advice and Practice (CeMAP), in progress", us: "Securities Industry Essentials (SIE) exam, passed" },
        org: { uk: "London Institute of Banking and Finance", us: "Financial Industry Regulatory Authority (FINRA)" },
        end: "2026",
      },
    ],
    skills: [
      "Account opening",
      "Identity checks",
      "Anti-money laundering",
      "Fraud awareness",
      { uk: "Banking Protocol", us: "Elder fraud" },
      "Financial reviews",
      "Complaints",
      "Mobile banking",
      "Customer service",
    ],
    names: ["Hollie", "Pritchard", "Merrow", "Greenhill", "CeMAP"],
    letter: {
      job: {
        title: { uk: "Trainee Mortgage Adviser", us: "Mortgage Loan Officer Trainee" },
        employer: { uk: "Kestrel Vale Building Society", us: "Kestrel Vale Credit Union" },
        advert: {
          uk: `Trainee Mortgage Adviser
Kestrel Vale Building Society, Leicester

Kestrel Vale is a member-owned building society with 14 branches across the East Midlands.

The role
You will train to give mortgage advice in branch, with full support to complete CeMAP. Pay is £27,500 a year while you train.

What we are looking for
- Experience in a customer-facing role in banking or financial services
- Experience booking and running customer appointments
- Good awareness of fraud and scams
- CeMAP, or progress towards it`,
          us: `Mortgage Loan Officer Trainee
Kestrel Vale Credit Union, Raleigh, NC

Kestrel Vale is a member-owned credit union with 14 branches across North Carolina.

The role
You will train to originate home loans in branch, with full support to earn your state loan officer license. Pay is $21.00 an hour while you train.

What we are looking for
- Experience in a customer-facing role in banking or financial services
- Experience scheduling and running customer appointments
- Good awareness of fraud and scams
- The SIE or other industry exams are a plus`,
        },
      },
      reason: {
        uk: "I want to become a mortgage adviser, and I am studying for CeMAP. I also want to work for a building society owned by its members.",
        us: "I want to become a mortgage loan officer and help people buy their first home. I also want to work for a credit union owned by its members.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Trainee Mortgage Adviser at Kestrel Vale Building Society. I want to become a mortgage adviser, and I am studying for CeMAP. I also want to work for a building society owned by its members.",
          us: "I am applying for the role of Mortgage Loan Officer Trainee at Kestrel Vale Credit Union. I want to become a mortgage loan officer and help people buy their first home. I also want to work for a credit union owned by its members.",
        },
        {
          uk: "At Merrow Bank I open 25 to 30 current and savings accounts a month for new customers, checking identity and completing anti-money laundering checks on each one. I resolve 8 to 10 complaints a week at the counter or by phone, closing 9 in 10 within 3 working days. I also moved 300 customers onto the mobile banking app with one-to-one demos, cutting queues at the counter by 15% in 6 months.",
          us: "At Merrow Bank I open 25 to 30 checking and savings accounts a month for new customers, checking identity and completing anti-money laundering checks on each one. I resolve 8 to 10 complaints a week at the teller line or by phone, closing 9 in 10 within 3 business days. I also moved 300 customers onto the mobile banking app with one-to-one demos, cutting wait times in the branch by 15% in 6 months.",
        },
        {
          uk: "Your advert asks for experience booking and running customer appointments. I book and run 12 to 15 financial review appointments a week, referring 4 to 6 customers a month to the branch mortgage adviser.",
          us: "Your advert asks for experience scheduling and running customer appointments. I schedule and run 12 to 15 financial review appointments a week, referring 4 to 6 customers a month to the branch loan officer.",
        },
        {
          uk: "Your advert also asks for good awareness of fraud and scams. I stopped 9 scam payments in 12 months by asking scripted questions, calling the police under the Banking Protocol 3 times and protecting £86,000 of savings. I also ran 6 fraud awareness talks for 140 older customers at the branch and 2 local community groups.",
          us: "Your advert also asks for good awareness of fraud and scams. I stopped 9 scam payments in 12 months by asking scripted questions before large withdrawals, protecting $110,000 of customers' savings. I also ran 6 talks on fraud awareness and elder fraud for 140 older customers at the branch and 2 senior centers.",
        },
        CLOSE,
      ],
    },
  },
];
