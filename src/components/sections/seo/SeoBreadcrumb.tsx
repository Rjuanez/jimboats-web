import { Container } from "@/components/layout/Container";
import type { MarketingPage } from "@/content/marketing";
export function SeoBreadcrumb({ page }: { page: MarketingPage }) {
  return (
    <Container>
      <nav aria-label="Breadcrumb" className="py-6 text-xs text-text-muted">
        <ol className="flex flex-wrap gap-2">
          <li>
            <a
              className="underline underline-offset-4"
              href={`/${page.locale}`}
            >
              {page.copy.home}
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{page.title}</li>
        </ol>
      </nav>
    </Container>
  );
}
