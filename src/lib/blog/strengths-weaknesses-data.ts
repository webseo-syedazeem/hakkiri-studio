export interface SampleAnswer {
  id: string;
  role: string;
  badge: string;
  strength: string;
  proof: string;
  text: string;
  whyItWorks: string;
}

export const STRENGTH_SAMPLES: SampleAnswer[] = [
  {
    id: "customer-service",
    role: "Customer Service",
    badge: "High-Volume / Frontline",
    strength: "Staying calm under pressure with upset customers",
    proof: "Turned escalated complaints into repeat customers same-day",
    text: "My biggest strength is staying calm with upset customers. At my last job I handled our escalated complaints, and I turned most of them into repeat customers by listening first and fixing the problem the same day. Your posting mentions handling high call volumes, so I think that calm, fix-it approach would fit well.",
    whyItWorks: "Directly matches the job requirement, uses a calm problem-solving angle, and connects to repeat customer retention.",
  },
  {
    id: "office-admin",
    role: "Office or Admin Role",
    badge: "Operations & Organization",
    strength: "Systematic organization and workflow tracking",
    proof: "Cut team update chasing time from 1 hour to 10 minutes daily",
    text: "I'm very organized. I set up a shared tracker for our team's orders that cut the time we spent chasing updates from about an hour a day to ten minutes. I'd bring that same habit of building simple systems to this role.",
    whyItWorks: "Replaces vague claims like 'detail-oriented' with a concrete metric: saving 50 minutes every day for the entire team.",
  },
  {
    id: "student-first-job",
    role: "Student or First Job",
    badge: "Early Career & Entry-Level",
    strength: "Fast learner who enjoys steep learning curves",
    proof: "Mastered basic Python in 3 weeks and achieved top class grade",
    text: "I'm a fast learner. In my final semester I learned basic Python in three weeks to analyze data for my group project, and our project got the top grade in the class. I know this role will have a lot to learn at the start, and I enjoy that.",
    whyItWorks: "Acknowledges entry-level status honestly while giving hard academic proof of rapid independent skill acquisition.",
  },
];

export const WEAKNESS_SAMPLES = [
  {
    id: "public-speaking",
    title: "Public Speaking",
    badge: "Soft Skill / Communication",
    fix: "Volunteered for monthly team presentations and rehearsed out loud",
    text: "Public speaking used to make me very nervous, so I avoided presenting in team meetings. Last year I asked my manager to let me present our monthly results, and I practiced out loud beforehand each time. I'm still not a natural, but I now present every month and get good feedback.",
    whyItWorks: "A common, relatable weakness that shows genuine initiative, measurable repetition, and positive feedback.",
  },
  {
    id: "delegating",
    title: "Delegating",
    badge: "Management & Workflow",
    fix: "Built upfront assignment plans and weekly check-ins",
    text: "I used to take on too much myself instead of delegating, which meant I was the bottleneck on some projects. Now I plan who does what at the start of each project and check in weekly instead of doing it all. Our last two projects finished on time.",
    whyItWorks: "Shows self-awareness about project bottlenecks and demonstrates a practical project management fix that produced on-time delivery.",
  },
  {
    id: "saying-yes",
    title: "Saying Yes Too Often",
    badge: "Boundary & Priority Management",
    fix: "Time-blocking own deliverables and setting realistic help schedules",
    text: "I find it hard to say no when colleagues ask for help, and I've missed my own deadlines because of it. I now block time for my own work and give an honest 'I can help on Thursday' instead of dropping everything.",
    whyItWorks: "Highlights generosity while demonstrating professional boundaries and protectiveness over core deadlines.",
  },
  {
    id: "technical-skill",
    title: "A Technical Skill (e.g. Advanced Excel)",
    badge: "Tool / Software Gap",
    fix: "Completed an online course and applied pivot tables directly in weekly reports",
    text: "I'm not very confident with advanced Excel yet. I'm taking an online course and use pivot tables in my weekly reports now, so I'm improving quickly.",
    whyItWorks: "Non-fatal skill gap that is actively being closed with verifiable coursework and on-the-job application.",
  },
];

export const FAQ_LIST = [
  {
    q: 'What is the best answer for "What are your strengths and weaknesses?"',
    a: "Name one strength the job needs and prove it with an example. Then name a real weakness that is not essential for the role and explain how you are improving it.",
  },
  {
    q: "What should I say my weakness is?",
    a: "Choose a real, fixable weakness that is not core to the job, such as public speaking, delegating or a specific software skill, and focus on what you are doing to improve.",
  },
  {
    q: "Is it okay to say I'm a perfectionist?",
    a: "It's best to avoid it. Interviewers hear it so often that it sounds rehearsed. If perfectionism is a real issue for you, describe the specific problem, such as spending too long on small details, and how you manage it.",
  },
  {
    q: "How many strengths and weaknesses should I mention?",
    a: "One or two strengths and one weakness is enough. Depth and examples matter more than a long list.",
  },
  {
    q: "How long should my answer be?",
    a: "About 30 to 60 seconds for each part, or under two minutes if they ask both in one question.",
  },
  {
    q: "What if I have no work experience?",
    a: "Use examples from school, volunteering, sports or part-time jobs. A strength like learning quickly or a weakness like presenting in front of groups works well for first jobs.",
  },
];
