// @vitest-environment node
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  existsSync,
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
function generate(overrides: Record<string, string> = {}) {
  return spawnSync(
    "python3",
    [resolve("infra/deploy/github-deploy-payload.py")],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        VPS_APP_DIR: "/srv/jimboats/web",
        IMAGE_REPOSITORY: "ghcr.io/example/web",
        IMAGE_TAG: "sha-test",
        APP_CHANGED: "true",
        GHCR_USERNAME: "test-user",
        GHCR_TOKEN: "synthetic-token",
        CHATGPT_ADS_ENABLED: "false",
        CHATGPT_ADS_PIXEL_ID: "",
        CHATGPT_ADS_CAPI_KEY: "",
        CHATGPT_ADS_VALIDATE_ONLY: "true",
        ...overrides,
      },
    },
  );
}

describe("GitHub deployment over SSH stdin", () => {
  it.each<Record<string, string>>([
    { CHATGPT_ADS_ENABLED: "true" },
    { CHATGPT_ADS_ENABLED: "true", CHATGPT_ADS_PIXEL_ID: "pixel" },
    { CHATGPT_ADS_ENABLED: "yes" },
    { CHATGPT_ADS_VALIDATE_ONLY: "no" },
    { CHATGPT_ADS_CAPI_KEY: "synthetic\nsecond-line" },
  ])(
    "refuses invalid settings without emitting a partial script",
    (overrides) => {
      const result = generate(overrides);
      expect(result.status).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).not.toContain("second-line");
    },
  );

  it("preserves special characters as data and never executes their shell syntax", () => {
    const dir = mkdtempSync(join(tmpdir(), "jimboats-gh-ads-"));
    directories.push(dir);
    const appDir = join(dir, "app with spaces");
    mkdirSync(join(appDir, "infra/deploy"), { recursive: true });
    const output = join(dir, "received.json");
    const marker = join(dir, "must-not-exist");
    const key = `synthetic'\"$(touch ${marker})\`touch ${marker}\`$HOME\\tail`;
    writeFileSync(
      join(appDir, "infra/deploy/deploy.sh"),
      `#!/bin/sh\nexec python3 -c 'import os,json; open(os.environ["TEST_RECEIVED"],"w").write(json.dumps(dict(os.environ)))'\n`,
    );
    const result = generate({
      VPS_APP_DIR: appDir,
      CHATGPT_ADS_ENABLED: "true",
      CHATGPT_ADS_PIXEL_ID: "pixel",
      CHATGPT_ADS_CAPI_KEY: key,
      APP_CHANGED: "false",
    });
    expect(result.status).toBe(0);
    const remote = spawnSync("sh", ["-s"], {
      input: result.stdout,
      encoding: "utf8",
      env: { ...process.env, TEST_RECEIVED: output },
    });
    expect(remote.status).toBe(0);
    expect(remote.stdout + remote.stderr).toBe("");
    expect(existsSync(marker)).toBe(false);
    const received = JSON.parse(readFileSync(output, "utf8"));
    expect(received.PIPELINE_CHATGPT_ADS_CAPI_KEY).toBe(key);
    expect(received.PIPELINE_CHATGPT_ADS_ENABLED).toBe("true");
    expect(received.PIPELINE_CHATGPT_ADS_CONFIG).toBe("1");
    expect(received.IMAGE_TAG).toBe("latest");
    expect(received.GHCR_TOKEN).toBe("synthetic-token");
  });
  it("defaults to disabled + validation mode", () => {
    const result = generate({
      CHATGPT_ADS_ENABLED: "",
      CHATGPT_ADS_VALIDATE_ONLY: "",
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "export PIPELINE_CHATGPT_ADS_ENABLED=false",
    );
    expect(result.stdout).toContain(
      "export PIPELINE_CHATGPT_ADS_VALIDATE_ONLY=true",
    );
    expect(result.stdout).toContain("export IMAGE_TAG=sha-test");
  });
});
