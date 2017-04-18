'use strict';

var _           = require('lodash');
var request     = require('supertest');
var mongoose    = require('mongoose');
var should      = require('should');
var app         = require('../../server/app');
var config      = require('../../config/environment');

var apiVer = config.get('api:version');
var ObjectId = mongoose.Types.ObjectId;
var Cookies;

describe('Check user functions', function() {
  describe('Auth functions', function() {
    it('User login action (user2)', function(done) {
      request(app)
        .post(`/api/${apiVer}/auth/login`)
        .set('Accept','application/json')
        .send({"email": "user2@mail.com", "password": "passw"})
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.body.user.email.should.equal('user2@mail.com');
          res.body.user.role.should.equal('user');

          // Save the cookie to use it later to retrieve the session
          Cookies = res.headers['set-cookie'].pop().split(';')[0] + `; token=${res.body.token}`;
          done();
        });
    });
  });

  describe('Project manange', function() {
    var projId, 
        docTypeId = "57fa4b5315d084efeef2ba57",
        docId = "57fa4b8215d084efeef2ba58"; // Variables

    describe('user can CRUD, share and export projects', function() {
      var proj = {
        "name" : "Test Project",
        "projectTemplate" : ObjectId("58e66c5a35dc110d1c52585c"),
        "sharedUserGroups" : [],
        "sharedUsers" : []
      };

      it('Create new project', function(done){
        var req = request(app).post(`/api/${apiVer}/projects`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(proj)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('Test Project');

            projId = res.body._id;
            done();
          });
      });

      it('Read project', function(done){
        var req = request(app).get(`/api/${apiVer}/projects/${projId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('Test Project');
            done();
          });
      });

      it('Update project', function(done){
        var req = request(app).put(`/api/${apiVer}/projects/${projId}`);

        var tempProj = _.assign({}, proj);
        tempProj.name = 'Test Project Again';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(tempProj)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('Test Project Again');
            done();
          });
      });

      it('Share project with user1', function(done){
        var req = request(app).put(`/api/${apiVer}/projects/${projId}`);

        var tempProj = _.assign({}, proj);
        tempProj.sharedUsers = [ ObjectId("57fa20920cb5ff30ec857430") ];

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(tempProj)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('Test Project');
            done();
          });
      });
    
      it('User shared project can edit project', function(done) {
        // Login with user1
        request(app)
          .post(`/api/${apiVer}/auth/login`)
          .set('Accept','application/json')
          .send({"email": "user1@mail.com", "password": "passw"})
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.user.email.should.equal('user1@mail.com');
            res.body.user.role.should.equal('user');

            // Save the cookie to use it later to retrieve the session
            Cookies = res.headers['set-cookie'].pop().split(';')[0] + `; token=${res.body.token}`;
            var req = request(app).get(`/api/${apiVer}/projects/${projId}`);

            // Set cookie to get saved user session
            req.cookies = Cookies;
            req.set('Accept','application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function (err, res) {
                res.body.name.should.equal('Test Project');
                
                // Login with user2 again
                request(app)
                  .post(`/api/${apiVer}/auth/login`)
                  .set('Accept','application/json')
                  .send({"email": "user2@mail.com", "password": "passw"})
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end(function (err, res) {
                    res.body.user.email.should.equal('user2@mail.com');
                    res.body.user.role.should.equal('user');

                    Cookies = res.headers['set-cookie'].pop().split(';')[0] + `; token=${res.body.token}`;
                    done();
                  });
              });
          });
      });

      it('Get clean pdf', function(done){
        var req = request(app).get(`/api/${apiVer}/projects/${projId}/${docId}/pdf/edit`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/pdf')
          .expect(200)
          .end(function (err, res) {
            var contentType = res.headers['content-type'];
            contentType.should.equal('application/pdf');
            done();
          });
      });

      it('Get redline pdf', function(done){
        var req = request(app).get(`/api/${apiVer}/projects/${projId}/${docId}/pdf/redline`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/pdf')
          .expect(200)
          .end(function (err, res) {
            var contentType = res.headers['content-type'];
            contentType.should.equal('application/pdf');
            done();
          });
      });

      it('Get clean docx', function(done){
        var req = request(app).get(`/api/${apiVer}/projects/${projId}/${docId}/${docTypeId}/word/edit`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/docx')
          .expect(200)
          .end(function (err, res) {
            var contentType = res.headers['content-type'];
            contentType.should.equal('application/docx');
            done();
          });
      });

      it('Get redline docx', function(done){
        var req = request(app).get(`/api/${apiVer}/projects/${projId}/${docId}/${docTypeId}/word/redline`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/docx')
          .expect(200)
          .end(function (err, res) {
            var contentType = res.headers['content-type'];
            contentType.should.equal('application/docx');
            done();
          });
      });

      it('Delete project', function(done){
        var req = request(app).delete(`/api/${apiVer}/projects/${projId}`);

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
  });
});