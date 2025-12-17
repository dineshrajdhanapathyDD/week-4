# Testing Module

This module contains all test files including unit tests and property-based tests.

## Structure

- `unit/` - Unit tests for specific components and functions
- `property/` - Property-based tests using fast-check
- `integration/` - Integration tests for system interactions
- `generators/` - Test data generators for property-based testing

## Testing Strategy

The project uses a dual testing approach:
- **Unit tests** for specific scenarios and edge cases
- **Property-based tests** for universal properties that should hold across all inputs

Each correctness property from the design document is implemented as a property-based test.