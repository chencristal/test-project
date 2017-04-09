'use strict';

/* jshint maxlen: false */
/* jshint quotmark: false */
/* jshint newcap: false */

var _                    = require('lodash');
var mongoose             = require('mongoose');
var db                   = require('./');
var log                  = require('../util/logger').logger;
var User                 = mongoose.model('user');
var UserGroup            = mongoose.model('userGroup');
var TermTemplate         = mongoose.model('termTemplate');
var ProvisionTemplate    = mongoose.model('provisionTemplate');
var DocumentTemplateType = mongoose.model('documentTemplateType');
var DocumentTemplate     = mongoose.model('documentTemplate');
var ProjectTemplate      = mongoose.model('projectTemplate');
var Project              = mongoose.model('project');
var ObjectId             = mongoose.Types.ObjectId;

function clearDb() {
  var ops = _(mongoose.models)
    .keys()
    .map(modelName => mongoose.model(modelName).remove())
    .value();

  return Promise.all(ops);
}

function insertUsers() {
  var users = [
    { "_id" : ObjectId("57fa20920cb5ff30ec85742f"), "firstName" : "super", "email" : "super@mail.com", "hashedPassword" : "6nvd0F9sEW7yEvjeqT1XC2HO14Knw2Ow2OEJMKhCaSDjtnVftwFohGQ48PSVX5Tl8gFiX4J3HhCzuOkb+iS1Xg==", "salt" : "eTxOoNgYA4kBTQb0Z3JJKQ==", "status" : "active", "invited" : false, "provider" : "local", "role" : "superadmin", "urlLogin": true },
    { "_id" : ObjectId("58e3b961e3cb4a2052c05e51"), "firstName" : "admin", "email" : "admin@mail.com", "hashedPassword" : "NxRNMJS8nuDlZcVOT3jq/MO7jhZh8xYRiNVkdLQ+Kn+XB5M8OQNgCqZBDVEE8NlX9aBNJ5MqRzcpXg895rp/Og==", "salt" : "3AYnT4W4brcXjrBTBQSFxA==", "status" : "active", "invited" : false, "provider" : "local", "role" : "admin", "urlLogin": false },
    { "_id" : ObjectId("58e3b970e3cb4a2052c05e52"), "firstName" : "author", "email" : "author@mail.com", "hashedPassword" : "5RQz9ZH+xZMDp3izVntFJ4n6fmEtj/lRs7sITLRiINvqYi/yVDFxh4bouloGWIHkKzPiMJ8sNwBmemFYijOf6Q==", "salt" : "VZNIO6RKPjRbufU1X3mMbw==", "status" : "active", "invited" : false, "provider" : "local", "role" : "author", "urlLogin": false },
    { "_id" : ObjectId("57fa20920cb5ff30ec857430"), "firstName" : "user1", "email" : "user1@mail.com", "hashedPassword" : "xKd3xarlKs8fn0iINhD5k0ex5hm4z3ctq1Q6tgsSV8Urogr/qAukddTmN9Pxjrsvfk4DQxAncSbKAFz/k/8GbA==", "salt" : "+zP2BiBaskkh9hXKzh5L5w==", "status" : "active", "invited" : false, "provider" : "local", "role" : "user", "urlLogin": false },
    { "_id" : ObjectId("57fa20920cb5ff30ec857431"), "firstName" : "user2", "email" : "user2@mail.com", "hashedPassword" : "Tp8ipKT2vyk3n+P3lzat5+HF62JAg2Uf/CkwQgUA2SV9Sn0unts1r/1WpXSxuWgsVOC3x7YdxQrGGDfh+n1HIg==", "salt" : "20tfkVec7bQymdcpecBLDg==", "status" : "active", "invited" : false, "provider" : "local", "role" : "user", "urlLogin": false },
    { "_id" : ObjectId("58e3b97be3cb4a2052c05e53"), "firstName" : "guest", "email" : "guest@mail.com", "hashedPassword" : "93bPpjbeD1hyCC4qF9YAsN8xiNfPoWkXQkabUwu3hFbPJN1yDHthuU1vyoiDoBf3n71jXhOm7nQm1dSUQR2AjQ==", "salt" : "QI6rEfxQlaoKpfmfDto+9A==", "status" : "active", "invited" : false, "provider" : "local", "role" : "user", "urlLogin": true }
  ];
  return User.create(users);
}

function insertUserGroups() {
  var userGroups = [
    { "_id" : ObjectId("58dfa5a4317b43114750c8ca"), "groupName" : "All Users", "status" : "active", "allUsers" : true, "provider" : "local", "role" : "user" },
    { "_id" : ObjectId("58dfa5a4317b43114750c8cb"), "groupName" : "All Authors", "status" : "active", "allUsers" : true, "provider" : "local", "role" : "author" }
  ];
  return UserGroup.create(userGroups);
}

