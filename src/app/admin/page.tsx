"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  senderIP: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  timestamp: string;
  country?: string;
  city?: string;
  region?: string;
}

export default function AdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages", {
        headers: { Authorization: "Bearer killokiswirf" },
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === "killokiswirf") {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Yanlış şifre!");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("tr-TR");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <form onSubmit={handleLogin} className="bg-gray-800 p-6 rounded-xl">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre"
            className="p-2 rounded text-black"
          />
          <button className="ml-2 bg-blue-500 px-4 py-2 rounded">
            Giriş
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">Admin Panel</h1>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className="bg-gray-800 p-3 mb-2 rounded">
            <p>{msg.content}</p>
            <small>{formatDate(msg.timestamp)}</small>
          </div>
        ))
      )}

      <Link href="/" className="text-blue-400 mt-4 block">
        Ana sayfa
      </Link>
    </div>
  );
}
