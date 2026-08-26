/* global DOMMatrix, document, setTimeout, window */

import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const baseUrl = process.env.INSTRUMENTECH_URL || 'http://127.0.0.1:4177';
const executablePath =
  process.env.INSTRUMENTECH_BROWSER || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifacts = new URL('../.artifacts/', import.meta.url);
await mkdir(artifacts, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath });
const results = [];

for (const viewport of [
  { name: 'review-desktop', width: 1858, height: 966 },
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'content-desktop', width: 1280, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport });
  const pageErrors = [];
  const failedLocalRequests = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    if (request.url().startsWith(baseUrl)) failedLocalRequests.push(request.url());
  });
  const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * 0.8) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
  });
  const dimensions = await page.evaluate(() => {
    const title = document.querySelector('.hero h1');
    const hero = document.querySelector('.hero');
    const section = document.querySelector('.section');
    const calibrationItem = document.querySelector('.calibration-item');
    const titleStyle = title ? window.getComputedStyle(title) : null;
    const lineHeight = titleStyle ? Number.parseFloat(titleStyle.lineHeight) : 0;

    return {
      body: document.body.scrollWidth,
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
      title: document.title,
      density: {
        heroHeight: hero?.getBoundingClientRect().height ?? 0,
        titleFontSize: titleStyle ? Number.parseFloat(titleStyle.fontSize) : 0,
        titleLines: title && lineHeight ? title.getBoundingClientRect().height / lineHeight : 0,
        sectionPadding: section
          ? Number.parseFloat(window.getComputedStyle(section).paddingTop)
          : 0,
        calibrationItemHeight: calibrationItem?.getBoundingClientRect().height ?? 0,
      },
      refinement: {
        solutionButtons: document.querySelectorAll('#solucoes .btn--card').length,
        solutionImages: document.querySelectorAll('#solucoes img').length,
        solutionIcons: document.querySelectorAll('#solucoes [data-service-icon]').length,
        analyticLabButtons: document.querySelectorAll(
          '#laboratorios .btn--card[href="servicos/laboratorio-analitico.html"]',
        ).length,
        laboratoryImages: document.querySelectorAll('#laboratorios img').length,
        laboratoryIcons: document.querySelectorAll('#laboratorios [data-service-icon]').length,
        sectorImages: document.querySelectorAll('#segmentos img, #segmentos [data-sector-image]').length,
        contactFollowsSolutions:
          document.querySelector('#solucoes')?.nextElementSibling?.id === 'contato',
        nr13FollowsContact:
          document.querySelector('#contato')?.nextElementSibling?.id === 'nr13',
        contactDivider: Number.parseFloat(
          window.getComputedStyle(document.querySelector('#contato')).borderTopWidth,
        ),
        nr13Background: window.getComputedStyle(document.querySelector('#nr13')).backgroundImage,
      },
    };
  });

  if (viewport.name === 'mobile') {
    await page.locator('[data-menu-toggle]').click();
    const expanded = await page.locator('[data-menu-toggle]').getAttribute('aria-expanded');
    if (expanded !== 'true') throw new Error('Menu móvel não abriu');
    await page.keyboard.press('Escape');
  }

  await page.screenshot({
    path: fileURLToPath(new URL(`home-${viewport.name}.png`, artifacts)),
    fullPage: true,
  });
  if (viewport.name === 'review-desktop' || viewport.name === 'mobile') {
    await page.screenshot({
      path: fileURLToPath(new URL(`home-${viewport.name}-fold.png`, artifacts)),
      fullPage: false,
    });
  }
  let interaction;
  if (viewport.name === 'review-desktop') {
    const calibration = page.locator('#calibracao');
    const calibrationTitle = page.locator('#calibracao h2');
    await calibration.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const motionEntered = await calibrationTitle.evaluate((element) =>
      element.classList.contains('is-visible'),
    );
    await calibration.screenshot({
      path: fileURLToPath(new URL('section-calibration.png', artifacts)),
    });
    await calibrationTitle.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      window.scrollTo({
        top: window.scrollY + bounds.bottom - window.innerHeight * 0.11,
        behavior: 'instant',
      });
    });
    await page.waitForTimeout(700);
    const motionExitedUp = await calibrationTitle.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const transformY = style.transform === 'none' ? 0 : new DOMMatrix(style.transform).m42;
      return {
        leftViewport: bounds.bottom > 0,
        leavingUp: Number.parseFloat(style.opacity) < 1 && transformY < 0,
        state:
          !element.classList.contains('is-visible') && element.classList.contains('is-past'),
      };
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(700);
    const motionExited = !(await calibrationTitle.evaluate((element) =>
      element.classList.contains('is-visible'),
    ));
    await page.locator('a[href="#solucoes"]').click();
    await page.waitForTimeout(350);
    const smoothScrollMoved = await page.evaluate(() => window.scrollY > 100);
    for (const sectionId of ['solucoes', 'contato', 'nr13', 'laboratorios', 'segmentos']) {
      const section = page.locator(`#${sectionId}`);
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      await section.screenshot({
        path: fileURLToPath(new URL(`section-${sectionId}.png`, artifacts)),
      });
    }
    const footer = page.locator('.site-footer');
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const footerLogoRatio = await page.locator('.footer-logo').evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.width / bounds.height;
    });
    await footer.screenshot({
      path: fileURLToPath(new URL('footer.png', artifacts)),
    });
    interaction = {
      iconCount: await page.locator('[data-calibration-icon]').count(),
      motionEntered,
      motionExitedUp,
      motionExited,
      smoothScrollMoved,
      footerLogoRatio,
    };
  }
  results.push({
    viewport: viewport.name,
    status: response?.status(),
    overflow: Math.max(dimensions.body, dimensions.document) - dimensions.viewport,
    title: dimensions.title,
    density: dimensions.density,
    refinement: dimensions.refinement,
    interaction,
    pageErrors,
    failedLocalRequests,
  });
  await page.close();
}

