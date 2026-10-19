
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function savePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!ready) {
      setMessage("প্রথমে ইমেইলের বৈধ Reset Link দিয়ে এই পেজে আসো।");
      return;
    }

    if (password.length < 8) {
      setMessage("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("দুটি পাসওয়ার্ড মিলছে না।");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      await supabase.auth.signOut();
      setPassword("");
      setConfirmPassword("");
      setReady(false);
      setMessage("পাসওয়ার্ড পরিবর্তন সফল! এখন Login পেজে গিয়ে লগইন করো।");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "পাসওয়ার্ড পরিবর্তন হয়নি।"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0B0B0B",
        color: "#F5E6C8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <form
        onSubmit={savePassword}
        style={{
          width: "100%",
          maxWidth: 400,
          boxSizing: "border-box",
          padding: 24,
          border: "1px solid #C9A45C",
          borderRadius: 16,
        }}
      >
        <h1>নতুন পাসওয়ার্ড</h1>
        <p>ইমেইলের Reset Link দিয়ে আসার পর এখানে পাসওয়ার্ড সেট করো।</p>

        <input
          type="password"
          placeholder="নতুন পাসওয়ার্ড"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="পাসওয়ার্ড আবার দাও"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading || !ready}
          style={{
            ...inputStyle,
            background: "#C9A45C",
            color: "#0B0B0B",
            cursor: "pointer",
          }}
        >
          {loading ? "সেভ হচ্ছে..." : "নতুন পাসওয়ার্ড সেভ করো"}
        </button>

        {!ready && (
          <p>বৈধ Reset Link খুলে এই পেজে এলে ফর্ম চালু হবে।</p>
        )}

        <p role="status">{message}</p>
        <a href="/" style={{ color: "#C9A45C" }}>Login পেজে ফিরো</a>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: 12,
  marginTop: 12,
  border: "1px solid #555",
  borderRadius: 8,
  background: "#171717",
  color: "#F5E6C8",
};

