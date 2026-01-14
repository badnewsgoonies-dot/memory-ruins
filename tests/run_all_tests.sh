#!/usr/bin/env sh
# runs JS asset checks and Python pytest integration tests
set -e

printf "Running node asset tests...\n"
node tests/run_asset_tests.js

printf "Running pytest asset integration tests...\n"
python3 -m pytest -q tests/test_asset_integration.py

printf "All checks passed.\n"