import { db } from './db';
import type { Cluster, ConfigSnapshot, Option, Question, Trait } from './types';

const now = () => new Date().toISOString();

const traits: Trait[] = [
  { id: 'logic', label: 'Logical Reasoning', description: 'Solving problems with analysis and structure.' },
  { id: 'creativity', label: 'Creativity', description: 'Generating original ideas and imagination.' },
  { id: 'empathy', label: 'Empathy', description: 'Understanding and supporting others.' },
  { id: 'practical', label: 'Practical Thinking', description: 'Hands-on problem solving and resourcefulness.' },
  { id: 'communication', label: 'Communication', description: 'Expressing ideas and collaborating with others.' },
  { id: 'leadership', label: 'Leadership', description: 'Taking initiative and guiding groups.' },
  { id: 'curiosity', label: 'Curiosity', description: 'Exploring new topics and asking why.' },
  { id: 'organization', label: 'Organization', description: 'Planning, structure, and reliability.' },
  { id: 'technical', label: 'Technical Interest', description: 'Enjoying tools, systems, and technology.' }
];

const questions: Question[] = [
  {
    id: 'JSS_Q1',
    mode: 'JSS',
    type: 'mcq',
    prompt: 'When you have free time at home or in the compound, what do you enjoy doing the most?',
    tags: ['creativity', 'technical', 'organization', 'communication'],
    branch_level: 0,
    status: 'active'
  },
  {
    id: 'JSS_Q1A',
    mode: 'JSS',
    type: 'scenario',
    prompt: 'You have cardboard, markers, and glue to make a poster for your class or club. What do you do first?',
    tags: ['creativity'],
    branch_level: 1,
    parent_question_id: 'JSS_Q1',
    status: 'active'
  },
  {
    id: 'JSS_Q1B',
    mode: 'JSS',
    type: 'scenario',
    prompt: 'Your class is planning a games day or cultural day. How do you help?',
    tags: ['leadership', 'organization'],
    branch_level: 1,
    parent_question_id: 'JSS_Q1',
    status: 'active'
  },
  {
    id: 'JSS_Q1C',
    mode: 'JSS',
    type: 'scenario',
    prompt: 'A friend made a mistake during chores or in class and is upset. What do you do?',
    tags: ['empathy', 'communication'],
    branch_level: 1,
    parent_question_id: 'JSS_Q1',
    status: 'active'
  },
  {
    id: 'JSS_Q1D',
    mode: 'JSS',
    type: 'scenario',
    prompt: 'A rechargeable torch or small radio stops working. What do you do first?',
    tags: ['technical', 'practical', 'curiosity'],
    branch_level: 1,
    parent_question_id: 'JSS_Q1',
    status: 'active'
  },
  {
    id: 'JSS_Q2',
    mode: 'JSS',
    type: 'drag_rank',
    prompt: 'Rank these tasks from most enjoyable (#1) to least (#4).',
    tags: ['logic', 'creativity', 'organization', 'communication'],
    branch_level: 0,
    status: 'active'
  },
  {
    id: 'JSS_Q3',
    mode: 'JSS',
    type: 'image_select',
    prompt: 'Which after-school activity looks most fun to you?',
    tags: ['technical', 'creativity', 'empathy', 'practical'],
    branch_level: 0,
    status: 'active'
  },
  {
    id: 'JSS_Q4',
    mode: 'JSS',
    type: 'open_short',
    prompt: 'Describe a school or community activity you enjoyed and why it felt good to you.',
    tags: ['reflection'],
    branch_level: 0,
    status: 'active'
  },
  {
    id: 'JSS_Q5',
    mode: 'JSS',
    type: 'mcq',
    prompt: 'You have assignments for a long weekend. How do you handle it?',
    tags: ['organization', 'creativity', 'communication', 'practical'],
    branch_level: 0,
    status: 'active'
  },
  {
    id: 'JSS_Q6',
    mode: 'JSS',
    type: 'mcq',
    prompt: 'When learning something new, you prefer to...',
    tags: ['curiosity', 'logic', 'practical', 'communication'],
    branch_level: 0,
    status: 'active'
  },
  {
    id: 'JSS_Q7',
    mode: 'JSS',
    type: 'scenario',
    prompt: 'A group project needs a leader. What do you do?',
    tags: ['leadership', 'organization', 'creativity', 'empathy'],
    branch_level: 0,
    status: 'active'
  },
  {
    id: 'JSS_Q8',
    mode: 'JSS',
    type: 'scenario',
    prompt: 'You discover a new phone app or tool. What excites you most?',
    tags: ['technical', 'curiosity', 'communication', 'creativity'],
    branch_level: 0,
    status: 'active'
  },
  {
    id: 'SSS_Q1',
    mode: 'SSS',
    type: 'mcq',
    prompt: 'Which SSS task energizes you most right now?',
    tags: ['logic', 'leadership', 'creativity', 'practical'],
    branch_level: 0,
    status: 'active'
  },
  {
    id: 'SSS_Q1A',
    mode: 'SSS',
    type: 'scenario',
    prompt: 'You are given a complex problem in class. How do you start?',
    tags: ['logic', 'curiosity'],
    branch_level: 1,
    parent_question_id: 'SSS_Q1',
    status: 'active'
  },
  {
    id: 'SSS_Q1B',
    mode: 'SSS',
    type: 'scenario',
    prompt: 'A team project needs direction. What is your move?',
    tags: ['leadership', 'organization'],
    branch_level: 1,
    parent_question_id: 'SSS_Q1',
    status: 'active'
  },
  {
    id: 'SSS_Q1C',
    mode: 'SSS',
    type: 'scenario',
    prompt: 'You need to communicate an idea. What approach fits you?',
    tags: ['communication', 'creativity'],
    branch_level: 1,
    parent_question_id: 'SSS_Q1',
    status: 'active'
  },
  {
    id: 'SSS_Q1D',
    mode: 'SSS',
    type: 'scenario',
    prompt: 'A practical challenge appears. What do you enjoy doing most?',
    tags: ['practical', 'technical'],
    branch_level: 1,
    parent_question_id: 'SSS_Q1',
    status: 'active'
  },
  {
    id: 'SSS_Q2',
    mode: 'SSS',
    type: 'drag_rank',
    prompt: 'Rank the areas you feel most confident in right now.',
    tags: ['logic', 'communication', 'technical', 'organization'],
    branch_level: 0,
    status: 'active'
  },
  {
    id: 'SSS_Q3',
    mode: 'SSS',
    type: 'mcq',
    prompt: 'When preparing for WAEC/NECO or a major test, you usually...',
    tags: ['organization', 'curiosity', 'communication', 'practical'],
    branch_level: 0,
    status: 'active'
  },
  {
    id: 'SSS_Q4',
    mode: 'SSS',
    type: 'open_short',
    prompt: 'What kind of future work sounds exciting to you and why?',
    tags: ['reflection'],
    branch_level: 0,
    status: 'active'
  },
  {
    id: 'SSS_Q5',
    mode: 'SSS',
    type: 'scenario',
    prompt: 'You are mentoring a younger student. How do you help them most?',
    tags: ['empathy', 'communication', 'leadership'],
    branch_level: 0,
    status: 'active'
  },
  {
    id: 'SSS_SCI_Q1',
    mode: 'SSS',
    type: 'mcq',
    prompt: 'In the science track, which activity excites you most?',
    tags: ['logic', 'curiosity', 'technical'],
    branch_level: 0,
    status: 'active',
    track: 'SCIENCE'
  },
  {
    id: 'SSS_ART_Q1',
    mode: 'SSS',
    type: 'mcq',
    prompt: 'In the arts track, which activity feels most natural?',
    tags: ['communication', 'creativity', 'empathy'],
    branch_level: 0,
    status: 'active',
    track: 'ARTS'
  },
  {
    id: 'SSS_COM_Q1',
    mode: 'SSS',
    type: 'mcq',
    prompt: 'In the commercial track, which task do you enjoy most?',
    tags: ['leadership', 'organization', 'logic'],
    branch_level: 0,
    status: 'active',
    track: 'COMMERCIAL'
  }
];

