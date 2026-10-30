module.exports = async (page, name) => {
  if (await page.locator('#menu-toggle').getAttribute('aria-expanded') === 'false') {
    await page.locator('#menu-toggle').click();
  }
  await page.locator('nav').getByRole('button', { name, exact: true }).click();
};
