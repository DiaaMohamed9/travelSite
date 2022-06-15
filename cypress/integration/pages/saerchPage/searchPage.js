import moment from "moment";

var elements = require("./elements");
var SortByOptions = require("./SortByOptions.json");

export default class SearchPage {
  clickOnCountryList() {
    cy.xpath(elements.SearchPage.counteryListElement).click();
  }
  getTheCounteriesDropDownList() {
    let list = [];
    return cy
      .xpath(elements.SearchPage.counteryDropListElements)
      .each(($el, index, $list) => {
        list.push($el.text());
      })
      .then(() => {
        return list;
      });
  }
  checkTheRederedCounteryList(expectedList) {
    this.clickOnCountryList();
    this.getTheCounteriesDropDownList().then((list) => {
      expect(expectedList).to.be.deep.equal(list);
    });
  }
  chooseCountery(countery) {
    cy.xpath(
      elements.SearchPage.counteryDropListElement.replace("COUNTERY", countery)
    ).click({ force: true });
  }
  checkClickCounteryFlow(countery) {
    this.clickOnCountryList();
    this.chooseCountery(countery);
  }
  chooseDateRange(startDate, endDate) {
    startDate != ""
      ? cy
          .xpath(elements.SearchPage.startDateElement)
          .type(startDate, { force: true })
      : null;
    endDate != ""
      ? cy
          .xpath(elements.SearchPage.endDateElement)
          .type(endDate, { force: true })
      : null;
    cy.xpath("//h3").click();
  }
  listenEvnetListingRequest(startDate, endDate, order = "", page, keyWord) {
    let query;
    cy.intercept(
      {
        method: "GET",
        url: `https://app.ticketmaster.com/discovery/v2/events?*`,
        times: 1,
      },
      (req) => {
        query = req.query;
        if (startDate != "" && startDate != null && startDate != undefined)
          expect(startDate).eq(
            moment(query.startDateTime.split("T")[0]).format("MM/DD/YYYY")
          );
        else if (startDate == "") expect("startDateTime" in query).eq(false);
        if (endDate != "" && endDate != null && endDate != undefined)
          expect(endDate).eq(
            moment(query.endDateTime.split("T")[0]).format("MM/DD/YYYY")
          );
        else if (endDate == "") expect("endDateTime" in query).eq(false);
        if (order != "") expect(order).eq(query.sort);
        if (page) expect(page).eq(Number(query.page));
        if (keyWord) expect(keyWord).eq(Number(query.keyword));
      }
    ).as("eventsRequestProxy");
  }
  clickOnSearch(startDate, endDate, selectedCountery) {
    this.listenEvnetListingRequest(startDate, endDate);
    cy.xpath(elements.SearchPage.searchElement).click();
    cy.wait("@eventsRequestProxy")
      .its("response")
      .then((response) => {
        expect(response.statusCode).eq(200);
        this.getPostsPerPageValue().then((text) => {
          expect(text).to.be.eq(response.body.page.size.toString());
        });
        expect(0).to.be.eq(response.body.page.number);
        response.body._embedded.events.map((event) => {
          expect(event._embedded.venues[0].country.name).equal(
            selectedCountery
          );
          let compareDate = moment(event.dates.start.localDate, "YYYY-MM-DD");
          let start = moment(startDate, "MM/DD/YYYY");
          let end = moment(endDate, "MM/DD/YYYY");
          // if(startDate !='' && endDate!='')
          // expect(compareDate.isBetween(start, end)).eq(true,`this event ${event.id} with date  ${event.dates.start.localDate} in the selected dates ${startDate} - ${endDate}`)
          // if(startDate!='')
          // expect(compareDate.diff(start, 'days')).to.be.at.least(0,`this event ${event.id} with date  ${event.dates.start.localDate} greater than  or eq the selected startDate ${startDate} `)
          if (endDate != "")
            expect(compareDate.diff(end, "days")).to.be.at.most(
              0,
              `this event ${event.id} with date  ${event.dates.start.localDate} less than or eq the selected startDate ${endDate} `
            );
        });
        cy.writeFile(
          "cypress/fixtures/eventListingReponse.json",
          response.body
        );
      });
  }
  getPostsPerPageValue() {
    return cy.xpath(elements.SearchPage.RecordsPerPage).then(($el) => {
      return $el.find("option:selected").text();
    });
  }
  getSortByValue() {
    return cy.xpath(elements.SearchPage.SortByElment).then(($el) => {
      return $el.find("option:selected").text();
    });
  }
  selectPostsPerPage(count) {
    cy.xpath(elements.SearchPage.RecordsPerPage).select(`${count}`);
  }
  getAllOptionsFortPostsPerPage() {
    let list = [];
    return cy
      .xpath(elements.SearchPage.RecordsPerPageOptions)
      .each(($el, index, $list) => {
        list.push($el.text());
      })
      .then(() => {
        return list;
      });
  }
  selectSortBy(sortType) {
    cy.xpath(elements.SearchPage.SortByElment).select(`${sortType}`);
    cy.wait(1000);
  }
  getAllOptionsFortSortBy() {
    let list = [];
    return cy
      .xpath(elements.SearchPage.SortByOptions)
      .each(($el, index, $list) => {
        list.push($el.text());
      })
      .then(() => {
        return list;
      });
  }
  checkSortByVlues() {
    this.getAllOptionsFortSortBy().then((options) => {
      expect(options).to.be.deep.equal(SortByOptions);
    });
  }
  getAscendingDescendingStatus() {
    return cy
      .xpath(elements.SearchPage.AscendingDescendingSelector)
      .then(($el) => {
        return $el.attr("data-icon").includes("up") ? "asc" : "desc";
      });
  }
  togelOrdringWay() {
    cy.xpath(elements.SearchPage.AscendingDescendingSelector).click();
  }
  checkSortByName(startDate, endDate, setOrder = "") {
    this.getAscendingDescendingStatus().then((status) => {
      if (setOrder != "") {
        if (status != setOrder) {
          this.getSortByValue().then((slected) => {
            this.listenEvnetListingRequest(
              startDate,
              endDate,
              `${slected},${setOrder}`
            );
            this.togelOrdringWay();
          });

          // cy.wait('@eventsRequestProxy')
        }
      }
      status = setOrder != "" ? setOrder : status;
      this.listenEvnetListingRequest(startDate, endDate, `name,${status}`);
      this.selectSortBy("name");
      cy.wait("@eventsRequestProxy")
        .its("response")
        .then((response) => {
          cy.writeFile(
            "cypress/fixtures/eventListingReponse.json",
            response.body
          );
          expect(response.statusCode).eq(200);
        })
        .then(() => {
          this.getAllEvnetsShowedData().then((events) => {
            let expectedOrderedEvents = events.slice();
            expectedOrderedEvents.sort(function (a, b) {
              var nameA = a.Title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
                nameB = b.Title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
              if (nameA < nameB)
                //sort string ascending
                return status == "asc" ? -1 : 1;
              if (nameA > nameB) return status == "asc" ? 1 : -1;
              return 0; //default return value (no sorting)
            });
            // expectedOrderedEvents.sort((a, b) => ( status=='desc' ? a.name < b.name ? 1 : -1 :a.name > b.name ? 1 : -1  )) // < des ,  > ase
            cy.writeFile(
              "cypress/fixtures/expectedOrder.json",
              expectedOrderedEvents.map((el) => {
                return el.Title;
              })
            ).then(() => {
              cy.writeFile(
                "cypress/fixtures/actualOrder.json",
                events.map((el) => {
                  return el.Title;
                })
              ).then(() => {
                expect(expectedOrderedEvents).to.be.deep.equal(events);
              });
            });
          });
        });
    });
  }
  checkSortByDate(startDate, endDate, setOrder = "") {
    this.getAscendingDescendingStatus().then((status) => {
      if (setOrder != "") {
        this.getAscendingDescendingStatus().then((status) => {
          if (status != setOrder) {
            this.getSortByValue().then((slected) => {
              this.listenEvnetListingRequest(
                startDate,
                endDate,
                `${slected},${setOrder}`
              );
              this.togelOrdringWay();
            });
            // cy.wait('@eventsRequestProxy')
          }
        });
      }
      status = setOrder != "" ? setOrder : status;
      this.listenEvnetListingRequest(startDate, endDate, `date,${status}`);
      this.selectSortBy("date");
      cy.wait("@eventsRequestProxy")
        .its("response")
        .then((response) => {
          cy.writeFile(
            "cypress/fixtures/eventListingReponse.json",
            response.body
          );
          expect(response.statusCode).eq(200);
          let expectedOrderedEvents = response.body._embedded.events.slice();
          expectedOrderedEvents.sort(function (a, b) {
            var c = new Date(
              `${a.dates.start.localDate} ${
                "localTime" in a.dates.start ? a.dates.start.localTime : ""
              }`
            );
            var d = new Date(
              `${b.dates.start.localDate} ${
                "localTime" in b.dates.start ? b.dates.start.localTime : ""
              }}`
            );
            return status == "asc" ? c - d : d - c; //c-d asc  d-c desc
          });
          cy.writeFile(
            "cypress/fixtures/expectedOrder.json",
            expectedOrderedEvents.map((el) => {
              return [el.name, el.dates.start];
            })
          ).then(() => {
            cy.writeFile(
              "cypress/fixtures/actualOrder.json",
              response.body._embedded.events.map((el) => {
                return [el.name, el.dates.start];
              })
            ).then(() => {
              expect(expectedOrderedEvents).to.be.deep.equal(
                response.body._embedded.events
              );
            });
          });

        });
    });
  }
  checkselectPostsPerPageFeature(startDate, endDate) {
    this.getAllOptionsFortPostsPerPage().then((options) => {
      options.map((option) => {
        this.listenEvnetListingRequest(startDate, endDate);
        this.selectPostsPerPage(option);
        cy.wait("@eventsRequestProxy")
          .its("response")
          .then((response) => {
            expect(response.statusCode).eq(200);
            this.getPostsPerPageValue().then((text) => {
              expect(text).to.be.eq(response.body.page.size.toString());
              expect(option).to.be.eq(response.body.page.size.toString());
              cy.wait(1000);
              this.getAllEvnetsShowedDataLength().then((eventsLength) => {
                if (response.body.page.totalElements < option)
                  expect(eventsLength).to.be.at.most(Number(option));
                else expect(eventsLength).to.be.eq(Number(option));
              });
            });
            expect(0).to.be.eq(response.body.page.number);
            cy.writeFile(
              "cypress/fixtures/eventListingReponse.json",
              response.body
            );
          });
      });
    });
  }
  getAllEvnetsShowedData() {
    cy.wait(1000)
    var listingCount, id, obj;
    var list = [];
    return cy
      .xpath(elements.SearchPage.EvnetsCardsElments)
      .then((listing) => {
        listingCount = Cypress.$(listing).length;
      })
      .then(() => {
        obj={}
        list = [];
        for (let counter = 1; counter <= listingCount; counter++) {
          cy.xpath(
            elements.SearchPage.EvnetsCardsElment.replace("ROW", counter)
          )
            .then(($el) => {
              obj = {};
              id = $el.attr("href");
              obj["id"] = id;
            })
            .then(() => {
              cy.xpath(
                elements.SearchPage.EvnetsCardsTitlesElments.replace(
                  "ROW",
                  counter
                )
              ).then(($el) => {
                obj["Title"] = $el.text();
              });
              cy.xpath(
                elements.SearchPage.EvnetsCardsDatesElments.replace(
                  "ROW",
                  counter
                )
              ).then(($el) => {
                obj["Dates"] = $el.text();
              }).then(()=>{
                list.push(obj);
              })
            })
        }
      })
      .then(() => {
        return list;
        // cy.wrap(Obj).as("theUiData");
      });
  }
  getAllEvnetsShowedDataLength() {
    return cy.xpath(elements.SearchPage.EvnetsCardsElments).then((listing) => {
      return Cypress.$(listing).length;
    });
  }
  getCurrentPage() {
    return cy.xpath(elements.SearchPage.ActivePageElment).then(($el) => {
      return $el.text();
    });
  }
  isNextPageActive() {
    return cy.xpath(elements.SearchPage.NextPageElment).then(($el) => {
      return $el.attr("disabled") ? false : true;
    });
  }
  isFirstPageActive() {
    return cy.xpath(elements.SearchPage.FirstPageElment).then(($el) => {
      return $el.attr("disabled") ? false : true;
    });
  }
  isLastPageActive() {
    return cy.xpath(elements.SearchPage.LastPageElment).then(($el) => {
      return $el.attr("disabled") ? false : true;
    });
  }
  isPreviousPageActive() {
    return cy.xpath(elements.SearchPage.PreviousPageElment).then(($el) => {
      return $el.attr("disabled") ? false : true;
    });
  }
  clickOnNextPage(currentEvents) {
    return this.getCurrentPage().then((current) => {
      this.listenEvnetListingRequest(null, null, "", Number(current));
      cy.xpath(elements.SearchPage.NextPageElment).click();
      cy.wait("@eventsRequestProxy")
        .its("response")
        .then((response) => {
          expect(response.statusCode).eq(200);
        })
        .then(() => {
          this.getCurrentPage().then((newPage) => {
            expect(Number(newPage)).eq(Number(current) + 1);
          });
          this.getAllEvnetsShowedData().then((newEvents) => {
            if (currentEvents)
              expect(JSON.stringify(newEvents)).to.be.not.eq(
                JSON.stringify(currentEvents)
              );
            return newEvents;
          });
        });
    });
  }
  clickOnPreviousPage(currentEvents) {
    return this.getCurrentPage().then((current) => {
      this.listenEvnetListingRequest(null, null, "", Number(current) - 2);
      cy.xpath(elements.SearchPage.PreviousPageElment).click();
      cy.wait("@eventsRequestProxy")
        .its("response")
        .then((response) => {
          expect(response.statusCode).eq(200);
        })
        .then(() => {
          this.getCurrentPage().then((newPage) => {
            expect(Number(newPage)).eq(Number(current) - 1);
          });
          this.getAllEvnetsShowedData().then((newEvents) => {
            if (currentEvents)
              expect(JSON.stringify(newEvents)).to.be.not.eq(
                JSON.stringify(currentEvents)
              );
            return newEvents;
          });
        });
    });
  }
  clickOnFirstPage(currentEvents) {
    return this.getCurrentPage().then((current) => {
      this.listenEvnetListingRequest(null, null, "", 0);
      cy.xpath(elements.SearchPage.FirstPageElment).click();
      cy.wait("@eventsRequestProxy")
        .its("response")
        .then((response) => {
          expect(response.statusCode).eq(200);
        })
        .then(() => {
          this.getCurrentPage().then((newPage) => {
            expect(Number(newPage)).eq(1);
          });
          this.isFirstPageActive().then((is) => {
            expect(is).eq(false);
          });
          this.isPreviousPageActive().then((is) => {
            expect(is).eq(false);
          });
          this.getAllEvnetsShowedData().then((newEvents) => {
            if (currentEvents)
              expect(JSON.stringify(newEvents)).to.be.not.eq(
                JSON.stringify(currentEvents)
              );
            return newEvents;
          });
        });
    });
  }
  clickOnLastPage(currentEvents) {
    return this.getCurrentPage().then((current) => {
      this.listenEvnetListingRequest(null, null, "");
      cy.xpath(elements.SearchPage.LastPageElment).click();
      cy.wait("@eventsRequestProxy")
        .its("response")
        .then((response) => {
          expect(response.statusCode).eq(200);
        })
        .then(() => {
          this.isFirstPageActive().then((is) => {
            expect(is).eq(true);
          });
          this.isPreviousPageActive().then((is) => {
            expect(is).eq(true);
          });
          this.isLastPageActive().then((is) => {
            expect(is).eq(false);
          });
          this.isNextPageActive().then((is) => {
            expect(is).eq(false);
          });
          this.getAllEvnetsShowedData().then((newEvents) => {
            if (currentEvents)
              expect(JSON.stringify(newEvents)).to.be.not.eq(
                JSON.stringify(currentEvents)
              );
            return newEvents;
          });
        });
    });
  }
  checkPagenationFeature() {
    cy.readFile("cypress/fixtures/eventListingReponse.json").then(
      (eventResponse) => {
        if (eventResponse.page.totalPages > 1)
          this.isNextPageActive().then((is) => {
            if (is) {
              this.getAllEvnetsShowedData().then((events) => {
                this.clickOnNextPage(events).then((events) => {
                  this.clickOnPreviousPage(events).then((events) => {
                    this.clickOnLastPage(events).then((events) => {
                      this.clickOnFirstPage(events);
                    });
                  });
                });
              });
            }
          });
      }
    );
  }
  clickOnEvent(id) {
    cy.xpath(elements.SearchPage.EvnetCardElmentById.replace("ID", id)).click();
  }
  checkEventDisplayFlow() {
    cy.readFile("cypress/fixtures/eventListingReponse.json").then((events) => {
      let Events = events._embedded.events;
      const selectedEvent = Events[0];
      cy.intercept({
        url: `https://app.ticketmaster.com/discovery/v2/events/${selectedEvent.id}?apikey=*`,
        method: "GET",
        times: 1,
      }).as("eventDisplay");
      this.clickOnEvent(selectedEvent.id);
      cy.wait("@eventDisplay")
        .its("response")
        .then((response) => {
          expect(response.statusCode).eq(200);
        })
        .then(() => {
          this.getDisplayedUiData(selectedEvent.id).then((EventUiData) => {
            expect(EventUiData.Title).eq(selectedEvent.name.trim());
            expect(EventUiData.Venue).eq(
              selectedEvent._embedded.venues[0].name.trim()
            );
            expect(EventUiData.Time).eq(
              "localTime" in selectedEvent.dates.start
                ? selectedEvent.dates.start.localTime
                : "Not Specified"
            );
            expect(EventUiData.Segment).eq(
              "segment" in selectedEvent.classifications[0]
                ? selectedEvent.classifications[0].segment.name
                : "Not Specified"
            );
            expect(EventUiData.Genre).eq(
              "genre" in selectedEvent.classifications[0]
                ? selectedEvent.classifications[0].genre.name
                : "Not Specified"
            );
          });
        });
    });
  }
  getDisplayedUiData(id) {
    let obj = { id: id };
    return cy
      .wait(0)
      .then(() => {
        cy.xpath(elements.SearchPage.MainScreenEventTitle).then(($el) => {
          obj.Title = $el.text().trim();
        });
        cy.xpath(elements.SearchPage.MainScreenEventVenue).then(($el) => {
          obj.Venue = $el.text().trim();
        });
        cy.xpath(elements.SearchPage.MainScreenEventTime).then(($el) => {
          obj.Time = $el.text().replace("(Local Time)", "").trim();
        });
        cy.xpath(elements.SearchPage.MainScreenEventSegment).then(($el) => {
          obj.Segment = $el.text().trim();
        });
        cy.xpath(elements.SearchPage.MainScreenEventPrice).then(($el) => {
          obj.Price = $el.text().trim();
        });
        cy.xpath(elements.SearchPage.MainScreenEventInformation).then(($el) => {
          obj.Information = $el.text().trim();
        });
        cy.xpath(elements.SearchPage.MainScreenEventGenre).then(($el) => {
          obj.Genre = $el.text().trim();
        });
        cy.xpath(elements.SearchPage.MainScreenEventDate).then(($el) => {
          obj.Date = $el.text().trim();
        });
      })
      .then(() => {
        return obj;
      });
  }
  typeKeyWord(keyWord) {
    cy.xpath(elements.SearchPage.searchKeyWordElment).type(keyWord);
  }
  checkSearchByKeywordFlow() {
    cy.visit("https://luminous-meringue-661120.netlify.app/").then(() => {
      cy.readFile("cypress/fixtures/eventListingReponse.json").then(
        (response) => {
          
          let keyWord = response._embedded.events.filter(function(val){
            return !(val.name.toLowerCase().includes('unknown'))
          })[0].name;
          this.listenEvnetListingRequest(null, null, "", null,null ,keyWord);
          this.typeKeyWord(keyWord);
          cy.xpath(elements.SearchPage.searchElement).click();
          cy.wait("@eventsRequestProxy")
            .its("response")
            .then((response) => {
              expect(response.statusCode).eq(200);
              this.getAllEvnetsShowedData().then((data) => {
                console.log(data)
                expect(data[0].Title).eq(keyWord);
              });
            });
        }
      );
    });
  }
}
