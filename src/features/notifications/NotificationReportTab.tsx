import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
// import axios from "axios";
import { API_CONFIG } from "../../config/api.config";

export function NotificationReportTab() {
  const { token } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | { type: "success" | "warning" | "error"; message: string }>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/Report/GenerateReport`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ emailAddress: email })
      });

      if (response.ok) {
        setStatus({ type: "success", message: "The report has been generated and sent." });
      } else {
        // Try to parse error message
        let data = null;
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {}
        }
        setStatus({ type: "error", message: (data && data.message) || "An error occurred while generating the report. Please try again later." });
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "An error occurred while generating the report. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
      <label className="block text-left text-gray-700 dark:text-gray-200 font-medium mb-2">
        Talent email:
        <input
          type="email"
          className="mt-1 block w-full rounded border-gray-300 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </label>
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading}
      >
        {loading ? "Sending..." : "Get report"}
      </button>
      {status && (
        <div
          className={`mt-4 p-4 rounded ${
            status.type === "success"
              ? "bg-green-100 text-green-800"
              : status.type === "warning"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status.message}
        </div>
      )}
    </form>
  );
}
