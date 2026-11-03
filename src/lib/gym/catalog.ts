export interface ActivityModel {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cognitiveMechanism: string;
  prepDurationSeconds: number;
  defaultDurationSeconds: number;
  benefits: string[];
  successMeasures: string[];
  icon: string;
  badge: string;
}

export interface PromptModel {
  id: string;
  activitySlug: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  title?: string;
  promptText: string;
  secondaryText?: string;
  objective: string;
  exemplarResponse: string;
  tags: string[];
  durationSeconds: number;
  prepSeconds: number;
}

export interface WeeklyRoadmapWeek {
  weekNumber: number;
  title: string;
  focus1: string;
  focus2: string;
  durationLabel: string;
  dailyMinutes: number;
  activities: string[];
}

export const ACTIVITIES: ActivityModel[] = [
  {
    slug: "think_fast",
    name: "Think Fast",
    tagline: "Instant cognitive agility under time pressure",
    description: "A random high-stakes question flashes on screen with a 3-second delay. You speak for 60 seconds using bottom-line-up-front (BLUF) structure.",
    cognitiveMechanism: "Rapid lexical retrieval and on-the-spot framing under acute pressure",
    prepDurationSeconds: 3,
    defaultDurationSeconds: 60,
    benefits: [
      "High cognitive agility under stress",
      "Higher perceived authority",
      "Eliminates meeting waffle & hesitation",
    ],
    successMeasures: [
      "Low latency & zero stall tactics",
      "BLUF conclusion in first 10 seconds",
      "Crisp ending without trailing off",
    ],
    icon: "zap",
    badge: "Core Agility",
  },
  {
    slug: "cut_it_in_half",
    name: "Cut It In Half",
    tagline: "Extreme information synthesis and brevity",
    description: "Review a lengthy corporate brief in 45 seconds, then summarize the core thesis with at least 50% rate compression.",
    cognitiveMechanism: "Information distillation, compression, and high-density verbalization",
    prepDurationSeconds: 15,
    defaultDurationSeconds: 45,
    benefits: [
      "Forces deep information synthesis",
      "Commands respect through executive brevity",
      "Increases executive stakeholder retention",
    ],
    successMeasures: [
      "Rate compression (50%+ reduction)",
      "Time to value (BLUF)",
      "Zero corporate jargon padding",
    ],
    icon: "target",
    badge: "Conciseness",
  },
  {
    slug: "one_minute_expert",
    name: "1 Minute Expert",
    tagline: "Thematic chunking and spontaneous authority",
    description: "Select a broad concept and speak authoritatively for exactly 60 seconds with an attention hook, 2 structured points, and a punchy wrap-up.",
    cognitiveMechanism: "Categorical frameworks and executive thesis construction",
    prepDurationSeconds: 5,
    defaultDurationSeconds: 60,
    benefits: [
      "Trains brain to chunk complex topics instantly",
      "Builds spontaneous executive presence",
      "Eliminates rambling without clear point",
    ],
    successMeasures: [
      "Pivotal attention hook",
      "Distinct categorical depth",
      "Exact 60-second time calibration",
    ],
    icon: "award",
    badge: "Authority",
  },
  {
    slug: "explain_it_simply",
    name: "Explain It Simply",
    tagline: "Demystifying complexity for non-experts",
    description: "Translate a complex domain concept into crystal-clear language for a designated non-expert persona without jargon.",
    cognitiveMechanism: "Analogical reasoning and demographic persona calibration",
    prepDurationSeconds: 10,
    defaultDurationSeconds: 60,
    benefits: [
      "Unlocks cross-functional leadership credibility",
      "Forces conceptual mastery",
      "Reduces meeting friction across stakeholders",
    ],
    successMeasures: [
      "Persona calibration (plain analogies)",
      "Time to value",
      "Linguistic fit & zero technical traps",
    ],
    icon: "sparkles",
    badge: "Clarity",
  },
  {
    slug: "storytelling_gym",
    name: "Storytelling Gym",
    tagline: "Transform data dumps into compelling narratives",
    description: "Deliver a powerful 3-part narrative (Context/Tension, Turning Point, Strategic Lesson) in 60 seconds.",
    cognitiveMechanism: "Narrative arc pacing, conflict elevation, and strategic lesson landing",
    prepDurationSeconds: 10,
    defaultDurationSeconds: 60,
    benefits: [
      "Higher message retention across team",
      "Drives alignment and high persuasion",
      "Projects relatable executive presence",
    ],
    successMeasures: [
      "3-Part Narrative Arc",
      "Tension density & resolution",
      "Strategic executive significance",
    ],
    icon: "book",
    badge: "Engagement",
  },
  {
    slug: "connect_the_dots",
    name: "Connect the Dots",
    tagline: "Lateral thinking and the seamless pivot",
    description: "Connect two completely random concepts with a seamless logical bridge within 60 seconds without stammering.",
    cognitiveMechanism: "Associative retrieval and metaphorical bridge building",
    prepDurationSeconds: 5,
    defaultDurationSeconds: 60,
    benefits: [
      "Accelerates neural plasticity",
      "Mastery of spontaneous meeting pivots",
      "Unlocks creative problem solving",
    ],
    successMeasures: [
      "Seamless bridge logic",
      "Smooth pivot placement",
      "Chest resonance speech mechanics",
    ],
    icon: "trending",
    badge: "Lateral Thinking",
  },
  {
    slug: "debate_me",
    name: "Debate Me",
    tagline: "Grace under fire and adversarial pushback",
    description: "Defend your position against an assertive stakeholder objection, maintaining calm chest resonance and eliminating uptalk.",
    cognitiveMechanism: "Emotional de-escalation, power pauses, and counter-framing",
    prepDurationSeconds: 5,
    defaultDurationSeconds: 60,
    benefits: [
      "Builds neuromuscular resilience against stage fright",
      "Commands psychological control with silence",
      "Eliminates defensive pitch & nervous uptalk",
    ],
    successMeasures: [
      "Delivery & deliberate power pauses",
      "Rhetorical counter-framing integrity",
      "Unwavering perceived confidence",
    ],
    icon: "shield",
    badge: "Pushback & Stress",
  },
];

