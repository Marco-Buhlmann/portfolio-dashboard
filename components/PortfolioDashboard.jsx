import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PortfolioDashboard = ({ initialData, investorName }) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);

  const mockData = {
    investor: investorName || '[Investor Name]',
    holdings: [
      {
        id: 1,
        security: 'Laundry Sauce',
        unitsHeld: 1400,
        issuePrice: 1.5,
        currentPrice: 6.94,
        totalInvested: 2100,
        unitsSold: null,
        redemptionPrice: null,
        valuationHistory: [
          { year: '2021', value: 10000 },
          { year: '2022', value: 15000 },
          { year: '2023', value: 25000 },
          { year: '2024', value: 45000 },
          { year: '2025', value: 70000 },
        ],
        fundingRounds: [
          { round: 'Seed', pss: 0.55 },
          { round: 'Seed-1', pss: 1.5 },
          { round: 'Seed-2', pss: 2.22 },
          { round: 'Seed-3', pss: 2.77 }
        ],
      }
    ],
    totals: {
      totalInvested: 2100,
      totalCurrentValue: 9716,
      totalGainLoss: 7616,
      totalGainLossPercent: 362.6,
    },
  };

  useEffect(() => {
    if (!initialData) {
      setTimeout(() => {
        setData(mockData);
        setLoading(false);
      }, 300);
    }
  }, [initialData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayData = data || mockData;
  const holding = displayData.holdings[0];
  const currentValue = holding.unitsHeld * holding.currentPrice;
  const gainLoss = currentValue - holding.totalInvested;
  const returnPercent = holding.totalInvested > 0 ? (gainLoss / holding.totalInvested) * 100 : 0;
  const multiple = holding.issuePrice > 0 ? (holding.currentPrice / holding.issuePrice).toFixed(2) : 0;

  const barChartData = [
    { name: 'Investment', 'Total Invested ($)': holding.totalInvested, 'FMV ($)': currentValue }
  ];

  const valuationData = holding.valuationHistory || [];

  return (
    <div 
      className="min-h-screen bg-black text-white p-8 lg:p-12"
      style={{
        backgroundImage: 'url(/palm-noir.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');
        
        * {
          font-family: 'Open Sans', sans-serif;
        }

        .glass-card {
          background: linear-gradient(
            0deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 255, 255, 0.05) 100%
          ), linear-gradient(
            0deg, 
            rgba(71, 56, 47, 0.10) 0%, 
            rgba(255, 255, 255, 0.25) 100%
          );
          box-shadow: 
            -3px 3px 9px rgba(128, 83, 66, 0.60) inset,
            3px 3px 6px -1.5px rgba(255, 255, 255, 0.30) inset,
            -4px -12px 15px rgba(255, 255, 255, 0.20) inset,
            1.5px 0px 3px rgba(255, 255, 255, 0.20) inset,
            -1.5px -1.5px 6px rgba(255, 255, 255, 0.30) inset,
            24px 47px 71px -12px rgba(74, 74, 74, 0.25),
            3px 6px 24px rgba(0, 0, 0, 0.05);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .section-title {
          color: #B3DEB2;
          font-size: 28px;
          font-weight: 600;
          letter-spacing: 0.1em;
        }

        .security-name {
          color: #FE0C7F;
          font-size: 20px;
          font-weight: 700;
        }

        .metric-label {
          color: #F5F5F5;
          font-size: 14px;
          font-weight: 400;
        }

        .metric-value {
          color: #F5F5F5;
          font-size: 24px;
          font-weight: 700;
        }

        .data-table {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          border: 1px solid #B3DEB2;
          box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        }

        .data-section-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid #B3DEB2;
          border-bottom: none;
        }

        .data-grid-cell {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          border: 1px solid #B3DEB2;
        }

        .divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.4);
          opacity: 0.5;
        }

        .vertical-divider {
          width: 1px;
          background: rgba(255, 255, 255, 0.4);
          opacity: 0.5;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <h1 className="section-title">PORTFOLIO DETAILS</h1>
          <div className="text-right">
            <span className="text-white font-semibold text-lg">Last Updated: </span>
            <span className="text-white italic text-lg">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="divider mb-8"></div>

        {/* Details Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <p className="text-gray-300 text-sm">DETAILS</p>
              <p className="text-gray-300 text-sm">Security:</p>
            </div>
            <div className="vertical-divider h-12"></div>
            <p className="security-name">{holding.security}</p>
          </div>
        </div>

        {/* Main Metrics Row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <div className="text-center">
            <p className="metric-label mb-2">Units Held</p>
            <div className="glass-card px-6 py-4">
              <p className="metric-value">{holding.unitsHeld.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="metric-label mb-2">Issue Price Unit / ($)</p>
            <div className="glass-card px-6 py-4">
              <p className="metric-value">${holding.issuePrice.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="metric-label mb-2">Total Invested ($)</p>
            <div className="glass-card px-6 py-4">
              <p className="metric-value">${holding.totalInvested.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="metric-label mb-2">FMV ($)</p>
            <div className="glass-card px-6 py-4">
              <p className="metric-value">${currentValue.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="metric-label mb-2">Return (%)</p>
            <div className="glass-card px-6 py-4">
              <p className="metric-value">{returnPercent.toFixed(1)}%</p>
            </div>
          </div>
          <div className="text-center">
            <p className="metric-label mb-2">Multiple</p>
            <div className="glass-card px-6 py-4">
              <p className="metric-value">{multiple}x</p>
            </div>
          </div>
        </div>

        {/* Main Metrics Row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="text-center">
            <p className="metric-label mb-2">Units Sold</p>
            <div className="glass-card px-6 py-4">
              <p className="metric-value">{holding.unitsSold || '-'}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="metric-label mb-2">RP ($)</p>
            <div className="glass-card px-6 py-4">
              <p className="metric-value">{holding.redemptionPrice ? `$${holding.redemptionPrice}` : '-'}</p>
            </div>
          </div>
        </div>

        {/* Additional Details & Performance */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Additional Details */}
          <div>
            <h2 className="section-title mb-6">ADDITIONAL DETAILS</h2>
            
            {/* Current Price Data */}
            <div className="mb-6">
              <div className="data-section-header px-4 py-3 mb-0">
                <p className="text-gray-300 font-bold">Current Price Data</p>
              </div>
              <div className="data-table p-4">
                <div className="flex justify-between text-gray-300">
                  <span>Latest PSS:</span>
                  <span className="text-white font-semibold">${holding.currentPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Funding Rounds */}
            <div className="mb-6">
              <div className="data-section-header px-4 py-3">
                <p className="text-gray-300 font-bold">Current Price Data</p>
              </div>
              <div className="grid grid-cols-2">
                {holding.fundingRounds && holding.fundingRounds.map((round, idx) => (
                  <div key={idx} className="data-grid-cell p-4 flex justify-between">
                    <span className="text-gray-300">{round.round}:</span>
                    <span className="text-white font-semibold">${round.pss.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Valuation Data */}
            <div>
              <div className="data-section-header px-4 py-3">
                <p className="text-gray-300 font-bold">Valuation Data</p>
              </div>
              <div className="data-table p-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Last Valuation:</span>
                  <span className="text-white font-semibold">${(currentValue * 1000).toLocaleString()}</span>
                </div>
              </div>
              <div className="data-table p-4" style={{ borderTop: 'none' }}>
                <div className="flex justify-between">
                  <span className="text-gray-300">&nbsp;</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Charts */}
          <div>
            <h2 className="section-title mb-6">PERFORMANCE</h2>
            
            {/* Bar Chart */}
            <div className="mb-8">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barChartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Total Invested ($)" fill="#FF6B8A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="FMV ($)" fill="#4FD1C5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={valuationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="year" stroke="#999" />
                  <YAxis stroke="#999" tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Valuation (M$)']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#FF4D6D" 
                    strokeWidth={2}
                    dot={{ fill: '#FF4D6D', r: 4 }}
                    name="Valuation (M$)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Multiple Holdings */}
        {displayData.holdings.length > 1 && (
          <div className="mt-16">
            <h2 className="section-title mb-6">OTHER HOLDINGS</h2>
            <div className="space-y-4">
              {displayData.holdings.slice(1).map((h, idx) => {
                const hCurrentValue = h.unitsHeld * h.currentPrice;
                const hReturn = h.totalInvested > 0 ? ((hCurrentValue - h.totalInvested) / h.totalInvested * 100) : 0;
                return (
                  <div key={h.id || idx} className="glass-card p-6">
                    <div className="flex justify-between items-center mb-4">
                      <p className="security-name">{h.security}</p>
                      <p className="text-white font-bold">{hReturn.toFixed(1)}% Return</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Units Held</p>
                        <p className="text-white font-semibold">{h.unitsHeld.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Issue Price</p>
                        <p className="text-white font-semibold">${h.issuePrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total Invested</p>
                        <p className="text-white font-semibold">${h.totalInvested.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">FMV</p>
                        <p className="text-white font-semibold">${hCurrentValue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>Data synced from Airtable</p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
