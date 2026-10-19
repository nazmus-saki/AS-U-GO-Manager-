
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type UserProfile = {
  full_name: string | null;
  role: string;
  active: boolean;
  business_id: string | null;
};

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      // Step 1: Authenticate user
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        console.error("Authentication failed:", error.message);

        throw new Error(
          "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।"
        );
      }

      if (!data.user) {
        throw new Error("ব্যবহারকারী পাওয়া যায়নি।");
      }

      // Step 2: Fetch user profile
      const {
        data: userProfile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("full_name, role, active, business_id")
        .eq("id", data.user.id)
        .maybeSingle<UserProfile>();

      if (profileError) {
        console.error(
          "Profile query failed:",
          profileError
        );

        await supabase.auth.signOut();

        throw new Error(
          `প্রোফাইল লোড করা যায়নি: ${profileError.message}`
        );
      }

      if (!userProfile) {
        console.error(
          "No profile found for authenticated user:",
          data.user.id
        );

        await supabase.auth.signOut();

        throw new Error(
          "এই অ্যাকাউন্টের প্রোফাইল পাওয়া যায়নি। Supabase profiles টেবিলে user ID পরীক্ষা করুন।"
        );
      }

      // Step 3: Validate account
      if (userProfile.active !== true) {
        await supabase.auth.signOut();

        throw new Error("এই অ্যাকাউন্টটি নিষ্ক্রিয়।");
      }

      if (
        userProfile.role !== "owner" &&
        userProfile.role !== "driver"
      ) {
        await supabase.auth.signOut();

        throw new Error(
          `এই অ্যাকাউন্টের role অনুমোদিত নয়: ${userProfile.role}`
        );
      }

      if (!userProfile.business_id) {
        await supabase.auth.signOut();

        throw new Error(
          "এই অ্যাকাউন্টের Business ID সেট করা নেই।"
        );
      }

      // Step 4: Redirect according to role
      if (userProfile.role === "owner") {
        router.replace("/dashboard");
        return;
      }

      if (userProfile.role === "driver") {
        router.replace("/driver");
        return;
      }
    } catch (error) {
      console.error("Login process failed:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "লগইন করা যায়নি। আবার চেষ্টা করুন।"
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
        <h1
          style={{
            textAlign: "center",
            marginBottom: 8,
          }}
        >
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

        <p
          style={{
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          Manager Login
        </p>

        <form onSubmit={handleLogin}>
          <label
            htmlFor="email"
            style={{ display: "block" }}
          >
            ইমেইল
          </label>

          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="আপনার ইমেইল"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={inputStyle}
          />

          <label
            htmlFor="password"
            style={{ display: "block" }}
          >
            পাসওয়ার্ড
          </label>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="আপনার পাসওয়ার্ড"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "অপেক্ষা করুন..." : "Login"}
          </button>
        </form>

        {message && (
          <p
            role="alert"
            style={{
              marginTop: 18,
              textAlign: "center",
              overflowWrap: "anywhere",
              color: "#F2A3A3",
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
};
