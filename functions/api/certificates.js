import { requireAuth } from '../_utils/auth.js';

// GET /api/certificates - public, used by the main site to render the certs grid.
export async function onRequestGet(context) {
    const { env } = context;
    const { results } = await env.DB
        .prepare('SELECT * FROM certificates ORDER BY sort_order ASC, id ASC')
        .all();
    return Response.json(results);
}

// POST /api/certificates - protected, used by the admin panel to add a cert.
export async function onRequestPost(context) {
    const unauthorized = await requireAuth(context);
    if (unauthorized) return unauthorized;

    const { env, request } = context;
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { title, issuer, date, image = '', sort_order = 0 } = body;
    if (!title || !issuer || !date) {
        return Response.json({ error: 'title, issuer and date are required' }, { status: 400 });
    }

    const result = await env.DB.prepare(
        `INSERT INTO certificates (title, issuer, date, image, sort_order)
         VALUES (?, ?, ?, ?, ?) RETURNING *`
    ).bind(title, issuer, date, image, sort_order).first();

    return Response.json(result, { status: 201 });
}
