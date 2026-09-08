import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Find existing coordinator
  const coordinator = await prisma.user.findUnique({
    where: {
      email: "venkatesh@gmail.com",
    },
  });

  if (!coordinator) {
    console.log("❌ Coordinator not found");
    return;
  }

  console.log("✅ Coordinator found");
  console.log("ID:", coordinator.id);
  console.log("Name:", coordinator.name);
  console.log("Email:", coordinator.email);
  console.log("Role:", coordinator.role);

  // Get existing courses
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      course_code: true,
      name: true,
      courseCoordinatorId: true,
    },
  });

  if (courses.length === 0) {
    console.log("❌ No courses found");
    return;
  }

  console.log("\n📚 Existing courses:");

  courses.forEach((course, index) => {
    console.log(
      `${index + 1}. ${course.course_code} - ${course.name}`
    );
  });

  // Assign coordinator to the first course
  const course = courses[0];

  await prisma.course.update({
    where: {
      id: course.id,
    },
    data: {
      courseCoordinatorId: coordinator.id,
    },
  });

  console.log("\n✅ COURSE MAPPED SUCCESSFULLY");
  console.log("--------------------------------");
  console.log("Coordinator:", coordinator.email);
  console.log("Course:", course.course_code);
  console.log("Course Name:", course.name);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());