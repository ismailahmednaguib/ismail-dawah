// scripts/reset-admin-password.mjs
import { createClient } from "@supabase/supabase-js";
import { pbkdf2Sync, randomBytes } from "node:crypto";
import readline from "node:readline";

// حاول تحميل .env.local إذا كان dotenv مثبتًا
try {
  const dotenv = (await import("dotenv")).default;
  dotenv.config({ path: ".env.local" });
} catch {
  // إذا كنت تستخدم node --env-file=.env.local فلا مشكلة
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function getEnv(name) {
  return process.env[name]?.trim() || "";
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

function idForQuery(id) {
  if (/^\d+$/.test(String(id))) {
    const num = Number(id);
    if (Number.isSafeInteger(num)) return num;
  }
  return id;
}

function isMissingColumnError(error, column) {
  const message = String(error?.message || "");
  return (
    new RegExp(column, "i").test(message) &&
    (/column.*does not exist/i.test(message) ||
      /Could not find the column/i.test(message) ||
      /schema.*does not exist/i.test(message))
  );
}

function isMissingTableError(error) {
  const message = String(error?.message || "");
  return (
    /does not exist/i.test(message) ||
    /Could not find the table/i.test(message) ||
    /relation/i.test(message) ||
    /schema/i.test(message)
  );
}

async function findRowByEmail(client, table, email) {
  const attempts = [
    client.from(table).select("*").ilike("email", email).maybeSingle(),
    client.from(table).select("*").eq("email", email).maybeSingle(),
  ];

  for (const builder of attempts) {
    const result = await builder;

    if (!result.error) {
      return result.data || null;
    }

    if (isMissingTableError(result.error)) {
      return null;
    }

    if (isMissingColumnError(result.error, "email")) {
      continue;
    }

    console.error(`[ResetAdmin] ${table} lookup error:`, result.error);
    return null;
  }

  return null;
}

async function tryUpdate(client, table, id, payloads, label) {
  for (const payload of payloads) {
    const result = await client
      .from(table)
      .update(payload)
      .eq("id", idForQuery(id));

    if (!result.error) {
      console.log(`✅ Updated ${table}.${label}`);
      return true;
    }

    if (isMissingTableError(result.error)) {
      console.warn(`⚠️ Table ${table} missing`);
      return false;
    }

    const message = String(result.error.message || "");

    const missingColumns = [
      "password_hash",
      "password",
      "hashed_password",
      "salt",
      "role",
      "is_active",
      "updated_at",
    ];

    const hasMissingColumn = missingColumns.some((column) =>
      isMissingColumnError(result.error, column)
    );

    if (hasMissingColumn) {
      continue;
    }

    console.warn(`⚠️ Update ${table}.${label} failed:`, message);
  }

  return false;
}

async function tryUpsertAdmin(client, id, email) {
  const payloads = [
    {
      id,
      email,
      is_active: true,
    },
    {
      id,
      email,
    },
    {
      id,
      is_active: true,
    },
    {
      id,
    },
  ];

  for (const payload of payloads) {
    const result = await client
      .from("admin_users")
      .upsert(payload, { onConflict: "id" });

    if (!result.error) {
      console.log("✅ Synced admin_users");
      return true;
    }

    if (isMissingTableError(result.error)) {
      console.warn("⚠️ admin_users table missing, skipping");
      return false;
    }

    const missingColumns = ["email", "is_active"];
    const hasMissingColumn = missingColumns.some((column) =>
      isMissingColumnError(result.error, column)
    );

    if (hasMissingColumn) {
      continue;
    }

    console.warn("⚠️ admin_users upsert failed:", result.error.message);
  }

  return false;
}

async function main() {
  const url =
    getEnv("SUPABASE_URL") ||
    getEnv("NEXT_PUBLIC_SUPABASE_URL");

  const key =
    getEnv("SUPABASE_SERVICE_KEY") ||
    getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  const emailInput = await question("Admin Email: ");
  const passwordInput = await question("New Admin Password: ");

  const email = emailInput.trim().toLowerCase();

  if (!email) {
    throw new Error("Email is required");
  }

  if (!passwordInput || passwordInput.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { salt, hash, combined } = hashPassword(passwordInput);

  console.log("\nSearching admin/user records...\n");

  const adminRow = await findRowByEmail(client, "admin_users", email);
  const userRow = await findRowByEmail(client, "users", email);

  if (!adminRow && !userRow) {
    throw new Error(
      `No account found in admin_users or users for email: ${email}`
    );
  }

  const targetId = userRow?.id ?? adminRow?.id;

  if (!targetId) {
    throw new Error("Could not determine user id");
  }

  console.log(`Target user id: ${targetId}\n`);

  // 1) تحديث admin_users إن وُجد
  if (adminRow) {
    await tryUpdate(client, "admin_users", adminRow.id, [
      {
        password_hash: hash,
        salt,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      {
        password_hash: hash,
        salt,
        is_active: true,
      },
      {
        password: hash,
        salt,
        is_active: true,
      },
      {
        password: combined,
        is_active: true,
      },
      {
        password_hash: combined,
        is_active: true,
      },
      {
        hashed_password: hash,
        salt,
        is_active: true,
      },
      {
        is_active: true,
      },
    ], "password");
  }

  // 2) تحديث users إن وُجد
  if (userRow) {
    await tryUpdate(client, "users", userRow.id, [
      {
        password_hash: hash,
        salt,
        role: "admin",
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      {
        password_hash: hash,
        salt,
        role: "admin",
        is_active: true,
      },
      {
        password: hash,
        salt,
        role: "admin",
        is_active: true,
      },
      {
        password: combined,
        role: "admin",
        is_active: true,
      },
      {
        password_hash: combined,
        role: "admin",
        is_active: true,
      },
      {
        hashed_password: hash,
        salt,
        role: "admin",
        is_active: true,
      },
      {
        role: "admin",
        is_active: true,
      },
    ], "password");
  }

  // 3) لو المستخدم في users فقط، ضمه إلى admin_users إن كان الجدول موجودًا
  if (!adminRow && userRow) {
    await tryUpsertAdmin(client, userRow.id, email);
  }

  console.log("\nDone.");
  console.log(`Admin email: ${email}`);
  console.log("Now try login again with the new password.");

  rl.close();
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message || error);
  rl.close();
  process.exit(1);
});