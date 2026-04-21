# Teams And Invites

## Create A Team

1. Open `/teams/new`, or select `Create a team` from the no-teams screen.
2. Enter a team name between 3 and 50 characters.
3. Optionally add a description up to 200 characters.
4. Select `Create team`.
5. QuorumQ opens the new team dashboard and marks you as `Owner`.

## Switch Between Teams

1. Open the team switcher in the top bar.
2. Review the list of teams you belong to.
3. Select a team name.
4. QuorumQ changes the active team context for the rest of the app.

## Send An Invite Link

> Access note: invite management is currently on the direct team route `/teams/<team-id>/invites`.

1. Open the invite screen for the team you want to share.
2. Select `Generate invite`.
3. QuorumQ creates a new invite row and shows its expiry date.
4. Select the copy icon to copy the invite URL to your clipboard.
5. Paste that URL into chat or email outside QuorumQ.

### What To Expect

- Invite links expire 7 days after they are created.
- Only active, non-revoked links stay visible in the list.
- Team owners and admins can generate invite links.

## Revoke An Invite Link

1. Open the invite screen for the team.
2. Find the invite you want to disable.
3. Select the revoke icon.
4. Confirm the action in the dialog.
5. The link stops working immediately.

## Join A Team From An Invite Link

### Option 1: Open The Link Directly

1. Sign in to QuorumQ.
2. Open the invite URL you received.
3. Review the team name and member count on the preview screen.
4. Select `Join team`.
5. QuorumQ adds you to the team as a `Member` and opens that team dashboard.

### Option 2: Paste The Link On The No-Teams Screen

1. Open `/teams/no-teams`.
2. Select `I have an invite link`.
3. Paste the invite URL into the input.
4. Select `Go`.
5. QuorumQ opens the invite preview so you can join.

## If An Invite Is Invalid

1. Open the invite link.
2. If the link is expired or revoked, QuorumQ shows `Invite no longer valid`.
3. Use the `Contact your team` action to request a fresh invite.

## Team Features In The Current Build

- Team creation is supported.
- Team switching is supported.
- Invite link generation, copy, revoke, preview, and accept are supported.
- Renaming a team, editing a team description after creation, removing members, and changing member roles are not exposed in the current UI.
