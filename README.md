# Blood Bank Management System

Node.js + Express + SQLite backend, vanilla HTML/CSS/JS frontend.

## Run
```bash
npm install
npm start
# open http://localhost:3000   (login: admin / admin123)
```
Requires Node.js 18+. Set `JWT_SECRET` and `PORT` as environment variables in production.

## Database
- `bloodbank.db` — ready-made SQLite database with sample data (10 donors, stock, 4 requests). The admin user (admin / admin123) is created automatically on first start.
- `database/schema.sql` — table definitions (users, donors, blood_units, requests)
- `database/sample-data.sql` — demo data (dates are relative to today)
- `npm run seed` — deletes and rebuilds `bloodbank.db` from the two files above
- Start with an empty database: delete `bloodbank.db`; the server creates the tables itself.

## Features
- Admin login (JWT), change password
- Donors: add / edit / delete / search / filter by blood group
- Donations: record a donation, auto stock update, 90-day eligibility check
- Stock: live level per blood group, 35-day expiry, discard expired units
- Requests: create, approve (FIFO deduction from stock), reject
- Dashboard: stock, donors, pending requests, units expiring within 7 days

## API (all except login need `Authorization: Bearer <token>`)
| Method | Path | Purpose |
|---|---|---|
| POST | /api/auth/login | Sign in |
| POST | /api/auth/password | Change password |
| GET | /api/dashboard | Summary numbers |
| GET/POST | /api/donors | List (`?q=&group=`) / create |
| PUT/DELETE | /api/donors/:id | Update / delete |
| GET/POST | /api/donations | Log / record donation |
| DELETE | /api/donations/expired | Discard expired |
| GET/POST | /api/requests | List (`?status=`) / create |
| POST | /api/requests/:id/approve | Approve, deduct stock |
| POST | /api/requests/:id/reject | Reject |
