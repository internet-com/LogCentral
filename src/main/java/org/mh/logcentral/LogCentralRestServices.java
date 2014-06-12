package org.mh.logcentral;

import java.util.List;
import java.util.logging.Logger;

import javax.annotation.security.RolesAllowed;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.MultivaluedMap;

import org.mh.logcentral.cassandra.CassandraDB;
import org.mh.logcentral.cassandra.LogFileDB;
import org.mh.logcentral.model.LogFileList;
import org.mh.logcentral.model.UploadStatus;
import org.apache.cxf.jaxrs.ext.multipart.Attachment;

import javax.activation.DataHandler;
import javax.servlet.http.HttpServletRequest;

import java.io.*;

/**
 * Simple but usefull service to upload files and download them using a web page
 */
public class LogCentralRestServices {

	/** logger */
	private static final Logger LOGGER = Logger.getLogger( "LogCentralRestServices" );

	
	/**
	 * The HTTP PUT stores a (text) file to the Cassandra DB
	 * @return upload status (JSON)
	 */
	@PUT
	@Path("/logfile")
	@Consumes("application/json")
	public Response uploadLog() {
		LOGGER.info( "Upload file..." );
		UploadStatus result = new UploadStatus();

		// TODO do upload

		result.setResult( "OK, but DB handling is still a todo, so only dummy code here!" );
		return Response.ok().entity( result ).type( MediaType.APPLICATION_JSON ).build();
	}

	/**
	 * Get meta data for all files stored in the Cassandra DB
	 * @return JSON list of files in the DB
	 */
	@GET
	@Path("/logfile")
	@Produces("application/json")
	@RolesAllowed("admin")
	public Response listLogFiles() {
		LOGGER.info( "List all files..." );
		LogFileList resultFileList = new LogFileList();
		// db code
		LogFileDB db = new LogFileDB();
		db.connect();
		// here it rocks
		
		resultFileList = db.getFileList();
		// polite, but does not hurt 
		db.close();
		// the magic marshaling line
		return Response.ok().entity( resultFileList ).type( MediaType.APPLICATION_JSON ).build();
	}

	/** found this code -- todo: test it */
	@POST
	@Path("/file")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	public Response uploadFile( List<Attachment> attachments, @Context HttpServletRequest request ) {
		for ( Attachment attr : attachments ) {
			DataHandler handler = attr.getDataHandler();
			try {
				InputStream upload = handler.getInputStream();
				MultivaluedMap httpHeader = attr.getHeaders();
				OutputStream out = new FileOutputStream( new File( getFileName( httpHeader ) ) );

				int read = 0;
				byte[] bytes = new byte[1024];
				while ( (read = upload.read( bytes )) != -1 ) {
					out.write( bytes, 0, read );
				}
				upload.close();
				out.flush();
				out.close();
			} catch ( Exception e ) {
				e.printStackTrace();
			}
		}

		return Response.ok( "file uploaded" ).build();
	}

	/** helper */
	private String getFileName( MultivaluedMap<String, String> header ) {
		String[] contentDisposition = header.getFirst( "Content-Disposition" ).split( ";" );

		for ( String filename : contentDisposition ) {
			if ( (filename.trim().startsWith( "filename" )) ) {

				String[] name = filename.split( "=" );

				String finalFileName = name[1].trim().replaceAll( "\"", "" );
				return finalFileName;
			}
		}
		return "unknown";
	}

}
