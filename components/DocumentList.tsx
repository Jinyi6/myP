"use client";

import { useCallback, useEffect, useState } from "react";

interface DocumentSummary {
  id: string;
  title: string;
  updated_at: number;
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDocuments = useCallback(async () => {
    const res = await fetch("/api/documents");
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as { documents: DocumentSummary[] };
    setDocuments(data.documents);
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const handleCreate = async () => {
    if (!title.trim()) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });
      if (res.ok) {
        setTitle("");
        await loadDocuments();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadDocuments();
    }
  };

  return (
    <section className="doc-list">
      <div className="doc-list__header">
        <h1>VibeMD</h1>
        <p>Markdown-first vibe editor with reviewable patches.</p>
      </div>
      <div className="doc-list__create">
        <input
          value={title}
          placeholder="New document title"
          onChange={(event) => setTitle(event.target.value)}
        />
        <button onClick={handleCreate} disabled={loading}>
          Create
        </button>
      </div>
      <div className="doc-list__items">
        {documents.length === 0 ? (
          <p className="doc-list__empty">No documents yet. Create one to start.</p>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="doc-card">
              <div>
                <h3>{doc.title}</h3>
                <span>
                  Updated {new Date(doc.updated_at).toLocaleString()}
                </span>
              </div>
              <div className="doc-card__actions">
                <a href={`/doc/${doc.id}`}>Open</a>
                <button onClick={() => handleDelete(doc.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
