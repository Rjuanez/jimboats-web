import { adminNavItems } from "@/components/layout/AdminNavigation";
import type {
  AdminMediaAsset,
  AdminMediaPageData,
} from "@/components/sections/admin-media/AdminMediaTypes";

const mediaAssets: AdminMediaAsset[] = [
  {
    altText: {
      ca: "Catamara privat navegant al capvespre davant Barcelona.",
      en: "Private catamaran sailing at sunset in Barcelona.",
      es: "Catamaran privado navegando al atardecer frente a Barcelona.",
    },
    collection: "Experiences",
    dimensions: "1024 x 1024",
    filename: "experience-sunset-toast.webp",
    format: "WebP",
    hash: "a8f4c2",
    id: "sunset-experience-hero",
    originalPath: "/var/lib/jimboats/media/originals/experiences/sunset.jpg",
    publicPath: "/media/experiences/sunset-experience-a8f4c2-1024.webp",
    publicUrl: "/images/generated/landing/experience-sunset-toast-1024.webp",
    sizeLabel: "186 KB",
    status: "ready",
    title: "Sunset Experience hero",
    updatedAt: "May 31, 2026, 18:20",
    usage: [
      {
        href: "/admin/experiences/sunset-experience",
        id: "sunset-experience",
        label: "Sunset Experience",
        type: "experience",
      },
    ],
    variants: [
      {
        dimensions: "480 x 480",
        format: "WebP",
        id: "sunset-480",
        publicUrl: "/images/generated/landing/experience-sunset-toast-480.webp",
        sizeLabel: "54 KB",
        status: "ready",
        width: 480,
      },
      {
        dimensions: "720 x 720",
        format: "WebP",
        id: "sunset-720",
        publicUrl: "/images/generated/landing/experience-sunset-toast-720.webp",
        sizeLabel: "96 KB",
        status: "ready",
        width: 720,
      },
      {
        dimensions: "1024 x 1024",
        format: "WebP",
        id: "sunset-1024",
        publicUrl:
          "/images/generated/landing/experience-sunset-toast-1024.webp",
        sizeLabel: "186 KB",
        status: "ready",
        width: 1024,
      },
    ],
    workflow: [
      { at: "18:14", label: "Original received", status: "ready" },
      { at: "18:16", label: "Variants generated", status: "ready" },
      { at: "18:20", label: "Linked to experience", status: "ready" },
    ],
  },
  {
    altText: {
      ca: "Sortida privada de mati amb mar tranquil a Barcelona.",
      en: "Private morning charter on calm Barcelona water.",
      es: "Salida privada de mañana con mar tranquilo en Barcelona.",
    },
    collection: "Experiences",
    dimensions: "1024 x 1024",
    filename: "experience-morning-breeze.webp",
    format: "WebP",
    hash: "b7e9d1",
    id: "morning-breeze-cover",
    originalPath:
      "/var/lib/jimboats/media/originals/experiences/morning-breeze.jpg",
    publicPath: "/media/experiences/morning-breeze-b7e9d1-1024.webp",
    publicUrl: "/images/generated/landing/experience-morning-breeze-1024.webp",
    sizeLabel: "172 KB",
    status: "processing",
    title: "Morning Breeze cover",
    updatedAt: "June 1, 2026, 09:10",
    usage: [
      {
        href: "/admin/experiences/morning-breeze",
        id: "morning-breeze",
        label: "Morning Breeze",
        type: "experience",
      },
    ],
    variants: [
      {
        dimensions: "480 x 480",
        format: "WebP",
        id: "morning-480",
        publicUrl:
          "/images/generated/landing/experience-morning-breeze-480.webp",
        sizeLabel: "49 KB",
        status: "ready",
        width: 480,
      },
      {
        dimensions: "720 x 720",
        format: "WebP",
        id: "morning-720",
        publicUrl:
          "/images/generated/landing/experience-morning-breeze-720.webp",
        sizeLabel: "88 KB",
        status: "processing",
        width: 720,
      },
      {
        dimensions: "1024 x 1024",
        format: "WebP",
        id: "morning-1024",
        publicUrl:
          "/images/generated/landing/experience-morning-breeze-1024.webp",
        sizeLabel: "172 KB",
        status: "processing",
        width: 1024,
      },
    ],
    workflow: [
      { at: "09:04", label: "Original received", status: "ready" },
      { at: "09:07", label: "Small variant generated", status: "ready" },
      { at: "09:10", label: "Large variants running", status: "processing" },
    ],
  },
  {
    altText: {
      ca: "Brindis amb cava premium durant una sortida privada en barco.",
      en: "Premium cava toast during a private boat charter.",
      es: "Brindis con cava premium durante una salida privada en barco.",
    },
    collection: "Extras",
    dimensions: "1024 x 1024",
    filename: "upgrade-sunset-toast.webp",
    format: "WebP",
    hash: "c4d2f0",
    id: "premium-cava-extra",
    originalPath: "/var/lib/jimboats/media/originals/extras/premium-cava.jpg",
    publicPath: "/media/extras/premium-cava-c4d2f0-1024.webp",
    publicUrl: "/images/generated/landing/upgrade-sunset-toast-1024.webp",
    sizeLabel: "164 KB",
    status: "ready",
    title: "Premium cava extra",
    updatedAt: "May 30, 2026, 12:42",
    usage: [
      {
        href: "/admin/extras/premium-champagne",
        id: "premium-champagne",
        label: "Premium champagne",
        type: "extra",
      },
    ],
    variants: [
      {
        dimensions: "320 x 320",
        format: "WebP",
        id: "cava-320",
        publicUrl: "/images/generated/landing/upgrade-sunset-toast-320.webp",
        sizeLabel: "31 KB",
        status: "ready",
        width: 320,
      },
      {
        dimensions: "720 x 720",
        format: "WebP",
        id: "cava-720",
        publicUrl: "/images/generated/landing/upgrade-sunset-toast-720.webp",
        sizeLabel: "89 KB",
        status: "ready",
        width: 720,
      },
      {
        dimensions: "1024 x 1024",
        format: "WebP",
        id: "cava-1024",
        publicUrl: "/images/generated/landing/upgrade-sunset-toast-1024.webp",
        sizeLabel: "164 KB",
        status: "ready",
        width: 1024,
      },
    ],
    workflow: [
      { at: "12:35", label: "Original received", status: "ready" },
      { at: "12:39", label: "Variants generated", status: "ready" },
      { at: "12:42", label: "Ready for selection", status: "ready" },
    ],
  },
  {
    altText: {
      ca: "",
      en: "",
      es: "",
    },
    collection: "Gallery",
    dimensions: "1024 x 1024",
    filename: "gallery-barcelona-coast.webp",
    format: "WebP",
    hash: "e5a910",
    id: "barcelona-coast-gallery",
    originalPath:
      "/var/lib/jimboats/media/originals/gallery/barcelona-coast.jpg",
    publicPath: "/media/gallery/barcelona-coast-e5a910-1024.webp",
    publicUrl: "/images/generated/landing/gallery-barcelona-coast-1024.webp",
    sizeLabel: "198 KB",
    status: "failed",
    title: "Barcelona coast gallery",
    updatedAt: "May 29, 2026, 16:03",
    usage: [
      {
        href: "/admin/content/home-gallery",
        id: "home-gallery",
        label: "Home gallery",
        type: "gallery",
      },
    ],
    variants: [
      {
        dimensions: "480 x 480",
        format: "WebP",
        id: "coast-480",
        publicUrl: "/images/generated/landing/gallery-barcelona-coast-480.webp",
        sizeLabel: "61 KB",
        status: "ready",
        width: 480,
      },
      {
        dimensions: "720 x 720",
        format: "WebP",
        id: "coast-720",
        publicUrl: "/images/generated/landing/gallery-barcelona-coast-720.webp",
        sizeLabel: "104 KB",
        status: "failed",
        width: 720,
      },
      {
        dimensions: "1024 x 1024",
        format: "WebP",
        id: "coast-1024",
        publicUrl:
          "/images/generated/landing/gallery-barcelona-coast-1024.webp",
        sizeLabel: "198 KB",
        status: "failed",
        width: 1024,
      },
    ],
    workflow: [
      { at: "15:54", label: "Original received", status: "ready" },
      { at: "15:58", label: "Small variant generated", status: "ready" },
      { at: "16:03", label: "Large variant failed", status: "failed" },
    ],
  },
];

export function getAdminMediaPreviewPage(): AdminMediaPageData {
  return {
    assets: mediaAssets,
    navItems: adminNavItems,
  };
}
