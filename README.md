# NetDiscover — Postal Quality Maturity Assessment

## Environment Variables

Create a `.env` file in the project root with:

```
VITE_SUPABASE_URL=https://yeyucjhnyeyurcrunqex.supabase.co
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
VITE_OPENAI_API_KEY=<your_openai_api_key>
```

## Setup

1. Run the SQL schema in Supabase Dashboard (SQL Editor): `supabase-schema.sql`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Build for production: `npm run build`

## Netlify Deploy

Upload the `dist/` folder to Netlify after running `npm run build`.
