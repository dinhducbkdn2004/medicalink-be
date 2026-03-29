const {
  PrismaClient,
} = require('../apps/content-service/prisma/generated/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres@localhost:5432/medicalink_content',
    },
  },
});

async function verify() {
  const blogs = await prisma.blog.findMany({
    include: { category: true },
    take: 10,
  });

  console.log('--- Blog Category Verification ---');
  blogs.forEach((b) => {
    console.log(
      `Blog: ${b.title.substring(0, 40)}... | Category: ${b.category.name}`,
    );
  });

  const categoryCount = await prisma.blogCategory.count();
  console.log(`\nTotal categories created: ${categoryCount}`);

  await prisma.$disconnect();
}

verify();
