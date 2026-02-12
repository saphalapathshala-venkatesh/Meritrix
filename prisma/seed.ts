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
      { name: "Mathematics", slug: `math-${grade.sortOrder}`, price: 499 },
      { name: "Science", slug: `science-${grade.sortOrder}`, price: 399 },
      { name: "English", slug: `english-${grade.sortOrder}`, price: 349 },
    ];

    for (const subj of subjects) {
      const subject = await prisma.subject.upsert({
        where: { slug: subj.slug },
        update: {},
        create: {
          gradeId: grade.id,
          name: subj.name,
          slug: subj.slug,
          price: subj.price,
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

  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
