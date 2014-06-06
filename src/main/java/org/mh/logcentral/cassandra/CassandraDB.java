package org.mh.logcentral.cassandra;

import java.util.ArrayList;
import java.util.logging.Logger;

import org.mh.logcentral.model.LogFileList;
import org.mh.logcentral.model.LogFile;

import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.Host;
import com.datastax.driver.core.Metadata;
import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Row;
import com.datastax.driver.core.Session;

public class CassandraDB {

	private Cluster cluster;
	private Session session;

	private static final Logger LOGGER = Logger.getLogger( "CassandraDB" );

	/** open db connection */
	public void connect(String node) {
		cluster = Cluster.builder().addContactPoint( node ).build();
		Metadata metadata = cluster.getMetadata();
		LOGGER.info( "Connected to cluster: "+ metadata.getClusterName() );
		for ( Host host : metadata.getAllHosts() ) {
			LOGGER.info( "Datacenter: "+host.getDatacenter()+"; Host: "+host.getAddress()+"; Rack: "+ host.getRack() );
		}
	}

	/** close db connection */
	public void close() {
		cluster.close();
	}

	/** get overview of files in DB */
	public LogFileList getFileList() {
		LogFileList result = new LogFileList();
		session = cluster.connect();
		ResultSet results = session.execute( "SELECT * FROM logcentral.logfiles;" );

		ArrayList<LogFile> fileList = new ArrayList<LogFile>();
		for ( Row row : results ) {
			fileList.add(  new LogFile( row.getUUID( "log_id" ), row.getDate(  "upload_time" ), row.getString("device") ) );
		    LOGGER.info(  row.getUUID( "log_id" ) +" "+ row.getDate(  "upload_time" ) +" "+ row.getString("device") );
		}
		result.setFileList( fileList );
		
		
		
		session.close();
		return result;
	}

}
