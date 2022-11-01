# stfc.space Contributing Guide

## Building and Running

This is a monorepo, meaning the repo holds multiple packages. It requires the use of [pnpm](https://pnpm.js.org/en/). You can [install pnpm](https://pnpm.io/installation) with:

```bash
npm i -g pnpm
```

`pnpm` commands run in the project's root directory will run on all sub-projects. You can checkout the code and build all sub-projects with:

```bash
git clone git@github.com:stfc-space/frontend.git
cd frontend
pnpm install
pnpm build
```

Generally you want to run the website. The easiest way is with:

```
pnpm turbo --filter="stfc.space" dev
```

## Code structure

Entry points to be aware of are:

- [`packages/radion`](./packages/radion/) - collection of Svelte UI components for use on stfc.space and related sites
- [`sites/stfc.space`](./sites/stfc.space/) - the actual code for the site running on https://stfc.space

## Testing

Right now this project doesn't have any tests, but a longer-term goal is to have automated tests using something like playwright

## Sending PRs

There are a few guidelines we follow: 

- Ensure all PR's have proper commit messages/descriptions. Example `git commit -m "feat(Game Profiles):" -m "Added support for multiple game profiles."`

- Remove all debug code. 

### Coding style

There are a few guidelines we follow:

- Ensure `pnpm lint` and `pnpm check` pass. You can run `pnpm format` to format the code

To use the git hooks in the repo, which will save you waiting for CI to tell you that you forgot to lint, run this:

```bash
git config core.hookspath .githooks
```

### Generating changelogs

For changes to be reflected in package changelogs, run `pnpm changeset` and follow the prompts.

All changesets should be `patch` until stfc.space 1.0

In the future the following rules will apply:

> Bug fixes should be `patch`.

> Feature additions should be `minor`.
