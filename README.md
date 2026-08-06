# PGTD · Plataforma de Gestión de la Transformación Digital

Prototipo funcional del producto descrito en la propuesta de Algoritmo T para la
Universidad Popular del Cesar: el diagnóstico de transformación digital como
sistema de gestión, no como documento.

## Stack

| Capa | Tecnología | Rol |
|---|---|---|
| Aplicación | Next.js 16 · React 19 | Interfaz rápida y responsive, renderizada en servidor. Un mismo código sirve el panel interno y el portal público. |
| Base de datos | PostgreSQL · Prisma 7 | Motor relacional maduro. Cada cambio de estructura queda registrado en una migración, con historial y reversión. |
| Infraestructura | Vercel | Despliegue continuo, ambientes separados, escalado automático y SSL. |
| Archivos | Cloudflare R2 | Evidencias documentales, logotipos institucionales y exportaciones (SDK S3 ya instalado). |
| Identidad | Sesión HMAC en cookie HttpOnly | Roles, expiración por inactividad; el esquema ya modela bloqueo por intentos fallidos. |
| Inteligencia | OpenAI | Redacción asistida de fichas y normalización de importaciones (SDK instalado, pendiente de conectar). |

## Módulos

| Código | Módulo | Estado |
|---|---|---|
| M1 | Diagnóstico de madurez — 52 variables contra 8 referentes (eMM, D.1330, CNA, TOGAF, DAMA, INTEF, ISO 27001, CMI) con hallazgo/recomendación/evidencia, dominios diagnósticos y registros calificados | ✅ |
| M2 | Comparación — pares, cuadrante de pertinencia, mapas de Colombia y Cesar (geometría oficial, filtro por subregión) | ✅ |
| M3 | Capacidades — mapa estratégico navegable objetivo → capacidad → iniciativa → KPI | ✅ |
| M4 | Indicadores — batería con serie, semáforo frente a meta, dueño y fuente | ✅ |
| M5 | Ruta — Gantt por trimestres + matriz impacto × factibilidad, ficha de iniciativa | ✅ |
| M6 | Seguimiento — presupuesto en tres estados, factores críticos con historial | ✅ |
| M7 | Inteligencia — puerta a los observatorios de Algoritmo T | ✅ (enlace) |
| GP | Gestor de proyectos — 74 tareas con fechas, responsables con nombre propio, dependencias, evidencia por entregable; kanban, cronograma y carga por persona; alertas integradas | ✅ |

## Ejecutar

```bash
npm install
npm run dev        # http://localhost:3000
```

**Modo demo (por defecto):** no requiere base de datos. La autenticación valida
contra las cuentas de demostración y todos los módulos leen `src/data/demo.ts`.

| Cuenta | Rol |
|---|---|
| consultor@algoritmot.com | Consultor (configura y publica) |
| lider@unicesar.edu.co | Líder institucional |
| academica@unicesar.edu.co | Responsable de línea 4.1 |
| rectoria@unicesar.edu.co | Directivo (solo lectura) |

Contraseña común: `pgtd-demo-2026`.

## Conectar PostgreSQL

1. Crear la base (Neon, Vercel Postgres o local) y poner `DATABASE_URL` en `.env.local`.
2. `npm run db:migrate` — crea el esquema (11 modelos, migración versionada).
3. `npm run db:seed` — siembra la UPC con los mismos datos del modo demo.
4. Migrar `api/auth/login` de `DEMO_USERS` al modelo `User` (bcrypt ya instalado).

`src/data/demo.ts` es la fuente única: alimenta la UI en modo demo y el seed,
de modo que no hay divergencia entre ambos.

## Arquitectura de lógica de negocio

```
docs/marco-conceptual.md      # traza literatura → reglas (9 artículos procesados)
src/lib/ies.ts                # metodología AlgoritmoT-IES (deep-research-report):
                              #   S = 0,40·P + 0,60·E; brecha P−E; niveles
                              #   0–100; IIES 30/25/20/25; matriz 4×7; AIQ-IES
                              #   con salvaguardas; cobertura; prioridad 6-criterios
src/lib/logic.ts              # reglas puras: salud de KPI (semáforo, rezago de
                              #   captura, proyección lineal a meta), riesgo
                              #   compuesto de iniciativas (factores con racha,
                              #   desalineación presupuesto↔avance, acciones
                              #   vencidas, categorías BID), salud de objetivos
                              #   CMI, rollup de madurez y motor de alertas
src/app/api/td/               # API autenticada que expone la lógica:
                              #   /summary /alerts /kpi /initiatives /portfolio
```

Las páginas consumen `logic.ts` directamente (server-side friendly) y la API
expone lo mismo para clientes externos o para la migración a base de datos:
al conectar Postgres solo cambia el origen de los datos, no las reglas.

## Vista pública de solo lectura

El botón «Vista pública» de la topbar genera un enlace firmado (HMAC del
secreto del servidor) del tipo `/p/upc-<token>`, lo copia al portapapeles y lo
abre. La página es un tablero ejecutivo sin sesión —madurez con serie, asuntos
críticos, semáforo de KPI y cartera por riesgo— pensado para Consejo Superior,
entes de control y acreditación. Un token inválido responde 404; rotar
`AUTH_SECRET` invalida los enlaces emitidos.

## Pruebas

```bash
npm test        # node:test + tsx — 18 pruebas del motor de lógica
```

Cubren: orden de periodos, semáforos y proyección lineal de KPI, rezago de
captura por periodicidad, categorías de riesgo, ponderación de rachas,
desalineación presupuestal, acciones vencidas, rollup de madurez, orden de
alertas y consistencia del resumen ejecutivo.

## Datos demo a escala

- 3 ciclos de medición (48 celdas) con serie institucional 1,50 → 1,94
- 18 KPI con ficha completa y series de hasta 8 cortes con notas
- 14 iniciativas con 50 acciones, bitácoras y factores clasificados por riesgo
- Instrumento de 52 variables (3–4 por celda) cuyo promedio ES el score de
  celda (consistencia verificada por test), cada una con referente, hallazgo,
  recomendación, responsable y evidencia
- 33 registros calificados con resolución, vencimiento, estado y última
  autoevaluación; 6 dominios diagnósticos transversales
- 32 evidencias tipificadas con estado de verificación
- Portafolio académico de 33 programas (13.374 estudiantes) por facultad,
  sede, modalidad, % de créditos virtuales, deserción, Saber Pro y equilibrio
- Huella territorial con 3 lentes por municipio (matrícula, producción de
  investigación, convenios de extensión) + impacto nacional (12 departamentos
  con coautorías) e internacional (8 países); consistencia con el KPI EX-01

## Estructura

```
src/
├── app/
│   ├── page.tsx                 # portada + login
│   ├── api/auth/                # login / logout (cookie HMAC)
│   └── panel/                   # módulos M1–M7 (protegidos por sesión)
├── components/
│   ├── charts.tsx               # radar, heatmap, gantt, matriz, mapas — SVG propio
│   ├── shell.tsx                # sidebar + topbar
│   └── ui.tsx                   # primitivas (cards, chips, badges)
├── data/
│   ├── demo.ts                  # datos ilustrativos UPC (única fuente)
│   └── geo.ts                   # paths SVG precalculados del GeoJSON oficial
└── lib/session.ts               # sesión firmada
prisma/
├── schema.prisma                # multi-institución: 11 modelos
└── seed.ts
```

## Nota sobre los datos

Todos los valores son ilustrativos y así se declara en el banner de cada módulo.
La primera medición real de la UPC se produce en la Fase 0 de la consultoría.
