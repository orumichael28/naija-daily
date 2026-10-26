import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { word?: unknown };
    const word = typeof body.word === "string" ? body.word.trim().toLowerCase() : "";

    if (!word || word.length !== 5 || !/^[a-z]+$/.test(word)) {
      return NextResponse.json({ error: "Invalid word" }, { status: 400 });
    }

    try {
      const supabase = getServiceSupabase();
      // Call Postgres upsert function or perform manual upsert
      const { data: existing } = await supabase
        .from("rejected_guesses")
        .select("count")
        .eq("word", word)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("rejected_guesses")
          .update({
            count: (existing.count || 1) + 1,
            last_seen: new Date().toISOString(),
          })
          .eq("word", word);
      } else {
        await supabase.from("rejected_guesses").insert({
          word,
          count: 1,
          last_seen: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      console.warn("Could not upsert to Supabase rejected_guesses:", dbErr);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to log rejected guess" }, { status: 500 });
  }
}
