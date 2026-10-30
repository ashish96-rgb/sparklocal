const seedProjects = [
  { id: 'seed-garden', title: 'Make the empty lot a shared garden', category: 'Food & nature', description: 'Bring nearby residents together to test a small, accessible growing space and learn what the block wants next.', location: 'Riverside', status: 'seeking', people: 8, votes: 12 },
  { id: 'seed-walk', title: 'A safer walk to the bus stop', category: 'Access & safety', description: 'Map the tricky crossings with people who use them and bring a short, evidence-led request to the city.', location: 'East Ward', status: 'active', people: 5, votes: 9 },
  { id: 'seed-share', title: 'Start a neighborhood repair afternoon', category: 'Sharing skills', description: 'Try a monthly meet-up where neighbors help fix small household items and share tools.', location: 'Maple District', status: 'seeking', people: 11, votes: 16 },
];

const form = document.querySelector('#challenge-form');
const planButton = document.querySelector('#plan-button');
const planEmpty = document.querySelector('#plan-empty');
const planResult = document.querySelector('#plan-result');
const projectList = document.querySelector('#project-list');
const searchInput = document.querySelector('#search');
const toast = document.querySelector('#toast');
let currentPlan = null;
let activeFilter = 'all';
let toastTimer;

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

const PARTICIPANT_KEY = 'sparklocal.participant.v1';
let participantId = readStorage(PARTICIPANT_KEY, '');
if (!participantId) {
  participantId = crypto.randomUUID();
  localStorage.setItem(PARTICIPANT_KEY, participantId);
}
let projects = seedProjects;

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
}

function updateCounts() {
  document.querySelector('#initiative-count').textContent = projects.length;
  document.querySelector('#all-count').textContent = projects.length;
  const neighbors = projects.reduce((total, project) => total + project.people, 0);
  document.querySelector('#neighbor-count').textContent = neighbors;
}

function renderProjects() {
  const query = searchInput.value.trim().toLowerCase();
  const visible = projects.filter((project) => {
    const matchesFilter = activeFilter === 'all' || project.status === activeFilter;
    const matchesQuery = `${project.title} ${project.description} ${project.category} ${project.location}`.toLowerCase().includes(query);
    return matchesFilter && matchesQuery;
  });
  projectList.innerHTML = visible.map((project, index) => {
    const joined = Boolean(project.joined);
    const liked = Boolean(project.supported);
    return `<article class="project-card" style="animation-delay:${index * 45}ms">
      <div class="project-meta"><span class="project-category">${escapeHtml(project.category)}</span><span class="project-status ${project.status === 'active' ? 'is-active' : ''}">${project.status === 'active' ? 'Underway' : 'Looking for neighbors'}</span></div>
      <h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description)}</p>
      <span class="project-location">${escapeHtml(project.location || 'Community project')}</span>
      <div class="project-actions"><span class="project-people">${project.people} ${project.people === 1 ? 'neighbor' : 'neighbors'}</span>
        <div class="project-action-buttons"><button class="project-action ${liked ? 'is-active' : ''}" data-action="like" data-id="${escapeHtml(project.id)}" aria-pressed="${liked}">Support · ${project.votes}</button><button class="project-action ${joined ? 'is-active' : ''}" data-action="join" data-id="${escapeHtml(project.id)}" aria-pressed="${joined}">${joined ? 'Joined' : 'Join in'}</button></div>
      </div></article>`;
  }).join('');
  document.querySelector('#empty-board').hidden = visible.length > 0;
  updateCounts();
}

