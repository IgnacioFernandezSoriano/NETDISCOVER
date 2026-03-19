-- ============================================================
-- NetDiscover — Nuevas preguntas de Alcance de la Medición
-- Fase 0 (Contexto del Regulador), posiciones q0_6 y q0_7
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================
-- PREREQUISITO: El script update_questions.sql debe haberse
-- ejecutado previamente para que exista la fase 'phase0'.
-- ============================================================

-- ── PASO 1: Verificar que la tabla questions tiene columna text_ar / text_ru
-- Si no existen, añadirlas (idempotente)

ALTER TABLE questions ADD COLUMN IF NOT EXISTS text_ar TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS text_ru TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS text_fr TEXT;

-- ── PASO 2: Insertar pregunta q0_6 — Alcance de Productos ───
-- Tipo: multiple_choice (checkboxes, sin puntuación)

INSERT INTO questions (
  phase_id,
  slug,
  order_index,
  question_type,
  weight,
  text_es,
  text_en,
  text_fr,
  text_ar,
  text_ru,
  options_json
)
SELECT
  p.id,
  'q0_6',
  6,
  'multiple_choice',
  0,
  '¿Qué productos postales están incluidos actualmente en el sistema de medición de calidad de servicio?',
  'Which postal products are currently included in the quality of service measurement system?',
  'Quels produits postaux sont actuellement inclus dans le système de mesure de la qualité de service ?',
  'ما هي المنتجات البريدية المدرجة حاليًا في نظام قياس جودة الخدمة؟',
  'Какие почтовые продукты в настоящее время включены в систему измерения качества обслуживания?',
  '[
    {
      "value": "A",
      "label_es": "Cartas y pequeños paquetes (SPU)",
      "label_en": "Letters and small packets (USO)",
      "label_fr": "Lettres et petits paquets (SU)",
      "label_ar": "رسائل وطرود صغيرة (الخدمة الشاملة)",
      "label_ru": "Письма и мелкие пакеты (УУП)",
      "desc_es": "Productos incluidos en el Servicio Postal Universal.",
      "desc_en": "Products included in the Universal Postal Service.",
      "desc_fr": "Produits inclus dans le Service Postal Universel.",
      "desc_ar": "المنتجات المدرجة في الخدمة البريدية الشاملة.",
      "desc_ru": "Продукты, включенные в Универсальную почтовую службу."
    },
    {
      "value": "B",
      "label_es": "Paquetería (encomiendas)",
      "label_en": "Parcels",
      "label_fr": "Colis",
      "label_ar": "طرود",
      "label_ru": "Посылки",
      "desc_es": "Envíos de paquetes y encomiendas.",
      "desc_en": "Parcel and package shipments.",
      "desc_fr": "Envois de colis et paquets.",
      "desc_ar": "شحنات الطرود والحزم.",
      "desc_ru": "Посылки и бандероли."
    },
    {
      "value": "C",
      "label_es": "Correo Expreso (EMS)",
      "label_en": "Express Mail Service (EMS)",
      "label_fr": "Service de Courrier Express (EMS)",
      "label_ar": "خدمة البريد السريع (EMS)",
      "label_ru": "Служба экспресс-почты (EMS)",
      "desc_es": "Servicio de correo urgente nacional e internacional.",
      "desc_en": "National and international express mail service.",
      "desc_fr": "Service de courrier express national et international.",
      "desc_ar": "خدمة البريد السريع الوطني والدولي.",
      "desc_ru": "Национальная и международная служба экспресс-почты."
    },
    {
      "value": "D",
      "label_es": "Ninguno (aún no se mide)",
      "label_en": "None (not yet measured)",
      "label_fr": "Aucun (pas encore mesuré)",
      "label_ar": "لا شيء (لم يتم القياس بعد)",
      "label_ru": "Ничего (измерения еще не проводятся)",
      "desc_es": "No se ha implementado ningún sistema de medición.",
      "desc_en": "No measurement system has been implemented.",
      "desc_fr": "Aucun système de mesure n''a été mis en place.",
      "desc_ar": "لم يتم تطبيق أي نظام قياس.",
      "desc_ru": "Система измерений еще не внедрена."
    }
  ]'::jsonb
FROM phases p
WHERE p.slug = 'phase0'
ON CONFLICT (slug) DO UPDATE SET
  order_index   = EXCLUDED.order_index,
  question_type = EXCLUDED.question_type,
  weight        = EXCLUDED.weight,
  text_es       = EXCLUDED.text_es,
  text_en       = EXCLUDED.text_en,
  text_fr       = EXCLUDED.text_fr,
  text_ar       = EXCLUDED.text_ar,
  text_ru       = EXCLUDED.text_ru,
  options_json  = EXCLUDED.options_json;

-- ── PASO 3: Insertar pregunta q0_7 — Alcance de Operadores ──
-- Tipo: single_choice (radio buttons, sin puntuación)

