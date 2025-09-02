import puppeteer from "puppeteer-extra";
import pkg from "pg"
import dotenv from "dotenv";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';


dotenv.config();



import { Main } from "./Constants.js";
import { BuyRoutine } from "./ScrapeScripts/BuyScripts.js";
import {RentRoutine} from "./ScrapeScripts/RentSctipts.js";
import {cleanBuy, InsertBuyIntoTable, InsertRentIntoTable} from "./AddToDB.js";

puppeteer.use(StealthPlugin());


const { Client } = pkg;
const connectionString = process.env.DATABASE_URL;
const client = new Client({ connectionString });


async function ScrapeProperties() {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--disable-quic', // ⬅️ Add this line to disable QUIC
        ]
    });
    const context = await browser.createBrowserContext();

    const buyPage = await context.newPage();
    // const rentPage = await context.newPage();

    // await buyPage.setUserAgent( Main.UserAgent );
    // await rentPage.setUserAgent( Main.UserAgent );

    const ans1 = await BuyRoutine(buyPage);
    // const ans2 = await RentRoutine(rentPage);

    await  browser.close();

    console.log("before cleaning\n");
    console.log(JSON.stringify(ans1, null, 2));

    console.log("after cleaning\n");


    cleanBuy(ans1);


}

const Promise = ScrapeProperties();