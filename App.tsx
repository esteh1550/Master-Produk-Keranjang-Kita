import React, { useState } from 'react';
import { getProductByBarcode, saveProduct, getRecentProducts } from './services/productService';
import { Product } from './types';
import BarcodeScanner from './components/BarcodeScanner';
import ProductForm from './components/ProductForm';
import RecentScans from './components/RecentScans';
import { ScanBarcode, ShoppingBasket, AlertTriangle, Download, FileDown } from 'lucide-react';

function App() {
  // State
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [recentScans, setRecentScans] = useState<Product[]>([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Logic to handle scan or manual lookup
  const handleBarcodeLookup = async (barcode: string) => {
    // If we just scanned/looked up this, and it is fully loaded, maybe we don't need to do anything?
    // However, for manual entry, forcing a refresh is often good.
    // We only skip if currently loading to prevent race conditions.
    if (isLoadingExternal) return;

    setIsLoadingExternal(true);
    setNotification(null);

    // Initial basic data while loading
    setCurrentProduct(prev => ({ ...prev, barcode }));

    try {
      const result = await getProductByBarcode(barcode);
      
      if (result.found) {
        setCurrentProduct(result.data);
        if (result.source === 'db') {
            showNotification('success', 'Produk ditemukan di database.');
        } else {
            showNotification('success', 'Data produk diambil dari internet.');
        }
      } else {
        // Not found anywhere
        setCurrentProduct({ barcode, nama_produk: '' });
        showNotification('error', 'Produk baru. Silakan isi detailnya.');
      }
    } catch (error) {
      console.error(error);
      showNotification('error', 'Terjadi kesalahan saat mencari produk.');
    } finally {
      setIsLoadingExternal(false);
    }
  };

  // Logic to handle save
  const handleSave = async (product: Product) => {
    try {
      const savedData = await saveProduct(product);
      
      // Update recent scans
      setRecentScans(prev => {
        // Remove existing if present to move it to top
        const filtered = prev.filter(p => p.barcode !== savedData.barcode);
        const newRecent = [savedData, ...filtered];
        return newRecent.slice(0, 5); // Keep only 5
      });

      showNotification('success', 'Produk berhasil disimpan!');
      
      // Optional: Clear form or keep it for review?
      // Keeping it for review/edit is usually better UX in inventory apps
    } catch (error) {
      console.error(error);
      showNotification('error', 'Gagal menyimpan ke database.');
    }
  };

  const handleRecentScanClick = (product: Product) => {
    setCurrentProduct(product);
    showNotification('success', 'Data dimuat. Silakan edit.');
    // Smooth scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = async () => {
    try {
        showNotification('success', 'Menyiapkan file CSV...');
        const data = await getRecentProducts(100); // Fetch last 100 items
        
        if (!data || data.length === 0) {
            showNotification('error', 'Belum ada data untuk diexport.');
            return;
        }

        // Create CSV Content
        const headers = ['Barcode', 'Nama Produk', 'Kategori', 'Harga Jual', 'Stok'];
        const csvContent = [
            headers.join(','),
            ...data.map(row => [
                `"${row.barcode}"`,
                `"${row.nama_produk.replace(/"/g, '""')}"`,
                `"${row.kategori}"`,
                row.harga_jual,
                row.stok
            ].join(','))
        ].join('\n');

        // Trigger Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `MasterProduk_Backup_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('success', 'Data berhasil didownload!');
    } catch (e) {
        console.error("Export error:", e);
        showNotification('error', 'Gagal melakukan export data.');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      
      {/* Header */}
      <header className="bg-royal-500 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBasket className="text-white" size={24} />
            <h1 className="font-bold text-lg leading-tight">
              Keranjang Kita<br/>
              <span className="text-xs font-normal opacity-80">Master Produk Input</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={handleExport}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white"
                title="Download Backup CSV"
            >
                <FileDown size={20} />
            </button>
            <div className="bg-white/10 p-2 rounded-full">
                <ScanBarcode size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-6">
        
        {/* Scanner Section */}
        <section>
          <BarcodeScanner onScanSuccess={handleBarcodeLookup} />
        </section>

        {/* Notification Toast (Inline for Mobile) */}
        {notification && (
          <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-medium animate-pulse
            ${notification.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}
          `}>
            {notification.type === 'error' && <AlertTriangle size={16} />}
            {notification.message}
          </div>
        )}

        {/* Form Section */}
        <section>
          <ProductForm 
            initialData={currentProduct} 
            isLoadingExternal={isLoadingExternal}
            onSubmit={handleSave}
            onSearch={handleBarcodeLookup}
          />
        </section>

        {/* Recent Scans Section */}
        <section>
          <RecentScans 
            scans={recentScans} 
            onScanClick={handleRecentScanClick}
          />
        </section>
      </main>

    </div>
  );
}

export default App;