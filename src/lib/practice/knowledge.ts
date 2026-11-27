import type { CategoryKey, IndustryKey } from "./catalogue";

/**
 * The knowledge behind industry-specific questions (developer note,
 * "Industry knowledge framework"): for each industry, what the work is,
 * its pressures, rules, words and people, and a starter bank of questions
 * for every question type. The question writer reads the profile; without a
 * model, the bank is used. Questions in the bank are about the substance of
 * the industry, never a generic question with the industry's name dropped in.
 *
 * Each type has four questions: the first two suit easy and medium
 * sessions, the last two are deeper and suit hard ones.
 */

export interface IndustryProfile {
  skills: string[];
  responsibilities: string[];
  challenges: string[];
  regulation: string[];
  terminology: string[];
  stakeholders: string[];
  environment: string[];
  trends: string[];
}

export const PROFILES: Record<IndustryKey, IndustryProfile> = {
  any: {
    skills: ["communication", "problem solving", "prioritisation", "teamwork", "adaptability"],
    responsibilities: ["delivering work to deadlines", "working with colleagues and customers", "improving how work gets done"],
    challenges: ["competing priorities", "limited time and resources", "change and ambiguity"],
    regulation: ["data protection", "health and safety", "equality and inclusion"],
    terminology: ["stakeholders", "deliverables", "objectives", "feedback"],
    stakeholders: ["managers", "colleagues", "customers or service users"],
    environment: ["deadlines", "hybrid working", "cross-team work"],
    trends: ["automation and AI", "flexible working", "data-driven decisions"],
  },
  government: {
    skills: ["policy analysis", "stakeholder engagement across departments", "evidence-based decision-making", "delivery and project management", "clear written briefing"],
    responsibilities: ["advising ministers and senior civil servants", "delivering public services and programmes", "managing public money responsibly", "working across departments and with suppliers"],
    challenges: ["balancing competing priorities with limited public funds", "changing ministerial priorities", "delivering at pace under public scrutiny", "legacy systems and fragmented processes", "serving diverse citizens fairly"],
    regulation: ["Civil Service Code (integrity, honesty, objectivity, impartiality)", "Managing Public Money and value for money", "Freedom of Information and GDPR", "public sector equality duty", "procurement rules", "GDS service standard and accessibility"],
    terminology: ["Success Profiles", "SCS", "ministerial submission", "business case (Green Book)", "spending review", "shared services", "benefits realisation"],
    stakeholders: ["ministers and private offices", "senior civil servants", "other departments", "suppliers", "citizens and service users", "Parliament and the public"],
    environment: ["political sensitivity", "accountability and audit", "hierarchy and governance boards", "hybrid working with office attendance"],
    trends: ["digital transformation of services", "shared services and process convergence", "AI in public services", "efficiency and workforce reform"],
  },
  healthcare: {
    skills: ["clinical judgement", "compassionate communication", "safeguarding", "accurate record keeping", "teamwork under pressure"],
    responsibilities: ["delivering safe, person-centred care", "assessing and escalating risk", "working within a multidisciplinary team", "supporting patients, families and carers"],
    challenges: ["staff shortages and high workloads", "patient safety incidents", "balancing dignity and risk", "emotionally demanding situations", "limited beds and resources"],
    regulation: ["CQC standards", "NMC or HCPC codes of conduct", "safeguarding adults and children", "Mental Capacity Act and consent", "confidentiality and information governance"],
    terminology: ["person-centred care", "escalation and NEWS2", "handover", "duty of candour", "MDT", "care plan", "infection prevention and control"],
    stakeholders: ["patients and service users", "families and carers", "doctors, nurses and allied professionals", "social workers", "managers and commissioners"],
    environment: ["shift work", "wards, community and care homes", "high emotional load", "time-critical decisions"],
    trends: ["integrated care systems", "digital health records and virtual wards", "workforce wellbeing and retention", "prevention and community-based care"],
  },
  technology: {
    skills: ["problem decomposition", "debugging and root-cause analysis", "system design", "product thinking", "collaboration with technical and non-technical people"],
    responsibilities: ["building and maintaining reliable software and data systems", "shipping iteratively", "reviewing and improving code and processes", "understanding users' needs"],
    challenges: ["technical debt", "scaling and reliability incidents", "security threats", "shifting requirements", "trade-offs between speed and quality"],
    regulation: ["GDPR and data protection", "security standards (e.g. ISO 27001, OWASP)", "accessibility (WCAG)", "responsible AI"],
    terminology: ["agile and sprints", "CI/CD", "incident post-mortem", "API", "technical debt", "MVP", "observability", "A/B testing"],
    stakeholders: ["users and customers", "product managers", "engineers and designers", "security and operations teams", "business leaders"],
    environment: ["fast-paced delivery", "remote and distributed teams", "on-call rotas", "rapid technology change"],
    trends: ["generative AI", "cloud cost optimisation", "platform engineering", "cyber security", "data products"],
  },
  finance: {
    skills: ["numerical analysis", "attention to detail", "risk assessment", "commercial judgement", "clear reporting to non-specialists"],
    responsibilities: ["analysing financial information", "managing risk and controls", "supporting clients or the business with decisions", "meeting regulatory reporting requirements"],
    challenges: ["market volatility", "regulatory change", "fraud and financial crime", "balancing commercial targets with customer outcomes", "data quality"],
    regulation: ["FCA Consumer Duty", "anti-money laundering and KYC", "Basel and capital requirements", "SM&CR and conduct rules", "audit and internal controls"],
    terminology: ["risk appetite", "reconciliation", "P&L", "forecasting and variance", "liquidity", "due diligence", "controls testing"],
    stakeholders: ["clients and customers", "regulators", "front office and operations", "risk, compliance and audit", "senior management"],
    environment: ["deadline-driven reporting cycles", "high accuracy expectations", "strict controls", "high-pressure trading or close periods"],
    trends: ["fintech and open banking", "automation of finance processes", "ESG and sustainable finance", "AI in fraud detection"],
  },
  education: {
    skills: ["planning and adapting lessons", "behaviour management", "assessment and feedback", "safeguarding", "communicating with learners and parents"],
    responsibilities: ["helping learners make progress", "planning and delivering learning", "supporting learners with different needs", "working with parents, carers and colleagues"],
    challenges: ["mixed abilities and SEND", "behaviour and engagement", "workload", "attainment gaps and disadvantage", "limited budgets"],
    regulation: ["Keeping Children Safe in Education", "Ofsted framework", "SEND code of practice", "Teachers' Standards", "data protection"],
    terminology: ["differentiation and adaptive teaching", "formative assessment", "curriculum intent", "EHCP", "pastoral care", "progress data"],
    stakeholders: ["learners", "parents and carers", "colleagues and SENCOs", "senior leaders", "external agencies"],
    environment: ["classrooms and online learning", "term-time intensity", "inspection pressure", "pastoral responsibility"],
    trends: ["EdTech and AI in learning", "wellbeing and mental health", "recruitment and retention", "personalised learning"],
  },
};

