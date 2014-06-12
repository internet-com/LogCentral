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

var moduleMap = {};
var reqModules = {};

var resMap = new Array();
var callbackMap = new Array();
var dlgMap = new Array();
var ajaxOngoing = 0;
var step = "load-lang";

// stores content of the structure file
var layout = null;

var pageInfo = new Array();

// Security Variables
pageInfo["userRoles"] = [];
var userID = null;
var userRole = "";

/** Because ajax loads are asynchronous, 
    we have to wait for all calls to be sinished to load HTML into DIV
    and then we have to wait to do all the callbacks */
function inits() {
	log( "init", "step="+step+" ajaxOngoing="+ajaxOngoing );
	if ( ajaxOngoing == 0 ) { 
		if ( step == "load-lang" ) {
			ajaxOngoing++;
			log( 'init', 'Start to load module list...');
			loadLang();
			step = "loadmodulemap";
		} else if ( step == "loadmodulemap" ) {
			ajaxOngoing++;
			log( 'init', 'Start to load module list...');
			loadModuleList();
			step = "loadstructure";
		} else	if ( step == "loadstructure" ) {
			ajaxOngoing++;
			log( 'init', 'Load Structure File ...');
			loadStructure();
			step = "loadmodules";
		} else if ( step == "loadmodules" ) {
			ajaxOngoing++;
			log( 'init', 'Start to load JS modules ...');
			loadModules();
			step = "initmodules";
		} else	if ( step == "initmodules" ) {
			ajaxOngoing++;
			log( 'init', 'Load Structure File ...');
			initModules( layout );
			step = "buildstructure";
		} else	if ( step == "buildstructure" ) {
			ajaxOngoing++;
			log( 'init', 'Start to build HTML ...');
			buildStructure( layout );
			step = "loadres-ht";
		} else	if ( step == "loadres-ht" ) {
			ajaxOngoing++;
			log( 'init', 'Start to load resources HTML ...');
			loadResourcesHT();
			step = "call-hooks";
		} else	if ( step == "call-hooks" ) {
			log( 'init', 'Call module hooks ...');
			callHooks();
			step = "loadres-js";
		} else	if ( step == "loadres-js" ) {
			ajaxOngoing++;
			log( 'init', 'Start to load resources JS ...');
			loadResourcesJS();
			step = "callbacks";
		} else	if ( step == "callbacks" ) {
			log( 'init', 'Start callback methods for resources...');
			resourceCallbacks();
			step = "dialogs";
		} else	if ( step == "dialogs" ) {
			log( 'init', 'Start load dialogs for resources...');
			resourceDialogs();
			clearInterval( initTimerId );
			step = "done";
		}
	}	
}

//=====================================================================================================


function loadLang() {
	var locale = getParam( 'lang' );
	if ( locale == '' ) { locale = "EN"; }	
	$.i18n( { locale: locale } );
	$.i18n().load( 
			'i18n/' + locale+ '.json', locale 
		).done( 
			function(){ ajaxOngoing--; } 
		);
	pageInfo["lang"] = locale;
}

/** build up the HTML structure of nested DIVs*/
function loadStructure() {
	var pPage = getParam( 'layout' );
	if ( pPage == '' ) {
		pPage = "main";
	}
	pageInfo[ 'layout' ] = pPage;
	console.log("loadStructure: svc/layout/"+pPage+"/structure" );
	$.getJSON( "svc/layout/"+pPage+"/structure", 
		function( d ) {
			layout = d.layout;

			// load includes ...
			if ( d.layout.includeHeader != null && d.layout.includeFooter != null &&  d.layout.includeHeader == d.layout.includeFooter ) {
				// optimize to one additional load
				ajaxOngoing++;
				$.getJSON( "svc/layout/"+d.layout.includeHeader+"/structure", 
					function( di ) {
						layout.header = di.layout.header;		
						layout.footer = di.layout.footer;		
						ajaxOngoing--;
					}
				);	
			} else 	{
				if ( d.layout.includeHeader != null ) {
					ajaxOngoing++;
					$.getJSON( "svc/layout/"+d.layout.includeHeader+"/structure", 
						function( di ) {
							layout.header = di.layout.header;		
							ajaxOngoing--;
						}
					);
				}
				if ( d.layout.includeFooter != null ) {
					ajaxOngoing++;
					$.getJSON( "svc/layout/"+d.layout.includeFooter+"/structure", 
						function( di ) {
							layout.footer = di.layout.footer;		
							ajaxOngoing--;
						}
					);
				}
			}
		}
	).always(
		function() {
			ajaxOngoing--;
		}
	);
}

