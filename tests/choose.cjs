module.exports = async (page, selector, name) => {
  await page.locator(selector).locator('..').getByRole('combobox').click();
  await page.getByRole('option', { name, exact: true }).click();
};
