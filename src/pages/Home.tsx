import { useNavigate } from 'react-router-dom'
import { BarChart3, TrendingUp, Globe, Award, Shield, ArrowRight, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useI18n } from '../lib/i18n'

// ── Copy by language ──────────────────────────────────────────
const COPY = {
  en: {
    eyebrow: 'ONE for Regulators · Universal Postal Union',
    heroTitle1: 'Postal Quality Measurement',
    heroTitle2: 'Maturity Benchmark 2026',
    heroSub: 'A global study on the state of postal quality measurement, conducted by ONE for Regulators — the solution developed by the Universal Postal Union to support national postal regulators in understanding, monitoring and improving the quality of postal services in their country.',
    heroCta: 'Begin the Self-Assessment',
    heroSecondary: 'View Benchmark Data',

    contextLabel: 'About this study',
    contextTitle: 'Understanding where postal regulators stand on quality measurement',
    contextP1: 'The capacity to measure, monitor and enforce postal service quality varies significantly across regulatory authorities worldwide. While some regulators have developed sophisticated measurement frameworks, many others are at earlier stages of this journey.',
    contextP2: 'ONE for Regulators, the solution developed by the Universal Postal Union to support national postal regulators in understanding, monitoring and improving postal quality, has developed this structured self-assessment tool to help regulators understand their current level of maturity across eight key dimensions of postal quality measurement.',
    contextP3: 'The results of this study will contribute to the 2026 ONE for Regulators Benchmark Report — a reference document for the global postal regulatory community.',

    whatLabel: 'What this study offers',
    whatTitle: 'A structured assessment with immediate, actionable results',
    whatItems: [
      {
        icon: BarChart3,
        title: 'Individual Maturity Assessment',
        desc: 'Complete a structured self-assessment across 8 phases of postal quality measurement maturity. Receive an immediate score with a detailed breakdown by phase and identification of priority gaps.',
      },
      {
        icon: TrendingUp,
        title: 'Pathway to the Next Level',
        desc: 'Based on your current maturity level, receive a tailored set of recommendations and a prioritized action plan indicating the concrete steps required to progress to the next stage.',
      },
      {
        icon: Globe,
        title: 'Regional Comparative Study',
        desc: 'Your anonymized results contribute to a regional and global benchmark. The aggregated data will be published in the 2026 ONE for Regulators Benchmark Report, enabling peer comparison across regions.',
      },
      {
        icon: Award,
        title: '2026 Benchmark Report',
        desc: 'Participating organizations will receive the full ONE for Regulators 2026 Postal Quality Measurement Benchmark Report upon publication.',
      },
      {
        icon: Shield,
        title: 'Strictly Confidential',
        desc: 'Individual responses are strictly confidential. Only aggregated, anonymized data is used for the regional and global benchmark. No individual results are shared without explicit consent.',
      },
    ],

    howLabel: 'How it works',
    howTitle: 'Four steps from self-assessment to benchmark results',
    howSteps: [
      { num: '01', title: 'Self-Assessment', desc: 'Complete a structured 40-question evaluation across 8 phases of postal quality measurement maturity. The assessment takes approximately 10 minutes.' },
      { num: '02', title: 'Immediate Results', desc: 'Receive your maturity score immediately upon completion — with a phase-by-phase breakdown, identified gaps, and a prioritized action plan for your organization.' },
      { num: '03', title: 'Pathway to Next Level', desc: 'Review the specific actions and milestones required to progress from your current maturity level to the next stage, tailored to your regulatory context.' },
      { num: '04', title: 'Regional Benchmark', desc: 'Your anonymized data contributes to the 2026 regional benchmark study. Participating regulators receive the full benchmark report upon publication.' },
    ],

    timelineLabel: 'Study timeline',
    timelineTitle: 'Data collection: March — May 2026',
    timelineItems: [
      { date: 'March 2026', label: 'Data collection opens', active: true },
      { date: 'April 2026', label: 'Interim results available to participants', active: false },
      { date: 'May 2026', label: 'Data collection closes', active: false },
      { date: 'June 2026', label: 'Benchmark report published', active: false },
    ],

    ctaTitle: 'Begin your self-assessment',
    ctaSub: 'The assessment takes approximately 10 minutes. Results are available immediately. No registration is required to start.',
    ctaBtn: 'Start the Assessment',
    ctaNote: 'Strictly confidential · No registration required · Immediate results',
  },

  es: {
    eyebrow: 'ONE para Reguladores · Unión Postal Universal',
    heroTitle1: 'Medición de Calidad Postal',
    heroTitle2: 'Benchmark de Madurez 2026',
    heroSub: 'Un estudio global sobre el estado de la medición de calidad postal, realizado por ONE para Reguladores — la solución desarrollada por la Unión Postal Universal para dar soporte a los reguladores postales nacionales en el conocimiento, seguimiento e incremento de la calidad postal del país.',
    heroCta: 'Iniciar la Autoevaluación',
    heroSecondary: 'Ver Datos del Benchmark',

    contextLabel: 'Sobre este estudio',
    contextTitle: 'Comprender la situación de los reguladores postales en materia de medición de calidad',
    contextP1: 'La capacidad de medir, monitorear y hacer cumplir la calidad del servicio postal varía significativamente entre las autoridades reguladoras de todo el mundo. Mientras que algunos reguladores han desarrollado marcos de medición sofisticados, muchos otros se encuentran en etapas más tempranas de este proceso.',
    contextP2: 'ONE para Reguladores, la solución desarrollada por la Unión Postal Universal para dar soporte a los reguladores postales nacionales en el conocimiento, seguimiento e incremento de la calidad postal del país, ha desarrollado esta herramienta de autoevaluación estructurada para ayudar a los reguladores a comprender su nivel actual de madurez en ocho dimensiones clave de la medición de calidad postal.',
    contextP3: 'Los resultados de este estudio contribuirán al Informe Benchmark 2026 de ONE para Reguladores — un documento de referencia para la comunidad regulatoria postal mundial.',

    whatLabel: 'Qué ofrece este estudio',
    whatTitle: 'Una evaluación estructurada con resultados inmediatos y accionables',
    whatItems: [
      {
        icon: BarChart3,
        title: 'Evaluación de Madurez Individual',
        desc: 'Complete una autoevaluación estructurada en 8 fases de madurez de medición de calidad postal. Reciba una puntuación inmediata con un desglose detallado por fase e identificación de brechas prioritarias.',
      },
      {
        icon: TrendingUp,
        title: 'Camino al Siguiente Nivel',
        desc: 'Basándose en su nivel de madurez actual, reciba un conjunto de recomendaciones personalizadas y un plan de acción priorizado que indica los pasos concretos necesarios para avanzar al siguiente nivel.',
      },
      {
        icon: Globe,
        title: 'Estudio Comparativo Regional',
        desc: 'Sus resultados anonimizados contribuyen a un benchmark regional y global. Los datos agregados se publicarán en el Informe Benchmark 2026 de ONE para Reguladores, permitiendo la comparación entre pares de distintas regiones.',
      },
      {
        icon: Award,
        title: 'Informe Benchmark 2026',
        desc: 'Las organizaciones participantes recibirán el Informe Benchmark completo de Medición de Calidad Postal ONE para Reguladores 2026 en el momento de su publicación.',
      },
      {
        icon: Shield,
        title: 'Estrictamente Confidencial',
        desc: 'Las respuestas individuales son estrictamente confidenciales. Solo se utilizan datos agregados y anonimizados para el benchmark regional y global. No se comparten resultados individuales sin consentimiento explícito.',
      },
    ],

    howLabel: 'Cómo funciona',
    howTitle: 'Cuatro pasos de la autoevaluación a los resultados del benchmark',
    howSteps: [
      { num: '01', title: 'Autoevaluación', desc: 'Complete una evaluación estructurada de 40 preguntas en 8 fases de madurez de medición de calidad postal. La evaluación toma aproximadamente 10 minutos.' },
      { num: '02', title: 'Resultados Inmediatos', desc: 'Reciba su puntuación de madurez inmediatamente al finalizar — con un desglose por fase, brechas identificadas y un plan de acción priorizado para su organización.' },
      { num: '03', title: 'Camino al Siguiente Nivel', desc: 'Revise las acciones e hitos específicos necesarios para avanzar desde su nivel de madurez actual al siguiente, adaptados a su contexto regulatorio.' },
      { num: '04', title: 'Benchmark Regional', desc: 'Sus datos anonimizados contribuyen al estudio benchmark regional 2026. Los reguladores participantes reciben el informe benchmark completo en el momento de su publicación.' },
    ],

    timelineLabel: 'Calendario del estudio',
    timelineTitle: 'Recogida de datos: Marzo — Mayo 2026',
    timelineItems: [
      { date: 'Marzo 2026', label: 'Apertura de la recogida de datos', active: true },
      { date: 'Abril 2026', label: 'Resultados provisionales disponibles para participantes', active: false },
      { date: 'Mayo 2026', label: 'Cierre de la recogida de datos', active: false },
      { date: 'Junio 2026', label: 'Publicación del informe benchmark', active: false },
    ],

    ctaTitle: 'Inicie su autoevaluación',
    ctaSub: 'La evaluación toma aproximadamente 10 minutos. Los resultados están disponibles de inmediato. No se requiere registro para comenzar.',
    ctaBtn: 'Iniciar la Evaluación',
    ctaNote: 'Estrictamente confidencial · Sin registro · Resultados inmediatos',
  },

  fr: {
    eyebrow: 'ONE pour les Régulateurs · Union Postale Universelle',
    heroTitle1: 'Mesure de la Qualité Postale',
    heroTitle2: 'Benchmark de Maturité 2026',
    heroSub: 'Une étude mondiale sur l\'état de la mesure de la qualité postale, menée par ONE pour les Régulateurs — la solution développée par l\'Union Postale Universelle pour soutenir les régulateurs postaux nationaux dans la connaissance, le suivi et l\'amélioration de la qualité postale dans leur pays.',
    heroCta: 'Commencer l\'auto-évaluation',
    heroSecondary: 'Voir les données du benchmark',

    contextLabel: 'À propos de cette étude',
    contextTitle: 'Comprendre la situation des régulateurs postaux en matière de mesure de la qualité',
    contextP1: 'La capacité à mesurer, surveiller et faire respecter la qualité du service postal varie considérablement entre les autorités réglementaires dans le monde. Alors que certains régulateurs ont développé des cadres de mesure sophistiqués, beaucoup d\'autres en sont à des stades plus précoces de ce processus.',
    contextP2: 'ONE pour les Régulateurs, la solution développée par l\'Union Postale Universelle pour soutenir les régulateurs postaux nationaux dans la connaissance, le suivi et l\'amélioration de la qualité postale dans leur pays, a développé cet outil d\'auto-évaluation structuré pour aider les régulateurs à comprendre leur niveau actuel de maturité dans huit dimensions clés de la mesure de la qualité postale.',
    contextP3: 'Les résultats de cette étude contribueront au Rapport Benchmark 2026 de ONE pour les Régulateurs — un document de référence pour la communauté réglementaire postale mondiale.',

    whatLabel: 'Ce que cette étude offre',
    whatTitle: 'Une évaluation structurée avec des résultats immédiats et exploitables',
    whatItems: [
      {
        icon: BarChart3,
        title: 'Évaluation de Maturité Individuelle',
        desc: 'Complétez une auto-évaluation structurée en 8 phases de maturité de mesure de la qualité postale. Recevez un score immédiat avec une ventilation détaillée par phase et l\'identification des lacunes prioritaires.',
      },
      {
        icon: TrendingUp,
        title: 'Voie vers le Niveau Suivant',
        desc: 'Sur la base de votre niveau de maturité actuel, recevez un ensemble de recommandations personnalisées et un plan d\'action priorisé indiquant les étapes concrètes nécessaires pour progresser vers le niveau suivant.',
      },
      {
        icon: Globe,
        title: 'Étude Comparative Régionale',
        desc: 'Vos résultats anonymisés contribuent à un benchmark régional et mondial. Les données agrégées seront publiées dans le Rapport Benchmark 2026 de ONE pour les Régulateurs, permettant une comparaison entre pairs de différentes régions.',
      },
      {
        icon: Award,
        title: 'Rapport Benchmark 2026',
        desc: 'Les organisations participantes recevront le Rapport Benchmark complet de Mesure de la Qualité Postale ONE pour les Régulateurs 2026 lors de sa publication.',
      },
      {
        icon: Shield,
        title: 'Strictement Confidentiel',
        desc: 'Les réponses individuelles sont strictement confidentielles. Seules les données agrégées et anonymisées sont utilisées pour le benchmark régional et mondial. Aucun résultat individuel n\'est partagé sans consentement explicite.',
      },
    ],

    howLabel: 'Comment ça fonctionne',
    howTitle: 'Quatre étapes de l\'auto-évaluation aux résultats du benchmark',
    howSteps: [
      { num: '01', title: 'Auto-évaluation', desc: 'Complétez une évaluation structurée de 40 questions en 8 phases de maturité de mesure de la qualité postale. L\'évaluation prend environ 10 minutes.' },
      { num: '02', title: 'Résultats Immédiats', desc: 'Recevez votre score de maturité immédiatement à la fin — avec une ventilation par phase, les lacunes identifiées et un plan d\'action priorisé pour votre organisation.' },
      { num: '03', title: 'Voie vers le Niveau Suivant', desc: 'Examinez les actions et jalons spécifiques nécessaires pour progresser de votre niveau de maturité actuel au suivant, adaptés à votre contexte réglementaire.' },
      { num: '04', title: 'Benchmark Régional', desc: 'Vos données anonymisées contribuent à l\'étude benchmark régionale 2026. Les régulateurs participants reçoivent le rapport benchmark complet lors de sa publication.' },
    ],

    timelineLabel: 'Calendrier de l\'étude',
    timelineTitle: 'Collecte de données : Mars — Mai 2026',
    timelineItems: [
      { date: 'Mars 2026', label: 'Ouverture de la collecte de données', active: true },
      { date: 'Avril 2026', label: 'Résultats provisoires disponibles pour les participants', active: false },
      { date: 'Mai 2026', label: 'Clôture de la collecte de données', active: false },
      { date: 'Juin 2026', label: 'Publication du rapport benchmark', active: false },
    ],

    ctaTitle: 'Commencez votre auto-évaluation',
    ctaSub: 'L\'évaluation prend environ 10 minutes. Les résultats sont disponibles immédiatement. Aucune inscription n\'est requise pour commencer.',
    ctaBtn: 'Démarrer l\'évaluation',
    ctaNote: 'Strictement confidentiel · Sans inscription · Résultats immédiats',
  },

  ar: {
    eyebrow: 'ONE للمنظمين · الاتحاد البريدي العالمي',
    heroTitle1: 'قياس جودة الخدمة البريدية',
    heroTitle2: 'المعيار المرجعي للنضج 2026',
    heroSub: 'دراسة عالمية حول واقع قياس جودة الخدمة البريدية، تُجريها ONE للمنظمين — الحل الذي طوّره الاتحاد البريدي العالمي لدعم المنظمين البريديين الوطنيين في معرفة جودة الخدمة البريدية في بلدانهم ومتابعتها وتحسينها.',
    heroCta: 'بدء التقييم الذاتي',
    heroSecondary: 'عرض بيانات المعيار المرجعي',

    contextLabel: 'حول هذه الدراسة',
    contextTitle: 'فهم وضع المنظمين البريديين في مجال قياس الجودة',
    contextP1: 'تتفاوت القدرة على قياس جودة الخدمة البريدية ومراقبتها وإنفاذها تفاوتاً كبيراً بين الهيئات التنظيمية حول العالم. فبينما طوّر بعض المنظمين أُطراً متطورة للقياس، لا يزال كثيرون منهم في مراحل أولى من هذه المسيرة.',
    contextP2: 'طوّرت ONE للمنظمين، الحل الذي طوّره الاتحاد البريدي العالمي لدعم المنظمين البريديين الوطنيين في معرفة جودة الخدمة البريدية ومتابعتها وتحسينها، هذه الأداة المنظمة للتقييم الذاتي لمساعدة المنظمين على فهم مستوى نضجهم الحالي في ثمانية أبعاد رئيسية لقياس جودة الخدمة البريدية.',
    contextP3: 'ستُسهم نتائج هذه الدراسة في تقرير المعيار المرجعي 2026 لـ ONE للمنظمين — وثيقة مرجعية للمجتمع التنظيمي البريدي العالمي.',

    whatLabel: 'ما تقدمه هذه الدراسة',
    whatTitle: 'تقييم منظم بنتائج فورية وقابلة للتطبيق',
    whatItems: [
      {
        icon: BarChart3,
        title: 'تقييم النضج الفردي',
        desc: 'أكمل تقييماً ذاتياً منظماً في 8 مراحل من نضج قياس جودة الخدمة البريدية. احصل على درجة فورية مع تفصيل دقيق لكل مرحلة وتحديد الفجوات ذات الأولوية.',
      },
      {
        icon: TrendingUp,
        title: 'المسار نحو المستوى التالي',
        desc: 'بناءً على مستوى نضجك الحالي، احصل على مجموعة من التوصيات المخصصة وخطة عمل ذات أولويات تحدد الخطوات الملموسة اللازمة للتقدم إلى المرحلة التالية.',
      },
      {
        icon: Globe,
        title: 'دراسة مقارنة إقليمية',
        desc: 'تُسهم نتائجك المجهولة الهوية في معيار مرجعي إقليمي وعالمي. ستُنشر البيانات المجمّعة في تقرير المعيار المرجعي 2026 لـ ONE للمنظمين، مما يتيح المقارنة بين النظراء من مختلف المناطق.',
      },
      {
        icon: Award,
        title: 'تقرير المعيار المرجعي 2026',
        desc: 'ستتلقى المنظمات المشاركة تقرير المعيار المرجعي الكامل لقياس جودة الخدمة البريدية ONE للمنظمين 2026 عند نشره.',
      },
      {
        icon: Shield,
        title: 'سري تماماً',
        desc: 'الردود الفردية سرية تماماً. تُستخدم فقط البيانات المجمّعة والمجهولة الهوية للمعيار المرجعي الإقليمي والعالمي. لا تُشارَك النتائج الفردية دون موافقة صريحة.',
      },
    ],

    howLabel: 'كيف يعمل',
    howTitle: 'أربع خطوات من التقييم الذاتي إلى نتائج المعيار المرجعي',
    howSteps: [
      { num: '01', title: 'التقييم الذاتي', desc: 'أكمل تقييماً منظماً من 40 سؤالاً في 8 مراحل من نضج قياس جودة الخدمة البريدية. يستغرق التقييم حوالي 10 دقائق.' },
      { num: '02', title: 'نتائج فورية', desc: 'احصل على درجة نضجك فور الانتهاء — مع تفصيل لكل مرحلة والفجوات المحددة وخطة عمل ذات أولويات لمنظمتك.' },
      { num: '03', title: 'المسار نحو المستوى التالي', desc: 'راجع الإجراءات والمعالم المحددة اللازمة للتقدم من مستوى نضجك الحالي إلى المستوى التالي، المُكيَّفة مع سياقك التنظيمي.' },
      { num: '04', title: 'المعيار المرجعي الإقليمي', desc: 'تُسهم بياناتك المجهولة الهوية في دراسة المعيار المرجعي الإقليمي 2026. يتلقى المنظمون المشاركون تقرير المعيار المرجعي الكامل عند نشره.' },
    ],

    timelineLabel: 'الجدول الزمني للدراسة',
    timelineTitle: 'جمع البيانات: مارس — مايو 2026',
    timelineItems: [
      { date: 'مارس 2026', label: 'بدء جمع البيانات', active: true },
      { date: 'أبريل 2026', label: 'النتائج الأولية متاحة للمشاركين', active: false },
      { date: 'مايو 2026', label: 'إغلاق جمع البيانات', active: false },
      { date: 'يونيو 2026', label: 'نشر تقرير المعيار المرجعي', active: false },
    ],

    ctaTitle: 'ابدأ تقييمك الذاتي',
    ctaSub: 'يستغرق التقييم حوالي 10 دقائق. النتائج متاحة فوراً. لا يلزم التسجيل للبدء.',
    ctaBtn: 'بدء التقييم',
    ctaNote: 'سري تماماً · بدون تسجيل · نتائج فورية',
  },

  ru: {
    eyebrow: 'ONE для регуляторов · Всемирный почтовый союз',
    heroTitle1: 'Измерение качества почтовых услуг',
    heroTitle2: 'Эталонный показатель зрелости 2026',
    heroSub: 'Глобальное исследование состояния измерения качества почтовых услуг, проводимое ONE для регуляторов — решением, разработанным Всемирным почтовым союзом для поддержки национальных почтовых регуляторов в изучении, мониторинге и повышении качества почтовых услуг в их стране.',
    heroCta: 'Начать самооценку',
    heroSecondary: 'Просмотреть данные бенчмарка',

    contextLabel: 'Об этом исследовании',
    contextTitle: 'Понимание положения почтовых регуляторов в области измерения качества',
    contextP1: 'Способность измерять, контролировать и обеспечивать соблюдение качества почтовых услуг существенно варьируется среди регуляторных органов по всему миру. В то время как некоторые регуляторы разработали сложные системы измерения, многие другие находятся на более ранних этапах этого пути.',
    contextP2: 'ONE для регуляторов, решение, разработанное Всемирным почтовым союзом для поддержки национальных почтовых регуляторов в изучении, мониторинге и повышении качества почтовых услуг в их стране, разработало этот структурированный инструмент самооценки, чтобы помочь регуляторам понять их текущий уровень зрелости по восьми ключевым измерениям измерения качества почтовых услуг.',
    contextP3: 'Результаты этого исследования внесут вклад в Отчёт по бенчмарку 2026 ONE для регуляторов — справочный документ для мирового сообщества почтовых регуляторов.',

    whatLabel: 'Что предлагает это исследование',
    whatTitle: 'Структурированная оценка с немедленными, практически применимыми результатами',
    whatItems: [
      {
        icon: BarChart3,
        title: 'Индивидуальная оценка зрелости',
        desc: 'Пройдите структурированную самооценку по 8 фазам зрелости измерения качества почтовых услуг. Получите немедленную оценку с детальной разбивкой по фазам и выявлением приоритетных пробелов.',
      },
      {
        icon: TrendingUp,
        title: 'Путь к следующему уровню',
        desc: 'На основе вашего текущего уровня зрелости получите набор персонализированных рекомендаций и приоритизированный план действий, указывающий конкретные шаги для перехода на следующий уровень.',
      },
      {
        icon: Globe,
        title: 'Региональное сравнительное исследование',
        desc: 'Ваши анонимизированные результаты вносят вклад в региональный и глобальный бенчмарк. Агрегированные данные будут опубликованы в Отчёте по бенчмарку 2026 ONE для регуляторов.',
      },
      {
        icon: Award,
        title: 'Отчёт по бенчмарку 2026',
        desc: 'Участвующие организации получат полный Отчёт по бенчмарку измерения качества почтовых услуг ONE для регуляторов 2026 после его публикации.',
      },
      {
        icon: Shield,
        title: 'Строго конфиденциально',
        desc: 'Индивидуальные ответы строго конфиденциальны. Только агрегированные, анонимизированные данные используются для регионального и глобального бенчмарка. Индивидуальные результаты не передаются без явного согласия.',
      },
    ],

    howLabel: 'Как это работает',
    howTitle: 'Четыре шага от самооценки до результатов бенчмарка',
    howSteps: [
      { num: '01', title: 'Самооценка', desc: 'Пройдите структурированную оценку из 40 вопросов по 8 фазам зрелости измерения качества почтовых услуг. Оценка занимает около 10 минут.' },
      { num: '02', title: 'Немедленные результаты', desc: 'Получите оценку зрелости сразу после завершения — с разбивкой по фазам, выявленными пробелами и приоритизированным планом действий для вашей организации.' },
      { num: '03', title: 'Путь к следующему уровню', desc: 'Ознакомьтесь с конкретными действиями и этапами, необходимыми для перехода с текущего уровня зрелости на следующий, адаптированными к вашему регуляторному контексту.' },
      { num: '04', title: 'Региональный бенчмарк', desc: 'Ваши анонимизированные данные вносят вклад в региональное исследование бенчмарка 2026. Участвующие регуляторы получают полный отчёт по бенчмарку после его публикации.' },
    ],

    timelineLabel: 'График исследования',
    timelineTitle: 'Сбор данных: март — май 2026',
    timelineItems: [
      { date: 'Март 2026', label: 'Открытие сбора данных', active: true },
      { date: 'Апрель 2026', label: 'Предварительные результаты доступны участникам', active: false },
      { date: 'Май 2026', label: 'Закрытие сбора данных', active: false },
      { date: 'Июнь 2026', label: 'Публикация отчёта по бенчмарку', active: false },
    ],

    ctaTitle: 'Начните самооценку',
    ctaSub: 'Оценка занимает около 10 минут. Результаты доступны немедленно. Регистрация не требуется.',
    ctaBtn: 'Начать оценку',
    ctaNote: 'Строго конфиденциально · Без регистрации · Немедленные результаты',
  },
}

