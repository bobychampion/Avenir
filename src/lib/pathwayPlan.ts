import type { Cluster } from './types';

export type ResourceCategory = 'courses' | 'readings' | 'practicals' | 'audio' | 'events';

export type TaskCadence = 'weekly' | 'monthly';

export interface ResourceItem {
  id: string;
  title: string;
  detail: string;
  effort: string;
}

export interface PlanTask {
  id: string;
  title: string;
  description: string;
  cadence: TaskCadence;
  category: ResourceCategory | 'subjects';
}

export interface Milestone {
  id: string;
  title: string;
  timeframe: string;
  outcomes: string[];
}

export interface PathwayPlan {
  summary: string;
  subjects: string[];
  skills: string[];
  resources: Record<ResourceCategory, ResourceItem[]>;
  tasks: PlanTask[];
  milestones: Milestone[];
}

const baseResources: Record<ResourceCategory, ResourceItem[]> = {
  courses: [
    { id: 'course-foundations', title: 'Foundations Course', detail: 'Start with a short, beginner-friendly course in this pathway.', effort: '1-2 hrs/week' },
    { id: 'course-skills', title: 'Core Skills Practice', detail: 'Build key skills using guided lessons and exercises.', effort: '1 hr/week' }
  ],
  readings: [
    { id: 'reading-articles', title: 'Short Reading Pack', detail: 'Read 2-3 short articles to deepen understanding.', effort: '30 mins/week' },
    { id: 'reading-book', title: 'Intro Book/Guide', detail: 'Pick an easy, teen-friendly book or guide.', effort: '10 pages/week' }
  ],
  practicals: [
    { id: 'practical-mini', title: 'Mini Project', detail: 'Create a small project to apply what you learn.', effort: '1-2 hrs/week' },
    { id: 'practical-log', title: 'Learning Log', detail: 'Keep a notebook of what you tried and what you learned.', effort: '15 mins/week' }
  ],
  audio: [
    { id: 'audio-episode', title: 'One Short Audio', detail: 'Listen to a short audio/video lesson on the topic.', effort: '15-30 mins/week' },
    { id: 'audio-reflect', title: 'Reflection Audio', detail: 'Record a 2-minute voice note on what you learned.', effort: '10 mins/week' }
  ],
  events: [
    { id: 'event-club', title: 'Join a Club Session', detail: 'Attend a school club or interest group meeting.', effort: '1x per month' },
    { id: 'event-showcase', title: 'Showcase Day', detail: 'Share your work at school or with family.', effort: '1x per term' }
  ]
};

