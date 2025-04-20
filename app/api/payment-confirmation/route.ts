import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id, plan, user_id } = body;

  const creditsToAdd =
    plan === "Basic" ? 2000 : plan === "Pro" ? 5000 : Infinity;

  try {
    const userRef = doc(db, "users", user_id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentCredits = userSnap.data().credits || 0;

    // Update credits in Firestore
    await updateDoc(userRef, {
      credits: currentCredits + creditsToAdd, // Update credits
    });

    return NextResponse.json({ message: "Credits updated successfully" });
  } catch (error) {
    console.error("Error updating credits:", error);
    return NextResponse.json({ error: "Failed to update credits" }, { status: 500 });
  }
}
