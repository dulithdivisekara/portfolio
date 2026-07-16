import { sha256Hex, createSessionCookie } from '../_utils/auth.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { username, password } = body;
    if (!username || !password) {
        return Response.json({ error: 'Username and password required' }, { status: 400 });
    }

    // Password is never stored in plaintext. ADMIN_PASSWORD_HASH is
    // sha256(password + PASSWORD_SALT), set as a Cloudflare secret.
    const candidateHash = await sha256Hex(password + env.PASSWORD_SALT);

    const validUser = timingSafeStringEqual(username, env.ADMIN_USERNAME);
    const validPass = timingSafeStringEqual(candidateHash, env.ADMIN_PASSWORD_HASH);

    if (!validUser || !validPass) {
        // Generic error - don't reveal which field was wrong.
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const cookie = await createSessionCookie(username, env.SESSION_SECRET);

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie }
    });
}

function timingSafeStringEqual(a = '', b = '') {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return result === 0;
}
