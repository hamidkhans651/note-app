"use client";

import { useState } from 'react';
import { toast } from 'sonner';

export default function ImportUrls() {
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    
    const promise = new Promise<string>(async (resolve, reject) => {
      try {
        const response = await fetch('/api/import-urls', {
          method: 'POST',
          body: data,
        });

        const text = await response.text();
        if (!response.ok) {
          throw new Error(text);
        }

        const result = JSON.parse(text);
        resolve(String(result.message));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to import URLs';
        reject(String(message));
      } finally {
        setLoading(false);
      }
    });

    toast.promise(promise, {
      loading: 'Importing URLs...',
      success: (message) => <div className="font-medium">{message}</div>,
      error: (error) => <div className="text-red-500 font-medium">{error}</div>,
    });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-4">Import Facebook Group URLs</h1>
      <textarea
        value={data}
        onChange={(e) => setData(e.target.value)}
        className="w-full h-64 p-2 border rounded mb-4"
        placeholder="Paste your data here..."
      />
      <button
        onClick={handleImport}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Importing...' : 'Import URLs'}
      </button>
    </div>
  );
}