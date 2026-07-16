import { requireAuth } from '../../_utils/auth.js';

// PUT /api/certificates/:id - protected
export async function onRequestPut(context) {
    const unauthorized = await requireAuth(context);
    if (unauthorized) return unauthorized;

    const { env, request, params } = context;
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
        `UPDATE certificates SET title=?, issuer=?, date=?, image=?, sort_order=?
         WHERE id=? RETURNING *`
    ).bind(title, issuer, date, image, sort_order, params.id).first();

    if (!result) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(result);
}

// DELETE /api/certificates/:id - protected
export async function onRequestDelete(context) {
    const unauthorized = await requireAuth(context);
    if (unauthorized) return unauthorized;

    const { env, params } = context;
    await env.DB.prepare('DELETE FROM certificates WHERE id=?').bind(params.id).run();
    return Response.json({ ok: true });
}
