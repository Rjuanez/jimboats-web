import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";

export function HomeIntroSection() {
  return (
    <section
      aria-labelledby="home-intro-title"
      className="bg-white py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-teal-700">
              JimBoats
            </p>
            <h1
              id="home-intro-title"
              className="mt-4 text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl"
            >
              Base lista para convertir la landing en componentes reales.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
              Este placeholder confirma la arquitectura inicial: una pagina que
              compone secciones, componentes reutilizables y estilos
              responsive desde el primer dia.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#reservar">Preparar reservas</Button>
              <Button href="#servicios" variant="secondary">
                Ver servicios
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
            <dl className="grid gap-5 text-sm text-slate-700">
              <div>
                <dt className="font-semibold text-slate-950">UI</dt>
                <dd>Componentes aislables y testeables con Storybook.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-950">Responsive</dt>
                <dd>Mobile-first desde 360px, sin overflow accidental.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-950">Clean</dt>
                <dd>Next.js queda como interfaz, no como dominio.</dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
