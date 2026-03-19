-- ============================================================
-- NetDiscover — Supabase Schema + Seed
-- Execute this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. TABLES ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS phases (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(32) NOT NULL UNIQUE,
  order_index INTEGER NOT NULL,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_fr TEXT,
  description_es TEXT,
  description_en TEXT,
  description_fr TEXT,
  icon VARCHAR(64),
  color VARCHAR(16),
  scoring_excluded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  phase_id INTEGER NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  slug VARCHAR(32) NOT NULL UNIQUE,
  text_es TEXT NOT NULL,
  text_en TEXT NOT NULL,
  text_fr TEXT,
  help_es TEXT,
  help_en TEXT,
  help_fr TEXT,
  question_type VARCHAR(20) NOT NULL DEFAULT 'scale',
  weight NUMERIC(4,2) DEFAULT 1.00,
  options JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guest_sessions (
  id SERIAL PRIMARY KEY,
  token VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(320),
  name TEXT,
  organization TEXT,
  country VARCHAR(128),
  entity_type VARCHAR(32),
  status VARCHAR(20) DEFAULT 'in_progress',
  current_phase_index INTEGER DEFAULT 0,
  answers JSONB DEFAULT '{}',
  scores JSONB,
  gaps JSONB,
  action_plan JSONB,
  llm_analysis JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_providers (
  id SERIAL PRIMARY KEY,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_es TEXT,
  description_en TEXT,
  category VARCHAR(32) NOT NULL DEFAULT 'other',
  relevant_phases JSONB DEFAULT '[]',
  website VARCHAR(512),
  contact_email VARCHAR(320),
  logo_url TEXT,
  case_studies JSONB DEFAULT '[]',
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS provider_leads (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES market_providers(id),
  name TEXT NOT NULL,
  email VARCHAR(320) NOT NULL,
  organization TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS benchmark_snapshots (
  id SERIAL PRIMARY KEY,
  region VARCHAR(64) NOT NULL DEFAULT 'global',
  entity_type VARCHAR(32) NOT NULL DEFAULT 'all',
  data JSONB NOT NULL DEFAULT '{}',
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. ROW LEVEL SECURITY ────────────────────────────────────

ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_snapshots ENABLE ROW LEVEL SECURITY;

-- Public read for phases and questions
CREATE POLICY "phases_public_read" ON phases FOR SELECT USING (true);
CREATE POLICY "questions_public_read" ON questions FOR SELECT USING (true);

-- Guest sessions: anyone can insert/read/update by token
CREATE POLICY "sessions_insert" ON guest_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "sessions_select" ON guest_sessions FOR SELECT USING (true);
CREATE POLICY "sessions_update" ON guest_sessions FOR UPDATE USING (true);

-- Market providers: public read
CREATE POLICY "providers_public_read" ON market_providers FOR SELECT USING (active = true);

-- Provider leads: anyone can insert
CREATE POLICY "leads_insert" ON provider_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "leads_select" ON provider_leads FOR SELECT USING (true);

-- Benchmark: public read
CREATE POLICY "benchmark_public_read" ON benchmark_snapshots FOR SELECT USING (true);

-- ── 3. SEED: PHASES ──────────────────────────────────────────

INSERT INTO phases (slug, order_index, title_es, title_en, title_fr, description_es, description_en, description_fr, icon, color, scoring_excluded) VALUES
('phase0', 0, 'Contexto del Regulador', 'Regulator Context', 'Contexte du Régulateur',
 'Perfil institucional, prioridades estratégicas y relación con el operador designado.',
 'Institutional profile, strategic priorities and relationship with the designated operator.',
 'Profil institutionnel, priorités stratégiques et relation avec l''opérateur désigné.',
 'Building2', '#6B7280', true),
('phase1', 1, 'Diseño del Sistema de Medición', 'Measurement System Design', 'Conception du Système de Mesure',
 'Metodología, panel de panelistas, plataforma tecnológica y capacidad técnica del equipo.',
 'Methodology, panelist panel, technology platform and team technical capacity.',
 'Méthodologie, panel de panélistes, plateforme technologique et capacité technique.',
 'Settings2', '#0077C8', false),
('phase2', 2, 'Mapeo del Ecosistema', 'Ecosystem Mapping', 'Cartographie de l''Écosystème',
 'Inventario de actores, documentación de la red postal, volúmenes y topología.',
 'Actor inventory, postal network documentation, volumes and topology.',
 'Inventaire des acteurs, documentation du réseau postal, volumes et topologie.',
 'Map', '#7C3AED', false),
('phase3', 3, 'Establecimiento de SLAs', 'SLA Establishment', 'Établissement des SLA',
 'Línea base, definición de SLAs, formalización legal y revisión periódica.',
 'Baseline, SLA definition, legal formalization and periodic review.',
 'Référence de base, définition des SLA, formalisation juridique et révision périodique.',
 'FileCheck', '#059669', false),
('phase4', 4, 'Diagnóstico de Red', 'Network Diagnosis', 'Diagnostic du Réseau',
 'Identificación de nodos críticos, tecnología RFID, diagnóstico automático y acceso del operador.',
 'Critical node identification, RFID technology, automatic diagnosis and operator access.',
 'Identification des nœuds critiques, technologie RFID, diagnostic automatique et accès opérateur.',
 'Network', '#D97706', false),
('phase5', 5, 'Medición Continua', 'Continuous Measurement', 'Mesure Continue',
 'Operación permanente, reportería estructurada, transparencia y alertas automáticas.',
 'Permanent operation, structured reporting, transparency and automatic alerts.',
 'Fonctionnement permanent, rapports structurés, transparence et alertes automatiques.',
 'Activity', '#DC2626', false),
('phase6', 6, 'Planes de Mejora', 'Improvement Plans', 'Plans d''Amélioration',
 'Análisis de causa raíz, planes formales, capacidad sancionadora y verificación de impacto.',
 'Root cause analysis, formal plans, sanctioning capacity and impact verification.',
 'Analyse des causes profondes, plans formels, capacité de sanction et vérification d''impact.',
 'TrendingUp', '#0891B2', false),
('phase7', 7, 'Madurez y Mejora Continua', 'Maturity & Continuous Improvement', 'Maturité et Amélioration Continue',
 'Revisión de SLAs, nuevos servicios, benchmarking internacional y satisfacción del usuario.',
 'SLA review, new services, international benchmarking and user satisfaction.',
 'Révision des SLA, nouveaux services, benchmarking international et satisfaction des utilisateurs.',
 'Award', '#7C3AED', false)
ON CONFLICT (slug) DO NOTHING;

-- ── 4. SEED: QUESTIONS ───────────────────────────────────────

-- Phase 0: Regulator Context
INSERT INTO questions (phase_id, order_index, slug, text_es, text_en, text_fr, help_es, help_en, help_fr, question_type, weight) VALUES
((SELECT id FROM phases WHERE slug='phase0'), 1, 'p0q1',
 '¿Cuál es el nivel de independencia del regulador respecto al operador postal designado?',
 'What is the level of independence of the regulator from the designated postal operator?',
 'Quel est le niveau d''indépendance du régulateur par rapport à l''opérateur postal désigné?',
 '1=No existe separación / 2=Separación nominal pero sin independencia real / 3=Independencia formal pero con influencia del operador / 4=Independencia total con mandato legal claro',
 '1=No separation exists / 2=Nominal separation but no real independence / 3=Formal independence but with operator influence / 4=Full independence with clear legal mandate',
 '1=Pas de séparation / 2=Séparation nominale sans indépendance réelle / 3=Indépendance formelle avec influence de l''opérateur / 4=Indépendance totale avec mandat légal clair',
 'hidden', 0.00),
((SELECT id FROM phases WHERE slug='phase0'), 2, 'p0q2',
 '¿Cuál es la prioridad estratégica de la medición de calidad postal en la agenda del regulador?',
 'What is the strategic priority of postal quality measurement on the regulator''s agenda?',
 'Quelle est la priorité stratégique de la mesure de qualité postale dans l''agenda du régulateur?',
 '1=No es una prioridad / 2=Prioridad baja, sin recursos asignados / 3=Prioridad media con algunos recursos / 4=Prioridad alta con recursos y plan estratégico',
 '1=Not a priority / 2=Low priority, no resources assigned / 3=Medium priority with some resources / 4=High priority with resources and strategic plan',
 '1=Pas une priorité / 2=Priorité faible, sans ressources allouées / 3=Priorité moyenne avec quelques ressources / 4=Haute priorité avec ressources et plan stratégique',
 'scale', 0.00),
((SELECT id FROM phases WHERE slug='phase0'), 3, 'p0q3',
 '¿Cuál es la capacidad técnica actual del equipo regulador para la medición de calidad postal?',
 'What is the current technical capacity of the regulatory team for postal quality measurement?',
 'Quelle est la capacité technique actuelle de l''équipe réglementaire pour la mesure de qualité postale?',
 '1=Sin capacidad técnica / 2=Conocimiento básico sin experiencia práctica / 3=Equipo con experiencia pero sin especialización / 4=Equipo especializado con formación continua',
 '1=No technical capacity / 2=Basic knowledge without practical experience / 3=Team with experience but without specialization / 4=Specialized team with continuous training',
 '1=Pas de capacité technique / 2=Connaissance de base sans expérience pratique / 3=Équipe avec expérience sans spécialisation / 4=Équipe spécialisée avec formation continue',
 'scale', 0.00),
((SELECT id FROM phases WHERE slug='phase0'), 4, 'p0q4',
 '¿Cuál es la calidad de la relación de trabajo con el operador designado?',
 'What is the quality of the working relationship with the designated operator?',
 'Quelle est la qualité de la relation de travail avec l''opérateur désigné?',
 '1=Relación conflictiva / 2=Relación formal sin colaboración / 3=Colaboración puntual / 4=Colaboración estructurada y continua',
 '1=Conflictual relationship / 2=Formal relationship without collaboration / 3=Occasional collaboration / 4=Structured and continuous collaboration',
 '1=Relation conflictuelle / 2=Relation formelle sans collaboration / 3=Collaboration ponctuelle / 4=Collaboration structurée et continue',
 'scale', 0.00),
((SELECT id FROM phases WHERE slug='phase0'), 5, 'p0q5',
 '¿Cuál es el principal obstáculo para avanzar en la medición de calidad postal?',
 'What is the main obstacle to advancing in postal quality measurement?',
 'Quel est le principal obstacle à l''avancement dans la mesure de qualité postale?',
 'Seleccione el obstáculo más relevante.',
 'Select the most relevant obstacle.',
 'Sélectionnez l''obstacle le plus pertinent.',
 'multiple_choice', 0.00);

-- Set options for p0q5
UPDATE questions SET options = '[
  {"value":"no_budget","labelEs":"Falta de presupuesto","labelEn":"Lack of budget","labelFr":"Manque de budget"},
  {"value":"no_legal","labelEs":"Marco legal insuficiente","labelEn":"Insufficient legal framework","labelFr":"Cadre juridique insuffisant"},
  {"value":"no_expertise","labelEs":"Falta de experiencia técnica","labelEn":"Lack of technical expertise","labelFr":"Manque d''expertise technique"},
  {"value":"no_obstacle","labelEs":"No hay obstáculos significativos","labelEn":"No significant obstacles","labelFr":"Pas d''obstacles significatifs"}
]''::jsonb WHERE slug = ''p0q5'';

-- Phase 1: Measurement System Design
INSERT INTO questions (phase_id, order_index, slug, text_es, text_en, text_fr, help_es, help_en, help_fr, question_type, weight) VALUES
((SELECT id FROM phases WHERE slug='phase1'), 1, 'p1q1',
 '¿Existe una metodología documentada y aprobada para la medición E2E de calidad postal?',
 'Is there a documented and approved methodology for E2E postal quality measurement?',
 'Existe-t-il une méthodologie documentée et approuvée pour la mesure E2E de la qualité postale?',
 '1=No existe metodología / 2=Metodología en desarrollo o borrador / 3=Metodología aprobada pero no implementada / 4=Metodología aprobada, implementada y alineada con estándares UPU S58/S59',
 '1=No methodology exists / 2=Methodology under development or draft / 3=Approved methodology but not implemented / 4=Approved methodology, implemented and aligned with UPU S58/S59 standards',
 '1=Pas de méthodologie / 2=Méthodologie en développement ou brouillon / 3=Méthodologie approuvée mais non mise en œuvre / 4=Méthodologie approuvée, mise en œuvre et alignée avec les normes UPU S58/S59',
 'scale', 2.00),
((SELECT id FROM phases WHERE slug='phase1'), 2, 'p1q2',
 '¿Existe un panel de panelistas activo y representativo para la medición postal?',
 'Is there an active and representative panelist panel for postal measurement?',
 'Existe-t-il un panel de panélistes actif et représentatif pour la mesure postale?',
 '1=No existe panel / 2=Panel en diseño o reclutamiento / 3=Panel activo pero con cobertura geográfica limitada / 4=Panel activo, representativo, con cobertura geográfica completa y renovación periódica',
 '1=No panel exists / 2=Panel under design or recruitment / 3=Active panel but with limited geographic coverage / 4=Active, representative panel with full geographic coverage and periodic renewal',
 '1=Pas de panel / 2=Panel en conception ou recrutement / 3=Panel actif avec couverture géographique limitée / 4=Panel actif, représentatif, avec couverture géographique complète et renouvellement périodique',
 'scale', 2.00),
((SELECT id FROM phases WHERE slug='phase1'), 3, 'p1q3',
 '¿Existe una plataforma tecnológica para la gestión de datos de medición postal?',
 'Is there a technology platform for managing postal measurement data?',
 'Existe-t-il une plateforme technologique pour la gestion des données de mesure postale?',
 '1=No existe plataforma / 2=Plataforma básica (hojas de cálculo) / 3=Sistema de gestión de datos pero sin automatización / 4=Plataforma integrada con captura automática, análisis y reportería',
 '1=No platform exists / 2=Basic platform (spreadsheets) / 3=Data management system but without automation / 4=Integrated platform with automatic capture, analysis and reporting',
 '1=Pas de plateforme / 2=Plateforme de base (feuilles de calcul) / 3=Système de gestion de données sans automatisation / 4=Plateforme intégrée avec capture automatique, analyse et rapports',
 'scale', 1.50),
((SELECT id FROM phases WHERE slug='phase1'), 4, 'p1q4',
 '¿Cuál es el nivel de formación técnica del equipo responsable de la medición?',
 'What is the level of technical training of the team responsible for measurement?',
 'Quel est le niveau de formation technique de l''équipe responsable de la mesure?',
 '1=Sin formación específica / 2=Formación básica autodidacta / 3=Formación formal pero sin actualización / 4=Equipo con formación continua, certificaciones y participación en foros internacionales',
 '1=No specific training / 2=Basic self-taught training / 3=Formal training but without updates / 4=Team with continuous training, certifications and participation in international forums',
 '1=Pas de formation spécifique / 2=Formation de base autodidacte / 3=Formation formelle sans mises à jour / 4=Équipe avec formation continue, certifications et participation aux forums internationaux',
 'scale', 1.50),
((SELECT id FROM phases WHERE slug='phase1'), 5, 'p1q5',
 '¿Cuál es el principal obstáculo para diseñar el sistema de medición?',
 'What is the main obstacle to designing the measurement system?',
 'Quel est le principal obstacle à la conception du système de mesure?',
 'Seleccione el obstáculo más relevante.',
 'Select the most relevant obstacle.',
 'Sélectionnez l''obstacle le plus pertinent.',
 'multiple_choice', 0.00);

UPDATE questions SET options = '[
  {"value":"no_budget","labelEs":"Falta de presupuesto para contratar panelistas","labelEn":"No budget to hire panelists","labelFr":"Pas de budget pour recruter des panélistes"},
  {"value":"no_methodology","labelEs":"Falta de conocimiento de la metodología UPU","labelEn":"Lack of knowledge of UPU methodology","labelFr":"Manque de connaissance de la méthodologie UPU"},
  {"value":"no_technology","labelEs":"No se dispone de plataforma tecnológica","labelEn":"No technology platform available","labelFr":"Pas de plateforme technologique disponible"},
  {"value":"no_staff","labelEs":"Falta de personal técnico especializado","labelEn":"Lack of specialized technical staff","labelFr":"Manque de personnel technique spécialisé"},
  {"value":"already_designed","labelEs":"El sistema ya está diseñado","labelEn":"The system is already designed","labelFr":"Le système est déjà conçu"}
]'::jsonb WHERE slug = 'p1q5';

-- Phase 2: Ecosystem Mapping
INSERT INTO questions (phase_id, order_index, slug, text_es, text_en, text_fr, help_es, help_en, help_fr, question_type, weight) VALUES
((SELECT id FROM phases WHERE slug='phase2'), 1, 'p2q1',
 '¿Se ha realizado un inventario completo de los actores del ecosistema postal?',
 'Has a complete inventory of postal ecosystem actors been conducted?',
 'Un inventaire complet des acteurs de l''écosystème postal a-t-il été réalisé?',
 '1=No existe inventario / 2=Inventario parcial de actores principales / 3=Inventario completo pero sin actualización periódica / 4=Inventario completo, actualizado y con roles definidos',
 '1=No inventory exists / 2=Partial inventory of main actors / 3=Complete inventory but without periodic updates / 4=Complete, updated inventory with defined roles',
 '1=Pas d''inventaire / 2=Inventaire partiel des acteurs principaux / 3=Inventaire complet sans mises à jour périodiques / 4=Inventaire complet, mis à jour avec rôles définis',
 'scale', 2.00),
((SELECT id FROM phases WHERE slug='phase2'), 2, 'p2q2',
 '¿En qué medida está documentada la estructura física de la red postal?',
 'To what extent is the physical structure of the postal network documented?',
 'Dans quelle mesure la structure physique du réseau postal est-elle documentée?',
 '1=No documentada / 2=Documentación parcial basada en información del operador sin verificar / 3=Documentación completa pero sin georeferenciación ni actualización periódica / 4=Red completamente documentada, georeferenciada y actualizada periódicamente',
 '1=Not documented / 2=Partial documentation based on unverified operator information / 3=Complete documentation but without georeferencing or periodic updates / 4=Fully documented, georeferenced and periodically updated network',
 '1=Non documentée / 2=Documentation partielle basée sur des informations non vérifiées / 3=Documentation complète sans géoréférencement ni mises à jour périodiques / 4=Réseau entièrement documenté, géoréférencé et mis à jour périodiquement',
 'scale', 1.50),
((SELECT id FROM phases WHERE slug='phase2'), 3, 'p2q3',
 '¿Se conocen los volúmenes de correo por tipo de servicio y distribución geográfica?',
 'Are mail volumes known by service type and geographic distribution?',
 'Les volumes de courrier sont-ils connus par type de service et distribution géographique?',
 '1=No se conocen volúmenes / 2=Se conocen volúmenes totales sin desagregación / 3=Volúmenes desagregados por servicio pero sin distribución geográfica / 4=Volúmenes completos por servicio, zona geográfica y período, con datos verificados',
 '1=Volumes not known / 2=Total volumes known without disaggregation / 3=Volumes disaggregated by service but without geographic distribution / 4=Complete volumes by service, geographic area and period, with verified data',
 '1=Volumes inconnus / 2=Volumes totaux connus sans désagrégation / 3=Volumes désagrégés par service sans distribution géographique / 4=Volumes complets par service, zone géographique et période, avec données vérifiées',
 'scale', 1.50),
((SELECT id FROM phases WHERE slug='phase2'), 4, 'p2q4',
 '¿Existe una topología postal con zonas de medición y pares origen-destino definidos?',
 'Is there a postal topology with measurement zones and defined origin-destination pairs?',
 'Existe-t-il une topologie postale avec des zones de mesure et des paires origine-destination définies?',
 '1=No existe topología / 2=Existe una división administrativa no adaptada a medición postal / 3=Topología definida con pares O-D pero sin validación con datos reales de volúmenes / 4=Topología aprobada formalmente, con pares O-D representativos validados con datos de volúmenes',
 '1=No topology exists / 2=Administrative division not adapted to postal measurement / 3=Topology defined with O-D pairs but not validated with real volume data / 4=Formally approved topology with representative O-D pairs validated with volume data',
 '1=Pas de topologie / 2=Division administrative non adaptée à la mesure postale / 3=Topologie définie avec paires O-D sans validation avec données de volumes réels / 4=Topologie formellement approuvée avec paires O-D représentatives validées avec données de volumes',
 'scale', 2.00),
((SELECT id FROM phases WHERE slug='phase2'), 5, 'p2q5',
 '¿Cuál es el principal obstáculo para completar el mapeo de su ecosistema postal?',
 'What is the main obstacle to completing the mapping of your postal ecosystem?',
 'Quel est le principal obstacle à la cartographie complète de votre écosystème postal?',
 'Seleccione el obstáculo más relevante.',
 'Select the most relevant obstacle.',
 'Sélectionnez l''obstacle le plus pertinent.',
 'multiple_choice', 0.00);

UPDATE questions SET options = '[
  {"value":"no_resources","labelEs":"No hay recursos para realizar el levantamiento","labelEn":"No resources to conduct the survey","labelFr":"Pas de ressources pour réaliser le relevé"},
  {"value":"network_changes","labelEs":"La red cambia frecuentemente y es difícil mantenerla actualizada","labelEn":"The network changes frequently and is difficult to keep updated","labelFr":"Le réseau change fréquemment et est difficile à maintenir à jour"},
  {"value":"no_gis","labelEs":"No se dispone de herramientas GIS o de mapeo","labelEn":"No GIS or mapping tools available","labelFr":"Pas d''outils SIG ou de cartographie disponibles"},
  {"value":"no_legal_obligation","labelEs":"No existe obligación legal de que el operador comparta estos datos","labelEn":"No legal obligation for the operator to share this data","labelFr":"Pas d''obligation légale pour l''opérateur de partager ces données"},
  {"value":"already_complete","labelEs":"El mapeo ya está completo","labelEn":"The mapping is already complete","labelFr":"La cartographie est déjà complète"}
]'::jsonb WHERE slug = 'p2q5';

-- Phase 3: SLA Establishment
INSERT INTO questions (phase_id, order_index, slug, text_es, text_en, text_fr, help_es, help_en, help_fr, question_type, weight) VALUES
((SELECT id FROM phases WHERE slug='phase3'), 1, 'p3q1',
 '¿Se ha establecido una línea base de calidad postal con datos de medición?',
 'Has a postal quality baseline been established with measurement data?',
 'Une référence de qualité postale a-t-elle été établie avec des données de mesure?',
 '1=No existe línea base / 2=Estimaciones sin datos de medición / 3=Línea base con datos parciales / 4=Línea base robusta con al menos 12 meses de datos de medición',
 '1=No baseline exists / 2=Estimates without measurement data / 3=Baseline with partial data / 4=Robust baseline with at least 12 months of measurement data',
 '1=Pas de référence de base / 2=Estimations sans données de mesure / 3=Référence de base avec données partielles / 4=Référence de base robuste avec au moins 12 mois de données de mesure',
 'scale', 2.00),
((SELECT id FROM phases WHERE slug='phase3'), 2, 'p3q2',
 '¿Existen SLAs definidos para los principales servicios postales?',
 'Are SLAs defined for the main postal services?',
 'Des SLA sont-ils définis pour les principaux services postaux?',
 '1=No existen SLAs / 2=SLAs en discusión o borrador / 3=SLAs definidos pero no formalizados legalmente / 4=SLAs definidos, formalizados y publicados con indicadores claros',
 '1=No SLAs exist / 2=SLAs under discussion or draft / 3=SLAs defined but not legally formalized / 4=SLAs defined, formalized and published with clear indicators',
 '1=Pas de SLA / 2=SLA en discussion ou brouillon / 3=SLA définis mais non formalisés juridiquement / 4=SLA définis, formalisés et publiés avec des indicateurs clairs',
 'scale', 2.00),
((SELECT id FROM phases WHERE slug='phase3'), 3, 'p3q3',
 '¿Los SLAs están formalizados en el marco regulatorio con obligaciones vinculantes?',
 'Are SLAs formalized in the regulatory framework with binding obligations?',
 'Les SLA sont-ils formalisés dans le cadre réglementaire avec des obligations contraignantes?',
 '1=Sin formalización / 2=Acuerdos informales / 3=Formalizados en reglamentos pero sin consecuencias / 4=Formalizados con obligaciones vinculantes y consecuencias claras',
 '1=No formalization / 2=Informal agreements / 3=Formalized in regulations but without consequences / 4=Formalized with binding obligations and clear consequences',
 '1=Pas de formalisation / 2=Accords informels / 3=Formalisés dans des règlements sans conséquences / 4=Formalisés avec obligations contraignantes et conséquences claires',
 'scale', 1.50),
((SELECT id FROM phases WHERE slug='phase3'), 4, 'p3q4',
 '¿Se revisan periódicamente los SLAs con base en datos acumulados?',
 'Are SLAs periodically reviewed based on accumulated data?',
 'Les SLA sont-ils révisés périodiquement sur la base des données accumulées?',
 '1=No se revisan / 2=Revisión ad-hoc sin periodicidad / 3=Revisión anual pero sin proceso estructurado / 4=Revisión periódica estructurada con proceso formal y participación de stakeholders',
 '1=Not reviewed / 2=Ad-hoc review without periodicity / 3=Annual review but without structured process / 4=Structured periodic review with formal process and stakeholder participation',
 '1=Non révisés / 2=Révision ad hoc sans périodicité / 3=Révision annuelle sans processus structuré / 4=Révision périodique structurée avec processus formel et participation des parties prenantes',
 'scale', 1.50),
((SELECT id FROM phases WHERE slug='phase3'), 5, 'p3q5',
 '¿Cuál es el principal obstáculo para establecer SLAs vinculantes?',
 'What is the main obstacle to establishing binding SLAs?',
 'Quel est le principal obstacle à l''établissement de SLA contraignants?',
 'Seleccione el obstáculo más relevante.',
 'Select the most relevant obstacle.',
 'Sélectionnez l''obstacle le plus pertinent.',
 'multiple_choice', 0.00);

UPDATE questions SET options = '[
  {"value":"no_legal_framework","labelEs":"No existe marco legal para formalizar los SLAs","labelEn":"No legal framework to formalize SLAs","labelFr":"Pas de cadre juridique pour formaliser les SLA"},
  {"value":"no_experience","labelEs":"Falta experiencia en diseño de SLAs postales","labelEn":"Lack of experience in postal SLA design","labelFr":"Manque d''expérience dans la conception de SLA postaux"},
  {"value":"already_established","labelEs":"Los SLAs ya están establecidos y funcionan","labelEn":"SLAs are already established and working","labelFr":"Les SLA sont déjà établis et fonctionnent"}
]'::jsonb WHERE slug = 'p3q5';

-- Phase 4: Network Diagnosis
INSERT INTO questions (phase_id, order_index, slug, text_es, text_en, text_fr, help_es, help_en, help_fr, question_type, weight) VALUES
((SELECT id FROM phases WHERE slug='phase4'), 1, 'p4q1',
 '¿Se han identificado los nodos críticos de la red postal donde se producen los mayores retrasos?',
 'Have the critical nodes of the postal network where the greatest delays occur been identified?',
 'Les nœuds critiques du réseau postal où se produisent les plus grands retards ont-ils été identifiés?',
 '1=No se conocen los nodos de la red / 2=Se conocen los nodos principales pero no dónde se producen los retrasos / 3=Se han identificado nodos problemáticos por observación o quejas pero sin datos de medición / 4=Nodos críticos identificados con datos de medición que muestran tiempos por segmento',
 '1=Network nodes not known / 2=Main nodes known but not where delays occur / 3=Problematic nodes identified by observation or complaints but without measurement data / 4=Critical nodes identified with measurement data showing segment times',
 '1=Nœuds du réseau inconnus / 2=Nœuds principaux connus mais pas où se produisent les retards / 3=Nœuds problématiques identifiés par observation ou plaintes sans données de mesure / 4=Nœuds critiques identifiés avec données de mesure montrant les temps par segment',
 'scale', 2.00),
((SELECT id FROM phases WHERE slug='phase4'), 2, 'p4q2',
 '¿Qué nivel de implementación tiene la tecnología de captura (RFID, código de barras) en los nodos de la red?',
 'What level of implementation does capture technology (RFID, barcodes) have at network nodes?',
 'Quel niveau de mise en œuvre la technologie de capture (RFID, codes-barres) a-t-elle aux nœuds du réseau?',
 '1=No existe tecnología de captura / 2=Se ha diseñado o pilotado en algunos nodos pero no está operativa / 3=Tecnología instalada en nodos principales pero sin cobertura completa / 4=Red de captura operativa en todos los nodos críticos, integrada con la plataforma y con mantenimiento establecido',
 '1=No capture technology exists / 2=Designed or piloted at some nodes but not operational / 3=Technology installed at main nodes but without full network coverage / 4=Operational capture network at all critical nodes, integrated with platform and with established maintenance',
 '1=Pas de technologie de capture / 2=Conçue ou pilotée sur certains nœuds mais non opérationnelle / 3=Technologie installée sur les nœuds principaux sans couverture complète / 4=Réseau de capture opérationnel sur tous les nœuds critiques, intégré à la plateforme avec maintenance établie',
 'scale', 2.00),
((SELECT id FROM phases WHERE slug='phase4'), 3, 'p4q3',
 '¿Puede el sistema descomponer el tiempo total de tránsito en segmentos y generar diagnósticos automáticos por nodo?',
 'Can the system decompose total transit time into segments and generate automatic diagnostics by node?',
 'Le système peut-il décomposer le temps de transit total en segments et générer des diagnostics automatiques par nœud?',
 '1=No es posible descomponer tiempos / 2=Se pueden estimar tiempos por segmento de forma manual / 3=La plataforma calcula tiempos por segmento pero sin dashboards ni alertas / 4=Diagnóstico automático con dashboards por nodo, análisis de cuellos de botella y alertas por degradación',
 '1=Cannot decompose times / 2=Segment times can be estimated manually / 3=Platform calculates segment times but without dashboards or alerts / 4=Automatic diagnosis with per-node dashboards, bottleneck analysis and degradation alerts',
 '1=Impossible de décomposer les temps / 2=Les temps par segment peuvent être estimés manuellement / 3=La plateforme calcule les temps par segment sans tableaux de bord ni alertes / 4=Diagnostic automatique avec tableaux de bord par nœud, analyse des goulots d''étranglement et alertes de dégradation',
 'scale', 1.50),
((SELECT id FROM phases WHERE slug='phase4'), 4, 'p4q4',
 '¿El operador designado tiene acceso a los datos de diagnóstico de su propia red para mejorar sus operaciones?',
 'Does the designated operator have access to diagnostic data of its own network to improve its operations?',
 'L''opérateur désigné a-t-il accès aux données de diagnostic de son propre réseau pour améliorer ses opérations?',
 '1=El operador no tiene acceso a datos de diagnóstico / 2=El operador recibe informes puntuales pero sin acceso directo / 3=El operador tiene acceso a dashboards básicos de su rendimiento / 4=El operador tiene acceso completo a datos de diagnóstico con dashboards propios para su planificación operativa',
 '1=Operator has no access to diagnostic data / 2=Operator receives spot reports but no direct access / 3=Operator has access to basic performance dashboards / 4=Operator has full access to diagnostic data with own dashboards for operational planning',
 '1=L''opérateur n''a pas accès aux données de diagnostic / 2=L''opérateur reçoit des rapports ponctuels sans accès direct / 3=L''opérateur a accès à des tableaux de bord de performance de base / 4=L''opérateur a un accès complet aux données de diagnostic avec ses propres tableaux de bord',
 'scale', 1.50),
((SELECT id FROM phases WHERE slug='phase4'), 5, 'p4q5',
 '¿Cuál es el principal obstáculo para diagnosticar su red postal?',
 'What is the main obstacle to diagnosing your postal network?',
 'Quel est le principal obstacle au diagnostic de votre réseau postal?',
 'Seleccione el obstáculo más relevante.',
 'Select the most relevant obstacle.',
 'Sélectionnez l''obstacle le plus pertinent.',
 'multiple_choice', 0.00);

UPDATE questions SET options = '[
  {"value":"no_budget_rfid","labelEs":"No hay presupuesto para equipamiento RFID","labelEn":"No budget for RFID equipment","labelFr":"Pas de budget pour les équipements RFID"},
  {"value":"no_infrastructure","labelEs":"Las instalaciones no tienen la infraestructura necesaria","labelEn":"Facilities lack the necessary infrastructure","labelFr":"Les installations manquent de l''infrastructure nécessaire"},
  {"value":"no_technical_staff","labelEs":"No hay personal técnico para instalar y mantener los equipos","labelEn":"No technical staff to install and maintain equipment","labelFr":"Pas de personnel technique pour installer et maintenir les équipements"},
  {"value":"no_rfid_supplier","labelEs":"No se dispone de proveedor de equipamiento RFID","labelEn":"No RFID equipment supplier available","labelFr":"Pas de fournisseur d''équipements RFID disponible"},
  {"value":"already_diagnosed","labelEs":"La red ya está diagnosticada","labelEn":"The network is already diagnosed","labelFr":"Le réseau est déjà diagnostiqué"}
]'::jsonb WHERE slug = 'p4q5';

