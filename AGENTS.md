# Project working instructions

## Start and resume

- Read PROJECT_STATUS.md and README.md before changing this project.
- Follow the owner's latest instructions and preserve existing work.
- Inspect the current branch, recent commits, and local changes before resuming. Do not restart the project or replace its structure merely because the conversation changed.
- Use PROJECT_STATUS.md to distinguish completed, in-progress, planned, and unverified work.
- The initial Split Signal concept is a proposal. Check the latest user messages for approval; once granted, record it and do not request the same approval again.

## Checkpoint workflow

- Work in small, coherent steps and save after meaningful progress.
- Keep PROJECT_STATUS.md current: completed work, in-progress changes, remaining tasks, decisions, blockers, validation results, and the exact next action.
- Before lengthy testing, migrations, or deployment, save the source and record what is about to run.
- Save incomplete progress when needed, with a clear WIP/incomplete label and the checks still required.
- Commit code and its status update together when practical. Push and verify the remote reference before claiming a checkpoint is saved.
- If a push fails, report it and preserve local work. Do not mark the remote checkpoint successful.
- Do not force-push, discard unrelated changes, or overwrite newer remote work.
- Use normal checkpoints; a source commit already preserved remotely does not need another commit solely to store its own hash.
- Never commit credentials, tokens, private environment files, or personal account data. Keep temporary logs and dependencies out of the repository.
- If Sites uses a separate managed source repository, document the remotes and keep this repository's source/status synchronized at meaningful checkpoints.

## Build and verification

- Preserve the mission requirements in README.md.
- Check that multiplayer works between independent sessions, not just several components in one browser state.
- Keep shared state and action validation on the server. Do not expose private clues or answers to other players.
- Record actual test commands and outcomes; identify checks that were skipped or remain manual.
- After an interrupted operation, inspect its result before retrying it, especially for deployment or migrations.
- Keep progress updates concise and state the next concrete action.