function insertTermTemplates() {
  var termtemplates = [
    {
        "_id" : ObjectId("58e65eae35dc110d1c525852"),
        "boolean" : {
            "default" : true,
            "exclusionText" : "Exclude",
            "inclusionText" : "Include"
        },
        "disabled" : false,
        "displayName" : "Text Input 1",
        "help" : "<p style=\"text-align: left;\">Simple text variable. Such variable is displayed as input element on properties editor and main text area.​</p>",
        "state" : 0,
        "termType" : "text",
        "text" : {
            "placeholder" : "[Text Variable 1]"
        },
        "textarea" : {
            "style" : "auto"
        },
        "variable" : "test_text1",
        "variant" : {
            "displayAs" : "dropdown",
            "options" : []
        }
    },
    {
        "_id" : ObjectId("58e65ed435dc110d1c525853"),
        "boolean" : {
            "default" : true,
            "exclusionText" : "Exclude",
            "inclusionText" : "Include"
        },
        "disabled" : false,
        "displayName" : "Test Input 2",
        "help" : "<p>Simple text variable. Such variable is displayed as input element on properties editor and main text area.<br/></p>",
        "state" : 0,
        "termType" : "text",
        "text" : {
            "placeholder" : "[Text Variable 2]"
        },
        "textarea" : {
            "style" : "auto"
        },
        "variable" : "test_text2",
        "variant" : {
            "displayAs" : "dropdown",
            "options" : []
        }
    },
    {
        "_id" : ObjectId("58e65fc935dc110d1c525854"),
        "boolean" : {
            "default" : true,
            "exclusionText" : "Exclude",
            "inclusionText" : "Include"
        },
        "disabled" : false,
        "displayName" : "Text Plus 1",
        "help" : "<p>Text Plus allows Users to create a new sub-text field.  This is helpful when multiple entities/parties are involved.  The Admin/Author can optionally select to include a new line and/or add commas and penultimate &#34;and&#34; to allow for prettified style.  This initial option can be overridden by use of the function {{expand &lt;name_of_text_plus_variable&gt;}} in the Provision Template.</p>",
        "state" : 0,
        "termType" : "textplus",
        "textarea" : {
            "style" : "auto"
        },
        "textplus" : {
            "placeholder" : "[Text Plus 1]",
            "prettify" : true
        },
        "variable" : "test_text_plus1",
        "variant" : {
            "displayAs" : "dropdown",
            "options" : []
        }
    },
    {
        "_id" : ObjectId("58e6605b35dc110d1c525855"),
        "boolean" : {
            "default" : true,
            "exclusionText" : "Exclude",
            "inclusionText" : "Include"
        },
        "disabled" : false,
        "displayName" : "Text Area 1",
        "help" : "<p>The Text Area allows Users to input multiple lines of text.  The Admin/Author is able to specify the number of initial rows, and whether the Text Area automatically increases in size to accommodate more lines of text or remain the same size such that if more lines of text is inserted, a scroll bar appears.</p>",
        "state" : 0,
        "termType" : "textarea",
        "textarea" : {
            "rows" : 2,
            "style" : "auto"
        },
        "variable" : "test_text_area1",
        "variant" : {
            "displayAs" : "dropdown",
            "options" : []
        }
    },
    {
        "_id" : ObjectId("58e6618f35dc110d1c525856"),
        "boolean" : {
            "default" : true,
            "exclusionText" : "Exclude",
            "inclusionText" : "Include"
        },
        "disabled" : false,
        "displayName" : "Boolean 1",
        "help" : "<p>The Boolean by itself (without being inserted into an #if expression), will show up as a Radio button on the left input panel and will appear as a drop-down in the actual body middle panel.  The Admin/Author is able to set the Inclusion Text and Exclusion Text as appropriate (the default texts are &#34;Include&#34; and &#34;Exclude&#34; respectively).  </p><p>When it is inserted within an #if expression, the text within the expression will appear if the Boolean is true.  It will disappear if it is false.  The redline mode view will appropriately show such deletions and insertions, based on the default value of the Boolean.  </p><p></p><p>This Boolean's default value is TRUE. </p><p></p>",
        "state" : 0,
        "termType" : "boolean",
        "textarea" : {
            "style" : "auto"
        },
        "variable" : "test_boolean1",
        "variant" : {
            "displayAs" : "dropdown",
            "options" : []
        }
    },
    {
        "_id" : ObjectId("58e6663f35dc110d1c525857"),
        "boolean" : {
            "default" : false,
            "exclusionText" : "False",
            "inclusionText" : "True"
        },
        "disabled" : false,
        "displayName" : "Boolean 2",
        "help" : "<p style=\"font-size: 14px;\">The Boolean by itself (without being inserted into an #if expression), will show up as a Radio button on the left input panel and will appear as a drop-down in the actual body middle panel.  The Admin/Author is able to set the Inclusion Text and Exclusion Text as appropriate (the default texts are &#34;Include&#34; and &#34;Exclude&#34; respectively).  </p><p style=\"font-size: 14px;\">When it is inserted within an #if expression, the text within the expression will appear if the Boolean is true.  It will disappear if it is false.  The redline mode view will appropriately show such deletions and insertions, based on the default value of the Boolean.  </p><p style=\"font-size: 14px;\">This Boolean's default value is FALSE.   The Inclusion and Exclusion text were changed from True and False respectively. </p>",
        "state" : 0,
        "termType" : "boolean",
        "textarea" : {
            "style" : "auto"
        },
        "variable" : "test_boolean2",
        "variant" : {
            "displayAs" : "dropdown",
            "options" : []
        }
    },
    {
        "_id" : ObjectId("58e6674c35dc110d1c525858"),
        "boolean" : {
            "default" : true,
            "exclusionText" : "Exclude",
            "inclusionText" : "Include"
        },
        "disabled" : false,
        "displayName" : "Test Variant 1",
        "help" : "<p>Variant Term Template allows Admin/Author to create a multiple choice question with more than 2 choices (which can be done by Boolean Term Template).  In a stand alone option, it appears either as dropdown or radio button in the left input panel and dropdown in the middle panel.  If used within the #if expression, the embedded text will appear when the matching option is chosen.  Otherwise, it will disappear.  In the redline view mode, the app will display the redline appropriately based on the default value.</p><p>Please be careful with matching the <b>Option text exactly</b>.  It is case sensitive.  Otherwise, it will not 'match'.   </p>",
        "state" : 0,
        "termType" : "variant",
        "textarea" : {
            "style" : "auto"
        },
        "variable" : "test_variant1",
        "variant" : {
            "default" : "First_Option",
            "displayAs" : "radio buttons",
            "options" : [ 
                {
                    "id" : 1,
                    "value" : "First_Option"
                }, 
                {
                    "id" : 2,
                    "value" : "Second_Option"
                }, 
                {
                    "id" : 3,
                    "value" : "Third_Option"
                }
            ]
        }
    },
    {
        "_id" : ObjectId("58e667ab35dc110d1c525859"),
        "boolean" : {
            "default" : true,
            "exclusionText" : "Exclude",
            "inclusionText" : "Include"
        },
        "date" : {
            "placeholder" : "[Choose a Date]"
        },
        "disabled" : false,
        "displayName" : "Date Input 1",
        "help" : "<p>This is a simple date variable.  Unless a date is chosen, the Placeholder text will appear.  Date variable is useful if date calculation or manipulation is necessary, which cannot be done with simple text variable.  </p>",
        "state" : 0,
        "termType" : "date",
        "textarea" : {
            "style" : "auto"
        },
        "variable" : "test_date1",
        "variant" : {
            "displayAs" : "dropdown",
            "options" : []
        }
    },
    {
        "_id" : ObjectId("58e6681f35dc110d1c52585a"),
        "boolean" : {
            "default" : true,
            "exclusionText" : "Exclude",
            "inclusionText" : "Include"
        },
        "disabled" : false,
        "displayName" : "Number Input 1",
        "help" : "<p>This is a simple number variable.  Unless a number is inputted, the Placeholder text will appear.  Number variable is useful if number calculation or manipulation is necessary, which cannot be done with simple text variable.  Such operation is done with the {{math function, like this:<br/></p><p>{{math test_number1 'add' test_number2}}</p>",
        "number" : {
            "placeholder" : "[Enter a Number]"
        },
        "state" : 0,
        "termType" : "number",
        "textarea" : {
            "style" : "auto"
        },
        "variable" : "test_number1",
        "variant" : {
            "displayAs" : "dropdown",
            "options" : []
        }
    },
    {
        "_id" : ObjectId("58e6684f35dc110d1c52585b"),
        "boolean" : {
            "default" : true,
            "exclusionText" : "Exclude",
            "inclusionText" : "Include"
        },
        "disabled" : false,
        "displayName" : "Number Input 2",
        "help" : "<p style=\"font-size: 14px;\">This is a simple number variable.  Unless a number is inputted, the Placeholder text will appear.  Number variable is useful if number calculation or manipulation is necessary, which cannot be done with simple text variable.  Such operation is done with the {{math function, like this:<br/></p><p style=\"font-size: 14px;\">{{math test_number1 'add' test_number2}}</p>",
        "number" : {
            "placeholder" : "[Input another number]"
        },
        "state" : 0,
        "termType" : "number",
        "textarea" : {
            "style" : "auto"
        },
        "variable" : "test_number2",
        "variant" : {
            "displayAs" : "dropdown",
            "options" : []
        }
    }
  ];
  return TermTemplate.create(termtemplates);
}

