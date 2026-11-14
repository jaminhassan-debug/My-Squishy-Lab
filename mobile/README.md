# My Squishy Lab 1.0 mobile release

The mobile package stages the game from the repository root. Run these commands from `mobile/` with Node.js 22 or later.

- `npm install`
- `npm run sync:android` with the Android 36 SDK, Java 21 and either macOS sips or Linux ImageMagick
- `npm run sync:ios` on macOS with Xcode 26 or later

Proposed app identifier is `com.mysquishylab.game`. Check its availability before establishing publisher records. Release builds require the publisher's signing setup. Open Android Studio for signed APK and AAB generation, or Xcode for the signed iPhone and iPad archive.

## Listing draft

**Name** My Squishy Lab

**Short description** Mix, mould and squish your own toys in a cosy workshop.

**Description** Make your own squishy from scratch. Choose a mould, stir together your favourite colours, add fruit slices, gems or glitter, and pour the mix. Peel away the mould and try poking, squeezing or stretching your creation. Save favourites to your shelf or give a copy to a fictional workshop friend. Visit the Daily Workshop for coins and a rotating recipe challenge. The game is designed for offline play, with quiet settings and progress saved on your device.

**Reviewer instructions** Tap Play, then Make. Follow the mould, colour, feel, bits, pour and reveal steps. The finished toy supports poke, hand squeeze and two-finger stretch. Use Finish to save a creation, then open Workshop → Friends or Daily Workshop. There is no sign-in. The optional Grown-ups area contains backup tools and previews of future add-ons. This release has no checkout.

## Submission and test checklist

- Test on a physical Android phone, Fire OS tablet, iPhone and iPad. Exercise landscape layouts, first launch in airplane mode, the full making flow, two-finger stretch, audio after suspension, save persistence and backup import/export.
- Capture and upload genuine phone and tablet gameplay screenshots. Prepare the store-specific banner and complete publisher contact, country availability, content-rating and age-audience fields.
- Confirm the final binaries' permissions, libraries and network behaviour before completing store privacy declarations. Publish the privacy and support URLs under the approved publisher identity.
- Upload an appropriately signed AAB to Google Play Console. If the account is subject to Google's new personal-account testing rule, complete the closed test with at least 12 testers opted in for 14 continuous days before applying for production access.
- Upload the signed iOS archive through Xcode and run a TestFlight pass. Review the parent gate against the chosen App Store category before enabling purchase flows or external links.
- Test a debug APK on the intended Fire OS tablet, then submit a release APK or AAB through Amazon Developer Console and select supported models.

The GitHub workflow builds a debug APK and an unsigned release bundle. Generate and retain production signing material in the publisher account or a controlled signing environment.
