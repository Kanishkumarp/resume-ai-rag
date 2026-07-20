export interface SampleResumeDocument {
  _id?: string;
  text?: string;
  name?: string;
  company?: string;
  role?: string;
  skills?: string[];
  embedding?: number[];
  total_Experience?: number;
  relevant_Experience?: number;
}

export const getSampleResumeDocuments = (): SampleResumeDocument[] => [
  {
    _id: 'sample-1',
    text: 'Senior Python backend engineer with experience in banking systems, payments, risk analytics, and REST APIs for enterprise platforms.',
    name: 'Asha Kumar',
    company: 'FinCore Bank',
    role: 'Senior Backend Engineer',
    skills: ['Python', 'Django', 'REST APIs', 'Banking', 'Payments', 'PostgreSQL', 'MongoDB'],
    total_Experience: 8,
    relevant_Experience: 6,
  },
  {
    _id: 'sample-2',
    text: 'Full-stack engineer experienced in React, Node.js services, Python automation, and cloud integrations for financial products and digital banking.',
    name: 'Rohan Patel',
    company: 'Northwind Capital',
    role: 'Full Stack Engineer',
    skills: ['Python', 'React', 'Node.js', 'Banking', 'Digital Banking', 'Selenium'],
    total_Experience: 5,
    relevant_Experience: 4,
  },
  {
    _id: 'sample-3',
    text: 'Platform engineer focused on cloud infrastructure, Kubernetes, CI/CD pipelines, and observability for high-scale financial systems.',
    name: 'Meera Singh',
    company: 'CloudForge',
    role: 'Platform Engineer',
    skills: ['Kubernetes', 'CI/CD', 'Observability', 'AWS', 'Finance'],
    total_Experience: 7,
    relevant_Experience: 6,
  },
  {
    _id: 'sample-4',
    text: 'QA automation engineer with strong Selenium, Java, TestNG, and API automation experience for banking and retail applications.',
    name: 'Kanish Kumar',
    company: 'AI Solutions',
    role: 'QA Automation Engineer',
    skills: ['Selenium', 'Java', 'TestNG', 'API Testing', 'Automation', 'Banking'],
    total_Experience: 4,
    relevant_Experience: 3,
  },
  {
    _id: 'sample-5',
    text: 'Machine learning engineer building recommendation systems, NLP pipelines, and Python-based data services for fintech products.',
    name: 'Lina Rao',
    company: 'FinSight',
    role: 'Machine Learning Engineer',
    skills: ['Python', 'Machine Learning', 'NLP', 'Fintech', 'Data Science'],
    total_Experience: 6,
    relevant_Experience: 5,
  },
  {
    _id: 'sample-6',
    text: 'Frontend engineer specializing in React, TypeScript, accessibility, and modern UI systems for enterprise dashboards.',
    name: 'Sanjay Verma',
    company: 'DashWorks',
    role: 'Frontend Engineer',
    skills: ['React', 'TypeScript', 'Frontend', 'UI', 'Accessibility'],
    total_Experience: 5,
    relevant_Experience: 4,
  },
];
