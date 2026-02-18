import { useRouter } from 'next/router';
import Head from 'next/head';

const APPS_SCRIPT_BASE_URL = 'https://script.google.com/macros/s/AKfycbwY4tU-QcEf0pSdJXzDqnX9r_7KxET44dz2Hm9ebtSTyI9TWd33dmQB0WY1Vq-VMw5KXQ/exec';

export default function DocumentCenter() {
  const router = useRouter();
  const { name, folderId } = router.query;

  if (!folderId) {
    return (
      <div style={{ 
        fontFamily: 'Open Sans, sans-serif', 
        background: '#000', 
        color: '#fff', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p>Missing folder ID parameter</p>
      </div>
    );
  }

  const apiUrl = `${APPS_SCRIPT_BASE_URL}?folderId=${folderId}`;

  return (
    <>
      <Head>
        <title>Document Center - {name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <style jsx global>{`
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
      `}</style>
      <div className="container">
        <style jsx>{`
          .container {
            max-width: 1200px;
            margin: 0 auto;
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
          .controls label {
            font-size: 14px;
            color: #B3DEB2;
            font-family: 'Open Sans', sans-serif;
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
        `}</style>
        <div className="controls">
          <label htmlFor="sortBy">Sort by:</label>
          <select id="sortBy" onChange={(e) => {
            if (typeof window !== 'undefined' && window.renderFiles) {
              window.renderFiles(e.target.value);
            }
          }}>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="size-asc">Size (smallest)</option>
            <option value="size-desc">Size (largest)</option>
            <option value="modified-desc">Modified (newest)</option>
            <option value="modified-asc">Modified (oldest)</option>
          </select>
        </div>
        <div id="errorContainer"></div>
        <div id="content" className="loading">Loading files...</div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `
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

        window.renderFiles = function(sortBy) {
          sortBy = sortBy || 'name-asc';
          const sorted = sortFiles(allFiles, sortBy);
          const html = sorted.map(file => {
            const thumb = getThumbnailUrl(file.id, file.mimeType);
            const icon = getFileIcon(file.mimeType);
            const sizeStr = file.size ? formatFileSize(file.size) : 'N/A';
            const thumbHtml = thumb 
              ? '<img src="' + thumb + '" alt="' + file.name + '" style="width:100%;height:100%;object-fit:cover;">' 
              : '<div style="font-size:48px;">' + icon + '</div>';
            return '<a href="' + file.url + '" target="_blank" style="text-decoration:none;color:inherit;">' +
              '<div style="background:white;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;display:flex;flex-direction:column;" onmouseover="this.style.transform=\\'translateY(-4px)\\';this.style.boxShadow=\\'0 4px 12px rgba(0,0,0,0.1)\\';" onmouseout="this.style.transform=\\'\\';this.style.boxShadow=\\'\\';">' +
                '<div style="width:100%;height:120px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;overflow:hidden;">' + thumbHtml + '</div>' +
                '<div style="padding:12px;flex:1;display:flex;flex-direction:column;">' +
                  '<div style="font-weight:500;font-size:13px;color:#333;word-break:break-word;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">' + file.name + '</div>' +
                  '<div style="font-size:11px;color:#999;margin-top:6px;">' + sizeStr + '</div>' +
                '</div>' +
              '</div>' +
            '</a>';
          }).join('');
          const content = document.getElementById('content');
          content.innerHTML = html || '<p style="text-align:center;color:#999;">No files found</p>';
          if (allFiles.length > 0) {
            content.style.display = 'grid';
            content.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
            content.style.gap = '16px';
          }
        };

        fetch(API_URL)
          .then(response => response.json())
          .then(files => {
            if (files.error) throw new Error(files.error);
            allFiles = files;
            window.renderFiles('name-asc');
          })
          .catch(error => {
            document.getElementById('errorContainer').innerHTML = '<div style="background:#fee;border:1px solid #fcc;color:#c33;padding:12px;border-radius:4px;margin-bottom:24px;">Error loading files: ' + error.message + '</div>';
            document.getElementById('content').innerHTML = '';
          });
      `}} />
    </>
  );
}
