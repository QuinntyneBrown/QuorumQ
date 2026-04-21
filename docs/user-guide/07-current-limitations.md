# Current Limitations

This page lists the gaps and access quirks that matter when using the current build of QuorumQ.

## Lunch Scheduling

- Lunch sessions are created for the current time only.
- You cannot schedule a lunch for a future date.
- You cannot edit a session date after creation.
- You cannot edit the deadline after creation.
- The only workaround is to cancel the session and create a new one.

## Direct-Link Screens

- Team invite management is on `/teams/<team-id>/invites`.
- Team history is on `/teams/<team-id>/history`.
- The generic `/history` route is present in the shell, but it is not wired to a working page in the current build.

## Team Administration

- You can create teams.
- You can switch teams.
- You cannot currently rename a team after creation.
- You cannot currently edit a team description after creation.
- You cannot currently remove members from a team in the UI.
- You cannot currently promote or demote members in the UI.

## Invite Delivery

- QuorumQ generates shareable invite links.
- QuorumQ does not send invitation emails on your behalf in the current build.
- The normal way to invite someone is to copy the link and send it through another channel.

## Authentication Gaps

- The sign-in screen shows `Forgot password?`, but a password reset flow is not implemented.
- Email verification delivery may depend on environment setup. Some local or test environments log the verification token instead of sending a real email.

## Role And Permission Mismatches

- The team dashboard shows `Start lunch` even though session creation is restricted to owners and admins in the backend.
- Only the person who started a session can start voting or cancel that same session.
