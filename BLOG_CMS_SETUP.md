# Blog Beheer met Headless CMS

Deze website heeft een blog systeem met **Astro Content Collections**. Je kunt nu kiezen voor een van deze headless CMS oplossingen om gemakkelijk nieuwe blog posts toe te voegen via een visuele interface.

## Optie 1: Decap CMS (Voorheen Netlify CMS) - GRATIS

**Voordelen:**
- ✅ Volledig gratis
- ✅ Git-based (alles blijft in je repository)
- ✅ Werkt met GitHub, GitLab, Bitbucket
- ✅ Eenvoudige interface
- ✅ Live preview

**Setup (5 minuten):**

### Stap 1: Installeer Decap CMS

```bash
npm install netlify-cms-app
```

### Stap 2: Maak admin interface

Maak `public/admin/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blog Admin</title>
</head>
<body>
  <script src="https://unpkg.com/netlify-cms@^2.0.0/dist/netlify-cms.js"></script>
</body>
</html>
```

### Stap 3: Configureer CMS

Maak `public/admin/config.yml`:

```yaml
backend:
  name: git-gateway
  branch: master

media_folder: "public/images/blog"
public_folder: "/images/blog"

collections:
  - name: "blog"
    label: "Blog Posts"
    folder: "src/content/blog"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Titel", name: "title", widget: "string" }
      - { label: "Beschrijving", name: "description", widget: "text" }
      - { label: "Publicatiedatum", name: "pubDate", widget: "datetime" }
      - { label: "Auteur", name: "author", widget: "string", default: "Ayoub Elkaoui" }
      - { label: "Tags", name: "tags", widget: "list" }
      - { label: "Uitgelicht", name: "featured", widget: "boolean", default: false }
      - { label: "Inhoud", name: "body", widget: "markdown" }
```

### Stap 4: GitHub OAuth Setup

1. Ga naar GitHub Settings → Developer settings → OAuth Apps
2. Maak nieuwe OAuth App:
   - Homepage URL: `https://jouwsite.nl`
   - Callback URL: `https://api.netlify.com/auth/done`
3. Kopieer Client ID en Secret

### Stap 5: Netlify Identity (als je Netlify hosting gebruikt)

1. Enable Identity in Netlify Dashboard
2. Enable Git Gateway in Identity settings
3. Ga naar `jouwsite.nl/admin` om in te loggen

**Alternatief zonder Netlify:** Gebruik [Decap CMS met GitHub Backend](https://decapcms.org/docs/github-backend/)

---

## Optie 2: Keystatic - GRATIS & MODERN

**Voordelen:**
- ✅ Volledig gratis
- ✅ Moderne UI (beste gebruikerservaring)
- ✅ Werkt lokaal én online
- ✅ TypeScript support
- ✅ Built for Astro

**Setup (10 minuten):**

### Stap 1: Installeer Keystatic

```bash
npm install @keystatic/core @keystatic/astro
```

### Stap 2: Update astro.config.mjs

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

export default defineConfig({
  integrations: [
    react(),
    keystatic()
  ],
});
```

### Stap 3: Maak Keystatic config

Maak `keystatic.config.ts` in root:

```typescript
import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'jouwgithub/AKWS-new',
  },
  collections: {
    blog: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Titel' } }),
        description: fields.text({ 
          label: 'Beschrijving',
          multiline: true 
        }),
        pubDate: fields.date({ 
          label: 'Publicatiedatum',
          defaultValue: { kind: 'today' }
        }),
        author: fields.text({ 
          label: 'Auteur',
          defaultValue: 'Ayoub Elkaoui'
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { label: 'Tags', itemLabel: props => props.value }
        ),
        featured: fields.checkbox({ 
          label: 'Uitgelicht',
          defaultValue: false
        }),
        content: fields.document({
          label: 'Inhoud',
          formatting: true,
          dividers: true,
          links: true,
          images: true,
        }),
      },
    }),
  },
});
```

### Stap 4: Gebruik Keystatic

**Lokaal:**
```bash
npm run dev
```
Ga naar `http://localhost:4321/keystatic`

**Online:**
Ga naar `jouwsite.nl/keystatic`

---

## Optie 3: Sanity CMS - BETAALD (Gratis tier beschikbaar)

**Voordelen:**
- ✅ Krachtigste optie
- ✅ Real-time collaboration
- ✅ Media management
- ✅ Gratis tier: 10.000 docs, 1GB assets

**Nadelen:**
- ⚠️ Complexere setup
- ⚠️ Betaald na gratis tier

**Setup (20 minuten):**

```bash
npm install @sanity/client
npm install -g @sanity/cli
sanity init
```

Volg de wizard en koppel aan je project.

---

## Aanbeveling

**Voor jouw situatie:**

### 🏆 Beste keuze: **Keystatic**

**Waarom:**
- Moderne, intuïtieve interface
- Werkt perfect met Astro
- Gratis en open source
- Kan lokaal én online
- Markdown preview
- TypeScript support

### Alternatief: **Decap CMS**

Als je al Netlify hosting gebruikt of een simpelere setup wilt.

---

## Nieuwe Blog Post Toevoegen

### Met Keystatic:
1. Ga naar `jouwsite.nl/keystatic`
2. Klik "Create Blog Post"
3. Vul titel, beschrijving, tags in
4. Schrijf content in markdown editor
5. Klik "Save" → automatisch commit naar GitHub

### Met Decap CMS:
1. Ga naar `jouwsite.nl/admin`
2. Klik "New Blog Post"
3. Vul velden in
4. Publish → automatisch commit

### Handmatig (zonder CMS):
1. Maak nieuw bestand in `src/content/blog/nieuwe-post.md`
2. Voeg frontmatter toe:
```yaml
---
title: "Jouw Titel"
description: "Jouw beschrijving"
pubDate: 2025-03-01T09:00:00Z
author: "Ayoub Elkaoui"
tags: ["Tag1", "Tag2"]
featured: false
---
```
3. Schrijf content in Markdown
4. Commit en push naar GitHub
5. Site bouwt automatisch opnieuw

---

## Blog Post Template

Gebruik dit als basis voor nieuwe posts:

```markdown
---
title: "Jouw Pakkende Titel Hier"
description: "Een korte samenvatting van 120-160 karakters voor SEO"
pubDate: 2025-03-01T09:00:00Z
author: "Ayoub Elkaoui"
tags: ["SEO", "Webdesign", "Tips"]
featured: false
---

# Hoofdtitel

Introductie paragraaf die de lezer grijpt.

## Subtitel 1

Content hier...

### Subkopje

Meer content...

**Bold tekst** en *italic tekst*.

- Bullet point 1
- Bullet point 2
- Bullet point 3

## Conclusie

Slotparagraaf met call-to-action.
```

---

## SEO Tips voor Blog Posts

✅ **Titel:** 50-60 karakters, keyword vooraan  
✅ **Beschrijving:** 120-160 karakters, engaging  
✅ **Tags:** 3-5 relevante tags  
✅ **Content:** Minimaal 1000 woorden voor goede SEO  
✅ **Structuur:** Gebruik H2, H3, lijsten, bold  
✅ **Links:** Link naar relevante interne paginas  
✅ **Featured:** Markeer beste artikelen als featured  

---

## Vragen?

Neem contact op als je hulp nodig hebt met de CMS setup!
