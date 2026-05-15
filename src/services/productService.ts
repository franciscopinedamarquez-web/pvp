export interface Product {
  id: number;
  sku: string;
  barcode: string;
  name: string;
  price: string;
  regularPrice: string;
  salePrice?: string;
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

function mapWooProduct(p: any): Product {
  const cleanDescription = p.short_description ? p.short_description.replace(/<[^>]*>/g, '').trim() : undefined;
  return {
    id: p.id,
    sku: p.sku || String(p.id),
    barcode: p.sku || String(p.id),
    name: p.name,
    price: p.price || p.regular_price || '0',
    regularPrice: p.regular_price || p.price || '0',
    salePrice: p.sale_price && p.sale_price !== '' ? p.sale_price : undefined,
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
