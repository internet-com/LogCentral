package org.mh.logcentral.model;

import java.util.ArrayList;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class LogFileList {
	
	String info = "Hmmmm!";
	
	ArrayList<LogFile> fileList = new ArrayList<LogFile>( );
	
	/** default constructor */
	public LogFileList() {
		super();
	}

	/**
	 * @return the info
	 */
	public String getInfo() {
		return info;
	}

	/**
	 * @param info the info to set
	 */
	public void setInfo( String info ) {
		this.info = info;
	}

	/**
	 * @return the fileList
	 */
	public ArrayList<LogFile> getFileList() {
		return fileList;
	}

	/**
	 * @param fileList the fileList to set
	 */
	public void setFileList( ArrayList<LogFile> fileList ) {
		this.fileList = fileList;
	}

}
