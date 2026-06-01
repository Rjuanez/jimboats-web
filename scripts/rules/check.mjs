import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const repoRoot = process.cwd();
const failures = [];

const ignoredDirectories = new Set([
  ".code-review-graph",
  ".git",
  ".next",
  ".obsidian",
  "coverage",
  "node_modules",
  "playwright-report",
  "storybook-static",
  "test-results",
]);

const textExtensions = new Set([
  ".css",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".prisma",
  ".sh",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

function toRel(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

function resolveRel(relativePath) {
  return path.join(repoRoot, relativePath);
}

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return readFileSync(resolveRel(relativePath), "utf8");
}

function exists(relativePath) {
  return existsSync(resolveRel(relativePath));
}

function expectFile(relativePath) {
  if (!exists(relativePath)) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function expectFileContains(relativePath, needle, message) {
  if (!exists(relativePath)) {
    fail(`Missing required file: ${relativePath}`);
    return;
  }

  if (!read(relativePath).includes(needle)) {
    fail(message);
  }
}

function listFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = readdirSync(directory);
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry);
    const relativePath = toRel(absolutePath);
    const stat = statSync(absolutePath);

    if (stat.isDirectory()) {
      if (!ignoredDirectories.has(entry)) {
        files.push(...listFiles(absolutePath));
      }
      continue;
    }

    if (stat.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

function isTextFile(relativePath) {
  return (
    relativePath === "Dockerfile" ||
    textExtensions.has(path.extname(relativePath))
  );
}

function allTextFiles() {
  return listFiles(repoRoot).filter((file) => {
    return file !== "scripts/rules/check.mjs" && isTextFile(file);
  });
}

function trackedFiles() {
  try {
    return execFileSync("git", ["ls-files", "-z"], {
      cwd: repoRoot,
      encoding: "utf8",
    })
      .split("\0")
      .filter(Boolean);
  } catch {
    return [];
  }
}

function assertRequiredRuleFiles() {
  [
    "AGENTS.md",
    "AGENT.md",
    "architecture.md",
    "implementation.md",
    "stack.md",
    "testing.md",
    "ui-ux.md",
    "workflow.md",
  ].forEach(expectFile);
}

function assertParentWorkspaceAgent() {
  const parentWebAgent = path.resolve(repoRoot, "../web/AGENTS.md");

  if (!existsSync(parentWebAgent)) {
    return;
  }

  const parentAgent = path.resolve(repoRoot, "../AGENTS.md");

  if (!existsSync(parentAgent)) {
    fail("Missing parent workspace AGENTS.md pointing to web/AGENTS.md");
    return;
  }

  const content = readFileSync(parentAgent, "utf8");

  if (!content.includes("web/AGENTS.md")) {
    fail("Parent workspace AGENTS.md must reference web/AGENTS.md");
  }
}

function assertWorkflowContracts() {
  expectFileContains(
    "AGENT.md",
    "Normas leidas",
    "AGENT.md must require a Normas leidas block before implementation proposals",
  );
  expectFileContains(
    "workflow.md",
    "Normas leidas",
    "workflow.md must include the Normas leidas block in the proposal format",
  );
  expectFileContains(
    "workflow.md",
    "rules:check",
    "workflow.md must include rules:check in final verification",
  );
  expectFileContains(
    "implementation.md",
    "rules:check",
    "implementation.md must include rules:check as an automated rule gate",
  );
  expectFileContains(
    "testing.md",
    "pnpm rules:check",
    "testing.md must document pnpm rules:check",
  );
  expectFileContains(
    "stack.md",
    "pnpm rules:check",
    "stack.md must document pnpm rules:check in CI/CD",
  );
}

function assertPackageScripts() {
  const packageJson = JSON.parse(read("package.json"));

  if (packageJson.scripts?.["rules:check"] !== "node scripts/rules/check.mjs") {
    fail(
      'package.json must define "rules:check": "node scripts/rules/check.mjs"',
    );
  }
}

function assertCiRunsRulesCheck() {
  [".github/workflows/ci.yml", ".github/workflows/deploy.yml"].forEach(
    (workflowPath) => {
      expectFileContains(
        workflowPath,
        "pnpm rules:check",
        `${workflowPath} must run pnpm rules:check before verification/deploy`,
      );
    },
  );
}

function assertForbiddenPatterns() {
  if (exists("src/components/backpanel")) {
    fail(
      "src/components/backpanel is not allowed; use components/ui, layout, sections, forms or marketing",
    );
  }

  for (const file of trackedFiles()) {
    if (path.basename(file) === ".DS_Store") {
      fail(`Do not commit macOS metadata files: ${file}`);
    }
  }

  const textFiles = allTextFiles();
  const allContentForbidden = [
    {
      pattern: /components\/backpanel/,
      message: "Do not import or reference components/backpanel",
    },
    {
      pattern: /demoExperiences/,
      message: "Do not use demoExperiences as application data",
    },
    {
      pattern: /pending implementation/i,
      message: "Do not leave pending implementation placeholders",
    },
    {
      pattern: /\/fr\b|French|Frances|frances/,
      message:
        "Initial locales are es, en and ca; do not introduce fr/French references",
    },
    {
      pattern: /\bSMS\b|internal channel/i,
      message:
        "Notification channels currently modeled for the product are email and WhatsApp",
    },
  ];

  for (const file of textFiles) {
    const content = read(file);

    for (const rule of allContentForbidden) {
      if (rule.pattern.test(content)) {
        fail(`${rule.message}: ${file}`);
      }
    }
  }

  const codeFiles = textFiles.filter((file) => {
    return /^(src|scripts|infra|tests)\//.test(file);
  });

  for (const file of codeFiles) {
    if (/\bTODO\b/.test(read(file))) {
      fail(`Do not leave TODO markers in code or infrastructure: ${file}`);
    }
  }
}

function assertNextPagesComposeComponents() {
  const pageFiles = listFiles(resolveRel("src/app")).filter((file) => {
    return file.endsWith("/page.tsx") || file === "src/app/page.tsx";
  });
  const structuralTags =
    /<(section|article|form|table|thead|tbody|tr|td|th|ul|ol|li)\b/;

  for (const pageFile of pageFiles) {
    if (structuralTags.test(read(pageFile))) {
      fail(
        `${pageFile} contains structural HTML; page.tsx files must compose components`,
      );
    }
  }
}

function assertAdminExperienceSliceExists() {
  [
    "src/app/admin/layout.tsx",
    "src/app/admin/page.tsx",
    "src/app/admin/experiences/page.tsx",
    "src/app/admin/experiences/new/page.tsx",
    "src/app/admin/experiences/[experienceId]/page.tsx",
    "src/app/admin/experiences/[experienceId]/content/page.tsx",
    "src/app/admin/experiences/[experienceId]/availability/page.tsx",
    "src/app/admin/experiences/[experienceId]/extras/page.tsx",
    "src/app/admin/experiences/[experienceId]/media/page.tsx",
    "src/app/admin/experiences/[experienceId]/publish/page.tsx",
    "src/components/layout/AdminShell.tsx",
    "src/components/forms/AdminFormControls.tsx",
    "src/components/ui/Badge.tsx",
    "src/components/ui/IconButton.tsx",
    "src/components/ui/Surface.tsx",
    "src/components/sections/admin-experiences/AdminExperiencesWorkspace.tsx",
    "src/components/sections/admin-experiences/AdminExperienceStore.tsx",
    "src/components/sections/admin-experiences/AdminExperienceReadiness.ts",
    "src/container.ts",
    "src/interface/next/actions/adminExperienceActions.ts",
    "src/interface/next/presenters/adminExperiencesPresenter.ts",
    "src/interface/next/validators/adminExperienceValidators.ts",
  ].forEach(expectFile);

  expectFileContains(
    "src/components/sections/admin-experiences/AdminExperienceStore.tsx",
    "saveExperience",
    "Admin experience slice must persist through Server Actions",
  );
  if (
    read(
      "src/components/sections/admin-experiences/AdminExperienceStore.tsx",
    ).includes("localStorage")
  ) {
    fail(
      "Admin experience slice must not persist editable catalog data in localStorage",
    );
  }
  expectFileContains(
    "src/components/sections/admin-experiences/AdminExperienceReadiness.ts",
    "Enabled fixed slots cannot overlap",
    "Admin experience readiness must guard against overlapping slots",
  );
  expectFileContains(
    "src/components/sections/admin-experiences/AdminExperienceContentSection.tsx",
    "GEO summary",
    "Admin content screen must expose GEO fields per locale",
  );
  expectFileContains(
    "src/components/sections/admin-experiences/AdminExperienceExtrasSection.tsx",
    "Notice hours",
    "Admin extras screen must expose per-experience notice windows",
  );
}

function assertPrismaClientUsesAdapter() {
  const prismaClientPath = "src/infrastructure/db/prisma/prismaClient.ts";
  const content = read(prismaClientPath);

  expectFileContains(
    prismaClientPath,
    "new PrismaPg",
    "Prisma 7 PostgreSQL client must be initialized with the pg driver adapter",
  );

  if (/new\s+PrismaClient\s*\(\s*\)/.test(content)) {
    fail("Prisma Client must not be constructed without adapter options");
  }
}

function parseComposeServices() {
  if (!exists("infra/production/docker-compose.yml")) {
    return new Set();
  }

  const services = new Set();
  const lines = read("infra/production/docker-compose.yml").split("\n");
  let insideServices = false;

  for (const line of lines) {
    if (line === "services:") {
      insideServices = true;
      continue;
    }

    if (insideServices && /^[a-zA-Z0-9_-]+:/.test(line)) {
      break;
    }

    const match = insideServices ? line.match(/^  ([a-zA-Z0-9_-]+):$/) : null;

    if (match) {
      services.add(match[1]);
    }
  }

  return services;
}

function assertDeployServicesExist() {
  const services = parseComposeServices();

  if (!exists("infra/deploy/deploy.sh")) {
    fail("Missing deploy script: infra/deploy/deploy.sh");
    return;
  }

  const deployLines = read("infra/deploy/deploy.sh").split("\n");

  for (const line of deployLines) {
    const match = line.match(/\bup\s+-d\s+(.+)$/);

    if (!match) {
      continue;
    }

    const requestedServices = match[1]
      .split(/\s+/)
      .map((service) => service.trim())
      .filter(Boolean);

    for (const service of requestedServices) {
      if (!services.has(service)) {
        fail(`deploy.sh starts missing compose service "${service}"`);
      }
    }
  }
}

assertRequiredRuleFiles();
assertParentWorkspaceAgent();
assertWorkflowContracts();
assertPackageScripts();
assertCiRunsRulesCheck();
assertForbiddenPatterns();
assertNextPagesComposeComponents();
assertAdminExperienceSliceExists();
assertPrismaClientUsesAdapter();
assertDeployServicesExist();

if (failures.length > 0) {
  console.error("rules:check failed");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("rules:check passed");
