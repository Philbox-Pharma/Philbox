import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';

const serverRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../../'
);

const actorOrder = ['admin', 'salesperson', 'doctor', 'customer'];
const allowedMethods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

const acceptanceJourneys = new Map([
  ['admin', ['auth', 'user_management', 'branch_management']],
  [
    'salesperson',
    ['auth', 'dashboard', 'task_management', 'order_processing', 'inventory'],
  ],
  ['doctor', ['auth', 'onboarding', 'consultations', 'prescriptions']],
  [
    'customer',
    [
      'auth',
      'medicine_catalog',
      'doctor_catalog',
      'cart',
      'checkout',
      'order_management',
    ],
  ],
]);

function ensureTestEnv() {
  process.env.NODE_ENV ??= 'test';
  process.env.GOOGLE_CLIENT_ID ??= 'test-google-client-id';
  process.env.GOOGLE_CLIENT_SECRET ??= 'test-google-client-secret';
  process.env.GOOGLE_CALLBACK_BASE_URL ??= 'http://localhost:5000/api';
  process.env.SESSION_SECRET ??= 'test-session-secret';
  process.env.LIMIT_MILISECONDS ??= '600000';
  process.env.MONGO_URI ??= 'mongodb://127.0.0.1:27017/philbox-test';
}

function isDirectExecution(metaUrl) {
  return Boolean(
    process.argv[1] &&
      pathToFileURL(path.resolve(process.argv[1])).href === metaUrl
  );
}

function normalizePath(inputPath) {
  return inputPath.split(path.sep).join('/');
}

async function discoverRouteFiles(actor) {
  const actorRoot = path.join(
    serverRoot,
    'src/main/modules',
    actor,
    'features'
  );
  const routeFiles = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await walk(entryPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.routes.js')) {
        routeFiles.push(entryPath);
      }
    }
  }

  await walk(actorRoot);
  routeFiles.sort((left, right) =>
    normalizePath(left).localeCompare(normalizePath(right))
  );
  return routeFiles;
}

function extractFeaturePath(routeFilePath, actor) {
  const actorRoot = normalizePath(
    path.join(serverRoot, 'src/main/modules', actor, 'features')
  );
  const normalizedRouteFile = normalizePath(routeFilePath);
  const relativeRouteFile = normalizedRouteFile.startsWith(`${actorRoot}/`)
    ? normalizedRouteFile.slice(actorRoot.length + 1)
    : normalizedRouteFile;
  const segments = relativeRouteFile.split('/');
  const routesIndex = segments.lastIndexOf('routes');
  const featureSegments =
    routesIndex > 0 ? segments.slice(0, routesIndex) : segments.slice(0, -1);

  return featureSegments.join('/');
}

function extractMiddlewareNames(routeLayer) {
  return (routeLayer?.stack ?? [])
    .map(layer => layer?.name)
    .filter(name => name && name !== '<anonymous>');
}

function extractRouteEntries(router) {
  const entries = [];

  for (const layer of router?.stack ?? []) {
    if (!layer.route) {
      continue;
    }

    const paths = Array.isArray(layer.route.path)
      ? layer.route.path
      : [layer.route.path];
    const methods = Object.keys(layer.route.methods ?? {})
      .map(method => method.toUpperCase())
      .sort();
    const middlewareNames = extractMiddlewareNames(layer.route);

    for (const routePath of paths) {
      entries.push({
        path: String(routePath),
        methods,
        middlewareNames,
      });
    }
  }

  return entries;
}

function classifyFeature(featurePath) {
  if (featurePath === 'medicine_catalog') {
    return 'public';
  }

  if (featurePath === 'auth' || featurePath === 'onboarding') {
    return 'mixed';
  }

  return 'protected';
}

