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
log( "PoNG-List", "load module");
var poList = [];

function pongListDivHTML( divId, resourceURL, params ) {
	log( "PoNG-List",  "divId="+divId+" resourceURL="+resourceURL );
	poList[ divId ] = 
		{ 
			pongListDef: null,
			divId: null, 
			pongListStartRow: 0, 
			pongListEndRow: 0,
			pongListData: null, 
			pongListFilter: "" 
		};
	poList[ divId ].divId = divId;
	$.getJSON( 
		resourceURL+"/pong-list", 
		function( tbl ) {
			poList[ divId ].pongListDef = tbl;
			// crunch form
			poList[ divId ].pongListEndRow = tbl.maxRows;
			var contentItems = [];
			log( "PoNG-List", "create HTML" );
			
			if ( tbl.filter != null &&  tbl.filter.dataReqParamsSrc != null && tbl.filter.dataReqParams != null ) {
				if ( tbl.filter.dataReqParamsSrc == 'Form' ) {
					contentItems.push( '<div id="'+divId+'PongListFrmDiv" class="pongListFrm">' );
					contentItems.push( '<form id="'+divId+'PongListFrm">' );
					contentItems.push( '<fieldset><legend>'+ $.i18n( 'Filter' ) + '</legend>' );
					
					postLst = [];						
					for( var y = 0; y < tbl.filter.dataReqParams.length; y++ ) {
						prop = tbl.filter.dataReqParams[y];
						contentItems.push( '<div class="PongListFrmFld"><label for="'+divId+prop.id+'">'+ $.i18n( prop.label ) +'</label>' );
						var nameAndClass = 'name="'+prop.id+'" id="'+divId+prop.id+'" class="text ui-widget-content ui-corner-all"'; 
						postLst.push( prop.id+": $( '#"+divId+prop.id+"' ).val()" )
						contentItems.push( '<input type="text" '+nameAndClass+'/></div>' );
						// TODO add field types
						
					}
					var btTxt = "Search";
					if ( tbl.filter.dataReqParamsBt != null ) { btTxt = tbl.filter.dataReqParamsBt}
					contentItems.push( '<button id="'+divId+'PongListSrchBt">'+  $.i18n( btTxt ) +'</button>' );
					contentItems.push( '</fieldset>' );
					contentItems.push( "</form>" );
					contentItems.push( '</div>' );


					poList[ divId ].pongListFilter = postLst.join( "," );

					contentItems.push( "<script>" );
					contentItems.push( '$(function() { ' );
					contentItems.push( '    $( "#'+divId+'PongListSrchBt" ).button().click( ' );
					contentItems.push( '       function( event ) { ' );
					contentItems.push( '          $.getJSON( "'+resourceURL+'/'+tbl.dataURL+'", {'+poList[ divId ].pongListFilter+'}, ' );
					contentItems.push( '             function( data ) { ' );
					contentItems.push( '                 poList[ "'+divId+'" ].pongListData = data;  ' );
					contentItems.push( '                 listDivCnt(  "'+divId+'" );' );
					contentItems.push( '          } ); ' );
					contentItems.push( '         return false;  ' );
					contentItems.push( '       }' );
					contentItems.push( '     );  ' );
					contentItems.push( ' }); ' );
					contentItems.push( "</script>" );
					
				} if ( tbl.filter.dataReqParamsSrc == 'SessionMap' ) {
					// TODO implement pongForm SessionMap
				}
			}
			
			contentItems.push( '<div id="'+divId+'PongList" class="pongList" width="100%">' );
			// cread table head
			for ( var r = 0; r < tbl.maxRows; r ++ ) {
				contentItems.push( '<div class="pongListRow">' );
				for ( var c = 0; c < tbl.divs.length; c ++ ) {
						if ( tbl.divs[c].cellType != 'tooltip'  ) {
							contentItems.push( '<div class="pongListCell pongListCell'+tbl.divs[c].id+'" id="'+divId+'R'+r+'C'+c+'">...</div>'  );
						}
				}
				contentItems.push( "</div>" );
			}
			// paginator buttons
			contentItems.push( "</div>" );
			
			contentItems.push( '<div id="'+divId+'PongListPagin" class="pongListPagin">' );
			contentItems.push( '<button id="'+divId+'BtFirst"></button>' );
			contentItems.push( '<button id="'+divId+'BtPrevPg"></button>' );
			contentItems.push( '<button id="'+divId+'BtPrev"></button>' );
			contentItems.push( '<button id="'+divId+'BtNext"></button>' );
			contentItems.push( '<button id="'+divId+'BtNextPg"></button>' );
			contentItems.push( '<button id="'+divId+'BtLast"></button>' );
			contentItems.push( "</div>" );
			
			// paginator script
			contentItems.push( "<script>" );
			contentItems.push( "$(function() { ");
			contentItems.push( ' $( "#'+divId+'BtFirst").button( {icons:{primary:"ui-icon-arrowthickstop-1-w"}} )');
			contentItems.push( '  .click( function() { ' );
			contentItems.push( '     poList[ "'+divId+'" ].StartRow =0; ' );
			contentItems.push( '     poList[ "'+divId+'" ].pongListEndRow = '+tbl.maxRows+';' );
			contentItems.push( '     listDivCnt( "'+divId+'" ); } ); ' );
			contentItems.push( ' $( "#'+divId+'BtLast" ).button( {icons:{primary:"ui-icon-arrowthickstop-1-e"}} )' );
			contentItems.push( '  .click( function() { ' );
			contentItems.push( '     poList[ "'+divId+'" ].pongListStartRow =  parseInt(poList[ "'+divId+'" ].pongListData.length)-parseInt('+tbl.maxRows+') ;' );
			contentItems.push( '     poList[ "'+divId+'" ].pongListEndRow = poList[ "'+divId+'" ].pongListData.length;' );
			contentItems.push( '     listDivCnt( "'+divId+'" ); } ); ' );
			
			contentItems.push( ' $( "#'+divId+'BtPrevPg" ).button( {icons:{primary:"ui-icon-arrowthick-1-w"}} )' );
			contentItems.push( '  .click( function() { ' );
			contentItems.push( '     if ( poList[ "'+divId+'" ].pongListStartRow - '+tbl.maxRows+' >= 0 ) { ' );
			contentItems.push( '        poList[ "'+divId+'" ].pongListStartRow -= '+tbl.maxRows+'; ' );
			contentItems.push( '        poList[ "'+divId+'" ].pongListEndRow -= '+tbl.maxRows+';  ' );
			contentItems.push( '     } else { ' );
			contentItems.push( '        poList[ "'+divId+'" ].pongListStartRow =0; ' );
			contentItems.push( '        poList[ "'+divId+'" ].pongListEndRow = '+tbl.maxRows+'; ' );
			contentItems.push( '     } ' );
			contentItems.push( '     listDivCnt( "'+divId+'" ); } ); ' );
			
			contentItems.push( ' $( "#'+divId+'BtNextPg" ).button( {icons:{primary:"ui-icon-arrowthick-1-e"}} ).click( ' );
			contentItems.push( '  function() {' );
			contentItems.push( '     var xx = parseInt(poList[ "'+divId+'" ].pongListStartRow) + parseInt('+tbl.maxRows +');' );
			contentItems.push( '     if ( xx < poList[ "'+divId+'" ].pongListData.length ) {' );
			contentItems.push( '        poList[ "'+divId+'" ].pongListStartRow = parseInt(poList[ "'+divId+'" ].pongListStartRow) + parseInt('+tbl.maxRows+'); ' );
			contentItems.push( '        poList[ "'+divId+'" ].pongListEndRow = parseInt(poList[ "'+divId+'" ].pongListEndRow) + parseInt('+tbl.maxRows+'); ' );
			contentItems.push( '        listDivCnt( "'+divId+'" );' );
			contentItems.push( '      }  } ); ' );
			
			contentItems.push( ' $( "#'+divId+'BtPrev" ).button( {icons:{primary:"ui-icon-carat-1-w"}} )' );
			contentItems.push( '  .click( function() { ' );
			contentItems.push( '     if ( poList[ "'+divId+'" ].pongListStartRow - 1 >= 0 ) { ' );
			contentItems.push( '        poList[ "'+divId+'" ].pongListStartRow-- ; ' );
			contentItems.push( '        poList[ "'+divId+'" ].pongListEndRow--;  ' );
			contentItems.push( '     } else { ' );
			contentItems.push( '        poList[ "'+divId+'" ].pongListStartRow =0; ' );
			contentItems.push( '        poList[ "'+divId+'" ].pongListEndRow = '+tbl.maxRows+'; ' );
			contentItems.push( '     } ' );
			contentItems.push( '     listDivCnt( "'+divId+'" ); } ); ' );
			
			contentItems.push( ' $( "#'+divId+'BtNext" ).button( {icons:{primary:"ui-icon-carat-1-e"}} ).click( ' );
			contentItems.push( '  function() {' );
			contentItems.push( '     var xx = parseInt(poList[ "'+divId+'" ].pongListStartRow) + 1;' );
			contentItems.push( '     if ( xx < poList[ "'+divId+'" ].pongListData.length ) {' );
			contentItems.push( '        poList[ "'+divId+'" ].pongListStartRow = parseInt(poList[ "'+divId+'" ].pongListStartRow) + 1; ' );
			contentItems.push( '        poList[ "'+divId+'" ].pongListEndRow = parseInt(poList[ "'+divId+'" ].pongListEndRow) + 1; ' );
			contentItems.push( '        listDivCnt( "'+divId+'" );' );
			contentItems.push( '      }  } ); ' );

			contentItems.push( " }); </script>" );
		    // create HTML
			$( "#"+divId ).html( contentItems.join( "\n" ) );
			
			var dataUrl = resourceURL;
			if ( tbl.dataURL != null ) {
				dataUrl = dataUrl+"/"+tbl.dataURL;
			}
			
			if ( params != null  && params.filter != null ) {
				for ( var i = 0; i < params.filter.length; i++ ) {
					if ( i == 0 ) { 
						dataUrl += "?"+params.filter[i].field+'='+params.filter[i].value; 
					} else {
						dataUrl += "&"+params.filter[i].field+'='+params.filter[i].value; 						
					}
				}
			}

			// replace content of cells by data
			//console.log( 'dataUrl='+dataUrl );
			$.getJSON( dataUrl,  
				function( data ) { 	
					if ( tbl.dataDocSubPath == null ) {
						// table is the root of the doc
						//console.log( 'no tbl.dataDocSubPath' );
						poList[ divId ].pongListData = data; 					
					} else {
						console.log( 'tbl.dataDocSubPath='+tbl.dataDocSubPath );
						// table is somewhere in the DOM tree
						var pathToken = tbl.dataDocSubPath.split('.');
						console.log( 'pathToken[0] ' + pathToken[0] );
						var subdata = data[ pathToken[0] ];
						for ( i = 1; i < pathToken.length; i++ ) {
							console.log( 'pathToken['+i+'] ' + pathToken[i] );	
							subdata = subdata[ pathToken[i] ];
						}
						// console.log( ' subdata = ' + JSON.stringify( subdata ) );
						poTbl[ divId ].pongListData = subdata;
					}
					listDivCnt( divId ); 
				} 
			);
			
		}
	).always(
		function() {
			// ???
		}
	);
}

