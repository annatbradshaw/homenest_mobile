# App Store Submission Checklist

## Pre-Submission

### Assets Required
- [ ] App icon 1024x1024 (Apple) - no transparency
- [ ] App icon 512x512 (Google Play)
- [ ] Feature graphic 1024x500 (Google Play)
- [ ] Screenshots - all sizes (see below)
- [ ] App preview video (optional)

### Screenshot Sizes
**Apple App Store:**
- [ ] iPhone 6.7" (1290 × 2796) - iPhone 14 Pro Max
- [ ] iPhone 6.5" (1284 × 2778) - iPhone 14 Plus
- [ ] iPhone 5.5" (1242 × 2208) - iPhone 8 Plus
- [ ] iPad Pro 12.9" (2048 × 2732) - if supporting iPad

**Google Play:**
- [ ] Phone (1080 × 1920 minimum)
- [ ] 7" Tablet (if supporting)
- [ ] 10" Tablet (if supporting)

### Documents
- [x] Store listing content (STORE_LISTING.md)
- [x] Privacy policy (PRIVACY_POLICY.md)
- [x] Data safety declarations (DATA_SAFETY.md)
- [ ] Terms of service (if applicable)

### Technical
- [x] app.json configured for production
- [x] eas.json configured
- [ ] EAS project ID added to app.json
- [ ] Environment variables set for production
- [ ] API endpoints pointing to production

---

## Apple App Store

### Developer Account Setup
- [ ] Apple Developer Program membership active ($99/year)
- [ ] Certificates created (or let EAS manage)
- [ ] App ID registered in Apple Developer Portal
- [ ] App created in App Store Connect

### App Store Connect
- [ ] App name reserved
- [ ] Bundle ID matches app.json
- [ ] Primary language set
- [ ] Category selected (Productivity)
- [ ] Secondary category (Lifestyle)
- [ ] Content rights declared
- [ ] Age rating questionnaire completed
- [ ] Pricing set (Free or paid)

### Build & Submit
```bash
# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production
```

### Review Preparation
- [ ] Test account credentials ready
- [ ] Demo mode or test data available
- [ ] Review notes written
- [ ] Contact info for review team

---

## Google Play Store

### Developer Account Setup
- [ ] Google Play Console registration ($25 one-time)
- [ ] Developer account verified
- [ ] App created in Play Console

### Store Listing
- [ ] App name (30 chars)
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Feature graphic uploaded
- [ ] Screenshots uploaded
- [ ] App category selected (House & Home)
- [ ] Content rating questionnaire completed
- [ ] Target audience declared
- [ ] Privacy policy URL added

### Data Safety
- [ ] Data safety form completed
- [ ] All data types declared
- [ ] Security practices confirmed

### Build & Submit
```bash
# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --profile production
```

### Release Track
- [ ] Internal testing (recommended first)
- [ ] Closed testing (beta users)
- [ ] Open testing (public beta)
- [ ] Production release

---

## Post-Submission

### Apple
- [ ] Monitor App Store Connect for review status
- [ ] Respond to any review feedback
- [ ] Typical review time: 24-48 hours

### Google
- [ ] Monitor Play Console for review status
- [ ] Typical review time: 1-7 days
- [ ] Check for policy warnings

---

## Commands Reference

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project (first time)
eas build:configure

# Build development
eas build --platform all --profile development

# Build production
eas build --platform all --profile production

# Submit iOS
eas submit --platform ios

# Submit Android
eas submit --platform android

# Check build status
eas build:list
```

---

## Version Increments

When releasing updates:
1. Update `version` in app.json (e.g., "1.0.1")
2. EAS will auto-increment buildNumber/versionCode with `autoIncrement: true`

Or manually:
- iOS: Update `buildNumber` in app.json
- Android: Update `versionCode` in app.json
