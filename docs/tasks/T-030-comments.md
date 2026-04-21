# T-030 — Comments on suggestions

**Traces to:** L1-06, L1-07 / L2-16
**Depends on:** T-024, T-022
**Primary area:** full stack
**Design refs:** `docs/designs/07-screens-session.md`
**Folder structure:** `docs/folder-structure.md` §4 (`Endpoints/CommentEndpoints.cs`), §5.1 (`features/comments/`)
**Status:** Assigned

## Goal

During any active session state, members comment on any suggestion.
Comments appear in the thread for all members in real time. Authors can
edit within 5 minutes and delete their own comments.

## Scope

### Backend — `src/api/Endpoints/CommentEndpoints.cs`
- `POST /sessions/:id/suggestions/:suggestionId/comments` — body
  `{ body (1–500) }`. Creates `Comment`; emits `CommentAdded`.
- `PUT /comments/:id` — body `{ body }`. Author only, ≤ 5 min from
  `CreatedAt` (else 409). Sets `EditedAt`; emits `CommentEdited`.
- `DELETE /comments/:id` — author only. Sets `DeletedAt`; emits
  `CommentDeleted`.
- `GET /sessions/:id/comments` — list with author summaries.
- Session must be in an active state (`Suggesting`, `Voting`, tie-break,
  but not `Decided` / `Cancelled`) for create (L2-16 says "any active
  state"; clarifies to exclude Decided/Cancelled since they are
  post-active).

### Frontend — `features/comments/comment-thread.component.ts`
- Inline thread under each suggestion; collapsible on mobile.
- Input with character counter via `matInput` + `matHint`.
- Edit / delete icons only on the user's own comments.
- "Comment deleted" placeholder retained (per L2-16 acceptance).
- Subscribes to hub events to append / update / mark deleted in place.

### E2E — `tests/e2e/pages/sessions/session.page.ts`
- Add `openThread(restaurantName)`, `postComment(text)`,
  `editComment(index, newText)`, `deleteComment(index)`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/comments/L2-16.comment.spec.ts`:
  - `[L2-16] 1–500 char comment appears for all members in real time, attributed to the author`
  - `[L2-16] author edits within 5 minutes; comment displays "edited"`
  - `[L2-16] author deletes their comment; thread shows "Comment deleted"`

## Folder-structure pointers

- `src/api/Endpoints/CommentEndpoints.cs`
- `src/web/projects/app/src/app/features/comments/comment-thread.component.ts`
- `tests/e2e/specs/comments/L2-16.comment.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes on all browsers.
- [ ] 5-minute edit window enforced at the API (not UI-only).
- [ ] Two contexts see comment add/edit/delete within 2 s (L2-19).
- [ ] Character counter announces to screen readers when near the limit
      (L2-28 partial).
