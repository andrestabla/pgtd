// Seed de la PGTD: siembra la UPC con los mismos datos del modo demo.
// Uso: npm run db:seed  (requiere DATABASE_URL)

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  INSTITUTION, LINES, DIMENSIONS, SCORES, EVIDENCES,
  CAPABILITIES, KPIS, INITIATIVES, DEMO_USERS,
} from "../src/data/demo";

const prisma = new PrismaClient();

async function main() {
  const inst = await prisma.institution.upsert({
    where: { slug: INSTITUTION.slug },
    update: {},
    create: { ...INSTITUTION },
  });

  // usuarios
  for (const u of DEMO_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        role: u.role as never,
        line: "line" in u ? (u as { line?: number }).line : undefined,
        passwordHash: await bcrypt.hash(u.password, 10),
        institutionId: inst.id,
      },
    });
  }

  // instrumento
  const model = await prisma.maturityModel.upsert({
    where: { version: "2026.1" },
    update: {},
    create: {
      version: "2026.1",
      name: "Instrumento de madurez digital UPC",
      lines: LINES as never,
      dimensions: DIMENSIONS as never,
    },
  });

  // medición de línea base
  const assessment = await prisma.assessment.create({
    data: {
      institutionId: inst.id,
      modelId: model.id,
      label: "Línea base · Fase 0",
      periodStart: new Date("2026-08-01"),
      periodEnd: new Date("2026-08-31"),
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  for (const line of LINES) {
    for (const dim of DIMENSIONS) {
      const s = SCORES[line.n][dim.key];
      const score = await prisma.score.create({
        data: {
          assessmentId: assessment.id,
          line: line.n,
          dimension: dim.key,
          value: s.value,
          target: s.target,
        },
      });
      for (const ev of EVIDENCES.filter((e) => e.line === line.n && e.dimension === dim.key)) {
        await prisma.evidence.create({
          data: { scoreId: score.id, title: ev.title, source: ev.source },
        });
      }
    }
  }

  // capacidades
  const capIds = new Map<string, string>();
  for (const c of CAPABILITIES) {
    const cap = await prisma.capability.create({
      data: {
        institutionId: inst.id,
        line: c.line,
        name: c.name,
        currentLevel: c.current,
        targetLevel: c.target,
        ownerRole: c.owner,
        objective: c.objective,
      },
    });
    capIds.set(c.id, cap.id);
  }

  // KPI + series
  const kpiIds = new Map<string, string>();
  for (const k of KPIS) {
    const kpi = await prisma.kpi.create({
      data: {
        institutionId: inst.id,
        line: k.line,
        code: k.code,
        name: k.name,
        unit: k.unit,
        source: k.source,
        ownerRole: k.owner,
        frequency: k.frequency.toUpperCase() as never,
        baseline: k.baseline,
        target: k.target,
        goodDirection: k.goodDirection,
      },
    });
    kpiIds.set(k.code, kpi.id);
    for (const v of k.series) {
      await prisma.kpiValue.create({
        data: { kpiId: kpi.id, period: v.period, value: v.value },
      });
    }
  }

  // iniciativas + factores
  for (const i of INITIATIVES) {
    await prisma.initiative.create({
      data: {
        institutionId: inst.id,
        line: i.line,
        name: i.name,
        horizon: i.horizon,
        impact: i.impact,
        feasibility: i.feasibility,
        status: i.status as never,
        ownerRole: i.owner,
        startQuarter: i.start,
        endQuarter: i.end,
        budgetPlanned: i.budgetPlanned,
        budgetCommitted: i.budgetCommitted,
        budgetExecuted: i.budgetExecuted,
        progress: i.progress,
        capabilityId: capIds.get(i.capability),
        kpiId: kpiIds.get(i.kpi),
        successFactors: {
          create: i.factors.map((f) => ({
            name: f.name,
            state: f.state,
            history: f.history as never,
          })),
        },
      },
    });
  }

  console.log("Seed completo:", inst.name);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
