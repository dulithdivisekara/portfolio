CREATE TABLE IF NOT EXISTS certificates (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    issuer      TEXT NOT NULL,
    date        TEXT NOT NULL,
    image       TEXT NOT NULL DEFAULT '',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    category    TEXT NOT NULL,
    description TEXT NOT NULL,
    tags        TEXT NOT NULL DEFAULT '[]',   -- JSON array of strings
    features    TEXT NOT NULL DEFAULT '[]',   -- JSON array of {title, description}
    link        TEXT NOT NULL DEFAULT '',     -- empty string = private repo
    color       TEXT NOT NULL DEFAULT 'emerald',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Seed: certificates (from the previously hardcoded certData array) ──
INSERT INTO certificates (title, issuer, date, image, sort_order) VALUES
('AI Foundations', 'OpenAI Academy', 'Jul 2026', 'assets/img/certs/ai-foundations.webp', 1),
('Understanding LLMs & Basic Prompting Techniques', 'CodeSignal', 'Jul 2026', 'assets/img/certs/understanding-llms.webp', 2),
('AWS Compute Services Overview', 'Amazon Web Services', 'Jul 2026', 'assets/img/certs/aws-compute-overview.webp', 3),
('NDG Linux Unhatched', 'Cisco Networking Academy', 'Jun 2026', 'assets/img/certs/ndg-linux-unhatched.webp', 4),
('Introduction to Model Context Protocol', 'Anthropic', 'May 2026', 'assets/img/certs/intro-mcp.webp', 5),
('Introduction to Agent Skills', 'Anthropic', 'May 2026', 'assets/img/certs/intro-agent-skills.webp', 6),
('Building with the Claude API', 'Anthropic', 'May 2026', 'assets/img/certs/building-claude-api.webp', 7),
('Claude Code in Action', 'Anthropic', 'May 2026', 'assets/img/certs/claude-code-in-action.webp', 8);

-- ── Seed: projects (from the previously hardcoded <article> blocks) ──
INSERT INTO projects (title, category, description, tags, features, link, color, sort_order) VALUES
(
    'TixCore Event Booking System',
    'Full-Stack Web Application',
    'A dependency-light event ticketing platform that gives admins full venue/event management and users a seamless booking flow, without requiring an external database server.',
    '["Java","Spring Boot","Thymeleaf","Maven","MVC","CRUD"]',
    '[{"title":"Modular System Architecture","description":"a 6-module MVC system (Users, Admins, Venues, Events, Bookings, Reviews), each with full CRUD."},{"title":"Custom Persistence Layer","description":"a lightweight, pipe-delimited flat-file data store as a drop-in database replacement."},{"title":"Deployment-Ready Packaging","description":"portable runnable JAR via Maven, single-command deployment with zero external dependencies."}]',
    'https://github.com/dulithdivisekara/TixCore-Event-Booking-System',
    'emerald', 1
),
(
    'SLIIT Y2S1 Vault',
    'Knowledge Management System',
    'A version-controlled, AI-augmented knowledge base that transforms raw university lecture content across 4 modules into a structured, queryable, retention-optimized learning system.',
    '["Markdown Architecture","Mermaid.js","Git","NotebookLM","Obsidian"]',
    '[{"title":"Structured Information Architecture","description":"a hierarchical Markdown/frontmatter system compatible with graph-based tools like Obsidian."},{"title":"AI-Augmented Documentation Workflow","description":"LLM-powered study tooling embedding AI-generated quizzes and audio overviews per module."},{"title":"Diagramming-as-Code","description":"dynamically rendered Mermaid.js diagrams plus interactive flashcards for active recall."}]',
    'https://github.com/dulithdivisekara/SLIIT-Y2S1-vault',
    'cyan', 2
),
(
    'Hermes Agent Configuration & Automated DevOps Pipeline',
    'Infrastructure Automation',
    'Designed and implemented a secure, automated infrastructure backup solution for a personalized AI core configuration.',
    '["Bash Shell","Cron Automation","Git & GitHub CLI","YAML"]',
    '[{"title":"Robust Shell Utility Layer","description":"securely persists and manages the state of a personalized AI core configuration."},{"title":"Academic LMS Scripts","description":"features custom automated browser scripts for reliable course material downloads."},{"title":"WhatsApp Notification Bridge","description":"integrated messaging pipeline with rich metadata profiling."}]',
    '',
    'blue', 3
),
(
    'Terminal CV',
    'Interactive CLI / Serverless Tooling',
    'A programmatic, terminal-native resume served via serverless edge compute, replacing the static personal-website CV with a curl-executable developer experience.',
    '["Cloudflare Workers","Serverless / Edge","JavaScript","HTTP Header Parsing"]',
    '[{"title":"Edge-Native Deployment","description":"resume delivery as a serverless function on Cloudflare''s global edge network, with low-latency responses."},{"title":"Dynamic Content Negotiation","description":"request-header inspection to detect the client''s platform and serve a tailored output format."},{"title":"Differentiated Technical Branding","description":"a curl-executable resume endpoint that signals fluency to a technical audience."}]',
    'https://github.com/dulithdivisekara/terminal-cv',
    'amber', 4
),
(
    'OpenClaw Backup',
    'Agentic System State Management',
    'An autonomous disaster-recovery pipeline for a personal AI agent, enabling full identity, skill-tree, and memory reconstruction on a fresh machine with a single command.',
    '["Bash","System Automation","AI Agent Architecture","Security Hardening"]',
    '[{"title":"One-Command Restoration Pipeline","description":"a single script (restore.sh) that reconstructs an entire agent runtime after OS wipe or hardware failure."},{"title":"Security-Conscious Backup Design","description":"credentials stripped from the persisted state, enforcing \"restore, then re-inject secrets.\""},{"title":"Layered State Architecture","description":"isolated directories for identity, capability, and history, transferable to DevOps and IaC practices."}]',
    '',
    'violet', 5
),
(
    'Personal Portfolio (Source Architecture)',
    'Frontend Web Development',
    'A fully responsive single-page portfolio unifying networking, edge-computing, and embedded IoT project work into one cohesive, framework-light brand presence.',
    '["HTML5","Tailwind CSS","JavaScript","Cloudflare Edge","Formspree"]',
    '[{"title":"Framework-Light Responsive UI","description":"semantic HTML5 and utility-first Tailwind CSS with vanilla JavaScript, no build tooling."},{"title":"Integrated Contact Pipeline","description":"a serverless contact-form flow via Formspree, cross-linked with the Terminal CV project."},{"title":"Edge-Hosted Delivery","description":"deployed to Cloudflare''s Edge Network for global low-latency delivery."}]',
    'https://github.com/dulithdivisekara/portfolio',
    'rose', 6
);
