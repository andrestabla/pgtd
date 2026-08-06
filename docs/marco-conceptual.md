# Marco conceptual de la PGTD

Notas de lectura de los artículos base (`Artículos base/`) y sus implicaciones
de diseño para la plataforma. Este documento es la traza entre la literatura y
las decisiones de producto: cada regla de negocio del código cita aquí su origen.

---

## 1 · Notas por artículo

### 1.1 Castro Benavides (2023) — *Transformación Digital en IES: Modelo de Implementación* (tesis doctoral, UNAL)

**Aporte central.** Un modelo de implementación de TD para IES validado
empíricamente (SEM sobre universidades públicas colombianas), con:

- **Tres perspectivas** que impactan la madurez: **organizacional** (estrategia,
  gobernanza, procesos), **socio-cultural** (personas, habilidades digitales,
  resistencia al cambio) e **infraestructura tecnológica y física**.
- **Cinco niveles de madurez** específicos para IES: *Ningún grado → Bajo →
  Moderado → Alto → Superior*. Cada nivel describe simultáneamente estrategia,
  extensión de las iniciativas (esfuerzo individual → institucional),
  digitalización de procesos, habilidades del personal y tecnología disponible.
- Un instrumento de medida validado por jueces (V de Aiken > .74) — la medición
  de madurez es un **constructo multi-ítem con evidencia**, no una percepción.

**Implicaciones PGTD.**
- Valida la escala 1–5 del instrumento y la exigencia de **evidencia por celda**.
- El descriptor de cada nivel debe hablar de estrategia + personas + procesos +
  tecnología a la vez (así están escritos los niveles en `demo.ts`).
- La resistencia al cambio es una variable de primer orden → los **factores
  críticos de éxito por iniciativa** deben capturar adopción y cultura, no solo
  presupuesto y técnica.

### 1.2 BID / HolonIQ (2021) — *Transformación digital en la educación superior: América Latina y el Caribe*

**Aporte central.** Encuesta a ~100 IES en 14 países: estado, barreras y un
**marco de capacidad digital** para construir capacidad institucional; casos
globales. Barreras dominantes en LAC: financiación, cultura y liderazgo,
competencias del personal, sistemas heredados.

**Implicaciones PGTD.**
- El módulo de comparación debe leerse contra pares LAC, no contra ideales
  globales: los **cortes de benchmark** usan IES públicas comparables.
- Las barreras del BID son categorías de **riesgo** reutilizables: financiera,
  cultural, de talento, tecnológica → el motor de riesgo de iniciativas
  clasifica los factores críticos en estas categorías.

### 1.3 Carmo, Lacerda, Klingenberg & Piran (2025) — *Digital transformation in the management of HEIs*

**Aporte central.** Revisión sistemática (Literature Grounded Theory):
**20 tecnologías** habilitadoras, **4 categorías de desafíos**, y un conjunto
sistematizado de **factores críticos de éxito** para la TD en la gestión de IES.

**Implicaciones PGTD.**
- La gestión (no solo la docencia) es objeto de transformación → las líneas
  4.4 (arquitectura/gobierno) y los KPI administrativos tienen el mismo rango
  que los misionales.
- Los desafíos son transversales a las iniciativas → el semáforo de factores
  necesita **historial** para detectar deterioro (dos rojos seguidos), porque
  los fracasos descritos son procesos lentos, no eventos.

### 1.4 CRUE — *Estrategia y transformación digital de las universidades: un enfoque para el gobierno universitario*

**Aporte central.** La TD es un asunto del **gobierno universitario**: exige
visión rectora, cartera priorizada, financiación plurianual y seguimiento desde
el máximo órgano. La TD que vive solo en la oficina TIC fracasa.

**Implicaciones PGTD.**
- Justifica el rol **Directivo** con vista ejecutiva propia y el **enlace
  público** para Consejo Superior: el tablero es un artefacto de gobierno.
- El portafolio de iniciativas debe mostrarse **como cartera** (presupuesto
  agregado, priorización explícita), no como lista de proyectos.

### 1.5 EDUCAUSE Horizon Report (2020, Teaching & Learning)