-- Phase 5: Continuous Measurement
INSERT INTO questions (phase_id, order_index, slug, text_es, text_en, text_fr, help_es, help_en, help_fr, question_type, weight) VALUES
((SELECT id FROM phases WHERE slug='phase5'), 1, 'p5q1',
 '¿La medición de calidad postal opera de forma permanente y continua durante todo el año?',
 'Does postal quality measurement operate permanently and continuously throughout the year?',
 'La mesure de qualité postale fonctionne-t-elle de manière permanente et continue tout au long de l''année?',
 '1=No existe medición continua / 2=Medición puntual o campañas esporádicas / 3=Medición periódica pero con interrupciones / 4=Medición continua 12 meses al año con protocolo de contingencia para interrupciones',
 '1=No continuous measurement / 2=Spot measurement or sporadic campaigns / 3=Periodic measurement but with interruptions / 4=Continuous measurement 12 months per year with contingency protocol for interruptions',
 '1=Pas de mesure continue / 2=Mesure ponctuelle ou campagnes sporadiques / 3=Mesure périodique avec interruptions / 4=Mesure continue 12 mois par an avec protocole de contingence pour les interruptions',
 'scale', 2.00),
((SELECT id FROM phases WHERE slug='phase5'), 2, 'p5q2',
 '¿Se generan reportes estructurados y periódicos de los resultados de calidad postal?',
 'Are structured and periodic reports generated on postal quality results?',
 'Des rapports structurés et périodiques sont-ils générés sur les résultats de qualité postale?',
 '1=No se generan reportes / 2=Reportes ad-hoc sin estructura / 3=Reportes periódicos pero sin estandarización / 4=Reportes estandarizados, periódicos, con comparación histórica y distribución a stakeholders',
 '1=No reports generated / 2=Ad-hoc reports without structure / 3=Periodic reports but without standardization / 4=Standardized, periodic reports with historical comparison and distribution to stakeholders',
 '1=Pas de rapports générés / 2=Rapports ad hoc sans structure / 3=Rapports périodiques sans standardisation / 4=Rapports standardisés, périodiques, avec comparaison historique et distribution aux parties prenantes',
 'scale', 1.50),
