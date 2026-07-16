import { requireAuth } from '../_utils/auth.js';

// GET /api/projects - public, used by the main site to render the projects grid.
// tags and features are stored as JSON text in D1 and parsed back into arrays here.
export async function onRequestGet(context) {
    const { env } = context;
    const { results } = await env.DB
        .prepare('SELECT * FROM projects ORDER BY sort_order ASC, id ASC')
        .all();

    const projects = results.map(row => ({
        ...row,
        tags: safeParse(row.tags, []),
        features: safeParse(row.features, [])
    }));

    return Response.json(projects);
}

// POST /api/projects - protected, used by the admin panel to add a project.
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

    const {
        title, category, description,
        tags = [], features = [], link = '',
        color = 'emerald', sort_order = 0
    } = body;

    if (!title || !category || !description) {
        return Response.json({ error: 'title, category and description are required' }, { status: 400 });
    }

    const result = await env.DB.prepare(
        `INSERT INTO projects (title, category, description, tags, features, link, color, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(
        title, category, description,
        JSON.stringify(tags), JSON.stringify(features), link, color, sort_order
    ).first();

    return Response.json({ ...result, tags, features }, { status: 201 });
}

function safeParse(str, fallback) {
    try { return JSON.parse(str); } catch { return fallback; }
}
