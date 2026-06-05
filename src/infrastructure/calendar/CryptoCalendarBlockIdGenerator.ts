import { randomUUID } from "node:crypto";

import type { CalendarBlockIdGenerator } from "@/modules/boat-calendar/application/ports/CalendarBlockIdGenerator";

export class CryptoCalendarBlockIdGenerator implements CalendarBlockIdGenerator {
  newCalendarBlockId() {
    return `block-${randomUUID()}`;
  }
}
