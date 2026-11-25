---
description: Fetch a Notion spec page and implement it
argument-hint: <notion-url or page title>
---

Implement the Notion spec: $ARGUMENTS

1. **Fetch** — Use the Notion MCP server to fetch the page (search by title if no URL was given). Also fetch child pages and comments that hold requirements. If the Notion tools aren't available, stop and tell me to run `/mcp` to authenticate.
2. **Summarize** — List the requirements as a checklist, quoting the spec where wording matters. Call out anything ambiguous or missing.
3. **Map to code** — Find the files involved. Frontend is `bt-web-v2`, backend is `serverless-biztechapp`; check both sibling repos if they're present. Flag every place the spec conflicts with existing code, and note which one you'd treat as the source of truth.
4. **Wait** — Stop here and let me confirm the plan and resolve the open questions before writing any code.
5. **Implement** — Match the surrounding code's conventions. Run lint/type checks for the repos you touched.
6. **Hand off** — Summarize what changed per repo, which checklist items are done, and what's left. Don't commit, push, or write to Notion; offer the Notion status update/comment as a separate step I approve.
