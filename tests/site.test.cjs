const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const root = join(__dirname, '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const routes = [
  'index.html',
  'empresa.html',
  'qualidade.html',
  'contato.html',
  'servicos/calibracao-pressao.html',
  'servicos/calibracao-temperatura.html',
  'servicos/calibracao-vazao.html',
  'servicos/laboratorio-analitico.html',
  'servicos/laboratorio-biomedico.html',
  'servicos/inspecao-nr13.html',
  'servicos/assistencia-tecnica.html',
  'servicos/atendimento-in-loco.html',
];

test('gera toda a arquitetura multipágina acordada', () => {
  for (const route of routes) {
    assert.equal(existsSync(join(root, route)), true, `rota ausente: ${route}`);
  }
  assert.equal(existsSync(join(root, 'sitemap.xml')), true);
  assert.equal(existsSync(join(root, 'robots.txt')), true);
});

test('home cobre a jornada institucional e comercial completa', () => {
  const html = read('index.html');
  for (const id of [
    'inicio',
    'posicionamento',
    'solucoes',
    'calibracao',
    'nr13',
    'laboratorios',
    'in-loco',
    'segmentos',
    'qualidade',
    'processo',
    'diferenciais',
    'clientes',
    'contato',
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `seção #${id} ausente`);
  }
  assert.match(html, /Precisão que mantém sua operação em movimento/i);
  assert.match(html, /Desde 2008/);
});

test('usa as seis fotografias finais aprovadas nas seções correspondentes da home', () => {
  const home = read('index.html');
  const generator = read('scripts/build.mjs');
  const mappings = [
    {
      section: /<section class="hero" id="inicio">[\s\S]*?<\/section>/,
      file: 'instrumentech-hero-home.webp',
      previous: 'hero-lab-BjMzPP3y.jpg',
    },
    {
      section: /<section class="section" id="posicionamento">[\s\S]*?<\/section>/,
      file: 'instrumentech-engenharia-medicao.webp',
      previous: 'hero-lab-pressao-CC39m4Jl.jpg',
    },
    {
      section: /<section class="section section--white" id="nr13">[\s\S]*?<\/section>/,
      file: 'instrumentech-inspecao-integridade.webp',
      previous: 'hero-lab-vazao-D7Hlib1l.jpg',
    },
    {
      section: /<section class="section section--navy" id="in-loco">[\s\S]*?<\/section>/,
      file: 'instrumentech-servico-campo.webp',
      previous: 'cta-lab-vazao-BnjZ7nk9.jpg',
    },
    {
      section: /<section class="section" id="diferenciais">[\s\S]*?<\/section>/,
      file: 'instrumentech-parceria-tecnica.webp',
      previous: 'hero-empresa-DKx_apEK.jpg',
    },
    {
      section: /<section class="cta-final">[\s\S]*?<\/section>/,
      file: 'instrumentech-solicite-analise.webp',
      previous: 'hero-quem-somos-B90nV0Ow.jpg',
    },
  ];

  for (const { section, file, previous } of mappings) {
    assert.equal(existsSync(join(root, 'assets', file)), true, `asset ausente: ${file}`);
    assert.match(generator, new RegExp(file.replace('.', '\\.')));
    const block = home.match(section)?.[0] || '';
    assert.ok(block, `bloco da home ausente para ${file}`);
    assert.match(block, new RegExp(file.replace('.', '\\.')));
    assert.doesNotMatch(block, new RegExp(previous.replace('.', '\\.')));
  }
});

test('reutiliza a fotografia aprovada em todos os CTAs finais acima do rodapé', () => {
  let routesWithFinalCta = 0;

  for (const route of routes) {
    const html = read(route);
    const finalCta = html.match(/<section class="cta-final">[\s\S]*?<\/section>/)?.[0];
    if (!finalCta) continue;

    routesWithFinalCta += 1;
    assert.equal((finalCta.match(/<img\b/gi) || []).length, 1, `${route} deve ter uma imagem no CTA final`);
    assert.match(
      finalCta,
      /(?:\.\.\/|\.\/)assets\/instrumentech-solicite-analise\.webp/,
      `${route} deve usar a fotografia final aprovada`,
    );
  }

  assert.equal(routesWithFinalCta, 11);
});

