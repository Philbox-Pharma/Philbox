import { isDirectExecution, runCategory } from '../shared/serverTestRunner.js';

export async function main() {
  const result = await runCategory('integration-tests');
  console.log(`[integration-tests] wrote ${result.csvPath}`);
  console.log(
    `[integration-tests] passed=${result.passedCount} failed=${result.failedCount}`
  );
  return result;
}

if (isDirectExecution(import.meta.url)) {
  main()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('[integration-tests] fatal error:', error);
      process.exit(1);
    });
}
