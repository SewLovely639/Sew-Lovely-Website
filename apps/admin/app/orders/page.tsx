import Link from "next/link";
import { listRecentOrders, type CmsOrderSummary } from "@sew-lovely/cms";
import { isAdmin } from "../lib/auth";

function OrdersShell({ children }: { children: React.ReactNode }) {
  return <main className="admin"><header><div><p>SEW LOVELY</p><h1>Orders and payments</h1></div><nav><Link className="admin-nav-link" href="/">Catalogue</Link></nav></header><div className="admin-shell"><section className="panel"><div className="panel-heading"><p>OPERATIONS</p><h2>Recent orders</h2></div>{children}</section></div></main>;
}

export default async function OrdersPage() {
  if (!await isAdmin()) return <main className="admin-center"><p>Sign in is required.</p><Link href="/login">Sign in</Link></main>;
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <OrdersShell><p className="field-note">Local order persistence is not configured yet. Run the private local Supabase setup script from the project root, restart the admin server, then return here.</p><code className="local-command">powershell -ExecutionPolicy Bypass -File .\scripts\set-local-supabase-service-role.ps1</code></OrdersShell>;
  }
  let items: CmsOrderSummary[] = [];
  try { items = await listRecentOrders(); } catch { return <OrdersShell><p className="field-note">Orders could not be read right now. Confirm the local Supabase service-role key, restart the admin server, and try again.</p></OrdersShell>; }
  return <OrdersShell>{items.length === 0 ? <p>No orders yet.</p> : <div className="order-table">{items.map((order) => <article className="order-row" key={order.id}><div><b>{order.id}</b><span>{order.customer.name} · {order.customer.email}</span></div><div><b>{order.paymentStatus.toUpperCase()}</b><span>{order.payment.method.replaceAll("_", " ")} · P{order.total.toFixed(2)}</span></div><time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleString()}</time></article>)}</div>}</OrdersShell>;
}
