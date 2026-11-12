// @vitest-environment node
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const directories: string[] = [];
afterEach(() => {
  for (const path of directories.splice(0))
    rmSync(path, { recursive: true, force: true });
});

function deploy(options: {
  enabled: boolean;
  key?: string;
  migrationFails?: boolean;
  pipeline?: { enabled: string; key: string };
}) {
  const dir = mkdtempSync(join(tmpdir(), "jimboats-ads-deploy-"));
  directories.push(dir);
  const bin = join(dir, "bin");
  mkdirSync(bin);
  const calls = join(dir, "calls");
  writeFileSync(calls, "");
  writeFileSync(
    join(bin, "docker"),
    `#!/bin/sh
printf '%s\\n' "$*" >> "$DEPLOY_TEST_CALLS"
if [ -n "$DEPLOY_TEST_EXPECT_ADS_ENABLED" ]; then
  [ "$CHATGPT_ADS_ENABLED" = "$DEPLOY_TEST_EXPECT_ADS_ENABLED" ] || exit 98
  [ "$CHATGPT_ADS_CAPI_KEY" = "$DEPLOY_TEST_EXPECT_ADS_KEY" ] || exit 98
  [ "$CHATGPT_ADS_VALIDATE_ONLY" = "true" ] || exit 98
fi
case "$*" in
  *"prisma migrate deploy"*) if [ "$DEPLOY_TEST_FAIL_MIGRATION" = "1" ]; then exit 1; fi ;;
esac
`,
    { mode: 0o755 },
  );
  writeFileSync(join(bin, "curl"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
  const envFile = join(dir, ".env.production");
  writeFileSync(
    envFile,
    [
      "APP_DOMAIN='example.com'",
      "PUBLIC_SITE_URL='https://example.com'",
      "IMAGE_REPOSITORY='ghcr.io/example/web'",
      "IMAGE_TAG='test'",
      `CHATGPT_ADS_ENABLED='${options.enabled}'`,
      "CHATGPT_ADS_PIXEL_ID='synthetic-pixel'",
      `CHATGPT_ADS_CAPI_KEY='${options.key ?? ""}'`,
      "CHATGPT_ADS_VALIDATE_ONLY='false'",
    ].join("\n"),
  );
  const result = spawnSync("sh", [resolve("infra/deploy/deploy.sh")], {
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      ENV_FILE: envFile,
      COMPOSE_FILE: resolve("infra/production/docker-compose.yml"),
      APP_DIR: dir,
      IMAGE_REPOSITORY: "",
      IMAGE_TAG: "",
      GHCR_USERNAME: "",
      GHCR_TOKEN: "",
      PIPELINE_CHATGPT_ADS_CONFIG: options.pipeline ? "1" : "0",
      PIPELINE_CHATGPT_ADS_ENABLED: options.pipeline?.enabled ?? "false",
      PIPELINE_CHATGPT_ADS_CAPI_KEY: options.pipeline?.key ?? "",
      PIPELINE_CHATGPT_ADS_PIXEL_ID: "pipeline-pixel",
      PIPELINE_CHATGPT_ADS_VALIDATE_ONLY: "true",
      DEPLOY_TEST_EXPECT_ADS_ENABLED: options.pipeline?.enabled ?? "",
      DEPLOY_TEST_EXPECT_ADS_KEY: options.pipeline?.key ?? "",
      DEPLOY_TEST_CALLS: calls,
      DEPLOY_TEST_FAIL_MIGRATION: options.migrationFails ? "1" : "0",
    },
  });
  return {
    ...result,
    calls: readFileSync(calls, "utf8"),
    envFile: readFileSync(envFile, "utf8"),
  };
}

describe("automatic Ads worker deployment", () => {
  it("uses GitHub values for all commands without rewriting server credentials", () => {
    const result = deploy({
      enabled: false,
      key: "old-local-key",
      pipeline: { enabled: "true", key: "new-pipeline-key" },
    });
    expect(result.status).toBe(0);
    expect(result.calls).toContain("up -d ads-conversion-worker");
    expect(result.envFile).toContain("old-local-key");
    expect(result.envFile).not.toContain("new-pipeline-key");
    expect(result.stdout + result.stderr + result.calls).not.toContain(
      "new-pipeline-key",
    );
  });
  it("honours GitHub deactivation even if the server file still enables Ads", () => {
    const result = deploy({
      enabled: true,
      key: "old-local-key",
      pipeline: { enabled: "false", key: "" },
    });
    expect(result.status).toBe(0);
    expect(result.calls).not.toContain("up -d ads-conversion-worker");
  });
  it("does not fall back to a stale server key if the enabled GitHub configuration is incomplete", () => {
    const result = deploy({
      enabled: true,
      key: "old-local-key",
      pipeline: { enabled: "true", key: "" },
    });
    expect(result.status).not.toBe(0);
    expect(result.calls).toBe("");
  });
  it("starts the worker after successful migration and app recreation", () => {
    const result = deploy({ enabled: true, key: "synthetic-key" });
    expect(result.status).toBe(0);
    const stop = result.calls.indexOf("stop ads-conversion-worker");
    const migrate = result.calls.indexOf("prisma migrate deploy");
    const app = result.calls.indexOf("up -d app ");
    const start = result.calls.indexOf("up -d ads-conversion-worker");
    expect(stop).toBeGreaterThan(-1);
    expect(migrate).toBeGreaterThan(stop);
    expect(app).toBeGreaterThan(migrate);
    expect(start).toBeGreaterThan(app);
    expect(result.stdout + result.stderr + result.calls).not.toContain(
      "synthetic-key",
    );
  });
  it("stops the worker and leaves it stopped when Ads is disabled, without requiring credentials", () => {
    const result = deploy({ enabled: false });
    expect(result.status).toBe(0);
    expect(result.calls).toContain("stop ads-conversion-worker");
    expect(result.calls).not.toContain("up -d ads-conversion-worker");
  });
  it("rejects activation with missing credentials before touching running services", () => {
    const result = deploy({ enabled: true });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("CHATGPT_ADS_CAPI_KEY is required");
    expect(result.calls).toBe("");
  });
  it("does not restart the worker or application if the migration fails", () => {
    const result = deploy({
      enabled: true,
      key: "synthetic-key",
      migrationFails: true,
    });
    expect(result.status).not.toBe(0);
    expect(result.calls).not.toContain("up -d ads-conversion-worker");
    expect(result.calls).not.toContain("up -d app ");
  });
});
