/* eslint-disable */
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

// ⚠️⚠️⚠️ ATENCIÓN: COPIÁ ESTOS DATOS DE TU src/lib/firebase.ts ⚠️⚠️⚠️
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI", 
  authDomain: "propuesta-monster.firebaseapp.com",
  projectId: "propuesta-monster",
  storageBucket: "propuesta-monster.firebasestorage.app",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Iniciamos Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- LISTA MAESTRA DE PRECIOS ---
const preciosReferencia = [
  // 1. ALBAÑILERÍA
  {
    id: "albanil",
    label: "Albañilería y Estructura (CIFRAS Dic-25)",
    items: [
      { id: "a01", task: "Limpieza de terreno y replanteo", unit: "m2", price: 3668 },
      { id: "a02", task: "Demolición mampostería ladrillo común", unit: "m3", price: 98070 },
      { id: "a03", task: "Demolición mampostería ladrillo hueco", unit: "m2", price: 16916 },
      { id: "a04", task: "Picado de revoques (limpieza total)", unit: "m2", price: 12027 },
      { id: "a05", task: "Apertura de vano en pared", unit: "u", price: 35400 },
      { id: "a06", task: "Remoción de marco de madera/metálico", unit: "u", price: 18500 },

      { id: "a10", task: "Excavación manual para bases/zapatas", unit: "m3", price: 31120 },
      { id: "a11", task: "Zapata corrida Hormigón Armado", unit: "m3", price: 104867 },
      { id: "a12", task: "Viga de fundación H°A°", unit: "ml", price: 18500 },
      { id: "a13", task: "Pilotín de H°A° (perforación manual)", unit: "u", price: 12800 },
      { id: "a14", task: "Nivelación y compactación de suelo", unit: "m2", price: 4200 },

      { id: "a20", task: "Columnas H°A° completas", unit: "m3", price: 351949 },
      { id: "a21", task: "Vigas H°A° completas", unit: "m3", price: 475225 },
      { id: "a22", task: "Losa Viguetas + Ladrillos Cerámicos 12cm", unit: "m2", price: 54607 },
      { id: "a23", task: "Losa Viguetas + EPS", unit: "m2", price: 51942 },
      { id: "a24", task: "Capa de compresión", unit: "m2", price: 15400 },
      { id: "a25", task: "Hormigón de pendiente", unit: "m2", price: 12500 },

      { id: "a30", task: "Capa aisladora horizontal", unit: "ml", price: 12500 },
      { id: "a31", task: "Capa aisladora vertical", unit: "m2", price: 9800 },
      { id: "a32", task: "Muro Ladrillo Hueco 12x18x33", unit: "m2", price: 26062 },
      { id: "a33", task: "Muro Ladrillo Hueco 18x18x33", unit: "m2", price: 27917 },
      { id: "a34", task: "Muro Ladrillo Común 15cm", unit: "m2", price: 28900 },
      { id: "a35", task: "Muro Bloque HCCA (Retak) 15cm", unit: "m2", price: 21498 },
      { id: "a36", task: "Encadenado perimetral superior", unit: "ml", price: 14800 },

      { id: "a40", task: "Revoque Grueso fratasado", unit: "m2", price: 11500 },
      { id: "a41", task: "Revoque Fino a la cal", unit: "m2", price: 9200 },
      { id: "a42", task: "Revoque proyectado Monocapa", unit: "m2", price: 13800 },
      { id: "a43", task: "Ejecución de Filos y Mochetas", unit: "ml", price: 7500 },
      { id: "a44", task: "Armado de andamio exterior", unit: "gl", price: 45000 },
      { id: "a45", task: "Colocación de cantoneras", unit: "ml", price: 3200 },

      { id: "a50", task: "Contrapiso de cascotes", unit: "m2", price: 15500 },
      { id: "a51", task: "Carpeta de cemento", unit: "m2", price: 7190 },
      { id: "a52", task: "Carpeta hidrófuga", unit: "m2", price: 10400 },
      { id: "a53", task: "Colocación Porcelanato", unit: "m2", price: 18500 },
      { id: "a54", task: "Colocación Cerámica", unit: "m2", price: 13800 },
      { id: "a55", task: "Colocación de Zócalos", unit: "ml", price: 4800 },
      { id: "a56", task: "Colocación de umbrales", unit: "ml", price: 9200 },

      { id: "a60", task: "Amure de marco", unit: "u", price: 22500 },
      { id: "a61", task: "Canaleteado para cañerías", unit: "ml", price: 4500 },
      { id: "a62", task: "Amure de tablero/caja", unit: "u", price: 15400 },
      { id: "a63", task: "Ayuda de gremio general", unit: "gl", price: 55000 },

      // --- COLOCACIÓN DE PISOS (SIN MATERIALES · CONTRATOS INDEPENDIENTES) ---
      { id: "a70", task: "Colocación de alfombra (incluye adhesivo)", unit: "m2", price: 8950 },
      { id: "a71", task: "Colocación y pulido de parquet/entablonado", unit: "m2", price: 20100 },
      { id: "a72", task: "Colocación de piso flotante (zócalo y piso)", unit: "m2", price: 20500 },
      { id: "a73", task: "Colocación de porcelanatos (mano de obra)", unit: "m2", price: 20000 }
    ]
  },

  // 2. ELECTRICIDAD
  {
    id: "electricista",
    label: "Electricidad (Mano de Obra APIE/CIFRAS)",
    items: [
      { id: "e01", task: "Visita, inspección y diagnóstico", unit: "u", price: 33645 },
      { id: "e02", task: "Hora de trabajo (mínimo técnico)", unit: "hs", price: 33645 },
      { id: "e03", task: "Urgencia (Diurna)", unit: "u", price: 67170 },
      { id: "e04", task: "Urgencia (Nocturna/Finde)", unit: "u", price: 80660 },

      { id: "e10", task: "Boca en Losa", unit: "u", price: 40765 },
      { id: "e11", task: "Boca en Pared Ladrillo Hueco", unit: "u", price: 43895 },
      { id: "e12", task: "Boca en Pared Ladrillo Común", unit: "u", price: 44305 },
      { id: "e13", task: "Boca a la vista", unit: "u", price: 30890 },
      { id: "e14", task: "Pase de viga o columna", unit: "u", price: 35865 },
      { id: "e15", task: "Canalización subterránea (x 5m)", unit: "u", price: 33615 },
      { id: "e16", task: "Caja de paso adicional", unit: "u", price: 36915 },

      { id: "e20", task: "Cableado obra nueva", unit: "u", price: 21525 },
      { id: "e21", task: "Recableado", unit: "u", price: 36890 },
      { id: "e22", task: "Conexión punto/toma/portalámpara", unit: "u", price: 11995 },
      { id: "e23", task: "Conexión Toma Doble", unit: "u", price: 15195 },
      { id: "e24", task: "Conexión Punto Combinación", unit: "u", price: 12910 },

      { id: "e30", task: "Tablero Principal Monofásico", unit: "u", price: 198430 },
      { id: "e31", task: "Tablero Principal Trifásico", unit: "u", price: 268710 },
      { id: "e32", task: "Tablero Seccional (<8 polos)", unit: "u", price: 141025 },
      { id: "e33", task: "Tablero Seccional (8-36 polos)", unit: "u", price: 564180 },
      { id: "e34", task: "Módulo extra", unit: "u", price: 48785 },
      { id: "e35", task: "Disyuntor Tetrapolar extra", unit: "u", price: 83990 },

      { id: "e40", task: "Pilar de obra completo", unit: "u", price: 554110 },
      { id: "e41", task: "Instalación Gabinete 1 Medidor", unit: "u", price: 141025 },
      { id: "e42", task: "Instalación Gabinete 2 Medidores", unit: "u", price: 201545 },
      { id: "e43", task: "Puesta a tierra (Jabalina)", unit: "u", price: 100720 },

      { id: "e50", task: "Bandeja <150mm", unit: "ml", price: 8155 },
      { id: "e51", task: "Bandeja 200/300mm", unit: "ml", price: 12225 },
      { id: "e52", task: "Bandeja 450/600mm", unit: "ml", price: 16715 },

      { id: "e60", task: "Colocación Aplique/Spot", unit: "u", price: 18410 },
      { id: "e61", task: "Colocación Colgante Liviano", unit: "u", price: 36815 },
      { id: "e62", task: "Colocación Colgante Pesado", unit: "u", price: 64410 },
      { id: "e63", task: "Equipo Tubo LED", unit: "u", price: 36815 },
      { id: "e64", task: "Ventilador de Techo", unit: "u", price: 67170 },
      { id: "e65", task: "Ventilador c/ luz", unit: "u", price: 83990 },

      { id: "e70", task: "Portero eléctrico unifamiliar", unit: "u", price: 94105 },
      { id: "e71", task: "Video Portero", unit: "u", price: 131750 },
      { id: "e72", task: "Portero multifamiliar (x unidad)", unit: "u", price: 82520 },

      { id: "e80", task: "Automático tanque/cisterna", unit: "u", price: 83990 },
      { id: "e81", task: "Instalación Grupo Electrógeno", unit: "u", price: 167955 },
      { id: "e82", task: "Certificado DCI (Habilitación)", unit: "u", price: 90000 },
      { id: "e83", task: "Protocolo Puesta a Tierra", unit: "u", price: 126120 }
    ]
  },

  // 3. PLOMERÍA
  {
    id: "plomero",
    label: "Plomería y Sanitarios (CIFRAS)",
    items: [
      { id: "p01", task: "Instalación Inodoro pedestal", unit: "u", price: 89998 },
      { id: "p02", task: "Instalación Bidet + Grifería", unit: "u", price: 90814 },
      { id: "p03", task: "Instalación Lavatorio + Grifería", unit: "u", price: 58748 },
      { id: "p04", task: "Instalación Cuadro Ducha", unit: "u", price: 62507 },
      { id: "p05", task: "Instalación Bañera", unit: "u", price: 85400 },
      { id: "p06", task: "Instalación Pileta Cocina/Lavadero", unit: "u", price: 62507 },
      { id: "p07", task: "Instalación Mingitorio", unit: "u", price: 55200 },
      { id: "p08", task: "Colocación accesorios baño", unit: "gl", price: 28500 },

      { id: "p10", task: "Distribución Agua (Baño completo)", unit: "gl", price: 295000 },
      { id: "p11", task: "Distribución Agua (Cocina/Lavadero)", unit: "gl", price: 145000 },
      { id: "p12", task: "Cañería distribución (metro)", unit: "ml", price: 18500 },
      { id: "p13", task: "Instalación Llave de paso", unit: "u", price: 22400 },
      { id: "p14", task: "Prueba presión", unit: "gl", price: 45000 },

      { id: "p20", task: "Tanque reserva 1100L", unit: "u", price: 42210 },
      { id: "p21", task: "Armado colector", unit: "u", price: 68500 },
      { id: "p22", task: "Bomba Elevadora/Presurizadora", unit: "u", price: 39913 },
      { id: "p23", task: "Limpieza tanque", unit: "u", price: 25600 },

      { id: "p30", task: "Desagüe cloacal (Baño)", unit: "gl", price: 389026 },
      { id: "p31", task: "Boca acceso / Pileta patio", unit: "u", price: 16185 },
      { id: "p32", task: "Boca desagüe abierta", unit: "u", price: 24334 },
      { id: "p33", task: "Cámara inspección 60x60", unit: "u", price: 55000 },
      { id: "p34", task: "Columna ventilación", unit: "ml", price: 12400 },
      { id: "p35", task: "Desagüe Pluvial (x metro)", unit: "ml", price: 14800 },

      { id: "p40", task: "Colocación Termotanque", unit: "u", price: 74613 },
      { id: "p41", task: "Instalación Radiador", unit: "u", price: 18500 },
      { id: "p42", task: "Colector Calefacción", unit: "u", price: 95000 }
    ]
  },

  // 4. GASISTA
  {
    id: "gasista",
    label: "Instalación de Gas (CIFRAS)",
    items: [
      { id: "g01", task: "Instalación Cocina", unit: "u", price: 74943 },
      { id: "g02", task: "Instalación Termo/Calefón", unit: "u", price: 74613 },
      { id: "g03", task: "Instalación Estufa TB", unit: "u", price: 48500 },
      { id: "g04", task: "Instalación Estufa Sin Salida", unit: "u", price: 38200 },
      { id: "g05", task: "Instalación Caldera", unit: "u", price: 115000 },
      { id: "g06", task: "Instalación Anafe+Horno", unit: "gl", price: 88400 },

      { id: "g10", task: "Cañería Epoxi/Sigas (metro)", unit: "ml", price: 22500 },
      { id: "g11", task: "Boca gas adicional", unit: "u", price: 45000 },
      { id: "g12", task: "Instalación Regulador", unit: "u", price: 42000 },
      { id: "g13", task: "Colector cilindros", unit: "u", price: 58000 },
      { id: "g14", task: "Reubicación boca", unit: "u", price: 52000 },

      { id: "g20", task: "Rejillas Ventilación (Par)", unit: "u", price: 18500 },
      { id: "g21", task: "Conducto evacuación", unit: "ml", price: 15400 },
      { id: "g22", task: "Sensor Monóxido", unit: "u", price: 22000 },
      { id: "g23", task: "Remate conducto", unit: "u", price: 28600 },

      { id: "g30", task: "Amure Gabinete", unit: "u", price: 38000 },
      { id: "g31", task: "Prueba hermeticidad", unit: "gl", price: 65000 },
      { id: "g32", task: "Trámites y Planos", unit: "gl", price: 185000 },
      { id: "g33", task: "Inspección final", unit: "gl", price: 95000 }
    ]
  },

  // 5. DURLOCK
  {
    id: "durlock",
    label: "Durlock y Yesería (CIFRAS)",
    items: [
      { id: "d01", task: "Cielorraso Junta Tomada", unit: "m2", price: 36856 },
      { id: "d02", task: "Cielorraso Desmontable", unit: "m2", price: 32300 },
      { id: "d03", task: "Cielorraso Yeso aplicado", unit: "m2", price: 28400 },

      { id: "d10", task: "Tabique Simple", unit: "m2", price: 18500 },
      { id: "d11", task: "Tabique Doble (Aislante)", unit: "m2", price: 29485 },
      { id: "d12", task: "Tabique Baño (Placa Verde)", unit: "m2", price: 21500 },
      { id: "d13", task: "Tabique Ignífugo (Placa Roja)", unit: "m2", price: 23800 },
      { id: "d14", task: "Tabique Curvo", unit: "m2", price: 42000 },

      { id: "d20", task: "Revestimiento Autoportante", unit: "m2", price: 15400 },
      { id: "d21", task: "Revestimiento Pegado", unit: "m2", price: 13655 },

      { id: "d30", task: "Cajón taparrollos/caños", unit: "ml", price: 18000 },
      { id: "d31", task: "Garganta luz difusa", unit: "ml", price: 22500 },
      { id: "d32", task: "Cantoneras metálicas", unit: "ml", price: 4200 },
      { id: "d33", task: "Masillado y lijado", unit: "m2", price: 9500 },
      { id: "d34", task: "Mueble Durlock", unit: "m2", price: 48000 },

      { id: "d40", task: "Refuerzo interno", unit: "u", price: 9500 },
      { id: "d41", task: "Colocación puerta placa", unit: "u", price: 25400 },
      { id: "d42", task: "Pase luces", unit: "u", price: 3800 }
    ]
  },

  // 6. PINTURA
  {
    id: "pintura",
    label: "Pintura y Revestimientos",
    items: [
      { id: "pi01", task: "Látex Interior", unit: "m2", price: 6800 },
      { id: "pi02", task: "Látex Exterior", unit: "m2", price: 7500 },
      { id: "pi03", task: "Sintético en aberturas", unit: "u", price: 28000 },
      { id: "pi04", task: "Impermeabilización techos", unit: "m2", price: 5500 },
      { id: "pi05", task: "Barnizado maderas", unit: "m2", price: 9500 }
    ]
  },

  // 7. 🔥 DIGITAL / DISEÑO / MARKETING 🔥
  {
    id: "digital",
    label: "Digital / Diseño / Marketing (Tarifario Est. 2026)",
    items: [
      // DISEÑO GRÁFICO
      { id: "dg_logo_basic", task: "Diseño de Logo (Express)", unit: "Unidad", price: 180000 },
      { id: "dg_logo_pro", task: "Identidad Visual Completa (Logo + Manual)", unit: "Proyecto", price: 450000 },
      { id: "dg_flyer", task: "Flyer / Pieza Redes Sociales", unit: "Unidad", price: 28000 },
      { id: "dg_brochure", task: "Diseño Brochure / Presentación (x hoja)", unit: "Hoja", price: 35000 },
      { id: "dg_tarjeta", task: "Diseño Tarjeta Personal / Digital", unit: "Unidad", price: 40000 },
      { id: "dg_menu", task: "Diseño Menú Gastronómico QR", unit: "Proyecto", price: 120000 },

      // WEB & DEV
      { id: "web_landing", task: "Landing Page (One Page)", unit: "Proyecto", price: 380000 },
      { id: "web_institucional", task: "Web Institucional (Hasta 5 secciones)", unit: "Proyecto", price: 650000 },
      { id: "web_ecommerce", task: "E-commerce (Tienda Nube / Woo)", unit: "Proyecto", price: 950000 },
      { id: "web_mant", task: "Mantenimiento Web Mensual", unit: "Mes", price: 85000 },
      { id: "web_domain", task: "Gestión de Dominio y Hosting", unit: "Anual", price: 60000 },

      // MARKETING & REDES (CM)
      { id: "mkt_pack_s", task: "Pack Redes Starter (8 Posteos)", unit: "Mes", price: 280000 },
      { id: "mkt_pack_m", task: "Pack Redes Pro (12 Posts + Stories)", unit: "Mes", price: 420000 },
      { id: "mkt_ads", task: "Configuración Campaña Meta Ads", unit: "Campaña", price: 150000 },
      { id: "mkt_copy", task: "Redacción de Contenidos / Copywriting (Pack 5 textos)", unit: "Pack 5", price: 90000 },

      // EDICIÓN DE VIDEO & MOTION
      { id: "vid_reels_simple", task: "Edición Reel/TikTok (Cortes + Subtítulos)", unit: "Unidad", price: 35000 },
      { id: "vid_reels_pro", task: "Edición Reel High-End (Motion + FX)", unit: "Unidad", price: 65000 },
      { id: "vid_youtube", task: "Edición YouTube (Hasta 10 min)", unit: "Unidad", price: 180000 },
      { id: "vid_corp", task: "Video Institucional / Corporativo", unit: "Minuto", price: 250000 },
      { id: "vid_motion_logo", task: "Animación de Logo (Intro/Outro)", unit: "Unidad", price: 150000 },

      // CONSULTORÍA Y ESTRATEGIA
      { id: "mkt_consulta_1h", task: "Sesión de Consultoría 1:1 en marketing digital", unit: "Hora", price: 65000 },
      { id: "mkt_estrategia", task: "Estrategia integral de contenidos (entrega en PDF)", unit: "Proyecto", price: 220000 },

      // COMMUNITY MANAGEMENT EXTRA
      { id: "mkt_pack_l", task: "Pack Redes Intensivo (16 posts + stories diarias)", unit: "Mes", price: 580000 },

      // EMAIL / FUNNELS
      { id: "mkt_email_pack", task: "Secuencia de 4 emails automatizados", unit: "Pack", price: 140000 },

      // FOTOGRAFÍA / CONTENIDO
      { id: "ph_sesion_producto", task: "Sesión de fotos de producto (hasta 20 fotos editadas)", unit: "Sesión", price: 180000 },
      { id: "ph_sesion_personal_brand", task: "Sesión de fotos marca personal (hasta 30 fotos editadas)", unit: "Sesión", price: 230000 },

      // VIDEO / GRABACIÓN
      { id: "vid_jornada_contenido", task: "Jornada de grabación de contenido (hasta 4hs)", unit: "Jornada", price: 220000 },
      { id: "vid_batch_reels_5", task: "Batch de 5 reels listos para publicar", unit: "Pack", price: 150000 }
    ]
  }
];

// --- FUNCIÓN DE CARGA ---
async function seed() {
  console.log("🚀 Iniciando CARGA MASIVA A FIREBASE...");
  console.log("---------------------------------------");

  try {
    for (const categoria of preciosReferencia) {
      process.stdout.write(`⏳ Cargando ${categoria.label}... `);

      const docRef = doc(db, "precios_referencia", categoria.id);

      await setDoc(docRef, {
        label: categoria.label,
        items: categoria.items,
        updatedAt: new Date()
      });

      console.log("✅ HECHO");
    }

    console.log("---------------------------------------");
    console.log("🏁 ¡BASE DE DATOS ACTUALIZADA CON ÉXITO!");
    console.log("Incluye: Albañilería, Electricidad, Plomería, Gas, Durlock, Pintura y Digital.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR FATAL:", error);
    process.exit(1);
  }
}

// Ejecutamos
seed();
