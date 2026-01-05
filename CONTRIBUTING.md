# Contributing to Fresh i18n Plugin

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/fresh-i18n-plugin.git`
3. Create a branch: `git checkout -b feature/your-feature-name`

## Development Setup

```bash
# Install dependencies (Deno handles this automatically)
deno task check

# Run tests
deno task test

# Format code
deno task fmt

# Lint code
deno task lint
```

## Making Changes

### Code Style

- Follow the existing code style
- Use TypeScript for all code
- Add JSDoc comments for public APIs
- Run `deno fmt` before committing

### Testing

- Add tests for new features
- Ensure all tests pass: `deno task test`
- Aim for high code coverage

### Documentation

- Update README.md if adding new features
- Add JSDoc comments to functions and interfaces
- Update examples if behavior changes

## Pull Request Process

1. Update documentation and tests
2. Ensure all checks pass (`deno task check`, `deno task lint`, `deno task test`)
3. Write a clear PR description explaining:
   - What changes you made
   - Why you made them
   - Any breaking changes

4. Link related issues

## Code Review

- Maintainers will review your PR
- Address feedback promptly
- Be patient - reviews take time

## Reporting Issues

When reporting issues, include:

- Fresh version
- Deno version
- Plugin version
- Minimal reproduction code
- Expected vs actual behavior

## Feature Requests

Feature requests are welcome! Please:

- Search existing issues first
- Explain the use case
- Provide examples of how it would work

## Questions?

- Open a discussion on GitHub
- Check existing issues and discussions

## Code of Conduct

Be respectful and constructive in all interactions.

Thank you for contributing! 🎉
