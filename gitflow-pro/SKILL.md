---
name: gitflow-pro
description: Automate daily Git workflow for solo developers. Handles smart initialization, rebase-sync, atomic commits with contextual messages, and direct pushes to origin.
---

# GitFlow-Pro

This skill automates the daily Git workflow for a solo developer, focusing on speed, reliability, and contextual commit history.

## Workflows

### 1. Smart Initialization

If the current directory is not a Git repository, initialize it:

1.  Run `git init`.
2.  Ask the user for the remote origin URL if not known.
3.  Run `git remote add origin <url>`.
4.  Run `git branch -M main`.

### 2. Daily Sync & Push (The "Go" Command)

When the user wants to "sync", "save", or "push" their work:

1.  **Stage All Changes**: Run `git add .` to group all task-related changes.
2.  **Generate Commit Message**:
    -   Analyze the current diff using `git diff --cached`.
    -   Review the conversation history to understand the goal.
    -   Create a **Conventional Commit** message (e.g., `feat: add DNI validation logic`).
3.  **Synchronize**: Run `git pull --rebase origin <current-branch>`.
    -   If there are conflicts, stop and ask the user for help.
4.  **Commit**: Run `git commit -m "<generated-message>"`.
5.  **Direct Push**: Run `git push origin <current-branch>`.

## Contextual Commit Messages

Follow the Conventional Commits specification:
- `feat:` for new features.
- `fix:` for bug fixes.
- `docs:` for documentation changes.
- `style:` for formatting, missing semi colons, etc; no code change.
- `refactor:` for refactoring production code.
- `test:` for adding missing tests, refactoring tests; no production code change.
- `chore:` for updating build tasks, package manager configs, etc; no production code change.

## Guiding Principles

- **Solo focus**: Direct push to the active branch on `origin`. No feature branches unless explicitly requested.
- **Safety**: Always `--rebase` before pushing to avoid merge commits.
- **Atomic**: Group all changes from the current task into a single commit.
