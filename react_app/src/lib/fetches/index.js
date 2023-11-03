export async function getExercises() {
  return await fetch("/exercises").then((r) => r.json());
}
