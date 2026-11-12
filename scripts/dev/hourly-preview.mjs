import { hourlyPrices } from "../../src/content/booking/hourlyPrices.ts";
import { spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, readFileSync } from "node:fs";

// Explicit local targets: never accept a production database or provider from .env.
const env = {
  ...process.env,
  DATABASE_URL:
    "postgresql://jimboats:local-preview-only@127.0.0.1:55439/jimboats_hourly_preview",
  JIMBOATS_LOCAL_BOOKINGS: "1",
  JIMBOATS_SEO_PREVIEW: "1",
  JIMBOATS_ADMIN_PREVIEW_DATA: "0",
  PUBLIC_SITE_URL: "http://127.0.0.1:3102",
  HOSTNAME: "127.0.0.1",
  PORT: "3102",
  GOOGLE_CALENDAR_ENABLED: "false",
  CHATGPT_ADS_ENABLED: "false",
  CHATGPT_ADS_PIXEL_ID: "",
  CHATGPT_ADS_CAPI_KEY: "",
  CHATGPT_ADS_VALIDATE_ONLY: "true",
  NEXT_PUBLIC_STATSIG_ANALYTICS_ENABLED: "false",
  NOTIFICATION_PROVIDER_MODE: "console",
  PUSH_VAPID_PRIVATE_KEY: "",
  PUSH_VAPID_PUBLIC_KEY: "",
  PUSH_ACTIVATION_CODE: "",
  STRIPE_SECRET_KEY: "",
  STRIPE_WEBHOOK_SECRET: "",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "",
  RESEND_API_KEY: "",
  PRELUDE_API_KEY: "",
};
function run(command, args, input) {
  const result = spawnSync(command, args, {
    env,
    stdio: input ? ["pipe", "inherit", "inherit"] : "inherit",
    input,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const startingPrices = Object.fromEntries(
  Object.entries(hourlyPrices).map(([id, amounts]) => [id, Object.values(amounts)[0] * 100]),
);
if (process.argv.includes("--setup")) {
  run("docker", [
    "compose",
    "-f",
    "docker-compose.hourly.yml",
    "up",
    "--wait",
    "-d",
    "db",
  ]);
  run(process.execPath, [
    "node_modules/prisma/build/index.js",
    "migrate",
    "deploy",
  ]);
  run(
    "docker",
    [
      "compose",
      "-f",
      "docker-compose.hourly.yml",
      "exec",
      "-T",
      "db",
      "psql",
      "-U",
      "jimboats",
      "-d",
      "jimboats_hourly_preview",
      "-v",
      "ON_ERROR_STOP=1",
      "-v",
      "starting_prices=" + JSON.stringify(startingPrices),
    ],
    readFileSync("scripts/dev/seed-hourly-preview.sql"),
  );
} else {
  if (process.argv.includes("--start")) {
    if (!existsSync(".next/standalone/server.js")) {
      console.error("Falta la compilación. Ejecuta pnpm build antes de pnpm start:hourly.");
      process.exit(1);
    }
    cpSync("public", ".next/standalone/public", { recursive: true });
    cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
  }
  const children = [];
  let stopping = false;
  function stop(code = 0) {
    if (stopping) return;
    stopping = true;
    process.exitCode = code;
    for (const child of children) child.kill("SIGTERM");
  }
  function start(args) {
    const child = spawn(process.execPath, args, { env, stdio: "inherit" });
    children.push(child);
    child.on("error", (error) => {
      console.error(error.message);
      stop(1);
    });
    child.on("exit", (code) => {
      if (!stopping) stop(code ?? 1);
    });
  }
  for (const [source, output] of [
    ["notificationWorkerCli", "notification-worker"],
    ["bookingHoldExpirationWorkerCli", "booking-hold-expiration-worker"],
  ]) {
    run("node_modules/.bin/esbuild", [
      `src/interface/worker/${source}.ts`,
      "--bundle",
      "--platform=node",
      "--target=node24",
      "--format=cjs",
      "--packages=external",
      `--outfile=.worker/${output}.cjs`,
    ]);
    start([`.worker/${output}.cjs`]);
  }
  start(
    process.argv.includes("--start")
      ? [".next/standalone/server.js"]
      : [
          "node_modules/next/dist/bin/next",
          "dev",
          "--webpack",
          "--hostname",
          "127.0.0.1",
          "--port",
          "3102",
        ],
  );
  process.once("SIGINT", () => stop());
  process.once("SIGTERM", () => stop());
  console.info(
    "JimBoats local: http://127.0.0.1:3102 — base de datos persistente, pagos de prueba y notificaciones en el registro local.",
  );
}
