#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

// Configuration
const config = {
  testDir: path.join(__dirname, '../src/__tests__/integration'),
  configFile: path.join(__dirname, '../src/__tests__/integration/vitest.integration.config.ts'),
  outputDir: path.join(__dirname, '../test-results/integration'),
  coverageDir: path.join(__dirname, '../coverage/integration'),
  timeout: 300000, // 5 minutes total timeout
}

// Ensure output directories exist
function ensureDirectories() {
  const dirs = [config.outputDir, config.coverageDir]
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

// Run integration tests
async function runIntegrationTests() {
  console.log('🚀 Starting Integration Tests for Signer Document Workflow')
  console.log('=' .repeat(60))

  ensureDirectories()

  const testSuites = [
    {
      name: 'API Integration Tests',
      pattern: 'api.integration.test.tsx',
      description: 'Testing API endpoints and data flow'
    },
    {
      name: 'Workflow Integration Tests', 
      pattern: 'workflow.integration.test.tsx',
      description: 'Testing end-to-end user workflows'
    },
    {
      name: 'Performance Integration Tests',
      pattern: 'performance.integration.test.tsx',
      description: 'Testing performance and load handling'
    }
  ]

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    suites: []
  }

  for (const suite of testSuites) {
    console.log(`\n📋 Running ${suite.name}`)
    console.log(`   ${suite.description}`)
    console.log('-'.repeat(40))

    try {
      const suiteResult = await runTestSuite(suite)
      results.suites.push(suiteResult)
      results.total += suiteResult.total
      results.passed += suiteResult.passed
      results.failed += suiteResult.failed

      if (suiteResult.success) {
        console.log(`✅ ${suite.name} completed successfully`)
      } else {
        console.log(`❌ ${suite.name} failed`)
      }
    } catch (error) {
      console.error(`💥 Error running ${suite.name}:`, error.message)
      results.failed += 1
    }
  }

  // Generate summary report
  generateSummaryReport(results)
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0)
}

// Run individual test suite
function runTestSuite(suite) {
  return new Promise((resolve, reject) => {
    const args = [
      'run',
      '--config', config.configFile,
      '--reporter=verbose',
      '--reporter=json',
      '--coverage',
      suite.pattern
    ]

    const vitest = spawn('npx', ['vitest', ...args], {
      cwd: path.dirname(config.testDir),
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: config.timeout
    })

    let stdout = ''
    let stderr = ''

    vitest.stdout.on('data', (data) => {
      stdout += data.toString()
      process.stdout.write(data)
    })

    vitest.stderr.on('data', (data) => {
      stderr += data.toString()
      process.stderr.write(data)
    })

    vitest.on('close', (code) => {
      const result = parseTestResults(stdout, stderr, code)
      result.suite = suite.name
      resolve(result)
    })

    vitest.on('error', (error) => {
      reject(error)
    })

    // Handle timeout
    setTimeout(() => {
      vitest.kill('SIGTERM')
      reject(new Error(`Test suite ${suite.name} timed out`))
    }, config.timeout)
  })
}

// Parse test results from output
function parseTestResults(stdout, stderr, exitCode) {
  const result = {
    success: exitCode === 0,
    total: 0,
    passed: 0,
    failed: 0,
    duration: 0,
    coverage: null
  }

  try {
    // Extract test counts from output
    const testMatch = stdout.match(/(\d+) passed.*?(\d+) failed/i)
    if (testMatch) {
      result.passed = parseInt(testMatch[1]) || 0
      result.failed = parseInt(testMatch[2]) || 0
      result.total = result.passed + result.failed
    }

    // Extract duration
    const durationMatch = stdout.match(/Time:\s+(\d+(?:\.\d+)?)(ms|s)/i)
    if (durationMatch) {
      const time = parseFloat(durationMatch[1])
      const unit = durationMatch[2]
      result.duration = unit === 's' ? time * 1000 : time
    }

    // Extract coverage information
    const coverageMatch = stdout.match(/All files\s+\|\s+(\d+(?:\.\d+)?)/i)
    if (coverageMatch) {
      result.coverage = parseFloat(coverageMatch[1])
    }
  } catch (error) {
    console.warn('Failed to parse test results:', error.message)
  }

  return result
}

// Generate summary report
function generateSummaryReport(results) {
  console.log('\n' + '='.repeat(60))
  console.log('📊 INTEGRATION TEST SUMMARY')
  console.log('='.repeat(60))

  console.log(`\n📈 Overall Results:`)
  console.log(`   Total Tests: ${results.total}`)
  console.log(`   Passed: ${results.passed} ✅`)
  console.log(`   Failed: ${results.failed} ${results.failed > 0 ? '❌' : '✅'}`)
  console.log(`   Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`)

  console.log(`\n📋 Suite Breakdown:`)
  results.suites.forEach(suite => {
    const status = suite.success ? '✅' : '❌'
    const successRate = suite.total > 0 ? ((suite.passed / suite.total) * 100).toFixed(1) : '0'
    console.log(`   ${status} ${suite.suite}`)
    console.log(`      Tests: ${suite.passed}/${suite.total} (${successRate}%)`)
    if (suite.duration) {
      console.log(`      Duration: ${suite.duration.toFixed(0)}ms`)
    }
    if (suite.coverage) {
      console.log(`      Coverage: ${suite.coverage}%`)
    }
  })

  // Performance metrics
  const totalDuration = results.suites.reduce((sum, suite) => sum + (suite.duration || 0), 0)
  console.log(`\n⏱️  Performance Metrics:`)
  console.log(`   Total Duration: ${(totalDuration / 1000).toFixed(2)}s`)
  console.log(`   Average per Test: ${(totalDuration / results.total).toFixed(0)}ms`)

  // Coverage summary
  const avgCoverage = results.suites
    .filter(suite => suite.coverage)
    .reduce((sum, suite, _, arr) => sum + suite.coverage / arr.length, 0)
  
  if (avgCoverage > 0) {
    console.log(`   Average Coverage: ${avgCoverage.toFixed(1)}%`)
  }

  // Recommendations
  console.log(`\n💡 Recommendations:`)
  if (results.failed > 0) {
    console.log(`   • Fix ${results.failed} failing test(s)`)
  }
  if (avgCoverage < 80) {
    console.log(`   • Improve test coverage (current: ${avgCoverage.toFixed(1)}%, target: 80%+)`)
  }
  if (totalDuration > 60000) {
    console.log(`   • Optimize test performance (current: ${(totalDuration / 1000).toFixed(1)}s, target: <60s)`)
  }
  if (results.failed === 0 && avgCoverage >= 80) {
    console.log(`   • All tests passing with good coverage! 🎉`)
  }

  // Save detailed report
  const reportPath = path.join(config.outputDir, 'integration-test-report.json')
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: results,
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }
  }, null, 2))

  console.log(`\n📄 Detailed report saved to: ${reportPath}`)
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n⚠️  Integration tests interrupted by user')
  process.exit(1)
})

process.on('SIGTERM', () => {
  console.log('\n⚠️  Integration tests terminated')
  process.exit(1)
})

// Run the tests
if (require.main === module) {
  runIntegrationTests().catch(error => {
    console.error('💥 Failed to run integration tests:', error)
    process.exit(1)
  })
}

module.exports = { runIntegrationTests, runTestSuite, parseTestResults }