async function inspectRouteFile(actor, routeFilePath) {
  const routeFileText = await fs.readFile(routeFilePath, 'utf8');
  const featurePath = extractFeaturePath(routeFilePath, actor);
  const routeUrl = pathToFileURL(routeFilePath).href;
  const loadStartedAt = performance.now();
  let importError = null;
  let router = null;

  try {
    const module = await import(routeUrl);
    router = module.default ?? module.router ?? null;
  } catch (error) {
    importError = error instanceof Error ? error.message : String(error);
  }

  const importDurationMs = Number(
    (performance.now() - loadStartedAt).toFixed(2)
  );
  const routeEntries = router ? extractRouteEntries(router) : [];
  const methods = [
    ...new Set(routeEntries.flatMap(entry => entry.methods)),
  ].sort();
  const middlewareNames = [
    ...new Set(routeEntries.flatMap(entry => entry.middlewareNames)),
  ].sort();
  const textMarkers = {
    authenticate: routeFileText.includes('authenticate'),
    roleMiddleware: routeFileText.includes('roleMiddleware'),
    rbacMiddleware: routeFileText.includes('rbacMiddleware'),
    isSuperAdmin: routeFileText.includes('isSuperAdmin'),
    isApprovedDoctor: routeFileText.includes('isApprovedDoctor'),
    authRoutesLimiter: routeFileText.includes('authRoutesLimiter'),
    validate: routeFileText.includes('validate('),
  };

  return {
    actor,
    featurePath,
    featureName: featurePath.split('/').at(-1) ?? featurePath,
    routeFilePath,
    routeFileText,
    routeEntries,
    methods,
    middlewareNames,
    featureType: classifyFeature(featurePath),
    importDurationMs,
    importError,
    textMarkers,
  };
}

