import { main as runUnitTests } from './unit-tests/run.js';
import { main as runIntegrationTests } from './integration-tests/run.js';
import { main as runSystemTests } from './system-tests/run.js';
import { main as runAcceptanceTests } from './acceptance-testing/run.js';
import { main as runPerformanceTests } from './performance-testing/run.js';
import { main as runSecurityTests } from './security-testing/run.js';
import { main as runUsabilityTests } from './usability-testing/run.js';
import { main as runCompatibilityTests } from './compatibility-testing/run.js';
import { isDirectExecution } from './shared/serverTestRunner.js';

async function runAllServerTests() {
  const runners = [
    ['unit-tests', runUnitTests],
    ['integration-tests', runIntegrationTests],
    ['system-tests', runSystemTests],
    ['acceptance-testing', runAcceptanceTests],
    ['performance-testing', runPerformanceTests],
    ['security-testing', runSecurityTests],
    ['usability-testing', runUsabilityTests],
    ['compatibility-testing', runCompatibilityTests],
  ];

  const results = [];

  for (const [label, runner] of runners) {
    console.log(`\n=== Running ${label} ===`);
    results.push(await runner());
  }

  console.log('\n=== Server test summary ===');
  for (const result of results) {
    console.log(
      `${result.category}: passed=${result.passedCount} failed=${result.failedCount} csv=${result.csvPath}`
    );
  }

  const hasFailures = results.some(result => !result.success);
  process.exit(hasFailures ? 1 : 0);
}

if (isDirectExecution(import.meta.url)) {
  runAllServerTests().catch(error => {
    console.error('[runAllServerTests] fatal error:', error);
    process.exit(1);
  });
}
