import {PrismaClient} from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function seed() {
  const categories = [
    {slug: 'mathematics', name: 'Mathematics & Calculus'},
    {slug: 'coding', name: 'Coding & Computer Science'},
    {slug: 'languages', name: 'Languages & Literature'},
    {slug: 'science', name: 'Science & Physics'},
    {slug: 'ai-data', name: 'AI & Data Science'},
    {slug: 'music-arts', name: 'Music, Art & Design'},
    {slug: 'business', name: 'Business & Economics'},
    {slug: 'exam-prep', name: 'SAT, GRE & Exam Prep'},
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: {slug: cat.slug},
      update: {name: cat.name},
      create: cat,
    });
  }

  const tutors = [
    {
      id: 'tutor-1',
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@fives.edu',
      bio: 'Ph.D. in Applied Mathematics from MIT with 8+ years teaching Calculus, Linear Algebra, and Differential Equations to university and high school students.',
      specialty: 'Mathématiques & Analyse (Bac / Prépa)',
      credentials: 'Doctorat (Ph.D.) en Mathématiques Appliquées',
      experience: '8 ans d’enseignement universitaire et prépa',
      phone: '+216 22 410 112',
      verified: true,
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'tutor-2',
      name: 'Prof. Marcus Vance',
      email: 'marcus.vance@fives.edu',
      bio: 'Senior Software Engineer & CS Educator specializing in Python, Full-Stack Web Development, Data Structures, and Technical Interview Prep.',
      specialty: 'Informatique, Python & Algorithmique',
      credentials: 'Ingénieur Principal en Génie Logiciel',
      experience: '6 ans de mentorat académique et PFE',
      phone: '+216 55 890 304',
      verified: true,
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'tutor-3',
      name: 'Sofia Mendoza',
      email: 'sofia.mendoza@fives.edu',
      bio: 'Certified DELE & IELTS Language Coach helping students achieve conversational fluency in Spanish, English, and Academic Writing.',
      specialty: 'Langues (Anglais, Espagnol, Français & IELTS)',
      credentials: 'Certifiée DELE & Coach Académique IELTS',
      experience: '5 ans d’accompagnement linguistique',
      phone: '+216 98 312 450',
      verified: true,
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'tutor-4',
      name: 'Dr. Aris Thorne',
      email: 'aris.thorne@fives.edu',
      bio: 'AI Researcher & Data Scientist teaching Machine Learning, PyTorch, Statistics, and hands-on AI project mentorship.',
      specialty: 'Intelligence Artificielle, Data Science & Statistique',
      credentials: 'Chercheur IA & Doctorat en Science des Données',
      experience: '4 ans d’encadrement PFE & Master',
      phone: '+216 29 701 885',
      verified: false,
      verificationStatus: 'PENDING',
    },
  ];

  for (const t of tutors) {
    await prisma.user.upsert({
      where: {email: t.email},
      update: {name: t.name, role: 'FREELANCER'},
      create: {
        id: t.id,
        name: t.name,
        email: t.email,
        emailVerified: true,
        role: 'FREELANCER',
        points: 120,
        hasPassword: true,
        imageSource: 'NULL',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.seller.upsert({
      where: {userId: t.id},
      update: {
        bio: t.bio,
        isVerified: t.verified,
        verificationStatus: t.verificationStatus,
        specialty: t.specialty,
        credentials: t.credentials,
        experience: t.experience,
        phone: t.phone,
      },
      create: {
        userId: t.id,
        bio: t.bio,
        isVerified: t.verified,
        verificationStatus: t.verificationStatus,
        specialty: t.specialty,
        credentials: t.credentials,
        experience: t.experience,
        phone: t.phone,
      },
    });
  }

  // Ensure any existing student account with 0 points gets an initial 50 Points (50 DT) wallet balance
  const zeroPointUsers = await prisma.user.findMany({
    where: {points: 0},
  });
  for (const u of zeroPointUsers) {
    await prisma.user.update({
      where: {id: u.id},
      data: {points: 50},
    });
    await prisma.pointTransaction.create({
      data: {
        userId: u.id,
        amount: 50,
        type: 'BONUS',
        description: 'Solde de bienvenue 9arrini (50 Points = 50 DT)',
      },
    });
  }

  const sessions = [
    {
      slug: 'calculus-linear-algebra-1on1-mastery',
      title: 'I will tutor you in Calculus I-III, Linear Algebra & Differential Equations',
      description:
        '<p>Master university and AP-level Mathematics with personalized 1-on-1 live tutoring sessions! Together we will break down complex theorems into intuitive visual concepts, work through step-by-step problem sets, and prepare you thoroughly for midterms and finals.</p>',
      images: ['/assets/seo.webp'],
      categorySlug: 'mathematics',
      sellerId: 'tutor-1',
      tags: ['calculus', 'linear-algebra', 'mathematics', 'exam-prep'],
      packages: [
        {
          name: 'BASIC',
          price: 25,
          delivery: 2,
          revisions: 2,
          description:
            '1x 60-minute live 1-on-1 math tutoring session (25 Dinars) + PDF notes & series d exercices',
        },
        {
          name: 'STANDARD',
          price: 70,
          delivery: 7,
          revisions: 5,
          description:
            '3x 60-minute live tutoring sessions (70 Dinars) + résumé de cours + correction devoirs',
        },
        {
          name: 'PREMIUM',
          price: 130,
          delivery: 14,
          revisions: 10,
          description:
            '6x 60-minute intensive exam/bac prep bootcamp (130 Dinars) + révision générale + suivi direct',
        },
      ],
      faqs: [
        {
          question: 'What levels of math do you tutor?',
          answer:
            'I tutor High School AP Calculus (AB/BC), IB Math, and University Calculus I-III, Linear Algebra, and Differential Equations.',
        },
        {
          question: 'Do you provide practice worksheets?',
          answer:
            'Yes! Every session includes custom-curated practice problems and annotated digital whiteboard notes.',
        },
      ],
    },
    {
      slug: 'python-algorithms-cs-mentorship',
      title: 'I will teach you Python, Data Structures, Algorithms & Web Development',
      description:
        '<p>Learn computer science and modern software engineering through hands-on coding sessions! Whether you are a complete beginner writing your first Python script or a CS student preparing for coding interviews, every lesson is tailored to your pace.</p>',
      images: ['/assets/software-development.webp'],
      categorySlug: 'coding',
      sellerId: 'tutor-2',
      tags: ['python', 'algorithms', 'computer-science', 'web-development'],
      packages: [
        {
          name: 'BASIC',
          price: 45,
          delivery: 2,
          revisions: 2,
          description: '1-on-1 live coding lesson (60 mins) + code review & exercises',
        },
        {
          name: 'STANDARD',
          price: 120,
          delivery: 7,
          revisions: 5,
          description: '3x live coding sessions + mini-project mentorship + debugging support',
        },
        {
          name: 'PREMIUM',
          price: 220,
          delivery: 14,
          revisions: 10,
          description: '6x comprehensive CS & full-stack mentorship sessions + portfolio project',
        },
      ],
      faqs: [
        {
          question: 'Is this suitable for absolute beginners?',
          answer:
            'Absolutely! We start from the fundamentals and build real projects step by step.',
        },
      ],
    },
    {
      slug: 'conversational-spanish-academic-writing-coach',
      title: 'I will coach you in Conversational Spanish, Grammar & Academic Writing',
      description:
        '<p>Build natural fluency and confidence with interactive language coaching! Each lesson combines real-world conversation practice, pronunciation feedback, grammar mastery, and structured vocabulary building.</p>',
      images: ['/assets/voice-over.webp'],
      categorySlug: 'languages',
      sellerId: 'tutor-3',
      tags: ['spanish', 'language-tutoring', 'grammar', 'academic-writing'],
      packages: [
        {
          name: 'BASIC',
          price: 25,
          delivery: 2,
          revisions: 2,
          description: '1x 60-minute live conversation & grammar lesson + vocabulary deck',
        },
        {
          name: 'STANDARD',
          price: 70,
          delivery: 7,
          revisions: 4,
          description:
            '3x 60-minute language lessons + pronunciation coaching + writing feedback',
        },
        {
          name: 'PREMIUM',
          price: 130,
          delivery: 14,
          revisions: 8,
          description: '6x 60-minute fluency immersion program + customized study plan',
        },
      ],
      faqs: [
        {
          question: 'Can we focus on exam preparation like DELE or AP Spanish?',
          answer:
            'Yes, I customize lessons for DELE, AP Spanish, or everyday travel and business fluency.',
        },
      ],
    },
    {
      slug: 'machine-learning-data-science-tutoring',
      title: 'I will mentor you in Machine Learning, Data Science & AI with Python',
      description:
        '<p>Dive into Data Science, Pandas, Scikit-Learn, and Deep Learning with clear, practical 1-on-1 guidance. Ideal for university students, researchers, and career switchers looking to understand the math and code behind modern AI.</p>',
      images: ['/assets/data-science.webp'],
      categorySlug: 'ai-data',
      sellerId: 'tutor-4',
      tags: ['machine-learning', 'data-science', 'ai', 'pytorch'],
      packages: [
        {
          name: 'BASIC',
          price: 50,
          delivery: 2,
          revisions: 2,
          description:
            '1x 60-minute Data Science / ML tutoring session + Jupyter notebook walkthrough',
        },
        {
          name: 'STANDARD',
          price: 140,
          delivery: 7,
          revisions: 5,
          description:
            '3x 60-minute ML sessions + dataset project guidance + model evaluation review',
        },
        {
          name: 'PREMIUM',
          price: 260,
          delivery: 14,
          revisions: 10,
          description:
            '6x 60-minute end-to-end AI & Deep Learning mentorship + capstone project',
        },
      ],
      faqs: [
        {
          question: 'Do I need advanced math before starting?',
          answer:
            'I explain all required linear algebra and probability concepts intuitively as we code.',
        },
      ],
    },
  ];

  for (const s of sessions) {
    const existing = await prisma.service.findUnique({where: {slug: s.slug}});
    if (!existing) {
      await prisma.service.create({
        data: {
          slug: s.slug,
          title: s.title,
          description: s.description,
          images: s.images,
          status: 'ACTIVE',
          category: {connect: {slug: s.categorySlug}},
          freelancer: {connect: {id: s.sellerId}},
          seller: {connect: {userId: s.sellerId}},
          tags: {
            connectOrCreate: s.tags.map(tag => ({
              where: {slug: tag},
              create: {name: tag, slug: tag},
            })),
          },
          packages: {create: s.packages},
          faqs: {create: s.faqs},
        },
      });
    }
  }

  console.log('Seed completed successfully!');
  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