const internalViewports = [
  { name: 'review-desktop', width: 1858, height: 966 },
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'content-desktop', width: 1280, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

for (const route of [
  { name: 'contact', path: '/contato.html' },
  { name: 'service', path: '/servicos/calibracao-pressao.html' },
]) {
  for (const viewport of internalViewports) {
    const page = await browser.newPage({ viewport });
    const pageErrors = [];
    const failedLocalRequests = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      if (request.url().startsWith(baseUrl)) failedLocalRequests.push(request.url());
    });
    const response = await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
    const check = await page.evaluate((routeName) => {
      const hero = document.querySelector('.internal-hero');
      const preparation = document.querySelector('.request-prep');
      return {
        body: document.body.scrollWidth,
        document: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
        h1: document.querySelectorAll('h1').length,
        heroImages: hero?.querySelectorAll('img').length ?? -1,
        heroBackground: hero ? window.getComputedStyle(hero).backgroundImage : '',
        heroBackgroundColor: hero ? window.getComputedStyle(hero).backgroundColor : '',
        heroColor: hero ? window.getComputedStyle(hero).color : '',
        preparationImages: routeName === 'contact' ? preparation?.querySelectorAll('img').length ?? -1 : 0,
        preparationColumns:
          routeName === 'contact' && preparation
            ? window.getComputedStyle(preparation.querySelector('.request-prep-grid')).gridTemplateColumns
            : '',
      };
    }, route.name);

    if (viewport.name === 'content-desktop' || viewport.name === 'mobile') {
      await page.screenshot({
        path: fileURLToPath(new URL(`${route.name}-${viewport.name}.png`, artifacts)),
        fullPage: false,
      });
      if (route.name === 'contact') {
        const preparation = page.locator('.request-prep');
        await preparation.scrollIntoViewIfNeeded();
        await page.waitForTimeout(700);
        await preparation.screenshot({
          path: fileURLToPath(new URL(`contact-preparation-${viewport.name}.png`, artifacts)),
        });
      }
    }

    results.push({
      viewport: `${route.name}-${viewport.name}`,
      status: response?.status(),
      overflow: Math.max(check.body, check.document) - check.viewport,
      h1: check.h1,
      heroImages: check.heroImages,
      heroBackground: check.heroBackground,
      heroBackgroundColor: check.heroBackgroundColor,
      heroColor: check.heroColor,
      preparationImages: check.preparationImages,
      preparationColumns: check.preparationColumns,
      pageErrors,
      failedLocalRequests,
    });
    await page.close();
  }
}

const reducedContext = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  reducedMotion: 'reduce',
});
const reducedPage = await reducedContext.newPage();
const reducedResponse = await reducedPage.goto(baseUrl, { waitUntil: 'networkidle' });
const reducedStyle = await reducedPage.locator('.hero-title').evaluate((element) => {
  const style = window.getComputedStyle(element);
  return { opacity: style.opacity, transform: style.transform };
});
results.push({
  viewport: 'reduced-motion',
  status: reducedResponse?.status(),
  reducedStyle,
});
await reducedContext.close();

await browser.close();
console.log(JSON.stringify(results, null, 2));

