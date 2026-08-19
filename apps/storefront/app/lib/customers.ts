import "server-only";

import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getSupabase } from "./supabase";

const scrypt = promisify(scryptCallback);
type Customer = { id: string; name: string; email: string; passwordHash: string; offers: boolean; createdAt: string };
async function hash(password: string) { const salt = randomBytes(16).toString("hex"); const key = await scrypt(password, salt, 64) as Buffer; return `${salt}:${key.toString("hex")}`; }
async function matches(password: string, saved: string) { const [salt, value] = saved.split(":"); if (!salt || !value) return false; const key = await scrypt(password, salt, 64) as Buffer; const known = Buffer.from(value, "hex"); return known.length === key.length && timingSafeEqual(known, key); }

export async function registerCustomer(name: string, email: string, password: string, offers: boolean) {
  const normalized = email.toLowerCase(); const customer: Customer = { id: randomBytes(12).toString("hex"), name: name.trim(), email: normalized, passwordHash: await hash(password), offers, createdAt: new Date().toISOString() };
  const db = getSupabase(); const { error } = await db.from("customers").insert({ id: customer.id, name: customer.name, email: customer.email, password_hash: customer.passwordHash, offers: customer.offers, created_at: customer.createdAt, updated_at: customer.createdAt });
  if (error) { if (error.code === "23505") throw new Error("An account with that email already exists."); throw new Error(error.message); }
  if (offers) await subscribeOffer(normalized);
}

export async function loginCustomer(email: string, password: string) {
  const { data, error } = await getSupabase().from("customers").select("password_hash").eq("email", email.toLowerCase()).maybeSingle();
  if (error || !data) return false;
  return matches(password, String((data as { password_hash: string }).password_hash));
}

export async function subscribeOffer(email: string) {
  const { error } = await getSupabase().from("newsletter_subscriptions").upsert({ email: email.toLowerCase() }, { onConflict: "email", ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}

function secret() { const value = process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET; if (!value || value.length < 32) throw new Error("Set CUSTOMER_SESSION_SECRET to at least 32 characters."); return value; }
export function customerSession() { const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 7 * 86400000 })).toString("base64url"); return `${payload}.${createHmac("sha256", secret()).update(payload).digest("base64url")}`; }
