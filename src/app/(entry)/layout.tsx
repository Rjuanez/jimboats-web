import { RootDocument } from "@/components/layout/RootDocument";
import type { ReactNode } from "react";
export { metadata, viewport } from "@/components/layout/RootDocument";
export default function EntryLayout({ children }: { children: ReactNode }) {
  return <RootDocument>{children}</RootDocument>;
}
