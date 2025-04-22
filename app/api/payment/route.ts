import midtransClient from "midtrans-client";
import { NextResponse } from "next/server";
import fetch from 'node-fetch';

export async function POST(req: Request) {
  const { plan, method, country } = await req.json();

  if (country === 'US') {
    // Handle PayPal payment
    const paypalResponse = await handlePayPalPayment(plan);
    return NextResponse.json(paypalResponse);
  } else if (country === 'ID') {
    // Handle Midtrans payment
    const snap = new midtransClient.Snap({
      isProduction: true,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const transactionDetails = {
      order_id: `order-${Date.now()}`,
      gross_amount: plan === "Basic" ? 50000 : plan === "Pro" ? 100000 : plan === "Ultimate" ? 400000 : 0,
    };

    const parameter = {
      transaction_details: transactionDetails,
      item_details: [ /* ... */ ],
      enabled_payments: [method],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
      },
    };

    try {
      const response = await snap.createTransaction(parameter);
      return NextResponse.json({ token: response.token });
    } catch (error) {
      console.error("Error creating transaction:", error);
      return new NextResponse("Failed to create Snap transaction", { status: 500 });
    }
  } else {
    return new NextResponse("Unsupported country", { status: 400 });
  }
}

async function handlePayPalPayment(plan: string) {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    console.error("Failed to get PayPal access token", tokenData);
    throw new Error("Failed to obtain PayPal access token.");
  }

  const accessToken = tokenData.access_token;

  const amount = plan === "Basic" ? "5.00" : plan === "Pro" ? "10.00" : "40.00";

  const paymentBody = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    transactions: [{
      amount: {
        total: amount,
        currency: 'USD',
      },
      description: `Payment for ${plan} plan`,
    }],
    redirect_urls: {
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/failed`,
    },
  };

  const paymentResponse = await fetch('https://api-m.paypal.com/v1/payments/payment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentBody),
  });

  const paymentData = await paymentResponse.json();

  console.log("PayPal Payment Response:", JSON.stringify(paymentData, null, 2));

  if (!paymentResponse.ok || !paymentData.id) {
    console.error("PayPal payment error response:", paymentData);
    throw new Error(`PayPal Payment Error: ${paymentData.message || "Unknown error"}`);
  }

  // Pastikan ada links dan link approval_url tersedia
  const approvalLink = paymentData.links?.find(link => link.rel === 'approval_url');
  if (!approvalLink) {
    throw new Error("Approval URL not found in PayPal response.");
  }

  return paymentData;
}
