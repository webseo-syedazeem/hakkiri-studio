export interface QuestionItem {
  id: number;
  category: "about-you" | "experience" | "behavioral" | "job" | "closing";
  categoryLabel: string;
  question: string;
  whatTheyWant: string;
  howToAnswer: string;
  example: string;
  guideLink?: {
    href: string;
    text: string;
  };
  note?: string;
}

export const QUESTIONS_DATA: QuestionItem[] = [
  // 1-4: Questions about you
  {
    id: 1,
    category: "about-you",
    categoryLabel: "Questions about you",
    question: "Tell me about yourself.",
    whatTheyWant: "Who you are at work and why you are here.",
    howToAnswer: "Present (your current role), past (one or two achievements), future (why this job). Keep it to 60 to 90 seconds.",
    example: "I'm a customer service rep with three years of experience. Last year I was chosen to train new hires. Now I want to grow into a team lead role, which is why this job stood out.",
    guideLink: {
      href: "/interview-questions/tell-me-about-yourself",
      text: "Full guide with sample answers →",
    },
  },
  {
    id: 2,
    category: "about-you",
    categoryLabel: "Questions about you",
    question: "How would you describe yourself in three words?",
    whatTheyWant: "How you see yourself and if it fits the role.",
    howToAnswer: "Pick three words that match the job and give a quick example for one of them.",
    example: "Organized, calm and curious. For example, I keep a daily plan, so even on busy days nothing gets missed.",
  },
  {
    id: 3,
    category: "about-you",
    categoryLabel: "Questions about you",
    question: "What are your strengths?",
    whatTheyWant: "What you are good at that helps this job.",
    howToAnswer: "Choose two strengths from the job description and prove each one.",
    example: "I'm good at explaining things simply. In my last job, I wrote a short guide for new customers, and support calls about setup went down.",
    guideLink: {
      href: "/blog/strengths-and-weaknesses-interview-question",
      text: "Full guide with sample answers →",
    },
  },
  {
    id: 4,
    category: "about-you",
    categoryLabel: "Questions about you",
    question: "What is your greatest weakness?",
    whatTheyWant: "If you are honest and can improve.",
    howToAnswer: "Name a real weakness that is not key to the job, and say what you are doing about it.",
    example: "I used to find public speaking hard, so I joined a speaking group and now present at our weekly team meeting.",
    guideLink: {
      href: "/blog/strengths-and-weaknesses-interview-question",
      text: "Full guide with sample answers →",
    },
  },

  // 5-8: Questions about your experience
  {
    id: 5,
    category: "experience",
    categoryLabel: "Questions about your experience",
    question: "Walk me through your resume.",
    whatTheyWant: "How your career fits together.",
    howToAnswer: "Go in order, one or two lines per role, and focus on what led you to this job.",
    example: "I started in retail, which taught me to work with customers. Then I moved to a call center, where I learned to solve problems fast. This role is the next step.",
  },
  {
    id: 6,
    category: "experience",
    categoryLabel: "Questions about your experience",
    question: "What is your biggest achievement?",
    whatTheyWant: "What you can do at your best.",
    howToAnswer: "Pick one result linked to this job and explain what you did to get it.",
    example: "I set up a simple tracking sheet for our team's orders, and late deliveries dropped within two months.",
  },
  {
    id: 7,
    category: "experience",
    categoryLabel: "Questions about your experience",
    question: "Why are you leaving your current job?",
    whatTheyWant: "If there is a problem, and what you want next.",
    howToAnswer: "Stay positive and focus on what you are moving toward, not away from.",
    example: "I've learned a lot, but I'm ready for more responsibility, and this role offers that.",
  },
  {
    id: 8,
    category: "experience",
    categoryLabel: "Questions about your experience",
    question: "Can you explain this gap in your resume?",
    whatTheyWant: "What you did and if you are ready to work.",
    howToAnswer: "Be brief and honest, mention anything useful you did, and show you are ready now.",
    example: "I took a year off to care for a family member. During that time, I completed an online course, and I'm fully ready to return.",
  },

  // 9-13: Behavioral questions
  {
    id: 9,
    category: "behavioral",
    categoryLabel: "Behavioral questions (answer with a story)",
    question: "Tell me about a challenge you faced at work.",
    whatTheyWant: "How you solve problems.",
    howToAnswer: "Pick a real problem, focus on your actions and end with the result.",
    example: "Our team lost a key member before a deadline. I split the work into smaller tasks, checked in daily, and we delivered on time.",
    note: "Use the STAR method: Situation (the background), Task (your job), Action (what you did) and Result (what happened).",
  },
  {
    id: 10,
    category: "behavioral",
    categoryLabel: "Behavioral questions (answer with a story)",
    question: "Tell me about a time you worked in a team.",
    whatTheyWant: "If you work well with others.",
    howToAnswer: "Show your role in the team and how you helped it succeed.",
    example: "On a group project, I noticed we were repeating work, so I set up a shared task list. We finished early and got the top grade.",
  },
  {
    id: 11,
    category: "behavioral",
    categoryLabel: "Behavioral questions (answer with a story)",
    question: "Tell me about a time you made a mistake.",
    whatTheyWant: "If you take responsibility and learn.",
    howToAnswer: "Own it, explain how you fixed it, and what you do differently now.",
    example: "I once sent a report with the wrong figures. I told my manager straight away, sent a corrected version, and now I always double-check before sending.",
  },
  {
    id: 12,
    category: "behavioral",
    categoryLabel: "Behavioral questions (answer with a story)",
    question: "Tell me about a time you dealt with a difficult person.",
    whatTheyWant: "How you handle conflict.",
    howToAnswer: "Stay neutral, show that you listened, and explain how it was resolved.",
    example: "A customer was angry about a late order. I listened, apologized, found the cause and offered a fix. They thanked us and ordered again.",
  },
  {
    id: 13,
    category: "behavioral",
    categoryLabel: "Behavioral questions (answer with a story)",
    question: "How do you handle stress or pressure?",
    whatTheyWant: "If you stay effective when things get busy.",
    howToAnswer: "Describe your method and give a real example.",
    example: "I make a short list of priorities and tackle the most urgent task first. During our busiest season, that kept me on top of every order.",
  },

  // 14-18: Questions about the job and company
  {
    id: 14,
    category: "job",
    categoryLabel: "Questions about the job and company",
    question: "Why do you want this job?",
    whatTheyWant: "If you really want this role or any job.",
    howToAnswer: "Link something specific in the role to your skills and goals.",
    example: "This role mixes customer contact and problem-solving, which are the parts of my work I enjoy most.",
  },
  {
    id: 15,
    category: "job",
    categoryLabel: "Questions about the job and company",
    question: "Why do you want to work here?",
    whatTheyWant: "If you have researched the company.",
    howToAnswer: "Mention something real about the company, such as its products, values or growth.",
    example: "I've used your app for a year, and I like how you listen to customer feedback. I'd like to be part of that.",
  },
  {
    id: 16,
    category: "job",
    categoryLabel: "Questions about the job and company",
    question: "Why should we hire you?",
    whatTheyWant: "Why you are a strong fit.",
    howToAnswer: "Their need, your proof, your value, in 30 to 60 seconds.",
    example: "You need someone who can handle a high volume of customers. I've done that for three years and often took escalated cases. I can help your team from week one.",
    guideLink: {
      href: "/interview-questions/why-should-we-hire-you",
      text: "Full guide with 20+ sample answers →",
    },
  },
  {
    id: 17,
    category: "job",
    categoryLabel: "Questions about the job and company",
    question: "Where do you see yourself in five years?",
    whatTheyWant: "If your goals fit this role.",
    howToAnswer: "Show ambition that links to the job, without naming a job title you might not get.",
    example: "I see myself as an expert in this area, possibly leading a small team, and still learning.",
  },
  {
    id: 18,
    category: "job",
    categoryLabel: "Questions about the job and company",
    question: "What are your salary expectations?",
    whatTheyWant: "If you fit their budget.",
    howToAnswer: "Research the typical pay for the role in your area and give a range.",
    example: "Based on my research and experience, I'm looking for a range of [your range], but I'm open to discussing the full package.",
  },

  // 19-20: Closing questions
  {
    id: 19,
    category: "closing",
    categoryLabel: "Closing questions",
    question: "Is there anything else you would like us to know?",
    whatTheyWant: "If you missed anything important.",
    howToAnswer: "Add one strength you did not mention, or sum up why you fit.",
    example: "Just that I'm really excited about this role. I think my experience with customers and my training work fit what you need.",
  },
  {
    id: 20,
    category: "closing",
    categoryLabel: "Closing questions",
    question: "Do you have any questions for us?",
    whatTheyWant: "If you are interested and curious.",
    howToAnswer: "Always ask one or two questions. Good ones include: 'What does success look like in this role after three months?', 'What do you enjoy most about working here?', 'What are the next steps in the process?'",
    example: "What does success look like in this role after three months? Also, what are the next steps in the process?",
  },
];

