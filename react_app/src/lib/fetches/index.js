export async function getExercises() {
  return await fetch("/exercises").then((r) => r.json());
}

export async function getLog() {
  return await fetch("/log").then((r) => r.json());
}
