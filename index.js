import puppeteer from "puppeteer";


import { Main } from "./Constants.js";
import { BuyRoutine } from "./ScrapeScripts/BuyScripts.js";


async function ScrapeProperties() {
    const browser = await puppeteer.launch({ headless: false });
    const context = await browser.createBrowserContext();
    const page = await context.newPage();

    await page.setUserAgent( Main.UserAgent );

    const ans = await BuyRoutine(page);

    console.log("final Answer : \n\n");
    console.log(JSON.stringify(ans, null, 2));

    await  browser.close();
}

const Promise = ScrapeProperties();