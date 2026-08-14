# syntax=docker/dockerfile:1.7

FROM --platform=$BUILDPLATFORM node:22.23.2-alpine3.23@sha256:46825fbbd4e996a78b7a2cdc08d75e38a5a505bdab95dcda55605359bf124bc6 AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
ARG SOURCE_REVISION=unrecorded
ARG SOURCE_DATE_EPOCH=0
ENV DRUFF_SOURCE_REVISION=$SOURCE_REVISION
ENV SOURCE_DATE_EPOCH=$SOURCE_DATE_EPOCH
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM caddy:2.10.2-alpine@sha256:4c6e91c6ed0e2fa03efd5b44747b625fec79bc9cd06ac5235a779726618e530d AS runner

ARG SOURCE_REVISION=unrecorded
ARG SOURCE_CREATED=1970-01-01T00:00:00Z
ARG DRUFF_VERSION=0.1.0

LABEL org.opencontainers.image.title="Druff"
LABEL org.opencontainers.image.description="Static, provider-neutral Dander control-plane interface"
LABEL org.opencontainers.image.source="https://github.com/harrisonoconnorhover/druff"
LABEL org.opencontainers.image.revision=$SOURCE_REVISION
LABEL org.opencontainers.image.created=$SOURCE_CREATED
LABEL org.opencontainers.image.version=$DRUFF_VERSION

WORKDIR /app

COPY --chown=65532:65532 Caddyfile /etc/caddy/Caddyfile
COPY --from=builder --chown=65532:65532 /app/out ./

ENV HOME=/tmp
ENV XDG_CONFIG_HOME=/tmp/caddy-config
ENV XDG_DATA_HOME=/tmp/caddy-data

USER 65532:65532

EXPOSE 8080

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
