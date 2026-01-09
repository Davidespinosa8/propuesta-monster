import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { db } from "@/lib/firebase"; 
import { doc, updateDoc, getDoc } from "firebase/firestore";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(request: Request) {
  const url = new URL(request.url);
  const topic = url.searchParams.get("topic") || url.searchParams.get("type");
  const id = url.searchParams.get("id") || url.searchParams.get("data.id");

  console.log(`🔔 Webhook recibido: Topic: ${topic}, ID: ${id}`);

  try {
    if (topic === 'payment' && id) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: id });
      
      if (paymentData.status === 'approved') {
        const userId = paymentData.external_reference;

        if (userId) {
            console.log(`✅ Pago aprobado para: ${userId}`);
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            
            if(userSnap.exists()) {
                await updateDoc(userRef, {
                    plan: "pro",
                    status: "active",
                    planStartDate: new Date().toISOString()
                });
            }
        }
      }
    }
    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("Error webhook:", error);
    return NextResponse.json({ status: "Error" }, { status: 500 });
  }
}