type Bank = Record<CategoryKey, [string, string, string, string]>;

export const BANK: Record<IndustryKey, Bank> = {
  any: {
    behaviour: [
      "Tell me about a time you had to manage several deadlines at once. How did you decide what came first?",
      "Describe a time you worked with someone whose working style was very different from yours.",
      "Tell me about a time you made a decision without all the information you wanted. What was the outcome?",
      "Describe a time you changed someone's mind on something important. How did you do it, and what changed as a result?",
    ],
    strengths: [
      "What kind of task makes time fly for you at work?",
      "What do people most often come to you for help with?",
      "How do you feel when you have to start something with no clear instructions?",
      "Which do you enjoy more: generating new ideas or getting things finished? Why?",
    ],
    technical: [
      "Which tools or methods do you rely on most to keep your work accurate and organised?",
      "How do you check the quality of your own work before you share it?",
      "Talk me through how you would plan a piece of work you had never done before.",
      "How do you decide which data or evidence to trust when sources disagree?",
    ],
    experience: [
      "Which part of your experience so far best prepares you for this kind of role?",
      "Tell me about the responsibility you've held that you're proudest of.",
      "What's the most complex piece of work you've owned from start to finish?",
      "Which experience taught you the most about working under pressure, and what did you learn?",
    ],
    motivational: [
      "What are you looking for in your next role that you don't have now?",
      "What kind of work gives you the most satisfaction?",
      "Where do you want your career to be in three years, and how does this type of role help?",
      "What would make you leave a job that otherwise looked perfect on paper?",
    ],
    situational: [
      "A colleague asks for urgent help just as you are about to miss your own deadline. What do you do?",
      "You notice an error in work that has already been sent to a customer. What are your next steps?",
      "Two managers give you conflicting instructions on the same task. How do you handle it?",
      "You are asked to deliver a project in half the usual time with the same resources. What do you do first?",
    ],
    case: [
      "Customer complaints have doubled in a month. How would you work out why?",
      "Your team keeps missing deadlines. How would you diagnose the cause and fix it?",
      "You have a fixed budget and three good projects that need funding. How would you decide?",
      "A process takes ten steps and three teams. How would you redesign it, and how would you know it worked?",
    ],
    leadership: [
      "Tell me about a time you helped a team pull together to hit a goal.",
      "How do you get the best from someone who is struggling to keep up?",
      "Describe a time you had to give difficult feedback to a colleague or team member.",
      "Tell me about a time you led a team through a change they didn't want.",
    ],
    challenging: [
      "What's a widely accepted way of working that you think is wrong?",
      "If you could change one thing about your last workplace, what would it be and why?",
      "What would your harshest critic say about you, and would they be right?",
      "Convince me that the job you are applying for shouldn't be automated.",
    ],
    values: [
      "What does integrity at work mean to you in practice?",
      "How do you make sure everyone in a team feels included?",
      "Tell me about a time you had to choose between hitting a target and doing the right thing.",
      "How would you respond if you saw a senior colleague behaving unfairly towards someone?",
    ],
  },
  government: {
    behaviour: [
      "Tell me about a time you balanced competing priorities to deliver a better outcome for the public.",
      "Describe a time you used evidence to make a recommendation to a senior decision-maker.",
      "Tell me about a time you built consensus between teams or organisations with different priorities.",
      "Describe a time you changed a process to make a public service more efficient. How did you show the benefits were realised?",
    ],
    strengths: [
      "What energises you about balancing competing priorities to deliver better public outcomes?",
      "How do you feel about working on something that will be closely scrutinised by the public?",
      "What do you enjoy about turning complex policy into something people can actually use?",
      "Do you prefer bringing structure to ambiguous situations or working within established processes? Why?",
    ],
    technical: [
      "How would you structure a ministerial submission so the decision is clear within the first paragraph?",
      "How do you make sure a project or service delivers value for money?",
      "Walk me through how you would build a business case for a cross-government change programme.",
      "How would you set up governance and benefits tracking for a programme spanning several departments?",
    ],
    experience: [
      "Tell me about your experience of working with senior stakeholders or within formal governance.",
      "What experience do you have of delivering change in a large, complex organisation?",
      "Describe your experience of managing a project with limited resources in a changing environment.",
      "What experience do you have of working with outsourced suppliers or shared service centres?",
    ],
    motivational: [
      "Why do you want to work in public service rather than the private sector?",
      "What impact would you like your work to have on citizens?",
      "Which current government priority would you most like to help deliver, and why?",
      "How do you stay motivated when political priorities change the direction of your work?",
    ],
    situational: [
      "A minister's office asks for a briefing in two hours on a subject you know little about. What do you do?",
      "A department refuses to adopt a shared process your team designed. How would you handle it?",
      "You discover a supplier is late on a critical milestone just before a reporting deadline. What do you do?",
      "A senior official asks you to present data in a way you think is misleading. How do you respond?",
    ],
    case: [
      "A public service has seen a 25% drop in completion rates over two months. How would you investigate?",
      "Three departments run the same HR process in three different ways. How would you converge them?",
      "You must cut a programme's budget by 15% without reducing the service to citizens. Where would you look?",
      "How would you decide whether to build, buy or share a system across government?",
    ],
    leadership: [
      "How do you keep a project team motivated when priorities change at short notice?",
      "Tell me about a time you led people from different organisations towards one goal.",
      "How would you build a high-performing team with limited budget for new hires?",
      "Describe how you have led a team through a period of reorganisation or uncertainty.",
    ],
    challenging: [
      "Is it ever right for a civil servant to slow down a minister's priority? When?",
      "What is one government process you think should be scrapped entirely?",
      "How would you explain to a taxpayer why a project you worked on went over budget?",
      "If AI could draft every policy submission, what would civil servants still be needed for?",
    ],
    values: [
      "What does impartiality mean for you in day-to-day work?",
      "How do you make sure a service works fairly for people with different needs?",
      "Tell me about a time you had to be honest about a problem that others wanted to play down.",
      "How would you handle pressure to share information you believe should remain confidential?",
    ],
  },
  healthcare: {
    behaviour: [
      "Tell me about a time you noticed a change in someone's condition and escalated it. What happened?",
      "Describe a time you supported a patient or family member who was distressed.",
      "Tell me about a time you worked with a multidisciplinary team to improve someone's care.",
      "Describe a time you raised a concern about safety or practice. How did you handle it, and what changed?",
    ],
    strengths: [
      "What do you find rewarding about supporting people in vulnerable circumstances?",
      "How do you feel at the end of a really demanding shift?",
      "What comes naturally to you when someone is anxious or frightened?",
      "Do you prefer working to a clear routine or responding to whatever the day brings? Why?",
    ],
    technical: [
      "How do you make sure your record keeping is accurate and meets professional standards?",
      "Talk me through how you would carry out a handover so nothing important is missed.",
      "How do you assess whether someone has the capacity to consent to their care?",
      "How would you use an early warning score alongside your own clinical judgement?",
    ],
    experience: [
      "What experience do you have of providing person-centred care?",
      "Tell me about your experience of working in a busy or understaffed environment.",
      "What experience do you have of safeguarding, and what did you learn from it?",
      "Describe your experience of working with families who disagreed with a care plan.",
    ],
    motivational: [
      "Why do you want to work in health and social care?",
      "What keeps you motivated in a role that can be emotionally demanding?",
      "Which area of care would you most like to develop in, and why?",
      "How do you look after your own wellbeing so you can keep caring for others?",
    ],
    situational: [
      "A patient refuses their medication. What do you do?",
      "You are short-staffed and two patients need you at the same time. How do you prioritise?",
      "A relative becomes angry with you on the ward. How do you respond?",
      "You see a colleague cut corners on infection control. What do you do?",
    ],
    case: [
      "Falls on a ward have increased over three months. How would you investigate and reduce them?",
      "A clinic has long waiting times and missed appointments. How would you improve it?",
      "Patients are being discharged late in the day. How would you find out why?",
      "Staff turnover on a unit is high. How would you work out the causes and what would you change?",
    ],
    leadership: [
      "How do you support a junior colleague who is struggling after a difficult shift?",
      "Tell me about a time you led a team through a busy or high-risk situation.",
      "How would you introduce a new procedure to a team that is already stretched?",
      "How do you create a team culture where people feel safe to report mistakes?",
    ],
    challenging: [
      "Is it ever acceptable to bend a policy for a patient's benefit?",
      "What is the hardest part of care that people outside the profession don't understand?",
      "How would you balance a patient's right to take risks with your duty to keep them safe?",
      "If you had to cut one thing from your service to protect another, what would it be and why?",
    ],
    values: [
      "What does dignity in care mean to you in practice?",
      "How do you make sure you treat everyone fairly, whatever their background?",
      "Tell me about a time you had to be open with a patient or family about something that went wrong.",
      "How would you respond if you were asked to do something you felt compromised a patient's best interests?",
    ],
  },
  technology: {
    behaviour: [
      "Tell me about a time you tracked down the cause of a difficult bug or system issue.",
      "Describe a time you explained a technical decision to someone without a technical background.",
      "Tell me about a time you pushed back on a deadline because quality or security was at risk.",
      "Describe a time you reduced technical debt while still delivering new features. How did you justify it?",
    ],
    strengths: [
      "What excites you about investigating the root cause of complex technical problems?",
      "Do you prefer building something new or improving something that already exists? Why?",
      "What part of your technical work do you lose track of time doing?",
      "How do you feel when you have to learn a new technology quickly for a project?",
    ],
    technical: [
      "How do you approach testing to make sure a change doesn't break something else?",
      "Talk me through how you would investigate a sudden spike in errors in production.",
      "How would you design a system to stay reliable when a key dependency fails?",
      "How do you evaluate trade-offs between delivery speed and long-term maintainability?",
    ],
    experience: [
      "Tell me about the most complex system or product you've worked on and your part in it.",
      "What experience do you have of working in agile teams?",
      "Describe your experience of handling a live incident from detection to post-mortem.",
      "What experience do you have of making a technology choice that others had to live with?",
    ],
    motivational: [
      "What draws you to working in technology?",
      "Which technology trend are you most excited about, and why?",
      "What kind of product or problem would you most like to work on next?",
      "How do you keep your skills current when the technology changes so quickly?",
    ],
    situational: [
      "A release goes out and users report data is missing. What do you do in the first hour?",
      "A product manager wants a feature next week that you think needs a month. How do you respond?",
      "You find a security vulnerability in code written by a senior colleague. What do you do?",
      "Your team disagrees on which framework to use for a new service. How would you resolve it?",
    ],
    case: [
      "Sign-ups have dropped 20% since a redesign. How would you find out why?",
      "A system's cloud costs have doubled in six months. How would you investigate and reduce them?",
      "How would you decide whether to rebuild an ageing legacy system or keep improving it?",
      "Page load times have crept up across the site. How would you diagnose and prioritise fixes?",
    ],
    leadership: [
      "How do you help a junior developer grow without slowing the team down?",
      "Tell me about a time you led a team through a difficult technical migration.",
      "How would you build a culture of blameless post-mortems?",
      "How do you balance the needs of product, engineering and security when they conflict?",
    ],
    challenging: [
      "What's a widely accepted engineering practice you think is overrated?",
      "Should every product use AI? Why or why not?",
      "If you could delete one tool from your team's stack, which would it be and why?",
      "How would you explain to the board that the best next step is to ship nothing new for a quarter?",
    ],
    values: [
      "How do you make sure the products you build are accessible to everyone?",
      "What responsibilities do technologists have when handling people's data?",
      "Tell me about a time you raised an ethical concern about a product decision.",
      "How would you respond if asked to collect user data you felt wasn't necessary?",
    ],
  },
  finance: {
    behaviour: [
      "Tell me about a time you spotted an error or inconsistency in financial information. What did you do?",
      "Describe a time you explained a complex financial issue to someone without a finance background.",
      "Tell me about a time you had to meet a tight reporting deadline without compromising accuracy.",
      "Describe a time you challenged a decision because it carried more risk than the business realised.",
    ],
    strengths: [
      "What do you enjoy about analysing numerical information to identify risks or opportunities?",
      "How naturally do you identify inconsistencies in financial information, and what do you enjoy about this process?",
      "How do you feel when you are working to a hard deadline at month-end or year-end?",
      "Do you prefer finding the story in the numbers or making sure every figure is exactly right? Why?",
    ],
    technical: [
      "How do you approach reconciling two sets of figures that don't match?",
      "Talk me through how you would build a forecast and explain the variance to budget.",
      "How would you assess the credit risk of a new client or counterparty?",
      "How do you design and test a control so it actually prevents the risk it is meant to?",
    ],
    experience: [
      "What experience do you have of financial reporting or analysis?",
      "Tell me about your experience of working within regulatory or audit requirements.",
      "Describe your experience of improving a finance or operations process.",
      "What experience do you have of handling a material error or control failure?",
    ],
    motivational: [
      "What draws you to a career in banking and finance?",
      "Which part of the financial services industry interests you most, and why?",
      "How do you think regulation such as Consumer Duty is changing the industry?",
      "Where do you see finance roles changing with automation, and how will you stay valuable?",
    ],
    situational: [
      "You find a transaction that looks like possible money laundering. What do you do?",
      "A manager asks you to move a cost into next quarter to hit this quarter's target. How do you respond?",
      "A client is unhappy about a fee they don't understand. How do you handle the conversation?",
      "Market conditions change sharply on the morning a report is due. What do you do?",
    ],
    case: [
      "A product's margins have fallen for three quarters. How would you investigate?",
      "Fraud losses on card payments have risen. How would you decide where to tighten controls?",
      "How would you assess whether to approve a large loan to a growing business?",
      "Month-end close takes ten days. How would you bring it down to five without increasing risk?",
    ],
    leadership: [
      "How do you keep a finance team accurate and motivated during a demanding close period?",
      "Tell me about a time you developed someone's technical skills in your team.",
      "How would you lead your team through a major regulatory change?",
      "How do you create a culture where people speak up about risks and errors?",
    ],
    challenging: [
      "Is it ever right to put a customer's interests ahead of a revenue target? When?",
      "What risk do you think banks most underestimate today?",
      "Would you trust an AI model to make lending decisions? Why or why not?",
      "Explain to me why an organisation should pay for a control that has never caught anything.",
    ],
    values: [
      "What does acting with integrity look like in a finance role?",
      "How do you make sure you treat vulnerable customers fairly?",
      "Tell me about a time you raised a concern about conduct or compliance.",
      "How would you respond if a high-performing colleague was breaching the conduct rules?",
    ],
  },
  education: {
    behaviour: [
      "Tell me about a time you adapted your teaching or support to meet a learner's needs.",
      "Describe a time you managed challenging behaviour and kept learning on track.",
      "Tell me about a time you worked with parents or carers to support a learner.",
      "Describe a time you used assessment data to change how you taught. What was the impact?",
    ],
    strengths: [
      "What do you enjoy about adapting your communication style to different learning needs?",
      "What gives you the most satisfaction in helping someone learn?",
      "How do you feel when a lesson or session doesn't go to plan?",
      "Do you prefer planning learning in detail or responding to learners in the moment? Why?",
    ],
    technical: [
      "How do you check that learners have understood something during a lesson?",
      "Talk me through how you would plan a sequence of lessons for a mixed-ability group.",
      "How would you support a learner with an EHCP in a mainstream setting?",
      "How do you design assessment so it shows progress, not just attainment?",
    ],
    experience: [
      "What experience do you have of working with learners of different ages or abilities?",
      "Tell me about your experience of safeguarding in an education setting.",
      "Describe your experience of supporting learners with SEND.",
      "What experience do you have of leading a change in curriculum or practice?",
    ],
    motivational: [
      "Why do you want to work in education?",
      "What kind of impact do you want to have on learners?",
      "Which area of education would you most like to develop in, and why?",
      "How do you stay motivated during the busiest points of the academic year?",
    ],
    situational: [
      "A learner discloses something that worries you about their safety. What do you do?",
      "A parent emails angrily about their child's grade. How do you respond?",
      "Half the class haven't understood a key concept and the assessment is next week. What do you do?",
      "A colleague's approach to behaviour is undermining yours. How do you handle it?",
    ],
    case: [
      "Attendance in one year group has fallen. How would you find out why and improve it?",
      "Disadvantaged learners are making less progress than their peers. How would you close the gap?",
      "How would you evaluate whether a new learning platform is worth the investment?",
      "Staff workload is rising and morale is low. What would you investigate and change?",
    ],
    leadership: [
      "How do you support a new colleague who is finding behaviour management difficult?",
      "Tell me about a time you led a team to improve learners' outcomes.",
      "How would you introduce a new teaching approach across a department?",
      "How do you hold colleagues to account while keeping their trust?",
    ],
    challenging: [
      "Are exams the best way to measure learning? Why or why not?",
      "What is one thing schools or colleges do that you would stop tomorrow?",
      "How should education respond to learners using AI to write their work?",
      "If you could only teach one skill to every learner, what would it be and why?",
    ],
    values: [
      "How do you create an inclusive environment for every learner?",
      "What does safeguarding mean to you beyond following procedures?",
      "Tell me about a time you challenged a decision you felt wasn't in a learner's best interests.",
      "How would you handle a situation where a learner's wishes conflict with their wellbeing?",
    ],
  },
};

