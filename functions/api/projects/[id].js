import { requireAuth } from '../../_utils/auth.js';

// PUT /api/projects/:id - protected
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

    const {
        title, category, description,
        tags = [], features = [], link = '',
        color = 'emerald', sort_order = 0
    } = body;

    if (!title || !category || !description) {
        return Response.json({ error: 'title, category and description are required' }, { status: 400 });
    }

    const result = await env.DB.prepare(
        `UPDATE projects SET title=?, category=?, description=?, tags=?, features=?, link=?, color=?, sort_order=?
         WHERE id=? RETURNING *`
    ).bind(
        title, category, description,
        JSON.stringify(tags), JSON.stringify(features), link, color, sort_order, params.id
    ).first();

    if (!result) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ ...result, tags, features });
}

// DELETE /api/projects/:id - protected
export async function onRequestDelete(context) {
    const unauthorized = await requireAuth(context);
    if (unauthorized) return unauthorized;

    const { env, params } = context;
    await env.DB.prepare('DELETE FROM projects WHERE id=?').bind(params.id).run();
    return Response.json({ ok: true });
}
