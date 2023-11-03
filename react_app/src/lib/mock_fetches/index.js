// mock fetches for react development (the webserver isn't booted while it's up)
// use this instead of lib/fetches. Every function in lib/fetches should have a
// comparaable function in this file that provides a mocked version.
export async function getExercises() {
  return [{ id: 1, name: "exercise #1" }];
}
