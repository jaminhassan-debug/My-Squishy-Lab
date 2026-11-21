import { Capacitor } from '@capacitor/core';
import { Purchases, PRODUCT_CATEGORY } from '@revenuecat/purchases-capacitor';
const productId='com.mysquishylab.dreammouldstudio',entitlement='dream_mould_studio';
let configured=null;
async function ready(){const platform=Capacitor.getPlatform(),key=platform==='ios'?__RC_APPLE_KEY__:platform==='android'?__RC_GOOGLE_KEY__:null;if(!Capacitor.isNativePlatform()||!key)throw Error('Store purchases are not connected in this build yet.');if(!configured)configured=Purchases.configure({apiKey:key}).catch(e=>{configured=null;throw e});await configured;}
async function product(){await ready();const result=await Purchases.getProducts({productIdentifiers:[productId],type:PRODUCT_CATEGORY.NON_SUBSCRIPTION});return result.products.find(p=>p.identifier===productId)||null;}
globalThis.SquishyStore={async customerInfo(){await ready();return Purchases.getCustomerInfo()},product,async purchase(){const item=await product();if(!item)throw Error('This add-on is not available in your store yet.');return Purchases.purchaseStoreProduct({product:item})},async restore(){await ready();return Purchases.restorePurchases()},productId,entitlement};