((SELECT id FROM phases WHERE slug='phase5'), 3, 'p5q3',
 '¿Los resultados de calidad postal se publican de forma transparente y accesible al público?',
 'Are postal quality results published in a transparent and publicly accessible manner?',
 'Les résultats de qualité postale sont-ils publiés de manière transparente et accessible au public?',
 '1=No se publican resultados / 2=Resultados disponibles bajo solicitud / 3=Publicación periódica pero limitada / 4=Publicación proactiva, accesible, con datos históricos y comparaciones',
 '1=Results not published / 2=Results available on request / 3=Periodic but limited publication / 4=Proactive, accessible publication with historical data and comparisons',
 '1=Résultats non publiés / 2=Résultats disponibles sur demande / 3=Publication périodique mais limitée / 4=Publication proactive, accessible, avec données historiques et comparaisons',
 'scale', 1.50),
((SELECT id FROM phases WHERE slug='phase5'), 4, 'p5q4',
 '¿Existen alertas automáticas cuando los indicadores de calidad se degradan por debajo de los SLAs?',
 'Are there automatic alerts when quality indicators degrade below SLAs?',
 'Existe-t-il des alertes automatiques lorsque les indicateurs de qualité se dégradent en dessous des SLA?',
 '1=No existen alertas / 2=Alertas manuales basadas en revisión periódica / 3=Sistema de alertas básico sin automatización completa / 4=Sistema de alertas automático con umbrales configurables, escalado y registro de incidencias',
 '1=No alerts exist / 2=Manual alerts based on periodic review / 3=Basic alert system without full automation / 4=Automatic alert system with configurable thresholds, escalation and incident logging',
 '1=Pas d''alertes / 2=Alertes manuelles basées sur une révision périodique / 3=Système d''alertes de base sans automatisation complète / 4=Système d''alertes automatique avec seuils configurables, escalade et journalisation des incidents',
 'scale', 2.00),