const options: Option[] = [
  { id: 'JSS_Q1_A', question_id: 'JSS_Q1', label: 'Taking a small gadget or toy apart to see how it works.', score_map: { technical: 2, curiosity: 1, logic: 1 }, next_question_id: 'JSS_Q1D' },
  { id: 'JSS_Q1_B', question_id: 'JSS_Q1', label: 'Drawing, designing, or creating something new.', score_map: { creativity: 2 }, next_question_id: 'JSS_Q1A' },
  { id: 'JSS_Q1_C', question_id: 'JSS_Q1', label: 'Talking with people or helping someone solve a problem.', score_map: { empathy: 1, communication: 2 }, next_question_id: 'JSS_Q1C' },
  { id: 'JSS_Q1_D', question_id: 'JSS_Q1', label: 'Planning activities or organizing what needs to be done.', score_map: { organization: 2, leadership: 1 }, next_question_id: 'JSS_Q1B' },

  { id: 'JSS_Q1A_A', question_id: 'JSS_Q1A', label: 'Sketch bold ideas with lots of color.', score_map: { creativity: 2 } },
  { id: 'JSS_Q1A_B', question_id: 'JSS_Q1A', label: 'Find a theme that tells a story.', score_map: { creativity: 1, communication: 1 } },
  { id: 'JSS_Q1A_C', question_id: 'JSS_Q1A', label: 'Follow a sample template to be neat.', score_map: { organization: 1, creativity: 1 } },

  { id: 'JSS_Q1B_A', question_id: 'JSS_Q1B', label: 'Make a schedule and assign tasks.', score_map: { organization: 2, leadership: 1 } },
  { id: 'JSS_Q1B_B', question_id: 'JSS_Q1B', label: 'Check that everyone has what they need.', score_map: { empathy: 1, organization: 1 } },
  { id: 'JSS_Q1B_C', question_id: 'JSS_Q1B', label: 'Support whoever is leading and keep things calm.', score_map: { communication: 1, leadership: 1 } },

  { id: 'JSS_Q1C_A', question_id: 'JSS_Q1C', label: 'Listen and encourage them.', score_map: { empathy: 2, communication: 1 } },
  { id: 'JSS_Q1C_B', question_id: 'JSS_Q1C', label: 'Suggest practical steps to fix it.', score_map: { practical: 1, logic: 1 } },
  { id: 'JSS_Q1C_C', question_id: 'JSS_Q1C', label: 'Help them reframe it positively.', score_map: { empathy: 1, creativity: 1 } },
  { id: 'JSS_Q1C_D', question_id: 'JSS_Q1C', label: 'Stay out of it. I just mind my business.', score_map: {}, disengaged: true },

  { id: 'JSS_Q1D_A', question_id: 'JSS_Q1D', label: 'Check the parts and try to fix it.', score_map: { practical: 2, technical: 1 } },
  { id: 'JSS_Q1D_B', question_id: 'JSS_Q1D', label: 'Look up how it works.', score_map: { curiosity: 2, logic: 1 } },
  { id: 'JSS_Q1D_C', question_id: 'JSS_Q1D', label: 'Ask an older person to help and watch.', score_map: { communication: 1, curiosity: 1 } },

  { id: 'JSS_Q2_A', question_id: 'JSS_Q2', label: 'Solving math or logic puzzles', score_map: { logic: 1 } },
  { id: 'JSS_Q2_B', question_id: 'JSS_Q2', label: 'Drawing, painting, or writing short stories', score_map: { creativity: 1 } },
  { id: 'JSS_Q2_C', question_id: 'JSS_Q2', label: 'Organizing your room or planning your day', score_map: { organization: 1 } },
  { id: 'JSS_Q2_D', question_id: 'JSS_Q2', label: 'Talking with friends or meeting new people', score_map: { communication: 1 } },

  { id: 'JSS_Q3_A', question_id: 'JSS_Q3', label: 'Science club practical or experiment kit', score_map: { curiosity: 1, technical: 1 } },
  { id: 'JSS_Q3_B', question_id: 'JSS_Q3', label: 'Drama or cultural dance rehearsal', score_map: { creativity: 1, communication: 1 } },
  { id: 'JSS_Q3_C', question_id: 'JSS_Q3', label: 'Community clean-up or volunteering event', score_map: { empathy: 1, leadership: 1 } },
  { id: 'JSS_Q3_D', question_id: 'JSS_Q3', label: 'Building a model car or house', score_map: { practical: 1, technical: 1 } },

  { id: 'JSS_Q5_A', question_id: 'JSS_Q5', label: 'Make a plan and do a bit each day.', score_map: { organization: 2 } },
  { id: 'JSS_Q5_B', question_id: 'JSS_Q5', label: 'Find a creative twist to make it fun.', score_map: { creativity: 2 } },
  { id: 'JSS_Q5_C', question_id: 'JSS_Q5', label: 'Discuss with friends and work together.', score_map: { communication: 1, leadership: 1 } },
  { id: 'JSS_Q5_D', question_id: 'JSS_Q5', label: 'Work best under pressure near the deadline.', score_map: { practical: 1, organization: 0.5 } },
  { id: 'JSS_Q5_E', question_id: 'JSS_Q5', label: 'Leave it till the last minute or avoid it if possible.', score_map: {}, disengaged: true },

  { id: 'JSS_Q6_A', question_id: 'JSS_Q6', label: 'Watch someone do it first or see a demo.', score_map: { curiosity: 1, creativity: 1 } },
  { id: 'JSS_Q6_B', question_id: 'JSS_Q6', label: 'Read step-by-step instructions.', score_map: { logic: 1, organization: 1 } },
  { id: 'JSS_Q6_C', question_id: 'JSS_Q6', label: 'Try it hands-on quickly.', score_map: { practical: 2 } },
  { id: 'JSS_Q6_D', question_id: 'JSS_Q6', label: 'Talk it through with someone.', score_map: { communication: 2 } },

  { id: 'JSS_Q7_A', question_id: 'JSS_Q7', label: 'Step up to lead the group.', score_map: { leadership: 2 } },
  { id: 'JSS_Q7_B', question_id: 'JSS_Q7', label: 'Organize tasks and keep things on track.', score_map: { organization: 2 } },
  { id: 'JSS_Q7_C', question_id: 'JSS_Q7', label: 'Share creative ideas for the project.', score_map: { creativity: 2 } },
  { id: 'JSS_Q7_D', question_id: 'JSS_Q7', label: 'Make sure everyone feels included.', score_map: { empathy: 2 } },
  { id: 'JSS_Q7_E', question_id: 'JSS_Q7', label: 'Keep quiet and let others handle it.', score_map: {}, disengaged: true },

  { id: 'JSS_Q8_A', question_id: 'JSS_Q8', label: 'Figuring out how the app works inside.', score_map: { technical: 2, curiosity: 1 } },
  { id: 'JSS_Q8_B', question_id: 'JSS_Q8', label: 'Sharing it with friends and teaching them.', score_map: { communication: 2 } },
  { id: 'JSS_Q8_C', question_id: 'JSS_Q8', label: 'Customizing it to look unique.', score_map: { creativity: 2 } },
  { id: 'JSS_Q8_D', question_id: 'JSS_Q8', label: 'Using it to plan tasks or timetables.', score_map: { organization: 2 } },

  { id: 'SSS_Q1_A', question_id: 'SSS_Q1', label: 'Analyzing data or solving complex problems.', score_map: { logic: 2, curiosity: 1 }, next_question_id: 'SSS_Q1A' },
  { id: 'SSS_Q1_B', question_id: 'SSS_Q1', label: 'Coordinating people to hit a shared goal.', score_map: { leadership: 2, organization: 1 }, next_question_id: 'SSS_Q1B' },
  { id: 'SSS_Q1_C', question_id: 'SSS_Q1', label: 'Crafting a story, design, or presentation.', score_map: { creativity: 2, communication: 1 }, next_question_id: 'SSS_Q1C' },
  { id: 'SSS_Q1_D', question_id: 'SSS_Q1', label: 'Building or testing something hands-on.', score_map: { practical: 2, technical: 1 }, next_question_id: 'SSS_Q1D' },

  { id: 'SSS_Q1A_A', question_id: 'SSS_Q1A', label: 'Break it into parts and research each one.', score_map: { logic: 2, curiosity: 1 } },
  { id: 'SSS_Q1A_B', question_id: 'SSS_Q1A', label: 'Look for patterns and create a strategy.', score_map: { logic: 2, organization: 1 } },
  { id: 'SSS_Q1A_C', question_id: 'SSS_Q1A', label: 'Discuss with peers to test ideas.', score_map: { communication: 1, curiosity: 1 } },

  { id: 'SSS_Q1B_A', question_id: 'SSS_Q1B', label: 'Define roles and set clear milestones.', score_map: { leadership: 2, organization: 1 } },
  { id: 'SSS_Q1B_B', question_id: 'SSS_Q1B', label: 'Motivate the team with a shared vision.', score_map: { leadership: 1, communication: 1 } },
  { id: 'SSS_Q1B_C', question_id: 'SSS_Q1B', label: 'Make sure everyone feels heard.', score_map: { empathy: 1, leadership: 1 } },

  { id: 'SSS_Q1C_A', question_id: 'SSS_Q1C', label: 'Build a narrative that connects with people.', score_map: { communication: 2, creativity: 1 } },
  { id: 'SSS_Q1C_B', question_id: 'SSS_Q1C', label: 'Design visuals that make the idea memorable.', score_map: { creativity: 2 } },
  { id: 'SSS_Q1C_C', question_id: 'SSS_Q1C', label: 'Explain the idea clearly and simply.', score_map: { communication: 2 } },

  { id: 'SSS_Q1D_A', question_id: 'SSS_Q1D', label: 'Test different tools until it works.', score_map: { practical: 2, technical: 1 } },
  { id: 'SSS_Q1D_B', question_id: 'SSS_Q1D', label: 'Plan the steps before doing anything.', score_map: { organization: 1, practical: 1 } },
  { id: 'SSS_Q1D_C', question_id: 'SSS_Q1D', label: 'Ask questions about how it could be improved.', score_map: { curiosity: 2 } },

  { id: 'SSS_Q2_A', question_id: 'SSS_Q2', label: 'Analyzing information and data', score_map: { logic: 1 } },
  { id: 'SSS_Q2_B', question_id: 'SSS_Q2', label: 'Explaining ideas clearly', score_map: { communication: 1 } },
  { id: 'SSS_Q2_C', question_id: 'SSS_Q2', label: 'Using technology or tools', score_map: { technical: 1 } },
  { id: 'SSS_Q2_D', question_id: 'SSS_Q2', label: 'Keeping plans organized', score_map: { organization: 1 } },

  { id: 'SSS_Q3_A', question_id: 'SSS_Q3', label: 'Create a study schedule early.', score_map: { organization: 2 } },
  { id: 'SSS_Q3_B', question_id: 'SSS_Q3', label: 'Explore extra resources and ask questions.', score_map: { curiosity: 2 } },
  { id: 'SSS_Q3_C', question_id: 'SSS_Q3', label: 'Study with a group for discussion.', score_map: { communication: 2 } },
  { id: 'SSS_Q3_D', question_id: 'SSS_Q3', label: 'Jump into practice tasks right away.', score_map: { practical: 2 } },
  { id: 'SSS_Q3_E', question_id: 'SSS_Q3', label: 'Leave it till the last minute or skip it if possible.', score_map: {}, disengaged: true },

  { id: 'SSS_Q5_A', question_id: 'SSS_Q5', label: 'Listen to what they need and encourage them.', score_map: { empathy: 2 } },
  { id: 'SSS_Q5_B', question_id: 'SSS_Q5', label: 'Teach them a step-by-step method.', score_map: { communication: 2, organization: 1 } },
  { id: 'SSS_Q5_C', question_id: 'SSS_Q5', label: 'Inspire them to set goals and stay focused.', score_map: { leadership: 2 } },
  { id: 'SSS_Q5_D', question_id: 'SSS_Q5', label: 'I would rather not get involved.', score_map: {}, disengaged: true },

  { id: 'SSS_SCI_Q1_A', question_id: 'SSS_SCI_Q1', label: 'Doing lab practicals and testing ideas.', score_map: { logic: 2, curiosity: 1 } },
  { id: 'SSS_SCI_Q1_B', question_id: 'SSS_SCI_Q1', label: 'Understanding health or medical topics in the community.', score_map: { empathy: 1, practical: 1 } },
  { id: 'SSS_SCI_Q1_C', question_id: 'SSS_SCI_Q1', label: 'Building or improving a simple device.', score_map: { technical: 2, practical: 1 } },

  { id: 'SSS_ART_Q1_A', question_id: 'SSS_ART_Q1', label: 'Debating or presenting ideas in class or club.', score_map: { communication: 2, leadership: 1 } },
  { id: 'SSS_ART_Q1_B', question_id: 'SSS_ART_Q1', label: 'Writing stories, poems, or scripts.', score_map: { creativity: 2 } },
  { id: 'SSS_ART_Q1_C', question_id: 'SSS_ART_Q1', label: 'Working on social or community causes.', score_map: { empathy: 2 } },

  { id: 'SSS_COM_Q1_A', question_id: 'SSS_COM_Q1', label: 'Planning a small business strategy.', score_map: { leadership: 2, logic: 1 } },
  { id: 'SSS_COM_Q1_B', question_id: 'SSS_COM_Q1', label: 'Organizing numbers or budgets for a project.', score_map: { organization: 2, logic: 1 } },
  { id: 'SSS_COM_Q1_C', question_id: 'SSS_COM_Q1', label: 'Promoting ideas or products.', score_map: { communication: 2, creativity: 1 } }
];

