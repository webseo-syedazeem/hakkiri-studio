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
  },
  {
    id: 4,
    category: "about-you",
    categoryLabel: "Questions about you",
    question: "What is your greatest weakness?",
    whatTheyWant: "If you are honest and can improve.",
    howToAnswer: "Name a real weakness that is not key to the job, and say what you are doing about it.",
    example: "I used to find public speaking hard, so I joined a speaking group and now present at our weekly team meeting.",
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
      href: "/interview-questions/tell-me-about-yourself#follow-ups",
      text: "Full guide with sample answers →",
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
