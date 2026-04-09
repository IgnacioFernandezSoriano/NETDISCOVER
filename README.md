# NetDiscover — Postal Quality Maturity Assessment

Plataforma de evaluación de madurez regulatoria postal para la UPU/ONE.

---

## Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + RLS)
- **Hosting:** Netlify (CI/CD automático desde GitHub)
- **LLM:** OpenAI via Netlify Function

---

## 1. Base de datos Supabase

1. Ve a **Supabase Dashboard → SQL Editor**
2. Copia y pega el contenido de `supabase/supabase-schema.sql`
3. Haz clic en **Run**

Esto crea todas las tablas, activa RLS y carga los datos iniciales.

---

## 2. Variables de entorno

**Desarrollo local** — crea `.env` en la raíz:

```
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

> El `anon key` está en **Supabase Dashboard → Project Settings → API → anon public**.

**Netlify** — añade en **Site → Site configuration → Environment variables**:

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase (seguro en frontend) |
| `OPENAI_API_KEY` | API key de OpenAI (opcional, para análisis LLM) |

> **Seguridad:** El `anon key` es seguro en el frontend — la protección real la proveen las políticas RLS del schema SQL. El `service_role` **nunca** debe usarse en el frontend.

---

## 3. Desarrollo local

```bash
npm install
npm run dev
```

---

## 4. Nota: Netlify Secrets Scanning y VITE_SUPABASE_ANON_KEY

Vite embebe en el bundle JS todas las variables con prefijo `VITE_`, incluida `VITE_SUPABASE_ANON_KEY`. Netlify detecta esto y falla el build con:

```
Secret env var "VITE_SUPABASE_ANON_KEY"'s value detected in dist/assets/index-*.js
```

**Esto es comportamiento esperado y seguro.** El `anon key` de Supabase está diseñado para ser público — no otorga acceso privilegiado. La seguridad real la proveen las políticas **RLS** (Row Level Security) configuradas en el schema SQL.

La solución está en `netlify.toml`:

```toml
[build.environment]
  SECRETS_SCAN_OMIT_KEYS = "VITE_SUPABASE_ANON_KEY"
```

Esto le dice a Netlify que omita esa clave del escaneo. **Nunca** añadir `VITE_SUPABASE_SERVICE_ROLE_KEY` ni similares — esas sí son secretas y nunca deben ir al frontend.

---

## 5. Despliegue en Netlify (CI/CD automático)

1. Conecta este repositorio GitHub en Netlify
2. Configura las variables de entorno (ver tabla arriba)
3. Netlify detecta el `netlify.toml` y hace el build automáticamente

**Build command:** `npm run build` | **Publish directory:** `dist`

---

## Estructura

```
src/
  pages/       ← Assessment, Results, Benchmark, Market, Admin, Home
  lib/         ← Cliente Supabase, motor de scoring
  hooks/       ← useAssessment
  components/  ← Navbar, Footer
nnetlify/functions/analyze.ts  ← Análisis LLM (OpenAI)
supabase/supabase-schema.sql   ← Schema + RLS + seed
```
