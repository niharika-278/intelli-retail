import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ingestionApi } from '../services/api';
import { showToast } from '../components/Toast';
import BentoGrid from '../components/BentoGrid';
import BentoCard from '../components/BentoCard';

const TABS = [
  { id: 'customers', label: 'Customers', upload: ingestionApi.uploadCustomers },
  { id: 'products', label: 'Products', upload: ingestionApi.uploadProducts },
  { id: 'inventory', label: 'Inventory', upload: ingestionApi.uploadInventory },
  { id: 'sales', label: 'Sales', upload: ingestionApi.uploadSales },
];

export default function DataIngestion() {
  const [activeTab, setActiveTab] = useState('customers');
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [drag, setDrag] = useState(false);

  const upload = TABS.find((t) => t.id === activeTab)?.upload;

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDrag(false);
      const f = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
      if (f && f.name.endsWith('.csv')) {
        setFile(f);
        setResult(null);
      } else {
        showToast('Please select a CSV file', 'error');
      }
    },
    []
  );

  const onDragOver = (e) => {
    e.preventDefault();
    setDrag(true);
  };
  const onDragLeave = () => setDrag(false);

  const handleUpload = async () => {
    if (!file || !upload) return;
    setLoading(true);
    setResult(null);
    setProgress(0);
    try {
      const res = await upload(file);
      setResult(res.data);
      showToast('Upload completed', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed', 'error');
      setResult(err.response?.data || null);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-bento-lg"
    >
      <BentoGrid>
        <BentoCard span="full" variant="sun" emphasis className="!col-span-full">
          <h1 className="font-display text-3xl font-bold tracking-tight">Data ingestion</h1>
          <p className="mt-1 opacity-70">Upload CSV files for customers, inventory, or sales</p>
        </BentoCard>
      </BentoGrid>

      <BentoCard variant="glass" noMotion className="shadow-bento">
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setActiveTab(t.id); setFile(null); setResult(null); }}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              activeTab === t.id ? 'bg-ink text-white' : 'text-ink/60 hover:bg-black/[0.04] hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`border-2 border-dashed rounded-bento p-10 text-center transition-colors duration-250 ${
            drag ? 'border-violet bg-violet/10' : 'border-black/[0.08] bg-black/[0.02]'
          }`}
        >
          <input
            type="file"
            accept=".csv"
            className="hidden"
            id="csv-upload"
            onChange={(e) => onDrop(e)}
          />
          <label htmlFor="csv-upload" className="cursor-pointer block">
            <p className="text-ink/60 mb-1">Drag & drop a CSV file here, or click to browse</p>
            <p className="text-sm text-ink/40">Accepted: .csv only</p>
          </label>
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="text-sm text-ink/60 truncate">{file.name}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearFile}
                className="text-sm text-ink/50 hover:text-ink"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="px-5 py-2 bg-ink text-white text-sm font-medium rounded-full hover:bg-ink/90 disabled:opacity-50"
              >
                {loading ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-4 h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-violet rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}

        {result?.summary && (
          <div className="mt-6 p-4 bg-neon/20 rounded-bento border border-black/[0.06]">
            <h3 className="text-sm font-semibold text-ink mb-2">Ingestion summary</h3>
            <ul className="text-sm text-ink/70 space-y-1">
              <li>Processed: {result.summary.processed}</li>
              <li>Rejected: {result.summary.rejected}</li>
              {result.summary.cleaned != null && <li>Cleaned: {result.summary.cleaned}</li>}
              <li>Total rows: {result.summary.total}</li>
            </ul>
          </div>
        )}

        {result?.preview && Array.isArray(result.preview) && result.preview.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <h3 className="text-sm font-semibold text-ink mb-2">Preview</h3>
            <table className="w-full text-sm border border-black/[0.08] rounded-bento overflow-hidden">
              <thead className="bg-black/[0.04]">
                <tr>
                  {Object.keys(result.preview[0]).map((k) => (
                    <th key={k} className="text-left px-3 py-2 font-medium text-ink/80">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.preview.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t border-black/[0.06]">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="px-3 py-2 text-ink/60">{String(v ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </BentoCard>
    </motion.div>
  );
}
