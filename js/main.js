

Promise.all([
    d3.json('data/counties-10m.json'),
    d3.csv('data/national_health_data.csv')
]).then(data => {
    const geo = data[0];
    const healthData = data[1];
    console.log(geo);
    geo.objects.counties.geometries.forEach(element => {
        for (let i = 0; i < healthData.length; i++){
            if (element.id === healthData[i].cnty_fips) {
                element.properties.medianHouseInc = +healthData[i].median_household_income;
            }
        }
    });

    const countyMap = new CountyMap({
        parentElement: '.viz'
    }, geo);
})
.catch(error => console.log(error));