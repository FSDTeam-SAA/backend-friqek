# SafeMed Rx — Screen → API Mapping

Base URL: `http://localhost:5000/api/v1`
Auth: `Authorization: Bearer <accessToken>` header (from `/auth/login`) unless noted "Public".

---

## 1. Auth / Onboarding Screens

| Figma Screen | Method & Endpoint | Controller | Route file |
|---|---|---|---|
| Sign up | `POST /auth/register` | `auth.controller.register` | `route/auth.route.js` |
| Enter OTP (after sign up) | `POST /auth/verify-email` | `auth.controller.verifyEmail` | `route/auth.route.js` |
| Enter OTP → "RESEND OTP" | `POST /auth/resend-otp` | `auth.controller.resendOtp` | `route/auth.route.js` |
| Sign in | `POST /auth/login` | `auth.controller.login` | `route/auth.route.js` |
| Forgot password (email step) | `POST /auth/forget-password` | `auth.controller.forgetPassword` | `route/auth.route.js` |
| Enter OTP (forgot-password flow) | `POST /auth/verify-reset-otp` | `auth.controller.verifyResetPasswordOTP` | `route/auth.route.js` |
| Reset New Password | `POST /auth/reset-password` | `auth.controller.resetPassword` | `route/auth.route.js` |
| Profile → Log Out (confirm modal) | `POST /auth/logout` | `auth.controller.logout` | `route/auth.route.js` |
| Choose your role (Patient/Caregiver) | sent as `role` field in `POST /auth/register` body | `auth.controller.register` | `route/auth.route.js` |

---

## 2. Patient — Home Screen

| Figma Screen element | Endpoint | Controller | Route file |
|---|---|---|---|
| Home screen (Today's Adherence %, Active Meds / Missed / Upcoming, Today's Schedule) | `GET /dose/home` | `dose.controller.getHomeSummary` | `route/dose.route.js` |
| "Take" button (Home & Today) | `PATCH /dose/:doseId/take` | `dose.controller.takeDose` | `route/dose.route.js` |
| "Skip" button (Home & Today) | `PATCH /dose/:doseId/skip` | `dose.controller.skipDose` | `route/dose.route.js` |

## 3. Patient — Today Tab

| Figma Screen element | Endpoint | Controller | Route file |
|---|---|---|---|
| Today (3/6 doses, Taken/Missed/Left, missed highlight card, schedule by Morning/Afternoon/Night) | `GET /dose/today?date=YYYY-MM-DD` | `dose.controller.getTodaySchedule` | `route/dose.route.js` |
| Take / Skip buttons | same as above (`/dose/:doseId/take`, `/dose/:doseId/skip`) | `dose.controller` | `route/dose.route.js` |

## 4. Patient — My Medications

| Figma Screen element | Endpoint | Controller | Route file |
|---|---|---|---|
| My Medications (list + search) | `GET /medication?search=` | `medication.controller.getMyMedications` | `route/medication.route.js` |
| Medication card detail | `GET /medication/:id` | `medication.controller.getMedicationById` | `route/medication.route.js` |
| "+" → Add Medication modal | `POST /medication` | `medication.controller.addMedication` | `route/medication.route.js` |
| "Edit" button | `PUT /medication/:id` | `medication.controller.updateMedication` | `route/medication.route.js` |
| "Remove" button | `DELETE /medication/:id` | `medication.controller.deleteMedication` | `route/medication.route.js` |

## 5. Patient — Interaction Checker

| Figma Screen element | Endpoint | Controller | Route file |
|---|---|---|---|
| Interaction Checker (High/Moderate/Low severity cards) | `GET /interaction/check` | `interaction.controller.checkMyInteractions` | `route/interaction.route.js` |

## 6. Patient — My Profile

| Figma Screen element | Endpoint | Controller | Route file |
|---|---|---|---|
| My Profile (name, meds count, adherence %, streak) | `GET /user/profile` | `user.controller.getProfile` | `route/user.route.js` |
| Full Name / Age / Gender / Medical Conditions / Allergies edit icons, profile photo | `PUT /user/profile` (multipart, field `profileImage`) | `user.controller.updateProfile` | `route/user.route.js` |
| Account Management → Change Password | `PUT /user/change-password` | `user.controller.changePassword` | `route/user.route.js` |
| Account Management → Delete Account | `DELETE /user/delete-account` | `user.controller.deleteAccount` | `route/user.route.js` |
| My Caregivers (list) | `GET /caregiver/my-caregivers` | `caregiver.controller.getMyCaregivers` | `route/caregiver.route.js` |
| Add Caregiver modal | `POST /caregiver/my-caregivers` | `caregiver.controller.addCaregiver` | `route/caregiver.route.js` |
| "Notify When" toggles (taken/missed/skipped) | `PATCH /caregiver/my-caregivers/:id/notify-settings` | `caregiver.controller.updateCaregiverNotifySettings` | `route/caregiver.route.js` |
| Trash icon on a caregiver row | `DELETE /caregiver/my-caregivers/:id` | `caregiver.controller.removeCaregiver` | `route/caregiver.route.js` |
| About App / Privacy Policy / Terms & Conditions | static content — no API needed (served from app assets) | — | — |

---

## 7. Caregiver — Home Screen

