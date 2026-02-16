export interface Product {
  id?: number;
  barcode: string;
  nama_produk: string;
  harga_jual: number;
  kategori: string;
  stok: number;
  created_at?: string;
}

export interface ExternalApiResponse {
  status: boolean;
  message: string;
  data?: {
    barcode: string;
    name: string; // Assuming the API returns 'name'
    // Add other fields if the API returns them
  };
}

export enum ProductCategory {
  MAKANAN = 'Makanan',
  MINUMAN = 'Minuman',
  KEBERSIHAN = 'Kebersihan',
  SEMBAKO = 'Sembako',
  LAINNYA = 'Lainnya',
}
