const puppeteer = require("puppeteer");

async function scrapeTrendingPairs(url) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 3000));

        const pairs = await page.evaluate(() => {
            return window.__SERVER_DATA.route.data.dexScreenerData.pairs;
        });

        await browser.close();
        return pairs;
    } catch (error) {
        if (browser) {
            await browser.close();
        }
        throw new Error(`Failed to scrape DexScreener: ${error.message}`);
    }
}

module.exports = {
    scrapeTrendingPairs
};