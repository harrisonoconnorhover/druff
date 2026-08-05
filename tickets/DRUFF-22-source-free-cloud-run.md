---
id: DRUFF-22
title: Ship a source-free Cloud Run interface image
status: done
---

## Goal

Package Druff's existing browser interface for GCP without moving graph persistence or operational
authority out of Dander's loopback service.

## Acceptance

- [x] A pinned multi-stage image builds the Next.js static export.
- [x] The final image runs as a non-root user on Cloud Run's injected port.
- [x] Repository source, tests, Git metadata, and lockfiles are absent from the final image.
- [x] CI starts the image, checks the source-free boundary, and scans it.
- [x] Public instructions preserve the local Dander API and exact-origin contract.

## Implementation notes

Dander owns the optional Cloud Run resource and receives this image only by immutable digest. The
final image contains BusyBox's static HTTP server but no Node runtime or package tree. Druff has no
hosted backend, graph storage, cloud credentials, or deployment endpoint.
