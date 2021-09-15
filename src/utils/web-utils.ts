import {Page} from "puppeteer-core";
export const toggleElementVisibility = async (page: Page, elementId: string) => {
    await page.evaluate((elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            const visibility = element.style.visibility;
            element.style.visibility = visibility === 'hidden' ? 'visible' : 'hidden';
        } else {
            throw new Error(`No element found with id: ${elementId}`);
        }
    }, elementId)
}
export const extractCSS = async (page: Page) => {
    return await page
        .evaluate(() => {
            return Array.from<CSSStyleSheet>(document.styleSheets as any)
                .filter((styleSheet: CSSStyleSheet) => {
                    if (!styleSheet.href) {
                        return true;
                    }
                    return styleSheet.href.indexOf(window.location.origin) === 0;
                })
                .map((styleSheet: CSSStyleSheet) => {
                    const rules = Array.from(styleSheet.cssRules);
                    const cssContent = rules.map(rule => {
                        // if(rule.cssText.includes('dir')) {
                        //     console.log(rule.cssText);
                        //     return rule.cssText.toString().replace(/\[dir='ltr'\]/g, "").replace(/\[dir='rtl'\]/g, "");
                        // }

                        return rule.cssText;
                    }).join("\n");

                    return {
                        content: cssContent,
                        name: Date.now().toString(36) + Math.random().toString(36).substr(2)
                    }
                })
        });
}