((SELECT id FROM phases WHERE slug='phase5'), 5, 'p5q5',
 '¿Cuál es el principal obstáculo para la medición continua?',
 'What is the main obstacle to continuous measurement?',
 'Quel est le principal obstacle à la mesure continue?',
 'Seleccione el obstáculo más relevante.',
 'Select the most relevant obstacle.',
 'Sélectionnez l''obstacle le plus pertinent.',
 'multiple_choice', 0.00);

UPDATE questions SET options = '[
  {"value":"no_budget_operations","labelEs":"No hay presupuesto para operación continua","labelEn":"No budget for continuous operation","labelFr":"Pas de budget pour le fonctionnement continu"},
  {"value":"panelist_fatigue","labelEs":"Fatiga de panelistas y alta rotación","labelEn":"Panelist fatigue and high turnover","labelFr":"Fatigue des panélistes et fort taux de rotation"},
  {"value":"no_automation","labelEs":"Falta de automatización en la plataforma","labelEn":"Lack of automation in the platform","labelFr":"Manque d''automatisation dans la plateforme"},
  {"value":"data_quality","labelEs":"Problemas de calidad de datos","labelEn":"Data quality problems","labelFr":"Problèmes de qualité des données"},
  {"value":"no_reporting","labelEs":"Falta de capacidad para generar reportes","labelEn":"Lack of capacity to generate reports","labelFr":"Manque de capacité pour générer des rapports"},
  {"value":"already_continuous","labelEs":"La medición ya es continua","labelEn":"Measurement is already continuous","labelFr":"La mesure est déjà continue"}
]'::jsonb WHERE slug = 'p5q5';

