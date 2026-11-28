import type { SectionKind, TemplateId } from "../schema";
import type { IndustryId, Regional } from "./types";

/**
 * Industry packs: what a CV in each industry is expected to have. Industries
 * differ less in how a CV looks than in what it must show: a pilot lists
 * licences, type ratings and flight hours; a nurse their registration; a
 * teacher their teaching status and background check. Each pack gives the
 * common roles (named for each region), the sections to include and in what
 * order, the credentials employers look for, and the skills and keywords that
 * adverts in the industry use.
 *
 * The credentials and keywords are prompts, never content: the CV assistant
 * may ask "Do you hold a Class 1 medical?" and adds it only if the person
 * says yes.
 */
export interface IndustryRole {
  id: string;
  title: Regional<string>;
}

export interface Industry {
  id: IndustryId;
  name: Regional<string>;
  /** The template examples in this industry are shown in first. */
  template: TemplateId;
  /** The sections a CV in this industry usually has, in order after the profile. */
  sections: SectionKind[];
  roles: IndustryRole[];
  /** Licences, registrations and checks employers expect to see, where the industry has them. */
  credentials: Regional<string[]>;
  /** Skills and terms that adverts in the industry use. */
  keywords: Regional<string[]>;
}

const WORK_FIRST: SectionKind[] = ["experience", "education", "skills"];
const LICENSED: SectionKind[] = ["experience", "certificates", "education", "skills"];

