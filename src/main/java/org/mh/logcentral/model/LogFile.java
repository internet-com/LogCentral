package org.mh.logcentral.model;

import java.util.Date;
import java.util.UUID;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class LogFile {

	UUID id = null;
	Date uploadTime = null;
	String device = null;
	String contentUrl = null;
	
	
	public LogFile() {
		super();
	}


	public LogFile( UUID id, Date uploadTime, String device ) {
		super();
		this.id = id;
		this.uploadTime = uploadTime;
		this.device = device;
		this.contentUrl = "/"+id.toString();
	}


	/**
	 * @return the id
	 */
	public UUID getId() {
		return id;
	}


	/**
	 * @param id the id to set
	 */
	public void setId( UUID id ) {
		this.id = id;
	}


	/**
	 * @return the uploadTime
	 */
	public Date getUploadTime() {
		return uploadTime;
	}


	/**
	 * @param uploadTime the uploadTime to set
	 */
	public void setUploadTime( Date uploadTime ) {
		this.uploadTime = uploadTime;
	}


	/**
	 * @return the device
	 */
	public String getDevice() {
		return device;
	}


	/**
	 * @param device the device to set
	 */
	public void setDevice( String device ) {
		this.device = device;
	}


	/**
	 * @return the contentUrl
	 */
	public String getContentUrl() {
		return contentUrl;
	}


	/**
	 * @param contentUrl the contentUrl to set
	 */
	public void setContentUrl( String contentUrl ) {
		this.contentUrl = contentUrl;
	}
	
	
}
