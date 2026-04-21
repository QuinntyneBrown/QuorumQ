# Getting Started

## Before You Start

- You need an email address and password.
- Passwords must be at least 10 characters and include an uppercase letter, lowercase letter, number, and special character.
- QuorumQ remembers your session across reloads and browser restarts until you sign out or the session expires.

## Create An Account

1. Open `/auth/sign-up`.
2. Enter your display name, email address, and password.
3. Review the password rules under the password field until every rule is satisfied.
4. Select `Create account`.
5. QuorumQ signs you in immediately and opens the `Verify your email` page.

## Verify Your Email

1. On `Verify your email`, check the address shown on the page.
2. Open the verification link that was sent for your account.
3. After the link succeeds, select `Go to app` or open `/teams`.

> Environment note: some local or development environments log the verification token on the API side instead of sending a real email.

## Sign In

1. Open `/auth/sign-in`.
2. Enter your email address and password.
3. Select `Sign in`.
4. After a successful sign-in, QuorumQ sends you to your last active team if one is known. Otherwise it sends you to `/teams`.

## Rate-Limited Sign-In Attempts

1. If you enter invalid credentials repeatedly, QuorumQ temporarily rate-limits the sign-in form.
2. A banner shows how many seconds remain before you can try again.
3. Wait for the countdown to finish, then sign in again.

## First Screen After Sign-In

### If You Already Belong To A Team

1. QuorumQ opens that team dashboard automatically.
2. The team switcher in the top bar shows your current team.

### If You Do Not Belong To Any Team

1. QuorumQ opens `/teams/no-teams`.
2. Select `Create a team` to start your own team.
3. Or select `I have an invite link`, paste the link, and select `Go`.

### If Your Email Is Still Unverified

1. QuorumQ still lets you reach the app shell.
2. A banner on the no-teams screen reminds you to verify your email.
3. Team creation stays blocked until your email is verified.

## Sign Out

1. Open the account menu in the top-right corner.
2. Select `Sign out`.
3. QuorumQ clears your session and returns you to `/auth/sign-in`.

## Current Auth Gap

- The `Forgot password?` link is visible on the sign-in page, but the reset flow is not implemented in the current build.