| Figma Screen element | Endpoint | Controller | Route file |
|---|---|---|---|
| Caregiver Home (Monitored / On Track / Missed counts, "Missed Medications Today" alert banners, My Patients list) | `GET /caregiver/home` | `caregiver.controller.getCaregiverHome` | `route/caregiver.route.js` |

## 8. Caregiver — Patients Tab

| Figma Screen element | Endpoint | Controller | Route file |
|---|---|---|---|
| All Patients (list + search + weekly adherence bar) | `GET /caregiver/my-patients?search=` | `caregiver.controller.getMyPatients` | `route/caregiver.route.js` |
| "View Detail" → Missed Medications Today / patient detail (conditions, allergies, emergency contact, morning/afternoon/night schedule) | `GET /caregiver/my-patients/:linkId?date=YYYY-MM-DD` | `caregiver.controller.getPatientDetail` | `route/caregiver.route.js` |

## 9. Caregiver — Alerts / Notifications Tab

| Figma Screen element | Endpoint | Controller | Route file |
|---|---|---|---|
| Notifications (All / Taken / Missed / Skipped filter tabs) | `GET /notification?type=All` | `notification.controller.getNotifications` | `route/notification.route.js` |
| Tapping a notification (mark read) | `PATCH /notification/:id/read` | `notification.controller.markNotificationRead` | `route/notification.route.js` |
| Mark-all-read (bell icon) | `PATCH /notification/read-all` | `notification.controller.markAllNotificationsRead` | `route/notification.route.js` |

## 10. Caregiver — Adherence Tab

| Figma Screen element | Endpoint | Controller | Route file |
|---|---|---|---|
| Adherence (Overall Adherence donut: Taken/Missed %, Per Patient bars) | `GET /caregiver/adherence` | `caregiver.controller.getAdherenceOverview` | `route/caregiver.route.js` |

## 11. Caregiver — Profile Tab

Same endpoints as Patient My Profile section (`/user/profile`, `/user/change-password`, etc.) — the `role` on the logged-in user determines whether the "My Caregivers" or "My Patients" data is relevant.

---

## 12. Web Admin Dashboard

| Figma Screen element | Endpoint | Controller | Route file |
|---|---|---|---|
| Dashboard (Total Users / Active Patients / Active Caregivers / Avg Adherence stat cards, Adherence bar chart, User Growth chart) | `GET /admin/dashboard` | `admin.controller.getDashboardStats` | `route/admin.route.js` |
| Dashboard bottom table / All Users page (list, paginated) | `GET /admin/users?page=&limit=&role=&status=&search=` | `admin.controller.getAllUsers` | `route/admin.route.js` |
| All Users → "eye" icon (User Profile modal: age, joined, last active, adherence, caregiver, medical conditions) | `GET /admin/users/:id` | `admin.controller.getUserById` | `route/admin.route.js` |
| All Users → "check" icon (Active/Inactive toggle) | `PATCH /admin/users/:id/toggle-status` | `admin.controller.toggleUserStatus` | `route/admin.route.js` |
| All Users → "trash" icon → Confirm Action → Delete | `DELETE /admin/users/:id` | `admin.controller.deleteUser` | `route/admin.route.js` |
| Interactions page (Drug Interaction Checker list, High/Moderate/Low) | `GET /interaction?severity=&search=` | `interaction.controller.getAllInteractions` | `route/interaction.route.js` |
| Interactions → add new pair | `POST /interaction` | `interaction.controller.createInteraction` | `route/interaction.route.js` |
| Interactions → pencil icon → "Edit Drug Interaction" modal → Save Changes | `PUT /interaction/:id` | `interaction.controller.updateInteraction` | `route/interaction.route.js` |
| Interactions → trash icon → "Delete Interaction" confirm | `DELETE /interaction/:id` | `interaction.controller.deleteInteraction` | `route/interaction.route.js` |
| Setting → Personal Information / Change Password | `PUT /user/profile`, `PUT /user/change-password` | `user.controller` | `route/user.route.js` |
| Log out confirm | `POST /auth/logout` | `auth.controller.logout` | `route/auth.route.js` |

---

## Notes

- **Roles**: `patient`, `caregiver` (mobile app), `admin` (web dashboard). Enforced via
  `protect` + `isPatient` / `isCaregiver` / `isAdmin` middleware (`middleware/auth.middleware.js`).
- **Dose auto-generation**: `utils/doseHelper.js` (`ensureTodayDoses`) creates today's dose
  entries for every active medication/time whenever Home, Today, or a caregiver's patient
  view is loaded — so the "Today's Schedule" always reflects current active medications
  without a separate cron step. `autoMarkMissed` flags pending doses over 1 hour past their
  scheduled time as "missed".
- **Caregiver notifications**: whenever a patient taps Take/Skip (`dose.controller`), a
  `Notification` document is created for every linked caregiver whose notify-toggle for that
  event type is on — this is what powers the Alerts/Notifications tab and the "Mom has taken
  Metformin 500mg" style messages.
- **Seed data**: `npm run seed` populates the exact interaction pairs shown in the Figma
  Interaction Checker / Admin Interactions screens, plus a default admin account
  (`admin@safemedrx.com` / `Admin@123`).
