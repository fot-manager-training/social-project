const assert = require('node:assert/strict');
module.exports = async function checkSelects(browser, baseURL) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(baseURL);
  for (const screen of ['home', 'bridge', 'plan', 'jobs', 'mentors', 'help', 'profile']) {
    await page.locator(`nav [data-page="${screen}"]`).click();
    assert.equal(await page.locator('main').evaluate(el => el.getBoundingClientRect().left), 0);
    await page.evaluate(() => window.scrollTo({ top: 450, behavior: 'instant' }));
    assert.ok(await page.locator('.global-navigation').evaluate(el => el.getBoundingClientRect().bottom <= 0));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  }
  const interest = page.getByRole('combobox', { name: 'Что тебе интересно', exact: true });
  await interest.click();
  await page.getByRole('option', { name: 'Творчество и дизайн', exact: true }).click();
  assert.equal(await page.locator('select[name=interest]').inputValue(), 'Творчество и дизайн');
  await page.getByRole('button', { name: 'Сохранить анкету', exact: true }).click();
  await page.reload();
  await page.locator('nav [data-page="profile"]').click();
  assert.equal(await page.locator('select[name=interest]').inputValue(), 'Творчество и дизайн');
  await page.getByRole('combobox', { name: 'Что тебе интересно', exact: true }).click();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('select[name=interest]').inputValue(), 'Творчество и дизайн');
  await page.locator('nav [data-page="jobs"]').click();
  const city = page.locator('#catalogue-city').locator('..').getByRole('combobox');
  await city.click();
  await page.getByRole('option', { name: 'Онлайн', exact: true }).click();
  assert.ok(await page.locator('#catalogue-list .opportunity').count() > 0);
  await city.click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.select-popup').count(), 0);
  await page.getByRole('combobox', { name: 'Демонстрационная роль' }).click();
  await page.getByRole('option', { name: 'Координатор', exact: true }).click();
  await page.locator('nav [data-page="workspace"][aria-current="page"]').waitFor();
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('combobox', { name: 'Демонстрационная роль' }).click();
    const bounds = await page.locator('.select-popup').boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  }
  await context.close();
  console.log('PASS: shared scrolling header, dropdown mouse/keyboard, saved form values, filters, staff role, popup bounds');
};
