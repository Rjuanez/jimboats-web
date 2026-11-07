export function productionSeoEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.JIMBOATS_INDEXING === "1" &&
    env.JIMBOATS_SEO_PREVIEW !== "1" &&
    env.JIMBOATS_LOCAL_BOOKINGS !== "1" &&
    env.JIMBOATS_ADMIN_PREVIEW_DATA !== "1";
}
