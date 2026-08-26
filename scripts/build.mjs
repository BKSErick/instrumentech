import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = join(currentDir, '..');
const content = JSON.parse(await readFile(join(root, 'content', 'site-content.json'), 'utf8'));
const { company, contact, sectors, services } = content;

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const href = (prefix, path) => `${prefix}${path}`;
const asset = (prefix, name) => href(prefix, `assets/${name}`);
const quoteUrl =
  'https://wa.me/5511991192482?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20a%20Instrumentech%20sobre%20uma%20necessidade%20de%20instrumenta%C3%A7%C3%A3o%20ou%20calibra%C3%A7%C3%A3o.';

function head({ title, description, route, prefix, image = 'hero-lab-BjMzPP3y.jpg', schema }) {
  const canonical = `https://instrumentech-prototype.local/${route}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': schema?.type || 'Organization',
    name: schema?.name || company.name,
    description,
    url: canonical,
    telephone: contact.whatsappDisplay,
    email: contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'R. Brasópolis, 24a — Jardim Jaú (Zona Leste)',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
    ...(schema?.serviceType ? { serviceType: schema.serviceType, provider: { '@type': 'Organization', name: company.name } } : {}),
  };

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="noindex,nofollow">
  <meta name="theme-color" content="#071827">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${asset(prefix, image)}">
  <link rel="canonical" href="${canonical}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${asset(prefix, 'styles.css')}">
  <link rel="icon" href="${asset(prefix, 'logo-instrumentech-DrWfFJAZ.png')}">
  <title>${escapeHtml(title)}</title>
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
  <script>document.documentElement.classList.add('js')</script>
</head>`;
}

function header(prefix, current = '') {
  const nav = [
    ['Início', 'index.html', 'inicio'],
    ['Empresa', 'empresa.html', 'empresa'],
    ['Soluções', 'index.html#solucoes', 'solucoes'],
    ['Qualidade', 'qualidade.html', 'qualidade'],
    ['Contato', 'contato.html', 'contato'],
  ];
  return `<body>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <div class="demo-bar">PROJETO DEMONSTRATIVO · ESTA APRESENTAÇÃO NÃO É O SITE OFICIAL DA INSTRUMENTECH</div>
  <header class="site-header" data-site-header>
    <div class="container-wide nav-shell">
      <a class="brand-logo" href="${href(prefix, 'index.html')}" aria-label="Instrumentech — início">
        <img src="${asset(prefix, 'logo-instrumentech-white-CO-uVe72.png')}" width="838" height="266" alt="Instrumentech — Automation Process Instruments">
      </a>
      <button class="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="navegacao" data-menu-toggle>☰</button>
      <nav class="nav-links" id="navegacao" aria-label="Navegação principal" data-navigation>
        ${nav
          .map(
            ([label, path, key]) =>
              `<a href="${href(prefix, path)}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`
          )
          .join('')}
      </nav>
      <div class="nav-actions"><a class="btn btn--primary" href="${quoteUrl}" target="_blank" rel="noopener">Solicitar cotação</a></div>
    </div>
  </header>`;
}

function footer(prefix) {
  return `<footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a class="footer-brand" href="${href(prefix, 'index.html')}" aria-label="Instrumentech — início">
            <img class="footer-logo" src="${asset(prefix, 'logo-instrumentech-white-CO-uVe72.png')}" width="838" height="266" alt="Instrumentech — Automation Process Instruments">
          </a>
          <p class="footer-copy">Instrumentação, calibração, metrologia, manutenção e inspeção para demandas industriais e laboratoriais.</p>
        </div>
        <div>
          <p class="footer-title">Navegação</p>
          <ul class="footer-nav"><li><a href="${href(prefix, 'empresa.html')}">Empresa</a></li><li><a href="${href(prefix, 'index.html#solucoes')}">Soluções</a></li><li><a href="${href(prefix, 'qualidade.html')}">Qualidade</a></li><li><a href="${href(prefix, 'contato.html')}">Contato</a></li></ul>
        </div>
        <div>
          <p class="footer-title">Contato oficial</p>
          <ul class="footer-nav"><li><a href="${quoteUrl}" target="_blank" rel="noopener">${contact.whatsappDisplay}</a></li><li><a href="mailto:${contact.email}">${contact.email}</a></li><li>${contact.address}</li></ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="demo-disclaimer"><strong>Projeto demonstrativo.</strong> Esta proposta visual usa informações e imagens consultadas no site público da empresa e não é o site oficial da Instrumentech. Certificações, acreditações, clientes e escopos devem ser confirmados documentalmente antes de uma publicação.</p>
        <p>© ${new Date().getFullYear()} Instrumentech · Preview local</p>
      </div>
    </div>
  </footer>
  <a class="whatsapp-float" href="${quoteUrl}" target="_blank" rel="noopener" aria-label="Falar com a Instrumentech pelo WhatsApp"><span class="whatsapp-float__tooltip">Falar com a Instrumentech</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.34 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg></a>
  <script src="${asset(prefix, 'site.js')}" defer></script>
