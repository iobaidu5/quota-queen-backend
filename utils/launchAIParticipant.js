const puppeteer = require('puppeteer');

async function launchAIParticipant(token, serverUrl) {
  const url = `http://localhost:8081/ai-client.html?token=${token}&url=${encodeURIComponent(serverUrl)}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--use-fake-ui-for-media-stream'],
  });

  const page = await browser.newPage();
  await page.goto(url);
  console.log('✅ AI participant launched in browser');
}

module.exports = { launchAIParticipant };
