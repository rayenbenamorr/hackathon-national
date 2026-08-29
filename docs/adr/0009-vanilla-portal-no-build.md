# ADR-0009 — A portal with no build step

**Status:** accepted · **Date:** 2026-08-28

## Context

§19 asks for a very simple web portal: ministry, status, APIs, relations, latest
events, sensors, logs, integration status, twin state, and a visual relationship
graph with broken integrations highlighted.

The reflex is React and Vite. That adds a dependency tree, a dev server, a
second port, a build, and a second thing that can fail on day one.

## Decision

Hand-written HTML, CSS and ES modules, served as static files by the same
process that runs the 24 ministries, on the same port. The graph is inline SVG:
24 nodes on a circle, edges curved through the centre, hover to isolate a
ministry's relations, red for broken.

`apps/admin-observability` is the same, at `/admin`.

## Consequences

- Nothing to install, nothing to build, instant load, one port to remember.
- A student can open `app.js` and read every line of the tool they are using.
- No component model. At this size that is a feature; past a few thousand lines
  it would not be.
- Live updates use Server-Sent Events — the gateway is the only wildcard
  subscriber on the bus, and it is explicitly excluded from the flow traces so
  "→ gateway" never appears in a student's picture.

## Alternatives rejected

**React + Vite.** The right tool for an application; here it is a build failure
between a student and their first look at the platform.

**A terminal dashboard.** Cheaper still, but the relation graph is the single
most useful artefact in the room and it needs to be seen.
