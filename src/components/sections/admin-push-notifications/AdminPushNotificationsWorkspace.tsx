"use client";
import { adminEs } from "@/i18n/admin/es";

import {
  Bell,
  CheckCircle2,
  MonitorSmartphone,
  Send,
  Smartphone,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";
import type {
  PushNotificationsSetupDto,
  PushSubscriptionDto,
  PushSubscriptionPlatform,
  PushSubscriptionPermission,
} from "@/modules/notifications/application/PushNotificationDtos";

import type { AdminPushNotificationActions } from "./AdminPushNotificationTypes";

type AdminPushNotificationsWorkspaceProps = {
  actions: AdminPushNotificationActions;
  setup: PushNotificationsSetupDto;
};

type DeviceDetection = {
  displayMode: string | null;
  isStandalone: boolean;
  platform: PushSubscriptionPlatform;
  supported: boolean;
  userAgent: string | null;
};

const emptyDetection: DeviceDetection = {
  displayMode: null,
  isStandalone: false,
  platform: "UNKNOWN",
  supported: false,
  userAgent: null,
};

export function AdminPushNotificationsWorkspace({
  actions,
  setup,
}: AdminPushNotificationsWorkspaceProps) {
  const [activationCode, setActivationCode] = useState("");
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);
  const [detection, setDetection] = useState<DeviceDetection>(emptyDetection);
  const [deviceLabel, setDeviceLabel] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [permission, setPermission] =
    useState<PushSubscriptionPermission>("DEFAULT");
  const [subscriptions, setSubscriptions] = useState(setup.subscriptions);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextDetection = detectDevice();

      setDetection(nextDetection);
      setPermission(readNotificationPermission());
      setDeviceLabel(defaultDeviceLabel(nextDetection.platform));
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const activeCount = useMemo(
    () => subscriptions.filter((item) => item.status === "ACTIVE").length,
    [subscriptions],
  );
  const needsIosInstall =
    detection.platform === "IOS" &&
    detection.supported &&
    !detection.isStandalone;
  const canActivate =
    Boolean(setup.vapidPublicKey) &&
    detection.supported &&
    !needsIosInstall &&
    !isPending;

  function activateDevice() {
    if (!setup.vapidPublicKey) {
      setMessage(adminEs["Push keys are not configured on the server."]);
      return;
    }

    startTransition(async () => {
      try {
        setMessage(null);

        const vapidPublicKey = setup.vapidPublicKey;

        if (!vapidPublicKey) {
          setMessage(adminEs["Push keys are not configured on the server."]);
          return;
        }

        const subscription = await subscribeBrowser(vapidPublicKey);
        const json = subscription.toJSON() as {
          endpoint?: string;
          keys?: {
            auth?: string;
            p256dh?: string;
          };
        };

        if (!json.endpoint || !json.keys?.auth || !json.keys.p256dh) {
          setMessage(
            adminEs["The browser did not return a complete push subscription."],
          );
          return;
        }

        const nextPermission = readNotificationPermission();

        setPermission(nextPermission);

        const result = await actions.registerSubscription({
          activationCode,
          auth: json.keys.auth,
          displayMode: detection.displayMode,
          endpoint: json.endpoint,
          label: deviceLabel,
          p256dh: json.keys.p256dh,
          permission: nextPermission,
          platform: detection.platform,
          userAgent: detection.userAgent,
        });

        if (!result.ok) {
          setMessage(result.message);
          return;
        }

        setCurrentEndpoint(result.data.subscription.endpoint);
        setSubscriptions((current) =>
          upsertSubscription(current, result.data.subscription),
        );
        setMessage(adminEs["Device saved. Sending a test notification now."]);

        const testResult = await actions.sendTest({
          activationCode,
          endpoint: result.data.subscription.endpoint,
        });

        if (!testResult.ok) {
          setMessage(testResult.message);
          return;
        }

        setSubscriptions((current) =>
          markTestSent(current, result.data.subscription.endpoint),
        );
        setMessage(
          testResult.data.status === "SENT"
            ? adminEs["Test notification sent."]
            : adminEs["Device saved, but the test notification failed."],
        );
      } catch (error) {
        setMessage(
          error instanceof Error &&
            error.message ===
              adminEs["Notification permission was not granted."]
            ? error.message
            : adminEs["Could not activate notifications."],
        );
      }
    });
  }

  function sendTestToCurrentDevice() {
    if (!currentEndpoint) {
      setMessage(adminEs["Activate this device before sending another test."]);
      return;
    }

    startTransition(async () => {
      const result = await actions.sendTest({
        activationCode,
        endpoint: currentEndpoint,
      });

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      setSubscriptions((current) => markTestSent(current, currentEndpoint));
      setMessage(
        result.data.status === "SENT"
          ? adminEs["Test notification sent."]
          : adminEs["Test notification failed."],
      );
    });
  }

  function sendTestToAllDevices() {
    startTransition(async () => {
      setMessage(null);

      const result = await actions.sendBroadcastTest();

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      setMessage(
        adminEs.pushTestResults(
          result.data.sent,
          result.data.failed,
          result.data.total,
        ),
      );
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            {adminEs["Operational alerts"]}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            {adminEs["Booking push notifications"]}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {
              adminEs[
                "Connected devices receive a push notification whenever a booking is confirmed."
              ]
            }
          </p>
        </div>
        <Badge tone={activeCount > 0 ? "emerald" : "amber"}>
          {adminEs.activeDevices(activeCount)}
        </Badge>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Surface
          title={adminEs["This device"]}
          description={
            adminEs[
              "Complete the setup once on each phone that should receive booking alerts."
            ]
          }
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              <PlatformGuide detection={detection} />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-slate-800">
                  {adminEs["Device name"]}
                  <input
                    className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
                    onChange={(event) => setDeviceLabel(event.target.value)}
                    value={deviceLabel}
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-slate-800">
                  {adminEs["Activation code"]}
                  <input
                    className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
                    onChange={(event) => setActivationCode(event.target.value)}
                    type="password"
                    value={activationCode}
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="justify-center gap-2"
                  disabled={!canActivate}
                  loading={isPending}
                  onClick={activateDevice}
                >
                  <Bell className="size-4" aria-hidden="true" />
                  {adminEs["Activate alerts"]}
                </Button>
                <Button
                  className="justify-center gap-2"
                  disabled={!currentEndpoint || isPending}
                  onClick={sendTestToCurrentDevice}
                  variant="secondary"
                >
                  <Send className="size-4" aria-hidden="true" />
                  {adminEs["Send test"]}
                </Button>
              </div>

              {message ? (
                <p
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700"
                  role="status"
                >
                  {message}
                </p>
              ) : null}
            </div>

            <DeviceStatus
              detection={detection}
              permission={permission}
              vapidConfigured={Boolean(setup.vapidPublicKey)}
            />
          </div>
        </Surface>

        <Surface
          action={
            <Button
              className="justify-center gap-2"
              disabled={isPending}
              onClick={sendTestToAllDevices}
              size="sm"
              variant="secondary"
            >
              <Send className="size-4" aria-hidden="true" />
              {adminEs["Send test to all"]}
            </Button>
          }
          title={adminEs["Connected devices"]}
        >
          <div className="space-y-3">
            {subscriptions.length === 0 ? (
              <p className="text-sm leading-6 text-slate-600">
                {adminEs["No device has activated push alerts yet."]}
              </p>
            ) : (
              subscriptions.map((subscription) => (
                <SubscriptionRow
                  key={subscription.id}
                  subscription={subscription}
                />
              ))
            )}
          </div>
        </Surface>
      </div>
    </div>
  );
}

function PlatformGuide({ detection }: { detection: DeviceDetection }) {
  const isIos = detection.platform === "IOS";
  const isAndroid = detection.platform === "ANDROID";

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
          {isIos || isAndroid ? (
            <Smartphone className="size-5" aria-hidden="true" />
          ) : (
            <MonitorSmartphone className="size-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-950">
            {platformLabel(detection.platform)}
          </h2>
          <ol className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
            {platformSteps(detection).map((step) => (
              <li className="flex gap-2" key={step}>
                <CheckCircle2
                  className="mt-1 size-4 shrink-0 text-emerald-700"
                  aria-hidden="true"
                />
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function DeviceStatus({
  detection,
  permission,
  vapidConfigured,
}: {
  detection: DeviceDetection;
  permission: PushSubscriptionPermission;
  vapidConfigured: boolean;
}) {
  const rows = [
    {
      label: adminEs["Server keys"],
      ok: vapidConfigured,
      value: vapidConfigured ? adminEs["Configured"] : adminEs["Missing"],
    },
    {
      label: adminEs["Browser support"],
      ok: detection.supported,
      value: detection.supported
        ? adminEs["Supported"]
        : adminEs["Unavailable"],
    },
    {
      label: adminEs["Display mode"],
      ok: detection.platform !== "IOS" || detection.isStandalone,
      value: detection.isStandalone ? adminEs.appMode : adminEs["Browser"],
    },
    {
      label: adminEs["Permission"],
      ok: permission === "GRANTED",
      value: permissionLabel(permission),
    },
  ];

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-bold text-slate-950">
        {adminEs["Readiness"]}
      </h2>
      <div className="mt-3 space-y-3">
        {rows.map((row) => (
          <div
            className="flex items-start justify-between gap-3"
            key={row.label}
          >
            <span className="text-sm text-slate-600">{row.label}</span>
            <Badge tone={row.ok ? "emerald" : "amber"} size="sm">
              {row.value}
            </Badge>
          </div>
        ))}
      </div>
      {!detection.supported || !vapidConfigured ? (
        <div className="mt-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          <TriangleAlert className="mt-1 size-4 shrink-0" aria-hidden="true" />
          <p>
            {adminEs["Activation is disabled until this environment is ready."]}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function SubscriptionRow({
  subscription,
}: {
  subscription: PushSubscriptionDto;
}) {
  const active = subscription.status === "ACTIVE";

  return (
    <article className="rounded-md border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-slate-950">
            {subscription.label}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {platformLabel(subscription.platform)}
          </p>
        </div>
        <Badge tone={active ? "emerald" : "neutral"} size="sm">
          {active ? adminEs["Active"] : adminEs["Disabled"]}
        </Badge>
      </div>
      <dl className="mt-3 grid gap-2 text-xs text-slate-600">
        <DeviceFact
          label={adminEs["Last test"]}
          value={formatDate(subscription.lastTestSentAt)}
        />
        <DeviceFact
          label={adminEs["Last success"]}
          value={formatDate(subscription.lastSuccessAt)}
        />
        <DeviceFact
          label={adminEs["Last failure"]}
          value={
            subscription.lastFailureReason ??
            formatDate(subscription.lastFailureAt)
          }
        />
      </dl>
    </article>
  );
}

function DeviceFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt>{label}</dt>
      <dd className="text-right font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function detectDevice(): DeviceDetection {
  if (typeof window === "undefined") {
    return emptyDetection;
  }

  const userAgent = navigator.userAgent || null;
  const platform = detectPlatform(userAgent);
  const isStandalone =
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches) ||
    Boolean(
      "standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone,
    );

  return {
    displayMode: isStandalone ? "standalone" : "browser",
    isStandalone,
    platform,
    supported:
      "Notification" in window &&
      "PushManager" in window &&
      "serviceWorker" in navigator,
    userAgent,
  };
}

function detectPlatform(userAgent: string | null): PushSubscriptionPlatform {
  const ua = userAgent ?? "";

  if (/android/i.test(ua)) {
    return "ANDROID";
  }

  if (
    /iphone|ipad|ipod/i.test(ua) ||
    (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  ) {
    return "IOS";
  }

  if (ua) {
    return "DESKTOP";
  }

  return "UNKNOWN";
}

function readNotificationPermission(): PushSubscriptionPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "DEFAULT";
  }

  if (Notification.permission === "granted") {
    return "GRANTED";
  }

  if (Notification.permission === "denied") {
    return "DENIED";
  }

  return "DEFAULT";
}

async function subscribeBrowser(vapidPublicKey: string) {
  if (!("Notification" in window)) {
    throw new Error(adminEs["This browser does not support notifications."]);
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error(adminEs["Notification permission was not granted."]);
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  const readyRegistration = await navigator.serviceWorker.ready;
  const existing = await readyRegistration.pushManager.getSubscription();

  if (existing) {
    return existing;
  }

  return registration.pushManager.subscribe({
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    userVisibleOnly: true,
  });
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }

  return output;
}

function defaultDeviceLabel(platform: PushSubscriptionPlatform) {
  if (platform === "IOS") {
    return "iPhone JimBoats";
  }

  if (platform === "ANDROID") {
    return "Android JimBoats";
  }

  return adminEs["JimBoats device"];
}

function platformSteps(detection: DeviceDetection) {
  if (detection.platform === "IOS") {
    return [
      adminEs["Open JimBoats on the iPhone."],
      adminEs["Use Share, then Add to Home Screen."],
      adminEs["Open JimBoats from the new Home Screen icon."],
      adminEs["Enter the activation code and activate alerts."],
    ];
  }

  if (detection.platform === "ANDROID") {
    return [
      adminEs["Open JimBoats in Chrome or another compatible browser."],
      adminEs["Install the app if the browser offers it."],
      adminEs["Enter the activation code and allow notifications."],
    ];
  }

  return [
    adminEs["Use a browser that supports Web Push."],
    adminEs["Enter the activation code."],
    adminEs["Allow notifications and send a test."],
  ];
}

function platformLabel(platform: PushSubscriptionPlatform) {
  if (platform === "IOS") {
    return adminEs["iPhone or iPad"];
  }

  if (platform === "ANDROID") {
    return "Android";
  }

  if (platform === "DESKTOP") {
    return adminEs["Desktop"];
  }

  return adminEs["Unknown platform"];
}

function permissionLabel(permission: PushSubscriptionPermission) {
  if (permission === "GRANTED") {
    return adminEs["Granted"];
  }

  if (permission === "DENIED") {
    return adminEs["Denied"];
  }

  return adminEs["Not asked"];
}

function upsertSubscription(
  subscriptions: PushSubscriptionDto[],
  subscription: PushSubscriptionDto,
) {
  const existingIndex = subscriptions.findIndex(
    (item) => item.endpoint === subscription.endpoint,
  );

  if (existingIndex === -1) {
    return [subscription, ...subscriptions];
  }

  return subscriptions.map((item, index) =>
    index === existingIndex ? subscription : item,
  );
}

function markTestSent(subscriptions: PushSubscriptionDto[], endpoint: string) {
  const now = new Date().toISOString();

  return subscriptions.map((item) =>
    item.endpoint === endpoint
      ? {
          ...item,
          lastTestSentAt: now,
        }
      : item,
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return adminEs["Never"];
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