export const PROMPTS: PromptModel[] = [
  // Think Fast
  {
    id: "tf_stakeholder",
    activitySlug: "think_fast",
    difficulty: "beginner",
    title: "Difficult Stakeholder",
    promptText: "A key stakeholder strongly challenges your timeline in front of senior executives. How do you respond in the first 60 seconds?",
    objective: "Acknowledge concerns calmly, state your boundary with poise, and align on shared business objectives.",
    exemplarResponse: "I understand the urgency behind this release date. Our timeline protects system stability, and I propose we review the critical path deliverables together after this briefing to align on priority tradeoffs.",
    tags: ["stakeholder", "conflict", "executive"],
    durationSeconds: 60,
    prepSeconds: 3,
  },
  {
    id: "tf_budget_cut",
    activitySlug: "think_fast",
    difficulty: "intermediate",
    title: "Unexpected 20% Budget Cut",
    promptText: "Your VP announces an immediate 20% budget cut across all squads. Defend your initiative's core ROI without sounding defensive.",
    objective: "Anchor to revenue impact and unit economics rather than headcount or effort.",
    exemplarResponse: "While we support overall cost discipline, this squad directly preserves \$1.4M in annual recurring contract renewals. Pausing it now would trigger immediate customer churn.",
    tags: ["finance", "roi", "executive"],
    durationSeconds: 60,
    prepSeconds: 3,
  },
  // Cut It In Half
  {
    id: "cih_api_migration",
    activitySlug: "cut_it_in_half",
    difficulty: "beginner",
    title: "Legacy Architecture Migration Brief",
    promptText: "Distill this complex 120-word engineering brief into a 30-second executive summary for the CFO.",
    secondaryText: "Over the last five fiscal quarters, our transactional throughput has expanded by roughly 340%, which has led to significant strain on our legacy monolithic relational database tier. Consequently, page latency has spiked by 420 milliseconds, resulting in documented conversion drop-offs. The infrastructure engineering council is requesting approval for a phased cloud migration budget of \$180,000 across Q2 and Q3 to decouple payments and auth services into independently scalable event-driven services.",
    objective: "Highlight the revenue impact, the cost, and the exact decision needed in under 30 words.",
    exemplarResponse: "Our database load is costing us customer conversions. We need \$180,000 over two quarters to modernize payment services and recover lost conversion revenue.",
    tags: ["engineering", "brevity", "synthesis"],
    durationSeconds: 45,
    prepSeconds: 15,
  },
  // 1 Minute Expert
  {
    id: "ome_zero_trust",
    activitySlug: "one_minute_expert",
    difficulty: "beginner",
    title: "Zero Trust Architecture",
    promptText: "Teach a non-technical board member why 'Zero Trust' is not just a buzzword, but vital insurance.",
    objective: "Open with a vivid metaphor, provide two concrete implications, and close with strategic ROI.",
    exemplarResponse: "Traditional security treated companies like medieval castles—once inside the moat, you had total access. Zero Trust treats every door, room, and vault as independently secured. In 60 seconds: first, compromised credentials no longer bring down the company; second, customer data remains sealed. It transforms security from a perimeter wall into continuous validation.",
    tags: ["authority", "chunking", "frameworks"],
    durationSeconds: 60,
    prepSeconds: 5,
  },
  // Explain It Simply
  {
    id: "eis_vector_db",
    activitySlug: "explain_it_simply",
    difficulty: "beginner",
    title: "Explain Vector Embeddings to a 10-Year-Old",
    promptText: "Explain how AI understands the meaning of words using vector embeddings, without mentioning math or algorithms.",
    objective: "Use a playground or map analogy to make high-dimensional space instantly intuitive.",
    exemplarResponse: "Imagine a giant playground where words that are best friends hang out together. 'Puppy' and 'Dog' sit on the swings, while 'Banana' and 'Apple' play on the slide. AI puts every word on this map so it knows which concepts are close friends, even if they look totally different.",
    tags: ["analogies", "clarity", "no_jargon"],
    durationSeconds: 60,
    prepSeconds: 10,
  },
  // Storytelling Gym
  {
    id: "stg_crisis_pivot",
    activitySlug: "storytelling_gym",
    difficulty: "intermediate",
    title: "The Midnight Outage Turning Point",
    promptText: "Tell the story of a high-pressure crisis at work. Structure it with Tension, Turning Point, and Strategic Lesson.",
    objective: "Build authentic narrative tension, identify the decisive moment of action, and land the overarching leadership takeaway.",
    exemplarResponse: "At 2 AM on Black Friday, our payment gateway collapsed under peak checkout load. Half our orders were failing, and panic broke out in the war room. Instead of pointing fingers, I halted all secondary features and routed raw checkout traffic to our fallback cache. In 14 minutes, revenue flow stabilized. The lesson: in high-stakes crises, clarity of prioritization beats perfection of analysis every single time.",
    tags: ["storytelling", "narrative_arc", "executive"],
    durationSeconds: 60,
    prepSeconds: 10,
  },
  // Connect the Dots
  {
    id: "ctd_espresso_scalability",
    activitySlug: "connect_the_dots",
    difficulty: "intermediate",
    title: "Espresso Machines and Distributed Systems",
    promptText: "Connect the extraction pressure of an espresso machine with scaling a distributed microservice cluster.",
    objective: "Construct a seamless logical bridge in under 60 seconds without hesitation.",
    exemplarResponse: "An espresso machine requires exact pressure; grind the beans too fine and the water chokes, too coarse and the shot turns sour. Distributed microservices face identical backpressure dynamics. If your downstream queues don't meter incoming throughput, requests overflow and latency spikes. Both disciplines succeed through controlled calibration of flow.",
    tags: ["lateral_thinking", "pivots", "synthesis"],
    durationSeconds: 60,
    prepSeconds: 5,
  },
  // Debate Me
  {
    id: "dbm_ai_replacement",
    activitySlug: "debate_me",
    difficulty: "intermediate",
    title: "'AI makes our junior engineering team redundant.'",
    promptText: "A senior executive says: 'With LLM code assistants, we should freeze junior hiring and let AI do the work.' Counter this position authoritatively.",
    objective: "Deploy a 1-second power pause, reject the false premise without hostility, and present a higher-order strategic rationale.",
    exemplarResponse: "[Power Pause] While AI accelerates boilerplate code generation, junior engineers are our future domain architects who understand our proprietary business logic. Freezing junior talent today guarantees an irreplaceable leadership vacuum in three years. We don't replace builders with tools; we arm our builders with tools to triple output.",
    tags: ["debate", "adversarial", "power_pauses"],
    durationSeconds: 60,
    prepSeconds: 5,
  },
];

