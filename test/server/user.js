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

      it('User cannot create new term template', function(done){
        var req = request(app).post(`/api/${apiVer}/term-templates`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(termTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.reason.should.equal('Access denied');

            templId = "58e65eae35dc110d1c525852";
            done();
          });
      });

      it('User cannot update term template', function(done){
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
            res.body.reason.should.equal('Access denied');
            done();
          });
      });

      it('User cannot delete term template', function(done){
        var req = request(app).delete(`/api/${apiVer}/term-templates/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.reason.should.equal('Access denied');
            done();
          });
      });
    });

    describe('Provision template manange', function() {
      var provisionTempl = {
        displayName: "testprovision",
        style: "normal",
        template: "{{#if test_boolean1}}bool1 is true, and text1 is {{test_text1}}{{/if}}",
        status: "active"
      };

      it('User cannot create new provision template', function(done){
        var req = request(app).post(`/api/${apiVer}/provision-templates`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(provisionTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.reason.should.equal('Access denied');

            templId = "57fa237cd0376b53ec44ede7";
            done();
          });
      });

      it('User cannot update provision template', function(done){
        var req = request(app).put(`/api/${apiVer}/provision-templates/${templId}`);

        provisionTempl.displayName = 'testprovision2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(provisionTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.reason.should.equal('Access denied');
            done();
          });
      });

      it('User cannot delete provision template', function(done){
        var req = request(app).delete(`/api/${apiVer}/provision-templates/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.reason.should.equal('Access denied');
            done();
          });
      });
    });

    describe('Document template type manange', function() {
      var documentTemplType = {
        name: "test_document_templ_type",
        description: "test_document_templ_type",
        styles: "{\n\t\"font-size\": 11,\n\t\"font-name\": \"Times New Roman\"",
        status: "active"
      };

      it('User cannot create new document template type', function(done){
        var req = request(app).post(`/api/${apiVer}/document-template-types`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTemplType)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.reason.should.equal('Access denied');

            templId = "57fa4b5315d084efeef2ba57";
            done();
          });
      });

      it('User cannot update document template type', function(done){
        var req = request(app).put(`/api/${apiVer}/document-template-types/${templId}`);

        documentTemplType.description = 'test_document_templ_type_2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTemplType)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.reason.should.equal('Access denied');
            done();
          });
      });

      it('User cannot delete document template type', function(done){
        var req = request(app).delete(`/api/${apiVer}/document-template-types/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.reason.should.equal('Access denied');
            done();
          });
      });
    });

    describe('Document template manange', function() {
      var documentTempl = {
        name: "testvariables",
        documentType: ObjectId("57fa4b5315d084efeef2ba57"),
        provisionTemplates: [ ObjectId("57fa237cd0376b53ec44ede7") ],
        status: "active"
      };

      it('User cannot create new document template', function(done){
        var req = request(app).post(`/api/${apiVer}/document-templates`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.reason.should.equal('Access denied');

            templId = "57fa4b8215d084efeef2ba58";
            done();
          });
      });

      it('User cannot update document template', function(done){
        var req = request(app).put(`/api/${apiVer}/document-templates/${templId}`);

        documentTempl.name = 'testvariables2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.reason.should.equal('Access denied');
            done();
          });
      });

      it('User cannot delete document template', function(done){
        var req = request(app).delete(`/api/${apiVer}/document-templates/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.reason.should.equal('Access denied');
            done();
          });
      });
    });
    
    describe('Project template manange', function() {
      var projTempl = {
        name: "test_proj_templ",
        documentTemplates: [ ObjectId("57fa4b8215d084efeef2ba58") ],
        userGroups: [ ObjectId("58dfa5a4317b43114750c8ca") ],
        users: [],
        status: "active"
      };

      it('User cannot create new project template', function(done){
        var req = request(app).post(`/api/${apiVer}/project-templates`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(projTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.reason.should.equal('Access denied');

            templId = "58e66c5a35dc110d1c52585c";
            done();
          });
      });

      it('User cannot update project template', function(done){
        var req = request(app).put(`/api/${apiVer}/project-templates/${templId}`);

        projTempl.name = 'test_proj_templ2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(projTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.reason.should.equal('Access denied');
            done();
          });
      });

      it('User cannot delete project template', function(done){
        var req = request(app).delete(`/api/${apiVer}/project-templates/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.reason.should.equal('Access denied');
            done();
          });
      });
    });
  });

  describe('User manage', function() {
    var userId;
    var userInfo = {
      email: 'testuser1@mail.com',
      firstName: 'testuser1',
      role: 'user',
      password: 'passw',
      confirmpass: 'passw',
      userGroups: [],
      status: 'active'
    };

    it('User cannot create new user', function(done){
      var req = request(app).post(`/api/${apiVer}/users`);

      // Set cookie to get saved user session
      req.cookies = Cookies;
      req.set('Accept','application/json')
        .send(userInfo)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.body.reason.should.equal('Access denied');

          userId = "58e3b97be3cb4a2052c05e53";
          done();
        });
    });

    it('User cannot update user', function(done){
      var req = request(app).put(`/api/${apiVer}/users/${userId}`);
      var tempUserInfo = _.assign({}, userInfo);
      tempUserInfo.email = 'testuser2@mail.com';
      tempUserInfo.firstName = 'testuser2';

      // Set cookie to get saved user session
      req.cookies = Cookies;
      req.set('Accept','application/json')
        .send(tempUserInfo)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.body.reason.should.equal('Access denied');
          done();
        });
    });

    it('User cannot disable user', function(done){
      var req = request(app).put(`/api/${apiVer}/users/${userId}`);
      var tempUserInfo = _.assign({}, userInfo);
      tempUserInfo.email = 'testuser2@mail.com';
      tempUserInfo.firstName = 'testuser2';
      tempUserInfo.status = 'inactive';

      // Set cookie to get saved user session
      req.cookies = Cookies;
      req.set('Accept','application/json')
        .send(tempUserInfo)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.body.reason.should.equal('Access denied');
          done();
        });
    });
  });
});