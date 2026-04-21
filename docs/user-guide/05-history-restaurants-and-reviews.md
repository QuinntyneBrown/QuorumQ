# History, Restaurants, And Reviews

## Open Session History

> Access note: team history is currently on the direct route `/teams/<team-id>/history`.

1. Open the history route for the team you want.
2. Review the session list.
3. Use pagination if the team has many past sessions.

### What History Shows

- Session date
- Winner, if there was one
- Final tally for each restaurant
- Participant count

## Open A Past Session

1. On the history page, select a session card.
2. QuorumQ opens the read-only session detail page.
3. Review the suggestions, winner, vote totals, and comments.

### Read-Only Behavior

- You cannot start voting.
- You cannot suggest restaurants.
- You cannot post new comments.
- You cannot submit reviews from the history detail screen.

## Export History As CSV

> Only team owners can do this.

1. Open `/teams/<team-id>/history`.
2. Select `Export CSV`.
3. QuorumQ downloads a CSV file.
4. The file includes date, winner, cuisine, tally, and participant totals.

## Open A Restaurant Profile

You can open a restaurant profile from two places in the current build.

### From A Live Session

1. Open the session page.
2. Select the restaurant name in a suggestion card.

### From The Winner Reveal

1. Wait for the winner screen.
2. Select `View restaurant profile`.

### What The Profile Shows

- Restaurant name
- Cuisine
- Address
- Website
- Average team rating
- Review count
- Past reviews from the team

## Leave A Review After Lunch

> Only session participants can review the winning restaurant. In the current build, a participant is someone who either suggested a restaurant or cast a vote in that session.

1. Wait for the winner reveal screen.
2. Under `Rate this restaurant`, select 1 to 5 stars.
3. Optionally enter a written review.
4. Select `Submit review`.
5. QuorumQ saves the review and shows the updated average rating.

## Update Your Review

1. Return to the winner reveal for the same decided session.
2. Change the star rating or review text.
3. Select `Update review`.
4. QuorumQ replaces your previous review for that session.

## If You Did Not Participate

1. Open the winner reveal.
2. If you did not suggest or vote in that session, the review form is unavailable.
3. QuorumQ shows `Only participants can review this restaurant.`

## Restaurants With No Reviews

1. Open a restaurant profile that has not been reviewed yet.
2. QuorumQ shows `No reviews yet`.
3. Use the call to action to start a new lunch if you want the team to pick that restaurant in the future.
