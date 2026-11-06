# Printshop

Next.js (App Router) + Tailwind v4. Quote calculator, cart, file upload, and order placement.

## Run locally
    npm install
    cp .env.example .env         # fill in the values (Prisma and Next.js both read .env)
    npm run db:push              # creates the tables
    npm run dev

## Set up on Vercel
1. Push to GitHub and import the repo in Vercel.
2. In the project's Storage tab, create a **Prisma Postgres** database and a **Blob** store and connect both. This sets `PRISMA_DATABASE_URL` and `BLOB_READ_WRITE_TOKEN`. If the integration offers a custom env var prefix, leave it empty so the name stays `PRISMA_DATABASE_URL`.
3. Locally: `vercel env pull .env`, then `npm run db:push` once.

## Where things are
- `src/lib/catalog.ts`   starting products (copied into the database on first load)
- `src/lib/catalog-db.ts` reads products from the database
- `src/lib/quote.ts`     pricing engine (browser and server)
- `src/lib/cart.tsx`     cart state (saved in the browser)
- `src/app/cart`         cart, file upload, customer details
- `src/app/api/orders`   validates, re-prices, and saves the order
- `src/app/api/upload`   issues Vercel Blob upload tokens
- `src/config.ts`        shop name, order prefix, flat delivery fee

## Notes
- Uploaded files use unguessable public links. Anyone with the link can open the file.
- Payment is manual. Set your GCash, Maya and bank details in `src/config.ts` (they are placeholders now).
- Order flow: RECEIVED, then PAYMENT_SUBMITTED when the customer sends a reference number, then you verify and set PAID.
- After pulling this update, run `npm run db:push` again (the schema gained payment fields).
- PayMongo and customer emails come later.

## Products and prices
Edit them in `/admin/products`: name, base price, setup fee, minimum order, quantity buttons, bulk discounts, and option
groups. Changes show on the site right away, and the server always prices orders from the current database values.
Products can be hidden but not deleted, so old orders keep working. Each order stores its own option labels.
After pulling this update, run `npm run db:push` again.

## Custom quote requests
`/custom-quote` is a public form (name, contact, description, up to 5 files). Requests land in `/admin/quotes`,
where you open the files, reply by email or phone, and mark them Replied or Closed. A hidden honeypot field
filters out most bots. You also get an owner email if Resend is set up.

## Admin
Open `/admin` and log in with `ADMIN_PASSWORD`. Set these in `.env` and in Vercel:
- `ADMIN_PASSWORD`: the password you'll log in with
- `ADMIN_SESSION_SECRET`: any long random string (16+ characters), for example from `openssl rand -hex 32`

The admin lists orders by stage, shows files, customer details, and payment info, and moves orders through
Confirm payment, Printing, Ready, Shipped, Completed. Reject payment sends the order back so the customer can resubmit.

Optional owner emails for new orders and payment submissions (via Resend):
- `RESEND_API_KEY` and `ADMIN_EMAIL`. With the default sender (`onboarding@resend.dev`), Resend only delivers to the email you signed up with.
- `NOTIFY_FROM` (once you verify a domain) and `SITE_URL` (for links in the email) are optional.
