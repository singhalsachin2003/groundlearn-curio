// The one-time Ad-free purchase through Google Play Billing, via RevenueCat.
import Purchases, { PRODUCT_CATEGORY, type CustomerInfo } from 'react-native-purchases';
import { CONFIG } from './config';

let configured = false;
const owns = (info: CustomerInfo) => !!info.entitlements.active[CONFIG.adFreeEntitlement];

/** Set up billing. Calls back with the Ad-free state now and whenever it changes. */
export async function initPurchases(onChange: (adFree: boolean, price?: string) => void) {
  if (!CONFIG.revenueCatKey) return; // not set up yet (development build)
  Purchases.configure({ apiKey: CONFIG.revenueCatKey });
  configured = true;
  Purchases.addCustomerInfoUpdateListener(info => onChange(owns(info)));
  try {
    const [info, products] = await Promise.all([
      Purchases.getCustomerInfo(),
      Purchases.getProducts([CONFIG.adFreeProductId], PRODUCT_CATEGORY.NON_SUBSCRIPTION),
    ]);
    onChange(owns(info), products[0]?.priceString);
  } catch { /* offline: keep the last known state */ }
}

export async function buyAdFree(): Promise<{ ok: boolean; message?: string }> {
  if (!configured) return { ok: false, message: 'Purchases are not set up in this build.' };
  try {
    const [product] = await Purchases.getProducts([CONFIG.adFreeProductId], PRODUCT_CATEGORY.NON_SUBSCRIPTION);
    if (!product) return { ok: false, message: 'The Ad-free purchase is not available right now.' };
    const { customerInfo } = await Purchases.purchaseStoreProduct(product);
    if (owns(customerInfo)) return { ok: true };
    // Paid, but the entitlement has not reached this device yet: ask RevenueCat once more.
    const again = await Purchases.getCustomerInfo().catch(() => customerInfo);
    return owns(again) ? { ok: true } : { ok: false, message: 'Thanks! Your purchase is being confirmed. Ad-free will switch on in a moment.' };
  } catch (e) {
    const err = e as { userCancelled?: boolean; code?: string; message?: string };
    const C = Purchases.PURCHASES_ERROR_CODE;
    if (err.userCancelled) return { ok: false };
    // UPI and some cards in India confirm later: the payment is pending, not failed.
    // The customer-info listener switches Ad-free on as soon as Google confirms it.
    if (err.code === C.PAYMENT_PENDING_ERROR) return { ok: false, message: 'Payment is being processed. Ad-free will switch on as soon as Google confirms it.' };
    // Already bought on this Google account (for example on another phone): restore it.
    if (err.code === C.PRODUCT_ALREADY_PURCHASED_ERROR) {
      const ok = await restoreAdFree();
      return ok ? { ok: true } : { ok: false, message: 'This purchase is already on your Google account. Try Restore purchase.' };
    }
    return { ok: false, message: 'The purchase did not go through. Please try again.' };
  }
}

export async function restoreAdFree(): Promise<boolean> {
  if (!configured) return false;
  try { return owns(await Purchases.restorePurchases()); } catch { return false; }
}
