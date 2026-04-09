import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://dolarapi.com/v1/dolares/blue", {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener la cotización");
    }

    const data = await response.json();

    return NextResponse.json({
      rate: data.venta,
      source: "DolarApi - Blue Venta",
      updatedAt: data.fechaActualizacion,
    });
  } catch (error) {
    console.error("Error fetching exchange rate:", error);

    return NextResponse.json(
      {
        rate: 1400,
        source: "Fallback",
        updatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}