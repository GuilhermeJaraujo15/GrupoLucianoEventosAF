(function() {
  "use strict";

  // ============================================
  // HEADER SCROLL EFFECT
  // ============================================
  const header = document.getElementById('site-header');
  
  function updateHeader() {
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    const isScrolled = header.classList.contains('is-scrolled');

    if (!isScrolled && scrollTop > 48) {
      header.classList.add('is-scrolled');
    } else if (isScrolled && scrollTop < 12) {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // ============================================
  // MOBILE NAV TOGGLE
  // ============================================
  const navToggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (navToggle && mobileNav) {
    const toggleMenu = function() {
      const isOpen = mobileNav.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    };

    navToggle.addEventListener('click', toggleMenu);

    mobileNav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileNav.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function(e) {
      if (!header.contains(e.target) && mobileNav.classList.contains('is-open')) {
        mobileNav.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ============================================
  // HERO VIDEO - CARREGAMENTO OTIMIZADO E LOOP
  // ============================================
  const heroVideo = document.getElementById('heroVideo');
  const heroBg = document.querySelector('.hero-background');

  if (heroVideo) {
    heroVideo.loop = true;

    if (heroBg) {
      heroBg.classList.add('is-visible');
    }

    function loadHeroVideo() {
      const videoSupported = !!document.createElement('video').canPlayType;
      
      if (!videoSupported) {
        return;
      }

      const loadVideo = function() {
        heroVideo.load();
        
        heroVideo.addEventListener('canplay', function() {
          heroVideo.classList.add('is-loaded');
          if (heroBg) {
            heroBg.classList.remove('is-visible');
          }
          heroVideo.play().catch(function() {
            document.addEventListener('click', function playOnClick() {
              heroVideo.play().catch(function() {});
              document.removeEventListener('click', playOnClick);
            }, { once: true });
          });
        }, { once: true });

        setTimeout(function() {
          if (!heroVideo.classList.contains('is-loaded')) {
            heroVideo.classList.add('is-loaded');
            if (heroBg) {
              heroBg.classList.remove('is-visible');
            }
          }
        }, 3000);
      };

      if (document.readyState === 'complete') {
        loadVideo();
      } else {
        window.addEventListener('load', function() {
          setTimeout(loadVideo, 300);
        }, { once: true });
      }
    }

    loadHeroVideo();
  }

  // ============================================
  // ABOUT CAROUSEL - TOTALMENTE DINÂMICO
  // ============================================
  const carousel = document.getElementById('aboutCarousel');
  const track = document.getElementById('aboutCarouselTrack');
  const prevBtn = document.getElementById('aboutCarouselPrev');
  const nextBtn = document.getElementById('aboutCarouselNext');
  const dotsContainer = document.getElementById('aboutCarouselDots');

  if (carousel && track && prevBtn && nextBtn && dotsContainer) {
    const cards = Array.from(track.querySelectorAll('.about-carousel-card'));
    const totalCards = cards.length;

    if (totalCards === 0) return;

    let currentIndex = 0;
    let cardsPerView = 1;
    let autoPlayInterval = null;
    let gap = 20;
    let touchStartX = 0;
    let touchEndX = 0;

    function getCardsPerView() {
      const width = window.innerWidth;
      if (width < 480) return 1;
      if (width < 768) return 2;
      if (width < 1200) return 2;
      if (width < 1440) return 3;
      return Math.min(4, totalCards);
    }

    function getGap() {
      const trackStyle = window.getComputedStyle(track);
      return parseFloat(trackStyle.columnGap || trackStyle.gap || 20) || 20;
    }

    function getSlideWidth() {
      const carouselStyle = window.getComputedStyle(carousel);
      const paddingLeft = parseFloat(carouselStyle.paddingLeft) || 0;
      const paddingRight = parseFloat(carouselStyle.paddingRight) || 0;
      const availableWidth = carousel.clientWidth - paddingLeft - paddingRight;
      const usableWidth = Math.max(availableWidth, 0);
      const totalGap = gap * Math.max(cardsPerView - 1, 0);
      return Math.max((usableWidth - totalGap) / cardsPerView, 0);
    }

    function updateCardWidths() {
      const slideWidth = getSlideWidth();
      cards.forEach(function(card) {
        card.style.flex = `0 0 ${slideWidth}px`;
        card.style.maxWidth = `${slideWidth}px`;
      });
    }

    function updateCarousel(animate) {
      const newCardsPerView = getCardsPerView();
      if (newCardsPerView !== cardsPerView) {
        cardsPerView = newCardsPerView;
        const maxIndex = Math.max(0, totalCards - cardsPerView);
        currentIndex = Math.min(currentIndex, maxIndex);
      }

      gap = getGap();
      updateCardWidths();

      const slideWidth = getSlideWidth();
      const offset = currentIndex * (slideWidth + gap);
      track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
      track.style.transform = `translateX(-${offset}px)`;
      updateDots();
      updateButtons();
    }

    function createDots() {
      dotsContainer.innerHTML = '';
      const totalSlides = Math.max(1, totalCards - cardsPerView + 1);

      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'about-carousel-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
        dot.dataset.index = String(i);
        dot.addEventListener('click', function() {
          goToSlide(parseInt(this.dataset.index, 10));
        });
        dotsContainer.appendChild(dot);
      }

      updateDots();
    }

    function updateDots() {
      const dots = dotsContainer.querySelectorAll('.about-carousel-dot');
      const totalSlides = Math.max(1, totalCards - cardsPerView + 1);

      if (totalSlides <= 1) {
        dotsContainer.style.display = 'none';
        return;
      }

      dotsContainer.style.display = 'flex';
      const activeDot = Math.min(currentIndex, totalSlides - 1);
      dots.forEach(function(dot, index) {
        dot.classList.toggle('is-active', index === activeDot);
      });
    }

    function updateButtons() {
      const totalSlides = Math.max(1, totalCards - cardsPerView + 1);
      const isSingleSlide = totalSlides <= 1;
      prevBtn.disabled = isSingleSlide;
      nextBtn.disabled = isSingleSlide;
      prevBtn.style.opacity = isSingleSlide ? '0.4' : '1';
      nextBtn.style.opacity = isSingleSlide ? '0.4' : '1';
    }

    function goToSlide(index) {
      const totalSlides = Math.max(1, totalCards - cardsPerView + 1);
      const targetIndex = Math.max(0, Math.min(index, totalSlides - 1));

      if (targetIndex === currentIndex) return;

      currentIndex = targetIndex;
      updateCarousel(true);
    }

    function nextSlide() {
      const totalSlides = Math.max(1, totalCards - cardsPerView + 1);
      if (currentIndex >= totalSlides - 1) {
        goToSlide(0);
      } else {
        goToSlide(currentIndex + 1);
      }
    }

    function prevSlide() {
      const totalSlides = Math.max(1, totalCards - cardsPerView + 1);
      if (currentIndex <= 0) {
        goToSlide(totalSlides - 1);
      } else {
        goToSlide(currentIndex - 1);
      }
    }

    function startAutoPlay() {
      clearInterval(autoPlayInterval);
      const totalSlides = Math.max(1, totalCards - cardsPerView + 1);
      if (totalSlides <= 1) return;

      autoPlayInterval = setInterval(function() {
        if (!document.hidden) {
          nextSlide();
        }
      }, 4000);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    prevBtn.addEventListener('click', function() {
      clearInterval(autoPlayInterval);
      prevSlide();
      startAutoPlay();
    });

    nextBtn.addEventListener('click', function() {
      clearInterval(autoPlayInterval);
      nextSlide();
      startAutoPlay();
    });

    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
    carousel.addEventListener('touchstart', stopAutoPlay, { passive: true });
    carousel.addEventListener('touchend', startAutoPlay, { passive: true });

    carousel.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    });

    track.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      startAutoPlay();
    }, { passive: true });

    createDots();

    setTimeout(function() {
      updateCarousel(false);
      const totalSlides = Math.max(1, totalCards - cardsPerView + 1);
      if (totalSlides > 1) {
        startAutoPlay();
      }
    }, 150);

    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        const newCardsPerView = getCardsPerView();
        const totalSlides = Math.max(1, totalCards - newCardsPerView + 1);

        if (currentIndex >= totalSlides) {
          currentIndex = totalSlides - 1;
        }

        updateCarousel(false);

        const oldTotalSlides = dotsContainer.querySelectorAll('.about-carousel-dot').length;
        if (oldTotalSlides !== totalSlides) {
          createDots();
        } else {
          updateDots();
        }

        stopAutoPlay();
        if (totalSlides > 1) {
          startAutoPlay();
        }
      }, 250);
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            updateCarousel(false);
          }
        });
      }, {
        threshold: 0.1
      });

      observer.observe(carousel);
    }
  }

  // ============================================
  // SCROLL ANIMATIONS (Intersection Observer)
  // ============================================
  const animatedElements = document.querySelectorAll('.feature-item, .services-card, .testimonial-card, .process-step');

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(function(element, index) {
      element.style.transitionDelay = Math.min(index * 40, 300) + 'ms';
      observer.observe(element);
    });
  } else {
    animatedElements.forEach(function(element) {
      element.classList.add('is-visible');
    });
  }

  // ============================================
  // SMOOTH SCROLL PARA LINKS INTERNOS
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight = header.offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });

  // ============================================
  // WHATSAPP FLOAT - FECHAR AO ROLAR
  // ============================================
  const whatsappFloat = document.querySelector('.whatsapp-float');
  let lastScrollTop = 0;

  if (whatsappFloat) {
    window.addEventListener('scroll', function() {
      const currentScrollTop = window.scrollY || window.pageYOffset || 0;
      
      if (currentScrollTop > lastScrollTop && currentScrollTop > 100) {
        whatsappFloat.style.transform = 'translateY(80px)';
        whatsappFloat.style.opacity = '0';
      } else {
        whatsappFloat.style.transform = 'translateY(0)';
        whatsappFloat.style.opacity = '1';
      }
      
      lastScrollTop = currentScrollTop;
    }, { passive: true });
  }

})();