export const INDUSTRIES: Industry[] = [
  {
    id: "aviation",
    name: { uk: "Aviation and aerospace", us: "Aviation and aerospace" },
    template: "standard",
    sections: LICENSED,
    roles: [
      { id: "first-officer", title: "First Officer" },
      { id: "cabin-crew", title: { uk: "Cabin Crew", us: "Flight Attendant" } },
      { id: "aircraft-maintenance-engineer", title: { uk: "Aircraft Maintenance Engineer", us: "Aircraft Maintenance Technician" } },
      { id: "air-traffic-controller", title: "Air Traffic Controller" },
      { id: "airport-operations-officer", title: { uk: "Airport Operations Officer", us: "Airport Operations Specialist" } },
      { id: "ground-handling-agent", title: { uk: "Ground Handling Agent", us: "Ramp Agent" } },
    ],
    credentials: {
      uk: ["Airline Transport Pilot Licence", "Type rating", "Class 1 medical certificate", "Licensed aircraft engineer (B1 or B2)", "Airside pass", "Safety and emergency procedures training"],
      us: ["Airline Transport Pilot certificate", "Type rating", "First-class medical certificate", "Airframe and Powerplant certificate", "Security identification display area badge", "Safety and emergency procedures training"],
    },
    keywords: { uk: ["flight hours", "multi-crew", "crew resource management", "safety management", "standard operating procedures", "customer service", "turnaround", "maintenance records"], us: ["flight hours", "multi-crew", "crew resource management", "safety management", "standard operating procedures", "customer service", "turnaround", "maintenance records"] },
  },
  {
    id: "marketing",
    name: "Marketing and advertising",
    template: "modern",
    sections: WORK_FIRST,
    roles: [
      { id: "marketing-lead", title: "Marketing Manager" },
      { id: "digital-marketing-executive", title: { uk: "Digital Marketing Executive", us: "Digital Marketing Specialist" } },
      { id: "social-media-manager", title: "Social Media Manager" },
      { id: "content-marketer", title: "Content Marketing Manager" },
      { id: "seo-specialist", title: "SEO Specialist" },
      { id: "brand-manager", title: "Brand Manager" },
      { id: "marketing-executive", title: { uk: "Marketing Executive", us: "Marketing Coordinator" } },
    ],
    credentials: { uk: ["Google Ads certification", "Chartered Institute of Marketing qualification"], us: ["Google Ads certification", "HubSpot Inbound certification"] },
    keywords: ["Google Ads", "paid social", "email marketing", "search engine optimisation", "content", "conversion rate", "campaign planning", "Google Analytics", "brand", "budget"],
  },
  {
    id: "software",
    name: "Software and IT",
    template: "technical",
    sections: ["experience", "projects", "education", "certificates", "skills"],
    roles: [
      { id: "software-engineer", title: "Senior Software Engineer" },
      { id: "devops-engineer", title: "DevOps Engineer" },
      { id: "front-end-developer", title: "Front-end Developer" },
      { id: "qa-tester", title: { uk: "QA Tester", us: "QA Analyst" } },
      { id: "it-support-technician", title: { uk: "IT Support Technician", us: "IT Support Specialist" } },
      { id: "full-stack-developer", title: "Full-Stack Developer" },
      { id: "mobile-developer", title: "Mobile Developer" },
    ],
    credentials: ["Cloud certifications", "Security clearance, where the employer needs it"],
    keywords: ["TypeScript", "JavaScript", "Python", "React", "Node.js", "SQL", "cloud", "automated testing", "code review", "agile"],
  },
  {
    id: "data",
    name: "Data and analytics",
    template: "modern",
    sections: ["experience", "projects", "education", "skills"],
    roles: [
      { id: "data-scientist", title: "Data Scientist" },
      { id: "data-analyst", title: "Data Analyst" },
      { id: "bi-developer", title: "Business Intelligence Developer" },
      { id: "data-engineer", title: "Data Engineer" },
    ],
    credentials: ["Cloud data certifications"],
    keywords: ["SQL", "Python", "dashboards", "machine learning", "statistics", "data visualisation", "forecasting", "experiments", "stakeholders", "data quality"],
  },
  {
    id: "cyber",
    name: { uk: "Cyber security", us: "Cybersecurity" },
    template: "standard",
    sections: LICENSED,
    roles: [
      { id: "cybersecurity-analyst", title: { uk: "Cyber Security Analyst", us: "Cybersecurity Analyst" } },
      { id: "soc-analyst", title: "Security Operations Centre Analyst" },
      { id: "penetration-tester", title: "Penetration Tester" },
    ],
    credentials: { uk: ["CompTIA Security+", "Certified Information Systems Security Professional", "Security clearance"], us: ["CompTIA Security+", "Certified Information Systems Security Professional", "Security clearance"] },
    keywords: ["incident response", "vulnerability management", "threat detection", "security monitoring", "risk assessment", "identity and access", "phishing", "compliance"],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    template: "standard",
    sections: LICENSED,
    roles: [
      { id: "staff-nurse", title: { uk: "Staff Nurse", us: "Registered Nurse" } },
      { id: "healthcare-assistant", title: { uk: "Healthcare Assistant", us: "Certified Nursing Assistant" } },
      { id: "paramedic", title: "Paramedic" },
      { id: "pharmacist", title: "Pharmacist" },
      { id: "physiotherapist", title: { uk: "Physiotherapist", us: "Physical Therapist" } },
      { id: "junior-doctor", title: { uk: "Junior Doctor", us: "Resident Physician" } },
      { id: "dental-nurse", title: { uk: "Dental Nurse", us: "Dental Assistant" } },
      { id: "pharmacy-technician", title: "Pharmacy Technician" },
      { id: "occupational-therapist", title: "Occupational Therapist" },
      { id: "radiographer", title: { uk: "Diagnostic Radiographer", us: "Radiology Technologist" } },
      { id: "medical-secretary", title: "Medical Secretary" },
      { id: "mental-health-nurse", title: { uk: "Mental Health Nurse", us: "Psychiatric Nurse" } },
      { id: "medical-receptionist", title: "Medical Receptionist" },
    ],
    credentials: {
      uk: ["Nursing and Midwifery Council registration", "Health and Care Professions Council registration", "General Medical Council registration", "Enhanced background check", "Basic or immediate life support"],
      us: ["State nursing license", "State professional license", "Board certification", "Background check", "Basic or advanced life support"],
    },
    keywords: ["patient care", "patient safety", "medicines", "infection control", "documentation", "teamwork", "discharge planning", "safeguarding"],
  },
  {
    id: "care",
    name: { uk: "Care and social work", us: "Social services" },
    template: "minimal",
    sections: LICENSED,
    roles: [
      { id: "care-worker", title: { uk: "Care Worker", us: "Caregiver" } },
      { id: "support-worker", title: { uk: "Support Worker", us: "Direct Support Professional" } },
      { id: "social-worker", title: "Social Worker" },
      { id: "care-home-manager", title: { uk: "Care Home Manager", us: "Assisted Living Administrator" } },
      { id: "nanny", title: "Nanny" },
    ],
    credentials: { uk: ["Care Certificate", "Social Work England registration", "Enhanced background check", "Driving licence"], us: ["State caregiver certification", "Licensed social worker", "Background check", "Driver's license"] },
    keywords: ["person-centred care", "safeguarding", "care plans", "medication support", "record keeping", "communication", "dignity", "risk assessment"],
  },
  {
    id: "education",
    name: "Education",
    template: "standard",
    sections: LICENSED,
    roles: [
      { id: "primary-teacher", title: { uk: "Primary School Teacher", us: "Elementary School Teacher" } },
      { id: "secondary-teacher", title: { uk: "Secondary School Teacher", us: "High School Teacher" } },
      { id: "teaching-assistant", title: { uk: "Teaching Assistant", us: "Teacher's Aide" } },
      { id: "send-teacher", title: { uk: "Special Educational Needs Teacher", us: "Special Education Teacher" } },
      { id: "lecturer", title: { uk: "Lecturer", us: "College Instructor" } },
      { id: "nursery-practitioner", title: { uk: "Nursery Practitioner", us: "Preschool Teacher" } },
      { id: "tutor", title: "Tutor" },
      { id: "headteacher", title: { uk: "Headteacher", us: "Principal" } },
    ],
    credentials: { uk: ["Qualified Teacher Status", "Enhanced background check", "Postgraduate Certificate in Education"], us: ["State teaching license", "Background check", "Teaching certification"] },
    keywords: ["lesson planning", "curriculum", "assessment", "behaviour management", "differentiation", "safeguarding", "progress", "parents"],
  },
  {
    id: "finance",
    name: "Finance and accounting",
    template: "standard",
    sections: LICENSED,
    roles: [
      { id: "finance-analyst", title: "Financial Analyst" },
      { id: "accountant", title: "Accountant" },
      { id: "bookkeeper", title: "Bookkeeper" },
      { id: "payroll-officer", title: { uk: "Payroll Officer", us: "Payroll Specialist" } },
      { id: "auditor", title: "Auditor" },
      { id: "credit-controller", title: { uk: "Credit Controller", us: "Collections Specialist" } },
      { id: "accounts-payable-clerk", title: { uk: "Purchase Ledger Clerk", us: "Accounts Payable Clerk" } },
      { id: "finance-manager", title: "Finance Manager" },
    ],
    credentials: { uk: ["Association of Chartered Certified Accountants", "Chartered Institute of Management Accountants", "Association of Accounting Technicians"], us: ["Certified Public Accountant", "Chartered Financial Analyst", "Certified Management Accountant"] },
    keywords: ["forecasting", "budgeting", "month-end", "reconciliations", "financial models", "variance analysis", "Excel", "audit", "compliance", "reporting"],
  },
  {
    id: "banking",
    name: "Banking and insurance",
    template: "standard",
    sections: LICENSED,
    roles: [
      { id: "mortgage-adviser", title: { uk: "Mortgage Adviser", us: "Loan Officer" } },
      { id: "underwriter", title: "Underwriter" },
      { id: "claims-handler", title: { uk: "Claims Handler", us: "Claims Adjuster" } },
      { id: "bank-customer-adviser", title: { uk: "Bank Customer Adviser", us: "Personal Banker" } },
      { id: "financial-adviser", title: { uk: "Financial Adviser", us: "Financial Advisor" } },
      { id: "branch-manager", title: "Branch Manager" },
    ],
    credentials: { uk: ["Certificate in Mortgage Advice and Practice", "Chartered Insurance Institute qualification"], us: ["State loan officer license", "State insurance adjuster license"] },
    keywords: ["customer needs", "regulation", "risk", "lending", "claims", "compliance", "sales targets", "complaints"],
  },
  {
    id: "sales",
    name: "Sales",
    template: "modern",
    sections: WORK_FIRST,
    roles: [
      { id: "sales-executive", title: { uk: "Sales Executive", us: "Sales Representative" } },
      { id: "account-manager", title: "Account Manager" },
      { id: "business-development-rep", title: { uk: "Business Development Representative", us: "Sales Development Representative" } },
      { id: "sales-manager", title: "Sales Manager" },
      { id: "field-sales-rep", title: { uk: "Field Sales Representative", us: "Outside Sales Representative" } },
    ],
    credentials: { uk: ["Driving licence"], us: ["Driver's license"] },
    keywords: ["pipeline", "targets", "negotiation", "prospecting", "account management", "customer relationships", "forecasting", "Salesforce"],
  },
  {
    id: "retail",
    name: "Retail",
    template: "minimal",
    sections: WORK_FIRST,
    roles: [
      { id: "store-manager", title: "Store Manager" },
      { id: "retail-assistant", title: { uk: "Retail Assistant", us: "Retail Sales Associate" } },
      { id: "visual-merchandiser", title: "Visual Merchandiser" },
      { id: "cashier", title: "Cashier" },
      { id: "assistant-store-manager", title: "Assistant Store Manager" },
      { id: "stock-controller", title: { uk: "Stock Controller", us: "Inventory Specialist" } },
    ],
    credentials: [],
    keywords: { uk: ["customer service", "sales targets", "stock control", "merchandising", "cash handling", "team leadership", "rotas", "loss prevention"], us: ["customer service", "sales goals", "inventory control", "merchandising", "cash handling", "team leadership", "scheduling", "loss prevention"] },
  },
  {
    id: "hospitality",
    name: { uk: "Hospitality and catering", us: "Hospitality and food service" },
    template: "minimal",
    sections: LICENSED,
    roles: [
      { id: "chef", title: "Chef" },
      { id: "restaurant-manager", title: "Restaurant Manager" },
      { id: "bartender", title: "Bartender" },
      { id: "hotel-receptionist", title: { uk: "Hotel Receptionist", us: "Front Desk Agent" } },
      { id: "waiter", title: { uk: "Waiter", us: "Server" } },
      { id: "barista", title: "Barista" },
      { id: "sous-chef", title: "Sous Chef" },
      { id: "events-coordinator", title: { uk: "Events Coordinator", us: "Event Coordinator" } },
      { id: "housekeeper", title: { uk: "Room Attendant", us: "Housekeeper" } },
    ],
    credentials: { uk: ["Food hygiene certificate", "Personal licence to sell alcohol"], us: ["Food handler card", "Responsible alcohol service certification"] },
    keywords: ["food safety", "customer service", "covers", "stock control", "menus", "team leadership", "bookings", "upselling"],
  },
  {
    id: "customer-service",
    name: "Customer service",
    template: "minimal",
    sections: WORK_FIRST,
    roles: [
      { id: "customer-service-adviser", title: { uk: "Customer Service Adviser", us: "Customer Service Representative" } },
      { id: "call-centre-agent", title: { uk: "Call Centre Agent", us: "Call Center Agent" } },
      { id: "customer-success", title: "Customer Success Manager" },
      { id: "customer-service-team-leader", title: { uk: "Customer Service Team Leader", us: "Customer Service Supervisor" } },
    ],
    credentials: [],
    keywords: ["customer satisfaction", "first contact resolution", "complaints", "call handling", "customer relationship management systems", "renewals", "onboarding", "service levels"],
  },
  {
    id: "admin",
    name: "Administration and office",
    template: "minimal",
    sections: WORK_FIRST,
    roles: [
      { id: "executive-assistant", title: "Executive Assistant" },
      { id: "office-manager", title: "Office Manager" },
      { id: "receptionist", title: "Receptionist" },
      { id: "administrator", title: { uk: "Administrator", us: "Administrative Assistant" } },
      { id: "personal-assistant", title: "Personal Assistant" },
      { id: "data-entry-clerk", title: "Data Entry Clerk" },
    ],
    credentials: [],
    keywords: { uk: ["diary management", "minutes", "travel booking", "event planning", "Microsoft Office", "filing", "confidentiality", "invoices"], us: ["calendar management", "minutes", "travel booking", "event planning", "Microsoft Office", "filing", "confidentiality", "invoices"] },
  },
  {
    id: "hr",
    name: "Human resources and recruitment",
    template: "standard",
    sections: LICENSED,
    roles: [
      { id: "hr-adviser", title: { uk: "HR Adviser", us: "HR Generalist" } },
      { id: "recruiter", title: { uk: "Recruitment Consultant", us: "Recruiter" } },
      { id: "people-partner", title: { uk: "HR Business Partner", us: "HR Business Partner" } },
      { id: "hr-assistant", title: "HR Assistant" },
    ],
    credentials: { uk: ["Chartered Institute of Personnel and Development qualification"], us: ["Professional in Human Resources", "SHRM Certified Professional"] },
    keywords: ["employee relations", "recruitment", "onboarding", "policies", "employment law", "absence management", "engagement", "workforce planning"],
  },
  {
    id: "legal",
    name: "Legal",
    template: "executive",
    sections: LICENSED,
    roles: [
      { id: "paralegal", title: "Paralegal" },
      { id: "solicitor", title: { uk: "Solicitor", us: "Attorney" } },
      { id: "legal-secretary", title: { uk: "Legal Secretary", us: "Legal Assistant" } },
    ],
    credentials: { uk: ["Admitted as a solicitor", "Solicitors Qualifying Examination", "Practising certificate"], us: ["Admitted to the state bar", "Juris Doctor", "Paralegal certificate"] },
    keywords: ["case management", "drafting", "legal research", "due diligence", "contracts", "court filings", "client care", "deadlines"],
  },
  {
    id: "engineering",
    name: "Engineering",
    template: "technical",
    sections: LICENSED,
    roles: [
      { id: "mechanical-engineer", title: "Mechanical Engineer" },
      { id: "electrical-engineer", title: "Electrical Engineer" },
      { id: "civil-engineer", title: "Civil Engineer" },
      { id: "project-engineer", title: "Project Engineer" },
    ],
    credentials: { uk: ["Chartered Engineer", "Incorporated Engineer", "Construction site safety card"], us: ["Professional Engineer license", "Engineer in Training", "Occupational safety training"] },
    keywords: ["design", "computer-aided design", "testing", "specifications", "project delivery", "health and safety", "quality", "root cause analysis"],
  },
  {
    id: "construction",
    name: "Construction and trades",
    template: "compact",
    sections: LICENSED,
    roles: [
      { id: "site-manager", title: { uk: "Site Manager", us: "Construction Superintendent" } },
      { id: "electrician", title: "Electrician" },
      { id: "plumber", title: "Plumber" },
      { id: "quantity-surveyor", title: { uk: "Quantity Surveyor", us: "Cost Estimator" } },
      { id: "carpenter", title: "Carpenter" },
      { id: "hvac-technician", title: { uk: "HVAC Engineer", us: "HVAC Technician" } },
      { id: "construction-labourer", title: { uk: "Labourer", us: "Construction Laborer" } },
      { id: "bricklayer", title: { uk: "Bricklayer", us: "Mason" } },
    ],
    credentials: { uk: ["Construction Skills Certification Scheme card", "18th Edition wiring regulations", "Gas Safe registration", "Site Management Safety Training Scheme"], us: ["Occupational Safety and Health Administration 10 or 30 card", "State electrician license", "State plumbing license"] },
    keywords: { uk: ["health and safety", "programme", "subcontractors", "inspections", "estimating", "quality", "building regulations", "snagging"], us: ["safety", "schedule", "subcontractors", "inspections", "estimating", "quality", "building codes", "punch lists"] },
  },
  {
    id: "logistics",
    name: { uk: "Logistics and supply chain", us: "Logistics and supply chain" },
    template: "compact",
    sections: LICENSED,
    roles: [
      { id: "warehouse-operative", title: { uk: "Warehouse Operative", us: "Warehouse Associate" } },
      { id: "logistics-coordinator", title: "Logistics Coordinator" },
      { id: "hgv-driver", title: { uk: "HGV Driver", us: "Truck Driver" } },
      { id: "supply-chain-analyst", title: "Supply Chain Analyst" },
      { id: "delivery-driver", title: "Delivery Driver" },
      { id: "warehouse-supervisor", title: "Warehouse Supervisor" },
      { id: "forklift-driver", title: { uk: "Forklift Driver", us: "Forklift Operator" } },
    ],
    credentials: { uk: ["Class 1 or Class 2 driving licence", "Driver Certificate of Professional Competence", "Forklift licence"], us: ["Commercial driver's license", "Forklift certification", "Hazardous materials endorsement"] },
    keywords: ["picking", "stock accuracy", "on-time delivery", "route planning", "inventory", "health and safety", "warehouse management system", "forecasting"],
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    template: "compact",
    sections: LICENSED,
    roles: [
      { id: "production-operative", title: { uk: "Production Operative", us: "Production Worker" } },
      { id: "quality-inspector", title: "Quality Inspector" },
      { id: "maintenance-technician", title: { uk: "Maintenance Engineer", us: "Maintenance Technician" } },
      { id: "cnc-machinist", title: "CNC Machinist" },
      { id: "production-supervisor", title: "Production Supervisor" },
    ],
    credentials: { uk: ["Forklift licence", "Lean or Six Sigma training"], us: ["Forklift certification", "Lean or Six Sigma training"] },
    keywords: ["production targets", "quality checks", "lean", "health and safety", "preventive maintenance", "machine set-up", "continuous improvement", "downtime"],
  },
  {
    id: "projects",
    name: "Projects and product",
    template: "consulting",
    sections: LICENSED,
    roles: [
      { id: "project-manager", title: "Project Manager" },
      { id: "product-manager", title: "Product Manager" },
      { id: "scrum-master", title: "Scrum Master" },
      { id: "project-coordinator", title: "Project Coordinator" },
    ],
    credentials: { uk: ["Project Management Professional", "PRINCE2", "Certified ScrumMaster"], us: ["Project Management Professional", "Certified ScrumMaster", "Certified Associate in Project Management"] },
    keywords: ["planning", "budgets", "risks", "stakeholders", "agile", "roadmaps", "delivery", "prioritisation"],
  },
  {
    id: "business",
    name: "Business and consulting",
    template: "consulting",
    sections: LICENSED,
    roles: [
      { id: "business-analyst", title: "Business Analyst" },
      { id: "operations-manager", title: "Operations Manager" },
      { id: "management-consultant", title: "Management Consultant" },
    ],
    credentials: [],
    keywords: ["requirements", "process improvement", "workshops", "stakeholders", "data analysis", "business cases", "change management", "reporting"],
  },
  {
    id: "design",
    name: "Design and creative",
    template: "creative",
    sections: ["experience", "projects", "education", "skills"],
    roles: [
      { id: "graphic-designer", title: "Graphic Designer" },
      { id: "ux-designer", title: "UX Designer" },
      { id: "copywriter", title: "Copywriter" },
      { id: "video-editor", title: "Video Editor" },
      { id: "interior-designer", title: "Interior Designer" },
    ],
    credentials: [],
    keywords: ["Figma", "Adobe Creative Cloud", "brand guidelines", "user research", "prototypes", "copy", "motion", "accessibility"],
  },
  {
    id: "media",
    name: "Media and communications",
    template: "modern",
    sections: WORK_FIRST,
    roles: [
      { id: "journalist", title: { uk: "Journalist", us: "Reporter" } },
      { id: "pr-executive", title: { uk: "PR Executive", us: "Public Relations Specialist" } },
      { id: "communications-officer", title: { uk: "Communications Officer", us: "Communications Specialist" } },
    ],
    credentials: { uk: ["National Council for the Training of Journalists diploma"], us: [] },
    keywords: ["press releases", "media relations", "editing", "deadlines", "social media", "internal communications", "storytelling", "crisis communications"],
  },
  {
    id: "public-sector",
    name: { uk: "Public sector", us: "Government" },
    template: "standard",
    sections: WORK_FIRST,
    roles: [
      { id: "civil-servant", title: { uk: "Civil Servant (Executive Officer)", us: "Program Analyst (Federal)" } },
      { id: "policy-officer", title: { uk: "Policy Officer", us: "Policy Analyst" } },
      { id: "police-officer", title: "Police Officer" },
      { id: "firefighter", title: "Firefighter" },
      { id: "prison-officer", title: { uk: "Prison Officer", us: "Correctional Officer" } },
    ],
    credentials: { uk: ["Security clearance", "Driving licence"], us: ["Security clearance", "Driver's license"] },
    keywords: ["policy", "briefings", "stakeholders", "public service", "evidence", "governance", "casework", "delivery"],
  },
  {
    id: "science",
    name: "Science and research",
    template: "research",
    sections: ["experience", "education", "publications", "skills"],
    roles: [
      { id: "lab-technician", title: { uk: "Laboratory Technician", us: "Laboratory Technician" } },
      { id: "research-scientist", title: "Research Scientist" },
      { id: "clinical-research-associate", title: "Clinical Research Associate" },
    ],
    credentials: { uk: ["Good Clinical Practice training", "Good Laboratory Practice training"], us: ["Good Clinical Practice training", "Good Laboratory Practice training"] },
    keywords: ["experiments", "data analysis", "laboratory safety", "protocols", "publications", "grant applications", "quality control", "regulatory"],
  },
  {
    id: "energy",
    name: "Energy and environment",
    template: "technical",
    sections: LICENSED,
    roles: [
      { id: "environmental-consultant", title: "Environmental Consultant" },
      { id: "renewable-energy-engineer", title: "Renewable Energy Engineer" },
    ],
    credentials: { uk: ["Chartered Environmentalist", "Construction site safety card"], us: ["Professional Engineer license", "Occupational safety training"] },
    keywords: ["environmental assessments", "sustainability", "carbon", "permits", "site surveys", "renewables", "compliance", "reporting"],
  },
  {
    id: "property",
    name: { uk: "Property", us: "Real estate" },
    template: "modern",
    sections: LICENSED,
    roles: [
      { id: "estate-agent", title: { uk: "Estate Agent", us: "Real Estate Agent" } },
      { id: "property-manager", title: "Property Manager" },
      { id: "lettings-negotiator", title: { uk: "Lettings Negotiator", us: "Leasing Consultant" } },
    ],
    credentials: { uk: ["Propertymark qualification", "Driving licence"], us: ["State real estate license", "Driver's license"] },
    keywords: { uk: ["valuations", "viewings", "lettings", "negotiation", "tenants", "maintenance", "compliance", "sales targets"], us: ["listings", "showings", "leasing", "negotiation", "tenants", "maintenance", "compliance", "closings"] },
  },
  {
    id: "early-career",
    name: "Students and early career",
    template: "graduate",
    sections: ["education", "projects", "experience", "volunteering", "skills"],
    roles: [
      { id: "cs-graduate", title: { uk: "Graduate Software Engineer", us: "Entry-Level Software Engineer" } },
      { id: "graduate", title: { uk: "Graduate", us: "Recent Graduate" } },
      { id: "intern", title: "Intern" },
      { id: "school-leaver", title: { uk: "School Leaver", us: "High School Graduate" } },
      { id: "apprentice", title: "Apprentice" },
      { id: "career-changer", title: "Career Changer" },
    ],
    credentials: [],
    keywords: ["teamwork", "communication", "projects", "placements", "part-time work", "volunteering", "deadlines", "learning"],
  },
];

export const industryById = (id: IndustryId) => INDUSTRIES.find((i) => i.id === id)!;
