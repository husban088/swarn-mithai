# Swarn — Mithai & Aqua Ecommerce (React + Tailwind + Node + Supabase + Nodemailer)

- USA se open ho to: sirf **Mithai**, prices **USD** me.
- Pakistan se open ho to: **Mithai + Aqua Water**, prices **PKR** me.
- Country IP se automatically detect hoti hai (VPN ke saath bhi). Tab focus par aur har 20 sec baad dobara check hota hai, to VPN badalne par page refresh kiye baghair update ho jata hai.

## Setup (sirf ek baar)

### 1) Supabase
1. https://supabase.com par naya project banayein.
2. **SQL Editor -> New query** me `supabase/schema.sql` ki poori file paste karke **Run** karein.
   (Tables `products`, `orders`, image bucket `products` aur 10 sample products ban jayenge.)
3. **Project Settings -> API** se `Project URL`, `anon public` key aur `service_role` key copy karein.
4. **Authentication -> Providers -> Email** me "Confirm email" ON ho ya OFF, dono theek hain (server khud confirmed user banata hai).

### 2) Environment file
`server/.env.example` ko copy karke `server/.env` banayein aur values bharein:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS` = aapki admin email (isi email se signup karein, Admin panel khul jayega)
- `SMTP_USER`, `SMTP_PASS` = Gmail + **App Password** (Google Account -> Security -> 2-Step -> App passwords)

### 3) Run
```
npm run setup     # sab dependencies install
npm run dev       # server (5000) + website (5173)
```
Browser: http://localhost:5173

Production ke liye: `npm start` (build karke poori site http://localhost:5000 par serve karta hai).

## Test karna
- VPN se Pakistan select karein -> Mithai + Aqua, Rs prices.
- VPN se USA select karein -> sirf Mithai, $ prices.
- VPN ke baghair test: `http://localhost:5173/?country=PK` ya `?country=US`.

## Admin
Admin email se signup/signin -> navbar me **Admin** -> Products (Add / Edit / Delete, image upload) aur Orders (status change).
- Mithai: USD + PKR dono price do. Aqua: sirf PKR (USA me nahi dikhta).

## Customize
`client/src/config.js` me brand name, phone, email, taglines badal sakte hain.
