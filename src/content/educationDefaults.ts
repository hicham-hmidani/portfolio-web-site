export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  field: string;
  visible?: boolean;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  platform: string;
  date: string;
  verifyUrl: string;
  group: 'Google' | 'Specialized';
  visible: boolean;
}

export const educationDefaults = {
  items: [
    {
      id: 'edu-1',
      degree: "Master in Science and Technology",
      institution: "Faculty of Science and Technology, Errachidia",
      period: "2021 – 2023",
      field: "Computer Science and Complex Systems Engineering",
      visible: true
    },
    {
      id: 'edu-2',
      degree: "Bachelor of Science and Technology",
      institution: "Faculty of Science and Technology, Errachidia",
      period: "2020 – 2021",
      field: "Engineering and Management of Industrial Systems",
      visible: true
    },
    {
      id: 'edu-3',
      degree: "Baccalaureate",
      institution: "New Secondary School, Erfoud",
      period: "2016 – 2017",
      field: "Physical Sciences",
      visible: true
    }
  ]
};

export const certificationsDefaults = {
  items: [
    {
      id: 'cert-1',
      title: "Foundations: Data, Data, Everywhere",
      issuer: "Google",
      platform: "Coursera",
      date: "2023-11-15",
      verifyUrl: "https://coursera.org/verify/3BCNC5V2AFSE",
      group: "Google" as const,
      visible: true
    },
    {
      id: 'cert-2',
      title: "Ask Questions to Make Data-Driven Decisions",
      issuer: "Google",
      platform: "Coursera",
      date: "2023-11-23",
      verifyUrl: "https://coursera.org/verify/CLGY38CCZL6V",
      group: "Google" as const,
      visible: true
    },
    {
      id: 'cert-3',
      title: "Prepare Data for Exploration",
      issuer: "Google",
      platform: "Coursera",
      date: "2023-12-11",
      verifyUrl: "https://coursera.org/verify/T39GTBBZDJD2",
      group: "Google" as const,
      visible: true
    },
    {
      id: 'cert-4',
      title: "Process Data from Dirty to Clean",
      issuer: "Google",
      platform: "Coursera",
      date: "2024-02-15",
      verifyUrl: "https://coursera.org/verify/VV43T82XLDV6",
      group: "Google" as const,
      visible: true
    },
    {
      id: 'cert-5',
      title: "Prompt Engineering for ChatGPT",
      issuer: "Vanderbilt University",
      platform: "Coursera",
      date: "2023-12-18",
      verifyUrl: "https://coursera.org/verify/MX4YZBY9F57E",
      group: "Specialized" as const,
      visible: true
    },
    {
      id: 'cert-6',
      title: "Data Analysis with Python",
      issuer: "IBM",
      platform: "CognitiveClass.ai",
      date: "2023-11-21",
      verifyUrl: "https://courses.cognitiveclass.ai/certificates/250a1fb56ee0453b99ed8b5ce8b12fca",
      group: "Specialized" as const,
      visible: true
    },
    {
      id: 'cert-7',
      title: "SQL for Data Science",
      issuer: "Great Learning Academy",
      platform: "Great Learning",
      date: "2023-11-01",
      verifyUrl: "https://mygreatlearning.com/certificate/WZBXPOHY",
      group: "Specialized" as const,
      visible: true
    }
  ]
};
