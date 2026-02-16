import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../types';
import { Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProductFormProps {
  initialData: Partial<Product>;
  isLoadingExternal: boolean;
  onSubmit: (data: Product) => Promise<void>;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, isLoadingExternal, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    barcode: '',
    nama_produk: '',
    harga_jual: 0,
    kategori: ProductCategory.LAINNYA,
    stok: 0
  });

  const [isSaving, setIsSaving] = useState(false);
  const [displayPrice, setDisplayPrice] = useState('');

  // Update form when initial data changes (e.g. after scan)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...initialData,
      // If initial data has values, use them, otherwise keep defaults
      kategori: initialData.kategori || prev.kategori || ProductCategory.LAINNYA,
      stok: initialData.stok !== undefined ? initialData.stok : prev.stok || 0,
    }));
    
    if (initialData.harga_jual !== undefined) {
      setDisplayPrice(formatCurrency(initialData.harga_jual));
    } else {
      setDisplayPrice('');
    }
  }, [initialData]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digit characters
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
    
    setFormData(prev => ({ ...prev, harga_jual: numericValue }));
    setDisplayPrice(formatCurrency(numericValue));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.barcode || !formData.nama_produk) return;

    setIsSaving(true);
    try {
      await onSubmit(formData as Product);
      // Reset logic can be handled by parent or left as is to show success state
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
         <h2 className="text-lg font-bold text-gray-800">Detail Produk</h2>
         {isLoadingExternal && <span className="text-xs text-royal-500 animate-pulse flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Mencari data online...</span>}
      </div>

      {/* Barcode (Read Only) */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Barcode</label>
        <input 
          type="text" 
          value={formData.barcode || ''} 
          disabled 
          className="w-full bg-gray-100 text-gray-600 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm"
          placeholder="Scan barcode di atas..."
        />
      </div>

      {/* Nama Produk */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nama Produk</label>
        <input 
          type="text" 
          required
          value={formData.nama_produk || ''} 
          onChange={(e) => setFormData({...formData, nama_produk: e.target.value})}
          className="w-full bg-white text-gray-900 border border-gray-300 focus:border-royal-500 focus:ring-2 focus:ring-royal-500/20 rounded-lg px-3 py-2 outline-none transition-all"
          placeholder="Masukkan nama produk"
        />
      </div>

      {/* Harga & Stok Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Harga Jual */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Harga Jual</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">Rp</span>
            <input 
              type="text" 
              required
              value={displayPrice}
              onChange={handlePriceChange}
              className="w-full bg-white text-gray-900 border border-gray-300 focus:border-royal-500 focus:ring-2 focus:ring-royal-500/20 rounded-lg pl-10 pr-3 py-2 outline-none transition-all text-right font-medium"
              placeholder="0"
            />
          </div>
        </div>

        {/* Stok */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Stok</label>
          <input 
            type="number" 
            required
            min="0"
            value={formData.stok || ''}
            onChange={(e) => setFormData({...formData, stok: parseInt(e.target.value) || 0})}
            className="w-full bg-white text-gray-900 border border-gray-300 focus:border-royal-500 focus:ring-2 focus:ring-royal-500/20 rounded-lg px-3 py-2 outline-none transition-all"
            placeholder="0"
          />
        </div>
      </div>

      {/* Kategori */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Kategori</label>
        <div className="relative">
            <select 
            required
            value={formData.kategori || ProductCategory.LAINNYA}
            onChange={(e) => setFormData({...formData, kategori: e.target.value as ProductCategory})}
            className="w-full bg-white text-gray-900 border border-gray-300 focus:border-royal-500 focus:ring-2 focus:ring-royal-500/20 rounded-lg px-3 py-2 outline-none transition-all appearance-none"
            >
            {Object.values(ProductCategory).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
            ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={isSaving || !formData.barcode}
        className={`mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-semibold shadow-lg transition-all
          ${isSaving || !formData.barcode ? 'bg-gray-400 cursor-not-allowed' : 'bg-royal-500 hover:bg-royal-600 shadow-royal-500/30'}
        `}
      >
        {isSaving ? (
          <>
            <Loader2 className="animate-spin" size={20} /> Menyimpan...
          </>
        ) : (
          <>
            <Save size={20} /> Simpan ke Database
          </>
        )}
      </button>

    </form>
  );
};

export default ProductForm;