const clusters: Cluster[] = [
  {
    id: 'JSS_SCIENCE_ANALYTICAL',
    label: 'Science & Analytical',
    description: 'Exploring how things work through logic, experiments, and discovery.',
    track_bias: [],
    trait_weights: { logic: 1.4, curiosity: 1.2, technical: 1 },
    trait_thresholds: {},
    subjects: ['Mathematics', 'Basic Science', 'Computer Studies'],
    skills: ['Logical reasoning', 'Problem solving', 'Curiosity'],
    what_they_do: [
      'Investigate how things work using experiments.',
      'Solve puzzles with logic and patterns.',
      'Use simple data to answer questions.'
    ],
    next_steps: [
      'Join science or coding clubs.',
      'Try experiments with supervision at school.',
      'Play logic and puzzle games regularly.'
    ]
  },
  {
    id: 'JSS_ARTS_HUMANITIES',
    label: 'Arts & Humanities',
    description: 'Expressing ideas through creativity, stories, and communication.',
    track_bias: [],
    trait_weights: { creativity: 1.4, communication: 1.1, empathy: 0.8 },
    trait_thresholds: {},
    subjects: ['English Language', 'Literature', 'History', 'Social Studies'],
    skills: ['Communication', 'Creativity', 'Empathy'],
    what_they_do: [
      'Tell stories through writing, speaking, or performance.',
      'Explore cultures, people, and history.',
      'Share ideas clearly with others.'
    ],
    next_steps: [
      'Join debate, drama, or writing clubs.',
      'Read books and practice short writing exercises.',
      'Take part in school presentations.'
    ]
  },
  {
    id: 'JSS_COMMERCIAL_BUSINESS',
    label: 'Commercial & Business',
    description: 'Organizing people, plans, and resources to reach goals.',
    track_bias: [],
    trait_weights: { leadership: 1.2, organization: 1.2, logic: 0.8 },
    trait_thresholds: {},
    subjects: ['Mathematics', 'Business Studies', 'Economics', 'Civic Education'],
    skills: ['Organization', 'Leadership', 'Planning'],
    what_they_do: [
      'Plan group activities and manage resources.',
      'Track tasks, budgets, and timelines.',
      'Lead teams to complete goals.'
    ],
    next_steps: [
      'Help organize school events.',
      'Start a mini entrepreneurship project.',
      'Practice basic budgeting at home or school.'
    ]
  },
  {
    id: 'JSS_CREATIVE_DESIGN',
    label: 'Creative & Design',
    description: 'Using imagination and visuals to craft new experiences.',
    track_bias: [],
    trait_weights: { creativity: 1.5, technical: 0.7, communication: 0.6 },
    trait_thresholds: {},
    subjects: ['Fine Arts', 'Music', 'Computer Studies', 'Technical Drawing'],
    skills: ['Creativity', 'Visual thinking', 'Design sense'],
    what_they_do: [
      'Design posters, visuals, and creative projects.',
      'Turn ideas into sketches and prototypes.',
      'Experiment with colors, shapes, and style.'
    ],
    next_steps: [
      'Build a small design portfolio.',
      'Use design or art apps to practice.',
      'Join art or media clubs at school.'
    ]
  },
  {
    id: 'JSS_HYBRID',
    label: 'Hybrid / Multidisciplinary',
    description: 'A balanced mix of interests across multiple directions.',
    track_bias: [],
    trait_weights: { logic: 0.8, creativity: 0.8, communication: 0.8, practical: 0.8 },
    trait_thresholds: {},
    subjects: ['Mathematics', 'English Language', 'Basic Science', 'Social Studies'],
    skills: ['Adaptability', 'Curiosity', 'Communication'],
    what_they_do: [
      'Combine interests from different subjects.',
      'Connect ideas across science, arts, and business.',
      'Explore many activities to discover strengths.'
    ],
    next_steps: [
      'Try activities across different clubs.',
      'Reflect on what energizes you most.',
      'Work on projects that blend different skills.'
    ]
  },
  {
    id: 'SSS_ENGINEERING_TECH',
    label: 'Engineering & Technology',
    description: 'Designing, building, and improving systems or products.',
    track_bias: ['SCIENCE'],
    trait_weights: { technical: 1.4, practical: 1.1, logic: 1 },
    trait_thresholds: {},
    subjects: ['Mathematics', 'Physics', 'Further Mathematics', 'Technical Drawing'],
    skills: ['Problem solving', 'Technical aptitude', 'Analytical thinking'],
    what_they_do: [
      'Design and test systems, machines, or software.',
      'Build prototypes and improve performance.',
      'Solve technical problems in real contexts.'
    ],
    next_steps: [
      'Join robotics or engineering clubs.',
      'Build simple hardware or coding projects.',
      'Explore basic CAD or programming tools.'
    ]
  },
  {
    id: 'SSS_HEALTH_MED',
    label: 'Health & Medical Sciences',
    description: 'Supporting wellbeing through care, science, and empathy.',
    track_bias: ['SCIENCE'],
    trait_weights: { empathy: 1.2, curiosity: 1, practical: 1 },
    trait_thresholds: {},
    subjects: ['Biology', 'Chemistry', 'Physics', 'Health Science'],
    skills: ['Empathy', 'Attention to detail', 'Practical care'],
    what_they_do: [
      'Support patient care and wellbeing.',
      'Study the human body and health systems.',
      'Apply science in clinical or lab settings.'
    ],
    next_steps: [
      'Volunteer in health awareness programs.',
      'Learn basic first aid.',
      'Explore biology and health resources.'
    ]
  },
  {
    id: 'SSS_PURE_SCIENCE',
    label: 'Pure & Applied Sciences',
    description: 'Exploring scientific questions and data-driven discovery.',
    track_bias: ['SCIENCE'],
    trait_weights: { logic: 1.3, curiosity: 1.2, technical: 0.6 },
    trait_thresholds: {},
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
    skills: ['Analytical reasoning', 'Curiosity', 'Data analysis'],
    what_they_do: [
      'Conduct experiments and analyze results.',
      'Study scientific theories and models.',
      'Investigate questions using data.'
    ],
    next_steps: [
      'Participate in science fairs.',
      'Practice lab skills with teachers.',
      'Read science magazines for students.'
    ]
  },
  {
    id: 'SSS_DATA_AI',
    label: 'Data, AI & Computational Fields',
    description: 'Working with data, patterns, and intelligent systems.',
    track_bias: ['SCIENCE', 'COMMERCIAL'],
    trait_weights: { logic: 1.4, technical: 1.1, curiosity: 0.8 },
    trait_thresholds: {},
    subjects: ['Mathematics', 'Computer Studies', 'Physics', 'Economics'],
    skills: ['Logical thinking', 'Data literacy', 'Programming basics'],
    what_they_do: [
      'Analyze data to find patterns.',
      'Build models that predict outcomes.',
      'Automate tasks with code.'
    ],
    next_steps: [
      'Learn basic programming skills.',
      'Try small data projects with spreadsheets.',
      'Take an intro data or coding course.'
    ]
  },
  {
    id: 'SSS_LAW_GOV',
    label: 'Law, Governance & Public Service',
    description: 'Advocacy, policy, and guiding communities.',
    track_bias: ['ARTS'],
    trait_weights: { communication: 1.2, leadership: 1, empathy: 0.7 },
    trait_thresholds: {},
    subjects: ['Government', 'Literature', 'History', 'Civic Education'],
    skills: ['Communication', 'Critical thinking', 'Leadership'],
    what_they_do: [
      'Interpret rules and laws.',
      'Advocate for people and communities.',
      'Develop policies and public programs.'
    ],
    next_steps: [
      'Join debate or mock parliament.',
      'Practice persuasive writing.',
      'Follow civic issues in the news.'
    ]
  },
  {
    id: 'SSS_MEDIA_COMM',
    label: 'Media, Communication & Journalism',
    description: 'Storytelling, reporting, and public engagement.',
    track_bias: ['ARTS'],
    trait_weights: { communication: 1.4, creativity: 1, curiosity: 0.6 },
    trait_thresholds: {},
    subjects: ['English Language', 'Literature', 'Government', 'Media Studies'],
    skills: ['Storytelling', 'Communication', 'Creativity'],
    what_they_do: [
      'Report stories and interview people.',
      'Create content for media channels.',
      'Explain complex ideas clearly.'
    ],
    next_steps: [
      'Join the school press or media club.',
      'Create a short newsletter or blog.',
      'Practice interviewing classmates.'
    ]
  },
  {
    id: 'SSS_EDU_SOCIAL',
    label: 'Education & Social Sciences',
    description: 'Teaching, mentoring, and understanding people.',
    track_bias: ['ARTS'],
    trait_weights: { empathy: 1.3, communication: 1.1, leadership: 0.6 },
    trait_thresholds: {},
    subjects: ['English Language', 'Government', 'Biology', 'Social Studies'],
    skills: ['Empathy', 'Communication', 'Patience'],
    what_they_do: [
      'Teach or mentor learners.',
      'Research how people think and behave.',
      'Support community development.'
    ],
    next_steps: [
      'Help with peer tutoring.',
      'Volunteer for community programs.',
      'Read about psychology and learning.'
    ]
  },
  {
    id: 'SSS_BUSINESS_MGMT',
    label: 'Business, Management & Entrepreneurship',
    description: 'Leading organizations and turning ideas into ventures.',
    track_bias: ['COMMERCIAL'],
    trait_weights: { leadership: 1.3, organization: 1, communication: 0.7 },
    trait_thresholds: {},
    subjects: ['Economics', 'Business Studies', 'Mathematics', 'Accounting'],
    skills: ['Leadership', 'Planning', 'Strategy'],
    what_they_do: [
      'Plan and manage operations.',
      'Lead teams to deliver results.',
      'Turn ideas into sustainable ventures.'
    ],
    next_steps: [
      'Join entrepreneurship clubs.',
      'Try a mini business project.',
      'Practice project planning tools.'
    ]
  },
  {
    id: 'SSS_FINANCE_ECON',
    label: 'Finance, Accounting & Economics',
    description: 'Managing resources, numbers, and strategy.',
    track_bias: ['COMMERCIAL'],
    trait_weights: { organization: 1.2, logic: 1.1, curiosity: 0.5 },
    trait_thresholds: {},
    subjects: ['Mathematics', 'Economics', 'Accounting', 'Commerce'],
    skills: ['Numeracy', 'Attention to detail', 'Analysis'],
    what_they_do: [
      'Track budgets and financial records.',
      'Analyze markets and trends.',
      'Advise on resource allocation.'
    ],
    next_steps: [
      'Practice with spreadsheets.',
      'Run a simple budget for a project.',
      'Follow business news for trends.'
    ]
  },
  {
    id: 'SSS_MARKETING',
    label: 'Marketing, Sales & Strategy',
    description: 'Connecting ideas with people through persuasion.',
    track_bias: ['COMMERCIAL'],
    trait_weights: { communication: 1.3, creativity: 0.9, leadership: 0.6 },
    trait_thresholds: {},
    subjects: ['Economics', 'Business Studies', 'English Language', 'Literature'],
    skills: ['Persuasion', 'Creativity', 'Communication'],
    what_they_do: [
      'Promote ideas, products, and services.',
      'Study customer needs and behavior.',
      'Design campaigns and messaging.'
    ],
    next_steps: [
      'Help promote a school event.',
      'Practice creating posters or ads.',
      'Learn basic branding concepts.'
    ]
  },
  {
    id: 'SSS_CREATIVE_DESIGN',
    label: 'Creative Arts & Design',
    description: 'Designing visuals, stories, and creative experiences.',
    track_bias: ['ARTS'],
    trait_weights: { creativity: 1.4, communication: 0.8, technical: 0.5 },
    trait_thresholds: {},
    subjects: ['Fine Arts', 'Literature', 'Computer Studies', 'Technical Drawing'],
    skills: ['Creativity', 'Visual communication', 'Design tools'],
    what_they_do: [
      'Design graphics, media, or products.',
      'Create stories and visuals that connect with people.',
      'Prototype ideas using digital tools.'
    ],
    next_steps: [
      'Build a portfolio of creative work.',
      'Learn a design tool or editing app.',
      'Join creative competitions or clubs.'
    ]
  },
  {
    id: 'SSS_TECH_VOC',
    label: 'Technical & Vocational Careers',
    description: 'Skilled, hands-on careers with practical impact.',
    track_bias: ['SCIENCE', 'COMMERCIAL'],
    trait_weights: { practical: 1.3, technical: 1.1, organization: 0.5 },
    trait_thresholds: {},
    subjects: ['Technical Drawing', 'Physics', 'Mathematics', 'Basic Technology'],
    skills: ['Hands-on skills', 'Problem solving', 'Reliability'],
    what_they_do: [
      'Install, repair, or maintain equipment.',
      'Work with tools and practical systems.',
      'Deliver reliable results in real settings.'
    ],
    next_steps: [
      'Attend hands-on workshops.',
      'Explore apprenticeship opportunities.',
      'Learn safety and tool handling basics.'
    ]
  }
];

const buildSnapshot = (): ConfigSnapshot => ({
  questions,
  options,
  traits,
  clusters
});

export const ensureSeedData = async () => {
  const existingTraits = await db.traits.count();
  if (existingTraits > 0) return;

  await db.traits.bulkAdd(traits);
  await db.clusters.bulkAdd(clusters);
  await db.questions.bulkAdd(questions);
  await db.options.bulkAdd(options);

  const snapshot = buildSnapshot();
  await db.drafts.add({
    id: 'draft_default',
    name: 'Default Draft',
    updated_at: now(),
    draft_json: snapshot
  });

  await db.config_versions.add({
    id: 'config_v1',
    version: 'v1',
    status: 'published',
    published_at: now(),
    config_json: snapshot
  });
};
