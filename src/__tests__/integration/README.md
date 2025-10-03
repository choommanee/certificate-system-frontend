# Integration Tests - Signer Document Workflow

This directory contains comprehensive integration tests for the Signer Document Workflow system, covering API integration, end-to-end workflows, and performance testing.

## Overview

The integration test suite validates the complete functionality of the signer document workflow system, ensuring that all components work together correctly and meet performance requirements.

### Test Categories

1. **API Integration Tests** (`api.integration.test.tsx`)
   - Authentication and authorization
   - Document management endpoints
   - Signature management operations
   - Error handling and recovery
   - Data validation and security

2. **Workflow Integration Tests** (`workflow.integration.test.tsx`)
   - Complete signing workflows
   - User interaction patterns
   - Real-time updates and notifications
   - Mobile responsiveness
   - Accessibility compliance

3. **Performance Integration Tests** (`performance.integration.test.tsx`)
   - Component rendering performance
   - Large dataset handling
   - Memory usage optimization
   - Network performance
   - Load testing simulation

## Running Tests

### Prerequisites

Ensure you have the following installed:
- Node.js 18+
- npm or yarn
- All project dependencies (`npm install`)

### Quick Start

```bash
# Run all integration tests
npm run test:integration

# Run with watch mode for development
npm run test:integration:watch

# Run with coverage report
npm run test:integration:coverage

# Run specific test suite
npx vitest run api.integration.test.tsx --config src/__tests__/integration/vitest.integration.config.ts
```

### Advanced Usage

```bash
# Run tests with custom timeout
npx vitest run --testTimeout=60000 --config src/__tests__/integration/vitest.integration.config.ts

# Run tests with specific reporter
npx vitest run --reporter=json --config src/__tests__/integration/vitest.integration.config.ts

# Run performance benchmarks
npx vitest bench --config src/__tests__/integration/vitest.integration.config.ts
```

## Test Configuration

### Environment Variables

The tests use the following environment variables:

```bash
NODE_ENV=test
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Certificate System Test
```

### Test Timeouts

- **Individual Test Timeout**: 30 seconds
- **Hook Timeout**: 30 seconds
- **Suite Timeout**: 5 minutes

### Coverage Thresholds

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Test Structure

### Setup and Teardown

The `setup.ts` file provides:
- Mock API server configuration
- Test data generators
- Environment setup utilities
- Cleanup functions

### Mock Data

All tests use consistent mock data defined in `setup.ts`:
- User authentication responses
- Document and signature data
- Statistics and history records
- Error scenarios

### Test Utilities

The `index.ts` file exports utilities for:
- Performance measurement
- Memory usage tracking
- User interaction simulation
- Network condition simulation
- Test environment management

## API Integration Tests

### Authentication Tests
- ✅ Successful signer authentication
- ✅ Authentication failure handling
- ✅ Token refresh and session management

### Document Management Tests
- ✅ Fetch pending documents
- ✅ Get document details
- ✅ Handle document not found errors
- ✅ Document filtering and sorting

### Signature Management Tests
- ✅ Upload signature files
- ✅ Set active signature
- ✅ Delete signatures
- ✅ File validation (type, size)

### Signing Operations Tests
- ✅ Sign documents successfully
- ✅ Reject documents with reasons
- ✅ Batch signing operations
- ✅ Error recovery mechanisms

### Statistics and History Tests
- ✅ Fetch signing statistics
- ✅ Get signing history
- ✅ Date range filtering
- ✅ Performance metrics

## Workflow Integration Tests

### Complete Signing Workflow
- ✅ Dashboard loading and navigation
- ✅ Document selection and viewing
- ✅ Signature application process
- ✅ Document return and notifications

### Document Rejection Workflow
- ✅ Rejection reason input
- ✅ Confirmation process
- ✅ Status updates

### Signature Management Workflow
- ✅ Upload new signatures
- ✅ File validation and preview
- ✅ Active signature selection
- ✅ Signature deletion

### Real-time Updates
- ✅ New document notifications
- ✅ Status change updates
- ✅ Statistics refresh

### Error Recovery
- ✅ Network error handling
- ✅ Retry mechanisms
- ✅ Graceful degradation

### Accessibility and Responsiveness
- ✅ Keyboard navigation
- ✅ ARIA labels and roles
- ✅ Mobile viewport adaptation
- ✅ Touch gesture support

## Performance Integration Tests

### Rendering Performance
- ✅ Dashboard load time < 2 seconds
- ✅ Large document lists < 3 seconds
- ✅ History virtualization < 2 seconds

### API Performance
- ✅ Concurrent request handling
- ✅ Response caching
- ✅ Request debouncing

### Memory Management
- ✅ Memory leak prevention
- ✅ Event listener cleanup
- ✅ Component unmounting

### Load Testing
- ✅ High-frequency interactions
- ✅ Responsiveness under load
- ✅ Network condition handling

### Bundle Optimization
- ✅ Lazy loading efficiency
- ✅ Image optimization
- ✅ Code splitting benefits

## Troubleshooting

### Common Issues

1. **Test Timeouts**
   ```bash
   # Increase timeout for slow tests
   npx vitest run --testTimeout=60000
   ```

2. **Memory Issues**
   ```bash
   # Run tests with more memory
   node --max-old-space-size=4096 node_modules/.bin/vitest
   ```

3. **Mock API Issues**
   ```bash
   # Check mock server setup in setup.ts
   # Verify API response formats match expectations
   ```

4. **Coverage Issues**
   ```bash
   # Generate detailed coverage report
   npm run test:integration:coverage
   # Check coverage/integration/index.html
   ```

### Debugging Tests

1. **Enable Debug Mode**
   ```bash
   DEBUG=true npm run test:integration
   ```

2. **Run Single Test**
   ```bash
   npx vitest run --reporter=verbose "specific test name"
   ```

3. **Use Test UI**
   ```bash
   npx vitest --ui --config src/__tests__/integration/vitest.integration.config.ts
   ```

## Performance Benchmarks

### Target Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Dashboard Load | < 2s | ✅ |
| Document List (1000 items) | < 3s | ✅ |
| Signing Workflow | < 5s | ✅ |
| Memory Usage | < 100MB | ✅ |
| Bundle Size | < 2MB | ✅ |

### Performance Monitoring

The tests automatically measure and report:
- Component render times
- API response times
- Memory usage patterns
- Network request counts
- Bundle loading performance

## Continuous Integration

### GitHub Actions Integration

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests
on: [push, pull_request]
jobs:
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:integration
      - uses: actions/upload-artifact@v3
        with:
          name: integration-test-results
          path: test-results/integration/
```

### Quality Gates

The integration tests enforce the following quality gates:
- All tests must pass
- Coverage must be ≥ 70%
- Performance benchmarks must meet targets
- No memory leaks detected
- Accessibility standards met

## Contributing

### Adding New Tests

1. **API Tests**: Add to `api.integration.test.tsx`
2. **Workflow Tests**: Add to `workflow.integration.test.tsx`
3. **Performance Tests**: Add to `performance.integration.test.tsx`

### Test Guidelines

- Use descriptive test names
- Include both positive and negative test cases
- Mock external dependencies
- Clean up after each test
- Follow AAA pattern (Arrange, Act, Assert)

### Mock Data Guidelines

- Keep mock data realistic
- Use consistent IDs and formats
- Include edge cases
- Document mock scenarios

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Performance Testing Guide](https://web.dev/performance-testing/)

## Support

For questions or issues with the integration tests:
1. Check this README
2. Review test output and logs
3. Check existing GitHub issues
4. Create a new issue with test details