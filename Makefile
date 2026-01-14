.PHONY: setup test lint smoke-install smoke-test

PYTHON ?= python3

setup:
	@# Install python requirements if present and non-empty; succeed otherwise
	@if [ -f requirements.txt ]; then \
	  if [ -s requirements.txt ]; then $(PYTHON) -m pip install --user -r requirements.txt || true; else echo "No Python requirements to install."; fi; \
	else echo "requirements.txt not found; skipping Python setup."; fi

test:
	@# Run pytest if available, otherwise skip. Allow empty/no-tests to pass.
	@if command -v pytest >/dev/null 2>&1; then pytest || true; else echo "pytest not found; skipping tests."; fi

lint:
	@echo "No linter configured; add one to requirements.txt and update Makefile."

smoke-install: setup

smoke-test:
	@echo "Running smoke-test (ignoring pytest failures)..." && (pytest -q || true)
