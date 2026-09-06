# Income goal notifications

Deploy the backend migration (`alembic upgrade head`) before starting the updated scheduler. Ship the mobile update for timezone and permission synchronization. No production migration or push has been performed by this change.

- Monthly kickoff: first day of the user's calendar month, 8 AM.
- Daily reminders: 8 AM, noon, and 4 PM. On the first, the monthly kickoff and daily morning reminder are separate messages.
- All use existing income goals. Missing, zero, negative, or non-finite goals produce general copy without a numerical target.
- Replaces previous behind-pace, end-of-month, and monthly achievement pushes.
- The scheduler checks every minute. A 15-minute grace window allows short interruptions. Longer outages skip expired slots, including a missed monthly kickoff; no stale catch-up flood. Push TTL is 15 minutes.
- Unique (user, notification kind, local period) database records prevent repeated application sends across launches, restarts, and worker processes. Records are claimed before sending. A crash or timeout can lose a notification: uncertain submissions are deliberately not retried, because Expo offers no exactly-once delivery guarantee.
- Receipt checks record provider handoff and remove invalid tokens without deleting a newer registration.
- Existing notification and goal-reminder preferences must both be on. Toggles save immediately. Disabling notifications preserves the user's goal-reminder selection for re-enabling.
- Device permission and IANA timezone sync at authenticated startup and foreground, without permission prompts. Revocation clears registration; OS permissions still govern display while the app is closed. Already accepted pushes cannot be recalled.
- Existing users keep their stored timezone (historically New York) until they open the updated app. Travel timezone changes likewise synchronize on foreground.
- Retains the existing one-push-token-per-account architecture. Multi-device registration remains outside this change.

Validation: `venv/bin/python -m unittest discover -s tests -v` from backend. Tests use an isolated SQLite database and mocked Expo calls, never a live device or production database. Check actual device delivery and OS permission changes after deployment.
