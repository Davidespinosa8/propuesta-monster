import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const applyCoupon = async (userId: string, couponCode: string) => {
  try {
    // 1. Buscamos el cupón (el ID del doc es el código en mayúsculas)
    const couponRef = doc(db, "coupons", couponCode.toUpperCase());
    const couponSnap = await getDoc(couponRef);

    if (!couponSnap.exists() || !couponSnap.data().active) {
      throw new Error("El cupón no existe o expiró");
    }

    // 2. Si el descuento es 100%, activamos PRO directo
    if (couponSnap.data().discount === 100) {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        plan: "pro",
        couponUsed: couponCode.toUpperCase()
      });

      // 3. Incrementamos el contador de uso del cupón
      await updateDoc(couponRef, {
        uses: increment(1)
      });

      return { success: true, message: "¡Felicidades! Ya sos PRO 🚀" };
    }

    return { success: false, message: "Este cupón no es válido para activación gratuita" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};