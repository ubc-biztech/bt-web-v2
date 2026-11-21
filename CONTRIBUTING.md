# Contributing

## Branch and merge strategy

- Open feature and fix pull requests against `dev`.
- Feature and fix pull requests may contain multiple development commits. Use
  **Squash and merge** so each pull request adds one commit to `dev`.
- Open production release pull requests from `dev` to `main`. Use a regular
  merge so the shared history between the long-lived branches is preserved.

Pull request titles must be at most 60 characters because the title becomes the
squashed commit subject.
