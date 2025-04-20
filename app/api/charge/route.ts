import midtransClient from "midtrans-client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { plan } = await req.json();

  const order_id = `order-${Date.now()}`;
  const gross_amount = plan === "Basic" ? 50000 : plan === "Pro" ? 100000 : 200000;

  const snap = new midtransClient.Snap({
    isProduction: false, // Set to true for production
    serverKey: process.env.MIDTRANS_SERVER_KEY!, // Make sure server key is correct
  });

  const transactionDetails = {
    order_id: order_id,
    gross_amount: gross_amount,
  };

  const itemDetails = [
    {
      id: plan,
      price: gross_amount,
      quantity: 1,
      name: `${plan} Plan`,
    },
  ];

  // Set payment type: can use 'bank_transfer' for bank transfer, 'e_wallet' for e-wallet
  const paymentType = {
    payment_type: "bank_transfer", // Change to 'e_wallet' for e-wallet payments
    bank_transfer: {
      bank: "bca", // Bank transfer options, change to your desired bank
    },
  };

  const parameter = {
    transaction_details: transactionDetails,
    item_details: itemDetails,
    payment_type: paymentType.payment_type,
    ...paymentType, // Add additional payment type configuration (bank_transfer or e_wallet)
  };

  try {
    const chargeResponse = await snap.createTransaction(parameter);
    console.log("Charge response:", chargeResponse); // Log full response for debugging

    const vaNumbers = chargeResponse.va_numbers; // Check for va_numbers for bank transfer
    const paymentUrl = chargeResponse.redirect_url; // URL for e-wallet or other methods

    if (vaNumbers) {
      return NextResponse.json({
        order_id: chargeResponse.order_id,
        va_numbers: vaNumbers, // Return VA number for bank transfer
        payment_url: paymentUrl, // For e-wallet, return payment URL
      });
    } else {
      return NextResponse.json({
        order_id: chargeResponse.order_id,
        payment_url: paymentUrl, // If no VA numbers, just send the payment URL
      });
    }
  } catch (error) {
    console.error("Error creating charge:", error);
    return new NextResponse("Failed to create charge", { status: 500 });
  }
}
