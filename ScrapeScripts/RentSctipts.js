import { Main, Rent } from '../Constants.js'

const extractDataHandler = (cards) =>
{
	const data = []

	for (let i = 0; i < cards.length; i++)
	{
		let house = { bhk: null, rent_per_month: null, area: null, type: null, builtup_area: null, furnishing_status: null, url: null }

		//BHK
		const text0 = cards[i].children[0].innerText.trim()
		const bhkMatch = text0.match(/([\d.]+)\s*BHK/i)
		if (bhkMatch)
			house.bhk = parseFloat(bhkMatch[1])

		//Type
		const typeMapping = { "Flat": "Apartment", "Independent House": "Independent House","Villa": "Villa" }
		for (let key in typeMapping)
		{
			if (text0.includes(key))
				house.type = typeMapping[key]
		}

		//Area
		const areaMatch = text0.match(/for rent in (.+)$/)
		if (areaMatch)
			house.area = areaMatch[1].trim()

		const text2 = cards[i].children[2].innerText.trim()
		const lines = text2.split("\n")

		const rentMatch = lines[0].replace(/,/g, "").match(/\d+/)
		if (rentMatch)
			house.rent_per_month = parseInt(rentMatch[0])

		const builtupMatch = lines[2].replace(/,/g, "").match(/\d+/)
		if (builtupMatch)
			house.builtup_area = parseInt(builtupMatch[0])

		house.furnishing_status = lines[4].split(" ")[0] || null

		const text3 = cards[i].children[3].innerText.trim()

		//URL            
		house.url = cards[i].children[0].children[0].children[0].href

		data.push(house)
	}

	return data
}

const extractFromEachProperty = async (properties, page) =>
{
	let answer = []

	for (let i = 0; i < properties.length; i++) 
	{
		let propertyObject = properties[i]

		try
		{
			await page.goto(propertyObject.url, { waitUntil: 'domcontentloaded' })
		}
		catch (err)
		{
			console.warn(`Failed to navigate to ${propertyObject.url}:`, err)
			continue
		}

		let propertyAdditionalDetails = {}

		try
		{
			propertyAdditionalDetails = await page.$$eval('.T_dataPointStyle._h31f4h', (rows) =>
			{
				let details = { age: null, gated_community: null, bathrooms: null, carpet_area: null, gas_pipeline: null }
				for (let j = 0; j < rows.length; j++)
				{
					try
					{
						const text = rows[j].innerText.split("\n")
						if (rows[j].innerText.startsWith("Age of property"))
						{
							details.age = parseInt(text[1].split(" ")[0]) || null
						}
						else if (rows[j].innerText.startsWith("Gate Community"))
						{
							details.gated_community = text[1] === "Yes"
						}
						else if (rows[j].innerText.startsWith("Bathrooms"))
						{
							details.bathrooms = parseInt(text[1]) || null
						}
						else if (rows[j].innerText.startsWith("Carpet area"))
						{
							details.carpet_area = parseInt(text[1].split(" ")[0]) || null
						}
						else if (rows[j].innerText.startsWith("Gas Pipeline"))
						{
							details.gas_pipeline = text[1] === "Yes"
						}
					}
					catch (innerErr)
					{
						console.warn(`Failed to parse row ${j} on ${propertyObject.url}:`, innerErr)
					}
				}
				return details
			})
            propertyAdditionalDetails.id=parseInt(propertyObject.url.split("/rent/")[1].split("-")[0]);
		}
		catch (err)
		{
			console.warn(`Failed to extract details for ${propertyObject.url}:`, err)
		}

		Object.assign(propertyObject, propertyAdditionalDetails)
		answer.push(propertyObject)
		await new Promise(resolve => setTimeout(resolve, Main.Timeout))
	}

	return answer
}

const extractFromEachPage = async (page) =>
{
	let rentHouses = []

	try
	{
		rentHouses = await page.$$eval('.infoTopContainer', extractDataHandler)
	}
	catch (err)
	{
		console.warn(`Failed to extract properties from page:`, err)
	}

	return rentHouses
}

const RentRoutine = async (page) =>
{
	let finalProperties = []

	for (let i = 0; i < 3; i++)
	{
		for (let pageNum = 1; pageNum <= Main.MaxPages; pageNum++)
		{
			const currentUrl = `${Rent.URL}${Rent.PropertyCode[i]}${Rent.Filter}${Main.Page}${pageNum}`

			try
			{
				await page.goto(currentUrl, { waitUntil: "domcontentloaded" })
			}
			catch (err)
			{
				console.warn(`Failed to load URL ${currentUrl}:`, err)
				continue
			}

			let propertiesFewDetails = []

			try
			{
				propertiesFewDetails = await extractFromEachPage(page)
			}
			catch (err)
			{
				console.warn(`Failed to extract basic details from ${currentUrl}:`, err)
			}

			let propertiesAllDetails = []

			try
			{
				propertiesAllDetails = await extractFromEachProperty(propertiesFewDetails, page)
			}
			catch (err)
			{
				console.warn(`Failed to extract additional details from ${currentUrl}:`, err)
			}

			finalProperties = finalProperties.concat(propertiesAllDetails)

			await new Promise(resolve => setTimeout(resolve, Main.Timeout))
		}
	}

	return finalProperties
}

export { RentRoutine }
