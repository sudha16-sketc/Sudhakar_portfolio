const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function runTests() {
  const screenshotsDir = path.join(__dirname, 'test_screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Launching browser for interaction tests...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Navigating to http://127.0.0.1:3000/ ...');
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });

  // Wait for loading to finish and canvas to become visible
  await page.waitForSelector('.character-canvas-visible', { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600));

  console.log('1. Initial Load (Neutral / Center)');
  await page.screenshot({ path: path.join(screenshotsDir, '01_initial_center.jpg'), quality: 90 });

  // Get canvas bounding box and character center
  const box = await page.$eval('.character-canvas', (el) => {
    const r = el.getBoundingClientRect();
    return {
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
      cx: r.left + r.width / 2,
      cy: r.top + r.height * 0.42
    };
  });
  console.log('Character center detected at:', box.cx, box.cy);

  // Test 1: Mouse directly in deadzone (center)
  console.log('2. Testing Center Deadzone...');
  await page.mouse.move(box.cx, box.cy);
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(screenshotsDir, '02_deadzone_center.jpg'), quality: 90 });

  // Test 2: Mouse Far Right
  console.log('3. Testing Mouse Far Right...');
  await page.mouse.move(box.cx + 500, box.cy, { steps: 15 });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, '03_far_right.jpg'), quality: 90 });

  // Test 3: Mouse Down-Right
  console.log('4. Testing Mouse Down-Right...');
  await page.mouse.move(box.cx + 400, box.cy + 350, { steps: 15 });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, '04_down_right.jpg'), quality: 90 });

  // Test 4: Mouse Directly Below (Down)
  console.log('5. Testing Mouse Below (Down)...');
  await page.mouse.move(box.cx, box.cy + 450, { steps: 15 });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, '05_below_down.jpg'), quality: 90 });

  // Test 5: Mouse Down-Left
  console.log('6. Testing Mouse Down-Left...');
  await page.mouse.move(box.cx - 450, box.cy + 350, { steps: 15 });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, '06_down_left.jpg'), quality: 90 });

  // Test 6: Mouse Far Left
  console.log('7. Testing Mouse Far Left...');
  await page.mouse.move(box.cx - 550, box.cy, { steps: 15 });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, '07_far_left.jpg'), quality: 90 });

  // Test 7: Mouse Up-Left
  console.log('8. Testing Mouse Up-Left...');
  await page.mouse.move(box.cx - 400, box.cy - 300, { steps: 15 });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, '08_up_left.jpg'), quality: 90 });

  // Test 8: Mouse Directly Above (Up)
  console.log('9. Testing Mouse Above (Up)...');
  await page.mouse.move(box.cx, box.cy - 350, { steps: 15 });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, '09_above_up.jpg'), quality: 90 });

  // Test 9: Mouse Up-Right
  console.log('10. Testing Mouse Up-Right...');
  await page.mouse.move(box.cx + 400, box.cy - 300, { steps: 15 });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, '10_up_right.jpg'), quality: 90 });

  // Test 10: Rapid circular motion test
  console.log('11. Testing rapid circular motion...');
  for (let angle = 0; angle < Math.PI * 4; angle += 0.3) {
    const rx = box.cx + Math.cos(angle) * 300;
    const ry = box.cy + Math.sin(angle) * 200;
    await page.mouse.move(rx, ry);
    await new Promise((r) => setTimeout(r, 16)); // ~60fps
  }
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(screenshotsDir, '11_after_rapid_circle.jpg'), quality: 90 });

  // Test 11: Mouse Leaving Window (should smoothly return to center)
  console.log('12. Testing Mouse Leaving window...');
  await page.mouse.move(box.cx + 400, box.cy);
  await new Promise((r) => setTimeout(r, 200));
  // Trigger mouseleave
  await page.evaluate(() => {
    document.dispatchEvent(new Event('mouseleave'));
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, '12_mouse_leave_return.jpg'), quality: 90 });

  // Test 12: Mobile Viewport
  console.log('13. Testing Mobile Viewport (390x844)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, '13_mobile_viewport.jpg'), quality: 90 });

  // Test 13: Tablet Viewport
  console.log('14. Testing Tablet Viewport (768x1024)...');
  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2 });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, '14_tablet_viewport.jpg'), quality: 90 });

  console.log('All tests completed successfully!');
  await browser.close();
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