const domainResources: Record<string, Partial<Record<ResourceCategory, ResourceItem[]>>> = {
  science: {
    courses: [
      { id: 'science-method', title: 'Scientific Method Basics', detail: 'Learn how to ask questions and test ideas.', effort: '1 hr/week' },
      { id: 'science-foundation', title: 'Science Foundations', detail: 'Explore core concepts in physics, chemistry, and biology.', effort: '1-2 hrs/week' }
    ],
    practicals: [
      { id: 'science-experiment', title: 'Home Experiments', detail: 'Try safe experiments with supervision.', effort: '1 hr/week' }
    ],
    audio: [
      { id: 'science-audio', title: 'Science Curiosity Audio', detail: 'Listen to a simple science story or explainer.', effort: '20 mins/week' }
    ]
  },
  tech: {
    courses: [
      { id: 'tech-intro', title: 'Intro to Technology', detail: 'Learn basics of tools, devices, and how they work.', effort: '1 hr/week' },
      { id: 'tech-build', title: 'Build and Test', detail: 'Follow a guided build or repair activity.', effort: '1-2 hrs/week' }
    ],
    practicals: [
      { id: 'tech-prototype', title: 'Prototype Challenge', detail: 'Create a simple model or prototype.', effort: '1-2 hrs/week' }
    ]
  },
  data: {
    courses: [
      { id: 'data-basics', title: 'Data Basics', detail: 'Learn how to read charts and simple data tables.', effort: '1 hr/week' }
    ],
    practicals: [
      { id: 'data-project', title: 'Mini Data Project', detail: 'Collect data from your daily routine and analyze it.', effort: '1 hr/week' }
    ]
  },
  health: {
    courses: [
      { id: 'health-foundations', title: 'Health Foundations', detail: 'Learn about the body, wellness, and care basics.', effort: '1 hr/week' }
    ],
    practicals: [
      { id: 'health-first-aid', title: 'First Aid Basics', detail: 'Learn simple first aid steps with supervision.', effort: '1 hr/week' }
    ]
  },
  business: {
    courses: [
      { id: 'business-basics', title: 'Business Basics', detail: 'Learn how businesses work and make decisions.', effort: '1 hr/week' },
      { id: 'planning-basics', title: 'Planning Skills', detail: 'Practice goal setting and time planning.', effort: '30-45 mins/week' }
    ],
    practicals: [
      { id: 'business-mini', title: 'Mini Business Project', detail: 'Plan a small project or school event budget.', effort: '1-2 hrs/week' }
    ]
  },
  finance: {
    courses: [
      { id: 'finance-basics', title: 'Finance Basics', detail: 'Learn how budgeting and saving work.', effort: '1 hr/week' }
    ],
    practicals: [
      { id: 'finance-budget', title: 'Budget Practice', detail: 'Create a simple weekly budget.', effort: '30 mins/week' }
    ]
  },
  marketing: {
    courses: [
      { id: 'marketing-basics', title: 'Marketing Basics', detail: 'Learn how to communicate ideas clearly.', effort: '1 hr/week' }
    ],
    practicals: [
      { id: 'marketing-poster', title: 'Create a Poster', detail: 'Design a simple campaign poster for a school event.', effort: '1 hr/week' }
    ]
  },
  law: {
    readings: [
      { id: 'law-civics', title: 'Civics Reading', detail: 'Read about rules, governance, and rights.', effort: '20 mins/week' }
    ],
    practicals: [
      { id: 'law-debate', title: 'Mini Debate', detail: 'Practice an argument with a classmate.', effort: '30 mins/week' }
    ]
  },
  media: {
    courses: [
      { id: 'media-story', title: 'Storytelling Skills', detail: 'Learn how to report and structure a story.', effort: '1 hr/week' }
    ],
    practicals: [
      { id: 'media-interview', title: 'Interview Practice', detail: 'Interview a friend or family member and summarize.', effort: '45 mins/week' }
    ]
  },
  education: {
    courses: [
      { id: 'edu-mentoring', title: 'Mentoring Basics', detail: 'Learn how to teach and explain clearly.', effort: '45 mins/week' }
    ],
    practicals: [
      { id: 'edu-tutor', title: 'Peer Tutoring', detail: 'Help a friend with a subject.', effort: '1 hr/week' }
    ]
  },
  arts: {
    courses: [
      { id: 'arts-basics', title: 'Creative Fundamentals', detail: 'Practice design, drawing, or performance skills.', effort: '1 hr/week' }
    ],
    practicals: [
      { id: 'arts-project', title: 'Creative Project', detail: 'Create a sketch, short story, or performance.', effort: '1-2 hrs/week' }
    ]
  },
  vocational: {
    courses: [
      { id: 'vocational-tools', title: 'Tools & Safety', detail: 'Learn basic tool handling and safety.', effort: '1 hr/week' }
    ],
    practicals: [
      { id: 'vocational-build', title: 'Hands-on Practice', detail: 'Repair or build something simple.', effort: '1-2 hrs/week' }
    ]
  }
};

const mergeUnique = (items: ResourceItem[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.title)) return false;
    seen.add(item.title);
    return true;
  });
};

const resolveDomains = (clusterId: string) => {
  const id = clusterId.toLowerCase();
  const domains = new Set<string>();
  if (id.includes('science')) domains.add('science');
  if (id.includes('engineering') || id.includes('tech')) domains.add('tech');
  if (id.includes('data') || id.includes('ai')) domains.add('data');
  if (id.includes('health') || id.includes('med')) domains.add('health');
  if (id.includes('business') || id.includes('commercial') || id.includes('mgmt')) domains.add('business');
  if (id.includes('finance') || id.includes('econ')) domains.add('finance');
  if (id.includes('marketing')) domains.add('marketing');
  if (id.includes('law') || id.includes('gov')) domains.add('law');
  if (id.includes('media') || id.includes('comm')) domains.add('media');
  if (id.includes('edu') || id.includes('social')) domains.add('education');
  if (id.includes('creative') || id.includes('arts')) domains.add('arts');
  if (id.includes('voc')) domains.add('vocational');
  if (domains.size === 0) domains.add('general');
  return Array.from(domains);
};

