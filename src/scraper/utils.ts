import * as puppeteer from "puppeteer";

async function scrollToBottom(page: puppeteer.Page, timeout: number, viewportN: number) {
    console.log(`scroll puppeteer page to bottom ${viewportN} times with timeout = ${timeout}`);

    await page.evaluate(async (timeout, viewportN) => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0, distance = 200, duration = 0, maxHeight = window.innerHeight * viewportN;
            const timer = setInterval(() => {
                duration += 200;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= document.body.scrollHeight || duration >= timeout || totalHeight >= maxHeight) {
                    clearInterval(timer);
                    resolve(true);
                }
            }, 200);
        });
    }, timeout, viewportN);
}

async function blockNavigation(page: puppeteer.Page, url: string) {
    console.log(`block navigation for puppeteer page from url ${url}`);

    page.on('request', req => {
        if (req.isNavigationRequest() && req.frame() === page.mainFrame() && req.url() !== url) {
            req.abort('aborted');
        } else {
            req.continue();
        }
    });
    await page.setRequestInterception(true);
}
