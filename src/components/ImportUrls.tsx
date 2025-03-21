"use client";
import { useState } from 'react';

export default function ImportUrls() {
  const [data, setData] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/import-urls', {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage('Error importing URLs');
    } finally {
      setLoading(false);
    }
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
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
}