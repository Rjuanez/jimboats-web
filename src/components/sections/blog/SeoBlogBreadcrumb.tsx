import type { BlogPage } from "@/interface/next/presenters/blogPresenter";

export function SeoBlogBreadcrumb({ page }: { page: BlogPage }) {
  return (
    <nav
      aria-label={page.shell.detailCopy.breadcrumbLabel}
      className="py-6 text-xs leading-6 text-text-muted"
    >
      <ol className="flex flex-wrap gap-x-2">
        {page.breadcrumbs.map((item, i) => (
          <li
            key={item.href}
            className="inline-flex max-w-full items-baseline gap-2"
          >
            {i > 0 && <span aria-hidden="true">/</span>}
            {i === page.breadcrumbs.length - 1 ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <a href={item.href} className="underline underline-offset-4">
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
