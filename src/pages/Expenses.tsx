import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";

// খরচের ক্যাটাগরি (spec অনুযায়ী)
export const CATEGORIES = [
  ["factory", "Factory খরচ"],
  ["wages", "শ্রমিকের মজুরি"],
  ["materials", "কাঁচামাল"],
  ["tea_food", "চা ও খাবার"],
  ["transport", "যাতায়াত"],
  ["packaging", "প্যাকেজিং"],
  ["courier", "কুরিয়ার"],
  ["office", "অফিস খরচ"],
  ["other", "অন্যান্য"],
] as const;

type Expense = {
  id: number;
  expense_date: string;
  amount_paisa: number;
  category: string;
  description: string | null;
  vendor: string | null;
  payment_method: string | null;
};

// টাকার স্ট্রিং থেকে পয়সা (integer) — floating-point ব্যবহার না করে
export function taToPaisa(input: string): number | null {
  const m = input.replace(/,/g, "").trim().match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!m) return null;
  const paisa = Number(m[1]) * 100 + Number((m[2] ?? "0").padEnd(2, "0"));
  return paisa > 0 ? paisa : null;
}

const fmt = (p: number) => "৳" + (p / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date(Date.now() + 6 * 3600e3).toISOString().slice(0, 10);

export default function Expenses() {
  const [rows, setRows] = useState<Expense[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: today(), amount: "", category: "factory", description: "", vendor: "", payment: "cash" });

  const load = async () => {
    if (!supabase) return setError("Supabase সংযোগ সেট করা নেই (.env.local)।");
    const { data, error } = await supabase
      .from("fin_expenses")
      .select("id,expense_date,amount_paisa,category,description,vendor,payment_method")
      .order("expense_date", { ascending: false })
      .order("id", { ascending: false })
      .limit(100);
    if (error) return setError(error.message);
    setError("");
    setRows((data ?? []) as Expense[]);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const paisa = taToPaisa(form.amount);
    if (!paisa) return setError("সঠিক টাকার পরিমাণ লিখুন (যেমন 1200 বা 1200.50)।");
    setSaving(true);
    const { error } = await supabase.from("fin_expenses").insert({
      expense_date: form.date,
      amount_paisa: paisa,
      category: form.category,
      description: form.description.trim() || null,
      vendor: form.vendor.trim() || null,
      payment_method: form.payment,
    });
    setSaving(false);
    if (error) return setError(error.message);
    setForm({ ...form, amount: "", description: "", vendor: "" });
    load();
  };

  return (
    <>
      <form className="panel" onSubmit={save}>
        <h3>নতুন খরচ</h3>
        <div className="grid2">
          <label>তারিখ<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
          <label>টাকা<input inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="যেমন 1200" required /></label>
          <label>ক্যাটাগরি
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label>পেমেন্ট
            <select value={form.payment} onChange={(e) => setForm({ ...form, payment: e.target.value })}>
              <option value="cash">ক্যাশ</option>
              <option value="bank">ব্যাংক</option>
              <option value="bkash">বিকাশ/নগদ</option>
            </select>
          </label>
          <label>বিবরণ<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label>কাকে দেওয়া হলো<input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></label>
        </div>
        <button type="submit" disabled={saving}>{saving ? "সেভ হচ্ছে..." : "সেভ করুন"}</button>
        {error && <p className="error">{error}</p>}
      </form>

      <div className="panel">
        <h3>সাম্প্রতিক খরচ</h3>
        {rows.length === 0 ? <p className="muted">কোনো খরচ নেই।</p> : (
          <table>
            <thead><tr><th>তারিখ</th><th>ক্যাটাগরি</th><th>বিবরণ</th><th>কাকে</th><th className="num">টাকা</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.expense_date}</td>
                  <td>{CATEGORIES.find(([v]) => v === r.category)?.[1] ?? r.category}</td>
                  <td>{r.description ?? "—"}</td>
                  <td>{r.vendor ?? "—"}</td>
                  <td className="num">{fmt(r.amount_paisa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
