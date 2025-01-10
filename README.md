<a href="https://softserve.academy/"><img src="https://github.com/ita-social-projects/SpaceToStudy-Client/blob/main/photo2.jpg" title="SoftServe IT Academy" alt="SoftServe IT Academy"></a>

# SpaceToStudy project

SpaceToStudy project is a platform where experts in various fields share their knowledge and students can learn from the best. Here you can find the proper training course, find a tutor, or find students and receive feedback from them.

[![GitHub issues](insert your link here)]
[![Pending Pull-Requests](insert your link here)]
[![GitHub license](insert your link here)]

---

- [Installation](#installation)
  - [Required to install](#Required-to-install)
  - [Clone](#Clone)
  - [Setup](#Setup)
  - [How to run local](#How-to-run-local)
- [Usage](#Usage)
  - [How to run tests](#How-to-run-tests)
- [Documentation](#Documentation)
  - [Rules and guidelines](#Rules-and-guidelines)
  - [Testing](#Testing)
- [Project deploy](#project-deploy)
- [Contributing](#contributing)
  - [git flow](#git-flow)
  - [issue flow](#git-flow)
- [Teams](#teams)
  - [Development team](#development-team)
  - [DevOps team](#devops-team)
  - [Designer team](#designer-team)
  - [BA team](#ba-team)
  - [QC team](#qc-team)
- [FAQ](#faq)
- [Support](#support)
- [License](#license)

---

## Installation

- All the `code` required to get started

### Required to install

- NodeJS (18.14.0 LTS)

### Clone

- Clone this repo to your local machine from this repository

### Setup

> install npm packages

```shell
$ npm install
```

### How to run local

1. Open terminal.
2. Run `npm run start` to start application.<sup>[\*](#footnote)</sup>
3. Open http://localhost:3000 to view it in the browser.

###### <a name="footnote">\*</a> - to run the project you need an `.env` file in root folder

## Usage

### How to run tests

To run unit test open terminal and run `npm run test` in it.

---

## Documentation

### Rules and guidelines

- Redux
  - For each entity we should have separate folder
  - In each folder we should have different files for actions, reducer
    `{modelName}.actions.js` or `{modelName}.reducer.js`
- Configuration
  - Configuration is done via `.env` file where environment
    variables are located
  - Also we have `.env.example` that contains examples of environment
    variables
- Styles
  - For styling function `makeStyles` from `@material-ui`
    should be used and all styles should be located inside separate
    component.
- Components
  - Components that are connected to Redux should be located inside
    `containers` folder. Components without connection to Redux should
    be located inside `components` folder.
  - Each individual page that is accessed via `react-router`
    should be located inside `pages` folder. All components
    that are used inside particular page should be located inside
    folder for the specific page.
  - Each component should have at least three files:
    - `index.js` where we export anything from the whole folder
    - `{component-name}.jsx` - file where component is located
    - `{component-name}.styles.js` where all styles are located
- File naming
  - Files should be name in format `some-component.type.jsx`
- Architecture
  - Logic is separated in layers
    - resolver layer (handles graphql actions)
    - service layer (handles business logic, interactions with database)
    - model layer (mapping collections to mongoose models)
  - All business logic (any database operations or validation related to the business rules) and interaction with models is located inside service
  - Each model should live in its own folder
  - In each folder files should be named in format `{model-name}.{type}.js`
    (like `{model-name}.service.js` or `{model-name}.resolver.js`)
  - For each model we define class like `{ModelName}Service`
    in `{model-name}.service.js` and have separate methods for handling different types of operations
- Configuration
  - All configuration is implemented via environment variable that is located inside
    `.env` file

### Testing

- Tests are implemented in the format of contract tests. We test services, controllers, middlewares, utils or subscriptions on the running application.
  For testing, we should use a database that is running as a container locally.
  We should have a folder per entity with tests.
- Test files:

  - {entityName}.spec.js - Testing the queries (if it exists)
  - {middlewareName}.spec.js - Testing the mutations (if it exists)
  - {functionName}.spec.js - Testing the subscriptions (if it exists)

- Testing guides:
  1.  All fields in data from the response from the backend should be checked for the appropriate value.
  2.  If you cannot test some field for some particular value you should at least check its existence and its type.
  3.  We should test the validation of the provided data to ensure that the backend performs validation by sending different combinations of valid and invalid data.
  4.  Group tests for each operation (query, mutation, or subscription) to describe the statement.
      Content (base scenario, for some operations we can have additional scenarios):
      - describe(‘Validation’) with tests that validate a particular operation with combinations of valid and invalid data.
      - describe(‘Success business logic’) with tests that perform operations with valid data and ensures that valid flows work
  5.  Tests should be executed before any commit and don’t allow to push code if tests are failing.
  6.  We need to develop utility functions that we can reuse in many tests files for creating user and base authentication (obtaining JWT token) for future performing operations that require authorization
- Libraries

  - vitest - testing framework

- Runtime work
  - Locally application is running in docker container. We have two docker
    containers: `api` container and `database` container.

#### Components

Order of testing components:

1. simple stateless components that are used in multiple places
2. components that depends on other components but not connected to Redux and don’t have any state
3. components that have internal state but are not connected to Redux
4. components that connected to Redux

##### Don’t test:

- third-party libraries
- constants
- static css styles
- related components (test only one specific component at the specific moment of time)

##### How to test:

- testing using snapshots (actual ui)
- testing logic of component (dynamic)

Snapshots allow us to compare actual UI with saved one and throw an error if it has accidentally changed. We can use flag “updateSnapshot” to update save snapshots of a component.
It is appropriate for presentational components but doesn’t cover any logic

##### What to test in components:

- Properties
- default properties
- custom properties
- Data types (use library “jest-extended”)
- Conditions (what if)
- State
- default state
- state after some event has happened
- Events
- with parameters or custom props
- without arguments

---

## Contributing

You're encouraged to contribute to our project if you've found any issues or missing functionality that you would want to see. You can add it to 'Issues' in Issue tab and after that click on 'New issue' Here you can see the list of issues in issue tab and here you can create a new issue after clicking on 'New Issue'.

Before sending any pull request, please discuss requirements/changes to be implemented using an existing issue or by creating a new one. All pull requests should be done into `develop` branch.

There are two GitHub projects: [SpaceToStudy-Client] for frontend part and admin part, [SpaceToStudy-BackEnd] for backend part. Every project has it's own issues.

Every pull request should be linked to an issue. So if you make changes on frontend, backend or admin parts you should create an issue with a link to corresponding requirement (story, task or epic).

All Pull Requests should start from prefix _#xxx-yyy_ where _xxx_ - task number and and _yyy_ - short description
e.g. #020-createAdminPanel

---

### Git flow

We have **main** , **develop** and **feature** branches.  
All **feature** branches must be merged into [develop](https://github.com/ita-social-projects/Space2Study-node-BackEnd-mvp/tree/develop) branch!!!
Only the release should merge into the main branch!!!

![Github flow](<https://wac-cdn.atlassian.com/dam/jcr:b5259cce-6245-49f2-b89b-9871f9ee3fa4/03%20(2).svg?cdnVersion=1312>)

#### Step 1

- **Option 1**

  - 👯 Clone this repo to your local machine from this repository

- **Option 2**

  - create new branch from development branch

#### Step 2

- add some commits to your new branch

#### Step 3

- 🔃 Create a new pull request in this repository.

---

### Issue flow

#### Step 1

- go to [issues] and click `New issue` button

#### Step 2

- when creating [issue] you should add name of the issue, description, choose assignee, label, project. If issue is a `User Story` you should link it with corresponding tasks, and corresponding tasks should be linked to issue.

#### Step 3

- if issue is in work it should be placed in proper column on dashboard according to its status.

---

## Teams

### Development team

[![@Tolik170](https://avatars.githubusercontent.com/u/63456632?v=4)](https://github.com/Tolik170)
[![@Mav-Ivan](https://avatars.githubusercontent.com/u/110425368?v=4)](https://github.com/Mav-Ivan)
[![@dmtrth25](https://avatars.githubusercontent.com/u/56305508?v=4)](https://github.com/dmtrth25)
[![@abalanovsky](https://avatars.githubusercontent.com/u/108689551?v=4)](https://github.com/abalanovsky)
[![@OlyaKorchan](https://avatars.githubusercontent.com/u/17857767?v=4)](https://github.com/OlyaKorchan)
[![@Marichka0406](https://avatars.githubusercontent.com/u/121502737?v=4)](https://github.com/Marichka0406)

### DevOps team

[![@abohatyrov](https://avatars.githubusercontent.com/u/52012169?v=4)](https://github.com/abohatyrov)
[![@bdeputat](https://avatars.githubusercontent.com/u/36072762?v=4)](https://github.com/bdeputat)

### Designer team

[![@Nastia197](https://avatars.githubusercontent.com/u/76164279?v=4)](https://github.com/Nastia197)

### BA team

[![@IvannaSW](https://avatars.githubusercontent.com/u/24367409?v=4)](https://github.com/IvannaSW)

### QC team

[![@AntonOkun](https://avatars.githubusercontent.com/u/129941062?v=4)](https://github.com/AntonOkun)
[![@Valent1n0o](https://avatars.githubusercontent.com/u/118978192?v=4)](https://github.com/Valent1n0o)

---

## FAQ

- **How do I do _specifically_ so and so?**
  - No problem! Just do this.

---

## Support

---

#### License

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
- Copyright 2023 © <a href="https://softserve.academy/" target="_blank"> SoftServe IT Academy</a>.

[MIT](https://choosealicense.com/licenses/mit/)

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)