</body>
</html>`;
}

function quoteForm() {
  return `<form class="quote-form" data-quote-form>
    <div class="form-grid">
      <div class="field"><label for="nome">Nome *</label><input id="nome" name="nome" autocomplete="name" required></div>
      <div class="field"><label for="empresa-form">Empresa</label><input id="empresa-form" name="empresa" autocomplete="organization"></div>
      <div class="field"><label for="email">E-mail corporativo</label><input id="email" name="email" type="email" autocomplete="email"></div>
      <div class="field"><label for="telefone">Telefone *</label><input id="telefone" name="telefone" type="tel" autocomplete="tel" required></div>
      <div class="field"><label for="localizacao">Cidade / Estado</label><input id="localizacao" name="localizacao" autocomplete="address-level2"></div>
      <div class="field"><label for="servico">Serviço desejado</label><select id="servico" name="servico"><option value="">Quero orientação técnica</option>${services.map((service) => `<option>${escapeHtml(service.title)}</option>`).join('')}</select></div>
    </div>
    <button class="btn btn--primary" type="submit">Preparar solicitação</button>
    <p class="form-status" data-form-status aria-live="polite">Ao continuar, a mensagem será preparada no WhatsApp oficial.</p>
  </form>`;
}

const sectionLabel = (text, index) =>
  `<p class="technical-label">${index ? `<span class="section-index">${index}</span>` : ''}${escapeHtml(text)}</p>`;

function calibrationIcon(type) {
  const icons = {
    pressure: `<svg viewBox="0 0 48 48" focusable="false"><path d="M8 35a16 16 0 0 1 32 0"/><path d="m24 35 10-11"/><path d="M12 28l-3-2M18 21l-1-3M30 21l1-3M36 28l3-2"/><circle cx="24" cy="35" r="2"/></svg>`,
    temperature: `<svg viewBox="0 0 48 48" focusable="false"><path d="M20 30.5V12a4 4 0 0 1 8 0v18.5a8 8 0 1 1-8 0Z"/><path d="M24 17v17"/><circle cx="24" cy="36" r="3"/></svg>`,
    flow: `<svg viewBox="0 0 48 48" focusable="false"><path d="M7 14h34M7 34h34M10 14v20M38 14v20"/><path d="M15 24h17m-6-6 6 6-6 6"/></svg>`,
  };

  return `<span class="calibration-icon" data-calibration-icon="${type}" aria-hidden="true">${icons[type]}</span>`;
}

function homePage() {
  return `${head({
    title: 'Instrumentech | Instrumentação, calibração e metrologia industrial',
    description: company.description,
    route: '',
    prefix: './',
  })}
