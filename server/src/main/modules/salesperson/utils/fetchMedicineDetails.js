import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const REQUEST_TIMEOUT_MS = 8000;
const MIN_IMAGE_CANDIDATES = 2;
const MAX_RETRIES = 2;
const MEDICINE_DETAILS_DEBUG = process.env.MEDICINE_DETAILS_DEBUG === 'true';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4.6';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

const STOP_WORDS = new Set([
  'tab',
  'tabs',
  'tablet',
  'tablets',
  'cap',
  'caps',
  'capsule',
  'capsules',
  'syrup',
  'cream',
  'gel',
  'spray',
]);

const FORM_TOKENS = new Set([
  'tab',
  'tabs',
  'tablet',
  'tablets',
  'cap',
  'caps',
  'capsule',
  'capsules',
  'syrup',
  'cream',
  'gel',
  'spray',
  'mg',
  'ml',
  'g',
]);

const IMAGE_POSITIVE_HINTS = [
  'capsule',
  'tablet',
  'bottle',
  'box',
  'blister',
  'pack',
  'product',
  'supplement',
  'sunscreen',
  'spf',
  'medicine',
  'pharmacy',
];

const IMAGE_NEGATIVE_HINTS = [
  'wikimedia',
  'wikipedia',
  'pubchem',
  'chemspider',
  'molecule',
  'molecular',
  'structural',
  'skeletal',
  'reaction',
  'formula',
  'peroxide',
  'diagram',
  'icon',
  '.svg',
];

const IMAGE_HOST_HINTS = [
  'images',
  'image',
  'img',
  'cdn',
  'media',
  'photo',
  'photos',
  'product',
  'amazon',
  'i.ebayimg',
  'shopify',
  'pharmacy',
];

const PRIORITY_SOURCE_DOMAIN_HINTS = [
  'dvago.pk',
  'www.dvago.pk',
  'asraderm.pk',
  'www.asraderm.pk',
  'marham.pk',
  'www.marham.pk',
  'vitaminshouse.com',
  'www.vitaminshouse.com',
  'melori.com',
  'www.melori.com',
  'empowerandbrews.com',
  'www.empowerandbrews.com',
  'bazaarica.com',
  'www.bazaarica.com',
  'gosupps.com',
  'www.gosupps.com',
];

const PRIORITY_SOURCE_BASE_URLS = [
  'https://www.dvago.pk',
  'https://www.asraderm.pk',
  'https://www.marham.pk',
  'https://vitaminshouse.com',
  'https://melori.com',
  'https://www.empowerandbrews.com',
  'https://bazaarica.com',
  'https://www.gosupps.com',
];

const http = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
  },
});

const emptyResult = () => ({
  description: null,
  imageUrls: [],
});

const debugLog = (stage, meta = {}) => {
  if (!MEDICINE_DETAILS_DEBUG) return;
  console.log('[fetchMedicineDetails]', stage, meta);
};

const debugErrorMeta = error => ({
  message: error?.message || 'Unknown error',
  status: error?.response?.status || null,
  code: error?.code || null,
});

const normalizeDescription = snippet => {
  if (typeof snippet !== 'string') return null;
  const trimmed = snippet.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\.{3}$/u, '').trim() || null;
};

const stripHtml = html =>
  String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const isRetryableError = error => {
  const code = error?.code;
  const status = error?.response?.status;

  if (status === 429 || status === 503 || status === 504) return true;
  return ['ECONNRESET', 'ETIMEDOUT', 'ECONNABORTED', 'EAI_AGAIN'].includes(
    code
  );
};

const requestWithRetry = async (url, config = {}, retries = MAX_RETRIES) => {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await http.get(url, config);
    } catch (error) {
      lastError = error;

      if (attempt >= retries || !isRetryableError(error)) {
        break;
      }

      await sleep(250 * (attempt + 1));
    }
  }

  throw lastError;
};

const tokenize = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length >= 3)
    .filter(token => !STOP_WORDS.has(token));

const tokenizeForOrder = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length >= 2)
    .filter(token => !/^\d+$/.test(token));

const buildSearchTerms = medicineName => {
  const full = String(medicineName || '').trim();
  return full ? [full] : [];
};

const toSlug = value =>
  String(value || '')
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

const buildSlugVariants = medicineName => {
  const source = String(medicineName || '').trim();
  if (!source) return [];

  const variants = new Set();
  variants.add(toSlug(source));

  const normalized = source
    .toLowerCase()
    .replace(/\bcaps\b/g, 'capsules')
    .replace(/\bcap\b/g, 'capsule')
    .replace(/\btabs\b/g, 'tablets')
    .replace(/\btab\b/g, 'tablet')
    .replace(/\b(\d+)s\b/g, '$1');

  variants.add(toSlug(normalized));

  return Array.from(variants).filter(Boolean);
};

