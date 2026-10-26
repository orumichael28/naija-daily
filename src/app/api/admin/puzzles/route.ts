import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseClient";

/**
 * Admin puzzle CRUD API.
 * All writes use the service role key (bypasses RLS).
 * Security: in production this route should verify the admin session.
 * For now, it's protected by the middleware cookie check.
 */

export async function GET(request: NextRequest) {
  const game = request.nextUrl.searchParams.get("game");
  if (!game) {
    return NextResponse.json({ error: "game param required" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("puzzles")
    .select("id, game, puzzle_date, status, payload")
    .eq("game", game)
    .order("puzzle_date", { ascending: false })
    .limit(60);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { game, puzzle_date, payload, status = "draft" } = body;

  if (!game || !puzzle_date || !payload) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  // Auto-add answer word to words table if Wordle
  if (game === "wordle" && payload.answer) {
    await supabase.from("words").upsert(
      { word: payload.answer.toLowerCase(), source: "answer" },
      { onConflict: "word" }
    );
  }

  const { data, error } = await supabase
    .from("puzzles")
    .insert({ game, puzzle_date, payload, status })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = getServiceSupabase();

  // Auto-add answer word if Wordle
  if (updates.game === "wordle" && updates.payload?.answer) {
    await supabase.from("words").upsert(
      { word: updates.payload.answer.toLowerCase(), source: "answer" },
      { onConflict: "word" }
    );
  }

  const { data, error } = await supabase
    .from("puzzles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = getServiceSupabase();
  const { error } = await supabase.from("puzzles").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

