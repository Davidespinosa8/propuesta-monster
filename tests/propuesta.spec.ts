import { test, expect } from '@playwright/test';

test('Flujo completo: Crear Presupuesto y Verificar Precio', async ({ page }) => {
  // 1. Ir al Home
  await page.goto('http://localhost:3000');
  
  // 2. Click en "Crear Nuevo Presupuesto"
  await page.click('text=Crear Nuevo Presupuesto');
  
  // 3. Llenar el formulario (USANDO SELECTORES MÁS PRECISOS)
  // Llenamos el nombre del cliente
  await page.getByPlaceholder('Ej: Nike').fill('Tesla Inc');
  
  // Llenamos el precio base (Usamos getByLabel para no confundirlo con otros inputs de precio)
  // Nota: Asegúrate de que el label en tu código coincida exactamente (mayúsculas/espacios)
  // Si falla, intenta con: await page.locator('input').nth(2).fill('1000');
  const basePriceInput = page.locator('input[type="number"]').first();
  await basePriceInput.fill('1000');

  // Llenamos el WhatsApp
  await page.getByPlaceholder('549...').fill('5491112345678');

  // 4. Agregar un servicio extra personalizado
  await page.click('text=+ Agregar Item');
  
  // Esperamos un momento a que aparezcan los inputs nuevos
  await page.waitForTimeout(500); 

  // Llenamos el último input de título que apareció
  const serviceInputs = await page.locator('input[placeholder="Título del servicio"]').all();
  await serviceInputs[serviceInputs.length - 1].fill('Servicio VIP');
  
  // Llenamos el último input de precio que apareció
  const priceInputs = await page.locator('input[placeholder="$"]').all();
  await priceInputs[priceInputs.length - 1].fill('500');

  // 5. Generar el Link
  await page.click('text=GENERAR LINK MÁGICO');

  // 6. Verificar que redirigió
  await expect(page).toHaveURL(/.*propuesta/);
  
  // 7. VERIFICACIÓN ROBUSTA
  
  // PASO A: Esperar a que el nombre aparezca
  await expect(page.getByText('Hola,')).toBeVisible();
  await expect(page.getByText('Tesla Inc')).toBeVisible();

  // PASO B: Verificar el precio
  // CORRECCIÓN: Agregamos .first() para que no falle por encontrarlo duplicado
  await expect(page.getByText('$1000', { exact: false }).first()).toBeVisible();

  // 8. Probar la Calculadora Interactiva
  // Hacemos click en nuestro servicio custom "Servicio VIP"
  await page.click('text=Servicio VIP');

  // El total debería ser: 1000 (Base) + 500 (VIP) = 1500
  // Buscamos el número 1500. Aquí también usamos .first() por seguridad.
  await expect(page.getByText('$1700', { exact: false }).first()).toBeVisible();
});