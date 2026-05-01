import { isDirectExecution, runCategory } from '../shared/serverTestRunner.js';

export async function main() {
  const result = await runCategory('security-testing');
  console.log(`[security-testing] wrote ${result.csvPath}`);
  console.log(
    `[security-testing] passed=${result.passedCount} failed=${result.failedCount}`
  );
  return result;
}

if (isDirectExecution(import.meta.url)) {
  main()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('[security-testing] fatal error:', error);
      process.exit(1);
    });
}
