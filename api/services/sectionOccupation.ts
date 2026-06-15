import type { TrackSection, Train } from "../../shared/types.js";
import { SECTION_IDS, SECTION_NAMES } from "../../shared/types.js";
import type { SectionId } from "../../shared/types.js";

const INITIAL_SECTIONS: TrackSection[] = SECTION_IDS.map((id) => ({
  id,
  name: SECTION_NAMES[id],
  occupiedBy: null,
}));

export class SectionOccupationService {
  private sections: TrackSection[];
  private trains: Map<string, Train>;

  constructor(trains: Train[]) {
    this.sections = INITIAL_SECTIONS.map((s) => ({ ...s }));
    this.trains = new Map(trains.map((t) => [t.id, t]));
  }

  getSections(): TrackSection[] {
    return this.sections.map((s) => ({ ...s }));
  }

  getSection(id: string): TrackSection | undefined {
    return this.sections.find((s) => s.id === id);
  }

  isSectionOccupied(sectionId: string): boolean {
    const section = this.getSection(sectionId);
    return section?.occupiedBy !== null && section?.occupiedBy !== undefined;
  }

  findTrainSection(trainId: string): TrackSection | undefined {
    return this.sections.find((s) => s.occupiedBy === trainId);
  }

  placeTrain(trainId: string, sectionId: string): { success: boolean; message: string } {
    if (!this.trains.has(trainId)) {
      return { success: false, message: `列车 ${trainId} 不存在` };
    }

    const section = this.getSection(sectionId);
    if (!section) {
      return { success: false, message: `区段 ${sectionId} 不存在` };
    }

    if (this.findTrainSection(trainId)) {
      return { success: false, message: `列车 ${trainId} 已在站场中` };
    }

    if (section.occupiedBy) {
      return { success: false, message: `区段 ${section.name} 已被列车 ${section.occupiedBy} 占用` };
    }

    const idx = this.sections.findIndex((s) => s.id === sectionId);
    this.sections[idx] = { ...section, occupiedBy: trainId };
    return { success: true, message: `列车 ${trainId} 已放入 ${section.name}` };
  }

  removeTrain(trainId: string): { success: boolean; message: string } {
    const section = this.findTrainSection(trainId);
    if (!section) {
      return { success: false, message: `列车 ${trainId} 不在站场中` };
    }

    const idx = this.sections.findIndex((s) => s.id === section.id);
    this.sections[idx] = { ...section, occupiedBy: null };
    return { success: true, message: `列车 ${trainId} 已从 ${section.name} 移出` };
  }

  moveTrain(trainId: string, toSectionId: string): { success: boolean; message: string } {
    const currentSection = this.findTrainSection(trainId);
    if (!currentSection) {
      return { success: false, message: `列车 ${trainId} 不在站场中` };
    }

    const targetSection = this.getSection(toSectionId);
    if (!targetSection) {
      return { success: false, message: `区段 ${toSectionId} 不存在` };
    }

    if (targetSection.occupiedBy && targetSection.occupiedBy !== trainId) {
      return { success: false, message: `区段 ${targetSection.name} 已被占用` };
    }

    const currentIdx = this.sections.findIndex((s) => s.id === currentSection.id);
    this.sections[currentIdx] = { ...currentSection, occupiedBy: null };

    const targetIdx = this.sections.findIndex((s) => s.id === toSectionId);
    this.sections[targetIdx] = { ...targetSection, occupiedBy: trainId };

    return { success: true, message: `列车 ${trainId} 从 ${currentSection.name} 移至 ${targetSection.name}` };
  }

  getTrain(trainId: string): Train | undefined {
    return this.trains.get(trainId);
  }

  getAllTrains(): Train[] {
    return Array.from(this.trains.values());
  }

  loadFromSnapshot(sections: TrackSection[]): void {
    this.sections = sections.map((s) => ({ ...s }));
  }
}
