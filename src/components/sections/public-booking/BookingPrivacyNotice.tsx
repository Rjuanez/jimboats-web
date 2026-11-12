import type { PublicBookingContent } from "./PublicBookingTypes";

export function BookingPrivacyNotice({
  notice,
}: {
  notice: PublicBookingContent["privacy"];
}) {
  return (
    <section
      aria-label={notice.title}
      className="mt-6 rounded-2xl border border-sand/40 bg-background p-4 text-xs leading-6 text-text-muted"
    >
      <p className="font-semibold text-text">{notice.title}</p>
      <p className="mt-2">{notice.description}</p>
      <p className="mt-2">
        {notice.rights}{" "}
        <a
          className="break-all underline underline-offset-4"
          href={`mailto:${notice.email}`}
        >
          {notice.email}
        </a>
        .
      </p>
      <a
        className="mt-2 inline-block py-2 font-semibold text-text underline underline-offset-4"
        href={notice.href}
      >
        {notice.label}
      </a>
    </section>
  );
}