${header('./', 'inicio')}
<main id="conteudo">
  <section class="hero" id="inicio">
    <div class="hero-grid">
      <div class="hero-copy">
        ${sectionLabel('Instrumentação · Calibração · Metrologia')}
        <h1 class="hero-title" aria-label="${escapeHtml(company.headline)}">${company.headlineLines
          .map((line) => `<span>${escapeHtml(line)}</span>`)
          .join('')}</h1>
        <p class="lead">${company.description}</p>
        <div class="hero-actions"><a class="btn btn--primary" href="${quoteUrl}" target="_blank" rel="noopener">Solicitar cotação</a><a class="btn btn--secondary" href="#solucoes">Conhecer soluções</a></div>
        <p class="hero-proof">Desde ${company.since} no mercado de instrumentação</p>
      </div>
      <div class="hero-media">
        <img src="${asset('./', 'instrumentech-hero-home.webp')}" width="1717" height="916" alt="Técnico realizando medição em instrumentação de processo industrial">
        <div class="hero-readout"><small>Leitura operacional</small><strong>Precisão · Segurança</strong></div>
      </div>
    </div>
  </section>

  <div class="trust-strip"><div class="container trust-grid"><div class="metric"><small>Experiência</small><strong>Desde 2008</strong></div><div class="metric"><small>Modalidade</small><strong>Atendimento in loco</strong></div><div class="metric"><small>Metrologia</small><strong>Padrões rastreáveis à RBC</strong></div><div class="metric"><small>Operação</small><strong>Atendimento nacional</strong></div></div></div>

  <section class="section" id="posicionamento"><div class="container editorial-split"><div class="reveal">${sectionLabel('Engenharia de medição', '01')}<h2>Engenharia, precisão e confiabilidade em cada medição.</h2><p class="lead">A Instrumentech reúne serviços de calibração, manutenção, inspeção, metrologia e instrumentação para indústrias e laboratórios.</p><ul class="precision-list"><li>Escopo técnico alinhado à aplicação e à faixa do instrumento.</li><li>Atendimento em laboratório ou nas instalações do cliente.</li><li>Documentação e rastreabilidade tratadas conforme o serviço contratado.</li></ul></div><figure class="editorial-media reveal"><img src="${asset('./', 'instrumentech-engenharia-medicao.webp')}" width="1536" height="1024" loading="lazy" alt="Bancada de calibração com transmissor, manômetro e calibrador de processo"><figcaption>REFERÊNCIA VISUAL · INSTRUMENTAÇÃO DE PRESSÃO</figcaption></figure></div></section>

  <section class="section section--navy" id="solucoes"><div class="container-wide"><div class="solutions-heading"><div>${sectionLabel('Portfólio técnico', '02')}<h2>Soluções para cada etapa da sua operação.</h2></div><p class="lead">Oito frentes conectadas por um mesmo princípio: medir, verificar e intervir com critério técnico.</p></div><div class="solution-mosaic">${services
    .map(
      (service) => `<article class="solution-card reveal"><div class="solution-content"><span class="section-index">${service.index}</span><h3>${escapeHtml(service.title)}</h3><p>${escapeHtml(service.summary)}</p><a class="btn btn--card" href="servicos/${service.slug}.html">Saiba mais</a></div></article>`
    )
    .join('')}</div></div></section>

  <section class="section section--navy home-contact" id="contato"><div class="container contact-grid"><div>${sectionLabel('Contato técnico', '03')}<h2>Como podemos ajudar sua operação?</h2><p class="lead">Compartilhe os dados iniciais. A mensagem será organizada e enviada ao WhatsApp oficial.</p><ul class="contact-list"><li><small>WhatsApp</small><a href="${quoteUrl}" target="_blank" rel="noopener">${contact.whatsappDisplay}</a></li><li><small>E-mail</small><a href="mailto:${contact.email}">${contact.email}</a></li><li><small>Endereço</small><a href="${contact.map}" target="_blank" rel="noopener">${contact.address}</a></li></ul></div>${quoteForm()}</div></section>

  <section class="section section--white" id="nr13"><div class="container-wide nr13-panel"><div class="nr13-copy">${sectionLabel('Inspeção e integridade', '04')}<h2>NR-13: segurança que começa antes da operação.</h2><p class="lead">Inspeções, testes, manutenção, recuperação e documentação técnica para vasos de pressão e caldeiras.</p><ul class="precision-list"><li>Escopo definido conforme equipamento e histórico.</li><li>Responsabilidades e documentos alinhados antes da execução.</li><li>Serviços de engenharia relacionados ao escopo da inspeção.</li></ul><p><a class="btn btn--primary" href="servicos/inspecao-nr13.html">Conhecer soluções NR-13</a></p></div><div class="nr13-media"><img src="${asset('./', 'instrumentech-inspecao-integridade.webp')}" width="1536" height="1024" loading="lazy" alt="Manômetros instalados em conjunto de válvulas e tubulações industriais"></div></div></section>

  <section class="section section--navy" id="calibracao"><div class="container">${sectionLabel('Grandezas essenciais', '05')}<h2>Calibração com precisão, rastreabilidade e confiança.</h2><p class="lead">Pressão, temperatura e vazão organizadas como disciplinas técnicas próprias, com análise de instrumento, faixa e aplicação.</p><div class="calibration-grid"><article class="calibration-item">${calibrationIcon('pressure')}<span class="section-index">P / PRESSÃO</span><h3>Pressão</h3><p>Manômetros, vacuômetros, transmissores, pressostatos e válvulas relacionadas.</p><a class="text-link" href="servicos/calibracao-pressao.html">Explorar pressão</a></article><article class="calibration-item">${calibrationIcon('temperature')}<span class="section-index">T / TEMPERATURA</span><h3>Temperatura</h3><p>Termômetros, sensores, transmissores, indicadores e controladores.</p><a class="text-link" href="servicos/calibracao-temperatura.html">Explorar temperatura</a></article><article class="calibration-item">${calibrationIcon('flow')}<span class="section-index">V / VAZÃO</span><h3>Vazão</h3><p>Medidores e sistemas de medição, inclusive em campo.</p><a class="text-link" href="servicos/calibracao-vazao.html">Explorar vazão</a></article></div></div></section>

  <section class="section section--gray" id="laboratorios"><div class="container">${sectionLabel('Ambientes de precisão', '06')}<h2>Precisão também dentro do laboratório.</h2><div class="lab-grid"><article class="lab-feature reveal"><div class="lab-content"><span class="section-index">LAB / ANALÍTICO</span><h3>Instrumentos que sustentam a rotina de análise.</h3><p>pH-metros, condutivímetros, pipetas, balanças, vidrarias e analisadores.</p><a class="btn btn--card" href="servicos/laboratorio-analitico.html">Laboratório analítico</a></div></article><article class="lab-side reveal"><div class="lab-content"><span class="section-index">LAB / BIOMÉDICO</span><h3>Assistência para equipamentos biomédicos.</h3><p>Preventiva, corretiva, diagnóstico e testes em equipamentos de análise clínica e laboratório.</p><a class="btn btn--card" href="servicos/laboratorio-biomedico.html">Conhecer serviço</a></div></article><article class="lab-side reveal"><div class="lab-content"><span class="section-index">SUPORTE TÉCNICO</span><h3>Diagnóstico orientado pelo equipamento.</h3><p>Marca, modelo, sintoma e aplicação iniciam a análise técnica.</p><a class="btn btn--card" href="servicos/assistencia-tecnica.html">Assistência técnica</a></div></article></div></div></section>

  <section class="section section--navy" id="in-loco"><div class="container-wide in-loco-banner"><img src="${asset('./', 'instrumentech-servico-campo.webp')}" width="1672" height="940" loading="lazy" alt="Manômetro e válvula instalados em tubulação de processo industrial"><div class="in-loco-copy">${sectionLabel('Serviço em campo', '07')}<h2>A precisão vai até a sua operação.</h2><p class="lead">Serviços nas instalações do cliente reduzem movimentações e interferências no processo. Acesso, segurança e janela operacional entram no planejamento da visita.</p><p><a class="btn btn--primary" href="servicos/atendimento-in-loco.html">Solicitar atendimento</a></p></div></div></section>

  <section class="section" id="segmentos"><div class="container sector-text-layout"><div>${sectionLabel('Setores atendidos', '08')}<h2>Experiência aplicada aos diferentes desafios da indústria.</h2><p class="lead">A demanda muda por setor. O rigor da medição, da manutenção e da documentação permanece.</p></div><ul class="sector-list">${sectors
    .map((sector) => `<li><span class="sector-name">${escapeHtml(sector)}</span></li>`)
    .join('')}</ul></div></section>

  <section class="section section--gray" id="qualidade"><div class="container quality-layout"><div>${sectionLabel('Qualidade e rastreabilidade', '09')}<h2>Sua medição precisa sustentar uma auditoria.</h2><div class="quality-note"><strong>Padrões rastreáveis à RBC.</strong><p>Os padrões usados nos serviços da Instrumentech são calibrados por órgãos ou laboratórios credenciados à RBC. Cada serviço define, na proposta, qual documento acompanha a entrega.</p></div></div><ul class="quality-list"><li><code>RBC</code><div><h3>Rastreabilidade metrológica</h3><p>Liga a sua medição a referências reconhecidas por uma cadeia documentada.</p></div></li><li><code>ESCOPO</code><div><h3>O que o serviço cobre</h3><p>Método, pontos, faixa e local de execução ficam definidos antes da execução, não depois.</p></div></li><li><code>DOC</code><div><h3>Documento de entrega</h3><p>Certificados e procedimentos são disponibilizados conforme o escopo contratado.</p></div></li></ul><p><a class="text-link" href="qualidade.html">Entender a rastreabilidade</a></p></div></section>

  <section class="section section--navy" id="processo"><div class="container">${sectionLabel('Processo de atendimento', '10')}<h2>Uma linha clara da demanda à entrega.</h2><div class="process-line">${[
    ['01', 'Demanda', 'Equipamento ou necessidade apresentados pelo cliente.'],
    ['02', 'Análise técnica', 'Requisitos, processo e escopo são identificados.'],
    ['03', 'Execução', 'Serviço realizado em laboratório ou em campo.'],
    ['04', 'Validação', 'Testes, conferências e documentação aplicável.'],
    ['05', 'Entrega', 'Equipamento e documentos disponibilizados ao cliente.'],
  ]
    .map(([index, title, text]) => `<article class="process-step"><span class="section-index">${index}</span><h3>${title}</h3><p>${text}</p></article>`)
    .join('')}</div></div></section>

  <section class="section" id="diferenciais"><div class="container differential-grid"><div>${sectionLabel('Parceria técnica', '11')}<h2>Operações críticas precisam de parceiros tecnicamente confiáveis.</h2><p class="lead">A proposta de valor não está em promessas genéricas, mas em combinar experiência, suporte e critério de medição.</p><figure class="editorial-media"><img src="${asset('./', 'instrumentech-parceria-tecnica.webp')}" width="1536" height="1024" loading="lazy" alt="Conjunto de manômetros em bancada de instrumentação"><figcaption>REFERÊNCIA VISUAL · CONTROLE DE PRESSÃO</figcaption></figure></div><div class="differential-metrics">${[
    ['01', 'Desde 2008', 'Experiência no mercado de instrumentação.'],
    ['02', 'Equipe técnica', 'Atendimento especializado conforme a demanda.'],
    ['03', 'In loco', 'Execução nas instalações do cliente.'],
    ['04', 'Rastreabilidade', 'Padrões rastreáveis à RBC.'],
    ['05', 'Amplitude', 'Indústria, laboratórios e equipamentos biomédicos.'],
    ['06', 'Suporte', 'Preventiva, corretiva, diagnóstico e ajustes.'],
  ]
    .map(([index, title, text]) => `<article class="differential-item"><span class="section-index">${index}</span><strong>${title}</strong><p>${text}</p></article>`)
    .join('')}</div></div></section>

  <section class="section section--gray" id="clientes"><div class="container client-placeholder"><div>${sectionLabel('Clientes e cases', '12')}<h2>Empresas que confiam na Instrumentech.</h2><p>Esta área está preparada para receber somente logotipos e cases autorizados pelo cliente. Nenhuma marca ou declaração foi simulada.</p></div><div class="client-grid-empty"><span>Logotipo autorizado</span><span>Logotipo autorizado</span><span>Logotipo autorizado</span><span>Case validado</span><span>Case validado</span><span>Documento aprovado</span></div></div></section>

  <section class="cta-final"><div class="cta-grid"><div class="cta-copy">${sectionLabel('Solicite uma análise', '13')}<h2>Sua operação exige precisão. Conte com quem entende dela.</h2><p class="lead">Fale com a equipe Instrumentech e encontre a solução técnica adequada para sua necessidade.</p><div class="hero-actions"><a class="btn btn--primary" href="${quoteUrl}" target="_blank" rel="noopener">Solicitar cotação</a><a class="btn btn--secondary" href="contato.html">Abrir contato</a></div></div><div class="cta-photo"><img src="${asset('./', 'instrumentech-solicite-analise.webp')}" width="1755" height="896" loading="lazy" alt="Manômetros instalados em tubulações industriais azuis"></div></div></section>