-- Phase 6: Improvement Plans
INSERT INTO questions (phase_id, order_index, slug, text_es, text_en, text_fr, help_es, help_en, help_fr, question_type, weight) VALUES
((SELECT id FROM phases WHERE slug='phase6'), 1, 'p6q1',
 '¿Se realiza análisis de causa raíz cuando los indicadores de calidad no cumplen los SLAs?',
 'Is root cause analysis performed when quality indicators do not meet SLAs?',
 'Une analyse des causes profondes est-elle effectuée lorsque les indicateurs de qualité ne respectent pas les SLA?',
 '1=No se realiza análisis / 2=Análisis informal sin metodología / 3=Análisis estructurado pero sin seguimiento / 4=Análisis formal con metodología establecida, documentación y seguimiento',
 '1=No analysis performed / 2=Informal analysis without methodology / 3=Structured analysis but without follow-up / 4=Formal analysis with established methodology, documentation and follow-up',
 '1=Pas d''analyse effectuée / 2=Analyse informelle sans méthodologie / 3=Analyse structurée sans suivi / 4=Analyse formelle avec méthodologie établie, documentation et suivi',
 'scale', 2.00),
((SELECT id FROM phases WHERE slug='phase6'), 2, 'p6q2',
 '¿Existen planes de mejora formales con acciones, responsables, plazos e indicadores de éxito?',
 'Are there formal improvement plans with actions, responsible parties, timelines and success indicators?',
 'Existe-t-il des plans d''amélioration formels avec des actions, des responsables, des délais et des indicateurs de succès?',
 '1=No existen planes de mejora / 2=Recomendaciones generales sin plan estructurado / 3=Planes con acciones definidas sin seguimiento ni indicadores / 4=Planes formales con acciones, responsables, plazos, indicadores de éxito y revisiones periódicas de avance',
 '1=No improvement plans exist / 2=General recommendations without structured plan / 3=Plans with defined actions but without follow-up or indicators / 4=Formal plans with actions, responsible parties, timelines, success indicators and periodic progress reviews',
 '1=Pas de plans d''amélioration / 2=Recommandations générales sans plan structuré / 3=Plans avec actions définies sans suivi ni indicateurs / 4=Plans formels avec actions, responsables, délais, indicateurs de succès et révisions périodiques de l''avancement',
 'scale', 2.00),
