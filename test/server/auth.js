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

var userInfo = {
    email: 'testuser1@mail.com',
    firstName: 'testuser1',
    role: 'user',
    password: 'passw',
    confirmpass: 'passw',
    userGroups: [],
    status: 'active'
  };

describe('Check admin functions', function() {
  describe('Auth functions', function() {
    it('Admin login action', function(done) {
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
          Cookies = res.headers['set-cookie'].pop().split(';')[0] + `; token=${res.body.token}`;
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

    describe('Provision template manange', function() {
      var provisionTempl = {
        displayName: "testprovision",
        style: "normal",
        template: "{{#if test_boolean1}}bool1 is true, and text1 is {{test_text1}}{{/if}}",
        status: "active"
      };

      it('Create new provision template', function(done){
        var req = request(app).post(`/api/${apiVer}/provision-templates`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(provisionTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.style.should.equal('normal');
            res.body.displayName.should.equal('testprovision');

            templId = res.body._id;
            done();
          });
      });

      it('Read provision template', function(done){
        var req = request(app).get(`/api/${apiVer}/provision-templates/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.style.should.equal('normal');
            res.body.displayName.should.equal('testprovision');
            done();
          });
      });

      it('Update provision template', function(done){
        var req = request(app).put(`/api/${apiVer}/provision-templates/${templId}`);

        provisionTempl.displayName = 'testprovision2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(provisionTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.displayName.should.equal('testprovision2');
            done();
          });
      });

      it('Delete provision template', function(done){
        var req = request(app).delete(`/api/${apiVer}/provision-templates/${templId}`);

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

    describe('Document template type manange', function() {
      var documentTemplType = {
        name: "test_document_templ_type",
        description: "test_document_templ_type",
        styles: "{\n\t\"font-size\": 11,\n\t\"font-name\": \"Times New Roman\"",
        status: "active"
      };

      it('Create new document template type', function(done){
        var req = request(app).post(`/api/${apiVer}/document-template-types`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTemplType)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.styles.should.equal("{\n\t\"font-size\": 11,\n\t\"font-name\": \"Times New Roman\"");
            res.body.description.should.equal('test_document_templ_type');
            res.body.name.should.equal('test_document_templ_type');

            templId = res.body._id;
            done();
          });
      });

      it('Read document template type', function(done){
        var req = request(app).get(`/api/${apiVer}/document-template-types/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.styles.should.equal("{\n\t\"font-size\": 11,\n\t\"font-name\": \"Times New Roman\"");
            res.body.description.should.equal('test_document_templ_type');
            res.body.name.should.equal('test_document_templ_type');
            done();
          });
      });

      it('Update document template type', function(done){
        var req = request(app).put(`/api/${apiVer}/document-template-types/${templId}`);

        documentTemplType.description = 'test_document_templ_type_2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTemplType)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.styles.should.equal("{\n\t\"font-size\": 11,\n\t\"font-name\": \"Times New Roman\"");
            res.body.description.should.equal('test_document_templ_type_2');
            res.body.name.should.equal('test_document_templ_type');
            done();
          });
      });

      it('Delete document template type', function(done){
        var req = request(app).delete(`/api/${apiVer}/document-template-types/${templId}`);

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

    describe('Document template manange', function() {
      var documentTempl = {
        name: "testvariables",
        documentType: ObjectId("57fa4b5315d084efeef2ba57"),
        provisionTemplates: [ ObjectId("57fa237cd0376b53ec44ede7") ],
        status: "active"
      };

      it('Create new document template', function(done){
        var req = request(app).post(`/api/${apiVer}/document-templates`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('testvariables');
            res.body.status.should.equal('active');

            templId = res.body._id;
            done();
          });
      });

      it('Read document template', function(done){
        var req = request(app).get(`/api/${apiVer}/document-templates/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('testvariables');
            res.body.status.should.equal('active');
            done();
          });
      });

      it('Update document template', function(done){
        var req = request(app).put(`/api/${apiVer}/document-templates/${templId}`);

        documentTempl.name = 'testvariables2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('testvariables2');
            done();
          });
      });

      it('Delete document template', function(done){
        var req = request(app).delete(`/api/${apiVer}/document-templates/${templId}`);

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
    
    describe('Project template manange', function() {
      var projTempl = {
        name: "test_proj_templ",
        documentTemplates: [ ObjectId("57fa4b8215d084efeef2ba58") ],
        userGroups: [ ObjectId("58dfa5a4317b43114750c8ca") ],
        users: [],
        status: "active"
      };

      it('Create new project template', function(done){
        var req = request(app).post(`/api/${apiVer}/project-templates`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(projTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('test_proj_templ');
            res.body.status.should.equal('active');

            templId = res.body._id;
            done();
          });
      });

      it('Read project template', function(done){
        var req = request(app).get(`/api/${apiVer}/project-templates/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('test_proj_templ');
            res.body.status.should.equal('active');
            done();
          });
      });

      it('Update project template', function(done){
        var req = request(app).put(`/api/${apiVer}/project-templates/${templId}`);

        projTempl.name = 'test_proj_templ2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(projTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('test_proj_templ2');
            done();
          });
      });

      it('Delete project template', function(done){
        var req = request(app).delete(`/api/${apiVer}/project-templates/${templId}`);

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
          res.body.email.should.equal('testuser1@mail.com');
          res.body.firstName.should.equal('testuser1');
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
          res.body.email.should.equal('testuser1@mail.com');
          res.body.firstName.should.equal('testuser1');
          res.body.role.should.equal('user');
          done();
        });
    });

    it('Update user', function(done){
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
          res.body.email.should.equal('testuser2@mail.com');
          res.body.firstName.should.equal('testuser2');
          res.body.role.should.equal('user');
          done();
        });
    });

    it('Disable user', function(done){
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
          res.body.email.should.equal('testuser2@mail.com');
          res.body.firstName.should.equal('testuser2');
          res.body.role.should.equal('user');
          res.body.status.should.equal('inactive');
          done();
        });
    });
  });
});

