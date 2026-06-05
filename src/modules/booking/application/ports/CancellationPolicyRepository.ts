import type {
  BookingCancellationPolicySnapshot,
  CancellationPolicy,
} from "../../domain/CancellationPolicy";

export type CancellationPolicyRepository = {
  findActiveBookingSnapshotForExperience(
    experienceId: string,
  ): Promise<BookingCancellationPolicySnapshot | null>;
  list(): Promise<CancellationPolicy[]>;
  saveNewActiveVersion(policy: CancellationPolicy): Promise<void>;
};
