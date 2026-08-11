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
    let autoPlayInterval = null;
    let isAutoPlayPaused = false;

    function buildDots() {
      dotsContainer.innerHTML = '';
      cards.forEach(function(_, index) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'about-carousel-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Ir para slide ${index + 1}`);
        dot.dataset.index = String(index);
        dot.addEventListener('click', function() {
          scrollToCard(index);
        });
        dotsContainer.appendChild(dot);
      });
      updateDots();
    }

    function updateDots() {
      const dots = dotsContainer.querySelectorAll('.about-carousel-dot');
      dots.forEach(function(dot, index) {
        dot.classList.toggle('is-active', index === currentIndex);
      });
      dotsContainer.style.display = totalCards > 1 ? 'flex' : 'none';
    }

    function updateButtons() {
      const disabled = totalCards <= 1;
      prevBtn.disabled = disabled;
      nextBtn.disabled = disabled;
      prevBtn.style.opacity = disabled ? '0.35' : '1';
      nextBtn.style.opacity = disabled ? '0.35' : '1';
    }

    function scrollToCard(index, behavior = 'smooth') {
      currentIndex = Math.max(0, Math.min(index, totalCards - 1));
      const card = cards[currentIndex];
      if (!card) return;
      carousel.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior });
      updateDots();
    }

    function nextSlide() {
      const nextIndex = currentIndex >= totalCards - 1 ? 0 : currentIndex + 1;
      scrollToCard(nextIndex);
    }

    function prevSlide() {
      const prevIndex = currentIndex <= 0 ? totalCards - 1 : currentIndex - 1;
      scrollToCard(prevIndex);
    }

    function startAutoPlay() {
      if (isAutoPlayPaused || totalCards <= 1) return;
      stopAutoPlay();
      autoPlayInterval = setInterval(nextSlide, 4500);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }

    function handleScroll() {
      const currentScroll = carousel.scrollLeft + carousel.clientWidth * 0.05;
      let nearest = 0;
      let smallest = Number.POSITIVE_INFINITY;
      cards.forEach(function(card, index) {
        const distance = Math.abs(card.offsetLeft - track.offsetLeft - currentScroll);
        if (distance < smallest) {
          smallest = distance;
          nearest = index;
        }
      });
      if (nearest !== currentIndex) {
        currentIndex = nearest;
        updateDots();
      }
    }

    prevBtn.addEventListener('click', function() {
      prevSlide();
      stopAutoPlay();
      isAutoPlayPaused = true;
    });

    nextBtn.addEventListener('click', function() {
      nextSlide();
      stopAutoPlay();
      isAutoPlayPaused = true;
    });

    carousel.addEventListener('mouseenter', function() {
      stopAutoPlay();
      isAutoPlayPaused = true;
    });

    carousel.addEventListener('mouseleave', function() {
      isAutoPlayPaused = false;
      startAutoPlay();
    });

    carousel.addEventListener('touchstart', function() {
      stopAutoPlay();
      isAutoPlayPaused = true;
    }, { passive: true });

    carousel.addEventListener('touchend', function() {
      isAutoPlayPaused = false;
      startAutoPlay();
    }, { passive: true });

    carousel.addEventListener('scroll', function() {
      window.requestAnimationFrame(handleScroll);
    });

    carousel.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    });

    buildDots();
    updateButtons();
    scrollToCard(0, 'auto');
    startAutoPlay();

    window.addEventListener('resize', function() {
      scrollToCard(currentIndex, 'auto');
    });
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