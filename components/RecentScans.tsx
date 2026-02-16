import React from 'react';
import { Product } from '../types';
import { Package, Clock, Edit2 } from 'lucide-react';

interface RecentScansProps {
  scans: Product[];
  onScanClick: (product: Product) => void;
}

const RecentScans: React.FC<RecentScansProps> = ({ scans, onScanClick }) => {
  if (scans.length === 0) return null;

  return (
    <div className="mt-8 mb-24">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Clock size={18} className="text-gray-400" />
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Recent Scans</h3>
      </div>
      
      <div className="space-y-3">
        {scans.map((product, idx) => (
          <div 
            key={`${product.barcode}-${idx}`} 
            onClick={() => onScanClick(product)}
            className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 cursor-pointer hover:border-royal-300 hover:shadow-md transition-all group" 
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="bg-blue-50 p-2 rounded-full text-royal-500 shrink-0 group-hover:bg-royal-500 group-hover:text-white transition-colors">
              <Package size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-800 truncate">{product.nama_produk}</h4>
              <p className="text-xs text-gray-500 font-mono">{product.barcode}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{product.kategori}</span>
                <span className="text-sm font-bold text-royal-600">
                  Rp {new Intl.NumberFormat('id-ID').format(product.harga_jual)}
                </span>
              </div>
            </div>
            <div className="text-gray-300 group-hover:text-royal-500 self-center">
                <Edit2 size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentScans;