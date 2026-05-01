import { isDirectExecution, runCategory } from '../shared/serverTestRunner.js';

export async function main() {
  const result = await runCategory('system-tests');
  console.log(`[system-tests] wrote ${result.csvPath}`);
  console.log(
    `[system-tests] passed=${result.passedCount} failed=${result.failedCount}`
  );
  return result;
}

if (isDirectExecution(import.meta.url)) {
  main()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('[system-tests] fatal error:', error);
      process.exit(1);
    });
}
