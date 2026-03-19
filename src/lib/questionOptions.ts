// ============================================================
// NetDiscover — Opciones de respuesta exactas del documento
// Fuente: NetDiscover_Evaluacion_Completa_ES(1).docx
// ============================================================

export interface QuestionOption {
  value: number;
  label_es: string;
  label_en: string;
  description_es?: string;
}

export interface BarrierOption {
  value: string;
  label_es: string;
  label_en: string;
  description_es?: string;
}

export type QuestionOptionsMap = {
  [slug: string]: {
    type: 'scale' | 'barrier';
    options: QuestionOption[] | BarrierOption[];
  };
};

export const QUESTION_OPTIONS: QuestionOptionsMap = {

  // ── FASE 0 — Contexto del Regulador ──────────────────────────

  'q0_1': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'No es prioridad', label_en: 'Not a priority', description_es: 'La calidad postal no figura entre los objetivos declarados ni en el plan de trabajo de la institución.' },
      { value: 2, label_es: 'Prioridad secundaria', label_en: 'Secondary priority', description_es: 'La calidad se menciona en términos generales pero no tiene recursos ni plan dedicado.' },
      { value: 3, label_es: 'Prioridad sin recursos', label_en: 'Priority without resources', description_es: 'La mejora de calidad es un objetivo explícito pero carece de presupuesto o equipo asignado.' },
      { value: 4, label_es: 'Prioridad estratégica con recursos', label_en: 'Strategic priority with resources', description_es: 'La calidad es una prioridad con presupuesto dedicado, equipo asignado y plan de implementación activo.' },
    ] as QuestionOption[],
  },

  'q0_2': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Sin relación activa', label_en: 'No active relationship', description_es: 'No existe diálogo ni colaboración sobre calidad.' },
      { value: 2, label_es: 'Formal pero pasiva', label_en: 'Formal but passive', description_es: 'Existe una relación formal pero sin colaboración activa en calidad.' },
      { value: 3, label_es: 'Diálogo activo', label_en: 'Active dialogue', description_es: 'Hay diálogo activo sobre calidad pero sin herramientas, datos ni proyectos compartidos.' },
      { value: 4, label_es: 'Colaboración estructurada', label_en: 'Structured collaboration', description_es: 'Colaboración estructurada con datos compartidos, objetivos conjuntos de calidad e iniciativas coordinadas.' },
    ] as QuestionOption[],
  },

  'q0_3': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Nunca lo ha expresado', label_en: 'Never expressed', description_es: 'El operador nunca ha solicitado ni mencionado necesidad de apoyo técnico en calidad.' },
      { value: 2, label_es: 'Mencionado informalmente', label_en: 'Mentioned informally', description_es: 'El operador ha mencionado desafíos de calidad informalmente pero sin solicitud formal.' },
      { value: 3, label_es: 'Solicitado formalmente', label_en: 'Formally requested', description_es: 'El operador ha solicitado apoyo formalmente pero no se ha definido un programa.' },
      { value: 4, label_es: 'Programa de soporte activo', label_en: 'Active support programme', description_es: 'Existe un programa activo de soporte técnico con herramientas, datos compartidos y acciones conjuntas.' },
    ] as QuestionOption[],
  },

  'q0_4': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Sin autoridad específica', label_en: 'No specific authority', description_es: 'No existe legislación que otorgue al regulador autoridad sobre la medición de calidad postal.' },
      { value: 2, label_es: 'Limitada (solo recomendaciones)', label_en: 'Limited (recommendations only)', description_es: 'El regulador puede emitir recomendaciones pero sin poder vinculante ni sancionador.' },
      { value: 3, label_es: 'Puede medir y publicar', label_en: 'Can measure and publish', description_es: 'Autoridad para realizar mediciones independientes y publicar resultados, pero sin régimen sancionador.' },
      { value: 4, label_es: 'Autoridad completa', label_en: 'Full authority', description_es: 'Autoridad completa para medir, exigir cumplimiento, sancionar incumplimientos y publicar resultados.' },
    ] as QuestionOption[],
  },

  'q0_5': {
    type: 'barrier',
    options: [
      { value: 'A', label_es: 'Falta de presupuesto', label_en: 'Lack of budget', description_es: 'Recursos financieros insuficientes para actividades de medición y control de calidad.' },
      { value: 'B', label_es: 'Falta de autoridad legal', label_en: 'Lack of legal authority', description_es: 'El marco regulatorio no otorga al regulador poder suficiente.' },
      { value: 'C', label_es: 'Resistencia del operador', label_en: 'Operator resistance', description_es: 'El operador designado se resiste a la medición independiente.' },
      { value: 'D', label_es: 'Falta de capacidad técnica', label_en: 'Lack of technical capacity', description_es: 'El regulador carece de personal cualificado.' },
      { value: 'E', label_es: 'Falta de voluntad política', label_en: 'Lack of political will', description_es: 'La calidad postal no es prioridad del gobierno.' },
      { value: 'F', label_es: 'No es prioridad', label_en: 'Not a priority', description_es: 'La mejora de calidad no se considera necesaria.' },
    ] as BarrierOption[],
  },

  // ── FASE 1 — Diseño del Sistema de Medición ──────────────────

  'q1_1': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'No existe metodología', label_en: 'No methodology', description_es: 'No existe ninguna metodología de medición, ni documentada ni informal.' },
      { value: 2, label_es: 'Diseño conceptual', label_en: 'Conceptual design', description_es: 'Existe un diseño conceptual o borrador pero no se ha implementado.' },
      { value: 3, label_es: 'Implementada sin alineación', label_en: 'Implemented without alignment', description_es: 'Metodología implementada pero sin alineación formal con estándares internacionales.' },
      { value: 4, label_es: 'Operativa y alineada', label_en: 'Operational and aligned', description_es: 'Metodología operativa, alineada con UPU S58/S59 o EN 13850, con validación estadística.' },
    ] as QuestionOption[],
  },

  'q1_2': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'No existe panel', label_en: 'No panel', description_es: 'No existe ningún panel de medición independiente.' },
      { value: 2, label_es: 'Diseñado o pilotado', label_en: 'Designed or piloted', description_es: 'El panel ha sido diseñado o pilotado pero no está operativo.' },
      { value: 3, label_es: 'Operativo pero parcial', label_en: 'Operational but partial', description_es: 'Panel operativo pero con cobertura geográfica parcial o volumen insuficiente.' },
      { value: 4, label_es: 'Plenamente operativo', label_en: 'Fully operational', description_es: 'Panel operativo con cobertura representativa, volumen estadísticamente válido y auditoría periódica.' },
    ] as QuestionOption[],
  },

  'q1_3': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'No existe plataforma', label_en: 'No platform', description_es: 'No existe plataforma; se usan hojas de cálculo o métodos manuales.' },
      { value: 2, label_es: 'Herramienta básica', label_en: 'Basic tool', description_es: 'Existe una herramienta básica pero sin automatización ni dashboards.' },
      { value: 3, label_es: 'Plataforma con dashboards', label_en: 'Platform with dashboards', description_es: 'Plataforma con ingesta de datos y dashboards pero sin alertas ni reportería automatizada.' },
      { value: 4, label_es: 'Plataforma integrada', label_en: 'Integrated platform', description_es: 'Plataforma integrada con ingesta automática, dashboards, alertas, reportería y gestión de SLAs.' },
    ] as QuestionOption[],
  },

  'q1_4': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Sin personal asignado', label_en: 'No assigned staff', description_es: 'No hay personal asignado a actividades de calidad postal.' },
      { value: 2, label_es: 'Personal sin formación', label_en: 'Staff without training', description_es: 'Hay personal asignado pero sin formación específica en medición postal.' },
      { value: 3, label_es: 'Formado pero dependiente', label_en: 'Trained but dependent', description_es: 'Equipo formado que opera el sistema pero depende de soporte externo para análisis avanzados.' },
      { value: 4, label_es: 'Equipo especializado autónomo', label_en: 'Autonomous specialist team', description_es: 'Equipo especializado autónomo con capacidad de operación, análisis y evolución del sistema.' },
    ] as QuestionOption[],
  },

  'q1_5': {
    type: 'barrier',
    options: [
      { value: 'A', label_es: 'Sin presupuesto para medición', label_en: 'No measurement budget', description_es: 'Recursos financieros insuficientes.' },
      { value: 'B', label_es: 'Sin metodología definida', label_en: 'No defined methodology', description_es: 'Falta una metodología definida.' },
      { value: 'C', label_es: 'Sin personal cualificado', label_en: 'No qualified staff', description_es: 'No se encuentra personal con competencias técnicas.' },
      { value: 'D', label_es: 'El operador no coopera', label_en: 'Operator does not cooperate', description_es: 'El operador no coopera con la instalación o datos.' },
      { value: 'E', label_es: 'Sin tecnología local', label_en: 'No local technology', description_es: 'La tecnología no está disponible localmente.' },
      { value: 'F', label_es: 'El sistema ya funciona bien', label_en: 'System already works well', description_es: 'El sistema actual se considera adecuado.' },
    ] as BarrierOption[],
  },

  // ── FASE 2 — Mapeo del Ecosistema ────────────────────────────

  'q2_1': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'No existe inventario', label_en: 'No inventory', description_es: 'No existe ningún inventario de actores postales.' },
      { value: 2, label_es: 'Parcial o desactualizado', label_en: 'Partial or outdated', description_es: 'Inventario parcial o desactualizado.' },
      { value: 3, label_es: 'Completo sin detalle', label_en: 'Complete without detail', description_es: 'Inventario completo pero sin detalle de tramos, frecuencias y contratos.' },
      { value: 4, label_es: 'Completo y detallado', label_en: 'Complete and detailed', description_es: 'Inventario completo, actualizado, con detalle de tramos, carriers y relaciones contractuales.' },
    ] as QuestionOption[],
  },

  'q2_2': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'No documentada', label_en: 'Not documented', description_es: 'La estructura de la red postal no está documentada.' },
      { value: 2, label_es: 'Parcial, sin verificar', label_en: 'Partial, unverified', description_es: 'Documentación parcial basada en información del operador, sin verificación.' },
      { value: 3, label_es: 'Completa, sin georreferenciar', label_en: 'Complete, not georeferenced', description_es: 'Completa pero sin georreferenciación ni actualización periódica.' },
      { value: 4, label_es: 'Completa, georreferenciada', label_en: 'Complete, georeferenced', description_es: 'Red completamente documentada, georreferenciada y actualizada periódicamente.' },
    ] as QuestionOption[],
  },

  'q2_3': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Desconocidos', label_en: 'Unknown', description_es: 'No se conocen los volúmenes de correo.' },
      { value: 2, label_es: 'Solo totales', label_en: 'Totals only', description_es: 'Se conocen volúmenes totales pero sin desagregación.' },
      { value: 3, label_es: 'Por servicio, sin geográfico', label_en: 'By service, no geographic', description_es: 'Volúmenes por servicio pero sin distribución geográfica.' },
      { value: 4, label_es: 'Desglose completo', label_en: 'Full breakdown', description_es: 'Volúmenes completos por servicio, zona y período, verificados.' },
    ] as QuestionOption[],
  },

  'q2_4': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'No existe', label_en: 'Does not exist', description_es: 'No existe topología postal.' },
      { value: 2, label_es: 'Solo administrativa', label_en: 'Administrative only', description_es: 'Existe división administrativa pero no adaptada a medición postal.' },
      { value: 3, label_es: 'Definida, sin validar', label_en: 'Defined, unvalidated', description_es: 'Topología definida con pares O-D pero sin validar con datos reales.' },
      { value: 4, label_es: 'Aprobada formalmente', label_en: 'Formally approved', description_es: 'Topología aprobada con pares O-D representativos validados con datos de volúmenes.' },
    ] as QuestionOption[],
  },

  'q2_5': {
    type: 'barrier',
    options: [
      { value: 'A', label_es: 'El operador no comparte datos', label_en: 'Operator does not share data', description_es: 'El operador no comparte información sobre su red.' },
      { value: 'B', label_es: 'Sin recursos para levantamiento', label_en: 'No resources for survey', description_es: 'Recursos insuficientes para el levantamiento.' },
      { value: 'C', label_es: 'Red cambia frecuentemente', label_en: 'Network changes frequently', description_es: 'La red cambia y es difícil mantenerla actualizada.' },
      { value: 'D', label_es: 'Sin herramientas GIS', label_en: 'No GIS tools', description_es: 'No se dispone de herramientas GIS o de mapeo.' },
      { value: 'E', label_es: 'Sin obligación legal', label_en: 'No legal obligation', description_es: 'No existe obligación legal de que el operador comparta datos.' },
      { value: 'F', label_es: 'Mapeo ya completo', label_en: 'Mapping already complete', description_es: 'El mapeo ya está completo y actualizado.' },
    ] as BarrierOption[],
  },

  // ── FASE 3 — Establecimiento de SLAs ─────────────────────────

  'q3_1': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Nunca se ha medido', label_en: 'Never measured', description_es: 'Nunca se ha realizado una medición independiente.' },
      { value: 2, label_es: 'Mediciones puntuales', label_en: 'Spot measurements', description_es: 'Mediciones puntuales pero sin período de línea base estructurado.' },
      { value: 3, label_es: 'Línea base con limitaciones', label_en: 'Baseline with limitations', description_es: 'Se realizó pero con cobertura o período insuficiente.' },
      { value: 4, label_es: 'Línea base completa', label_en: 'Complete baseline', description_es: 'Completa con período ≥3 meses, cobertura representativa y análisis estadístico.' },
    ] as QuestionOption[],
  },

  'q3_2': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'No existen SLAs', label_en: 'No SLAs', description_es: 'No existen SLAs de calidad.' },
      { value: 2, label_es: 'Solo objetivos internos', label_en: 'Internal objectives only', description_es: 'El operador tiene objetivos internos pero no vinculantes.' },
      { value: 3, label_es: 'Formales sin consecuencias', label_en: 'Formal without consequences', description_es: 'SLAs definidos formalmente pero sin consecuencias por incumplimiento.' },
      { value: 4, label_es: 'Vinculantes con consecuencias', label_en: 'Binding with consequences', description_es: 'SLAs vinculantes con instrumento legal, diferenciados por servicio y zona.' },
    ] as QuestionOption[],
  },

  'q3_3': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'No existen SLAs con carriers', label_en: 'No SLAs with carriers', description_es: 'No existen SLAs con carriers.' },
      { value: 2, label_es: 'Carriers conocidos, sin SLAs', label_en: 'Carriers known, no SLAs', description_es: 'Los carriers están identificados pero no existen SLAs por tramo.' },
      { value: 3, label_es: 'Acuerdos parciales', label_en: 'Partial agreements', description_es: 'Acuerdos con algunos carriers pero sin medición sistemática.' },
      { value: 4, label_es: 'SLAs por tramo completos', label_en: 'Complete segment SLAs', description_es: 'SLAs por tramo para todos los carriers con medición en handover.' },
    ] as QuestionOption[],
  },

  'q3_4': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Nunca se han revisado', label_en: 'Never reviewed', description_es: 'Los SLAs nunca se han revisado.' },
      { value: 2, label_es: 'Revisiones puntuales', label_en: 'Spot reviews', description_es: 'Revisados puntualmente sin periodicidad.' },
      { value: 3, label_es: 'Periódica pero informal', label_en: 'Periodic but informal', description_es: 'Revisión periódica pero sin proceso formal ni consulta.' },
      { value: 4, label_es: 'Ciclo formal de revisión', label_en: 'Formal review cycle', description_es: 'Ciclo formal (anual/bianual) con datos, consulta a stakeholders y ajuste documentado.' },
    ] as QuestionOption[],
  },

  'q3_5': {
    type: 'barrier',
    options: [
      { value: 'A', label_es: 'Sin datos de línea base', label_en: 'No baseline data', description_es: 'No hay datos para fundamentar objetivos.' },
      { value: 'B', label_es: 'Falta voluntad política', label_en: 'Lack of political will', description_es: 'Falta voluntad para imponer SLAs vinculantes.' },
      { value: 'C', label_es: 'Resistencia del operador', label_en: 'Operator resistance', description_es: 'El operador se resiste a SLAs con consecuencias.' },
      { value: 'D', label_es: 'Sin marco legal', label_en: 'No legal framework', description_es: 'No existe marco legal para formalizar SLAs.' },
      { value: 'E', label_es: 'Sin experiencia en diseño', label_en: 'No design experience', description_es: 'Falta experiencia en diseño de SLAs postales.' },
      { value: 'F', label_es: 'SLAs ya establecidos', label_en: 'SLAs already established', description_es: 'Los SLAs ya están establecidos y funcionan.' },
    ] as BarrierOption[],
  },

  // ── FASE 4 — Diagnóstico de Red ──────────────────────────────

  'q4_1': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Nodos desconocidos', label_en: 'Unknown nodes', description_es: 'No se conocen los nodos de la red postal.' },
      { value: 2, label_es: 'Nodos conocidos, retrasos no', label_en: 'Nodes known, delays unknown', description_es: 'Se conocen los nodos principales pero no dónde se producen los retrasos.' },
      { value: 3, label_es: 'Sospechados sin datos', label_en: 'Suspected without data', description_es: 'Nodos problemáticos identificados por observación pero sin datos.' },
      { value: 4, label_es: 'Identificados con datos', label_en: 'Identified with data', description_es: 'Nodos críticos identificados con datos de medición que muestran tiempos por segmento.' },
    ] as QuestionOption[],
  },

  'q4_2': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Sin tecnología', label_en: 'No technology', description_es: 'No existe tecnología de captura en ningún nodo.' },
      { value: 2, label_es: 'Diseñada o pilotada', label_en: 'Designed or piloted', description_es: 'Tecnología diseñada o pilotada pero no operativa.' },
      { value: 3, label_es: 'En nodos principales', label_en: 'In main nodes', description_es: 'Instalada en nodos principales pero sin cobertura completa.' },
      { value: 4, label_es: 'Red operativa completa', label_en: 'Full operational network', description_es: 'Red de captura operativa en todos los nodos críticos, integrada y con mantenimiento.' },
    ] as QuestionOption[],
  },

  'q4_3': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'No puede', label_en: 'Cannot', description_es: 'No es posible descomponer tiempos.' },
      { value: 2, label_es: 'Estimación manual', label_en: 'Manual estimation', description_es: 'Tiempos estimados manualmente sin automatización.' },
      { value: 3, label_es: 'Calcula sin dashboards', label_en: 'Calculates without dashboards', description_es: 'La plataforma calcula pero sin dashboards de diagnóstico.' },
      { value: 4, label_es: 'Diagnóstico automático', label_en: 'Automatic diagnosis', description_es: 'Diagnóstico automático con dashboards, cuellos de botella y alertas.' },
    ] as QuestionOption[],
  },

  'q4_4': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Sin acceso', label_en: 'No access', description_es: 'El operador no tiene acceso a datos de diagnóstico.' },
      { value: 2, label_es: 'Informes puntuales', label_en: 'Spot reports', description_es: 'Recibe informes puntuales pero sin acceso directo.' },
      { value: 3, label_es: 'Dashboards básicos', label_en: 'Basic dashboards', description_es: 'Acceso a dashboards básicos de rendimiento.' },
      { value: 4, label_es: 'Acceso completo', label_en: 'Full access', description_es: 'Acceso completo a diagnóstico con dashboards propios para planificación operativa.' },
    ] as QuestionOption[],
  },

  'q4_5': {
    type: 'barrier',
    options: [
      { value: 'A', label_es: 'Sin presupuesto RFID', label_en: 'No RFID budget', description_es: 'Presupuesto insuficiente para RFID.' },
      { value: 'B', label_es: 'Operador bloquea instalación', label_en: 'Operator blocks installation', description_es: 'El operador no permite instalar equipamiento.' },
      { value: 'C', label_es: 'Infraestructura deficiente', label_en: 'Poor infrastructure', description_es: 'Instalaciones sin electricidad o conectividad.' },
      { value: 'D', label_es: 'Sin personal técnico', label_en: 'No technical staff', description_es: 'No hay personal para instalar y mantener.' },
      { value: 'E', label_es: 'Sin proveedor RFID', label_en: 'No RFID provider', description_es: 'No hay proveedor compatible.' },
      { value: 'F', label_es: 'Red ya diagnosticada', label_en: 'Network already diagnosed', description_es: 'La red ya está diagnosticada.' },
    ] as BarrierOption[],
  },

  // ── FASE 5 — Medición Continua ───────────────────────────────

  'q5_1': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Sin medición activa', label_en: 'No active measurement', description_es: 'Ningún sistema activo.' },
      { value: 2, label_es: 'Campañas esporádicas', label_en: 'Sporadic campaigns', description_es: 'Campañas una o dos veces al año.' },
      { value: 3, label_es: 'Continua con interrupciones', label_en: 'Continuous with interruptions', description_es: 'Continua pero con interrupciones frecuentes.' },
      { value: 4, label_es: 'Permanente y estable', label_en: 'Permanent and stable', description_es: 'Permanente con operación estable y control de calidad de datos.' },
    ] as QuestionOption[],
  },

  'q5_2': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Sin reportes', label_en: 'No reports', description_es: 'No se generan reportes.' },
      { value: 2, label_es: 'Ad hoc', label_en: 'Ad hoc', description_es: 'Reportes bajo demanda.' },
      { value: 3, label_es: 'Periódicos, manuales', label_en: 'Periodic, manual', description_es: 'Periódicos pero manuales y con distribución limitada.' },
      { value: 4, label_es: 'Automatizados', label_en: 'Automated', description_es: 'Automatizados (mensual/trimestral/anual) con distribución por rol y publicación.' },
    ] as QuestionOption[],
  },

  'q5_3': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'No se publican', label_en: 'Not published', description_es: 'No se publican.' },
      { value: 2, label_es: 'Solo uso interno', label_en: 'Internal use only', description_es: 'Compartidos internamente pero no publicados.' },
      { value: 3, label_es: 'Parcial o esporádica', label_en: 'Partial or sporadic', description_es: 'Publicación parcial o esporádica.' },
      { value: 4, label_es: 'Publicación regular', label_en: 'Regular publication', description_es: 'Publicación regular en web del regulador, accesible al ciudadano.' },
    ] as QuestionOption[],
  },

  'q5_4': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Sin alertas', label_en: 'No alerts', description_es: 'No existe sistema de alertas.' },
      { value: 2, label_es: 'Detección manual', label_en: 'Manual detection', description_es: 'Incumplimientos detectados manualmente.' },
      { value: 3, label_es: 'Alertas sin protocolo', label_en: 'Alerts without protocol', description_es: 'Alertas existen pero sin protocolo de respuesta.' },
      { value: 4, label_es: 'Automáticas con protocolo', label_en: 'Automatic with protocol', description_es: 'Alertas automáticas con protocolo de notificación, plazos y escalamiento.' },
    ] as QuestionOption[],
  },

  'q5_5': {
    type: 'barrier',
    options: [
      { value: 'A', label_es: 'Sin financiamiento recurrente', label_en: 'No recurring funding', description_es: 'Financiamiento insuficiente para operación recurrente.' },
      { value: 'B', label_es: 'Sin personal dedicado', label_en: 'No dedicated staff', description_es: 'No hay personal dedicado.' },
      { value: 'C', label_es: 'Deterioro de equipos', label_en: 'Equipment deterioration', description_es: 'Equipamiento se deteriora sin mantenimiento.' },
      { value: 'D', label_es: 'Retención de panelistas', label_en: 'Panellist retention', description_es: 'Difícil mantener panel activo.' },
      { value: 'E', label_es: 'Sin procedimientos', label_en: 'No procedures', description_es: 'Falta de SOPs.' },
      { value: 'F', label_es: 'Ya opera continuamente', label_en: 'Already operates continuously', description_es: 'Ya opera de forma continua.' },
    ] as BarrierOption[],
  },

  // ── FASE 6 — Planes de Mejora ────────────────────────────────

  'q6_1': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Nunca analizado', label_en: 'Never analysed', description_es: 'Causas nunca analizadas.' },
      { value: 2, label_es: 'Conocimiento intuitivo', label_en: 'Intuitive knowledge', description_es: 'Causas conocidas intuitivamente.' },
      { value: 3, label_es: 'Análisis puntual', label_en: 'Spot analysis', description_es: 'Análisis puntual sin metodología.' },
      { value: 4, label_es: 'Análisis formal', label_en: 'Formal analysis', description_es: 'Análisis formal con visitas de campo, datos y matriz priorizada.' },
    ] as QuestionOption[],
  },

  'q6_2': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'No existen', label_en: 'Do not exist', description_es: 'No existen planes.' },
      { value: 2, label_es: 'Recomendaciones generales', label_en: 'General recommendations', description_es: 'Recomendaciones sin plan estructurado.' },
      { value: 3, label_es: 'Planes sin seguimiento', label_en: 'Plans without follow-up', description_es: 'Planes con acciones pero sin seguimiento.' },
      { value: 4, label_es: 'Planes formales', label_en: 'Formal plans', description_es: 'Formales con acciones, responsables, plazos, indicadores y revisiones.' },
    ] as QuestionOption[],
  },

  'q6_3': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Solo recomendar', label_en: 'Can only recommend', description_es: 'Solo puede recomendar.' },
      { value: 2, label_es: 'Recomendaciones formales', label_en: 'Formal recommendations', description_es: 'Recomendaciones formales sin poder sancionador.' },
      { value: 3, label_es: 'Poder poco usado', label_en: 'Power rarely used', description_es: 'Poder sancionador existe pero raramente se ejerce.' },
      { value: 4, label_es: 'Régimen activo', label_en: 'Active regime', description_es: 'Régimen sancionador activo vinculado a SLAs.' },
    ] as QuestionOption[],
  },

  'q6_4': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'No se verifica', label_en: 'Not verified', description_es: 'No se verifica el impacto.' },
      { value: 2, label_es: 'Percibido sin datos', label_en: 'Perceived without data', description_es: 'Mejora percibida pero sin datos.' },
      { value: 3, label_es: 'Comparado sin rigor', label_en: 'Compared without rigour', description_es: 'Datos antes/después sin metodología rigurosa.' },
      { value: 4, label_es: 'Verificación formal', label_en: 'Formal verification', description_es: 'Verificación estadística formal con documentación.' },
    ] as QuestionOption[],
  },

  'q6_5': {
    type: 'barrier',
    options: [
      { value: 'A', label_es: 'Datos insuficientes', label_en: 'Insufficient data', description_es: 'No hay datos para diagnosticar.' },
      { value: 'B', label_es: 'Operador no coopera', label_en: 'Operator does not cooperate', description_es: 'El operador no coopera.' },
      { value: 'C', label_es: 'Sin consultores', label_en: 'No consultants', description_es: 'Faltan consultores postales.' },
      { value: 'D', label_es: 'Sin capacidad de ejecución', label_en: 'No execution capacity', description_es: 'Sin capacidad regulatoria.' },
      { value: 'E', label_es: 'Rotación personal', label_en: 'Staff turnover', description_es: 'Pérdida de continuidad.' },
      { value: 'F', label_es: 'Planes ya funcionan', label_en: 'Plans already work', description_es: 'Los planes ya funcionan.' },
    ] as BarrierOption[],
  },

  // ── FASE 7 — Madurez y Mejora Continua ──────────────────────

  'q7_1': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Solo correo básico', label_en: 'Basic mail only', description_es: 'Solo se mide correo de cartas.' },
      { value: 2, label_es: 'Necesidad identificada', label_en: 'Need identified', description_es: 'Necesidad de ampliar identificada pero sin acción.' },
      { value: 3, label_es: 'Algunos servicios', label_en: 'Some services', description_es: 'Algunos servicios adicionales medidos pero no con la misma profundidad.' },
      { value: 4, label_es: 'Cobertura integral', label_en: 'Comprehensive coverage', description_es: 'Cobertura integral de todos los servicios relevantes del mercado.' },
    ] as QuestionOption[],
  },

  'q7_2': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'No participa', label_en: 'Does not participate', description_es: 'No participa en ningún programa.' },
      { value: 2, label_es: 'Conoce pero no participa', label_en: 'Knows but does not participate', description_es: 'Conoce los programas pero no participa.' },
      { value: 3, label_es: 'Participación puntual', label_en: 'Occasional participation', description_es: 'Participa puntualmente o con datos limitados.' },
      { value: 4, label_es: 'Participación activa', label_en: 'Active participation', description_es: 'Participación activa y continua con intercambio de datos.' },
    ] as QuestionOption[],
  },

  'q7_3': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'No se mide', label_en: 'Not measured', description_es: 'No se mide satisfacción.' },
      { value: 2, label_es: 'Quejas sin análisis', label_en: 'Complaints without analysis', description_es: 'Se reciben quejas pero sin análisis.' },
      { value: 3, label_es: 'Encuestas puntuales', label_en: 'Spot surveys', description_es: 'Encuestas puntuales sin integración.' },
      { value: 4, label_es: 'Medición integrada', label_en: 'Integrated measurement', description_es: 'Medición periódica integrada con indicadores objetivos.' },
    ] as QuestionOption[],
  },

  'q7_4': {
    type: 'scale',
    options: [
      { value: 1, label_es: 'Sin colaboración', label_en: 'No collaboration', description_es: 'No hay colaboración con otros reguladores.' },
      { value: 2, label_es: 'Contactos informales', label_en: 'Informal contacts', description_es: 'Contactos informales pero sin intercambio estructurado.' },
      { value: 3, label_es: 'Intercambio puntual', label_en: 'Occasional exchange', description_es: 'Intercambio puntual de experiencias en foros.' },
      { value: 4, label_es: 'Colaboración activa', label_en: 'Active collaboration', description_es: 'Colaboración activa con intercambio formal de datos y metodología.' },
    ] as QuestionOption[],
  },

  'q7_5': {
    type: 'barrier',
    options: [
      { value: 'A', label_es: 'SLAs no se cuestionan', label_en: 'SLAs not questioned', description_es: 'Los SLAs no se revisan.' },
      { value: 'B', label_es: 'Sin demanda de nuevos servicios', label_en: 'No demand for new services', description_es: 'No hay demanda para medir nuevos servicios.' },
      { value: 'C', label_es: 'Sin recursos internacionales', label_en: 'No international resources', description_es: 'Faltan recursos para programas internacionales.' },
      { value: 'D', label_es: 'Metodología incompatible', label_en: 'Incompatible methodology', description_es: 'Metodología no compatible con estándares.' },
      { value: 'E', label_es: 'Sin diálogo entre reguladores', label_en: 'No dialogue between regulators', description_es: 'Falta diálogo con otros reguladores.' },
      { value: 'F', label_es: 'Ya en fase de madurez', label_en: 'Already in maturity phase', description_es: 'El sistema ya está en madurez.' },
    ] as BarrierOption[],
  },
};
