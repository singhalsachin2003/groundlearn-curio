// The one-time purchase through Google Play Billing (Ad-free) or Apple in-app purchase (the whole island, plus the
// free 7-day trial), via RevenueCat.
import Purchases, { PRODUCT_CATEGORY, type CustomerInfo, type PurchasesStoreProduct } from 'react-native-purchases';
import { CONFIG } from './config';

let configured = false;
const owns = (info: CustomerInfo) => !!info.entitlements.active[CONFIG.adFreeEntitlement];
/** When the 7-day trial ends, from the date the store recorded for the trial "purchase" (0 = never taken). */
export function trialEnd(info: CustomerInfo): number {
  if (!CONFIG.trialProductId) return 0;
  const taken = info.nonSubscriptionTransactions.filter(x => x.productIdentifier === CONFIG.trialProductId).map(x => Date.parse(x.purchaseDate)).filter(n => n > 0);
  return taken.length ? Math.min(...taken) + CONFIG.trialDays * 86_400_000 : 0;
}

/** What the app sells right now: the unlock in RevenueCat's current offering (the sale product during a sale, otherwise
 * the regular one), plus the regular price to strike through when the sale price is lower. Both prices come from the
 * store, so they are in the buyer's own currency. Without offerings it sells the regular product. */
async function forSale(): Promise<{ product: PurchasesStoreProduct | null; was?: string }> {
  const [regular] = await Purchases.getProducts([CONFIG.adFreeProductId], PRODUCT_CATEGORY.NON_SUBSCRIPTION);
  let sell: PurchasesStoreProduct | null = regular ?? null;
  try {
    const cur = (await Purchases.getOfferings()).current;
    const p = cur?.lifetime?.product ?? cur?.availablePackages[0]?.product;
    if (p && (p.identifier === CONFIG.adFreeProductId || p.identifier === CONFIG.saleProductId)) sell = p;
  } catch { /* no offerings: sell the regular product */ }
  const was = sell && regular && sell.identifier !== regular.identifier && sell.currencyCode === regular.currencyCode && sell.price < regular.price ? regular.priceString : undefined;
  return { product: sell, was };
}

/** Set up billing. Calls back with the unlock state now and whenever it changes, and with the price to show
 * (and the struck-through regular price during a sale). */
export async function initPurchases(onChange: (adFree: boolean, price?: string, was?: string) => void, onTrial?: (end: number) => void) {
  if (!CONFIG.revenueCatKey) return; // not set up yet (development build)
  Purchases.configure({ apiKey: CONFIG.revenueCatKey });
  configured = true;
  Purchases.addCustomerInfoUpdateListener(info => { onChange(owns(info)); onTrial?.(trialEnd(info)); });
  try {
    const [info, sale] = await Promise.all([Purchases.getCustomerInfo(), forSale()]);
    onChange(owns(info), sale.product?.priceString, sale.was); onTrial?.(trialEnd(info));
  } catch { /* offline: keep the last known state */ }
}

export async function buyAdFree(): Promise<{ ok: boolean; message?: string }> {
  if (!configured) return { ok: false, message: 'Purchases are not set up in this build.' };
  try {
    const { product } = await forSale(); // the sale product during a sale, so the charge matches the price shown
    if (!product) return { ok: false, message: 'This purchase is not available right now.' };
    const { customerInfo } = await Purchases.purchaseStoreProduct(product);
    if (owns(customerInfo)) return { ok: true };
    // Paid, but the entitlement has not reached this device yet: ask RevenueCat once more.
    const again = await Purchases.getCustomerInfo().catch(() => customerInfo);
    return owns(again) ? { ok: true } : { ok: false, message: `Thanks! Your purchase is being confirmed. ${CONFIG.unlockReady} in a moment.` };
  } catch (e) {
    const err = e as { userCancelled?: boolean; code?: string; message?: string };
    const C = Purchases.PURCHASES_ERROR_CODE;
    if (err.userCancelled) return { ok: false };
    // UPI and some cards in India confirm later: the payment is pending, not failed.
    // The customer-info listener switches Ad-free on as soon as Google confirms it.
    if (err.code === C.PAYMENT_PENDING_ERROR) return { ok: false, message: `Payment is being processed. ${CONFIG.unlockReady} as soon as ${CONFIG.storeName} confirms it.` };
    // Already bought on this Google account (for example on another phone): restore it.
    if (err.code === C.PRODUCT_ALREADY_PURCHASED_ERROR) {
      const ok = await restoreAdFree();
      return ok ? { ok: true } : { ok: false, message: `This purchase is already on your ${CONFIG.storeAccount}. Try Restore purchase.` };
    }
    return { ok: false, message: 'The purchase did not go through. Please try again.' };
  }
}

/** Take the free 7-day trial (iOS). Apple shows its own sheet with the price "Free"; nothing is charged and nothing renews.
 * Resolves with the trial's end as the store recorded it. */
export async function startTrial(): Promise<{ ok: boolean; end: number; message?: string }> {
  if (!configured || !CONFIG.trialProductId) return { ok: false, end: 0, message: 'The free trial is not set up in this build.' };
  try {
    const [product] = await Purchases.getProducts([CONFIG.trialProductId], PRODUCT_CATEGORY.NON_SUBSCRIPTION);
    if (!product) return { ok: false, end: 0, message: 'The free trial is not available right now.' };
    const { customerInfo } = await Purchases.purchaseStoreProduct(product);
    const end = trialEnd(customerInfo) || Date.now() + CONFIG.trialDays * 86_400_000;
    return { ok: true, end };
  } catch (e) {
    const err = e as { userCancelled?: boolean; code?: string };
    if (err.userCancelled) return { ok: false, end: 0 };
    // Taken before on this Apple Account (another device, or before a reinstall): its original date stands.
    if (err.code === Purchases.PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
      const info = await Purchases.restorePurchases().catch(() => null);
      const end = info ? trialEnd(info) : 0;
      return { ok: end > Date.now(), end, message: end > Date.now() ? undefined : `The free trial was already used on this ${CONFIG.storeAccount}.` };
    }
    return { ok: false, end: 0, message: 'The free trial did not start. Please try again.' };
  }
}

export async function restoreAdFree(): Promise<boolean> {
  if (!configured) return false;
  try { return owns(await Purchases.restorePurchases()); } catch { return false; }
}
