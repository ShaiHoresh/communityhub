export type ProjectId = string;

export type Project = {
  id: ProjectId;
  name: string;
  createdAt: Date;
};

const projects: Project[] = [];

export function getProjects(): Project[] {
  return [...projects];
}

export function createProject(name: string): Project {
  const project: Project = {
    id: `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    createdAt: new Date(),
  };
  projects.push(project);
  return project;
}

export function getProjectById(id: ProjectId): Project | undefined {
  return projects.find((p) => p.id === id);
}
