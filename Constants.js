

const Main = {
    Domain : "https://housing.com",
    MaxPages : 1,
    UserAgent : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    Page : "?page=",
    Timeout : 2000,
}


const Buy = {
    PropertyCode : {
            Apartment : "M1",
            IndependentHouse : "M2",
            Villa : "M74"
    },
    URL : "https://housing.com/in/buy/searches/",
    Filter : "S6Y1",
    CityCode : "P38f9yfbk7p3m2h1f"
}

const Rent={    
    URL:"https://housing.com/rent/search-C3i",
    Filter:"P38f9yfbk7p3m2h1fS6Y1",
    PropertyCode : ["M1","M2","M74"]
}

export { Main, Buy,Rent };

