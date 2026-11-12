import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type Gate = { status: "loading" | "signed-out" | "no-access" | "member"; userId?: string };

// লগইন আছে কিনা এবং fin_members-এ আছে কিনা তা দেখে
export function useAuthGate(): Gate {
  const [gate, setGate] = useState<Gate>({ status: "loading" });

  useEffect(() => {
    if (!supabase) return setGate({ status: "signed-out" });
    const check = async () => {
      const { data } = await supabase!.auth.getSession();
      const uid = data.session?.user.id;
      if (!uid) return setGate({ status: "signed-out" });
      const { data: m } = await supabase!.from("fin_members").select("user_id").eq("user_id", uid).maybeSingle();
      setGate(m ? { status: "member", userId: uid } : { status: "no-access", userId: uid });
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => sub.subscription.unsubscribe();
  }, []);

  return gate;
}