describe('Check super functions', function() {
  describe('Auth functions', function() {
    it('Superadmin login action', function(done) {
      request(app)
        .post(`/api/${apiVer}/auth/login`)
        .set('Accept','application/json')
        .send({"email": "super@mail.com", "password": "passw"})
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.body.user.email.should.equal('super@mail.com');
          res.body.user.role.should.equal('superadmin');

          // Save the cookie to use it later to retrieve the session
          Cookies = res.headers['set-cookie'].pop().split(';')[0] + `; token=${res.body.token}`;
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

    describe('Provision template manange', function() {
      var provisionTempl = {
        displayName: "testprovision",
        style: "normal",
        template: "{{#if test_boolean1}}bool1 is true, and text1 is {{test_text1}}{{/if}}",
        status: "active"
      };

      it('Create new provision template', function(done){
        var req = request(app).post(`/api/${apiVer}/provision-templates`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(provisionTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.style.should.equal('normal');
            res.body.displayName.should.equal('testprovision');

            templId = res.body._id;
            done();
          });
      });

      it('Read provision template', function(done){
        var req = request(app).get(`/api/${apiVer}/provision-templates/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.style.should.equal('normal');
            res.body.displayName.should.equal('testprovision');
            done();
          });
      });

      it('Update provision template', function(done){
        var req = request(app).put(`/api/${apiVer}/provision-templates/${templId}`);

        provisionTempl.displayName = 'testprovision2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(provisionTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.displayName.should.equal('testprovision2');
            done();
          });
      });

      it('Delete provision template', function(done){
        var req = request(app).delete(`/api/${apiVer}/provision-templates/${templId}`);

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

    describe('Document template type manange', function() {
      var documentTemplType = {
        name: "test_document_templ_type",
        description: "test_document_templ_type",
        styles: "{\n\t\"font-size\": 11,\n\t\"font-name\": \"Times New Roman\"",
        status: "active"
      };

      it('Create new document template type', function(done){
        var req = request(app).post(`/api/${apiVer}/document-template-types`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTemplType)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.styles.should.equal("{\n\t\"font-size\": 11,\n\t\"font-name\": \"Times New Roman\"");
            res.body.description.should.equal('test_document_templ_type');
            res.body.name.should.equal('test_document_templ_type');

            templId = res.body._id;
            done();
          });
      });

      it('Read document template type', function(done){
        var req = request(app).get(`/api/${apiVer}/document-template-types/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.styles.should.equal("{\n\t\"font-size\": 11,\n\t\"font-name\": \"Times New Roman\"");
            res.body.description.should.equal('test_document_templ_type');
            res.body.name.should.equal('test_document_templ_type');
            done();
          });
      });

      it('Update document template type', function(done){
        var req = request(app).put(`/api/${apiVer}/document-template-types/${templId}`);

        documentTemplType.description = 'test_document_templ_type_2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTemplType)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.styles.should.equal("{\n\t\"font-size\": 11,\n\t\"font-name\": \"Times New Roman\"");
            res.body.description.should.equal('test_document_templ_type_2');
            res.body.name.should.equal('test_document_templ_type');
            done();
          });
      });

      it('Delete document template type', function(done){
        var req = request(app).delete(`/api/${apiVer}/document-template-types/${templId}`);

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

    describe('Document template manange', function() {
      var documentTempl = {
        name: "testvariables",
        documentType: ObjectId("57fa4b5315d084efeef2ba57"),
        provisionTemplates: [ ObjectId("57fa237cd0376b53ec44ede7") ],
        status: "active"
      };

      it('Create new document template', function(done){
        var req = request(app).post(`/api/${apiVer}/document-templates`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('testvariables');
            res.body.status.should.equal('active');

            templId = res.body._id;
            done();
          });
      });

      it('Read document template', function(done){
        var req = request(app).get(`/api/${apiVer}/document-templates/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('testvariables');
            res.body.status.should.equal('active');
            done();
          });
      });

      it('Update document template', function(done){
        var req = request(app).put(`/api/${apiVer}/document-templates/${templId}`);

        documentTempl.name = 'testvariables2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('testvariables2');
            done();
          });
      });

      it('Delete document template', function(done){
        var req = request(app).delete(`/api/${apiVer}/document-templates/${templId}`);

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
    
    describe('Project template manange', function() {
      var projTempl = {
        name: "test_proj_templ",
        documentTemplates: [ ObjectId("57fa4b8215d084efeef2ba58") ],
        userGroups: [ ObjectId("58dfa5a4317b43114750c8ca") ],
        users: [],
        status: "active"
      };

      it('Create new project template', function(done){
        var req = request(app).post(`/api/${apiVer}/project-templates`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(projTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('test_proj_templ');
            res.body.status.should.equal('active');

            templId = res.body._id;
            done();
          });
      });

      it('Read project template', function(done){
        var req = request(app).get(`/api/${apiVer}/project-templates/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('test_proj_templ');
            res.body.status.should.equal('active');
            done();
          });
      });

      it('Update project template', function(done){
        var req = request(app).put(`/api/${apiVer}/project-templates/${templId}`);

        projTempl.name = 'test_proj_templ2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(projTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('test_proj_templ2');
            done();
          });
      });

      it('Delete project template', function(done){
        var req = request(app).delete(`/api/${apiVer}/project-templates/${templId}`);

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
          res.body.email.should.equal('testuser1@mail.com');
          res.body.firstName.should.equal('testuser1');
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
          res.body.email.should.equal('testuser1@mail.com');
          res.body.firstName.should.equal('testuser1');
          res.body.role.should.equal('user');
          done();
        });
    });

    it('Update user', function(done){
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
          res.body.email.should.equal('testuser2@mail.com');
          res.body.firstName.should.equal('testuser2');
          res.body.role.should.equal('user');
          done();
        });
    });

    it('Disable user', function(done){
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
          res.body.email.should.equal('testuser2@mail.com');
          res.body.firstName.should.equal('testuser2');
          res.body.role.should.equal('user');
          res.body.status.should.equal('inactive');
          done();
        });
    });
  });
});

