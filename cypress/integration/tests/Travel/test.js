/// <reference types="cypress" />
import Countries from "../../API/Counteries";
import SearchPage from "../../pages/saerchPage/searchPage";
var apiResponse;
const countries = new Countries();
const searchPage = new SearchPage();
var expectedCountryList = [];
const happyScenario = true;
const startDateEmpty = true;
const endDateEmpty = true;
var selectedCountery;
const testScinrios = [
  {
    startDate: "06/15/2022",
    endDate: "06/07/2022",
    excute: happyScenario,
    name: "happyScenario",
  },
  {
    startDate: "",
    endDate: "06/07/2022",
    excute: startDateEmpty,
    name: "startDateEmpty",
  },
  {
    startDate: "06/15/2022",
    endDate: "",
    excute: endDateEmpty,
    name: "endDateEmpty",
  },
];

const testData = testScinrios.filter(function (Scinrio) {
  return Scinrio.excute === true;
});

testData.forEach((TD) => {
  describe(`test travle site ${TD.name}`, () => {
    before(() => {
      cy.visit("https://luminous-meringue-661120.netlify.app/");
      countries.getCountiresList().then((data) => {
        expectedCountryList = data;
        selectedCountery = data[0];
      });
    });

    it("check the countries list", () => {
      searchPage.checkTheRederedCounteryList(expectedCountryList);
    });

    it("check select country", () => {
      searchPage.checkClickCounteryFlow(selectedCountery);
    });
    it("check Date  Selection", () => {
      searchPage.chooseDateRange(TD.startDate, TD.endDate);
    });
    it("check search  feature", () => {
      searchPage.clickOnSearch(TD.startDate, TD.endDate, selectedCountery);
    });
    it("check pagination  feature", () => {
      searchPage.checkPagenationFeature();
    });
    it("check select  posts count per page  feature", () => {
      searchPage.checkselectPostsPerPageFeature(TD.startDate, TD.endDate);
    });
    it("check sortBY feature", () => {
      searchPage.checkSortByVlues();
      searchPage.checkSortByName(TD.startDate, TD.endDate);
      searchPage.checkSortByDate(TD.startDate, TD.endDate);
      searchPage.checkSortByName(TD.startDate, TD.endDate, "asc");
      searchPage.checkSortByDate(TD.startDate, TD.endDate, "asc");
    });
    it("check display/choose events feature", () => {
      searchPage.checkEventDisplayFlow();
    });
    it("check Keyword search feature", () => {
      searchPage.checkSearchByKeywordFlow();
    });
  });
});

/*

{
"places":[{"placeId":"23","placeName":"dsd"
}]
}
*/
