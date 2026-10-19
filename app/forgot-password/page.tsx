
"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendResetEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const redirectTo = `${window.location.origin}/update-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      );

      if (error) throw error;

      setMessage(
        "অনুরোধ পাঠানো হয়েছে। ইমেইল Inbox ও Spam ফোল্ডার পরীক্ষা করো।"
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "অনুরোধ পাঠানো যায়নি।"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.main}>
      <form onSubmit={sendResetEmail} style={styles.card}>
        <h1>AS U GO</h1>
        <h2>Password Reset</h2>
        <p>অ্যাকাউন্টের ইমেইল দিয়ে রিসেট লিংক চাও।</p>

        <input
          type="email"
          placeholder="Owner-এর ইমেইল"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <button disabled={loading} style={styles.button}>
          {loading ? "পাঠানো হচ্ছে..." : "Reset Link পাঠাও"}
        </button>

        <p role="status">{message}</p>
        <a href="/" style={{ color: "#C9A45C" }}>Login পেজে ফিরো</a>
      </form>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "#0B0B0B",
    color: "#F5E6C8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    boxSizing: "border-box",
    padding: 24,
    border: "1px solid #C9A45C",
    borderRadius: 16,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    margin: "12px 0",
    background: "#171717",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: 8,
  },
  button: {
    width: "100%",
    padding: 13,
    background: "#C9A45C",
    color: "#0B0B0B",
    border: 0,
    borderRadius: 8,
    cursor: "pointer",
  },
};