export const ROADMAP_WEEKS: WeeklyRoadmapWeek[] = [
  {
    weekNumber: 1,
    title: "Week 1: Foundations & Cadence",
    focus1: "Answer first, then explain (BLUF)",
    focus2: "Pause instead of filling with 'um' and 'like'",
    durationLabel: "5 MIN A DAY",
    dailyMinutes: 5,
    activities: ["think_fast", "cut_it_in_half"],
  },
  {
    weekNumber: 2,
    title: "Week 2: Structure & PREP",
    focus1: "Point · Reason · Example · Point",
    focus2: "Thematic chunking in 60 seconds",
    durationLabel: "5 MIN A DAY",
    dailyMinutes: 5,
    activities: ["one_minute_expert", "explain_it_simply"],
  },
  {
    weekNumber: 3,
    title: "Week 3: Stress & Pushbacks",
    focus1: "Mastering the 1-second power pause",
    focus2: "Eliminating defensive uptalk",
    durationLabel: "6 MIN A DAY",
    dailyMinutes: 6,
    activities: ["debate_me", "connect_the_dots"],
  },
  {
    weekNumber: 4,
    title: "Week 4: Executive Polish",
    focus1: "High-stakes stakeholder persuasion",
    focus2: "Compelling narrative tension arcs",
    durationLabel: "7 MIN A DAY",
    dailyMinutes: 7,
    activities: ["storytelling_gym", "think_fast"],
  },
];
