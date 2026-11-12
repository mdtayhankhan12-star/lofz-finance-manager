import { useState } from "react";
import "./App.css";
import Expenses from "./pages/Expenses";
import Login from "./pages/Login";
import { useAuthGate } from "./lib/auth";

// Phase 1: কাঠামো ও নেভিগেশন। ডেটা ও হিসাব পরের ধাপে।
const PAGES = [
  { key: "dashboard", label: "ড্যাশবোর্ড" },
  { key: "expenses", label: "খরচ" },
  { key: "steadfast", label: "Steadfast জমা" },
  { key: "debts", label: "ধার ও পরিশোধ" },
  { key: "savings", label: "সঞ্চয়" },
  { key: "reports", label: "রিপোর্ট" },
];

export default function App() {
  const gate = useAuthGate();
  const [page, setPage] = useState("dashboard");
  if (gate.status === "loading") return <p className="muted" style={{ padding: 24 }}>লোড হচ্ছে...</p>;
  if (gate.status !== "member") return <Login notice={gate.status === "no-access" ? "এই অ্যাকাউন্ট এই business-এর সদস্য নয়।" : ""} />;
  const current = PAGES.find((p) => p.key === page);

  return (
    <div className="shell">
      <aside className="sidebar">
        <h1>LOFZ Finance</h1>
        <nav>
          {PAGES.map((p) => (
            <button key={p.key} className={p.key === page ? "active" : ""} onClick={() => setPage(p.key)}>
              {p.label}
            </button>
          ))}
        </nav>
      </aside>
      <main>
        <h2>{current?.label}</h2>
        {page === "expenses" ? <Expenses /> : <p className="muted">এই পেজের ডেটা ও ফর্ম পরের ধাপে যোগ হবে।</p>}
      </main>
    </div>
  );
}
