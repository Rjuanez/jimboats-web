"use client";

import { MailCheck, MessageSquare, Send } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";

import type {
  AdminNotificationActions,
  AdminNotificationDelivery,
  AdminNotificationsState,
} from "./AdminNotificationTypes";

type AdminNotificationLogsSectionProps = {
  isSaving: boolean;
  sendDelivery: AdminNotificationActions["sendDelivery"];
  state: AdminNotificationsState;
};

export function AdminNotificationLogsSection({
  isSaving,
  sendDelivery,
  state,
}: AdminNotificationLogsSectionProps) {
  return (
    <Surface
      description="Recent notification deliveries, manual reviews and provider failures."
      title="Delivery logs"
    >
      {state.deliveries.length === 0 ? (
        <EmptyLogs />
      ) : (
        <div className="space-y-3">
          {state.deliveries.map((delivery) => (
            <DeliveryRow
              delivery={delivery}
              isSaving={isSaving}
              key={delivery.id}
              sendDelivery={sendDelivery}
            />
          ))}
        </div>
      )}
    </Surface>
  );
}

function DeliveryRow({
  delivery,
  isSaving,
  sendDelivery,
}: {
  delivery: AdminNotificationDelivery;
  isSaving: boolean;
  sendDelivery: AdminNotificationActions["sendDelivery"];
}) {
  const Icon = delivery.channel === "EMAIL" ? MailCheck : MessageSquare;

  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={delivery.tone}>{delivery.statusLabel}</Badge>
            <Badge tone="sky">{delivery.channelLabel}</Badge>
            <Badge tone="neutral">{delivery.locale.toUpperCase()}</Badge>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{delivery.eventLabel}</span>
            </h2>
            <p className="mt-1 break-words text-sm leading-6 text-slate-600">
              {delivery.recipientLabel}
            </p>
          </div>
          {delivery.renderedSubject ? (
            <p className="break-words text-sm font-semibold text-slate-950">
              {delivery.renderedSubject}
            </p>
          ) : null}
          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
            {delivery.renderedBody}
          </p>
          {delivery.failureReason ? (
            <p className="text-sm font-medium leading-6 text-rose-700">
              {delivery.failureReason}
            </p>
          ) : null}
          <p className="text-xs font-medium text-slate-500">
            Created {delivery.createdAtLabel}
            {delivery.sentAtLabel ? ` - sent ${delivery.sentAtLabel}` : ""}
          </p>
        </div>
        {delivery.canSend ? (
          <Button
            disabled={isSaving}
            loading={isSaving}
            onClick={() =>
              sendDelivery({
                notificationDeliveryId: delivery.id,
              })
            }
            variant="secondary"
          >
            <Send className="size-4" aria-hidden="true" />
            Mark sent
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function EmptyLogs() {
  return (
    <div className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-slate-950">
        No notification deliveries yet.
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Deliveries will appear when booking events are processed.
      </p>
    </div>
  );
}
