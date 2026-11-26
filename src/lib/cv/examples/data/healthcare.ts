import type { ExampleSpec } from "../types";

/** Healthcare: nursing. UK: NMC registration and the NHS. US: a state RN license and a hospital system. */
export const HEALTHCARE: ExampleSpec[] = [
  {
    id: "staff-nurse",
    industry: "healthcare",
    role: { uk: "Staff Nurse", us: "Registered Nurse" },
    level: "experienced",
    template: "standard",
    blurb: { uk: "A ward nurse with five years on acute medical wards and a move into charge shifts.", us: "A medical-surgical nurse with five years at the bedside and regular charge nurse shifts." },
    person: { name: "Amara Osei", email: "amara.osei@example.com", phone: { uk: "07700 900418", us: "(312) 555-0148" }, location: { uk: "Leeds", us: "Chicago, IL" } },
    profile: {
      uk: "Registered adult nurse with five years on busy acute medical wards. Leads the ward as shift coordinator two or three times a week and mentors student nurses. Cut avoidable pressure ulcers on a 28-bed ward by 40% through a new skin check routine. Holds an Immediate Life Support certificate and is training to become a ward sister.",
      us: "Registered nurse with five years on busy medical-surgical units. Works as charge nurse two or three shifts a week and precepts nursing students. Cut hospital-acquired pressure injuries on a 28-bed unit by 40% through a new skin check routine. Holds an Advanced Cardiovascular Life Support (ACLS) certification and is training for a nurse manager role.",
    },
    experience: [
      {
        title: { uk: "Staff Nurse, Acute Medical Unit", us: "Registered Nurse, Medical-Surgical Unit" },
        org: { uk: "Northgate General Hospital NHS Trust", us: "Lakeside Medical Center" },
        location: { uk: "Leeds", us: "Chicago, IL" },
        start: "2022-04",
        current: true,
        bullets: [
          { uk: "Care for 8 to 10 acutely unwell patients a shift on a 28-bed ward, from admission to discharge", us: "Care for 5 to 6 acutely ill patients a shift on a 28-bed unit, from admission to discharge" },
          { uk: "Lead the ward as shift coordinator 2 to 3 times a week, allocating 6 nurses and 4 healthcare assistants", us: "Work as charge nurse 2 to 3 shifts a week, assigning 6 nurses and 4 patient care technicians" },
          { uk: "Introduced a twice-daily skin check routine with the tissue viability team, cutting avoidable pressure ulcers by 40% in a year", us: "Introduced a twice-daily skin check routine with the wound care team, cutting hospital-acquired pressure injuries by 40% in a year" },
          { uk: "Spot deteriorating patients early with the National Early Warning Score (NEWS2), escalating 3 to 4 patients a week to the outreach team", us: "Spot deteriorating patients early with the Modified Early Warning Score (MEWS), calling the rapid response team for 3 to 4 patients a week" },
          { uk: "Mentor 6 student nurses a year as a practice assessor, all passing their placements", us: "Precept 6 nursing students a year, all passing their clinical rotations" },
          { uk: "Plan safe discharges with therapists and social workers, cutting average stay on the ward from 7.2 to 6.1 days", us: "Plan safe discharges with therapists and case managers, cutting average length of stay on the unit from 5.2 to 4.4 days" },
        ],
      },
      {
        title: { uk: "Staff Nurse, Respiratory Ward", us: "Registered Nurse, Pulmonary Unit" },
        org: { uk: "Kingsmead Hospital NHS Trust", us: "Riverside Community Hospital" },
        location: { uk: "Bradford", us: "Evanston, IL" },
        start: "2020-09",
        end: "2022-03",
        bullets: [
          { uk: "Cared for up to 8 patients a shift with chronic lung disease, including patients on non-invasive ventilation", us: "Cared for up to 5 patients a shift with chronic lung disease, including patients on BiPAP" },
          "Gave intravenous medicines and blood transfusions safely, with no medication errors in 18 months",
          "Taught inhaler technique to around 15 patients a month, helping cut readmissions within 30 days by 12%",
          { uk: "Completed falls risk checks for every new admission, cutting falls on the ward by 25% over a year", us: "Completed fall risk checks for every new admission, cutting falls on the unit by 25% over a year" },
          { uk: "Ran a monthly teaching session on oxygen safety for 20 ward staff", us: "Ran a monthly teaching session on oxygen safety for 20 unit staff" },
          "Gave daily updates to around 10 families a week, with consent, so they knew what to expect at discharge",
        ],
      },
      {
        title: { uk: "Healthcare Assistant", us: "Certified Nursing Assistant" },
        org: { uk: "Northgate General Hospital NHS Trust", us: "Lakeside Medical Center" },
        location: { uk: "Leeds", us: "Chicago, IL" },
        start: "2017-10",
        end: "2020-08",
        bullets: [
          { uk: "Covered 2 bank shifts a week alongside nursing studies, across 6 medical and surgical wards", us: "Covered 2 per diem shifts a week alongside nursing school, across 6 medical and surgical units" },
          { uk: "Recorded observations and fluid charts for up to 12 patients a shift, flagging changes to the nurse in charge", us: "Recorded vital signs and intake and output for up to 12 patients a shift, flagging changes to the charge nurse" },
          "Gave personal care to around 20 patients a week, protecting their dignity and independence",
          { uk: "Restocked 6 ward store rooms each week by checking stock levels, so nurses never ran short of dressings", us: "Restocked 6 unit supply rooms each week by checking stock levels, so nurses never ran short of dressings" },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BSc (Hons) Adult Nursing", us: "Bachelor of Science in Nursing (BSN)" },
        org: { uk: "University of Leeds", us: "University of Illinois Chicago" },
        start: "2017",
        end: "2020",
        grade: { uk: "2:1", us: "GPA 3.7" },
      },
    ],
    certificates: [
      { title: { uk: "Registered Nurse (Adult), Nursing and Midwifery Council (NMC)", us: "Registered Nurse license, State of Illinois" }, org: { uk: "PIN 20I1234E", us: "License 041.0012345" }, end: "2020" },
      { title: { uk: "Immediate Life Support", us: "Advanced Cardiovascular Life Support (ACLS)" }, org: { uk: "Resuscitation Council UK", us: "American Heart Association" }, end: "2025" },
    ],
    skills: [
      "Patient care",
      { uk: "NEWS2", us: "MEWS" },
      "Intravenous medicines",
      "Blood transfusions",
      { uk: "Shift coordinator", us: "Charge nurse" },
      { uk: "Mentor", us: "Precepting" },
      "Discharge planning",
      "Skin checks",
      { uk: "Non-invasive ventilation", us: "BiPAP" },
    ],
    names: ["Amara", "Osei", "Northgate", "Kingsmead", "Lakeside", "BiPAP", "MEWS", "Precept", "Precepting", "Evanston"],
  },
];
