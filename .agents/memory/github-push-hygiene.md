---
name: GitHub push hygiene
description: Secret-scanning considerations when publishing this workspace to GitHub.
---

GitHub push protection scans every reachable commit, not just the latest tree. Any credential accidentally committed to Replit configuration must be removed from the entire publishable history before a normal push can succeed.

**Why:** A clean current file is insufficient when an older reachable commit still contains a detected secret; GitHub rejects the complete ref.

**How to apply:** Keep environment assignments out of tracked Replit configuration, validate the current tree for credential-like material, and if needed publish a sanitized snapshot based on the remote branch rather than bypassing repository protection.

Never print `git remote -v` output without first ensuring the remote URL is credential-free. A local `origin` URL may contain an access token; sanitize it in Git config before further remote operations, and advise the owner to rotate any exposed credential.

**Why:** A Git remote can store authentication material directly in its URL, where ordinary diagnostic output can reveal it.

**How to apply:** Prefer the repository URL without credentials and use an authorized integration or credential manager for remote access.