export const HUB_FAQS = [
  {
    q: "What are the most common interview questions?",
    a: '"Tell me about yourself," "Why do you want this job?", "Why should we hire you?", "What are your strengths?", "What is your greatest weakness?", "Tell me about a challenge you faced," and "Do you have any questions for us?"',
  },
  {
    q: "How do I prepare for common interview questions?",
    a: "Read the job description, prepare a short answer and one real example for each common question, and practice saying your answers out loud until they sound natural.",
  },
  {
    q: "What is the STAR method?",
    a: "STAR is a way to answer behavioral questions with a story: Situation, Task, Action and Result. It keeps your answer clear and focused on what you did.",
  },
  {
    q: "How long should my interview answers be?",
    a: 'Most answers should take about one to two minutes. "Tell me about yourself" and "Why should we hire you?" work best at 30 to 90 seconds.',
  },
  {
    q: "Should I memorize my answers?",
    a: "Learn your main points and examples, not the exact words. Memorized answers can sound stiff, and you may freeze if you forget a line.",
  },
  {
    q: "What questions should I ask at the end of an interview?",
    a: 'Ask about the role, the team or the next steps, such as "What does success look like in the first three months?" Avoid asking about pay or time off in a first interview unless they bring it up.',
  },
];

export const SAMPLE_ANSWERS = [
  {
    id: "no-experience",
    label: "With no experience",
    role: "Recent Graduate / Entry Level",
    text: "I recently graduated with a degree in business, where I focused on marketing. During my final year, I led a team project to create a social media plan for a local bakery, and they used our ideas for their holiday campaign. I also worked part-time in retail, which taught me how to talk to customers. I'm now looking for an entry-level marketing role where I can keep learning, and I liked how your team shares its campaign results openly.",
    note: "Highlights coursework, a practical student project with real business impact, and customer-facing retail skills.",
  },
  {
    id: "student-internship",
    label: "Student or internship",
    role: "Undergraduate / Intern",
    text: "I'm a third-year computer science student, and I enjoy turning messy data into something useful. In my data class, I analyzed a public dataset and presented the findings to my professor and class. Outside class, I volunteer as a tutor. I'm applying for this internship because I want real experience on a team that builds products people use every day.",
    note: "Bridges coursework, presentation skills, and extracurricular initiative into motivation for the internship.",
  },
  {
    id: "experienced-pro",
    label: "Experienced professional",
    role: "Mid-to-Senior Professional",
    text: "I'm a project manager with eight years of experience, mostly in software teams. In my current role, I lead projects across design, engineering and sales, and I introduced a weekly planning routine that helped us deliver more projects on time. I'm now looking to manage larger programs, and your plan to expand into new markets is exactly the kind of challenge I want.",
    note: "Crisp statement of years of experience, specific cross-functional impact, and alignment with company expansion.",
  },
  {
    id: "career-change",
    label: "Career change",
    role: "Pivoting Fields",
    text: "For the past six years I've been a teacher, where I explained complex ideas simply and managed 30 people at a time. Over the last year, I've been moving into customer success, completing a course and helping a local startup onboard new users. I'm looking for a role where I can use my communication skills with customers, and your focus on training clients fits that well.",
    note: "Reframes existing strengths (clear communication, group management) into immediate value for the new industry.",
  },
  {
    id: "nurse",
    label: "Nurse",
    role: "Healthcare / Nursing",
    text: "I'm a registered nurse with two years of experience on a busy medical-surgical unit. I'm known for staying calm and organized during heavy shifts, and I often help new nurses settle in. I'm now looking to grow in a hospital with a strong focus on patient education, which is why your unit appealed to me.",
    note: "Proves bedside composure under pressure, peer leadership, and passion for patient education.",
  },
  {
    id: "teacher",
    label: "Teacher",
    role: "Education",
    text: "I'm an elementary school teacher with four years of experience in grades three and four. I use small groups and regular check-ins so no student falls behind, and I enjoy working closely with parents. I'm interested in your school because of its focus on reading, which is the area I care about most.",
    note: "Demonstrates differentiated instruction, family communication, and philosophical match with school priorities.",
  },
  {
    id: "software-engineer",
    label: "Software engineer",
    role: "Engineering / Tech",
    text: "I'm a back-end engineer with four years of experience building APIs for e-commerce. In my current role, I rebuilt a slow part of our checkout and worked closely with product and design along the way. I'm now looking for a team where I can work on systems at a larger scale, and your engineering blog shows the kind of problems I'd like to solve.",
    note: "Highlights core technical domain (backend APIs), cross-functional collaboration, and curiosity about scale.",
  },
  {
    id: "customer-service",
    label: "Customer service",
    role: "Support & Operations",
    text: "I've worked in customer service for three years, mostly on the phone in a busy call center. I'm good at calming upset customers and fixing problems on the first call, and my manager often passed me escalated cases. I'm looking for a role where I can keep helping customers and grow into a senior position.",
    note: "De-escalation capability and first-contact resolution are the exact proof points support managers seek.",
  },
  {
    id: "sales",
    label: "Sales",
    role: "Revenue & Business Development",
    text: "I'm a sales representative with three years of experience selling software to small businesses. I build relationships by learning each client's real problem first, and I've consistently met my targets. I'm now looking to move into larger accounts, and your product fits the kind of customers I know best.",
    note: "Shows consultative selling habits, consistent target achievement, and ready ambition for larger deal sizes.",
  },
];

