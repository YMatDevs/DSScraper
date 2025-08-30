import {Main,Rent} from '../Constants.js'

const RentProperties=async(page)=>
{
    const rentHouses=await page.$$eval('.infoTopContainer',
    (cards) => {
        const data = [];

        for (let i = 0; i < cards.length; i++) {
            let house = { bhk: null, rent_per_month: null, area: null, 
                type: null, builtup_area: null, furnishing_status: null, amenities: null };

            //BHK
            const text0 = cards[i].children[0].innerText.trim();
            const bhkMatch = text0.match(/([\d.]+)\s*BHK/i);
            if (bhkMatch) house.bhk = parseFloat(bhkMatch[1]);

            //Type
            const typeMapping = { "Flat":"Apartment","Independent House":"Independent House",
                "Independent Builder Floor":"Independent Floor","Studio":"Studio","Duplex":"Duplex","Penthouse":"Penthouse","Villa":"Villa" };
            for (let key in typeMapping) {
                if (text0.includes(key)) house.type = typeMapping[key];
            }

        //Area
            const areaMatch = text0.match(/for rent in (.+)$/);
            if (areaMatch) house.area = areaMatch[1].trim();

            
            const text2 = cards[i].children[2].innerText.trim();
            const lines = text2.split("\n");

            const rentMatch = lines[0].replace(/,/g,"").match(/\d+/);
            if (rentMatch) house.rent_per_month = parseInt(rentMatch[0]);

            const builtupMatch = lines[2].replace(/,/g,"").match(/\d+/);
            if (builtupMatch) house.builtup_area = parseInt(builtupMatch[0]);

            house.furnishing_status = lines[4].split(" ")[0] || null;

            
            const text3 = cards[i].children[3].innerText.trim();

            //Amemities
            const cleanedText = text3.replace(/^(Highlights:|Amenities:)\s*/, "");        
            house.amenities = cleanedText.split(/•/).map(a => a.trim());
            console.log(house.amenities);


            data.push(house);
        }

            return data; 
    });    
    return rentHouses;
}

const RentRoutine=async(page)=>
{
    let finalProperties=[];

    for(let pageNum=1;pageNum<=Main.MaxPages;pageNum++)
    {
        const currentUrl=Rent.URL+Rent.Filter+Main.Page+`${pageNum}`;
        await page.goto(currentUrl,
            {waitUntil:"domcontentloaded"}
        );
        const properties=await RentProperties(page);      
        finalProperties=finalProperties.concat(properties);
        await new Promise(resolve => setTimeout(resolve, Main.Timeout));
    }

    return finalProperties;

}

export {RentRoutine};