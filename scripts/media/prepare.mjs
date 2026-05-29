import { mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const manifestPath = path.join(repoRoot, "media/static/landing/manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const manifestDir = path.dirname(manifestPath);
const outputDir = path.join(repoRoot, manifest.outputDir);

await rm(outputDir, { force: true, recursive: true });
await mkdir(outputDir, { recursive: true });

for (const item of manifest.items) {
  const sourcePath = path.join(manifestDir, item.source);
  const image = sharp(sourcePath);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read dimensions for ${item.source}`);
  }

  const widths = item.widths.filter((width) => width <= metadata.width);

  if (widths.length === 0) {
    throw new Error(`No valid output widths for ${item.source}`);
  }

  for (const width of widths) {
    const outputPath = path.join(outputDir, `${item.slug}-${width}.webp`);

    await sharp(sourcePath)
      .resize({
        width,
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toFile(outputPath);
  }
}

console.log(
  `Prepared ${manifest.items.length} static media sources in ${manifest.outputDir}.`,
);
