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
    // Configura o loop
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
  // ABOUT CAROUSEL
  // ============================================
  const carousel = document.getElementById('aboutCarousel');
  const track = document.getElementById('aboutCarouselTrack');
  const prevBtn = document.getElementById('aboutCarouselPrev');
  const nextBtn = document.getElementById('aboutCarouselNext');
  const dotsContainer = document.getElementById('aboutCarouselDots');

  if (carousel && track && prevBtn && nextBtn && dotsContainer) {
    const cards = track.querySelectorAll('.about-carousel-card');
    const totalCards = cards.length;
    let currentIndex = 0;
    let cardsPerView = 3;
    let autoPlayInterval = null;
    let isTransitioning = false;

    // Calcula quantos cards cabem por view
    function getCardsPerView() {
      const width = window.innerWidth;
      if (width < 480) return 1;
      if (width < 768) return 2;
      if (width < 992) return 2;
      return 3;
    }

    // Atualiza o carrossel
    function updateCarousel(animate = true) {
      if (isTransitioning) return;
      
      const newCardsPerView = getCardsPerView();
      if (newCardsPerView !== cardsPerView) {
        cardsPerView = newCardsPerView;
        // Recalcula o índice máximo
        const maxIndex = Math.max(0, totalCards - cardsPerView);
        if (currentIndex > maxIndex) {
          currentIndex = maxIndex;
        }
      }

      const cardWidth = cards[0]?.offsetWidth || 0;
      const gap = 20; // mesmo valor do gap no CSS
      const offset = currentIndex * (cardWidth + gap);
      
      track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
      track.style.transform = `translateX(-${offset}px)`;
      
      updateDots();
    }

    // Cria os indicadores (dots)
    function createDots() {
      dotsContainer.innerHTML = '';
      const totalDots = Math.max(1, totalCards - cardsPerView + 1);
      
      for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('button');
        dot.className = 'about-carousel-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
        dot.dataset.index = i;
        dot.addEventListener('click', function() {
          goToSlide(parseInt(this.dataset.index));
        });
        dotsContainer.appendChild(dot);
      }
      
      updateDots();
    }

    function updateDots() {
      const dots = dotsContainer.querySelectorAll('.about-carousel-dot');
      const maxIndex = Math.max(0, totalCards - cardsPerView);
      const activeDot = Math.min(currentIndex, maxIndex);
      
      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === activeDot);
      });
    }

    function goToSlide(index) {
      if (isTransitioning) return;
      
      const maxIndex = Math.max(0, totalCards - cardsPerView);
      const targetIndex = Math.max(0, Math.min(index, maxIndex));
      
      if (targetIndex === currentIndex) return;
      
      currentIndex = targetIndex;
      updateCarousel(true);
    }

    function nextSlide() {
      const maxIndex = Math.max(0, totalCards - cardsPerView);
      if (currentIndex >= maxIndex) {
        goToSlide(0);
      } else {
        goToSlide(currentIndex + 1);
      }
    }

    function prevSlide() {
      if (currentIndex <= 0) {
        const maxIndex = Math.max(0, totalCards - cardsPerView);
        goToSlide(maxIndex);
      } else {
        goToSlide(currentIndex - 1);
      }
    }

    // Event Listeners
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

    // Auto-play
    function startAutoPlay() {
      clearInterval(autoPlayInterval);
      autoPlayInterval = setInterval(function() {
        if (!document.hidden) {
          nextSlide();
        }
      }, 4000);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    // Pausa o auto-play quando o mouse está sobre o carrossel
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
    
    // Pausa em dispositivos touch
    carousel.addEventListener('touchstart', stopAutoPlay, { passive: true });
    carousel.addEventListener('touchend', startAutoPlay, { passive: true });

    // Suporte a teclado
    carousel.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    });

    // Inicializa
    createDots();
    
    // Delay para garantir que o layout esteja pronto
    setTimeout(function() {
      updateCarousel(false);
      startAutoPlay();
    }, 100);

    // Recalcula em redimensionamento
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        const newCardsPerView = getCardsPerView();
        if (newCardsPerView !== cardsPerView) {
          cardsPerView = newCardsPerView;
          const maxIndex = Math.max(0, totalCards - cardsPerView);
          if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
          }
          updateCarousel(false);
          createDots();
        }
        updateCarousel(false);
      }, 200);
    });

    // Suporte a swipe touch
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      startAutoPlay();
    }, { passive: true });
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