((SELECT id FROM phases WHERE slug='phase6'), 3, 'p6q3',
 '¿Qué capacidad tiene el regulador para imponer acciones correctivas y sancionar incumplimientos?',
 'What capacity does the regulator have to impose corrective actions and sanction non-compliance?',
 'Quelle capacité le régulateur a-t-il pour imposer des actions correctives et sanctionner les manquements?',
 '1=Solo puede recomendar sin consecuencias / 2=Puede emitir recomendaciones formales pero sin poder sancionador / 3=Tiene poder sancionador pero no lo ha ejercido nunca o rara vez / 4=Régimen sancionador activo, vinculado a SLAs, con procedimiento establecido y sanciones aplicadas',
 '1=Can only recommend without consequences / 2=Can issue formal recommendations but without sanctioning power / 3=Has sanctioning power but has never or rarely exercised it / 4=Active sanctioning regime, linked to SLAs, with established procedure and applied sanctions',
 '1=Peut seulement recommander sans conséquences / 2=Peut émettre des recommandations formelles sans pouvoir de sanction / 3=A un pouvoir de sanction mais ne l''a jamais ou rarement exercé / 4=Régime de sanction actif, lié aux SLA, avec procédure établie et sanctions appliquées',
 'hidden', 0.00),
((SELECT id FROM phases WHERE slug='phase6'), 4, 'p6q4',
 '¿Se verifica con datos de medición si las acciones de mejora implementadas producen el efecto esperado?',
 'Is measurement data used to verify whether implemented improvement actions produce the expected effect?',
 'Les données de mesure sont-elles utilisées pour vérifier si les actions d''amélioration mises en œuvre produisent l''effet attendu?',
 '1=No se verifica el impacto de las mejoras / 2=Se percibe si hay mejora pero sin datos comparativos / 3=Se comparan datos antes/después pero sin metodología rigurosa / 4=Verificación formal con comparación estadística antes/después, documentación de resultados y lecciones aprendidas',
 '1=Impact of improvements not verified / 2=Improvement perceived but without comparative data / 3=Before/after data compared but without rigorous methodology / 4=Formal verification with statistical before/after comparison, results documentation and lessons learned',
 '1=Impact des améliorations non vérifié / 2=Amélioration perçue sans données comparatives / 3=Données avant/après comparées sans méthodologie rigoureuse / 4=Vérification formelle avec comparaison statistique avant/après, documentation des résultats et leçons apprises',
 'scale', 1.50),
