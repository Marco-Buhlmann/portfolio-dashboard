import React, { useState, useEffect } from 'react';
import { fetchAllRecords, createRecord, updateRecord, deleteRecord } from '../lib/airtable';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

const AdminDashboard = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showForm, setShowForm] = useState(false);
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

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none mb-4"
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');
        * { font-family: 'Open Sans', sans-serif; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-400">Portfolio Admin</h1>
          <div className="flex gap-4">
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
            >
              + New Record
            </button>
            <button
              onClick={loadRecords}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-green-400 mb-4">
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
                      className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
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
                      className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
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
                      className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
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
                      className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
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
                      className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
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
                      className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Units Sold</label>
                    <input
                      type="text"
                      name="unitsSold"
                      value={formData.unitsSold}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
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
                      className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
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
                      className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1"># Shares Outstanding</label>
                    <input
                      type="number"
                      name="sharesOutstanding"
                      value={formData.sharesOutstanding}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-400 text-sm mb-1">
                      Valuation History <span className="text-gray-500">(format: Year 1: 2.5, Year 2: 4.1)</span>
                    </label>
                    <input
                      type="text"
                      name="valuationHistory"
                      value={formData.valuationHistory}
                      onChange={handleInputChange}
                      placeholder="Year 1: 2.5, Year 2: 4.1, Year 3: 5.8"
                      className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
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
                      className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
                  >
                    {loading ? 'Saving...' : (editingRecord ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
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
            <div className="w-12 h-12 border-2 border-gray-600 border-t-green-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800 text-left">
                  <th className="p-3 border border-gray-700 text-green-400">Investor</th>
                  <th className="p-3 border border-gray-700 text-green-400">Security</th>
                  <th className="p-3 border border-gray-700 text-green-400">Units</th>
                  <th className="p-3 border border-gray-700 text-green-400">Issue Price</th>
                  <th className="p-3 border border-gray-700 text-green-400">Invested</th>
                  <th className="p-3 border border-gray-700 text-green-400">Latest PSS</th>
                  <th className="p-3 border border-gray-700 text-green-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-800/50">
                    <td className="p-3 border border-gray-700">{record.investorName}</td>
                    <td className="p-3 border border-gray-700">{record.security}</td>
                    <td className="p-3 border border-gray-700">{record.unitsHeld.toLocaleString()}</td>
                    <td className="p-3 border border-gray-700">${record.issuePrice}</td>
                    <td className="p-3 border border-gray-700">${record.totalInvested.toLocaleString()}</td>
                    <td className="p-3 border border-gray-700">${record.latestPSS}</td>
                    <td className="p-3 border border-gray-700">
                      <button
                        onClick={() => handleEdit(record)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded mr-2 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded transition"
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
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-green-400 mb-2">Quick Links</h3>
          <p className="text-gray-400 text-sm mb-2">View investor dashboards:</p>
          <div className="flex flex-wrap gap-2">
            {[...new Set(records.map(r => r.investorName))].filter(Boolean).map((name) => (
              <a
                key={name}
                href={`/${encodeURIComponent(name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-1 px-3 rounded transition"
              >
                {name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
