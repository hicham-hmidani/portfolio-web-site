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
  group: 'Google' | 'Specialized' | 'Internship';
  visible: boolean;
  documentUrl?: string;
  previewUrl?: string;
  credentialId?: string;
  summary?: string;
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

export const certificationsDefaults: { items: CertificationItem[]; credentialSyncVersion?: number } = {
  items: [
    {
      id: 'cert-1',
      title: "Foundations: Data, Data, Everywhere",
      issuer: "Google",
      platform: "Coursera",
      date: "2023-11-15",
      verifyUrl: "https://coursera.org/verify/3BCNC5V2AFSE",
      credentialId: "3BCNC5V2AFSE",
      documentUrl: "/assets/aistudio/Certification_Foundation_Data__Data__Everywhere_Coursera_1c7d2c0a.pdf",
      previewUrl: "/assets/aistudio/Certifications_Foundation_Data__Data__Everywhere_Coursera._a971a75d.png",
      group: "Google",
      visible: true
    },
    {
      id: 'cert-2',
      title: "Ask Questions to Make Data-Driven Decisions",
      issuer: "Google",
      platform: "Coursera",
      date: "2023-11-23",
      verifyUrl: "https://coursera.org/verify/CLGY38CCZL6V",
      credentialId: "CLGY38CCZL6V",
      documentUrl: "/assets/aistudio/Certification_Ask_Question_to_Make_Data-Driven_Decisions_Coursera_0f9aaf7d.pdf",
      previewUrl: "/assets/aistudio/Certification_Ask_Question_to_Make_Data-Driven_Decisions_Coursera_79842957.png",
      group: "Google",
      visible: true
    },
    {
      id: 'cert-3',
      title: "Prepare Data for Exploration",
      issuer: "Google",
      platform: "Coursera",
      date: "2023-12-11",
      verifyUrl: "https://coursera.org/verify/T39GTBBZDJD2",
      credentialId: "T39GTBBZDJD2",
      documentUrl: "/assets/aistudio/Coursera_Certifications_Prepare_Data_for_Exploration_bee60d22.pdf",
      group: "Google",
      visible: true
    },
    {
      id: 'cert-4',
      title: "Process Data from Dirty to Clean",
      issuer: "Google",
      platform: "Coursera",
      date: "2024-02-15",
      verifyUrl: "https://coursera.org/verify/VV43T82XLDV6",
      credentialId: "VV43T82XLDV6",
      documentUrl: "/assets/aistudio/Certification_Process_Data_from_Dirty_to_Clean_43fdb430.pdf",
      group: "Google",
      visible: true
    },
    {
      id: 'cert-5',
      title: "Prompt Engineering for ChatGPT",
      issuer: "Vanderbilt University",
      platform: "Coursera",
      date: "2023-12-18",
      verifyUrl: "https://coursera.org/verify/MX4YZBY9F57E",
      credentialId: "MX4YZBY9F57E",
      documentUrl: "/assets/aistudio/Prompt_engineering_for_chatgpt_49930d71.pdf",
      group: "Specialized",
      visible: true
    },
    {
      id: 'cert-6',
      title: "Data Analysis with Python",
      issuer: "IBM",
      platform: "CognitiveClass.ai",
      date: "2023-11-21",
      verifyUrl: "https://courses.cognitiveclass.ai/certificates/250a1fb56ee0453b99ed8b5ce8b12fca",
      credentialId: "DA0101EN",
      documentUrl: "/assets/aistudio/CognitiveClass_certification_Data_analysis_with_python_7602dcc9.pdf",
      group: "Specialized",
      visible: true
    },
    {
      id: 'cert-7',
      title: "SQL for Data Science",
      issuer: "Great Learning Academy",
      platform: "Great Learning",
      date: "2023-11-01",
      verifyUrl: "https://mygreatlearning.com/certificate/WZBXPOHY",
      credentialId: "WZBXPOHY",
      documentUrl: "/assets/aistudio/CERTIFICATION-SQL_for_data_science_Great_learning_fa46d999.pdf",
      group: "Specialized",
      visible: true
    },
    {
      id: 'cert-8',
      title: "Data Science Virtual Internship",
      issuer: "CodSoft",
      platform: "CodSoft Internship Program",
      date: "2024-01-13",
      verifyUrl: "https://www.codsoft.in",
      credentialId: "9f783d2",
      documentUrl: "/assets/aistudio/Certification_of_data_science_Internship_at_CodSoft_d2a80cc2.pdf",
      summary: "4-week virtual internship in Data Science (Dec 2023 – Jan 2024), ISO 9001:2015 certified program.",
      group: "Internship",
      visible: true
    },
    {
      id: 'cert-9',
      title: "Hybrid Solar-Wind Energy Forecasting Internship",
      issuer: "Agro Daraa SARL & Adi Solar Energy",
      platform: "Industrial Internship (Agadir)",
      date: "2023-09-20",
      verifyUrl: "",
      credentialId: "ATTESTATION-2023-09",
      documentUrl: "/assets/aistudio/Attestation_du_Stage_Hicham-20Sept2023docx_3555eba3.pdf",
      summary: "6-month engineering internship (Feb – Aug 2023) on renewable hybrid solar-wind power generation forecasting.",
      group: "Internship",
      visible: true
    }
  ]
};

export function mergeCertificationsWithDefaults(
  remoteItems?: CertificationItem[] | null,
  credentialSyncVersion?: number
): CertificationItem[] {
  if (!Array.isArray(remoteItems) || remoteItems.length === 0) {
    return certificationsDefaults.items;
  }

  const defaultById = new Map(certificationsDefaults.items.map((item) => [item.id, item]));
  const defaultByTitle = new Map(
    certificationsDefaults.items.map((item) => [item.title.trim().toLowerCase(), item])
  );

  const enriched = remoteItems.map((item) => {
    const fallback =
      defaultById.get(item.id) ||
      defaultByTitle.get((item.title || '').trim().toLowerCase());
    if (!fallback) return item;
    return {
      ...fallback,
      ...item,
      documentUrl: item.documentUrl || fallback.documentUrl,
      previewUrl: item.previewUrl || fallback.previewUrl,
      credentialId: item.credentialId || fallback.credentialId,
      summary: item.summary || fallback.summary,
    };
  });

  if (!credentialSyncVersion || credentialSyncVersion < 2) {
    const presentIds = new Set(enriched.map((item) => item.id));
    const missingInternships = certificationsDefaults.items.filter(
      (def) => def.group === 'Internship' && !presentIds.has(def.id)
    );
    return [...enriched, ...missingInternships];
  }

  return enriched;
}
