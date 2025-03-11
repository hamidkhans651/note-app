"use client";
import { useState, useEffect } from "react";

export default function UrlForm() {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [urls, setUrls] = useState<{ id: string; url: string }[]>([]);

  // Fetch stored URLs
  useEffect(() => {
    const fetchUrls = async () => {
      const res = await fetch("/api/get-urls");
      const data = await res.json();
      setUrls(data);
    };
    fetchUrls();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const response = await fetch("/api/save-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const result = await response.json();
    if (response.ok) {
      setMessage("✅ URL saved successfully!");
      setUrls((prev) => [...prev, { id: result.id, url }]);
    } else {
      setMessage(`❌ Error: ${result.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="border p-2 flex-grow"
          placeholder="Enter Facebook Group URL"
        />
        <button type="submit" className="bg-blue-500 text-white p-2">Save</button>
      </form>
      {message && <p className="mt-2 text-sm">{message}</p>}

      <h2 className="mt-4 text-lg font-semibold">Saved URLs:</h2>
      <ul>
        {urls.map(({ id, url }) => (
          <li key={id}>
            <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