function insertProvisionTemplates() {
  var provisionTemplates = [
    {
        "_id" : ObjectId("57fa237cd0376b53ec44ede7"),
        "displayName" : "Variables",
        "orderedVariables" : [ 
            "test_text1", 
            "test_text_plus1", 
            "test_text_area1", 
            "test_number1", 
            "test_date1", 
            "test_boolean1", 
            "test_variant1"
        ],
        "status" : "active",
        "style" : "normal",
        "template" : "<p>Each variable can be inserted in a template outside of expression. In this case this variable is rendered as an editor according variable type:</p><ul><li>Text: input element.</li><li>Text Plus: input element with option to insert subfields.</li><li>Text Area: input element for larger area of text.</li><li>Number: input element.<span id=\"selectionBoundary_1491495047751_0634614879406501\" class=\"rangySelectionBoundary\">&#65279;</span></li><li>Date: date picker element.</li><li>Boolean: drop-down menu.</li><li>Variant<b>: </b>dropdown or radio buttons with options.</li></ul><h4>Examples:</h4><ul><li>Text: {{test_text1}}</li><li>Text Plus: {{test_text_plus1}}</li><li>Text Area: {{test_text_area1}}</li><li>Number: {{test_number1}}</li><li>Date: {{test_date1}}​</li><li>Boolean: {{test_boolean1}}</li><li>Variant: {{test_variant1}}</li></ul>",
        "templateHtml" : "<p>Each variable can be inserted in a template outside of expression. In this case this variable is rendered as an editor according variable type:</p><ul><li>Text: input element.</li><li>Text Plus: input element with option to insert subfields.</li><li>Text Area: input element for larger area of text.</li><li>Number: input element.<span id=\"selectionBoundary_1491495047751_0634614879406501\" class=\"rangySelectionBoundary\">&#65279;</span></li><li>Date: date picker element.</li><li>Boolean: drop-down menu.</li><li>Variant<b>: </b>dropdown or radio buttons with options.</li></ul><h4>Examples:</h4><ul><li>Text: \n        <span class=\"{{ variables.test_text1.state == 2 ? 'uncertain-bracket' : null }}\">\n        <input type=\"text\"\n               ng-model=\"variables.test_text1.value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables.test_text1, $event)\"\n               ng-class=\"selectedVariable == variables.test_text1 ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables.test_text1.state == 1\"\n               placeholder=\"{{ variables.test_text1.placeholder }}\" /></span></li><li>Text Plus: \n        <span class=\"{{ variables.test_text_plus1.state == 2 ? 'uncertain-bracket' : null }}\">\n        <input type=\"text\"\n               ng-model=\"variables.test_text_plus1.value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables.test_text_plus1, $event)\"\n               ng-class=\"selectedVariable == variables.test_text_plus1 ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables.test_text_plus1.state == 1\"\n               placeholder=\"{{ variables.test_text_plus1.placeholder }}\" /></span>\n        <span class=\"{{ variables[v.variable].state == 2 ? 'uncertain-bracket' : null }}\" ng-repeat=\"v in textplus['test_text_plus1'] | objectToArray | orderBy: 'sortIndex'\">\n               <span ng-if=\"!false && !true\"> </span>\n               <span class=\"prettify\" ng-if=\"true && !$last\">, </span>\n               <span class=\"prettify\" ng-if=\"true && $last\">and </span>\n               <br ng-if=\"false\" />\n        <input type=\"text\"\n               ng-model=\"variables[v.variable].value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables[v.variable], $event)\"\n               ng-class=\"selectedVariable == variables[v.variable] ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables[v.variable].state == 1\"\n               placeholder=\"{{ variables[v.variable].placeholder }}\" />\n        </span>\n        </li><li>Text Area: \n        <span class=\"{{ variables.test_text_area1.state == 2 ? 'uncertain-bracket' : null }}\">\n        <textarea\n               ng-trim=\"false\"\n               ng-model=\"variables.test_text_area1.value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables.test_text_area1, $event)\"\n               ng-class=\"selectedVariable == variables.test_text_area1 ? 'highlighted-for-scroll' : null\"\n               scrollmode=\"{{variables.test_text_area1.textarea.style}}\"\n               ng-disabled=\"variables.test_text_area1.state == 1\"\n               rows={{variables.test_text_area1.textarea.rows}}\n               style=\"width: 100%;\"\n               ></textarea></span></li><li>Number: \n        <span class=\"{{ variables.test_number1.state == 2 ? 'uncertain-bracket' : null }}\">\n        <input type=\"number\"\n               ng-model=\"variables.test_number1.value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables.test_number1, $event)\"\n               ng-class=\"selectedVariable == variables.test_number1 ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables.test_number1.state == 1\"\n               placeholder=\"{{ variables.test_number1.placeholder }}\" /></span></li><li>Date: \n        <span class=\"{{ variables.test_date1.state == 2 ? 'uncertain-bracket' : null }}\">\n        <input type=\"text\"\n               class=\"{{ variables.test_date1.state == 2 ? 'uncertain-bracket' : null }}\"\n               ng-model=\"variables.test_date1.value\"\n               ng-click=\"datePickers.isOpened_0nuwoutobanxoh2hpyy51giudi = true; onClick(variables.test_date1, $event)\"\n               ng-required=\"true\"\n               ng-change=\"onChange()\"\n               uib-datepicker-popup=\"MMMM d, yyyy\"\n               is-open=\"datePickers.isOpened_0nuwoutobanxoh2hpyy51giudi\"\n               datepicker-options=\"dateOptions\"\n               close-text=\"Close\"\n               datepicker-append-to-body=\"true\" \n               ng-class=\"selectedVariable == variables.test_date1 ? 'highlighted-for-scroll' : null\" \n               ng-disabled=\"variables.test_date1.state == 1\"\n               placeholder=\"{{ variables.test_date1.placeholder }}\" /></span>​</li><li>Boolean: \n        <span ng-click=\"onClick(variables.test_boolean1, $event)\"\n              ng-class=\"selectedVariable == variables.test_boolean1 ? 'highlighted-for-scroll' : null\">\n          <select ng-model=\"variables.test_boolean1.value\" ng-options=\"opt.v as opt.n for opt in [{ n: '{{ variables.test_boolean1.boolean.inclusionText }}', v: true }, { n: '{{ variables.test_boolean1.boolean.exclusionText }}', v: false }]\"\n              ng-change=\"onChange()\"\n              ng-disabled=\"variables.test_boolean1.state == 1\">\n          </select>\n        </span></li><li>Variant: \n        <select ng-model=\"variables.test_variant1.value\"\n                ng-options=\"opt.value as opt.value for opt in variables.test_variant1.variant.options\"\n                ng-change=\"onChange()\"\n                ng-click=\"onClick(variables.test_variant1, $event)\"\n                ng-class=\"selectedVariable == variables.test_variant1 ? 'highlighted-for-scroll' : null\" \n                ng-disabled=\"variables.test_variant1.state == 1\">\n        </select></li></ul>",
        "termTemplates" : [ 
            ObjectId("58e65eae35dc110d1c525852"), 
            ObjectId("58e65fc935dc110d1c525854"), 
            ObjectId("58e6605b35dc110d1c525855"), 
            ObjectId("58e6618f35dc110d1c525856"), 
            ObjectId("58e6674c35dc110d1c525858"), 
            ObjectId("58e667ab35dc110d1c525859"), 
            ObjectId("58e6681f35dc110d1c52585a")
        ],
    },
    {
        "_id" : ObjectId("57fa23fad0376b53ec44ede8"),
        "displayName" : "Simple logical expressions",
        "orderedVariables" : [ 
            "test_boolean1", 
            "test_text1", 
            "test_text2", 
            "test_boolean2"
        ],
        "status" : "active",
        "style" : "normal",
        "template" : "<p>The simple logical expression uses only one parameter. In the IF expression, the nested content is displayed when the variable value is <b>true</b>.  It supports else statement, and the nested content of else statement is displayed when the variable value is <b>false</b>.   The opposite is true for the UNLESS expression, which displays the nested content when the variable value is <b>false</b>.  And within its else statement, the nested content is displayed when the variable value is <b>true</b>.   In the redline mode, the app appropriately shows the deletion and addition, <u>based on the default value of the boolean</u>.</p><p>IF Expression</p><ul><li>Bool expression (if bool1): {{#if test_boolean1}}bool1 is true, and text1 is {{test_text1}}{{else}}bool1 is false, and text2 is {{test_text2}}{{/if}}</li><li>Bool expression (if bool2): {{#if test_boolean2}}bool2 is true, and text1 is {{test_text1}}{{else}}bool2 is false, and text2 is {{test_text2}}{{/if}}<br/></li><li>Nested expression: {{#if test_boolean1}}{{#if test_boolean2}}bool1 and bool2 are true{{/if}}{{/if}}<br/></li></ul><p>UNLESS Expression</p><ul style=\"font-size: 14px;\"><li>Bool expression (if not bool1): {{#unless test_boolean1}}bool1 is true{{else}}otherwise, this is true{{/unless}}</li><li>Bool expression (if not bool2): {{#unless test_boolean2}}bool2 is true{{else}}otherwise, this is true{{/unless}}<br/></li></ul>",
        "templateHtml" : "<p>The simple logical expression uses only one parameter. In the IF expression, the nested content is displayed when the variable value is <b>true</b>.  It supports else statement, and the nested content of else statement is displayed when the variable value is <b>false</b>.   The opposite is true for the UNLESS expression, which displays the nested content when the variable value is <b>false</b>.  And within its else statement, the nested content is displayed when the variable value is <b>true</b>.   In the redline mode, the app appropriately shows the deletion and addition, <u>based on the default value of the boolean</u>.</p><p>IF Expression</p><ul><li>Bool expression (if bool1): <span \n        class=\"\n          exp-if \n          {{ variables.test_boolean1.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{\n          defaulted: variables.test_boolean1.value === variables.test_boolean1.boolean.default,\n          selected: variables.test_boolean1.value, \n          unselected: !variables.test_boolean1.value, \n          highlighted: selectedVariable === variables.test_boolean1 }\">bool1 is true, and text1 is \n        <span class=\"{{ variables.test_text1.state == 2 ? 'uncertain-bracket' : null }}\">\n        <input type=\"text\"\n               ng-model=\"variables.test_text1.value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables.test_text1, $event)\"\n               ng-class=\"selectedVariable == variables.test_text1 ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables.test_text1.state == 1\"\n               placeholder=\"{{ variables.test_text1.placeholder }}\" /></span></span><span \n        class=\"\n          exp-unless \n          {{ variables.test_boolean1.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{\n          defaulted: variables.test_boolean1.value !== variables.test_boolean1.boolean.default,\n          selected: !variables.test_boolean1.value,\n          unselected: variables.test_boolean1.value,\n          highlighted: selectedVariable === variables.test_boolean1 }\">bool1 is false, and text2 is \n        <span class=\"{{ variables.test_text2.state == 2 ? 'uncertain-bracket' : null }}\">\n        <input type=\"text\"\n               ng-model=\"variables.test_text2.value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables.test_text2, $event)\"\n               ng-class=\"selectedVariable == variables.test_text2 ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables.test_text2.state == 1\"\n               placeholder=\"{{ variables.test_text2.placeholder }}\" /></span></span></li><li>Bool expression (if bool2): <span \n        class=\"\n          exp-if \n          {{ variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{\n          defaulted: variables.test_boolean2.value === variables.test_boolean2.boolean.default,\n          selected: variables.test_boolean2.value, \n          unselected: !variables.test_boolean2.value, \n          highlighted: selectedVariable === variables.test_boolean2 }\">bool2 is true, and text1 is \n        <span class=\"{{ variables.test_text1.state == 2 ? 'uncertain-bracket' : null }}\">\n        <input type=\"text\"\n               ng-model=\"variables.test_text1.value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables.test_text1, $event)\"\n               ng-class=\"selectedVariable == variables.test_text1 ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables.test_text1.state == 1\"\n               placeholder=\"{{ variables.test_text1.placeholder }}\" /></span></span><span \n        class=\"\n          exp-unless \n          {{ variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{\n          defaulted: variables.test_boolean2.value !== variables.test_boolean2.boolean.default,\n          selected: !variables.test_boolean2.value,\n          unselected: variables.test_boolean2.value,\n          highlighted: selectedVariable === variables.test_boolean2 }\">bool2 is false, and text2 is \n        <span class=\"{{ variables.test_text2.state == 2 ? 'uncertain-bracket' : null }}\">\n        <input type=\"text\"\n               ng-model=\"variables.test_text2.value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables.test_text2, $event)\"\n               ng-class=\"selectedVariable == variables.test_text2 ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables.test_text2.state == 1\"\n               placeholder=\"{{ variables.test_text2.placeholder }}\" /></span></span><br/></li><li>Nested expression: <span \n        class=\"\n          exp-if \n          {{ variables.test_boolean1.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{\n          defaulted: variables.test_boolean1.value === variables.test_boolean1.boolean.default,\n          selected: variables.test_boolean1.value, \n          unselected: !variables.test_boolean1.value, \n          highlighted: selectedVariable === variables.test_boolean1 }\"><span \n        class=\"\n          exp-if \n          {{ variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{\n          defaulted: variables.test_boolean2.value === variables.test_boolean2.boolean.default,\n          selected: variables.test_boolean2.value, \n          unselected: !variables.test_boolean2.value, \n          highlighted: selectedVariable === variables.test_boolean2 }\">bool1 and bool2 are true</span></span><br/></li></ul><p>UNLESS Expression</p><ul style=\"font-size: 14px;\"><li>Bool expression (if not bool1): <span \n        class=\"\n          exp-unless \n          {{ variables.test_boolean1.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{\n          defaulted: variables.test_boolean1.value !== variables.test_boolean1.boolean.default,\n          selected: !variables.test_boolean1.value,\n          unselected: variables.test_boolean1.value,\n          highlighted: selectedVariable === variables.test_boolean1 }\">bool1 is true</span><span \n        class=\"\n          exp-if \n          {{ variables.test_boolean1.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{\n          defaulted: variables.test_boolean1.value === variables.test_boolean1.boolean.default,\n          selected: variables.test_boolean1.value, \n          unselected: !variables.test_boolean1.value, \n          highlighted: selectedVariable === variables.test_boolean1 }\">otherwise, this is true</span></li><li>Bool expression (if not bool2): <span \n        class=\"\n          exp-unless \n          {{ variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{\n          defaulted: variables.test_boolean2.value !== variables.test_boolean2.boolean.default,\n          selected: !variables.test_boolean2.value,\n          unselected: variables.test_boolean2.value,\n          highlighted: selectedVariable === variables.test_boolean2 }\">bool2 is true</span><span \n        class=\"\n          exp-if \n          {{ variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{\n          defaulted: variables.test_boolean2.value === variables.test_boolean2.boolean.default,\n          selected: variables.test_boolean2.value, \n          unselected: !variables.test_boolean2.value, \n          highlighted: selectedVariable === variables.test_boolean2 }\">otherwise, this is true</span><br/></li></ul>",
        "termTemplates" : [ 
            ObjectId("58e65eae35dc110d1c525852"), 
            ObjectId("58e65ed435dc110d1c525853"), 
            ObjectId("58e6618f35dc110d1c525856"), 
            ObjectId("58e6663f35dc110d1c525857")
        ]
    },
    {
        "_id" : ObjectId("57fa2473d0376b53ec44ede9"),
        "displayName" : "Complex logical expressions",
        "orderedVariables" : [ 
            "test_boolean1", 
            "test_boolean2"
        ],
        "status" : "active",
        "style" : "normal",
        "template" : "<p>The complex logical expression currently works with three parameters: operator (<b>and</b>, <b>or</b>, <b>and-not, not-and</b>, <b>not-and-not</b>, <b>or-not, not-or, not-or-not</b>) and two variables. The parameters order is important. The nested content is displayed when the result of the expression is <b>true</b>.  It also supports else statement, which shows up if the result of the expression is false. [<b>ifCond</b>' statement can be extended so that it can support such expressions as <b>and (or-not)</b>, <b>v1 and (v2 or not v3)</b>, for example.]<br/></p><ul><li>Bool expression (if bool1 and bool2): {{#ifCond test_boolean1 'and' test_boolean2}}bool1 and bool2 are true{{else}}Otherwise, this is true{{/ifCond}}​</li><li>Bool expression (if not bool1 and bool2): {{#ifCond test_boolean1 'not-and' test_boolean2}}bool1 is false and bool2 is true{{else}}Otherwise, this is true{{/ifCond}}​</li><li>Bool expression (if bool1 and not bool2): {{#ifCond test_boolean1 'and-not' test_boolean2}}bool1 is true and bool2 is false{{else}}Otherwise, this is true{{/ifCond}}​</li><li>Bool expression (if not bool1 and not bool2): {{#ifCond test_boolean1 'not-and-not' test_boolean2}}bool1 is false and bool2 is false{{else}}Otherwise, this is true{{/ifCond}}​</li><li>Bool expression (if bool1 or bool2): {{#ifCond test_boolean1 'or' test_boolean2}}bool1 or bool2 is true{{else}}Otherwise, this is true{{/ifCond}}</li><li>Bool expression (if not bool1 or bool2): {{#ifCond test_boolean1 'not-or' test_boolean2}}bool1 is false or bool2 is true{{else}}Otherwise, this is true{{/ifCond}}</li><li>Bool expression (if bool1 or not bool2): {{#ifCond test_boolean1 'or-not' test_boolean2}}bool1 is true or bool2 is false{{else}}Otherwise, this is true{{/ifCond}}</li><li>Bool expression (if not bool1 or not bool2): {{#ifCond test_boolean1 'not-or-not' test_boolean2}}bool1 is false or bool2 is false{{else}}Otherwise, this is true{{/ifCond}}<br/></li></ul>",
        "templateHtml" : "<p>The complex logical expression currently works with three parameters: operator (<b>and</b>, <b>or</b>, <b>and-not, not-and</b>, <b>not-and-not</b>, <b>or-not, not-or, not-or-not</b>) and two variables. The parameters order is important. The nested content is displayed when the result of the expression is <b>true</b>.  It also supports else statement, which shows up if the result of the expression is false. [<b>ifCond</b>' statement can be extended so that it can support such expressions as <b>and (or-not)</b>, <b>v1 and (v2 or not v3)</b>, for example.]<br/></p><ul><li>Bool expression (if bool1 and bool2): <span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.and.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'and', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'and', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'and', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'and', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">bool1 and bool2 are true</span><span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.not-or-not.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'not-or-not', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'not-or-not', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'not-or-not', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'not-or-not', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">Otherwise, this is true</span>​</li><li>Bool expression (if not bool1 and bool2): <span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.not-and.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'not-and', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'not-and', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'not-and', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'not-and', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">bool1 is false and bool2 is true</span><span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.or-not.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'or-not', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'or-not', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'or-not', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'or-not', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">Otherwise, this is true</span>​</li><li>Bool expression (if bool1 and not bool2): <span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.and-not.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'and-not', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'and-not', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'and-not', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'and-not', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">bool1 is true and bool2 is false</span><span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.not-or.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'not-or', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'not-or', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'not-or', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'not-or', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">Otherwise, this is true</span>​</li><li>Bool expression (if not bool1 and not bool2): <span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.not-and-not.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'not-and-not', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'not-and-not', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'not-and-not', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'not-and-not', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">bool1 is false and bool2 is false</span><span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.or.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'or', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'or', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'or', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'or', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">Otherwise, this is true</span>​</li><li>Bool expression (if bool1 or bool2): <span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.or.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'or', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'or', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'or', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'or', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">bool1 or bool2 is true</span><span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.not-and-not.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'not-and-not', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'not-and-not', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'not-and-not', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'not-and-not', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">Otherwise, this is true</span></li><li>Bool expression (if not bool1 or bool2): <span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.not-or.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'not-or', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'not-or', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'not-or', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'not-or', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">bool1 is false or bool2 is true</span><span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.and-not.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'and-not', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'and-not', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'and-not', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'and-not', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">Otherwise, this is true</span></li><li>Bool expression (if bool1 or not bool2): <span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.or-not.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'or-not', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'or-not', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'or-not', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'or-not', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">bool1 is true or bool2 is false</span><span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.not-and.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'not-and', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'not-and', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'not-and', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'not-and', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">Otherwise, this is true</span></li><li>Bool expression (if not bool1 or not bool2): <span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.not-or-not.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'not-or-not', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'not-or-not', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'not-or-not', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'not-or-not', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">bool1 is false or bool2 is false</span><span \n        class=\"exp-ifcond\n          {{ variables.test_boolean1.state == 2 && variables.and.state == 2 && variables.test_boolean2.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifCond(variables.test_boolean1.value, 'and', variables.test_boolean2.value) == \n                      $root.ifCond(variables.test_boolean1.boolean.default, 'and', variables.test_boolean2.boolean.default),\n          selected: $root.ifCond(variables.test_boolean1.value, 'and', variables.test_boolean2.value),\n          unselected: !$root.ifCond(variables.test_boolean1.value, 'and', variables.test_boolean2.value),\n          highlighted: (selectedVariable === variables.test_boolean1 || selectedVariable === variables.test_boolean2)\n        }\">Otherwise, this is true</span><br/></li></ul>",
        "termTemplates" : [ 
            ObjectId("58e6618f35dc110d1c525856"), 
            ObjectId("58e6663f35dc110d1c525857")
        ]
    },
    {
        "_id" : ObjectId("57fa28088eb789a5ec49d3d5"),
        "displayName" : "Logical expressions with variant type",
        "orderedVariables" : [ 
            "test_variant1"
        ],
        "status" : "active",
        "style" : "normal",
        "template" : "<p>The expressions with variant type are logical expressions. The nested content is displayed when the variable value equals selected option.  </p><ul><li>Variant expression (if variant1 === 'Option One'): {{#ifVariant test_variant1 'Option_One'}}variant1 equals option one{{else}}otherwise this is true{{/ifVariant}}</li></ul>",
        "templateHtml" : "<p>The expressions with variant type are logical expressions. The nested content is displayed when the variable value equals selected option.  </p><ul><li>Variant expression (if variant1 === 'Option One'): <span \n        class=\"exp-ifvariant\n          {{ variables.test_variant1.state == 2 && variables.test_variant1.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifVariant(variables.test_variant1.value, 'Option_One') == \n                      $root.ifVariant(variables.test_variant1.variant.default, 'Option_One'),\n          selected: $root.ifVariant(variables.test_variant1.value, 'Option_One'),\n          unselected: !$root.ifVariant(variables.test_variant1.value, 'Option_One'),\n          highlighted: selectedVariable === variables.test_variant1\n        }\">variant1 equals option one</span><span \n        class=\"exp-unlessvariant\n          {{ variables.test_variant1.state == 2 && variables.test_variant1.state == 2 ? 'uncertain-bracket' : null }}\" \n        ng-class=\"{ \n          defaulted: $root.ifVariant(variables.test_variant1.value, 'Option_One') != \n                      $root.ifVariant(variables.test_variant1.variant.default, 'Option_One'),\n          selected: !$root.ifVariant(variables.test_variant1.value, 'Option_One'),\n          unselected: $root.ifVariant(variables.test_variant1.value, 'Option_One'),\n          highlighted: selectedVariable === variables.test_variant1\n        }\">otherwise this is true</span></li></ul>",
        "termTemplates" : [ 
            ObjectId("58e6674c35dc110d1c525858")
        ]
    },
    {
        "_id" : ObjectId("58e67b22f91f3ac0be6b6c49"),
        "displayName" : "Functions",
        "orderedVariables" : [ 
            "test_number1", 
            "test_number2", 
            "test_date1", 
            "test_text1", 
            "test_text2", 
            "test_text_plus1"
        ],
        "status" : "active",
        "style" : "normal",
        "template" : "<p>There are four functions that are available in the app: math, case, article and expand.</p><p><b><u>MATH FUNCTION</u></b></p><p>Math function permits various operations to the number and date variables.</p><ul><li>​Add two variable numbers: {{math test_number1 'add' test_number2}}</li><li>Divide a variable number by a fixed number (ex. by 1000):  {{math test_number1 'divide' 1000}}</li><li>Add a variable number to a date in years (can be day, month or year): {{math test_date1 'add-year' test_number1}}</li><li>Add a fixed number to a date in days (ex. next day): {{math test_date1 'add-day' 1}}</li></ul><p><b><u>CASE FUNCTION</u></b></p><p>Case function allows you to change casing of the text.  Only simple text is supported currently.</p><ul><li>​Change text 1 to all upper case: {{case 'upper' test_text1}}</li><li>Change text 1 to all lower case: {{case 'lower' test_text1}}</li><li>Change text 2 to Title Case: {{case 'title' test_text2}}</li></ul><p><b><u>ARTICLE FUNCTION</u></b></p><p>Article function allows you to find the proper indefinite article for the term.  It returns either 'a' or 'an'.  </p><ul><li>​For text1, the appropriate indefinite article is &#34;{{article test_text1}}&#34; so that it reads {{article test_text1}} {{test_text1}}</li><li>For text2, the appropriate indefinite article is &#34;{{article test_text2}}&#34; so that it reads {{article test_text2}} {{test_text2}}</li></ul><p>EXPAND FUNCTION</p><p>Expand function works only with Text Plus Term Template.  It allows the Admin/Author to change the new line and/or prettifying the new subfields.</p><ul><li>​Spaces only: {{expand test_text_plus1 0}}</li><li>Prettify only: {{expand test_text_plus1 1}}</li><li>New line only: {{expand test_text_plus1 2}}</li><li>Prettify and new line:  {{expand test_text_plus1 3}}</li></ul><p><br/></p>",
        "templateHtml" : "<p>There are four functions that are available in the app: math, case, article and expand.</p><p><b><u>MATH FUNCTION</u></b></p><p>Math function permits various operations to the number and date variables.</p><ul><li>​Add two variable numbers: \n          <span class=\"{{ variables.test_number1.state == 2 ? 'uncertain-bracket' : null }}\">\n          <label ng-class=\"selectedVariable == variables.test_number1 ? 'highlighted-for-scroll' : null\"\n                 ng-disabled=\"variables.test_number1.state == 1\"\n                 placeholder=\"{{ variables.test_number1.number.placeholder }}\">\n                 {{$root.math(variables.test_number1.value, 'add', variables.test_number2.value)}}\n          </label></span></li><li>Divide a variable number by a fixed number (ex. by 1000):  \n          <span class=\"{{ variables.test_number1.state == 2 ? 'uncertain-bracket' : null }}\">\n          <label ng-class=\"selectedVariable == variables.test_number1 ? 'highlighted-for-scroll' : null\"\n                 ng-disabled=\"variables.test_number1.state == 1\"\n                 placeholder=\"{{ variables.test_number1.number.placeholder }}\">\n                 {{$root.math(variables.test_number1.value, 'divide', 1000)}}\n          </label></span></li><li>Add a variable number to a date in years (can be day, month or year): \n        <span class=\"{{ variables.test_date1.state == 2 ? 'uncertain-bracket' : null }}\">\n        <label ng-model=\"variables.test_date1.value\"\n               ng-offset-year=\"variables.test_number1.value\" ng-date-offset-variable=\"true\"\n               ng-required=\"true\"\n               ng-class=\"selectedVariable == variables.test_date1 ? 'highlighted-for-scroll' : null\" \n               ng-disabled=\"variables.test_date1.state == 1\"></label></span></li><li>Add a fixed number to a date in days (ex. next day): \n        <span class=\"{{ variables.test_date1.state == 2 ? 'uncertain-bracket' : null }}\">\n        <label ng-model=\"variables.test_date1.value\"\n               ng-offset=\"1\"\n               ng-required=\"true\"\n               ng-class=\"selectedVariable == variables.test_date1 ? 'highlighted-for-scroll' : null\" \n               ng-disabled=\"variables.test_date1.state == 1\"></label></span></li></ul><p><b><u>CASE FUNCTION</u></b></p><p>Case function allows you to change casing of the text.  Only simple text is supported currently.</p><ul><li>​Change text 1 to all upper case: \n          <span class=\"{{ variables.test_text1.state == 2 ? 'uncertain-bracket' : null }}\">\n          <label ng-class=\"selectedVariable == variables.test_text1 ? 'highlighted-for-scroll' : null\"\n                 ng-disabled=\"variables.test_text1.state == 1\"\n                 placeholder=\"{{ variables.test_text1.text.placeholder }}\">\n                 {{$root.case('upper', variables.test_text1.value)}}\n          </label></span></li><li>Change text 1 to all lower case: \n          <span class=\"{{ variables.test_text1.state == 2 ? 'uncertain-bracket' : null }}\">\n          <label ng-class=\"selectedVariable == variables.test_text1 ? 'highlighted-for-scroll' : null\"\n                 ng-disabled=\"variables.test_text1.state == 1\"\n                 placeholder=\"{{ variables.test_text1.text.placeholder }}\">\n                 {{$root.case('lower', variables.test_text1.value)}}\n          </label></span></li><li>Change text 2 to Title Case: \n          <span class=\"{{ variables.test_text2.state == 2 ? 'uncertain-bracket' : null }}\">\n          <label ng-class=\"selectedVariable == variables.test_text2 ? 'highlighted-for-scroll' : null\"\n                 ng-disabled=\"variables.test_text2.state == 1\"\n                 placeholder=\"{{ variables.test_text2.text.placeholder }}\">\n                 {{$root.case('title', variables.test_text2.value)}}\n          </label></span></li></ul><p><b><u>ARTICLE FUNCTION</u></b></p><p>Article function allows you to find the proper indefinite article for the term.  It returns either 'a' or 'an'.  </p><ul><li>​For text1, the appropriate indefinite article is &#34;\n          <span class=\"{{ variables.test_text1.state == 2 ? 'uncertain-bracket' : null }}\">\n          <label ng-class=\"selectedVariable == variables.test_text1 ? 'label-highlighted-for-scroll' : null\"\n                 ng-disabled=\"variables.test_text1.state == 1\"\n                 placeholder=\"{{ variables.test_text1.text.placeholder }}\">\n                 {{$root.article(variables.test_text1.value)}}\n          </label></span>&#34; so that it reads \n          <span class=\"{{ variables.test_text1.state == 2 ? 'uncertain-bracket' : null }}\">\n          <label ng-class=\"selectedVariable == variables.test_text1 ? 'label-highlighted-for-scroll' : null\"\n                 ng-disabled=\"variables.test_text1.state == 1\"\n                 placeholder=\"{{ variables.test_text1.text.placeholder }}\">\n                 {{$root.article(variables.test_text1.value)}}\n          </label></span> \n        <span class=\"{{ variables.test_text1.state == 2 ? 'uncertain-bracket' : null }}\">\n        <input type=\"text\"\n               ng-model=\"variables.test_text1.value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables.test_text1, $event)\"\n               ng-class=\"selectedVariable == variables.test_text1 ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables.test_text1.state == 1\"\n               placeholder=\"{{ variables.test_text1.placeholder }}\" /></span></li><li>For text2, the appropriate indefinite article is &#34;\n          <span class=\"{{ variables.test_text2.state == 2 ? 'uncertain-bracket' : null }}\">\n          <label ng-class=\"selectedVariable == variables.test_text2 ? 'label-highlighted-for-scroll' : null\"\n                 ng-disabled=\"variables.test_text2.state == 1\"\n                 placeholder=\"{{ variables.test_text2.text.placeholder }}\">\n                 {{$root.article(variables.test_text2.value)}}\n          </label></span>&#34; so that it reads \n          <span class=\"{{ variables.test_text2.state == 2 ? 'uncertain-bracket' : null }}\">\n          <label ng-class=\"selectedVariable == variables.test_text2 ? 'label-highlighted-for-scroll' : null\"\n                 ng-disabled=\"variables.test_text2.state == 1\"\n                 placeholder=\"{{ variables.test_text2.text.placeholder }}\">\n                 {{$root.article(variables.test_text2.value)}}\n          </label></span> \n        <span class=\"{{ variables.test_text2.state == 2 ? 'uncertain-bracket' : null }}\">\n        <input type=\"text\"\n               ng-model=\"variables.test_text2.value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables.test_text2, $event)\"\n               ng-class=\"selectedVariable == variables.test_text2 ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables.test_text2.state == 1\"\n               placeholder=\"{{ variables.test_text2.placeholder }}\" /></span></li></ul><p>EXPAND FUNCTION</p><p>Expand function works only with Text Plus Term Template.  It allows the Admin/Author to change the new line and/or prettifying the new subfields.</p><ul><li>​Spaces only: \n        <span class=\"{{ variables.test_text_plus1.state == 2 ? 'uncertain-bracket' : null }}\">\n        <input type=\"text\"\n               ng-model=\"variables.test_text_plus1.value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables.test_text_plus1, $event)\"\n               ng-class=\"selectedVariable == variables.test_text_plus1 ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables.test_text_plus1.state == 1\"\n               placeholder=\"{{ variables.test_text_plus1.placeholder }}\" /></span>\n        <span class=\"{{ variables[v.variable].state == 2 ? 'uncertain-bracket' : null }}\" ng-repeat=\"v in textplus['test_text_plus1'] | objectToArray | orderBy: 'sortIndex'\">\n               <span ng-if=\"!false && !false\"> </span>\n               <span class=\"prettify\" ng-if=\"false && !$last\">, </span>\n               <span class=\"prettify\" ng-if=\"false && $last\">and </span>\n               <br ng-if=\"false\" />\n        <input type=\"text\"\n               ng-model=\"variables[v.variable].value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables[v.variable], $event)\"\n               ng-class=\"selectedVariable == variables[v.variable] ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables[v.variable].state == 1\"\n               placeholder=\"{{ variables[v.variable].placeholder }}\" />\n        </span>\n    </span></li><li>Prettify only: \n        <span class=\"{{ variables.test_text_plus1.state == 2 ? 'uncertain-bracket' : null }}\">\n        <input type=\"text\"\n               ng-model=\"variables.test_text_plus1.value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables.test_text_plus1, $event)\"\n               ng-class=\"selectedVariable == variables.test_text_plus1 ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables.test_text_plus1.state == 1\"\n               placeholder=\"{{ variables.test_text_plus1.placeholder }}\" /></span>\n        <span class=\"{{ variables[v.variable].state == 2 ? 'uncertain-bracket' : null }}\" ng-repeat=\"v in textplus['test_text_plus1'] | objectToArray | orderBy: 'sortIndex'\">\n               <span ng-if=\"!false && !true\"> </span>\n               <span class=\"prettify\" ng-if=\"true && !$last\">, </span>\n               <span class=\"prettify\" ng-if=\"true && $last\">and </span>\n               <br ng-if=\"false\" />\n        <input type=\"text\"\n               ng-model=\"variables[v.variable].value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables[v.variable], $event)\"\n               ng-class=\"selectedVariable == variables[v.variable] ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables[v.variable].state == 1\"\n               placeholder=\"{{ variables[v.variable].placeholder }}\" />\n        </span>\n    </span></li><li>New line only: \n        <span class=\"{{ variables.test_text_plus1.state == 2 ? 'uncertain-bracket' : null }}\">\n        <input type=\"text\"\n               ng-model=\"variables.test_text_plus1.value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables.test_text_plus1, $event)\"\n               ng-class=\"selectedVariable == variables.test_text_plus1 ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables.test_text_plus1.state == 1\"\n               placeholder=\"{{ variables.test_text_plus1.placeholder }}\" /></span>\n        <span class=\"{{ variables[v.variable].state == 2 ? 'uncertain-bracket' : null }}\" ng-repeat=\"v in textplus['test_text_plus1'] | objectToArray | orderBy: 'sortIndex'\">\n               <span ng-if=\"!true && !false\"> </span>\n               <span class=\"prettify\" ng-if=\"false && !$last\">, </span>\n               <span class=\"prettify\" ng-if=\"false && $last\">and </span>\n               <br ng-if=\"true\" />\n        <input type=\"text\"\n               ng-model=\"variables[v.variable].value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables[v.variable], $event)\"\n               ng-class=\"selectedVariable == variables[v.variable] ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables[v.variable].state == 1\"\n               placeholder=\"{{ variables[v.variable].placeholder }}\" />\n        </span>\n    </span></li><li>Prettify and new line:  \n        <span class=\"{{ variables.test_text_plus1.state == 2 ? 'uncertain-bracket' : null }}\">\n        <input type=\"text\"\n               ng-model=\"variables.test_text_plus1.value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables.test_text_plus1, $event)\"\n               ng-class=\"selectedVariable == variables.test_text_plus1 ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables.test_text_plus1.state == 1\"\n               placeholder=\"{{ variables.test_text_plus1.placeholder }}\" /></span>\n        <span class=\"{{ variables[v.variable].state == 2 ? 'uncertain-bracket' : null }}\" ng-repeat=\"v in textplus['test_text_plus1'] | objectToArray | orderBy: 'sortIndex'\">\n               <span ng-if=\"!true && !true\"> </span>\n               <span class=\"prettify\" ng-if=\"true && !$last\">, </span>\n               <span class=\"prettify\" ng-if=\"true && $last\">and </span>\n               <br ng-if=\"true\" />\n        <input type=\"text\"\n               ng-model=\"variables[v.variable].value\"\n               ng-blur=\"onChange()\"\n               ng-click=\"onClick(variables[v.variable], $event)\"\n               ng-class=\"selectedVariable == variables[v.variable] ? 'highlighted-for-scroll' : null\"\n               ng-disabled=\"variables[v.variable].state == 1\"\n               placeholder=\"{{ variables[v.variable].placeholder }}\" />\n        </span>\n    </span></li></ul><p><br/></p>",
        "termTemplates" : [ 
            ObjectId("58e65eae35dc110d1c525852"), 
            ObjectId("58e65fc935dc110d1c525854"), 
            ObjectId("58e65ed435dc110d1c525853"), 
            ObjectId("58e667ab35dc110d1c525859"), 
            ObjectId("58e6681f35dc110d1c52585a"), 
            ObjectId("58e6684f35dc110d1c52585b")
        ]
    }
  ];
  return ProvisionTemplate.create(provisionTemplates);
}

