import { Main } from './Constants.js';

function cleanBuy(data) {
    let final = [];


        for( const item of data ) {
            let point = {};

            if(item.price == null || !item.uniqueId) continue;

            point.id = parseInt(item.uniqueId);

            point.type = item.type;

            let [money, unit] = item.price.split("₹")[1].split(" ");
            // point.price = ((unit === 'L') ? parseFloat(money) : parseFloat(money) * 100).toFixed(2);
            point.price = parseFloat(((unit === 'L') ? parseFloat(money) : parseFloat(money) * 100).toFixed(2));

            point.area = parseInt(item.area.split(" ")[0]);

            point.possesion_status = item.possesion_status;

            point.url = item.propertyURL;

            point.floor = parseInt(item.floor.split(" ")[0]);

            // point.floor = parseInt(item.floor.split(" ")[1]);
            point.floor = parseInt(item.floor?.split(" ")[0]) ?? null;

            point.facing = item.facing.split(" ")[0];

            point.furnishing_status = item.furnishingStatus;

            point.bedrooms = parseInt(item.bedrooms);

            point.bathrooms = parseInt(item.bathrooms);

            point.balcony = parseInt(item.balcony);

            point.parking =  !(item.parking === "No Parking" || item.parking.length < 2);

            let [location, city] = item.address.split(", ").slice(-2);
            point.location = location;

            final.push(point);
        }
    // return final;

    console.log(JSON.stringify(final, null, 2));
}


async function InsertBuyIntoTable(client, data) {

    const query = `
        INSERT INTO BuyProperties
        (id, property_type, price, area, possesion_status, avg_price, seller_name, seller_type, property_url,
         bedrooms, bathrooms, balcony, parking, facing, furnishing_status, location)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id;
    `;

    const insertData = cleanBuy(data);

    for (const property of insertData) {
        const value = [
            property.id,
            property.property_type,
            property.price,
            property.area,
            property.location,
            property.possesion_status,
            property.avg_price,
            property.seller_name,
            property.seller_type,
            property.property_url,
            property.bedrooms,
            property.bathrooms,
            property.balcony,
            property.parking,
            property.facing,
            property.furnishing_status,
        ];

        try {
            const result = await client.query(query, value);
            console.log("Inserted property with id:", result.rows[0].id);
        } catch (err) {
            console.error(err);
        }
    }
}

function InsertRentIntoTable(client, table, data) {

}


export { InsertBuyIntoTable, InsertRentIntoTable, cleanBuy };