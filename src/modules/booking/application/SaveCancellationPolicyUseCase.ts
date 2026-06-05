import { randomUUID } from "node:crypto";

import { Money } from "@/shared/domain/Money";

import type { SaveCancellationPolicyCommand } from "./AdminCancellationPolicyDtos";
import type { CancellationPolicyRepository } from "./ports/CancellationPolicyRepository";
import {
  CancellationPolicy,
  CancellationPolicyTier,
  CancellationPolicyVersion,
} from "../domain/CancellationPolicy";

export class SaveCancellationPolicyUseCase {
  constructor(private readonly policies: CancellationPolicyRepository) {}

  async execute(command: SaveCancellationPolicyCommand) {
    const now = new Date();
    const existing = (await this.policies.list()).find((policy) => {
      return policy.id === command.id;
    });
    const existingSnapshot = existing?.toSnapshot();
    const nextVersion = (existingSnapshot?.versions.at(-1)?.version ?? 0) + 1;
    const policy = CancellationPolicy.create({
      createdAt: existingSnapshot
        ? new Date(existingSnapshot.createdAt)
        : now,
      id: command.id,
      isDefault: command.isDefault,
      name: command.name,
      status: "ACTIVE",
      updatedAt: now,
      versions: [
        ...(existingSnapshot?.versions.map((version) =>
          CancellationPolicyVersion.create({
            activatedAt: version.activatedAt
              ? new Date(version.activatedAt)
              : null,
            createdAt: new Date(version.createdAt),
            id: version.id,
            policyId: version.policyId,
            status: "ARCHIVED",
            summaries: version.summaries,
            tiers: version.tiers.map((tier) =>
              CancellationPolicyTier.create({
                depositOutcome: tier.depositOutcome,
                fromMinutesBeforeDeparture:
                  tier.fromMinutesBeforeDeparture,
                id: tier.id,
                label: tier.label,
                position: tier.position,
                refundAmount: tier.refundAmount
                  ? Money.create(tier.refundAmount)
                  : null,
                toMinutesBeforeDeparture: tier.toMinutesBeforeDeparture,
              }),
            ),
            updatedAt: now,
            version: version.version,
          }),
        ) ?? []),
        CancellationPolicyVersion.create({
          activatedAt: now,
          createdAt: now,
          id: `cpv_${randomUUID()}`,
          policyId: command.id,
          status: "ACTIVE",
          summaries: command.summaries,
          tiers: command.tiers.map((tier) =>
            CancellationPolicyTier.create({
              depositOutcome: tier.depositOutcome,
              fromMinutesBeforeDeparture:
                tier.fromHoursBeforeDeparture === null
                  ? null
                  : Math.round(tier.fromHoursBeforeDeparture * 60),
              id: tier.id || `cpt_${randomUUID()}`,
              label: tier.label,
              position: tier.position,
              refundAmount: tier.refundAmount
                ? Money.create(tier.refundAmount)
                : null,
              toMinutesBeforeDeparture:
                tier.toHoursBeforeDeparture === null
                  ? null
                  : Math.round(tier.toHoursBeforeDeparture * 60),
            }),
          ),
          updatedAt: now,
          version: nextVersion,
        }),
      ],
    });

    await this.policies.saveNewActiveVersion(policy);

    return policy.toSnapshot();
  }
}
