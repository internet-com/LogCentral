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
log( "Pong-Table", "load module");

var poTbl = [];

function pongTableDivHTML( divId, resourceURL, params ) {
	log( "pongTableDivHTML",  "divId="+divId+" resourceURL="+resourceURL );
	poTbl[ divId ] = 
		{ 
			pongTableDef: null,
			divId: null, 
			pongTableStartRow: 0, 
			pongTableEndRow: 0,
			pongTableData: null, 
			pongTableFilter: "" 
		};
	
	poTbl[ divId ].divId = divId;
	var metaURL =  resourceURL+"/pong-table";
	if ( params != null  && params.def != null ) {
		metaURL = resourceURL+"/"+params.def;
	}
	$.getJSON( metaURL, 
		function( tbl ) {
			poTbl[ divId ].pongTableDef = tbl;
			// crunch form
			poTbl[ divId ].pongTableEndRow = tbl.maxRows;
			var contentItems = [];
			log( "pongTableDivHTML", "cre table" );
			
			if ( tbl.filter != null && tbl.filter.dataReqParamsSrc != null && tbl.filter.dataReqParams != null ) {
				if ( tbl.filter.dataReqParamsSrc == 'Form' ) {
					contentItems.push( '<div id="'+divId+'PongTableFrmDiv" class="pongTableFrm">' );
					contentItems.push( '<form id="'+divId+'PongTableFrm">' );
					contentItems.push( '<fieldset><legend>' +$.i18n('Filter') +'</legend>' );
					
					postLst = [];						
					for( var y = 0; y < tbl.filter.dataReqParams.length; y++ ) {
						prop = tbl.filter.dataReqParams[y];
						contentItems.push( '<p><label for="'+divId+prop.id+'">'+ $.i18n( prop.label ) +'</label>' );
						var nameAndClass = 'name="'+prop.id+'" id="'+divId+prop.id+'" class="text ui-widget-content ui-corner-all"'; 
						postLst.push( prop.id+": $( '#"+divId+prop.id+"' ).val()" )
						contentItems.push( '<input type="text" '+nameAndClass+'/></p>' );
						// TODO add field types
						
					}
					contentItems.push( '<button id="'+divId+'PongTableSrchBt">'+ $.i18n( 'Update Table' ) +'</button>' );
					contentItems.push( '</fieldset>' );
					contentItems.push( "</form>" );
					contentItems.push( '</div>' );


					poTbl[ divId ].pongTableFilter = postLst.join( "," );

					contentItems.push( "<script>" );
					contentItems.push( '$(function() { ' );
					contentItems.push( '    $( "#'+divId+'PongTableFrm" ).submit( ' );
					contentItems.push( '       function( event ) { ' );
					contentItems.push( '          $.getJSON( "'+dataUrl+'", {'+poTbl[ divId ].pongTableFilter+'}, ' );
					contentItems.push( '             function( data ) { ' );
					contentItems.push( '                 poTbl[ "'+divId+'" ].pongTableData = data;  ' );
					contentItems.push( '                 tblCells(  "'+divId+'" );' );
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
			
			contentItems.push( '<table id="'+divId+'PongTable" class="pongTable" width="100%">' );
			// cread table head
			contentItems.push( "<tr>" );
			for ( var i = 0; i < tbl.cols.length; i ++ ) {
				if ( tbl.cols[i].cellType == 'button' ) { // Button column get no headline
					contentItems.push( "<th>&nbsp;</th>"  );
				} else	if ( tbl.cols[i].cellType != 'tooltip' ) { // tool tip will be added to another col, so no own col
					contentItems.push( "<th>"+ $.i18n( (tbl.cols[i].label!=0 ? tbl.cols[i].label : "&nbsp;" ) ) +"</th>"  );
				}
			}
			contentItems.push( "</tr>" );
			for ( var r = 0; r < tbl.maxRows; r ++ ) {
				contentItems.push( "<tr>" );
				for ( var c = 0; c < tbl.cols.length; c ++ ) {
						if ( tbl.cols[c].cellType != 'tooltip' ) {
							contentItems.push( '<td id="'+divId+'R'+r+'C'+c+'">...</td>'  );
						}
				}
				contentItems.push( "</tr>" );
			}
			// paginator buttons
			contentItems.push( "</table>" );
			contentItems.push( '<button id="'+divId+'BtFirst"></button>' );
			contentItems.push( '<button id="'+divId+'BtPrev"></button>' );
			contentItems.push( '<button id="'+divId+'BtNext"></button>' );
			contentItems.push( '<button id="'+divId+'BtLast"></button>' );
			
			// paginator script
			contentItems.push( "<script>" );
			contentItems.push( "$(function() { ");
			contentItems.push( ' $( "#'+divId+'BtFirst").button( {icons:{primary:"ui-icon-arrowthickstop-1-w"}} )');
			contentItems.push( '  .click( function() { ' );
			contentItems.push( '     poTbl[ "'+divId+'" ].pongTableStartRow =0; ' );
			contentItems.push( '     poTbl[ "'+divId+'" ].pongTableEndRow = '+tbl.maxRows+';' );
			contentItems.push( '     tblCells( "'+divId+'" ); } ); ' );
			contentItems.push( ' $( "#'+divId+'BtLast" ).button( {icons:{primary:"ui-icon-arrowthickstop-1-e"}} )' );
			contentItems.push( '  .click( function() { ' );
			contentItems.push( '     poTbl[ "'+divId+'" ].pongTableStartRow =  parseInt(poTbl[ "'+divId+'" ].pongTableData.length)-parseInt('+tbl.maxRows+') ;' );
			contentItems.push( '     poTbl[ "'+divId+'" ].pongTableEndRow = poTbl[ "'+divId+'" ].pongTableData.length;' );
			contentItems.push( '     tblCells( "'+divId+'" ); } ); ' );
			
			contentItems.push( ' $( "#'+divId+'BtPrev" ).button( {icons:{primary:"ui-icon-arrowthick-1-w"}} )' );
			contentItems.push( '  .click( function() { ' );
			contentItems.push( '     if ( poTbl[ "'+divId+'" ].pongTableStartRow - '+tbl.maxRows+' >= 0 ) { ' );
			contentItems.push( '        poTbl[ "'+divId+'" ].pongTableStartRow -= '+tbl.maxRows+'; ' );
			contentItems.push( '        poTbl[ "'+divId+'" ].pongTableEndRow -= '+tbl.maxRows+';  ' );
			contentItems.push( '     } else { ' );
			contentItems.push( '        poTbl[ "'+divId+'" ].pongTableStartRow =0; ' );
			contentItems.push( '        poTbl[ "'+divId+'" ].pongTableEndRow = '+tbl.maxRows+'; ' );
			contentItems.push( '     } ' );
			contentItems.push( '     tblCells( "'+divId+'" ); } ); ' );
			
			contentItems.push( ' $( "#'+divId+'BtNext" ).button( {icons:{primary:"ui-icon-arrowthick-1-e"}} ).click( ' );
			contentItems.push( '  function() {' );
			contentItems.push( '     var xx = parseInt(poTbl[ "'+divId+'" ].pongTableStartRow) + parseInt('+tbl.maxRows +');' );
			contentItems.push( '     if ( xx < poTbl[ "'+divId+'" ].pongTableData.length ) {' );
			contentItems.push( '        poTbl[ "'+divId+'" ].pongTableStartRow = parseInt(poTbl[ "'+divId+'" ].pongTableStartRow) + parseInt('+tbl.maxRows+'); ' );
			contentItems.push( '        poTbl[ "'+divId+'" ].pongTableEndRow = parseInt(poTbl[ "'+divId+'" ].pongTableEndRow) + parseInt('+tbl.maxRows+'); ' );
			contentItems.push( '        tblCells( "'+divId+'" );' );
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
			$.getJSON( dataUrl,  
				function( data ) { 	
					if ( tbl.dataDocSubPath == null ) {
						// table is the root of the doc
						console.log( 'no tbl.dataDocSubPath' );
						poTbl[ divId ].pongTableData = data; 					
					} else {
						console.log( 'tbl.dataDocSubPath='+tbl.dataDocSubPath );
						// table is somewhere in the DOM tree
						var pathToken = tbl.dataDocSubPath.split('.');
						console.log( 'pathToken[0] ' + pathToken[0] );
						var subdata = data[ pathToken[0] ];
						console.log( ' subdata = ' + JSON.stringify( subdata ) );
						for ( i = 1; i < pathToken.length; i++ ) {
							console.log( 'pathToken['+i+'] ' + pathToken[i] );	
							subdata = subdata[ pathToken[i] ];
						}
						console.log( ' subdata = ' + JSON.stringify( subdata ) );
						poTbl[ divId ].pongTableData = subdata;
					}
					tblCells( divId ); 
				} 
			);

		}
	).always(
		function() {
			// ???
		}
	);
}

/** render table cells */
function tblCells( divId ) {
	var rowSt = parseInt( poTbl[ divId ].pongTableStartRow );
	var rowEn = parseInt( poTbl[ divId ].pongTableEndRow );
	log( "pongTableDivHTML", "divId="+divId+"Data #"+poTbl[ divId ].pongTableData.length + " rowSt="+rowSt + " rowEn="+rowEn );
	var i = 0;
	for ( var r = rowSt; r < rowEn; r++ ) {
		if ( r < poTbl[ divId ].pongTableData.length ) {
			for ( var c = 0; c < poTbl[ divId ].pongTableDef.cols.length; c++ ) {
				var cellId =  '#'+divId+'R'+i+'C'+c; 
				var cellType = poTbl[ divId ].pongTableDef.cols[c].cellType;
				log( "pongTableDivHTML", "R="+i+" C="+c+" "+cellType+ "  "+poTbl[ divId ].pongTableData[r][ poTbl[ divId ].pongTableDef.cols[c].id ] );
				if ( cellType == 'text' ) {
					$( cellId ).html( '<span id="'+divId+'R'+i+poTbl[ divId ].pongTableDef.cols[c].id+'">'+poTbl[ divId ].pongTableData[r][ poTbl[ divId ].pongTableDef.cols[c].id ] + '</span>' );
				} else if ( cellType == 'linkLink' ) {
					$( cellId ).html( '<a href="'+poTbl[ divId ].pongTableData[r][ poTbl[ divId ].pongTableDef.cols[c].id ]+'" id="'+divId+'R'+i+poTbl[ divId ].pongTableDef.cols[c].id+'">link</a>' );
				} else if ( cellType == 'img' ) {
					$( cellId ).html( '<img src="'+poTbl[ divId ].pongTableData[r][ poTbl[ divId ].pongTableDef.cols[c].id ]+'" id="'+divId+'R'+i+poTbl[ divId ].pongTableDef.cols[c].id+'"/>' );
				} else if ( cellType == 'button'  ) {
					$( cellId ).html( '<button id="'+divId+'R'+i+poTbl[ divId ].pongTableDef.cols[c].id+'">'+poTbl[ divId ].pongTableDef.cols[c].label+'</button>' );
				} else if ( cellType == 'tooltip'  ) {
					$( '#'+divId+'R'+i+poTbl[ divId ].pongTableDef.cols[c].label ).attr( 'title' , poTbl[ divId ].pongTableData[r][ poTbl[ divId ].pongTableDef.cols[c].id ] );
				} else {
					// ???
				}	
			}
		} else { // clear the rest of the cells
			for ( var c = 0; c < poTbl[ divId ].pongTableDef.cols.length; c++ ) {
				var cellId =  '#'+divId+'R'+i+'C'+c; 
				$( cellId ).html( '&nbsp;' );
			}
		}
		i++;
	}	
}
 