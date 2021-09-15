
import * as cheerio from 'cheerio';
import * as fs from 'fs';


export const injectHTML = (html: string, selector: string, content: string) => {
    const $ = cheerio.load(html);
    const selectedDOMElement = $(selector);
    selectedDOMElement.html(selectedDOMElement.html() + content);
    return $.html();
}



export const removeJavascriptFromHTML = (html?: string, path?: string) => {
    if (!html && !path) {
        throw new Error(`No html content received`);
    }
    let contentToParse: string = html ? html : fs.readFileSync(path || '<script></script>>', {encoding: 'utf-8'});
    const $ = cheerio.load(contentToParse);
    return $('html').clone().find("script,noscript").remove().end().html();
}







//
// (() => {
//     const newContent = injectHTML(`<!doctype html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport"
//           content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
//     <meta http-equiv="X-UA-Compatible" content="ie=edge">
//     <title>Document</title>
// </head>
// <body>
//
//     <div id="unique_id"></div>
// </body>
// </html>`, `#unique_id`, 'Hi div content');
//
//
//     console.log('new content: ', newContent);
// })();
