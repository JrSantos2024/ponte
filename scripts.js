(function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const backdrop = document.querySelector('.menu-backdrop');
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  const sections = document.querySelectorAll('main section[id]');
  const backToTop = document.querySelector('.back-to-top');
  const contactForm = document.querySelector('#contact-form');
  const yearEl = document.querySelector('[data-year]');

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function updateMenu(open) {
    if (!menuToggle || !mainNav || !backdrop) return;
    const shouldOpen = open === undefined ? !mainNav.classList.contains('open') : open;
    mainNav.classList.toggle('open', shouldOpen);
    menuToggle.classList.toggle('open', shouldOpen);
    menuToggle.setAttribute('aria-expanded', String(shouldOpen));
    menuToggle.setAttribute('aria-label', shouldOpen ? 'Fechar menu' : 'Abrir menu');
    backdrop.hidden = !shouldOpen;
    backdrop.classList.toggle('show', shouldOpen);
    document.body.classList.toggle('menu-open', shouldOpen);
  }

  if (menuToggle && mainNav && backdrop) {
    menuToggle.addEventListener('click', () => updateMenu());
    backdrop.addEventListener('click', () => updateMenu(false));

    navLinks.forEach((link) => {
      link.addEventListener('click', () => updateMenu(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mainNav.classList.contains('open')) {
        updateMenu(false);
        menuToggle.focus();
      }
    });
  }

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;

    if (header) {
      header.classList.toggle('is-scrolled', scrollY > 12);
    }

    if (backToTop) {
      backToTop.classList.toggle('is-visible', scrollY > 480);
    }

    let currentId = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 140;
      if (scrollY >= top) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const isActive = href === `#${currentId}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('[data-package]').forEach((button) => {
    button.addEventListener('click', () => {
      const packageName = button.getAttribute('data-package');
      const interest = document.querySelector('#interest');
      const message = document.querySelector('#message');
      const contactSection = document.querySelector('#contact');

      if (interest && packageName) {
        interest.value = packageName;
        interest.dispatchEvent(new Event('change', { bubbles: true }));
      }

      if (message && packageName) {
        const base = `Olá! Tenho interesse no pacote ${packageName}. Gostaria de receber mais informações.`;
        if (!message.value.trim()) {
          message.value = base;
        }
      }

      contactSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => {
        document.querySelector('#name')?.focus();
      }, 400);
    });
  });

  function setFieldError(field, message) {
    const group = field.closest('.form-group');
    const error = group?.querySelector('.field-error');
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    group?.classList.toggle('has-error', Boolean(message));
    if (error) error.textContent = message || '';
  }

  function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');

    if (required && !value) {
      setFieldError(field, 'Preencha este campo.');
      return false;
    }

    if (type === 'email' && value) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!emailOk) {
        setFieldError(field, 'Informe um e-mail válido.');
        return false;
      }
    }

    if (field.name === 'phone' && value) {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 10) {
        setFieldError(field, 'Informe um telefone válido com DDD.');
        return false;
      }
    }

    setFieldError(field, '');
    return true;
  }

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/(\d{0,2})(\d{0,4})(\d{0,4})/, (_, a, b, c) => {
          let out = '';
          if (a) out += `(${a}`;
          if (a.length === 2) out += ') ';
          if (b) out += b;
          if (c) out += `-${c}`;
          return out;
        });
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }

  if (contactForm) {
    const fields = contactForm.querySelectorAll('input, select, textarea');
    const status = contactForm.querySelector('.form-status');
    const submitBtn = contactForm.querySelector('[type="submit"]');
    const phoneField = contactForm.querySelector('#phone');

    phoneField?.addEventListener('input', () => {
      phoneField.value = formatPhone(phoneField.value);
    });

    fields.forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') {
          validateField(field);
        }
      });
    });

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      let valid = true;
      fields.forEach((field) => {
        if (!validateField(field)) valid = false;
      });

      if (!valid) {
        if (status) {
          status.textContent = 'Revise os campos destacados para continuar.';
          status.className = 'form-status is-error';
        }
        contactForm.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }

      const name = contactForm.querySelector('#name')?.value.trim() || '';
      const email = contactForm.querySelector('#email')?.value.trim() || '';
      const phone = contactForm.querySelector('#phone')?.value.trim() || '';
      const interest = contactForm.querySelector('#interest')?.value || '';
      const message = contactForm.querySelector('#message')?.value.trim() || '';

      const subject = encodeURIComponent(`Consultoria PONTE — ${interest || 'Contato'}`);
      const body = encodeURIComponent(
        `Nome: ${name}\nE-mail: ${email}\nTelefone: ${phone}\nInteresse: ${interest}\n\nMensagem:\n${message}`
      );

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
        submitBtn.textContent = 'Abrindo e-mail...';
      }

      if (status) {
        status.textContent = 'Pronto! Seu aplicativo de e-mail será aberto com a mensagem preenchida.';
        status.className = 'form-status is-success';
      }

      window.location.href = `mailto:contato@ponteparaguay.com?subject=${subject}&body=${body}`;

      window.setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('is-loading');
          submitBtn.textContent = 'Enviar solicitação';
        }
      }, 1600);
    });
  }

  document.querySelectorAll('[data-accordion-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('[data-accordion-item]');
      const panel = item?.querySelector('[data-accordion-panel]');
      const expanded = trigger.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('[data-accordion-item]').forEach((other) => {
        const otherTrigger = other.querySelector('[data-accordion-trigger]');
        const otherPanel = other.querySelector('[data-accordion-panel]');
        otherTrigger?.setAttribute('aria-expanded', 'false');
        other.classList.remove('is-open');
        if (otherPanel) otherPanel.hidden = true;
      });

      if (!expanded) {
        trigger.setAttribute('aria-expanded', 'true');
        item?.classList.add('is-open');
        if (panel) panel.hidden = false;
      }
    });
  });
})();
