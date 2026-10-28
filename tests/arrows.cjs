const assert=require('node:assert/strict');
module.exports=async function checkArrows(browser,baseURL){
  const context=await browser.newContext();const page=await context.newPage();
  for(const width of[390,1440]){
    await page.setViewportSize({width,height:800});await page.goto(baseURL);
    assert.equal(await page.locator('[data-scroll-target],.scroll-cue').count(),0);
    const arrows=page.locator('.widget-swoosh');assert.equal(await arrows.count(),2);
    for(let i=0;i<2;i++){
      await arrows.nth(i).evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
      await page.waitForFunction(index=>{const el=document.querySelectorAll('.widget-swoosh')[index];return el.classList.contains('is-drawn')&&parseFloat(getComputedStyle(el.querySelector('path')).strokeDashoffset)===0&&getComputedStyle(el.closest('.feature-widget')).opacity==='1'},i);
      const visible=await arrows.nth(i).locator('path').evaluate(path=>{
        path.style.pointerEvents='stroke';
        const matrix=path.getScreenCTM(),length=path.getTotalLength();
        const points=[.15,.4,.65,.85,.95].map(f=>{
          const point=path.getPointAtLength(length*f).matrixTransform(matrix);
          return document.elementFromPoint(point.x,point.y)?.closest('.widget-swoosh')===path.closest('.widget-swoosh');
        });
        path.style.pointerEvents='';return points;
      });
      assert.ok(visible.every(Boolean),`Arrow ${i+1} is covered at ${width}px: ${visible}`);
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
  assert.equal(await page.locator('.widget-swoosh path').first().evaluate(el=>parseFloat(getComputedStyle(el).strokeDashoffset)),0);
  await context.close();console.log('PASS: both drawn arrows remain above adjacent cards on desktop/mobile, no scroll cue, reduced motion');
};
