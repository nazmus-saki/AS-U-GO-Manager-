
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Stats = {
  vehicles: number;
  bookings: number;
  trips: number;
  income: number;
  expenses: number;
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);

export default function OwnerDashboard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [stats, setStats] = useState<Stats>({
    vehicles: 0,
    bookings: 0,
    trips: 0,
    income: 0,
    expenses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          router.replace("/");
          return;
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("full_name, role, active, business_id")
            .eq("id", authData.user.id)
            .maybeSingle();

        if (
          profileError ||
          !profile ||
          !profile.active ||
          profile.role !== "owner" ||
          !profile.business_id
        ) {
          await supabase.auth.signOut();
          router.replace("/");
          return;
        }

        if (cancelled) return;
        setName(profile.full_name || "Owner");

        const businessId = profile.business_id;
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const [
          vehicleResult,
          bookingResult,
          tripResult,
          transactionResult,
        ] = await Promise.all([
          supabase
            .from("vehicles")
            .select("id", { count: "exact", head: true })
            .eq("business_id", businessId)
            .eq("active", true),

          supabase
            .from("bookings")
            .select("id", { count: "exact", head: true })
            .eq("business_id", businessId)
            .in("status", ["pending", "confirmed"]),

          supabase
            .from("trips")
            .select("id", { count: "exact", head: true })
            .eq("business_id", businessId),

          supabase
            .from("transactions")
            .select("amount, transaction_type, direction")
            .eq("business_id", businessId)
            .gte("transaction_at", monthStart.toISOString()),
        ]);

        const queryError =
          vehicleResult.error ||
          bookingResult.error ||
          tripResult.error ||
          transactionResult.error;

        if (queryError) {
          throw new Error(
            "Dashboard-এর তথ্য লোড হয়নি। Supabase RLS policy পরীক্ষা করুন।"
          );
        }

        let income = 0;
        let expenses = 0;

        for (const transaction of transactionResult.data || []) {
          const amount = Number(transaction.amount) || 0;

          if (
            transaction.transaction_type === "income" &&
            transaction.direction === "inflow"
          ) {
            income += amount;
          }

          if (
            transaction.transaction_type === "expense" &&
            transaction.direction === "outflow"
          ) {
            expenses += amount;
          }
        }

        if (cancelled) return;

        setStats({
          vehicles: vehicleResult.count ?? 0,
          bookings: bookingResult.count ?? 0,
          trips: tripResult.count ?? 0,
          income,
          expenses,
        });
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "তথ্য লোড করা যায়নি।"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  const cards = [
    { label: "সক্রিয় গাড়ি", value: stats.vehicles },
    { label: "চলমান/নিশ্চিত বুকিং", value: stats.bookings },
    { label: "মোট ট্রিপ", value: stats.trips },
    { label: "এই মাসের আয়", value: money(stats.income) },
    { label: "এই মাসের খরচ", value: money(stats.expenses) },
    {
      label: "আয় থেকে খরচ বাদ",
      value: money(stats.income - stats.expenses),
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0B0B0B",
        color: "#F5E6C8",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            borderBottom: "1px solid #55472E",
            paddingBottom: 20,
          }}
        >
          <div>
            <h1 style={{ marginBottom: 6 }}>AS U GO</h1>
            <p style={{ color: "#C9A45C", margin: 0 }}>
              OWNER DASHBOARD
            </p>
            <p>স্বাগতম, {name}</p>
          </div>

          <button onClick={logout} style={buttonStyle}>
            Logout
          </button>
        </header>

        <h2 style={{ marginTop: 28 }}>ব্যবসার সারাংশ</h2>
        <p style={{ color: "#AAA" }}>
          {new Date().toLocaleDateString("bn-BD", {
            month: "long",
            year: "numeric",
          })}
        </p>

        {loading && <p>তথ্য লোড হচ্ছে...</p>}

        {message && (
          <p style={{ color: "#F2A3A3" }}>{message}</p>
        )}

        {!loading && !message && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginTop: 20,
            }}
          >
            {cards.map((card) => (
              <article
                key={card.label}
                style={{
                  border: "1px solid #8E713F",
                  borderRadius: 14,
                  padding: 20,
                  background: "#141414",
                }}
              >
                <p style={{ color: "#C9A45C", marginTop: 0 }}>
                  {card.label}
                </p>
                <h2 style={{ overflowWrap: "anywhere" }}>
                  {card.value}
                </h2>
              </article>
            ))}
          </section>
        )}

        <h2 style={{ marginTop: 36 }}>ম্যানেজমেন্ট</h2>
        <p style={{ color: "#AAA" }}>
          পরবর্তী ধাপে গাড়ি, বুকিং, ট্রিপ ও হিসাবের পূর্ণ ব্যবস্থাপনা যোগ করা হবে।
        </p>
      </div>
    </main>
  );
}

const buttonStyle: React.CSSProperties = {
  background: "#C9A45C",
  color: "#0B0B0B",
  border: "none",
  borderRadius: 8,
  padding: "12px 20px",
  fontWeight: "bold",
  cursor: "pointer",
};

