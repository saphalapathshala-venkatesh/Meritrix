import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const grades = await Promise.all([
    prisma.grade.upsert({
      where: { name: "Grade 6" },
      update: {},
      create: { name: "Grade 6", sortOrder: 6 },
    }),
    prisma.grade.upsert({
      where: { name: "Grade 7" },
      update: {},
      create: { name: "Grade 7", sortOrder: 7 },
    }),
    prisma.grade.upsert({
      where: { name: "Grade 8" },
      update: {},
      create: { name: "Grade 8", sortOrder: 8 },
    }),
  ]);

  for (const grade of grades) {
    const subjects = [
      { name: "Mathematics", slug: `math-${grade.sortOrder}`, mrp: 79, salePrice: 49 },
      { name: "Science", slug: `science-${grade.sortOrder}`, mrp: 69, salePrice: 39 },
      { name: "English", slug: `english-${grade.sortOrder}`, mrp: 59, salePrice: 34 },
    ];

    for (const subj of subjects) {
      const subject = await prisma.subject.upsert({
        where: { slug: subj.slug },
        update: { mrp: subj.mrp, salePrice: subj.salePrice, price: subj.salePrice },
        create: {
          gradeId: grade.id,
          name: subj.name,
          slug: subj.slug,
          price: subj.salePrice,
          mrp: subj.mrp,
          salePrice: subj.salePrice,
          sortOrder: subjects.indexOf(subj),
        },
      });

      const chapters = [
        { name: "Chapter 1", slug: `${subj.slug}-ch1`, sortOrder: 1 },
        { name: "Chapter 2", slug: `${subj.slug}-ch2`, sortOrder: 2 },
        { name: "Chapter 3", slug: `${subj.slug}-ch3`, sortOrder: 3 },
      ];

      for (const ch of chapters) {
        const chapter = await prisma.chapter.upsert({
          where: { slug: ch.slug },
          update: {},
          create: {
            subjectId: subject.id,
            name: ch.name,
            slug: ch.slug,
            sortOrder: ch.sortOrder,
          },
        });

        const tiers = ["foundational", "skill_builder", "mastery"] as const;
        for (const tier of tiers) {
          for (let i = 1; i <= 2; i++) {
            const wsSlug = `${ch.slug}-${tier}-${i}`;
            const isFree = tier === "foundational" && i === 1;
            await prisma.worksheet.upsert({
              where: { slug: wsSlug },
              update: {},
              create: {
                chapterId: chapter.id,
                title: `${ch.name} ${tier.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} Worksheet ${i}`,
                slug: wsSlug,
                description: `Practice worksheet for ${subj.name} ${ch.name}`,
                tier,
                isFree,
                isPublished: true,
                sortOrder: tiers.indexOf(tier) * 10 + i,
              },
            });
          }
        }
      }
    }
  }

  const allSubjects = await prisma.subject.findMany({
    include: { grade: true },
  });

  const gradePackages = [
    { gradeName: "Grade 6", slug: "grade-6-combo", mrp: 149, salePrice: 99 },
    { gradeName: "Grade 7", slug: "grade-7-combo", mrp: 159, salePrice: 109 },
    { gradeName: "Grade 8", slug: "grade-8-combo", mrp: 169, salePrice: 119 },
  ];

  for (const gp of gradePackages) {
    const gradeSubjects = allSubjects.filter((s) => s.grade.name === gp.gradeName);
    const subjectIds = gradeSubjects.map((s) => s.id);
    if (subjectIds.length === 0) continue;

    await prisma.package.upsert({
      where: { slug: gp.slug },
      update: { mrp: gp.mrp, salePrice: gp.salePrice, price: gp.salePrice, subjectIds },
      create: {
        name: `${gp.gradeName} Combo`,
        slug: gp.slug,
        price: gp.salePrice,
        mrp: gp.mrp,
        salePrice: gp.salePrice,
        subjectIds,
        isActive: true,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
