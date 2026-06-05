import { ImageIcon } from "lucide-react";

import {
  CheckboxField,
  FieldGrid,
  NumberField,
} from "@/components/forms/AdminFormControls";
import { Badge } from "@/components/ui/Badge";
import { DynamicMediaImage } from "@/components/ui/DynamicMediaImage";
import { Surface } from "@/components/ui/Surface";
import { cn } from "@/design/variants";

import type {
  AdminExperience,
  AdminExperienceExtraConfig,
  AdminExperienceMutation,
  AdminExtra,
} from "./AdminExperienceTypes";

type AdminExperienceExtrasSectionProps = {
  experience: AdminExperience;
  extras: AdminExtra[];
  updateExperience: AdminExperienceMutation;
};

export function AdminExperienceExtrasSection({
  experience,
  extras,
  updateExperience,
}: AdminExperienceExtrasSectionProps) {
  const getConfig = (extra: AdminExtra): AdminExperienceExtraConfig => {
    const currentConfig = experience.extras.find((config) => {
      return config.extraId === extra.id;
    });

    return (
      currentConfig ?? {
        capacityReduction: 0,
        enabled: false,
        extraId: extra.id,
        limitPerBooking: 1,
        noticeHours: extra.defaultNoticeHours,
        priceOverride: null,
      }
    );
  };

  const updateConfig = (
    extra: AdminExtra,
    updater: (config: AdminExperienceExtraConfig) => AdminExperienceExtraConfig,
  ) => {
    updateExperience((current) => {
      const currentConfig =
        current.extras.find((config) => config.extraId === extra.id) ??
        getConfig(extra);
      const nextConfig = updater(currentConfig);
      const hasConfig = current.extras.some((config) => {
        return config.extraId === extra.id;
      });

      return {
        ...current,
        extras: hasConfig
          ? current.extras.map((config) => {
              if (config.extraId !== extra.id) {
                return config;
              }

              return nextConfig;
            })
          : [...current.extras, nextConfig],
      };
    });
  };

  return (
    <Surface
      description="Choose which add-ons can be sold with this experience and configure limits, notice windows and capacity impact."
      title="Compatible extras"
    >
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <th className="px-3 py-3 font-semibold">Extra</th>
              <th className="px-3 py-3 font-semibold">Enabled</th>
              <th className="px-3 py-3 font-semibold">Price</th>
              <th className="px-3 py-3 font-semibold">Notice hours</th>
              <th className="px-3 py-3 font-semibold">Limit</th>
              <th className="px-3 py-3 font-semibold">Capacity impact</th>
            </tr>
          </thead>
          <tbody>
            {extras.map((extra) => (
              <ExtraRow
                config={getConfig(extra)}
                extra={extra}
                key={extra.id}
                updateConfig={(updater) => updateConfig(extra, updater)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 xl:hidden">
        {extras.map((extra) => (
          <ExtraCard
            config={getConfig(extra)}
            extra={extra}
            key={extra.id}
            updateConfig={(updater) => updateConfig(extra, updater)}
          />
        ))}
      </div>
    </Surface>
  );
}

function ExtraRow({
  config,
  extra,
  updateConfig,
}: {
  config: AdminExperienceExtraConfig;
  extra: AdminExtra;
  updateConfig: (
    updater: (config: AdminExperienceExtraConfig) => AdminExperienceExtraConfig,
  ) => void;
}) {
  const isActive = extra.status === "active";
  const canToggle = isActive || config.enabled;

  return (
    <tr className="border-b border-slate-200 align-top">
      <td className="px-3 py-4">
        <div className="flex items-center gap-3">
          <ExtraImage extra={extra} size={56} />
          <div>
            <p className="font-semibold text-slate-950">{extra.name}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Badge size="sm" tone={extraStatusTone(extra.status)}>
                {extraStatusLabel(extra.status)}
              </Badge>
              <Badge size="sm" tone={extra.requiresNotice ? "amber" : "sky"}>
                {extra.requiresNotice ? "Notice required" : "Flexible"}
              </Badge>
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-4">
        <CheckboxField
          checked={config.enabled}
          description={
            canToggle ? undefined : "Activate the extra before offering it here."
          }
          disabled={!canToggle}
          label="Available"
          onChange={(event) =>
            updateConfig((current) => ({
              ...current,
              enabled: event.target.checked,
            }))
          }
        />
      </td>
      <td className="px-3 py-4">
        <NumberField
          label="Override price"
          min={0}
          disabled={!isActive}
          onChange={(event) =>
            updateConfig((current) => ({
              ...current,
              priceOverride: event.target.value
                ? Number(event.target.value)
                : null,
            }))
          }
          placeholder={`Default ${extra.defaultPrice}`}
          value={config.priceOverride ?? ""}
        />
      </td>
      <td className="px-3 py-4">
        <NumberField
          label="Notice"
          min={0}
          disabled={!isActive}
          onChange={(event) =>
            updateConfig((current) => ({
              ...current,
              noticeHours: Number(event.target.value),
            }))
          }
          value={config.noticeHours}
        />
      </td>
      <td className="px-3 py-4">
        <NumberField
          label="Limit"
          min={0}
          disabled={!isActive}
          onChange={(event) =>
            updateConfig((current) => ({
              ...current,
              limitPerBooking: Number(event.target.value),
            }))
          }
          value={config.limitPerBooking}
        />
      </td>
      <td className="px-3 py-4">
        <NumberField
          label="Capacity"
          min={0}
          disabled={!isActive}
          onChange={(event) =>
            updateConfig((current) => ({
              ...current,
              capacityReduction: Number(event.target.value),
            }))
          }
          value={config.capacityReduction}
        />
      </td>
    </tr>
  );
}

function ExtraCard({
  config,
  extra,
  updateConfig,
}: {
  config: AdminExperienceExtraConfig;
  extra: AdminExtra;
  updateConfig: (
    updater: (config: AdminExperienceExtraConfig) => AdminExperienceExtraConfig,
  ) => void;
}) {
  const isActive = extra.status === "active";
  const canToggle = isActive || config.enabled;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <ExtraImage extra={extra} size={64} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-950">{extra.name}</p>
          <p className="mt-1 text-sm text-slate-500">
            Default EUR {extra.defaultPrice}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge size="sm" tone={extraStatusTone(extra.status)}>
              {extraStatusLabel(extra.status)}
            </Badge>
            <Badge size="sm" tone={extra.requiresNotice ? "amber" : "sky"}>
              {extra.requiresNotice ? "Notice required" : "Flexible"}
            </Badge>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        <CheckboxField
          checked={config.enabled}
          description={
            canToggle ? undefined : "Activate the extra before offering it here."
          }
          disabled={!canToggle}
          label="Available for this experience"
          onChange={(event) =>
            updateConfig((current) => ({
              ...current,
              enabled: event.target.checked,
            }))
          }
        />
        <FieldGrid>
          <NumberField
            label="Override price"
            min={0}
            disabled={!isActive}
            onChange={(event) =>
              updateConfig((current) => ({
                ...current,
                priceOverride: event.target.value
                  ? Number(event.target.value)
                  : null,
              }))
            }
            placeholder={`Default ${extra.defaultPrice}`}
            value={config.priceOverride ?? ""}
          />
          <NumberField
            label="Notice hours"
            min={0}
            disabled={!isActive}
            onChange={(event) =>
              updateConfig((current) => ({
                ...current,
                noticeHours: Number(event.target.value),
              }))
            }
            value={config.noticeHours}
          />
        </FieldGrid>
        <NumberField
          label="Limit per booking"
          min={0}
          disabled={!isActive}
          onChange={(event) =>
            updateConfig((current) => ({
              ...current,
              limitPerBooking: Number(event.target.value),
            }))
          }
          value={config.limitPerBooking}
        />
        <NumberField
          label="Capacity impact"
          min={0}
          disabled={!isActive}
          onChange={(event) =>
            updateConfig((current) => ({
              ...current,
              capacityReduction: Number(event.target.value),
            }))
          }
          value={config.capacityReduction}
        />
      </div>
    </article>
  );
}

function ExtraImage({ extra, size }: { extra: AdminExtra; size: 56 | 64 }) {
  return (
    <DynamicMediaImage
      alt=""
      className={cn(
        "shrink-0 overflow-hidden rounded-md",
        size === 56 ? "size-14" : "size-16",
      )}
      fallback={<ImageIcon className="size-4" aria-hidden="true" />}
      src={extra.media.primaryImageUrl}
      variants={extra.media.variants}
    />
  );
}

function extraStatusLabel(status: AdminExtra["status"]) {
  const labels = {
    active: "Active",
    archived: "Archived",
    draft: "Draft",
  } satisfies Record<AdminExtra["status"], string>;

  return labels[status];
}

function extraStatusTone(status: AdminExtra["status"]) {
  const tones = {
    active: "emerald",
    archived: "neutral",
    draft: "amber",
  } satisfies Record<AdminExtra["status"], "amber" | "emerald" | "neutral">;

  return tones[status];
}
