(function () {
    'use strict';

    /* ─── Certifications: fetch from D1 via Pages Functions, render tiles + modal ─── */
    let certData = [];

    function escapeHtml(str = '') {
        return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    const certGrid = document.getElementById('cert-grid');

    function renderCertGrid() {
        if (!certGrid) return;
        certGrid.innerHTML = certData.map((cert, i) => `
        <button type="button" data-cert-index="${i}"
                class="cert-tile group text-left bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 hover:border-cyan-500/40 hover:bg-zinc-900 transition-colors cursor-pointer">
            <p class="text-sm font-semibold text-zinc-100 mb-1">${escapeHtml(cert.title)}</p>
            <p class="text-xs text-zinc-500 mb-3">${escapeHtml(cert.issuer)} \u00B7 ${escapeHtml(cert.date)}</p>
            <span class="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-600 group-hover:text-cyan-400 transition-colors">
                View credential
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </span>
        </button>
    `).join('');
    }

    async function loadCertificates() {
        if (!certGrid) return;
        try {
            const res = await fetch('/api/certificates');
            certData = await res.json();
        } catch (err) {
            console.error('Failed to load certificates', err);
            certData = [];
        }
        renderCertGrid();
    }
    loadCertificates();

    /* ─── Projects: fetch from D1 via Pages Functions, render cards ─── */
    const projectGrid = document.getElementById('project-grid');

    function renderProjectCard(p) {
        const isPrivate = !p.link;
        const color = p.color || 'emerald';
        const tags = (p.tags || []).map(t =>
            `<span class="px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-xs font-mono text-zinc-400">${escapeHtml(t)}</span>`
        ).join('');
        const features = (p.features || []).map(f => `
            <li class="flex gap-2 text-sm text-zinc-400">
                <span class="text-${color}-400 shrink-0">✓</span>
                <span><span class="text-zinc-200 font-medium">${escapeHtml(f.title)}</span>: ${escapeHtml(f.description)}</span>
            </li>`
        ).join('');
        const cta = isPrivate
            ? `<span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-800 text-sm font-medium text-zinc-600 cursor-not-allowed w-fit" title="This repository is private">
                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                   Private Repository
               </span>`
            : `<a href="${escapeHtml(p.link)}" target="_blank" rel="noopener noreferrer"
                   class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-700 text-sm font-medium text-zinc-300 hover:border-${color}-500/50 hover:text-${color}-400 transition-colors w-fit">
                   View Source Code ↗
               </a>`;
        const badge = isPrivate
            ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                   <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                   Private Repo
               </span>`
            : '';

        return `
        <article class="group bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-8 hover:border-${color}-500/40 hover:scale-[1.01] transition-all duration-200 flex flex-col">
            <div class="flex items-center gap-2 mb-2">
                <p class="text-xs font-mono text-${color}-400 uppercase tracking-widest">${escapeHtml(p.category)}</p>
                ${badge}
            </div>
            <h3 class="text-xl font-bold text-zinc-50 mb-3">${escapeHtml(p.title)}</h3>
            <p class="text-zinc-300 text-sm leading-relaxed mb-5 font-medium">${escapeHtml(p.description)}</p>
            <div class="flex flex-wrap gap-2 mb-6">${tags}</div>
            <ul class="space-y-3 mb-6 flex-1">${features}</ul>
            ${cta}
        </article>`;
    }

    async function loadProjects() {
        if (!projectGrid) return;
        try {
            const res = await fetch('/api/projects');
            const projects = await res.json();
            projectGrid.innerHTML = projects.map(renderProjectCard).join('');
        } catch (err) {
            console.error('Failed to load projects', err);
        }
    }
    loadProjects();

    const certModal = document.getElementById('cert-modal');
    const certModalImg = document.getElementById('cert-modal-img');
    const certModalPlaceholder = document.getElementById('cert-modal-placeholder');
    const certModalBadge = document.getElementById('cert-modal-badge');
    const certModalTitle = document.getElementById('cert-modal-title');
    const certModalMeta = document.getElementById('cert-modal-meta');

    function openCertModal(index) {
        const cert = certData[index];
        if (!cert || !certModal) return;

        certModalBadge.textContent = cert.issuer;
        certModalTitle.textContent = cert.title;
        certModalMeta.textContent = `Issued ${cert.date}`;

        certModalImg.classList.add('hidden');
        certModalPlaceholder.classList.remove('hidden');
        certModalImg.onload = () => {
            certModalImg.classList.remove('hidden');
            certModalPlaceholder.classList.add('hidden');
        };
        certModalImg.onerror = () => {
            certModalImg.classList.add('hidden');
            certModalPlaceholder.classList.remove('hidden');
        };
        certModalImg.src = cert.image;
        certModalImg.alt = `${cert.title} certificate`;

        certModal.classList.remove('hidden');
        certModal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }

    function closeCertModal() {
        if (!certModal) return;
        certModal.classList.add('hidden');
        certModal.classList.remove('flex');
        document.body.style.overflow = '';
    }

    if (certGrid) {
        certGrid.addEventListener('click', (e) => {
            const tile = e.target.closest('.cert-tile');
            if (!tile) return;
            openCertModal(Number(tile.dataset.certIndex));
        });
    }

    document.getElementById('cert-modal-close')?.addEventListener('click', closeCertModal);
    document.getElementById('cert-modal-backdrop')?.addEventListener('click', closeCertModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCertModal();
    });

    /* ─── Mobile Navigation Toggle ─── */
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconOpen = document.getElementById('menu-icon-open');
    const iconClose = document.getElementById('menu-icon-close');

    function closeMobileMenu() {
        mobileMenu.classList.add('hidden');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
    }

    menuBtn.addEventListener('click', () => {
        const isOpen = !mobileMenu.classList.contains('hidden');
        if (isOpen) {
            closeMobileMenu();
        } else {
            mobileMenu.classList.remove('hidden');
            iconOpen.classList.add('hidden');
            iconClose.classList.remove('hidden');
            menuBtn.setAttribute('aria-expanded', 'true');
        }
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    /* ─── Smooth Scroll with Navbar Offset ─── */
    const navHeight = 64;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top, behavior: 'smooth' });
            closeMobileMenu();
        });
    });

    /* ─── Copy CLI Command ─── */
    const copyBtn = document.getElementById('copy-btn');
    const cliCommand = document.getElementById('cli-command');

    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(cliCommand.textContent.trim());
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        } catch {
            copyBtn.textContent = 'Failed';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        }
    });

})();
