import axios from 'axios';
import { uploadToCloudinary } from '../../../utils/uploadToCloudinary.js';
import dotenv from 'dotenv';

dotenv.config();

const REQUEST_TIMEOUT_MS = 8000;
const MEDICINE_DETAILS_DEBUG = process.env.MEDICINE_DETAILS_DEBUG === 'true';

const emptyResult = () => ({ imageUrl: null, description: null });

const debugLog = (stage, meta = {}) => {
  if (!MEDICINE_DETAILS_DEBUG) return;
  console.log('[fetchMedicineDetails]', stage, meta);
};

const debugErrorMeta = error => ({
  message: error?.message || 'Unknown error',
  status: error?.response?.status || null,
  code: error?.code || null,
  apiError: error?.response?.data?.error
    ? {
        message: error.response.data.error.message || null,
        status: error.response.data.error.status || null,
        details: Array.isArray(error.response.data.error.errors)
          ? error.response.data.error.errors.map(item => ({
              reason: item?.reason || null,
              domain: item?.domain || null,
              location: item?.location || null,
              locationType: item?.locationType || null,
            }))
          : [],
      }
    : null,
});

const normalizeDescription = snippet => {
  if (typeof snippet !== 'string') return null;

  const trimmed = snippet.trim();
  if (!trimmed) return null;

  return trimmed.replace(/\.{3}$/u, '').trim() || null;
};

const toSafeSlug = value =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'medicine';

const getSearchCredentials = () => {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    debugLog('missing_credentials', {
      hasApiKey: Boolean(apiKey),
      hasSearchEngineId: Boolean(searchEngineId),
    });
    console.warn(
      'Google Custom Search credentials are missing; skipping medicine details fetch.'
    );
    return null;
  }

  debugLog('credentials_loaded');

  return { apiKey, searchEngineId };
};

const fetchDescription = async (medicineName, credentials) => {
  try {
    debugLog('fetch_description_start', { medicineName });
    const response = await axios.get(
      'https://www.googleapis.com/customsearch/v1',
      {
        params: {
          key: credentials.apiKey,
          cx: credentials.searchEngineId,
          q: `${medicineName} medicine uses description`,
          num: 1,
        },
        timeout: REQUEST_TIMEOUT_MS,
      }
    );

    const description = normalizeDescription(
      response?.data?.items?.[0]?.snippet
    );
    debugLog('fetch_description_done', {
      medicineName,
      found: Boolean(description),
    });
    return description;
  } catch (error) {
    debugLog('fetch_description_error', {
      medicineName,
      ...debugErrorMeta(error),
    });
    return null;
  }
};

const fetchImageSearchUrl = async (medicineName, credentials) => {
  try {
    debugLog('fetch_image_search_start', { medicineName });
    const response = await axios.get(
      'https://www.googleapis.com/customsearch/v1',
      {
        params: {
          key: credentials.apiKey,
          cx: credentials.searchEngineId,
          q: `${medicineName} medicine tablet pill`,
          searchType: 'image',
          num: 1,
          imgSize: 'medium',
        },
        timeout: REQUEST_TIMEOUT_MS,
      }
    );

    const imageUrl = response?.data?.items?.[0]?.link;
    if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
      debugLog('fetch_image_search_done', {
        medicineName,
        found: false,
      });
      return null;
    }

    debugLog('fetch_image_search_done', {
      medicineName,
      found: true,
    });
    return imageUrl.trim();
  } catch (error) {
    debugLog('fetch_image_search_error', {
      medicineName,
      ...debugErrorMeta(error),
    });
    return null;
  }
};

const uploadImageFromUrl = async (imageUrl, medicineName) => {
  if (!imageUrl) {
    debugLog('upload_image_skip_empty_url', { medicineName });
    return null;
  }

  try {
    debugLog('upload_image_start', { medicineName });
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: REQUEST_TIMEOUT_MS,
    });

    const contentType = String(response?.headers?.['content-type'] || '');
    if (!contentType.startsWith('image/')) {
      debugLog('upload_image_invalid_content_type', {
        medicineName,
        contentType,
      });
      return null;
    }

    const imageBuffer = Buffer.from(response.data);
    const fileName = `${toSafeSlug(medicineName)}-${Date.now()}`;

    const uploadedUrl = await uploadToCloudinary(
      {
        buffer: imageBuffer,
        fileName,
      },
      'medicines',
      {
        resource_type: 'image',
        type: 'upload',
      }
    );

    debugLog('upload_image_done', {
      medicineName,
      uploaded: Boolean(uploadedUrl),
    });

    return uploadedUrl;
  } catch (error) {
    debugLog('upload_image_error', {
      medicineName,
      ...debugErrorMeta(error),
    });
    return null;
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

    const credentials = getSearchCredentials();
    if (!credentials) {
      return emptyResult();
    }

    let description = null;
    let imageUrl = null;

    try {
      description = await fetchDescription(normalizedName, credentials);
    } catch {
      description = null;
    }

    try {
      const rawImageUrl = await fetchImageSearchUrl(
        normalizedName,
        credentials
      );
      imageUrl = await uploadImageFromUrl(rawImageUrl, normalizedName);
    } catch {
      imageUrl = null;
    }

    debugLog('done', {
      medicineName: normalizedName,
      hasDescription: Boolean(description),
      hasImageUrl: Boolean(imageUrl),
    });

    return {
      imageUrl: imageUrl || null,
      description: description || null,
    };
  } catch (error) {
    debugLog('fatal_error', {
      medicineName,
      ...debugErrorMeta(error),
    });
    return emptyResult();
  }
};
