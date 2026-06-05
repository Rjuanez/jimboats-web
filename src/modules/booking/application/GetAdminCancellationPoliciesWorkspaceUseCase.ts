import type { AdminCancellationPoliciesWorkspaceDto } from "./AdminCancellationPolicyDtos";
import type { CancellationPolicyRepository } from "./ports/CancellationPolicyRepository";

export class GetAdminCancellationPoliciesWorkspaceUseCase {
  constructor(private readonly policies: CancellationPolicyRepository) {}

  async execute(): Promise<AdminCancellationPoliciesWorkspaceDto> {
    const policies = await this.policies.list();

    return {
      policies: policies.map((policy) => policy.toSnapshot()),
    };
  }
}
