'use strict';

// Navigation, scroll reveals and the five-stage academic journey.
(() => {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  const progress = document.getElementById('reading-progress');
  const heroImage = document.getElementById('hero-image');
  const hero = document.getElementById('inicio');
  const desktop = window.matchMedia('(min-width: 681px)');

  function closeMenu() {
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('menu-open');
  }

  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('menu-open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      menuToggle.focus();
    }
    if (event.key === 'Tab' && nav.classList.contains('is-open')) {
      const targets = [menuToggle, ...nav.querySelectorAll('a')];
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });
  desktop.addEventListener('change', closeMenu);
  document.addEventListener('click', event => {
    if (nav.classList.contains('is-open') && !header.contains(event.target)) closeMenu();
  });

  let scrollScheduled = false;
  let heroHeight = hero.offsetHeight;
  function updateScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 30);
    const range = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, y / range)) : 0})`;
    if (!motionPreference.matches && desktop.matches && y <= heroHeight) {
      heroImage.style.transform = `translateY(${(y * 0.15).toFixed(1)}px)`;
    } else {
      heroImage.style.transform = '';
    }
    scrollScheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollScheduled) { scrollScheduled = true; window.requestAnimationFrame(updateScroll); }
  }, { passive: true });
  window.addEventListener('resize', () => { heroHeight = hero.offsetHeight; updateScroll(); }, { passive: true });
  motionPreference.addEventListener('change', updateScroll);
  updateScroll();

  // The presentation's decorative motion runs only while it is in view.
  const presentation = document.getElementById('experiencia');
  let atmosphereVisible = !('IntersectionObserver' in window);

  function updateAtmosphere() {
    const running = atmosphereVisible && !motionPreference.matches && !document.hidden;
    presentation.classList.toggle('is-ambient-active', running);
  }

  document.addEventListener('visibilitychange', updateAtmosphere);
  motionPreference.addEventListener('change', updateAtmosphere);
  if ('IntersectionObserver' in window) {
    const atmosphereObserver = new IntersectionObserver(entries => {
      atmosphereVisible = entries[0].isIntersecting;
      updateAtmosphere();
    }, { threshold: 0, rootMargin: '0px' });
    atmosphereObserver.observe(presentation);
  }
  updateAtmosphere();

  if ('IntersectionObserver' in window) {
    if (!motionPreference.matches) {
      const reveals = document.querySelectorAll('.reveal');
      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -28px 0px' });
      reveals.forEach(item => { item.classList.add('is-pending'); revealObserver.observe(item); });
    }

    const navLinks = [...nav.querySelectorAll('a:not(.nav-action)')];
    const activeSections = new Map();
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => activeSections.set(entry.target.id, entry.isIntersecting));
      const active = [...activeSections].find(([, visible]) => visible)?.[0];
      navLinks.forEach(link => {
        const current = link.getAttribute('href') === `#${active}`;
        link.classList.toggle('is-current', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-20% 0px -45% 0px', threshold: 0 });
    navLinks.forEach(link => { const target = document.querySelector(link.getAttribute('href')); if (target) navObserver.observe(target); });
  }

  const tabs = [...document.querySelectorAll('.journey-tab')];
  const panels = [...document.querySelectorAll('.journey-panel')];
  const previous = document.getElementById('journey-prev');
  const next = document.getElementById('journey-next');
  const journeyPhoto = document.getElementById('journey-photo');
  const journeyPhotoCaption = document.getElementById('journey-photo-caption');
  const journeyPhotoExpand = document.getElementById('journey-photo-expand');
  const photos = [
    { src: 'assets/museo-casual-fachada.jpg', width: 1280, height: 833, caption: 'Fachada y acceso del Museo Casual de Bagua', position: 'center' },
    { src: 'assets/museo-casual-ceramicas.jpg', width: 1280, height: 960, caption: 'Cerámicas antropomorfas de la Cultura Bagua', position: 'center' },
    { src: 'assets/museo-casual-mural.jpg', width: 1280, height: 918, caption: 'Réplica del mural pictórico expuesta en el museo', position: 'center' },
    { src: 'assets/museo-casual-diorama.jpg', width: 1047, height: 751, caption: 'Diorama museográfico de la vida cotidiana', position: 'center' },
    { src: 'assets/museo-casual-urnas.jpg', width: 974, height: 1024, caption: 'Urnas funerarias expuestas en vitrinas', position: 'center' },
    { src: 'assets/museo-casual-sala.jpg', width: 1024, height: 768, caption: 'Sala del museo con mapa mural y circulación interior', position: 'center' },
    { src: 'assets/museo-casual-vitrina.jpg', width: 1024, height: 768, caption: 'Vitrina con cerámicas y objetos arqueológicos', position: 'center' }
  ];
  const artNumber = document.getElementById('art-number');
  const counter = document.getElementById('journey-counter');
  const tabList = document.querySelector('.journey-tabs');
  let currentStep = 0;

  function updateTabOrientation() {
    tabList.setAttribute('aria-orientation', desktop.matches ? 'horizontal' : 'vertical');
  }
  desktop.addEventListener('change', updateTabOrientation);
  updateTabOrientation();

  function selectStep(index, focus = false) {
    if (index < 0 || index >= tabs.length) return;
    currentStep = index;
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    const number = String(index + 1).padStart(2, '0');
    artNumber.textContent = number;
    counter.textContent = `Etapa ${number} de 05`;
    const photo = photos[index];
    journeyPhoto.src = photo.src;
    journeyPhoto.alt = photo.caption;
    journeyPhoto.width = photo.width;
    journeyPhoto.height = photo.height;
    journeyPhoto.style.objectPosition = photo.position;
    journeyPhotoCaption.textContent = photo.caption;
    journeyPhotoExpand.dataset.photo = String(index);
    previous.disabled = index === 0;
    next.disabled = index === tabs.length - 1;
    if (focus) tabs[index].focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectStep(index));
    tab.addEventListener('keydown', event => {
      const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
      const back = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
      if (forward || back || event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        const target = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (forward ? 1 : -1) + tabs.length) % tabs.length;
        selectStep(target, true);
      }
    });
  });

  previous.addEventListener('click', () => {
    selectStep(currentStep - 1);
    if (previous.disabled) next.focus();
  });
  next.addEventListener('click', () => {
    selectStep(currentStep + 1);
    if (next.disabled) previous.focus();
  });

  // The viewer displays the original photographs without cropping or filters.
  const dialog = document.getElementById('photo-dialog');
  const dialogImage = document.getElementById('photo-dialog-image');
  const dialogCaption = document.getElementById('photo-dialog-caption');
  const dialogCounter = document.getElementById('photo-dialog-counter');
  const dialogClose = document.getElementById('photo-dialog-close');
  const dialogPrevious = document.getElementById('photo-dialog-prev');
  const dialogNext = document.getElementById('photo-dialog-next');
  let currentPhoto = 0;
  let lastPhotoTrigger = null;

  function showPhoto(index) {
    currentPhoto = (index + photos.length) % photos.length;
    const photo = photos[currentPhoto];
    dialogImage.src = photo.src;
    dialogImage.alt = photo.caption;
    dialogImage.width = photo.width;
    dialogImage.height = photo.height;
    dialogCaption.textContent = photo.caption;
    dialogCounter.textContent = `Fotografía ${currentPhoto + 1} de ${photos.length}`;
  }

  document.querySelectorAll('[data-photo]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      showPhoto(Number(trigger.dataset.photo));
      lastPhotoTrigger = trigger;
      dialog.showModal();
      document.body.classList.add('photo-open');
      dialogClose.focus();
    });
  });
  dialogClose.addEventListener('click', () => dialog.close());
  dialogPrevious.addEventListener('click', () => showPhoto(currentPhoto - 1));
  dialogNext.addEventListener('click', () => showPhoto(currentPhoto + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(currentPhoto + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('photo-open');
    lastPhotoTrigger?.focus();
  });

})();
