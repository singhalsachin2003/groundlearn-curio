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
    return { ok: owns(customerInfo) };
  } catch (e) {
    const err = e as { userCancelled?: boolean; message?: string };
    return { ok: false, message: err.userCancelled ? undefined : 'The purchase did not go through. Please try again.' };
  }
}

export async function restoreAdFree(): Promise<boolean> {
  if (!configured) return false;
  try { return owns(await Purchases.restorePurchases()); } catch { return false; }
}