/** build up the HTML structure of nested DIVs*/
function buildStructure( d ) {
	$( "title" ).html( d.title );
	// crunch layout into html divs
	var contentItems = layoutToHTML( d );			
	$( "<div/>", 
		{ "id": "maindiv", "class": "page-width", html: contentItems.join( "" ) } 
	).appendTo( "body" );
	loadHeaderFooter( d );
	ajaxOngoing--;
}


//=====================================================================================================
// Modules Loading

/* all modules are defined in additional js files: */
function loadModuleList() {
	$.getScript( "js/portal-ng-modules.js" )
		.done(
			function( script, textStatus ) {
				log( 'loadModuleList', textStatus );
				ajaxOngoing--;
			}
		)
		.fail(
			function( jqxhr, settings, exception ) {
				logErr( 'loadModuleList', exception );
				ajaxOngoing--;
			}
		);
}

// load modules
function loadModules() {
	checkModules( );
	for ( var module in reqModules ) {
		log( 'loadModules', "js/pong-modules/"+module+".js" );
		jQuery('head').append('<link rel="stylesheet" rel="nofollow" href="css/pong-modules/'+module+'.css" type="text/css" />');
		if ( module != 'pong-XYZ' ) { 
			ajaxOngoing++;
		    $.getScript( "js/pong-modules/"+module+".js" )
			.done(
				function( script, textStatus ) {
					log( 'loadModules', textStatus );
					ajaxOngoing--;
				}
			)
			.fail(
				function( jqxhr, settings, exception ) {
					log( 'loadModules', exception );
					ajaxOngoing--;
				}
			);
		}
	}
	ajaxOngoing--;
}


function checkModules() {
	log( 'checkModules', 'checkModules' );
	// allways req modules
	addReqModule( "i18n" );
	addReqModule( "pong-security" );
	// header modules
	if ( layout.header != null  && layout.header.modules != null )
	for ( var i=0; i< layout.header.modules.length; i++ ) {
		addReqModule( layout.header.modules[i].type );
	}
	// footer modules
	if ( layout.footer != null  && layout.footer.modules != null )
	for ( var i=0; i< layout.footer.modules.length; i++ ) {
		addReqModule( layout.footer.modules[i].type );
	}
	// modules of rows and cols
	checkModulesRec( layout );	
}

function checkModulesRec( l ) {
	if ( l.rows != null ) {
		for ( var i = 0; i < l.rows.length; i++ ) {
			log( 'checkModules', "row: "+ l.rows[i].rowId );
			if ( l.rows[i].type != null ) {
				addReqModule( l.rows[i].type );
			}
			checkModulesActn( l.rows[i] );
			if ( l.rows[i].cols != null ) {
				checkModulesRec( l.rows[i] );
			}
		}
	}	
	if ( l.cols != null ) {
		for ( var i = 0; i < l.cols.length; i++ ) {
			log( 'checkModules', "col: "+ l.cols[i].columnId );
			if ( l.cols[i].type != null ) {
				addReqModule( l.cols[i].type );
			}
			checkModulesActn( l.cols[i] );
			if ( l.cols[i].rows != null ){
				checkModulesRec( l.cols[i] );
			}
		}
	}		
}

function checkModulesActn( l ) {
	if ( l.actions != null ) {
		for ( var i = 0; i < l.actions.length; i++ ){
			if ( l.actions[i].type != null ) {
				addReqModule( l.actions[i].type );
			}
		}
	}
}

function addReqModule( mType ) {
	if ( ! reqModules.hasOwnProperty( mType ) ) {
		log( 'checkModules', "module: "+mType  );
		reqModules[ mType ] = mType;		
		if ( moduleMap[ mType ].requires != null ) {
			for ( var i = 0; i < moduleMap[ mType ].requires.length; i++ ) {
				log( 'checkModules', "requires: "+ moduleMap[ mType ].requires[i] );
				addReqModule( moduleMap[ mType ].requires[i] );
			}
		}
	}
}


function initModules( lo ) {
	// header hooks
	if ( lo.header.modules != null ) {
		for ( var i = 0; i < lo.header.modules.length; i++ ) {
			initAModule( lo.header.modules[i] );
		}
	}
	// footer hooks
	if ( lo.footer.modules != null ) {
		for ( var i = 0; i < lo.footer.modules.length; i++ ) {
			initAModule( lo.footer.modules[i] );
		}
	}
	ajaxOngoing--;
}