</main>
${footer('./')}`;
}

function internalHero({ prefix, title, label, description, parent = 'Início', variant = 'dark' }) {
  const className = variant === 'light' ? 'internal-hero internal-hero--light' : 'internal-hero';
  return `<section class="${className}"><div class="internal-hero-content"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="${href(prefix, 'index.html')}">${parent}</a> / ${escapeHtml(title)}</nav>${sectionLabel(label)}<h1>${escapeHtml(title)}</h1><p class="lead">${escapeHtml(description)}</p></div></section>`;
}

function companyPage() {
  const prefix = './';
  return `${head({ title: 'Empresa | Instrumentech', description: 'Conheça a trajetória, os princípios e o compromisso técnico da Instrumentech desde 2008.', route: 'empresa.html', prefix, image: 'hero-quem-somos-B90nV0Ow.jpg' })}
${header(prefix, 'empresa')}
<main id="conteudo">
  ${internalHero({ prefix, title: 'Precisão construída com experiência.', label: 'Sobre a Instrumentech', description: 'Desde 2008, instrumentação, calibração, manutenção e inspeção conectadas por um compromisso técnico comum.', image: 'hero-quem-somos-B90nV0Ow.jpg' })}
  <section class="section"><div class="container editorial-split"><div>${sectionLabel('Trajetória confirmada', '01')}<h2>Uma empresa orientada por medição, suporte e conhecimento aplicado.</h2><p class="lead">A Instrumentech atua desde 2008 com serviços para equipamentos de pressão, temperatura e outras grandezas físicas, além de frentes industriais, analíticas e biomédicas.</p><p>Cada demanda começa pelo equipamento: fabricante, modelo, faixa, condição e aplicação. É esse conjunto que define método, recursos e prazo antes de qualquer proposta.</p></div><figure class="editorial-media"><img src="${asset(prefix, 'cta-quem-somos-D16eui_c.jpg')}" width="1200" height="800" loading="lazy" alt="Instrumentos e equipamentos de precisão"><figcaption>IDENTIDADE TÉCNICA · INSTRUMENTECH</figcaption></figure></div></section>
  <section class="section section--gray"><div class="container quality-layout"><div>${sectionLabel('Evolução', '02')}<h2>Da origem à Instrumentech de hoje.</h2><p class="lead">Da entrada no mercado de instrumentação à estrutura de atendimento técnico integrado.</p></div><ol class="timeline"><li><small>2008</small><h3>Início da atuação</h3><p>Entrada no mercado de instrumentação.</p></li><li><small>EVOLUÇÃO</small><h3>Ampliação de competências</h3><p>Calibração, assistência técnica, laboratório analítico, serviços biomédicos e NR-13 formam o portfólio atual.</p></li><li><small>HOJE</small><h3>Atendimento técnico integrado</h3><p>Demandas industriais e laboratoriais organizadas por equipamento, aplicação e necessidade.</p></li></ol></div></section>
  <section class="section section--white"><div class="container editorial-split"><div>${sectionLabel('Princípios institucionais', '03')}<h2>Clareza também na forma de apresentar missão, visão e valores.</h2></div><div class="values-stack"><article class="value-row"><code>MISSÃO</code><div><h3>Apoio técnico qualificado</h3><p>Fornecer serviços e apoio a usuários de equipamentos de pressão, temperatura e outras grandezas, aplicando boas práticas profissionais e tecnologia.</p></div></article><article class="value-row"><code>VISÃO</code><div><h3>Evolução em instrumentação</h3><p>Atuar no setor industrial e analítico com instrumentos, equipamentos e padrões modernos.</p></div></article><article class="value-row"><code>VALORES</code><div><h3>Relações responsáveis</h3><p>Amor, humildade, companheirismo, transparência, comprometimento e ética.</p></div></article></div></div></section>
  <section class="cta-final"><div class="cta-grid"><div class="cta-copy">${sectionLabel('Converse com a equipe')}<h2>Uma demanda técnica começa por um bom diagnóstico.</h2><p class="lead">Envie os dados do equipamento e da aplicação.</p><p><a class="btn btn--primary" href="${quoteUrl}" target="_blank" rel="noopener">Solicitar análise</a></p></div><div class="cta-photo"><img src="${asset(prefix, 'instrumentech-solicite-analise.webp')}" width="1755" height="896" loading="lazy" alt="Manômetros instalados em tubulações industriais azuis"></div></div></section>
