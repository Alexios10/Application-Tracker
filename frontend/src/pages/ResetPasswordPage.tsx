import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5242";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Hent token fra URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passordene matcher ikke.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/account/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        setError("Ugyldig eller utløpt lenke.");
      }
    } catch {
      setError("Noe gikk galt. Prøv igjen.");
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        Ugyldig lenke.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Tilbakestill passord</h2>
      {success ? (
        <div className="text-green-600">
          Passordet er endret! Du kan nå logge inn.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Nytt passord</label>
          <input
            type="password"
            className="border p-2 w-full mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="block mb-2">Gjenta nytt passord</label>
          <input
            type="password"
            className="border p-2 w-full mb-4"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Lagre nytt passord
          </button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default ResetPasswordPage;
