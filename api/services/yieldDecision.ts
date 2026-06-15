import type { TrackSection, Train, YieldDecision } from "../../shared/types.js";
import { SectionOccupationService } from "./sectionOccupation.js";

export class YieldDecisionService {
  private sectionService: SectionOccupationService;

  constructor(sectionService: SectionOccupationService) {
    this.sectionService = sectionService;
  }

  prepareYieldForPlace(
    placedTrainId: string,
    targetSectionId: string
  ): { yields: YieldDecision[]; cannotPass: string[]; canPlace: boolean; blockReason?: string } {
    const yields: YieldDecision[] = [];
    const cannotPass: string[] = [];

    const placedTrain = this.sectionService.getTrain(placedTrainId);
    if (!placedTrain) return { yields, cannotPass, canPlace: false, blockReason: `列车 ${placedTrainId} 不存在` };

    if (this.sectionService.findTrainSection(placedTrainId)) {
      return { yields, cannotPass, canPlace: false, blockReason: `列车 ${placedTrainId} 已在站场中` };
    }

    const targetSection = this.sectionService.getSection(targetSectionId);
    if (!targetSection) {
      return { yields, cannotPass, canPlace: false, blockReason: `区段 ${targetSectionId} 不存在` };
    }

    if (targetSectionId === "main" && targetSection.occupiedBy) {
      return this.evaluateMainLineYield(placedTrain, targetSection.occupiedBy);
    }

    if (targetSection.occupiedBy) {
      return { yields, cannotPass, canPlace: false, blockReason: `区段 ${targetSection.name} 已被列车 ${targetSection.occupiedBy} 占用` };
    }

    return { yields, cannotPass, canPlace: true };
  }

  private evaluateMainLineYield(
    placedTrain: Train,
    currentMainTrainId: string
  ): { yields: YieldDecision[]; cannotPass: string[]; canPlace: boolean; blockReason?: string } {
    const yields: YieldDecision[] = [];
    const cannotPass: string[] = [];
    const sections = this.sectionService.getSections();

    const mainTrain = this.sectionService.getTrain(currentMainTrainId);
    if (!mainTrain) return { yields, cannotPass, canPlace: false, blockReason: "正线列车信息不存在" };

    if (placedTrain.priority > mainTrain.priority) {
      const freeSiding = this.findFreeSiding(sections);
      if (freeSiding) {
        const result = this.sectionService.moveTrain(mainTrain.id, freeSiding.id);
        if (result.success) {
          yields.push({
            trainId: mainTrain.id,
            fromSection: "main",
            toSection: freeSiding.id,
            reason: `${mainTrain.name}（优先级 ${mainTrain.priority}）低于 ${placedTrain.name}（优先级 ${placedTrain.priority}），让行至${freeSiding.name}`,
          });
          return { yields, cannotPass, canPlace: true };
        }
        return { yields, cannotPass, canPlace: false, blockReason: "让行移动失败" };
      } else {
        cannotPass.push(mainTrain.id);
        yields.push({
          trainId: mainTrain.id,
          fromSection: "main",
          toSection: null,
          reason: `${mainTrain.name}（优先级 ${mainTrain.priority}）低于 ${placedTrain.name}（优先级 ${placedTrain.priority}），但侧线已满，无法会让`,
        });
        return { yields, cannotPass, canPlace: false, blockReason: `侧线已满，${mainTrain.name} 无法会让` };
      }
    }

    return { yields, cannotPass, canPlace: false, blockReason: `正线已被更高/同等优先级的 ${mainTrain.name} 占用` };
  }

  private findFreeSiding(sections: TrackSection[]): TrackSection | null {
    const siding1 = sections.find((s) => s.id === "siding-1")!;
    const siding2 = sections.find((s) => s.id === "siding-2")!;

    if (!siding1.occupiedBy) return siding1;
    if (!siding2.occupiedBy) return siding2;
    return null;
  }

  evaluateYieldOnRemove(
    removedTrainId: string,
    _fromSectionId: string
  ): { yields: YieldDecision[]; cannotPass: string[] } {
    const yields: YieldDecision[] = [];
    const cannotPass: string[] = [];

    const sections = this.sectionService.getSections();
    const sidingTrains: { trainId: string; fromSection: string }[] = [];

    for (const section of sections) {
      if (section.id.startsWith("siding-") && section.occupiedBy) {
        sidingTrains.push({ trainId: section.occupiedBy, fromSection: section.id });
      }
    }

    const sortedSidingTrains = sidingTrains.sort((a, b) => {
      const trainA = this.sectionService.getTrain(a.trainId);
      const trainB = this.sectionService.getTrain(b.trainId);
      return (trainB?.priority ?? 0) - (trainA?.priority ?? 0);
    });

    const mainSection = sections.find((s) => s.id === "main")!;
    if (!mainSection.occupiedBy) {
      for (const st of sortedSidingTrains) {
        const train = this.sectionService.getTrain(st.trainId);
        if (!train) continue;

        const result = this.sectionService.moveTrain(st.trainId, "main");
        if (result.success) {
          const fromName = sections.find((s) => s.id === st.fromSection)?.name || st.fromSection;
          yields.push({
            trainId: st.trainId,
            fromSection: st.fromSection,
            toSection: "main",
            reason: `${train.name}（优先级 ${train.priority}）从${fromName}返回正线`,
          });
        }
        break;
      }
    }

    return { yields, cannotPass };
  }
}
