/**
 * Development seed: Admin, Member household (2 users), Pending user, one project.
 * Call from GET /api/seed to populate in-memory store for role testing.
 *
 * Test users (password for all: Test1234!):
 * - admin@test.com   → ADMIN
 * - member1@test.com, member2@test.com → MEMBER (same household, both managers)
 * - pending@test.com → PENDING
 */

import bcrypt from "bcryptjs";
import {
  createUser,
  findUserByEmail,
  getUsers,
  createHousehold,
  assignUserToHousehold,
  addHouseholdManager,
} from "./households";
import { createProject, getProjects } from "./projects";
import { getGmachItems, addGmachItem } from "./gmach";

const SALT_ROUNDS = 10;
export const SEED_PASSWORD = "Test1234!";

async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function runSeed(): Promise<{ ok: boolean; message: string }> {
  if (getUsers().length > 0 && findUserByEmail("admin@test.com")) {
    return {
      ok: true,
      message:
        "Seed already applied. Sign in as admin@test.com | member1@test.com | member2@test.com | pending@test.com with password: " +
        SEED_PASSWORD,
    };
  }

  const passwordHash = await hash(SEED_PASSWORD);

  createUser({
    fullName: "מנהל מערכת",
    email: "admin@test.com",
    passwordHash,
    status: "ADMIN",
  });

  const household = createHousehold("משפחת כהן (לדוגמה)");

  const member1 = createUser({
    fullName: "ישראל כהן",
    email: "member1@test.com",
    passwordHash,
    status: "MEMBER",
    householdId: household.id,
    role: "adult",
  });
  assignUserToHousehold(member1.id, household.id);
  addHouseholdManager(household.id, member1.id);

  const member2 = createUser({
    fullName: "רחל כהן",
    email: "member2@test.com",
    passwordHash,
    status: "MEMBER",
    householdId: household.id,
    role: "adult",
  });
  assignUserToHousehold(member2.id, household.id);
  addHouseholdManager(household.id, member2.id);

  createUser({
    fullName: "משתמש ממתין",
    email: "pending@test.com",
    passwordHash,
    status: "PENDING",
  });

  if (getProjects().length === 0) {
    createProject("קרן בניין (לדוגמה)");
  }

  if (getGmachItems().length === 0) {
    addGmachItem({
      categoryId: "books",
      title: "ספרי קודש להשאלה",
      description: "מגשרת עם ספרי קודש. לפנות בשעות הערב.",
      contactInfo: "דרך הלוח",
      isPinnedByCommittee: true,
    });
    addGmachItem({
      categoryId: "baby",
      title: "עגלת תינוק",
      description: "עגלה במצב טוב, למי שצריך.",
      contactInfo: "פנה בדואר",
    });
    addGmachItem({
      categoryId: "tools",
      title: "מקדחה וכלי עבודה",
      description: "השאלה לשבוע.",
    });
  }

  return {
    ok: true,
    message: `Seed applied. Sign in as admin@test.com | member1@test.com | member2@test.com | pending@test.com with password: ${SEED_PASSWORD}`,
  };
}