INSERT INTO questions (
  phase_id,
  slug,
  order_index,
  question_type,
  weight,
  text_es,
  text_en,
  text_fr,
  text_ar,
  text_ru,
  options_json
)
SELECT
  p.id,
  'q0_7',
  7,
  'single_choice',
  0,
  '¿A qué operadores aplica el sistema de medición de calidad de servicio?',
  'To which operators does the quality of service measurement system apply?',
  'À quels opérateurs le système de mesure de la qualité de service s''applique-t-il ?',
  'على أي مشغلين ينطبق نظام قياس جودة الخدمة؟',
  'К каким операторам применяется система измерения качества обслуживания?',
  '[
    {
      "value": 1,
      "label_es": "Solo al Operador Designado (OD)",
      "label_en": "Only the Designated Operator (DO)",
      "label_fr": "Uniquement à l''Opérateur Désigné (OD)",
      "label_ar": "فقط على المشغل المعين (DO)",
      "label_ru": "Только к назначенному оператору (НО)",
      "desc_es": "El sistema de medición cubre exclusivamente al operador postal designado por el Estado.",
      "desc_en": "The measurement system covers exclusively the state-designated postal operator.",
      "desc_fr": "Le système de mesure couvre exclusivement l''opérateur postal désigné par l''État.",
      "desc_ar": "يغطي نظام القياس حصريًا المشغل البريدي المعين من قبل الدولة.",
      "desc_ru": "Система измерений охватывает исключительно государственного назначенного почтового оператора."
    },
    {
      "value": 2,
      "label_es": "Operador Designado y operadores privados",
      "label_en": "Designated Operator and private operators",
      "label_fr": "Opérateur Désigné et opérateurs privés",
      "label_ar": "المشغل المعين ومشغلون خواص",
      "label_ru": "Назначенный оператор и частные операторы",
      "desc_es": "El sistema mide tanto al operador designado como a otros operadores postales privados con presencia en el mercado.",
      "desc_en": "The system measures both the designated operator and other private postal operators active in the market.",
      "desc_fr": "Le système mesure à la fois l''opérateur désigné et d''autres opérateurs postaux privés actifs sur le marché.",
      "desc_ar": "يقيس النظام كلاً من المشغل المعين والمشغلين البريديين الخواص الآخرين النشطين في السوق.",
      "desc_ru": "Система измеряет как назначенного оператора, так и других частных почтовых операторов, работающих на рынке."
    },
    {
      "value": 3,
      "label_es": "Solo operadores postales privados",
      "label_en": "Only private postal operators",
      "label_fr": "Uniquement les opérateurs postaux privés",
      "label_ar": "فقط المشغلون البريديون الخواص",
      "label_ru": "Только частные почтовые операторы",
      "desc_es": "El sistema se aplica únicamente a operadores privados, sin incluir al operador designado.",
      "desc_en": "The system applies only to private operators, excluding the designated operator.",
      "desc_fr": "Le système s''applique uniquement aux opérateurs privés, à l''exclusion de l''opérateur désigné.",
      "desc_ar": "ينطبق النظام فقط على المشغلين الخواص، باستثناء المشغل المعين.",
      "desc_ru": "Система применяется только к частным операторам, исключая назначенного оператора."
    },
    {
      "value": 4,
      "label_es": "Aún no se ha definido",
      "label_en": "Not yet defined",
      "label_fr": "Pas encore défini",
      "label_ar": "لم يتم تحديده بعد",
      "label_ru": "Еще не определено",
      "desc_es": "El alcance del sistema de medición respecto a los operadores no ha sido determinado formalmente.",
      "desc_en": "The scope of the measurement system with respect to operators has not yet been formally determined.",
      "desc_fr": "La portée du système de mesure en ce qui concerne les opérateurs n''a pas encore été formellement déterminée.",
      "desc_ar": "لم يتم تحديد نطاق نظام القياس فيما يتعلق بالمشغلين بشكل رسمي بعد.",
      "desc_ru": "Охват системы измерений в отношении операторов еще не определен официально."
    }
  ]'::jsonb
FROM phases p
WHERE p.slug = 'phase0'
ON CONFLICT (slug) DO UPDATE SET
  order_index   = EXCLUDED.order_index,
  question_type = EXCLUDED.question_type,
  weight        = EXCLUDED.weight,
  text_es       = EXCLUDED.text_es,
  text_en       = EXCLUDED.text_en,
  text_fr       = EXCLUDED.text_fr,
  text_ar       = EXCLUDED.text_ar,
  text_ru       = EXCLUDED.text_ru,
  options_json  = EXCLUDED.options_json;

-- ── PASO 4: Verificación ─────────────────────────────────────

SELECT
  q.slug,
  q.order_index,
  q.question_type,
  q.text_es,
  jsonb_array_length(q.options_json) AS num_options
FROM questions q
JOIN phases p ON p.id = q.phase_id
WHERE p.slug = 'phase0'
ORDER BY q.order_index;
