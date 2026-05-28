import Link from "next/link";

import { Button } from "@/components/ui/Button";

import { Container } from "./Container";

const navigation = [
  { label: "Servicios", href: "#servicios" },
  { label: "Contacto", href: "#contacto" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <Container className="flex min-h-16 items-center justify-between gap-4">
        <Link
          className="text-base font-semibold tracking-normal text-slate-950"
          href="/"
        >
          JimBoats
        </Link>
        <nav aria-label="Navegacion principal" className="hidden sm:block">
          <ul className="flex items-center gap-6 text-sm font-medium text-slate-700">
            {navigation.map((item) => (
              <li key={item.href}>
                <a className="transition hover:text-slate-950" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <Button href="#reservar" size="sm">
          Reservar
        </Button>
      </Container>
    </header>
  );
}