function initAModule( module ) {
	log( 'initModules', "initModules "+module.type );
	var hook = getHookMethod( "init", module.type );
	if ( hook != "" ) {
		log( 'initModules CALL', hook+"( ... )");
		eval( hook+'( "'+module.id+'", "'+module.type+'", '+JSON.stringify( module.param )+' )'  );
	}	
}

//=====================================================================================================


function layoutToHTML( d ) {
	var content = [];
	content.push( '<div id="header"></div>' );
	content = content.concat( rowToHTML( d.rows ) );
	content.push( '<div id="footer"></div>' );
	return content;
}

function loadHeaderFooter( d ) { 
	headerHTML( d.header ); 
	footerHTML( d.footer );
}

var hookCalls = [];


function headerHTML( header ) {
	var content = [];
	content.push( '<div id="header-cnt" class="header-cnt"></div>' );
	content.push( '<div class="header-logo"><img src="' +header.logoURL +'"/></div>' );
	
	// header hooks
	if ( header.modules != null ) {
		for ( var i = 0; i < header.modules.length; i++ ) {
			var hMod =  header.modules[i];
			log( 'headerHTML', "addHeaderHtml "+hMod.type );
			var hook = getHookMethod( "addHeaderHtml", hMod.type );
			if ( hook != "" ) {
				log( 'headerHTML', hook+"( ... )");
				content.push( '<div id="'+hMod.id+'" class="'+hMod.type+'"></div>' );
				hookCalls.push( hook+'( "'+hMod.id+'", "'+hMod.type+'", '+JSON.stringify(hMod.param)+' )'  );
			}
		}
	}
	
	// load links
	content.push( '<div class="header-links">' );
	for ( var i = 0; i < header.linkList.length; i++ ) {
		var lnk = header.linkList[i];
		content.push( '<a href="' +lnk.url+ '">'+ $.i18n( lnk.text ) +'</a>' );
	}
	content.push( "</div>" );
	$( '#header' ).html( content.join("\n") );
}

function callHooks() {
	for ( var i = 0; i < hookCalls.length; i++ ) {
		console.log( "call: "+  hookCalls[i]  );
		eval( hookCalls[i] );		
	}
}

//=====================================================================================================

function footerHTML( footer ) {
	var content = [];
	content.push( '<div class="footer-cnt"></div>' );
	content.push( '<div class="footer-links">' );
	for ( var i = 0; i < footer.linkList.length; i++ ) {
		var lnk = footer.linkList[i];
		content.push( '<a href="'+lnk.pageURL+'">'+ $.i18n( lnk.text )+'</a> 	' );
	}
	content.push( "</div>" );
	if ( footer.copyrightText != null ) {
		content.push( '<div class="copyright-div">'+ footer.copyrightText  +'</div>' );
	} else {
		content.push( '<div class="copyright-div">&copy; MH 2014,  MIT License</div>' );
	}
	
	// header hooks
	if ( footer.modules != null ) {
		for ( var i = 0; i < footer.modules.length; i++ ) {
			var fMod =  footer.modules[i];
			log( 'footerHTML', "addFooterHtml "+ fMod.type );
			var hook = getHookMethod( "addFooterHtml", fMod.type );
			if ( hook != "" ) {
				log( 'footerHTML', hook+"( ... )");
				content.push( '<div id="'+fMod.id+'" class="'+fMod.type+'"></div>' );
				hookCalls.push( hook+'( "'+fMod.id+'", "'+fMod.type+'", '+JSON.stringify(fMod.param)+' )'  );
			}
		}
	}
	$( '#footer' ).html( content.join("\n") );
}

function colsToHTML( colsLayout ) {
	var cols = [];
	for ( var i = 0; i < colsLayout.length; i++ ) {
		var aCol = colsLayout[i];
		var id = "unknown";
		if ( aCol.columnId != null ) {
			id = aCol.columnId;
		}
		var style = "";
		if ( aCol.width != null ) {
			style += " width:"+aCol.width+";";
		}
		if ( aCol.resourceURL != null ) {
			cols.push( '<div id="'+id+'" class="coldiv '+(aCol.decor!=null ? 'withDecor': '')+'" style="'+style+' position:relative; height:100%;">' );
			//cols.push( id+" "+ aCol.resourceURL ); 
			cols.push( resToHTML( id, aCol, style ) );	
			resMap.push( [ id, aCol.resourceURL, (aCol.type != null ? aCol.type : 'html'), aCol.resourceParam ] );
			log( 'colsToHTML',  id+"  "+aCol.resourceURL );		
			if ( aCol.callback != null ) {
				callbackMap.push( aCol.callback );		  	  
			}
			cols.push( "</div>");
		} else if ( aCol.rows != null ) {
			cols.push( '<div id="'+id+'" class="coldiv" style="'+style+' position:relative; height:100%;">' );
			cols = cols.concat( rowToHTML( aCol.rows ) );
			cols.push( "</div>");
		} else {
			cols.push( '<div id="'+id+'" class="coldiv" style="'+style+' position:relative; height:100%;">empty</div>' );
		}  
	}	
	return cols;
}

