/**
 * What the Feedback button asks, by screen. Generic "how was it?" produces
 * generic answers; a question about the thing on screen produces a usable one.
 * Each screen gets a yes/no-ish lead question (the mood) and two or three
 * specific prompts the tester answers in the note.
 */

export interface FeedbackPrompt {
  /** Short name of the screen, for the alert ("Report", "Answer feedback"). */
  screen: string;
  /** The lead question the three faces answer. */
  lead: string;
  /** What we'd most like to know on this screen. */
  asks: string[];
}

const GENERAL: FeedbackPrompt = {
  screen: "General",
  lead: "Is Hakkiri doing what you hoped?",
  asks: [
    "What did you come here to do, and did you manage it?",
    "What was the one moment you nearly gave up or got confused?",
    "What would you tell a friend it's for?",
  ],
};

const RULES: { test: RegExp; prompt: FeedbackPrompt }[] = [
  {
    test: /^\/interviews\/[^/]+\/answers\//,
    prompt: {
      screen: "Answer feedback",
      lead: "Was this score fair?",
      asks: [
        "Which line of the feedback was wrong, or missed what you were trying to say?",
        "Would you actually say the stronger version out loud? If not, what's off about it?",
        "Did the delivery numbers (pace, fillers) match how it felt?",
      ],
    },
  },
  {
    test: /^\/interviews\/[^/]+\/mocks\//,
    prompt: {
      screen: "Report",
      lead: "Was the verdict (Ready / Nearly / Not yet) right?",
      asks: [
        "Which of the top three fixes would you actually act on before a real interview?",
        "Which score surprised you most, and why?",
        "What did a real interviewer tell you once that this report missed?",
      ],
    },
  },
  {
    test: /^\/interviews\/[^/]+\/prep/,
    prompt: {
      screen: "Prep sheet",
      lead: "Would you take this into the interview?",
      asks: [
        "What's on it that you'd cross out?",
        "What's missing that you'd write in the margin?",
      ],
    },
  },
  {
    test: /^\/interviews\/[^/]+\/story/,
    prompt: {
      screen: "Story bank",
      lead: "Do these stories sound like you?",
      asks: [
        "Which story is wrong about what you did, or overstates it?",
        "Which question do you get asked that none of these covers?",
      ],
    },
  },
  {
    test: /^\/interviews\/[^/]+\/briefing/,
    prompt: {
      screen: "Briefing",
      lead: "Did the questions fit the job?",
      asks: [
        "Which question would never be asked for this role?",
        "Which obvious question for this role is missing?",
      ],
    },
  },
  {
    test: /^\/interviews\/[^/]+/,
    prompt: {
      screen: "Interview workspace",
      lead: "Is it clear what to do next from here?",
      asks: [
        "What did you expect to find on this screen that isn't here?",
        "What's here that you'd never use?",
      ],
    },
  },
  {
    test: /^\/mock\//,
    prompt: {
      screen: "Live interview",
      lead: "Did it feel like an interview?",
      asks: [
        "Where did the interviewer get it wrong: a follow-up that didn't follow, a cut-in at the wrong moment, a question that made no sense?",
        "Did anything break: mic, voice, timer, a long wait?",
        "Harder or easier than a real one for this job?",
      ],
    },
  },
  {
    test: /^\/rehearse\//,
    prompt: {
      screen: "Rehearsal",
      lead: "Did the timings and clicker work for you?",
      asks: [
        "Did the per-slide times match how you'd plan the talk?",
        "What did you want the screen to show while you spoke that it didn't?",
      ],
    },
  },
  {
    test: /^\/qa\//,
    prompt: {
      screen: "Audience Q&A",
      lead: "Were the questions ones a real audience would ask?",
      asks: [
        "Which question was off, or too easy?",
        "Which style (curious, sceptical, time-pressed, technical) felt least real?",
      ],
    },
  },
  {
    test: /^\/presentations\/[^/]+\/runs\//,
    prompt: {
      screen: "Run report",
      lead: "Did 'where to cut' match what you'd cut?",
      asks: [
        "Which key point did it say landed, or missed, wrongly?",
        "Would you use the rewritten opening? What's off about it?",
      ],
    },
  },
  {
    test: /^\/presentations\/[^/]+/,
    prompt: {
      screen: "Presentation workspace",
      lead: "Were your slides read correctly?",
      asks: [
        "Which slide's key point or timing is wrong?",
        "What was fiddly about getting the slides in?",
      ],
    },
  },
  // CVs and cover letters: one question per kind of screen, most specific first.
  {
    test: /^\/cv\/check\/[^/]+/,
    prompt: {
      screen: "CV check report",
      lead: "Was this check of your CV fair?",
      asks: [
        "Which fix was wrong, or about words that are fine as they are?",
        "Did \"How software reads it\" match what you see in your file?",
        "Would you change your CV because of this report? Which part?",
      ],
    },
  },
  {
    test: /^\/cv\/check/,
    prompt: {
      screen: "CV check",
      lead: "Was it clear how to check your CV?",
      asks: [
        "Did your file upload and read correctly? If not, what kind of file was it?",
        "What did you expect to happen next that didn't?",
      ],
    },
  },
  {
    test: /^\/cv\/v\/[^/]+\/letter/,
    prompt: {
      screen: "Cover letter",
      lead: "Would you send this cover letter?",
      asks: [
        "Which sentence doesn't sound like you, or says more than you did?",
        "Did the checks on each sentence help, or get in the way?",
      ],
    },
  },
  {
    test: /^\/cv\/v\/[^/]+\/tailor/,
    prompt: {
      screen: "Tailor to a job",
      lead: "Did tailoring make your CV a better fit for the job?",
      asks: [
        "Which requirement did it read wrongly from the advert?",
        "Did it ever suggest something you haven't done?",
      ],
    },
  },
  {
    test: /^\/cv\/v\/[^/]+\/talk/,
    prompt: {
      screen: "Talk it through",
      lead: "Did talking it through build your CV well?",
      asks: [
        "Which question was confusing or repeated?",
        "Did it add anything to your CV you didn't say?",
      ],
    },
  },
  {
    test: /^\/cv\/v\//,
    prompt: {
      screen: "CV editor",
      lead: "Was it easy to get your CV how you want it?",
      asks: [
        "What took longer than it should have?",
        "Does the downloaded file look right, and fit the pages you expected?",
        "Was the score fair? Which suggestion didn't make sense?",
      ],
    },
  },
  {
    test: /^\/cv\/import\//,
    prompt: {
      screen: "Upload check",
      lead: "Did we read your CV correctly?",
      asks: [
        "What did we put in the wrong section, or miss altogether?",
        "What kind of file was it (PDF, Word, made in Canva or a builder)?",
      ],
    },
  },
  {
    test: /^\/cv\/(examples|templates)/,
    prompt: {
      screen: "Examples and templates",
      lead: "Did you find a design or example that suits you?",
      asks: [
        "What job or industry did you look for and not find?",
        "Which designs looked too alike?",
      ],
    },
  },
  {
    test: /^\/cv(\/new)?\/?$/,
    prompt: {
      screen: "CVs and letters",
      lead: "Did you know how to start?",
      asks: [
        "Which way of starting did you pick, and was it the right one?",
        "What did you expect to find here that isn't?",
      ],
    },
  },
  {
    test: /^\/story-bank/,
    prompt: {
      screen: "Story bank",
      lead: "Do these stories sound like you?",
      asks: [
        "Which story is wrong about what you did, or overstates it?",
        "Which question do you get asked that none of these covers?",
      ],
    },
  },
  {
    test: /^\/settings/,
    prompt: {
      screen: "Settings",
      lead: "Is everything here clear?",
      asks: [
        "Which setting did you look for and not find?",
        "Is the retention and delete wording clear enough that you'd trust it?",
      ],
    },
  },
  {
    test: /^\/welcome|^\/$/,
    prompt: {
      screen: "Home",
      lead: "Did you know what to do first?",
      asks: [
        "What did you click first, and was it the right thing?",
        "What's the one thing you'd want on this screen that isn't here?",
      ],
    },
  },
];

export function feedbackPrompt(pathname: string): FeedbackPrompt {
  const path = pathname.split("?")[0];
  return RULES.find((r) => r.test.test(path))?.prompt ?? GENERAL;
}