function renderPlan(plan, provider, model) {
  const actions = plan.actions.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const roles = plan.roles.map((item) => `<div class="role-item"><strong>${escapeHtml(item.role)}</strong><span>${escapeHtml(item.contribution)}</span></div>`).join('');
  const supplies = plan.supplies.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const impact = plan.impact.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const risks = plan.risks.map((item) => `<li><strong>${escapeHtml(item.risk)}</strong> ${escapeHtml(item.mitigation)}</li>`).join('');
  const source = provider === 'demo' ? 'Demo plan · Gemma not connected' : `Generated with ${escapeHtml(model || 'Gemma')}`;
  planEmpty.hidden = true;
  planResult.hidden = false;
  planResult.innerHTML = `<div class="result-top"><span class="result-badge">${source}</span><span class="section-number">02</span></div>
    <h2 class="result-title">${escapeHtml(plan.title)}</h2><p class="result-summary">${escapeHtml(plan.summary)}</p>
    <div class="result-block"><h3>First steps</h3><ol>${actions}</ol></div>
    <div class="result-block"><h3>People make it happen</h3><div class="role-list">${roles}</div></div>
    <div class="result-block"><h3>Small supplies, real impact</h3><ul>${supplies}</ul></div>
    <div class="result-block"><h3>How we will know</h3><ul>${impact}</ul></div>
    <div class="result-block"><h3>Plan for bumps</h3><ul>${risks}</ul></div>
    <div class="result-actions"><button class="secondary-button is-saved" id="save-project" type="button">Add this brief to the community board</button><button class="secondary-button" id="start-over" type="button">Start a new idea</button></div>`;
  document.querySelector('#save-project').addEventListener('click', saveCurrentPlan);
  document.querySelector('#start-over').addEventListener('click', resetPlanner);
}

async function checkModelStatus() {
  const status = document.querySelector('#model-status');
  const label = document.querySelector('#model-label');
  try {
    const response = await fetch('/api/health');
    const health = await response.json();
    if (health.provider === 'demo') {
      label.textContent = 'Demo mode · Gemma ready to connect';
    } else {
      label.textContent = `Gemma · ${health.model}`;
      status.classList.add('is-live');
    }
  } catch {
    label.textContent = 'Planner unavailable';
  }
}

async function loadProjects() {
  try {
    const response = await fetch(`/api/projects?participantId=${encodeURIComponent(participantId)}`);
    if (!response.ok) throw new Error('The board is unavailable.');
    const result = await response.json();
    projects = result.projects;
    renderProjects();
  } catch {
    projects = seedProjects;
    renderProjects();
    showToast('Showing example briefs. The shared community board is currently unavailable.');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form));
  planButton.disabled = true;
  planButton.querySelector('span:first-child').textContent = 'Thinking through the first step…';
  try {
    const response = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'The plan could not be created.');
    currentPlan = { ...result, input: data };
    renderPlan(result.plan, result.provider, result.model);
  } catch (error) {
    showToast(error.message || 'The planner could not be reached. Please try again.');
  } finally {
    planButton.disabled = false;
    planButton.querySelector('span:first-child').textContent = 'Shape a first step';
  }
});

async function saveCurrentPlan() {
  if (!currentPlan) return;
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: currentPlan.plan.title, category: 'Community action', description: currentPlan.plan.summary, location: currentPlan.input.location || 'Community project' }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'The brief could not be shared.');
    await loadProjects();
  } catch (error) {
    showToast(error.message || 'The brief could not be shared.');
    return;
  }
  showToast('Your community brief is on the board. Invite a neighbor to join in.');
  document.querySelector('#community').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetPlanner() {
  form.reset();
  currentPlan = null;
  planResult.hidden = true;
  planResult.innerHTML = '';
  planEmpty.hidden = false;
  document.querySelector('#problem').focus();
}

projectList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const action = button.dataset.action === 'join' ? 'join' : 'support';
  try {
    const response = await fetch(`/api/projects/${encodeURIComponent(button.dataset.id)}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'That action could not be saved.');
    await loadProjects();
    if (action === 'join') showToast(result.project.joined ? 'You joined in. A small step starts with showing up.' : 'You left this project. You can join again any time.');
  } catch (error) {
    showToast(error.message || 'That action could not be saved.');
  }
});

document.querySelectorAll('.filter-button').forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter-button').forEach((item) => item.classList.toggle('is-selected', item === button));
    renderProjects();
  });
});

searchInput.addEventListener('input', renderProjects);
renderProjects();
loadProjects();
checkModelStatus();