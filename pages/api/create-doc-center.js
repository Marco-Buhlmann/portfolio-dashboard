import fs from 'fs';
import path from 'path';

const APPS_SCRIPT_BASE_URL = 'https://script.google.com/macros/s/AKfycbwY4tU-QcEf0pSdJXzDqnX9r_7KxET44dz2Hm9ebtSTyI9TWd33dmQB0WY1Vq-VMw5KXQ/exec';

const generateDocCenterHTML = (investorName, folderId) => {
  const apiUrl = `${APPS_SCRIPT_BASE_URL}?folderId=${folderId}`;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Center - ${investorName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Open Sans', sans-serif;
      background: #000000;
      padding: 24px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 24px;
    }
    .header h1 {
      color: #B3DEB2;
      font-size: 24px;
      font-weight: 600;
    }
    .controls {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      align-items: center;
    }
    .controls select {
      padding: 8px 12px;
      border: 2px solid #B3DEB2;
      border-radius: 8px;
      font-size: 14px;
      background: #000000;
      color: white;
      cursor: pointer;
      font-family: 'Open Sans', sans-serif;
    }
    .controls select option {
      background: #000000;
      color: white;
    }
    .controls label {
      font-size: 14px;
      color: #B3DEB2;
      font-family: 'Open Sans', sans-serif;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }
    .file-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
    }
    .file-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .file-thumbnail {
      width: 100%;
      height: 120px;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .file-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .file-icon {
      font-size: 48px;
    }
    .file-info {
      padding: 12px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .file-name {
      font-weight: 500;
      font-size: 13px;
      color: #333;
      word-break: break-word;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .file-size {
      font-size: 11px;
      color: #999;
      margin-top: 6px;
    }
    .loading {
      text-align: center;
      padding: 48px 24px;
      color: #666;
    }
    .error {
      background: #fee;
      border: 1px solid #fcc;
      color: #c33;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="controls">
      <label for="sortBy">Sort by:</label>
      <select id="sortBy">
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
        <option value="size-asc">Size (smallest)</option>
        <option value="size-desc">Size (largest)</option>
        <option value="modified-desc">Modified (newest)</option>
        <option value="modified-asc">Modified (oldest)</option>
      </select>
    </div>
    <div id="errorContainer"></div>
    <div id="content" class="loading">Loading files...</div>
  </div>

  <script>
    let allFiles = [];
    const API_URL = '${apiUrl}';

    function formatFileSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function getFileIcon(mimeType) {
      if (mimeType.includes('image')) return '🖼️';
      if (mimeType.includes('video')) return '🎬';
      if (mimeType.includes('audio')) return '🎵';
      if (mimeType.includes('pdf')) return '📄';
      if (mimeType.includes('sheet')) return '📊';
      if (mimeType.includes('document')) return '📝';
      if (mimeType.includes('presentation')) return '🎞️';
      return '📎';
    }

    function getThumbnailUrl(fileId, mimeType) {
      if (mimeType.includes('image') || mimeType.includes('video')) {
        return 'https://drive-thumnails.googleusercontent.com/d/' + fileId + '=w160-h120-c';
      }
      return null;
    }

    function sortFiles(files, sortBy) {
      const [field, direction] = sortBy.split('-');
      const sorted = [...files];

      sorted.sort((a, b) => {
        let aVal, bVal;

        if (field === 'name') {
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
        } else if (field === 'size') {
          aVal = a.size || 0;
          bVal = b.size || 0;
        } else if (field === 'modified') {
          aVal = new Date(a.modifiedTime);
          bVal = new Date(b.modifiedTime);
        }

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });

      return sorted;
    }

    function renderFiles(sortBy = 'name-asc') {
      const sorted = sortFiles(allFiles, sortBy);
      const html = sorted.map(file => {
        const thumb = getThumbnailUrl(file.id, file.mimeType);
        const icon = getFileIcon(file.mimeType);
        const sizeStr = file.size ? formatFileSize(file.size) : 'N/A';
        const thumbHtml = thumb ? '<img src="' + thumb + '" alt="' + file.name + '">' : '<div class="file-icon">' + icon + '</div>';

        return '<a href="' + file.url + '" target="_blank" style="text-decoration: none; color: inherit;"><div class="file-card"><div class="file-thumbnail">' + thumbHtml + '</div><div class="file-info"><div class="file-name">' + file.name + '</div><div class="file-size">' + sizeStr + '</div></div></div></a>';
      }).join('');

      document.getElementById('content').innerHTML = html || '<p style="text-align: center; color: #999;">No files found</p>';
      applyGridClass();
    }

    function applyGridClass() {
      const content = document.getElementById('content');
      if (allFiles.length > 0) {
        content.className = 'grid';
      }
    }

    document.getElementById('sortBy').addEventListener('change', (e) => {
      renderFiles(e.target.value);
    });

    function init() {
      fetch(API_URL)
        .then(response => response.json())
        .then(files => {
          allFiles = files;
          renderFiles();
        })
        .catch(error => {
          document.getElementById('errorContainer').innerHTML = '<div class="error">Error loading files: ' + error.message + '</div>';
          document.getElementById('content').innerHTML = '';
        });
    }

    init();
  </script>
</body>
</html>`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { investorName, folderId } = req.body;

  if (!investorName || !folderId) {
    return res.status(400).json({ error: 'investorName and folderId are required' });
  }

  try {
    const safeName = investorName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileName = `${safeName}.html`;
    const filePath = path.join(process.cwd(), 'public', 'docs', fileName);

    const htmlContent = generateDocCenterHTML(investorName, folderId);
    
    fs.writeFileSync(filePath, htmlContent, 'utf8');

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dashboard.3cubed.vc';
    const docUrl = `${baseUrl}/docs/${fileName}`;
    const embedCode = `<iframe src="${docUrl}" style="width:100%;height:800px;border:none;"></iframe>`;

    return res.status(200).json({
      success: true,
      url: docUrl,
      embedCode,
      fileName,
    });
  } catch (error) {
    console.error('Error creating document center:', error);
    return res.status(500).json({ error: error.message });
  }
}
