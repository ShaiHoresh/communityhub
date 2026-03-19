export type { DbProject as Project } from "@/lib/db-finance";

export type ProjectId = string;

import { dbCreateProject, dbGetProjects } from "@/lib/db-finance";
import type { DbProject as Project } from "@/lib/db-finance";

export async function getProjects(): Promise<Project[]> {
  return dbGetProjects();
}

export async function createProject(name: string): Promise<Project> {
  return dbCreateProject(name);
}

// Note: `getProjectById` is currently unused; add DB lookup when needed.
