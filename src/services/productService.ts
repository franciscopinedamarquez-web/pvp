export interface Product {
  id: number;
  sku: string;
  barcode: string;
  name: string;
  price: string;
  regularPrice: string;
  salePrice?: string;
  priceHtml: string;
  stockQuantity: number;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  category: 'comics' | 'manga' | 'juegos' | 'merchandising' | 'libros';
  imageUrl?: string;
  description?: string;
  publisher?: string;
  author?: string;
}

const WC_URL    = process.env.EXPO_PUBLIC_WC_URL    ?? 'https://www.alcalacomics.com/wp-json/wc/v3';
const WC_KEY    = process.env.EXPO_PUBLIC_WC_KEY    ?? '';
const WC_SECRET = process.env.EXPO_PUBLIC_WC_SECRET ?? '';

function apiUrl(path: string, params: Record<string, string> = {}): string {
  const qs = new URLSearchParams({ consumer_key: WC_KEY, consumer_secret: WC_SECRET, ...params });
  return `${WC_URL}${path}?${qs.toString()}`;
}

// Extrae precios del price_html de WooCommerce
// price_html es exactamente lo que muestra el frontend
// Ejemplo: <del>39,50 €</del><ins>37,53 €</ins>  o simplemente  39,50 €
function parsePriceHtml(html: string): { regular: string; sale?: string; current: string } {
  if (!html) return { regular: '', current: '' };

  // Limpia el HTML dejando solo texto
  const strip = (s: string) => s
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&euro;/g, '€')
    .replace(/&#8364;/g, '€')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();

  // Precio tachado (precio original) — dentro de <del>
  const delMatch = html.match(/<del[^>]*>([\s\S]*?)<\/del>/i);
  // Precio en oferta — dentro de <ins>
  const insMatch = html.match(/<ins[^>]*>([\s\S]*?)<\/ins>/i);

  if (delMatch && insMatch) {
    const regular = strip(delMatch[1]);
    const sale = strip(insMatch[1]);
    return { regular, sale, current: sale };
  }

  // Sin oferta — precio simple
  const current = strip(html);
  return { regular: current, current };
}

export async function searchByBarcode(barcode: string): Promise<Product | null> {
  try {
    const res = await fetch(apiUrl('/products', { sku: barcode, per_page: '1' }));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return mapWooProduct(data[0]);
    const res2 = await fetch(apiUrl('/products', { search: barcode, per_page: '5' }));
    const data2 = await res2.json();
    if (Array.isArray(data2) && data2.length > 0) return mapWooProduct(data2[0]);
    return null;
  } catch (error) {
    console.error('[WooCommerce] Error en searchByBarcode:', error);
    return null;
  }
}

export async function searchByText(query: string): Promise<Product[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(apiUrl('/products', { search: query.trim(), per_page: '30', status: 'publish' }));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapWooProduct);
  } catch (error) {
    console.error('[WooCommerce] Error en searchByText:', error);
    return [];
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch(apiUrl('/products', { per_page: '100', status: 'publish', orderby: 'date', order: 'desc' }));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapWooProduct);
  } catch (error) {
    console.error('[WooCommerce] Error en getAllProducts:', error);
    return [];
  }
}

export async function getOutOfStockProducts(): Promise<Product[]> {
  try {
    const res = await fetch(apiUrl('/products', { stock_status: 'outofstock', per_page: '100', status: 'publish' }));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapWooProduct);
  } catch (error) {
    console.error('[WooCommerce] Error en getOutOfStockProducts:', error);
    return [];
  }
}

function mapWooProduct(p: any): Product {
  const cleanDescription = p.short_description
    ? p.short_description.replace(/<[^>]*>/g, '').trim()
    : undefined;

  // Usamos price_html — es exactamente el precio que muestra el frontend
  const parsed = parsePriceHtml(p.price_html ?? '');

  return {
    id: p.id,
    sku: p.sku || String(p.id),
    barcode: p.sku || String(p.id),
    name: p.name,
    price: parsed.current,
    regularPrice: parsed.regular,
    salePrice: parsed.sale,
    priceHtml: p.price_html ?? '',
    stockQuantity: typeof p.stock_quantity === 'number' ? p.stock_quantity : 0,
    stockStatus: p.stock_status ?? 'outofstock',
    category: mapCategory(p.categories),
    imageUrl: p.images?.[0]?.src,
    description: cleanDescription,
    publisher: extractAttribute(p, 'editorial') ?? extractAttribute(p, 'publisher'),
    author: extractAttribute(p, 'autor') ?? extractAttribute(p, 'author'),
  };
}

function mapCategory(categories: any[]): Product['category'] {
  if (!categories?.length) return 'comics';
  for (const cat of categories) {
    const name = (cat.name ?? '').toLowerCase();
    const slug = (cat.slug ?? '').toLowerCase();
    if (name.includes('manga') || slug.includes('manga')) return 'manga';
    if (name.includes('juego') || slug.includes('juego')) return 'juegos';
    if (name.includes('merch') || slug.includes('merch') || name.includes('figur') || name.includes('funko')) return 'merchandising';
    if (name.includes('libro') || slug.includes('libro')) return 'libros';
  }
  return 'comics';
}

function extractAttribute(p: any, attributeName: string): string | undefined {
  if (!Array.isArray(p.attributes)) return undefined;
  const attr = p.attributes.find((a: any) => (a.name ?? '').toLowerCase() === attributeName.toLowerCase());
  return attr?.options?.[0] ?? attr?.option;
}

export async function getLatestProducts(): Promise<Product[]> {
  try {
    const allProducts: Product[] = [];
    for (let page = 1; page <= 5; page++) {
      const res = await fetch(apiUrl('/products', {
        per_page: '100',
        status: 'publish',
        orderby: 'date',
        order: 'desc',
        page: String(page),
      }));
      if (!res.ok) break;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      allProducts.push(...data.map(mapWooProduct));
      if (data.length < 100) break;
    }
    return allProducts;
  } catch (error) {
    console.error('[WooCommerce] Error en getLatestProducts:', error);
    return [];
  }
}

export async function getBestSellers(): Promise<Product[]> {
  try {
    const res = await fetch(apiUrl('/products', {
      per_page: '20',
      status: 'publish',
      orderby: 'popularity',
      order: 'desc',
    }));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapWooProduct);
  } catch (error) {
    console.error('[WooCommerce] Error en getBestSellers:', error);
    return [];
  }
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(apiUrl('/products/categories', {
      per_page: '100',
      orderby: 'count',
      order: 'desc',
      hide_empty: 'true',
    }));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: c.count,
      parent: c.parent,
    }));
  } catch (error) {
    console.error('[WooCommerce] Error en getCategories:', error);
    return [];
  }
}

export async function getProductsByCategory(categoryId: number, page: number): Promise<Product[]> {
  try {
    const res = await fetch(apiUrl('/products', {
      category: String(categoryId),
      per_page: '100',
      page: String(page),
      status: 'publish',
      orderby: 'date',
      order: 'desc',
    }));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapWooProduct);
  } catch (error) {
    console.error('[WooCommerce] Error en getProductsByCategory:', error);
    return [];
  }
}
