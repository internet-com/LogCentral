log( "PoNG-Security", "Loading Module");


function initSecurityHeaderHtml( divId, type , params ) {
	if ( userID == null ) {
		if ( params != null  && params.loginURL != null && params.rolesURL != null ) {
			ajaxOngoing++;
			$.post( params.loginURL, 
				function ( data ) {
					if ( data != "Unauthorized" ) {
						userID = data;	
						$.post( params.rolesURL, 
							function ( roles ) {
								pageInfo["userRoles"] = [];
								for ( var i = 0; i < roles.length; i++ ) {
									//console.log( roles[i] );
									pageInfo["userRoles"].push( roles[i] );
								}
								ajaxOngoing--;
							}
						);
						if ( getParam('role') != null  && getParam('role') != '' ) {
							userRole = getParam('role'); 
						}
					} else {
						userRole = null;
						ajaxOngoing--;
					} 
				} 
			);
		}
	}
}

function addSecurityHeaderHtml( divId, type , params ) {
	log( "PoNG-Security", "start addSecurityHeaderHtml "+divId);
	
	var divHtml = [];
	
	divHtml.push( '<div id="SecurityHeader">' );
	//alert( userID );
	if ( userID == null ) {
		if ( params != null  ) {
			var makeLoginForm = false;
			if ( params.registgerURL != null && params.loginURL != null  ) {
				divHtml.push( '<a href="'+ params.registgerURL+'">'+ $.i18n('Register') + '</a>&nbsp;&nbsp;<a class="PongLogin" href="'+ params.loginURL+'">' +$.i18n('Login')+'</a>' );
				makeLoginForm = true;
			} else if ( params.loginURL != null ) {
				divHtml.push( '<a class="PongLogin" href="'+ params.loginURL+'">' +$.i18n('Login')+'</a>' );		
				makeLoginForm = true;
			}
			var lang = ""
			if ( getParam('lang') != null  && getParam('lang') != '' ) {
				lang = "?lang="+getParam('lang');
			}
			
			if ( makeLoginForm ) {
				var cssClass = 'class="text ui-widget-content ui-corner-all"';
 				divHtml.push( '<div id="pongLoginDialog">' );
				divHtml.push( ' <form id="pongLoginDialogForm" action="'+params.loginURL+'" method="post"><fieldset>' );
				divHtml.push( '  <label for="userid">'+$.i18n('User ID')+'</label><br/>' );
				divHtml.push( '  <input id="useridInput" name="userid" type="text" class="'+cssClass+'/><br/>' );
				divHtml.push( '  <label for="password">'+$.i18n('Passwort')+'</label><br/>' );
				divHtml.push( '  <input id="passwordInput" name="password" type="password" class="'+cssClass+'/><br/>' );
				divHtml.push( '</form></fieldset><span id="loginResult"></span></div>' );
				divHtml.push( '<script>' );
				divHtml.push( '$( function() { $( "#pongLoginDialog" ).dialog( { ' );
				divHtml.push( '  autoOpen: false, height: 300, width: 300, modal: true, ' );
				divHtml.push( '  buttons: { "Login": function() { ' );
				divHtml.push( '      $.post( "'+params.loginURL+'", ' );
				divHtml.push( '         { userid: $( "#useridInput" ).val(), password: $( "#passwordInput" ).val() }, ' );
				divHtml.push( '         function( data ) { ' );
				divHtml.push( '             $( "#loginResult" ).html( $.i18n( data ) ); ' );
				divHtml.push( '             if ( data == "Login OK" ) { window.location.href = "index.html'+lang+'"; } ' );
				divHtml.push( '         } ); ' );
				divHtml.push( '      return false;' );
				divHtml.push( '  }, Cancel: function() { $( this ).dialog( "close" ); } } }); ' );
				divHtml.push( '});' );			
				divHtml.push( '$( ".PongLogin" ).click( ' );
				divHtml.push( '  function( ) { ' ); 
				divHtml.push( '         $( "#pongLoginDialog" ).dialog( "open" ); return false; ' );
				divHtml.push( '  } );' );
				divHtml.push( '</script>' );
			}
		}
	} else {
		divHtml.push( '<form id="SecurityHeaderFrom" action="index.html">' );
		divHtml.push( $.i18n('User')+':&nbsp;'+userID + '&nbsp;'+ $.i18n('Role')+'&nbsp;:' );
		if ( getParam('layout') != null && getParam('layout') != '' ) {
			divHtml.push( '<input type="hidden" name="layout" value="'+getParam('layout')+'"/>' );			
		}
		var lang = ""
		if ( getParam('lang') != null  && getParam('lang') != '' ) {
			divHtml.push( '<input type="hidden" name="lang" value="'+getParam('lang')+'"/>' );
			lang = "?lang="+getParam('lang');
		}

		divHtml.push( '<select id="SecurityHeaderRoleSelect" name="role" size="1">' );
		var roles = pageInfo["userRoles"];
		for ( var i = 0; i < roles.length; i++ ) {
			if ( userRole == roles[i].role ) {
				divHtml.push( '<option selected>'+ roles[i].role +'</option>' );			
			} else {
				divHtml.push( '<option>'+ roles[i].role +'</option>' );							
			}
		}
		divHtml.push( '</select>&nbsp;');
		divHtml.push( '<a href="logout.htm" class="PongLogout">'+$.i18n('Logout')+'</a>' );
		divHtml.push( '</form>' );
		divHtml.push( '<script>' );
		divHtml.push( '  $( "#SecurityHeaderRoleSelect" ).change(function() { ');
		divHtml.push( '     $( "#SecurityHeaderFrom" ).submit();');
		divHtml.push( '  });');
		divHtml.push( '$( ".PongLogout" ).click( ' );
		divHtml.push( '  function( ) { ' ); 
		divHtml.push( '      $.post( "'+params.logoutURL+'" ) ' ); 
		divHtml.push( '      .always( function() { ' );
		divHtml.push( '           window.location.href = "index.html'+lang+'"; ' ); 
		divHtml.push( '      } ); ' ); 
		divHtml.push( '      return false; ' );
		divHtml.push( '  } );' );
		divHtml.push( '</script>' );
	}
	divHtml.push( '</div>' );
	
	$( "#"+divId ).html( divHtml.join( "\n" ) );
}