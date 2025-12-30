/* eslint-disable @typescript-eslint/no-require-imports */

const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

// ⚠️ PEGA AQUÍ TUS CREDENCIALES REALES
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI", 
  authDomain: "propuesta-monster.firebaseapp.com",
  projectId: "propuesta-monster",
  storageBucket: "propuesta-monster.firebasestorage.app",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const preciosReferencia = [
  {
    id: "albanil",
    label: "Albañilería y Estructura (CIFRAS Dic-25)",
    items: [
      // --- DEMOLICIONES Y APERTURAS ---
      { id: "a01", task: "Limpieza de terreno y replanteo", unit: "m2", price: 3668 },
      { id: "a02", task: "Demolición mampostería ladrillo común", unit: "m3", price: 98070 },
      { id: "a03", task: "Demolición mampostería ladrillo hueco", unit: "m2", price: 16916 },
      { id: "a04", task: "Picado de revoques (limpieza total)", unit: "m2", price: 12027 },
      { id: "a05", task: "Apertura de vano en pared (para puerta/ventana)", unit: "u", price: 35400 },
      { id: "a06", task: "Remoción de marco de madera/metálico", unit: "u", price: 18500 },

      // --- MOVIMIENTO DE SUELOS Y FUNDACIONES ---
      { id: "a10", task: "Excavación manual para bases/zapatas", unit: "m3", price: 31120 },
      { id: "a11", task: "Zapata corrida Hormigón Armado", unit: "m3", price: 104867 },
      { id: "a12", task: "Viga de fundación H°A° (encofrado+armado)", unit: "ml", price: 18500 },
      { id: "a13", task: "Pilotín de H°A° (perforación manual)", unit: "u", price: 12800 },
      { id: "a14", task: "Nivelación y compactación de suelo", unit: "m2", price: 4200 },

      // --- ESTRUCTURA Y CUBIERTAS ---
      { id: "a20", task: "Columnas H°A° (encofrado+armado+llenado)", unit: "m3", price: 351949 },
      { id: "a21", task: "Vigas H°A° (encofrado+armado+llenado)", unit: "m3", price: 475225 },
      { id: "a22", task: "Losa Viguetas + Ladrillos Cerámicos 12cm", unit: "m2", price: 54607 },
      { id: "a23", task: "Losa Viguetas + Bloques Poliestireno (EPS)", unit: "m2", price: 51942 },
      { id: "a24", task: "Capa de compresión (llenado y regleado)", unit: "m2", price: 15400 },
      { id: "a25", task: "Hormigón de pendiente (cascotes/perlita)", unit: "m2", price: 12500 },

      // --- MAMPOSTERÍAS (ELEVACIÓN Y DETALLES) ---
      { id: "a30", task: "Capa aisladora horizontal (doble con fieltro)", unit: "ml", price: 12500 },
      { id: "a31", task: "Capa aisladora vertical (Cerecita embutida)", unit: "m2", price: 9800 },
      { id: "a32", task: "Muro Ladrillo Hueco 12x18x33", unit: "m2", price: 26062 },
      { id: "a33", task: "Muro Ladrillo Hueco 18x18x33", unit: "m2", price: 27917 },
      { id: "a34", task: "Muro Ladrillo Común 15cm", unit: "m2", price: 28900 },
      { id: "a35", task: "Muro Bloque HCCA (Retak) 15cm", unit: "m2", price: 21498 },
      { id: "a36", task: "Encadenado perimetral superior (ml)", unit: "ml", price: 14800 },

      // --- REVOQUES Y TERMINACIONES FINAS ---
      { id: "a40", task: "Revoque Grueso (Jaharro) fratasado", unit: "m2", price: 11500 },
      { id: "a41", task: "Revoque Fino a la cal (terminación)", unit: "m2", price: 9200 },
      { id: "a42", task: "Revoque proyectado Monocapa (Mao)", unit: "m2", price: 13800 },
      { id: "a43", task: "Ejecución de Filos y Mochetas", unit: "ml", price: 7500 },
      { id: "a44", task: "Armado de andamio exterior (h > 4m)", unit: "gl", price: 45000 },
      { id: "a45", task: "Colocación de cantoneras galvanizadas", unit: "ml", price: 3200 },

      // --- CONTRAPISOS, CARPETAS Y REVESTIMIENTOS ---
      { id: "a50", task: "Contrapiso de cascotes sobre terreno", unit: "m2", price: 15500 },
      { id: "a51", task: "Carpeta de cemento bajo pisos", unit: "m2", price: 7190 },
      { id: "a52", task: "Carpeta hidrófuga (Baño/Lavadero)", unit: "m2", price: 10400 },
      { id: "a53", task: "Colocación Porcelanato (Mano de obra)", unit: "m2", price: 18500 },
      { id: "a54", task: "Colocación Cerámica piso/pared", unit: "m2", price: 13800 },
      { id: "a55", task: "Colocación de Zócalos cerámicos", unit: "ml", price: 4800 },
      { id: "a56", task: "Colocación de umbrales/alfajías marmol", unit: "ml", price: 9200 },

      // --- AYUDA DE GREMIOS ---
      { id: "a60", task: "Amure de marco puerta/ventana", unit: "u", price: 22500 },
      { id: "a61", task: "Canaleteado para cañerías (Electric/Agua)", unit: "ml", price: 4500 },
      { id: "a62", task: "Amure de tablero/caja de inspección", unit: "u", price: 15400 },
      { id: "a63", task: "Ayuda de gremio general (obra nueva)", unit: "gl", price: 55000 }
    ]
  },
  {
    id: "electricista",
    label: "Electricidad (Mano de Obra APIE/CIFRAS)",
    items: [
      // --- SERVICIOS BÁSICOS ---
      { id: "e01", task: "Visita, inspección y diagnóstico", unit: "u", price: 33645 },
      { id: "e02", task: "Hora de trabajo (mínimo técnico)", unit: "hs", price: 33645 },
      { id: "e03", task: "Urgencia (Atención inmediata 8 a 20hs)", unit: "u", price: 67170 },
      { id: "e04", task: "Urgencia nocturna/domingos (mínimo)", unit: "u", price: 80660 },

      // --- CANALIZACIÓN Y BOCAS ---
      { id: "e10", task: "Boca en Losa (caño PVC/Metal)", unit: "u", price: 40765 },
      { id: "e11", task: "Boca en Pared Ladrillo Hueco", unit: "u", price: 43895 },
      { id: "e12", task: "Boca en Pared Ladrillo Común", unit: "u", price: 44305 },
      { id: "e13", task: "Boca a la vista (Metal/PVC/Cablecanal)", unit: "u", price: 30890 },
      { id: "e14", task: "Pase de viga o columna", unit: "u", price: 35865 },
      { id: "e15", task: "Canalización subterránea en tierra (x 5m)", unit: "u", price: 33615 },
      { id: "e16", task: "Caja de paso adicional", unit: "u", price: 36915 },

      // --- CABLEADO Y CONEXIÓN ---
      { id: "e20", task: "Cableado sobre obra nueva", unit: "u", price: 21525 },
      { id: "e21", task: "Recableado (vivienda ocupada)", unit: "u", price: 36890 },
      { id: "e22", task: "Conexión punto/toma/portalámpara", unit: "u", price: 11995 },
      { id: "e23", task: "Conexión Toma Doble", unit: "u", price: 15195 },
      { id: "e24", task: "Conexión Punto Combinación", unit: "u", price: 12910 },

      // --- TABLEROS Y PROTECCIONES ---
      { id: "e30", task: "Tablero Principal Monofásico (completo)", unit: "u", price: 198430 },
      { id: "e31", task: "Tablero Principal Trifásico (completo)", unit: "u", price: 268710 },
      { id: "e32", task: "Tablero Seccional (Hasta 8 polos)", unit: "u", price: 141025 },
      { id: "e33", task: "Tablero Seccional (8 a 36 polos)", unit: "u", price: 564180 },
      { id: "e34", task: "Módulo extra (Térmica/Disyuntor bipolar)", unit: "u", price: 48785 },
      { id: "e35", task: "Disyuntor Tetrapolar extra", unit: "u", price: 83990 },

      // --- ACOMETIDAS Y PILAR ---
      { id: "e40", task: "Pilar de obra completo (incl. PAT)", unit: "u", price: 554110 },
      { id: "e41", task: "Instalación de Gabinete 1 Medidor", unit: "u", price: 141025 },
      { id: "e42", task: "Instalación de Gabinete 2 Medidores", unit: "u", price: 201545 },
      { id: "e43", task: "Puesta a tierra de servicio (Jabalina)", unit: "u", price: 100720 },

      // --- BANDEJAS PORTACABLES (Por metro) ---
      { id: "e50", task: "Bandeja hasta 150mm ancho (h<3m)", unit: "ml", price: 8155 },
      { id: "e51", task: "Bandeja 200/300mm ancho (h<3m)", unit: "ml", price: 12225 },
      { id: "e52", task: "Bandeja 450/600mm ancho (h<3m)", unit: "ml", price: 16715 },

      // --- ILUMINACIÓN Y VENTILACIÓN ---
      { id: "e60", task: "Colocación Aplique Simple / Spot LED", unit: "u", price: 18410 },
      { id: "e61", task: "Colocación Colgante Liviano (3 luces)", unit: "u", price: 36815 },
      { id: "e62", task: "Colocación Colgante Pesado (araña)", unit: "u", price: 64410 },
      { id: "e63", task: "Equipo Tubo LED simple", unit: "u", price: 36815 },
      { id: "e64", task: "Ventilador de Techo", unit: "u", price: 67170 },
      { id: "e65", task: "Ventilador de Techo con luminaria", unit: "u", price: 83990 },

      // --- PORTEROS Y SEGURIDAD ---
      { id: "e70", task: "Portero eléctrico unifamiliar (embutido)", unit: "u", price: 94105 },
      { id: "e71", task: "Video Portero (instalación completa)", unit: "u", price: 131750 },
      { id: "e72", task: "Portero multifamiliar (precio x unidad)", unit: "u", price: 82520 },

      // --- AUTOMATISMOS Y CERTIFICADOS ---
      { id: "e80", task: "Automático de tanque y cisterna", unit: "u", price: 83990 },
      { id: "e81", task: "Instalación de Grupo Electrógeno (<3,5kva)", unit: "u", price: 167955 },
      { id: "e82", task: "Certificado Eléctrico (Habilitación Negocio)", unit: "u", price: 90000 },
      { id: "e83", task: "Protocolo Puesta a Tierra SRT900/15", unit: "u", price: 126120 }
    ]
  },
{
    id: "plomero",
    label: "Plomería y Sanitarios (CIFRAS)",
    items: [
      // --- INSTALACIÓN DE ARTEFACTOS (POR UNIDAD) ---
      { id: "p01", task: "Instalación Inodoro pedestal completo", unit: "u", price: 89998 },
      { id: "p02", task: "Instalación Bidet + Grifería", unit: "u", price: 90814 },
      { id: "p03", task: "Instalación Lavatorio / Vanitory + Grifería", unit: "u", price: 58748 },
      { id: "p04", task: "Instalación Cuadro de Ducha embutido", unit: "u", price: 62507 },
      { id: "p05", task: "Instalación Bañera / Receptáculo", unit: "u", price: 85400 },
      { id: "p06", task: "Instalación Pileta de Cocina / Lavadero", unit: "u", price: 62507 },
      { id: "p07", task: "Instalación de Mingitorio", unit: "u", price: 55200 },
      { id: "p08", task: "Colocación de accesorios de baño (set x5)", unit: "gl", price: 28500 },

      // --- AGUA FRÍA Y CALIENTE (TERMOFUSIÓN) ---
      { id: "p10", task: "Distribución Agua (Baño estándar completo)", unit: "gl", price: 295000 },
      { id: "p11", task: "Distribución Agua (Cocina/Lavadero)", unit: "gl", price: 145000 },
      { id: "p12", task: "Cañería de distribución (metro lineal)", unit: "ml", price: 18500 },
      { id: "p13", task: "Instalación Llave de paso (Extra)", unit: "u", price: 22400 },
      { id: "p14", task: "Prueba de presión y estanqueidad", unit: "gl", price: 45000 },

      // --- TANQUES Y BOMBAS ---
      { id: "p20", task: "Tanque reserva 1100L (incl. izado y conexión)", unit: "u", price: 42210 },
      { id: "p21", task: "Armado de colector (hasta 4 bajadas)", unit: "u", price: 68500 },
      { id: "p22", task: "Bomba Elevadora / Presurizadora", unit: "u", price: 39913 },
      { id: "p23", task: "Limpieza y desinfección de tanque", unit: "u", price: 25600 },

      // --- DESAGÜES CLOACALES Y PLUVIALES ---
      { id: "p30", task: "Desagüe cloacal completo (Baño estándar)", unit: "gl", price: 389026 },
      { id: "p31", task: "Boca de acceso / Pileta de patio PVC", unit: "u", price: 16185 },
      { id: "p32", task: "Boca de desagüe abierta (Lluvia/Patio)", unit: "u", price: 24334 },
      { id: "p33", task: "Cámara de inspección 60x60 (Premoldeada)", unit: "u", price: 55000 },
      { id: "p34", task: "Instalación de columna de ventilación", unit: "ml", price: 12400 },
      { id: "p35", task: "Desagüe Pluvial (Bajada de techo x metro)", unit: "ml", price: 14800 },

      // --- TERMO Y CALEFACCIÓN ---
      { id: "p40", task: "Colocación de termotanque 60 a 110L", unit: "u", price: 74613 },
      { id: "p41", task: "Instalación de radiador (por elemento)", unit: "u", price: 18500 },
      { id: "p42", task: "Colector central para calefacción", unit: "u", price: 95000 }
    ]
  },
  {
    id: "gasista",
    label: "Instalación de Gas (CIFRAS)",
    items: [
      // --- INSTALACIÓN DE ARTEFACTOS ---
      { id: "g01", task: "Instalación de Cocina (Conexión + Llave)", unit: "u", price: 74943 },
      { id: "g02", task: "Instalación de Termotanque / Calefón", unit: "u", price: 74613 },
      { id: "g03", task: "Instalación de Estufa Tiro Balanceado", unit: "u", price: 48500 },
      { id: "g04", task: "Instalación de Estufa Sin Salida (Infrarroja)", unit: "u", price: 38200 },
      { id: "g05", task: "Instalación de Caldera Dual (Mano de obra)", unit: "u", price: 115000 },
      { id: "g06", task: "Instalación de Anafe + Horno empotrado", unit: "gl", price: 88400 },

      // --- CAÑERÍAS Y DISTRIBUCIÓN ---
      { id: "g10", task: "Cañería Epoxi/Sigas (Metro lineal MO)", unit: "ml", price: 22500 },
      { id: "g11", task: "Boca de gas adicional (cañería + amure)", unit: "u", price: 45000 },
      { id: "g12", task: "Instalación de Regulador de presión", unit: "u", price: 42000 },
      { id: "g13", task: "Armado de colector/puente para cilindros", unit: "u", price: 58000 },
      { id: "g14", task: "Reubicación de boca de gas existente", unit: "u", price: 52000 },

      // --- VENTILACIONES Y SEGURIDAD (NORMATIVA) ---
      { id: "g20", task: "Colocación de Rejillas de Ventilación (Par)", unit: "u", price: 18500 },
      { id: "g21", task: "Conducto evacuación de gases (Sombrerete)", unit: "ml", price: 15400 },
      { id: "g22", task: "Instalación de sensor de Monóxido/Gas", unit: "u", price: 22000 },
      { id: "g23", task: "Rematado de conducto en azotea", unit: "u", price: 28600 },

      // --- GABINETES Y TRÁMITES ---
      { id: "g30", task: "Amure de Gabinete p/ Medidor o Tubos", unit: "u", price: 38000 },
      { id: "g31", task: "Prueba de hermeticidad y obstrucción", unit: "gl", price: 65000 },
      { id: "g32", task: "Trámites ante prestataria / Planos (Ref)", unit: "gl", price: 185000 },
      { id: "g33", task: "Inspección de obra y habilitación final", unit: "gl", price: 95000 }
    ]
  },
  {
    id: "durlock",
    label: "Durlock y Yesería (CIFRAS)",
    items: [
      // --- CIELORRASOS ---
      { id: "d01", task: "Cielorraso Junta Tomada (Estructura 35mm)", unit: "m2", price: 36856 },
      { id: "d02", task: "Cielorraso Desmontable (Perfilería vista)", unit: "m2", price: 32300 },
      { id: "d03", task: "Cielorraso de Yeso aplicado sobre losa", unit: "m2", price: 28400 },
      
      // --- TABIQUES (PAREDES) ---
      { id: "d10", task: "Tabique Simple W70 (Placa 12.5mm)", unit: "m2", price: 18500 },
      { id: "d11", task: "Tabique Doble con Lana de Vidrio/Aislante", unit: "m2", price: 29485 },
      { id: "d12", task: "Tabique p/ Baño (Placa Verde RH - Humedad)", unit: "m2", price: 21500 },
      { id: "d13", task: "Tabique Ignífugo (Placa Roja RF - Fuego)", unit: "m2", price: 23800 },
      { id: "d14", task: "Tabique Curvo (Estructura especial)", unit: "m2", price: 42000 },

      // --- REVESTIMIENTOS ---
      { id: "d20", task: "Revestimiento Autoportante (Omegas)", unit: "m2", price: 15400 },
      { id: "d21", task: "Revestimiento s/ Revoque (Pegado c/ adhesivo)", unit: "m2", price: 13655 },

      // --- DETALLES Y TERMINACIONES ---
      { id: "d30", task: "Cajón p/ tapar cañerías / Vigas", unit: "ml", price: 18000 },
      { id: "d31", task: "Garganta p/ Luz Difusa (Moldura de yeso)", unit: "ml", price: 22500 },
      { id: "d32", task: "Colocación de cantoneras metálicas", unit: "ml", price: 4200 },
      { id: "d33", task: "Masillado completo y tomado de juntas", unit: "m2", price: 9500 },
      { id: "d34", task: "Mueble de Durlock / Estanterías (Diseño)", unit: "m2", price: 48000 },

      // --- AYUDAS Y VARIOS ---
      { id: "d40", task: "Refuerzo interno p/ Sanitarios / Alacenas", unit: "u", price: 9500 },
      { id: "d41", task: "Colocación de puerta placa en tabique", unit: "u", price: 25400 },
      { id: "d42", task: "Pase p/ luminarias (Spot/Caja)", unit: "u", price: 3800 }
    ]
  },
  {
    id: "pintura",
    label: "Pintura y Revestimientos",
    items: [
      { id: "pi01", task: "Látex Interior (2 manos + enduido parcial)", unit: "m2", price: 6800 },
      { id: "pi02", task: "Látex Exterior (Frentes/Medianeras)", unit: "m2", price: 7500 },
      { id: "pi03", task: "Sintético en aberturas/rejas", unit: "u", price: 28000 },
      { id: "pi04", task: "Impermeabilización de techos (malla+membrana)", unit: "m2", price: 5500 },
      { id: "pi05", task: "Barnizado/Lustre de maderas", unit: "m2", price: 9500 }
    ]
  }
];

async function seed() {
  console.log("🚀 Iniciando CARGA MASTER (CIFRAS Dic-25)...");
  for (const categoria of preciosReferencia) {
    const docRef = doc(db, "precios_referencia", categoria.id);
    await setDoc(docRef, {
      label: categoria.label,
      items: categoria.items,
      updatedAt: new Date()
    });
    console.log(`✅ ${categoria.label} cargada exitosamente.`);
  }
  console.log("🏁 Base de datos COMPLETA. ¡A laburar!");
}

seed();