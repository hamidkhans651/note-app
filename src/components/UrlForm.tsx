"use client";
import { useState, useEffect } from "react";

export default function UrlForm() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [urls, setUrls] = useState<{ id: string; url: string; title: string; description: string; pinned: string | null }[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUrls = async () => {
      const res = await fetch("/api/get-urls");
      const data = await res.json();
      setUrls(data);
    };
    fetchUrls();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const response = await fetch("/api/save-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, title, description }),
    });

    const result = await response.json();
    if (response.ok) {
      setMessage("✅ URL saved successfully!");
      setUrls((prev) => [...prev, { id: result.id, url, title, description, pinned: null }]);
    } else {
      setMessage(`❌ Error: ${result.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    const response = await fetch("/api/delete-url", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      setUrls((prev) => prev.filter((note) => note.id !== id));
    } else {
      setMessage("❌ Error deleting note");
    }
  };

  const handlePin = async (id: string) => {
    const response = await fetch("/api/pin-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      const updatedUrls = urls.map((note) =>
        note.id === id ? { ...note, pinned: new Date().toISOString() } : note
      );
      setUrls(updatedUrls);
    }
  };

  const filteredUrls = urls.filter((note) =>
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.url.toLowerCase().includes(search.toLowerCase()) // Added URL filtering

  );

  return (
    <div className="max-w-md mx-auto">
      <input
        type="text"
        placeholder="Search Notes"
        className="border p-2 mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 flex-grow"
        />
        <input
          type="url"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 flex-grow"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 flex-grow"
        />
        <button type="submit" className="bg-blue-500 text-white p-2">Save</button>
      </form>
      {message && <p className="mt-2 text-sm">{message}</p>}

      <h2 className="mt-4 text-lg font-semibold">Saved Notes:</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredUrls.map((note) => (
          <div key={note.id} className="bg-white p-4 rounded-lg shadow-md border">
            <h3 className="font-semibold">{note.title}</h3>
            <p>{note.description}</p>
            <a href={note.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">Visit Link</a>
            <div className="mt-2 flex justify-between">
              <button onClick={() => handlePin(note.id)} className="text-sm text-blue-500">Pin</button>
              <button onClick={() => handleDelete(note.id)} className="text-sm text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
