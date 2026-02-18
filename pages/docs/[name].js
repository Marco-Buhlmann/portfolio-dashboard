import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';

const APPS_SCRIPT_BASE_URL = 'https://script.google.com/macros/s/AKfycbwY4tU-QcEf0pSdJXzDqnX9r_7KxET44dz2Hm9ebtSTyI9TWd33dmQB0WY1Vq-VMw5KXQ/exec';

export default function DocumentCenter() {
  const router = useRouter();
  const { name, folderId } = router.query;
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name-asc');

  useEffect(() => {
    if (!folderId) return;
    
    const apiUrl = `${APPS_SCRIPT_BASE_URL}?folderId=${folderId}`;
    
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setFiles(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [folderId]);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return '📎';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎬';
    if (mimeType.includes('audio')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('sheet')) return '📊';
    if (mimeType.includes('document')) return '📝';
    if (mimeType.includes('presentation')) return '🎞️';
    return '📎';
  };

  const sortedFiles = [...files].sort((a, b) => {
    const [field, direction] = sortBy.split('-');
    let aVal, bVal;
    
    if (field === 'name') {
      aVal = (a.name || '').toLowerCase();
      bVal = (b.name || '').toLowerCase();
    } else if (field === 'size') {
      aVal = a.size || 0;
      bVal = b.size || 0;
    } else if (field === 'modified') {
      aVal = new Date(a.modifiedTime || 0);
      bVal = new Date(b.modifiedTime || 0);
    }
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

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

  return (
    <>
      <Head>
        <title>Document Center</title>
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ 
        fontFamily: 'Open Sans, sans-serif', 
        background: '#000', 
        minHeight: '100vh',
        padding: '24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', color: '#B3DEB2' }}>Sort by:</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '2px solid #B3DEB2',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#000',
                color: 'white',
                cursor: 'pointer',
                fontFamily: 'Open Sans, sans-serif'
              }}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="size-asc">Size (smallest)</option>
              <option value="size-desc">Size (largest)</option>
              <option value="modified-desc">Modified (newest)</option>
              <option value="modified-asc">Modified (oldest)</option>
            </select>
          </div>

          {error && (
            <div style={{
              background: '#fee',
              border: '1px solid #fcc',
              color: '#c33',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '24px'
            }}>
              Error loading files: {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#666' }}>
              Loading files...
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {sortedFiles.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                  >
                    <div style={{
                      width: '100%',
                      height: '120px',
                      background: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px'
                    }}>
                      {getFileIcon(file.mimeType)}
                    </div>
                    <div style={{ padding: '12px' }}>
                      <div style={{
                        fontWeight: 500,
                        fontSize: '13px',
                        color: '#333',
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
              {sortedFiles.length === 0 && !loading && (
                <p style={{ textAlign: 'center', color: '#999', gridColumn: '1 / -1' }}>
                  No files found
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
