import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const MAX_FIELD_LENGTH = 600;
const seedProjects = [
  { id: 'seed-garden', title: 'Make the empty lot a shared garden', category: 'Food & nature', description: 'Bring nearby residents together to test a small, accessible growing space and learn what the block wants next.', location: 'Riverside', status: 'seeking', people: 8, votes: 12, members: [], supporters: [] },
  { id: 'seed-walk', title: 'A safer walk to the bus stop', category: 'Access & safety', description: 'Map the tricky crossings with people who use them and bring a short, evidence-led request to the city.', location: 'East Ward', status: 'active', people: 5, votes: 9, members: [], supporters: [] },
  { id: 'seed-share', title: 'Start a neighborhood repair afternoon', category: 'Sharing skills', description: 'Try a monthly meet-up where neighbors help fix small household items and share tools.', location: 'Maple District', status: 'seeking', people: 11, votes: 16, members: [], supporters: [] },
];
const dataFile = process.env.DATA_FILE || path.join(root, 'data', 'projects.json');

function loadProjects() {
  try {
    const saved = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    if (Array.isArray(saved)) return saved;
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Could not read the community board store:', error.message);
  }
  return structuredClone(seedProjects);
}

let boardProjects = loadProjects();

function persistProjects() {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  const temporaryFile = `${dataFile}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(boardProjects, null, 2));
  fs.renameSync(temporaryFile, dataFile);
}

function publicProject(project, participantId = '') {
  return {
    id: project.id,
    title: project.title,
    category: project.category,
    description: project.description,
    location: project.location,
    status: project.status,
    people: project.people + project.members.length,
    votes: project.votes + project.supporters.length,
    joined: project.members.includes(participantId),
    supported: project.supporters.includes(participantId),
  };
}

export function getProvider() {
  const requested = process.env.AI_PROVIDER?.toLowerCase();
  if (requested === 'ollama' || requested === 'huggingface' || requested === 'demo') return requested;
  return process.env.HF_TOKEN ? 'huggingface' : 'demo';
}

function safeText(value, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, MAX_FIELD_LENGTH) : fallback;
}

function readInput(body) {
  const input = {
    problem: safeText(body.problem),
    location: safeText(body.location),
    budget: safeText(body.budget, 'Small or donated budget'),
    timeline: safeText(body.timeline, 'One month'),
    community: safeText(body.community, 'Neighbors and local groups'),
  };
  if (input.problem.length < 12) {
    const error = new Error('Describe the local challenge in at least 12 characters.');
    error.status = 400;
    throw error;
  }
  return input;
}

function makePrompt(input) {
  return `Create an inclusive, practical community action plan for this local challenge.
Challenge: ${input.problem}
Location: ${input.location || 'Not specified'}
Budget: ${input.budget}
Timeline: ${input.timeline}
People or groups involved: ${input.community}

Return only a JSON object with these fields: title (short string), summary (2 sentences), actions (array of 4 to 6 concrete steps), roles (array of 3 objects with role and contribution strings), supplies (array of 3 to 6 affordable items), impact (array of 3 measurable outcomes), risks (array of 2 objects with risk and mitigation strings). Keep it realistic, safe, accessible, low-cost, locally led, and respectful. Do not invent local services, statistics, or contacts. Avoid collecting personal data.`;
}

function parsePlan(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace < 0 || lastBrace <= firstBrace) throw new Error('Gemma returned a response that was not a project plan. Try again.');
  const plan = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  const list = (value) => Array.isArray(value) ? value.slice(0, 8) : [];
  return {
    title: safeText(plan.title, 'A practical community action plan'),
    summary: safeText(plan.summary),
    actions: list(plan.actions).map((item) => safeText(item)).filter(Boolean),
    roles: list(plan.roles).map((item) => ({
      role: safeText(item?.role, 'Community volunteer'),
      contribution: safeText(item?.contribution),
    })),
    supplies: list(plan.supplies).map((item) => safeText(item)).filter(Boolean),
    impact: list(plan.impact).map((item) => safeText(item)).filter(Boolean),
    risks: list(plan.risks).map((item) => ({
      risk: safeText(item?.risk, 'Unexpected delay'),
      mitigation: safeText(item?.mitigation),
    })),
  };
}

function demoPlan(input) {
  const topic = input.problem.replace(/[.!?]+$/, '');
  return {
    title: `A local first step for ${topic.toLowerCase()}`,
    summary: `Bring ${input.community.toLowerCase()} together around a small, visible response to ${topic.toLowerCase()}. Start with listening, use ${input.budget.toLowerCase()}, and review progress within ${input.timeline.toLowerCase()}.`,
    actions: [
      'Ask affected neighbors what would make the biggest near-term difference.',
      'Choose one safe, accessible pilot that can be completed with the available budget.',
      'Invite volunteers through trusted community spaces and agree on clear roles.',
      'Run the pilot, record a simple before-and-after measure, and gather feedback.',
      'Share what worked openly and decide together whether to continue or adapt.',
    ],
    roles: [
      { role: 'Community listener', contribution: 'Gather ideas and make sure affected neighbors shape the plan.' },
      { role: 'Project organizer', contribution: 'Coordinate the first activity, schedule, and shared checklist.' },
      { role: 'Impact recorder', contribution: 'Track agreed measures and share a short, privacy-respecting update.' },
    ],
    supplies: ['Shared checklist', 'Locally available materials', 'Accessible meeting space or online option', 'Simple feedback form'],
    impact: ['Number of neighbors consulted', 'Pilot completed within the agreed budget', 'Participant feedback and next-step decision recorded'],
    risks: [
      { risk: 'The plan misses the needs of people most affected.', mitigation: 'Ask them first, offer more than one way to participate, and revise before the pilot.' },
      { risk: 'Volunteer time or supplies are limited.', mitigation: 'Keep the first step small and agree on a clear stop-or-adjust point.' },
    ],
  };
}

async function generateWithOllama(prompt) {
  const baseUrl = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || 'gemma3:4b',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      format: 'json',
      options: { temperature: 0.4 },
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok) throw new Error(`Ollama returned ${response.status}. Check that it is running and the Gemma model is available.`);
  const payload = await response.json();
  return parsePlan(payload.message?.content || '');
}

async function generateWithHuggingFace(prompt) {
  const response = await fetch(process.env.HF_BASE_URL || 'https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.HF_MODEL || 'google/gemma-3-4b-it',
      messages: [
        { role: 'system', content: 'You are a practical community project planner. Return valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok) throw new Error(`Hugging Face returned ${response.status}. Check model access, token permissions, and provider availability.`);
  const payload = await response.json();
  return parsePlan(payload.choices?.[0]?.message?.content || '');
}

export async function generatePlan(input) {
  const provider = getProvider();
  if (provider === 'ollama') return { plan: await generateWithOllama(makePrompt(input)), provider, model: process.env.OLLAMA_MODEL || 'gemma3:4b' };
  if (provider === 'huggingface') {
    if (!process.env.HF_TOKEN) throw new Error('Set HF_TOKEN on the server to use hosted Gemma.');
    return { plan: await generateWithHuggingFace(makePrompt(input)), provider, model: process.env.HF_MODEL || 'google/gemma-3-4b-it' };
  }
  return { plan: demoPlan(input), provider, model: null };
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '12kb' }));
  app.use(express.static(path.join(root, 'public')));

  app.get('/api/health', (_request, response) => {
    const provider = getProvider();
    const model = provider === 'ollama'
      ? process.env.OLLAMA_MODEL || 'gemma3:4b'
      : provider === 'huggingface'
        ? process.env.HF_MODEL || 'google/gemma-3-4b-it'
        : null;
    response.json({ status: 'ok', provider, model });
  });

  app.get('/api/projects', (request, response) => {
    const participantId = safeText(request.query.participantId, '').slice(0, 80);
    response.json({ projects: boardProjects.map((project) => publicProject(project, participantId)) });
  });

  app.post('/api/projects', (request, response) => {
    const title = safeText(request.body?.title, '');
    const description = safeText(request.body?.description, '');
    const location = safeText(request.body?.location, 'Community project');
    if (title.length < 3 || description.length < 12) {
      return response.status(400).json({ error: 'A project needs a title and a description of at least 12 characters.' });
    }
    const project = {
      id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      category: safeText(request.body?.category, 'Community action'),
      description,
      location,
      status: 'seeking',
      people: 0,
      votes: 0,
      members: [],
      supporters: [],
    };
    boardProjects.unshift(project);
    persistProjects();
    return response.status(201).json({ project: publicProject(project) });
  });

  app.post('/api/projects/:id/:action', (request, response) => {
    const participantId = safeText(request.body?.participantId, '').slice(0, 80);
    if (participantId.length < 8) return response.status(400).json({ error: 'A participant ID is required.' });
    const project = boardProjects.find((item) => item.id === request.params.id);
    if (!project) return response.status(404).json({ error: 'That community brief could not be found.' });
    const list = request.params.action === 'join'
      ? project.members
      : request.params.action === 'support'
        ? project.supporters
        : null;
    if (!list) return response.status(404).json({ error: 'That community action is not available.' });
    const existingIndex = list.indexOf(participantId);
    if (existingIndex >= 0) list.splice(existingIndex, 1);
    else list.push(participantId);
    persistProjects();
    return response.json({ project: publicProject(project, participantId) });
  });

  app.post('/api/plan', async (request, response) => {
    try {
      const input = readInput(request.body || {});
      response.json(await generatePlan(input));
    } catch (error) {
      response.status(error.status || 502).json({ error: error.message || 'The project plan could not be created.' });
    }
  });

  return app;
}