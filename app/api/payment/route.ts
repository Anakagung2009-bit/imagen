import midtransClient from "midtrans-client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { plan } = await req.json();

  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
  });

  const transactionDetails = {
    order_id: `order-${Date.now()}`,
    gross_amount: plan === "Basic" ? 50000 : plan === "Pro" ? 100000 : 400000,
  };

  const parameter = {
    transaction_details: transactionDetails,
    item_details: [
      {
        id: plan,
        price: transactionDetails.gross_amount,
        quantity: 1,
        name: `${plan} Plan`,
      },
    ],
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_SITE_URL}/`, // <= Redirect to `/` after payment success
    },
  };

  try {
    const response = await snap.createTransaction(parameter);
    return NextResponse.json({ token: response.token });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return new NextResponse("Failed to create Snap transaction", { status: 500 });
  }
}
