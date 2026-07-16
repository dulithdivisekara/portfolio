(function () {
    'use strict';

    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');

    /* ─── Auth ─── */

    async function checkAuth() {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (data.authenticated) {
            loginView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
            loadCertificates();
            loadProjects();
        } else {
            dashboardView.classList.add('hidden');
            loginView.classList.remove('hidden');
        }
    }

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');
        errorEl.classList.add('hidden');

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            checkAuth();
        } else {
            const data = await res.json().catch(() => ({}));
            errorEl.textContent = data.error || 'Login failed';
            errorEl.classList.remove('hidden');
        }
    });

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' });
        checkAuth();
    });

    /* ─── Tabs ─── */

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('bg-zinc-900', 'border', 'border-zinc-800', 'text-zinc-100');
                b.classList.add('text-zinc-500');
            });
            btn.classList.add('bg-zinc-900', 'border', 'border-zinc-800', 'text-zinc-100');
            btn.classList.remove('text-zinc-500');

            document.getElementById('tab-certificates').classList.toggle('hidden', btn.dataset.tab !== 'certificates');
            document.getElementById('tab-projects').classList.toggle('hidden', btn.dataset.tab !== 'projects');
        });
    });

    /* ─── Helpers ─── */

    function escapeHtml(str = '') {
        return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    async function uploadFile(fileInput, statusEl) {
        const file = fileInput.files[0];
        if (!file) return null;
        statusEl.textContent = 'Uploading…';
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) {
            statusEl.textContent = data.error || 'Upload failed';
            return null;
        }
        statusEl.textContent = 'Uploaded ✓';
        return data.url;
    }

    /* ─── Certificates ─── */

    const certForm = document.getElementById('cert-form');
    const certIdField = document.getElementById('cert-id');
    const certCancelBtn = document.getElementById('cert-cancel');

    async function loadCertificates() {
        const res = await fetch('/api/certificates');
        const certs = await res.json();
        const list = document.getElementById('cert-list');
        list.innerHTML = certs.map(c => `
            <div class="flex items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
                <div>
                    <p class="text-sm font-medium text-zinc-100">${escapeHtml(c.title)}</p>
                    <p class="text-xs text-zinc-500">${escapeHtml(c.issuer)} · ${escapeHtml(c.date)}</p>
                </div>
                <div class="flex gap-2 shrink-0">
                    <button data-edit="${c.id}" class="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors">Edit</button>
                    <button data-delete="${c.id}" class="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors">Delete</button>
                </div>
            </div>
        `).join('') || '<p class="text-sm text-zinc-600">No certificates yet.</p>';

        list.querySelectorAll('[data-edit]').forEach(btn => {
            btn.addEventListener('click', () => {
                const cert = certs.find(c => c.id == btn.dataset.edit);
                certIdField.value = cert.id;
                document.getElementById('cert-title').value = cert.title;
                document.getElementById('cert-issuer').value = cert.issuer;
                document.getElementById('cert-date').value = cert.date;
                document.getElementById('cert-image').value = cert.image;
                document.getElementById('cert-form-title').textContent = 'Edit certificate';
                certCancelBtn.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        list.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Delete this certificate?')) return;
                await fetch(`/api/certificates/${btn.dataset.delete}`, { method: 'DELETE' });
                loadCertificates();
            });
        });
    }

    certCancelBtn.addEventListener('click', () => {
        certForm.reset();
        certIdField.value = '';
        document.getElementById('cert-form-title').textContent = 'Add certificate';
        certCancelBtn.classList.add('hidden');
    });

    certForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fileInput = document.getElementById('cert-image-file');
        const statusEl = document.getElementById('cert-upload-status');
        const uploadedUrl = await uploadFile(fileInput, statusEl);

        const payload = {
            title: document.getElementById('cert-title').value,
            issuer: document.getElementById('cert-issuer').value,
            date: document.getElementById('cert-date').value,
            image: uploadedUrl || document.getElementById('cert-image').value
        };

        const id = certIdField.value;
        const url = id ? `/api/certificates/${id}` : '/api/certificates';
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            certForm.reset();
            certIdField.value = '';
            statusEl.textContent = '';
            document.getElementById('cert-form-title').textContent = 'Add certificate';
            certCancelBtn.classList.add('hidden');
            loadCertificates();
        } else {
            const data = await res.json().catch(() => ({}));
            alert(data.error || 'Save failed');
        }
    });

    /* ─── Projects ─── */

    const projectForm = document.getElementById('project-form');
    const projectIdField = document.getElementById('project-id');
    const projectCancelBtn = document.getElementById('project-cancel');

    function featuresToText(features) {
        return (features || []).map(f => `${f.title}: ${f.description}`).join('\n');
    }

    function textToFeatures(text) {
        return text.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
            const [title, ...rest] = line.split(':');
            return { title: (title || '').trim(), description: rest.join(':').trim() };
        });
    }

    async function loadProjects() {
        const res = await fetch('/api/projects');
        const projects = await res.json();
        const list = document.getElementById('project-list');
        list.innerHTML = projects.map(p => `
            <div class="flex items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
                <div>
                    <p class="text-sm font-medium text-zinc-100">${escapeHtml(p.title)}</p>
                    <p class="text-xs text-zinc-500">${escapeHtml(p.category)} · ${p.link ? 'Public' : 'Private'}</p>
                </div>
                <div class="flex gap-2 shrink-0">
                    <button data-edit="${p.id}" class="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors">Edit</button>
                    <button data-delete="${p.id}" class="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors">Delete</button>
                </div>
            </div>
        `).join('') || '<p class="text-sm text-zinc-600">No projects yet.</p>';

        list.querySelectorAll('[data-edit]').forEach(btn => {
            btn.addEventListener('click', () => {
                const project = projects.find(p => p.id == btn.dataset.edit);
                projectIdField.value = project.id;
                document.getElementById('project-title').value = project.title;
                document.getElementById('project-category').value = project.category;
                document.getElementById('project-description').value = project.description;
                document.getElementById('project-tags').value = (project.tags || []).join(', ');
                document.getElementById('project-features').value = featuresToText(project.features);
                document.getElementById('project-link').value = project.link;
                document.getElementById('project-color').value = project.color;
                document.getElementById('project-form-title').textContent = 'Edit project';
                projectCancelBtn.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        list.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Delete this project?')) return;
                await fetch(`/api/projects/${btn.dataset.delete}`, { method: 'DELETE' });
                loadProjects();
            });
        });
    }

    projectCancelBtn.addEventListener('click', () => {
        projectForm.reset();
        projectIdField.value = '';
        document.getElementById('project-form-title').textContent = 'Add project';
        projectCancelBtn.classList.add('hidden');
    });

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            title: document.getElementById('project-title').value,
            category: document.getElementById('project-category').value,
            description: document.getElementById('project-description').value,
            tags: document.getElementById('project-tags').value.split(',').map(t => t.trim()).filter(Boolean),
            features: textToFeatures(document.getElementById('project-features').value),
            link: document.getElementById('project-link').value,
            color: document.getElementById('project-color').value
        };

        const id = projectIdField.value;
        const url = id ? `/api/projects/${id}` : '/api/projects';
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            projectForm.reset();
            projectIdField.value = '';
            document.getElementById('project-form-title').textContent = 'Add project';
            projectCancelBtn.classList.add('hidden');
            loadProjects();
        } else {
            const data = await res.json().catch(() => ({}));
            alert(data.error || 'Save failed');
        }
    });

    checkAuth();
})();
