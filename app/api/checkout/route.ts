import { NextResponse } from "next/server";
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

export async function POST(request: Request) {
  try {
    // 1. Validaciones previas
    if (!process.env.MP_ACCESS_TOKEN) {
      console.error("❌ FALTA MP_ACCESS_TOKEN");
      return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });
    }

    const body = await request.json();
    const { userId, userEmail } = body;

    // 2. Validación de datos del usuario
    if (!userEmail || !userId) {
        console.error("❌ FALTAN DATOS DE USUARIO:", { userId, userEmail });
        return NextResponse.json({ error: "Email o ID faltante" }, { status: 400 });
    }

    console.log(`🚀 Iniciando suscripción para: ${userEmail}`);

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const subscription = new PreApproval(client);

    // 3. Payload LIMPIO (Sin campos opcionales que rompen)
    const payload = {
        reason: 'Suscripción Propuesta Monster PRO',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 5000,
          currency_id: 'ARS',
        },
        payer_email: userEmail,
        back_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?pago=exito`,
        external_reference: userId,
        // status: 'authorized'  <-- LO SACAMOS, ESTO SOLÍA ROMPER
    };

    const result = await subscription.create({ body: payload });

    console.log("✅ Suscripción creada, URL:", result.init_point);
    
    return NextResponse.json({ url: result.init_point });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // 4. Captura de error DETALLADA de Mercado Pago
    console.error("❌ ERROR MERCADO PAGO:", error);
    
    // Si MP nos da detalles (causa), los mostramos
    if (error.cause) {
        console.error("🔍 CAUSA DEL ERROR:", JSON.stringify(error.cause, null, 2));
    }

    return NextResponse.json({ 
        error: "Error al crear suscripción", 
        details: error.message 
    }, { status: 400 });
  }
}