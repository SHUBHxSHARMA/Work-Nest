export const EXAMPLE_PROJECT_ID = "11111111-1111-1111-1111-111111111111";

export function isExampleProject(project) {
  return project?.id === EXAMPLE_PROJECT_ID;
}
