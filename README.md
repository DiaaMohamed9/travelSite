# Event Site

## The Traget Project:
https://luminous-meringue-661120.netlify.app/

## The Bugs Sheet:
https://docs.google.com/spreadsheets/d/1wLUqcOeqBu6RT7OD1XGScousMPhXADkzAO0e0ZfBEMo/edit?usp=sharing

## Pre-requisites:

1. Install Node & npm from https://www.npmjs.com/get-npm

2. Install Visual Studio Code from https://code.visualstudio.com/download (Personal preference)

3. Install Github desktop from https://desktop.github.com/ (This is a personal preference, you can use github cli from terminal as well)



## Setup

1. CD to your project directory in terminal

2. clone project using Github "https://github.com/DiaaMohamed9/travelSite"

3. install dependancies by running the below command
   `npm install`

## Running Scripts

1. run `npm run test` in terminal to run in headless mode

2. run `npx cypress open` to open cypress 

3. Check the test configurations found in package.json file and run the test you need to be run


## Generate test report

The tests are integrated with mochawesome reporting tools. In order to see test reports

1. Test reports are generated for every headless test run.

2. check the folder `TestReport` for the latest files added

3. `TestReport` folder gets deleted for every new headless test run

## Structure:

## Where to put what

This section aims to give a hint on the usage of each file/directory

1. `cypress/fixtures`: contains data written by API calls.
2. `cypress/integration`: contains test files
3. `cypress/integration/pages`: contains different pages with implementations, as well as elements file for page elements
4. `cypress/integration/tests`: contains the E2E test files.
5. `cypress/integration/API`: contains API files to be used as prequistes for E2E tests.
6. `cypress/plugins`: contains different plugins used to access different environments
7. `cypress/support`: contains custom made commands and index file to handle hooks or exception globally.
8. `cypress.json`: contains cypress config such as timeout, reporter etc..
9.   `package.json`: contains dependancies and run commands
