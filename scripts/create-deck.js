import pptxgen from 'pptxgenjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const output = path.join(root, 'docs', 'SparkLocal-Hackathon-Deck.pptx');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'SparkLocal contributors';
pptx.subject = 'Hackathon submission: open-weight Gemma for community-led action';
pptx.title = 'SparkLocal';
pptx.company = 'SparkLocal';
pptx.lang = 'en-US';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'en-US',
};

const C = { paper: 'F6F4EE', ink: '202820', muted: '6D746A', green: '355D43', greenDark: '254833', pale: 'E4EDE3', coral: 'C65A42', yellow: 'E8BA53', white: 'FFFEFA', line: 'DEDDD3' };

function addBase(slide, number, dark = false) {
  const bg = dark ? C.greenDark : C.paper;
  const fg = dark ? C.white : C.ink;
  slide.background = { color: bg };
  slide.addText('SPARKLOCAL', { x: 0.6, y: 0.35, w: 2.2, h: 0.25, fontFace: 'Aptos', fontSize: 10, bold: true, charSpacing: 1.5, color: dark ? 'C9D8C8' : C.green, margin: 0 });
  slide.addText(String(number).padStart(2, '0'), { x: 12.1, y: 7.05, w: 0.55, h: 0.22, fontSize: 10, color: dark ? 'C9D8C8' : C.muted, align: 'right', margin: 0 });
  slide.addShape(pptx.ShapeType.line, { x: 0.6, y: 6.93, w: 12.1, h: 0, line: { color: dark ? '57735D' : C.line, width: 0.7 } });
  return { bg, fg };
}

function addTitle(slide, eyebrow, title, opts = {}) {
  const x = opts.x ?? 0.8;
  const y = opts.y ?? 1.05;
  const color = opts.color ?? C.ink;
  slide.addText(eyebrow.toUpperCase(), { x, y, w: 6.7, h: 0.28, fontSize: 10, bold: true, charSpacing: 1.5, color: opts.eyebrowColor ?? C.green, margin: 0 });
  slide.addText(title, { x, y: y + 0.4, w: opts.w ?? 11.6, h: opts.h ?? 1.1, fontFace: 'Aptos Display', fontSize: opts.fontSize ?? 31, bold: true, breakLine: false, color, margin: 0, valign: 'mid', fit: 'shrink' });
}

function addBulletList(slide, items, x, y, w, opts = {}) {
  const text = items.map((item) => ({ text: item, options: { bullet: { indent: 13 }, hanging: 3, breakLine: true } }));
  slide.addText(text, { x, y, w, h: opts.h ?? 2.6, fontSize: opts.fontSize ?? 17, color: opts.color ?? C.ink, paraSpaceAfterPt: 12, breakLine: false, margin: 0.04, valign: 'top', fit: 'shrink' });
}

{
  const slide = pptx.addSlide();
  addBase(slide, 1, true);
  slide.addShape(pptx.ShapeType.rect, { x: 9.3, y: 0, w: 4.03, h: 7.5, line: { color: C.coral, transparency: 100 }, fill: { color: C.coral } });
  slide.addShape(pptx.ShapeType.ellipse, { x: 9.85, y: 1.05, w: 2.15, h: 2.15, line: { color: C.yellow, transparency: 100 }, fill: { color: C.yellow } });
  slide.addText('S', { x: 10.36, y: 1.26, w: 1.13, h: 1.54, fontFace: 'Aptos Display', fontSize: 72, bold: true, color: C.greenDark, align: 'center', valign: 'mid', margin: 0 });
  slide.addText('HACKATHON PROJECT', { x: 0.8, y: 1.65, w: 4, h: 0.32, fontSize: 11, bold: true, charSpacing: 2, color: 'C9D8C8', margin: 0 });
  slide.addText('Good ideas\nget local.', { x: 0.8, y: 2.15, w: 7.9, h: 2.2, fontFace: 'Aptos Display', fontSize: 49, bold: true, color: C.white, breakLine: false, margin: 0, fit: 'shrink' });
  slide.addText('A community action studio powered by open-weight Gemma.', { x: 0.85, y: 4.7, w: 7.2, h: 0.8, fontSize: 19, color: 'E2E9DF', margin: 0, fit: 'shrink' });
  slide.addText('SparkLocal', { x: 9.72, y: 4.15, w: 3, h: 0.5, fontFace: 'Aptos Display', fontSize: 25, bold: true, color: C.white, align: 'center', margin: 0 });
  slide.addText('Neighbors shape what comes next.', { x: 9.65, y: 4.75, w: 3.2, h: 0.55, fontSize: 12, color: C.white, align: 'center', margin: 0, fit: 'shrink' });
}

