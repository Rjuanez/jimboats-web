"use client";
import { useState } from "react";
import Link from "next/link";
import {
  CheckboxField,
  FieldGrid,
  NumberField,
  SelectField,
  TextField,
} from "@/components/forms/AdminFormControls";
import { Surface } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import type {
  AvailabilitySettings,
  AvailabilitySaveResult,
} from "./AdminAvailabilityTypes";

type Props = {
  experiences: AvailabilitySettings[];
  save: (input: AvailabilitySettings) => Promise<AvailabilitySaveResult>;
};
export function AdminAvailabilityWorkspace({ experiences, save }: Props) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Horarios y disponibilidad</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Define las salidas de cada experiencia. Todas comparten el calendario
          del barco; una reserva impide vender ese mismo tiempo en las demás
          experiencias. Horas de Barcelona. Para amanecer y atardecer,
          selecciona salidas fijas y escribe las horas que quieras ofrecer. Al
          ampliar la duración se mantiene la salida y se retrasa el regreso. El
          paseo privado normal siempre debe regresar antes de ponerse el sol.
        </p>
        <Link
          className="inline-block text-sm font-semibold text-sky-800 underline"
          href="/admin/calendar"
        >
          Bloquear fechas u horas en el calendario
        </Link>
      </header>
      {experiences.length ? (
        experiences.map((experience) => (
          <AvailabilityForm
            key={experience.experienceId}
            initial={experience}
            save={save}
          />
        ))
      ) : (
        <p>No hay experiencias disponibles.</p>
      )}
    </div>
  );
}
function AvailabilityForm({
  initial,
  save,
}: {
  initial: AvailabilitySettings;
  save: Props["save"];
}) {
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AvailabilitySaveResult | null>(null);
  function update(patch: Partial<AvailabilitySettings>) {
    setValue((current) => ({ ...current, ...patch }));
    setResult(null);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      setResult(await save(value));
    } catch {
      setResult({
        ok: false,
        message: "No se ha podido guardar. Vuelve a intentarlo.",
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <Surface title={initial.name}>
      <form
        onSubmit={submit}
        className="space-y-5"
        aria-label={`Horarios: ${initial.name}`}
      >
        <fieldset disabled={busy} className="min-w-0 space-y-5">
          <FieldGrid>
            <SelectField
              label="Tipo de salidas"
              value={value.mode}
              onChange={(event) =>
                update({
                  mode: event.target.value as AvailabilitySettings["mode"],
                })
              }
            >
              <option value="ANY_AVAILABLE">Franja flexible</option>
              <option value="FIXED_SLOTS">Salidas fijas</option>
              <option value="MANUAL_APPROVAL">Solo reservas manuales</option>
            </SelectField>
            <NumberField
              label="Margen antes y después (minutos)"
              min={0}
              max={720}
              required
              value={value.bufferMinutes}
              onChange={(event) =>
                update({ bufferMinutes: Number(event.target.value) })
              }
              description="Se protege este margen a cada lado de cada reserva. Si ambas tienen 15 minutos, habrá al menos 30 minutos entre ellas."
            />
          </FieldGrid>
          {value.mode === "ANY_AVAILABLE" && (
            <FieldGrid columns={3}>
              <TextField
                label="Primera salida"
                required
                value={value.startTime}
                placeholder="10:00"
                onChange={(event) => update({ startTime: event.target.value })}
              />
              <TextField
                label="Hora límite de regreso"
                required
                value={value.endTime}
                placeholder="20:00"
                onChange={(event) => update({ endTime: event.target.value })}
              />
              <NumberField
                label="Intervalo entre salidas (minutos)"
                min={1}
                max={720}
                required
                value={value.granularityMinutes}
                onChange={(event) =>
                  update({ granularityMinutes: Number(event.target.value) })
                }
              />
            </FieldGrid>
          )}
          {value.mode === "FIXED_SLOTS" && (
            <div className="space-y-3">
              <p className="text-sm leading-6 text-slate-600">
                Cada salida tiene una hora límite de regreso. Solo se ofrecerán
                duraciones que quepan dentro. Las franjas activas no pueden
                solaparse.
              </p>
              {value.slots.map((slot, index) => (
                <div
                  key={slot.id}
                  className="space-y-3 rounded-lg border border-slate-200 p-3"
                >
                  <FieldGrid>
                    <TextField
                      label={`Salida ${index + 1}`}
                      required
                      value={slot.startTime}
                      onChange={(event) =>
                        update({
                          slots: value.slots.map((item, i) =>
                            i === index
                              ? { ...item, startTime: event.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                    <TextField
                      label={`Límite de regreso ${index + 1}`}
                      required
                      value={slot.endTime}
                      onChange={(event) =>
                        update({
                          slots: value.slots.map((item, i) =>
                            i === index
                              ? { ...item, endTime: event.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                  </FieldGrid>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CheckboxField
                      label={`Salida ${index + 1} activa`}
                      checked={slot.enabled}
                      onChange={(event) =>
                        update({
                          slots: value.slots.map((item, i) =>
                            i === index
                              ? { ...item, enabled: event.target.checked }
                              : item,
                          ),
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        update({
                          slots: value.slots.filter((_, i) => i !== index),
                        })
                      }
                    >
                      Eliminar salida {index + 1}
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  update({
                    slots: [
                      ...value.slots,
                      {
                        id: crypto.randomUUID(),
                        enabled: true,
                        startTime: "10:00",
                        endTime: "16:00",
                      },
                    ],
                  })
                }
              >
                Añadir salida
              </Button>
            </div>
          )}
          {value.mode === "MANUAL_APPROVAL" && (
            <p className="text-sm text-slate-600">
              Esta experiencia no ofrecerá horas para reservar online. Podrás
              crear sus reservas desde el panel.
            </p>
          )}
          <FieldGrid>
            <NumberField
              label="Antelación mínima (minutos)"
              min={0}
              required
              value={value.minimumAdvanceMinutes}
              onChange={(event) =>
                update({ minimumAdvanceMinutes: Number(event.target.value) })
              }
            />
            <NumberField
              label="Meses abiertos a reservas"
              min={1}
              max={6}
              required
              value={value.maximumAdvanceMonths}
              onChange={(event) =>
                update({ maximumAdvanceMonths: Number(event.target.value) })
              }
            />
          </FieldGrid>
          <CheckboxField
            label="Permitir al equipo reservar fuera de estos horarios"
            checked={value.allowsManualScheduling}
            onChange={(event) =>
              update({ allowsManualScheduling: event.target.checked })
            }
          />
          <p className="text-xs leading-5 text-slate-500">
            Los cambios afectan a las nuevas reservas. Las reservas existentes
            conservan sus horarios y márgenes.
          </p>
          <Button type="submit" disabled={busy}>
            {busy ? "Guardando…" : "Guardar horarios"}
          </Button>
        </fieldset>
        {result && (
          <p
            role={result.ok ? "status" : "alert"}
            className={
              result.ok ? "text-sm text-emerald-800" : "text-sm text-red-700"
            }
          >
            {result.ok
              ? "Horarios guardados. Ya se aplican a las nuevas reservas."
              : result.message}
          </p>
        )}
      </form>
    </Surface>
  );
}
