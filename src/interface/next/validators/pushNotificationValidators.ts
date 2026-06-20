import { z } from "zod";

const platformSchema = z.enum(["ANDROID", "DESKTOP", "IOS", "UNKNOWN"]);
const permissionSchema = z.enum(["DEFAULT", "DENIED", "GRANTED"]);

export const pushSubscriptionInputSchema = z.object({
  activationCode: z.string().trim().min(1),
  auth: z.string().trim().min(1),
  displayMode: z.string().trim().max(80).nullable(),
  endpoint: z.url(),
  label: z.string().trim().min(1).max(80),
  p256dh: z.string().trim().min(1),
  permission: permissionSchema,
  platform: platformSchema,
  userAgent: z.string().trim().max(600).nullable(),
});

export const pushTestInputSchema = z.object({
  activationCode: z.string().trim().min(1),
  endpoint: z.url(),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionInputSchema>;
export type PushTestInput = z.infer<typeof pushTestInputSchema>;

export function parsePushSubscriptionInput(input: unknown) {
  return pushSubscriptionInputSchema.parse(input);
}

export function parsePushTestInput(input: unknown) {
  return pushTestInputSchema.parse(input);
}
