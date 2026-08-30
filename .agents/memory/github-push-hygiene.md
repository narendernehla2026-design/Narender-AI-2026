---
name: GitHub push hygiene
description: Secret-scanning considerations when publishing this workspace to GitHub.
---

GitHub push protection scans every reachable commit, not just the latest tree. Any credential accidentally committed to Replit configuration must be removed from the entire publishable history before a normal push can succeed.

**Why:** A clean current file is insufficient when an older reachable commit still contains a detected secret; GitHub rejects the complete ref.

**How to apply:** Keep environment assignments out of tracked Replit configuration, validate the current tree for credential-like material, and if needed publish a sanitized snapshot based on the remote branch rather than bypassing repository protection.