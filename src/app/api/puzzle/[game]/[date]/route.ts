import { NextRequest, NextResponse } from "next/server";
import { getTodayInLagos } from "@/lib/dates";
import { getServiceSupabase } from "@/lib/supabaseClient";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ game: string; date: string }> }
) {
  const { game, date } = await params;
  const todayLagos = getTodayInLagos();

  // 1. Parameter format validation
  if (!/^[a-z]+$/.test(game) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  // 2. Strict Date Gate: Reject any date after today in Lagos
  // (Prevents future puzzle payload leaks)
  const isPreview = req.nextUrl.searchParams.get("preview") === "true";

  if (!isPreview && date > todayLagos) {
    return NextResponse.json(
      { error: "Future puzzles are not available." },
      { status: 403 }
    );
  }

  try {
    const supabase = getServiceSupabase();
    let query = supabase
      .from("puzzles")
      .select("game, puzzle_date, payload, status")
      .eq("game", game)
      .eq("puzzle_date", date);

    if (!isPreview) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("Database error fetching puzzle:", error);
      return NextResponse.json(
        { error: "Failed to fetch puzzle" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Today's puzzle isn't ready yet.",
          ready: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(data.payload, {
      headers: {
        "Cache-Control": isPreview
          ? "no-store"
          : "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch (err: unknown) {
    console.error("Failed to connect to Supabase:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
