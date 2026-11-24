// Alien Field Notes: The Two Day Earth Review — make.fun entry (program/v1).
//
// The entry is exactly ONE line of plain text (1-200 characters): a review
// of planet Earth left by an alien tourist. A judge model compares lines
// pairwise and weighs, in order: (1) it reads as an alien tourist's
// one-line review of Earth, (2) funniness from the alien's angle on
// ordinary Earth life, (3) originality, (4) it sounds like a real review
// (verdict / rating / closing remark), (5) tightness, punch at the end.
//
// This program scores a shortlist of candidate reviews against the
// judge's brief in that priority order and writes the winner — no
// trailing newline — to /output/entry.txt.
//
// Deterministic: no network, no model calls, no randomness, no clock.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Candidate = {
  text: string;
  alien: number; // 1-5: reads as an alien tourist's review of Earth
  funny: number; // 1-5: laugh comes from the alien's angle on ordinary life
  original: number; // 1-5: a detail few other entrants would reach
  review: number; // 1-5: sounds like a real review (rating, verdict, close)
  tight: number; // 1-5: every word earns its place, punch lands at the end
};

// The shortlist, brainstormed against the brief. Scoring notes:
// - The winner (#1) turns one specific Earth habit — locals paying to
//   watch other locals eat (mukbang / food streams) — into the alien's
//   whole report: a rating, a deadpan observation, and a closing remark
//   ("I stayed for dessert") that only a tourist would write. One joke,
//   landed cleanly, punch at the end. Not traffic, gravity, money or
//   weather — the brief names those as the first obvious thoughts.
// - #2 stacks two jokes (furniture apologies + queueing), which the brief
//   says is weaker than one clean landing; still strong on the alien angle.
// - #3 and #8 lean on gravity / queues — the obvious thoughts the brief
//   warns against, so they lose on originality even when funny.
// - #5 and #6 are funny but drift: #5 is a joke about democracy bolted
//   onto the premise, #6 is a complaint about bottled water that any
//   human tourist could have written (weak alien angle).
// - #7 and #10 are true observations but the punch is thin: a review
//   that only reports, without a turn, loses pairwise to one that turns.
const CANDIDATES: Candidate[] = [
  {
    text: "Five stars. Earth is the only planet where the locals pay to watch other locals eat. I stayed for dessert.",
    alien: 5, funny: 5, original: 5, review: 5, tight: 5,
  },
  {
    text: "Four stars. The locals apologise to furniture, queue for fun, and call it a holiday. Would orbit again.",
    alien: 5, funny: 4, original: 4, review: 5, tight: 4,
  },
  {
    text: "Visited Earth. The gravity is fine. The small talk is the real crushing force. 3 stars.",
    alien: 4, funny: 4, original: 2, review: 4, tight: 4,
  },
  {
    text: "Gave Earth 4 stars. Docked one because the checkout line moves slower than my home planet's orbit.",
    alien: 4, funny: 4, original: 3, review: 5, tight: 4,
  },
  {
    text: "Beautiful planet, terrible customer service. I asked for the manager and the locals elected him. 3 stars.",
    alien: 3, funny: 4, original: 4, review: 4, tight: 4,
  },
  {
    text: "Five stars for the sunsets. Minus one because the locals keep bottling the ocean and selling it back to me.",
    alien: 4, funny: 3, original: 3, review: 5, tight: 4,
  },
  {
    text: "Earth: great food, but every meal ends with someone asking me to rate the meal. 4 stars.",
    alien: 3, funny: 3, original: 3, review: 5, tight: 4,
  },
  {
    text: "Lovely planet. The locals invented a queue for everything, including the queue. Would visit again.",
    alien: 4, funny: 4, original: 2, review: 5, tight: 4,
  },
  {
    text: "Four stars. The tour guide said 'free Wi-Fi'. It was neither free nor Wi-Fi. Still, the sunsets.",
    alien: 3, funny: 4, original: 3, review: 4, tight: 3,
  },
  {
    text: "Earth gets 4 stars. The locals pay to watch strangers eat, then complain there's nothing to watch.",
    alien: 4, funny: 4, original: 4, review: 4, tight: 3,
  },
  {
    text: "Five stars. The locals wave at cameras they cannot see, then wave at the sky in case I'm up there. Adorable.",
    alien: 5, funny: 4, original: 4, review: 3, tight: 3,
  },
  {
    text: "Visited Earth. The locals call their weather app a liar every morning, then check it again. Four stars.",
    alien: 4, funny: 3, original: 2, review: 4, tight: 4,
  },
];

// Score in the brief's own order: alien, then funny, then original, then
// real-review, then tight. Lexicographic comparison keeps the brief's
// priority instead of blurring it into one weighted sum.
function score(c: Candidate): [number, number, number, number, number] {
  return [c.alien, c.funny, c.original, c.review, c.tight];
}

function better(a: Candidate, b: Candidate): boolean {
  const sa = score(a);
  const sb = score(b);
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) return sa[i] > sb[i];
  }
  return false; // exact tie: keep the earlier candidate (stable order)
}

let best = CANDIDATES[0];
for (const c of CANDIDATES.slice(1)) {
  if (better(c, best)) best = c;
}

const entry = best.text;

// Gate self-check: the entry must be 1-200 characters, not only whitespace,
// and a single line — the task asks for one line, so an embedded newline
// would break the premise even inside the char gate.
if (
  entry.length < 1 ||
  entry.length > 200 ||
  !/\S/.test(entry) ||
  entry.includes("\n")
) {
  throw new Error(`entry fails the 1-200 char single-line gate: ${entry.length} chars`);
}

const outDir = process.env.OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
// Exactly the entry text, no trailing newline: the gate counts every
// character, so a newline would add one.
writeFileSync(`${outDir}/entry.txt`, entry, "utf8");

// Read it back and re-check: the file the grader gates must be the
// entry alone, nothing else.
const written = readFileSync(`${outDir}/entry.txt`, "utf8");
if (written !== entry) {
  throw new Error(
    `entry.txt mismatch: wrote ${JSON.stringify(entry)}, read back ${JSON.stringify(written)}`,
  );
}

console.log(`entry (${entry.length} chars): ${entry}`);
