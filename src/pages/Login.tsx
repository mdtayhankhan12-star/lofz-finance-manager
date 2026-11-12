import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";

// Email + password login। শুধু আমন্ত্রিত সদস্য (fin_members-এ থাকলে) ঢুকতে পারবে, তা database policy দিয়ে নিশ্চিত করা হয়েছে।
export default function Login({ notice }: { notice?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return setError("Supabase সংযোগ সেট করা নেই।");
    setBusy(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError("ইমেইল বা পাসওয়ার্ড ভুল।");
  };

  return (
    <div className="login">
      <form className="panel" onSubmit={submit}>
        <h3>LOFZ Finance-এ লগইন</h3>
        <label>ইমেইল<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>পাসওয়ার্ড<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button type="submit" disabled={busy}>{busy ? "অপেক্ষা করুন..." : "লগইন"}</button>
        {notice && <p className="error">{notice}</p>}
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