function rowToHTML( rowsLayout ) {
	var rows = [];
	for ( var i = 0; i < rowsLayout.length; i++ ) {
		var aRow = rowsLayout[i];
		var id = "unknown";
		if ( aRow.rowId != null ) {
			id = aRow.rowId;
		}
		var style = "";
		if ( aRow.height != null ) {
			style += " height:"+aRow.height+";";
		}
		if ( aRow.resourceURL != null ) {
			rows.push( '<div id="'+id+'" class="rowdiv '+(aRow.decor!=null ? 'withDecor': '')+'" style="'+style+' position:relative;">' );
			rows.push( resToHTML( id, aRow, style ) );
			resMap.push( [ id, aRow.resourceURL, (aRow.type != null ? aRow.type : 'html'), aRow.resourceParam ] ); 	
			log( 'rowToHTML', id+"  "+aRow.resourceURL );		
			if ( aRow.callback != null ) {
				callbackMap.push( aRow.callback );		  	  
			}
			rows.push( "</div>");
		} else if ( aRow.cols != null ) {
			rows.push( '<div id="'+id+'" class="rowdiv" style="'+style+' position:relative;">' );
			rows = rows.concat( colsToHTML( aRow.cols ) );
			rows.push( "</div>");
		} else {
			rows.push( '<div id="'+id+'" class="rowdiv" style="'+style+' position:relative; height:100%;">empty</div>' );
		}
	}
	return rows;
}
	
function resToHTML( id, res, style ) {
	var html = "";
	var addCSS = "";
	if ( res.type != null ) { addCSS = res.type; }
	if ( res.headerURL != null ) {
		if ( res.title != null && res.decor == null ) {
			html += '<div id="'+id+'Title" class="res-title">'+res.title+'</div>';
		}
		html += '<div id="'+id+'HeaderContent" class="res-header '+addCSS+'">'+res.header+'</div>';
		resMap.push( [ id+'Header', res.headerURL, 'inner', {} ] ); 	
	}
	if ( res.decor == null ) {
		html += '<div id="'+id+'Content" class="decor-inner '+addCSS+'"></div>';		
	} else {
		html += '<div id="'+id+'Content" class="'+res.decor+' decor-inner '+addCSS+'"></div>'+
			'<div class="'+res.decor+'-tm">'+(res.title == null ? '' : '<div id="'+id+'Title" class="decor-tm-title">'+res.title+'</div>')+'</div><div class="'+res.decor+'-bm"></div><div class="'+res.decor+'-lm"></div><div class="'+res.decor+'-rm"></div>'+
			'<div class="'+res.decor+'-tr"></div><div class="'+res.decor+'-tl"></div><div class="'+res.decor+'-br"></div><div class="'+res.decor+'-bl"></div>'+
			'<div class="'+res.decor+'-menu">';
		if ( res.modal != null ) {
			html += addDlgBtn( id, res );
		}
		if ( res.actions != null ) {
			html += addActionBtn( id, res );
		}
		html += "</div>";
		if ( res.modal != null ) {
			html += addModalDlgHT( id, res );
		}
	}
	if ( res.footerURL != null ) {
		html += '<div id="'+id+'FooterContent" class="res-footer '+addCSS+'">'+res.footer+'</div>';
		resMap.push( [ id+'Footer', res.footerURL, 'inner', {} ] ); 	
	}

	return html;
}

//=====================================================================================================