const isLikelyImageUrl = url => {
  const lower = String(url || '').toLowerCase();
  if (/\.(jpg|jpeg|png|webp)(\?|$)/i.test(lower)) return true;
  return IMAGE_HOST_HINTS.some(hint => lower.includes(hint));
};

const hasNegativeImageHint = url => {
  const lower = String(url || '').toLowerCase();
  return IMAGE_NEGATIVE_HINTS.some(hint => lower.includes(hint));
};

const scoreImageUrl = (url, medicineName) => {
  const lower = String(url || '').toLowerCase();
  const isPriorityDomain = PRIORITY_SOURCE_DOMAIN_HINTS.some(domain =>
    lower.includes(domain)
  );
  if (!isLikelyImageUrl(lower)) return -100;
  if (hasNegativeImageHint(lower)) return -50;

  const medicineTokens = tokenize(medicineName);
  const tokenHits = medicineTokens.reduce(
    (count, token) => (lower.includes(token) ? count + 1 : count),
    0
  );

  const positiveHits = IMAGE_POSITIVE_HINTS.reduce(
    (count, hint) => (lower.includes(hint) ? count + 1 : count),
    0
  );

  const hostHits = IMAGE_HOST_HINTS.reduce(
    (count, hint) => (lower.includes(hint) ? count + 1 : count),
    0
  );

  const orderTokens = tokenizeForOrder(medicineName);
  let orderedMatchCount = 0;
  let searchFrom = 0;
  for (const token of orderTokens) {
    const foundAt = lower.indexOf(token, searchFrom);
    if (foundAt === -1) break;
    orderedMatchCount += 1;
    searchFrom = foundAt + token.length;
  }

  const keyTokens = orderTokens.filter(
    token => token.length >= 4 && !FORM_TOKENS.has(token)
  );
  const hasKeyToken = keyTokens.some(token => lower.includes(token));

  // Enforce medicine relevance: reject URLs with no medicine token/order signal.
  if (tokenHits === 0 && orderedMatchCount === 0) {
    return -80;
  }

  // Penalize URLs that don't include any strong medicine token.
  if (!hasKeyToken && !isPriorityDomain) {
    return -25;
  }

  return (
    tokenHits * 4 +
    positiveHits +
    hostHits +
    orderedMatchCount * 8 +
    (isPriorityDomain ? 8 : 0)
  );
};

const rankAndFilterImageUrls = (urls, medicineName) => {
  const merged = new Map();

  for (const entry of urls) {
    const url = typeof entry === 'string' ? entry : entry?.url;
    const contextScore =
      typeof entry === 'string' ? 0 : Number(entry?.contextScore || 0);
    if (!url) continue;

    const existing = merged.get(url);
    if (!existing || contextScore > existing.contextScore) {
      merged.set(url, { url, contextScore });
    }
  }

  return Array.from(merged.values())
    .map(item => ({
      url: item.url,
      score: scoreImageUrl(item.url, medicineName) + item.contextScore,
    }))
    .filter(item => item.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.url)
    .slice(0, Math.max(MIN_IMAGE_CANDIDATES, 5));
};

const decodeUrlValue = value => {
  try {
    return decodeURIComponent(String(value || ''));
  } catch {
    return String(value || '');
  }
};