export const GUIDE_FAQS = [
  {
    q: "How do you answer \"Tell me about yourself\" in an interview?",
    a: "Use the present–past–future formula: say who you are now, share one or two relevant achievements, and explain why you want this job. Keep it to 60 to 90 seconds.",
  },
  {
    q: "How long should \"Tell me about yourself\" be?",
    a: "Aim for 60 to 90 seconds. That is enough to cover your present, past and future without losing the interviewer's attention.",
  },
  {
    q: "How do I answer \"Tell me about yourself\" with no experience?",
    a: "Talk about your studies, projects, volunteering or part-time work. Pick one project with a clear result, and explain why this role is the right next step for you.",
  },
  {
    q: "Should I talk about my personal life?",
    a: "Keep it mainly about your work and skills. A short, relevant interest is fine, but leave out personal details such as age, family or religion.",
  },
  {
    q: "What is the best way to start my answer?",
    a: "Start with your current role or field, for example: \"I'm a customer service rep with three years of experience.\" It tells the interviewer straight away who you are.",
  },
  {
    q: "Is \"Tell me about yourself\" the same as \"Walk me through your resume\"?",
    a: "They are similar. For \"walk me through your resume,\" you can go in order through your roles, but still keep it short and focused on what matters for this job.",
  },
  {
    q: "How can I practice my answer?",
    a: "Write your three parts, then say them out loud and time yourself. Practicing with a mock interview, such as an AI interviewer that asks follow-up questions, helps you sound natural.",
  },
];

