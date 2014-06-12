/*
The MIT License (MIT)

Copyright (c) 2014 Markus Harms, ma@mh-svr.de

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 
 */

// Example: For js/pong-modules/testmodule.js add the line:
// moduleMap.push( "testmodule" );
// available hooks: 
//   addActionBtn (id,modalName,resourceURL)
//   creModal (id,modalName,resourceURL)
//   loadResourcesHtml (divId,resourceURL)


moduleMap[ "pong-security" ] = {
	"name": "pong-security",
	"hooks": [
		{ hook: "init", method:"initSecurityHeaderHtml" },
	    { hook: "addHeaderHtml", method:"addSecurityHeaderHtml" }
	 ]
};

moduleMap[ "i18n" ] = {
	"name": "i18n",
	"hooks": [
	    { hook: "addHeaderHtml", method:"addI18NHeaderHtml" }
	]
};

moduleMap[ "pong-navbar" ] = {
	"name":  "pong-navbar",
    "hooks": [
        { hook: "addHeaderHtml", method:"addNavBarHeaderHtml" } 
    ]
};

moduleMap[ "modal-form" ] = {
	"name": "modal-form",
    "hooks": [
        { hook: "addActionBtn", method:"modalFormAddActionBtn" },
        { hook: "creModal", method:"modalFormCreModalFromMeta" }
    ]
};

moduleMap[ "pong-table" ] = {
	"name": "pong-table",
    "hooks": [
        { hook: "loadResourcesHtml", method:"pongTableDivHTML" }
    ]
};

moduleMap[ "pong-list" ] = {
	"name":  "pong-list",
    "hooks": [
         { hook: "loadResourcesHtml", method:"pongListDivHTML" }
     ]
};

moduleMap[ "pong-form" ] = {
	"name": "pong-form",
    "hooks": [
        { hook: "loadResourcesHtml", method:"pongFormDivHTML" }
    ]
};

moduleMap[ "pong-master-details" ] = {
	"name": "pong-master-details",
	"requires": [ "pong-table", "pong-list" ],
    "hooks": [
        { hook: "loadResourcesHtml", method:"pongMasterDetailsHTML" }
    ]
};

moduleMap[ "pong-help" ] = {
	"name": "pong-help",
    "hooks": [
        { hook: "addActionBtn", method:"pongHelpAddActionBtn" },
        { hook: "creModal", method:"pongHelpCreModalFromMeta" }
    ]
};


moduleMap[ "pong-mediawiki" ] = {
	"name": "pong-mediawiki",
    "hooks": [
        { hook: "loadResourcesHtml", method:"pongMediaWikiDivHTML" }
    ]
};
