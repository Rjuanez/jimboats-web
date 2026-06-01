import type { Experience } from "../../domain/Experience";

export type ExperienceRepository = {
  findById(id: string): Promise<Experience | null>;
  list(): Promise<Experience[]>;
  save(experience: Experience): Promise<void>;
};
