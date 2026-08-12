import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ---- Cities (Pune deliberately sparse: no drives, no batches, 1 instructor) ----
  const [bangalore, delhi, mumbai, pune] = await Promise.all(
    [
      { name: "Bangalore", slug: "bangalore" },
      { name: "Delhi NCR", slug: "delhi-ncr" },
      { name: "Mumbai", slug: "mumbai" },
      { name: "Pune", slug: "pune" },
    ].map((c) => prisma.city.upsert({ where: { slug: c.slug }, update: {}, create: c })),
  );

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
  const programDefs = [
    {
      name: "Data Science with AI/ML",
      slug: "data-science-ai-ml",
      duration: "6 months",
      mode: "Offline",
      category: "Data Science",
      description:
        "A hands-on program covering machine learning, deep learning, and AI systems used in production, taught through live offline cohorts.",
      bullets: ["Python for Data Science", "ML & Deep Learning", "MLOps & Deployment", "Capstone with industry mentor"],
      certifications: [
        { name: "AI/ML Certification", partnerInstitution: "IIIT Bangalore", brochureUrl: "/brochures/ds-aiml-iiitb.pdf" },
        { name: "Applied ML Certification", partnerInstitution: "IIT Roorkee", brochureUrl: "/brochures/ds-aiml-iitr.pdf" },
      ],
      modules: [
        "Python & Statistics Foundations",
        "Machine Learning Algorithms",
        "Deep Learning & Neural Networks",
        "MLOps, Deployment & Monitoring",
        "Capstone Project",
      ],
    },
    {
      name: "Data Science with Data Analytics",
      slug: "data-science-analytics",
      duration: "5 months",
      mode: "Offline",
      category: "Data Science",
      description:
        "Focused on business analytics, dashboards, and data storytelling for roles in analytics and BI teams.",
      bullets: ["SQL & Excel Mastery", "Power BI & Tableau", "A/B Testing", "Business Case Studies"],
      certifications: [
        { name: "Data Analytics Certification", partnerInstitution: "IIIT Bangalore", brochureUrl: "/brochures/ds-analytics-iiitb.pdf" },
      ],
      modules: ["SQL & Data Wrangling", "Visualization with Power BI/Tableau", "Statistical Analysis", "Capstone Project"],
    },
    {
      name: "Digital Marketing",
      slug: "digital-marketing",
      duration: "4 months",
      mode: "Offline",
      category: "Marketing",
      description:
        "End-to-end digital marketing program covering SEO, performance marketing, and social media strategy.",
      bullets: ["SEO & SEM", "Performance Marketing", "Social Media Strategy", "Live Campaign Management"],
      certifications: [
        { name: "Digital Marketing Certification", partnerInstitution: "upGrad X", brochureUrl: "/brochures/digital-marketing.pdf" },
      ],
      modules: ["Marketing Fundamentals", "SEO & Content", "Performance Marketing (Google/Meta Ads)", "Analytics & Reporting"],
    },
    {
      name: "Full Stack Development — Essential",
      slug: "full-stack-essential",
      duration: "5 months",
      mode: "Offline",
      category: "Engineering",
      description:
        "Core full stack web development program for beginners — frontend, backend, and databases.",
      bullets: ["HTML/CSS/JS", "React", "Node.js & REST APIs", "SQL Databases"],
      certifications: [
        { name: "Full Stack Essential Certification", partnerInstitution: "upGrad X", brochureUrl: "/brochures/fullstack-essential.pdf" },
      ],
      modules: ["Web Fundamentals", "Frontend with React", "Backend with Node.js", "Databases & Deployment"],
    },
    {
      name: "Full Stack Development — Pro",
      slug: "full-stack-pro",
      duration: "8 months",
      mode: "Offline",
      category: "Engineering",
      description:
        "Advanced full stack track with system design, cloud deployment, and DSA for high-growth engineering roles.",
      bullets: ["DSA & System Design", "Microservices", "Cloud (AWS)", "Advanced React & Node.js"],
      certifications: [
        { name: "Full Stack Pro Certification", partnerInstitution: "IIIT Bangalore", brochureUrl: "/brochures/fullstack-pro-iiitb.pdf" },
      ],
      modules: ["DSA Foundations", "Advanced Frontend & Backend", "System Design", "Cloud & DevOps", "Capstone Project"],
    },
    {
      name: "Finance",
      slug: "finance",
      duration: "4 months",
      mode: "Offline",
      category: "Finance",
      description:
        "Practical finance program covering financial modeling, valuation, and investment analysis.",
      bullets: ["Financial Modeling", "Valuation", "Investment Analysis", "Excel for Finance"],
      certifications: [
        { name: "Finance Certification", partnerInstitution: "upGrad X", brochureUrl: "/brochures/finance.pdf" },
      ],
      modules: ["Accounting Foundations", "Financial Modeling", "Valuation Techniques", "Capstone Case Study"],
    },
  ];

  const programs = [];
  for (const [i, def] of programDefs.entries()) {
    const program = await prisma.program.upsert({
      where: { slug: def.slug },
      update: {},
      create: {
        name: def.name,
        slug: def.slug,
        duration: def.duration,
        mode: def.mode,
        category: def.category,
        description: def.description,
        bullets: def.bullets,
        order: i,
        certifications: { create: def.certifications },
        curriculumModules: { create: def.modules.map((title, order) => ({ title, order, content: `${title}: hands-on lessons, assignments, and mentor-led review sessions.` })) },
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

  // ---- Instructors (Pune deliberately sparse: 1 instructor) ----
  await prisma.instructor.deleteMany();
  const instructorDefs = [
    { name: "Ananya Rao", subjectTaught: "Data Science Instructor", experienceYears: 9, tags: ["Ex-Microsoft", "IIT Alum"], city: bangalore, leader: false },
    { name: "Karthik Iyer", subjectTaught: "Machine Learning Instructor", experienceYears: 7, tags: ["Ex-Flipkart"], city: bangalore, leader: false },
    { name: "Divya Menon", subjectTaught: "Full Stack Instructor", experienceYears: 6, tags: ["Ex-Amazon"], city: bangalore, leader: false },
    { name: "Rohit Malhotra", subjectTaught: "Digital Marketing Instructor", experienceYears: 8, tags: ["Ex-Google Ads Team"], city: delhi, leader: false },
    { name: "Sana Khan", subjectTaught: "Finance Instructor", experienceYears: 10, tags: ["CFA", "Ex-Deloitte"], city: delhi, leader: false },
    { name: "Aditya Bhargava", subjectTaught: "Data Science Instructor", experienceYears: 5, tags: ["Ex-Ola"], city: delhi, leader: false },
    { name: "Neha Kulkarni", subjectTaught: "Full Stack Instructor", experienceYears: 7, tags: ["Ex-Zomato"], city: mumbai, leader: false },
    { name: "Vikram Shah", subjectTaught: "Finance Instructor", experienceYears: 12, tags: ["Ex-ICICI", "CA"], city: mumbai, leader: false },
    { name: "Priya Nambiar", subjectTaught: "Digital Marketing Instructor", experienceYears: 6, tags: ["TEDx Speaker"], city: mumbai, leader: false },
    { name: "Arjun Desai", subjectTaught: "Data Science Instructor", experienceYears: 4, tags: ["Kaggle Grandmaster"], city: pune, leader: false },
    { name: "Meera Pillai", subjectTaught: "AI/ML Industry Leader", experienceYears: 14, tags: ["Ex-Microsoft AI Lead", "TEDx Speaker"], city: bangalore, leader: true },
    { name: "Sanjay Verma", subjectTaught: "Engineering Industry Leader", experienceYears: 15, tags: ["Ex-Amazon Principal Engineer"], city: bangalore, leader: true },
    { name: "Ritu Chawla", subjectTaught: "Data Science Industry Leader", experienceYears: 13, tags: ["Ex-Google AI"], city: delhi, leader: true },
  ];
  for (const [i, d] of instructorDefs.entries()) {
    await prisma.instructor.create({
      data: {
        name: d.name,
        photoUrl: null,
        linkedinUrl: "https://linkedin.com/in/example",
        subjectTaught: d.subjectTaught,
        bio: `${d.name.split(" ")[0]} brings deep industry experience into every classroom session, blending real case studies with core theory.`,
        experienceYears: d.experienceYears,
        tags: d.tags,
        isIndustryLeader: d.leader,
        cityId: d.city.id,
        order: i,
      },
    });
  }

  // ---- Section visibility: Industry Leaders shown only for Data Science & Full Stack Pro programs ----
  await prisma.sectionVisibility.deleteMany();
  const dsAiMl = programs.find((p) => p.slug === "data-science-ai-ml")!;
  const fsPro = programs.find((p) => p.slug === "full-stack-pro")!;
  const digitalMarketing = programs.find((p) => p.slug === "digital-marketing")!;
  const finance = programs.find((p) => p.slug === "finance")!;
  for (const p of [dsAiMl, fsPro]) {
    await prisma.sectionVisibility.create({
      data: { sectionKey: "industry-leaders", programId: p.id, isVisible: true },
    });
  }
  for (const p of [digitalMarketing, finance]) {
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
    { company: "ICICI Bank", role: "Finance Associate", city: mumbai, days: 8 },
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
  await prisma.batch.deleteMany();
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

  // ---- Success stories (global, unfiltered by city) ----
  await prisma.successStory.deleteMany();
  await prisma.successStory.createMany({
    data: [
      { studentName: "Rahul Sharma", courseName: "Full Stack Development — Pro", roleLanded: "Software Engineer", company: "Amazon", description: "Went from a support role to writing production code in under 8 months, landing an SDE offer with Amazon.", packageLabel: "Support Exec to ₹12 LPA", order: 0 },
      { studentName: "Priyanka Das", courseName: "Data Science with AI/ML", roleLanded: "Data Scientist", company: "Flipkart", description: "Made the leap from a non-tech background into a full-time data science role after building 3 capstone projects.", packageLabel: "Non-tech to ₹14 LPA", order: 1 },
      { studentName: "Mohammed Ali", courseName: "Digital Marketing", roleLanded: "Performance Marketing Manager", company: "Accenture", description: "Turned a freelance marketing hustle into a structured, high-growth agency role.", packageLabel: "Freelancer to ₹9 LPA", order: 2 },
      { studentName: "Ishita Verma", courseName: "Finance", roleLanded: "Financial Analyst", company: "ICICI Bank", description: "Upskilled from a general commerce degree to a core banking analyst role.", packageLabel: "Graduate to ₹8 LPA", order: 3 },
      { studentName: "Karan Mehta", courseName: "Data Science with Data Analytics", roleLanded: "Business Analyst", company: "Deloitte", description: "Accountant to analyst — used dashboards and SQL skills to move into a consulting BI role.", packageLabel: "Accountant to ₹12 LPA", order: 4 },
      { studentName: "Sneha Reddy", courseName: "Full Stack Development — Essential", roleLanded: "Frontend Developer", company: "Cognizant", description: "First job out of college, hired directly through an upGrad X placement drive.", packageLabel: "Fresher to ₹7 LPA", order: 5 },
    ],
  });

  // ---- FAQ categories + FAQs ----
  await prisma.faq.deleteMany();
  await prisma.faqCategory.deleteMany();
  const faqDefs = [
    {
      name: "Placements", slug: "placements", icon: "briefcase",
      faqs: [
        ["Do you guarantee placement?", "We guarantee placement support — dedicated coordination, mock interviews, and drives — through 12 months of active job search, not a guaranteed offer."],
        ["Which companies hire from upGrad X?", "Hiring partners include Amazon, Deloitte, TCS, Accenture, Flipkart, and more, varying by city and cohort."],
        ["What's the average placement package?", "Packages vary by program and prior experience; recent outcomes range from ₹6 LPA to ₹14+ LPA."],
      ],
    },
    {
      name: "Pricing", slug: "pricing", icon: "indian-rupee",
      faqs: [
        ["Are EMI options available?", "Yes, no-cost EMI plans are available starting at 3 months, with longer tenures through partner NBFCs."],
        ["Is there a refund policy?", "A full refund is available within the first 7 days of the program if you decide it isn't the right fit."],
      ],
    },
    {
      name: "Certifications", slug: "certifications", icon: "award",
      faqs: [
        ["Which certifications are recognized?", "Certifications are issued in partnership with institutions like IIIT Bangalore and IIT Roorkee, depending on the program."],
        ["Can I get more than one certificate?", "Some programs offer multiple certification tracks — each has its own brochure and requirements, shown on the program page."],
      ],
    },
    {
      name: "Quality of Teachers", slug: "quality-of-teachers", icon: "graduation-cap",
      faqs: [
        ["Who teaches the classes?", "Instructors are working professionals with 4+ years of industry experience, several from companies like Microsoft and Amazon."],
        ["Are classes recorded?", "Classes are primarily live and offline; select sessions are recorded for revision only."],
      ],
    },
    {
      name: "Number of Classes", slug: "number-of-classes", icon: "calendar",
      faqs: [
        ["How many hours per week?", "Most programs run 9–12 hours per week across weekday evenings and weekend sessions."],
        ["What happens if I miss a class?", "Missed sessions can be caught up through recap notes and a buddy-mentor system."],
      ],
    },
    {
      name: "Course Structure", slug: "course-structure", icon: "layout-list",
      faqs: [
        ["Is the course only theory?", "No — every program is built around hands-on modules, assignments, and a final capstone project."],
        ["Can I switch programs mid-way?", "Program switches are evaluated case-by-case with your counsellor within the first 2 weeks."],
      ],
    },
  ];
  for (const [i, cat] of faqDefs.entries()) {
    await prisma.faqCategory.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        order: i,
        faqs: { create: cat.faqs.map(([question, answer], order) => ({ question, answer, order })) },
      },
    });
  }

  // ---- Events (phase-2, toggled on for the demo) ----
  await prisma.eventRegistration.deleteMany();
  await prisma.eventOccurrence.deleteMany();
  await prisma.event.deleteMany();
  const infoSession = await prisma.event.create({
    data: { name: "Data Science Career Info Session", description: "A live session on breaking into data science roles, with Q&A from hiring partners.", isEnabled: true },
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
