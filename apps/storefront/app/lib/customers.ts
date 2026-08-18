import "server-only";
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
type Customer = { id:string; name:string; email:string; passwordHash:string; offers:boolean; createdAt:string };
type CustomerFile = { customers:Customer[]; offers:string[] };
function root() { let current=process.cwd(); while (!existsSync(path.join(current,"pnpm-workspace.yaml"))) { const parent=path.dirname(current); if(parent===current) return process.cwd(); current=parent; } return current; }
function file() { return process.env.SEW_LOVELY_CUSTOMERS_FILE || path.join(root(),"packages","cms","data","customers.json"); }
async function read():Promise<CustomerFile> { try { return JSON.parse(await fs.readFile(file(),"utf8")) as CustomerFile; } catch { return {customers:[],offers:[]}; } }
async function write(data:CustomerFile) { await fs.mkdir(path.dirname(file()),{recursive:true}); await fs.writeFile(file(),JSON.stringify(data,null,2)); }
async function hash(password:string) { const salt=randomBytes(16).toString("hex"); const key=await scrypt(password,salt,64) as Buffer; return `${salt}:${key.toString("hex")}`; }
async function matches(password:string, saved:string) { const [salt, value]=saved.split(":"); if(!salt||!value)return false; const key=await scrypt(password,salt,64) as Buffer; const known=Buffer.from(value,"hex"); return known.length===key.length && timingSafeEqual(known,key); }
export async function registerCustomer(name:string,email:string,password:string,offers:boolean) { const data=await read(); if(data.customers.some((item)=>item.email===email.toLowerCase())) throw new Error("An account with that email already exists."); data.customers.push({id:randomBytes(12).toString("hex"),name:name.trim(),email:email.toLowerCase(),passwordHash:await hash(password),offers,createdAt:new Date().toISOString()}); if(offers&&!data.offers.includes(email.toLowerCase()))data.offers.push(email.toLowerCase()); await write(data); }
export async function loginCustomer(email:string,password:string) { const customer=(await read()).customers.find((item)=>item.email===email.toLowerCase()); return Boolean(customer && await matches(password,customer.passwordHash)); }
export async function subscribeOffer(email:string) { const data=await read(); const normalized=email.toLowerCase(); if(!data.offers.includes(normalized))data.offers.push(normalized); await write(data); }
function secret(){ const value=process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET; if(!value||value.length<32)throw new Error("Set CUSTOMER_SESSION_SECRET to at least 32 characters."); return value; }
export function customerSession(){ const payload=Buffer.from(JSON.stringify({exp:Date.now()+7*86400000})).toString("base64url"); return `${payload}.${createHmac("sha256",secret()).update(payload).digest("base64url")}`; }
