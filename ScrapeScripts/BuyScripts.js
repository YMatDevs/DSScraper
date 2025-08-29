
import { Main, Buy } from "../Constants.js";

async function BuyApartments(page, domain) {
    await page.waitForSelector("div.T_infoStyle"); // wait for property cards
    await new Promise(resolve => setTimeout(resolve, 1000)); // give React time

    const propertiesOnPage = await page.evaluate((domain) => {
        const results = [];
        const propertyCards = document.querySelectorAll("div.T_infoStyle");

        propertyCards.forEach((card) => {
            const getText = (selector) =>
                card.querySelector(selector)?.textContent.trim() ?? null;

            const getAttr = (selector, attr) =>
                card.querySelector(selector)?.getAttribute(attr) ?? null;

            const relativeUrl = getAttr('a[data-q="title"]', "href");

            results.push({
                title: getText("h2.title-style"),
                buildingName: getText("div.subtitle-style"),
                propertyUrl: relativeUrl ? `${domain}${relativeUrl}` : null,
                isReraRegistered: !!card.querySelector("div._c819bv"),
                price: getText('div[data-q="price"]'),
                avgPrice: getText('div[data-q="avg-price"]'),
                builtupArea: getText(
                    'div[data-q="builtup-area"] > .T_primaryInfoTextStyle'
                ),
                possessionStatus: getText(
                    'div[data-q="property-detail"] > .T_primaryInfoTextStyle'
                ),
                amenities:
                    getText('div[data-q="project-Amenities"]')?.replace(
                        "Amenities: ",
                        ""
                    ) ?? null,
                sellerName: getText("div.sellerName-label"),
                sellerType: getText("div.seller-subtitle"),
            });
        });
        return results;
    }, domain);

    return propertiesOnPage.filter(item =>  item && item.title);
}


async function BuyRoutine(page)
{
    let finalProperties = [];

    for(let pageNum = 1; pageNum <= Main.MaxPages; pageNum++) {

        const currentUrl = Buy.URL + Buy.PropertyCode.Apartment + Buy.Filter + Main.Page + `${pageNum}`;

        await page.goto(currentUrl, { waitUntil: "networkidle2" });

        const properties = await BuyApartments(page, Main.Domain);

        console.log("properties: ");
        console.log(properties);


        finalProperties.push(...properties);

        await new Promise(resolve => setTimeout(resolve, Main.Timeout));
    }

    return finalProperties;
}


export { BuyRoutine };

