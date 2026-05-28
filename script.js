// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// 1. Lenis Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// 2. Page Loader
window.addEventListener('load', () => {
    const loader = document.getElementById('page-loader');
    const progress = document.querySelector('.progress');
    
    // Simulate loading progress
    let width = 0;
    const interval = setInterval(() => {
        width += Math.random() * 20;
        if(width >= 100) {
            width = 100;
            clearInterval(interval);
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                // Trigger initial GSAP reveals
                initGSAPReveals();
            }, 500);
        }
        progress.style.width = width + '%';
    }, 100);
});

// 3. Audio & Interactivity Setup
const soundPop = document.getElementById('sound-pop');
const soundHover = document.getElementById('sound-hover');
if(soundPop) soundPop.volume = 0.2;
if(soundHover) soundHover.volume = 0.1;

const playHoverSound = () => { if(soundHover) { soundHover.currentTime = 0; soundHover.play().catch(e=>console.log(e)); }};
const playPopSound = () => { if(soundPop) { soundPop.currentTime = 0; soundPop.play().catch(e=>console.log(e)); }};

// 4. Custom Cursor
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    setTimeout(() => {
        follower.style.left = e.clientX + 'px';
        follower.style.top = e.clientY + 'px';
    }, 80);
});

document.addEventListener('mousedown', () => {
    cursor.classList.add('bubble-pop');
    playPopSound();
    setTimeout(() => cursor.classList.remove('bubble-pop'), 400);
});

const bindInteractiveElements = () => {
    document.querySelectorAll('a, button, .product-card, .cat-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover-active');
            follower.classList.add('hover-active');
            playHoverSound();
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover-active');
            follower.classList.remove('hover-active');
        });
    });
};
bindInteractiveElements();

// 5. Magnetic Buttons
const magneticEls = document.querySelectorAll('.magnetic');
magneticEls.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) - rect.width / 2;
        const y = (e.clientY - rect.top) - rect.height / 2;
        gsap.to(el, { x: x * 0.4, y: y * 0.4, duration: 0.3, ease: "power2.out" });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    });
});

// 6. Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
    playPopSound();
});

// 7. GSAP Animations
function initGSAPReveals() {
    const revealEls = document.querySelectorAll('.gsap-reveal');
    revealEls.forEach((el) => {
        gsap.fromTo(el, 
            { y: 100, opacity: 0 },
            { 
                y: 0, opacity: 1, duration: 1, ease: "power4.out",
                scrollTrigger: { trigger: el, start: "top 85%" }
            }
        );
    });

    // Story SVG Drawing Animation
    const drawPaths = document.querySelectorAll('.draw-path');
    drawPaths.forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        gsap.to(path, {
            strokeDashoffset: 0,
            scrollTrigger: {
                trigger: '.story-illustration',
                start: 'top 70%',
                end: 'bottom 50%',
                scrub: 1
            }
        });
    });
}

// 8. Load Products & AI Recommendations
let allProducts = [];
let wishlist = JSON.parse(localStorage.getItem('wonderink_wishlist')) || [];
const badge = document.querySelector('.badge');
if(badge) badge.textContent = wishlist.length;

