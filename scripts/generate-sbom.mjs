#!/usr/bin/env node

/**
 * WASHORA Production Software Bill of Materials (SBOM) Generator
 * Generates CycloneDX 1.5 JSON and SPDX 2.3 JSON artifacts for the build and deployment pipeline.
 */

import { SbomGeneratorEngine } from '../src/supply-chain/supply-chain-core.mjs';

function run() {
  console.log('📦 Starting WASHORA SBOM Generation...');
  const generator = new SbomGeneratorEngine();

  const cycloneDxResult = generator.generateCycloneDxJson();
  console.log(`✅ CycloneDX 1.5 JSON generated:`);
  console.log(`   - Components: ${cycloneDxResult.componentCount}`);
  console.log(`   - Path: ${cycloneDxResult.outputPath}`);
  console.log(`   - SHA-256: ${cycloneDxResult.sha256}`);

  const spdxResult = generator.generateSpdxJson();
  console.log(`✅ SPDX 2.3 JSON generated:`);
  console.log(`   - Packages: ${spdxResult.packageCount}`);
  console.log(`   - Path: ${spdxResult.outputPath}`);
  console.log(`   - SHA-256: ${spdxResult.sha256}`);

  console.log('🎉 SBOM Generation Complete!');
}

run();
