export interface LayoutSectionItem {
  id: string;
  visible: boolean;
}

export interface PortfolioLayoutData {
  sections: LayoutSectionItem[];
}

export interface SectionMeta {
  id: string;
  name: string;        // Nav label (e.g. 'Skills', 'Experience', 'Hire Me')
  fullName: string;    // Admin label
  href: string;        // Hash anchor
  description: string;
}

export const SECTION_METAS: Record<string, SectionMeta> = {
  'skills': {
    id: 'skills',
    name: 'Skills',
    fullName: 'Technical Skills',
    href: '#skills',
    description: 'Technical proficiencies, programming languages, and tool stacks.'
  },
  'experience': {
    id: 'experience',
    name: 'Experience',
    fullName: 'Professional Experience',
    href: '#experience',
    description: 'Career positions, milestones, and professional roles.'
  },
  'projects': {
    id: 'projects',
    name: 'Projects',
    fullName: 'Featured Projects',
    href: '#projects',
    description: 'Data analytics, machine learning, and dashboard case studies.'
  },
  'prompt-engineering': {
    id: 'prompt-engineering',
    name: 'AI Prompts',
    fullName: 'AI Prompt Engineering',
    href: '#prompt-engineering',
    description: 'Curated generative prompts, platform rankings, and AI models.'
  },
  'featured-service': {
    id: 'featured-service',
    name: 'Service',
    fullName: 'Featured Contract Service',
    href: '#featured-service',
    description: 'Turnkey Upwork contract offering and enterprise data visualization milestones.'
  },
  'blog': {
    id: 'blog',
    name: 'Blog',
    fullName: 'Articles & Tutorials',
    href: '#blog',
    description: 'Published technical articles, writeups, and tutorial guides.'
  },
  'education': {
    id: 'education',
    name: 'Education',
    fullName: 'Academic & Credentials',
    href: '#education',
    description: 'University degrees, academic institutions, and verified certifications.'
  },
  'work-with-me': {
    id: 'work-with-me',
    name: 'Hire Me',
    fullName: 'Work With Me',
    href: '#work-with-me',
    description: 'Three dedicated engagement channels: Upwork, PromptBase, Direct.'
  }
};

export const defaultLayoutData: PortfolioLayoutData = {
  sections: [
    { id: 'skills', visible: true },
    { id: 'experience', visible: true },
    { id: 'projects', visible: true },
    { id: 'prompt-engineering', visible: true },
    { id: 'featured-service', visible: true },
    { id: 'blog', visible: true },
    { id: 'education', visible: true },
    { id: 'work-with-me', visible: true }
  ]
};
