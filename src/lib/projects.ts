export type ProjectId = string;

export type Project = {
  id: ProjectId;
  name: string;
  createdAt: Date;
};

import { dbCreateProject, dbGetProjects } from "@/lib/db-finance";

export async function getProjects(): Promise<Project[]> {
  return dbGetProjects();
}

export async function createProject(name: string): Promise<Project> {
  return dbCreateProject(name);
}

// Note: `getProjectById` is currently unused; add DB lookup when needed.