/* =========================================================================
   WHY SHOULD WE HIRE YOU DATA
   ========================================================================= */

export interface SampleAnswerItem {
  id: string;
  label: string;
  role?: string;
  text: string;
  note?: string;
}

export const WHY_HIRE_SITUATION_ANSWERS: SampleAnswerItem[] = [
  {
    id: "no-experience",
    label: "With no experience",
    role: "Recent Graduate / First Job",
    text: "You're looking for someone who learns quickly and works well with a team. At college, I led a four-person project to build a marketing plan for a local café, and the owner used our ideas for her spring promotion. I also worked part-time while studying, so I know how to manage my time and deal with customers. I'm ready to learn fast and be useful early.",
    note: "Connects course project success and student part-time work to fast on-the-job contribution.",
  },
  {
    id: "internship",
    label: "For an internship",
    role: "Student / Intern",
    text: "I've already used the skills this internship needs. In my data class, I cleaned and analyzed a real dataset and presented what I found. I'm curious, I ask questions early and I finish what I start. I'd bring that energy and learn as much as I can from your team.",
    note: "Directly proves coursework skills, curiosity, and work ethic.",
  },
  {
    id: "experienced",
    label: "As an experienced candidate",
    role: "Mid / Senior Level",
    text: "You need someone who can run projects from start to finish and keep stakeholders aligned. Over the last five years, I've led projects with budgets of up to $500,000, and I set up a weekly report that cut our status meetings in half. I can bring the same structure here and help your team deliver with fewer surprises.",
    note: "Quantifies budget management ($500k) and shows time-saving efficiency.",
  },
  {
    id: "career-changer",
    label: "As a career changer",
    role: "Transferring Industries",
    text: "I'm new to this field, but not to the skills it needs. As a teacher, I explained complex ideas simply, managed 30 people at once and kept detailed records every day. Those are the core of a customer success role. I've also completed a course to fill the technical gaps, so I'd bring a fresh view and strong communication from day one.",
    note: "Frames transferable strengths (communication, group management) and coursework proactively.",
  },
  {
    id: "over-others",
    label: "Over other candidates",
    role: "Standing Out Professionally",
    text: "I can't speak for the other candidates, but I can tell you what I bring. I have the technical skills this role needs and three years of working directly with clients, so I can build the solution and explain it clearly to the people who use it.",
    note: "Never criticizes other candidates. Highlights a rare dual mix of technical depth + client-facing clarity.",
  },
];