for (const result of results) {
  if (result.status !== 200) throw new Error(`HTTP inválido em ${result.viewport}`);
  if (result.overflow > 1) throw new Error(`Overflow horizontal em ${result.viewport}: ${result.overflow}px`);
  if (result.pageErrors?.length) throw new Error(`Erro de página em ${result.viewport}`);
  if (result.failedLocalRequests?.length) throw new Error(`Asset local falhou em ${result.viewport}`);
  if (result.h1 !== undefined && result.h1 !== 1) throw new Error('Página interna sem H1 único');
  if (result.refinement) {
    if (result.refinement.solutionButtons !== 8) throw new Error('CTAs de soluções incompletos');
    if (result.refinement.solutionImages !== 0 || result.refinement.solutionIcons !== 0) {
      throw new Error('Soluções ainda possui mídia ou ícones decorativos');
    }
    if (result.refinement.analyticLabButtons !== 1) throw new Error('CTA de laboratório analítico ausente');
    if (result.refinement.laboratoryImages !== 0 || result.refinement.laboratoryIcons !== 0) {
      throw new Error('Laboratórios ainda possui mídia ou ícones decorativos');
    }
    if (result.refinement.sectorImages !== 0) throw new Error('Seção de setores ainda possui mídia');
    if (!result.refinement.contactFollowsSolutions || !result.refinement.nr13FollowsContact) {
      throw new Error('Ordem Soluções → Formulário → NR-13 inválida');
    }
    if (result.refinement.contactDivider < 1 || result.refinement.contactDivider > 2) {
      throw new Error('Divisor do formulário deve ser uma linha fina');
    }
    if (!result.refinement.nr13Background.includes('gradient')) {
      throw new Error('Seção NR-13 sem degradê claro');
    }
  }
  if (result.viewport.startsWith('contact-') || result.viewport.startsWith('service-')) {
    if (result.heroImages !== 0) throw new Error(`Hero interna ainda possui foto em ${result.viewport}`);
  }
  if (result.viewport.startsWith('service-') && !result.heroBackground.includes('gradient')) {
    throw new Error(`Hero de serviço sem degradê em ${result.viewport}`);
  }
  if (result.viewport.startsWith('contact-')) {
    if (result.heroBackgroundColor !== 'rgb(255, 255, 255)') {
      throw new Error(`Hero de Contato não está branca em ${result.viewport}`);
    }
    if (result.heroColor !== 'rgb(7, 24, 39)') {
      throw new Error(`Texto da hero de Contato sem contraste navy em ${result.viewport}`);
    }
  }
  if (result.viewport.startsWith('contact-')) {
    if (result.preparationImages !== 0) throw new Error('Preparação da demanda ainda possui foto');
    const isMobile = result.viewport.endsWith('-mobile') || result.viewport.endsWith('-tablet');
    const columns = result.preparationColumns.split(' ').filter(Boolean).length;
    if (isMobile ? columns !== 1 : columns < 2) {
      throw new Error(`Layout da preparação da demanda inválido em ${result.viewport}`);
    }
  }
  if (result.viewport === 'review-desktop') {
    if (result.density.titleFontSize > 80) throw new Error('H1 desktop excede 80px');
    if (result.density.titleLines > 3.2) throw new Error('H1 desktop excede três linhas');
    if (result.density.heroHeight > 680) throw new Error('Hero desktop excede 680px');
    if (result.density.sectionPadding > 90) throw new Error('Seção desktop excede 90px de respiro');
    if (result.density.calibrationItemHeight > 280) {
      throw new Error('Cartão de calibração excede 280px');
    }
    if (result.interaction.iconCount !== 3) throw new Error('Ícones técnicos ausentes');
    if (
      !result.interaction.motionEntered ||
      !result.interaction.motionExitedUp.state ||
      !result.interaction.motionExitedUp.leftViewport ||
      !result.interaction.motionExitedUp.leavingUp ||
      !result.interaction.motionExited
    ) {
      throw new Error('Motion de entrada e saída não respondeu ao scroll');
    }
    if (!result.interaction.smoothScrollMoved) throw new Error('Scroll suave não avançou');
    if (Math.abs(result.interaction.footerLogoRatio - 838 / 266) > 0.05) {
      throw new Error('Logo do footer está distorcido');
    }
  }
  if (result.viewport === 'reduced-motion') {
    if (result.reducedStyle.opacity !== '1' || result.reducedStyle.transform !== 'none') {
      throw new Error('Reduced motion não neutralizou o reveal');
    }
  }
}
