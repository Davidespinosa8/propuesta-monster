import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { applyFullDiscountCouponToUser } from "@/services/user.service";

export const applyCoupon = async (userId: string, couponCode: string) => {
  try {
    const code = couponCode.trim().toUpperCase();

    const couponRef = doc(db, "coupons", code);
    const couponSnap = await getDoc(couponRef);

    if (!couponSnap.exists()) {
      throw new Error("El cupón no existe");
    }

    const couponData = couponSnap.data();

    if (!couponData.active) {
      throw new Error("El cupón ya no está activo");
    }

    if (
      couponData.limit &&
      (couponData.uses || 0) >= couponData.limit
    ) {
      throw new Error("Límite de usos alcanzado");
    }

    if (couponData.discount === 100) {
      await applyFullDiscountCouponToUser(userId, code);
      await updateDoc(couponRef, { uses: increment(1) });

      return {
        success: true,
        message: "¡Felicidades! Ya sos PRO 🚀",
      };
    }

    return {
      success: false,
      message: "Cupón válido para descuento",
      discount: couponData.discount,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    return { success: false, message: errorMessage };
  }
};