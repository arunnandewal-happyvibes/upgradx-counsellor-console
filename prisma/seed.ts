import { PrismaClient } from "@prisma/client";
import industryLeaders from "../scripts/industry-leaders-data.json";
import starMentors from "../scripts/star-mentors-data.json";
import faqData from "../scripts/faq-data.json";

const prisma = new PrismaClient();

const BLOB = "https://wr1sc9ozwkffuq9w.public.blob.vercel-storage.com/brochures";

async function main() {
  // ---- Cities (Pune deliberately sparse: no drives, no batches, 1 instructor) ----
  // The four "core" cities below get full contact/instructor/batch/drive data;
  // the rest are the remaining upGrad X learning-centre cities, seeded as
  // presence-only entries (city dropdown + a Contact page placeholder) with no
  // monument photo — upload one per city via /admin/cities.
  const [bangalore, delhi, mumbai, pune] = await Promise.all(
    [
      { name: "Bengaluru", slug: "bangalore" },
      { name: "Delhi NCR", slug: "delhi-ncr" },
      { name: "Mumbai", slug: "mumbai" },
      { name: "Pune", slug: "pune" },
    ].map((c) => prisma.city.upsert({ where: { slug: c.slug }, update: { name: c.name }, create: c })),
  );

  const OTHER_CITIES = [
    "Hyderabad", "Chennai", "Belagavi", "Bhopal", "Bhubaneswar", "Coimbatore",
    "Dehradun", "Indore", "Gurugram", "Jabalpur", "Jaipur", "Kolkata",
    "Mangalore", "Chandigarh", "Bilaspur", "Raipur", "Panipat", "Rajkot", "Sambhajinagar",
  ];
  for (const name of OTHER_CITIES) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await prisma.city.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }

  await Promise.all([
    prisma.cityContact.upsert({
      where: { cityId: bangalore.id },
      update: {},
      create: {
        cityId: bangalore.id,
        address: "upGrad X Learning Centre, Indiranagar, Bangalore, KA 560038",
        phone: "+91 80 4000 1111",
        email: "bangalore@upgradx.com",
      },
    }),
    prisma.cityContact.upsert({
      where: { cityId: delhi.id },
      update: {},
      create: {
        cityId: delhi.id,
        address: "upGrad X Learning Centre, Connaught Place, New Delhi 110001",
        phone: "+91 11 4000 2222",
        email: "delhi@upgradx.com",
      },
    }),
    prisma.cityContact.upsert({
      where: { cityId: mumbai.id },
      update: {},
      create: {
        cityId: mumbai.id,
        address: "upGrad X Learning Centre, Andheri East, Mumbai, MH 400069",
        phone: "+91 22 4000 3333",
        email: "mumbai@upgradx.com",
      },
    }),
    prisma.cityContact.upsert({
      where: { cityId: pune.id },
      update: {},
      create: {
        cityId: pune.id,
        address: "upGrad X Learning Centre, Baner, Pune, MH 411045",
        phone: "+91 20 4000 4444",
        email: "pune@upgradx.com",
      },
    }),
  ]);

  // ---- Hiring partners ----
  await prisma.hiringPartner.deleteMany();
  await prisma.hiringPartner.createMany({
    data: [
      "Amazon", "Deloitte", "TCS", "Accenture", "Flipkart", "PwC", "Cognizant", "ICICI Bank",
    ].map((name, i) => ({ name, order: i })),
  });

  // ---- Programs + certifications + curriculum ----
  // Content sourced directly from the upGrad X program E-Brochures. Durations for
  // "Gen AI Powered Data Analytics", "Digital Marketing", and "Gen AI Powered
  // Data Science with Machine Learning" were not printed as an explicit
  // "X Months" figure in their brochures (unlike the other four) — the
  // values below are reasonable placeholders and should be confirmed/edited here.
  const programDefs = [
    {
      name: "Gen AI Powered Data Analytics",
      slug: "gen-ai-powered-data-analytics",
      duration: "5 Months",
      mode: "Offline",
      category: "Data Science",
      description:
        "A hands-on program covering Excel, SQL, Python and Power BI/Tableau — building GenAI-assisted dashboards, reports and analytics workflows from raw data to business insight.",
      bullets: [
        "Excel & SQL for real-world business analytics",
        "Power BI & Tableau dashboards with GenAI storytelling",
        "Python, NumPy & Pandas for exploratory data analysis",
      ],
      brochureUrl: `${BLOB}/gen-ai-powered-data-analytics.pdf`,
      certifications: [
        {
          name: "Gen AI Powered Data Analytics Certification",
          partnerInstitution: "IIIT Bangalore",
          brochureUrl: `${BLOB}/gen-ai-powered-data-analytics.pdf`,
        },
      ],
      modules: [
        [
          "Excel & GenAI for Analytics",
          "Advanced formulas, Goal Seek, Scenario Manager and Data Tables — plus GenAI for formula generation, KPI explanation and automated summaries. Build a Superstore Sales Dashboard with GPT and automated VBA + GenAI reports.",
        ],
        [
          "Power BI & Tableau",
          "End-to-end ETL and data modeling, DAX from fundamentals to advanced use cases, and GenAI-assisted data storytelling. Build a Home Loan Default dashboard and dynamic Tableau dashboards with parameters and joins.",
        ],
        [
          "SQL (with Cloud Integration)",
          "Relational databases and ER modeling, advanced SQL joins/subqueries/window functions, query optimization using GenAI, and SQL + Azure cloud integration. Build an RSVP Movie Database and marketplace demand-supply analysis.",
        ],
        [
          "Python for Data Analysis",
          "Python fundamentals, OOP, NumPy, Pandas and data visualization, plus GenAI-supported EDA. Build Credit Risk Analysis, Uber Trip Demand Analysis and stock market analysis projects.",
        ],
      ],
    },
    {
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
    },
    {
      name: "Full Stack Development with AI",
      slug: "full-stack-development-with-ai",
      duration: "6 Months",
      mode: "Offline",
      category: "Engineering",
      description:
        "An AI-native full stack program covering Java, DSA, React, Node.js and Spring Boot — with GitHub Copilot, LangChain and RAG woven into every course, capped by a PwC add-on certification.",
      bullets: [
        "Programming, OOP & DSA with AI pair-programming",
        "Modern React frontend + Node.js/Spring Boot backend",
        "LangChain, RAG & DevOps with Docker and AWS",
      ],
      brochureUrl: `${BLOB}/full-stack-development-with-ai.pdf`,
      certifications: [
        { name: "Full Stack Development Certification", partnerInstitution: "PwC", brochureUrl: `${BLOB}/full-stack-development-with-ai.pdf` },
      ],
      modules: [
        [
          "AI Bootcamp & Foundations",
          "AI-powered development setup with ChatGPT, Claude and GitHub Copilot; AI ethics and responsible usage; and an introduction to the full stack development landscape and SDLC.",
        ],
        [
          "Programming, OOP & DSA Mastery",
          "Core and advanced Java with Copilot pair programming, object-oriented design and SOLID principles, and data structures & algorithms across 100+ LeetCode-style problems with an AI Algorithm Coach.",
        ],
        [
          "Modern Frontend Development",
          "HTML5, CSS3, Flexbox, Grid and Tailwind CSS; modern JavaScript (ES6+) and TypeScript basics; React 18+ with Hooks, Context, Router and Redux; and AI-powered UI development with v0.dev and Figma AI.",
        ],
        [
          "Backend Development & Databases",
          "MySQL database design and AI query tuning, Node.js + Express + MongoDB (MERN) with RESTful APIs and JWT authentication, and enterprise Java with Spring Boot, Spring Data JPA and microservices.",
        ],
        [
          "Advanced AI Integration & DevOps",
          "Prompt engineering mastery, LangChain and RAG systems for intelligent chatbots, AI-assisted testing and debugging, and DevOps with Docker, CI/CD pipelines and AWS deployment.",
        ],
        [
          "Capstone Project & Portfolio",
          "An end-to-end AI-powered full stack application (e-commerce, media connect, or a custom idea) using React, Java/Node.js, databases and RAG — deployed with Docker, CI/CD, security and monitoring, and presented as a portfolio-ready live project.",
        ],
      ],
    },
    {
      name: "AI Pro: Generative AI & Agentic AI",
      slug: "ai-pro",
      duration: "3 Months",
      mode: "Offline",
      category: "Artificial Intelligence",
      description:
        "Deploy production-ready GenAI applications: design RAG systems grounded in real data, build autonomous multi-step AI agents, and architect end-to-end AI systems for real-world use.",
      bullets: [
        "RAG pipelines with embeddings & vector databases",
        "Autonomous AI agents with tool calling & memory",
        "API-based GenAI system architecture & deployment",
      ],
      brochureUrl: `${BLOB}/ai-pro.pdf`,
      certifications: [
        { name: "AI Pro Certification", partnerInstitution: "IIIT Bangalore", brochureUrl: `${BLOB}/ai-pro.pdf` },
      ],
      modules: [
        [
          "Foundations of Applied GenAI Systems",
          "Prompt engineering pipelines with structured inputs and outputs, token/context/response-control mechanisms, and evaluation pipelines to compare and benchmark model responses.",
        ],
        [
          "Retrieval-Augmented Generation (RAG) Systems",
          "End-to-end RAG pipelines using real document datasets, embedding-based semantic search, and context-aware Q&A systems — including troubleshooting hallucinations and retrieval failures.",
        ],
        [
          "Agentic AI & Autonomous Workflows",
          "Multi-step agent workflows with tool calling, autonomous task-execution systems, and AI agents integrated with external tools and APIs, including safety boundaries and fallback mechanisms.",
        ],
        [
          "System Architecture & Deployment",
          "API-based GenAI services, deployed AI applications (local and cloud-ready), and end-to-end system architectures — culminating in a capstone such as an enterprise document intelligence platform or autonomous workflow agent.",
        ],
      ],
    },
    {
      name: "Digital Marketing",
      slug: "digital-marketing",
      duration: "4 Months",
      mode: "Offline",
      category: "Marketing",
      description:
        "Master WordPress website design, SEO, Meta & Google/YouTube ad campaigns, marketing automation and AI-powered marketing tools across 9 modules and 12+ live projects.",
      bullets: [
        "CMS website design (WordPress) & SEO with Rank Math",
        "Meta & Google/YouTube ad campaigns end-to-end",
        "AI for marketing + Amazon Advertising & Marketplace",
      ],
      brochureUrl: `${BLOB}/digital-marketing.pdf`,
      certifications: [
        { name: "Digital Marketing Certification", partnerInstitution: "upGrad", brochureUrl: `${BLOB}/digital-marketing.pdf` },
      ],
      modules: [
        [
          "CMS (WordPress) Website Design & Development",
          "Domain, hosting and cPanel setup, WordPress installation and configuration, theme and plugin selection, building pages with Elementor, and functional essentials like Google Analytics and backups.",
        ],
        [
          "Search Engine Optimization using Rank Math",
          "Focus keyword selection, SEO-friendly titles and meta descriptions, on-page and content SEO, image SEO, internal linking and featured snippet optimization.",
        ],
        [
          "Social Media Management & Marketing (Meta)",
          "Content strategy and creation via Meta Business Suite, ad account setup, the AIDA campaign model, ad creation and launch, KPI measurement and campaign optimization.",
        ],
        [
          "Google & YouTube Marketing",
          "Google and YouTube account and ad setup, campaign objectives, ad creation and launch, KPI tracking and ad optimization.",
        ],
        [
          "Marketing Automation",
          "Pabbly integrations, WhatsApp automation with Wati, Zoho CRM and marketing automation, and webhook integrations.",
        ],
        [
          "Graphics Design (Canva)",
          "Canva dashboard and project management, templates and elements, design creation, and file sharing and downloads.",
        ],
        [
          "Artificial Intelligence (AI) for Digital Marketing",
          "AI tools for blog writing, ad copy and social content, AI for image and video creation, AI-driven social media automation, and AI chatbots for customer engagement.",
        ],
        [
          "Amazon Advertising & Marketplace Marketing",
          "Amazon Seller and Vendor models, product listing and Amazon SEO, Sponsored Products/Brands/Display ads, campaign setup and keyword targeting, and ACoS/CTR/ROAS tracking.",
        ],
      ],
    },
    {
      name: "FutureStack: Data Science & GenAI",
      slug: "futurestack-data-science",
      duration: "3 Months",
      mode: "Offline",
      category: "Data Science",
      description:
        "A data-first, application-driven program combining data analysis, machine learning, business dashboards and GenAI/RAG — culminating in a deployed capstone application.",
      bullets: [
        "ML models: regression, classification & clustering",
        "Power BI dashboards with GenAI-assisted storytelling",
        "GenAI-powered data assistants & RAG chatbots",
      ],
      brochureUrl: `${BLOB}/futurestack-data-science.pdf`,
      certifications: [
        { name: "FutureStack Certification", partnerInstitution: "IIIT Bangalore", brochureUrl: `${BLOB}/futurestack-data-science.pdf` },
      ],
      modules: [
        [
          "Data & Programming Foundations",
          "Data ingestion and preprocessing pipelines using Python, exploratory data analysis workflows on real datasets, and SQL-based data extraction and reporting queries.",
        ],
        [
          "Statistics & Machine Learning for Business",
          "Regression, classification and clustering models, feature engineering and preprocessing pipelines, and model evaluation and comparison for business use cases.",
        ],
        [
          "Analytics, Visualization & Insights",
          "Interactive dashboards using Power BI, business-focused analytics reports, and insight-driven data storytelling presentations.",
        ],
        [
          "GenAI & RAG for Data Applications",
          "GenAI-powered data assistants, document-based RAG chatbots, and AI-enhanced analytics applications combining ML results with LLM-driven insights.",
        ],
        [
          "Deployment & Full-Stack Thinking",
          "Deployed analytics and GenAI applications, end-to-end data pipelines with AI interfaces, and integrated dashboards connected to AI services — culminating in a business intelligence capstone.",
        ],
      ],
    },
    {
      name: "Global & Investment Banking Operations",
      slug: "global-investment-banking-operations",
      duration: "4 Months",
      mode: "Offline",
      category: "Finance",
      description:
        "Built with leading BFSI employers: financial markets & products, KYC/AML operations, trade lifecycle and lending operations, plus AI-powered workplace automation with Excel and Copilot.",
      bullets: [
        "Financial markets: money market, bonds, derivatives, lending",
        "End-to-end KYC, AML/CFT & trade lifecycle operations",
        "Advanced Excel, Copilot & Looker Studio automation",
      ],
      brochureUrl: `${BLOB}/global-investment-banking-operations.pdf`,
      certifications: [
        {
          name: "Global & Investment Banking Operations Certification",
          partnerInstitution: "upGrad",
          brochureUrl: `${BLOB}/global-investment-banking-operations.pdf`,
        },
      ],
      modules: [
        [
          "Financial Markets & Products",
          "Full asset class coverage across money markets, bonds, equities, derivatives and lending; the investment banking ecosystem; debt and derivatives mechanics; and US lending products.",
        ],
        [
          "Client Onboarding & Financial Crime Operations",
          "End-to-end KYC workflow, AML/CFT frameworks, financial crime typologies, and SAR writing and escalation — capped by a mock KYC case file with OFAC/PEP screening and risk scoring.",
        ],
        [
          "Trade Operations & Post-Trade Control Functions",
          "The trade lifecycle of an interest rate swap, clearing and settlement mechanics, and reference data and corporate actions — including an IRS trade lifecycle walkthrough from execution to reconciliation.",
        ],
        [
          "Lending Operations & Credit Lifecycle Management",
          "The full loan lifecycle, commercial and corporate lending workflow, syndicated loan mechanics and credit documentation — including a syndicated loan deal sheet capstone in Excel.",
        ],
        [
          "AI for Workplace Automation",
          "Advanced Excel, Excel Macros (VBA), Microsoft Copilot and Looker Studio dashboards — culminating in a Financial Operations Dashboard visualizing loan portfolio quality and trade volume trends.",
        ],
        [
          "Career Launchpad",
          "Four real job-description walkthroughs and 10 dedicated interview-prep days, run alongside a program-wide \"Day 1 to Offer\" live project building evidence of career readiness.",
        ],
      ],
    },
  ];

  // Clean up anything that depends on Program before replacing the catalogue —
  // Batches and SectionVisibility rows hold a required/optional FK to Program.
  await prisma.batch.deleteMany();
  await prisma.sectionVisibility.deleteMany();
  await prisma.program.deleteMany();

  const programs = [];
  for (const [i, def] of programDefs.entries()) {
    const program = await prisma.program.create({
      data: {
        name: def.name,
        slug: def.slug,
        duration: def.duration,
        mode: def.mode,
        category: def.category,
        description: def.description,
        bullets: def.bullets,
        brochureUrl: def.brochureUrl,
        order: i,
        certifications: { create: def.certifications },
        curriculumModules: {
          create: def.modules.map(([title, content], order) => ({ title, content, order })),
        },
      },
    });
    programs.push(program);
  }

  // ---- Journey steps ----
  const journeySteps = [
    { order: 1, title: "One-on-One Personal Attention", description: "Small offline in-person cohorts with dedicated mentor time, not a recorded video queue.", icon: "user" },
    { order: 2, title: "Build Real Projects", description: "Work on industry-grade capstone projects reviewed by working professionals.", icon: "hammer" },
    { order: 3, title: "Get Career Support", description: "Resume reviews, mock interviews, and dedicated placement coordination.", icon: "briefcase" },
    { order: 4, title: "Land Your Next Job", description: "Get matched to hiring partners through exclusive placement drives.", icon: "flag" },
  ];
  for (const step of journeySteps) {
    await prisma.journeyStep.upsert({ where: { order: step.order }, update: step, create: step });
  }

  // ---- Instructors: only the real rosters below (no fictional placeholders) ----
  await prisma.instructor.deleteMany();

  // ---- Industry Leaders: real guest-lecturer/SME roster from "Guest Lecturer
  // Details.xlsx" (see scripts/add-industry-leaders.ts for field-mapping notes).
  // Shown across every city — cityId is a required-by-schema placeholder only.
  for (const [i, leader] of (industryLeaders as any[]).entries()) {
    await prisma.instructor.create({
      data: {
        name: leader.name,
        photoUrl: null,
        linkedinUrl: leader.linkedinUrl,
        subjectTaught: leader.subjectTaught,
        bio: leader.bio,
        experienceYears: leader.experienceYears,
        tags: leader.tags,
        isIndustryLeader: true,
        cityId: bangalore.id,
        order: i,
      },
    });
  }

  // ---- Star Mentors: real city-based teaching staff from "Star mentor
  // details.xlsx" (see scripts/add-star-mentors.ts for field-mapping notes).
  const allCities = await prisma.city.findMany();
  const cityBySlug = new Map(allCities.map((c) => [c.slug, c]));
  for (const [i, mentor] of (starMentors as any[]).entries()) {
    const city = cityBySlug.get(mentor.citySlug);
    if (!city) continue;
    await prisma.instructor.create({
      data: {
        name: mentor.name,
        photoUrl: null,
        linkedinUrl: mentor.linkedinUrl,
        subjectTaught: mentor.subjectTaught,
        bio: mentor.bio,
        experienceYears: mentor.experienceYears,
        tags: mentor.tags,
        isIndustryLeader: false,
        cityId: city.id,
        order: i,
      },
    });
  }

  // ---- Section visibility: Industry Leaders shown only for AI Pro & Full Stack ----
  const aiPro = programs.find((p) => p.slug === "ai-pro")!;
  const fsd = programs.find((p) => p.slug === "full-stack-development-with-ai")!;
  const digitalMarketing = programs.find((p) => p.slug === "digital-marketing")!;
  const banking = programs.find((p) => p.slug === "global-investment-banking-operations")!;
  for (const p of [aiPro, fsd]) {
    await prisma.sectionVisibility.create({
      data: { sectionKey: "industry-leaders", programId: p.id, isVisible: true },
    });
  }
  for (const p of [digitalMarketing, banking]) {
    await prisma.sectionVisibility.create({
      data: { sectionKey: "industry-leaders", programId: p.id, isVisible: false },
    });
  }

  // ---- Placement drives (Pune has none, on purpose) ----
  await prisma.placementDrive.deleteMany();
  const driveDefs = [
    { company: "Amazon", role: "Data Analyst", city: bangalore, days: 5 },
    { company: "Deloitte", role: "Business Analyst", city: bangalore, days: 10 },
    { company: "Flipkart", role: "Full Stack Engineer", city: bangalore, days: 14 },
    { company: "PwC", role: "Financial Analyst", city: delhi, days: 6 },
    { company: "Accenture", role: "Digital Marketing Associate", city: delhi, days: 12 },
    { company: "ICICI Bank", role: "Banking Operations Associate", city: mumbai, days: 8 },
    { company: "Cognizant", role: "Data Scientist", city: mumbai, days: 15 },
  ];
  for (const d of driveDefs) {
    const date = new Date();
    date.setDate(date.getDate() + d.days);
    await prisma.placementDrive.create({
      data: { company: d.company, role: d.role, cityId: d.city.id, date },
    });
  }

  // ---- Batches (Pune has none, on purpose) ----
  const batchCities = [bangalore, delhi, mumbai];
  let batchIndex = 0;
  for (const program of programs) {
    for (const city of batchCities) {
      batchIndex += 1;
      if (batchIndex % 2 === 0) continue; // keep the list to a manageable, realistic size
      const start = new Date();
      start.setDate(start.getDate() + 14 + batchIndex);
      const close = new Date(start);
      close.setDate(close.getDate() - 5);
      await prisma.batch.create({
        data: {
          programId: program.id,
          cityId: city.id,
          startDate: start,
          applicationCloseDate: close,
          timing: "Mon–Fri, 6:00 PM – 9:00 PM",
          location: `upGrad X Centre, ${city.name}`,
        },
      });
    }
  }

  // ---- Success stories (global, unfiltered by city) — one per program ----
  await prisma.successStory.deleteMany();
  await prisma.successStory.createMany({
    data: [
      { studentName: "Rahul Sharma", courseName: "AI Pro: Generative AI & Agentic AI", roleLanded: "Software Engineer", company: "Amazon", description: "Went from a support role to writing production code in under 8 months, landing an SDE offer with Amazon.", packageLabel: "Support Exec to ₹12 LPA", order: 0 },
      { studentName: "Priyanka Das", courseName: "Gen AI Powered Data Analytics", roleLanded: "Data Scientist", company: "Flipkart", description: "Made the leap from a non-tech background into a full-time data science role after building 3 capstone projects.", packageLabel: "Non-tech to ₹14 LPA", order: 1 },
      { studentName: "Mohammed Ali", courseName: "Digital Marketing", roleLanded: "Performance Marketing Manager", company: "Accenture", description: "Turned a freelance marketing hustle into a structured, high-growth agency role.", packageLabel: "Freelancer to ₹9 LPA", order: 2 },
      { studentName: "Ishita Verma", courseName: "Global & Investment Banking Operations", roleLanded: "Financial Analyst", company: "ICICI Bank", description: "Upskilled from a general commerce degree to a core banking operations analyst role.", packageLabel: "Graduate to ₹8 LPA", order: 3 },
      { studentName: "Karan Mehta", courseName: "FutureStack: Data Science & GenAI", roleLanded: "Business Analyst", company: "Deloitte", description: "Accountant to analyst — used dashboards, ML and GenAI to move into a consulting BI role.", packageLabel: "Accountant to ₹12 LPA", order: 4 },
      { studentName: "Sneha Reddy", courseName: "Full Stack Development with AI", roleLanded: "Frontend Developer", company: "Cognizant", description: "First job out of college, hired directly through an upGrad X placement drive.", packageLabel: "Fresher to ₹7 LPA", order: 5 },
    ],
  });

  // ---- FAQ categories + FAQs: real content from "FAQs_X.docx" (see
  // scripts/replace-faqs.ts for field-mapping notes) ----
  await prisma.faq.deleteMany();
  await prisma.faqCategory.deleteMany();
  for (const [i, cat] of (faqData as any[]).entries()) {
    await prisma.faqCategory.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        order: i,
        faqs: {
          create: cat.faqs.map(([question, answer]: [string, string], order: number) => ({
            question,
            answer,
            order,
          })),
        },
      },
    });
  }

  // ---- Events (phase-2, toggled on for the demo) ----
  await prisma.eventRegistration.deleteMany();
  await prisma.eventOccurrence.deleteMany();
  await prisma.event.deleteMany();
  const infoSession = await prisma.event.create({
    data: { name: "Data Science & GenAI Career Info Session", description: "A live session on breaking into data & AI roles, with Q&A from hiring partners.", isEnabled: true },
  });
  const openHouse = await prisma.event.create({
    data: { name: "Full Stack Campus Open House", description: "Tour the learning centre, meet instructors, and see sample project demos.", isEnabled: true },
  });
  for (const [event, days] of [[infoSession, 7], [openHouse, 14]] as const) {
    for (const city of [bangalore, delhi, mumbai]) {
      const date = new Date();
      date.setDate(date.getDate() + days);
      await prisma.eventOccurrence.create({ data: { eventId: event.id, cityId: city.id, date } });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
