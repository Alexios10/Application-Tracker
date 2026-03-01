import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5242";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSent(false);
    try {
      // Kall backend for å få reset-lenke
      const res = await fetch(`${API_BASE}/api/account/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        setError("Noe gikk galt. Prøv igjen.");
        return;
      }

      // Sjekk om responsen har innhold (bruker ble funnet)
      const text = await res.text();
      if (text) {
        const data = JSON.parse(text);
        if (data.resetLink) {
          // Velg service dynamisk basert på e-post
          const serviceId = email.endsWith("@gmail.com")
            ? "service_8tiaqax" // <-- Gmail service id
            : "service_xfg6wyn"; // Outlook service id
          await emailjs.send(
            serviceId,
            "template_5nis3kh", // template id
            {
              title: "Tilbakestill passord",
              name: "mine søknader",
              time: new Date().toLocaleString(),
              reset_link: data.resetLink,
              email: email,
            },
            "eps4pw7YWOlJdYiWX", // public key
          );
        }
      }
      // Vis alltid suksessmelding (ikke avslør om e-post finnes)
      setSent(true);
    } catch (err) {
      setError("Noe gikk galt. Prøv igjen.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Glemt passord</h2>
      {sent ? (
        <div className="text-green-600">
          E-post for tilbakestilling er sendt hvis adressen finnes.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">E-postadresse</label>
          <input
            type="email"
            className="border p-2 w-full mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send lenke
          </button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
