#!/usr/bin/env node

/**
 * WASHORA Production Release Manifest & Provenance Generator
 * Generates cryptographic release-manifest.json containing commit SHA, lockfile hash, migration version, and build timestamp.
 */

import { ReleaseProvenanceEngine } from '../src/supply-chain/supply-chain-core.mjs';

function run() {
  console.log('🏷️ Generating WASHORA Production Release Manifest...');
  const engine = new ReleaseProvenanceEngine();

  const result = engine.generateManifest();
  console.log(`✅ Release Manifest created at ${result.manifestPath}`);
  console.log(`   - Application: ${result.manifest.application}@${result.manifest.version}`);
  console.log(`   - Git Commit: ${result.manifest.gitCommit}`);
  console.log(`   - Lockfile Hash (SHA-256): ${result.manifest.lockfileSha256}`);
  console.log(`   - Database Migration: ${result.manifest.databaseMigration}`);
  console.log(`   - Node Runtime: ${result.manifest.nodeVersion}`);
  console.log(`   - Manifest Digest: ${result.manifestSha256}`);
  console.log('🎉 Release Provenance Attestation Complete!');
}

run();