function insertDocumentTemplateTypes() {
  var documentTemplateTypes = [
    {
        "_id" : ObjectId("57fa4b5315d084efeef2ba57"),
        "description" : "Standard Style",
        "name" : "Standard Style",
        "status" : "active",
        "styles" : "{\n  \"font-size\": 11,\n  \"font-name\": \"Times New Roman\",\n  \"localeId\": 1033,\n  \"page\": {\n    \"width\": 215.9,\n    \"height\": 279.4,\n    \"top-margin\": 25.4,\n    \"bottom-margin\": 25.4,\n    \"left-margin\": 25.4,\n    \"right-margin\": 25.4,\n    \"header\": 19,\n    \"footer\": 12.7\n  },\n  \"defaultSettings\": {\n    \"text-align\": \"left\",\n    \"space-after\": 12,\n    \"text-indent\": 0\n  },\n  \"comfort_letter\": {\n    \"versionType2\": {\n      \"text-align\": \"right\",\n      \"space-after\": 24\n    },\n    \"letterHead\": {\n      \"recipient\": {\n        \"text-align\": \"left\",\n        \"space-after\": 12\n      },\n      \"letterDate\": {\n        \"text-align\": \"left\",\n        \"space-after\": 12\n      }\n    },\n    \"introduction\": {\n      \"greeting\": {\n        \"text-align\": \"left\",\n        \"space-after\": 12,\n        \"keep-together\": \"false\",\n        \"keep-with-next\": \"false\",\n        \"suppress-auto-hyphens\": \"false\",\n        \"text-decoration\": \"none\"\n      },\n      \"text2\": {\n        \"text-indent\": 25.4\n      }\n    },\n    \"body\": {\n      \"content\": {\n        \"level1\":{\n          \"text-align\": \"justify\",\n          \"space-after\": 12,\n          \"left-indent\": 0,\n          \"text-indent\": 0\n        },\n        \"level2\":{\n          \"text-align\": \"justify\",\n          \"space-after\": 12,\n          \"left-indent\": 11.1,\n          \"text-indent\": 0\n        },\n        \"level2letter\":{\n          \"text-align\": \"justify\",\n          \"space-after\": 12,\n          \"left-indent\": 11.1,\n          \"text-indent\": -6.3\n        },\n        \"level2number\":{\n          \"text-align\": \"justify\",\n          \"space-after\": 12,\n          \"left-indent\": 0,\n          \"text-indent\": 6.3\n        },\n        \"level3\":{\n          \"text-align\": \"justify\",\n          \"space-after\": 12,\n          \"left-indent\": 19,\n          \"text-indent\": -6.3\n        },\n         \"level3letter\":{\n          \"text-align\": \"justify\",\n          \"space-after\": 12,\n          \"left-indent\": 19,\n          \"text-indent\": -6.3\n        },\n         \"level3LETTER\":{\n          \"text-align\": \"justify\",\n          \"space-after\": 12,\n          \"left-indent\": 6.3,\n          \"text-indent\": -6.3\n        },\n        \"level4\":{\n          \"text-align\": \"justify\",\n          \"space-after\": 12,\n          \"left-indent\": 28.6,\n          \"text-indent\": -9.5\n        },\n        \"level4roman\":{\n          \"text-align\": \"justify\",\n          \"space-after\": 12,\n          \"left-indent\": 28.6,\n          \"text-indent\": -9.5\n        }\n      }\n    }\n  }\n}\n"
    }
  ];
  return DocumentTemplateType.create(documentTemplateTypes);
}

