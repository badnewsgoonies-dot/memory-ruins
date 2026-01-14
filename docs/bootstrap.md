# Project bootstrap

This repository contains minimal bootstrap files to detect environment and run basic install/test smoke checks.

Files created:
- package.json (name, version, basic scripts)
- Makefile (targets: setup, test, lint, smoke-install, smoke-test)
- requirements.txt (intentionally left empty)

Usage:
- Run `make smoke-install` to perform the setup target. It will skip installing if requirements.txt is empty.
- Run `make smoke-test` to run the test target. If pytest is not installed, the target will report and exit successfully.

Notes:
- No external dependencies are required by default to avoid network installs during bootstrap.
- Extend requirements.txt and Makefile targets for project-specific setup, linting and testing.
