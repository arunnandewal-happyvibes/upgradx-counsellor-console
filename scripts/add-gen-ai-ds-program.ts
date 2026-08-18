import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BLOB = "https://wr1sc9ozwkffuq9w.public.blob.vercel-storage.com/brochures";

// Real program data from the user-supplied "Gen-AI Powered Data Science
// E-Brochure.pdf". Duration is NOT printed as an explicit "X Months" figure
// anywhere in the brochure (it only lists "2 Months Guided Industry
// Projects" as one highlight among several) — the "7 Months" value below is
// a reasoned placeholder given this is a 6-course curriculum (vs. 4 courses
// for the existing "Gen AI Powered Data Analytics" program, seeded at 5
// months) and should be confirmed/edited via /admin/courses.
const program = {
  name: "Gen AI Powered Data Science with Machine Learning",
  slug: "gen-ai-powered-data-science",
  duration: "7 Months",
  mode: "Offline",
  category: "Data Science",
  description:
    "An end-to-end data science program spanning Excel, Power BI/Tableau, SQL, Python, statistics and machine learning — with Generative AI woven into every course, capped by an IIIT Bangalore add-on certification.",
  bullets: [
    "Excel, Power BI & Tableau dashboards with GenAI storytelling",
    "SQL with cloud integration, Python, and AI-assisted statistics",
    "18+ ML algorithms, deep learning, and GenAI/RAG/LLM workflows",
  ],
  brochureUrl: `${BLOB}/gen-ai-powered-data-science.pdf`,
  certifications: [
    {
      name: "Gen AI Powered Data Science Certification",
      partnerInstitution: "IIIT Bangalore",
      brochureUrl: `${BLOB}/gen-ai-powered-data-science.pdf`,
    },
  ],
  modules: [
    [
      "Excel & GenAI for Analytics",
      "Advanced formulas, Goal Seek, Scenario Manager and Data Tables — plus GenAI for formula generation, KPI explanation and automated summaries. Build a Superstore Sales Dashboard with GPT and automated VBA + GenAI reports.",
    ],
    [
      "Power BI & Tableau",
      "End-to-end ETL and data modeling, DAX from fundamentals to advanced use cases, and GenAI-assisted data storytelling. Build a Home Loan Default dashboard, retail/superstore profitability dashboards, and dynamic Tableau dashboards with parameters and joins.",
    ],
    [
      "SQL (with Cloud Integration)",
      "Relational databases and ER modeling, advanced SQL joins/subqueries/window functions, query optimization using GenAI, and SQL + Azure cloud integration. Build an RSVP Movie Database and marketplace demand-supply analysis.",
    ],
    [
      "Python for Data Analysis",
      "Python fundamentals, functional programming, OOP, NumPy, Pandas and data visualization, plus GenAI-supported EDA. Build Credit Risk Analysis, Uber Trip Demand Analysis and stock market analysis projects.",
    ],
    [
      "Statistics & Probability (AI-assisted)",
      "Descriptive and inferential statistics, hypothesis testing, ANOVA and Chi-square, plus AI-assisted statistical interpretation. Build a Customer Churn Distribution Analysis and a Bank Credit Scoring statistical report.",
    ],
    [
      "AI & Machine Learning",
      "18+ ML algorithms and pipelines, feature engineering and hyperparameter tuning, model explainability (SHAP, LIME), deep learning (CNNs, RNNs, LSTMs), and Generative AI/RAG/LLM workflows with prompt engineering. Build Credit Risk & Churn Prediction models, a Demand Forecasting system, and LLM-powered apps deployed via Flask, Streamlit and Gradio.",
    ],
  ],
};

async function main() {
  const existing = await prisma.program.findUnique({ where: { slug: program.slug } });
  const order = existing ? undefined : await prisma.program.count();

  const created = await prisma.program.upsert({
    where: { slug: program.slug },
    update: {
      name: program.name,
      duration: program.duration,
      mode: program.mode,
      category: program.category,
      description: program.description,
      bullets: program.bullets,
      brochureUrl: program.brochureUrl,
    },
    create: {
      name: program.name,
      slug: program.slug,
      duration: program.duration,
      mode: program.mode,
      category: program.category,
      description: program.description,
      bullets: program.bullets,
      brochureUrl: program.brochureUrl,
      order: order ?? 0,
      certifications: { create: program.certifications },
      curriculumModules: {
        create: program.modules.map(([title, content], i) => ({ title, order: i, content })),
      },
    },
  });

  if (existing) {
    // Re-running: replace certifications/modules so content stays in sync.
    await prisma.$transaction([
      prisma.certification.deleteMany({ where: { programId: created.id } }),
      prisma.curriculumModule.deleteMany({ where: { programId: created.id } }),
      prisma.certification.createMany({
        data: program.certifications.map((c) => ({ ...c, programId: created.id })),
      }),
      prisma.curriculumModule.createMany({
        data: program.modules.map(([title, content], i) => ({ title, order: i, content, programId: created.id })),
      }),
    ]);
  }

  console.log(`${existing ? "Updated" : "Created"} program: ${created.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
