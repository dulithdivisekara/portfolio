import { requireAuth } from '../_utils/auth.js';

// POST /api/upload - protected. Accepts multipart/form-data with a "file" field,
// stores it in the R2 bucket bound as ASSETS, and returns its public URL.
// This is what lets you attach a new cert/project image from the admin panel
// without touching the codebase. Requires the R2 bucket + R2_PUBLIC_URL (see README).
export async function onRequestPost(context) {
    const unauthorized = await requireAuth(context);
    if (unauthorized) return unauthorized;

    const { env, request } = context;

    if (!env.ASSETS) {
        return Response.json({ error: 'R2 bucket not configured (see README for setup)' }, { status: 501 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
        return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowed = ['image/webp', 'image/png', 'image/jpeg', 'image/gif'];
    if (!allowed.includes(file.type)) {
        return Response.json({ error: 'Unsupported file type' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
        return Response.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const key = `${crypto.randomUUID()}.${ext}`;

    await env.ASSETS.put(key, file.stream(), { httpMetadata: { contentType: file.type } });

    const url = `${env.R2_PUBLIC_URL}/${key}`;
    return Response.json({ url }, { status: 201 });
}
