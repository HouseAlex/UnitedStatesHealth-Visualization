let histogram1, countyMap1

Promise.all([
    d3.json('data/counties-10m.json'),
    d3.csv('data/national_health_data.csv'),
    d3.json('data/additional_data_info.json')
]).then(data => {
    const geo = data[0];
    const healthData = data[1];
    const options = data[2];
    console.log(geo);
    geo.objects.counties.geometries.forEach(element => {
        for (let i = 0; i < healthData.length; i++){
            if (element.id === healthData[i].cnty_fips) {
                element.properties.selectedAttribute = +healthData[i].median_household_income;
            }
        }
    });

    histogram1 = new Histogram({
        parentElement: '#histogram1',
    }, geo);
    histogram1.UpdateVis();

    countyMap1 = new CountyMap({
        parentElement: '#countymap1',
    }, geo, );
    countyMap1.UpdateVis();
})
.catch(error => console.log(error));