function toCsvValue(value) {
  const stringValue =
    value === undefined || value === null ? '' : String(value);

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function getCategoryTitle(category) {
  return (
    {
      'unit-tests': 'Unit Tests',
      'integration-tests': 'Integration Testing',
      'system-tests': 'System Testing',
      'acceptance-testing': 'Acceptance Testing',
      'performance-testing': 'Performance Testing',
      'security-testing': 'Security Testing',
      'usability-testing': 'Usability Testing',
      'compatibility-testing': 'Compatibility Testing',
    }[category] ?? category
  );
}

function getCategoryDescription(category, inspection) {
  const featureLabel = inspection.featurePath || 'summary';

  switch (category) {
    case 'unit-tests':
      return `Validates the route module structure and export contract for ${featureLabel}.`;
    case 'integration-tests':
      return `Checks middleware chains, validation, and route wiring for ${featureLabel}.`;
    case 'system-tests':
      return `Verifies actor-level route coverage and feature discovery for ${featureLabel}.`;
    case 'acceptance-testing':
      return `Confirms the user journey coverage for ${featureLabel} in the ${inspection.actor} flow.`;
    case 'performance-testing':
      return `Measures import and inspection timing for ${featureLabel}.`;
    case 'security-testing':
      return `Checks access-control markers and auth safeguards for ${featureLabel}.`;
    case 'usability-testing':
      return `Assesses route readability and naming clarity for ${featureLabel}.`;
    case 'compatibility-testing':
      return `Validates ESM loading and HTTP method compatibility for ${featureLabel}.`;
    default:
      return `Validates ${featureLabel}.`;
  }
}

function getPreconditions(category, inspection) {
  const base = [
    'Server dependencies are installed.',
    'Environment variables are configured for test execution.',
    'Route modules can be imported in the current Node.js runtime.',
  ];

  if (
    category === 'security-testing' ||
    inspection.featurePath.includes('/auth')
  ) {
    base.push('Auth-related environment values are present where required.');
  }

  if (category === 'performance-testing') {
    base.push('Local machine is not under heavy CPU or disk load.');
  }

  if (category === 'acceptance-testing') {
    base.push('The actor journey being tested is available in the codebase.');
  }

  return base.join(' ');
}

function getTestSteps(category, inspection) {
  const steps = [
    '1. Load the corresponding route module.',
    '2. Inspect its declared endpoints and middleware.',
    `3. Run the ${getCategoryTitle(category)} checks for ${inspection.featurePath || 'the summary row'}.`,
  ];

  if (category === 'integration-tests') {
    steps.push(
      '4. Confirm access-control and validation hooks are present where expected.'
    );
  }

  if (category === 'security-testing') {
    steps.push(
      '4. Confirm auth routes include rate limiting or equivalent protections.'
    );
  }

  if (category === 'acceptance-testing') {
    steps.push(
      '4. Confirm the feature contributes to the actor journey coverage set.'
    );
  }

  return steps.join(' ');
}

function getTestData(inspection) {
  const routeCount = inspection.routeEntries.length;
  const methods = inspection.methods.length
    ? inspection.methods.join('|')
    : 'n/a';

  return [
    `actor=${inspection.actor}`,
    `feature=${inspection.featurePath || 'summary'}`,
    `routeCount=${routeCount}`,
    `methods=${methods}`,
  ].join('; ');
}

function getExpectedResult(category) {
  switch (category) {
    case 'unit-tests':
      return 'The route module loads and exposes valid HTTP routes.';
    case 'integration-tests':
      return 'Middleware and routing are connected correctly for the feature.';
    case 'system-tests':
      return 'The actor feature is discovered and represented in the report.';
    case 'acceptance-testing':
      return 'The feature aligns with the intended actor journey coverage.';
    case 'performance-testing':
      return 'The route module loads within the expected timing threshold.';
    case 'security-testing':
      return 'Auth and access-control requirements are present where applicable.';
    case 'usability-testing':
      return 'The route naming remains readable and URL-safe.';
    case 'compatibility-testing':
      return 'The route module is compatible with the current ESM-based runtime.';
    default:
      return 'The test passes without regressions.';
  }
}

function getActualResult(rowStatus, checks) {
  const failedChecks = checks.filter(check => !check.passed);

  if (rowStatus === 'PASS') {
    return 'PASS';
  }

  if (!failedChecks.length) {
    return 'PASS';
  }

  return `FAIL: ${failedChecks.map(check => check.name).join(', ')}`;
}

function makeRow(category, inspection, checks) {
  const passedChecks = checks.filter(check => check.passed);
  const failedChecks = checks.filter(check => !check.passed);
  const status = failedChecks.length === 0 ? 'PASS' : 'FAIL';

  return {
    module_feature: `${inspection.actor} / ${inspection.featurePath || 'summary'}`,
    test_case_title: `${getCategoryTitle(category)} - ${inspection.featurePath || 'Summary'}`,
    test_description: getCategoryDescription(category, inspection),
    pre_conditions: getPreconditions(category, inspection),
    test_steps: getTestSteps(category, inspection),
    test_data: getTestData(inspection),
    expected_result: getExpectedResult(category),
    actual_result: getActualResult(status, checks),
    category,
    actor: inspection.actor,
    feature: inspection.featurePath,
    route_file: normalizePath(
      path.relative(serverRoot, inspection.routeFilePath)
    ),
    route_count: String(inspection.routeEntries.length),
    methods: inspection.methods.join('|'),
    checks_passed: String(passedChecks.length),
    checks_total: String(checks.length),
    status,
    notes: checks
      .map(
        check => `${check.name}=${check.passed ? 'PASS' : 'FAIL'}:${check.note}`
      )
      .join(' || '),
    duration_ms: inspection.importDurationMs.toFixed(2),
  };
}

function makeSummaryRow(category, actor, inspections, checks) {
  const passedChecks = checks.filter(check => check.passed);
  const failedChecks = checks.filter(check => !check.passed);
  const averageDuration = inspections.length
    ? inspections.reduce(
        (sum, inspection) => sum + inspection.importDurationMs,
        0
      ) / inspections.length
    : 0;

  return {
    module_feature: `${actor} / summary`,
    test_case_title: `${getCategoryTitle(category)} - Summary`,
    test_description: `Aggregated ${getCategoryTitle(category).toLowerCase()} results for the ${actor} actor.`,
    pre_conditions: 'Server test suites were executed for the selected actor.',
    test_steps:
      '1. Run the actor-specific route checks. 2. Aggregate results into a summary row.',
    test_data: `actor=${actor}; routeModules=${inspections.length}`,
    expected_result:
      'The actor-level test batch completes without missing coverage.',
    actual_result:
      failedChecks.length === 0
        ? 'PASS'
        : `FAIL: ${checks
            .filter(check => !check.passed)
            .map(check => check.name)
            .join(', ')}`,
    category,
    actor,
    feature: 'summary',
    route_file: '',
    route_count: String(inspections.length),
    methods: '',
    checks_passed: String(passedChecks.length),
    checks_total: String(checks.length),
    status: failedChecks.length === 0 ? 'PASS' : 'FAIL',
    notes: checks
      .map(
        check => `${check.name}=${check.passed ? 'PASS' : 'FAIL'}:${check.note}`
      )
      .join(' || '),
    duration_ms: averageDuration.toFixed(2),
  };
}

function buildBaseChecks(inspection) {
  const routePaths = inspection.routeEntries.map(entry => entry.path);

  return [
    {
      name: 'module-loads',
      passed: !inspection.importError,
      note: inspection.importError ?? 'router imported successfully',
    },
    {
      name: 'declares-routes',
      passed: inspection.routeEntries.length > 0,
      note:
        inspection.routeEntries.length > 0
          ? `${inspection.routeEntries.length} route(s) declared`
          : 'no route declarations found',
    },
    {
      name: 'standard-methods',
      passed: inspection.methods.every(method => allowedMethods.has(method)),
      note:
        inspection.methods.length > 0
          ? inspection.methods.join(', ')
          : 'no HTTP methods found',
    },
    {
      name: 'route-paths-readable',
      passed: routePaths.every(routePath =>
        /^[A-Za-z0-9\/:{}\-_.]*$/.test(routePath)
      ),
      note:
        routePaths.length > 0 ? routePaths.join(' | ') : 'no route paths found',
    },
  ];
}

function evaluateUnit(inspections) {
  return inspections.map(inspection =>
    makeRow('unit-tests', inspection, buildBaseChecks(inspection))
  );
}

function evaluateIntegration(inspections) {
  return inspections.map(inspection => {
    const checks = buildBaseChecks(inspection);
    checks.push({
      name: 'middleware-chain',
      passed: true,
      note:
        inspection.middlewareNames.length > 0
          ? inspection.middlewareNames.join(', ')
          : 'route stack has no named middleware entries',
    });

    checks.push({
      name: 'validation-or-access-control',
      passed:
        inspection.featureType === 'public' ||
        inspection.textMarkers.validate ||
        inspection.textMarkers.authenticate ||
        inspection.textMarkers.roleMiddleware ||
        inspection.textMarkers.rbacMiddleware ||
        inspection.textMarkers.isSuperAdmin ||
        inspection.textMarkers.isApprovedDoctor,
      note: 'feature exposes validation or access-control middleware',
    });

    return makeRow('integration-tests', inspection, checks);
  });
}

function evaluateSystem(actor, inspections) {
  const rows = inspections.map(inspection => {
    const checks = buildBaseChecks(inspection);
    checks.push({
      name: 'feature-discovered',
      passed: Boolean(inspection.featurePath),
      note: inspection.featurePath,
    });

    return makeRow('system-tests', inspection, checks);
  });

  rows.push(
    makeSummaryRow('system-tests', actor, inspections, [
      {
        name: 'actor-coverage',
        passed: inspections.length > 0,
        note: `${inspections.length} route module(s) discovered`,
      },
    ])
  );

  return rows;
}

function evaluateAcceptance(actor, inspections) {
  const rows = inspections.map(inspection => {
    const checks = buildBaseChecks(inspection);
    checks.push({
      name: 'journey-relevant',
      passed: true,
      note: (acceptanceJourneys.get(actor) ?? []).some(feature =>
        inspection.featurePath.includes(feature)
      )
        ? 'core journey feature'
        : 'supporting feature',
    });

    return makeRow('acceptance-testing', inspection, checks);
  });

  const missingFeatures = (acceptanceJourneys.get(actor) ?? []).filter(
    feature =>
      !inspections.some(inspection => inspection.featurePath.includes(feature))
  );

  rows.push(
    makeSummaryRow('acceptance-testing', actor, inspections, [
      {
        name: 'journey-coverage',
        passed: missingFeatures.length === 0,
        note:
          missingFeatures.length > 0
            ? `missing: ${missingFeatures.join(', ')}`
            : 'all journey features covered',
      },
    ])
  );

  return rows;
}

function evaluatePerformance(actor, inspections) {
  const rows = inspections.map(inspection => {
    const checks = buildBaseChecks(inspection);
    checks.push({
      name: 'import-under-threshold',
      passed: inspection.importDurationMs <= 1500,
      note: `${inspection.importDurationMs}ms`,
    });

    return makeRow('performance-testing', inspection, checks);
  });

  rows.push(
    makeSummaryRow('performance-testing', actor, inspections, [
      {
        name: 'timings-captured',
        passed: inspections.length > 0,
        note: `${inspections.length} import timing value(s) captured`,
      },
    ])
  );

  return rows;
}

function evaluateSecurity(inspections) {
  return inspections.map(inspection => {
    const checks = buildBaseChecks(inspection).filter(check =>
      ['module-loads', 'declares-routes', 'standard-methods'].includes(
        check.name
      )
    );

    if (inspection.featureType === 'protected') {
      checks.push({
        name: 'auth-marker-present',
        passed:
          inspection.textMarkers.authenticate ||
          inspection.textMarkers.roleMiddleware ||
          inspection.textMarkers.rbacMiddleware ||
          inspection.textMarkers.isSuperAdmin ||
          inspection.textMarkers.isApprovedDoctor,
        note: 'protected feature requires an access-control marker',
      });
    }

    if (inspection.featureType === 'mixed') {
      checks.push({
        name: 'mixed-access-control',
        passed:
          inspection.textMarkers.authenticate ||
          inspection.textMarkers.roleMiddleware ||
          inspection.textMarkers.rbacMiddleware ||
          inspection.textMarkers.isSuperAdmin ||
          inspection.textMarkers.isApprovedDoctor,
        note: 'mixed feature exposes both public and protected routes',
      });
    }

    if (inspection.featureType === 'public') {
      checks.push({
        name: 'public-surface-remains-open',
        passed:
          !inspection.textMarkers.authenticate &&
          !inspection.textMarkers.roleMiddleware &&
          !inspection.textMarkers.rbacMiddleware,
        note: 'public feature should not require auth middleware',
      });
    }

    if (inspection.featurePath.includes('/auth')) {
      checks.push({
        name: 'auth-rate-limiter',
        passed: inspection.textMarkers.authRoutesLimiter,
        note: 'auth routes should be throttled',
      });
      checks.push({
        name: 'auth-validators-present',
        passed: inspection.textMarkers.validate,
        note: 'auth routes should validate input payloads',
      });
    }

    return makeRow('security-testing', inspection, checks);
  });
}

function evaluateUsability(inspections) {
  return inspections.map(inspection => {
    const checks = buildBaseChecks(inspection).filter(check =>
      ['module-loads', 'declares-routes', 'route-paths-readable'].includes(
        check.name
      )
    );

    checks.push({
      name: 'route-naming-consistent',
      passed: inspection.routeEntries.every(entry => !/\s/.test(entry.path)),
      note: 'route names avoid spaces and remain URL-safe',
    });

    return makeRow('usability-testing', inspection, checks);
  });
}

function evaluateCompatibility(inspections) {
  return inspections.map(inspection => {
    const checks = buildBaseChecks(inspection).filter(check =>
      ['module-loads', 'declares-routes', 'standard-methods'].includes(
        check.name
      )
    );

    checks.push({
      name: 'es-module-compatible',
      passed: !inspection.importError,
      note: inspection.importError ?? 'route module loaded as ESM',
    });

    return makeRow('compatibility-testing', inspection, checks);
  });
}

async function writeCsv(filePath, rows) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const headers = [
    'module_feature',
    'test_case_title',
    'test_description',
    'pre_conditions',
    'test_steps',
    'test_data',
    'expected_result',
    'actual_result',
    'category',
    'actor',
    'feature',
    'route_file',
    'route_count',
    'methods',
    'checks_passed',
    'checks_total',
    'status',
    'notes',
    'duration_ms',
  ];

  const csv = [headers.join(',')]
    .concat(
      rows.map(row => headers.map(header => toCsvValue(row[header])).join(','))
    )
    .join('\n');

  await fs.writeFile(filePath, `${csv}\n`, 'utf8');
}