test('preserva fatos oficiais e bloqueia prova social ou acreditação inventada', () => {
  const combined = routes.map(read).join('\n');
  assert.match(combined, /5511991192482/);
  assert.match(combined, /calibracao@instrumentech\.com\.br/);
  assert.match(combined, /Brasópolis, 24a/);
  assert.match(combined, /rastre[aá]veis? à RBC/i);
  assert.doesNotMatch(combined, /Dr\. Ricardo Almeida|Hospital Santa Clara|Maria Santos/i);
  assert.doesNotMatch(combined, /Instrumentech (?:é|como) (?:um )?laboratório acreditado/i);
  assert.doesNotMatch(combined, /clientes satisfeitos|100% de satisfação/i);
});

test('cada página entrega SEO técnico sem representar o protótipo como publicação oficial', () => {
  for (const route of routes) {
    const html = read(route);
    assert.equal((html.match(/<h1[\s>]/gi) || []).length, 1, `${route} deve ter um H1`);
    assert.match(html, /<title>[^<]+<\/title>/i);
    assert.match(html, /<meta[^>]+name=["']description["'][^>]+content=/i);
    assert.match(html, /<meta[^>]+name=["']robots["'][^>]+noindex,nofollow/i);
    assert.match(html, /<meta[^>]+property=["']og:title["']/i);
    assert.match(html, /<link[^>]+rel=["']canonical["']/i);
    assert.match(html, /application\/ld\+json/i);
    assert.match(html, /projeto demonstrativo/i);
    assert.match(html, /não é o site oficial/i);
  }
});

test('mantém acessibilidade, conversão e comportamento progressivo', () => {
  const home = read('index.html');
  const contact = read('contato.html');
  const script = read('assets/site.js');
  const css = read('assets/styles.css');
  assert.match(home, /class=["']skip-link["']/i);
  assert.match(home, /aria-label=/i);
  assert.match(contact, /<label[^>]+for=/i);
  assert.match(contact, /<form[^>]+data-quote-form/i);
  assert.match(script, /matchMedia\(['"]\(min-width: 1024px\)['"]\)/);
  assert.match(script, /encodeURIComponent/);
  assert.match(script, /aria-expanded/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /overflow-x:\s*(?:clip|hidden)/);
});

test('aplica os tokens e breakpoints aprovados sem visual genérico', () => {
  const css = read('assets/styles.css');
  for (const token of [
    '--color-navy-950: #071827',
    '--color-navy-900: #0b2239',
    '--color-yellow-500: #f4c21b',
    '--color-offwhite: #f7f8f6',
    '--container-default: 1280px',
    '--radius-md: 8px',
  ]) {
    assert.match(css.toLowerCase(), new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(css, /@media\s*\(max-width:\s*1023px\)/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
  assert.doesNotMatch(css, /border-radius:\s*(?:999|9999)px/g);
  assert.doesNotMatch(css, /\.hero-copy::before/, 'hero não deve renderizar círculo decorativo');
});

test('centraliza conteúdo administrável e não contém mojibake', () => {
  const content = read('content/site-content.json');
  const data = JSON.parse(content);
  assert.equal(data.services.length, 8);
  assert.equal(data.contact.whatsapp, '5511991192482');
  assert.equal(data.company.since, '2008');
  const combined = [content, ...routes.filter((route) => existsSync(join(root, route))).map(read)].join(
    '\n',
  );
  assert.doesNotMatch(combined, /Ã[£©§µ¡³ªº]|â€|ðŸ|ï¸|�/);
});

test('robots e sitemap mantêm o preview fora do índice', () => {
  assert.match(read('robots.txt'), /User-agent:\s*\*/i);
  assert.match(read('robots.txt'), /Disallow:\s*\//i);
  const sitemap = read('sitemap.xml');
  assert.match(sitemap, /calibracao-pressao\.html/);
  assert.match(sitemap, /contato\.html/);
});

test('usa ícones técnicos, marca sem distorção e motion reversível acessível', () => {
  const home = read('index.html');
  const css = read('assets/styles.css');
  const script = read('assets/site.js');

  assert.equal((home.match(/class="calibration-icon/g) || []).length, 3);
  assert.match(home, /data-calibration-icon="pressure"/);
  assert.match(home, /data-calibration-icon="temperature"/);
  assert.match(home, /data-calibration-icon="flow"/);
  assert.match(home, /class="footer-brand"/);
  assert.match(css, /\.footer-brand\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(css, /\.footer-logo\s*\{[^}]*height:\s*75px/s);
  assert.match(script, /classList\.toggle\(['"]is-visible['"],\s*entry\.isIntersecting\)/);
  assert.match(script, /scrollIntoView\(\{\s*behavior:/);
  assert.match(script, /prefers-reduced-motion:\s*reduce/);
});

test('finaliza heros internas sem foto e com contraste sobre degradê', () => {
  const css = read('assets/styles.css');

  for (const route of routes.filter((route) => route !== 'index.html')) {
    const html = read(route);
    const hero = html.match(/<section class="[^"]*\binternal-hero\b[^"]*">[\s\S]*?<\/section>/)?.[0] || '';
    assert.ok(hero, `${route} deve conter a hero interna`);
    assert.doesNotMatch(hero, /<img\b/i, `${route} não deve usar foto na hero`);
  }

  assert.match(css, /\.internal-hero\s*\{[^}]*background:\s*(?:radial-gradient|linear-gradient)/s);
  assert.match(css, /\.internal-hero \.technical-label[^}]*color:\s*var\(--color-yellow-500\)/s);
  assert.match(css, /\.nr13-panel \.technical-label[^}]*color:\s*var\(--color-yellow-500\)/s);
  assert.match(css, /\.in-loco-banner \.technical-label[^}]*color:\s*var\(--color-yellow-500\)/s);
  assert.match(css, /\.breadcrumb\s*\{[^}]*color:\s*#fff/s);
  assert.match(css, /\.internal-hero \.lead\s*\{[^}]*color:\s*#e[0-9a-f]{5}/is);
});

test('usa hero branca apenas em Contato para contrastar com a seção navy seguinte', () => {
  const contact = read('contato.html');
  const css = read('assets/styles.css');

  assert.match(contact, /<section class="internal-hero internal-hero--light">/);
  for (const route of routes.filter((route) => route !== 'index.html' && route !== 'contato.html')) {
    assert.doesNotMatch(read(route), /internal-hero--light/, `${route} deve preservar a hero navy`);
  }

  assert.match(css, /\.internal-hero--light\s*\{[^}]*background:\s*#fff[^}]*color:\s*var\(--color-navy-950\)/s);
  assert.match(css, /\.internal-hero--light \.lead\s*\{[^}]*color:\s*var\(--color-gray-600\)/s);
  assert.match(css, /\.internal-hero--light \.technical-label\s*\{[^}]*color:\s*var\(--color-navy-700\)/s);
  assert.match(css, /\.internal-hero--light \.breadcrumb\s*\{[^}]*color:\s*var\(--color-navy-900\)/s);
});

test('transforma chamadas de soluções e laboratórios em botões navegáveis', () => {
  const home = read('index.html');
  const solutions = home.match(/<section class="section section--navy" id="solucoes">[\s\S]*?<\/section>/)?.[0] || '';
  const laboratories = home.match(/<section class="section section--gray" id="laboratorios">[\s\S]*?<\/section>/)?.[0] || '';

  assert.equal((home.match(/class="btn btn--card"[^>]*>Saiba mais<\/a>/g) || []).length, 8);
  assert.doesNotMatch(solutions, /<img\b/i);
  assert.equal((solutions.match(/data-service-icon=/g) || []).length, 0);
  assert.match(
    home,
    /class="btn btn--card" href="servicos\/laboratorio-analitico\.html">Laboratório analítico<\/a>/,
  );
  assert.match(home, /href="servicos\/laboratorio-biomedico\.html"/);
  assert.match(home, /href="servicos\/assistencia-tecnica\.html"/);
  assert.doesNotMatch(laboratories, /<img\b/i);
  assert.equal((laboratories.match(/data-service-icon=/g) || []).length, 0);
});

test('apresenta Laboratórios como composição editorial aberta', () => {
  const css = read('assets/styles.css');
  const gridRule = css.match(/\.lab-grid\s*\{[^}]*\}/s)?.[0] || '';
  const itemRule = css.match(/\.lab-feature,\s*\.lab-side\s*\{[^}]*\}/s)?.[0] || '';

  assert.match(gridRule, /grid-template-columns:\s*repeat\(3,\s*1fr\)/);
  assert.match(itemRule, /background:\s*transparent/);
  assert.match(itemRule, /border:\s*0/);
  assert.doesNotMatch(itemRule, /gradient|border-radius|box-shadow/i);
});

test('apresenta Soluções como painéis editoriais planos e sem textura decorativa', () => {
  const css = read('assets/styles.css');
  const cardRule = css.match(/\.solution-card\s*\{[^}]*\}/s)?.[0] || '';

  assert.match(cardRule, /background:\s*var\(--color-navy-900\)/);
  assert.doesNotMatch(cardRule, /gradient/i);
  assert.doesNotMatch(css, /\.solution-card::after/);
});

test('separa contato com linha fina e apresenta NR-13 sobre degradê claro', () => {
  const css = read('assets/styles.css');

  assert.match(css, /\.home-contact\s*\{[^}]*border-block:\s*1px\s+solid/s);
  assert.match(css, /#nr13\s*\{[^}]*background:\s*(?:radial-gradient|linear-gradient)/s);
});

test('usa fundo azul-escuro na seção de serviço em campo', () => {
  const home = read('index.html');

  assert.match(home, /<section class="section section--navy" id="in-loco">/);
});

test('reorganiza formulário, setores e preparação da demanda sem fotos', () => {
  const home = read('index.html');
  const contact = read('contato.html');
  const solutionsPosition = home.indexOf('id="solucoes"');
  const nr13Position = home.indexOf('id="nr13"');
  const formPosition = home.indexOf('id="contato"');
  const calibrationPosition = home.indexOf('id="calibracao"');
  const sectors = home.match(/<section class="section" id="segmentos">[\s\S]*?<\/section>/)?.[0] || '';
  const preparation = contact.match(/<section class="section section--white request-prep">[\s\S]*?<\/section>/)?.[0] || '';

  assert.ok(
    solutionsPosition < formPosition && formPosition < nr13Position && nr13Position < calibrationPosition,
  );
  for (const [index, label] of [
    ['03', 'Contato técnico'],
    ['04', 'Inspeção e integridade'],
    ['05', 'Grandezas essenciais'],
    ['06', 'Ambientes de precisão'],
    ['07', 'Serviço em campo'],
    ['08', 'Setores atendidos'],
    ['09', 'Qualidade e rastreabilidade'],
    ['10', 'Processo de atendimento'],
    ['11', 'Parceria técnica'],
    ['12', 'Clientes e cases'],
  ]) {
    assert.match(home, new RegExp(`section-index">${index}<\\/span>${label}`));
  }
  assert.match(sectors, /class="[^"]*\bsector-text-layout\b[^"]*"/);
  assert.doesNotMatch(sectors, /<img\b|data-sector-(?:image|button|label)/i);
  assert.match(preparation, /class="[^"]*\brequest-prep-grid\b[^"]*"/);
  assert.doesNotMatch(preparation, /<img\b/i);
});

test('aplica motion reversível também às listas textuais reorganizadas', () => {
  const script = read('assets/site.js');
  const css = read('assets/styles.css');

  assert.match(script, /'\.section \.precision-list > li'/);
  assert.match(script, /'\.section \.sector-list > li'/);
  assert.match(script, /'\.internal-hero \.breadcrumb'/);
  assert.match(script, /'\.section label'/);
  assert.match(script, /'\.section figcaption'/);
  assert.match(script, /classList\.toggle\(['"]is-visible['"],\s*entry\.isIntersecting\)/);
  assert.match(
    script,
    /classList\.toggle\(\s*['"]is-past['"],\s*!entry\.isIntersecting\s*&&\s*entry\.boundingClientRect\.top\s*<\s*0,?\s*\)/,
  );
  assert.match(css, /\.js \.reveal\.is-past\s*\{[^}]*opacity:\s*0[^}]*translateY\(-18px\)/s);
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.js \.reveal\.is-past[\s\S]*transform:\s*none/,
  );
});
