/**
 * TEMPORARY notional data for the Live Wall.
 *
 * DELETE THIS FILE and the `USE_MOCK_WALL_DATA` block in
 * `ConnectionWall.tsx` (search for "MOCK") to go back to live backend data.
 *
 * Archetypes are guessed from each person's role: Experiences -> VISIONARY,
 * MMD / design / media / marketing -> DESIGNER, dev -> ARCHITECT,
 * internal / finance -> LOGICIAN, partnerships / exec -> STRATEGIST.
 * `name` is the first name only, which is all the wall ever displays.
 */

import type { Archetype } from "./archetypes";

export const USE_MOCK_WALL_DATA = true;

type MockNode = { id: string; name: string; archetype: Archetype };
type MockLink = { source: string; target: string; createdAt: number };

export const MOCK_PEOPLE: MockNode[] = [
  { id: "p01", name: "Kash", archetype: "STRATEGIST" }, // Kash Ugoji — PART
  { id: "p02", name: "Keanan", archetype: "STRATEGIST" }, // Keanan Wongso — PART
  { id: "p03", name: "Chris", archetype: "STRATEGIST" }, // Chris Lee — EXEC
  { id: "p04", name: "Jimmy", archetype: "STRATEGIST" }, // Jimmy Sam — PART
  { id: "p05", name: "Karen", archetype: "STRATEGIST" }, // Karen Siem — PART
  { id: "p06", name: "Darius", archetype: "ARCHITECT" }, // Darius Alexander — DEV
  { id: "p07", name: "John", archetype: "VISIONARY" }, // John Grey — EXP
  { id: "p08", name: "Jade", archetype: "VISIONARY" }, // Jade Tao — EXP
  { id: "p09", name: "Allison", archetype: "STRATEGIST" }, // Allison Tao — PART
  { id: "p10", name: "Michele", archetype: "VISIONARY" }, // Michele Cavezza — EXP
  { id: "p11", name: "Daniel", archetype: "VISIONARY" }, // Daniel Zhang — EXP
  { id: "p12", name: "Jay", archetype: "VISIONARY" }, // Jay Park — EXP
  { id: "p13", name: "Elijah", archetype: "ARCHITECT" }, // Elijah Zhao — DEV
  { id: "p14", name: "Rohan", archetype: "LOGICIAN" }, // Rohan — INT
  { id: "p15", name: "Evan", archetype: "VISIONARY" }, // Evan Peng — EXP
  { id: "p16", name: "Sophie", archetype: "DESIGNER" }, // Sophie Lee — MMD
  { id: "p17", name: "Samantha", archetype: "VISIONARY" }, // Samantha Ng — EXP
  { id: "p18", name: "Freya", archetype: "VISIONARY" }, // Freya Darmadji — EXP
  { id: "p19", name: "Julianna", archetype: "VISIONARY" }, // Julianna Huang — EXP
  { id: "p20", name: "Stephanie", archetype: "DESIGNER" }, // Stephanie Lee — MMD
  { id: "p21", name: "Kevin", archetype: "ARCHITECT" }, // Kevin Xiao — DEV
  { id: "p22", name: "Brittany", archetype: "DESIGNER" }, // Brittany Tsui — MMD
  { id: "p23", name: "Dhrishty", archetype: "DESIGNER" }, // Dhrishty Dhanwani — MMD
  { id: "p24", name: "Kailey", archetype: "LOGICIAN" }, // Kailey Nguyen — INT
  { id: "p25", name: "Jack", archetype: "STRATEGIST" }, // Jack Shaw — PART
  { id: "p26", name: "Pauline", archetype: "VISIONARY" }, // Pauline Ongchan — EXP
  { id: "p27", name: "Daisy", archetype: "DESIGNER" }, // Daisy Han — MMD
  { id: "p28", name: "Timothy", archetype: "ARCHITECT" }, // Timothy Mai — DEV
  { id: "p29", name: "Eliana", archetype: "DESIGNER" }, // Eliana Barbosa — MMD
  { id: "p30", name: "Helen", archetype: "LOGICIAN" }, // Helen Meng — INT
  { id: "p31", name: "Maddisen", archetype: "STRATEGIST" }, // Maddisen Ching — PART
  { id: "p32", name: "Daniel", archetype: "ARCHITECT" }, // Daniel Zhou — DEV
  { id: "p33", name: "Shun", archetype: "ARCHITECT" }, // Shun Akiyama — DEV
  { id: "p34", name: "Tiger", archetype: "DESIGNER" }, // Tiger Du — MMD
  { id: "p35", name: "Emma", archetype: "DESIGNER" }, // Emma Lin — MMD
  { id: "p36", name: "Jerry", archetype: "DESIGNER" }, // Jerry Nguyen — MMD
  { id: "p37", name: "Thomas", archetype: "ARCHITECT" }, // Thomas Ah Sing — DEV
  { id: "p38", name: "Hannah", archetype: "LOGICIAN" }, // Hannah Azad Manjiri — INT
  { id: "p39", name: "Angela", archetype: "DESIGNER" }, // Angela Huang — MMD
  { id: "p40", name: "Lucas", archetype: "STRATEGIST" }, // Lucas Gingera — EXEC
  { id: "p41", name: "Marcus", archetype: "LOGICIAN" }, // Marcus Kam — INT
  { id: "p42", name: "Ali", archetype: "DESIGNER" }, // Ali Hosseini — MMD
  { id: "p43", name: "Stella", archetype: "STRATEGIST" }, // Stella Han — PART
  { id: "p44", name: "Isaac", archetype: "ARCHITECT" }, // Isaac Liu — DEV
  { id: "p45", name: "Charley", archetype: "DESIGNER" }, // Charley Ng — MMD
  { id: "p46", name: "Yumin", archetype: "DESIGNER" }, // Yumin Chang — MMD
  { id: "p47", name: "Grace", archetype: "STRATEGIST" }, // Grace Co — EXEC
  { id: "p48", name: "Emmy", archetype: "DESIGNER" }, // Emmy Wang — MMD
];

