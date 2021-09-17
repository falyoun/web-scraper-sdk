import puppeteer from 'puppeteer';
import {config} from 'dotenv';
import fs from 'fs';
import {SharePointsNames, SNAPSHOTS_DIRECTORY} from "@app/utils";
import {authPuppeteer} from "@app/authentication";
import {registerPageEvents} from "@app/scraper";
import {IArgs} from "@app/interfaces";



const takeSnapshot = async (iArgs: IArgs) => {

    const {headless, configPath, executablePath, removeJS, website} = iArgs;

    // Optional window and viewport dimensions config
    const width = 1920;
    const height = 1080;

    const browser = await puppeteer.launch({
        headless: headless ? JSON.parse(headless as any) : false,
        args: [`--window-size=${width},${height}`],
        timeout: 0,
        executablePath: executablePath || process.env.CHROMIUM_PATH
    });

    const page = await browser.newPage();
    const siteUrl = await authPuppeteer(page, website, configPath);

    await page.setViewport({width, height});

    // Register events so we can download website bundle & assets
    await registerPageEvents(page);

    // Navigating
    await page.goto(siteUrl, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 0
    }).then(
        () => {
            console.log('Went to page')
        }
    )
        .catch(e => {
            console.error('Damn error: ', e);
        });

    console.log('browser launched')
    try {
        const runScenarios = ['html'];
        for (const runPath of runScenarios) {
            try {
                console.log('running ', runPath);
                const {run} = await import(`./test-cases/${runPath}`);
                await run(page, siteUrl, website, JSON.parse(removeJS as any), JSON.parse(headless as any));
            } catch (ex: any) {
                console.log(`Error: ${ex?.message || ex}`);
            }
        }
    } catch (ex: any) {
        console.log(`Error: ${ex?.message || ex}`);
    } finally {
        // await browser.close();
    }
}

const consumeAlreadySnapshot = (website: typeof SharePointsNames[number]) => {
    const dir = `${SNAPSHOTS_DIRECTORY}/${website}/js-stories/`;
    const files = fs.readdirSync(dir);
    const sortedFiles = files.sort((a, b) => fs.statSync(dir + b).mtime.getTime() - fs.statSync(dir + a).mtime.getTime());
    const response = sortedFiles.map(file => {
        const parseFileNameToString = file.substr(0, file.indexOf(".")).replace(/\$/g, ':').replace(/_/g, '.');
        const loader = `async () => ({SharePointTemplate: await import('/${SNAPSHOTS_DIRECTORY}/${website}/js-stories/${file}')})`;
        return {
            snapshot: file,
            website,
            date: new Date(parseFileNameToString).toLocaleString(),
            loader,

        }
    })
    console.log("\n======================================================================\n\n");
    console.table(response, [
        'snapshot',
        'website',
        'date',
        'loader'
    ]);
    console.log("Usage: ")
    console.log(`
        export default {
            title: 'Example/SomeStorybook',
            loaders: [loader goes here],
        };
        export const Template = (args, {loaded}) => {
            const sharePointTemplate = loaded.SharePointTemplate.getTemplate();
            console.log('sharePointTemplate: ', sharePointTemplate);
            return sharePointTemplate;
        };`
    )
    console.log("\n======================================================================\n\n");

}

export const scrape = async (scrapeOptions: IArgs) => {
    config(); // parse local .env if any
    const {website, snapshot} = scrapeOptions;

    if (!website || SharePointsNames.indexOf(website) === -1) {
        throw new Error(`Website's ${website} is required and it should be one of the values [${SharePointsNames}]`)
    }

    console.time('Execution time');
    if (JSON.parse(snapshot as any) === true) {
        await takeSnapshot(scrapeOptions);
    } else {
        consumeAlreadySnapshot(website);
    }
    console.timeEnd('Execution time');
}