**Aporte central.** Tendencias sociales/tecnológicas/económicas/políticas y
prácticas emergentes: analítica de aprendizaje, diseño instruccional asistido,
recursos educativos abiertos, elevación del bienestar estudiantil.

**Implicaciones PGTD.**
- KPI de **analítica de aprendizaje** y **éxito estudiantil** (AV-01, AV-03,
  CO-01) como indicadores de vanguardia, no de vanidad.
- La categoría de evidencia **Sistema** (datos extraídos de plataformas) vale
  tanto como el documento formal.

### 1.6 Bermeo, Ramírez & Castillo (2025) — *La TD como estrategia de gestión educativa en LAC*

**Aporte central.** Revisión 2020–2025: la TD empuja modelos de gestión más
flexibles, colaborativos y **orientados a datos**; condicionantes: formación
docente, liderazgo académico, cultura institucional, sostenibilidad.

**Implicaciones PGTD.**
- "Orientado a datos" implica que **cada indicador tiene dueño y periodicidad**
  — es la operacionalización del principio.

### 1.7 Pitre & Vásquez (2025) — *Universidad 4.0: caso Universidad de La Guajira*

**Aporte central.** Caso de una universidad pública de región periférica
colombiana (vecina del Cesar) avanzando a Universidad 4.0 con sostenibilidad:
infraestructura digital, plataformas y sistemas integrados, con el reto de
integrar la cultura digital en toda la comunidad.

**Implicaciones PGTD.**
- Referente territorial directo para la UPC: la comparación con **pares** debe
  incluir universidades públicas de región Caribe.
- La brecha típica no es tecnológica sino de **apropiación** → el heatmap
  línea × dimensión existe para hacer visible ese desbalance.

### 1.8 Barón & Caicedo (2021) — *TD, un desafío en la educación superior*

**Aporte central.** La TD en LAC agudizada por pandemia: desigualdad de acceso,
gobernanza tradicionalista, currículos rígidos, docentes sin formación. El
acceso equitativo a TIC es condición de derecho, no lujo técnico.

**Implicaciones PGTD.**
- El módulo territorial no es decorativo: **cobertura por municipio** es la
  variable de equidad. La lectura por subregión (sur = más efecto de la
  virtualidad) responde a esta literatura.

### 1.9 *Aproximación a la TD en IES mediante la teoría del cambio*

**Aporte central.** Aplica **teoría del cambio** a la TD educativa: percepciones
de los actores (grupos focales) → propuesta de valor → modelo de innovación.
El cambio se modela como cadena causal verificable, no como plan de actividades.

**Implicaciones PGTD.**
- Es el sustento del encadenamiento **objetivo → capacidad → iniciativa → KPI**
  del CMI: la plataforma modela la teoría del cambio institucional y la vuelve
  auditable (cada eslabón tiene datos).

### 1.10 Modelo objetivo para la virtualidad USCO 2.0 (Algoritmo T, 2020)

Referencia madre ya procesada (ver commit anterior): CMI de 5 perspectivas y
24 objetivos, 44 iniciativas subsistema → objetivo → acción → meta de
resultado, evaluación eMM con evidencia, factores de éxito por capacidad,
inversión anualizada.

### 1.11 AlgoritmoT — *Propuesta metodológica e instrumental para AlgoritmoT-IES* (deep-research-report)

**Aporte central.** Formalización de la metodología propia: matriz **4 líneas
misionales × 7 dimensiones transversales** (D1 estrategia/gobierno/calidad,
D2 talento, D3 procesos, D4 datos, D5 infraestructura, D6 experiencia/
inclusión, D7 innovación/impacto), con:

- **Puntuación verificada** S = 0,40·P + 0,60·E, donde P es percepción Likert
  normalizada y E = 0,25·Documentación + 0,35·Implementación + 0,40·Indicadores
  (cada componente 0–4). Una política aprobada pero no usada puntúa distinto
  de una práctica medida y mejorada.
- **Brecha percepción−evidencia** Δ = P − E: |Δ| > 20 es hallazgo de gestión
  (sobreestimación o práctica invisible).
