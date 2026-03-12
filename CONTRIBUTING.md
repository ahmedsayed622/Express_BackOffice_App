# Contributing

## Repository visibility and communication

This repository is hosted on GitHub. Its visibility setting (public or private) is controlled by the repository owner in **Settings → General → Danger Zone**.

**Important:** Any content created inside a public GitHub repository — including Issues, Pull Requests, commit messages, and wiki pages — is visible to **everyone on the internet**, whether or not they have a GitHub account.

If this repository is **private**, only users who have been explicitly granted access (collaborators or organization members with the correct role) can see any of its content, including Issues and Discussions.

### When to use Issues vs. private channels

| Communication type | Recommended channel |
|--------------------|---------------------|
| Bug reports, feature requests, task tracking | GitHub Issues (visible to all repo collaborators) |
| Sensitive credentials, personal data, passwords | **Never** in GitHub — use a secrets manager or a private, encrypted channel |
| Architecture decisions and public design notes | GitHub Issues or Discussions |
| Private team conversations not related to code | A separate private channel (e.g., team chat) |

> **Rule of thumb:** Do not write anything in a GitHub Issue, comment, or commit message that you would not be comfortable with every repository collaborator (and, in a public repo, the whole internet) reading.

## Reporting security vulnerabilities

Do **not** open a public Issue for security vulnerabilities. Contact the repository owner directly through a private channel and follow the guidelines in [`docs/SECURITY.md`](docs/SECURITY.md).

## Development workflow

1. Fork the repository (external contributors) or create a feature branch (team members).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in the required values. Never commit real credentials.
4. Run lint and tests before opening a pull request:
   ```bash
   npm run lint
   npm test
   ```
5. Open a pull request against the default branch and describe your changes clearly.

## Code style

- ESLint (Airbnb config) and Prettier are configured. Run `npm run lint:fix` and `npm run format` before committing.
- Follow the layered architecture described in [`docs/architecture.md`](docs/architecture.md).
- Keep controllers thin; put business logic in services and data access in repositories.
