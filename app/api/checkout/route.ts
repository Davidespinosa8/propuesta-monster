import { NextResponse } from "next/server";
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

// Inicializamos Mercado Pago con tu Token
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userEmail } = body; // Recibimos quién es el usuario

    // Usamos "PreApproval" que es el nombre técnico de las Suscripciones
    const subscription = new PreApproval(client);

    // Definimos a dónde vuelve el usuario después de pagar
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const result = await subscription.create({
      body: {
        reason: 'Suscripción Propuesta Monster PRO', // Lo que aparece en el resumen de la tarjeta
        auto_recurring: {
          frequency: 1,             // Cada 1...
          frequency_type: 'months', // ...mes
          transaction_amount: 100, // PRECIO: $5.000 (Podés cambiarlo acá)
          currency_id: 'ARS',
        },
        payer_email: userEmail,
        back_url: `${baseUrl}/dashboard?pago=exito`, // A dónde vuelve si sale bien
        status: 'authorized', // La activamos de una
        
        // ESTO ES CLAVE: Le pegamos el ID del usuario a la suscripción
        // para que cuando entre el pago, sepamos a quién habilitarle el PRO.
        external_reference: userId, 
      }
    });

    // Devolvemos la URL para que el usuario vaya a pagar
    return NextResponse.json({ url: result.init_point });
  } catch (error) {
    console.error("Error creando suscripción:", error);
    return NextResponse.json({ error: "Error creando suscripción" }, { status: 500 });
  }
}