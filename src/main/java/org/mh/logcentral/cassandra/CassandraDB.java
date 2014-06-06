package org.mh.logcentral.cassandra;

import java.util.logging.Logger;

import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.Host;
import com.datastax.driver.core.Metadata;
import com.datastax.driver.core.Session;

/** Code to connect to the DB, store files, list files and load a file */
public class CassandraDB {

	// TODO: externalize this into the WSO2 AS configuration registry
	String node = "127.0.0.1";
	
	protected Cluster cluster;
	protected Session session;

	protected static final Logger LOGGER = Logger.getLogger( "CassandraDB" );

	/** open db connection */
	public void connect() {
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

}
