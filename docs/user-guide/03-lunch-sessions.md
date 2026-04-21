# Lunch Sessions

## Start A Lunch Session

> Permission note: the current backend allows team owners and admins to create a lunch session. Regular members may still see the button, but the request may not succeed.

1. Open the team dashboard at `/teams/<team-id>`.
2. Select `Start lunch`.
3. Choose a voting deadline between 5 and 180 minutes.
4. Review the `Session ends at ...` hint.
5. Select `Start lunch`.
6. QuorumQ opens the new session in the `Suggesting` state.

### What Happens Next

- The active session card appears on the team dashboard.
- Other team members see the session in real time.
- If an active session already exists, `Start lunch` opens the existing session instead of creating a duplicate one.

## Open The Active Session

1. Open the team dashboard.
2. Find the active session card at the top of the page.
3. Select `View session`.
4. QuorumQ opens the live lunch session page.

## Change The Date Or Deadline Of A Lunch

QuorumQ does not currently support editing a session's date or deadline after it has been created.

### What This Means

- The session date is the moment you started the lunch session.
- There is no future-date scheduling flow.
- The deadline can only be chosen during creation.

### Workaround

1. Open the active session.
2. If you started the session, select `Cancel session`.
3. Confirm the cancellation.
4. Go back to the team dashboard.
5. Start a new session at the correct time with the correct deadline.

## Start Voting

> Only the person who started the session can do this.

1. Open the live session while it is still in `Suggesting`.
2. Select `Start voting`.
3. QuorumQ changes the session to `Voting`.
4. The suggestion form becomes read-only and new suggestions are blocked.

## Cancel A Session

> Only the person who started the session can do this.

1. Open the live session while it is still active.
2. Select `Cancel session`.
3. Confirm the cancellation.
4. QuorumQ changes the session to `Cancelled`.
5. The page becomes read-only and no winner is declared.

## Tie-Break Rounds

If voting ends in a tie for first place, QuorumQ automatically starts a tie-break round.

### What You Will See

- A `Tie-break round!` banner.
- A second countdown for the tie-break deadline.
- Voting limited to tied restaurants only.

### Timing

- The tie-break round lasts 2 minutes in the current build.
- If the tie is still unresolved after that, QuorumQ randomly selects one of the tied restaurants and marks it as `Chosen at random`.

## Winner Reveal

When the session reaches `Decided`, QuorumQ routes every viewer to the winner screen.

### Available Actions

- `Get directions` if the winning restaurant has an address.
- `Open website` if the winning restaurant has a website URL.
- `View restaurant profile` for the winning restaurant.
- `Back to session` to return to the session page.

## Live Presence And Reconnection

### Presence

- The session page shows avatars for people currently viewing the session.
- Up to five avatars are shown before the overflow counter appears.

### Reconnection

- If the real-time connection drops, QuorumQ shows `Reconnecting…`.
- Once the connection returns, the page resyncs automatically.

## Session States In Order

1. `Suggesting`
2. `Voting`
3. `Decided`

Or, if the organizer stops it early:

1. `Suggesting` or `Voting`
2. `Cancelled`
