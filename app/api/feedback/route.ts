import { sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { placeFeedback } from "../../../db/schema";

function toRouteErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const detail = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  const combined = `${message}\n${detail}`;

  if (combined.includes("no such table") || combined.includes('from "place_feedback"')) {
    return "place_feedback 테이블이 없습니다. `npm run db:generate` 후 배포해서 마이그레이션을 적용하세요.";
  }

  return message;
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(placeFeedback);
    const feedback = Object.fromEntries(rows.map((row) => [row.placeId, row.rating]));
    return Response.json({ feedback });
  } catch (error) {
    console.error("feedback GET failed", toRouteErrorMessage(error));
    return Response.json({ feedback:{} });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const placeId = typeof body.placeId === "string" ? body.placeId : "";
    const rating = body.rating;
    if (!placeId || placeId.length > 100 || (rating !== "liked" && rating !== "disliked")) {
      return Response.json({ error:"잘못된 요청" }, { status:400 });
    }

    const db = getDb();
    await db
      .insert(placeFeedback)
      .values({ placeId, rating })
      .onConflictDoUpdate({ target:placeFeedback.placeId, set:{ rating, updatedAt:sql`CURRENT_TIMESTAMP` } });

    return Response.json({ ok:true });
  } catch (error) {
    console.error("feedback POST failed", toRouteErrorMessage(error));
    return Response.json({ error:toRouteErrorMessage(error) }, { status:500 });
  }
}
