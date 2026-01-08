/**
 * Main JavaScript
 * Handles animations, interactions, and dynamic content
 */

document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initCursor();
    initNavigation();
    initTypingEffect();
    initParticles();
    initScrollAnimations();
    initSkillBars();
    initCountUp();
    fetchZennArticles();
    initBackToTop();
    setCurrentYear();
});

/**
 * Loading Screen
 */
function initLoader() {
    const loadingScreen = document.getElementById('loading-screen');

    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 500);
    });
}

/**
 * Custom Cursor
 */
function initCursor() {
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursor-follower');

    if (!cursor || !cursorFollower) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        const easing = 0.2;

        cursorX += (mouseX - cursorX) * 0.5;
        cursorY += (mouseY - cursorY) * 0.5;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        followerX += (mouseX - followerX) * easing;
        followerY += (mouseY - followerY) * easing;
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';

        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    const hoverElements = document.querySelectorAll('a, button, .skill-card, .cert-card, .article-card, .social-link');

    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            cursorFollower.classList.add('hover');
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            cursorFollower.classList.remove('hover');
        });
    });
}

/**
 * Navigation
 */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        updateActiveNavLink();
    });

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

/**
 * Typing Effect
 */
function initTypingEffect() {
    const typingText = document.getElementById('typing-text');
    if (!typingText) return;

    const texts = [
        'Backend Engineer',
        'Go Developer',
        'Java Developer',
        'Cloud Enthusiast',
        'Tech Writer'
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentText = texts[textIndex];

        if (isDeleting) {
            typingText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typingSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    setTimeout(type, 1500);
}

/**
 * Particles Background
 */
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 4 + 2;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const delay = Math.random() * 20;
        const duration = Math.random() * 10 + 15;
        const opacity = Math.random() * 0.5 + 0.2;

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}%;
            top: ${y}%;
            opacity: ${opacity};
            animation-delay: -${delay}s;
            animation-duration: ${duration}s;
        `;

        particlesContainer.appendChild(particle);
    }
}

/**
 * Scroll Animations
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.section-title, .about-description, .stat-card, .timeline-item, .skill-card, .cert-card');

    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    const staggerContainers = document.querySelectorAll('.skills-grid, .certifications-grid, .social-links');
    staggerContainers.forEach(container => {
        container.classList.add('stagger-children');
        observer.observe(container);
    });
}

/**
 * Skill Progress Bars
 */
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.getAttribute('data-progress');
                entry.target.style.width = progress + '%';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => observer.observe(bar));
}

/**
 * Count Up Animation
 */
function initCountUp() {
    const statNumbers = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const count = parseInt(target.getAttribute('data-count'));
                animateCount(target, count);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => observer.observe(num));

    function animateCount(element, target) {
        let current = 0;
        const increment = target / 50;
        const duration = 1500;
        const stepTime = duration / 50;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, stepTime);
    }
}

/**
 * Fetch Zenn Articles
 */
async function fetchZennArticles() {
    const articlesGrid = document.getElementById('articles-grid');
    if (!articlesGrid) return;

    try {
        // Fetch from local JSON generated by GitHub Actions
        const response = await fetch('data/zenn-feed.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Data structure: { "last_updated": "...", "articles": [...] }
        const articles = data.articles.slice(0, 3);

        articlesGrid.innerHTML = articles.map(article => createArticleCard(article)).join('');

        const articleCards = articlesGrid.querySelectorAll('.article-card');
        initArticleCardHover(articleCards);
    } catch (error) {
        console.error('Failed to fetch Zenn articles:', error);
        articlesGrid.innerHTML = `
            <div class="article-error">
                <p>記事の読み込みに失敗しました</p>
                <a href="https://zenn.dev/urakawa_jinsei" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                    <span>Zennで記事を見る</span>
                    <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        `;
    }
}

/**
 * Create Article Card HTML
 */
function createArticleCard(article) {
    const formattedDate = new Date(article.published_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return `
        <a href="https://zenn.dev${article.path}" target="_blank" rel="noopener noreferrer" class="article-card">
            <div class="article-emoji">${article.emoji}</div>
            <div class="article-content">
                <h3 class="article-title">${escapeHtml(article.title)}</h3>
                <div class="article-meta">
                    <span><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                    <span><i class="far fa-heart"></i> ${article.liked_count}</span>
                </div>
            </div>
        </a>
    `;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize Article Card Hover Effects
 */
function initArticleCardHover(cards) {
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const cursor = document.getElementById('cursor');
            const cursorFollower = document.getElementById('cursor-follower');
            if (cursor) cursor.classList.add('hover');
            if (cursorFollower) cursorFollower.classList.add('hover');
        });

        card.addEventListener('mouseleave', () => {
            const cursor = document.getElementById('cursor');
            const cursorFollower = document.getElementById('cursor-follower');
            if (cursor) cursor.classList.remove('hover');
            if (cursorFollower) cursorFollower.classList.remove('hover');
        });
    });
}

/**
 * Back to Top Button
 */
function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Set Current Year
 */
function setCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}
