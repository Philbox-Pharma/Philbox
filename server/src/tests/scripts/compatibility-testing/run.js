import { isDirectExecution, runCategory } from '../shared/serverTestRunner.js';

export async function main() {
  const result = await runCategory('compatibility-testing');
  console.log(`[compatibility-testing] wrote ${result.csvPath}`);
  console.log(
    `[compatibility-testing] passed=${result.passedCount} failed=${result.failedCount}`
  );
  return result;
}

if (isDirectExecution(import.meta.url)) {
  main()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('[compatibility-testing] fatal error:', error);
      process.exit(1);
    });
}
