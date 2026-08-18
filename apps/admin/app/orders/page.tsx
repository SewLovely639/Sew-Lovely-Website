import { promises as fs } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { isAdmin } from "../lib/auth";

type Order = { id: string; status: string; paymentStatus: string; total: number; customer: { name: string; email: string }; createdAt: string; payment: { method: string } };
async function readOrders(): Promise<Order[]> { try { const file = process.env.SEW_LOVELY_ORDERS_FILE; if (!file) return []; const parsed = JSON.parse(await fs.readFile(path.resolve(file), "utf8")) as { orders?: Order[] }; return parsed.orders ?? []; } catch { return []; } }
export default async function OrdersPage() { if (!await isAdmin()) return <main className="admin-center"><p>Sign in is required.</p><Link href="/login">Sign in</Link></main>; const items = await readOrders(); return <main className="admin"><header><div><p>SEW LOVELY</p><h1>Orders and payments</h1></div><nav><Link href="/">Catalogue</Link></nav></header><div className="admin-shell"><section className="panel"><div className="panel-heading"><p>OPERATIONS</p><h2>Recent orders</h2></div>{items.length === 0 ? <p>No orders yet.</p> : <div className="order-table">{items.map((order) => <article className="order-row" key={order.id}><div><b>{order.id}</b><span>{order.customer.name} · {order.customer.email}</span></div><div><b>{order.paymentStatus.toUpperCase()}</b><span>{order.payment.method.replaceAll("_", " ")} · P{order.total.toFixed(2)}</span></div><time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleString()}</time></article>)}</div>}</section></div></main>; }
