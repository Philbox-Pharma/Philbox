import axios from 'axios';

const response = await axios.get('https://duckduckgo.com/html/', {
  params: { q: 'A OXI FORMULA CAPS 60S' },
  headers: {
    'User-Agent': 'Mozilla/5.0',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  },
  timeout: 8000,
});

const html = String(response?.data || '');
console.log('LEN', html.length);
console.log('SNIP', (html.match(/result__snippet/g) || []).length);
console.log('LINK', (html.match(/result__a/g) || []).length);

const patterns = [
  /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i,
  /<div[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/div>/i,
  /<span[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/span>/i,
];

for (const pattern of patterns) {
  const m = html.match(pattern);
  if (m?.[1]) {
    console.log('MATCHED', pattern.toString().slice(0, 35));
    console.log(m[1].slice(0, 220));
    break;
  }
}

const linkRegex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>/gi;
let lm;
let i = 0;
while ((lm = linkRegex.exec(html)) !== null && i < 3) {
  console.log('LINK', lm[1]);
  i += 1;
}
