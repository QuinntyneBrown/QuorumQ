# QuorumQ User Guide

This guide describes the current user-facing behavior in QuorumQ and links to step-by-step instructions for every major workflow in the app.

## Start Here

1. [Create an account, verify your email, and sign in](01-getting-started.md)
2. [Create or join a team](02-teams-and-invites.md)
3. [Start and manage a lunch session](03-lunch-sessions.md)
4. [Suggest restaurants, vote, and comment](04-suggestions-voting-and-comments.md)
5. [Use history, restaurant profiles, and reviews](05-history-restaurants-and-reviews.md)
6. [Change settings, notifications, theme, and account options](06-settings-notifications-and-account.md)
7. [Review current product limitations](07-current-limitations.md)

## Common Tasks

- [Create a team](02-teams-and-invites.md#create-a-team)
- [Send an invite link](02-teams-and-invites.md#send-an-invite-link)
- [Join a team from an invite link](02-teams-and-invites.md#join-a-team-from-an-invite-link)
- [Start lunch](03-lunch-sessions.md#start-a-lunch-session)
- [Change the date or deadline of a lunch](03-lunch-sessions.md#change-the-date-or-deadline-of-a-lunch)
- [Start voting](03-lunch-sessions.md#start-voting)
- [Suggest a restaurant](04-suggestions-voting-and-comments.md#suggest-a-restaurant)
- [Vote for a restaurant](04-suggestions-voting-and-comments.md#vote-for-a-restaurant)
- [Comment on a suggestion](04-suggestions-voting-and-comments.md#comment-on-a-suggestion)
- [Export session history as CSV](05-history-restaurants-and-reviews.md#export-history-as-csv)
- [Leave a review for the winning restaurant](05-history-restaurants-and-reviews.md#leave-a-review-after-lunch)
- [Mute notifications for one team](06-settings-notifications-and-account.md#change-notification-preferences)
- [Delete your account](06-settings-notifications-and-account.md#delete-your-account)

## Permissions At A Glance

| Action | Who can do it in the current build |
| --- | --- |
| Create an account | Any visitor |
| Create a team | Any signed-in user with a verified email |
| Generate invite links | Team owner or admin |
| Start a lunch session | Team owner or admin |
| Start voting | The person who started that session |
| Cancel a session | The person who started that session |
| Suggest restaurants | Team members while the session is in `Suggesting` |
| Vote | Team members while the session is in `Voting` |
| Comment | Team members while the session is active |
| Review the winning restaurant | Session participants only |
| Export team history as CSV | Team owner only |
| Change theme or notification preferences | Any signed-in user |
| Delete an account | Any signed-in user |

## Important Notes

- Lunch sessions are always created for the current day and current time. You cannot edit the date or deadline after the session has been created.
- Invite management is team-scoped at `/teams/<team-id>/invites`.
- Session history is team-scoped at `/teams/<team-id>/history`.
- The sign-in screen shows a `Forgot password?` link, but the reset flow is not implemented in the current build.
