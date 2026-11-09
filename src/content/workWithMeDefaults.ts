export interface WorkWithMeCard {
  id: string;
  title: string;
  blurb: string;
  bullets: string[];
  tags: string[];
  ctaLabel: string;
  ctaUrl: string;
  visible: boolean;
}

export interface WorkWithMeData {
  heading: string;
  intro: string;
  cards: WorkWithMeCard[];
}

export const workWithMeDefaults: WorkWithMeData = {
  heading: "Available for Contract, Analytics & Prompt Engineering",
  intro: "Three dedicated engagement channels separated by clear contract terms and verified delivery models. Direct escrow on Upwork, curated generative prompts on PromptBase, or custom remote contracts.",
  cards: [
    {
      id: "card-upwork",
      title: "Upwork",
      blurb: "Hire me for dedicated data science, Python automation, and statistical analysis contracts with escrow protection.",
      bullets: [
        "{rate} Standard Rate",
        "Open to Contract-to-Hire"
      ],
      tags: ["Data Analysis", "Machine Learning", "Dashboards"],
      ctaLabel: "Hire on Upwork",
      ctaUrl: "https://www.upwork.com/",
      visible: true
    },
    {
      id: "card-promptbase",
      title: "PromptBase",
      blurb: "Production-tested generative prompts for image models and LLM automation workflows with verified outputs.",
      bullets: [
        "Platform Rank #1899 (@camih8)",
        "220+ Published Prompts"
      ],
      tags: ["AI Prompt Engineering", "Leonardo.AI", "ChatGPT"],
      ctaLabel: "Browse Prompts",
      ctaUrl: "https://promptbase.com/profile/camih8",
      visible: true
    },
    {
      id: "card-direct",
      title: "Direct Engagement",
      blurb: "Reach out directly for freelance contracts, custom database pipelines, or part-time remote roles.",
      bullets: [
        "hmidanihicham8@gmail.com",
        "Remote Part-Time Available"
      ],
      tags: ["Freelance Projects", "Part-Time Roles", "Consulting"],
      ctaLabel: "Send Direct Email",
      ctaUrl: "mailto:hmidanihicham8@gmail.com",
      visible: true
    }
  ]
};
