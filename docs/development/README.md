# Development

This directory explains how to set up, validate, and maintain Hemiciclo.

## Setup and validation

Hemiciclo has no application code yet, so there is nothing to install, build,
or test. Clone the repository with Git and use an authenticated GitHub CLI
(`gh`) for issue and pull request work, as the
[contribution guidelines](../../CONTRIBUTING.md) describe. Use Node.js 24 to
run the installed `babysit` skill's wait and merge scripts, which take a pull
request through its checks and review to its merge.

Run `git diff --check` before opening a pull request. The required `PR metadata`
check validates pull request titles and descriptions. The `Issue contracts`
workflow validates specification and implementation ticket bodies and their
readiness labels whenever an issue or its comments change. The `Sandbox image`
workflow builds `.factory/Dockerfile`, the toolchain image that the factory
serving this repository runs its agents in, on pull requests that change it.