((SELECT id FROM phases WHERE slug='phase6'), 5, 'p6q5',
 '¿Cuál es el principal obstáculo para implementar planes de mejora?',
 'What is the main obstacle to implementing improvement plans?',
 'Quel est le principal obstacle à la mise en œuvre des plans d''amélioration?',
 'Seleccione el obstáculo más relevante.',
 'Select the most relevant obstacle.',
 'Sélectionnez l''obstacle le plus pertinent.',
 'multiple_choice', 0.00);
UPDATE questions SET options = '[
  {"value":"no_data","labelEs":"No hay datos suficientes para diagnosticar las causas","labelEn":"Insufficient data to diagnose causes","labelFr":"Données insuffisantes pour diagnostiquer les causes"},
  {"value":"no_consultants","labelEs":"Falta de consultores con experiencia en operaciones postales","labelEn":"Lack of consultants with postal operations experience","labelFr":"Manque de consultants avec expérience en opérations postales"},
  {"value":"staff_turnover","labelEs":"Falta de seguimiento por rotación de personal o cambio de prioridades","labelEn":"Lack of follow-up due to staff turnover or priority changes","labelFr":"Manque de suivi dû à la rotation du personnel ou aux changements de priorités"},
  {"value":"already_working","labelEs":"Los planes de mejora ya funcionan","labelEn":"Improvement plans are already working","labelFr":"Les plans d''amélioration fonctionnent déjà"}
]'::jsonb WHERE slug = 'p6q5';;

-- Phase 7: Maturity & Continuous Improvement
INSERT INTO questions (phase_id, order_index, slug, text_es, text_en, text_fr, help_es, help_en, help_fr, question_type, weight) VALUES
((SELECT id FROM phases WHERE slug='phase7'), 1, 'p7q1',
 '¿Los SLAs se revisan periódicamente con base en datos acumulados y consulta a stakeholders?',
 'Are SLAs reviewed periodically based on accumulated data and stakeholder consultation?',
 'Les SLA sont-ils révisés périodiquement sur la base des données accumulées et de la consultation des parties prenantes?',
 '1=No se revisan los SLAs / 2=Revisión informal sin proceso / 3=Revisión periódica pero sin proceso formal / 4=Proceso formal de revisión con datos, consulta y actualización documentada',
 '1=SLAs not reviewed / 2=Informal review without process / 3=Periodic review but without formal process / 4=Formal review process with data, consultation and documented update',
 '1=SLA non révisés / 2=Révision informelle sans processus / 3=Révision périodique sans processus formel / 4=Processus de révision formel avec données, consultation et mise à jour documentée',
 'scale', 1.50),
((SELECT id FROM phases WHERE slug='phase7'), 2, 'p7q2',
 '¿Se han incorporado nuevos servicios o modalidades al sistema de medición de calidad?',
 'Have new services or modalities been incorporated into the quality measurement system?',
 'De nouveaux services ou modalités ont-ils été incorporés dans le système de mesure de qualité?',
 '1=Solo se miden los servicios originales / 2=Se ha discutido ampliar pero sin acción / 3=Algunos nuevos servicios incorporados de forma ad-hoc / 4=Proceso sistemático de incorporación de nuevos servicios con criterios definidos',
 '1=Only original services measured / 2=Expansion discussed but no action / 3=Some new services incorporated ad-hoc / 4=Systematic process for incorporating new services with defined criteria',
 '1=Seuls les services originaux mesurés / 2=Extension discutée sans action / 3=Quelques nouveaux services incorporés de façon ad hoc / 4=Processus systématique d''incorporation de nouveaux services avec critères définis',
 'scale', 1.50),
((SELECT id FROM phases WHERE slug='phase7'), 3, 'p7q3',
 '¿Participa el regulador en programas de benchmarking internacional (UPU GMS u otros)?',
 'Does the regulator participate in international benchmarking programmes (UPU GMS or others)?',
 'Le régulateur participe-t-il à des programmes de benchmarking international (GMS de l''UPU ou autres)?',
 '1=No participa en ningún programa / 2=Conoce los programas pero no participa / 3=Participa de forma puntual o con datos limitados / 4=Participación activa y continua en UPU GMS u otros programas con intercambio de datos y metodología compatible',
 '1=Does not participate in any programme / 2=Aware of programmes but does not participate / 3=Participates sporadically or with limited data / 4=Active and continuous participation in UPU GMS or other programmes with data exchange and compatible methodology',
 '1=Ne participe à aucun programme / 2=Connait les programmes mais n''y participe pas / 3=Participe ponctuellement ou avec des données limitées / 4=Participation active et continue au GMS de l''UPU ou autres programmes avec échange de données et méthodologie compatible',
 'scale', 2.00),
