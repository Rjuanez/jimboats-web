import type { HomeGalleryClock } from "@/modules/home-gallery/application/ports/HomeGalleryClock";

export class SystemHomeGalleryClock implements HomeGalleryClock {
  now() {
    return new Date();
  }
}
