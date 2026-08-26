/* global FormData, IntersectionObserver, document, matchMedia, window */

const header = document.querySelector('[data-site-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-navigation]');
const desktopMedia = matchMedia('(min-width: 1024px)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function closeMenu() {
  if (!menuToggle || !navigation) return;
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  menuToggle.textContent = '☰';
  document.body.classList.remove('menu-open');
}

function toggleMenu() {
  if (!menuToggle || !navigation) return;
  const isOpen = navigation.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  menuToggle.textContent = isOpen ? '×' : '☰';
  document.body.classList.toggle('menu-open', isOpen);
}

menuToggle?.addEventListener('click', toggleMenu);
navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
desktopMedia.addEventListener('change', (event) => {
  if (event.matches) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

function updateHeader() {
  header?.classList.toggle('is-compact', window.scrollY > 32);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

document.querySelectorAll('[data-faq-button]').forEach((button) => {
  button.addEventListener('click', () => {
    const answerId = button.getAttribute('aria-controls');
    const answer = document.getElementById(answerId);
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isExpanded));
    if (answer) answer.hidden = isExpanded;
  });
});

const QUOTE_STORAGE_KEY = 'instrumentech:cotacao';
const QUOTE_FIELDS = ['nome', 'empresa', 'email', 'telefone', 'localizacao', 'servico'];
const QUOTE_LABELS = {
  nome: 'Nome',
  empresa: 'Empresa',
  email: 'E-mail',
  telefone: 'Telefone',
  localizacao: 'Cidade/Estado',
  servico: 'Serviço',
};

function readStoredQuote() {
  try {
    return JSON.parse(window.localStorage.getItem(QUOTE_STORAGE_KEY) || '{}');
  } catch (_error) {
    return {};
  }
}

function storeQuote(values) {
  try {
    window.localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(values));
  } catch (_error) {
    /* armazenamento indisponível (janela anônima, cookies bloqueados): segue sem persistir */
  }
}

document.querySelectorAll('[data-quote-form]').forEach((form) => {
  const stored = readStoredQuote();

  QUOTE_FIELDS.forEach((name) => {
    const field = form.elements[name];
    if (field && typeof stored[name] === 'string' && !field.value) field.value = stored[name];
  });

  form.addEventListener('input', () => {
    const data = new FormData(form);
    storeQuote(Object.fromEntries(QUOTE_FIELDS.map((name) => [name, String(data.get(name) || '')])));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const values = Object.fromEntries(
      QUOTE_FIELDS.map((name) => [name, String(data.get(name) || '').trim()]),
    );
    storeQuote(values);

    const lines = [
      `Olá, meu nome é ${values.nome}.`,
      'Gostaria de falar com a Instrumentech sobre uma demanda técnica.',
      '',
      ...QUOTE_FIELDS.filter((name) => name !== 'nome' && values[name]).map(
        (name) => `${QUOTE_LABELS[name]}: ${values[name]}`,
      ),
    ];
    if (!values.servico) lines.push('Serviço: quero orientação técnica');

    const status = form.querySelector('[data-form-status]');
    if (status) status.textContent = 'Abrindo o WhatsApp com os dados da solicitação…';
    const url = `https://wa.me/5511991192482?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    const target = hash && hash !== '#' ? document.querySelector(hash) : null;
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    window.history.pushState(null, '', hash);
  });
});

const motionSelector = [
  '.hero-copy > *',
  '.internal-hero-content > *',
  '.section .technical-label',
  '.section h2',
  '.section h3',
  '.section .lead',
  '.section p:not(.technical-label):not(.form-status)',
  '.section .precision-list > li',
  '.section .sector-list > li',
  '.section .faq-item',
  '.calibration-item',
  '.process-step',
  '.quality-list > li',
  '.differential-item',
  '.contact-list > li',
  '.cta-final .technical-label',
  '.cta-final h2',
  '.cta-final .lead',
  '.site-footer .footer-grid > *',
  '.site-footer .footer-bottom > *',
].join(',');

const parentOrders = new Map();
document.querySelectorAll(motionSelector).forEach((element) => {
  const revealOwner = element.closest('.reveal');
  if (revealOwner && revealOwner !== element) return;
  const parent = element.parentElement;
  const order = parentOrders.get(parent) || 0;
  parentOrders.set(parent, order + 1);
  element.classList.add('reveal');
  if (element.matches('h1, h2, h3, p, .technical-label, .lead')) {
    element.classList.add('reveal--text');
  }
  element.style.setProperty('--reveal-delay', `${Math.min(order, 4) * 70}ms`);
});

const revealElements = document.querySelectorAll('.reveal');

if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  revealElements.forEach((element) => observer.observe(element));
}
