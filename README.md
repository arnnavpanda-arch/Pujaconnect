# ॐ PujaConnect

Vedic ritual booking platform connecting devotees with verified Pandits across India.

**Stack:** Node.js + Express, MongoDB Atlas (Mongoose), Nodemailer (Gmail SMTP), vanilla HTML/CSS/JS SPA. Runs locally with `node server.js` or on Vercel via `api/index.js`.

## Run locally

```bash
npm install
npm start        # http://localhost:5000
```

Configuration lives in `.env` (see `.env.example` for the keys).

## First run

On the first database connection the app seeds:

- a **Super Admin** account — `admin@pujaconnect.com` / `admin123` (override with `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- the puja catalog (Satyanarayan, Griha Pravesh, Rudrabhishek, Ganesh, Chandi Path, Bhagavat Katha)
- three **demo Pandits** (`*.demo@example.com`) so the directory isn't empty — delete them from MongoDB before going live

**Logins**

| Role | Email | Password |
|------|-------|----------|
| Devotee | their registered email | their password |
| Admin | `ADMIN_EMAIL` | `ADMIN_PASSWORD` |
| Pandit | registered email | registered phone number |

Pandits must be approved in the Admin dashboard (KYC review) before they appear in the directory.

## Deploy to Vercel

1. Push the folder to GitHub and import it in Vercel.
2. Add the variables from `.env` under *Project → Settings → Environment Variables* (plus `ADMIN_PASSWORD`).
3. In MongoDB Atlas → Network Access, allow Vercel's IPs (or `0.0.0.0/0`).

`vercel.json` routes `/api/*` to the serverless function; `public/` is served statically.

## Structure

```
server.js          local entry (app.listen)
app.js             Express app + all API routes
api/index.js       Vercel serverless entry
lib/models.js      Mongoose schemas
lib/db.js          cached connection + seed data
lib/mailer.js      Nodemailer + email templates
public/            SPA (index.html, style.css, app.js)
```

## API summary

`GET /api/ping`, `GET /api/health`, `POST /api/auth/register|login`, `GET /api/users` (admin), `GET /api/pandits`, `POST /api/pandits/register`, `PUT /api/pandits/:id[/status]`, `GET|POST /api/bookings`, `PUT /api/bookings/:id/status|reschedule`, `GET|POST /api/long-puja-requests`, `PUT /api/long-puja-requests/:id/assign`, `GET|POST|DELETE /api/pujas`, `POST /api/send-email`.

## Security notes

- Never commit `.env` (it's in `.gitignore`). The Atlas password and Gmail app password were pasted into a design document, so **rotate them** before deploying publicly.
- Change `JWT_SECRET` and `ADMIN_PASSWORD` for production.
- The advance-payment option is a demo flag only; no payment gateway is integrated.
