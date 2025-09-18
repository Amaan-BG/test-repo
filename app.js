const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

document.addEventListener('DOMContentLoaded', () => {
  const htmlEl = document.documentElement;
  const body = document.body;
  const themeToggle = document.querySelector('.toggle-theme');
  const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let navOpen = false;
  let cartOpen = false;
  let modalOpen = false;

  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (err) {
        console.warn('Storage get failed', err);
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        console.warn('Storage set failed', err);
      }
    },
    setJSON(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.warn('Storage setJSON failed', err);
      }
    },
    getJSON(key, fallback = {}) {
      try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
      } catch (err) {
        console.warn('Storage getJSON failed', err);
        return fallback;
      }
    }
  };

  // Theme toggle
  const storedTheme = storage.get('nova-theme');
  const applyTheme = (theme) => {
    htmlEl.setAttribute('data-theme', theme);
    themeToggle?.setAttribute('aria-pressed', String(theme === 'dark'));
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? 'Dark mode' : 'Light mode';
    }
    storage.set('nova-theme', theme);
  };

  if (storedTheme === 'light' || storedTheme === 'dark') {
    applyTheme(storedTheme);
  } else {
    applyTheme('dark');
  }

  themeToggle?.addEventListener('click', () => {
    const nextTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  // Button ripple
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('pointerdown', (event) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'btn__ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });

  // Smooth scroll for hero buttons
  document.querySelectorAll('[data-scroll-target]').forEach((control) => {
    control.addEventListener('click', () => {
      const target = document.querySelector(control.dataset.scrollTarget);
      if (target) {
        target.scrollIntoView({ behavior: prefersReduceMotion ? 'auto' : 'smooth' });
      }
    });
  });

  const lockBody = () => body.classList.add('is-locked');
  const releaseBody = () => {
    if (!navOpen && !cartOpen && !modalOpen) {
      body.classList.remove('is-locked');
    }
  };

  // Mobile navigation drawer
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileClose = mobileDrawer?.querySelector('.mobile-drawer__close');
  const mobileLinks = mobileDrawer ? Array.from(mobileDrawer.querySelectorAll('a')) : [];
  const navOverlay = document.querySelector('[data-overlay="nav"]');

  const isNavOpen = () => navOpen;

  const openNav = () => {
    if (!mobileDrawer) return;
    mobileDrawer.setAttribute('aria-hidden', 'false');
    menuToggle?.setAttribute('aria-expanded', 'true');
    navOverlay?.removeAttribute('hidden');
    navOpen = true;
    lockBody();
    setTimeout(() => {
      mobileDrawer.focus();
    }, 50);
  };

  const closeNav = () => {
    if (!mobileDrawer) return;
    mobileDrawer.setAttribute('aria-hidden', 'true');
    menuToggle?.setAttribute('aria-expanded', 'false');
    navOverlay?.setAttribute('hidden', '');
    navOpen = false;
    releaseBody();
    menuToggle?.focus();
  };

  menuToggle?.addEventListener('click', () => {
    if (isNavOpen()) {
      closeNav();
    } else {
      openNav();
    }
  });

  mobileClose?.addEventListener('click', closeNav);

  mobileLinks.forEach((link) => link.addEventListener('click', closeNav));

  navOverlay?.addEventListener('click', closeNav);

  // Intersection observer for reveal
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-observe]').forEach((el) => observer.observe(el));

  // Game tutorial modal
  const modal = document.querySelector('.modal');
  const modalOverlay = document.querySelector('[data-overlay="modal"]');
  const modalTitle = document.getElementById('tutorial-title');
  const modalSubtitle = document.querySelector('.modal__subtitle');
  const modalClose = document.querySelector('.modal__close');
  const modalAction = document.querySelector('.modal__action');
  let returnFocusElement = null;

  const isModalOpen = () => modalOpen;

  const trapFocus = (event) => {
    if (!isModalOpen()) return;
    if (event.key !== 'Tab') return;
    const focusable = modal.querySelectorAll(focusableSelectors);
    if (!focusable.length) return;
    const focusArray = Array.from(focusable);
    const first = focusArray[0];
    const last = focusArray[focusArray.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  };

  const openModal = (gameName) => {
    if (!modal) return;
    returnFocusElement = document.activeElement;
    modal.removeAttribute('hidden');
    modalOverlay?.removeAttribute('hidden');
    modalOpen = true;
    lockBody();
    if (gameName && modalTitle) {
      modalTitle.textContent = `${gameName} tutorial`;
    }
    if (modalSubtitle) {
      modalSubtitle.textContent = 'Follow these steps to redeem your reward.';
    }
    const focusable = modal.querySelectorAll(focusableSelectors);
    if (focusable.length) {
      focusable[0].focus();
    }
  };

  const closeModal = () => {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    modalOverlay?.setAttribute('hidden', '');
    modalOpen = false;
    releaseBody();
    if (returnFocusElement) {
      returnFocusElement.focus({ preventScroll: true });
    }
  };

  document.querySelectorAll('.view-tutorial').forEach((button) => {
    button.addEventListener('click', () => {
      const gameName = button.getAttribute('data-game');
      openModal(gameName);
    });
  });

  modalClose?.addEventListener('click', closeModal);
  modalAction?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', closeModal);
  modal?.addEventListener('keydown', trapFocus);

  // Cart drawer setup
  const cartKey = 'nova-cart';
  const cartTrigger = document.querySelector('.cart-trigger');
  const cartDrawer = document.getElementById('mini-cart');
  const cartOverlay = document.querySelector('[data-overlay="cart"]');
  const cartClose = document.querySelector('.mini-cart__close');
  const cartList = document.querySelector('.mini-cart__list');
  const cartEmpty = document.querySelector('.mini-cart__empty');
  const cartTotal = document.querySelector('.mini-cart__sum');
  const cartCountEl = document.querySelector('.cart-count');

  let cartState = storage.getJSON(cartKey, {});

  const isCartOpen = () => cartOpen;

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);

  const persistCart = () => storage.setJSON(cartKey, cartState);

  const getCartItems = () => Object.values(cartState);

  const getCartCount = () => getCartItems().reduce((total, item) => total + (item.qty || 0), 0);

  const getCartTotal = () => getCartItems().reduce((total, item) => total + item.price * (item.qty || 0), 0);

  const updateCartUI = () => {
    const items = getCartItems();
    if (!cartList || !cartEmpty || !cartTotal || !cartCountEl) return;
    cartList.innerHTML = '';
    if (!items.length) {
      cartEmpty.hidden = false;
      cartList.hidden = true;
    } else {
      cartEmpty.hidden = true;
      cartList.hidden = false;
      items.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'mini-cart__item';
        li.innerHTML = `
          <div class="mini-cart__item-info">
            <strong>${item.name}</strong>
            <span>Qty: ${item.qty}</span>
          </div>
          <div>
            <span>${formatCurrency(item.price * item.qty)}</span>
            <button class="mini-cart__remove" type="button" data-remove="${item.id}">Remove</button>
          </div>
        `;
        cartList.appendChild(li);
      });
    }
    cartTotal.textContent = formatCurrency(getCartTotal());
    cartCountEl.textContent = String(getCartCount());
  };

  const openCart = () => {
    if (!cartDrawer) return;
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartOverlay?.removeAttribute('hidden');
    cartTrigger?.setAttribute('aria-expanded', 'true');
    cartOpen = true;
    lockBody();
    setTimeout(() => {
      cartDrawer.focus();
    }, 50);
  };

  const closeCart = () => {
    if (!cartDrawer) return;
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartOverlay?.setAttribute('hidden', '');
    cartTrigger?.setAttribute('aria-expanded', 'false');
    cartOpen = false;
    releaseBody();
    cartTrigger?.focus();
  };

  const addToCart = (product) => {
    if (!product?.id) return;
    const existing = cartState[product.id];
    if (existing) {
      existing.qty += 1;
    } else {
      cartState[product.id] = { ...product, qty: 1 };
    }
    persistCart();
    updateCartUI();
  };

  const removeFromCart = (productId) => {
    if (!productId) return;
    delete cartState[productId];
    persistCart();
    updateCartUI();
  };

  updateCartUI();

  cartTrigger?.addEventListener('click', () => {
    if (isCartOpen()) {
      closeCart();
    } else {
      openCart();
    }
  });

  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  cartList?.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.remove) {
      removeFromCart(target.dataset.remove);
    }
  });

  document.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      const data = button.getAttribute('data-product');
      if (!data) return;
      try {
        const product = JSON.parse(data);
        addToCart(product);
        openCart();
      } catch (err) {
        console.warn('Invalid product data', err);
      }
    });
  });

  // Promo ribbon
  const promoRibbon = document.querySelector('.promo-ribbon');
  const promoDismiss = promoRibbon?.querySelector('.promo-ribbon__dismiss');
  const promoKey = 'nova-promo-dismissed';

  if (promoRibbon) {
    if (!storage.get(promoKey)) {
      promoRibbon.removeAttribute('hidden');
    }
    promoDismiss?.addEventListener('click', () => {
      promoRibbon.setAttribute('hidden', '');
      storage.set(promoKey, 'true');
    });
  }

  // Carousel
  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const track = carousel.querySelector('.carousel__track');
    const slides = track ? Array.from(track.children) : [];
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    const viewport = carousel.querySelector('.carousel__viewport');
    let currentIndex = 0;
    let autoTimer;
    const delay = 4000;

    const setSlideAttributes = () => {
      slides.forEach((slide, index) => {
        slide.setAttribute('aria-hidden', String(index !== currentIndex));
        slide.setAttribute('aria-roledescription', 'slide');
        slide.setAttribute('aria-label', `Testimonial ${index + 1} of ${slides.length}`);
        slide.tabIndex = index === currentIndex ? 0 : -1;
      });
    };

    const goToSlide = (index) => {
      if (!track || !slides.length) return;
      currentIndex = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      setSlideAttributes();
    };

    const stopAuto = () => {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = undefined;
      }
    };

    const startAuto = () => {
      if (prefersReduceMotion) return;
      stopAuto();
      autoTimer = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, delay);
    };

    prevBtn?.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      startAuto();
    });

    nextBtn?.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      startAuto();
    });

    viewport?.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToSlide(currentIndex + 1);
        startAuto();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToSlide(currentIndex - 1);
        startAuto();
      }
    });

    const pauseAuto = () => {
      stopAuto();
    };

    const resumeAuto = () => {
      startAuto();
    };

    viewport?.addEventListener('mouseenter', pauseAuto);
    viewport?.addEventListener('mouseleave', resumeAuto);
    viewport?.addEventListener('focusin', pauseAuto);
    viewport?.addEventListener('focusout', resumeAuto);

    let touchStartX = 0;
    viewport?.addEventListener('touchstart', (event) => {
      touchStartX = event.touches[0].clientX;
      pauseAuto();
    }, { passive: true });

    viewport?.addEventListener('touchend', (event) => {
      const diff = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) > 50) {
        if (diff < 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      }
      resumeAuto();
    });

    setSlideAttributes();
    startAuto();
  }

  // Global escape key handling
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (isModalOpen()) {
      closeModal();
      return;
    }
    if (isCartOpen()) {
      closeCart();
      return;
    }
    if (isNavOpen()) {
      closeNav();
    }
  });
});
