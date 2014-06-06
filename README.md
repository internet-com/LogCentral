This is a simple but useful service to enable "things" out there to upload some files. 

The files are stored centrally in a Cassandra DB and you can list and download the files via a comfortable web user interface.

Use case  examples:
* devices send a daily log
* collect smartphone app error traces
* download UI for data files which are already in Cassandra

Build from code
===============
<pre>
git clone https://github.com/ma-ha/LogCentral.git
cd LogCentral
mvn clean install -Dmaven.test.skip=true
</pre>
Target run time is a WSO2 Application Server (tested with WSO2 AS 5.2.0, but you can try Tomcat).
 
WSO2 AS greenhorns: Download WSO2 AS from <a href="http://www.wso2.com">WSO2</a>, unzip and double click wso2as-x.z.z/bin/wso2server.sh or .bat


To deploy, you can use the Jenkins WSO2 AS deployer plug in or upload it manually: 
Use the WSO2 Carbon web GUI on https://localhost:9443/carbon and log in as admin with password admin.
Main > Add > Web Applications (select LogCentral.war file in the "target" directory)


Set up Cassandra 2.0.8:
=======================
Download, install and start Cassandra noSQL database -- if not already done: It is easy, so hurry up.
<pre>
start cqlsh

CREATE KEYSPACE logcentral WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };
USE logcentral;

CREATE TABLE logfiles (
  log_id uuid PRIMARY KEY,
  device text,
  upload_time timestamp,
  content text,
  tenant text
);
</pre>
Insert some example data:
<pre>
INSERT INTO logfiles ( log_id,  device, upload_time, content, tenant)  VALUES ( 62c36092-82a1-3a00-93d1-46196ee77204 , 'pi', '2014-06-05 22:30:00', 'content1', 'default' );
INSERT INTO logfiles ( log_id,  device, upload_time, content, tenant)  VALUES ( 550e8400-e29b-41d4-a716-446655440000 , 'pi', '2014-06-05 22:30:01', 'content2', 'default' );
select * from logfiles;
</pre>

Test
====
Use the RESTclient browser plug in and generate a GET request to the URL, e.g. http://localhost:9763/LogCentral/services/logfile

You should get a 

Add the Basic Authentication: by default you can use the admin user of WSO2 (default password is admin).
