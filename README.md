# SafeMed Rx - Backend API

Backend for the SafeMed Rx medication adherence & safety app (Figma design), built in the
same style/conventions as the provided reference codebase (Express 5 + Mongoose, `catchAsync`
+ `AppError` + `sendResponse` pattern, JWT auth, role-based middleware).

## Setup

```bash
npm install
cp .env.example .env   # fill in MONGO_DB_URL, JWT secrets, email creds
npm run dev             # nodemon
# or
npm start
```

Optional: seed drug-interaction reference data + a default admin account
(`admin@safemedrx.com` / `Admin@123`):

```bash
npm run seed
```

## Roles
- `patient` – mobile app (Patient flows)
- `caregiver` – mobile app (Caregiver flows)
- `admin` – web dashboard

## Base URL
`http://localhost:5000/api/v1`

See `API_MAPPING.md` for the full screen -> endpoint -> controller -> route mapping,
and `SafeMedRx.postman_collection.json` for a ready-to-import Postman collection.
