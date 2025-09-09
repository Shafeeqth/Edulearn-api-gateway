#!/usr/bin/env node
/* eslint-disable no-console */
const { spawnSync } = require('child_process');
const path = require('path');

const svc = process.argv[2];
if (!svc) {
    console.error('Usage: node scripts/gen-proto.js <service>');
    process.exit(1);
}

const repoRoot = path.resolve(__dirname, '..');
const svcDir = path.join(repoRoot, 'src', 'domains', 'service-clients', svc, 'proto');
const outDir = path.join(svcDir, 'generated');

// Resolve ts-proto plugin path cross-platform
const pluginBase = path.join(repoRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'protoc-gen-ts_proto.cmd' : 'protoc-gen-ts_proto');

const args = [
    `--plugin=protoc-gen-ts_proto=${pluginBase}`,
    `--ts_proto_out=${outDir}`,
    `--ts_proto_opt=outputServices=grpc-js,esModuleInterop=true`,
    '-I', svcDir,
    path.join(svcDir, '*.proto'),
];

const result = spawnSync('npx', ['protoc', ...args], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
});

if (result.status !== 0) {
    process.exit(result.status || 1);
}

console.log(`Generated ts-proto for ${svc}`);


