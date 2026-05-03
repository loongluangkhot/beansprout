## Deferred from: code review of 3-3-configure-season-settings.md (2026-05-03)

- Schedule boundary inconsistency between generated and manual meetups (`backend/app/services/season_service.py`): generated recurrence uses an exclusive end boundary while manual validation currently allows equality at end date.
- Potential lost-update race in concurrent schedule updates (`backend/app/services/season_service.py`): delete-and-reinsert sequence may allow last-write-wins behavior under concurrent edits.
