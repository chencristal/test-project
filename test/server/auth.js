'use strict';

var _           = require('lodash');
var request     = require('supertest');
// var mongoose    = require('mongoose');
var should      = require('should');
var app         = require('../../server/app');
var usersSrvc   = require('../../server/data-services/users');
var config      = require('../../config/environment');

var apiVer = config.get('api:version');
var Cookies, authToken;

var adminInfo = {
    email: 'admin@mail.com',
    firstName: 'admin',
    role: 'admin',
    password: 'passw',
    confirmpass: 'passw',
    userGroups: [],
    status: 'active'
  };

var userInfo = {
    email: 'user1@mail.com',
    firstName: 'user1',
    role: 'user',
    password: 'passw',
    confirmpass: 'passw',
    userGroups: [],
    status: 'active'
  };

describe('Create user accounts first', function() {
  it('Admin account', function(done) {
    usersSrvc
      .createUser(adminInfo)
      .then(user => {
        user.email.should.equal('admin@mail.com');
        user.firstName.should.equal('admin');
        user.role.should.equal('admin');
        
        done();
      })
      .catch(done);
  });
});

describe('Check admin functions', function() {
  describe('Auth functions', function() {
    it('Login action', function(done) {
      request(app)
        .post(`/api/${apiVer}/auth/login`)
        .set('Accept','application/json')
        .send({"email": "admin@mail.com", "password": "passw"})
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.body.user.email.should.equal('admin@mail.com');
          res.body.user.role.should.equal('admin');

          // Save the cookie to use it later to retrieve the session
          authToken = res.body.token;
          Cookies = res.headers['set-cookie'].pop().split(';')[0] + `; token=${authToken}`;
          done();
        });
    });
  });

  describe('Template manange', function() {
    var templId;

    describe('Term template manange', function() {
      var termTempl = {
        text: {placeholder: "hello world"}, 
        textarea: {style: "auto"},
        boolean: {
          default: true, 
          inclusionText: "Include", 
          exclusionText: "Exclude"
        }, 
        variant: {
          "options":[],
          "displayAs":"dropdown"
        },
        date: {default: "2017-04-17T20:13:18.139Z"},
        termType: "text",
        variable: "text1",
        displayName: "text1"
      };

      it('Create new term template', function(done){
        var req = request(app).post(`/api/${apiVer}/term-templates`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(termTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.termType.should.equal('text');
            res.body.variable.should.equal('text1');
            res.body.displayName.should.equal('text1');

            templId = res.body._id;
            done();
          });
      });

      it('Read term template', function(done){
        var req = request(app).get(`/api/${apiVer}/term-templates/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.termType.should.equal('text');
            res.body.variable.should.equal('text1');
            res.body.displayName.should.equal('text1');
            done();
          });
      });

      it('Update term template', function(done){
        var req = request(app).put(`/api/${apiVer}/term-templates/${templId}`);

        termTempl.displayName = 'test_text';
        termTempl.text.placeholder = 'Hello World, Hello World';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(termTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.displayName.should.equal('test_text');
            res.body.text.placeholder.should.equal('Hello World, Hello World');
            done();
          });
      });

      it('Delete term template', function(done){
        var req = request(app).delete(`/api/${apiVer}/term-templates/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.should.equal(true);
            done();
          });
      });
    });

    describe('Project template manange', function() {});
    describe('Document template manange', function() {});
    describe('Document template type manange', function() {});
    describe('Provision template manange', function() {});
    
  });

  describe('User manage', function() {
    var userId;

    it('Create new user', function(done){
      var req = request(app).post(`/api/${apiVer}/users`);

      // Set cookie to get saved user session
      req.cookies = Cookies;
      req.set('Accept','application/json')
        .send(userInfo)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.body.email.should.equal('user1@mail.com');
          res.body.firstName.should.equal('user1');
          res.body.role.should.equal('user');

          userId = res.body._id;
          done();
        });
    });

    it('Read user', function(done){
      var req = request(app).get(`/api/${apiVer}/users/${userId}`);

      // Set cookie to get saved user session
      req.cookies = Cookies;
      req.set('Accept','application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.body.email.should.equal('user1@mail.com');
          res.body.firstName.should.equal('user1');
          res.body.role.should.equal('user');
          done();
        });
    });

    it('Update user', function(done){
      var req = request(app).put(`/api/${apiVer}/users/${userId}`);

      userInfo.email = 'user2@mail.com';
      userInfo.firstName = 'user2';

      // Set cookie to get saved user session
      req.cookies = Cookies;
      req.set('Accept','application/json')
        .send(userInfo)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.body.email.should.equal('user2@mail.com');
          res.body.firstName.should.equal('user2');
          res.body.role.should.equal('user');
          done();
        });
    });

    it('Disable user', function(done){
      var req = request(app).put(`/api/${apiVer}/users/${userId}`);

      userInfo.email = 'user2@mail.com';
      userInfo.firstName = 'user2';
      userInfo.status = 'inactive';

      // Set cookie to get saved user session
      req.cookies = Cookies;
      req.set('Accept','application/json')
        .send(userInfo)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.body.email.should.equal('user2@mail.com');
          res.body.firstName.should.equal('user2');
          res.body.role.should.equal('user');
          res.body.status.should.equal('inactive');
          done();
        });
    });
  });
});