export default function Home() {
  const navigate = useNavigate()
  const { lang, isRTL } = useI18n()
  const c = (COPY as Record<string, typeof COPY.en>)[lang] ?? COPY.en

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 lg:py-28"
        style={{ background: 'var(--brand-navy)' }}
      >
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logos row */}
          <div className={`flex items-center gap-6 mb-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <img src="/upu-logo-white.png" alt="Universal Postal Union" className="h-12 w-auto object-contain rounded" style={{ maxWidth: '180px' }} />
            <div className="w-px h-8 bg-white/20" />
            <img src="/one-logo-white.png" alt="ONE for Regulators" className="h-12 w-auto object-contain" style={{ maxWidth: '180px' }} />
          </div>

          {/* Eyebrow */}
          <p className={`text-white/40 text-xs font-semibold uppercase tracking-widest mb-4 ${isRTL ? 'text-right' : ''}`}>
            {c.eyebrow}
          </p>

          {/* Title */}
          <h1 className={`text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-6 leading-tight max-w-3xl ${isRTL ? 'text-right' : ''}`}
            style={{ letterSpacing: '-0.02em' }}>
            {c.heroTitle1}
            <br />
            <span style={{ color: 'var(--brand-cyan)' }}>{c.heroTitle2}</span>
          </h1>

          <p className={`text-white/60 text-base leading-relaxed mb-10 max-w-2xl ${isRTL ? 'text-right' : ''}`}>
            {c.heroSub}
          </p>

          {/* CTAs */}
          <div className={`flex flex-wrap gap-4 mb-12 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => navigate('/assessment')}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-sm transition-all hover:opacity-90"
              style={{ background: 'var(--brand-red)' }}
            >
              {c.heroCta}
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/benchmark')}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white/80 rounded-sm border border-white/20 hover:border-white/40 hover:text-white transition-all"
            >
              {c.heroSecondary}
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 max-w-2xl" />
        </div>
      </section>

      {/* ── CONTEXT ──────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid lg:grid-cols-3 gap-12 ${isRTL ? 'text-right' : ''}`}>
            <div className="lg:col-span-1">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brand-red)' }}>
                {c.contextLabel}
              </p>
              <h2 className="text-2xl font-extrabold leading-snug" style={{ color: 'var(--brand-navy)' }}>
                {c.contextTitle}
              </h2>
            </div>
            <div className="lg:col-span-2 space-y-5">
              <p className="text-gray-600 leading-relaxed text-sm">{c.contextP1}</p>
              <p className="text-gray-600 leading-relaxed text-sm">{c.contextP2}</p>
              <p className="text-gray-600 leading-relaxed text-sm">{c.contextP3}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT THIS STUDY OFFERS ───────────────────────────── */}
      <section className="py-20" style={{ background: '#F8F9FB' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`mb-12 ${isRTL ? 'text-right' : ''}`}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brand-red)' }}>
              {c.whatLabel}
            </p>
            <h2 className="text-2xl font-extrabold" style={{ color: 'var(--brand-navy)' }}>
              {c.whatTitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {c.whatItems.map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={i}
                  className={`bg-white rounded-sm p-6 border border-gray-100 ${isRTL ? 'text-right' : ''}`}
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                >
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center mb-4"
                    style={{ background: 'var(--brand-navy)' }}
                  >
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--brand-navy)' }}>
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`mb-12 ${isRTL ? 'text-right' : ''}`}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brand-red)' }}>
              {c.howLabel}
            </p>
            <h2 className="text-2xl font-extrabold" style={{ color: 'var(--brand-navy)' }}>
              {c.howTitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {c.howSteps.map((step, i) => (
              <div key={i} className={`relative ${isRTL ? 'text-right' : ''}`}>
                {/* Connector line */}
                {i < c.howSteps.length - 1 && (
                  <div
                    className={`hidden lg:block absolute top-5 w-full h-px ${isRTL ? 'right-1/2' : 'left-1/2'}`}
                    style={{ background: 'var(--brand-cyan)', opacity: 0.3 }}
                  />
                )}
                <div
                  className="w-10 h-10 rounded-sm flex items-center justify-center text-white font-black text-sm mb-4 relative z-10"
                  style={{ background: 'var(--brand-navy)' }}
                >
                  {step.num}
                </div>
                <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--brand-navy)' }}>
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'var(--brand-navy)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`mb-12 ${isRTL ? 'text-right' : ''}`}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brand-cyan)' }}>
              {c.timelineLabel}
            </p>
            <h2 className="text-2xl font-extrabold text-white">
              {c.timelineTitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-0">
            {c.timelineItems.map((item, i) => (
              <div
                key={i}
                className={`relative border-t-2 pt-6 pb-4 ${isRTL ? 'text-right pr-0 pl-6' : 'pl-0 pr-6'} ${
                  item.active
                    ? 'border-t-[var(--brand-cyan)]'
                    : 'border-t-white/20'
                }`}
                style={item.active ? { borderTopColor: 'var(--brand-cyan)' } : { borderTopColor: 'rgba(255,255,255,0.2)' }}
              >
                {item.active && (
                  <span
                    className="inline-block text-xs font-bold px-2 py-0.5 rounded-sm mb-3"
                    style={{ background: 'var(--brand-cyan)', color: 'var(--brand-navy)' }}
                  >
                    {lang === 'es' ? 'Activo' : lang === 'fr' ? 'Actif' : lang === 'ar' ? 'نشط' : lang === 'ru' ? 'Активно' : 'Active'}
                  </span>
                )}
                <p className="text-white font-bold text-sm mb-1">{item.date}</p>
                <p className="text-white/50 text-xs leading-relaxed">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`max-w-2xl ${isRTL ? 'mr-auto text-right' : 'ml-0'}`}>
            <h2 className="text-2xl font-extrabold mb-4" style={{ color: 'var(--brand-navy)' }}>
              {c.ctaTitle}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">{c.ctaSub}</p>
            <div className={`flex flex-wrap gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => navigate('/assessment')}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-sm transition-all hover:opacity-90"
                style={{ background: 'var(--brand-red)' }}
              >
                {c.ctaBtn}
                <ArrowRight size={16} />
              </button>
            </div>
            <p className="text-gray-400 text-xs">{c.ctaNote}</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
