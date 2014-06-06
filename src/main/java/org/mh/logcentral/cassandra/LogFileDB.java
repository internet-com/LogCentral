package org.mh.logcentral.cassandra;

import java.util.ArrayList;

import org.mh.logcentral.model.LogFile;
import org.mh.logcentral.model.LogFileList;

import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;

public class LogFileDB extends CassandraDB {	

	/** Store file content into DB */
	public void storeFile( String fileContent ) {
		session = cluster.connect();
		// TODO implement storetFile(...)
		session.close();		
	}
	
	
	/** Get overview of files in DB */
	public LogFileList getFileList() {
		LogFileList result = new LogFileList();
		session = cluster.connect();
		ResultSet results = session.execute( "SELECT * FROM logcentral.logfiles;" );

		ArrayList<LogFile> fileList = new ArrayList<LogFile>();
		for ( Row row : results ) {
			
			// if you have a differnet table layout, you have to xutomize this lines
			fileList.add(  new LogFile( row.getUUID( "log_id" ), row.getDate(  "upload_time" ), row.getString("device") ) );
		    LOGGER.info(  row.getUUID( "log_id" ) +" "+ row.getDate(  "upload_time" ) +" "+ row.getString("device") );
		}
		result.setFileList( fileList );
		
		session.close();
		return result;
	}
	
	
	/** Load file content from DB */
	public String getFile( String fileId ) {
		String fileContent = "";
		session = cluster.connect();
		ResultSet results = session.execute( "SELECT * FROM logcentral.logfiles WHERE id = "+fileId+";" );

		for ( Row row : results ) {
			
			// if you have a differnet table layout, you have to xutomize this lines
			fileContent = row.getString( "content" );
		    LOGGER.info(  row.getUUID( "log_id" ) +" "+ row.getDate(  "upload_time" ) +" "+ row.getString("device") );
		}
		
		session.close();		
		return fileContent;
	}

	
}
