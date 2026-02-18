/**
 * Google Apps Script for Document Center
 * 
 * This script returns files from a Google Drive folder as JSON.
 * It accepts a folderId parameter to support multiple folders.
 * 
 * SETUP:
 * 1. Go to https://script.google.com and create a new project
 * 2. Paste this code
 * 3. Deploy as Web App:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the deployment URL
 * 
 * USAGE:
 * - With folder ID: https://script.google.com/.../exec?folderId=YOUR_FOLDER_ID
 * - The folder ID is the part after /folders/ in a Google Drive URL
 */

function doGet(e) {
  try {
    // Get folder ID from URL parameter, or use default
    const folderId = e.parameter.folderId;
    
    if (!folderId) {
      return ContentService.createTextOutput(JSON.stringify({ 
        error: 'folderId parameter is required' 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const fileList = [];
    
    while (files.hasNext()) {
      const file = files.next();
      fileList.push({
        id: file.getId(),
        name: file.getName(),
        size: file.getSize(),
        mimeType: file.getMimeType(),
        modifiedTime: file.getLastUpdated().toISOString(),
        url: file.getUrl()
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify(fileList))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      error: error.message 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
