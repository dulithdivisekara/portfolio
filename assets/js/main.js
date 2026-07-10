(function () {
    'use strict';

    /* ─── Certifications: render tiles + modal ─── */
    const certData = [
        { title: 'AI Foundations', issuer: 'OpenAI Academy', date: 'Jul 2026', image: 'assets/img/certs/ai-foundations.webp' },
        { title: 'Understanding LLMs & Basic Prompting Techniques', issuer: 'CodeSignal', date: 'Jul 2026', image: 'assets/img/certs/understanding-llms.webp' },
        { title: 'AWS Compute Services Overview', issuer: 'Amazon Web Services', date: 'Jul 2026', image: 'assets/img/certs/aws-compute-overview.webp' },
        { title: 'NDG Linux Unhatched', issuer: 'Cisco Networking Academy', date: 'Jun 2026', image: 'assets/img/certs/ndg-linux-unhatched.webp' },
        { title: 'Introduction to Model Context Protocol', issuer: 'Anthropic', date: 'May 2026', image: 'assets/img/certs/intro-mcp.webp' },
        { title: 'Introduction to Agent Skills', issuer: 'Anthropic', date: 'May 2026', image: 'assets/img/certs/intro-agent-skills.webp' },
        { title: 'Building with the Claude API', issuer: 'Anthropic', date: 'May 2026', image: 'assets/img/certs/building-claude-api.webp' },
        { title: 'Claude Code in Action', issuer: 'Anthropic', date: 'May 2026', image: 'assets/img/certs/claude-code-in-action.webp' },
    ];

    const certGrid = document.getElementById('cert-grid');
    if (certGrid) {
        certGrid.innerHTML = certData.map((cert, i) => `
        <button type="button" data-cert-index="${i}"
                class="cert-tile group text-left bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 hover:border-cyan-500/40 hover:bg-zinc-900 transition-colors cursor-pointer">
            <p class="text-sm font-semibold text-zinc-100 mb-1">${cert.title}</p>
            <p class="text-xs text-zinc-500 mb-3">${cert.issuer} \u00B7 ${cert.date}</p>
            <span class="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-600 group-hover:text-cyan-400 transition-colors">
                View credential
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </span>
        </button>
    `).join('');
    }

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