/**
 * 72 connections across 48 people — mean degree 3.0, range 1 to 9.
 * Weighted toward same-team pairs, seeded from a spanning tree so the wall
 * stays a single component with no fragments drifting off.
 */
const PAIRS: [string, string][] = [
  ["p03", "p41"],
  ["p23", "p48"],
  ["p01", "p29"],
  ["p08", "p19"],
  ["p27", "p48"],
  ["p35", "p40"],
  ["p14", "p36"],
  ["p05", "p19"],
  ["p12", "p26"],
  ["p17", "p18"],
  ["p23", "p34"],
  ["p06", "p21"],
  ["p32", "p44"],
  ["p03", "p14"],
  ["p23", "p46"],
  ["p15", "p17"],
  ["p36", "p48"],
  ["p21", "p44"],
  ["p14", "p44"],
  ["p28", "p35"],
  ["p30", "p38"],
  ["p05", "p09"],
  ["p23", "p36"],
  ["p12", "p42"],
  ["p11", "p19"],
  ["p10", "p13"],
  ["p20", "p45"],
  ["p07", "p30"],
  ["p03", "p44"],
  ["p13", "p37"],
  ["p32", "p33"],
  ["p04", "p31"],
  ["p21", "p32"],
  ["p27", "p36"],
  ["p09", "p32"],
  ["p30", "p31"],
  ["p05", "p25"],
  ["p10", "p22"],
  ["p11", "p12"],
  ["p03", "p21"],
  ["p40", "p47"],
  ["p33", "p44"],
  ["p20", "p30"],
  ["p02", "p38"],
  ["p13", "p16"],
  ["p04", "p39"],
  ["p03", "p13"],
  ["p03", "p23"],
  ["p24", "p25"],
  ["p07", "p12"],
  ["p03", "p40"],
  ["p04", "p43"],
  ["p04", "p30"],
  ["p23", "p45"],
  ["p32", "p47"],
  ["p03", "p47"],
  ["p21", "p40"],
  ["p14", "p40"],
  ["p41", "p43"],
  ["p26", "p29"],
  ["p32", "p37"],
  ["p05", "p31"],
  ["p03", "p09"],
  ["p21", "p22"],
  ["p20", "p36"],
  ["p18", "p43"],
  ["p04", "p05"],
  ["p06", "p47"],
  ["p04", "p25"],
  ["p08", "p24"],
  ["p14", "p38"],
  ["p15", "p28"],
];

/** Spread the connections over the last ~3 hours, newest last. */
export function getMockSnapshot(): { nodes: MockNode[]; links: MockLink[] } {
  const now = Date.now();
  const span = 3 * 60 * 60_000;
  const step = span / Math.max(1, PAIRS.length - 1);
  return {
    nodes: MOCK_PEOPLE,
    links: PAIRS.map(([source, target], i) => ({
      source,
      target,
      createdAt: Math.round(now - (PAIRS.length - 1 - i) * step),
    })),
  };
}
