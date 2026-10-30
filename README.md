# SparkLocal

**Good ideas get local.** SparkLocal is an open-source community action studio that helps neighbors turn a local challenge into a realistic first project, then invite other people to take part.

## The problem

People notice issues close to home, but a good intention can stall before anyone agrees on a first step. Plans can be hard to scope, roles are unclear, and useful local knowledge is spread across neighbors and community groups. SparkLocal makes the early work easier: describe a challenge, get a practical plan, share the brief, and build participation in the open.

## What makes it different

- **Gemma is the planning engine.** The server prompts Google's open-weight Gemma model to produce concrete steps, volunteer roles, affordable supplies, measurable outcomes, and risks. Run Gemma locally with Ollama or use a Hugging Face Inference Provider. A visibly labeled demo planner keeps the app usable without credentials.
- **AI leads to shared action.** A generated plan can become a public community brief. People can search, filter, support, or join it; the server shares counts across browsers and persists the board to a JSON file.
- **Community knowledge stays in charge.** The model offers a starting point, not a verdict. The plan asks for listening, accessibility, realistic resources, and measurable feedback. Neighbors decide what to do.
- **Open by design.** The source, setup steps, contribution process, deck, and demo script are in this repository under the MIT License.

## Why open innovation matters

Open innovation lets people build on ideas beyond the boundaries of one organization. For local challenges, no single model, city office, or organizer has the full picture. Sharing project briefs and reusable tools makes it easier to combine lived experience, technical skills, local resources, and new contributions. An open-weight model adds another choice: teams can run the planner on infrastructure they control, inspect how it is integrated, adapt it to local needs, and avoid locking every community into one hosted AI provider. Openness does not remove responsibility; consent, privacy, accessibility, and community review still matter.

## Run it locally

**Requirements:** Node.js 20 or newer and npm. The offline demo works without an AI account.

```bash
git clone https://github.com/YOUR-USERNAME/sparklocal.git
cd sparklocal
npm install
npm start
```

Open <http://localhost:3000>. The project board and demo planner work in `demo` mode. The server creates `data/projects.json` when the board is first changed; that runtime data file is intentionally ignored by Git.

For live-reload while developing, run `npm run dev`. Run checks with `npm test` and validate syntax with `node --check public/app.js`.

## Use real Gemma

Gemma is distributed with open weights under Google's Gemma terms. Review and accept the current Gemma terms for the chosen model before downloading or using it. The model weights are not bundled in this repository.

### Option A: run open-weight Gemma locally with Ollama

1. Install Ollama for your operating system.
2. Pull the model: `ollama pull gemma3:4b`.
3. Copy `.env.example` to `.env`.
4. Set `AI_PROVIDER=ollama`, and keep `OLLAMA_BASE_URL=http://127.0.0.1:11434` and `OLLAMA_MODEL=gemma3:4b` (or use another Gemma model available in Ollama).
5. Run `npm start` and confirm the header reports the Gemma model rather than demo mode.

The first request can take a while while a local model loads. The request timeout is 90 seconds.

### Option B: use hosted Gemma through Hugging Face

1. Accept the selected Gemma model's terms and create a Hugging Face token with the required inference permissions.
2. Set `AI_PROVIDER=huggingface`, `HF_TOKEN`, and `HF_MODEL=google/gemma-3-4b-it` in the server environment. The router/model availability and access requirements can change; consult the current Hugging Face model and Inference Providers pages.
3. Restart the server and verify the model shown in the app header.

Never commit `.env` or expose `HF_TOKEN` in browser code. Hosted inference sends the challenge fields to the configured provider. Do not enter sensitive personal information.

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `HOST` | `0.0.0.0` | Listen address |
| `AI_PROVIDER` | `demo` (or `huggingface` when an HF token exists) | `demo`, `ollama`, or `huggingface` |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `gemma3:4b` | Local Gemma model name |
| `HF_TOKEN` | unset | Server-only Hugging Face inference token |
| `HF_MODEL` | `google/gemma-3-4b-it` | Hugging Face Gemma model ID |
| `HF_BASE_URL` | Hugging Face chat completions router | OpenAI-compatible inference URL |
| `DATA_FILE` | `data/projects.json` | Server-side board persistence file |

## Features

- Guided project planning with timeline, budget, location, and community context.
- Plans include a summary, ordered actions, volunteer roles, supplies, impact measures, and risks.
- A shared board with seeded examples, search, status filters, join/leave, and support/un-support actions.
- Server-side JSON persistence for the board. Participant IDs are random browser-local identifiers, not accounts; this is a lightweight prototype, not identity verification or abuse-resistant production authentication.
- Responsive layout, keyboard-friendly native controls, reduced-motion support, and accessible status updates.
- `/api/health`, `/api/plan`, and `/api/projects` endpoints.

## Deploy

To publish the open-source repository, create an empty repository named `sparklocal` under your GitHub account, then run these commands from the project directory (replace the username):

```bash
git init
git add .
git commit -m "Build SparkLocal community action studio"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/sparklocal.git
git push -u origin main
```

The included [`render.yaml`](render.yaml) is a starting point for Render. After the GitHub push, create a Render Blueprint from that repository. Set the desired Gemma provider and its server-side environment variables in Render. For Ollama, the Ollama server must be reachable from the deployed app; a local `127.0.0.1` address on Render will not reach your computer. A hosted Gemma inference endpoint is usually the simpler deployment option.

The shared board writes to a local JSON file. Render's filesystem is ephemeral unless persistent storage is configured; the blueprint requests a persistent disk and a paid web-service instance. Review current Render plan and disk pricing before deploying. For a multi-instance or higher-traffic deployment, replace the JSON store with a managed database and add identity, moderation, rate limiting, and backups.

**Deployment and public links are intentionally not fabricated.** A live URL requires a hosting account and a successful deploy. The GitHub URL requires creating a repository under your account. After publishing, replace `YOUR-USERNAME` in this README and include the actual repository and live app URLs in your submission. Keep secrets in the host's environment settings.

## Hackathon submission

- **Project:** SparkLocal, a community action studio powered by open-weight Gemma.
- **Real-world value:** Helps neighbors scope and coordinate a practical first response to a local issue.
- **Innovation:** Combines structured Gemma planning with an openly shared, participatory project board.
- **Why open innovation matters:** People can inspect, adapt, contribute to, and locally run the tool; community knowledge improves the plan beyond what a closed model can infer.
- **Collaboration:** See [`CONTRIBUTING.md`](CONTRIBUTING.md), the [Code of Conduct](CODE_OF_CONDUCT.md), and issue/PR templates under `.github/`.
- **Demo video:** Follow [`docs/demo-script.md`](docs/demo-script.md) to record a concise walkthrough.
- **Presentation:** Generate `docs/SparkLocal-Hackathon-Deck.pptx` with `npm run build:deck`. A written outline is in [`docs/deck-outline.md`](docs/deck-outline.md).
- **Setup guide:** The local run and Gemma sections above are the complete setup guide.
- **Open source:** [MIT License](LICENSE). Gemma weights and any hosted provider remain subject to their own terms.

## Project map

```text
app.js                 Express API, validation, Gemma providers, board store
server.js              HTTP server entry point
public/                Responsive browser app
test/smoke.test.js     API and static page smoke tests
docs/                  Demo script and presentation material
scripts/create-deck.js PowerPoint generator
render.yaml            Render Blueprint starting point
```

## License

This project is released under the MIT License. See [`LICENSE`](LICENSE). The Gemma model is a separate dependency and is not relicensed by this project.