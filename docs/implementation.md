# VibeMD Implementation Notes

## 2024-00-00 — Project Scaffold

- Initialized a Next.js + React + TypeScript skeleton to host the VibeMD app.
- Added placeholder routes for the document list and editor workspace pages.
- Added a simple health check API route to validate the server is running.

## 2024-00-00 — Core Flow Wiring

- Added SQLite-backed document storage at `~/.vibemd/vibemd.db` using `better-sqlite3`.
- Implemented document CRUD API routes (`/api/documents`).
- Implemented OpenAI proposal generation route with a minimal system prompt.
- Added block/sentence diff utilities (LCS-based) and patch application logic.
- Added patch diff/apply API routes with snapshot recording for rollback safety.
- Added Markdown-to-HTML rendering pipeline using unified/remark/rehype with KaTeX.
- Added export pipeline that renders Markdown and generates a PDF via Playwright.
- Built the initial editor workspace UI with editor, preview, Vibe panel, and patch stack.

## 2024-00-00 — Conflict Handling & Export UX

- Added client-side conflict handling that re-diffs when the base hash changes.
- Added a snapshot-backed revert endpoint and UI control to roll back the last apply.
- Added Markdown export alongside PDF export, sharing the same download endpoint.
- Updated workspace header actions with export buttons and notices.

## Next Steps

- Add richer UI controls for sentence-level accept/reject and patch summaries.
- Improve diff visualization for complex Markdown blocks.
- Add an applied patch history view for managing multiple snapshots.
