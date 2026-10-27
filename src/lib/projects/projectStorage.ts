import type { ProjectFormData } from "@/components/project/ProjectSetup";

export type StoredProject = ProjectFormData & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

const PROJECTS_KEY = "maximus-projects";
const ACTIVE_PROJECT_KEY = "maximus-active-project-id";

function createId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function getProjects(): StoredProject[] {
  if (!canUseStorage()) return [];

  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];

    const projects: unknown = JSON.parse(raw);
    return Array.isArray(projects) ? projects as StoredProject[] : [];
  } catch {
    return [];
  }
}

export function getProject(id: string): StoredProject | null {
  return getProjects().find((project) => project.id === id) ?? null;
}

export function createProject(data: ProjectFormData): StoredProject {
  const now = new Date().toISOString();

  const project: StoredProject = {
    ...data,
    id: createId(),
    createdAt: now,
    updatedAt: now,
  };

  const projects = getProjects();
  projects.unshift(project);

  if (canUseStorage()) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    localStorage.setItem(ACTIVE_PROJECT_KEY, project.id);
  }

  return project;
}

export function updateProject(
  id: string,
  changes: Partial<ProjectFormData>,
): StoredProject | null {
  const projects = getProjects();
  const index = projects.findIndex((project) => project.id === id);

  if (index === -1) return null;

  const updated: StoredProject = {
    ...projects[index],
    ...changes,
    id: projects[index].id,
    createdAt: projects[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  projects[index] = updated;

  if (canUseStorage()) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }

  return updated;
}

export function getActiveProjectId(): string | null {
  if (!canUseStorage()) return null;

  return localStorage.getItem(ACTIVE_PROJECT_KEY);
}

export function setActiveProjectId(id: string): void {
  if (canUseStorage()) {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  }
}

export function saveProjectData<T>(projectId: string, key: string, data: T): void {
  if (!canUseStorage()) return;

  const storageKey = `maximus-project:${projectId}:${key}`;
  const serialize = (value: unknown) => JSON.stringify(value);

  try {
    localStorage.setItem(storageKey, serialize(data));
    return;
  } catch (error) {
    const quotaError =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED");

    if (!quotaError) throw error;

    // Jika Hero lama menyimpan Base64, coba simpan ulang tanpa salinan gambar.
    if (key === "hero-config" && data && typeof data === "object") {
      const compact = { ...(data as Record<string, unknown>) };
      const imageUrl = compact.imageUrl;

      if (typeof imageUrl === "string" && imageUrl.startsWith("data:")) {
        compact.imageUrl = "";
        try {
          localStorage.setItem(storageKey, serialize(compact));
          console.warn(
            "Hero tersimpan tanpa salinan Base64. Pilih kembali gambar dari Image Library jika diperlukan."
          );
          return;
        } catch {
          // Tetap laporkan kegagalan jika kuota masih penuh.
        }
      }
    }

    console.error(
      `Penyimpanan browser penuh saat menyimpan ${key}. Data tidak berhasil disimpan.`
    );
  }
}

export function getProjectData<T>(
  projectId: string,
  key: string,
  fallback: T,
): T {
  if (!canUseStorage()) return fallback;

  try {
    const raw = localStorage.getItem(`maximus-project:${projectId}:${key}`);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}


/**
 * Deletes a project and its project-specific localStorage data.
 */
export function deleteProject(id: string): boolean {
  if (!canUseStorage()) return false;

  const projects = getProjects();
  if (!projects.some((project) => project.id === id)) return false;

  localStorage.setItem(
    PROJECTS_KEY,
    JSON.stringify(projects.filter((project) => project.id !== id)),
  );

  const prefix = `maximus-project:${id}:`;
  const keysToRemove: string[] = [];

  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (key?.startsWith(prefix)) keysToRemove.push(key);
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));

  if (getActiveProjectId() === id) {
    localStorage.removeItem(ACTIVE_PROJECT_KEY);
  }

  return true;
}
