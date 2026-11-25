# bt-web-v2

Next.js frontend for UBC BizTech. Backend lives in the sibling repo `serverless-biztechapp`.

- `npm run dev` / `npm run build` / `npm run lint`
- Feature code: `src/features/<feature>/`, pages: `src/pages/`

## Notion

Specs and workflow docs live in Notion. Read them with the Notion MCP server (`.mcp.json`) — fetch the page, don't guess from memory.

<!-- Add frontend-relevant pages here. Pages covering both repos go in both CLAUDE.md files. -->
- Product+ 2026 workflow specs: <notion-url>
- Dev onboarding / env setup: <notion-url>

When Notion and the code disagree, the code (or a newer PR) wins — leave a comment noting what supersedes the Notion page, e.g. `src/features/product+/2026/submission/api.ts`.

Writing to Notion (status updates, comments) is visible to the whole team: ask before every write.
