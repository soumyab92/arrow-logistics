/* ==========================================================================
   ARROW LOGISTICS INTERACTIVE SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------------------------------------
       1. Sticky Header
       ---------------------------------------------------------------------- */
    const header = document.getElementById('main-header');

    // The bar condenses once you leave the top, then hides while you scroll
    // down and slides back the moment you scroll up — so it is out of the way
    // during the pinned cinematic sequences but always one flick away.
    const HIDE_AFTER = 120;   // px before hiding is allowed at all
    const DEAD_ZONE = 6;      // px of jitter to ignore before reacting

    let lastY = window.scrollY;
    let ticking = false;

    const applyScrollState = () => {
        ticking = false;
        const y = window.scrollY;
        const delta = y - lastY;

        header.classList.toggle('scrolled', y > 50);

        // Never hide it while the mobile drawer is open — that would strand the
        // close button off-screen.
        if (document.body.classList.contains('nav-open')) {
            header.classList.remove('hidden');
        } else if (y <= HIDE_AFTER) {
            header.classList.remove('hidden');
        } else if (delta > DEAD_ZONE) {
            header.classList.add('hidden');
        } else if (delta < -DEAD_ZONE) {
            header.classList.remove('hidden');
        }

        if (Math.abs(delta) > DEAD_ZONE) lastY = y;
    };

    // passive + rAF: this listener never calls preventDefault, and doing the
    // class work straight in the scroll handler forces layout on every frame
    // of a 4000px pinned scrub.
    const handleScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(applyScrollState);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    applyScrollState();

    // Keyboard focus must always pull the bar back into view.
    header.addEventListener('focusin', () => header.classList.remove('hidden'));


    /* ----------------------------------------------------------------------
       2. Mobile Navigation Drawer
       ---------------------------------------------------------------------- */
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const navMenuBar = document.getElementById('nav-menu-bar');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerActions = document.getElementById('header-actions-area');

    // Clone header actions into the drawer. Every id MUST be stripped from the
    // clone: duplicated ids meant getElementById() kept returning the desktop
    // node, so the cloned mobile CTA never got a click handler at all.
    if (headerActions && navMenuBar) {
        const mobileActions = document.createElement('div');
        mobileActions.className = 'header-actions-mobile';

        Array.from(headerActions.children).forEach(child => {
            const clone = child.cloneNode(true);
            clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
            if (child.id) clone.dataset.cloneOf = child.id;
            clone.removeAttribute('id');
            mobileActions.appendChild(clone);
        });

        navMenuBar.appendChild(mobileActions);
    }

    const toggleMenu = (force) => {
        const isOpen = navMenuBar.classList.toggle('open', force);
        menuToggleBtn.classList.toggle('open', isOpen);
        menuToggleBtn.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('nav-open', isOpen);

        // Opening the drawer must pull the bar back down immediately — the
        // drawer hangs off it, so a hidden bar would take the whole menu
        // off-screen. Waiting for the next scroll event is too late.
        if (isOpen) {
            header.classList.remove('hidden');
        }
        // Re-baseline the direction tracker so closing the drawer does not
        // instantly re-hide the bar on the next stray scroll pixel.
        lastY = window.scrollY;
    };

    menuToggleBtn.addEventListener('click', () => toggleMenu());

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // In the drawer a dropdown parent expands its submenu instead of
            // closing the whole menu.
            if (window.innerWidth <= 1024 && link.parentElement.classList.contains('nav-item-dropdown')) {
                e.preventDefault();
                const dropdownMenu = link.nextElementSibling;
                const chevron = link.querySelector('.dropdown-chevron');
                if (dropdownMenu) dropdownMenu.classList.toggle('open');
                if (chevron) chevron.classList.toggle('rotated');
                return;
            }
            if (navMenuBar.classList.contains('open')) toggleMenu(false);
        });
    });

    // Close on Escape for keyboard users.
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenuBar.classList.contains('open')) toggleMenu(false);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024 && navMenuBar.classList.contains('open')) {
            toggleMenu(false);
            document.querySelectorAll('.dropdown-menu').forEach(el => el.classList.remove('open'));
            document.querySelectorAll('.dropdown-chevron').forEach(el => el.classList.remove('rotated'));
        }
    });


    /* ----------------------------------------------------------------------
       3. Tracking Card Tabs
       ---------------------------------------------------------------------- */
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

    tabTracking.addEventListener('click', () => switchTab(tabTracking, panelTracking, tabShipping, panelShipping));
    tabShipping.addEventListener('click', () => switchTab(tabShipping, panelShipping, tabTracking, panelTracking));


    /* ----------------------------------------------------------------------
       4. Form Validation & Toasts
       ---------------------------------------------------------------------- */
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

    // Toast text is interpolated into innerHTML and includes user input, so it
    // has to be escaped.
    const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;

        const iconSvg = type === 'success'
            ? '<svg viewBox="0 0 20 20" width="18" height="18" fill="#10B981"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>'
            : '<svg viewBox="0 0 20 20" width="18" height="18" fill="#DC2626"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>';

        toast.innerHTML = iconSvg + '<span class="toast-message">' + escapeHtml(message) + '</span>';
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, 4000);
    };

    trackingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = trackingInput.value.trim();

        trackingError.style.display = 'none';
        trackingInput.parentElement.classList.remove('input-error');

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
            showToast('Tracking status loaded for order ID: ' + value.toUpperCase(), 'success');
            trackingInput.value = '';
        }
    });

    shippingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const originVal = shippingOrigin.value;
        const destVal = shippingDestination.value;
        const weightVal = parseFloat(shippingWeight.value);
        const typeText = shippingType.options[shippingType.selectedIndex].text;

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
            const baseRate = weightVal * 4.5;
            const multiplier = shippingType.value === 'express' ? 2.5 : (shippingType.value === 'air' ? 1.8 : 1.0);
            const rateEstimate = (baseRate * multiplier).toFixed(2);

            showToast('Estimated Rate: $' + rateEstimate + ' for ' + weightVal + 'kg via ' + typeText, 'success');
            shippingForm.reset();
        }
    });

    // Mock CTAs, bound by selector rather than id so the cloned drawer copies
    // respond too.
    const mockCtaSelectors = [
        { sel: '#get-started-cta-btn, [data-clone-of="get-started-cta-btn"]', msg: 'Initiating onboarding wizard...' },
        { sel: '#learn-more-btn', msg: 'Navigating to Services overview...' },
        { sel: '#meta-multiple-tracking', msg: 'Opening Bulk Tracking Console...' },
        { sel: '#meta-support-help', msg: 'Connecting with support line...' }
    ];

    mockCtaSelectors.forEach((cfg) => {
        document.querySelectorAll(cfg.sel).forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showToast(cfg.msg, 'success');
            });
        });
    });

    // Placeholder anchors must not jump the page to the top: doing so mid-way
    // through a pinned section yanks scrollY to 0 and snaps every sequence.
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest && e.target.closest('a[href="#"]');
        if (anchor) e.preventDefault();
    });


    /* ======================================================================
       5. SCROLL ENGINE — GSAP + ScrollTrigger
       ====================================================================== */
    gsap.registerPlugin(ScrollTrigger);

    // Mobile browsers fire resize every time the URL bar shows/hides. Without
    // this, ScrollTrigger recalculates every pin mid-scroll and the page jumps.
    ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
    });

    const DESKTOP = '(min-width: 1025px)';
    const MOBILE = '(max-width: 1024px)';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /**
     * Attach a video scrub to a scrubbed timeline.
     *
     * Two problems this solves:
     *  1. Tweening video.currentTime directly fires a fresh seek every tick. If
     *     the browser has not finished the previous seek those requests queue
     *     up and the video stutters. Tween a proxy, commit only when idle.
     *  2. Reading video.duration up front forced the ScrollTrigger build to
     *     wait for loadedmetadata. Four videos meant four staggered
     *     ScrollTrigger.refresh() calls that visibly jolted the page. Triggers
     *     are now built immediately and duration is read lazily per tick.
     */
    const scrubVideo = (timeline, videoEl, tweenDuration) => {
        if (!videoEl) return;
        videoEl.pause();

        const proxy = { p: 0 };
        timeline.to(proxy, {
            p: 1,
            ease: 'none',
            duration: tweenDuration,
            onUpdate: () => {
                const d = videoEl.duration;
                if (!d || !isFinite(d) || videoEl.seeking) return;
                videoEl.currentTime = proxy.p * (d - 0.05);
            }
        }, 0);
    };

    /**
     * Cross-fade a set of slides across a scrubbed timeline. `step` is the
     * scroll beat between slides. The entrance/exit shape is shared so all
     * three cinematic sections keep an identical scroll feel even though their
     * layouts are completely different.
     */
    const buildSlideSequence = (timeline, slides, opts) => {
        const start = opts && opts.start != null ? opts.start : 0.5;
        const step = opts.step;
        const onEnter = opts && opts.onEnter;

        gsap.set(slides, { opacity: 0, scale: 0.92, y: 40, filter: 'blur(8px)' });

        slides.forEach((slide, i) => {
            const at = start + i * step;

            timeline.to(slide, {
                opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
                duration: 1.5, ease: 'power2.out'
            }, at);

            if (typeof onEnter === 'function') onEnter(timeline, slide, i, at);

            const isLast = i === slides.length - 1;
            timeline.to(slide, {
                opacity: 0,
                scale: isLast ? 1.05 : 1.08,
                y: isLast ? -20 : -40,
                filter: 'blur(8px)',
                duration: 1.2,
                ease: 'power2.in'
            }, at + (isLast ? 1.5 : step - 0.9));
        });
    };

    /**
     * Drive a section's progress ticker from timeline progress rather than from
     * per-slide triggers, so scrubbing backwards stays in sync.
     */
    const linkTicker = (timeline, slideCount, dots, railFill) => {
        if (!dots.length && !railFill) return;
        timeline.eventCallback('onUpdate', () => {
            const p = timeline.progress();
            const idx = Math.min(slideCount - 1, Math.floor(p * slideCount));
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
            if (railFill) railFill.style.transform = 'scaleY(' + p + ')';
        });
    };


    /* ----------------------------------------------------------------------
       5a. HERO — pinned cinematic sequence
       ---------------------------------------------------------------------- */
    const heroVideo = document.getElementById('hero-video');
    const heroLeft = document.getElementById('hero-intro-column');
    const trackingCard = document.getElementById('tracking-card-container');
    const heroSlides = gsap.utils.toArray('#cinematic-overlay .cinematic-slide');

    if (prefersReducedMotion) {
        gsap.set([heroLeft, trackingCard], { opacity: 1, y: 0, scale: 1, filter: 'none' });
        gsap.set(heroSlides, { opacity: 0 });
    } else {
        const mmHero = gsap.matchMedia();

        // Mobile/tablet: a 4000px pinned scrub is dead scroll on a phone and
        // fights native momentum scrolling. Just loop the video.
        mmHero.add(MOBILE, () => {
            heroVideo.play().catch(() => {});
            gsap.set([heroLeft, trackingCard], {
                opacity: 1, y: 0, scale: 1, filter: 'none',
                visibility: 'visible', pointerEvents: 'auto'
            });
            gsap.set(heroSlides, { opacity: 0 });
        });

        mmHero.add(DESKTOP, () => {
            gsap.set(heroSlides, { opacity: 0, scale: 0.8, y: 50 });
            gsap.set(trackingCard, {
                opacity: 1, y: 0, scale: 1, visibility: 'visible', pointerEvents: 'auto'
            });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#hero-wrapper',
                    start: 'top top',
                    end: '+=4000',
                    scrub: 1.2,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    refreshPriority: 4
                }
            });

            scrubVideo(tl, heroVideo, 14);

            // Stage 1 — clear the intro furniture.
            tl.to([heroLeft, trackingCard], {
                opacity: 0, y: -80, filter: 'blur(10px)', scale: 0.95,
                duration: 2, ease: 'power2.inOut'
            }, 0);

            // The tracking card does not come back; only the left column does.
            tl.set(trackingCard, { visibility: 'hidden', pointerEvents: 'none' }, 2);

            // Stage 2 — three cinematic statements.
            heroSlides.forEach((slide, i) => {
                const at = 2 + i * 3;
                tl.to(slide, {
                    opacity: 1, scale: 1, y: 0,
                    duration: 1.8, ease: 'power3.out'
                }, at);
                tl.to(slide, {
                    opacity: 0, scale: 1.05, y: -50, filter: 'blur(10px)',
                    duration: 1.2, ease: 'power2.in'
                }, at + 1.8);
            });

            // Stage 3 — return the headline for the hand-off into the page.
            tl.to(heroLeft, {
                opacity: 1, y: 0, filter: 'blur(0px)', scale: 1,
                duration: 2, ease: 'power3.out'
            }, 11.2);

            return () => {
                gsap.set([heroLeft, trackingCard], { clearProps: 'all' });
                gsap.set(heroSlides, { clearProps: 'all' });
            };
        });
    }


    /* ----------------------------------------------------------------------
       5b. BY THE NUMBERS — pinned left-rail layout with live counters
       ---------------------------------------------------------------------- */
    const numbersVideo = document.getElementById('numbers-bg-video');
    const numbersSlides = gsap.utils.toArray('.numbers-slide');
    const numbersDots = gsap.utils.toArray('#numbers-ticker .ticker-dot');
    const numbersRail = document.getElementById('numbers-rail-fill');

    const setNumberText = (el, value) => {
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const suffix = el.dataset.suffix || '';
        el.textContent = value.toFixed(decimals) + suffix;
    };

    if (numbersVideo && numbersSlides.length) {
        if (prefersReducedMotion) {
            gsap.set(numbersSlides, { opacity: 1, filter: 'none', scale: 1, y: 0 });
            document.querySelectorAll('.num-value').forEach(el => {
                setNumberText(el, parseFloat(el.dataset.target) || 0);
            });
        } else {
            const mmNum = gsap.matchMedia();

            mmNum.add(DESKTOP, () => {
                const numTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '#numbers-section',
                        start: 'top top',
                        end: '+=3500',
                        scrub: 1.2,
                        pin: true,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                        refreshPriority: 3
                    }
                });

                scrubVideo(numTl, numbersVideo, 12);

                buildSlideSequence(numTl, numbersSlides, {
                    start: 0.5,
                    step: 2.7,
                    // Roll each figure up from zero as its slide arrives.
                    onEnter: (tl, slide, i, at) => {
                        const valueEl = slide.querySelector('.num-value');
                        if (!valueEl) return;
                        const target = parseFloat(valueEl.dataset.target) || 0;
                        const counter = { v: 0 };
                        tl.to(counter, {
                            v: target,
                            duration: 1.5,
                            ease: 'power2.out',
                            onUpdate: () => setNumberText(valueEl, counter.v)
                        }, at);
                    }
                });

                linkTicker(numTl, numbersSlides.length, numbersDots, numbersRail);

                return () => {
                    gsap.set(numbersSlides, { clearProps: 'all' });
                    numbersDots.forEach(d => d.classList.remove('active'));
                    if (numbersRail) numbersRail.style.transform = '';
                };
            });

            mmNum.add(MOBILE, () => {
                numbersVideo.play().catch(() => {});
                gsap.set(numbersSlides, { opacity: 1, filter: 'none', scale: 1, y: 0 });

                const tweens = numbersSlides.map((slide) => {
                    const valueEl = slide.querySelector('.num-value');
                    const target = valueEl ? (parseFloat(valueEl.dataset.target) || 0) : 0;
                    const counter = { v: 0 };

                    return gsap.from(slide, {
                        opacity: 0, y: 40, duration: 0.8, ease: 'power2.out',
                        scrollTrigger: {
                            trigger: slide,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                            onEnter: () => {
                                if (!valueEl) return;
                                gsap.to(counter, {
                                    v: target, duration: 1.4, ease: 'power2.out',
                                    onUpdate: () => setNumberText(valueEl, counter.v)
                                });
                            }
                        }
                    });
                });

                return () => tweens.forEach(t => t.scrollTrigger && t.scrollTrigger.kill());
            });
        }
    }


    /* ----------------------------------------------------------------------
       5c. OUR SERVICES — pinned centered cinematic panel
       ---------------------------------------------------------------------- */
    const servicesVideo = document.getElementById('services-bg-video');
    const serviceSlides = gsap.utils.toArray('.service-slide');
    const servicesDots = gsap.utils.toArray('#services-ticker .ticker-dot');

    if (servicesVideo && serviceSlides.length) {
        if (prefersReducedMotion) {
            gsap.set(serviceSlides, { opacity: 1, filter: 'none', scale: 1, y: 0 });
        } else {
            const mmSrv = gsap.matchMedia();

            mmSrv.add(DESKTOP, () => {
                const servicesTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '#services',
                        start: 'top top',
                        end: '+=3000',
                        scrub: 1.2,
                        pin: true,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                        refreshPriority: 2
                    }
                });

                scrubVideo(servicesTl, servicesVideo, 10);
                buildSlideSequence(servicesTl, serviceSlides, { start: 0.5, step: 3 });
                linkTicker(servicesTl, serviceSlides.length, servicesDots, null);

                return () => {
                    gsap.set(serviceSlides, { clearProps: 'all' });
                    servicesDots.forEach(d => d.classList.remove('active'));
                };
            });

            mmSrv.add(MOBILE, () => {
                servicesVideo.play().catch(() => {});
                gsap.set(serviceSlides, { opacity: 1, filter: 'none', scale: 1, y: 0 });

                const tweens = serviceSlides.map(slide => gsap.from(slide, {
                    opacity: 0, y: 40, duration: 0.8, ease: 'power2.out',
                    scrollTrigger: { trigger: slide, start: 'top 85%', toggleActions: 'play none none none' }
                }));

                return () => tweens.forEach(t => t.scrollTrigger && t.scrollTrigger.kill());
            });
        }
    }


    /* ----------------------------------------------------------------------
       5d. WHY CHOOSE US — pinned right-aligned dossier layout
       ---------------------------------------------------------------------- */
    const whyVideo = document.getElementById('why-bg-video');
    const whySlides = gsap.utils.toArray('.why-slide');
    const whyDots = gsap.utils.toArray('#why-ticker .ticker-dot');

    if (whyVideo && whySlides.length) {
        if (prefersReducedMotion) {
            gsap.set(whySlides, { opacity: 1, filter: 'none', scale: 1, y: 0 });
        } else {
            const mmWhy = gsap.matchMedia();

            mmWhy.add(DESKTOP, () => {
                const whyTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '#why-choose-us',
                        start: 'top top',
                        end: '+=3500',
                        scrub: 1.2,
                        pin: true,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                        refreshPriority: 1
                    }
                });

                scrubVideo(whyTl, whyVideo, 12);
                buildSlideSequence(whyTl, whySlides, { start: 0.5, step: 2.7 });
                linkTicker(whyTl, whySlides.length, whyDots, null);

                return () => {
                    gsap.set(whySlides, { clearProps: 'all' });
                    whyDots.forEach(d => d.classList.remove('active'));
                };
            });

            mmWhy.add(MOBILE, () => {
                whyVideo.play().catch(() => {});
                gsap.set(whySlides, { opacity: 1, filter: 'none', scale: 1, y: 0 });

                const tweens = whySlides.map(slide => gsap.from(slide, {
                    opacity: 0, y: 40, duration: 0.8, ease: 'power2.out',
                    scrollTrigger: { trigger: slide, start: 'top 85%', toggleActions: 'play none none none' }
                }));

                return () => tweens.forEach(t => t.scrollTrigger && t.scrollTrigger.kill());
            });
        }
    }


    /* ----------------------------------------------------------------------
       6. Keep pin measurements honest
       ----------------------------------------------------------------------
       Videos, webfonts and images change section heights after
       DOMContentLoaded. Every refresh is coalesced into one rAF-batched call:
       the previous build refreshed once per video as its metadata landed, and
       each of those recalculated all four pins mid-scroll. */
    let refreshQueued = false;
    const queueRefresh = () => {
        if (refreshQueued) return;
        refreshQueued = true;
        requestAnimationFrame(() => {
            refreshQueued = false;
            ScrollTrigger.refresh();
        });
    };

    ['hero-video', 'numbers-bg-video', 'services-bg-video', 'why-bg-video'].forEach(id => {
        const v = document.getElementById(id);
        if (v) v.addEventListener('loadedmetadata', queueRefresh, { once: true });
    });

    window.addEventListener('load', queueRefresh);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(queueRefresh);
    }

    // Orientation changes genuinely invalidate every measurement.
    window.addEventListener('orientationchange', () => setTimeout(queueRefresh, 250));

});