describe('Check author functions', function() {
  describe('Auth functions', function() {
    it('Author login action', function(done) {
      request(app)
        .post(`/api/${apiVer}/auth/login`)
        .set('Accept','application/json')
        .send({"email": "author@mail.com", "password": "passw"})
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.body.user.email.should.equal('author@mail.com');
          res.body.user.role.should.equal('author');

          // Save the cookie to use it later to retrieve the session
          Cookies = res.headers['set-cookie'].pop().split(';')[0] + `; token=${res.body.token}`;
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

      it('Author cannot delete term template', function(done){
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

      it('Create new provision template', function(done){
        var req = request(app).post(`/api/${apiVer}/provision-templates`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(provisionTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.style.should.equal('normal');
            res.body.displayName.should.equal('testprovision');

            templId = res.body._id;
            done();
          });
      });

      it('Read provision template', function(done){
        var req = request(app).get(`/api/${apiVer}/provision-templates/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.style.should.equal('normal');
            res.body.displayName.should.equal('testprovision');
            done();
          });
      });

      it('Update provision template', function(done){
        var req = request(app).put(`/api/${apiVer}/provision-templates/${templId}`);

        provisionTempl.displayName = 'testprovision2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(provisionTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.displayName.should.equal('testprovision2');
            done();
          });
      });

      it('Author cannot delete provision template', function(done){
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

      it('Create new document template type', function(done){
        var req = request(app).post(`/api/${apiVer}/document-template-types`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTemplType)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.styles.should.equal("{\n\t\"font-size\": 11,\n\t\"font-name\": \"Times New Roman\"");
            res.body.description.should.equal('test_document_templ_type');
            res.body.name.should.equal('test_document_templ_type');

            templId = res.body._id;
            done();
          });
      });

      it('Read document template type', function(done){
        var req = request(app).get(`/api/${apiVer}/document-template-types/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.styles.should.equal("{\n\t\"font-size\": 11,\n\t\"font-name\": \"Times New Roman\"");
            res.body.description.should.equal('test_document_templ_type');
            res.body.name.should.equal('test_document_templ_type');
            done();
          });
      });

      it('Update document template type', function(done){
        var req = request(app).put(`/api/${apiVer}/document-template-types/${templId}`);

        documentTemplType.description = 'test_document_templ_type_2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTemplType)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.styles.should.equal("{\n\t\"font-size\": 11,\n\t\"font-name\": \"Times New Roman\"");
            res.body.description.should.equal('test_document_templ_type_2');
            res.body.name.should.equal('test_document_templ_type');
            done();
          });
      });

      it('Author cannot delete document template type', function(done){
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

      it('Create new document template', function(done){
        var req = request(app).post(`/api/${apiVer}/document-templates`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('testvariables');
            res.body.status.should.equal('active');

            templId = res.body._id;
            done();
          });
      });

      it('Read document template', function(done){
        var req = request(app).get(`/api/${apiVer}/document-templates/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('testvariables');
            res.body.status.should.equal('active');
            done();
          });
      });

      it('Update document template', function(done){
        var req = request(app).put(`/api/${apiVer}/document-templates/${templId}`);

        documentTempl.name = 'testvariables2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(documentTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('testvariables2');
            done();
          });
      });

      it('Author cannot delete document template', function(done){
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

      it('Create new project template', function(done){
        var req = request(app).post(`/api/${apiVer}/project-templates`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(projTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('test_proj_templ');
            res.body.status.should.equal('active');

            templId = res.body._id;
            done();
          });
      });

      it('Read project template', function(done){
        var req = request(app).get(`/api/${apiVer}/project-templates/${templId}`);

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('test_proj_templ');
            res.body.status.should.equal('active');
            done();
          });
      });

      it('Update project template', function(done){
        var req = request(app).put(`/api/${apiVer}/project-templates/${templId}`);

        projTempl.name = 'test_proj_templ2';

        // Set cookie to get saved user session
        req.cookies = Cookies;
        req.set('Accept','application/json')
          .send(projTempl)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            res.body.name.should.equal('test_proj_templ2');
            done();
          });
      });

      it('Author cannot delete project template', function(done){
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
});