function addActionBtn( id, res ) {
	log( 'addActionBtn', "start");
	var html = "";
	for( var x = 0; x < res.actions.length; x++ ) {
		var action = res.actions[x];
		var name = "help";
		var txt = "?";
		var icon = "ui-iocon-help";
		var jscall = "help";
		if ( action.actionName == "fullWidth" ) {
			name = "fullWidth";
			txt = "Full width";
			icon = "ui-icon-arrow-2-e-w";
			jscall = "resViewFullWidth( \""+id+"\" );";
			html += "<button id=\""+id+name+"Bt\">"+ $.i18n( txt )+"</button>";
			html += "<script>  $(function() { $( \"#"+id+name+"Bt\" ).button( { icons:{primary: \""+icon+"\"}, text: false } ).click( "+
				"function() { "+jscall+" }); }); </script>";		

		} else if ( action.actionName == "fullScreen" ) {
			name = "fullScreen";
			txt = "Full screen";
			icon = "ui-icon-arrow-4-diag";
			jscall = "resViewFullScreen( \""+id+"\" );";
			html += "<button id=\""+id+name+"Bt\">"+ $.i18n( txt )+"</button>";
			html += "<script>  $(function() { $( \"#"+id+name+"Bt\" ).button( { icons:{primary: \""+icon+"\"}, text: false } ).click( "+
				"function() { "+jscall+" }); }); </script>";		
		} 

		// hook for generating action button code
		log( 'addActionBtn', "addActionBtn "+action.type );
		hook = getHookMethod( "addActionBtn", action.type );
		if ( hook != "" ) {
			log( 'addActionBtn', hook+"( "+action.actionName+" )");
			html += eval( hook+"( id, action.actionName, res.resourceURL )" );
			dlgMap.push( [ id, action.actionName, res.resourceURL, action.type ] );
		}
	}
	return html;
}

function addDlgBtn( id, res ) {
	var html = "";
	for( var x = 0; x < res.modal.length; x++ ) {
		var modal = res.modal[x];
		var txt = "";
		var icon = "";
		if ( modal.label != null ) {
			txt = modal.label;
			if ( modal.icon != null   ) {
				icon = "{ icons:{primary: \""+modal.icon+"\"} }";
			} 
		} else {
			txt = modal.modalName;
			if ( modal.icon != null   ) {
				icon = "{ icons:{primary: \""+modal.icon+"\"}, text: false }";
			} 
		}
		modalName = modal.modalName;
		html += "<button id=\""+id+modalName+"Bt\">"+  $.i18n( txt ) +"</button>";
		html += "<script>  $(function() { $( \"#"+id+modalName+"Bt\" ).button( "+icon+" ).click( "+
			"function() { $( \"#"+id+modalName+"Dialog\" ).dialog( \"open\" ); }); }); </script>";		
	}
	return html;
}

function addModalDlgHT( id, res ) {
	var html = "";
	// cre modal dialogs custom from resource
	for( var x = 0; x < res.modal.length; x++ ) {
		var modal = res.modal[x];
		var modalName = modal.modalName;
		var width  = "650";
		var height = "500"; 
		dlgMap.push( [ id, modalName, res.resourceURL, "custom" ] );
		if ( modal.width  != null ) { width  = modal.width; }
		if ( modal.height != null ) { height = modal.height; }
		html += "<div id=\""+id+modalName+"Dialog\">"+$.i18n( modalName ) +"</div>";
		html += "<script> $(function() { $(  "+
			"\"#"+id+modalName+"Dialog\" ).dialog( { autoOpen: false, height: "+height+", width: "+width+" , modal: true, "+ // TODO: Refresh resource
			" buttons: { \"OK\": function() { "+id+modalName+"FormSubmit(); $( this ).dialog( \"close\" );  },"+
			" Cancel: function() { $( this ).dialog( \"close\" ); } } }); "+
			"});</script>";
	}
	return html;
}

// =====================================================================================================

function loadResourcesHT() {
	log( 'loadResourcesHT', 'resMap.length='+resMap.length );
	for( var x=0; x<resMap.length; x++ ) {
		var res = resMap[x];
		log( 'loadResourcesHT', res+" (type="+res[2]+")" );
		var divId = res[0]+"Content";
		if ( res[2] == 'html' ) {
			loadResourcesHTajax( divId, res[1]+"/html" );
		} else if ( res[2] == 'inner' ) {
			loadResourcesHTajax( divId, res[1] );
		} else {
			hook = getHookMethod( "loadResourcesHtml", res[2] );
			if ( hook != "" ) {
				log( 'loadResourcesHT', "hook="+hook );
				hookCalls.push( hook+'( "'+divId+'", "'+res[1]+'", '+JSON.stringify( res[3] )+' )'  );
				//eval( hook+"( divId, res[1], res[3] )" );
			}
		}
	}
	ajaxOngoing--;
}

