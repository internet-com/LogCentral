package org.mh.logcentral.model;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class UploadStatus {
	
	/* should be set with some technical information, if the upload was successfully or not */
	String result = "";

	
	/** default constructor */
	public UploadStatus() {
		super();
		result = "OK";
	}

	/**
	 * @return the result
	 */
	public String getResult() {
		return result;
	}

	/**
	 * @param result the result to set
	 */
	public void setResult( String result ) {
		this.result = result;
	}

}
