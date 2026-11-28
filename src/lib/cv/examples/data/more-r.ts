import type { ExampleSpec } from "../types";

/** Phase 3, batch 3 (28 Nov 2026): 30 roles added to the industry packs. */
export const MORE_R: ExampleSpec[] = [
  {
    id: "radiographer",
    industry: "healthcare",
    role: { uk: "Diagnostic Radiographer", us: "Radiology Technologist" },
    level: "experienced",
    template: "ward",
    blurb: {
      uk: "A diagnostic radiographer with 8 years in NHS imaging, working in X-ray and CT, who cut the department's repeat rate and trains radiographers in CT.",
      us: "A radiology technologist with 8 years in hospital imaging, working in X-ray and CT, who cut the department's repeat rate and trains technologists in CT.",
    },
    person: { name: "Hannah Adeyinka", email: "hannah.adeyinka@example.com", phone: { uk: "07700 900708", us: "(330) 555-0131" }, location: { uk: "Sheffield", us: "Akron, OH" } },
    profile: {
      uk: "Diagnostic radiographer registered with the Health and Care Professions Council (HCPC), with 8 years in NHS imaging departments. Takes X-rays and computed tomography (CT) scans of around 45 patients a shift across the emergency department, wards and outpatient clinics. Cut the department's repeat rate for chest and limb X-rays from 4.1% to 2.3% in a year through an image audit and positioning refreshers. Trained 9 radiographers to scan in CT on night shifts, and holds a Postgraduate Certificate in Computed Tomography.",
      us: "Radiology technologist with 8 years in hospital imaging, registered in radiography and computed tomography (CT) with the ARRT and licensed by the Ohio Department of Health. Performs X-ray and CT exams for around 45 patients a shift across the emergency department, inpatient floors and outpatient clinics. Cut the department's repeat rate for chest and extremity X-rays from 4.1% to 2.3% in a year through an image audit and positioning refreshers. Trained 9 technologists to scan in CT on night shifts.",
    },
    experience: [
      {
        title: { uk: "Diagnostic Radiographer (Band 6), X-ray and CT", us: "Radiology Technologist II, X-ray and CT" },
        org: { uk: "Loxbrook Hospitals NHS Foundation Trust", us: "Loxbrook Health" },
        location: { uk: "Sheffield", us: "Akron, OH" },
        start: "2021-05",
        current: true,
        bullets: [
          {
            uk: "Take X-rays and CT scans of around 45 patients a shift across the emergency department, wards and outpatient clinics of a 1,100-bed hospital",
            us: "Perform X-ray and CT exams for around 45 patients a shift across the emergency department, inpatient floors and outpatient clinics of a 1,100-bed hospital",
          },
          "Scan around 20 stroke and major trauma patients a week in CT, completing 94% of head scans for suspected stroke within 1 hour of arrival in 2025",
          {
            uk: "Cut the repeat rate for chest and limb X-rays from 4.1% to 2.3% in a year by auditing 600 images and running positioning refreshers for 30 radiographers",
            us: "Cut the repeat rate for chest and extremity X-rays from 4.1% to 2.3% in a year by auditing 600 images and running positioning refreshers for 30 technologists",
          },
          {
            uk: "Trained 9 Band 5 radiographers to scan in CT on night shifts, each signed off within 6 months against the department's competency checklist",
            us: "Trained 9 technologists to scan in CT on night shifts, each signed off within 6 months against the department's competency checklist",
          },
          "Check kidney function, allergies and pregnancy status before around 25 contrast scans a week, with no missed checks in 3 yearly audits",
          {
            uk: "Run the department's quarterly image quality audit, scoring 400 images a quarter against the trust's standards and giving feedback to each radiographer",
            us: "Run the department's quarterly image quality audit, scoring 400 images a quarter against the hospital's standards and giving feedback to each technologist",
          },
        ],
      },
      {
        title: { uk: "Diagnostic Radiographer (Band 5)", us: "Radiology Technologist I" },
        org: { uk: "Ravenmere General Hospital NHS Trust", us: "Ravenmere Community Hospital" },
        location: { uk: "Rotherham", us: "Canton, OH" },
        start: "2018-08",
        end: "2021-04",
        bullets: [
          {
            uk: "Took X-rays of around 50 patients a shift in the emergency department, fracture clinic and outpatients",
            us: "Performed X-rays on around 50 patients a shift in the emergency department, orthopedic clinic and outpatient imaging",
          },
          {
            uk: "Imaged around 15 patients a shift on intensive care and the wards with the mobile X-ray unit during 2020",
            us: "Imaged around 15 patients a shift in intensive care and on inpatient floors with the portable X-ray unit during 2020",
          },
          {
            uk: "Ran theatre imaging with the mobile C-arm for around 8 orthopaedic operations a week, from hip fractures to spinal surgery",
            us: "Ran surgical imaging with the C-arm for around 8 orthopedic surgeries a week, from hip fractures to spinal fusions",
          },
          {
            uk: "Cut the average wait for an emergency department X-ray from 45 to 25 minutes in 2019 by moving one radiographer from outpatients at the evening peak",
            us: "Cut the average wait for an emergency department X-ray from 45 to 25 minutes in 2019 by moving one technologist from outpatient imaging at the evening peak",
          },
          {
            uk: "Completed the trust's 6-month CT training course in 2020, then covered 2 CT shifts a week",
            us: "Completed the hospital's 6-month CT training program in 2020, then covered 2 CT shifts a week",
          },
          {
            uk: "Mentored 6 student radiographers a year on 4-week clinical placements, all passing",
            us: "Mentored 6 radiography students a year on 4-week clinical rotations, all passing",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Diagnostic Radiography", us: "Associate of Applied Science in Radiography" },
        org: { uk: "Sheffield Hallam University", us: "Copley Ridge Community College" },
        end: "2018",
        grade: { uk: "2:1", us: "GPA 3.8" },
      },
    ],
    certificates: [
      {
        title: { uk: "Registered Diagnostic Radiographer", us: "Registered Technologist in Radiography" },
        org: { uk: "Health and Care Professions Council", us: "ARRT" },
        end: "2018",
      },
      {
        title: { uk: "Postgraduate Certificate in Computed Tomography", us: "Registered Technologist in Computed Tomography" },
        org: { uk: "Sheffield Hallam University", us: "ARRT" },
        end: "2022",
      },
      {
        title: "Basic Life Support",
        org: { uk: "Resuscitation Council UK", us: "American Heart Association" },
        end: "2025",
      },
    ],
    skills: [
      "CT scanning",
      "Stroke scans",
      "Patient positioning",
      "Contrast checks",
      "Image quality audits",
      { uk: "Mobile X-rays", us: "Portable X-rays" },
      { uk: "Theatre imaging", us: "Surgical imaging" },
      { uk: "Training radiographers", us: "Training technologists" },
    ],
    names: ["Hannah", "Adeyinka", "Loxbrook", "Ravenmere", "Stanecliffe", "Copley", "ARRT", "Hallam", "Sheffield", "Rotherham", "Akron", "Canton"],
    letter: {
      job: {
        title: { uk: "Senior Diagnostic Radiographer (CT)", us: "Lead CT Technologist" },
        employer: { uk: "Stanecliffe Hospitals NHS Trust", us: "Stanecliffe Health System" },
        advert: {
          uk: `Senior Diagnostic Radiographer (CT)
Stanecliffe Hospitals NHS Trust, Sheffield

Stanecliffe Hospitals NHS Trust runs 2 hospitals in South Yorkshire, with a major trauma centre and a stroke unit open around the clock. Our CT department scans around 160 patients a day across 4 scanners.

The role
You will lead CT shifts, scan emergency and planned patients, and train radiographers who are new to CT.

What we are looking for
- HCPC registration as a diagnostic radiographer
- At least 2 years of CT experience
- Experience scanning stroke and trauma patients
- Experience training or supervising radiographers
- A postgraduate qualification in CT, or willingness to work towards one

Salary £47,800 to £54,700 (Band 7)`,
          us: `Lead CT Technologist
Stanecliffe Health System, Akron, OH

Stanecliffe Health System runs 2 hospitals in Northeast Ohio, with a major trauma center and a comprehensive stroke center. Our CT department scans around 160 patients a day across 4 scanners.

The role
You will run CT shifts, scan emergency and scheduled patients, and train technologists who are new to CT.

What we are looking for
- ARRT registration in radiography and CT
- A current Ohio Department of Health radiographer license
- At least 2 years of CT experience
- Experience scanning stroke and trauma patients
- Experience training or supervising technologists

Pay $38 to $46 an hour, plus shift differential`,
        },
      },
      reason: {
        uk: "I want to work in CT full time at a major trauma centre, and I enjoy teaching other radiographers to scan.",
        us: "I want to work in CT full time at a major trauma center, and I enjoy teaching other technologists to scan.",
      },
      paragraphs: [
        {
          uk: "Stanecliffe Hospitals NHS Trust is looking for a Senior Diagnostic Radiographer (CT) to lead CT shifts and train radiographers who are new to CT, and I would like to be considered. I want to work in CT full time at a major trauma centre, and I enjoy teaching other radiographers to scan.",
          us: "Stanecliffe Health System is looking for a Lead CT Technologist to run CT shifts and train technologists who are new to CT, and I would like to be considered. I want to work in CT full time at a major trauma center, and I enjoy teaching other technologists to scan.",
        },
        {
          uk: "At Loxbrook Hospitals NHS Foundation Trust I take X-rays and CT scans of around 45 patients a shift across the emergency department, wards and outpatient clinics of a 1,100-bed hospital. Your advert asks for experience scanning stroke and trauma patients. I scan around 20 stroke and major trauma patients a week in CT, completing 94% of head scans for suspected stroke within 1 hour of arrival in 2025.",
          us: "At Loxbrook Health I perform X-ray and CT exams for around 45 patients a shift across the emergency department, inpatient floors and outpatient clinics of a 1,100-bed hospital. Your advert asks for experience scanning stroke and trauma patients. I scan around 20 stroke and major trauma patients a week in CT, completing 94% of head scans for suspected stroke within 1 hour of arrival in 2025.",
        },
        {
          uk: "You are also looking for experience training or supervising radiographers. I trained 9 Band 5 radiographers to scan in CT on night shifts, each signed off within 6 months. I also cut the repeat rate for chest and limb X-rays from 4.1% to 2.3% in a year by auditing 600 images and running positioning refreshers for 30 radiographers.",
          us: "You are also looking for experience training or supervising technologists. I trained 9 technologists to scan in CT on night shifts, each signed off within 6 months. I also cut the repeat rate for chest and extremity X-rays from 4.1% to 2.3% in a year by auditing 600 images and running positioning refreshers for 30 technologists.",
        },
        {
          uk: "I check kidney function, allergies and pregnancy status before around 25 contrast scans a week, with no missed checks in 3 yearly audits. I am registered with the Health and Care Professions Council (HCPC), and I hold a Postgraduate Certificate in Computed Tomography.",
          us: "I check kidney function, allergies and pregnancy status before around 25 contrast scans a week, with no missed checks in 3 yearly audits. I am registered in radiography and computed tomography (CT) with the ARRT, and I am licensed by the Ohio Department of Health.",
        },
        {
          uk: "Thank you for considering my application. I have attached my CV, and I would be glad to talk about the post.",
          us: "Thank you for considering my application. I have attached my resume, and I would be glad to talk about the position.",
        },
      ],
    },
  },
  {
    id: "medical-secretary",
    industry: "healthcare",
    role: "Medical Secretary",
    level: "early",
    template: "clearline",
    blurb: {
      uk: "A medical secretary for 3 orthopaedic consultants at an NHS hospital, who types around 120 clinic letters a week and cut letter turnaround from 9 days to 4.",
      us: "A medical secretary for 3 orthopedic surgeons, who types around 120 visit letters a week and cut letter turnaround from 9 days to 4.",
    },
    person: { name: "Lucy Entwistle", email: "lucy.entwistle@example.com", phone: { uk: "07700 900709", us: "(440) 555-0132" }, location: { uk: "Preston", us: "Elyria, OH" } },
    profile: {
      uk: "Medical secretary with 2 years in the trauma and orthopaedic team of an NHS hospital, after a year as an administrator at a GP surgery. Types around 120 clinic letters a week from digital dictation at 70 words per minute, and cut the average time to send a letter from 9 working days to 4. Books clinics and surgery dates for around 300 patients a month on the patient administration system. Holds the Level 3 Diploma for Medical Secretaries.",
      us: "Medical secretary with 2 years at an orthopedic practice of 3 surgeons, after a year as a front desk coordinator at a family medicine clinic. Types around 120 visit letters a week from dictation at 70 words per minute, and cut the average time to send a letter from 9 business days to 4. Schedules office visits and surgeries for around 300 patients a month in Epic. Holds the Certified Medical Administrative Assistant (CMAA) credential.",
    },
    experience: [
      {
        title: { uk: "Medical Secretary, Trauma and Orthopaedics", us: "Medical Secretary" },
        org: { uk: "Ribblemere Hospitals NHS Trust", us: "Lorain Valley Orthopedics" },
        location: { uk: "Preston", us: "Elyria, OH" },
        start: "2024-10",
        current: true,
        bullets: [
          {
            uk: "Type around 120 clinic letters a week for 3 orthopaedic consultants from digital dictation, at 70 words per minute",
            us: "Type around 120 visit letters a week for 3 orthopedic surgeons from dictation, at 70 words per minute",
          },
          {
            uk: "Cut the average time from clinic to letter sent from 9 working days to 4 in 6 months by clearing a backlog of 400 letters and sharing dictation with a second secretary",
            us: "Cut the average time from visit to letter sent from 9 business days to 4 in 6 months by clearing a backlog of 400 letters and sharing dictation with a second secretary",
          },
          {
            uk: "Book clinic appointments and surgery dates for around 300 patients a month on the patient administration system, keeping the waiting list up to date",
            us: "Schedule office visits and surgery dates for around 300 patients a month in Epic, keeping the surgery schedule up to date",
          },
          {
            uk: "Answer around 40 calls a day from patients, GPs and wards, passing urgent queries to the consultant the same day",
            us: "Answer around 40 calls a day from patients, referring doctors and the hospital, passing urgent questions to the surgeon the same day",
          },
          {
            uk: "Prepare notes, scan results and letters for 6 clinics a week, so each consultant has them 2 days ahead",
            us: "Prepare charts, imaging results and letters for 6 clinic sessions a week, so each surgeon has them 2 days ahead",
          },
          "Built a shared tracker in Excel for 140 patients waiting for surgery, cutting calls from patients asking for a date by about a third",
        ],
      },
      {
        title: { uk: "Practice Administrator", us: "Front Desk Coordinator" },
        org: { uk: "Ashtonfold Medical Practice", us: "Ashtonfold Family Medicine" },
        location: { uk: "Preston", us: "Elyria, OH" },
        start: "2023-09",
        end: "2024-09",
        bullets: [
          {
            uk: "Scanned and coded around 200 hospital letters a week into patient records on EMIS Web",
            us: "Scanned and indexed around 200 outside letters and results a week into patient charts",
          },
          {
            uk: "Typed around 30 referral letters a week from the doctors' dictation, raising typing speed from 55 to 70 words per minute in a year",
            us: "Typed around 30 referral letters a week from the physicians' dictation, raising typing speed from 55 to 70 words per minute in a year",
          },
          {
            uk: "Processed around 150 repeat prescription requests a week, passing each to the right doctor within 2 working days",
            us: "Routed around 150 prescription refill requests a week to the right physician within 2 business days",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "A levels in English Language, Biology and Business", us: "High School Diploma" },
        org: { uk: "Hollowell Sixth Form College", us: "Hollowell High School" },
        location: { uk: "Preston", us: "Elyria, OH" },
        end: "2023",
        grade: { uk: "B, C, C", us: "GPA 3.3" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 3 Diploma for Medical Secretaries", us: "Certified Medical Administrative Assistant (CMAA)" },
        org: { uk: "Association of Medical Secretaries, Practice Managers, Administrators and Receptionists", us: "National Healthcareer Association" },
        end: "2025",
      },
    ],
    skills: [
      { uk: "Clinic letters", us: "Visit letters" },
      { uk: "Digital dictation", us: "Dictation" },
      { uk: "Patient administration system", us: "Epic" },
      { uk: "Appointment booking", us: "Surgery scheduling" },
      { uk: "Waiting lists", us: "Patient charts" },
      "Referral letters",
      { uk: "Repeat prescriptions", us: "Prescription refills" },
      "Excel",
    ],
    names: ["Lucy", "Entwistle", "Ribblemere", "Ashtonfold", "Hollowell", "Fernhallow", "Lorain", "Healthcareer", "CMAA", "EMIS", "Preston", "Elyria"],
    letter: {
      job: {
        title: { uk: "Medical Secretary (Band 4), Trauma and Orthopaedics", us: "Medical Secretary" },
        employer: { uk: "Fernhallow Hospitals NHS Foundation Trust", us: "Fernhallow Spine and Joint Center" },
        advert: {
          uk: `Medical Secretary (Band 4), Trauma and Orthopaedics
Fernhallow Hospitals NHS Foundation Trust, Preston

Our trauma and orthopaedic team of 9 consultants sees around 1,500 outpatients a month at Fernhallow General Hospital.

The role
You will type clinic letters from digital dictation, manage the waiting list for 2 consultants and be the first point of contact for their patients.

What we are looking for
- At least 1 year as a medical secretary
- A typing speed of at least 60 words per minute
- Experience with digital dictation and a patient administration system
- Knowledge of medical terminology
- A medical secretary qualification, or willingness to work towards one

Salary £26,900 to £29,500 (Band 4)`,
          us: `Medical Secretary
Fernhallow Spine and Joint Center, Lorain, OH

Fernhallow Spine and Joint Center is an orthopedic practice of 12 surgeons, seeing around 1,500 patients a month across 2 offices.

The role
You will type visit letters from dictation, schedule surgery for 2 surgeons and be the first point of contact for their patients.

What we are looking for
- At least 1 year as a medical secretary or in a medical office
- A typing speed of at least 60 words per minute
- Experience with dictation and Epic
- Knowledge of medical terminology
- A medical administrative certification, or willingness to earn one

Pay $20 to $24 an hour, plus benefits`,
        },
      },
      reason: {
        uk: "I want to take on a Band 4 post with more responsibility for the waiting list.",
        us: "I want to take on more responsibility for scheduling surgery at a larger practice.",
      },
      paragraphs: [
        {
          uk: "Having typed around 120 clinic letters a week for 3 orthopaedic consultants from digital dictation, I would be glad to work in your trauma and orthopaedic team as a Medical Secretary (Band 4). I want to take on a Band 4 post with more responsibility for the waiting list.",
          us: "Having typed around 120 visit letters a week for 3 orthopedic surgeons from dictation, I would be glad to work at Fernhallow Spine and Joint Center as a Medical Secretary. I want to take on more responsibility for scheduling surgery at a larger practice.",
        },
        {
          uk: "Your advert asks for experience with digital dictation and a patient administration system. At Ribblemere Hospitals NHS Trust I book clinic appointments and surgery dates for around 300 patients a month on the patient administration system, keeping the waiting list up to date. I also built a shared tracker in Excel for 140 patients waiting for surgery, cutting calls from patients asking for a date by about a third.",
          us: "Your advert asks for experience with dictation and Epic. At Lorain Valley Orthopedics I schedule office visits and surgery dates for around 300 patients a month in Epic, keeping the surgery schedule up to date. I also built a shared tracker in Excel for 140 patients waiting for surgery, cutting calls from patients asking for a date by about a third.",
        },
        {
          uk: "I cut the average time from clinic to letter sent from 9 working days to 4 in 6 months by clearing a backlog of 400 letters and sharing dictation with a second secretary. I answer around 40 calls a day from patients, GPs and wards, passing urgent queries to the consultant the same day.",
          us: "I cut the average time from visit to letter sent from 9 business days to 4 in 6 months by clearing a backlog of 400 letters and sharing dictation with a second secretary. I answer around 40 calls a day from patients, referring doctors and the hospital, passing urgent questions to the surgeon the same day.",
        },
        {
          uk: "Previously, as a practice administrator at Ashtonfold Medical Practice, I typed around 30 referral letters a week from the doctors' dictation, raising my typing speed from 55 to 70 words per minute in a year. I hold the Level 3 Diploma for Medical Secretaries.",
          us: "Previously, as a front desk coordinator at Ashtonfold Family Medicine, I typed around 30 referral letters a week from the physicians' dictation, raising my typing speed from 55 to 70 words per minute in a year. I hold the Certified Medical Administrative Assistant (CMAA) credential.",
        },
        {
          uk: "My CV is attached. Thank you for your time, and I would welcome the chance to meet you.",
          us: "My resume is attached. Thank you for your time, and I would welcome the chance to meet you.",
        },
      ],
    },
  },
  {
    id: "mental-health-nurse",
    industry: "healthcare",
    role: { uk: "Mental Health Nurse", us: "Psychiatric Nurse" },
    level: "experienced",
    template: "chronicle",
    blurb: {
      uk: "A registered mental health nurse with 7 years on an acute ward and in a community team, now holding a caseload of 28 adults.",
      us: "A psychiatric nurse with 7 years on adult and adolescent inpatient units, now a charge nurse who cut restraint and seclusion by 35%.",
    },
    person: { name: "Daniel Asamoah", email: "daniel.asamoah@example.com", phone: { uk: "07700 900710", us: "(260) 555-0133" }, location: { uk: "Nottingham", us: "Fort Wayne, IN" } },
    profile: {
      uk: "Mental health nurse registered with the Nursing and Midwifery Council (NMC), with 7 years in adult mental health services: 3 on an acute inpatient ward and 4 in a community mental health team. Holds a caseload of 28 adults with psychosis, bipolar disorder and severe depression, and writes and reviews their care plans and risk assessments. Cut missed first appointments after a hospital discharge from 22% to 8% by calling each patient within 72 hours. Trained in the prevention and management of violence and aggression, and a practice assessor for student nurses.",
      us: "Psychiatric nurse with 7 years on adult and adolescent inpatient psychiatric units, licensed as a registered nurse (RN) in Indiana and board certified in psychiatric-mental health nursing. Works as charge nurse on a 24-bed adult unit 2 shifts a week, assigning 4 nurses and 5 mental health technicians. Cut the use of restraint and seclusion on the unit by 35% in a year by leading crisis intervention training for 40 staff. Writes nursing care plans and suicide risk assessments for each patient on admission.",
    },
    experience: [
      {
        title: { uk: "Community Mental Health Nurse (Band 6)", us: "Psychiatric Charge Nurse, Adult Inpatient Unit" },
        org: { uk: "Sherwell Healthcare NHS Foundation Trust", us: "Sherwell Behavioral Health" },
        location: { uk: "Nottingham", us: "Fort Wayne, IN" },
        start: "2022-09",
        current: true,
        bullets: [
          {
            uk: "Hold a caseload of 28 adults with psychosis, bipolar disorder and severe depression, seeing each at home or in clinic at least once a fortnight",
            us: "Care for 6 to 8 patients a shift on a 24-bed locked adult unit, and work as charge nurse 2 shifts a week, assigning 4 nurses and 5 mental health technicians",
          },
          {
            uk: "Write and review care plans and risk assessments with each patient and their family every 6 months, or sooner when risk changes",
            us: "Write nursing care plans and suicide risk assessments for around 10 new admissions a week, and update them every shift with the treatment team",
          },
          {
            uk: "Cut missed first appointments after a hospital discharge from 22% to 8% in a year by calling each patient within 72 hours",
            us: "Cut the use of restraint and seclusion on the unit by 35% in a year by leading crisis intervention training for 40 staff",
          },
          {
            uk: "Give around 60 depot injections a month in the team's clinic, and run yearly physical health checks for 90 patients on long-term medication",
            us: "Calm around 3 agitated patients a week by talking them down, using a physical hold for fewer than 1 in 10 of them",
          },
          {
            uk: "Assess around 6 urgent referrals a week on the duty rota, arranging home treatment or a hospital admission for about 1 in 5",
            us: "Give scheduled and as-needed medicines to up to 8 patients a shift, with no medication errors in 2025",
          },
          {
            uk: "Supervise 4 student nurses a year as their practice assessor, all passing their community placements",
            us: "Precept 4 nursing students a year on their psychiatric rotations, all passing",
          },
        ],
      },
      {
        title: { uk: "Mental Health Staff Nurse (Band 5), Acute Inpatient Ward", us: "Registered Nurse, Adolescent Psychiatric Unit" },
        org: { uk: "Sherwell Healthcare NHS Foundation Trust", us: "Lindenmoor Hospital" },
        location: { uk: "Mansfield", us: "Fort Wayne, IN" },
        start: "2019-09",
        end: "2022-08",
        bullets: [
          {
            uk: "Cared for up to 8 patients a shift on a 22-bed acute ward for adults, many of them detained under the Mental Health Act",
            us: "Cared for up to 6 patients a shift on a 16-bed adolescent unit for patients aged 12 to 17 with depression, self-harm and eating disorders",
          },
          {
            uk: "Cut the use of restraint on the ward by 30% in a year as one of 2 ward leads for the Safewards programme",
            us: "Ran 4 skills groups a week on coping, sleep and anger for groups of 6 to 10 teenagers",
          },
          {
            uk: "Calmed around 3 patients a week in crisis by talking them down, using physical restraint in fewer than 1 in 10 cases",
            us: "Calmed around 3 patients a week in crisis by talking them down, using a physical hold in fewer than 1 in 10 cases",
          },
          {
            uk: "Gave medicines to 22 patients on twice-daily rounds, with no medication errors in 3 years",
            us: "Gave medicines to up to 16 patients on twice-daily medication passes, with no medication errors in 3 years",
          },
          {
            uk: "Planned discharges with community teams for around 6 patients a month, booking each patient's follow-up appointment before they left",
            us: "Planned discharges with families and outpatient therapists for around 6 patients a month, booking each patient's follow-up appointment before they left",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Mental Health Nursing", us: "Bachelor of Science in Nursing (BSN)" },
        org: { uk: "University of Nottingham", us: "Purdue University Fort Wayne" },
        end: "2019",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "Registered Mental Health Nurse", us: "Registered Nurse (RN) License" },
        org: { uk: "Nursing and Midwifery Council", us: "Indiana State Board of Nursing" },
        end: "2019",
      },
      {
        title: { uk: "Prevention and Management of Violence and Aggression", us: "Psychiatric-Mental Health Nursing Certification (PMH-BC)" },
        org: { uk: "Sherwell Healthcare NHS Foundation Trust", us: "American Nurses Credentialing Center" },
        end: "2024",
      },
      {
        title: { uk: "Practice Assessor Training", us: "Nonviolent Crisis Intervention" },
        org: { uk: "University of Nottingham", us: "Crisis Prevention Institute" },
        end: "2023",
      },
    ],
    skills: [
      "Care plans",
      "Risk assessments",
      { uk: "Depot injections", us: "Crisis intervention" },
      { uk: "Physical health checks", us: "Charge nurse" },
      { uk: "Safewards", us: "Restraint and seclusion" },
      { uk: "Mental Health Act", us: "Adolescent mental health" },
      "Discharge planning",
      { uk: "Practice assessor", us: "Skills groups" },
    ],
    names: ["Daniel", "Asamoah", "Sherwell", "Lindenmoor", "Elmsworth", "Safewards", "Purdue", "Nottingham", "Mansfield", "Wayne"],
    letter: {
      job: {
        title: { uk: "Community Mental Health Nurse (Band 6), Early Intervention in Psychosis", us: "Psychiatric Charge Nurse, Adult Inpatient Unit" },
        employer: { uk: "Elmsworth Partnership NHS Foundation Trust", us: "Elmsworth Behavioral Hospital" },
        advert: {
          uk: `Community Mental Health Nurse (Band 6), Early Intervention in Psychosis
Elmsworth Partnership NHS Foundation Trust, Nottingham

Our Early Intervention in Psychosis team works with around 300 people aged 14 to 65 in their first episode of psychosis, across Nottingham and Derby.

The role
Join our team as a community mental health nurse. You will hold a caseload of around 20 people, working with them and their families for up to 3 years.

What we are looking for
- Registration with the NMC as a mental health nurse
- At least 2 years of experience in community or inpatient mental health services
- Experience writing care plans and risk assessments
- Experience giving depot injections and running physical health checks
- Experience working with families

Salary £38,700 to £46,600 (Band 6)`,
          us: `Psychiatric Charge Nurse, Adult Inpatient Unit
Elmsworth Behavioral Hospital, Fort Wayne, IN

Elmsworth Behavioral Hospital is a 120-bed psychiatric hospital for adults and adolescents across northeast Indiana. We are working to cut the use of restraint and seclusion across all of our units.

The role
Join our adult inpatient unit as a charge nurse. You will lead shifts on a 28-bed adult unit, care for patients in crisis and train staff in safe crisis intervention.

What we are looking for
- A current Indiana RN license
- At least 3 years of inpatient psychiatric nursing experience
- Charge nurse experience
- Experience reducing restraint and seclusion
- Psychiatric-mental health certification (PMH-BC), preferred

Pay $42 to $52 an hour, plus shift differential`,
        },
      },
      reason: {
        uk: "I want to work with young people in their first episode of psychosis, where early care makes the most difference.",
        us: "I want to lead the work on cutting restraint and seclusion across a larger hospital.",
      },
      paragraphs: [
        {
          uk: "I am applying to join the Early Intervention in Psychosis team at Elmsworth Partnership NHS Foundation Trust as a Community Mental Health Nurse (Band 6). I want to work with young people in their first episode of psychosis, where early care makes the most difference.",
          us: "I am applying to join Elmsworth Behavioral Hospital as a Psychiatric Charge Nurse on its adult inpatient unit. I want to lead the work on cutting restraint and seclusion across a larger hospital.",
        },
        {
          uk: "At Sherwell Healthcare NHS Foundation Trust I hold a caseload of 28 adults with psychosis, bipolar disorder and severe depression, seeing each at home or in clinic at least once a fortnight. Your advert asks for experience writing care plans and risk assessments. I write and review care plans and risk assessments with each patient and their family every 6 months, or sooner when risk changes.",
          us: "At Sherwell Behavioral Health I care for 6 to 8 patients a shift on a 24-bed locked adult unit, and I work as charge nurse 2 shifts a week, assigning 4 nurses and 5 mental health technicians. I write nursing care plans and suicide risk assessments for around 10 new admissions a week, and I update them every shift with the treatment team.",
        },
        {
          uk: "You are also looking for experience giving depot injections and running physical health checks. I give around 60 depot injections a month in the team's clinic, and I run yearly physical health checks for 90 patients on long-term medication. I also cut missed first appointments after a hospital discharge from 22% to 8% in a year by calling each patient within 72 hours.",
          us: "Your advert asks for experience reducing restraint and seclusion. I cut the use of restraint and seclusion on the unit by 35% in a year by leading crisis intervention training for 40 staff. I calm around 3 agitated patients a week by talking them down, using a physical hold for fewer than 1 in 10 of them.",
        },
        {
          uk: "Before that, I worked on an acute inpatient ward, where I cut the use of restraint on the ward by 30% in a year as one of 2 ward leads for the Safewards programme. I am registered with the Nursing and Midwifery Council (NMC) as a mental health nurse.",
          us: "Before that, I worked on an adolescent psychiatric unit at Lindenmoor Hospital, where I ran 4 skills groups a week on coping, sleep and anger for groups of 6 to 10 teenagers. I am licensed as a registered nurse (RN) in Indiana and board certified in psychiatric-mental health nursing.",
        },
        {
          uk: "Thank you for reading my letter. My CV is attached, and I would be pleased to discuss the post with you.",
          us: "Thank you for reading my letter. My resume is attached, and I would be pleased to discuss the position with you.",
        },
      ],
    },
  },
  {
    id: "medical-receptionist",
    industry: "healthcare",
    role: "Medical Receptionist",
    level: "early",
    template: "minimal",
    blurb: {
      uk: "A GP surgery receptionist who answers around 120 calls a day, handles repeat prescriptions and halved the wait to answer a call.",
      us: "A family medicine receptionist who answers around 120 calls a day, checks in 80 patients and halved the wait to answer a call.",
    },
    person: { name: "Jade Greenhalgh", email: "jade.greenhalgh@example.com", phone: { uk: "07700 900711", us: "(574) 555-0134" }, location: { uk: "Stockport", us: "South Bend, IN" } },
    profile: {
      uk: "Medical receptionist with 2 years at a GP surgery of 11,000 patients, after 3 years in supermarket customer service. Answers around 120 calls a day and checks in around 80 patients at the front desk, booking appointments on SystmOne for 9 doctors and 4 nurses. Cut the average wait to answer a call from 6 minutes to under 3 by moving 1,200 patients to the online prescription form. Processes around 250 repeat prescription requests a week, and is trained in data security and confidentiality.",
      us: "Medical receptionist with 2 years at a family medicine clinic of 11,000 patients, after 3 years in grocery store customer service. Answers around 120 calls a day and checks in around 80 patients, scheduling visits in Epic for 9 physicians and 4 nurse practitioners. Cut the average wait to answer a call from 6 minutes to under 3 by signing up 1,200 patients to the patient portal.",
    },
    experience: [
      {
        title: "Medical Receptionist",
        org: { uk: "Marplebrook Medical Practice", us: "Marplebrook Family Medicine" },
        location: { uk: "Stockport", us: "South Bend, IN" },
        start: "2024-10",
        current: true,
        bullets: [
          {
            uk: "Answer around 120 calls a day, booking same-day and routine appointments on SystmOne for 9 doctors and 4 nurses",
            us: "Answer around 120 calls a day, scheduling visits in Epic for 9 physicians and 4 nurse practitioners",
          },
          {
            uk: "Check in around 80 patients a day at the front desk, and tell the waiting room when a clinic is running more than 20 minutes late",
            us: "Check in around 80 patients a day at the front desk, scanning insurance cards and photo ID and collecting each copay",
          },
          {
            uk: "Process around 250 repeat prescription requests a week, checking each against the patient's record before passing it to the doctor",
            us: "Route around 250 prescription refill requests a week to the right care team, checking each against the chart",
          },
          {
            uk: "Cut the average wait to answer a call from 6 minutes to under 3 in 2025 by moving 1,200 patients to the online prescription form",
            us: "Cut the average wait to answer a call from 6 minutes to under 3 in 2025 by signing up 1,200 patients to the patient portal",
          },
          {
            uk: "Scan around 300 hospital letters and test results a week into patient records, with no misfiled letters in 2 audits",
            us: "Scan around 300 outside records and test results a week into patient charts, with no misfiled documents in 2 audits",
          },
          {
            uk: "Confirm 3 details of identity before giving any test results by phone, with no data protection breaches in 2 years",
            us: "Confirm 3 details of identity before giving any test results by phone, with no patient privacy breaches in 2 years",
          },
        ],
      },
      {
        title: { uk: "Customer Assistant", us: "Customer Service Associate" },
        org: "Bellhaven Foods",
        location: { uk: "Stockport", us: "Mishawaka, IN" },
        start: "2021-09",
        end: "2024-09",
        bullets: [
          {
            uk: "Served around 300 customers a shift on the tills and the customer service desk",
            us: "Served around 300 customers a shift at the registers and the customer service desk",
          },
          {
            uk: "Resolved around 20 refunds and complaints a shift at the service desk, passing 1 or 2 a week to the duty manager",
            us: "Resolved around 20 refunds and complaints a shift, passing 1 or 2 a week to the store manager",
          },
          {
            uk: "Trained 5 new starters on the tills over 2 shifts each",
            us: "Trained 5 new hires on the registers over 2 shifts each",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BTEC Level 3 National Diploma in Business", us: "High School Diploma" },
        org: { uk: "Ferncliffe College", us: "Ferncliffe High School" },
        location: { uk: "Stockport", us: "South Bend, IN" },
        end: "2021",
        grade: { uk: "Distinction, Merit", us: "GPA 3.2" },
      },
    ],
    certificates: [
      {
        title: { uk: "Data Security Awareness (Level 1)", us: "HIPAA Privacy and Security Training" },
        org: { uk: "NHS England", us: "Marplebrook Family Medicine" },
        end: "2025",
      },
      {
        title: { uk: "Emergency First Aid at Work", us: "CPR and First Aid" },
        org: { uk: "St John Ambulance", us: "American Red Cross" },
        end: "2025",
      },
    ],
    skills: [
      { uk: "SystmOne", us: "Epic" },
      { uk: "Appointment booking", us: "Scheduling" },
      { uk: "Repeat prescriptions", us: "Prescription refills" },
      "Front desk",
      "Test results",
      { uk: "Patient records", us: "Patient charts" },
      { uk: "Confidentiality", us: "Patient privacy" },
      "Customer service",
      { uk: "Training new starters", us: "Training new hires" },
    ],
    names: ["Jade", "Greenhalgh", "Marplebrook", "Bellhaven", "Ferncliffe", "Cheadlewood", "SystmOne", "Stockport", "Mishawaka", "HIPAA"],
    letter: {
      job: {
        title: "Medical Receptionist",
        employer: "Cheadlewood Health Centre",
        advert: {
          uk: `Medical Receptionist
Cheadlewood Health Centre, Stockport

Cheadlewood Health Centre is a GP practice of 18,000 patients, with 14 GPs, 6 practice nurses and a reception team of 12.

The role
You will answer calls, greet patients, book appointments and process repeat prescriptions, on a rota between 8am and 6.30pm.

What we are looking for
- At least 1 year in a GP surgery or a busy customer service role
- Experience with SystmOne or EMIS Web
- A calm, friendly manner on the phone and at the front desk
- Strong attention to confidentiality
- Willingness to help patients use online services

Pay £12.60 to £13.40 an hour`,
          us: `Medical Receptionist
Cheadlewood Health Center, South Bend, IN

Cheadlewood Health Center is a primary care clinic of 18,000 patients, with 14 physicians, 6 nurse practitioners and a front desk team of 12.

The role
You will answer calls, greet and check in patients, schedule visits and route prescription refill requests, on a rotating schedule between 7.30am and 6pm.

What we are looking for
- At least 1 year at a medical front desk or in a busy customer service role
- Experience with Epic
- A calm, friendly manner on the phone and at the front desk
- Strong attention to patient privacy
- Willingness to help patients use the patient portal

Pay $17 to $19 an hour, plus benefits`,
        },
      },
      reason: {
        uk: "I want to work in a larger practice and help more patients move to online services.",
        us: "I want to work in a larger clinic and help more patients move to the patient portal.",
      },
      paragraphs: [
        {
          uk: "I would welcome the chance to work at Cheadlewood Health Centre as a Medical Receptionist. I want to work in a larger practice and help more patients move to online services.",
          us: "I would welcome the chance to work at Cheadlewood Health Center as a Medical Receptionist. I want to work in a larger clinic and help more patients move to the patient portal.",
        },
        {
          uk: "At Marplebrook Medical Practice I answer around 120 calls a day, booking same-day and routine appointments on SystmOne for 9 doctors and 4 nurses. I also check in around 80 patients a day at the front desk, and I tell the waiting room when a clinic is running more than 20 minutes late.",
          us: "At Marplebrook Family Medicine I answer around 120 calls a day, scheduling visits in Epic for 9 physicians and 4 nurse practitioners. I also check in around 80 patients a day at the front desk, scanning insurance cards and photo ID and collecting each copay.",
        },
        {
          uk: "Your advert mentions helping patients use online services. In 2025 I cut the average wait to answer a call from 6 minutes to under 3 by moving 1,200 patients to the online prescription form. I process around 250 repeat prescription requests a week, checking each against the patient's record before passing it to the doctor.",
          us: "Your advert mentions helping patients use the patient portal. In 2025 I cut the average wait to answer a call from 6 minutes to under 3 by signing up 1,200 patients to the patient portal. I route around 250 prescription refill requests a week to the right care team, checking each against the chart.",
        },
        {
          uk: "You are also looking for strong attention to confidentiality. I confirm 3 details of identity before giving any test results by phone, with no data protection breaches in 2 years. Before that, I worked in supermarket customer service for 3 years, serving around 300 customers a shift on the tills and the customer service desk.",
          us: "You are also looking for strong attention to patient privacy. I confirm 3 details of identity before giving any test results by phone, with no patient privacy breaches in 2 years. Before that, I worked in grocery store customer service for 3 years, serving around 300 customers a shift at the registers and the customer service desk.",
        },
        {
          uk: "I have attached my CV, and I would be happy to meet the practice manager. Thank you for your consideration.",
          us: "I have attached my resume, and I would be happy to meet the clinic manager. Thank you for your consideration.",
        },
      ],
    },
  },
  {
    id: "care-home-manager",
    industry: "care",
    role: { uk: "Care Home Manager", us: "Assisted Living Administrator" },
    level: "senior",
    template: "executive",
    blurb: {
      uk: "A registered care home manager who took a 64-bed residential and dementia home from Requires Improvement to Good and filled 97% of its beds.",
      us: "A licensed assisted living administrator who cleared a 64-unit community's state survey deficiencies and raised occupancy to 97%.",
    },
    person: { name: "Gillian Fothergill", email: "gillian.fothergill@example.com", phone: { uk: "07700 900712", us: "(812) 555-0135" }, location: { uk: "Harrogate", us: "Evansville, IN" } },
    profile: {
      uk: "Registered manager of a 64-bed residential and dementia care home, with 18 years in adult social care and 6 years in charge of a home. Leads 85 staff with a £3.4 million budget. Took the home from a Care Quality Commission (CQC) rating of Requires Improvement to Good in 2 years, raised occupancy from 84% to 97% and cut staff turnover from 38% to 19%. Holds the Level 5 Diploma in Leadership for Health and Social Care.",
      us: "Licensed assisted living administrator with 18 years in senior care and 6 years running a 64-unit assisted living and memory care community. Leads 85 staff with a $4.3 million budget. Took the community from 9 deficiencies on its 2020 state survey to none in 2023 and 2025, raised occupancy from 84% to 97% and cut staff turnover from 38% to 19%. Licensed as a Residential Care Facility Administrator in Indiana, with a bachelor's degree in health services administration.",
    },
    experience: [
      {
        title: { uk: "Registered Manager", us: "Executive Director and Administrator" },
        org: { uk: "Rossendene House", us: "Rossendene Senior Living" },
        location: { uk: "Harrogate", us: "Evansville, IN" },
        start: "2020-06",
        current: true,
        bullets: [
          {
            uk: "Lead a 64-bed residential and dementia care home with 85 staff and a £3.4 million yearly budget, finishing within 2% of budget in each of the last 5 years",
            us: "Lead a 64-unit assisted living and memory care community with 85 staff and a $4.3 million yearly budget, finishing within 2% of budget in each of the last 5 years",
          },
          {
            uk: "Took the home from a Care Quality Commission rating of Requires Improvement to Good in 2 years by rewriting 64 care plans, retraining staff on medicines and running monthly mock inspections",
            us: "Took the community from 9 deficiencies on its 2020 state survey to none in 2023 and 2025 by rewriting 64 service plans, retraining staff on medication and running monthly mock surveys",
          },
          {
            uk: "Raised occupancy from 84% to 97% in 18 months by taking hospital discharge referrals from the council and holding monthly open days",
            us: "Raised occupancy from 84% to 97% in 18 months by building referral links with 3 hospitals and holding monthly open houses",
          },
          {
            uk: "Cut staff turnover from 38% to 19% in 3 years with a new induction, a career path to senior carer and rotas published 6 weeks ahead",
            us: "Cut staff turnover from 38% to 19% in 3 years with a new orientation, a career path to lead caregiver and schedules published 6 weeks ahead",
          },
          {
            uk: "Recruited 26 care assistants over 2 years, cutting agency staff spending from £21,000 to £4,000 a month",
            us: "Hired 26 caregivers over 2 years, cutting agency staff spending from $26,000 to $5,000 a month",
          },
          "Cut falls with injury by 40% in a year with a falls lead on each floor, sensor mats and a review within 24 hours of every fall",
        ],
      },
      {
        title: { uk: "Deputy Manager", us: "Assistant Administrator" },
        org: { uk: "Mossbeck Lodge", us: "Mossbeck Assisted Living" },
        location: { uk: "Knaresborough", us: "Newburgh, IN" },
        start: "2016-03",
        end: "2020-05",
        bullets: [
          {
            uk: "Ran the daily care of 48 residents with the home manager, leading 8 senior carers and 40 care staff",
            us: "Ran daily care for 48 residents with the administrator, leading 8 medication aides and 40 caregivers",
          },
          {
            uk: "Audited medicines each month across 4 floors, cutting medication errors from 9 to 2 a quarter in a year",
            us: "Audited medication records each month across 4 wings, cutting medication errors from 9 to 2 a quarter in a year",
          },
          {
            uk: "Brought in an electronic care planning system for 48 residents, training 45 staff to use it in 3 months",
            us: "Brought in an electronic health record for 48 residents, training 45 staff to use it in 3 months",
          },
          {
            uk: "Recruited and inducted 30 care staff in 2018 and 2019 for a new 16-bed dementia wing, opened on time",
            us: "Hired and trained 30 caregivers in 2018 and 2019 for a new 16-unit memory care wing, opened on time",
          },
          {
            uk: "Prepared the home for 2 Care Quality Commission inspections, both rated Good",
            us: "Prepared the community for 3 state surveys, correcting each deficiency within 30 days",
          },
          {
            uk: "Reported every safeguarding concern to the council within 24 hours, around 10 a year, and closed 95% of complaints within 20 working days",
            us: "Reported every suspected abuse case to the state within 24 hours, around 10 a year, and resolved 95% of grievances within 20 business days",
          },
        ],
      },
      {
        title: { uk: "Senior Care Assistant", us: "Lead Caregiver and Qualified Medication Aide" },
        org: "Wharfedene Court",
        location: { uk: "Ilkley", us: "Boonville, IN" },
        start: "2008-09",
        end: "2016-02",
        bullets: [
          {
            uk: "Led shifts of 6 care assistants for 32 residents, 20 of them living with dementia",
            us: "Led shifts of 6 caregivers for 32 residents, 20 of them living with dementia",
          },
          {
            uk: "Gave medicines to 32 residents on 4 rounds a day, with no errors in 3 yearly audits",
            us: "Passed medication to 32 residents 4 times a day, with no errors in 3 yearly audits",
          },
          {
            uk: "Trained 30 staff in person-centred dementia care as the home's dementia champion from 2012",
            us: "Trained 30 staff in person-centered dementia care as the community's dementia care trainer from 2012",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "Level 5 Diploma in Leadership for Health and Social Care", us: "Bachelor of Science in Health Services Administration" },
        org: { uk: "Harrogate College", us: "University of Southern Indiana" },
        location: { uk: "Harrogate", us: "Evansville, IN" },
        end: "2019",
      },
    ],
    certificates: [
      {
        title: { uk: "Registered Manager", us: "Licensed Residential Care Facility Administrator" },
        org: { uk: "Care Quality Commission", us: "Indiana Professional Licensing Agency" },
        end: "2020",
      },
      {
        title: { uk: "Level 3 Diploma in Health and Social Care (Adults)", us: "Certified Dementia Practitioner" },
        org: { uk: "City and Guilds", us: "National Council of Certified Dementia Practitioners" },
        end: "2012",
      },
    ],
    skills: [
      { uk: "Care plans", us: "Service plans" },
      { uk: "Mock inspections", us: "Mock surveys" },
      "Budgets",
      "Occupancy",
      "Staff turnover",
      { uk: "Recruitment", us: "Hiring" },
      { uk: "Safeguarding", us: "Abuse reporting" },
      "Falls reviews",
      "Dementia care",
      { uk: "Medicines audits", us: "Medication audits" },
    ],
    names: ["Gillian", "Fothergill", "Rossendene", "Mossbeck", "Wharfedene", "Heathercombe", "Harrogate", "Knaresborough", "Ilkley", "Evansville", "Newburgh", "Boonville"],
    letter: {
      job: {
        title: { uk: "Home Manager", us: "Executive Director" },
        employer: { uk: "Heathercombe Care", us: "Heathercombe Senior Living" },
        advert: {
          uk: `Home Manager
Heathercombe Care, York

Heathercombe Care runs 6 care homes across North Yorkshire. We are looking for a Home Manager for our 90-bed residential and dementia home in York, rated Requires Improvement at its last inspection.

The role
You will lead the home's staff, budget and care, and register with the Care Quality Commission as its manager.

What we are looking for
- At least 3 years as a registered manager
- A record of improving a home's inspection rating
- Experience filling beds and keeping staff
- Strong control of a home's budget
- The Level 5 Diploma in Leadership for Health and Social Care

Salary £58,000 to £64,000, plus bonus`,
          us: `Executive Director
Heathercombe Senior Living, Evansville, IN

Heathercombe Senior Living runs 6 assisted living communities across southern Indiana. We are looking for an Executive Director for our 110-unit assisted living and memory care community in Evansville, which had 7 deficiencies on its last state survey.

The role
You will lead the community's staff, budget and resident care, reporting to our regional director.

What we are looking for
- An Indiana Residential Care Facility Administrator license
- At least 3 years running an assisted living or memory care community
- A record of improving state survey results
- Experience growing occupancy and keeping staff
- Strong control of an operating budget

Salary $105,000 to $120,000, plus bonus`,
        },
      },
      reason: {
        uk: "I want to lead a larger home that needs to improve, using the same steps that took my current home to Good.",
        us: "I want to lead a larger community that needs to improve, using the same steps that cleared my current community's survey deficiencies.",
      },
      paragraphs: [
        {
          uk: "Your advert for a Home Manager at Heathercombe Care describes a residential and dementia home rated Requires Improvement, and I am applying for the post. I want to lead a larger home that needs to improve, using the same steps that took my current home to Good.",
          us: "Your advert for an Executive Director at Heathercombe Senior Living describes a community with 7 deficiencies on its last state survey, and I am applying for the position. I want to lead a larger community that needs to improve, using the same steps that cleared my current community's survey deficiencies.",
        },
        {
          uk: "At Rossendene House I lead a 64-bed residential and dementia care home with 85 staff and a £3.4 million yearly budget, finishing within 2% of budget in each of the last 5 years. Your advert asks for a record of improving a home's inspection rating. I took the home from a Care Quality Commission rating of Requires Improvement to Good in 2 years by rewriting 64 care plans, retraining staff on medicines and running monthly mock inspections.",
          us: "At Rossendene Senior Living I lead a 64-unit assisted living and memory care community with 85 staff and a $4.3 million yearly budget, finishing within 2% of budget in each of the last 5 years. Your advert asks for a record of improving state survey results. I took the community from 9 deficiencies on its 2020 state survey to none in 2023 and 2025 by rewriting 64 service plans, retraining staff on medication and running monthly mock surveys.",
        },
        {
          uk: "You are also looking for experience filling beds and keeping staff. I raised occupancy from 84% to 97% in 18 months by taking hospital discharge referrals from the council and holding monthly open days. I also cut staff turnover from 38% to 19% in 3 years with a new induction, a career path to senior carer and rotas published 6 weeks ahead.",
          us: "You are also looking for experience growing occupancy and keeping staff. I raised occupancy from 84% to 97% in 18 months by building referral links with 3 hospitals and holding monthly open houses. I also cut staff turnover from 38% to 19% in 3 years with a new orientation, a career path to lead caregiver and schedules published 6 weeks ahead.",
        },
        {
          uk: "I recruited 26 care assistants over 2 years, cutting agency staff spending from £21,000 to £4,000 a month. I hold the Level 5 Diploma in Leadership for Health and Social Care, and I have been registered with the Care Quality Commission (CQC) as a manager since 2020.",
          us: "I hired 26 caregivers over 2 years, cutting agency staff spending from $26,000 to $5,000 a month. I am licensed as a Residential Care Facility Administrator in Indiana, and I hold a bachelor's degree in health services administration.",
        },
        {
          uk: "My CV is attached. I would welcome the chance to meet you in York, and thank you for your time.",
          us: "My resume is attached. I would welcome the chance to meet you in Evansville, and thank you for your time.",
        },
      ],
    },
  },
  {
    id: "nanny",
    industry: "care",
    role: "Nanny",
    level: "experienced",
    template: "fieldwork",
    blurb: {
      uk: "An Ofsted-registered nanny with 10 years in childcare, caring for 3 children from toddler to school age, with references from both families.",
      us: "A nanny with 10 years in child care and current pediatric CPR, caring for 3 children from toddler to school age, with references from both families.",
    },
    person: { name: "Eleanor Quigley", email: "eleanor.quigley@example.com", phone: { uk: "07700 900713", us: "(217) 555-0136" }, location: { uk: "Guildford", us: "Champaign, IL" } },
    profile: {
      uk: "Nanny with 10 years in childcare, the last 8 as a full-time nanny for 2 families with children from 6 months to 8 years old. Plans each day's routine, meals and activities, does the school and nursery runs, and keeps a daily diary for the parents. Toilet trained 3 children and got baby twins sleeping through the night within 3 weeks. Registered on the Ofsted Childcare Register, with a Level 3 Diploma for the Children's Workforce, a 12-hour paediatric first aid certificate, a clean driving licence and references from both families.",
      us: "Nanny with 10 years in child care, the last 8 as a full-time nanny for 2 families with children from 6 months to 8 years old. Plans each day's routine, meals and activities, drives the children to school and preschool, and keeps a daily log for the parents. Potty trained 3 children and got baby twins sleeping through the night within 3 weeks. Holds a Child Development Associate (CDA) credential and current pediatric first aid and cardiopulmonary resuscitation (CPR) certification, with a clean driving record and references from both families.",
    },
    experience: [
      {
        title: "Nanny",
        org: "Private family (3 children)",
        location: { uk: "Guildford", us: "Champaign, IL" },
        start: "2021-09",
        current: true,
        bullets: [
          "Care for 3 children, now aged 8, 5 and 2, for 10-hour days, 4 days a week, while both parents work full time",
          {
            uk: "Do the school run for the 2 older children and the nursery run for the youngest, driving around 60 miles a week with no incidents",
            us: "Drive the 2 older children to school and the youngest to preschool, around 100 miles a week with no incidents",
          },
          {
            uk: "Cook around 15 fresh meals a week and plan a weekly routine of naps, homework and activities, shared with the parents in a daily diary app",
            us: "Cook around 15 fresh meals a week and plan a weekly routine of naps, homework and activities, shared with the parents in a daily log app",
          },
          {
            uk: "Take the children to around 4 activities a week, from swimming lessons and football to library story time",
            us: "Take the children to around 4 activities a week, from swimming lessons and soccer to library story time",
          },
          {
            uk: "Toilet trained the youngest in 3 weeks in 2026, and read with the middle child each day through Reception, with the school reporting reading above the expected level",
            us: "Potty trained the youngest in 3 weeks in 2026, and read with the middle child each day before kindergarten, with the school reporting reading above grade level",
          },
          {
            uk: "Settled the youngest into nursery 2 mornings a week in 2025 with a 3-week settling-in plan agreed with the nursery",
            us: "Settled the youngest into a preschool class for toddlers, 2 mornings a week, in 2026 with a 3-week transition plan agreed with the teachers",
          },
        ],
      },
      {
        title: "Nanny",
        org: "Private family (twins)",
        location: { uk: "Woking", us: "Urbana, IL" },
        start: "2018-05",
        end: "2021-08",
        bullets: [
          "Cared for twins from 6 months to nearly 4 years old, 5 days a week, while both parents worked full time",
          "Built a routine of naps and feeds that got both twins sleeping through the night within 3 weeks at 9 months old",
          {
            uk: "Toilet trained both twins in a month at 2 and a half, with a sticker chart agreed with the parents",
            us: "Potty trained both twins in a month at 2 and a half, with a sticker chart agreed with the parents",
          },
          "Ran around 4 activities a week at home and out, from messy play and baby swimming to music groups",
          {
            uk: "Kept a daily record of meals, sleep and milestones, shared with the health visitor at the twins' 2 development reviews",
            us: "Kept a daily record of meals, sleep and milestones, shared with the pediatrician at the twins' 7 well-child checkups",
          },
        ],
      },
      {
        title: { uk: "Nursery Practitioner", us: "Assistant Teacher" },
        org: { uk: "Pinewick Day Nursery", us: "Pinewick Child Care Center" },
        location: { uk: "Guildford", us: "Champaign, IL" },
        start: "2016-09",
        end: "2018-04",
        bullets: [
          {
            uk: "Acted as key person for 8 children aged 2 to 3 in a 60-place nursery, writing up their learning journals each month",
            us: "Acted as primary caregiver for 8 children aged 2 to 3 in a 60-child center, writing up their progress notes each month",
          },
          {
            uk: "Planned weekly activities for 12 children in the toddler room, following the Early Years Foundation Stage",
            us: "Planned weekly activities for 12 children in the toddler room, following the Illinois Early Learning Guidelines",
          },
          {
            uk: "Completed 10 progress checks at age 2, sharing each with the parents and the health visitor",
            us: "Completed 10 developmental screenings at age 2, sharing each with the parents",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "Level 3 Diploma for the Children's Workforce (Early Years Educator)", us: "Associate of Applied Science in Early Childhood Education" },
        org: { uk: "Guildford College", us: "Parkland College" },
        location: { uk: "Guildford", us: "Champaign, IL" },
        end: "2016",
        grade: { uk: "Distinction", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "Ofsted Childcare Register (voluntary part)", us: "Child Development Associate (CDA) Credential" },
        org: { uk: "Ofsted", us: "Council for Professional Recognition" },
        end: "2021",
      },
      {
        title: { uk: "Paediatric First Aid (12 hours)", us: "Pediatric First Aid, CPR and AED" },
        org: { uk: "St John Ambulance", us: "American Red Cross" },
        end: "2025",
      },
    ],
    skills: [
      "Routines",
      "Sleep routines",
      { uk: "Toilet training", us: "Potty training" },
      { uk: "School runs", us: "Driving" },
      "Cooking",
      "Activities",
      "Milestone records",
      { uk: "Early Years Foundation Stage", us: "Early learning guidelines" },
      { uk: "Paediatric first aid", us: "Pediatric CPR" },
    ],
    names: ["Eleanor", "Quigley", "Pinewick", "Hollybush", "Ofsted", "Parkland", "Guildford", "Woking", "Godalming", "Champaign", "Urbana"],
    letter: {
      job: {
        title: "Full-Time Nanny",
        employer: "Hollybush Nannies",
        advert: {
          uk: `Full-Time Nanny
Hollybush Nannies, Godalming

Hollybush Nannies is recruiting a full-time nanny for a family in Godalming with 2 children, aged 4 and 9 months. Both parents work in London.

The role
You will care for both children 45 hours a week, from morning routines and meals to the nursery run and activities.

What we are looking for
- At least 3 years as a nanny or in childcare
- Experience with babies and toddlers
- A full, clean driving licence
- A current paediatric first aid certificate
- Ofsted registration, or willingness to register
- References from previous families

Pay £16 to £18 an hour gross, plus 5.6 weeks of paid holiday`,
          us: `Full-Time Nanny
Hollybush Nannies, Champaign, IL

Hollybush Nannies is recruiting a full-time nanny for a family in Champaign with 2 children, aged 4 and 9 months. Both parents work at the university.

The role
You will care for both children 45 hours a week, from morning routines and meals to the preschool run and activities.

What we are looking for
- At least 3 years as a nanny or in child care
- Experience with babies and toddlers
- A clean driving record and your own car
- Current pediatric CPR and first aid
- References from previous families

Pay $24 to $28 an hour, plus 2 weeks of paid vacation`,
        },
      },
      reason: {
        uk: "I want a long-term, full-time role with one family, caring for a baby and a child about to start school.",
        us: "I want a long-term, full-time role with one family, caring for a baby and a preschooler.",
      },
      paragraphs: [
        {
          uk: "I am glad to apply, through Hollybush Nannies, for the full-time nanny post with a family in Godalming. I want a long-term, full-time role with one family, caring for a baby and a child about to start school.",
          us: "I am glad to apply, through Hollybush Nannies, for the full-time nanny position with a family in Champaign. I want a long-term, full-time role with one family, caring for a baby and a preschooler.",
        },
        {
          uk: "With my current family, I care for 3 children, now aged 8, 5 and 2, for 10-hour days, 4 days a week, while both parents work full time. I cook around 15 fresh meals a week and plan a weekly routine of naps, homework and activities, shared with the parents in a daily diary app. I also take the children to around 4 activities a week, from swimming lessons and football to library story time.",
          us: "With my current family, I care for 3 children, now aged 8, 5 and 2, for 10-hour days, 4 days a week, while both parents work full time. I cook around 15 fresh meals a week and plan a weekly routine of naps, homework and activities, shared with the parents in a daily log app. I also take the children to around 4 activities a week, from swimming lessons and soccer to library story time.",
        },
        {
          uk: "Your advert asks for experience with babies and toddlers. With my previous family, I cared for twins from 6 months to nearly 4 years old, 5 days a week. I built a routine of naps and feeds that got both twins sleeping through the night within 3 weeks at 9 months old, and I toilet trained both twins in a month at 2 and a half.",
          us: "Your advert asks for experience with babies and toddlers. With my previous family, I cared for twins from 6 months to nearly 4 years old, 5 days a week. I built a routine of naps and feeds that got both twins sleeping through the night within 3 weeks at 9 months old, and I potty trained both twins in a month at 2 and a half.",
        },
        {
          uk: "I do the school run for the 2 older children and the nursery run for the youngest, driving around 60 miles a week with no incidents. I am registered on the Ofsted Childcare Register, and I hold a 12-hour paediatric first aid certificate and a clean driving licence.",
          us: "I drive the 2 older children to school and the youngest to preschool, around 100 miles a week with no incidents. I hold a Child Development Associate (CDA) credential and current pediatric first aid and cardiopulmonary resuscitation (CPR) certification, with a clean driving record.",
        },
        {
          uk: "I have references from both families, and my CV is attached. Thank you for your time, and I would be glad to meet the family.",
          us: "I have references from both families, and my resume is attached. Thank you for your time, and I would be glad to meet the family.",
        },
      ],
    },
  },
];
