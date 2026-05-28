import { Container } from "./Container";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container className="flex flex-col gap-3 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>JimBoats</p>
        <p>Experiencias nauticas preparadas para reservas online.</p>
      </Container>
    </footer>
  );
}
