# Apple signing certificates

To produce an installable `.pkpass`, put these three PEM files here:

| File | Source |
|------|--------|
| `signerCert.pem` | Pass Type ID certificate from [Apple Developer](https://developer.apple.com/account/resources/identifiers/list/passTypeId) |
| `signerKey.pem` | Private key from the CSR you used to create that certificate |
| `wwdr.pem` | Apple Worldwide Developer Relations Intermediate Certificate (G4) — [download](https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer) then convert to PEM |

Also edit `../pass.json`:

- `passTypeIdentifier` → your Pass Type ID (e.g. `pass.com.yourcompany.acceso`)
- `teamIdentifier` → your 10-character Team ID

Then from `vorpc-wallet-pass/`:

```bash
npm install
npm run build
```

Optional passphrase:

```bash
PASS_KEY_PASSPHRASE='your-key-password' npm run build
```

## Export tips (macOS Keychain)

1. Create a Pass Type ID in the Apple Developer portal.
2. Create a certificate for it, download, and double-click to install in Keychain.
3. Export the cert + private key as `.p12`.
4. Convert:

```bash
openssl pkcs12 -in pass.p12 -clcerts -nokeys -out signerCert.pem
openssl pkcs12 -in pass.p12 -nocerts -nodes -out signerKey.pem
openssl x509 -inform DER -in AppleWWDRCAG4.cer -out wwdr.pem
```