function insertDocumentTemplates() {
  var documentTemplates = [
    {
        "_id" : ObjectId("57fa4b8215d084efeef2ba58"),
        "documentType" : ObjectId("57fa4b5315d084efeef2ba57"),
        "name" : "Variables",
        "provisionTemplates" : [ 
            ObjectId("57fa237cd0376b53ec44ede7")
        ],
        "status" : "active"
    },
    {
        "_id" : ObjectId("57faa04c8b473d77f4d4be1a"),
        "documentType" : ObjectId("57fa4b5315d084efeef2ba57"),
        "name" : "Simple logical expressions",
        "provisionTemplates" : [ 
            ObjectId("57fa23fad0376b53ec44ede8")
        ],
        "status" : "active",
    },
    {
        "_id" : ObjectId("57faa17b11a377a8f437cd74"),
        "documentType" : ObjectId("57fa4b5315d084efeef2ba57"),
        "name" : "Complex logical expressions",
        "provisionTemplates" : [ 
            ObjectId("57fa2473d0376b53ec44ede9")
        ],
        "status" : "active",
    },
    {
        "_id" : ObjectId("57faa1b011a377a8f437cd75"),
        "documentType" : ObjectId("57fa4b5315d084efeef2ba57"),
        "name" : "Logical expressions with variant type",
        "provisionTemplates" : [ 
            ObjectId("57fa28088eb789a5ec49d3d5")
        ],
        "status" : "active",
    },
    {
        "_id" : ObjectId("58e67b31f91f3ac0be6b6c4a"),
        "documentType" : ObjectId("57fa4b5315d084efeef2ba57"),
        "name" : "Functions",
        "provisionTemplates" : [ 
            ObjectId("58e67b22f91f3ac0be6b6c49")
        ],
        "status" : "active",
    }
  ];
  return DocumentTemplate.create(documentTemplates);
}

