// POST /api/register -> sends a styled email to TO_EMAIL via Resend (no dependencies)
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clip = (s, n) => String(s ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, n);
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let d;
  try { d = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
  if (d.website) return json({ ok: true }); // honeypot: bots fill this hidden field

  const v = {
    name: clip(d.name, 80), email: clip(d.email, 120), phone: clip(d.phone, 30), date: clip(d.date, 10),
    session: clip(d.session, 60), level: clip(d.level, 30), people: clip(d.people, 3), msg: String(d.msg ?? "").trim().slice(0, 1000),
  };
  if (!v.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) || !/^\d{4}-\d{2}-\d{2}$/.test(v.date)) return json({ error: "Invalid input" }, 400);

  const key = process.env.RESEND_API_KEY, to = process.env.TO_EMAIL;
  const gym = process.env.GYM_NAME || "Klatreverket";
  const from = process.env.FROM_EMAIL || `${gym} <onboarding@resend.dev>`;
  if (!key || !to) return json({ error: "Server not configured" }, 500);

  const rows = [["Name", v.name], ["Email", v.email], ["Phone", v.phone || "–"], ["Date", v.date], ["Session", v.session], ["Experience", v.level], ["People", v.people], ["Message", v.msg || "–"]];
  const html = `<div style="background:#f6f1e9;padding:24px;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#2d3a33"><div style="max-width:520px;margin:0 auto;background:#fffdf9;border-radius:18px;overflow:hidden;border:1px solid #e6dfd2"><div style="background:#5f8f78;color:#fff;padding:22px 26px"><div style="font-size:13px;opacity:.85;letter-spacing:.08em">NEW REGISTRATION · ${esc(gym.toUpperCase())}</div><div style="font-size:22px;font-weight:700;margin-top:4px">${esc(v.name)} · ${esc(v.date)}</div></div><table style="width:100%;border-collapse:collapse;margin:8px 0">${rows.map(([k, x]) => `<tr><td style="padding:10px 26px;color:#6b7a72;font-size:14px;width:110px;border-bottom:1px solid #eee7da;vertical-align:top">${k}</td><td style="padding:10px 26px 10px 0;font-size:15px;border-bottom:1px solid #eee7da;white-space:pre-wrap">${esc(x)}</td></tr>`).join("")}</table><div style="padding:8px 26px 26px"><a href="mailto:${esc(v.email)}" style="display:inline-block;background:#d98f6c;color:#fff;text-decoration:none;padding:11px 22px;border-radius:99px;font-weight:600">Reply to ${esc(v.name.split(" ")[0])}</a></div></div></div>`;
  const text = rows.map(([k, x]) => `${k}: ${x}`).join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], reply_to: v.email, subject: `🧗 New registration: ${v.name} · ${v.date}`, html, text }),
  });
  if (!res.ok) { console.error("Resend error", res.status, await res.text()); return json({ error: "Email failed" }, 502); }
  return json({ ok: true });
};

export const config = { path: "/api/register" };
