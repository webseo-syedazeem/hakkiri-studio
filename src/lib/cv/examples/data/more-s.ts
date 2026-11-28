import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/** Phase 3, batch 3 (28 Nov 2026): 30 roles added to the industry packs. */
export const MORE_S: ExampleSpec[] = [
  {
    id: "tutor",
    industry: "education",
    role: "Tutor",
    level: "student",
    template: "graduate",
    blurb: {
      uk: "A final-year maths student who tutors GCSE and A level maths and science online, with most of their students reaching their target grade.",
      us: "A third-year math student who tutors high school math and science online and prepares students for the math section of the SAT.",
    },
    person: { name: "Kiran Mistry", email: "kiran.mistry@example.com", phone: { uk: "07700 900714", us: "(309) 555-0137" }, location: { uk: "Sheffield", us: "Normal, IL" } },
    profile: {
      uk: "Final-year mathematics student who has tutored GCSE and A level maths, physics and chemistry for 2 years, now teaching 8 students a week online through Tutorwell. Prepared 15 students for GCSE and A level exams in 2026, and 13 reached their target grade. Rated 4.9 out of 5 by parents over 420 lessons, with a written summary sent after every lesson.",
      us: "Third-year mathematics student who has tutored high school math, physics and chemistry for 2 years, now teaching 8 students a week online through Tutorwell. Prepared 15 students for the math section of the SAT in 2026, and 13 raised their score by 60 points or more. Rated 4.9 out of 5 by parents over 420 lessons, with a written summary sent after every lesson.",
    },
    education: [
      {
        title: { uk: "BSc (Hons) Mathematics", us: "Bachelor of Science in Mathematics" },
        org: { uk: "University of Sheffield", us: "Illinois State University" },
        start: "2024-09",
        current: true,
        grade: { uk: "Second-year average of 71%", us: "GPA 3.8" },
      },
      {
        title: { uk: "A levels in Maths, Further Maths, Physics and Chemistry", us: "High School Diploma" },
        org: { uk: "Saltcote Sixth Form College", us: "Saltcote High School" },
        location: { uk: "Derby", us: "Springfield, IL" },
        end: "2024",
        grade: { uk: "A*, A*, A, A", us: "GPA 3.9" },
      },
    ],
    experience: [
      {
        title: "Online Tutor (part-time)",
        org: "Tutorwell",
        location: "Remote",
        start: "2024-10",
        current: true,
        bullets: [
          {
            uk: "Teach 8 students a week in GCSE and A level maths, physics and chemistry in online lessons",
            us: "Teach 8 students a week in high school algebra, calculus, physics and chemistry in online lessons",
          },
          {
            uk: "Prepared 15 students for GCSE and A level exams in 2026, with 13 reaching their target grade",
            us: "Prepared 15 students in 2026 for the math section of the SAT (the college admission test), with 13 raising their score by 60 points or more",
          },
          {
            uk: "Raised the average mock grade of 6 GCSE maths students from 5 to 7 through weekly past papers",
            us: "Raised the average grade of 6 algebra students from C to B+ in one semester with weekly quizzes",
          },
          "Plan each lesson from a 10-question diagnostic test, and email parents a summary within 24 hours",
          "Hold a rating of 4.9 out of 5 from parents over 420 lessons, with 6 families referring friends",
          "Wrote 30 topic worksheets with worked answers, now shared with 40 other tutors on Tutorwell",
        ],
      },
    ],
    volunteering: [
      {
        title: "Peer Mentor (volunteer)",
        org: { uk: "School of Mathematics and Statistics, University of Sheffield", us: "Department of Mathematics, Illinois State University" },
        start: "2025-09",
        current: true,
        bullets: [
          "Run a weekly drop-in session on calculus and linear algebra for 10 to 15 first-year students",
          {
            uk: "Mentor 4 first-year students through their first term, meeting each one every 2 weeks",
            us: "Mentor 4 first-year students through their first semester, meeting each one every 2 weeks",
          },
          "Wrote a 12-page guide to proof by induction, now given to every first-year student",
        ],
      },
    ],
    certificates: [
      {
        title: { uk: "Enhanced DBS check (Update Service)", us: "State and federal fingerprint background check" },
        org: { uk: "Disclosure and Barring Service", us: "Illinois State Police" },
        end: "2024",
      },
    ],
    skills: [
      { uk: "GCSE and A level maths", us: "High school math" },
      { uk: "Physics", us: "SAT math" },
      "Chemistry",
      { uk: "Exam preparation", us: "Algebra" },
      "Online tutoring",
      "Lesson planning",
      "Diagnostic tests",
      "Worksheets",
      "Mentoring",
    ],
    names: ["Kiran", "Mistry", "Tutorwell", "Saltcote", "Lanternhill"],
    letter: {
      job: {
        title: { uk: "Maths and Science Tutor (part-time)", us: "Math and Science Tutor (part-time)" },
        employer: "Lanternhill Tutors",
        advert: {
          uk: `Maths and Science Tutor (part-time)
Lanternhill Tutors, Sheffield

Lanternhill Tutors teaches 300 students a week, one-to-one and in small groups, at our Sheffield centre and online.

The role
You will tutor GCSE and A level students in maths and science for 6 to 10 hours a week, in the evenings and at weekends. Shortlisted applicants will teach a 20-minute trial lesson.

What we are looking for
- A maths or science degree, finished or under way
- At least 1 year of tutoring experience
- Experience preparing students for GCSE or A level exams
- Clear written updates for parents
- An enhanced DBS check, or willingness to apply for one

Pay £22 an hour`,
          us: `Math and Science Tutor (part-time)
Lanternhill Tutors, Bloomington, IL

Lanternhill Tutors teaches 300 students a week, one-on-one and in small groups, at our Bloomington center and online.

The role
You will tutor high school students in math and science for 6 to 10 hours a week, in the evenings and on weekends. Shortlisted applicants will teach a 20-minute trial lesson.

What we are looking for
- A math or science major, finished or in progress
- At least 1 year of tutoring experience
- Experience preparing students for the SAT
- Clear written updates for parents
- A background check

Pay $24 an hour`,
        },
      },
      reason: {
        uk: "I want to tutor more GCSE and A level students in my final year, in small groups and one-to-one.",
        us: "I want to tutor more high school students in my third year, in small groups and one-on-one.",
      },
      paragraphs: [
        {
          uk: "I have tutored GCSE and A level maths, physics and chemistry for 2 years, and I would now like to apply for the part-time Maths and Science Tutor role at Lanternhill Tutors. I want to tutor more GCSE and A level students in my final year, in small groups and one-to-one.",
          us: "I have tutored high school math, physics and chemistry for 2 years, and I would now like to apply for the part-time Math and Science Tutor role at Lanternhill Tutors. I want to tutor more high school students in my third year, in small groups and one-on-one.",
        },
        {
          uk: "At Tutorwell I teach 8 students a week in GCSE and A level maths, physics and chemistry in online lessons. Your advert asks for experience preparing students for GCSE or A level exams. I prepared 15 students for GCSE and A level exams in 2026, with 13 reaching their target grade. I also raised the average mock grade of 6 GCSE maths students from 5 to 7 through weekly past papers.",
          us: "At Tutorwell I teach 8 students a week in high school algebra, calculus, physics and chemistry in online lessons. Your advert asks for experience preparing students for the SAT. I prepared 15 students in 2026 for the math section of the SAT, with 13 raising their score by 60 points or more. I also raised the average grade of 6 algebra students from C to B+ in one semester with weekly quizzes.",
        },
        "You also mention clear written updates for parents. I plan each lesson from a 10-question diagnostic test, and I email parents a summary within 24 hours. I hold a rating of 4.9 out of 5 from parents over 420 lessons, with 6 families referring friends. I also wrote 30 topic worksheets with worked answers, now shared with 40 other tutors on Tutorwell.",
        {
          uk: "As a volunteer peer mentor I run a weekly drop-in session on calculus and linear algebra for 10 to 15 first-year students, and I wrote a 12-page guide to proof by induction, now given to every first-year student. I also hold an enhanced DBS check on the Update Service.",
          us: "As a volunteer peer mentor I run a weekly drop-in session on calculus and linear algebra for 10 to 15 first-year students, and I wrote a 12-page guide to proof by induction, now given to every first-year student. I also completed a state and federal fingerprint background check with the Illinois State Police in 2024.",
        },
        {
          uk: "My CV is attached, and I would welcome the chance to teach a trial lesson. Thank you for your time.",
          us: "My resume is attached, and I would welcome the chance to teach a trial lesson. Thank you for your time.",
        },
      ],
    },
  },
  {
    id: "headteacher",
    industry: "education",
    role: { uk: "Headteacher", us: "Principal" },
    level: "senior",
    template: "chalkboard",
    blurb: {
      uk: "A primary headteacher who took a 420-pupil school from requires improvement to good, with results, attendance and the budget all turned round.",
      us: "An elementary school principal who lifted a 420-student school's state rating, with reading results, attendance and the budget all turned around.",
    },
    person: { name: "Deborah Thorneycroft", email: "deborah.thorneycroft@example.com", phone: { uk: "07700 900715", us: "(563) 555-0138" }, location: { uk: "Peterborough", us: "Davenport, IA" } },
    profile: {
      uk: "Headteacher with 22 years in primary schools, the last 6 leading a 420-pupil primary school with 46 staff and a £2.4 million budget. Took the school from requires improvement to good at its 2023 Ofsted inspection, and raised the share of pupils meeting the expected standard in reading, writing and maths from 52% to 71%. Cut persistent absence from 19% to 8% in 3 years and balanced a budget that was heading for a £140,000 deficit. Holds the National Professional Qualification for Headship (NPQH) and Qualified Teacher Status (QTS).",
      us: "Principal with 22 years in elementary schools, the last 6 leading a 420-student elementary school with 46 staff and a $4.1 million budget. Lifted the school's state rating from Needs Improvement to Commendable, and raised the share of students proficient in reading on the Iowa Statewide Assessment of Student Progress (ISASP) from 52% to 71%. Cut chronic absenteeism from 19% to 8% in 3 years and closed a forecast budget shortfall of $210,000. Holds an Iowa administrator license as an elementary principal and a master's degree in educational leadership.",
    },
    experience: [
      {
        title: { uk: "Headteacher", us: "Principal" },
        org: { uk: "Quillfield Primary School", us: "Quillfield Elementary School" },
        location: { uk: "Peterborough", us: "Davenport, IA" },
        start: "2020-09",
        current: true,
        bullets: [
          {
            uk: "Lead a 420-pupil primary school with a staff of 46 and a £2.4 million budget, reporting to a governing board of 12",
            us: "Lead a 420-student elementary school with a staff of 46 and a $4.1 million budget, reporting to the district superintendent",
          },
          {
            uk: "Took the school from requires improvement to good at its 2023 Ofsted inspection by rewriting the curriculum with 8 subject leaders and coaching 9 teachers through weekly lesson visits",
            us: "Lifted the school's state rating from Needs Improvement to Commendable in 3 years by rewriting the reading curriculum with 6 grade-level teams and coaching 9 teachers through weekly classroom visits",
          },
          {
            uk: "Raised the share of pupils meeting the expected standard in reading, writing and maths at Key Stage 2 from 52% to 71% in 4 years through daily phonics and small-group catch-up sessions",
            us: "Raised the share of students proficient in reading on the state assessment from 52% to 71% in 4 years through daily phonics lessons and small-group intervention",
          },
          {
            uk: "Cut persistent absence from 19% to 8% in 3 years by calling families on the first morning of absence and opening a breakfast club for 60 pupils, raising attendance from 93.9% to 96.2%",
            us: "Cut chronic absenteeism from 19% to 8% in 3 years by calling families on the first morning of absence and opening a breakfast program for 60 students, raising attendance from 93.9% to 96.2%",
          },
          {
            uk: "Balanced a budget heading for a £140,000 deficit within 2 years by restructuring support staff roles and sharing a school business manager with 2 nearby schools",
            us: "Closed a forecast budget shortfall of $210,000 within 2 years by reorganizing support staff roles and sharing a business manager with 2 nearby schools",
          },
          {
            uk: "Cut teacher turnover from 6 leavers a year to 1 by giving every teacher a protected planning afternoon each half term and a mentor in their first 2 years",
            us: "Cut teacher turnover from 6 departures a year to 1 by giving every teacher a protected planning afternoon each quarter and a mentor in their first 2 years",
          },
        ],
      },
      {
        title: { uk: "Deputy Headteacher", us: "Assistant Principal" },
        org: { uk: "Copperbeech Primary School", us: "Copperbeech Elementary School" },
        location: { uk: "Stamford", us: "Bettendorf, IA" },
        start: "2015-09",
        end: "2020-08",
        bullets: [
          {
            uk: "Led teaching and learning across a 360-pupil school, running 3 staff training sessions a term for 18 teachers",
            us: "Led instruction across a 360-student school, running 3 staff training sessions a quarter for 18 teachers",
          },
          {
            uk: "Raised the share of Year 1 pupils passing the phonics screening check from 68% to 88% in 3 years by training 6 teaching assistants to run daily catch-up groups",
            us: "Raised the share of grade 3 students reading at grade level from 68% to 88% in 3 years by training 6 classroom aides to run daily intervention groups",
          },
          {
            uk: "Introduced a behaviour policy built on 3 school rules and daily praise, cutting suspensions from 9 to 1 a year",
            us: "Introduced a behavior plan built on 3 school rules and daily praise, cutting suspensions from 9 to 1 a year",
          },
          {
            uk: "Acted as designated safeguarding lead, managing around 40 cases a year with social care and the police",
            us: "Led the school's child welfare work, managing around 40 cases a year with families, school counselors and social workers",
          },
        ],
      },
      {
        title: { uk: "Class Teacher and Maths Leader", us: "Grade 4 Teacher and Math Lead" },
        org: { uk: "Mardale Primary School", us: "Mardale Elementary School" },
        location: { uk: "Spalding", us: "Dubuque, IA" },
        start: "2004-09",
        end: "2015-08",
        bullets: [
          {
            uk: "Taught Year 5 and 6 classes of 30 pupils, with 85% reaching the expected standard in maths in 2014, up from 70% in 2011",
            us: "Taught grade 4 and 5 classes of 26 students, with 85% proficient in math on the state test in 2014, up from 70% in 2011",
          },
          {
            uk: "Led maths across the school from 2011, training 14 teachers in a mastery approach and writing a calculation policy for Years 1 to 6",
            us: "Led math across the school from 2011, training 14 teachers on a new math curriculum and writing a guide to its assessments for grades 1 to 5",
          },
          {
            uk: "Mentored 8 trainee teachers through their school placements, with all 8 passing",
            us: "Mentored 8 student teachers through their placements, with all 8 passing their student teaching",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "MA Education", us: "Master of Arts in Educational Leadership" },
        org: { uk: "University of Nottingham", us: "University of Iowa" },
        end: "2013",
      },
      {
        title: { uk: "BA (Hons) Primary Education with Qualified Teacher Status", us: "Bachelor of Arts in Elementary Education" },
        org: { uk: "Nottingham Trent University", us: "University of Northern Iowa" },
        end: "2004",
        grade: { uk: "2:1", us: "GPA 3.6" },
      },
    ],
    certificates: [
      {
        title: { uk: "National Professional Qualification for Headship (NPQH)", us: "Iowa Administrator License, PK-8 Principal Endorsement" },
        org: { uk: "Department for Education", us: "Iowa Board of Educational Examiners" },
        end: "2015",
      },
      {
        title: { uk: "Qualified Teacher Status (QTS)", us: "Iowa Teaching License, Elementary Classroom" },
        org: { uk: "Teacher Training Agency", us: "Iowa Board of Educational Examiners" },
        end: "2004",
      },
    ],
    skills: [
      "School improvement",
      { uk: "Ofsted inspections", us: "State ratings" },
      { uk: "Curriculum", us: "Reading curriculum" },
      "Teacher coaching",
      "Phonics",
      "Attendance",
      "School budgets",
      { uk: "Safeguarding", us: "Child welfare" },
      { uk: "Behaviour policy", us: "Behavior plans" },
      "Staff training",
    ],
    names: ["Deborah", "Thorneycroft", "Quillfield", "Copperbeech", "Mardale", "Hollinbridge", "Peterborough", "Spalding", "Bettendorf"],
    letter: {
      job: {
        title: { uk: "Headteacher", us: "Principal" },
        employer: { uk: "Hollinbridge Primary School", us: "Hollinbridge Elementary School" },
        advert: {
          uk: `Headteacher
Hollinbridge Primary School, Peterborough

Hollinbridge is a 380-pupil primary school, judged to require improvement by Ofsted in 2024. Our governors are looking for a headteacher to raise standards and attendance before the next inspection.

The role
You will lead a staff of 40 and a budget of £2.1 million, reporting to the governing board. Leadership pay range L18 to L24.

What we are looking for
- Qualified Teacher Status, and the NPQH or progress towards it
- Experience as a headteacher or deputy headteacher
- A record of raising standards in reading, writing and maths
- A record of improving attendance
- Strong financial management of a school budget`,
          us: `Principal
Hollinbridge Elementary School, Bettendorf, IA

Hollinbridge is a 380-student elementary school, rated Needs Improvement by the state in 2025. The district is looking for a principal to lead the school to a Commendable rating within 3 years.

The role
You will lead a staff of 40 and a budget of $3.6 million, reporting to the superintendent. Salary $112,000 to $124,000.

What we are looking for
- An Iowa administrator license with a PK-8 principal endorsement
- Experience as a principal or assistant principal
- A record of raising reading achievement
- A record of improving attendance
- Strong financial management of a school budget`,
        },
      },
      reason: {
        uk: "I want to lead a second school out of requires improvement, using what worked at Quillfield.",
        us: "I want to lead a second school out of Needs Improvement, using what worked at Quillfield.",
      },
      paragraphs: [
        {
          uk: "Your governors are looking for a headteacher to raise standards and attendance at Hollinbridge Primary School before the next inspection. I would like to be that headteacher, and I want to lead a second school out of requires improvement, using what worked at Quillfield.",
          us: "Your district is looking for a principal to lead Hollinbridge Elementary School to a Commendable rating within 3 years. I would like to be that principal, and I want to lead a second school out of Needs Improvement, using what worked at Quillfield.",
        },
        {
          uk: "At Quillfield I lead a 420-pupil primary school with a staff of 46 and a £2.4 million budget, reporting to a governing board of 12. I took the school from requires improvement to good at its 2023 Ofsted inspection by rewriting the curriculum with 8 subject leaders and coaching 9 teachers through weekly lesson visits.",
          us: "At Quillfield I lead a 420-student elementary school with a staff of 46 and a $4.1 million budget, reporting to the district superintendent. I lifted the school's state rating from Needs Improvement to Commendable in 3 years by rewriting the reading curriculum with 6 grade-level teams and coaching 9 teachers through weekly classroom visits.",
        },
        {
          uk: "Your advert asks for a record of raising standards in reading, writing and maths. I raised the share of pupils meeting the expected standard in reading, writing and maths at Key Stage 2 from 52% to 71% in 4 years through daily phonics and small-group catch-up sessions. You also ask for a record of improving attendance. I cut persistent absence from 19% to 8% in 3 years by calling families on the first morning of absence and opening a breakfast club for 60 pupils, raising attendance from 93.9% to 96.2%.",
          us: "Your advert asks for a record of raising reading achievement. I raised the share of students proficient in reading on the Iowa Statewide Assessment of Student Progress (ISASP) from 52% to 71% in 4 years through daily phonics lessons and small-group intervention. You also ask for a record of improving attendance. I cut chronic absenteeism from 19% to 8% in 3 years by calling families on the first morning of absence and opening a breakfast program for 60 students, raising attendance from 93.9% to 96.2%.",
        },
        {
          uk: "Your advert also asks for strong financial management of a school budget. I balanced a budget heading for a £140,000 deficit within 2 years by restructuring support staff roles and sharing a school business manager with 2 nearby schools. I hold the National Professional Qualification for Headship (NPQH) and Qualified Teacher Status (QTS).",
          us: "Your advert also asks for strong financial management of a school budget. I closed a forecast budget shortfall of $210,000 within 2 years by reorganizing support staff roles and sharing a business manager with 2 nearby schools. I hold an Iowa administrator license with the PK-8 principal endorsement and a master's degree in educational leadership.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "assistant-store-manager",
    industry: "retail",
    role: "Assistant Store Manager",
    level: "experienced",
    template: "harbour",
    blurb: {
      uk: "An assistant store manager who runs a busy supermarket day to day, with shrinkage down, standards up and 10 weeks in charge of the store.",
      us: "An assistant store manager who runs a busy grocery store day to day, with shrink down, standards up and 10 weeks in charge of the store.",
    },
    person: { name: "Dean Ellery", email: "dean.ellery@example.com", phone: { uk: "07700 900716", us: "(319) 555-0139" }, location: { uk: "Swindon", us: "Cedar Rapids, IA" } },
    profile: {
      uk: "Assistant store manager with 9 years in supermarket and fashion retail, the last 4 at a 28,000 square foot supermarket with 92 colleagues and £540,000 in weekly sales. Cut shrinkage from 2.2% to 1.5% of sales in 2 years and raised the store's standards audit score from 81% to 94%. Ran the store for 10 weeks in 2025 while the store manager was on leave, finishing 4% ahead of sales for the same weeks the year before. Plans weekly rotas within the labour budget and has trained 6 colleagues to become shift leaders.",
      us: "Assistant store manager with 9 years in grocery and apparel retail, the last 4 at a 45,000 square foot grocery store with 92 associates and $680,000 in weekly sales. Cut shrink from 2.2% to 1.5% of sales in 2 years and raised the store's standards audit score from 81% to 94%. Ran the store for 10 weeks in 2025 while the store manager was on leave, finishing 4% ahead of sales for the same weeks the year before. Builds weekly schedules within the labor budget and has trained 6 associates to become shift leads.",
    },
    experience: [
      {
        title: "Assistant Store Manager",
        org: "Wheatsheaf Supermarkets",
        location: { uk: "Swindon", us: "Cedar Rapids, IA" },
        start: "2022-03",
        current: true,
        bullets: [
          {
            uk: "Run day-to-day trading in a 28,000 square foot supermarket with 92 colleagues and £540,000 in weekly sales, leading 5 department managers",
            us: "Run daily operations in a 45,000 square foot grocery store with 92 associates and $680,000 in weekly sales, leading 5 department managers",
          },
          {
            uk: "Cut shrinkage from 2.2% to 1.5% of sales in 2 years by moving high-theft lines into view of the tills, tightening date checks and reducing waste on bakery and produce",
            us: "Cut shrink from 2.2% to 1.5% of sales in 2 years by moving high-theft items into view of the registers, tightening date checks and reducing waste on bakery and produce",
          },
          {
            uk: "Raised the store's standards audit score from 81% to 94% in 18 months with a daily 30-minute walk of the shop floor with each department manager",
            us: "Raised the store's standards audit score from 81% to 94% in 18 months with a daily 30-minute walk of the sales floor with each department manager",
          },
          "Ran the store for 10 weeks in 2025 while the store manager was on leave, finishing 4% ahead of sales for the same weeks the year before",
          {
            uk: "Plan weekly rotas for 92 colleagues within the labour budget, keeping labour at 9.8% of sales for 3 years",
            us: "Build weekly schedules for 92 associates within the labor budget, keeping labor at 9.8% of sales for 3 years",
          },
          {
            uk: "Trained 6 colleagues to become shift leaders through a 12-week programme, with 4 now department managers",
            us: "Trained 6 associates to become shift leads through a 12-week program, with 4 now department managers",
          },
        ],
      },
      {
        title: { uk: "Fresh Food Manager", us: "Perishables Manager" },
        org: "Wheatsheaf Supermarkets",
        location: { uk: "Chippenham", us: "Iowa City, IA" },
        start: "2019-06",
        end: "2022-02",
        bullets: [
          {
            uk: "Managed the bakery, produce and chilled departments with 22 colleagues and £160,000 in weekly sales",
            us: "Managed the bakery, produce and dairy departments with 22 associates and $200,000 in weekly sales",
          },
          {
            uk: "Cut fresh food waste from 4.2% to 2.8% of sales in a year by ordering against the weather forecast and marking down short-dated lines earlier in the day",
            us: "Cut fresh food waste from 4.2% to 2.8% of sales in a year by ordering against the weather forecast and marking down items near their sell-by date earlier in the day",
          },
          "Raised on-shelf availability from 93% to 98% by moving deliveries to before 6am and filling the shelves in 2 waves",
          {
            uk: "Trained 12 colleagues in food safety and date checks, with no failed food safety audits in 3 years",
            us: "Trained 12 associates in food safety and date checks, with no failed food safety audits in 3 years",
          },
        ],
      },
      {
        title: "Sales Supervisor",
        org: "Corvell Clothing",
        location: { uk: "Bath", us: "Des Moines, IA" },
        start: "2017-04",
        end: "2019-05",
        bullets: [
          {
            uk: "Ran the shop floor on 3 shifts a week in a fashion store with 18 staff and £45,000 in weekly sales",
            us: "Ran the sales floor on 3 shifts a week in an apparel store with 18 staff and $55,000 in weekly sales",
          },
          {
            uk: "Raised the store's average transaction value from £31 to £36 in a year by coaching the team on fitting room service and add-on items",
            us: "Raised the store's average transaction value from $38 to $44 in a year by coaching the team on fitting room service and add-on items",
          },
          {
            uk: "Cut till discrepancies from 14 to 2 a quarter by bringing in end-of-shift cash counts",
            us: "Cut register shortages from 14 to 2 a quarter by bringing in end-of-shift cash counts",
          },
          "Changed over 4 seasonal floor layouts a year, each finished overnight without closing the store",
        ],
      },
    ],
    education: [
      {
        title: { uk: "A levels in Business, English Language and Geography", us: "Associate of Arts in Business Administration" },
        org: { uk: "Brindmoor Sixth Form College", us: "Hawkeye Community College" },
        location: { uk: "Swindon", us: "Waterloo, IA" },
        end: "2017",
        grade: { uk: "B, B, C", us: "GPA 3.3" },
      },
    ],
    certificates: [
      {
        title: { uk: "Level 3 Award in Food Safety Supervision for Retail", us: "ServSafe Food Protection Manager Certification" },
        org: { uk: "Highfield Qualifications", us: "National Restaurant Association" },
        end: "2020",
      },
      {
        title: { uk: "First Aid at Work", us: "First Aid, CPR and AED" },
        org: { uk: "St John Ambulance", us: "American Red Cross" },
        end: "2024",
      },
    ],
    skills: [
      "Store standards",
      { uk: "Shrinkage", us: "Shrink" },
      { uk: "Rotas", us: "Scheduling" },
      { uk: "Labour budgets", us: "Labor budgets" },
      "Fresh food",
      "Food waste",
      "On-shelf availability",
      "Food safety",
      "Coaching",
      { uk: "Shift leaders", us: "Shift leads" },
    ],
    names: ["Dean", "Ellery", "Wheatsheaf", "Corvell", "Brindmoor", "Skelwith", "Swindon", "Chippenham", "Hawkeye", "Des", "Moines", "ServSafe", "Highfield"],
    letter: {
      job: {
        title: "Assistant Store Manager",
        employer: "Skelwith Foods",
        advert: {
          uk: `Assistant Store Manager
Skelwith Foods, Swindon

Skelwith Foods runs 38 supermarkets in the South West, and opens a new 40,000 square foot superstore in north Swindon, its largest store, in spring 2027.

The role
You will run the store day to day with the store manager, lead 6 department managers and around 130 colleagues, and take charge of the store when the store manager is away.

What we are looking for
- At least 2 years as an assistant store manager or deputy manager in food retail
- A record of cutting shrinkage and waste
- High store standards and strong availability
- Rota planning within a labour budget
- Experience developing shift leaders and managers`,
          us: `Assistant Store Manager
Skelwith Foods, Cedar Rapids, IA

Skelwith Foods runs 38 grocery stores in Iowa and Illinois, and opens a new 70,000 square foot superstore in northeast Cedar Rapids, its largest store, in spring 2027.

The role
You will run the store day to day with the store manager, lead 6 department managers and around 130 associates, and take charge of the store when the store manager is away.

What we are looking for
- At least 2 years as an assistant store manager in grocery retail
- A record of cutting shrink and waste
- High store standards and strong in-stock levels
- Scheduling within a labor budget
- Experience developing shift leads and managers`,
        },
      },
      reason: "I want to open a new store and lead a bigger team, as a step towards running my own store.",
      paragraphs: [
        {
          uk: "Skelwith Foods opens its new superstore in north Swindon in spring 2027, and I would like to apply for the role of Assistant Store Manager there. I want to open a new store and lead a bigger team, as a step towards running my own store.",
          us: "Skelwith Foods opens its new superstore in northeast Cedar Rapids in spring 2027, and I would like to apply for the role of Assistant Store Manager there. I want to open a new store and lead a bigger team, as a step toward running my own store.",
        },
        {
          uk: "At Wheatsheaf Supermarkets I run day-to-day trading in a 28,000 square foot supermarket with 92 colleagues and £540,000 in weekly sales, leading 5 department managers. I ran the store for 10 weeks in 2025 while the store manager was on leave, finishing 4% ahead of sales for the same weeks the year before.",
          us: "At Wheatsheaf Supermarkets I run daily operations in a 45,000 square foot grocery store with 92 associates and $680,000 in weekly sales, leading 5 department managers. I ran the store for 10 weeks in 2025 while the store manager was on leave, finishing 4% ahead of sales for the same weeks the year before.",
        },
        {
          uk: "Your advert asks for a record of cutting shrinkage and waste. I cut shrinkage from 2.2% to 1.5% of sales in 2 years by moving high-theft lines into view of the tills, tightening date checks and reducing waste on bakery and produce. I also cut fresh food waste from 4.2% to 2.8% of sales in a year by ordering against the weather forecast.",
          us: "Your advert asks for a record of cutting shrink and waste. I cut shrink from 2.2% to 1.5% of sales in 2 years by moving high-theft items into view of the registers, tightening date checks and reducing waste on bakery and produce. I also cut fresh food waste from 4.2% to 2.8% of sales in a year by ordering against the weather forecast.",
        },
        {
          uk: "You also mention high store standards and strong availability. I raised the store's standards audit score from 81% to 94% in 18 months with a daily 30-minute walk of the shop floor with each department manager. As fresh food manager I raised on-shelf availability from 93% to 98% by moving deliveries to before 6am and filling the shelves in 2 waves. I plan weekly rotas for 92 colleagues within the labour budget, and I trained 6 colleagues to become shift leaders through a 12-week programme.",
          us: "You also mention high store standards and strong in-stock levels. I raised the store's standards audit score from 81% to 94% in 18 months with a daily 30-minute walk of the sales floor with each department manager. As perishables manager I raised on-shelf availability from 93% to 98% by moving deliveries to before 6am and filling the shelves in 2 waves. I build weekly schedules for 92 associates within the labor budget, and I trained 6 associates to become shift leads through a 12-week program.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "stock-controller",
    industry: "retail",
    role: { uk: "Stock Controller", us: "Inventory Specialist" },
    level: "early",
    template: "compact",
    blurb: {
      uk: "A stock controller who raised stock accuracy to 99% and cut stock loss at a DIY and garden store with 14,000 lines.",
      us: "An inventory specialist who raised inventory accuracy to 99% and cut shrink at a home improvement store with 14,000 items.",
    },
    person: { name: "Josh Reddaway", email: "josh.reddaway@example.com", phone: { uk: "07700 900717", us: "(605) 555-0140" }, location: { uk: "Northampton", us: "Sioux Falls, SD" } },
    profile: {
      uk: "Stock controller with 4 years in retail stockrooms, now running stock control for a DIY and garden store with 14,000 product lines and £11 million in sales in 2025. Raised stock accuracy from 94% to 99% in 18 months through weekly cycle counts, and cut unexplained stock loss from 1.6% to 0.9% of sales. Books in around 25 deliveries a week and sets replenishment levels for 2,400 fast-selling lines.",
      us: "Inventory specialist with 4 years in retail stockrooms, now managing inventory for a home improvement store with 14,000 items and $14 million in sales in 2025. Raised inventory accuracy from 94% to 99% in 18 months through weekly cycle counts, and cut unexplained shrink from 1.6% to 0.9% of sales. Receives around 25 deliveries a week and sets replenishment levels for 2,400 fast-selling items.",
    },
    experience: [
      {
        title: { uk: "Stock Controller", us: "Inventory Specialist" },
        org: "Tollgate Home and Garden",
        location: { uk: "Northampton", us: "Sioux Falls, SD" },
        start: "2024-02",
        current: true,
        bullets: [
          {
            uk: "Run stock control for a DIY and garden store with 14,000 product lines and £11 million in sales in 2025, reporting to the store manager",
            us: "Manage inventory for a home improvement store with 14,000 items and $14 million in sales in 2025, reporting to the store manager",
          },
          {
            uk: "Raised stock accuracy from 94% to 99% in 18 months by counting 300 lines a week in a rolling cycle and fixing the cause of each error",
            us: "Raised inventory accuracy from 94% to 99% in 18 months by counting 300 items a week in a rolling cycle and fixing the cause of each error",
          },
          {
            uk: "Cut unexplained stock loss from 1.6% to 0.9% of sales in 2 years by tagging 120 high-value lines and checking delivery notes against every pallet",
            us: "Cut unexplained shrink from 1.6% to 0.9% of sales in 2 years by tagging 120 high-value items and checking packing slips against every pallet",
          },
          {
            uk: "Book in around 25 deliveries a week on the stock system, raising a claim with the supplier within 48 hours for each shortage or damage",
            us: "Receive around 25 deliveries a week in the inventory system, filing a claim with the vendor within 48 hours for each shortage or damage",
          },
          {
            uk: "Set replenishment levels for 2,400 fast-selling lines, cutting gaps on the shelf from 380 to 140 a week",
            us: "Set replenishment levels for 2,400 fast-selling items, cutting empty shelf spaces from 380 to 140 a week",
          },
        ],
      },
      {
        title: { uk: "Stock Assistant", us: "Stockroom Associate" },
        org: "Marlpit Foods",
        location: { uk: "Northampton", us: "Sioux Falls, SD" },
        start: "2022-07",
        end: "2024-01",
        bullets: [
          {
            uk: "Unloaded and put away 2 deliveries a night in a supermarket stockroom with a team of 6, around 1,800 cases a shift",
            us: "Unloaded and put away 2 deliveries a night in a grocery store stockroom with a team of 6, around 1,800 cases a shift",
          },
          {
            uk: "Ran daily date checks on chilled food, with no out-of-date stock found on the shelves in 3 store audits",
            us: "Ran daily date checks on dairy and deli, with no expired products found on the shelves in 3 store audits",
          },
          {
            uk: "Counted around 600 lines in each quarterly stock count, using a forklift to reach the high racking",
            us: "Counted around 600 items in each quarterly inventory count, using a forklift to reach the high racking",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BTEC Level 3 Extended Diploma in Business", us: "Associate of Applied Science in Supply Chain Management" },
        org: { uk: "Coldwell College", us: "Southeast Technical College" },
        end: "2022",
        grade: { uk: "Distinction, Merit, Merit", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "Counterbalance and Reach Truck Licence", us: "Forklift Operator Certification" },
        org: "Marlpit Foods",
        end: "2023",
      },
      { title: "Microsoft Office Specialist: Excel Associate", org: "Microsoft", end: "2024" },
    ],
    skills: [
      { uk: "Stock control", us: "Inventory management" },
      "Cycle counts",
      { uk: "Stock accuracy", us: "Inventory accuracy" },
      { uk: "Stock loss", us: "Shrink" },
      "Deliveries",
      "Replenishment",
      { uk: "Supplier claims", us: "Vendor claims" },
      "Date checks",
      "Forklift",
    ],
    names: ["Josh", "Reddaway", "Tollgate", "Marlpit", "Coldwell", "Ferncastle"],
    letter: {
      job: {
        title: { uk: "Stock Controller", us: "Inventory Specialist" },
        employer: { uk: "Ferncastle DIY", us: "Ferncastle Home Center" },
        advert: {
          uk: `Stock Controller
Ferncastle DIY, Northampton

Ferncastle DIY runs 22 DIY and trade stores in the Midlands. Our Northampton store stocks 25,000 lines and moves to a new stock system in 2027.

The role
You will run stock control for the store, from deliveries and counts to replenishment, and help move the store onto the new system.

What we are looking for
- At least 2 years of stock control in a busy store or warehouse
- A record of improving stock accuracy
- Experience cutting stock loss
- Accurate booking in of deliveries
- A forklift licence, or willingness to train`,
          us: `Inventory Specialist
Ferncastle Home Center, Sioux Falls, SD

Ferncastle Home Center runs 22 home improvement stores in South Dakota and Minnesota. Our Sioux Falls store stocks 25,000 items and moves to a new inventory system in 2027.

The role
You will manage inventory for the store, from receiving and counts to replenishment, and help move the store onto the new system.

What we are looking for
- At least 2 years of inventory control in a busy store or warehouse
- A record of improving inventory accuracy
- Experience cutting shrink
- Accurate receiving of deliveries
- Forklift certification, or willingness to train`,
        },
      },
      reason: {
        uk: "I want to run stock control in a larger store and to work on the move to a new stock system.",
        us: "I want to manage inventory in a larger store and to work on the move to a new inventory system.",
      },
      paragraphs: [
        {
          uk: "Ferncastle DIY's move to a new stock system in 2027 is why I am applying for the Stock Controller post at your Northampton store. I want to run stock control in a larger store and to work on the move to a new stock system.",
          us: "Ferncastle Home Center's move to a new inventory system in 2027 is why I am applying for the Inventory Specialist position at your Sioux Falls store. I want to manage inventory in a larger store and to work on the move to a new inventory system.",
        },
        {
          uk: "At Tollgate Home and Garden I run stock control for a DIY and garden store with 14,000 product lines and £11 million in sales in 2025, reporting to the store manager. Your advert asks for a record of improving stock accuracy. I raised stock accuracy from 94% to 99% in 18 months by counting 300 lines a week in a rolling cycle and fixing the cause of each error.",
          us: "At Tollgate Home and Garden I manage inventory for a home improvement store with 14,000 items and $14 million in sales in 2025, reporting to the store manager. Your advert asks for a record of improving inventory accuracy. I raised inventory accuracy from 94% to 99% in 18 months by counting 300 items a week in a rolling cycle and fixing the cause of each error.",
        },
        {
          uk: "You also ask for experience cutting stock loss. I cut unexplained stock loss from 1.6% to 0.9% of sales in 2 years by tagging 120 high-value lines and checking delivery notes against every pallet. I book in around 25 deliveries a week on the stock system, raising a claim with the supplier within 48 hours for each shortage or damage.",
          us: "You also ask for experience cutting shrink. I cut unexplained shrink from 1.6% to 0.9% of sales in 2 years by tagging 120 high-value items and checking packing slips against every pallet. I receive around 25 deliveries a week in the inventory system, filing a claim with the vendor within 48 hours for each shortage or damage.",
        },
        {
          uk: "I also set replenishment levels for 2,400 fast-selling lines, cutting gaps on the shelf from 380 to 140 a week. I hold a counterbalance and reach truck licence.",
          us: "I also set replenishment levels for 2,400 fast-selling items, cutting empty shelf spaces from 380 to 140 a week. I hold a forklift operator certification.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "sous-chef",
    industry: "hospitality",
    role: "Sous Chef",
    level: "experienced",
    template: "technical",
    blurb: {
      uk: "A sous chef who runs a 14-chef hotel kitchen on the head chef's days off, with gross profit up and a food hygiene rating of 5.",
      us: "A sous chef who runs a 14-cook hotel kitchen on the executive chef's days off, with food cost down and clean health inspections.",
    },
    person: { name: "Matteo Grimaldi", email: "matteo.grimaldi@example.com", phone: { uk: "07700 900718", us: "(701) 555-0141" }, location: { uk: "Chester", us: "Fargo, ND" } },
    profile: {
      uk: "Sous chef with 10 years in hotel and restaurant kitchens, now second in charge of a hotel kitchen of 14 chefs serving a 120-cover restaurant and events for up to 250 guests. Runs the kitchen on the head chef's 2 days off each week and plans rotas, ordering and food safety checks. Raised food gross profit from 67% to 72% in 2 years by costing all 60 dishes on the menus and cutting waste by 28%. Holds the Level 3 Award in Supervising Food Safety in Catering and has kept a food hygiene rating of 5 through 3 inspections.",
      us: "Sous chef with 10 years in hotel and restaurant kitchens, now second in command of a hotel kitchen of 14 cooks serving a 120-seat restaurant and banquets for up to 250 guests. Runs the kitchen on the executive chef's 2 days off each week and plans schedules, ordering and food safety checks. Cut food cost from 33% to 28% of food sales in 2 years by costing all 60 dishes on the menus and cutting waste by 28%. Holds ServSafe Food Protection Manager certification, with no critical violations in 5 health inspections.",
    },
    experience: [
      {
        title: "Sous Chef",
        org: "The Larchwood Hotel",
        location: { uk: "Chester", us: "Fargo, ND" },
        start: "2022-10",
        current: true,
        bullets: [
          {
            uk: "Run the kitchen on the head chef's 2 days off each week, in charge of 14 chefs across a 120-cover restaurant, room service and events for up to 250 guests",
            us: "Run the kitchen on the executive chef's 2 days off each week, in charge of 14 cooks across a 120-seat restaurant, room service and banquets for up to 250 guests",
          },
          {
            uk: "Raised food gross profit from 67% to 72% in 2 years by costing all 60 dishes on the menus, setting portion sizes and cutting waste by 28%",
            us: "Cut food cost from 33% to 28% of food sales in 2 years by costing all 60 dishes on the menus, setting portion sizes and cutting waste by 28%",
          },
          {
            uk: "Developed 14 of the 40 dishes on the 2025 seasonal menus with the head chef, including a 6-course tasting menu that sells around 90 a week",
            us: "Developed 14 of the 40 dishes on the 2025 seasonal menus with the executive chef, including a 6-course tasting menu that sells around 90 a week",
          },
          {
            uk: "Cook for around 120 weddings, conferences and private dinners a year, writing the prep list and food order for each event",
            us: "Cook for around 120 weddings, conferences and private dinners a year, writing the prep list and food order for each banquet",
          },
          {
            uk: "Kept a food hygiene rating of 5 through 3 council inspections, with daily temperature, cleaning and allergen checks on a tablet app",
            us: "Passed 5 health inspections with no critical violations, with daily temperature, cleaning and allergen checks on a tablet app",
          },
          {
            uk: "Plan rotas for 14 chefs within the weekly labour budget, cutting overtime hours by 25% in a year",
            us: "Plan schedules for 14 cooks within the weekly labor budget, cutting overtime hours by 25% in a year",
          },
        ],
      },
      {
        title: "Junior Sous Chef",
        org: "Ostler's Yard",
        location: { uk: "Liverpool", us: "Minneapolis, MN" },
        start: "2019-08",
        end: "2022-09",
        bullets: [
          {
            uk: "Ran the pass at dinner in a 90-cover restaurant, serving up to 220 covers on Saturday nights",
            us: "Ran the pass at dinner in a 90-seat restaurant, serving up to 220 guests on Saturday nights",
          },
          {
            uk: "Cut average ticket times at dinner from 22 to 14 minutes by reorganising the prep list and splitting the grill section in two",
            us: "Cut average ticket times at dinner from 22 to 14 minutes by reorganizing the prep list and splitting the grill station in two",
          },
          {
            uk: "Ordered around £7,000 of food a week from 9 suppliers, checking each delivery for temperature, weight and quality",
            us: "Ordered around $8,500 of food a week from 9 vendors, checking each delivery for temperature, weight and quality",
          },
          {
            uk: "Trained 5 commis chefs to run a section on their own, with 3 moving up to chef de partie within 18 months",
            us: "Trained 5 prep cooks to run a station on their own, with 3 moving up to line cook within 18 months",
          },
          {
            uk: "Ran the Sunday lunch service each week for up to 160 covers from a 3-course set menu",
            us: "Ran Sunday brunch each week for up to 160 guests from a set menu of 12 dishes",
          },
        ],
      },
      {
        title: { uk: "Chef de Partie", us: "Line Cook" },
        org: "The Saffron Door",
        location: { uk: "Manchester", us: "Saint Paul, MN" },
        start: "2016-09",
        end: "2019-07",
        bullets: [
          {
            uk: "Ran the fish and sauce sections in a 70-cover brasserie, serving up to 180 covers a night",
            us: "Ran the fish and sauce stations in a 70-seat brasserie, serving up to 180 guests a night",
          },
          "Prepared fresh pasta and 6 sauces each morning for a menu of 24 dishes",
          "Cooked for 2 to 3 private parties a week for up to 60 guests, from buffets to plated dinners",
          {
            uk: "Moved up from commis chef to chef de partie within 14 months of joining the brasserie",
            us: "Moved up from prep cook to line cook within 14 months of joining the brasserie",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "Level 3 Diploma in Advanced Professional Cookery", us: "Associate of Applied Science in Culinary Arts" },
        org: { uk: "The Manchester College", us: "Saint Paul College" },
        end: "2016",
      },
    ],
    certificates: [
      {
        title: { uk: "Level 3 Award in Supervising Food Safety in Catering", us: "ServSafe Food Protection Manager Certification" },
        org: { uk: "Highfield Qualifications", us: "National Restaurant Association" },
        end: "2023",
      },
      {
        title: { uk: "Level 2 Award in Food Allergen Awareness", us: "ServSafe Allergens" },
        org: { uk: "Highfield Qualifications", us: "National Restaurant Association" },
        end: "2024",
      },
    ],
    skills: [
      "Menu development",
      { uk: "Gross profit", us: "Food cost" },
      "Portion sizes",
      "Food safety",
      "Allergen checks",
      { uk: "Rotas", us: "Scheduling" },
      "Food ordering",
      { uk: "Events catering", us: "Banquets" },
      "Prep lists",
      "Ticket times",
    ],
    names: ["Matteo", "Grimaldi", "Larchwood", "Ostler", "Saffron", "Upperthorpe", "commis", "de", "partie", "Highfield", "ServSafe"],
    letter: {
      job: {
        title: "Sous Chef",
        employer: "Upperthorpe House",
        advert: {
          uk: `Sous Chef
Upperthorpe House, Chester

Upperthorpe House is a 4-star country house hotel with 80 bedrooms, a 100-cover restaurant and weddings for up to 300 guests.

The role
You will be second in charge of a kitchen of 18 chefs, running the kitchen when the head chef is off and planning menus with them.

What we are looking for
- At least 2 years as a sous chef or junior sous chef
- Experience of hotel or event catering at volume
- A record of controlling food gross profit
- The Level 3 Award in Supervising Food Safety in Catering
- Experience training junior chefs`,
          us: `Sous Chef
Upperthorpe House, Fargo, ND

Upperthorpe House is a boutique hotel with 80 rooms, a 100-seat restaurant and weddings for up to 300 guests.

The role
You will be second in command of a kitchen of 18 cooks, running the kitchen when the executive chef is off and planning menus with them.

What we are looking for
- At least 2 years as a sous chef or junior sous chef
- Experience of hotel or banquet cooking at volume
- A record of controlling food cost
- ServSafe Food Protection Manager certification
- Experience training cooks`,
        },
      },
      reason: "I want to work in a larger hotel kitchen with more weddings, and to write more of the menus.",
      paragraphs: [
        {
          uk: "Each week I run the kitchen at The Larchwood Hotel on the head chef's 2 days off, and I would now like to do the same as Sous Chef at Upperthorpe House. I want to work in a larger hotel kitchen with more weddings, and to write more of the menus.",
          us: "Each week I run the kitchen at The Larchwood Hotel on the executive chef's 2 days off, and I would now like to do the same as Sous Chef at Upperthorpe House. I want to work in a larger hotel kitchen with more weddings, and to write more of the menus.",
        },
        {
          uk: "At The Larchwood Hotel I am in charge of 14 chefs across a 120-cover restaurant, room service and events for up to 250 guests. Your advert asks for experience of hotel or event catering at volume. I cook for around 120 weddings, conferences and private dinners a year, writing the prep list and food order for each event.",
          us: "At The Larchwood Hotel I am in charge of 14 cooks across a 120-seat restaurant, room service and banquets for up to 250 guests. Your advert asks for experience of hotel or banquet cooking at volume. I cook for around 120 weddings, conferences and private dinners a year, writing the prep list and food order for each banquet.",
        },
        {
          uk: "You also ask for a record of controlling food gross profit. I raised food gross profit from 67% to 72% in 2 years by costing all 60 dishes on the menus, setting portion sizes and cutting waste by 28%. I also developed 14 of the 40 dishes on the 2025 seasonal menus with the head chef, including a 6-course tasting menu that sells around 90 a week.",
          us: "You also ask for a record of controlling food cost. I cut food cost from 33% to 28% of food sales in 2 years by costing all 60 dishes on the menus, setting portion sizes and cutting waste by 28%. I also developed 14 of the 40 dishes on the 2025 seasonal menus with the executive chef, including a 6-course tasting menu that sells around 90 a week.",
        },
        {
          uk: "I hold the Level 3 Award in Supervising Food Safety in Catering, and I kept a food hygiene rating of 5 through 3 council inspections. At Ostler's Yard I trained 5 commis chefs to run a section on their own, with 3 moving up to chef de partie within 18 months.",
          us: "I hold ServSafe Food Protection Manager certification, and I passed 5 health inspections with no critical violations. At Ostler's Yard I trained 5 prep cooks to run a station on their own, with 3 moving up to line cook within 18 months.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "events-coordinator",
    industry: "hospitality",
    role: { uk: "Events Coordinator", us: "Event Coordinator" },
    level: "early",
    template: "portfolio",
    blurb: {
      uk: "An events coordinator who plans around 110 weddings, conferences and parties a year at a country house venue.",
      us: "An event coordinator who plans around 110 weddings, conferences and parties a year at a mountain lodge venue.",
    },
    person: { name: "Holly Langtree", email: "holly.langtree@example.com", phone: { uk: "07700 900719", us: "(406) 555-0142" }, location: { uk: "Ludlow", us: "Bozeman, MT" } },
    profile: {
      uk: "Events coordinator with 4 years in venue events, now planning around 110 weddings, conferences and private parties a year for 30 to 220 guests at a country house venue. Manages event budgets of up to £45,000 and a list of 40 approved suppliers, from caterers to florists. Raised the average client feedback score from 4.4 to 4.8 out of 5 in 2 years and grew conference bookings by 35% in 2025.",
      us: "Event coordinator with 4 years in venue events, now planning around 110 weddings, conferences and private parties a year for 30 to 220 guests at a mountain lodge venue. Manages event budgets of up to $55,000 and a list of 40 approved vendors, from caterers to florists. Raised the average client feedback score from 4.4 to 4.8 out of 5 in 2 years and grew conference bookings by 35% in 2025.",
    },
    experience: [
      {
        title: { uk: "Events Coordinator", us: "Event Coordinator" },
        org: { uk: "Hareswood Hall", us: "Hareswood Lodge" },
        location: { uk: "Ludlow", us: "Bozeman, MT" },
        start: "2024-03",
        current: true,
        bullets: [
          {
            uk: "Plan around 110 weddings, conferences and private parties a year for 30 to 220 guests, from the venue viewing to the day itself",
            us: "Plan around 110 weddings, conferences and private parties a year for 30 to 220 guests, from the venue tour to the day itself",
          },
          {
            uk: "Manage event budgets of up to £45,000, sending each client a costed proposal within 2 working days of their visit",
            us: "Manage event budgets of up to $55,000, sending each client a costed proposal within 2 business days of their visit",
          },
          {
            uk: "Book and brief 40 approved suppliers, from caterers and florists to bands and photographers, with a written checklist for each event",
            us: "Book and brief 40 approved vendors, from caterers and florists to bands and photographers, with a written checklist for each event",
          },
          "Raised the average client feedback score from 4.4 to 4.8 out of 5 in 2 years by holding a final planning meeting 2 weeks before each event",
          {
            uk: "Grew conference bookings by 35% in 2025 by building day-rate packages for 20 to 120 delegates and sending them to 300 local businesses",
            us: "Grew conference bookings by 35% in 2025 by building day-rate packages for 20 to 120 attendees and sending them to 300 local businesses",
          },
        ],
      },
      {
        title: { uk: "Events Assistant", us: "Event Assistant" },
        org: "Fallowmere Hotel",
        location: { uk: "Hereford", us: "Billings, MT" },
        start: "2022-07",
        end: "2024-02",
        bullets: [
          "Prepared function rooms for around 150 events a year, from 10-person meetings to 180-guest dinners",
          {
            uk: "Answered around 60 enquiries a week by phone and email, booking 1 in 4 into a show-round of the hotel",
            us: "Answered around 60 inquiries a week by phone and email, booking 1 in 4 into a tour of the hotel",
          },
          {
            uk: "Kept the bookings diary and room plans for 6 function rooms, with no double bookings in 18 months",
            us: "Kept the booking calendar and floor plans for 6 function rooms, with no double bookings in 18 months",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Events Management", us: "Bachelor of Science in Business (Marketing)" },
        org: { uk: "Leeds Beckett University", us: "Montana State University" },
        end: "2022",
        grade: { uk: "2:1", us: "GPA 3.5" },
      },
    ],
    certificates: [
      {
        title: { uk: "Personal Licence", us: "Responsible Alcohol Sales and Service Training" },
        org: { uk: "Shropshire Council", us: "Montana Department of Revenue" },
        end: "2024",
      },
    ],
    skills: [
      "Event planning",
      "Weddings",
      "Conferences",
      "Event budgets",
      "Costed proposals",
      { uk: "Supplier briefing", us: "Vendor briefing" },
      "Client feedback",
      "Function rooms",
      { uk: "Enquiries", us: "Inquiries" },
    ],
    names: ["Holly", "Langtree", "Hareswood", "Fallowmere", "Branwell", "Ludlow", "Bozeman"],
    letter: {
      job: {
        title: { uk: "Events Coordinator", us: "Event Coordinator" },
        employer: "Branwell Barns",
        advert: {
          uk: `Events Coordinator
Branwell Barns, Ludlow

Branwell Barns is a wedding and events venue with 3 restored barns, hosting 150 weddings, conferences and parties a year for up to 250 guests.

The role
You will plan and run events from first enquiry to the day itself, working with our team of 4 coordinators and our approved suppliers.

What we are looking for
- At least 2 years planning weddings or conferences
- Experience managing event budgets
- Confidence booking and briefing suppliers
- A record of strong client feedback
- A personal licence, or willingness to gain one`,
          us: `Event Coordinator
Branwell Barns, Bozeman, MT

Branwell Barns is a wedding and event venue with 3 restored barns, hosting 150 weddings, conferences and parties a year for up to 250 guests.

The role
You will plan and run events from first inquiry to the day itself, working with our team of 4 coordinators and our approved vendors.

What we are looking for
- At least 2 years planning weddings or conferences
- Experience managing event budgets
- Confidence booking and briefing vendors
- A record of strong client feedback
- Responsible alcohol service training`,
        },
      },
      reason: "I want to plan more weddings at a larger venue, and to work with a bigger events team.",
      paragraphs: [
        {
          uk: "As events coordinator at Hareswood Hall I plan around 110 weddings, conferences and private parties a year for 30 to 220 guests, and I would like to bring that experience to Branwell Barns. I want to plan more weddings at a larger venue, and to work with a bigger events team.",
          us: "As event coordinator at Hareswood Lodge I plan around 110 weddings, conferences and private parties a year for 30 to 220 guests, and I would like to bring that experience to Branwell Barns. I want to plan more weddings at a larger venue, and to work with a bigger events team.",
        },
        {
          uk: "Your advert asks for experience managing event budgets. I manage event budgets of up to £45,000, sending each client a costed proposal within 2 working days of their visit. You also ask for confidence booking and briefing suppliers. I book and brief 40 approved suppliers, from caterers and florists to bands and photographers, with a written checklist for each event.",
          us: "Your advert asks for experience managing event budgets. I manage event budgets of up to $55,000, sending each client a costed proposal within 2 business days of their visit. You also ask for confidence booking and briefing vendors. I book and brief 40 approved vendors, from caterers and florists to bands and photographers, with a written checklist for each event.",
        },
        {
          uk: "Your advert also mentions a record of strong client feedback. I raised the average client feedback score from 4.4 to 4.8 out of 5 in 2 years by holding a final planning meeting 2 weeks before each event. I also grew conference bookings by 35% in 2025 by building day-rate packages for 20 to 120 delegates and sending them to 300 local businesses.",
          us: "Your advert also mentions a record of strong client feedback. I raised the average client feedback score from 4.4 to 4.8 out of 5 in 2 years by holding a final planning meeting 2 weeks before each event. I also grew conference bookings by 35% in 2025 by building day-rate packages for 20 to 120 attendees and sending them to 300 local businesses.",
        },
        {
          uk: "At Fallowmere Hotel I prepared function rooms for around 150 events a year, from 10-person meetings to 180-guest dinners. I also hold a personal licence.",
          us: "At Fallowmere Hotel I prepared function rooms for around 150 events a year, from 10-person meetings to 180-guest dinners. I also hold Responsible Alcohol Sales and Service Training from the Montana Department of Revenue.",
        },
        CLOSE,
      ],
    },
  },
];