{
  const slide = pptx.addSlide();
  addBase(slide, 2);
  addTitle(slide, 'The gap', 'Local problems are clear. A first step often is not.');
  const cards = [
    ['01', 'Good intentions stall', 'A concern is hard to turn into a small, realistic action.'],
    ['02', 'Roles stay fuzzy', 'People want to help but do not know what to take on.'],
    ['03', 'Learning gets lost', 'Communities need a simple way to share progress and adapt.'],
  ];
  cards.forEach(([n, title, body], i) => {
    const x = 0.8 + i * 4.12;
    slide.addShape(pptx.ShapeType.rect, { x, y: 3.1, w: 3.75, h: 2.25, line: { color: C.line, width: 1 }, fill: { color: C.white } });
    slide.addText(n, { x: x + 0.2, y: 3.33, w: 0.5, h: 0.25, fontSize: 11, bold: true, color: C.coral, margin: 0 });
    slide.addText(title, { x: x + 0.2, y: 3.8, w: 3.3, h: 0.4, fontFace: 'Aptos Display', fontSize: 20, bold: true, color: C.ink, margin: 0, fit: 'shrink' });
    slide.addText(body, { x: x + 0.2, y: 4.35, w: 3.25, h: 0.72, fontSize: 13, color: C.muted, margin: 0, fit: 'shrink' });
  });
  slide.addText('SparkLocal makes the early work visible and shareable.', { x: 0.8, y: 5.85, w: 10.5, h: 0.4, fontSize: 17, bold: true, color: C.green, margin: 0 });
}

{
  const slide = pptx.addSlide();
  addBase(slide, 3, true);
  addTitle(slide, 'From concern to collaboration', 'One local challenge. A plan the community can shape.', { color: C.white, eyebrowColor: C.yellow });
  const steps = [
    ['01', 'Describe', 'Challenge, time, resources, people'],
    ['02', 'Plan with Gemma', 'Actions, roles, supplies, outcomes, risks'],
    ['03', 'Share', 'Publish an open community brief'],
    ['04', 'Join & learn', 'Build participation and adapt'],
  ];
  steps.forEach(([n, title, body], i) => {
    const x = 0.8 + i * 3.1;
    slide.addShape(pptx.ShapeType.ellipse, { x, y: 3.5, w: 0.52, h: 0.52, line: { color: i === 1 ? C.yellow : 'A9C0AA', width: 1.5 }, fill: { color: i === 1 ? C.yellow : C.greenDark } });
    slide.addText(n, { x, y: 3.64, w: 0.52, h: 0.2, fontSize: 10, bold: true, color: i === 1 ? C.greenDark : C.white, align: 'center', margin: 0 });
    if (i < steps.length - 1) slide.addShape(pptx.ShapeType.line, { x: x + 0.55, y: 3.76, w: 2.35, h: 0, line: { color: '78937B', width: 1.2, endArrowType: 'triangle' } });
    slide.addText(title, { x, y: 4.32, w: 2.55, h: 0.38, fontFace: 'Aptos Display', fontSize: 18, bold: true, color: C.white, margin: 0, fit: 'shrink' });
    slide.addText(body, { x, y: 4.86, w: 2.55, h: 0.65, fontSize: 12, color: 'D6E0D3', margin: 0, fit: 'shrink' });
  });
  slide.addText('The AI offers a starting point. Neighbors decide what happens.', { x: 0.8, y: 6.05, w: 10.7, h: 0.35, fontSize: 16, bold: true, color: C.yellow, margin: 0 });
}

{
  const slide = pptx.addSlide();
  addBase(slide, 4);
  addTitle(slide, 'Gemma is central to the product', 'Open-weight AI turns context into an actionable draft.');
  addBulletList(slide, [
    'Structures a local challenge into steps, volunteer roles, supplies, impact measures, and risks.',
    'Local Ollama path gives teams control over where inference runs.',
    'Hugging Face path offers hosted Gemma inference with server-side credentials.',
    'A clearly labeled demo mode keeps the experience testable without pretending to be live AI.',
  ], 1.0, 3.05, 7.1, { h: 2.8, fontSize: 16 });
  slide.addShape(pptx.ShapeType.rect, { x: 8.65, y: 2.75, w: 3.5, h: 2.7, line: { color: C.line, width: 1 }, fill: { color: C.greenDark } });
  slide.addText('OPEN WEIGHTS\nLOCAL CHOICE\nCOMMUNITY REVIEW', { x: 8.95, y: 3.28, w: 2.9, h: 1.65, fontFace: 'Aptos Display', fontSize: 18, bold: true, color: C.white, breakLine: false, paraSpaceAfterPt: 10, align: 'center', valign: 'mid', margin: 0, fit: 'shrink' });
  slide.addText('Model weights are separate and follow Gemma terms.', { x: 8.7, y: 5.65, w: 3.4, h: 0.4, fontSize: 10, color: C.muted, align: 'center', margin: 0, fit: 'shrink' });
}

