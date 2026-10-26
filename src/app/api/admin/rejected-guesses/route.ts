import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseClient";

/**
 * Admin rejected-guesses API.
 * GET  → list all rejected guesses sorted by count desc
 * POST → approve (add to words) or dismiss (delete from rejected_guesses)
 */

export async function GET() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("rejected_guesses")
    .select("word, count, last_seen")
    .order("count", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const { action, word } = await request.json();

  if (!action || !word) {
    return NextResponse.json({ error: "action and word required" }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  if (action === "approve") {
    // Upsert into words table
    const { error: wordError } = await supabase
      .from("words")
      .upsert({ word: word.toLowerCase(), source: "approved" }, { onConflict: "word" });

    if (wordError) return NextResponse.json({ error: wordError.message }, { status: 500 });

    // Remove from rejected_guesses
    await supabase.from("rejected_guesses").delete().eq("word", word.toLowerCase());
    return NextResponse.json({ success: true });
  }

  if (action === "dismiss") {
    await supabase.from("rejected_guesses").delete().eq("word", word.toLowerCase());
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