async function loadProducts() {
    try {
        const response = await fetch('api.php');
        allProducts = await response.json();
        
        renderProducts(allProducts, document.getElementById('products-container'));
        
        // AI Recommendations (Random subset)
        const aiProducts = [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 3);
        renderProducts(aiProducts, document.getElementById('ai-container'));
        
        bindInteractiveElements();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderProducts(products, container) {
    if(!container) return;
    container.innerHTML = '';
    products.forEach((prod) => {
        const isWished = wishlist.includes(prod.id);
        const card = document.createElement('div');
        card.className = 'product-card gsap-reveal';
        card.innerHTML = `
            <div class="product-img-wrap">
                <img src="${prod.image}" alt="${prod.name}" class="product-img">
                <div class="quick-view-overlay"><button class="btn-secondary quick-view-btn" data-id="${prod.id}">Quick View 👀</button></div>
            </div>
            <h3 class="product-title">${prod.name}</h3>
            <div class="card-actions">
                <div class="product-price">$${prod.price.toFixed(2)}</div>
                <div>
                    <button class="wishlist-btn ${isWished ? 'active' : ''}" data-id="${prod.id}">💖</button>
                    <button class="icon-btn add-cart-btn" data-id="${prod.id}">🛒</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Bind Wishlist
    container.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => toggleWishlist(e, parseInt(btn.dataset.id)));
    });
    
    // Bind Quick View
    container.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', () => openModal(parseInt(btn.dataset.id)));
    });
}

function toggleWishlist(e, id) {
    const btn = e.currentTarget;
    if(wishlist.includes(id)) {
        wishlist = wishlist.filter(item => item !== id);
        btn.classList.remove('active');
    } else {
        wishlist.push(id);
        btn.classList.add('active');
        playPopSound();
    }
    localStorage.setItem('wonderink_wishlist', JSON.stringify(wishlist));
    if(badge) badge.textContent = wishlist.length;
}

// 9. Product Modal
const modal = document.getElementById('product-modal');
const modalClose = document.querySelector('.close-modal');
const rotatableImg = document.querySelector('.rotatable-img');

function openModal(id) {
    const prod = allProducts.find(p => p.id === id);
    if(!prod) return;
    
    document.getElementById('modal-img').src = prod.image;
    document.getElementById('modal-title').textContent = prod.name;
    document.getElementById('modal-price').textContent = '$' + prod.price.toFixed(2);
    document.getElementById('modal-desc').textContent = prod.description;
    
    modal.classList.add('active');
    lenis.stop(); // Stop scrolling when modal is open
    
    // 3D Rotation Effect
    const modalGallery = document.querySelector('.modal-gallery');
    modalGallery.addEventListener('mousemove', handle3DRotation);
    modalGallery.addEventListener('mouseleave', reset3DRotation);
}

function handle3DRotation(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -20;
    const rotateY = ((x - centerX) / centerX) * 20;
    rotatableImg.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
}

function reset3DRotation() {
    rotatableImg.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
}

if(modalClose) {
    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
        lenis.start();
        document.querySelector('.modal-gallery').removeEventListener('mousemove', handle3DRotation);
    });
}

// 10. Testimonials Carousel
const track = document.getElementById('testimonial-track');
if(track) {
    let scrollPos = 0;
    function autoScroll() {
        scrollPos -= 1;
        if(scrollPos <= -410) { // Approx width of one card + gap
            scrollPos = 0;
            track.appendChild(track.firstElementChild); // Move first element to end
        }
        track.style.transform = `translateX(${scrollPos}px)`;
        requestAnimationFrame(autoScroll);
    }
    autoScroll();
}

// 11. Festival Offers Effects
// Countdown
const endDate = new Date().getTime() + (3 * 24 * 60 * 60 * 1000); // 3 days from now
setInterval(() => {
    const now = new Date().getTime();
    const distance = endDate - now;
    if(distance < 0) return;
    
    document.getElementById('days').textContent = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
    document.getElementById('hours').textContent = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
    document.getElementById('mins').textContent = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    document.getElementById('secs').textContent = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
}, 1000);

// Snowfall Canvas (supports multiple canvases: #snow-site, #snow-canvas, #snowfall-canvas)
const snowfallCanvases = Array.from(
    document.querySelectorAll('#snow-site, #snow-canvas, #snowfall-canvas')
);

if(snowfallCanvases.length) {
    snowfallCanvases.forEach((snowCanvas) => {
        const ctx = snowCanvas.getContext('2d');
        let width, height;
        let flakes = [];

        function initSnow() {
            // reset for resize
            flakes = [];
            width = snowCanvas.width = snowCanvas.offsetWidth;
            height = snowCanvas.height = snowCanvas.offsetHeight;

            const count = Math.max(35, Math.floor((width * height) / 18000));
            for(let i = 0; i < count; i++) {
                flakes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    r: Math.random() * 3 + 0.8,
                    d: Math.random() * 1.2,
                    drift: (Math.random() - 0.5) * 0.6
                });
            }
        }

        function drawSnow() {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "rgba(234, 246, 255, 0.85)";
            ctx.beginPath();
            for(let i = 0; i < flakes.length; i++) {
                const f = flakes[i];
                ctx.moveTo(f.x, f.y);
                ctx.arc(f.x, f.y, f.r, 0, Math.PI*2, true);
            }
            ctx.fill();
            moveSnow();
        }

        let angle = 0;
        function moveSnow() {
            angle += 0.01;
            for(let i = 0; i < flakes.length; i++) {
                const f = flakes[i];
                f.y += Math.cos(angle + f.d) + 1 + f.r/2;
                f.x += Math.sin(angle) * 2 + f.drift;

                if(f.x > width + 10 || f.x < -10 || f.y > height + 10) {
                    if(i % 3 > 0) {
                        flakes[i] = {x: Math.random() * width, y: -10, r: f.r, d: f.d, drift: f.drift};
                    } else {
                        const sideLeft = Math.sin(angle) > 0;
                        flakes[i] = {x: sideLeft ? -5 : width + 5, y: Math.random() * height, r: f.r, d: f.d, drift: f.drift};
                    }
                }
            }
        }

        initSnow();

        // use rAF for smoother animation
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if(!prefersReduced) {
            const tick = () => { drawSnow(); requestAnimationFrame(tick); };
            requestAnimationFrame(tick);
        }

        window.addEventListener('resize', initSnow);
    });
}

// Confetti on Summer Banner click
const summerBtn = document.querySelector('.summer-banner button');
if(summerBtn && typeof confetti === 'function') {
    summerBtn.addEventListener('click', (e) => {
        const rect = e.target.getBoundingClientRect();
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: (rect.left + rect.width/2)/window.innerWidth, y: (rect.top + rect.height/2)/window.innerHeight }
        });
        playPopSound();
    });
}

// Init everything
loadProducts();
