import React, { useState, useEffect } from 'react';
import { fetchAllRecords, createRecord, updateRecord, deleteRecord } from '../lib/airtable';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '612501';
const SITE_URL = 'https://dashboard.3cubed.vc';

const AdminDashboard = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showDocCenterModal, setShowDocCenterModal] = useState(false);
  const [docCenterInvestor, setDocCenterInvestor] = useState('');
  const [docCenterFolderId, setDocCenterFolderId] = useState('');
  const [docCenterCreating, setDocCenterCreating] = useState(false);
  const [docCenterResult, setDocCenterResult] = useState(null);
  const [formData, setFormData] = useState({
    investorName: '',
    security: '',
    unitsHeld: '',
    issuePrice: '',
    totalInvested: '',
    latestPSS: '',
    unitsSold: '',
    redemptionPrice: '',
    valuationHistory: '',
    fundingRounds: '',
    lastValuation: '',
    sharesOutstanding: '',
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      loadRecords();
    } else {
      setError('Invalid password');
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllRecords();
      setRecords(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      investorName: '',
      security: '',
      unitsHeld: '',
      issuePrice: '',
      totalInvested: '',
      latestPSS: '',
      unitsSold: '',
      redemptionPrice: '',
      valuationHistory: '',
      fundingRounds: '',
      lastValuation: '',
      sharesOutstanding: '',
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  const handleEdit = (record) => {
    setFormData({
      investorName: record.investorName,
      security: record.security,
      unitsHeld: record.unitsHeld,
      issuePrice: record.issuePrice,
      totalInvested: record.totalInvested,
      latestPSS: record.latestPSS,
      unitsSold: record.unitsSold,
      redemptionPrice: record.redemptionPrice,
      valuationHistory: record.valuationHistory,
      fundingRounds: record.fundingRounds,
      lastValuation: record.lastValuation,
      sharesOutstanding: record.sharesOutstanding,
    });
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (editingRecord) {
        await updateRecord(editingRecord.id, formData);
      } else {
        await createRecord(formData);
      }
      await loadRecords();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (recordId) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    setLoading(true);
    setError(null);
    try {
      await deleteRecord(recordId);
      await loadRecords();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const copyEmbedCode = (investorName) => {
    const encodedName = encodeURIComponent(investorName);
    const embedCode = `<iframe src="${SITE_URL}/${encodedName}" width="100%" height="800" frameborder="0" style="border:none;"></iframe>`;
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopiedId(investorName);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const openDocCenterModal = (investorName) => {
    setDocCenterInvestor(investorName);
    setDocCenterFolderId('');
    setDocCenterResult(null);
    setShowDocCenterModal(true);
  };

  const handleDocCenterCreate = async () => {
    if (!docCenterFolderId) {
      setError('Google Drive Folder ID is required');
      return;
    }

    setDocCenterCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/create-doc-center', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investorName: docCenterInvestor,
          folderId: docCenterFolderId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create document center');
      }

      setDocCenterResult(result);
    } catch (err) {
      setError(err.message);
    }

    setDocCenterCreating(false);
  };

  const copyDocCenterEmbed = () => {
    if (docCenterResult?.embedCode) {
      navigator.clipboard.writeText(docCenterResult.embedCode);
      setCopiedId('docCenter');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4" style={{
        backgroundImage: 'url(/palm-noir.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="p-8 rounded-2xl shadow-xl max-w-md w-full" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #B3DEB2',
        }}>
          <h1 className="text-2xl font-bold text-white mb-6 text-center" style={{ color: '#B3DEB2' }}>Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full p-3 rounded-lg bg-black/50 text-white border focus:outline-none mb-4"
              style={{ borderColor: '#B3DEB2' }}
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full text-black font-bold py-3 px-4 rounded-lg transition hover:opacity-90"
              style={{ backgroundColor: '#B3DEB2' }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6" style={{
      backgroundImage: 'url(/palm-noir.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundColor: 'black',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');
        * { font-family: 'Open Sans', sans-serif; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#B3DEB2' }}>Portfolio Admin</h1>
          <div className="flex gap-4">
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="text-black font-bold py-2 px-4 rounded-lg transition hover:opacity-90"
              style={{ backgroundColor: '#B3DEB2' }}
            >
              + New Record
            </button>
            <button
              onClick={loadRecords}
              className="font-bold py-2 px-4 rounded-lg transition hover:opacity-90"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid #B3DEB2' }}
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: 'rgba(255,0,0,0.1)', border: '1px solid #ff6b6b' }}>
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {/* Document Center Modal */}
        {showDocCenterModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="p-6 rounded-2xl max-w-lg w-full" style={{
              background: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid #B3DEB2',
            }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: '#B3DEB2' }}>
                Create Document Center for {docCenterInvestor}
              </h2>
              
              {!docCenterResult ? (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-1">Google Drive Folder ID *</label>
                    <input
                      type="text"
                      value={docCenterFolderId}
                      onChange={(e) => setDocCenterFolderId(e.target.value)}
                      placeholder="1ABC...xyz"
                      className="w-full p-2 rounded-lg bg-black/50 text-white border focus:outline-none text-sm"
                      style={{ borderColor: 'rgba(179, 222, 178, 0.5)' }}
                    />
                    <p className="text-gray-500 text-xs mt-1">Find this in the Google Drive folder URL after /folders/</p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleDocCenterCreate}
                      disabled={docCenterCreating}
                      className="flex-1 text-black font-bold py-2 px-4 rounded-lg transition hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#B3DEB2' }}
                    >
                      {docCenterCreating ? 'Creating...' : 'Create Document Center'}
                    </button>
                    <button
                      onClick={() => setShowDocCenterModal(false)}
                      className="flex-1 font-bold py-2 px-4 rounded-lg transition hover:opacity-90"
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(179, 222, 178, 0.5)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'rgba(179, 222, 178, 0.1)', border: '1px solid #B3DEB2' }}>
                    <p className="text-green-300 font-semibold mb-2">Document Center Created!</p>
                    <p className="text-gray-300 text-sm mb-2">URL: <a href={docCenterResult.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{docCenterResult.url}</a></p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-1">Embed Code for Squarespace:</label>
                    <textarea
                      readOnly
                      value={docCenterResult.embedCode}
                      className="w-full p-2 rounded-lg bg-black/50 text-white border focus:outline-none text-xs font-mono"
                      style={{ borderColor: 'rgba(179, 222, 178, 0.5)', height: '100px' }}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={copyDocCenterEmbed}
                      className="flex-1 text-black font-bold py-2 px-4 rounded-lg transition hover:opacity-90"
                      style={{ backgroundColor: '#B3DEB2' }}
                    >
                      {copiedId === 'docCenter' ? 'Copied!' : 'Copy Embed Code'}
                    </button>
                    <button
                      onClick={() => setShowDocCenterModal(false)}
                      className="flex-1 font-bold py-2 px-4 rounded-lg transition hover:opacity-90"
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(179, 222, 178, 0.5)' }}
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{
              background: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid #B3DEB2',
            }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: '#B3DEB2' }}>
                {editingRecord ? 'Edit Record' : 'New Record'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Investor Name *</label>
                    <input
                      type="text"
                      name="investorName"
                      value={formData.investorName}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 rounded-lg bg-black/50 text-white border focus:outline-none"
                      style={{ borderColor: 'rgba(179, 222, 178, 0.5)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Security *</label>
                    <input
                      type="text"
                      name="security"
                      value={formData.security}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 rounded-lg bg-black/50 text-white border focus:outline-none"
                      style={{ borderColor: 'rgba(179, 222, 178, 0.5)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Units Held</label>
                    <input
                      type="number"
                      name="unitsHeld"
                      value={formData.unitsHeld}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full p-2 rounded-lg bg-black/50 text-white border focus:outline-none"
                      style={{ borderColor: 'rgba(179, 222, 178, 0.5)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Issue Price / Unit ($)</label>
                    <input
                      type="number"
                      name="issuePrice"
                      value={formData.issuePrice}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full p-2 rounded-lg bg-black/50 text-white border focus:outline-none"
                      style={{ borderColor: 'rgba(179, 222, 178, 0.5)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Total Invested ($)</label>
                    <input
                      type="number"
                      name="totalInvested"
                      value={formData.totalInvested}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full p-2 rounded-lg bg-black/50 text-white border focus:outline-none"
                      style={{ borderColor: 'rgba(179, 222, 178, 0.5)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Latest PSS ($)</label>
                    <input
                      type="number"
                      name="latestPSS"
                      value={formData.latestPSS}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full p-2 rounded-lg bg-black/50 text-white border focus:outline-none"
                      style={{ borderColor: 'rgba(179, 222, 178, 0.5)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Units Sold</label>
                    <input
                      type="text"
                      name="unitsSold"
                      value={formData.unitsSold}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-lg bg-black/50 text-white border focus:outline-none"
                      style={{ borderColor: 'rgba(179, 222, 178, 0.5)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Redemption Price ($)</label>
                    <input
                      type="number"
                      name="redemptionPrice"
                      value={formData.redemptionPrice}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full p-2 rounded-lg bg-black/50 text-white border focus:outline-none"
                      style={{ borderColor: 'rgba(179, 222, 178, 0.5)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Last Valuation ($)</label>
                    <input
                      type="number"
                      name="lastValuation"
                      value={formData.lastValuation}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full p-2 rounded-lg bg-black/50 text-white border focus:outline-none"
                      style={{ borderColor: 'rgba(179, 222, 178, 0.5)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1"># Shares Outstanding</label>
                    <input
                      type="number"
                      name="sharesOutstanding"
                      value={formData.sharesOutstanding}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-lg bg-black/50 text-white border focus:outline-none"
                      style={{ borderColor: 'rgba(179, 222, 178, 0.5)' }}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-400 text-sm mb-1">
                      Valuation History <span className="text-gray-500">(format: 2023: 10, 2024: 15, 2025: 25)</span>
                    </label>
                    <input
                      type="text"
                      name="valuationHistory"
                      value={formData.valuationHistory}
                      onChange={handleInputChange}
                      placeholder="2023: 10, 2024: 15, 2025: 25"
                      className="w-full p-2 rounded-lg bg-black/50 text-white border focus:outline-none"
                      style={{ borderColor: 'rgba(179, 222, 178, 0.5)' }}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-400 text-sm mb-1">
                      Funding Rounds <span className="text-gray-500">(format: Seed: 0.55, Seed-1: 1.5)</span>
                    </label>
                    <input
                      type="text"
                      name="fundingRounds"
                      value={formData.fundingRounds}
                      onChange={handleInputChange}
                      placeholder="Seed: 0.55, Seed-1: 1.5, Seed-2: 2.22"
                      className="w-full p-2 rounded-lg bg-black/50 text-white border focus:outline-none"
                      style={{ borderColor: 'rgba(179, 222, 178, 0.5)' }}
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 text-black font-bold py-2 px-4 rounded-lg transition hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#B3DEB2' }}
                  >
                    {loading ? 'Saving...' : (editingRecord ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 font-bold py-2 px-4 rounded-lg transition hover:opacity-90"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(179, 222, 178, 0.5)' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Records Table */}
        {loading && !showForm ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-2 border-gray-600 rounded-full animate-spin mx-auto" style={{ borderTopColor: '#B3DEB2' }}></div>
            <p className="text-gray-400 mt-4">Loading records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #B3DEB2' }}>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: 'rgba(179, 222, 178, 0.1)' }}>
                  <th className="p-3 text-left" style={{ color: '#B3DEB2', borderBottom: '1px solid rgba(179, 222, 178, 0.3)' }}>Investor</th>
                  <th className="p-3 text-left" style={{ color: '#B3DEB2', borderBottom: '1px solid rgba(179, 222, 178, 0.3)' }}>Security</th>
                  <th className="p-3 text-left" style={{ color: '#B3DEB2', borderBottom: '1px solid rgba(179, 222, 178, 0.3)' }}>Units</th>
                  <th className="p-3 text-left" style={{ color: '#B3DEB2', borderBottom: '1px solid rgba(179, 222, 178, 0.3)' }}>Issue Price</th>
                  <th className="p-3 text-left" style={{ color: '#B3DEB2', borderBottom: '1px solid rgba(179, 222, 178, 0.3)' }}>Invested</th>
                  <th className="p-3 text-left" style={{ color: '#B3DEB2', borderBottom: '1px solid rgba(179, 222, 178, 0.3)' }}>Latest PSS</th>
                  <th className="p-3 text-left" style={{ color: '#B3DEB2', borderBottom: '1px solid rgba(179, 222, 178, 0.3)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5">
                    <td className="p-3" style={{ borderBottom: '1px solid rgba(179, 222, 178, 0.2)' }}>{record.investorName}</td>
                    <td className="p-3" style={{ borderBottom: '1px solid rgba(179, 222, 178, 0.2)' }}>{record.security}</td>
                    <td className="p-3" style={{ borderBottom: '1px solid rgba(179, 222, 178, 0.2)' }}>{record.unitsHeld.toLocaleString()}</td>
                    <td className="p-3" style={{ borderBottom: '1px solid rgba(179, 222, 178, 0.2)' }}>${record.issuePrice}</td>
                    <td className="p-3" style={{ borderBottom: '1px solid rgba(179, 222, 178, 0.2)' }}>${record.totalInvested.toLocaleString()}</td>
                    <td className="p-3" style={{ borderBottom: '1px solid rgba(179, 222, 178, 0.2)' }}>${record.latestPSS}</td>
                    <td className="p-3" style={{ borderBottom: '1px solid rgba(179, 222, 178, 0.2)' }}>
                      <button
                        onClick={() => handleEdit(record)}
                        className="text-white text-sm py-1 px-3 rounded-lg mr-1 transition hover:opacity-80"
                        style={{ backgroundColor: 'rgba(179, 222, 178, 0.3)', border: '1px solid #B3DEB2' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => copyEmbedCode(record.investorName)}
                        className="text-white text-sm py-1 px-3 rounded-lg mr-1 transition hover:opacity-80"
                        style={{ backgroundColor: 'rgba(100, 150, 255, 0.3)', border: '1px solid #6496FF' }}
                      >
                        {copiedId === record.investorName ? 'Copied!' : 'Embed'}
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-white text-sm py-1 px-3 rounded-lg transition hover:opacity-80"
                        style={{ backgroundColor: 'rgba(254, 12, 127, 0.3)', border: '1px solid #FE0C7F' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      No records found. Click "New Record" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #B3DEB2' }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#B3DEB2' }}>Investor Accounts</h3>
          <p className="text-gray-400 text-sm mb-2">Manage investor dashboards and document centers:</p>
          <div className="flex flex-wrap gap-3">
            {[...new Set(records.map(r => r.investorName))].filter(Boolean).map((name) => (
              <div key={name} className="flex items-center gap-1 p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(179, 222, 178, 0.3)' }}>
                <span className="text-white text-sm px-2">{name}</span>
                <a
                  href={`/${encodeURIComponent(name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-xs py-1 px-2 rounded transition hover:opacity-80"
                  style={{ backgroundColor: 'rgba(179, 222, 178, 0.3)', border: '1px solid #B3DEB2' }}
                >
                  View
                </a>
                <button
                  onClick={() => openDocCenterModal(name)}
                  className="text-white text-xs py-1 px-2 rounded transition hover:opacity-80"
                  style={{ backgroundColor: 'rgba(255, 165, 0, 0.3)', border: '1px solid #FFA500' }}
                >
                  + Doc Center
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
