document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menuToggle');
    const globalHeader = document.querySelector('.global-header');

    if (menuToggle && globalHeader) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = globalHeader.classList.contains('menu-open');
            if (isOpen) {
                globalHeader.classList.remove('menu-open');
                document.body.style.overflow = '';
            } else {
                globalHeader.classList.add('menu-open');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // --- Footer Accordions (Mobile Only) ---
    const footerTitles = document.querySelectorAll('.footer-col-title');
    
    footerTitles.forEach(title => {
        title.addEventListener('click', () => {
            // Check if we are on a mobile viewport (width <= 734px)
            if (window.innerWidth <= 734) {
                const column = title.closest('.footer-col');
                const list = column.querySelector('.footer-col-list');
                
                if (column.classList.contains('active')) {
                    // Close this accordion
                    column.classList.remove('active');
                    list.style.height = '0';
                } else {
                    // Close other columns first to match standard accordion behavior
                    document.querySelectorAll('.footer-col').forEach(col => {
                        col.classList.remove('active');
                        const innerList = col.querySelector('.footer-col-list');
                        if (innerList) innerList.style.height = '0';
                    });
                    
                    // Open clicked column
                    column.classList.add('active');
                    // Calculate height dynamically
                    const fullHeight = list.scrollHeight;
                    list.style.height = `${fullHeight}px`;
                }
            }
        });
    });

    // Reset footer lists styling when resizing window from mobile to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 734) {
            document.querySelectorAll('.footer-col').forEach(col => {
                col.classList.remove('active');
                const list = col.querySelector('.footer-col-list');
                if (list) list.style.height = '';
            });
            // Also ensure mobile menu is closed when resizing to desktop
            if (globalHeader.classList.contains('menu-open')) {
                globalHeader.classList.remove('menu-open');
                document.body.style.overflow = '';
            }
        }
        
        // Recalculate slider position on resize
        updateSlider();
    });


    // --- Apple TV+ Carousel Slider ---
    const track = document.getElementById('carouselTrack');
    const trackWrapper = document.querySelector('.carousel-track-wrapper');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const dots = Array.from(document.querySelectorAll('.carousel-dots .dot'));
    const playPauseBtn = document.getElementById('playPauseBtn');
    const showCategoryEl = document.getElementById('showCategory');
    const showSubtitleEl = document.getElementById('showSubtitle');
    const detailsEl = document.getElementById('carouselDetails');

    let activeIndex = 4; // Start at "The Morning Show" (Slide 5)
    let autoAdvanceInterval = null;
    let isPlaying = true;
    const autoAdvanceDuration = 4000; // 4 seconds

    function updateSlider() {
        if (!track || !trackWrapper || slides.length === 0) return;

        // Calculate dynamic dimensions
        const wrapperWidth = trackWrapper.getBoundingClientRect().width;
        const slideWidth = slides[0].getBoundingClientRect().width;
        
        // Dynamic gap based on mobile vs desktop
        const gap = window.innerWidth <= 734 ? 12 : 20;

        // Formula to center the active slide in the viewport:
        // offset = (wrapper_center) - (active_slide_center)
        // track translation moves the selected item to that offset
        const activeSlideCenter = (activeIndex * (slideWidth + gap)) + (slideWidth / 2);
        const wrapperCenter = wrapperWidth / 2;
        const offset = wrapperCenter - activeSlideCenter;

        // Apply slide animation
        track.style.transform = `translateX(${offset}px)`;

        // Toggle classes on slides
        slides.forEach((slide, idx) => {
            if (idx === activeIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // Toggle classes on pagination dots
        dots.forEach((dot, idx) => {
            if (idx === activeIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Fade detail information in/out smoothly
        if (detailsEl) {
            detailsEl.classList.remove('visible');
            
            // Wait for brief opacity fade out, update contents, then fade back in
            setTimeout(() => {
                const activeSlide = slides[activeIndex];
                if (activeSlide) {
                    const category = activeSlide.getAttribute('data-category');
                    const subtitle = activeSlide.getAttribute('data-subtitle');
                    showCategoryEl.textContent = category;
                    showSubtitleEl.textContent = subtitle;
                    detailsEl.classList.add('visible');
                }
            }, 250);
        }
    }

    function nextSlide() {
        activeIndex = (activeIndex + 1) % slides.length;
        updateSlider();
    }

    function prevSlide() {
        activeIndex = (activeIndex - 1 + slides.length) % slides.length;
        updateSlider();
    }

    function startAutoAdvance() {
        stopAutoAdvance();
        autoAdvanceInterval = setInterval(nextSlide, autoAdvanceDuration);
    }

    function stopAutoAdvance() {
        if (autoAdvanceInterval) {
            clearInterval(autoAdvanceInterval);
            autoAdvanceInterval = null;
        }
    }

    function handlePlayPauseToggle() {
        if (isPlaying) {
            stopAutoAdvance();
            playPauseBtn.classList.remove('pause');
            playPauseBtn.classList.add('play');
            playPauseBtn.setAttribute('aria-label', 'Play Auto-advance');
            isPlaying = false;
        } else {
            startAutoAdvance();
            playPauseBtn.classList.remove('play');
            playPauseBtn.classList.add('pause');
            playPauseBtn.setAttribute('aria-label', 'Pause Auto-advance');
            isPlaying = true;
        }
    }

    // Initialize TV+ carousel click events
    dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            activeIndex = index;
            updateSlider();
            // If playing, reset timer on manual user interaction
            if (isPlaying) startAutoAdvance();
        });
    });

    slides.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            // Clicking a side slide centers it!
            if (activeIndex !== index) {
                activeIndex = index;
                updateSlider();
                if (isPlaying) startAutoAdvance();
            }
        });
    });

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handlePlayPauseToggle();
        });
    }

    // Initial load setup
    setTimeout(() => {
        updateSlider();
        if (isPlaying) startAutoAdvance();
    }, 100);
});
