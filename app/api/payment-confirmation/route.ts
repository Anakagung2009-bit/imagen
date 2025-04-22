import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { plan, user_id } = body;

  console.log("Received payment confirmation:", body); // Log the received body

  const creditsToAdd =
    plan === "Basic" ? 2000 : plan === "Pro" ? 5000 : plan === "Ultimate" ? Infinity : 0;

  try {
    const userRef = doc(db, "users", user_id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error("User  not found:", user_id);
      return NextResponse.json({ error: "User  not found" }, { status: 404 });
    }

    const currentCredits = userSnap.data().credits ||  0;

    console.log("Current Credits before update:", currentCredits);

    // Update credits in Firestore
    await updateDoc(userRef, {
      credits: currentCredits + creditsToAdd, // Update credits
    });

    console.log("Credits updated successfully for user:", user_id);
    return NextResponse.json({ message: "Credits updated successfully" });
  } catch (error) {
    console.error("Error updating credits:", error);
    return new NextResponse("Failed to update credits", { status: 500 });
  }
}