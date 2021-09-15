import * as path from "path";
import * as puppeteer from "puppeteer";
import * as fs from "fs";
import {createDirectoryIfItDoesNotExist} from "@app/utils";

const isBase64 = (str: string) => {
  try {
    if (str.includes("base64")) return true;
    atob(str);
    return true;
  } catch (e) {
    // something failed

    // if you want to be specific and only catch the error which means
    // the base 64 was invalid, then check for 'e.code === 5'.
    // (because 'DOMException.INVALID_CHARACTER_ERR === 5')
    return false;
  }
};
export const registerPageEvents = async (page: puppeteer.Page) => {
  try {
    let paused = false;
    let pausedRequests: any = [];
    const nextRequest = () => {
      // continue the next request or "unpause"
      if (pausedRequests.length === 0) {
        paused = false;
      } else {
        // continue first request in "queue"
        // calls the request.continue function
        pausedRequests.shift()();
      }
    };

    await page.setRequestInterception(true);

    page.on("request", async (request) => {
      // if (paused) {
      //     pausedRequests.push(() => request.continue());
      //     return;
      // }
      // paused = true;
      // pause, as we are processing a request now
      // await request.continue();

      //if (request.resourceType() === "script") {
      //   console.log("aborting...");
      // request.abort();
      // } else {
      // if (paused) {
      //   pausedRequests.push(() => request.continue());
      //   return;
      // }
      // paused = true;
      //    console.log("coninue...");
      //    request.continue();
      //}
      // pause, as we are processing a request now
      await request.continue();
      // if (request.resourceType() === "script") {
      //     await request.abort();
      // } else {
      //     await request.continue();
      // }
    });

    page.on("requestfinished", async (request) => {
      const response = request.response();
      if (response) {
        // const headers = response.headers();

        const url = new URL(response.url());
        let filePath = path.resolve(`./public/static${url.pathname}`);
        const status = response.status();
        if (status >= 300 && status <= 399) {
          console.log(
            "Redirect from",
            response.url(),
            "to",
            response.headers()["location"]
          );
        } else {
          try {
            // let fileName = path.extname(url.pathname).trim();
            let fileName = response.url().split("/").pop() || "";
            if (isBase64(fileName)) {
              request.failure();
            return;
            }

            if (fileName.includes("?")) {
              fileName = fileName.substr(0, fileName.indexOf("?"));
            }
            const directory = filePath.substr(
              0,
              filePath.indexOf(fileName) - 1
            );
            if (isBase64(directory)) {
                request.failure();
                return ;
            }
            console.log({ filePath, fileName, directory });
            if (directory === "") {
              request.continue();
            }
            createDirectoryIfItDoesNotExist(directory);
            if (
              response.request().resourceType() === "image" &&
              !fileName.includes(".")
            ) {
              fileName = `${fileName}.png`;
            }
            if (fileName === "") {
              filePath = `${filePath}/index.html`;
            }

            if (fileName.includes(".")) {
              const buff = await response.buffer();
              // await fse.outputFile(filePath, buff);
              const writeStream = fs.createWriteStream(filePath);
              writeStream.write(buff);
            }
          } catch (e) {
            console.error("e: ", e);
          }
        }
        // (pausedRequests.shift())();
      }
    });
    page.on("requestfailed", nextRequest);
  } catch (e) {
    console.log("Error [Signed in page]: ", e.message || e);
  }
};
