# NetDiscover — Project TODO

## Phase 2: Database Schema & Global Styles
- [x] Extend drizzle/schema.ts with all tables (users, phases, questions, assessments, answers, actionProgress, benchmarkSnapshots, marketProviders, providerContacts)
- [x] Seed maturity model data (7 phases, 35 questions) via seed.ts script
- [x] Configure global design system (UPU-inspired navy + cyan, Inter font) in index.css
- [x] Install recharts, jspdf dependencies

## Phase 3: Auth, Landing & Assessment Wizard
- [x] Landing page with hero, phases, features, stats, CTA
- [x] Login/logout with Manus OAuth session management
- [x] Assessment wizard: step-by-step 7 phases, 5 questions each
- [x] Auto-save progress (partial completion via saveAnswer mutation)
- [x] Progress indicator with phase dots and percentage
- [x] Question types: yes/no, scale 1-5, multiple choice
- [x] Dashboard page with assessment history and navigation hub

## Phase 4: Scoring Engine & Dashboard
- [x] Scoring algorithm: weighted 0-100% per phase and global
- [x] Gap identification: top 3 critical gaps
- [x] Action plan generator: 7 prioritized recommendations by phase gap
- [x] Results dashboard with radar chart (recharts)
- [x] 3-horizon roadmap (short/medium/long term) in results
- [x] Benchmark comparison: user vs regional average per phase
- [x] Benchmark page with radar + bar charts and phase breakdown table

## Phase 5: Market, Admin & Progress Tracking
- [x] Market catalog: providers/solutions by maturity phase with category/phase filters
- [x] Provider contact form (sends lead profile with assessment context)
- [x] Admin panel: stats cards, users table, leads table, CSV export
- [x] Admin: benchmark recomputation trigger
- [x] Progress tracking: active action plan checklist with completion toggle
- [x] Personal notes per action
- [x] Re-assessment CTA when 50%+ actions completed
- [x] Profile page: organization data (country, entity type, job title, language)

## Phase 6: PDF Reports, i18n & Tests
- [ ] PDF report generation (assessment results + action plan + benchmark)
- [ ] i18n: Spanish/English toggle in header
- [ ] Auto-detect browser language
- [x] Vitest unit tests for auth, scoring, admin access control (6 tests passing)

## Completed
- [x] Project initialized with web-db-user scaffold
- [x] Read and analyzed maturity model document (7 phases, 105 questions)
- [x] All routes registered in App.tsx
- [x] tRPC routers: model, assessment, progress, benchmark, market, admin, user
- [x] TypeScript: 0 errors
- [x] Tests: 6/6 passing

## Redesign v2 — ONE/UPU Style + Minimalista
- [x] CSS global: sistema de diseño ONE/UPU (navy #0A2240, rojo #E63329, blanco, Inter)
- [x] Home: intro del proyecto + explicación del benchmark + CTA minimalista con logos UPU/ONE
- [x] Assessment: wizard en pestañas tipo evolución, minimalista, retorno al punto dejado
- [x] Results: evaluación del estado + formulario de captura (nombre, institución, email) + promesa de benchmark por email
- [x] Dashboard, Market, Progress, Admin: adaptar al nuevo sistema de diseño
- [x] Lógica de envío de benchmark por email (notificación al owner + datos del lead)
- [x] Guardado de progreso con email: modal al intentar salir del wizard con respuestas sin completar
- [x] Sesiones anónimas: tabla guestSessions en BD (email, token, respuestas parciales, fase actual)
- [x] Link de retoma: al dar email se genera token único, se envía link por email para continuar exactamente donde se dejó
- [x] Detección de retoma: al entrar al wizard con token en URL, restaura todas las respuestas y fase activa

## Mejoras v3

- [x] Multi-selección en preguntas barrera con instrucción clara "Select all that apply"
- [x] Indicador visual de fin de sección antes de pasar a la siguiente
- [x] Tabs de sección siempre centrados en la sección activa (scroll automático)
- [x] Resultados mostrados en pantalla directamente tras rellenar datos de contacto (sin email)
- [x] Acceso persistente al reporte: guardar resultados en localStorage para re-acceder

## Bug fixes

- [x] React error #310: useEffect loop en Assessment cuando hay resultados guardados en localStorage
- [x] Flujo: si el usuario ya completó la encuesta, redirigir a /results directamente desde Assessment

## Motor LLM + PDFs v4

- [x] Motor LLM: análisis técnico profundo (7 fases, plan de acción, roadmap narrativo)
- [x] Motor LLM: plan comercial (pains del regulador, value proposition, propuesta de solución)
- [x] PDF técnico: portada ONE/UPU, radar, barras por fase, roadmap visual, plan de acción
- [x] PDF comercial: portada, pains identificados, value proposition personalizada, propuesta de solución
- [x] Formulario de registro: solo Regulator / Designated Operator
- [x] Results.tsx: integrar LLM, mostrar análisis en pantalla, dos botones de descarga PDF

## Bug fixes v4

- [x] Bug: /results se queda bloqueado en "Preparing your results…" sin avanzar
- [x] Bug: condición de carrera en Results.tsx — "Preparing your results…" se queda bloqueado indefinidamente
- [x] Feature: pantalla de acceso en /results cuando no hay datos — opción de iniciar encuesta o recuperar resultados por email
- [x] Feature: integrar en Home.tsx las opciones de acceso (iniciar encuesta + recuperar resultados por email), eliminando la pantalla intermedia de /results
- [x] UX: rediseñar hero con CTA principal "Start your assessment" + sección "Access your evaluation" con campo email debajo + botón "Access your assessment" en cabecera
- [ ] Bug crítico: los botones de descarga de PDF no funcionan en la página de resultados
- [ ] Bug: texto del header de resultados ilegible (gris sobre navy) — poner en blanco
- [ ] Bug: errores TypeScript en handlers de descarga PDF (campos Action/Gap incorrectos + duplicate declaration)
- [ ] Feature: sección colapsable "View my answers" en el dashboard de resultados
- [ ] Bug: logo ONE for Regulators demasiado pequeño en el header de resultados — aumentar tamaño
