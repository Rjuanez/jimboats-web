import { domainError } from "@/shared/domain/DomainError";
import { TimeRange } from "@/shared/domain/TimeRange";

export type SlotPolicyMode =
  | "ANY_AVAILABLE"
  | "FIXED_SLOTS"
  | "MANUAL_APPROVAL";

export type FixedSlotInput = {
  enabled: boolean;
  id: string;
  label: string;
  range: TimeRange;
};

export type SlotPolicySnapshot = {
  fixedSlots: Array<{
    enabled: boolean;
    endMinutes: number;
    id: string;
    label: string;
    startMinutes: number;
  }>;
  granularityMinutes: number | null;
  mode: SlotPolicyMode;
  operatingWindow: {
    endMinutes: number;
    startMinutes: number;
  } | null;
  timeZone: string;
};

type SlotPolicyProps = {
  fixedSlots: FixedSlotInput[];
  granularityMinutes: number | null;
  mode: SlotPolicyMode;
  operatingWindow: TimeRange | null;
  timeZone: string;
};

export class SlotPolicy {
  private constructor(private readonly props: SlotPolicyProps) {}

  static fixedSlots(input: { fixedSlots: FixedSlotInput[]; timeZone: string }) {
    assertTimeZone(input.timeZone);
    const fixedSlots = input.fixedSlots.map((slot) => ({
      ...slot,
      id: slot.id.trim(),
      label: slot.label.trim(),
    }));

    if (fixedSlots.length === 0) {
      throw domainError(
        "SLOT_POLICY_INVALID",
        "Fixed slot policy requires at least one slot.",
      );
    }

    if (!fixedSlots.some((slot) => slot.enabled)) {
      throw domainError(
        "SLOT_POLICY_INVALID",
        "Fixed slot policy requires at least one enabled slot.",
      );
    }

    const slotIds = new Set<string>();

    for (const slot of fixedSlots) {
      if (!slot.id) {
        throw domainError("SLOT_POLICY_INVALID", "Slot id is required.");
      }

      if (!slot.label) {
        throw domainError("SLOT_POLICY_INVALID", "Slot label is required.");
      }

      if (slotIds.has(slot.id)) {
        throw domainError("SLOT_POLICY_INVALID", "Slot ids must be unique.");
      }

      slotIds.add(slot.id);
    }

    const policy = new SlotPolicy({
      fixedSlots,
      granularityMinutes: null,
      mode: "FIXED_SLOTS",
      operatingWindow: null,
      timeZone: input.timeZone,
    });

    if (policy.hasOverlappingEnabledSlots()) {
      throw domainError(
        "SLOT_POLICY_INVALID",
        "Enabled fixed slots cannot overlap.",
      );
    }

    return policy;
  }

  static anyAvailable(input: {
    granularityMinutes: number;
    operatingWindow: TimeRange;
    timeZone: string;
  }) {
    assertTimeZone(input.timeZone);
    assertPositiveInteger(
      input.granularityMinutes,
      "Flexible slot granularity must be positive.",
    );
    assertFlexibleWindow(input.operatingWindow, input.granularityMinutes);

    return new SlotPolicy({
      fixedSlots: [],
      granularityMinutes: input.granularityMinutes,
      mode: "ANY_AVAILABLE",
      operatingWindow: input.operatingWindow,
      timeZone: input.timeZone,
    });
  }

  static manualApproval(input: { timeZone: string }) {
    assertTimeZone(input.timeZone);

    return new SlotPolicy({
      fixedSlots: [],
      granularityMinutes: null,
      mode: "MANUAL_APPROVAL",
      operatingWindow: null,
      timeZone: input.timeZone,
    });
  }

  get mode() {
    return this.props.mode;
  }

  hasOverlappingEnabledSlots() {
    const enabledSlots = this.props.fixedSlots.filter((slot) => slot.enabled);

    for (let leftIndex = 0; leftIndex < enabledSlots.length; leftIndex += 1) {
      for (
        let rightIndex = leftIndex + 1;
        rightIndex < enabledSlots.length;
        rightIndex += 1
      ) {
        if (
          enabledSlots[leftIndex].range.overlaps(enabledSlots[rightIndex].range)
        ) {
          return true;
        }
      }
    }

    return false;
  }

  toSnapshot(): SlotPolicySnapshot {
    return {
      fixedSlots: this.props.fixedSlots.map((slot) => ({
        enabled: slot.enabled,
        endMinutes: slot.range.endMinutes,
        id: slot.id,
        label: slot.label,
        startMinutes: slot.range.startMinutes,
      })),
      granularityMinutes: this.props.granularityMinutes,
      mode: this.props.mode,
      operatingWindow: this.props.operatingWindow?.toSnapshot() ?? null,
      timeZone: this.props.timeZone,
    };
  }
}

function assertTimeZone(timeZone: string) {
  if (timeZone !== "Europe/Madrid") {
    throw domainError(
      "SLOT_POLICY_INVALID",
      "Slot policy time zone must be Europe/Madrid.",
    );
  }
}

function assertPositiveInteger(value: number, message: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw domainError("SLOT_POLICY_INVALID", message);
  }
}

function assertFlexibleWindow(
  operatingWindow: TimeRange,
  granularityMinutes: number,
) {
  const durationMinutes =
    operatingWindow.endMinutes - operatingWindow.startMinutes;

  if (granularityMinutes > durationMinutes) {
    throw domainError(
      "SLOT_POLICY_INVALID",
      "Flexible slot granularity must fit inside the operating window.",
    );
  }
}
