import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("App crashed:", error, info?.componentStack);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fff",
          padding: 24,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 560, textAlign: "center" }}>
          <h1 style={{ color: "#17171b", fontSize: 28, margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#555", fontSize: 14 }}>
            Please reload the page. If it keeps happening, send this message to
            the developer:
          </p>
          <pre
            style={{
              textAlign: "left",
              whiteSpace: "pre-wrap",
              background: "#efeff1",
              border: "1px solid #bfdcfa",
              borderRadius: 12,
              padding: 14,
              fontSize: 12,
              color: "#7a1f1f",
            }}
          >
            {String(this.state.error?.stack || this.state.error).slice(0, 900)}
          </pre>
          <button
            onClick={() => {
              try {
                localStorage.removeItem("swarn_cart");
              } catch {
                /* ignore */
              }
              window.location.reload();
            }}
            style={{
              marginTop: 10,
              background: "#1d7fe0",
              color: "#fff",
              border: 0,
              borderRadius: 999,
              padding: "12px 28px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