export const WHY_HIRE_JOB_ANSWERS: SampleAnswerItem[] = [
  {
    id: "customer-service",
    label: "Customer service representative",
    text: "You need someone calm under pressure who fixes problems on the first contact. I've handled a high call volume for two years and regularly took escalated cases. I'd help your team keep customers happy and reduce repeat calls.",
  },
  {
    id: "retail-sales",
    label: "Retail sales associate",
    text: "You want someone who can help customers and drive sales on a busy floor. In my last store, I was often one of the top sellers on my shift because I asked questions before suggesting products. I'd bring that same approach to your store.",
  },
  {
    id: "nurse",
    label: "Nurse",
    text: "Your unit needs a nurse who stays organized under pressure and communicates clearly with patients and families. During my rotations, I cared for up to five patients per shift and worked closely with doctors on care plans. I'm committed to safe, kind care, and I'd be a dependable part of your team.",
  },
  {
    id: "teacher",
    label: "Teacher",
    text: "You're looking for a teacher who can engage every student, not just the confident ones. I use small groups and quick check-ins so no one falls behind, and my students' reading scores rose over the year. I'd bring that focus on every learner to your classroom.",
  },
  {
    id: "software-engineer",
    label: "Software engineer",
    text: "You need an engineer who can ship reliable code and work across teams. In my current role, I rebuilt a slow part of our checkout, working with design and product the whole way. I'd bring that mix of hands-on coding and teamwork.",
  },
  {
    id: "data-analyst",
    label: "Data analyst",
    text: "You need someone who can turn data into decisions. I built a weekly dashboard that my manager used to plan stock, and it helped us cut waste. I can do the same with your data and make it easy for non-technical teams to use.",
  },
  {
    id: "project-manager",
    label: "Project manager",
    text: "You need someone who keeps projects on time and people informed. I've delivered projects across several teams by setting clear owners and weekly check-ins. I'd bring that structure and help your team hit deadlines with less stress.",
  },
  {
    id: "marketing-coordinator",
    label: "Marketing coordinator",
    text: "You want someone who can plan campaigns and track what works. I ran our social media calendar and grew engagement by testing posts and doubling down on what performed. I'd bring that test-and-learn approach to your campaigns.",
  },
  {
    id: "admin-assistant",
    label: "Administrative assistant",
    text: "You need someone organized who keeps the office running smoothly. I managed calendars, travel and supplies for a team of 12, with nothing falling through the cracks. I'd take that off your plate so your team can focus on their work.",
  },
  {
    id: "accountant",
    label: "Accountant or bookkeeper",
    text: "You need accurate books and on-time closes. I handled monthly reconciliations for several clients and spotted errors before they became problems. I'd bring that attention to detail to your finance team.",
  },
  {
    id: "sales-rep",
    label: "Sales representative",
    text: "You need someone who can build a pipeline and close. I consistently met my targets by following up quickly and learning each client's real problem. I'd bring that discipline and help your team grow revenue.",
  },
  {
    id: "restaurant-staff",
    label: "Server or restaurant staff",
    text: "You need someone fast, friendly and calm on a busy night. I've worked weekend rushes for two years and kept tables happy even when the kitchen was backed up. I'd be a steady pair of hands on your floor.",
  },
  {
    id: "warehouse-associate",
    label: "Warehouse associate",
    text: "You need someone reliable who works safely and hits pick targets. I've worked full shifts on my feet, followed safety rules closely and rarely missed a day. You can count on me to show up and get the work done.",
  },
  {
    id: "medical-assistant",
    label: "Medical assistant",
    text: "You need someone who can keep patients comfortable and the schedule moving. I've taken vitals, prepared rooms and updated records in a busy clinic. I'd help your providers see patients on time and feel supported.",
  },
  {
    id: "graphic-designer",
    label: "Graphic designer",
    text: "You need a designer who delivers on brand and on deadline. My portfolio shows campaigns I took from brief to launch, often with tight turnarounds. I'd bring clean, consistent design and easy collaboration to your team.",
  },
];

