import * as fs from 'fs';
import * as path from 'path';
import {Page} from 'puppeteer-core';
import {
    toggleElementVisibility,
    createDirectoryIfItDoesNotExist, extractCSS,
    removeJavascriptFromHTML,
    SNAPSHOTS_DIRECTORY
} from "@app/utils";



const _takeSnapshot = async (
    page: Page,
    removeJS: boolean,
    htmlDirWithJS: string,
    htmlDirWithoutJS: string,
    tsStoriesDir: string,
    data: any = {}) => {
    await toggleElementVisibility(page, 'snapshotBtn');
    const cssData = await extractCSS(page);
    for (let i = 0; i < cssData.length; i++) {
        const {content, name} = cssData[i];
        try {
            // fs.writeFileSync(`${styleDir}/${name}.css`, content);
            await page.addStyleTag({
                content,
                // path: `/snapshots/${website}/style/${name}.css`
            })
        } catch (e) {
            console.error('Error [html.ts]: ', e);
        }
    }
    const html = await page.content();
    await toggleElementVisibility(page, 'snapshotBtn');
    let content: string = html;
    const filename = new Date().toISOString().replace(/:/g, '$').replace(/\./g, '_');
    fs.writeFileSync(path.join(htmlDirWithJS, `${filename}.html`), content)
    if (removeJS) {
        content = removeJavascriptFromHTML(html) || content;
        content = '<!DOCTYPE html><html dir="ltr" lang="en-US">' + content;
        fs.writeFileSync(path.join(htmlDirWithoutJS, `${filename}.html`), content)
    }
    const jsContent = `
        export const getTemplate = () => {
            return \`${content}\`
        }`;
    fs.writeFileSync(path.join(tsStoriesDir, `${filename}.js`), jsContent);
    console.log(`Hi nerd dev you can get the template if you use the following file
        \n\n=======================================================================================\n
        File Name: ${`${filename}.js`}
        \n\n=======================================================================================\n`);
};
export const run = async (page: Page, siteUrl: string, website: string, removeJS: boolean = false, headless = false): Promise<void> => {
    // Create site page screenshot
    // const requestSharePoint = siteUrl.split("/")[siteUrl.split("/").length - 1].replace(/(:|\.)/g, '_');
    const dir = `${SNAPSHOTS_DIRECTORY}/${website}`;

    const htmlDirWithJS = `${dir}/html/js`;
    const htmlDirWithoutJS = `${dir}/html/no-js`;
    const jsTemplateDirectory = `${dir}/js-stories`;

    // Creating directories
    createDirectoryIfItDoesNotExist(dir);
    createDirectoryIfItDoesNotExist(htmlDirWithJS);
    createDirectoryIfItDoesNotExist(htmlDirWithoutJS);
    createDirectoryIfItDoesNotExist(jsTemplateDirectory);


    if (!headless) {
        await page.exposeFunction('captureSnapshot', async (data: any = {}) => {
            await _takeSnapshot(page, removeJS, htmlDirWithJS, htmlDirWithoutJS, jsTemplateDirectory, data);
        });

        await page.evaluate(() => {
            window.addEventListener('takeSnapshot', (eve) => {
                try {
                    (window as any).captureSnapshot({});

                } catch (e) {
                    console.log('e [html.ts::window.addEventListener(takeSnapshot)]: ', e);
                }
            });
        });

        await page.addScriptTag({
            content: `
                function foo() {
                  // Create the event.
                  const event = new Event('takeSnapshot');
                  // target can be any Element or other EventTarget.
                  window.dispatchEvent(event);
                }
        `,
            type: 'text/javascript'
        });

        const threeDBtnStylesheet = ` 
            .snapshotBtn {
                border: 0;
                position: absolute;
                top: 0;
                right: 0;
                z-index: 5000000000; 
            }
            .btn-3d {
                display: inline-block;
                font-size: 22px;
                padding: 20px 60px;
                color: white;
                margin: 20px 10px 10px;
                border-radius: 6px;
                text-align: center;
                transition: top .01s linear;
                text-shadow: 0 1px 0 rgba(0,0,0,0.15);
            }
            .btn-3d.red:hover    {background-color: #e74c3c;}
            .btn-3d:active {
                top: 9px;
            }
            
            /* 3D button colors */
            .btn-3d.red {
                background-color: #e74c3c;
                box-shadow: 0 0 0 1px #c63702 inset,
                0 0 0 2px rgba(255,255,255,0.15) inset,
                0 8px 0 0 #C24032,
                0 8px 0 1px rgba(0,0,0,0.4),
                0 8px 8px 1px rgba(0,0,0,0.5);
            }
            .btn-3d.red:active {
                box-shadow: 0 0 0 1px #c63702 inset,
                0 0 0 2px rgba(255,255,255,0.15) inset,
                0 0 0 1px rgba(0,0,0,0.4);
            }
        `;
        await page.addStyleTag({
            content: threeDBtnStylesheet
        })
        await page.evaluate(() => {
            const body = document.getElementsByTagName('body')[0];
            const btn = document.createElement('button');
            btn.id = 'snapshotBtn';
            btn.setAttribute('onclick', 'foo()');
            btn.innerText = 'Capture';
            btn.classList.add('btn-3d', 'red', 'snapshotBtn');
            // btn.style.cssText = 'position: absolute; color: white; text-align: center; right: 0; width: 60px; height: 60px; z-index: 5000000000; top: 0; background-color: #0C9;border-radius:50px;';
            body.appendChild(btn);
        })
    } else {
        await _takeSnapshot(page, removeJS, htmlDirWithJS, htmlDirWithoutJS, jsTemplateDirectory);
    }


};
