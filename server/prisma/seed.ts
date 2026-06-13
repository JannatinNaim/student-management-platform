import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// `icon` holds a Lucide icon name (see web `ICON_REGISTRY`) so it renders
// identically across platforms instead of as a font-dependent native emoji.
const SUBJECTS: Array<{ name: string; icon: string; description: string }> = [
  { name: "Physics", icon: "Atom", description: "Mechanics, waves, electricity, modern physics and more." },
  { name: "Chemistry", icon: "FlaskConical", description: "Organic, inorganic and physical chemistry notes." },
  { name: "Biology", icon: "Dna", description: "Botany, zoology, genetics and human physiology." },
  { name: "Mathematics", icon: "Sigma", description: "Algebra, calculus, geometry, trigonometry and statistics." },
  { name: "ICT", icon: "Laptop", description: "Programming, databases, networking and digital systems." },
  { name: "English", icon: "BookOpen", description: "Grammar, composition, literature and comprehension." },
  { name: "Bangla", icon: "PenLine", description: "Bangla literature, grammar and creative writing." },
  { name: "Civics & Good Governance", icon: "Landmark", description: "Citizenship, state structure and governance." },
  { name: "Economics", icon: "TrendingUp", description: "Micro and macro economics, markets and development." },
  { name: "History", icon: "Scroll", description: "World history, regional history and civilizations." },
  { name: "Islamic History & Culture", icon: "Building2", description: "Islamic civilization, history and heritage." },
  { name: "Sociology", icon: "Users", description: "Society, culture, institutions and social change." },
  { name: "Social Work", icon: "HeartHandshake", description: "Social welfare, community development and policy." },
  { name: "Logic", icon: "Brain", description: "Deduction, induction, fallacies and reasoning." },
  { name: "Geography", icon: "Globe", description: "Physical, human and environmental geography." },
  { name: "Psychology", icon: "BrainCircuit", description: "Behaviour, cognition, development and mental health." },
  { name: "Statistics", icon: "BarChart3", description: "Probability, distributions, sampling and inference." },
  { name: "Islamic Studies", icon: "BookMarked", description: "Quran, hadith, fiqh and Islamic ethics." },
];

const ACHIEVEMENTS = [
  { code: "FIRST_UPLOAD", name: "First Steps", description: "Upload your first note", icon: "Sprout" },
  { code: "RISING_CONTRIBUTOR", name: "Rising Contributor", description: "Upload 10 notes", icon: "Rocket" },
  { code: "TOP_CONTRIBUTOR", name: "Top Contributor", description: "Upload 25 notes", icon: "Medal" },
  { code: "DOWNLOADS_100", name: "100 Downloads", description: "Reach 100 total downloads", icon: "Download" },
  { code: "DOWNLOADS_500", name: "500 Downloads", description: "Reach 500 total downloads", icon: "Flame" },
  { code: "DOWNLOADS_1000", name: "1000 Downloads", description: "Reach 1000 total downloads", icon: "Crown" },
  { code: "BEST_NOTES_AUTHOR", name: "Best Notes Author", description: "Have a note rated 4.5+ by 5+ students", icon: "Star" },
  { code: "MOST_LIKED_CREATOR", name: "Most Liked Creator", description: "Receive 100 likes across your notes", icon: "Heart" },
  { code: "VERIFIED_CONTRIBUTOR", name: "Verified Contributor", description: "Awarded to hand-picked trusted contributors", icon: "BadgeCheck" },
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  console.log("Seeding subjects...");
  for (const subject of SUBJECTS) {
    await prisma.subject.upsert({
      where: { slug: slugify(subject.name) },
      update: { icon: subject.icon, description: subject.description },
      create: { ...subject, slug: slugify(subject.name) },
    });
  }

  console.log("Seeding achievements...");
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    });
  }

  console.log("Seeding admin user...");
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin1234!";
  const admin = await prisma.user.upsert({
    where: { email: "admin@smartnotes.app" },
    update: {},
    create: {
      name: "Platform Admin",
      username: "admin",
      email: "admin@smartnotes.app",
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN",
      emailVerified: true,
    },
  });

  console.log("Seeding sample syllabus...");
  const physics = await prisma.subject.findUnique({ where: { slug: "physics" } });
  if (physics && (await prisma.syllabus.count()) === 0) {
    await prisma.syllabus.create({
      data: {
        title: "HSC Physics 1st Paper — Official Syllabus",
        description:
          "Chapter-by-chapter checklist for the HSC Physics 1st Paper. Track your progress through the year and tick off topics as you master them.",
        className: "HSC / Class 12",
        board: "National Curriculum",
        subjectId: physics.id,
        createdById: admin.id,
        topics: {
          create: [
            "Physical World and Measurement",
            "Vectors",
            "Newtonian Mechanics",
            "Work, Energy and Power",
            "Gravitation",
            "Structure and Properties of Matter",
            "Periodic Motion",
            "Waves",
            "Ideal Gas and Kinetic Theory",
          ].map((title, order) => ({ title, order })),
        },
      },
    });
  }

  console.log("✅ Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