function loadResourcesJS() {
	for( var x=0; x<resMap.length; x++ ) {
		var res = resMap[x];
		if ( resMap[x][2] == "html" ) { // resource type is "html"
			log( 'loadResourcesJS', res );
			loadResourcesJSajax( "#"+res[0]+"Content", res[1]+"/jscript" );
		}
	}
	ajaxOngoing--;
}

function loadResourcesHTajax( resHtmlID, serviceHtURL ) { 
	ajaxOngoing++;
	$.get( serviceHtURL, 
		function( data ) {
			log( 'loadResourcesHTajax',  "succ "+resHtmlID );
			$( "#"+resHtmlID ).html( data );
			log( 'loadResourcesHTajax', "ok "+resHtmlID+"  "+serviceHtURL );
		}
	).fail(
		function() {
			logErr( 'loadResourcesHTajax', resHtmlID+"  "+serviceHtURL );
		}
	).always(
		function() {
			log( 'loadResourcesHTajax', "done: "+resHtmlID+"  "+serviceHtURL );
			ajaxOngoing--;
		}
	);
}

function loadResourcesJSajax( resHtmlID, serviceJsURL ) {
	ajaxOngoing++;
	$.getScript( serviceJsURL, 
		function(){ 
		log( 'loadResourcesJSajax', "succ "+resHtmlID+"  "+serviceJsURL );
		}
	).always(
		function() {
			log( 'loadResourcesJSajax', "done: "+resHtmlID+"  "+serviceJsURL );
			ajaxOngoing--;
		}
	);
}

function resourceCallbacks() {
	for( var x=0; x<callbackMap.length; x++ ) {
		var fn = callbackMap[x];
		log( 'resourceCallbacks', "call"+fn );
		eval( fn );
	}
}

function resourceDialogs() {
	for( var x = 0; x < dlgMap.length; x++ ) {
		var dlg = dlgMap[x];
		creModal( dlg[0], dlg[1], dlg[2], dlg[3] );
	}
}

function creModal( id, modalName, resourceURL, type ) {
	// hook for generating action button code
	log( 'creModal', "formId "+modalName );
	hook = getHookMethod( "creModal", type );
	if ( hook != "" ) {
		log( 'creModal', hook+"( "+modalName+" ... )");
		eval( hook+"( id, modalName, resourceURL )" );
	}
}

function getValueFromRes( resURL, propName, tagId ) {
	$.get( resURL, { prop: propName } ).done( 
		 function( data ) {
			$( "#"+tagId ).attr( "value", data );
		}
	);
}

function getTextFromRes( resURL, propName, tagId ) {
	$.get( resURL, { prop: propName } ).done( 
		 function( data ) {
			$( "#"+tagId ).text( data );
		}
	);
}

function msDelay(millis) {
	var date = new Date();
	var curDate = null;
	do { 
		curDate = new Date(); 
	} while ( curDate-date < millis );
} 



function log( func, msg ){
	if ( //func=='PoNG-List' || 
		//func=='PoNG-Table' || 
		func=='loadResourcesHTajax' || 
		func=="PoNG-Security" ) { 
		console.log( "["+func+"] "+msg );
	}
}

function logErr( func, msg ){
	//if ( func == '' ) { 
		console.log( "["+func+"] ERROR: "+msg );
	//}
}


function getHookMethod( hook, type ) {
	log( 'getHookMethod', "hook="+hook+" type="+type );
	var fnName = "";
	/*
	for ( var i = 0; i < moduleHooks.length; i++ ) {
		moduleHook = moduleHooks[i];
		log( 'getHookMethod', "moduleHook.hook="+moduleHook.hook+" moduleHook.type="+moduleHook.type );
		if ( ( moduleHook.hook == hook ) && ( type == moduleHook.type ) ) {
				log( 'getHookMethod', moduleHook.method+"( ... )");
				fnName = moduleHook.method;
		}
	}*/
	if ( type != null )
	for ( var i = 0; i < moduleMap[ type ].hooks.length; i++ ) {
		moduleHook = moduleMap[ type ].hooks[i];
		log( 'getHookMethod', "moduleHook.hook="+moduleHook.hook );
		if ( moduleHook.hook == hook ) {
				log( 'getHookMethod', moduleHook.method+"( ... )");
				fnName = moduleHook.method;
		}
	}
	
	return fnName;
}

function getParam( name ) {
  name = name.replace( /[\[]/,"\\\[" ).replace( /[\]]/,"\\\]" );
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return decodeURIComponent( results[1].replace(/\+/g, " ") );
}
