// scripts/reset-admin-password.mjs
import { createClient } from "@supabase/supabase-js";
import { pbkdf2Sync, randomBytes } from "node:crypto";
import readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");

  const hash = pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST
  ).toString("hex");

  return {
    salt,
    hash,
    combined: `${salt}:${hash}`,
  };
}

function getEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

async function main() {
  const url =
    getEnv("SUPABASE_URL") || getEnv("NEXT_PUBLIC_SUPABASE_URL");

  const key =
    getEnv("SUPABASE_SERVICE_KEY") ||
    getEnv("SUPABASE_SERVICE_ROLE_KEY");

  const emailInput = await question("Admin Email: ");
  const passwordInput = await question("New Admin Password: ");

  const email = emailInput.trim().toLowerCase();

  if (!email) {
    throw new Error("Email is required");
  }

  if (!passwordInput || passwordInput.length < 10) {
    throw new Error("Password must be at least 10 characters");
  }

  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { salt, hash, combined } = hashPassword(passwordInput);

  console.log("\nUpdating admin password in users table...\n");

  // 1) جرّب تحديث users بأعمدة منفصلة: password + salt
  let usersResult = await supabase
    .from("users")
    .update({
      password: hash,
      salt,
      role: "admin",
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email);

  if (usersResult.error) {
    console.warn("First update failed:", usersResult.error.message);

    // 2) جرّب بدون updated_at
    usersResult = await supabase
      .from("users")
      .update({
        password: hash,
        salt,
        role: "admin",
        is_active: true,
      })
      .eq("email", email);
  }

  if (usersResult.error) {
    console.warn("Second update failed:", usersResult.error.message);

    // 3) جرّب combined password في عمود password فقط
    usersResult = await supabase
      .from("users")
      .update({
        password: combined,
        role: "admin",
        is_active: true,
      })
      .eq("email", email);
  }

  if (usersResult.error) {
    console.warn("Third update failed:", usersResult.error.message);

    // 4) جرّب بدون is_active لو العمود غير موجود
    usersResult = await supabase
      .from("users")
      .update({
        password: hash,
        salt,
        role: "admin",
      })
      .eq("email", email);
  }

  if (usersResult.error) {
    console.error("\nFailed to update users table:");
    console.error(usersResult.error);
    rl.close();
    process.exit(1);
  }

  console.log("✅ users table updated.");

  // 5) لو عندك admin_users، فعّله أيضًا
  const userQuery = await supabase
    .from("users")
    .select("id,email,role,is_active")
    .eq("email", email)
    .maybeSingle();

  if (!userQuery.error && userQuery.data?.id) {
    const userId = userQuery.data.id;

    let adminResult = await supabase
      .from("admin_users")
      .upsert(
        {
          id: userId,
          email,
          is_active: true,
        },
        { onConflict: "id" }
      );

    if (adminResult.error) {
      console.warn("admin_users upsert failed:", adminResult.error.message);

      adminResult = await supabase
        .from("admin_users")
        .update({
          email,
          is_active: true,
        })
        .eq("id", userId);
    }

    if (!adminResult.error) {
      console.log("✅ admin_users table updated.");
    } else {
      console.warn("⚠️ Could not update admin_users:", adminResult.error.message);
    }
  }

  console.log("\nDone.");
  console.log(`Admin email: ${email}`);
  console.log("Try login again with the new password.");

  rl.close();
}

main().catch((error) => {
  console.error(error);
  rl.close();
  process.exit(1);
});