</main>${footer(prefix)}`;
}

function qualityPage() {
  const prefix = './';
  return `${head({ title: 'Qualidade e rastreabilidade | Instrumentech', description: 'Entenda como a Instrumentech apresenta rastreabilidade, normas de referência, certificados e acreditação sem confundir conceitos.', route: 'qualidade.html', prefix, image: 'hero-lab-pressao-CC39m4Jl.jpg' })}
${header(prefix, 'qualidade')}
<main id="conteudo">
  ${internalHero({ prefix, title: 'Qualidade comprovada por processos, padrões e rastreabilidade.', label: 'Qualidade e certificações', description: 'O que cada evidência comprova, e o que ela não comprova, para você saber exatamente qual documento pedir.', image: 'hero-lab-pressao-CC39m4Jl.jpg' })}
  <section class="section"><div class="container quality-layout"><div>${sectionLabel('Guia do comprador', '01')}<h2>Quatro conceitos que não podem ser misturados.</h2><div class="quality-note"><strong>Peça o documento, não o selo.</strong><p>Antes de fechar qualquer serviço de calibração ou inspeção, confira emissor, escopo e validade do documento que vai acompanhar a entrega.</p></div></div><ul class="quality-list"><li><code>01</code><div><h3>Padrão rastreável</h3><p>Descreve a cadeia metrológica do padrão utilizado e não acredita automaticamente o laboratório usuário.</p></div></li><li><code>02</code><div><h3>Norma de referência</h3><p>Indica requisitos usados no processo, documento ou contrato e não equivale, por si só, a certificação.</p></div></li><li><code>03</code><div><h3>Certificado</h3><p>É uma evidência específica, com emissor, escopo e validade que precisam ser conferidos.</p></div></li><li><code>04</code><div><h3>Acreditação</h3><p>Reconhecimento formal vinculado a organismo, laboratório e escopo definidos. Confira sempre o escopo acreditado: ele nem sempre cobre todo o serviço contratado.</p></div></li></ul></div></section>
  <section class="section section--gray"><div class="container editorial-split"><div>${sectionLabel('Rastreabilidade', '02')}<h2>De onde vem a confiança na medição.</h2><p class="lead">Os padrões da Instrumentech são calibrados por órgãos ou laboratórios credenciados à RBC, o que mantém a rastreabilidade metrológica da medição.</p><ul class="precision-list"><li>ISO/IEC 17025 é a referência de competência para laboratórios de calibração e ensaio.</li><li>ISO 9001 é a referência de sistema de gestão da qualidade.</li><li>ISO 10012 é a referência de sistemas de gestão de medição.</li><li>NR-13 é a norma que rege inspeção e segurança de vasos de pressão e caldeiras.</li></ul></div><figure class="editorial-media"><img src="${asset(prefix, 'hero-lab-temperatura-DfEbNMn9.jpg')}" width="745" height="1000" loading="lazy" alt="Leituras em instrumentos digitais de precisão"><figcaption>DOCUMENTAÇÃO · REFERÊNCIA · RASTREABILIDADE</figcaption></figure></div></section>
  <section class="cta-final"><div class="cta-grid"><div class="cta-copy">${sectionLabel('Documentação técnica')}<h2>Precisa confirmar um escopo ou documento?</h2><p class="lead">Solicite à equipe a evidência aplicável ao seu serviço antes da contratação.</p><p><a class="btn btn--primary" href="${quoteUrl}" target="_blank" rel="noopener">Falar com a equipe</a></p></div><div class="cta-photo"><img src="${asset(prefix, 'instrumentech-solicite-analise.webp')}" width="1755" height="896" loading="lazy" alt="Manômetros instalados em tubulações industriais azuis"></div></div></section>
