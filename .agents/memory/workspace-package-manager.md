---
name: Workspace package manager
description: Compatibility notes for installing and validating this pnpm workspace.
---

The workspace lockfile uses pnpm catalogs, so installs must use the pnpm version declared by the root package rather than an older global pnpm binary. The workspace also requires explicit approval for native package build scripts when pnpm reports them as ignored.

**Why:** An older pnpm runtime cannot resolve catalog specifiers, while a newer runtime exposes stale root-package version pins and build-script approval requirements that can otherwise prevent managed workflows from starting.

**How to apply:** When dependencies need to be restored, use the declared pnpm runtime, keep root dependency ranges resolvable, and verify `allowBuilds` in `pnpm-workspace.yaml` before restarting artifact workflows.