function insertProjectTemplates() {
  var projectTemplates = [
    {
        "_id" : ObjectId("58e66c5a35dc110d1c52585c"),
        "documentTemplates" : [ 
            ObjectId("57fa4b8215d084efeef2ba58"), 
            ObjectId("57faa04c8b473d77f4d4be1a"), 
            ObjectId("57faa17b11a377a8f437cd74"), 
            ObjectId("57faa1b011a377a8f437cd75"), 
            ObjectId("58e67b31f91f3ac0be6b6c4a")
        ],
        "name" : "Examples",
        "status" : "active",
        "userGroups" : [ 
            ObjectId("58dfa5a4317b43114750c8ca")
        ],
        "users" : []
    }
  ];
  return ProjectTemplate.create(projectTemplates);
}

function insertProjects() {
  var projects = [
    {
        "_id" : ObjectId("58e66c9235dc110d1c52585d"),
        "name" : "User1 Test Project",
        "owner" : ObjectId("57fa20920cb5ff30ec857430"),
        "projectTemplate" : ObjectId("58e66c5a35dc110d1c52585c"),
        "sharedUserGroups" : [],
        "sharedUsers" : [ 
            ObjectId("57fa20920cb5ff30ec857431")
        ],
        "values" : [ 
            {
                "placeholder" : "[Text Variable 1]",
                "state" : 0,
                "variable" : "test_text1"
            }, 
            {
                "placeholder" : "[Text Variable 2]",
                "state" : 0,
                "variable" : "test_text2"
            }, 
            {
                "placeholder" : "[Text Plus 1]",
                "state" : 0,
                "variable" : "test_text_plus1"
            }, 
            {
                "placeholder" : "[Choose a Date]",
                "state" : 0,
                "value" : "",
                "variable" : "test_date1"
            }, 
            {
                "placeholder" : "[Enter a Number]",
                "state" : 0,
                "value" : "",
                "variable" : "test_number1"
            }, 
            {
                "placeholder" : "[Input another number]",
                "state" : 0,
                "value" : "",
                "variable" : "test_number2"
            }
        ]
    }
  ];
  return Project.create(projects);
}

db
  .connect()
  .then(clearDb)
  .then(insertUsers)
  .then(insertUserGroups)
  .then(insertTermTemplates)
  .then(insertProvisionTemplates)
  .then(insertDocumentTemplateTypes)
  .then(insertDocumentTemplates)
  .then(insertProjectTemplates)
  .then(insertProjects)
  .then(() => log.info('All scripts applied succesfully'))
  .catch(err => log.error('The scripts are not applied', err))
  .finally(db.disconnect);
