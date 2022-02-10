import React, {useState,useEffect} from "react";
import './App.css';
//import { BrowserRouter as Router,Routes,Route} from "react-router-dom";
import { FormControl, MenuItem, Select , Card, CardContent} from "@mui/material";
import InfoBox from  "./InfoBox.js";
import Map from "./Map";
import numeral from "numeral";
import Table from "./Table";
import {sortData,prettyPrintStat} from './util';
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

function App() {  

const [countries,setCountries]=useState([]);
const [country, setCountry]=useState("worldwide");
const [countryInfo, setCountryInfo] = useState({});
const [tableData , setTableData]=useState([]);
const [mapCenter,setMapCenter]=
useState({lat: 34.80746, lng: -40.4796});
const [mapZoom,setMapZoom]= useState(3);
const [mapCountries,setMapCountries]=useState([]);
const [casesType,setCasesType]=useState("cases");

//useffect runs piece of code on specific conditions

useEffect(()=>{
  fetch("https://disease.sh/v3/covid-19/all")
  .then((response) => response.json())
  .then((data)=>{
    setCountryInfo(data);
  })
},[])

useEffect(() => {
// async= send a req, wait for it, do something with the data

const getCountriesData = async ()=>{
 await fetch("https://disease.sh/v3/covid-19/countries")
.then( (response) => response.json())
.then( (data) => {
  const countries = data.map( (country) => (
    {
      name: country.country,
      value:country.countryInfo.iso2,
    }));

    const sortedData = sortData(data);
    setTableData(sortedData);
    setMapCountries(data);
    setCountries(countries);
})
}
getCountriesData();
}, [] );

 const onCountryChange =async (event) =>{
   const countryCode = event.target.value;
  
    const url = 
    countryCode === 'worldwide' 
    ? 'https://disease.sh/v3/covid-19/all' 
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then((response) => response.json())
    .then((data) => {
      setCountry(countryCode);

      //all of the data from country response.
      setCountryInfo(data);
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    })
 };

  return (
  <div className="app">
   {/* header*/}
   <div className="app__left">
   <div className="app__header">
  <h1>COVID-19 TRACKER</h1>
   
  
    <FormControl className="app__dropdown">
    <Select variant="outlined" value={country} onChange={onCountryChange}>
    <MenuItem value="worldwide">Worldwide</MenuItem>
    
        {
         countries.map( (country)=>(
          <MenuItem value={country.value}>{country.name}</MenuItem>
         ))}
    </Select>
    </FormControl> 
  </div>

{/* infobox covid cases & recoveries */}
<div className="app__stats">
 <InfoBox 
 active={ casesType === "cases"} 
 onClick={ (e) => setCasesType("cases")} 
 title="Coronavirus-cases"
 isRed 
 cases={prettyPrintStat(countryInfo.todayCases)} 
 total={numeral(countryInfo.cases).format("0.0a")} />
 
 <InfoBox 
 onClick={ (e) => setCasesType("recovered")} title="Recovered"
 cases={prettyPrintStat(countryInfo.todayRecovered)}
 active={casesType === "recovered"}
 total={numeral(countryInfo.recovered).format("0.0a")} />
 
 <InfoBox 
 onClick={ (e) => setCasesType("deaths")} title="Death" 
 cases={prettyPrintStat(countryInfo.todayDeaths)} 
 isRed
 active={casesType === "deaths"}
 total={numeral(countryInfo.deaths).format("0.0a")} />
</div>
 
 <Map 
 countries={mapCountries}
  casesType={casesType}
   center={mapCenter}
   zoom={mapZoom}
 />
</div>

 <Card className="app__right">
   <CardContent>
     <h2>Live cases by countries</h2>
     <Table countries={tableData}/>
     <h3>Worldwide new {casesType} </h3>
     <LineGraph casesType={casesType} />
   </CardContent>
 </Card> 
</div>
);
}

export default App;
