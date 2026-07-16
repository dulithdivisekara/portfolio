import { verifySession } from '../_utils/auth.js';

export async function onRequestGet(context) {
    const payload = await verifySession(context.request, context.env.SESSION_SECRET);
    if (!payload) return Response.json({ authenticated: false }, { status: 200 });
    return Response.json({ authenticated: true, username: payload.u });
}
