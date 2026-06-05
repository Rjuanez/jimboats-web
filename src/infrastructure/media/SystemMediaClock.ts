import type { MediaClock } from "@/modules/media-library/application/ports/MediaClock";

export class SystemMediaClock implements MediaClock {
  now() {
    return new Date();
  }
}