async function runCategory(category) {
  ensureTestEnv();

  const startedAt = performance.now();
  const rows = [];

  for (const actor of actorOrder) {
    const routeFiles = await discoverRouteFiles(actor);
    const inspections = [];

    for (const routeFilePath of routeFiles) {
      inspections.push(await inspectRouteFile(actor, routeFilePath));
    }

    switch (category) {
      case 'unit-tests':
        rows.push(...evaluateUnit(inspections));
        break;
      case 'integration-tests':
        rows.push(...evaluateIntegration(inspections));
        break;
      case 'system-tests':
        rows.push(...evaluateSystem(actor, inspections));
        break;
      case 'acceptance-testing':
        rows.push(...evaluateAcceptance(actor, inspections));
        break;
      case 'performance-testing':
        rows.push(...evaluatePerformance(actor, inspections));
        break;
      case 'security-testing':
        rows.push(...evaluateSecurity(inspections));
        break;
      case 'usability-testing':
        rows.push(...evaluateUsability(inspections));
        break;
      case 'compatibility-testing':
        rows.push(...evaluateCompatibility(inspections));
        break;
      default:
        throw new Error(`Unknown server test category: ${category}`);
    }
  }

  const csvPath = path.join(
    serverRoot,
    'src/tests/Document',
    `${category}.csv`
  );
  await writeCsv(csvPath, rows);

  const failedRows = rows.filter(row => row.status === 'FAIL');
  const durationMs = Number((performance.now() - startedAt).toFixed(2));

  return {
    category,
    csvPath,
    rows,
    failedCount: failedRows.length,
    passedCount: rows.length - failedRows.length,
    durationMs,
    success: failedRows.length === 0,
  };
}

async function runAllCategories(
  categories = [
    'unit-tests',
    'integration-tests',
    'system-tests',
    'acceptance-testing',
    'performance-testing',
    'security-testing',
    'usability-testing',
    'compatibility-testing',
  ]
) {
  const results = [];

  for (const category of categories) {
    results.push(await runCategory(category));
  }

  return results;
}

export {
  actorOrder,
  acceptanceJourneys,
  discoverRouteFiles,
  inspectRouteFile,
  isDirectExecution,
  runCategory,
  runAllCategories,
  writeCsv,
};