</main>${footer(prefix)}`;
}

function contactPage() {
  const prefix = './';
  return `${head({ title: 'Contato e cotação | Instrumentech', description: 'Envie os dados da sua demanda de instrumentação, calibração, manutenção ou inspeção para a equipe Instrumentech.', route: 'contato.html', prefix, image: 'hero-empresa-DKx_apEK.jpg' })}
${header(prefix, 'contato')}
<main id="conteudo">
  ${internalHero({ prefix, title: 'Como podemos ajudar sua operação?', label: 'Contato e cotação', description: 'Quanto mais completo o contexto técnico, mais objetiva pode ser a análise inicial.', variant: 'light' })}
  <section class="section section--navy"><div class="container contact-grid"><div>${sectionLabel('Canais oficiais', '01')}<h2>Comece pelos dados essenciais.</h2><p class="lead">Informe equipamento, quantidade, fabricante, modelo, faixa, aplicação e local de atendimento quando disponíveis.</p><ul class="contact-list"><li><small>WhatsApp</small><a href="${quoteUrl}" target="_blank" rel="noopener">${contact.whatsappDisplay}</a></li><li><small>E-mail</small><a href="mailto:${contact.email}">${contact.email}</a></li><li><small>Localização</small><a href="${contact.map}" target="_blank" rel="noopener">${contact.address}</a></li><li><small>Instagram</small><a href="${contact.instagram}" target="_blank" rel="noopener">@instrumentech</a></li></ul></div>${quoteForm()}</div></section>
  <section class="section section--white request-prep"><div class="container request-prep-grid"><div>${sectionLabel('Preparação da demanda', '02')}<h2>Uma boa cotação começa com informação técnica.</h2></div><ul class="precision-list"><li>Liste os equipamentos e seus identificadores.</li><li>Inclua fotos de placa, conexões e condição do instrumento.</li><li>Informe se o atendimento precisa ocorrer em campo.</li><li>Registre prazo, janela operacional e documentação necessária.</li></ul></div></section>
