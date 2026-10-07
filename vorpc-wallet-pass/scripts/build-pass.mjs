#!/usr/bin/env node
/**
 * Build a VORPC Apple Wallet .pkpass
 *
 * Signed build (installable on iPhone):
 *   Place these files in ./certs/
 *     - signerCert.pem   (Pass Type ID certificate)
 *     - signerKey.pem    (private key)
 *     - wwdr.pem         (Apple WWDR G4 intermediate)
 *   Optional: signerKeyPassphrase via PASS_KEY_PASSPHRASE
 *   Then: npm run build
 *
 * Unsigned bundle (structure only — will NOT install on iPhone):
 *   npm run build:unsigned
 */

import { createRequire } from "node:module";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  readdirSync,
  statSync,
  createWriteStream,
} from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assetsDir = join(root, "assets");
const certsDir = join(root, "certs");
const outDir = join(root, "dist");
const unsigned = process.argv.includes("--unsigned");

const PASS_IMAGES = [
  "icon.png",
  "paula.r@example.org",
  "carlos.r@example.net",
  "logo.png",
  "rachel.c@example.org",
  "aaron.s@example.org",
  "thumbnail.png",
  "uma.s@example.org",
  "james.b@example.com",
];

function sha1File(path) {
  return createHash("sha1").update(readFileSync(path)).digest("hex");
}

function buildUnsignedBundle() {
  const bundleDir = join(outDir, "pass.unsigned");
  mkdirSync(bundleDir, { recursive: true });

  const pass = JSON.parse(readFileSync(join(root, "pass.json"), "utf8"));
  writeFileSync(join(bundleDir, "pass.json"), JSON.stringify(pass, null, 2));

  const manifest = {};
  for (const name of PASS_IMAGES) {
    const src = join(assetsDir, name);
    if (!existsSync(src)) {
      console.warn(`Missing asset: ${name}`);
      continue;
    }
    copyFileSync(src, join(bundleDir, name));
    manifest[name] = sha1File(src);
  }
  manifest["pass.json"] = sha1File(join(bundleDir, "pass.json"));
  writeFileSync(join(bundleDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  const zipPath = join(outDir, "VORPC-Yasser-Gnabou.unsigned.pkpass");
  if (existsSync(zipPath)) {
    spawnSync("rm", ["-f", zipPath]);
  }
  const zip = spawnSync(
    "zip",
    ["-r", "-X", zipPath, ...readdirSync(bundleDir)],
    { cwd: bundleDir, encoding: "utf8" }
  );
  if (zip.status !== 0) {
    throw new Error(`zip failed: ${zip.stderr || zip.stdout}`);
  }
  console.log(`Wrote unsigned pass: ${zipPath}`);
  console.log(
    "This file will NOT install on iPhone until signed with an Apple Pass Type ID certificate."
  );
  return zipPath;
}

async function buildSignedPass() {
  const signerCert = join(certsDir, "signerCert.pem");
  const signerKey = join(certsDir, "signerKey.pem");
  const wwdr = join(certsDir, "wwdr.pem");

  for (const f of [signerCert, signerKey, wwdr]) {
    if (!existsSync(f)) {
      throw new Error(
        `Missing ${f}\n\nExport your Pass Type ID cert + key and Apple WWDR G4 into ./certs/ then retry.\nSee README.md`
      );
    }
  }

  const require = createRequire(import.meta.url);
  let PKPass;
  try {
    ({ PKPass } = require("passkit-generator"));
  } catch {
    throw new Error("passkit-generator not installed. Run: npm install");
  }

  const buffers = {};
  buffers["pass.json"] = readFileSync(join(root, "pass.json"));
  for (const name of PASS_IMAGES) {
    const src = join(assetsDir, name);
    if (existsSync(src)) buffers[name] = readFileSync(src);
  }

  const pass = new PKPass(buffers, {
    wwdr: readFileSync(wwdr),
    signerCert: readFileSync(signerCert),
    signerKey: readFileSync(signerKey),
    signerKeyPassphrase: process.env.PASS_KEY_PASSPHRASE || undefined,
  });

  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "VORPC-Yasser-Gnabou.pkpass");
  writeFileSync(outPath, pass.getAsBuffer());
  console.log(`Wrote signed pass: ${outPath}`);
  console.log("AirDrop / email this file to your iPhone, then tap to add to Wallet.");
  return outPath;
}

mkdirSync(outDir, { recursive: true });

if (unsigned) {
  buildUnsignedBundle();
} else {
  try {
    await buildSignedPass();
  } catch (err) {
    console.error(String(err.message || err));
    console.error("\nFalling back to unsigned bundle…\n");
    buildUnsignedBundle();
    process.exitCode = 1;
  }
}
