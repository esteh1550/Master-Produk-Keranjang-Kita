import { supabase } from './supabase';
import { Product } from '../types';

const EXTERNAL_API_URL = 'https://api-products.alpha-projects.cloud/api/v1/products-barcode';

export const getProductByBarcode = async (barcode: string): Promise<{ found: boolean; data: Partial<Product>; source: 'db' | 'api' | 'none' }> => {
  try {
    // Step A: Check Supabase
    const { data: dbData, error: dbError } = await supabase
      .from('master_produk')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (dbData && !dbError) {
      return { found: true, data: dbData, source: 'db' };
    }

    // Step B: Check External API
    try {
      const response = await fetch(`${EXTERNAL_API_URL}?barcode=${barcode}`);
      const apiResult = await response.json();
      
      // Note: Adjusting parsing based on typical API structures. 
      // Assuming apiResult.data.name exists based on prompt description.
      if (apiResult && apiResult.data && apiResult.data.name) {
        return {
          found: true,
          data: {
            barcode: barcode,
            nama_produk: apiResult.data.name,
            kategori: 'Lainnya', // Default
            stok: 0,
            harga_jual: 0
          },
          source: 'api'
        };
      }
    } catch (apiError) {
      console.error("External API Error:", apiError);
    }

    // Not found anywhere
    return { 
      found: false, 
      data: { barcode }, 
      source: 'none' 
    };

  } catch (err) {
    console.error("Lookup Error:", err);
    return { found: false, data: { barcode }, source: 'none' };
  }
};

export const saveProduct = async (product: Product) => {
  // Upsert based on barcode (conflict target)
  const { data, error } = await supabase
    .from('master_produk')
    .upsert(
      { 
        barcode: product.barcode,
        nama_produk: product.nama_produk,
        harga_jual: product.harga_jual,
        kategori: product.kategori,
        stok: product.stok,
        // created_at is usually handled by default in DB, but we leave it to DB
      },
      { onConflict: 'barcode' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getRecentProducts = async (limit: number = 100) => {
  // Fetch recent products for export or list view
  // We use try-catch to handle cases where created_at might usually exist in Supabase
  try {
    const { data, error } = await supabase
      .from('master_produk')
      .select('*')
      .limit(limit);
      
    if (error) throw error;
    
    // Sort client-side to be safe if created_at is missing from selection or schema
    return data?.sort((a, b) => (b.id || 0) - (a.id || 0)) || [];
  } catch (err) {
    console.error("Error fetching recent products:", err);
    return [];
  }
};