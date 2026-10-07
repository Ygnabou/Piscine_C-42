# Get this as a real Apple Wallet card

Apple **only** installs passes that are **cryptographically signed** by whoever owns the Pass Type ID (usually your company or an Apple Developer account). There is no way to turn your badge into Wallet without that signature — not with HTML, not with an unsigned `.pkpass`.

Your pass content is already built in this folder (`pass.json`, images, barcode `MCSQZMADQWT6`). What’s missing is **Apple’s signature**.

---

## Fastest path (recommended): ask VORPC

Your PDF says **“ACCESO Y FICHAJE”** — that system is usually run by **VORPC IT / HR**. They often already have:

- An Apple **Pass Type ID** (e.g. `pass.com.vorpc.…`)
- Signing certificates on their server

**Ask them:** *“Can you send my employee badge as an Apple Wallet pass (.pkpass) or enable Wallet in the acceso app?”*

If they generate passes from their platform, that card will work at doors/readers. A pass we sign with a **personal** Developer account might **not** match what their scanners expect.

---

## Path B: sign this project yourself (Mac + Apple Developer)

You need:

1. **Apple Developer Program** membership ([developer.apple.com](https://developer.apple.com)) — paid, tied to you or VORPC.
2. In the Developer portal:
   - Create a **Pass Type ID** (Identifiers → Pass Type IDs).
   - Create a **certificate** for that Pass Type ID (download `.cer`).
3. On a **Mac**, export or convert to PEM (see `certs/README.md`):
   - `signerCert.pem`
   - `signerKey.pem`
   - `wwdr.pem` (Apple WWDR G4)
4. Edit `pass.json`:
   - `passTypeIdentifier` → must **exactly** match the Pass Type ID you registered.
   - `teamIdentifier` → your 10-character **Team ID** (Membership details in Developer portal).
5. Build and install:

```bash
cd vorpc-wallet-pass
npm install
npm run build
```

6. Send `dist/VORPC-Yasser-Gnabou.pkpass` to your iPhone (AirDrop, Mail, WhatsApp, iCloud Drive).
7. Tap the file → **Add to Apple Wallet**.

---

## Path C: build on GitHub (download signed `.pkpass`)

If you have the three PEM files but no local Node setup:

1. Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
   - `APPLE_PASS_SIGNER_CERT` — full text of `signerCert.pem`
   - `APPLE_PASS_SIGNER_KEY` — full text of `signerKey.pem`
   - `APPLE_WWDR_CERT` — full text of `wwdr.pem`
   - `APPLE_TEAM_ID` — e.g. `AB12CD34EF`
   - `APPLE_PASS_TYPE_ID` — e.g. `pass.com.vorpc.acceso`
   - (optional) `APPLE_PASS_KEY_PASSPHRASE` if the key is encrypted
2. **Actions** → **Build VORPC Apple Wallet pass** → **Run workflow**.
3. When it finishes, open the run → **Artifacts** → download `VORPC-Yasser-Gnabou.pkpass`.
4. Open on iPhone → **Add to Apple Wallet**.

---

## What does **not** work

| Method | Result |
|--------|--------|
| Unsigned `.pkpass` | iPhone rejects it |
| HTML / “Add to Home Screen” | Looks like a card, **not** in Wallet |
| Third-party apps that “fake” Wallet | Often not the same as official PassKit; may not scan at work |

---

## If you share details (privately)

If VORPC gives you a **Pass Type ID**, **Team ID**, and signing certs (never post private keys in GitHub issues/chat), we can plug them into `pass.json` and produce the final installable file.