const normalizeHttpUrl = value => {
  const url = decodeUrlValue(String(value || '')).trim();
  if (!/^https?:\/\//i.test(url)) return '';
  return url;
};

const hasMedicineTokenInUrl = (url, medicineName) => {
  const lower = String(url || '').toLowerCase();
  const tokens = tokenize(medicineName);
  if (!tokens.length) return false;
  return tokens.some(token => lower.includes(token));
};

const hasOrderedMedicineTokensInUrl = (url, medicineName) => {
  const lower = String(url || '').toLowerCase();
  const tokens = tokenize(medicineName);
  if (!tokens.length) return false;

  let cursor = 0;
  let matched = 0;
  for (const token of tokens) {
    const idx = lower.indexOf(token, cursor);
    if (idx === -1) continue;
    matched += 1;
    cursor = idx + token.length;
  }

  return matched >= Math.min(2, tokens.length);
};

const isPreferredDescriptionDomain = url => {
  const lower = String(url || '').toLowerCase();
  return PRIORITY_SOURCE_DOMAIN_HINTS.some(domain => lower.includes(domain));
};

const decodeDuckRedirectUrl = url => {
  const raw = String(url || '').trim();
  if (!raw) return '';

  const absolute = raw.startsWith('//') ? `https:${raw}` : raw;
  if (!/^https?:\/\//i.test(absolute)) return '';

  try {
    const parsed = new URL(absolute);
    const uddg = parsed.searchParams.get('uddg');
    if (uddg) {
      return normalizeHttpUrl(uddg);
    }
    return normalizeHttpUrl(absolute);
  } catch {
    return normalizeHttpUrl(absolute);
  }
};

const resolveUrl = (baseUrl, maybeUrl) => {
  const raw = decodeUrlValue(String(maybeUrl || '')).trim();
  if (!raw) return '';
  if (raw.startsWith('//')) return normalizeHttpUrl(`https:${raw}`);
  if (/^https?:\/\//i.test(raw)) return normalizeHttpUrl(raw);

  try {
    return normalizeHttpUrl(new URL(raw, baseUrl).toString());
  } catch {
    return '';
  }
};

const getAttribute = (tag, attrName) => {
  const regex = new RegExp(`${attrName}=["']([^"']+)["']`, 'i');
  const match = String(tag || '').match(regex);
  return match?.[1] || '';
};

const extractAnchorLinks = (html, baseUrl) => {
  const anchors =
    String(html || '').match(/<a[^>]*href=["'][^"']+["'][^>]*>/gi) || [];
  const links = [];

  for (const tag of anchors) {
    const href = getAttribute(tag, 'href');
    const resolved = resolveUrl(baseUrl, href);
    if (!resolved) continue;
    links.push(resolved);
    if (links.length >= 120) break;
  }

  return Array.from(new Set(links));
};

const isSameHost = (originUrl, targetUrl) => {
  try {
    return new URL(originUrl).host === new URL(targetUrl).host;
  } catch {
    return false;
  }
};

const getBaseHost = baseUrl => {
  try {
    return new URL(String(baseUrl || '')).host.replace(/^www\./i, '');
  } catch {
    return '';
  }
};

const isMarhamBase = baseUrl => String(baseUrl || '').includes('marham.pk');

const isMarhamMedicineLink = link =>
  /\/medicines\//i.test(String(link || '')) &&
  !/[?&](search|letter)=/i.test(String(link || ''));

const isProductLikeLink = link =>
  /\/(product|products)\//i.test(String(link || ''));

const isAllowedPriorityDetailLink = (link, baseUrl) => {
  if (isMarhamBase(baseUrl)) {
    return isMarhamMedicineLink(link);
  }
  return isProductLikeLink(link);
};

const filterPriorityDomainLinks = (links, baseUrl) => {
  return links.filter(link => isAllowedPriorityDetailLink(link, baseUrl));
};

const countOrderedMatches = (value, medicineName) => {
  const haystack = String(value || '').toLowerCase();
  const tokens = tokenizeForOrder(medicineName);
  if (!tokens.length) return 0;

  let cursor = 0;
  let matched = 0;
  for (const token of tokens) {
    const idx = haystack.indexOf(token, cursor);
    if (idx === -1) continue;
    matched += 1;
    cursor = idx + token.length;
  }
  return matched;
};

const countTokenHits = (value, medicineName) => {
  const haystack = String(value || '').toLowerCase();
  const tokens = tokenize(medicineName);
  if (!tokens.length) return 0;

  return tokens.reduce(
    (count, token) => (haystack.includes(token) ? count + 1 : count),
    0
  );
};

const scoreMatchStrength = (value, medicineName) => {
  const haystack = String(value || '').toLowerCase();
  const ordered = countOrderedMatches(haystack, medicineName);
  const tokenHits = countTokenHits(haystack, medicineName);
  const isPriorityDomain = PRIORITY_SOURCE_DOMAIN_HINTS.some(domain =>
    haystack.includes(domain)
  );

  return ordered * 20 + tokenHits * 7 + (isPriorityDomain ? 6 : 0);
};

const isRelevantDescription = (description, medicineName) => {
  const text = String(description || '').toLowerCase();
  if (!text) return false;

  const ordered = countOrderedMatches(text, medicineName);
  const tokens = tokenize(medicineName);
  const tokenHits = tokens.reduce(
    (count, token) => (text.includes(token) ? count + 1 : count),
    0
  );

  const disallowedGenericPhrases = [
    'buy dermatologists recommended skincare products',
    'suitable for all skin concerns',
    'shop now',
    'free delivery',
    'all rights reserved',
  ];

  if (disallowedGenericPhrases.some(phrase => text.includes(phrase))) {
    return false;
  }

  return ordered >= 2 || tokenHits >= 2;
};

const isSearchLikeUrl = url =>
  /[?&](s|q|query|search)=|\/search\b|\/collections\b|\/category\b|\/categories\b/i.test(
    String(url || '')
  );

const isSearchLikePage = (html, url) => {
  if (isSearchLikeUrl(url)) return true;
  const text = stripHtml(html).toLowerCase();
  return (
    text.includes('search results') ||
    text.includes('search result for') ||
    text.includes('skip to content all categories')
  );
};

const collectPageImageCandidates = (html, pageUrl, medicineName) => {
  const strict = [];
  const fallback = [];

  const metaImage = extractMetaImage(html);
  if (metaImage) {
    if (hasMedicineTokenInUrl(metaImage, medicineName)) {
      strict.push({
        url: metaImage,
        contextScore: scoreMatchStrength(metaImage, medicineName),
      });
    } else {
      fallback.push({ url: metaImage, contextScore: 0 });
    }
  }

  const imgTagMatches = String(html || '').match(/<img[^>]*>/gi) || [];
  for (const tag of imgTagMatches.slice(0, 60)) {
    const src =
      getAttribute(tag, 'src') ||
      getAttribute(tag, 'data-src') ||
      getAttribute(tag, 'data-lazy-src') ||
      getAttribute(tag, 'data-original');

    const alt = getAttribute(tag, 'alt');
    const title = getAttribute(tag, 'title');
    const resolved = resolveUrl(pageUrl, src);
    if (!resolved || !isLikelyImageUrl(resolved)) continue;

    const contextBlob = `${resolved} ${alt} ${title}`.toLowerCase();
    const orderedMatch = countOrderedMatches(contextBlob, medicineName);
    const tokenHit = hasMedicineTokenInUrl(contextBlob, medicineName);
    const contextScore = scoreMatchStrength(contextBlob, medicineName);

    if (orderedMatch >= 2 || tokenHit) {
      strict.push({ url: resolved, contextScore });
    } else {
      fallback.push({ url: resolved, contextScore });
    }
  }

  return { strict, fallback };
};

const extractMetaDescription = html => {
  const patterns = [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = String(html || '').match(pattern);
    if (match?.[1]) {
      const text = normalizeDescription(stripHtml(match[1]));
      if (text && text.length >= 25) {
        return text;
      }
    }
  }

  return null;
};

const extractMetaImage = html => {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = String(html || '').match(pattern);
    if (match?.[1]) {
      const url = normalizeHttpUrl(match[1]);
      if (url) return url;
    }
  }

  return null;
};

const collectDuckResultLinks = html => {
  const links = [];
  const patterns = [
    /<a[^>]*class=["'][^"']*result__a[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
    /<a[^>]*href=["']([^"']+)["'][^>]*class=["'][^"']*result__a[^"']*["'][^>]*>/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(String(html || ''))) !== null) {
      const resolved = decodeDuckRedirectUrl(match[1]);
      if (resolved) links.push(resolved);
      if (links.length >= 8) break;
    }
    if (links.length >= 8) break;
  }

  return Array.from(new Set(links));
};

const extractBodyDescription = html => {
  const text = stripHtml(html);
  if (!text) return null;

  const sentences = text
    .split(/\.(\s+|$)/)
    .map(part => String(part || '').trim())
    .filter(Boolean)
    .filter(part => part.length >= 40);

  if (!sentences.length) return null;
  return normalizeDescription(`${sentences[0]}.`);
};

const extractProductSectionDescription = html => {
  const patterns = [
    /<div[^>]*class=["'][^"']*t4s-product__description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class=["'][^"']*wn-product__description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class=["'][^"']*t4s-rte[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class=["'][^"']*woocommerce-product-details__short-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class=["'][^"']*product-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<section[^>]*class=["'][^"']*product[^"']*description[^"']*["'][^>]*>([\s\S]*?)<\/section>/i,
    /<div[^>]*id=["']description["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class=["'][^"']*entry-content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const pattern of patterns) {
    const match = String(html || '').match(pattern);
    if (!match?.[1]) continue;
    const text = normalizeDescription(stripHtml(match[1]));
    if (text && text.length >= 30) {
      return text;
    }
  }

  const genericDescriptionBlocks =
    String(html || '').match(
      /<(?:div|section)[^>]*class=["'][^"']*(?:product|description|details)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/gi
    ) || [];

  for (const block of genericDescriptionBlocks.slice(0, 10)) {
    const contentMatch = block.match(/>([\s\S]*?)<\/(?:div|section)>/i);
    if (!contentMatch?.[1]) continue;

    const candidate = normalizeDescription(stripHtml(contentMatch[1]));
    if (candidate && candidate.length >= 40) {
      return candidate;
    }
  }

  return null;
};

const extractJsonLdDescription = html => {
  const matches =
    String(html || '').match(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ) || [];

  const collectFromObject = value => {
    if (!value || typeof value !== 'object') return null;

    const direct = normalizeDescription(value.description);
    if (direct && direct.length >= 20) return direct;

    if (Array.isArray(value['@graph'])) {
      for (const item of value['@graph']) {
        const nested = collectFromObject(item);
        if (nested) return nested;
      }
    }

    if (Array.isArray(value.mainEntity)) {
      for (const item of value.mainEntity) {
        const nested = collectFromObject(item);
        if (nested) return nested;
      }
    }

    if (value.mainEntity && typeof value.mainEntity === 'object') {
      const nested = collectFromObject(value.mainEntity);
      if (nested) return nested;
    }

    return null;
  };

  for (const scriptTag of matches) {
    const contentMatch = scriptTag.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const rawJson = String(contentMatch?.[1] || '').trim();
    if (!rawJson) continue;

    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) {
        for (const entry of parsed) {
          const description = collectFromObject(entry);
          if (description) return description;
        }
      } else {
        const description = collectFromObject(parsed);
        if (description) return description;
      }
    } catch {
      // continue with next script block
    }
  }

  return null;
};

const buildDescriptionSearchTerms = medicineName => {
  const baseTerms = buildSearchTerms(medicineName);
  const targeted = [];

  for (const term of baseTerms) {
    for (const domain of PRIORITY_SOURCE_DOMAIN_HINTS) {
      targeted.push(`site:${domain} ${term}`);
    }
  }

  return [...targeted, ...baseTerms];
};

const buildPreferredDomainSearchUrls = (baseUrl, medicineName) => {
  const normalizedName = String(medicineName || '').trim();
  const encoded = encodeURIComponent(normalizedName);
  if (!encoded) return [];

  const host = getBaseHost(baseUrl);
  const slugVariants = buildSlugVariants(normalizedName);
  const slug = slugVariants[0] || '';

  if (host === 'marham.pk') {
    return [
      `${baseUrl}/medicines?search=${encoded}&letter=all`,
      `${baseUrl}/medicines?search=${encoded}`,
    ];
  }

  if (host === 'dvago.pk') {
    return [`${baseUrl}/search?search=${encoded}`];
  }

  if (host === 'vitaminshouse.com') {
    if (!slug) return [];
    return [`${baseUrl}/products/${slug}`];
  }

  if (host === 'asraderm.pk') {
    return [
      `${baseUrl}/search?type=product&options%5Bunavailable_products%5D=last&options%5Bprefix%5D=last&q=${encoded}`,
    ];
  }

  if (host === 'melori.com') {
    return [`${baseUrl}/search?q=${encoded}`];
  }

  if (host === 'empowerandbrews.com') {
    if (!slug) return [];
    return [`${baseUrl}/product/${slug}/`, `${baseUrl}/product/${slug}`];
  }

  if (host === 'bazaarica.com') {
    const productUrls = slugVariants.flatMap(item => [
      `${baseUrl}/en/product/${item}/`,
      `${baseUrl}/en/product/${item}`,
      `${baseUrl}/product/${item}/`,
      `${baseUrl}/product/${item}`,
    ]);

    return [
      ...productUrls,
      `${baseUrl}/en/?s=${encoded}&post_type=product`,
      `${baseUrl}/?s=${encoded}&post_type=product`,
      `${baseUrl}/en/?s=${encoded}`,
      `${baseUrl}/?s=${encoded}`,
    ];
  }

  if (host === 'gosupps.com') {
    return [`${baseUrl}/catalogsearch/result/?q=${encoded}`];
  }

  const productLikeUrls = slug
    ? [
        `${baseUrl}/product/${slug}/`,
        `${baseUrl}/product/${slug}`,
        `${baseUrl}/products/${slug}/`,
        `${baseUrl}/products/${slug}`,
      ]
    : [];

  return [...productLikeUrls, `${baseUrl}/search?q=${encoded}`];
};

const rankDescriptionLinks = (links, medicineName) =>
  links
    .map(link => ({
      link,
      score:
        scoreMatchStrength(link, medicineName) +
        (/\/product\//i.test(link) ? 30 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.link);

const fetchPreferredDomainDescription = async medicineName => {
  for (const baseUrl of PRIORITY_SOURCE_BASE_URLS) {
    const searchUrls = buildPreferredDomainSearchUrls(baseUrl, medicineName);
    const discovered = [];

    for (const searchUrl of searchUrls) {
      if (isAllowedPriorityDetailLink(searchUrl, baseUrl)) {
        discovered.push(searchUrl);
      }

      try {
        const response = await requestWithRetry(searchUrl, {
          headers: {
            Referer: baseUrl,
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          },
        });

        const html = String(response?.data || '');

        const links = filterPriorityDomainLinks(
          extractAnchorLinks(html, searchUrl)
            .filter(link => isSameHost(baseUrl, link))
            .filter(link => !isSearchLikeUrl(link))
            .filter(
              link => !/\/(cart|checkout|account|login|register)\b/i.test(link)
            ),
          baseUrl
        );

        discovered.push(...links);
      } catch {
        // continue with next search URL
      }
    }

    const rankedLinks = rankDescriptionLinks(
      Array.from(new Set(discovered)),
      medicineName
    ).slice(0, 8);

    for (const link of rankedLinks) {
      if (
        !hasMedicineTokenInUrl(link, medicineName) &&
        countOrderedMatches(link, medicineName) < 2
      ) {
        continue;
      }

      try {
        const page = await requestWithRetry(link, {
          headers: {
            Referer: baseUrl,
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          },
        });

        const html = String(page?.data || '');
        if (isSearchLikePage(html, link)) {
          continue;
        }

        const metaDescription = extractMetaDescription(html);
        if (
          metaDescription &&
          isRelevantDescription(metaDescription, medicineName)
        ) {
          return metaDescription;
        }

        const sectionDescription = extractProductSectionDescription(html);
        if (
          sectionDescription &&
          isRelevantDescription(sectionDescription, medicineName)
        ) {
          return sectionDescription;
        }

        const jsonLdDescription = extractJsonLdDescription(html);
        if (
          jsonLdDescription &&
          isRelevantDescription(jsonLdDescription, medicineName)
        ) {
          return jsonLdDescription;
        }

        const bodyDescription = extractBodyDescription(html);
        if (
          bodyDescription &&
          isRelevantDescription(bodyDescription, medicineName)
        ) {
          return bodyDescription;
        }
      } catch {
        // continue with next candidate link
      }
    }
  }

  return null;
};
void fetchPreferredDomainDescription;

const fetchPreferredDomainImageUrls = async medicineName => {
  const strictCollected = [];
  const fallbackCollected = [];

  for (const baseUrl of PRIORITY_SOURCE_BASE_URLS) {
    const searchUrls = buildPreferredDomainSearchUrls(baseUrl, medicineName);
    const discovered = [];

    for (const searchUrl of searchUrls) {
      if (isAllowedPriorityDetailLink(searchUrl, baseUrl)) {
        discovered.push(searchUrl);
      }

      try {
        const response = await requestWithRetry(searchUrl, {
          headers: {
            Referer: baseUrl,
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          },
        });

        const html = String(response?.data || '');
        const links = filterPriorityDomainLinks(
          extractAnchorLinks(html, searchUrl)
            .filter(link => isSameHost(baseUrl, link))
            .filter(
              link => !/\/(cart|checkout|account|login|register)\b/i.test(link)
            ),
          baseUrl
        );

        discovered.push(...links);
      } catch {
        // continue with next search URL
      }
    }

    const rankedLinks = rankDescriptionLinks(
      Array.from(new Set(discovered)),
      medicineName
    ).slice(0, 8);

    for (const link of rankedLinks) {
      try {
        const page = await requestWithRetry(link, {
          headers: {
            Referer: baseUrl,
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          },
        });

        const html = String(page?.data || '');
        if (isSearchLikePage(html, link)) continue;

        const pageCandidates = collectPageImageCandidates(
          html,
          link,
          medicineName
        );
        strictCollected.push(...pageCandidates.strict);
        fallbackCollected.push(...pageCandidates.fallback);

        if (
          strictCollected.length + fallbackCollected.length >=
          Math.max(MIN_IMAGE_CANDIDATES, 5)
        ) {
          break;
        }
      } catch {
        // continue with next link
      }
    }

    const ranked = rankAndFilterImageUrls(
      [...strictCollected, ...fallbackCollected],
      medicineName
    );
    if (ranked.length >= MIN_IMAGE_CANDIDATES) {
      return ranked;
    }
  }

  return rankAndFilterImageUrls(
    [...strictCollected, ...fallbackCollected],
    medicineName
  );
};

const fetchDuckDuckGoVqd = async query => {
  const response = await requestWithRetry('https://duckduckgo.com/', {
    params: { q: query },
    headers: {
      Referer: 'https://duckduckgo.com/',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    },
  });

  const html = String(response?.data || '');
  const patterns = [/vqd='([^']+)'/i, /vqd="([^"]+)"/i, /"vqd":"([^"]+)"/i];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

const fetchDuckDuckGoImageUrls = async medicineName => {
  const searchTerms = buildSearchTerms(medicineName);
  const strictCollected = [];
  const fallbackCollected = [];

  for (const term of searchTerms) {
    try {
      const vqd = await fetchDuckDuckGoVqd(term);
      if (!vqd) continue;

      const response = await requestWithRetry('https://duckduckgo.com/i.js', {
        params: {
          q: term,
          vqd,
          o: 'json',
          l: 'us-en',
          p: '1',
          f: ',,,',
          s: 0,
          safe: '-1',
        },
        headers: {
          Referer: `https://duckduckgo.com/?q=${encodeURIComponent(term)}&iax=images&ia=images`,
          Accept: 'application/json, text/plain, */*',
        },
      });

      const results = Array.isArray(response?.data?.results)
        ? response.data.results
        : [];

      for (const result of results) {
        const candidate = normalizeHttpUrl(result?.image || result?.thumbnail);
        if (!candidate) continue;

        if (hasMedicineTokenInUrl(candidate, medicineName)) {
          strictCollected.push(candidate);
        } else {
          fallbackCollected.push(candidate);
        }

        if (strictCollected.length + fallbackCollected.length >= 80) break;
      }
    } catch {
      // continue with next term
    }
  }

  const pool =
    strictCollected.length >= MIN_IMAGE_CANDIDATES
      ? strictCollected
      : [...strictCollected, ...fallbackCollected];

  const ranked = rankAndFilterImageUrls(pool, medicineName);
  if (ranked.length >= MIN_IMAGE_CANDIDATES) {
    return ranked;
  }

  // Fallback: extract product images from DDG web result pages.
  for (const term of searchTerms) {
    try {
      const response = await requestWithRetry('https://duckduckgo.com/html/', {
        params: { q: term },
        headers: {
          Referer: 'https://duckduckgo.com/',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
      });

      const links = collectDuckResultLinks(response?.data || '');
      const rankedLinks = links
        .map(link => ({
          link,
          score:
            countOrderedMatches(link, medicineName) * 10 +
            (hasMedicineTokenInUrl(link, medicineName) ? 6 : 0),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(item => item.link);

      for (const link of rankedLinks) {
        if (!hasOrderedMedicineTokensInUrl(link, medicineName)) {
          const lowSignal = countOrderedMatches(link, medicineName) === 0;
          if (lowSignal) continue;
        }

        try {
          const page = await requestWithRetry(link, {
            headers: {
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            },
          });

          const html = String(page?.data || '');
          const pageCandidates = collectPageImageCandidates(
            html,
            link,
            medicineName
          );

          strictCollected.push(...pageCandidates.strict);
          fallbackCollected.push(...pageCandidates.fallback);

          if (
            strictCollected.length + fallbackCollected.length >=
            Math.max(MIN_IMAGE_CANDIDATES, 5)
          ) {
            break;
          }
        } catch {
          // continue with next link
        }
      }
    } catch {
      // continue with next term
    }
  }

  return rankAndFilterImageUrls(
    [...strictCollected, ...fallbackCollected],
    medicineName
  );
};

const fetchDuckDuckGoDescription = async medicineName => {
  const searchTerms = buildDescriptionSearchTerms(medicineName);

  for (const term of searchTerms) {
    try {
      const response = await requestWithRetry('https://duckduckgo.com/html/', {
        params: { q: term },
        headers: {
          Referer: 'https://duckduckgo.com/',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
      });

      const html = String(response?.data || '');
      const patterns = [
        /<(?:a|div|span)[^>]*class=["'][^"']*result__snippet[^"']*["'][^>]*>([\s\S]*?)<\/(?:a|div|span)>/gi,
        /result__snippet[^>]*>([\s\S]*?)<\/(?:a|div|span)>/gi,
      ];

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
          const text = normalizeDescription(stripHtml(match[1]));
          if (
            text &&
            text.length >= 12 &&
            isRelevantDescription(text, medicineName)
          ) {
            return text;
          }
        }
      }

      const links = collectDuckResultLinks(html)
        .map(link => ({
          link,
          score:
            (isPreferredDescriptionDomain(link) ? 100 : 0) +
            countOrderedMatches(link, medicineName) * 10 +
            (hasMedicineTokenInUrl(link, medicineName) ? 5 : 0),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(item => item.link);

      for (const link of links) {
        try {
          const page = await requestWithRetry(link, {
            headers: {
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            },
          });

          if (isSearchLikePage(page?.data || '', link)) {
            continue;
          }

          const description = extractMetaDescription(page?.data || '');
          if (description && isRelevantDescription(description, medicineName)) {
            return description;
          }

          const sectionDescription = extractProductSectionDescription(
            page?.data || ''
          );
          if (
            sectionDescription &&
            isRelevantDescription(sectionDescription, medicineName)
          ) {
            return sectionDescription;
          }

          const jsonLdDescription = extractJsonLdDescription(page?.data || '');
          if (
            jsonLdDescription &&
            isRelevantDescription(jsonLdDescription, medicineName)
          ) {
            return jsonLdDescription;
          }

          const bodyDescription = extractBodyDescription(page?.data || '');
          if (
            bodyDescription &&
            isRelevantDescription(bodyDescription, medicineName)
          ) {
            return bodyDescription;
          }
        } catch {
          // continue with next link
        }
      }
    } catch {
      // continue with next term
    }
  }

  return null;
};
void fetchDuckDuckGoDescription;

const fetchDuckDuckGoInstantDescription = async medicineName => {
  const searchTerms = buildSearchTerms(medicineName);

  for (const term of searchTerms) {
    try {
      const response = await requestWithRetry('https://api.duckduckgo.com/', {
        params: {
          q: term,
          format: 'json',
          no_html: 1,
          skip_disambig: 1,
        },
        headers: {
          Referer: 'https://duckduckgo.com/',
          Accept: 'application/json, text/plain, */*',
        },
      });

      const data = response?.data || {};
      const candidates = [data?.AbstractText, data?.Answer, data?.Definition];

      for (const candidate of candidates) {
        const text = normalizeDescription(candidate);
        if (
          text &&
          text.length >= 12 &&
          isRelevantDescription(text, medicineName)
        ) {
          return text;
        }
      }

      const related = Array.isArray(data?.RelatedTopics)
        ? data.RelatedTopics
        : [];

      for (const item of related) {
        const text = normalizeDescription(item?.Text);
        if (
          text &&
          text.length >= 12 &&
          isRelevantDescription(text, medicineName)
        ) {
          return text;
        }
      }
    } catch {
      // continue with next term
    }
  }

  return null;
};
void fetchDuckDuckGoInstantDescription;

const fetchOpenRouterDescription = async medicineName => {
  if (!OPENROUTER_API_KEY) {
    debugLog('openrouter_missing_api_key');
    return null;
  }

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: OPENROUTER_MODEL,
        temperature: 0.2,
        max_tokens: 220,
        messages: [
          {
            role: 'system',
            content:
              'You are a pharmacist assistant. Return a concise factual medicine/product description in plain text. If uncertain, return null-like short response.',
          },
          {
            role: 'user',
            content: `Provide a concise description for this medicine/product name: ${medicineName}`,
          },
        ],
      },
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const raw = response?.data?.choices?.[0]?.message?.content;
    const content = Array.isArray(raw)
      ? raw
          .map(item => (typeof item?.text === 'string' ? item.text : ''))
          .join(' ')
      : String(raw || '');

    const cleaned = normalizeDescription(content);
    if (!cleaned || cleaned.length < 20) return null;

    if (/^null$|^n\/a$|not enough info/i.test(cleaned)) {
      return null;
    }

    return cleaned;
  } catch (error) {
    debugLog('openrouter_description_error', {
      medicineName,
      ...debugErrorMeta(error),
    });
    return null;
  }
};

const fetchDescription = async medicineName => {
  try {
    debugLog('fetch_description_start', { medicineName });

    const openRouterDescription =
      await fetchOpenRouterDescription(medicineName);
    if (openRouterDescription) {
      debugLog('fetch_description_done', {
        medicineName,
        found: true,
        sourceTitle: 'openrouter',
      });
      return openRouterDescription;
    }

    debugLog('fetch_description_done', {
      medicineName,
      found: false,
    });
    return null;
  } catch (error) {
    debugLog('fetch_description_error', {
      medicineName,
      ...debugErrorMeta(error),
    });
    return null;
  }
};

const fetchImageSearchUrls = async medicineName => {
  try {
    debugLog('fetch_image_search_start', {
      medicineName,
      min: MIN_IMAGE_CANDIDATES,
    });

    const preferredUrls = await fetchPreferredDomainImageUrls(medicineName);
    if (preferredUrls.length >= MIN_IMAGE_CANDIDATES) {
      debugLog('fetch_image_search_done', {
        medicineName,
        found: true,
        foundCount: preferredUrls.length,
        sourceTitle: 'preferred-domain-source',
      });
      return preferredUrls;
    }

    const urls = await fetchDuckDuckGoImageUrls(medicineName);

    if (urls.length < MIN_IMAGE_CANDIDATES) {
      debugLog('fetch_image_search_done', {
        medicineName,
        found: false,
        foundCount: urls.length,
      });
      return [];
    }

    debugLog('fetch_image_search_done', {
      medicineName,
      found: true,
      foundCount: urls.length,
    });

    return urls;
  } catch (error) {
    debugLog('fetch_image_search_error', {
      medicineName,
      ...debugErrorMeta(error),
    });
    return [];
  }
};

export const fetchMedicineDetails = async medicineName => {
  try {
    const normalizedName = String(medicineName || '').trim();
    if (!normalizedName) {
      debugLog('invalid_medicine_name', { medicineName });
      return emptyResult();
    }

    debugLog('start', { medicineName: normalizedName });

    let description = null;
    let imageUrls = [];

    try {
      description = await fetchDescription(normalizedName);
    } catch {
      description = null;
    }

    try {
      imageUrls = await fetchImageSearchUrls(normalizedName);
    } catch {
      imageUrls = [];
    }

    debugLog('done', {
      medicineName: normalizedName,
      hasDescription: Boolean(description),
      hasImageUrls: imageUrls.length > 0,
      imageCandidatesFound: imageUrls.length,
    });

    return {
      description: description || null,
      imageUrls,
    };
  } catch (error) {
    debugLog('fatal_error', {
      medicineName,
      ...debugErrorMeta(error),
    });
    return emptyResult();
  }
};
