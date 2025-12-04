# Data Safety Declarations

## Google Play Data Safety

### Data Collection Summary

| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email address | Yes | No | Account authentication |
| User IDs | Yes | No | Account management |
| Photos | Yes (optional) | No | Receipt uploads |
| App interactions | Yes | No | Analytics |
| Crash logs | Yes | No | App stability |

### Detailed Responses

**Does your app collect or share any of the required user data types?**
Yes

**Is all of the user data collected by your app encrypted in transit?**
Yes

**Do you provide a way for users to request that their data is deleted?**
Yes (via Settings > Account > Delete Account)

---

#### Personal Info
- [x] **Email address** - Collected, Not shared
  - Purpose: Account management, Authentication
  - Required: Yes
  - User can request deletion: Yes

#### Photos and Videos
- [x] **Photos** - Collected (Optional), Not shared
  - Purpose: App functionality (receipt uploads)
  - Required: No
  - User can request deletion: Yes

#### App Activity
- [x] **App interactions** - Collected, Not shared
  - Purpose: Analytics
  - Required: No (can opt-out)

#### App Info and Performance
- [x] **Crash logs** - Collected, Not shared
  - Purpose: App stability and debugging
  - Required: No

---

## Apple App Privacy

### Data Linked to You
- **Contact Info:** Email address (for account)

### Data Not Linked to You
- **Diagnostics:** Crash data, Performance data

### Data Used to Track You
- None

### Privacy Nutrition Label Responses

| Category | Data Type | Used for Tracking | Linked to User |
|----------|-----------|-------------------|----------------|
| Contact Info | Email | No | Yes |
| User Content | Photos | No | Yes |
| Diagnostics | Crash Data | No | No |
| Diagnostics | Performance | No | No |

---

## Encryption Declaration (Apple)

**Does your app use encryption?**
Yes - HTTPS for API communication

**Is it exempt from export compliance?**
Yes - Uses only standard HTTPS/TLS

**ITSAppUsesNonExemptEncryption:** false

---

## Third-Party SDKs and Data

| SDK | Data Collected | Purpose |
|-----|---------------|---------|
| Supabase | Auth tokens, user data | Backend services |
| Expo | Device info, crash logs | App updates, diagnostics |

---

## Data Retention

- **Account data:** Retained until account deletion
- **Project data:** Retained until user deletes or account deletion
- **Analytics:** 90 days rolling
- **Crash logs:** 90 days

## Data Deletion Process

Users can delete their account via:
1. Settings > Account > Delete Account
2. Email request to privacy@homenest.app

Upon deletion:
- All personal data removed within 30 days
- Backups purged within 90 days
- Anonymized analytics may be retained
