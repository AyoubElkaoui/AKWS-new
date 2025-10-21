# Deployment Instructies - Contactformulier Fix

## Wat is er gefixed in de code:
✅ reCAPTCHA v3 integratie verbeterd met robuuste error handling
✅ Server-side verificatie gebruikt URLSearchParams voor correcte Google API calls
✅ Resend API key validatie toegevoegd
✅ Client-side site key wordt correct geïnjecteerd via environment variables
✅ Uitgebreide logging voor debugging

## Verplichte stappen in Vercel (doe dit NU):

### 1. Controleer Environment Variables
Ga naar: **Vercel → Project → Settings → Environment Variables**

Zorg dat deze EXACT zo staan (let op hoofdletters/spaties):

```
PUBLIC_RECAPTCHA_SITE_KEY = 6Lfg5fErAAAAAFNB6fEZq1TBrAKH1zysHKXVhCZv
RECAPTCHA_SECRET_KEY = 6Lfg5fErAAAAABsG4FVv3gI557TCpI2CdZuW08HO
RESEND_API_KEY = <jouw_resend_api_key_hier>
```

**Belangrijk voor RESEND_API_KEY:**
- Ga naar https://resend.com/api-keys
- Kies de juiste API key (moet Full Access hebben)
- Kopieer de VOLLEDIGE key (begint meestal met `re_...`)
- Plak exact in Vercel (geen spaties voor/na)

### 2. Check welke environments
Zet alle 3 de keys voor:
- ✅ Production
- ✅ Preview (optioneel maar aanbevolen)
- ✅ Development (optioneel)

### 3. Redeploy
Na het instellen/wijzigen van environment variables:
- Vercel → Deployments → kies laatste deployment
- Klik "..." → **Redeploy**
- OF: push een nieuwe commit (deze instructies file triggert automatisch een deploy)

### 4. Test het formulier
Na redeploy (wacht 1-2 minuten):
1. Ga naar je live site: https://akwebsolutions.nl/contact
2. Open DevTools (F12) → Console tab
3. Vul het formulier in en verstuur
4. Check Console voor errors
5. Check Network tab → `/api/contact` response

### 5. Check Vercel Logs als het nog niet werkt
Vercel → Deployments → Functions tab → Logs

Zoek naar deze log-regels:
- `reCAPTCHA verification response:` — toont success/score/error-codes
- `Resend API error:` — als mail niet werkt
- `RECAPTCHA_SECRET_KEY is not set` — als secret ontbreekt
- `RESEND_API_KEY is not set` — als resend key ontbreekt

## Veelvoorkomende problemen:

### Resend geeft 401 "API key is invalid"
- Key is verkeerd gekopieerd (spaties/enters mee gekopieerd)
- Key is verlopen/geroteerd
- Key heeft niet de juiste permissions (moet "Full Access" of "Sending Access" zijn)
**Fix:** Maak een nieuwe API key in Resend dashboard en update in Vercel

### reCAPTCHA geeft "invalid-input-response"
- Client en server keys komen niet van dezelfde reCAPTCHA property
- Domain (akwebsolutions.nl) niet toegevoegd in Google reCAPTCHA console
**Fix:** Controleer in https://www.google.com/recaptcha/admin dat:
  - Site key en Secret key bij dezelfde property horen
  - Domains bevat: `akwebsolutions.nl` en `www.akwebsolutions.nl`

### Script geblokkeerd door adblocker
- Console toont: "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT"
- Dit is normaal voor gebruikers met adblockers
**Fix:** Test in incognito zonder extensies, of voeg fallback UX toe (mail-knop)

## Support
Als het na deze stappen nog niet werkt:
1. Check Vercel logs en kopieer de error-regels
2. Test in incognito (zonder browser extensies)
3. Controleer of alle 3 de environment variables exact kloppen
