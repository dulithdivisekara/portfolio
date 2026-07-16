// Shared auth helpers for Cloudflare Pages Functions.
// Uses HMAC-signed, HttpOnly session cookies (no external deps / no JWT library needed).

const encoder = new TextEncoder();

function toBase64Url(bytes) {
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    return atob(b64);
}

async function hmacSign(secret, data) {
    const key = await crypto.subtle.importKey(
        'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    return toBase64Url(new Uint8Array(sig));
}

function timingSafeEqual(a, b) {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return result === 0;
}

export async function sha256Hex(input) {
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(input));
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createSessionCookie(username, secret, ttlSeconds = 60 * 60 * 24 * 7) {
    const payload = JSON.stringify({ u: username, exp: Date.now() + ttlSeconds * 1000 });
    const payloadB64 = toBase64Url(encoder.encode(payload));
    const sig = await hmacSign(secret, payloadB64);
    const token = `${payloadB64}.${sig}`;
    return `session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${ttlSeconds}`;
}

export function clearSessionCookie() {
    return 'session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';
}

export function getCookie(request, name) {
    const header = request.headers.get('Cookie') || '';
    const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

export async function verifySession(request, secret) {
    const token = getCookie(request, 'session');
    if (!token) return null;
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) return null;
    const expectedSig = await hmacSign(secret, payloadB64);
    if (!timingSafeEqual(expectedSig, sig)) return null;
    try {
        const payload = JSON.parse(fromBase64Url(payloadB64));
        if (!payload.exp || payload.exp < Date.now()) return null;
        return payload;
    } catch {
        return null;
    }
}

// Returns a 401 Response if unauthenticated, otherwise null (caller proceeds).
export async function requireAuth(context) {
    const payload = await verifySession(context.request, context.env.SESSION_SECRET);
    if (!payload) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
}
