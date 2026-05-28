<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IceAge Ink - Prehistoric Stationery World</title>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Luckiest+Guy&display=swap" rel="stylesheet">
    
    <!-- CSS -->
    <link rel="stylesheet" href="style.css">
    
    <!-- External Libraries -->
    <!-- GSAP for animations -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <!-- Lenis for smooth scrolling -->
    <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.19/bundled/lenis.min.js"></script>
    <!-- Canvas Confetti -->
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
</head>
<body>
    <!-- Site-wide snow background -->
    <canvas id="snow-site" class="snow-site" aria-hidden="true"></canvas>
    <!-- Audio Tags for Interactions -->
    <audio id="sound-pop" src="https://cdn.freesound.org/previews/244/244654_4011400-lq.mp3" preload="auto"></audio>
    <audio id="sound-hover" src="https://cdn.freesound.org/previews/242/242501_4408169-lq.mp3" preload="auto"></audio>
    <audio id="sound-chime" src="https://cdn.freesound.org/previews/338/338692_5914214-lq.mp3" preload="auto"></audio>

    <!-- Custom Cursor -->
    <div class="cursor"></div>
    <div class="cursor-follower"></div>

    <?php include 'components/loader.php'; ?>
    <?php include 'components/header.php'; ?>
    <?php include 'components/modal.php'; ?>

    <main id="smooth-wrapper">
        <div id="smooth-content">
            
            <!-- HERO SECTION -->
            <header id="home" class="hero section parallax-bg">
                <canvas id="snowfall-canvas" class="snowfall-bg" aria-hidden="true"></canvas>
                <div class="hero-content gsap-reveal">
                    <div class="hero-character-badge">
                        <span class="guide-character Manny">🦣 Manny's Choice</span>
                    </div>
                    <h1 class="hero-title">Ice Age Writing Adventure! 🌨️</h1>
                    <p class="hero-subtitle">Coolest stationery from the prehistoric ice age for clever kids!</p>
                    <div class="hero-buttons">
                        <a href="#shop" class="btn-primary magnetic">Explore Stationery Zone ❄️</a>
                        <a href="#scrat-game" class="btn-secondary magnetic">Help Scrat & Save! 🌰</a>
                    </div>
                </div>
                <!-- Floating elements (Ice age themed) -->
                <div class="floating-elements" data-speed="0.8">
                    <div class="float-item acorn" data-speed="1.2">🌰</div>
                    <div class="float-item ice-cube" data-speed="0.9">🧊</div>
                    <div class="float-item snowflake" data-speed="1.5">❄️</div>
                    <div class="float-item bone" data-speed="1.1">🦴</div>
                    <div class="float-item pine-cone" data-speed="0.7">🌲</div>
                    <div class="float-item pencil" data-speed="1.3">✏️</div>
                </div>
            </header>

            <!-- CATEGORY SHOWCASE -->
            <section id="categories" class="categories-section section">
                <h2 class="gsap-reveal section-title carved-ice-text">Ice Age Zones</h2>
                <div class="category-grid">
                    <!-- Stationery Zone -->
                    <div class="cat-card glass-panel gsap-reveal magnetic-container">
                        <div class="cat-icon float-anim">❄️</div>
                        <h3>Stationery Zone</h3>
                        <p>Cool pens & glacial pencils</p>
                    </div>
                    <!-- School Essentials -->
                    <div class="cat-card glass-panel gsap-reveal magnetic-container" style="--delay: 0.1s">
                        <div class="cat-icon float-anim">🎒</div>
                        <h3>School Essentials</h3>
                        <p>Bags, sets & frozen organizers</p>
                    </div>
                    <!-- Cute Accessories -->
                    <div class="cat-card glass-panel gsap-reveal magnetic-container" style="--delay: 0.2s">
                        <div class="cat-icon float-anim">🎀</div>
                        <h3>Cute Accessories</h3>
                        <p>Acorn keychains & snow stickers</p>
                    </div>
                    <!-- Craft Materials -->
                    <div class="cat-card glass-panel gsap-reveal magnetic-container" style="--delay: 0.3s">
                        <div class="cat-icon float-anim">🎨</div>
                        <h3>Craft Materials</h3>
                        <p>Glitter paints & prehistoric clay</p>
                    </div>
                </div>
            </section>

            <!-- SCRAT MINI-GAME SECTION -->
            <section id="scrat-game" class="scrat-game-section section">
                <div class="game-container glass-panel gsap-reveal">
                    <div class="game-character-intro">
                        <span class="character-avatar">🐿️</span>
                        <div class="dialogue-bubble">
                            <h3>Help Scrat Find His Acorn!</h3>
                            <p>"Squeak! I lost my favorite acorn inside these ice blocks. Tap the correct block to find it and get a <strong>20% discount code</strong>!"</p>
                        </div>
                    </div>
                    
                    <div class="ice-blocks-grid" id="ice-blocks-container">
                        <!-- Ice blocks injected by JS -->
                    </div>
                    
                    <div id="game-message" class="game-feedback"></div>
                </div>
            </section>

            <!-- TRENDING PRODUCTS -->
            <section id="shop" class="shop-section section">
                <div class="section-header gsap-reveal">
                    <span class="guide-character Diego">🐅 Diego's Cool Picks</span>
                    <h2 class="section-title carved-ice-text">Prehistoric Trending Goods</h2>
                </div>
                <div class="products-grid" id="products-container">
                    <!-- Products injected by JS -->
                </div>
            </section>
            
            <!-- AI RECOMMENDATION SECTION -->
            <section id="ai-recommended" class="ai-section section">
                <div class="ai-header gsap-reveal">
                    <span class="ai-badge pulse">❄️ Aurora Recommendation</span>
                    <h2 class="section-title carved-ice-text">Recommended for Young Artists</h2>
                </div>
                <div class="products-grid" id="ai-container">
                    <!-- AI Products injected by JS -->
                </div>
            </section>

            <!-- STORY CORNER SECTION -->
            <section id="story" class="story-section section">
                <div class="story-container">
                    <div class="story-text gsap-reveal">
                        <h2 class="section-title carved-ice-text">Ice Age Story Corner</h2>
                        <div class="story-dialogue">
                            <div class="dialogue-row">
                                <span class="story-emoji">🦥</span>
                                <p><strong>Sid:</strong> "Writing makes my brain warm, even in this freezing sub-zero weather! Manny, look at my coloring!"</p>
                            </div>
                            <div class="dialogue-row">
                                <span class="story-emoji">🦣</span>
                                <p><strong>Manny:</strong> "That's beautiful, Sid. Using quality pencils makes schoolwork look like a masterpiece."</p>
                            </div>
                            <div class="dialogue-row">
                                <span class="story-emoji">🐅</span>
                                <p><strong>Diego:</strong> "And my sharp pens keep your lines clean! Don't let your writing go extinct!"</p>
                            </div>
                        </div>
                    </div>
                    <div class="story-illustration gsap-reveal">
                        <svg class="pencil-drawing" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <path class="draw-path" d="M30,170 Q100,30 170,170 Q100,100 30,170" fill="none" stroke="#89f7fe" stroke-width="5" stroke-linecap="round"/>
                            <circle class="draw-path" cx="100" cy="80" r="30" fill="none" stroke="#66a6ff" stroke-width="5"/>
                        </svg>
                        <div class="floating-illustration">❄️</div>
                    </div>
                </div>
            </section>
            
            <!-- FESTIVAL OFFERS SECTION -->
            <section id="offers" class="offers-section section">
                <h2 class="gsap-reveal section-title carved-ice-text">Glacial Deals & Offers</h2>
                <div class="banners-container">
                    <!-- Ice Age Adventure Offer -->
                    <div class="offer-banner winter-banner gsap-reveal">
                        <canvas id="snow-canvas" aria-hidden="true"></canvas>
                        <div class="banner-content">
                            <h3>Prehistoric Blizzard Sale</h3>
                            <p>Up to 50% Off all Winter School Kits!</p>
                            <div class="countdown-timer">
                                <div class="time-box"><span id="days">00</span><small>Days</small></div>
                                <span>:</span>
                                <div class="time-box"><span id="hours">00</span><small>Hrs</small></div>
                                <span>:</span>
                                <div class="time-box"><span id="mins">00</span><small>Min</small></div>
                                <span>:</span>
                                <div class="time-box"><span id="secs">00</span><small>Sec</small></div>
                            </div>
                            <button class="btn-primary magnetic">Claim Frozen Deal ❄️</button>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- TESTIMONIALS SECTION -->
            <section id="testimonials" class="testimonials-section section">
                <h2 class="gsap-reveal section-title carved-ice-text">Happy Little Explorers</h2>
                <div class="carousel-container gsap-reveal">
                    <div class="carousel-track" id="testimonial-track">
                        <div class="testimonial-card glass-panel">
                            <div class="stars">⭐⭐⭐⭐⭐</div>
                            <p>"The Diego geometry set is sharp! Best math drawings ever!"</p>
                            <h4>- Leo, Age 9 🦖</h4>
                        </div>
                        <div class="testimonial-card glass-panel">
                            <div class="stars">⭐⭐⭐⭐⭐</div>
                            <p>"My daughter is obsessed with Scrat's Acorn sharpener. She keeps sharpening everything!"</p>
                            <h4>- Sarah, Parent 👩‍👧</h4>
                        </div>
                        <div class="testimonial-card glass-panel">
                            <div class="stars">⭐⭐⭐⭐⭐</div>
                            <p>"The aurora notebook is super cool! It glows in my room!"</p>
                            <h4>- Mia, Age 7 🦥</h4>
                        </div>
                    </div>
                </div>
                <!-- Floating Emojis -->
                <div class="floating-emojis">
                    <span class="f-emoji float-anim">❄️</span>
                    <span class="f-emoji float-anim" style="animation-delay: 1s">🌰</span>
                    <span class="f-emoji float-anim" style="animation-delay: 2s">✨</span>
                </div>
            </section>

            <?php include 'components/footer.php'; ?>
            
        </div>
    </main>

    <script src="script.js"></script>
</body>
</html>
