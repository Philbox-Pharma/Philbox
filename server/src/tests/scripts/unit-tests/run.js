import { isDirectExecution, runCategory } from '../shared/serverTestRunner.js';

export async function main() {
  const result = await runCategory('unit-tests');
  console.log(`[unit-tests] wrote ${result.csvPath}`);
  console.log(
    `[unit-tests] passed=${result.passedCount} failed=${result.failedCount}`
  );
  return result;
}

if (isDirectExecution(import.meta.url)) {
  main()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('[unit-tests] fatal error:', error);
      process.exit(1);
    });
}
