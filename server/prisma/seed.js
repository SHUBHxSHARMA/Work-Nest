import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const password = "Password123!";

const EXAMPLE_PROJECT_ID = "11111111-1111-1111-1111-111111111111";
const EXAMPLE_PROJECT_NAME = "Example — Website relaunch";
const EXAMPLE_PROJECT_DESCRIPTION =
  "Example project so you can try admin, PM, member, and viewer. Create your own from Projects.";

const KEEP_EMAILS = [
  "admin@local.test",
  "pm@local.test",
  "member@local.test",
  "viewer@local.test",
];

const EXTRA_SEED_PROJECT_IDS = [
  "11111111-1111-1111-1111-111111111112",
  "11111111-1111-1111-1111-111111111113",
  "11111111-1111-1111-1111-111111111114",
];

const ROLE_ROWS = [
  { id: "55555555-5555-5555-5555-555555555001", name: "admin", scope: "global" },
  { id: "55555555-5555-5555-5555-555555555002", name: "user", scope: "global" },
  { id: "55555555-5555-5555-5555-555555555003", name: "project_manager", scope: "project" },
  { id: "55555555-5555-5555-5555-555555555004", name: "team_member", scope: "project" },
  { id: "55555555-5555-5555-5555-555555555005", name: "viewer", scope: "project" },
];

async function upsertUser(passwordHash, roles, { name, email, globalRole }) {
  const role = roles[globalRole];
  return prisma.user.upsert({
    where: { email },
    update: { name, globalRoleId: role.id, isActive: true, passwordHash },
    create: { name, email, globalRoleId: role.id, passwordHash },
  });
}

async function main() {
  for (const row of ROLE_ROWS) {
    await prisma.role.upsert({
      where: { name: row.name },
      update: { scope: row.scope },
      create: row,
    });
  }
  const roles = Object.fromEntries(
    (await prisma.role.findMany()).map((role) => [role.name, role])
  );

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await upsertUser(passwordHash, roles, {
    name: "Asha Admin",
    email: "admin@local.test",
    globalRole: "admin",
  });
  const pm = await upsertUser(passwordHash, roles, {
    name: "Priya Manager",
    email: "pm@local.test",
    globalRole: "user",
  });
  const member = await upsertUser(passwordHash, roles, {
    name: "Arjun Member",
    email: "member@local.test",
    globalRole: "user",
  });
  const viewer = await upsertUser(passwordHash, roles, {
    name: "Vikram Viewer",
    email: "viewer@local.test",
    globalRole: "user",
  });

  const project = await prisma.project.upsert({
    where: { id: EXAMPLE_PROJECT_ID },
    update: {
      name: EXAMPLE_PROJECT_NAME,
      description: EXAMPLE_PROJECT_DESCRIPTION,
      status: "active",
    },
    create: {
      id: EXAMPLE_PROJECT_ID,
      name: EXAMPLE_PROJECT_NAME,
      description: EXAMPLE_PROJECT_DESCRIPTION,
      createdById: admin.id,
    },
  });

  for (const [userId, role] of [
    [pm.id, "project_manager"],
    [member.id, "team_member"],
    [viewer.id, "viewer"],
  ]) {
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: project.id, userId } },
      update: { roleId: roles[role].id },
      create: { projectId: project.id, userId, roleId: roles[role].id },
    });
  }

  await prisma.projectMember.deleteMany({
    where: {
      projectId: project.id,
      userId: { notIn: [pm.id, member.id, viewer.id] },
    },
  });

  const landing = await prisma.task.upsert({
    where: { id: "22222222-2222-2222-2222-222222222222" },
    update: {
      title: "Draft landing page copy",
      description: "Example task. Headline, subcopy, and three feature blocks.",
      status: "in_progress",
      priority: "high",
      dueDate: new Date("2026-10-30T12:00:00.000Z"),
      assigneeId: member.id,
      createdById: pm.id,
    },
    create: {
      id: "22222222-2222-2222-2222-222222222222",
      projectId: project.id,
      title: "Draft landing page copy",
      description: "Example task. Headline, subcopy, and three feature blocks.",
      status: "in_progress",
      priority: "high",
      dueDate: new Date("2026-10-30T12:00:00.000Z"),
      assigneeId: member.id,
      createdById: pm.id,
      version: 1,
    },
  });

  await prisma.task.upsert({
    where: { id: "33333333-3333-3333-3333-333333333333" },
    update: {
      title: "Choose color palette",
      description: "Example task. Warm paper background, ink sidebar, teal actions.",
      status: "todo",
      priority: "medium",
      dueDate: new Date("2026-11-07T12:00:00.000Z"),
      assigneeId: pm.id,
      createdById: pm.id,
    },
    create: {
      id: "33333333-3333-3333-3333-333333333333",
      projectId: project.id,
      title: "Choose color palette",
      description: "Example task. Warm paper background, ink sidebar, teal actions.",
      status: "todo",
      priority: "medium",
      dueDate: new Date("2026-11-07T12:00:00.000Z"),
      assigneeId: pm.id,
      createdById: pm.id,
      version: 1,
    },
  });

  await prisma.comment.upsert({
    where: { id: "44444444-4444-4444-4444-444444444444" },
    update: {
      body: "Example comment. Keep the first sentence under 12 words so judges can read it on a projector.",
    },
    create: {
      id: "44444444-4444-4444-4444-444444444444",
      taskId: landing.id,
      userId: pm.id,
      body: "Example comment. Keep the first sentence under 12 words so judges can read it on a projector.",
    },
  });

  await prisma.project.deleteMany({
    where: { id: { in: EXTRA_SEED_PROJECT_IDS } },
  });

  await prisma.user.deleteMany({
    where: { email: { notIn: KEEP_EMAILS } },
  });

  console.log("Seed complete. Demo password for every account: Password123!");
  console.log("Example project:", EXAMPLE_PROJECT_NAME);
  console.log("  admin@local.test   global admin     Asha Admin");
  console.log("  pm@local.test      project_manager  Priya Manager");
  console.log("  member@local.test  team_member      Arjun Member");
  console.log("  viewer@local.test  viewer           Vikram Viewer");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
