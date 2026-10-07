# VORPC → Apple Wallet

Digital **Acceso y Fichaje** pass for **Yasser Gnabou** (Marketplace Manager), barcode `MCSQZMADQWT6`.

## What’s included

| Path | Purpose |
|------|---------|
| `pass.json` | Apple Wallet pass definition |
| `assets/` | Logo, icons, photo thumbnail (from your badge) |
| `scripts/build-pass.mjs` | Builds `.pkpass` |
| `public/badge.html` | Phone-ready badge with the same Code128 barcode |
| `certs/` | Place Apple signing PEMs here |

## Add to Apple Wallet (real `.pkpass`)

**Read first:** [APPLE_WALLET.md](./APPLE_WALLET.md) — why unsigned files won’t install, and three ways to get a real Wallet card.

Apple only accepts **signed** passes. You need an [Apple Developer](https://developer.apple.com) account (or VORPC’s corporate signer) and a **Pass Type ID** certificate.

1. Put `signerCert.pem`, `signerKey.pem`, and `wwdr.pem` in `certs/` (see `certs/README.md`).
2. Update `passTypeIdentifier` and `teamIdentifier` in `pass.json`.
3. Build:

```bash
cd vorpc-wallet-pass
npm install
npm run build
```

4. Open `dist/VORPC-Yasser-Gnabou.pkpass` on your iPhone (AirDrop, Mail, or Messages) → **Add**.

Without certificates:

```bash
npm run build:unsigned
```

creates `dist/VORPC-Yasser-Gnabou.unsigned.pkpass` for packaging checks only — it will **not** install in Wallet.

## Use the badge on your iPhone right now

Until the pass is signed:

```bash
cd vorpc-wallet-pass
npm run serve
```

Open the printed URL on your iPhone, then **Share → Add to Home Screen**. The barcode matches your physical/PDF card (`MCSQZMADQWT6`).

## Pass fields

- Organization: VORPC  
- Type: Generic (employee / access badge)  
- Name: Yasser Gnabou  
- Title: Marketplace Manager  
- Label: EMPLEADO  
- Barcode: Code128 → `MCSQZMADQWT6`