export const WHY_HIRE_FAQS = [
  {
    q: "What is the best answer to \"Why should we hire you?\"",
    a: "Connect two or three of your strongest skills to what the job needs, prove each with a real example, and end with how you will help the team, all in 30 to 60 seconds.",
  },
  {
    q: "How do I answer \"Why should we hire you?\" with no experience?",
    a: "Use projects, part-time work, volunteering or school results as proof, and show that you learn fast and are ready to contribute early.",
  },
  {
    q: "How long should my answer be?",
    a: "About 30 to 60 seconds, or four to six sentences.",
  },
  {
    q: "How do I answer \"Why should we hire you over other candidates?\"",
    a: "Don't mention the other candidates. Explain what makes you different, such as a rare mix of skills or direct experience with the same problems the company has.",
  },
  {
    q: "Should I memorize my answer?",
    a: "Learn your three main points, not a script. Then practice out loud until it sounds natural.",
  },
  {
    q: "Can I mention salary in my answer?",
    a: "No. This question is about what you bring to the company, so keep the focus on your skills and value.",
  },
];

export const WEAK_TO_STRONG_DRAFTS = [
  {
    draft: "Draft 1: Weak",
    badge: "Weak",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    quote: "I'm a hard worker, I'm great with people, and I'm really passionate about customer service. I think I'd be a great fit.",
    analysis: "Problem: nothing is proven. Any candidate could say it.",
  },
  {
    draft: "Draft 2: Better",
    badge: "Better",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    quote: "I have two years of customer service experience at a busy call center. I handled a lot of calls and often took the difficult cases. I'm patient and I like solving problems.",
    analysis: "Better: real experience. Still missing: it is about the candidate, not the company.",
  },
  {
    draft: "Draft 3: Strong",
    badge: "Strong (Winning Answer)",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
    quote: "Your job post says you need someone who can handle a high volume of calls and calm down upset customers. That's what I did for two years at a busy call center, where I handled around 60 calls a day and was the person my manager gave escalated cases to. I listen first, I stay calm and I follow up until the problem is fixed. I'd bring that from my first week and help your team keep wait times and complaints down.",
    analysis: "Why it works: it starts with their need, proves it with a number and ends with what the company gets.",
  },
];

