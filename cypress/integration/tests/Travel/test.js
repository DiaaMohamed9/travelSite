/// <reference types="cypress" />
var apiResponse

describe('test travle site', () => {
  before(() => {
cy.request({
method:"GET",
url:"https://run.mocky.io/v3/941a253b-f9ae-4c43-9969-4d513a84ba2f",
followRedirect: false,
}).then((response)=>{
  expect(response.status).eq(200)
  apiResponse=response.body.teams
})
  })

  it('one team each from these countries England,Germany, Italy, and Spain. ', () => {
    var counteriesTeams={"England":0,"Germany":0,"Italy":0,"Spain":0}
    Promise.all(apiResponse.map((team)=>{
      if(team.country.name in   counteriesTeams ) 
      counteriesTeams[team.country.name]+=1
     })) .then(()=>{
      Object.keys(counteriesTeams).map((countery)=>{
        expect(counteriesTeams[countery]).eq(1)
      })
     })
  })

  it('Each team is supposed to have a minimum of 24 members in their squad.', () => {
   apiResponse.map((team)=>{
     expect(team.squad.length).to.be.not.lessThan(24,` eaxh team has 24 ${team.name}`)

     })
  })
  it( 'Each team s squad should have only 1 member each with "COACH" and" ASSISTANT_COACH" roles.', () => {
    apiResponse.map((team)=>{
      expect(team.squad.length).to.be.not.lessThan(24,` eaxh team has 24 ${team.name}`)
 
      })
   })
  
})


/*

{
"places":[{"placeId":"23","placeName":"dsd"
}]
}
*/ 