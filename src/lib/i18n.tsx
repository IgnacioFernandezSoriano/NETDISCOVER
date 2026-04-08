import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Lang = 'en' | 'es' | 'fr' | 'ar' | 'ru'

export const RTL_LANGS: Lang[] = ['ar']

interface I18nContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
  isRTL: boolean
}

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Navbar
    'nav.assessment': 'Assessment',
    'nav.benchmark': 'Benchmark',
    'nav.market': 'Market',
    'nav.start': 'Start Assessment',

    // Home hero
    'home.badge': 'ONE for Regulators · Universal Postal Union Framework',
    'home.hero.title1': 'Postal Quality',
    'home.hero.title2': 'Maturity Assessment',
    'home.hero.subtitle': 'Evaluate your organization\'s readiness to measure, regulate and improve postal service quality. Based on the UPU regulatory roadmap — 8 phases, instant results, AI-powered analysis.',
    'home.hero.cta': 'Begin Assessment',
    'home.hero.benchmark': 'View Benchmark',
    'home.hero.stat1': '8 Phases',
    'home.hero.stat1sub': 'structured evaluation',
    'home.hero.stat2': '~10 min',
    'home.hero.stat2sub': 'to complete',
    'home.hero.stat3': 'Free',
    'home.hero.stat3sub': 'no registration',

    // Home features
    'home.features.title': 'Everything you need to assess postal maturity',
    'home.features.label': 'Platform capabilities',
    'home.feat1.title': '8-Phase Assessment',
    'home.feat1.desc': 'Structured evaluation across the full postal quality maturity roadmap.',
    'home.feat2.title': 'Instant Scoring',
    'home.feat2.desc': 'Automatic calculation of global and per-phase maturity scores.',
    'home.feat3.title': 'AI Analysis',
    'home.feat3.desc': 'Deep technical and commercial analysis powered by LLM.',
    'home.feat4.title': 'Global Benchmark',
    'home.feat4.desc': 'Compare your scores against anonymized global data.',
    'home.feat5.title': 'No Registration',
    'home.feat5.desc': 'Start immediately. Save progress with a unique token.',
    'home.feat6.title': 'Action Plan',
    'home.feat6.desc': 'Prioritized roadmap with effort, impact and timeline.',

    // Home phases
    'home.phases.label': 'Assessment structure',
    'home.phases.title': 'Eight phases of postal quality maturity',

    // Home maturity
    'home.maturity.label': 'Maturity framework',
    'home.maturity.title': 'Five levels of maturity',

    // Home CTA
    'home.cta.title': 'Ready to assess your maturity?',
    'home.cta.sub': '10 minutes. 40 questions. Instant results. No registration required to start.',
    'home.cta.btn': 'Begin the Assessment',

    // Assessment
    'assessment.title': 'Postal Quality Maturity Assessment',
    'assessment.loading': 'Loading assessment...',
    'assessment.error': 'Failed to load assessment',
    'assessment.error.hint': 'Make sure Supabase environment variables are configured correctly.',
    'assessment.complete': '% complete',
    'assessment.prev': 'Previous',
    'assessment.next': 'Next Phase',
    'assessment.finish': 'Complete & View Results',
    'assessment.context': 'Context phase — not scored',
    'assessment.resume.title': 'Resume a previous assessment',
    'assessment.resume.token.placeholder': 'Enter your session token...',
    'assessment.resume.email.placeholder': 'Or enter your email address...',
    'assessment.resume.btn': 'Restore',
    'assessment.resume.error': 'Session not found. Please check and try again.',
    'assessment.saved': 'Progress saved. Your token:',
    'assessment.saved.hint': 'Save this token or use your email to resume later.',
    'assessment.scale.1': 'Does not exist',
    'assessment.scale.2': 'Initial / Basic',
    'assessment.scale.3': 'Established',
    'assessment.scale.4': 'Advanced / Optimized',

    // Profile modal
    'profile.title': 'Complete Your Profile',
    'profile.sub': 'This information personalizes your analysis report.',
    'profile.name': 'Full Name',
    'profile.org': 'Organization',
    'profile.country': 'Country',
    'profile.type': 'Entity Type',
    'profile.type.regulator': 'Postal Regulator',
    'profile.type.operator': 'Designated Operator',
    'profile.email': 'Email (optional)',
    'profile.email.hint': 'To receive your report and resume your assessment',
    'profile.back': 'Back',
    'profile.submit': 'View My Results',
    'profile.processing': 'Processing...',

    // Results
    'results.title': 'Your Assessment Results',
    'results.maturity': 'Overall Maturity Score',
    'results.phases': 'Phase Scores',
    'results.gaps': 'Priority Gaps',
    'results.action': 'Action Plan',
    'results.download': 'Download Report',
    'results.restart': 'New Assessment',
    'results.benchmark': 'View Benchmark',

    // Benchmark
    'benchmark.title': 'Global Benchmark',
    'benchmark.sub': 'Compare your results against anonymized global data',

    // Market
    'market.title': 'Solution Providers',
    'market.sub': 'Discover ONE-endorsed solutions for postal quality measurement',

    // Footer
    'footer.rights': 'All rights reserved.',
    'footer.powered': 'Powered by ONE for Regulators · Universal Postal Union',
  },

  es: {
    'nav.assessment': 'Evaluación',
    'nav.benchmark': 'Benchmark',
    'nav.market': 'Mercado',
    'nav.start': 'Iniciar Evaluación',

    'home.badge': 'ONE para Reguladores · Marco de la Unión Postal Universal',
    'home.hero.title1': 'Evaluación de Madurez',
    'home.hero.title2': 'de Calidad Postal',
    'home.hero.subtitle': 'Evalúe la capacidad de su organización para medir, regular y mejorar la calidad del servicio postal. Basado en la hoja de ruta regulatoria de la UPU — 8 fases, resultados instantáneos, análisis con IA.',
    'home.hero.cta': 'Iniciar Evaluación',
    'home.hero.benchmark': 'Ver Benchmark',
    'home.hero.stat1': '8 Fases',
    'home.hero.stat1sub': 'evaluación estructurada',
    'home.hero.stat2': '~10 min',
    'home.hero.stat2sub': 'para completar',
    'home.hero.stat3': 'Gratuito',
    'home.hero.stat3sub': 'sin registro',

    'home.features.title': 'Todo lo que necesita para evaluar la madurez postal',
    'home.features.label': 'Capacidades de la plataforma',
    'home.feat1.title': 'Evaluación de 8 Fases',
    'home.feat1.desc': 'Evaluación estructurada a lo largo de toda la hoja de ruta de madurez de calidad postal.',
    'home.feat2.title': 'Puntuación Instantánea',
    'home.feat2.desc': 'Cálculo automático de puntuaciones de madurez globales y por fase.',
    'home.feat3.title': 'Análisis con IA',
    'home.feat3.desc': 'Análisis técnico y comercial profundo impulsado por LLM.',
    'home.feat4.title': 'Benchmark Global',
    'home.feat4.desc': 'Compare sus puntuaciones con datos globales anonimizados.',
    'home.feat5.title': 'Sin Registro',
    'home.feat5.desc': 'Comience de inmediato. Guarde el progreso con un token único.',
    'home.feat6.title': 'Plan de Acción',
    'home.feat6.desc': 'Hoja de ruta priorizada con esfuerzo, impacto y plazos.',

    'home.phases.label': 'Estructura de la evaluación',
    'home.phases.title': 'Ocho fases de madurez de calidad postal',
    'home.maturity.label': 'Marco de madurez',
    'home.maturity.title': 'Cinco niveles de madurez',
    'home.cta.title': '¿Listo para evaluar su madurez?',
    'home.cta.sub': '10 minutos. 40 preguntas. Resultados instantáneos. No se requiere registro para comenzar.',
    'home.cta.btn': 'Iniciar la Evaluación',

    'assessment.title': 'Evaluación de Madurez de Calidad Postal',
    'assessment.loading': 'Cargando evaluación...',
    'assessment.error': 'Error al cargar la evaluación',
    'assessment.error.hint': 'Asegúrese de que las variables de entorno de Supabase estén configuradas correctamente.',
    'assessment.complete': '% completado',
    'assessment.prev': 'Anterior',
    'assessment.next': 'Siguiente Fase',
    'assessment.finish': 'Completar y Ver Resultados',
    'assessment.context': 'Fase de contexto — no puntuada',
    'assessment.resume.title': 'Retomar una evaluación anterior',
    'assessment.resume.token.placeholder': 'Ingrese su token de sesión...',
    'assessment.resume.email.placeholder': 'O ingrese su dirección de email...',
    'assessment.resume.btn': 'Restaurar',
    'assessment.resume.error': 'Sesión no encontrada. Por favor verifique e intente de nuevo.',
    'assessment.saved': 'Progreso guardado. Su token:',
    'assessment.saved.hint': 'Guarde este token o use su email para retomar más tarde.',
    'assessment.scale.1': 'No existe',
    'assessment.scale.2': 'Inicial / Básico',
    'assessment.scale.3': 'Establecido',
    'assessment.scale.4': 'Avanzado / Optimizado',

    'profile.title': 'Complete su Perfil',
    'profile.sub': 'Esta información personaliza su informe de análisis.',
    'profile.name': 'Nombre Completo',
    'profile.org': 'Organización',
    'profile.country': 'País',
    'profile.type': 'Tipo de Entidad',
    'profile.type.regulator': 'Regulador Postal',
    'profile.type.operator': 'Operador Designado',
    'profile.email': 'Email (opcional)',
    'profile.email.hint': 'Para recibir su informe y retomar su evaluación',
    'profile.back': 'Volver',
    'profile.submit': 'Ver Mis Resultados',
    'profile.processing': 'Procesando...',

    'results.title': 'Sus Resultados de Evaluación',
    'results.maturity': 'Puntuación Global de Madurez',
    'results.phases': 'Puntuaciones por Fase',
    'results.gaps': 'Brechas Prioritarias',
    'results.action': 'Plan de Acción',
    'results.download': 'Descargar Informe',
    'results.restart': 'Nueva Evaluación',
    'results.benchmark': 'Ver Benchmark',

    'benchmark.title': 'Benchmark Global',
    'benchmark.sub': 'Compare sus resultados con datos globales anonimizados',
    'market.title': 'Proveedores de Soluciones',
    'market.sub': 'Descubra soluciones respaldadas por ONE para la medición de calidad postal',
    'footer.rights': 'Todos los derechos reservados.',
    'footer.powered': 'Desarrollado por ONE para Reguladores · Unión Postal Universal',
  },

  fr: {
    'nav.assessment': 'Évaluation',
    'nav.benchmark': 'Benchmark',
    'nav.market': 'Marché',
    'nav.start': 'Démarrer l\'évaluation',

    'home.badge': 'ONE pour les Régulateurs · Cadre de l\'Union Postale Universelle',
    'home.hero.title1': 'Évaluation de Maturité',
    'home.hero.title2': 'de la Qualité Postale',
    'home.hero.subtitle': 'Évaluez la capacité de votre organisation à mesurer, réguler et améliorer la qualité du service postal. Basé sur la feuille de route réglementaire de l\'UPU — 8 phases, résultats instantanés, analyse par IA.',
    'home.hero.cta': 'Démarrer l\'évaluation',
    'home.hero.benchmark': 'Voir le Benchmark',
    'home.hero.stat1': '8 Phases',
    'home.hero.stat1sub': 'évaluation structurée',
    'home.hero.stat2': '~10 min',
    'home.hero.stat2sub': 'pour compléter',
    'home.hero.stat3': 'Gratuit',
    'home.hero.stat3sub': 'sans inscription',

    'home.features.title': 'Tout ce dont vous avez besoin pour évaluer la maturité postale',
    'home.features.label': 'Capacités de la plateforme',
    'home.feat1.title': 'Évaluation en 8 Phases',
    'home.feat1.desc': 'Évaluation structurée sur l\'ensemble de la feuille de route de maturité de la qualité postale.',
    'home.feat2.title': 'Score Instantané',
    'home.feat2.desc': 'Calcul automatique des scores de maturité globaux et par phase.',
    'home.feat3.title': 'Analyse par IA',
    'home.feat3.desc': 'Analyse technique et commerciale approfondie par LLM.',
    'home.feat4.title': 'Benchmark Mondial',
    'home.feat4.desc': 'Comparez vos scores avec des données mondiales anonymisées.',
    'home.feat5.title': 'Sans Inscription',
    'home.feat5.desc': 'Commencez immédiatement. Sauvegardez avec un token unique.',
    'home.feat6.title': 'Plan d\'Action',
    'home.feat6.desc': 'Feuille de route priorisée avec effort, impact et calendrier.',

    'home.phases.label': 'Structure de l\'évaluation',
    'home.phases.title': 'Huit phases de maturité de la qualité postale',
    'home.maturity.label': 'Cadre de maturité',
    'home.maturity.title': 'Cinq niveaux de maturité',
    'home.cta.title': 'Prêt à évaluer votre maturité?',
    'home.cta.sub': '10 minutes. 40 questions. Résultats instantanés. Aucune inscription requise.',
    'home.cta.btn': 'Démarrer l\'évaluation',

    'assessment.title': 'Évaluation de Maturité de la Qualité Postale',
    'assessment.loading': 'Chargement de l\'évaluation...',
    'assessment.error': 'Échec du chargement de l\'évaluation',
    'assessment.error.hint': 'Assurez-vous que les variables d\'environnement Supabase sont correctement configurées.',
    'assessment.complete': '% complété',
    'assessment.prev': 'Précédent',
    'assessment.next': 'Phase Suivante',
    'assessment.finish': 'Terminer et Voir les Résultats',
    'assessment.context': 'Phase de contexte — non notée',
    'assessment.resume.title': 'Reprendre une évaluation précédente',
    'assessment.resume.token.placeholder': 'Entrez votre token de session...',
    'assessment.resume.email.placeholder': 'Ou entrez votre adresse email...',
    'assessment.resume.btn': 'Restaurer',
    'assessment.resume.error': 'Session introuvable. Veuillez vérifier et réessayer.',
    'assessment.saved': 'Progression sauvegardée. Votre token:',
    'assessment.saved.hint': 'Sauvegardez ce token ou utilisez votre email pour reprendre plus tard.',
    'assessment.scale.1': 'N\'existe pas',
    'assessment.scale.2': 'Initial / Basique',
    'assessment.scale.3': 'Établi',
    'assessment.scale.4': 'Avancé / Optimisé',

    'profile.title': 'Complétez Votre Profil',
    'profile.sub': 'Ces informations personnalisent votre rapport d\'analyse.',
    'profile.name': 'Nom Complet',
    'profile.org': 'Organisation',
    'profile.country': 'Pays',
    'profile.type': 'Type d\'Entité',
    'profile.type.regulator': 'Régulateur Postal',
    'profile.type.operator': 'Opérateur Désigné',
    'profile.email': 'Email (optionnel)',
    'profile.email.hint': 'Pour recevoir votre rapport et reprendre votre évaluation',
    'profile.back': 'Retour',
    'profile.submit': 'Voir Mes Résultats',
    'profile.processing': 'Traitement...',

    'results.title': 'Vos Résultats d\'Évaluation',
    'results.maturity': 'Score de Maturité Global',
    'results.phases': 'Scores par Phase',
    'results.gaps': 'Lacunes Prioritaires',
    'results.action': 'Plan d\'Action',
    'results.download': 'Télécharger le Rapport',
    'results.restart': 'Nouvelle Évaluation',
    'results.benchmark': 'Voir le Benchmark',

    'benchmark.title': 'Benchmark Mondial',
    'benchmark.sub': 'Comparez vos résultats avec des données mondiales anonymisées',
    'market.title': 'Fournisseurs de Solutions',
    'market.sub': 'Découvrez les solutions approuvées par ONE pour la mesure de la qualité postale',
    'footer.rights': 'Tous droits réservés.',
    'footer.powered': 'Propulsé par ONE pour les Régulateurs · Union Postale Universelle',
  },

  ar: {
    'nav.assessment': 'التقييم',
    'nav.benchmark': 'المعيار المرجعي',
    'nav.market': 'السوق',
    'nav.start': 'بدء التقييم',

    'home.badge': 'ONE للمنظمين · إطار الاتحاد البريدي العالمي',
    'home.hero.title1': 'المعيار المرجعي للجودة',
    'home.hero.title2': '2026 للمنظمين البريديين',
    'home.hero.subtitle': 'تُطلق ONE للمنظمين، برنامج التميز التنظيمي التابع للاتحاد البريدي العالمي، أشمل دراسة عالمية حول نضج قياس جودة الخدمة البريدية — مصممة حصرياً للمنظمين البريديين الوطنيين وجمعياتهم.',
    'home.hero.cta': 'المشاركة في الدراسة',
    'home.hero.benchmark': 'عرض المعيار المرجعي',
    'home.hero.stat1': '+80',
    'home.hero.stat1sub': 'دولة مستهدفة',
    'home.hero.stat2': 'مجاني',
    'home.hero.stat2sub': 'للمنظمين',
    'home.hero.stat3': '2026',
    'home.hero.stat3sub': 'تقرير المعيار المرجعي',

    'home.features.title': 'كل ما تحتاجه لتقييم النضج البريدي',
    'home.features.label': 'قدرات المنصة',
    'home.feat1.title': 'تقييم 8 مراحل',
    'home.feat1.desc': 'تقييم منظم عبر خارطة طريق النضج الكاملة لجودة الخدمة البريدية.',
    'home.feat2.title': 'نتائج فورية',
    'home.feat2.desc': 'حساب تلقائي لدرجات النضج العالمية ولكل مرحلة.',
    'home.feat3.title': 'تحليل بالذكاء الاصطناعي',
    'home.feat3.desc': 'تحليل تقني وتجاري معمق مدعوم بنماذج اللغة الكبيرة.',
    'home.feat4.title': 'المعيار المرجعي العالمي',
    'home.feat4.desc': 'قارن درجاتك مع بيانات عالمية مجهولة المصدر.',
    'home.feat5.title': 'بدون تسجيل',
    'home.feat5.desc': 'ابدأ فوراً. احفظ التقدم برمز فريد.',
    'home.feat6.title': 'خطة العمل',
    'home.feat6.desc': 'خارطة طريق ذات أولويات مع الجهد والتأثير والجدول الزمني.',

    'home.phases.label': 'هيكل التقييم',
    'home.phases.title': 'ثماني مراحل لنضج جودة الخدمة البريدية',
    'home.maturity.label': 'إطار النضج',
    'home.maturity.title': 'خمسة مستويات للنضج',
    'home.cta.title': 'هل أنت مستعد للمشاركة؟',
    'home.cta.sub': 'يستغرق التقييم حوالي 10 دقائق. نتائجك متاحة فوراً. لا يلزم التسجيل للبدء.',
    'home.cta.btn': 'بدء التقييم',

    'assessment.title': 'تقييم نضج جودة الخدمة البريدية',
    'assessment.loading': 'جارٍ تحميل التقييم...',
    'assessment.error': 'فشل تحميل التقييم',
    'assessment.error.hint': 'تأكد من تكوين متغيرات بيئة Supabase بشكل صحيح.',
    'assessment.complete': '% مكتمل',
    'assessment.prev': 'السابق',
    'assessment.next': 'المرحلة التالية',
    'assessment.finish': 'إكمال وعرض النتائج',
    'assessment.context': 'مرحلة السياق — غير مُقيَّمة',
    'assessment.resume.title': 'استئناف تقييم سابق',
    'assessment.resume.token.placeholder': 'أدخل رمز الجلسة...',
    'assessment.resume.email.placeholder': 'أو أدخل عنوان بريدك الإلكتروني...',
    'assessment.resume.btn': 'استعادة',
    'assessment.resume.error': 'الجلسة غير موجودة. يرجى التحقق والمحاولة مرة أخرى.',
    'assessment.saved': 'تم حفظ التقدم. رمزك:',
    'assessment.saved.hint': 'احفظ هذا الرمز أو استخدم بريدك الإلكتروني للاستئناف لاحقاً.',
    'assessment.scale.1': 'غير موجود',
    'assessment.scale.2': 'أولي / أساسي',
    'assessment.scale.3': 'راسخ',
    'assessment.scale.4': 'متقدم / محسَّن',

    'profile.title': 'أكمل ملفك الشخصي',
    'profile.sub': 'تُخصص هذه المعلومات تقرير التحليل الخاص بك.',
    'profile.name': 'الاسم الكامل',
    'profile.org': 'المنظمة',
    'profile.country': 'الدولة',
    'profile.type': 'نوع الجهة',
    'profile.type.regulator': 'منظم بريدي',
    'profile.type.operator': 'مشغل مُعيَّن',
    'profile.email': 'البريد الإلكتروني (اختياري)',
    'profile.email.hint': 'لاستلام تقريرك واستئناف تقييمك',
    'profile.back': 'رجوع',
    'profile.submit': 'عرض نتائجي',
    'profile.processing': 'جارٍ المعالجة...',

    'results.title': 'نتائج تقييمك',
    'results.maturity': 'درجة النضج الإجمالية',
    'results.phases': 'درجات المراحل',
    'results.gaps': 'الفجوات ذات الأولوية',
    'results.action': 'خطة العمل',
    'results.download': 'تنزيل التقرير',
    'results.restart': 'تقييم جديد',
    'results.benchmark': 'عرض المعيار المرجعي',

    'benchmark.title': 'المعيار المرجعي العالمي',
    'benchmark.sub': 'قارن نتائجك مع بيانات عالمية مجهولة المصدر',
    'market.title': 'مزودو الحلول',
    'market.sub': 'اكتشف الحلول المعتمدة من ONE لقياس جودة الخدمة البريدية',
    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.powered': 'مدعوم من ONE للمنظمين · الاتحاد البريدي العالمي',
  },

  ru: {
    'nav.assessment': 'Оценка',
    'nav.benchmark': 'Бенчмарк',
    'nav.market': 'Рынок',
    'nav.start': 'Начать оценку',

    'home.badge': 'ONE для регуляторов · Рамочная программа ВПС',
    'home.hero.title1': 'Эталонный показатель качества',
    'home.hero.title2': '2026 для почтовых регуляторов',
    'home.hero.subtitle': 'ONE для регуляторов, программа регуляторного совершенства ВПС, запускает наиболее полное глобальное исследование зрелости измерения качества почтовых услуг — разработанное исключительно для национальных почтовых регуляторов и их ассоциаций.',
    'home.hero.cta': 'Участвовать в исследовании',
    'home.hero.benchmark': 'Просмотреть бенчмарк',
    'home.hero.stat1': '80+',
    'home.hero.stat1sub': 'целевых стран',
    'home.hero.stat2': 'Бесплатно',
    'home.hero.stat2sub': 'для регуляторов',
    'home.hero.stat3': '2026',
    'home.hero.stat3sub': 'отчёт бенчмарка',

    'home.features.title': 'Всё необходимое для оценки почтовой зрелости',
    'home.features.label': 'Возможности платформы',
    'home.feat1.title': 'Оценка по 8 фазам',
    'home.feat1.desc': 'Структурированная оценка по всей дорожной карте зрелости качества почтовых услуг.',
    'home.feat2.title': 'Мгновенная оценка',
    'home.feat2.desc': 'Автоматический расчёт глобальных показателей зрелости и по каждой фазе.',
    'home.feat3.title': 'Анализ на основе ИИ',
    'home.feat3.desc': 'Глубокий технический и коммерческий анализ на основе LLM.',
    'home.feat4.title': 'Глобальный бенчмарк',
    'home.feat4.desc': 'Сравните свои показатели с анонимизированными глобальными данными.',
    'home.feat5.title': 'Без регистрации',
    'home.feat5.desc': 'Начните немедленно. Сохраняйте прогресс с уникальным токеном.',
    'home.feat6.title': 'План действий',
    'home.feat6.desc': 'Приоритизированная дорожная карта с усилиями, влиянием и сроками.',

    'home.phases.label': 'Структура оценки',
    'home.phases.title': 'Восемь фаз зрелости качества почтовых услуг',
    'home.maturity.label': 'Система зрелости',
    'home.maturity.title': 'Пять уровней зрелости',
    'home.cta.title': 'Готовы принять участие?',
    'home.cta.sub': 'Оценка занимает около 10 минут. Результаты доступны немедленно. Регистрация не требуется.',
    'home.cta.btn': 'Начать оценку',

    'assessment.title': 'Оценка зрелости качества почтовых услуг',
    'assessment.loading': 'Загрузка оценки...',
    'assessment.error': 'Не удалось загрузить оценку',
    'assessment.error.hint': 'Убедитесь, что переменные среды Supabase настроены правильно.',
    'assessment.complete': '% завершено',
    'assessment.prev': 'Назад',
    'assessment.next': 'Следующая фаза',
    'assessment.finish': 'Завершить и просмотреть результаты',
    'assessment.context': 'Контекстная фаза — не оценивается',
    'assessment.resume.title': 'Возобновить предыдущую оценку',
    'assessment.resume.token.placeholder': 'Введите токен сессии...',
    'assessment.resume.email.placeholder': 'Или введите адрес электронной почты...',
    'assessment.resume.btn': 'Восстановить',
    'assessment.resume.error': 'Сессия не найдена. Пожалуйста, проверьте и попробуйте снова.',
    'assessment.saved': 'Прогресс сохранён. Ваш токен:',
    'assessment.saved.hint': 'Сохраните этот токен или используйте email для возобновления позже.',
    'assessment.scale.1': 'Не существует',
    'assessment.scale.2': 'Начальный / Базовый',
    'assessment.scale.3': 'Установленный',
    'assessment.scale.4': 'Продвинутый / Оптимизированный',

    'profile.title': 'Заполните свой профиль',
    'profile.sub': 'Эта информация персонализирует ваш аналитический отчёт.',
    'profile.name': 'Полное имя',
    'profile.org': 'Организация',
    'profile.country': 'Страна',
    'profile.type': 'Тип организации',
    'profile.type.regulator': 'Почтовый регулятор',
    'profile.type.operator': 'Назначенный оператор',
    'profile.email': 'Email (необязательно)',
    'profile.email.hint': 'Для получения отчёта и возобновления оценки',
    'profile.back': 'Назад',
    'profile.submit': 'Просмотреть мои результаты',
    'profile.processing': 'Обработка...',

    'results.title': 'Результаты вашей оценки',
    'results.maturity': 'Общий показатель зрелости',
    'results.phases': 'Показатели по фазам',
    'results.gaps': 'Приоритетные пробелы',
    'results.action': 'План действий',
    'results.download': 'Скачать отчёт',
    'results.restart': 'Новая оценка',
    'results.benchmark': 'Просмотреть бенчмарк',

    'benchmark.title': 'Глобальный бенчмарк',
    'benchmark.sub': 'Сравните свои результаты с анонимизированными глобальными данными',
    'market.title': 'Поставщики решений',
    'market.sub': 'Откройте для себя одобренные ONE решения для измерения качества почтовых услуг',
    'footer.rights': 'Все права защищены.',
    'footer.powered': 'Разработано ONE для регуляторов · Всемирный почтовый союз',
  },
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
  isRTL: false,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('nd_lang') as Lang | null
    return saved ?? 'en'
  })

  const isRTL = RTL_LANGS.includes(lang)

  // Apply RTL direction to the document
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
    // Load Arabic font if needed
    if (lang === 'ar') {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700;800;900&display=swap'
      link.id = 'arabic-font'
      if (!document.getElementById('arabic-font')) {
        document.head.appendChild(link)
      }
      document.documentElement.style.fontFamily = "'Noto Sans Arabic', 'Inter', sans-serif"
    } else {
      document.documentElement.style.fontFamily = "'Inter', system-ui, sans-serif"
    }
  }, [lang, isRTL])

  const setLang = (l: Lang) => {
    localStorage.setItem('nd_lang', l)
    setLangState(l)
  }

  const t = (key: string): string => {
    return translations[lang][key] ?? translations['en'][key] ?? key
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}

// Helper to get text from a DB record based on current lang
export function getLocalizedText(record: Record<string, unknown>, field: string, lang: Lang): string {
  const langKey = `${field}_${lang}`
  const enKey = `${field}_en`
  return (record[langKey] as string) || (record[enKey] as string) || ''
}