export const INTERVIEWER_CHECKLIST = [
  {
    listenFor: "Relevance",
    strong: "Skills from this job description",
    weak: "General strengths",
  },
  {
    listenFor: "Proof",
    strong: "A number, result or short story",
    weak: "Words like \"hardworking\"",
  },
  {
    listenFor: "Focus",
    strong: "What the company gets",
    weak: "What you want from the job",
  },
  {
    listenFor: "Length",
    strong: "30 to 60 seconds",
    weak: "Two-plus minutes, or one line",
  },
  {
    listenFor: "Delivery",
    strong: "Calm, clear, natural",
    weak: "Rushed or memorized word for word",
  },
];

/* =========================================================================
   TELL ME ABOUT YOURSELF (INTERNSHIP) DATA
   ========================================================================= */

export const INTERNSHIP_LOOK_FOR = [
  {
    title: "Interest",
    badge: "Passion & Purpose",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    gradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
    question: "Do you care about this field, and can you say why?",
    detail: "They want to hear genuine excitement about the subject matter rather than someone looking for just any resume line.",
  },
  {
    title: "Initiative",
    badge: "Self-Starter",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    gradient: "from-indigo-500/10 via-violet-500/5 to-transparent",
    question: "Have you done something on your own, like a project, club or job?",
    detail: "Showing you built, organized, or led something demonstrates curiosity and work ethic without formal corporate experience.",
  },
  {
    title: "Coachability",
    badge: "Learning Speed",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    question: "Will you learn fast and take feedback well?",
    detail: "Managers love interns who listen actively, ask smart clarifying questions, and quickly apply constructive guidance.",
  },
];

export const INTERNSHIP_EXPERIENCE_TABLE = [
  {
    useThis: "Class project",
    iconKey: "folder",
    badgeClass: "bg-blue-50 text-blue-600 border border-blue-200/80 shadow-[0_2px_8px_-2px_rgba(37,99,235,0.18)]",
    shows: "Skills and teamwork",
    howToSay: '"In my final-year project, I built a prototype application with a team of four..."',
  },
  {
    useThis: "Club or society role",
    iconKey: "users",
    badgeClass: "bg-amber-50 text-amber-600 border border-amber-200/80 shadow-[0_2px_8px_-2px_rgba(217,119,6,0.18)]",
    shows: "Leadership and initiative",
    howToSay: '"As treasurer of the business club, I managed the event budget and grew attendance..."',
  },
  {
    useThis: "Part-time job",
    iconKey: "coffee",
    badgeClass: "bg-orange-50 text-orange-600 border border-orange-200/80 shadow-[0_2px_8px_-2px_rgba(234,88,12,0.18)]",
    shows: "Reliability and people skills",
    howToSay: '"Working at a busy café taught me to stay calm under rush hours and communicate clearly..."',
  },
  {
    useThis: "Volunteering",
    iconKey: "heart",
    badgeClass: "bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-[0_2px_8px_-2px_rgba(5,150,105,0.18)]",
    shows: "Values and commitment",
    howToSay: '"Every weekend I volunteer at the food pantry, coordinating intake and logistics..."',
  },
  {
    useThis: "Personal project",
    iconKey: "laptop",
    badgeClass: "bg-indigo-50 text-indigo-600 border border-indigo-200/80 shadow-[0_2px_8px_-2px_rgba(79,70,229,0.18)]",
    shows: "Curiosity and self-motivation",
    howToSay: '"In my free time, I built a small web app to track my study habits and published it..."',
  },
  {
    useThis: "Online course or certificate",
    iconKey: "graduation",
    badgeClass: "bg-purple-50 text-purple-600 border border-purple-200/80 shadow-[0_2px_8px_-2px_rgba(147,51,234,0.18)]",
    shows: "Willingness to learn",
    howToSay: '"I completed a specialized course in SQL to analyze deeper dataset patterns..."',
  },
];