const buildResources = (cluster: Cluster): Record<ResourceCategory, ResourceItem[]> => {
  const domains = resolveDomains(cluster.id);
  const merged: Record<ResourceCategory, ResourceItem[]> = {
    courses: [...baseResources.courses],
    readings: [...baseResources.readings],
    practicals: [...baseResources.practicals],
    audio: [...baseResources.audio],
    events: [...baseResources.events]
  };

  domains.forEach((domain) => {
    const additions = domainResources[domain];
    if (!additions) return;
    (Object.keys(additions) as ResourceCategory[]).forEach((category) => {
      merged[category] = mergeUnique([...(merged[category] || []), ...(additions[category] || [])]);
    });
  });

  if (cluster.next_steps && cluster.next_steps.length > 0) {
    const stepItems = cluster.next_steps.map((step, index) => ({
      id: `step-${index}`,
      title: step,
      detail: 'Suggested next step from your pathway.',
      effort: '30-60 mins'
    }));
    merged.practicals = mergeUnique([...stepItems, ...merged.practicals]);
  }

  return merged;
};

export const buildPathwayPlan = (cluster: Cluster): PathwayPlan => {
  const resources = buildResources(cluster);
  const subjects = cluster.subjects && cluster.subjects.length > 0
    ? cluster.subjects
    : cluster.id.startsWith('JSS_')
      ? ['Mathematics', 'English Language', 'Basic Science']
      : ['Mathematics', 'English Language', 'Relevant electives'];

  const skills = cluster.skills && cluster.skills.length > 0
    ? cluster.skills
    : cluster.id.startsWith('JSS_')
      ? ['Curiosity', 'Communication', 'Problem solving']
      : ['Analytical thinking', 'Communication', 'Teamwork'];

  const tasks: PlanTask[] = [
    {
      id: 'task-subjects',
      title: 'Focus on key subjects',
      description: `Spend extra time on ${subjects.slice(0, 2).join(' & ')} this week.`,
      cadence: 'weekly',
      category: 'subjects'
    },
    {
      id: 'task-course',
      title: 'Complete one learning session',
      description: 'Finish one short course lesson or practice module.',
      cadence: 'weekly',
      category: 'courses'
    },
    {
      id: 'task-reading',
      title: 'Read a short guide',
      description: 'Read 10 pages or one short article.',
      cadence: 'weekly',
      category: 'readings'
    },
    {
      id: 'task-practical',
      title: 'Do one practical activity',
      description: 'Try a small project or experiment.',
      cadence: 'weekly',
      category: 'practicals'
    },
    {
      id: 'task-audio',
      title: 'Listen and reflect',
      description: 'Listen to one audio lesson and jot down 2 insights.',
      cadence: 'weekly',
      category: 'audio'
    },
    {
      id: 'task-event',
      title: 'Join a learning event',
      description: 'Attend one club meeting or group session this month.',
      cadence: 'monthly',
      category: 'events'
    }
  ];

  const milestones: Milestone[] = [
    {
      id: 'milestone-1',
      title: 'Month 1: Build momentum',
      timeframe: 'Weeks 1-4',
      outcomes: [
        'Finish 4 learning sessions.',
        'Complete 2 practical activities.',
        'Attend 1 club or group session.'
      ]
    },
    {
      id: 'milestone-2',
      title: 'Month 2: Strengthen skills',
      timeframe: 'Weeks 5-8',
      outcomes: [
        'Improve in your top two subjects.',
        'Create one small project you can show.',
        'Keep a weekly reflection log.'
      ]
    },
    {
      id: 'milestone-3',
      title: 'Month 3: Showcase growth',
      timeframe: 'Weeks 9-12',
      outcomes: [
        'Share your project with a teacher or mentor.',
        'Identify the next course or pathway to explore.',
        'Set new goals for the next term.'
      ]
    }
  ];

  return {
    summary: cluster.description,
    subjects,
    skills,
    resources,
    tasks,
    milestones
  };
};
