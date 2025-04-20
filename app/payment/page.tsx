"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderID = searchParams.get("orderID");
  const amount = searchParams.get("amount");
  const plan = searchParams.get("plan");

  const [vaInfo, setVaInfo] = useState<{
    bank: string;
    va_number: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVAInfo = async () => {
      try {
        const res = await fetch("/api/charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderID,
            gross_amount: amount,
            plan,
          }),
        });

        const data = await res.json();

        if (data.va_numbers && data.va_numbers.length > 0) {
          setVaInfo({
            bank: data.va_numbers[0].bank,
            va_number: data.va_numbers[0].va_number,
          });
        } else {
          console.error("VA info tidak ditemukan:", data);
        }
      } catch (error) {
        console.error("Error fetching VA info:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderID && amount && plan) {
      fetchVAInfo();
    } else {
      setLoading(false);
    }
  }, [orderID, amount, plan]);

  const handleConfirmPayment = () => {
    router.push("/success");
  };

  if (loading) return <div className="p-4">Memuat informasi pembayaran...</div>;

  if (!vaInfo) return <div className="p-4 text-red-600">Gagal mendapatkan informasi pembayaran.</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-xl mt-10">
      <h2 className="text-2xl font-bold mb-4">Instruksi Pembayaran</h2>
      <p className="mb-2">Paket: <strong>{plan}</strong></p>
      <p className="mb-2">Total: <strong>Rp{parseInt(amount!).toLocaleString()}</strong></p>
      <p className="mb-2">Bank: <strong>{vaInfo.bank.toUpperCase()}</strong></p>
      <p className="mb-4">Nomor VA: <strong>{vaInfo.va_number}</strong></p>
      <button
        onClick={handleConfirmPayment}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Saya Sudah Membayar
      </button>
    </div>
  );
}
