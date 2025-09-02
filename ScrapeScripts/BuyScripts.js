
import { Main, Buy } from "../Constants.js";
import {Page} from "puppeteer";

async function BuyApartments(page, domain, context) {
    await page.waitForSelector("div.T_infoStyle"); // wait for property cards
    await new Promise(resolve => setTimeout(resolve, 1000)); // give React time

    const propertiesOnPage = await page.evaluate((domain) => {
        const results = [];
        const propertyCardss = document.querySelectorAll("div.T_infoStyle");

        const propertyCards = Array.from(propertyCardss).slice(0, 3);

        propertyCards.forEach((card) => {
            const getText = (selector) =>
                card.querySelector(selector)?.textContent.trim() ?? null;

            const getAttr = (selector, attr) =>
                card.querySelector(selector)?.getAttribute(attr) ?? null;


            // Scraping Info from each card

            const relativeUrl = getAttr('a[data-q="title"]', "href");

            if(!relativeUrl) return;

            const uniqueId = relativeUrl.split('/').pop().split('-')[0];
            const propertyURL = relativeUrl ? `${domain}${relativeUrl}` : null;
            const price = getText('div[data-q="price"]');
            const avgPrice = getText('div[data-q="avg-price"]')?.replace("Avg. price: ", "").trim() ?? null;
            const area = getText('div[data-q="builtup-area"] > .T_primaryInfoTextStyle');
            const possessionStatus = getText('div[data-q="property-detail"] > .T_primaryInfoTextStyle');
            const sellerName = getText("div.sellerName-label");
            const sellerType = getText("div.seller-subtitle");


            results.push({
                uniqueId: uniqueId,
                type: "Apartment",
                price: price,
                area: area,
                possessionStatus: possessionStatus,
                avgPrice: avgPrice,
                sellerName: sellerName,
                sellerType: sellerType,
                propertyURL: propertyURL,
            });
        });
        return results;
    }, domain);

    const completePropertiesList = [];

    for(const basicInfo of propertiesOnPage) {
        if(!basicInfo.propertyURL) continue;

        try {
            await page.goto(basicInfo.propertyURL, {waitUntil: 'networkidle2'});

            await page.waitForSelector('section.css-13dph6', { timeout: Main.Timeout });

            // Scrape the additional details from the new page
            const detailedInfo = await page.evaluate(() => {
                const details = {};
                const infoSections = document.querySelectorAll('.css-c2zxhw');

                infoSections.forEach(section => {
                    const label = section.querySelector('.css-0')?.textContent.trim();
                    const value = section.querySelector('.css-1k19e3, .css-115kb23')?.textContent.trim();

                    if (label === 'Floor') details.floor = value;
                    if (label === 'Facing') details.facing = value;
                    if (label === 'Furnishing') details.furnishingStatus = value;

                });

                const dataPoints = document.querySelectorAll('tr.data-point');
                dataPoints.forEach(row => {
                    const label = row.querySelector('th.T_labelStyle')?.textContent.trim();
                    const value = row.querySelector('td .T_valueStyle')?.textContent.trim();

                    if (label === 'Bedrooms') details.bedrooms = value;
                    if (label === 'Bathrooms') details.bathrooms = value;
                    if (label === 'Balcony') details.balcony = value;
                    if (label === 'Parking') details.parking = value;
                });

                const addressElement = document.querySelector('div[data-q="address"]');
                details.address = addressElement ? addressElement.textContent.trim() : null;

                return details;
            });

            // Combine the basic and detailed information and add to the final list
            completePropertiesList.push({ ...basicInfo, ...detailedInfo });
        } catch (error) {
            console.error(`Error scraping ${basicInfo.propertyURL}:`, error.message);
            // Push basic info even if scraping the details page failed
            completePropertiesList.push(basicInfo);
        }

    }
    return completePropertiesList.filter(item =>  item && item.uniqueId);
}


async function BuyRoutine(page, context)
{
    let finalProperties = [];

    for(let pageNum = Main.StartPage; pageNum <= Main.EndPage; pageNum++) {

        const currentUrl = Buy.URL + Buy.PropertyCode.Apartment + Buy.CityCode + Buy.Filter + Main.Page + `${pageNum}`;

        await page.goto(currentUrl, { waitUntil: "networkidle2" });

        const properties = await BuyApartments(page, Main.Domain, context);

        finalProperties.push(...properties);

        await new Promise(resolve => setTimeout(resolve, Main.Timeout));
    }

    return finalProperties;
}


export { BuyRoutine };

