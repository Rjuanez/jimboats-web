import type {
  PushDeliveryAttemptWriteModel,
  PushSubscriptionRecord,
  PushSubscriptionRepository,
  PushSubscriptionUpsert,
} from "@/modules/notifications/application/ports/PushSubscriptionRepository";

type PrismaPushSubscriptionRecord = {
  auth: string;
  createdAt: Date;
  disabledAt: Date | null;
  displayMode: string | null;
  endpoint: string;
  id: string;
  label: string;
  lastFailureAt: Date | null;
  lastFailureReason: string | null;
  lastSuccessAt: Date | null;
  lastTestSentAt: Date | null;
  p256dh: string;
  permission: "DEFAULT" | "DENIED" | "GRANTED";
  platform: "ANDROID" | "DESKTOP" | "IOS" | "UNKNOWN";
  status: "ACTIVE" | "DISABLED";
  updatedAt: Date;
  userAgent: string | null;
};

type PushSubscriptionDelegate = {
  findMany(args?: {
    orderBy?: Array<Record<string, "asc" | "desc">>;
    where?: Partial<Pick<PrismaPushSubscriptionRecord, "status">>;
  }): Promise<PrismaPushSubscriptionRecord[]>;
  findUnique(args: {
    where: {
      endpoint: string;
    };
  }): Promise<PrismaPushSubscriptionRecord | null>;
  update(args: {
    data: Partial<
      Pick<
        PrismaPushSubscriptionRecord,
        | "disabledAt"
        | "lastFailureAt"
        | "lastFailureReason"
        | "lastSuccessAt"
        | "lastTestSentAt"
        | "status"
      >
    >;
    where: {
      endpoint?: string;
      id?: string;
    };
  }): Promise<PrismaPushSubscriptionRecord>;
  upsert(args: {
    create: Omit<
      PrismaPushSubscriptionRecord,
      | "createdAt"
      | "disabledAt"
      | "id"
      | "lastFailureAt"
      | "lastFailureReason"
      | "lastSuccessAt"
      | "lastTestSentAt"
      | "updatedAt"
    >;
    update: Partial<
      Omit<
        PrismaPushSubscriptionRecord,
        | "createdAt"
        | "id"
        | "lastSuccessAt"
        | "lastTestSentAt"
        | "updatedAt"
      >
    >;
    where: {
      endpoint: string;
    };
  }): Promise<PrismaPushSubscriptionRecord>;
};

type PushDeliveryAttemptDelegate = {
  create(args: {
    data: PushDeliveryAttemptWriteModel;
  }): Promise<unknown>;
};

export type PrismaPushSubscriptionRepositoryClient = {
  pushDeliveryAttempt: PushDeliveryAttemptDelegate;
  pushSubscription: PushSubscriptionDelegate;
};

export class PrismaPushSubscriptionRepository
  implements PushSubscriptionRepository
{
  constructor(private readonly prisma: PrismaPushSubscriptionRepositoryClient) {}

  async disable(input: {
    disabledAt: Date;
    endpoint: string;
    reason: string;
  }): Promise<void> {
    await this.prisma.pushSubscription.update({
      data: {
        disabledAt: input.disabledAt,
        lastFailureAt: input.disabledAt,
        lastFailureReason: input.reason,
        status: "DISABLED",
      },
      where: {
        endpoint: input.endpoint,
      },
    });
  }

  async findByEndpoint(
    endpoint: string,
  ): Promise<PushSubscriptionRecord | null> {
    const record = await this.prisma.pushSubscription.findUnique({
      where: {
        endpoint,
      },
    });

    return record ? pushSubscriptionFromPrisma(record) : null;
  }

  async listActive(): Promise<PushSubscriptionRecord[]> {
    const records = await this.prisma.pushSubscription.findMany({
      orderBy: [{ updatedAt: "desc" }],
      where: {
        status: "ACTIVE",
      },
    });

    return records.map(pushSubscriptionFromPrisma);
  }

  async listAll(): Promise<PushSubscriptionRecord[]> {
    const records = await this.prisma.pushSubscription.findMany({
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    });

    return records.map(pushSubscriptionFromPrisma);
  }

  async markFailure(input: {
    failedAt: Date;
    reason: string;
    subscriptionId: string;
  }): Promise<void> {
    await this.prisma.pushSubscription.update({
      data: {
        lastFailureAt: input.failedAt,
        lastFailureReason: input.reason,
      },
      where: {
        id: input.subscriptionId,
      },
    });
  }

  async markSuccess(input: {
    sentAt: Date;
    subscriptionId: string;
  }): Promise<void> {
    await this.prisma.pushSubscription.update({
      data: {
        lastFailureReason: null,
        lastSuccessAt: input.sentAt,
      },
      where: {
        id: input.subscriptionId,
      },
    });
  }

  async markTestSent(input: {
    sentAt: Date;
    subscriptionId: string;
  }): Promise<void> {
    await this.prisma.pushSubscription.update({
      data: {
        lastTestSentAt: input.sentAt,
      },
      where: {
        id: input.subscriptionId,
      },
    });
  }

  async recordAttempt(input: PushDeliveryAttemptWriteModel): Promise<void> {
    await this.prisma.pushDeliveryAttempt.create({
      data: input,
    });
  }

  async upsert(input: PushSubscriptionUpsert): Promise<PushSubscriptionRecord> {
    const record = await this.prisma.pushSubscription.upsert({
      create: {
        auth: input.auth,
        displayMode: input.displayMode,
        endpoint: input.endpoint,
        label: input.label,
        p256dh: input.p256dh,
        permission: input.permission,
        platform: input.platform,
        status: "ACTIVE",
        userAgent: input.userAgent,
      },
      update: {
        auth: input.auth,
        disabledAt: null,
        displayMode: input.displayMode,
        endpoint: input.endpoint,
        label: input.label,
        lastFailureAt: null,
        lastFailureReason: null,
        p256dh: input.p256dh,
        permission: input.permission,
        platform: input.platform,
        status: "ACTIVE",
        userAgent: input.userAgent,
      },
      where: {
        endpoint: input.endpoint,
      },
    });

    return pushSubscriptionFromPrisma(record);
  }
}

function pushSubscriptionFromPrisma(
  record: PrismaPushSubscriptionRecord,
): PushSubscriptionRecord {
  return {
    auth: record.auth,
    createdAt: record.createdAt,
    disabledAt: record.disabledAt,
    displayMode: record.displayMode,
    endpoint: record.endpoint,
    id: record.id,
    label: record.label,
    lastFailureAt: record.lastFailureAt,
    lastFailureReason: record.lastFailureReason,
    lastSuccessAt: record.lastSuccessAt,
    lastTestSentAt: record.lastTestSentAt,
    p256dh: record.p256dh,
    permission: record.permission,
    platform: record.platform,
    status: record.status,
    updatedAt: record.updatedAt,
    userAgent: record.userAgent,
  };
}