function listDivCnt( divId ) {
	var rowSt = parseInt( poList[ divId ].pongListStartRow );
	var rowEn = parseInt( poList[ divId ].pongListEndRow );
	log( "PoNG-List", "divId="+divId+"Data #"+poList[ divId ].pongListData.length + " rowSt="+rowSt + " rowEn="+rowEn );
	var i = 0;
	for ( var r = rowSt; r < rowEn; r++ ) {
		if ( r < poList[ divId ].pongListData.length ) {
			for ( var c = 0; c < poList[ divId ].pongListDef.divs.length; c++ ) {
				var cellId =  '#'+divId+'R'+i+'C'+c; 
				var cellType = poList[ divId ].pongListDef.divs[c].cellType;
				log( "PoNG-List", "R="+i+" C="+c+" "+cellType+ "  "+poList[ divId ].pongListData[r][ poList[ divId ].pongListDef.divs[c].id ] );
				if ( cellType == 'text' ) {
					$( cellId ).html( '<span id="'+divId+'R'+i+poList[ divId ].pongListDef.divs[c].id+'">'+poList[ divId ].pongListData[r][ poList[ divId ].pongListDef.divs[c].id ] + '</span>' );
				} else if ( cellType == 'linkLink' ) {
					$( cellId ).html( '<a href="'+poList[ divId ].pongListData[r][ poList[ divId ].pongListDef.divs[c].id ]+'" id="'+divId+'R'+i+poList[ divId ].pongListDef.divs[c].id+'">link</a>' );
				} else if ( cellType == 'img' ) {
					$( cellId ).html( '<img src="'+poList[ divId ].pongListData[r][ poList[ divId ].pongListDef.divs[c].id ]+'" id="'+divId+'R'+i+poList[ divId ].pongListDef.divs[c].id+'"/>' );
				} else if ( cellType == 'button'  ) {
					$( cellId ).html( '<button id="'+divId+'R'+i+poList[ divId ].pongListDef.divs[c].id+'">'+poList[ divId ].pongListDef.divs[c].label+'</button>' );
				} else if ( cellType == 'tooltip'  ) {
					$( '#'+divId+'R'+i+poList[ divId ].pongListDef.divs[c].label ).attr( 'title' , poList[ divId ].pongListData[r][ poList[ divId ].pongListDef.divs[c].id ] );
				} else {
					// ???
				}	
			}
		} else { // clear the rest of the cells
			for ( var c = 0; c < poList[ divId ].pongListDef.divs.length; c++ ) {
				var cellId =  '#'+divId+'R'+i+'C'+c; 
				$( cellId ).html( '&nbsp;' );
			}
		}
		i++;
	}	
}
