# Climbing gym site + email backend

- `public/index.html` – the website (edit the `G` config near the bottom: name, address, prices, hours)
- `netlify/functions/register.mjs` – backend: receives the form, emails a styled message to you

## 1. Get an email API key (free, 3 min)
1. Sign up at https://resend.com **with maxriz2009@gmail.com** (the free test sender can only deliver to the account's own email).
2. API Keys → Create → copy the key (starts with `re_`).

## 2. Deploy (free, 5 min)
**Option A – GitHub:** push this folder to a GitHub repo → Netlify → Add new site → Import from Git → pick the repo → Deploy.
**Option B – CLI:** `npm i -g netlify-cli`, then in this folder: `netlify login`, `netlify init`, `netlify deploy --prod`.
(Dragging the folder into Netlify Drop does NOT run functions.)

## 3. Set environment variables
Netlify → Site configuration → Environment variables:
- `RESEND_API_KEY` = your `re_...` key
- `TO_EMAIL` = maxriz2009@gmail.com
- `GYM_NAME` = your gym's name (optional)
- `FROM_EMAIL` = optional, only after you verify your own domain in Resend

Then redeploy (Deploys → Trigger deploy). Submit the form on your live site to test.

## Notes
- Emails have a Reply button, and Reply-To is the visitor's address.
- Spam protection: hidden honeypot field + server-side validation. Add Cloudflare Turnstile later if you get abuse.
- Emailing a confirmation to the visitor needs a verified domain in Resend.
