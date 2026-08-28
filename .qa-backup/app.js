/* ==========================================================================
   ARROW LOGISTICS INTERACTIVE SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Sticky Header Functionality ---
    const header = document.getElementById('main-header');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger initially in case page is loaded scrolled down


    // --- 2. Mobile Navigation Drawer ---
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const navMenuBar = document.getElementById('nav-menu-bar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Clone header actions to mobile menu for layout integrity
    const headerActions = document.getElementById('header-actions-area');
    if (headerActions && navMenuBar) {
        const mobileActions = document.createElement('div');
        mobileActions.className = 'header-actions-mobile';
        mobileActions.innerHTML = headerActions.innerHTML;
        navMenuBar.appendChild(mobileActions);
    }

    const toggleMenu = () => {
        const isOpen = navMenuBar.classList.toggle('open');
        menuToggleBtn.classList.toggle('open');
        menuToggleBtn.setAttribute('aria-expanded', isOpen);
    };

    menuToggleBtn.addEventListener('click', toggleMenu);

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // If it's a dropdown toggle link in mobile view, we want to expand/collapse the dropdown instead of closing menu
            if (window.innerWidth <= 1024 && link.parentElement.classList.contains('nav-item-dropdown')) {
                e.preventDefault();
                const dropdownMenu = link.nextElementSibling;
                const chevron = link.querySelector('.dropdown-chevron');
                
                if (dropdownMenu) {
                    dropdownMenu.classList.toggle('open');
                }
                if (chevron) {
                    chevron.classList.toggle('rotated');
                }
                return;
            }
            
            if (navMenuBar.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // Close mobile menu on resize to desktop dimensions
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024 && navMenuBar.classList.contains('open')) {
            toggleMenu();
            // Reset active mobile dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(el => el.classList.remove('open'));
            document.querySelectorAll('.dropdown-chevron').forEach(el => el.classList.remove('rotated'));
        }
    });


    // --- 3. Interactive Tracking Card Tabs ---
    const tabTracking = document.getElementById('tab-tracking');
    const tabShipping = document.getElementById('tab-shipping');
    const panelTracking = document.getElementById('panel-tracking');
    const panelShipping = document.getElementById('panel-shipping');

    const switchTab = (activeTab, activePanel, inactiveTab, inactivePanel) => {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
        activePanel.classList.add('active');

        inactiveTab.classList.remove('active');
        inactiveTab.setAttribute('aria-selected', 'false');
        inactivePanel.classList.remove('active');
    };

    tabTracking.addEventListener('click', () => {
        switchTab(tabTracking, panelTracking, tabShipping, panelShipping);
    });

    tabShipping.addEventListener('click', () => {
        switchTab(tabShipping, panelShipping, tabTracking, panelTracking);
    });


    // --- 4. Form Validations & Toasts ---
    const trackingForm = document.getElementById('tracking-form');
    const trackingInput = document.getElementById('tracking-input');
    const trackingError = document.getElementById('tracking-error');

    const shippingForm = document.getElementById('shipping-form');
    const shippingOrigin = document.getElementById('shipping-origin');
    const shippingDestination = document.getElementById('shipping-destination');
    const shippingWeight = document.getElementById('shipping-weight');
    const shippingType = document.getElementById('shipping-type');
    const shippingError = document.getElementById('shipping-error');

    const toastContainer = document.getElementById('toast-notif-container');

    // Display a custom Toast Notification
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Custom check or alert SVGs based on type
        const iconSvg = type === 'success' 
            ? `<svg viewBox="0 0 20 20" width="18" height="18" fill="#10B981"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`
            : `<svg viewBox="0 0 20 20" width="18" height="18" fill="#DC2626"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`;

        toast.innerHTML = `
            ${iconSvg}
            <span class="toast-message">${message}</span>
        `;
        
        toastContainer.appendChild(toast);

        // Auto remove toast after 4s
        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 4000);
    };

    // Tracking form submission handler
    trackingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = trackingInput.value.trim();
        
        // Reset Error state
        trackingError.style.display = 'none';
        trackingInput.parentElement.classList.remove('input-error');

        // Regex for logistics tracking number: 8-15 characters, alphanumeric
        const trackingRegex = /^[a-zA-Z0-9]{8,15}$/;

        if (!value) {
            trackingError.textContent = 'Tracking number is required.';
            trackingError.style.display = 'block';
            trackingInput.parentElement.classList.add('input-error');
        } else if (!trackingRegex.test(value)) {
            trackingError.textContent = 'Invalid format. Must be 8-15 alphanumeric characters.';
            trackingError.style.display = 'block';
            trackingInput.parentElement.classList.add('input-error');
        } else {
            showToast(`Tracking status loaded for order ID: ${value.toUpperCase()}`, 'success');
            trackingInput.value = ''; // Reset form on success
        }
    });

    // Shipping form submission handler
    shippingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const originVal = shippingOrigin.value;
        const destVal = shippingDestination.value;
        const weightVal = parseFloat(shippingWeight.value);
        const typeText = shippingType.options[shippingType.selectedIndex].text;

        // Reset error message
        shippingError.style.display = 'none';

        if (!originVal || !destVal) {
            shippingError.textContent = 'Please select both Origin and Destination.';
            shippingError.style.display = 'block';
        } else if (originVal === destVal) {
            shippingError.textContent = 'Origin and Destination cannot be the same.';
            shippingError.style.display = 'block';
        } else if (isNaN(weightVal) || weightVal <= 0) {
            shippingError.textContent = 'Please enter a valid weight greater than 0 kg.';
            shippingError.style.display = 'block';
        } else {
            // Generate mock shipping rate estimate
            const baseRate = weightVal * 4.5;
            const multiplier = shippingType.value === 'express' ? 2.5 : (shippingType.value === 'air' ? 1.8 : 1.0);
            const rateEstimate = (baseRate * multiplier).toFixed(2);

            showToast(`Estimated Rate: $${rateEstimate} for ${weightVal}kg via ${typeText}`, 'success');
            
            // Reset form selections
            shippingForm.reset();
        }
    });

    // Standard button clicks mock trigger (Get Started, Learn More, Support links)
    const mockCtaButtons = [
        { id: 'get-started-cta-btn', msg: 'Initiating onboarding wizard...' },
        { id: 'learn-more-btn', msg: 'Navigating to Services overview...' },
        { id: 'meta-multiple-tracking', msg: 'Opening Bulk Tracking Console...' },
        { id: 'meta-support-help', msg: 'Connecting with support line...' }
    ];

    mockCtaButtons.forEach(btnConfig => {
        const btn = document.getElementById(btnConfig.id);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showToast(btnConfig.msg, 'success');
            });
        }
    });

    // --- 4b. Placeholder links must not jump the page to the top ---
    // Every nav/footer/CTA anchor is href="#". Without this, clicking one mid-way
    // through a pinned section yanks the scroll position back to 0 and the
    // ScrollTrigger sequences snap violently.
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest && e.target.closest('a[href="#"]');
        if (anchor) e.preventDefault();
    });


    // --- 5. GSAP Video Scrubbing & Cinematic Animations ---
    gsap.registerPlugin(ScrollTrigger);

    // Runs a section's setup exactly once, whichever signal arrives first
    // (metadata event, already-cached metadata, or the timeout fallback).
    // Previously all three could fire and build duplicate pinned ScrollTriggers
    // on the same section — doubling its scroll length and making it stutter.
    const initOnce = (videoEl, setupFn) => {
        if (!videoEl) return;
        let done = false;
        const run = () => {
            if (done) return;
            done = true;
            setupFn();
            ScrollTrigger.refresh();
        };
        videoEl.addEventListener('loadedmetadata', run, { once: true });
        if (videoEl.readyState >= 1) run();
        setTimeout(run, 3000); // fallback if metadata never arrives
    };

    const video = document.getElementById('hero-video');
    const headerElement = document.getElementById('main-header');
    const heroLeft = document.getElementById('hero-intro-column');
    const trackingCard = document.getElementById('tracking-card-container');
    const statsBar = document.getElementById('stats-panel-bar');
    
    const slide1 = document.getElementById('slide-1');
    const slide2 = document.getElementById('slide-2');
    const slide3 = document.getElementById('slide-3');

    // Initialize overlay slides states
    gsap.set([slide1, slide2, slide3], { opacity: 0, scale: 0.8, y: 50 });
    gsap.set(trackingCard, { opacity: 1, y: 0, scale: 1, visibility: 'visible', pointerEvents: 'auto' });
    gsap.set(statsBar, { opacity: 0, y: 50 });

    const setupScrollAnimation = () => {
        const duration = video.duration || 10;
        
        // Pause the video initially to let ScrollTrigger scrub
        video.pause();

        // Respect prefers-reduced-motion — no pin, no scrub, static hero
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            gsap.set([heroLeft, trackingCard], { opacity: 1, y: 0, scale: 1, filter: 'none' });
            gsap.set([slide1, slide2, slide3], { opacity: 0 });
            return;
        }

        const mm = gsap.matchMedia();

        // ── Mobile/Tablet: no pinning. A 4000px pinned scrub on a phone is dead
        // scroll and fights native momentum scrolling, so just loop the video. ──
        mm.add('(max-width: 1024px)', () => {
            video.play().catch(() => {});
            gsap.set([heroLeft, trackingCard], { opacity: 1, y: 0, scale: 1, filter: 'none' });
            gsap.set([slide1, slide2, slide3], { opacity: 0 });
        });

        // ── Desktop: full pinned cinematic sequence ──────────────────────────
        mm.add('(min-width: 1025px)', () => {

        // Create the scroll-driven timeline
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#hero-wrapper',
                start: 'top top',
                end: '+=4000', // Scroll length of pinning sequence
                scrub: 1.2, // Smooth catch-up delay
                pin: true, // Pin hero during animation
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onEnter: () => {
                    video.pause();
                }
            }
        });

        // 1. Video Scrubbing Tween
        // Tweening video.currentTime directly causes GSAP to fire a new seek every
        // tick; if the browser hasn't finished the previous seek yet, seeks queue
        // up and the video appears to stutter/freeze/jump instead of scrubbing
        // smoothly. Route the tween through a proxy object and only commit a new
        // currentTime once the previous seek has actually completed.
        const videoProxy = { time: 0 };
        tl.to(videoProxy, {
            time: duration - 0.05, // Slight buffer to prevent blank end frame
            ease: 'none',
            duration: 14,
            onUpdate: () => {
                if (!video.seeking) {
                    video.currentTime = videoProxy.time;
                }
            }
        }, 0);

        // 2. Stage 1: Fade out initial Left content & tracking card
        tl.to([heroLeft, trackingCard], {
            opacity: 0,
            y: -80,
            filter: 'blur(10px)',
            scale: 0.95,
            duration: 2,
            ease: 'power2.inOut'
        }, 0);

        // 3. Stage 2: Cinematic highlight slides transitions
        // Slide 1
        tl.to(slide1, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.8,
            ease: 'power3.out'
        }, 2);
        tl.to(slide1, {
            opacity: 0,
            scale: 1.05,
            y: -50,
            filter: 'blur(10px)',
            duration: 1.2,
            ease: 'power2.in'
        }, 3.8);

        // Slide 2
        tl.to(slide2, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.8,
            ease: 'power3.out'
        }, 5);
        tl.to(slide2, {
            opacity: 0,
            scale: 1.05,
            y: -50,
            filter: 'blur(10px)',
            duration: 1.2,
            ease: 'power2.in'
        }, 6.8);

        // Slide 3
        tl.to(slide3, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.8,
            ease: 'power3.out'
        }, 8);
        tl.to(slide3, {
            opacity: 0,
            scale: 1.05,
            y: -50,
            filter: 'blur(10px)',
            duration: 1.2,
            ease: 'power2.in'
        }, 9.8);

        // 4. Stage 3 & 4: Fade in final hero components (tracking card, left content, stats bar)
        tl.to(heroLeft, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            scale: 1,
            duration: 2,
            ease: 'power3.out'
        }, 11.2);

        // Tracking card stays hidden once it fades out — only the left content
        // and stats bar return on the final scroll of the hero sequence.
        tl.set(trackingCard, { visibility: 'hidden', pointerEvents: 'none' }, 2);

        tl.to(statsBar, {
            opacity: 1,
            y: 0,
            duration: 1.8,
            ease: 'power2.out'
        }, 11.8);

        }); // end desktop matchMedia
    };

    initOnce(video, setupScrollAnimation);

    // --- 6. Services Section Scroll-driven Cinematic Sequence ---
    const servicesSection = document.getElementById('services');
    const servicesVideo = document.getElementById('services-bg-video');
    const serviceSlides = document.querySelectorAll('.service-slide');

    const setupServicesAnimation = () => {
        if (!servicesVideo || serviceSlides.length === 0) return;

        const servicesDuration = servicesVideo.duration || 10;
        
        // Pause the video initially to allow manual scrubbing
        servicesVideo.pause();

        // Check for reduced motion preferences
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // Simplified fallback for users with motion sensitivity
            servicesVideo.pause();
            gsap.set(serviceSlides, { opacity: 1, filter: "none", scale: 1, y: 0, position: "relative" });
            return;
        }

        let mm = gsap.matchMedia();

        // Desktop Pinned Cinematic Sequence
        mm.add("(min-width: 1025px)", () => {
            // Create pinned timeline for services
            const servicesTl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#services",
                    start: "top top",
                    end: "+=3000", // Scroll distance pinned
                    scrub: 1.2,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true
                }
            });

            // 1. Video scrubbing tween
            const servicesVideoProxy = { time: 0 };
            servicesTl.to(servicesVideoProxy, {
                time: servicesDuration - 0.05,
                ease: 'none',
                duration: 10,
                onUpdate: () => {
                    if (!servicesVideo.seeking) {
                        servicesVideo.currentTime = servicesVideoProxy.time;
                    }
                }
            }, 0);

            // 2. Cross-fading slide animations
            const slide1 = document.getElementById('service-slide-1');
            const slide2 = document.getElementById('service-slide-2');
            const slide3 = document.getElementById('service-slide-3');

            // Force initial absolute hidden states
            gsap.set([slide1, slide2, slide3], { opacity: 0, scale: 0.92, y: 40, filter: "blur(8px)" });

            // Slide 1 Entrance
            servicesTl.to(slide1, {
                opacity: 1,
                scale: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 1.5,
                ease: "power2.out"
            }, 0.5);

            // Slide 1 Exit & Slide 2 Entrance
            servicesTl.to(slide1, {
                opacity: 0,
                scale: 1.08,
                y: -40,
                filter: "blur(8px)",
                duration: 1.2,
                ease: "power2.in"
            }, 2.5);

            servicesTl.to(slide2, {
                opacity: 1,
                scale: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 1.5,
                ease: "power2.out"
            }, 3.5);

            // Slide 2 Exit & Slide 3 Entrance
            servicesTl.to(slide2, {
                opacity: 0,
                scale: 1.08,
                y: -40,
                filter: "blur(8px)",
                duration: 1.2,
                ease: "power2.in"
            }, 5.5);

            servicesTl.to(slide3, {
                opacity: 1,
                scale: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 1.5,
                ease: "power2.out"
            }, 6.5);

            // Slide 3 Exit (fade out before unpinning)
            servicesTl.to(slide3, {
                opacity: 0,
                scale: 1.05,
                y: -20,
                filter: "blur(8px)",
                duration: 1.2,
                ease: "power2.in"
            }, 8.5);
        });

        // Mobile/Tablet Vertical Stack Fallback
        mm.add("(max-width: 1024px)", () => {
            // Let the video loop/play automatically in the background
            servicesVideo.play().catch(() => {});
            
            // Clean up slide absolute states for responsive stacking
            gsap.set(serviceSlides, { opacity: 1, filter: "none", scale: 1, y: 0 });

            // Apply light fade-up on scroll for clean responsive entry
            serviceSlides.forEach((slide) => {
                gsap.from(slide, {
                    opacity: 0,
                    y: 40,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: slide,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                });
            });
        });
    };

    initOnce(servicesVideo, setupServicesAnimation);

    // --- 7. BY THE NUMBERS Section — mirrors setupServicesAnimation exactly ---
    const numbersVideo  = document.getElementById('numbers-bg-video');
    const numbersSlides = document.querySelectorAll('.numbers-slide');

    const setupNumbersAnimation = () => {
        if (!numbersVideo || numbersSlides.length === 0) return;

        const numDuration = numbersVideo.duration || 10;

        numbersVideo.pause();

        // Respect prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            numbersVideo.pause();
            gsap.set(numbersSlides, { opacity: 1, filter: 'none', scale: 1, y: 0, position: 'relative' });
            // Immediately count all numbers
            document.querySelectorAll('.num-value').forEach(el => {
                const target = parseFloat(el.dataset.target) || 0;
                const suffix = el.dataset.suffix || '';
                el.textContent = target + suffix;
            });
            return;
        }

        const mm = gsap.matchMedia();

        // ── Desktop: full pinned cinematic sequence ──────────────────────────
        mm.add('(min-width: 1025px)', () => {

            const numTl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#numbers-section',
                    start: 'top top',
                    end: '+=3500',
                    scrub: 1.2,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true
                }
            });

            // 1. Proxy-object video scrub — same anti-stutter technique as OUR SERVICES
            const numVideoProxy = { time: 0 };
            numTl.to(numVideoProxy, {
                time: numDuration - 0.05,
                ease: 'none',
                duration: 12,
                onUpdate: () => {
                    if (!numbersVideo.seeking) {
                        numbersVideo.currentTime = numVideoProxy.time;
                    }
                }
            }, 0);

            // Slide references
            const ns1 = document.getElementById('num-slide-1');
            const ns2 = document.getElementById('num-slide-2');
            const ns3 = document.getElementById('num-slide-3');
            const ns4 = document.getElementById('num-slide-4');
            const ns5 = document.getElementById('num-slide-5');

            // Force hidden initial states
            gsap.set([ns1, ns2, ns3, ns4, ns5], {
                opacity: 0, scale: 0.92, y: 40, filter: 'blur(8px)'
            });

            // 2. Slide choreography — same entrance/exit pattern as OUR SERVICES
            // Slide 1 — Entrance
            numTl.to(ns1, {
                opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
                duration: 1.5, ease: 'power2.out'
            }, 0.5);

            // Slide 1 Exit / Slide 2 Entrance
            numTl.to(ns1, {
                opacity: 0, scale: 1.08, y: -40, filter: 'blur(8px)',
                duration: 1.2, ease: 'power2.in'
            }, 2.3);

            numTl.to(ns2, {
                opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
                duration: 1.5, ease: 'power2.out'
            }, 3.2);

            // Slide 2 Exit / Slide 3 Entrance
            numTl.to(ns2, {
                opacity: 0, scale: 1.08, y: -40, filter: 'blur(8px)',
                duration: 1.2, ease: 'power2.in'
            }, 5.0);

            numTl.to(ns3, {
                opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
                duration: 1.5, ease: 'power2.out'
            }, 5.9);

            // Slide 3 Exit / Slide 4 Entrance
            numTl.to(ns3, {
                opacity: 0, scale: 1.08, y: -40, filter: 'blur(8px)',
                duration: 1.2, ease: 'power2.in'
            }, 7.7);

            numTl.to(ns4, {
                opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
                duration: 1.5, ease: 'power2.out'
            }, 8.6);

            // Slide 4 Exit / Slide 5 Entrance
            numTl.to(ns4, {
                opacity: 0, scale: 1.08, y: -40, filter: 'blur(8px)',
                duration: 1.2, ease: 'power2.in'
            }, 10.4);

            numTl.to(ns5, {
                opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
                duration: 1.5, ease: 'power2.out'
            }, 11.3);

            // Slide 5 Exit before unpinning
            numTl.to(ns5, {
                opacity: 0, scale: 1.05, y: -20, filter: 'blur(8px)',
                duration: 1.2, ease: 'power2.in'
            }, 12.8);
        });

        // ── Mobile/Tablet: lightweight fade-up per card ──────────────────────
        mm.add('(max-width: 1024px)', () => {
            numbersVideo.play().catch(() => {});

            gsap.set(numbersSlides, { opacity: 1, filter: 'none', scale: 1, y: 0 });

            numbersSlides.forEach((slide) => {
                gsap.from(slide, {
                    opacity: 0, y: 40,
                    duration: 0.8, ease: 'power2.out',
                    scrollTrigger: {
                        trigger: slide,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                });
            });
        });
    };

    initOnce(numbersVideo, setupNumbersAnimation);

    // --- 8. WHY CHOOSE US Section — mirrors setupServicesAnimation exactly ---
    const whySection = document.getElementById('why-choose-us');
    const whyVideo   = document.getElementById('why-bg-video');
    const whySlides  = document.querySelectorAll('.why-slide');

    const setupWhyAnimation = () => {
        if (!whyVideo || whySlides.length === 0) return;

        const whyDuration = whyVideo.duration || 10;

        whyVideo.pause();

        // Respect reduced-motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            whyVideo.pause();
            gsap.set(whySlides, { opacity: 1, filter: 'none', scale: 1, y: 0, position: 'relative' });
            return;
        }

        let mm = gsap.matchMedia();

        // ── Desktop: full pinned cinematic sequence ──────────────────────────
        mm.add('(min-width: 1025px)', () => {

            const whyTl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#why-choose-us',
                    start: 'top top',
                    end: '+=3500',   // Slightly longer than services (5 slides vs 3)
                    scrub: 1.2,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true
                }
            });

            // 1. Proxy-object video scrub (same anti-stutter pattern as services)
            const whyVideoProxy = { time: 0 };
            whyTl.to(whyVideoProxy, {
                time: whyDuration - 0.05,
                ease: 'none',
                duration: 12,
                onUpdate: () => {
                    if (!whyVideo.seeking) {
                        whyVideo.currentTime = whyVideoProxy.time;
                    }
                }
            }, 0);

            // IDs for clarity
            const ws1 = document.getElementById('why-slide-1');
            const ws2 = document.getElementById('why-slide-2');
            const ws3 = document.getElementById('why-slide-3');
            const ws4 = document.getElementById('why-slide-4');
            const ws5 = document.getElementById('why-slide-5');

            // Force initial hidden states
            gsap.set([ws1, ws2, ws3, ws4, ws5], {
                opacity: 0, scale: 0.92, y: 40, filter: 'blur(8px)'
            });

            // 2. Slide 1 — Entrance
            whyTl.to(ws1, {
                opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
                duration: 1.5, ease: 'power2.out'
            }, 0.5);

            // Slide 1 — Exit  /  Slide 2 — Entrance
            whyTl.to(ws1, {
                opacity: 0, scale: 1.08, y: -40, filter: 'blur(8px)',
                duration: 1.2, ease: 'power2.in'
            }, 2.3);

            whyTl.to(ws2, {
                opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
                duration: 1.5, ease: 'power2.out'
            }, 3.2);

            // Slide 2 — Exit  /  Slide 3 — Entrance
            whyTl.to(ws2, {
                opacity: 0, scale: 1.08, y: -40, filter: 'blur(8px)',
                duration: 1.2, ease: 'power2.in'
            }, 5.0);

            whyTl.to(ws3, {
                opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
                duration: 1.5, ease: 'power2.out'
            }, 5.9);

            // Slide 3 — Exit  /  Slide 4 — Entrance
            whyTl.to(ws3, {
                opacity: 0, scale: 1.08, y: -40, filter: 'blur(8px)',
                duration: 1.2, ease: 'power2.in'
            }, 7.7);

            whyTl.to(ws4, {
                opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
                duration: 1.5, ease: 'power2.out'
            }, 8.6);

            // Slide 4 — Exit  /  Slide 5 — Entrance
            whyTl.to(ws4, {
                opacity: 0, scale: 1.08, y: -40, filter: 'blur(8px)',
                duration: 1.2, ease: 'power2.in'
            }, 10.4);

            whyTl.to(ws5, {
                opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
                duration: 1.5, ease: 'power2.out'
            }, 11.3);

            // Slide 5 — Exit before unpinning
            whyTl.to(ws5, {
                opacity: 0, scale: 1.05, y: -20, filter: 'blur(8px)',
                duration: 1.2, ease: 'power2.in'
            }, 12.8); // matches whyDuration - 0.05 buffer naturally
        });

        // ── Mobile/Tablet: lightweight fade-up on scroll ─────────────────────
        mm.add('(max-width: 1024px)', () => {
            // Let video loop freely — no scrubbing on mobile
            whyVideo.play().catch(() => {});

            // Reset absolute slide states for responsive stacking
            gsap.set(whySlides, { opacity: 1, filter: 'none', scale: 1, y: 0 });

            whySlides.forEach((slide) => {
                gsap.from(slide, {
                    opacity: 0,
                    y: 40,
                    duration: 0.8,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: slide,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                });
            });
        });
    };

    initOnce(whyVideo, setupWhyAnimation);

    // --- 9. Keep pin measurements honest ---
    // Videos, webfonts and lazy images change section heights after DOMContentLoaded.
    // Without a refresh the pinned start/end offsets are computed against stale
    // heights, which shows up as sections unpinning early or overlapping.
    window.addEventListener('load', () => ScrollTrigger.refresh());

});
