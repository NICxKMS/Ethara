export function makeId(seed: number): string {
  return `00000000-0000-4000-8000-${seed.toString().padStart(12, "0")}`;
}
