# Dream Mould Studio paid add-on

Implemented as a non-consumable, one-time purchase, separate from the Complete Edition. No subscription, no coin spend, no local entitlement flag and no automatic unlock from importing a backup.

The workshop and mould selection screen have a Dream Mould Studio entry. Anyone can draw and preview a mould. After a verified purchase, players can use their drawings in the regular colour → material → filling → pouring → reveal → squish → photo → shelf flow. Custom outlines and names travel inside recipes and backups. Up to 24 reusable moulds are listed in the studio; saved creations retain their own outlines even when the reusable list fills. Existing presets remain unchanged.

## Temporary free play

Dream Mould Studio currently offers password-protected free play. The password form unlocks drawing, creating, saving and reusing custom moulds for the current tab session. Reloading that tab retains access; Lock free play removes it. Purchase buttons are hidden while this mode is enabled. This access is separate from paid ownership and is never exported in game backups. Set `freePlayEnabled` to false in addon-commerce.js before a paid launch.

## Store activation still required

1. Create `com.mysquishylab.dreammouldstudio` as a non-consumable in App Store Connect and as a one-time managed product in Google Play Console. Set the desired regional prices in those consoles. Do not mark it as a consumable or subscription.
2. Connect those store apps in RevenueCat and explicitly configure both products as NON-CONSUMABLE in RevenueCat’s product catalogue. For Google Play this setting prevents the SDK from consuming the purchase, so it remains restorable after reinstalling. Create entitlement `dream_mould_studio` and attach each store product. Store agreements, tax/payment details, production app signing and store credentials must be valid. Configure product availability for the intended testing tracks.
3. Add the public SDK keys to repository Actions secrets: `SQUISHY_RC_APPLE_PUBLIC_KEY` (starts `appl_`) and `SQUISHY_RC_GOOGLE_PUBLIC_KEY` (starts `goog_`). Never supply a RevenueCat secret API key. The build embeds only these public platform SDK keys. Rebuild the native app, enable In-App Purchase capability on the iOS app target, and complete store sandbox testing.

Until activation, the game shows Purchases unavailable. It does not take money or grant a paid unlock. The website currently provides the free drawing preview only; no web checkout or cross-platform account linking has been added. Fire OS/Amazon billing requires a separately configured Amazon integration before sales on Amazon devices; Google Play billing is not an Amazon purchase implementation.

## Purchase behaviour

RevenueCat's official Capacitor SDK configures the store, fetches the non-subscription product and its localized price, performs the store-native purchase, and restores purchases. Only `customerInfo.entitlements.active.dream_mould_studio` grants access. The studio refreshes customer info on entry and before creating a new mould. Purchased or previously saved squishies remain readable without inventing an entitlement. A parent check is required before showing purchase opportunities and restore controls. Parent checks are a UI boundary, not an authentication system.

Cancel, pending verification, unavailable store, missing product and absent entitlement do not unlock. Duplicate purchase submissions are serialized. There is no development bypass in the shipped game. Use an official store sandbox account for purchase testing.

## Validation

`node tests/custom-addon.cjs` covers custom recipe validation, regular pour/reveal/play/photo/save, shelf recognition, backup export/import, preset switching, generic tray geometry, successful purchase/restore, revocation and pending verification using a fake store transport. Existing tests exercise layout, normal moulds, physics and save stability.

`npm run prepare:mobile` bundles the official SDK with esbuild. Native store transactions, signed physical-device testing and store approval cannot be verified without the connected store accounts and products. No sales have been enabled by these code changes alone.

Store setup references: https://www.revenuecat.com/docs/getting-started/entitlements/android-products and https://www.revenuecat.com/docs/getting-started/restoring-purchases. Configure store server notifications for refunds and test restore after reinstalling under the chosen RevenueCat restore/transfer policy.
