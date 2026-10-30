import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { tmpdir } from 'node:os';
import path from 'node:path';

process.env.DATA_FILE = path.join(tmpdir(), `sparklocal-test-${process.pid}.json`);
const { createApp } = await import('../app.js');

let server;
let baseUrl;

before(async () => {
  process.env.AI_PROVIDER = 'demo';
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('health endpoint reports an explicit demo provider', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', provider: 'demo', model: null });
});

test('planner creates a structured offline plan and labels its source', async () => {
  const response = await fetch(`${baseUrl}/api/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem: 'The neighborhood park needs more shade', location: 'Northside', community: 'families and neighbors' }),
  });
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.provider, 'demo');
  assert.match(result.plan.title, /park needs more shade/i);
  assert.ok(result.plan.actions.length >= 4);
  assert.ok(result.plan.roles.length >= 3);
  assert.ok(result.plan.impact.length >= 3);
});

test('planner rejects vague challenges with a useful validation error', async () => {
  const response = await fetch(`${baseUrl}/api/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem: 'Too short' }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /at least 12 characters/);
});

test('static app entry point is served', async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /SparkLocal/);
});

test('community briefs can be shared and joined across participant IDs', async () => {
  const createResponse = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Add a lending shelf', description: 'Create a small shared shelf for useful household tools.', location: 'West End' }),
  });
  assert.equal(createResponse.status, 201);
  const { project } = await createResponse.json();

  const joinResponse = await fetch(`${baseUrl}/api/projects/${project.id}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantId: 'neighbor-device-1' }),
  });
  assert.equal((await joinResponse.json()).project.people, 1);

  const boardResponse = await fetch(`${baseUrl}/api/projects?participantId=neighbor-device-2`);
  const board = await boardResponse.json();
  const sharedProject = board.projects.find((item) => item.id === project.id);
  assert.equal(sharedProject.people, 1);
  assert.equal(sharedProject.joined, false);
});

test('community actions reject unknown action names', async () => {
  const response = await fetch(`${baseUrl}/api/projects/seed-garden/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantId: 'neighbor-device-1' }),
  });
  assert.equal(response.status, 404);
});