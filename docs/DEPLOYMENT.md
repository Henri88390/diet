# Deployment (Android / Google Play)

Pushing to the `prod` branch runs `.github/workflows/deploy-prod.yml`:

1. **verify**: `npm ci`, typecheck, domain checks.
2. **deploy**: `eas build --platform android --profile production --auto-submit`. EAS builds the Android app bundle in the cloud, then submits it to the Google Play **internal testing** track as a draft.

`versionCode` is auto-incremented by EAS (`appVersionSource: remote`). Change `version` in `app.json` for user-visible releases.

Promote builds from internal testing to production manually in Play Console (recommended while the app is new). To release directly instead, change `track`/`releaseStatus` in `eas.json`.

iOS is not set up yet. Later: add `ios.bundleIdentifier` to `app.json`, an `ios` block with `ascAppId` under `submit.production` in `eas.json`, and switch the workflow to `--platform all`.

## Placeholders to replace

| Where | Value | Replace with |
|---|---|---|
| `app.json` | `android.package` (`com.example.mealplanner`) | Your unique app id (cannot change after publishing) |
| `app.json` | `extra.eas.projectId` | Written by `eas init` |
| GitHub secret | `EXPO_TOKEN` | Token from expo.dev > Access tokens |
| GitHub secret | `GOOGLE_SERVICE_ACCOUNT_JSON` | Full JSON of the Google Play service account key |

See `.env.example`. Never commit real values.

## One-time setup

1. Create a Google Play Console account (25 USD one-time) and a free Expo account at expo.dev.
2. Install and link EAS:
   ```
   npm install -g eas-cli
   eas login
   eas init        # fills extra.eas.projectId in app.json
   ```
3. Create the app in Play Console (package name must match `app.json`).
4. **Upload the first release manually.** Run `eas build -p android --profile production`, then upload the `.aab` in Play Console once. After that CI can submit automatically.
5. Create a Google Cloud service account, enable the Google Play Android Developer API, invite it in Play Console (Users and permissions) with release permissions, and download its JSON key.
6. In GitHub, add secrets `EXPO_TOKEN` and `GOOGLE_SERVICE_ACCOUNT_JSON`, and create the `prod` branch.

### Store requirements still to do
- App icon (1024x1024) and adaptive icon foreground: add `icon` and `android.adaptiveIcon.foregroundImage` in `app.json`.
- Store listing, screenshots, privacy policy URL, content rating and data-safety form.
- Diet/weight content should carry a "not medical advice" note in the listing.

## Useful commands
```
eas build -p android --profile production   # manual release build
eas build -p android --profile preview      # installable APK for testing
eas submit -p android --latest              # submit latest build manually
```
