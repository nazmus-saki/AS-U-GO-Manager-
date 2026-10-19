
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState<{
    full_name: string;
    role: string;
  } | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setProfile(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("ব্যবহারকারী পাওয়া যায়নি।");

      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role, active, business_id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        throw new Error(
          "লগইন হয়েছে, কিন্তু প্রোফাইল যাচাই করা যায়নি। Supabase RLS policy পরীক্ষা করতে হবে।"
        );
      }

      if (!userProfile) {
        await supabase.auth.signOut();
        throw new Error("এই অ্যাকাউন্টের প্রোফাইল পাওয়া যায়নি।");
      }

      if (!userProfile.active) {
        await supabase.auth.signOut();
        throw new Error("এই অ্যাকাউন্টটি নিষ্ক্রিয়।");
      }

      if (!["owner", "driver"].includes(userProfile.role)) {
        await supabase.auth.signOut();
        throw new Error("এই অ্যাকাউন্টের অনুমতি নেই।");
      }
      if (userProfile.role === "owner") {
  router.replace("/dashboard");
} else {
  router.replace("/driver");
}

    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "লগইন করা যায়নি। আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setProfile(null);
    setEmail("");
    setPassword("");
    setMessage("আপনি লগআউট করেছেন।");
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
      <section
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 28,
          border: "1px solid #C9A45C",
          borderRadius: 18,
          boxSizing: "border-box",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 8 }}>
          AS U GO
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#C9A45C",
            letterSpacing: 2,
            fontSize: 12,
          }}
        >
          TRAVEL SERVICE COMPANY
        </p>

        <p style={{ textAlign: "center", marginBottom: 28 }}>
          Manager Login
        </p>

        {profile ? (
          <div>
            <h2>স্বাগতম, {profile.full_name}</h2>
            <p>
              Role: {profile.role === "owner" ? "Owner" : "Driver"}
            </p>
            <p>আপনার পরিচয় যাচাই করা হয়েছে।</p>
            <button
              onClick={handleLogout}
              style={buttonStyle}
            >
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <label htmlFor="email">ইমেইল</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="আপনার ইমেইল"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />

            <label htmlFor="password">পাসওয়ার্ড</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="আপনার পাসওয়ার্ড"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "অপেক্ষা করুন..." : "Login"}
            </button>
          </form>
        )}

        {message && (
          <p
            role="status"
            style={{
              marginTop: 18,
              textAlign: "center",
              overflowWrap: "anywhere",
              color: message.includes("সফল") ? "#7CDB9A" : "#F2A3A3",
            }}
          >
            {message}
          </p>
        )}

        <p
          style={{
            textAlign: "center",
            color: "#999",
            fontSize: 12,
            marginTop: 28,
          }}
        >
          Kalihati • Tangail
        </p>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: 13,
  marginTop: 8,
  marginBottom: 18,
  borderRadius: 8,
  border: "1px solid #555",
  background: "#171717",
  color: "#F5E6C8",
  fontSize: 16,
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 8,
  border: "none",
  background: "#C9A45C",
  color: "#0B0B0B",
  fontSize: 16,
  fontWeight: "bold",
  cursor: "pointer",
};