export const INTERNSHIP_FIELD_ANSWERS: SampleAnswerItem[] = [
  {
    id: "marketing",
    label: "Marketing internship",
    role: "Marketing Student",
    text: "I'm a third-year marketing student, and I'm most interested in social media. I run the Instagram account for my university's film club, and I grew it by posting student reviews and short clips. I also work part-time in a clothing store, so I see how customers react to promotions. I'm applying here because I want to learn how a real brand plans campaigns, and I love how your team works with local businesses.",
    note: "Mixes digital club growth metrics with face-to-face consumer retail insights.",
  },
  {
    id: "swe",
    label: "Software engineering internship",
    role: "Computer Science Student",
    text: "I'm a second-year computer science student, and I enjoy building things people can use. Last semester, my team built a study-planner app for a class project, and I wrote the back end. In my free time, I'm learning React through an online course. I'd love to intern here because I want to see how a real engineering team ships code, and your mentorship program stood out.",
    note: "Demonstrates practical backend coursework, active frontend self-learning, and eagerness for engineering mentorship.",
  },
  {
    id: "finance",
    label: "Finance or accounting internship",
    role: "Finance Major",
    text: "I'm a finance major in my junior year, and I'm interested in how companies make investment decisions. As treasurer of our business club, I manage a small budget and track every expense in a spreadsheet. I'm also studying for a financial modeling certificate. This internship would let me apply what I'm learning to real numbers, and your firm's focus on small businesses really interests me.",
    note: "Highlights budget handling responsibility, certification initiative, and small business financial alignment.",
  },
  {
    id: "healthcare",
    label: "Healthcare or nursing internship",
    role: "Nursing Student",
    text: "I'm a second-year nursing student, and I'm drawn to patient education. I volunteer at a local clinic on weekends, where I help check patients in and explain forms. My clinical placements have taught me to stay calm and organized. I'm applying because I want hands-on experience in a busy hospital, and your hospital's training for students is well known.",
    note: "Validates clinic volunteering, bedside calm, and dedication to patient understanding.",
  },
  {
    id: "business-ops",
    label: "Business or operations internship",
    role: "Business Administration",
    text: "I'm studying business administration, and I'm interested in how teams run efficiently. For a class project, I mapped out the ordering process at a local restaurant and suggested changes the owner tried. I also work part-time as a shift lead at a café. I want this internship to learn how operations work at a larger company like yours.",
    note: "Highlights process optimization experience and part-time leadership responsibility.",
  },
  {
    id: "design",
    label: "Design internship",
    role: "Graphic Design Student",
    text: "I'm a graphic design student in my final year, and I love branding. I've designed logos and posters for three student events, and one was used across campus. I'm also building my portfolio with personal projects. I'd love to intern with your studio because your brand work for startups is exactly the kind of design I want to learn.",
    note: "Cites published campus designs and specific admiration for startup brand identity.",
  },
  {
    id: "high-school",
    label: "High school student (first internship)",
    role: "High School Senior",
    text: "I'm a high school senior, and I'm interested in engineering. I'm on my school's robotics team, where I help build and test our robot for competitions. I also tutor younger students in math. I'm applying for this internship because I want to see what engineers do every day, and it would help me choose what to study in college.",
    note: "Shows extracurricular robotics testing, tutoring commitment, and clear college discernment goals.",
  },
];

export const INTERNSHIP_FAQS = [
  {
    q: "How do I answer \"Tell me about yourself\" for an internship?",
    a: "Say what you study and what interests you, share one project, club or job that shows a relevant skill, and explain why you want this internship. Keep it to 45 to 60 seconds.",
  },
  {
    q: "What if I have no work experience?",
    a: "That is normal for interns. Use class projects, clubs, volunteering, part-time jobs or personal projects as your examples.",
  },
  {
    q: "How long should my answer be for an internship interview?",
    a: "About 45 to 60 seconds. Internship answers can be a little shorter than answers for full-time jobs.",
  },
  {
    q: "Should I mention my GPA?",
    a: "Only if it is strong and relevant, or if the company asks for it. Projects and real examples usually say more than grades.",
  },
  {
    q: "Can I talk about hobbies?",
    a: "Yes, if they link to the role or show a useful skill, such as a coding hobby for a tech internship. Keep it to one sentence.",
  },
  {
    q: "What are the most common internship interview questions?",
    a: '"Tell me about yourself," "Why do you want this internship?", "Tell me about a project you\'re proud of," "Describe a time you worked in a team," and "What are your strengths and weaknesses?"',
  },
];
