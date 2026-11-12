import { useState } from "react";
import "./App.css";
import Expenses from "./pages/Expenses";

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
  const [page, setPage] = useState("dashboard");
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
