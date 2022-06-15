const xpath     = require('xpath')
const dom       = require('xmldom').DOMParser

export default class Countries{

    getCountiresList(){
        let countries=[]
        return cy.request({
          url: "https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/#supported-country-codes",
          method: "GET",
          followRedirect: false,
        }).then((response)=>{
            let html =response.body
                var doc = new dom().parseFromString(html);
                var nodes = xpath.select("//table[thead//th[contains(text(),'CountryCode')]]//td/text()", doc);
                for (var i = 0; i < nodes.length; i++) {
                    countries.push(nodes[i].toString().split('(')[1].split(')')[0])
                //   console.log(nodes[i].toString().split('(')[1].split(')')[0]);
              }
 
            }).then(()=>{
                return countries
            })


    }
}