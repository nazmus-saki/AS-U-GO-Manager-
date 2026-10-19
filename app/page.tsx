
export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0B0B0B",
        color: "#F5E6C8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "42px", marginBottom: "8px" }}>
        AS U GO
      </h1>

      <p style={{ letterSpacing: "3px", fontSize: "12px" }}>
        TRAVEL SERVICE COMPANY
      </p>

      <p style={{ color: "#C9A45C", marginTop: "8px" }}>
        Kalihati • Tangail
      </p>

      <div
        style={{
          marginTop: "32px",
          padding: "20px",
          border: "1px solid #C9A45C",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "360px",
        }}
      >
        <h2>Welcome to AS U GO</h2>
        <p>Your journey starts here.</p>
      </div>
    </main>
  );
}