{
  const slide = pptx.addSlide();
  addBase(slide, 5);
  addTitle(slide, 'Why open innovation matters', 'Local knowledge is distributed. So should the tools be.');
  const items = [
    ['INSPECT', 'See how the planner and board work.'],
    ['ADAPT', 'Change prompts and workflows to fit a place.'],
    ['CONTRIBUTE', 'Bring local experience, skills, tests, and translations.'],
    ['OWN THE CHOICE', 'Run open-weight Gemma on infrastructure you control.'],
  ];
  items.forEach(([label, body], i) => {
    const y = 2.65 + i * 0.85;
    slide.addShape(pptx.ShapeType.rect, { x: 0.9, y: y + 0.02, w: 1.45, h: 0.42, line: { color: C.pale, transparency: 100 }, fill: { color: C.pale } });
    slide.addText(label, { x: 1.0, y: y + 0.12, w: 1.24, h: 0.17, fontSize: 9, bold: true, charSpacing: 1, color: C.green, align: 'center', margin: 0, fit: 'shrink' });
    slide.addText(body, { x: 2.7, y, w: 8.3, h: 0.47, fontSize: 16, color: C.ink, margin: 0, fit: 'shrink' });
  });
  slide.addText('Open innovation invites shared ownership; it does not remove responsibility.', { x: 0.9, y: 6.25, w: 10.8, h: 0.35, fontSize: 15, bold: true, color: C.coral, margin: 0 });
}

{
  const slide = pptx.addSlide();
  addBase(slide, 6, true);
  addTitle(slide, 'Real-world value, with guardrails', 'Start small. Measure what matters. Keep people in charge.', { color: C.white, eyebrowColor: C.yellow });
  addBulletList(slide, [
    'Grounded first steps for shared neighborhood challenges.',
    'Simple measures help groups learn and decide what to try next.',
    'Prompt for context, not personal data; avoid invented services or statistics.',
    'Community review is essential. AI is not professional or emergency advice.',
  ], 0.95, 3.05, 7.25, { h: 2.9, fontSize: 15, color: C.white });
  slide.addShape(pptx.ShapeType.rect, { x: 9.05, y: 3.2, w: 2.8, h: 2.15, line: { color: C.coral, transparency: 100 }, fill: { color: C.coral } });
  slide.addText('SMALL\nSTEPS', { x: 9.35, y: 3.57, w: 2.2, h: 1.25, fontFace: 'Aptos Display', fontSize: 29, bold: true, color: C.white, align: 'center', valign: 'mid', breakLine: false, margin: 0, fit: 'shrink' });
}

{
  const slide = pptx.addSlide();
  addBase(slide, 7);
  addTitle(slide, 'Built to work together', 'A usable project, an open invitation to contribute.');
  const columns = [
    ['TRY IT', 'Working planner\nShared community board\nSearch, filters, join, support'],
    ['BUILD ON IT', 'MIT licensed source\nSetup and deployment guide\nContribution guide and conduct'],
    ['SHOW THE WORK', 'Short demo video script\nEditable PowerPoint deck\nAutomated smoke tests'],
  ];
  columns.forEach(([title, body], i) => {
    const x = 0.85 + i * 4.1;
    slide.addText(title, { x, y: 3.1, w: 3.4, h: 0.25, fontSize: 10, bold: true, charSpacing: 1.5, color: C.coral, margin: 0 });
    slide.addText(body, { x, y: 3.58, w: 3.45, h: 1.8, fontFace: 'Aptos Display', fontSize: 19, bold: true, color: C.ink, breakLine: false, paraSpaceAfterPt: 11, margin: 0, fit: 'shrink' });
  });
  slide.addShape(pptx.ShapeType.rect, { x: 0.85, y: 5.75, w: 11.6, h: 0.58, line: { color: C.pale, transparency: 100 }, fill: { color: C.pale } });
  slide.addText('Open source is an invitation: improve it, localize it, and share what your community learns.', { x: 1.05, y: 5.92, w: 11.2, h: 0.24, fontSize: 14, bold: true, color: C.greenDark, align: 'center', margin: 0, fit: 'shrink' });
}

{
  const slide = pptx.addSlide();
  addBase(slide, 8, true);
  addTitle(slide, 'Make the next step possible', 'A local concern can become a shared project.', { color: C.white, eyebrowColor: C.yellow });
  slide.addText('SparkLocal', { x: 0.9, y: 3.2, w: 7.8, h: 0.82, fontFace: 'Aptos Display', fontSize: 41, bold: true, color: C.white, margin: 0 });
  slide.addText('GitHub repository: add your published repository URL\nLive app: add your verified deployment URL\nDemo video: record with docs/demo-script.md', { x: 0.95, y: 4.45, w: 8.2, h: 1.25, fontSize: 16, color: 'DFE8DD', breakLine: false, paraSpaceAfterPt: 8, margin: 0, fit: 'shrink' });
  slide.addShape(pptx.ShapeType.ellipse, { x: 10.0, y: 3.1, w: 1.3, h: 1.3, line: { color: C.yellow, transparency: 100 }, fill: { color: C.yellow } });
  slide.addText('S', { x: 10.19, y: 3.22, w: 0.92, h: 0.95, fontFace: 'Aptos Display', fontSize: 52, bold: true, color: C.greenDark, align: 'center', valign: 'mid', margin: 0 });
  slide.addText('Start small. Share openly.', { x: 9.35, y: 4.65, w: 2.65, h: 0.7, fontSize: 15, bold: true, color: C.yellow, align: 'center', margin: 0, fit: 'shrink' });
}

await pptx.writeFile({ fileName: output });
console.log(`Created ${path.relative(root, output)}`);