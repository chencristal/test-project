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
          Cookies = res.headers['set-cookie'].pop().split(';')[0];
          done();
        });
    });
  });

  describe('User manage', function() {
    var userId;

    it('Create new user', function(done){
      var req = request(app).post(`/api/${apiVer}/users`);

      // Set cookie to get saved user session
      req.cookies = Cookies + `; token=${authToken}`;
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
      req.cookies = Cookies + `; token=${authToken}`;
      req.set('Accept','application/json')
        .send(userInfo)
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
      req.cookies = Cookies + `; token=${authToken}`;
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
      req.cookies = Cookies + `; token=${authToken}`;
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