((SELECT id FROM phases WHERE slug='phase7'), 4, 'p7q4',
 '¿Se mide la satisfacción del usuario final como complemento a los indicadores objetivos de calidad?',
 'Is end-user satisfaction measured as a complement to objective quality indicators?',
 'La satisfaction de l''utilisateur final est-elle mesurée en complément des indicateurs objectifs de qualité?',
 '1=No se mide satisfacción / 2=Se reciben quejas pero no se analizan sistemáticamente / 3=Encuestas puntuales sin periodicidad ni integración con datos de calidad / 4=Medición periódica de satisfacción integrada con indicadores objetivos y utilizada en la revisión de SLAs',
 '1=Satisfaction not measured / 2=Complaints received but not systematically analysed / 3=Spot surveys without periodicity or integration with quality data / 4=Periodic satisfaction measurement integrated with objective indicators and used in SLA review',
 '1=Satisfaction non mesurée / 2=Plaintes reçues mais non analysées systématiquement / 3=Enquêtes ponctuelles sans périodicité ni intégration avec données de qualité / 4=Mesure périodique de satisfaction intégrée aux indicateurs objectifs et utilisée dans la révision des SLA',
 'scale', 1.50),
((SELECT id FROM phases WHERE slug='phase7'), 5, 'p7q5',
 '¿Cuál es el principal obstáculo para alcanzar la madurez continua?',
 'What is the main obstacle to achieving continuous maturity?',
 'Quel est le principal obstacle à l''atteinte de la maturité continue?',
 'Seleccione el obstáculo más relevante.',
 'Select the most relevant obstacle.',
 'Sélectionnez l''obstacle le plus pertinent.',
 'multiple_choice', 0.00);
UPDATE questions SET options = '[
  {"value":"no_demand_new_services","labelEs":"No hay demanda para medir nuevos servicios","labelEn":"No demand to measure new services","labelFr":"Pas de demande pour mesurer de nouveaux services"},
  {"value":"no_resources_international","labelEs":"Falta de recursos para participar en programas internacionales","labelEn":"Lack of resources to participate in international programmes","labelFr":"Manque de ressources pour participer aux programmes internationaux"},
  {"value":"incompatible_methodology","labelEs":"La metodología no es compatible con estándares internacionales","labelEn":"Methodology not compatible with international standards","labelFr":"Méthodologie non compatible avec les normes internationales"},
  {"value":"no_peer_network","labelEs":"Falta de interlocución con otros reguladores","labelEn":"Lack of dialogue with other regulators","labelFr":"Manque de dialogue avec d''autres régulateurs"},
  {"value":"already_mature","labelEs":"El sistema ya está en fase de madurez","labelEn":"The system is already in a maturity phase","labelFr":"Le système est déjà en phase de maturité"}
]'::jsonb WHERE slug = 'p7q5';;

-- ── 5. SEED: MARKET PROVIDERS ────────────────────────────────

INSERT INTO market_providers (name_es, name_en, description_es, description_en, category, relevant_phases, website, contact_email, featured, active) VALUES
('Soluciones de Panelistas Postales', 'Postal Panelist Solutions',
 'Diseño e implementación de redes de panelistas para medición E2E de calidad postal según estándares UPU S58/S59 y EN 13850.',
 'Design and implementation of panelist networks for E2E postal quality measurement per UPU S58/S59 and EN 13850 standards.',
 'measurement', '["phase1","phase3"]', 'https://example.com', 'contact@example.com', true, true),
('Plataformas de Datos Regulatorios', 'Regulatory Data Platforms',
 'Plataformas SaaS para centralizar, analizar y reportar datos de calidad postal con dashboards interactivos y alertas automáticas.',
 'SaaS platforms to centralize, analyze and report postal quality data with interactive dashboards and automatic alerts.',
 'platform', '["phase1","phase5"]', 'https://example.com', 'contact@example.com', true, true),
('Sistemas RFID para Redes Postales', 'RFID Systems for Postal Networks',
 'Equipamiento RFID y sistemas de captura para diagnóstico granular de tiempos por nodo y tramo en redes postales.',
 'RFID equipment and capture systems for granular diagnosis of times per node and segment in postal networks.',
 'rfid', '["phase4"]', 'https://example.com', 'contact@example.com', false, true),
('Consultoría Regulatoria Postal', 'Postal Regulatory Consulting',
 'Servicios de consultoría especializada en diseño de marcos regulatorios, SLAs, análisis de causa raíz y planes de mejora postal.',
 'Specialized consulting services in regulatory framework design, SLAs, root cause analysis and postal improvement plans.',
 'consulting', '["phase2","phase3","phase6","phase7"]', 'https://example.com', 'contact@example.com', true, true),
('Formación y Capacitación Postal', 'Postal Training & Capacity Building',
 'Programas de formación para reguladores postales en medición de calidad, análisis de datos y mejora continua.',
 'Training programs for postal regulators in quality measurement, data analysis and continuous improvement.',
 'training', '["phase1","phase5","phase6"]', 'https://example.com', 'contact@example.com', false, true);

-- ── 6. SAMPLE BENCHMARK SNAPSHOT ─────────────────────────────

INSERT INTO benchmark_snapshots (region, entity_type, data, snapshot_date) VALUES
('global', 'all', '{
  "globalAvg": 38,
  "globalMedian": 35,
  "globalP25": 22,
  "globalP75": 54,
  "sampleSize": 47,
  "phaseAverages": {
    "phase1": 42,
    "phase2": 45,
    "phase3": 38,
    "phase4": 28,
    "phase5": 35,
    "phase6": 30,
    "phase7": 25
  },
  "phaseStats": {
    "phase1": {"avg": 42, "median": 40, "p25": 25, "p75": 60},
    "phase2": {"avg": 45, "median": 42, "p25": 28, "p75": 62},
    "phase3": {"avg": 38, "median": 35, "p25": 20, "p75": 55},
    "phase4": {"avg": 28, "median": 25, "p25": 15, "p75": 42},
    "phase5": {"avg": 35, "median": 33, "p25": 18, "p75": 52},
    "phase6": {"avg": 30, "median": 28, "p25": 15, "p75": 45},
    "phase7": {"avg": 25, "median": 22, "p25": 12, "p75": 38}
  }
}', CURRENT_DATE);

-- ── DONE ─────────────────────────────────────────────────────
-- Run this entire script in Supabase Dashboard > SQL Editor
-- After running, get your anon key from Project Settings > API
-- and add it to Netlify environment variables as VITE_SUPABASE_ANON_KEY