/** Questions for a profession (the context and level of specialisation), used before the industry's own. */
export const PROFESSION_BANK: Record<string, Partial<Record<CategoryKey, string[]>>> = {
  "Policy & Strategy": {
    behaviour: ["Tell me about a time you turned conflicting evidence into a clear policy recommendation."],
    technical: ["How would you test whether a policy option will achieve its intended outcome before it is implemented?"],
    situational: ["A minister wants a policy announced next week, but the evidence is weak. What do you advise?"],
    strengths: ["What do you enjoy about weighing up evidence from very different sources?"],
    case: ["Uptake of a new government scheme is far below forecast. How would you diagnose the policy design?"],
  },
  "Operational Delivery": {
    behaviour: ["Tell me about a time you kept a frontline service running when demand suddenly increased."],
    technical: ["How would you use performance data to manage a team's workload and service levels?"],
    situational: ["A system outage means citizens can't access a service for a day. What do you do?"],
    strengths: ["How do you feel about solving practical problems for members of the public face to face?"],
  },
  "Digital Product Management": {
    behaviour: ["Tell me about a time you used user research to change a service's direction."],
    technical: ["How would you prepare a government service for a GDS service assessment?"],
    situational: ["Policy colleagues want a feature that user research shows people don't need. How do you handle it?"],
    case: ["A digital service has a high drop-out rate at the identity check step. How would you improve it?"],
  },
  "Commercial & Procurement": {
    behaviour: ["Tell me about a time you negotiated a better outcome with a supplier."],
    technical: ["How would you run a compliant procurement that still gets the best value for the public?"],
    situational: ["A key supplier is failing to meet its contract but switching would be costly. What do you do?"],
  },
  Nursing: {
    behaviour: ["Tell me about a time you used your clinical judgement to escalate a deteriorating patient."],
    technical: ["How do you prioritise care for a group of patients at the start of a shift?"],
    situational: ["You suspect a medication error has been made by a colleague. What do you do?"],
    strengths: ["What do you enjoy most about building trust with patients in a short time?"],
  },
  "Clinical Support": {
    behaviour: ["Tell me about a time you noticed something about a patient that you reported to a nurse or doctor."],
    technical: ["How do you make sure observations you take are accurate and recorded properly?"],
    situational: ["A patient asks you a clinical question you can't answer. What do you do?"],
  },
  "Healthcare Operations": {
    behaviour: ["Tell me about a time you improved patient flow or reduced waiting times."],
    technical: ["Which measures would you use to understand capacity and demand in a hospital department?"],
    case: ["Elective surgery waiting lists are growing. How would you prioritise actions to reduce them?"],
  },
  "Allied Health": {
    behaviour: ["Tell me about a time you set goals with a patient to support their rehabilitation."],
    technical: ["How do you measure whether an intervention is working for a patient?"],
    situational: ["A patient isn't engaging with their therapy plan. How would you approach it?"],
  },
  "Software Engineering": {
    behaviour: ["Tell me about a time you improved the performance or reliability of code you owned."],
    technical: ["How do you decide what to cover with unit, integration and end-to-end tests?"],
    situational: ["A code review reveals a design you think won't scale. How do you raise it?"],
    case: ["An API's response time has tripled under load. How would you find the bottleneck?"],
  },
  "Product Management": {
    behaviour: ["Tell me about a time you said no to a stakeholder's feature request. How did you handle it?"],
    technical: ["How would you decide what goes into the next quarter's roadmap?"],
    case: ["A feature has high usage but low retention. How would you work out what to do next?"],
    strengths: ["What do you enjoy about connecting what users need with what the business needs?"],
  },
  "Data & AI": {
    behaviour: ["Tell me about a time your analysis changed a decision someone was about to make."],
    technical: ["How would you check a machine learning model for bias before it goes live?"],
    situational: ["Stakeholders want a model in production, but the training data quality is poor. What do you do?"],
    case: ["A recommendation model's click-through rate is falling. How would you investigate?"],
  },
  "Cloud & DevOps": {
    behaviour: ["Tell me about a time you automated something that saved your team significant time."],
    technical: ["How would you design a deployment pipeline that lets a team release safely several times a day?"],
    situational: ["A deployment fails halfway and production is partly broken. What do you do?"],
  },
  "Financial Analysis": {
    behaviour: ["Tell me about a time your analysis uncovered an opportunity or risk others had missed."],
    technical: ["How would you build a model to evaluate whether an investment will pay back?"],
    case: ["A business unit is consistently over budget. How would you analyse the drivers?"],
  },
  "Risk & Compliance": {
    behaviour: ["Tell me about a time you identified a compliance gap and got it fixed."],
    technical: ["How would you assess and score a new operational risk?"],
    situational: ["The business wants to launch a product before compliance checks are complete. What do you do?"],
    values: ["How do you stay independent when the business pushes back on your findings?"],
  },
  Accounting: {
    behaviour: ["Tell me about a time you resolved a difficult reconciliation."],
    technical: ["How do you make sure accruals and prepayments are accurate at month-end?"],
    situational: ["The auditors question a figure you prepared. How do you respond?"],
  },
  "Investment Operations": {
    behaviour: ["Tell me about a time you fixed a recurring settlement or trade processing issue."],
    technical: ["How would you control the risk of trade breaks between front office and custodians?"],
    situational: ["A large trade fails to settle on the due date. What are your next steps?"],
  },
  Teaching: {
    behaviour: ["Tell me about a lesson that went particularly well and why."],
    technical: ["How do you plan to make sure every learner can access a challenging topic?"],
    situational: ["A learner refuses to start work and is distracting others. What do you do?"],
    strengths: ["What do you enjoy about seeing a learner finally understand something difficult?"],
  },
  "Academic Support": {
    behaviour: ["Tell me about a time you helped a learner overcome a barrier to their learning."],
    technical: ["How do you work with a class teacher to support a learner with additional needs?"],
    situational: ["A learner you support becomes upset during a lesson. How do you respond?"],
  },
  "Education Management": {
    behaviour: ["Tell me about a time you improved outcomes across a team or department."],
    technical: ["How would you use data to hold teams to account for learners' progress?"],
    case: ["Ofsted is due next term and one department is underperforming. What would you do?"],
  },
  "Instructional Design": {
    behaviour: ["Tell me about a time you redesigned learning that wasn't working."],
    technical: ["How do you decide whether content should be delivered online, face to face or blended?"],
    case: ["Completion rates for an online course are below 30%. How would you improve them?"],
  },
};

/** The profile as lines the question writer and the answer scorer read. */
export function profileText(industry: IndustryKey, industryName: string, profession: string): string {
  const p = PROFILES[industry];
  const line = (label: string, xs: string[]) => `${label}: ${xs.join("; ")}.`;
  return [
    `Industry: ${industryName}${profession ? `. Profession: ${profession}` : ""}.`,
    line("Core skills and competencies", p.skills),
    line("Common responsibilities", p.responsibilities),
    line("Industry challenges and scenarios", p.challenges),
    line("Regulatory and ethical considerations", p.regulation),
    line("Technical knowledge and terminology", p.terminology),
    line("Typical stakeholders", p.stakeholders),
    line("Working environment and pressures", p.environment),
    line("Emerging trends", p.trends),
  ].join("\n");
}
