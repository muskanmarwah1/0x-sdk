# Contributing Guide

Thanks for your interest in contributing to 0x-sdk! Please review this guide prior to submitting a pull request.

## Development

Start by [forking](https://docs.github.com/en/get-started/quickstart/fork-a-repo) and cloning the repository onto your computer. Afterwards, you can start development by installing the dependencies and running the tests. Running the tests require API key(s) to be set. See the `.example.env` file for the necessary environment variables.

1. Install dependencies, generate types, and run build

```
yarn
```

2. Run tests

```
yarn test
```

Once you have completed your changes, you can create a [pull request from the fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork). Project maintainers may create pull requests in the repository without a fork.

## Pull requests

For large or impactful change, please open an [issue](https://github.com/0xProject/0x-sdk/issues/new?assignees=&labels=&template=bug_report.yml&title=%5Bbug%5D+%3Creplace+this+with+a+title%3E) or [discussion](https://github.com/0xproject/0x-sdk/discussions/new?category=q-a) prior to submitting a pull request. This allows the project maintainers and contributors to discuss alternatives and solutions prior to implementation.

### Workflow

1. Open an issue
1. Fork the repo and create a branch
1. Add new commits
   1. Commits should be [concise, descriptive, and well formatted](https://cbea.ms/git-commit/#seven-rules)
   1. Commits should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification
1. Keep your branch up-to-date with [`main`](https://github.com/0xProject/0x-sdk/tree/main) by rebasing often
   1. This repo has a linear git history and merge commits are not allowed
1. Open a new pull request via GitHub.
   1. [Link](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) the issue you created earlier with the pull request

### Dependabot

This repository uses [Dependabot](https://docs.github.com/en/code-security/dependabot) to help [secure](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/configuring-dependabot-security-updates) and [update](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuring-dependabot-version-updates#about-version-updates-for-dependencies) project dependencies. It does this by automatically opening pull requests to update package dependencies. Project maintainers are responsible for reviewing, testing, approving, and merging Dependabot pull requests.

## Release

Project maintainers can publish releases. Releases are automated with Google's [release-please](https://github.com/googleapis/release-please) GitHub action. Simply merge the release pull request ([release PR](https://github.com/googleapis/release-please#whats-a-release-pr)) to publish a release 🚀.

The GitHub action parses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to help automate releases. It creates a release PR that is kept up-to-date as additional commits are merged. The release PR can be merged once maintainers are ready to publish the release. Merging the release PR triggers the action to:

1. Update the `CHANGELOG.md` and `package.json`
2. Tag the commit with the [version](https://semver.org/)
3. Create a GitHub release based on the tag
4. Publish [the package](https://www.npmjs.com/package/@0x/0x-sdk) to npm

Unless necessary, avoid publishing a release immediately after your pull request has been merged. Releasing batches of updates helps keep artifacts and git tags tidy on [GitHub](https://github.com/0xProject/0x-sdk/releases) and [npm](https://www.npmjs.com/package/@0x/0x-sdk). Aim to publish release using a release schedule (e.g. weekly releases). Lastly, be sure to review and approve the release PR prior to publishing a release.

## Versioning

This project follows [Semantic Versioning 2.0](https://semver.org/) and the release tooling automatically parses the semantic version based on the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