</main>${footer(prefix)}`;
}

function servicePage(service) {
  const prefix = '../';
  const route = `servicos/${service.slug}.html`;
  const process = [
    ['01', 'Demanda', 'Dados do equipamento, aplicação, quantidade e local.'],
    ['02', 'Análise técnica', 'Compatibilidade, método, recursos e documentação.'],
    ['03', 'Proposta', 'Escopo e condições apresentados antes da execução.'],
    ['04', 'Execução e entrega', 'Serviço, validações e documentos aplicáveis.'],
  ];
  return `${head({ title: `${service.title} | Instrumentech`, description: service.summary, route, prefix, image: service.heroImage, schema: { type: 'Service', name: service.title, serviceType: service.title } })}
${header(prefix, 'solucoes')}
<main id="conteudo">
  ${internalHero({ prefix, title: service.title, label: service.label, description: service.summary, image: service.heroImage, parent: 'Soluções' })}
  <section class="section"><div class="container service-overview"><div>${sectionLabel('Visão do serviço', '01')}<h2>Escopo construído a partir da aplicação real.</h2></div><div><p class="lead">${escapeHtml(service.description)}</p><p>Fabricante, modelo, faixa, condição, quantidade, local e documentação desejada orientam a análise. A confirmação final acontece na proposta técnica e comercial.</p></div></div></section>
  <section class="section section--gray"><div class="container"><div class="section-heading-row"><div>${sectionLabel('Equipamentos atendidos', '02')}<h2>O que pode entrar na análise.</h2></div><p class="lead">Marca, modelo, faixa e capacidade são confirmados na análise técnica que antecede a proposta.</p></div><div class="service-detail-list">${service.equipment.map((item, index) => `<article><code>${String(index + 1).padStart(2, '0')}</code><h3>${escapeHtml(item)}</h3><p>Analisado por marca, modelo, faixa, condição e aplicação.</p></article>`).join('')}</div></div></section>
  <section class="section section--navy"><div class="container">${sectionLabel('Como funciona', '03')}<h2>Da solicitação à entrega.</h2><div class="process-line">${process.map(([index, title, text]) => `<article class="process-step"><span class="section-index">${index}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div></div></section>
  <section class="section section--white"><div class="container editorial-split"><div>${sectionLabel('Aplicações e segmentos', '04')}<h2>Serviço conectado ao contexto da operação.</h2><ul class="precision-list">${service.applications.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div><div><p class="technical-label">Segmentos relacionados</p><div class="service-detail-list">${sectors.slice(0, 6).map((sector, index) => `<article><code>S${index + 1}</code><h3>${escapeHtml(sector)}</h3></article>`).join('')}</div></div></div></section>
  <section class="section section--gray"><div class="container quality-layout"><div>${sectionLabel('Normas e rastreabilidade', '05')}<h2>Documento certo para a afirmação certa.</h2><div class="quality-note"><strong>Cada afirmação tem a sua evidência.</strong><p>Norma de referência, certificado e acreditação provam coisas diferentes. O documento que acompanha o seu serviço é definido no escopo, antes da execução.</p></div></div><ul class="quality-list"><li><code>RBC</code><div><h3>Padrões rastreáveis à RBC</h3><p>Os padrões utilizados são calibrados por órgãos ou laboratórios credenciados à RBC.</p></div></li><li><code>ESCOPO</code><div><h3>Condições do serviço</h3><p>Método, pontos, local, faixa e documentação definidos na proposta.</p></div></li><li><code>ENTREGA</code><div><h3>Conferência documental</h3><p>O documento aplicável acompanha o serviço e pode ser conferido na entrega.</p></div></li></ul></div></section>
  <section class="section"><div class="container service-overview"><div>${sectionLabel('Perguntas frequentes', '06')}<h2>Dúvidas antes de solicitar uma cotação.</h2></div><div class="faq-list">${service.faq.map(([question, answer], index) => `<article class="faq-item"><button class="faq-question" type="button" aria-expanded="false" aria-controls="faq-${service.slug}-${index}" data-faq-button>${escapeHtml(question)}</button><div class="faq-answer" id="faq-${service.slug}-${index}" hidden>${escapeHtml(answer)}</div></article>`).join('')}</div></div></section>
  <section class="cta-final"><div class="cta-grid"><div class="cta-copy">${sectionLabel('Solicite uma cotação')}<h2>Envie os dados da sua demanda de ${escapeHtml(service.title.toLowerCase())}.</h2><p class="lead">A equipe analisa a necessidade e orienta o próximo passo técnico.</p><p><a class="btn btn--primary" href="${quoteUrl}" target="_blank" rel="noopener">Falar com a Instrumentech</a></p></div><div class="cta-photo"><img src="${asset(prefix, 'instrumentech-solicite-analise.webp')}" width="1755" height="896" loading="lazy" alt="Manômetros instalados em tubulações industriais azuis"></div></div></section>
</main>${footer(prefix)}`;
}

const pages = [
  ['index.html', homePage()],
  ['empresa.html', companyPage()],
  ['qualidade.html', qualityPage()],
  ['contato.html', contactPage()],
  ...services.map((service) => [`servicos/${service.slug}.html`, servicePage(service)]),
];

for (const [path, html] of pages) {
  const destination = join(root, path);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html, 'utf8');
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([path]) => `  <url><loc>https://instrumentech-prototype.local/${path === 'index.html' ? '' : path}</loc></url>`).join('\n')}
</urlset>\n`;

await writeFile(join(root, 'sitemap.xml'), sitemap, 'utf8');
await writeFile(join(root, 'robots.txt'), 'User-agent: *\nDisallow: /\n', 'utf8');
console.log(`Instrumentech prototype: ${pages.length} páginas geradas.`);
