# celant
TODO


### Used packages
 - Backend - `express`
 - Frontend - `angular v1.x`
 - CSS preprocessor - `styl`
 - CSS framework - `boostrap`
 - View engine - `jade`
 - Database - `mongodb`
 - Promises - `bluebird`
 - Task runner - `gulp`
 - JS linter - `jshint`
 - Testing - `mocha`, `should`, `supertest`, `sinon`
 - Logger - `winston, express-winston`


### How to use
1. Clone this repository.
2. Install dependencies: `npm i`
3. Configure database (here - `config/environment/development.json`)


### Commands

```sh
# Install dependencies
$ npm i
# Build frontend:
$ npm run build # build development version
$ npm run build:production # build production version
# Run tests (one of the commands):
$ gulp test # run all tests
$ gulp test --grep 'test-name'
$ gulp test --filter 'path to test file/folder'
# Run code coverage tool:
$ gulp coverage
# Run jshint tool (one of the commands):
$ gulp lint # check all sources
$ gulp lint --filter 'path to source file/folder'
$ gulp lint-server # check server sources
$ gulp lint-test # check test sources
# Start app and watch for changes:
$ npm start
```

### Service structure
- [config] - app configuration options
- [client]
  - [app]
    - [controllers]
    - [directives]
    - [resources]
    - [util]
  - [css]
  - [images]
  - [views]
- [server]
  - [controllers] - controllers
  - [db] - database manager and models
  - [data-services] - local data services
  - [routes] - API end points
  - [services] - remote service wrappers
  - [util]
    - [validation-util] - validation utils
    - [logger] - app logger
- [tasks] - gulp tasks
- [test] - unit and functional tests

### License
TODO

### Authors
**Alexander Mac** ([amatsibarov@gmail.com](mailto:amatsibarov@gmail.com))
