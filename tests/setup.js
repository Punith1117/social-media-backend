const prisma = require('../prisma/prismaClient');

// Clean up test data after each test
afterEach(async () => {
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
});