- **Cinco niveles 0–100**: Inicial (0–19), Emergente (20–39), Gestionado
  (40–59), Integrado (60–79), Transformador (80–100).
- **Índices**: por línea misional, por dimensión transversal, e institucional
  IIES = 0,30·Formación + 0,25·Investigación + 0,20·Extensión + 0,25·Gestión.
- **AIQ-IES** de 6 componentes con **salvaguardas** que capan el puntaje (59 o
  39) ante fallas críticas de privacidad, ética, supervisión humana o
  integridad — el promedio no oculta riesgos.
- **Cobertura de evidencia** reportada junto al puntaje.
- **Priorización compuesta**: 0,30·Impacto + 0,20·Urgencia + 0,15·Riesgo +
  0,15·Alineación + 0,10·Factibilidad + 0,10·Dependencia.
- Plan de validación psicométrica (CVI, Aiken, EFA/CFA ordinal, omega,
  invariancia) con umbrales como guías, no reglas mecánicas.

**Implicaciones PGTD.** Es la metodología madre del instrumento. Implementada
en `src/lib/ies.ts` como capa de puntuación sobre las 52 variables (cada una
anotada con `d7`, `perception`, `evidence{d,i,k}` y `ai`); pestaña «Índices
IES» en M1; ranking de prioridad compuesta en M5. La percepción se reporta
como provisional hasta auditoría, y los pesos por ítem son iguales hasta que
exista fundamento psicométrico — ambas cosas por mandato del informe.

---

## 2 · Síntesis: qué debe saber hacer la plataforma

| Principio (fuente) | Regla de negocio en la PGTD |
|---|---|
| La madurez es multiperspectiva y evolutiva (1.1) | Score por celda línea×dimensión, series de mediciones, nunca un número suelto |
| La medición exige evidencia validada (1.1, 1.10) | Evidencia tipificada con estado de verificación; celda sin evidencia = hallazgo |
| Las barreras dominantes son financieras, culturales, de talento y tecnológicas (1.2, 1.3) | Factores críticos clasificados por categoría de riesgo; riesgo compuesto por iniciativa |
| El deterioro es lento: hay que detectar tendencia (1.3) | Alerta por **dos revisiones seguidas** en rojo; deterioro = estado actual peor que el histórico |
| La TD es gobierno, no proyecto TIC (1.4) | Vista de cartera con presupuesto agregado; rol directivo; enlace público |
| Gestión orientada a datos = dueño + periodicidad (1.6) | KPI sin dato fresco según su periodicidad → alerta de rezago de captura |
| El avance real es la cadena causal (1.9) | Salud de un objetivo CMI = f(KPI al día, iniciativas sanas, capacidades cerrando brecha) |
| Equidad territorial (1.7, 1.8) | Cobertura municipal como dato de primera clase en benchmark |
| Proyección sobre serie, no foto (1.1, 1.5) | Proyección lineal del KPI a fecha meta: ¿al ritmo actual llega? |

| La percepción no es madurez: S = 0,40·P + 0,60·E (1.11) | `ies.ts`: puntuación verificada por variable; percepción etiquetada provisional |
| |Δ| > 20 entre percepción y evidencia es hallazgo (1.11) | Tarjeta de brechas P−E con lectura sobreestimación / práctica invisible |
| Las salvaguardas capan el promedio (1.11) | AIQ-IES ≤ 59 mientras no exista inventario de sistemas de IA |
| El puntaje sin cobertura de evidencia engaña (1.11) | IIES y cobertura se muestran siempre juntos |
| La prioridad es compuesta, no solo impacto×factibilidad (1.11) | Ranking 6 criterios en M5 con desglose visible |
| El agregado pondera por grupo de actores, no por cabeza (1.11) | 5 grupos con pesos 20/25/20/25/10; disenso rango ≥ 2 como hallazgo |
| Disponibilidad ≠ adopción ≠ integración ≠ impacto (1.11) | Estado de práctica derivado de D/I/K por variable, con distribución en el tablero |

Estas reglas están implementadas en `src/lib/logic.ts` y `src/lib/ies.ts`,
expuestas por `/api/td/*`; el panel y los módulos las consumen.
