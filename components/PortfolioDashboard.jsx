import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Percent, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PortfolioDashboard = ({ initialData }) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);

  const mockData = {
    investor: '[Investor Name]',
    holdings: [
      {
        id: 1,
        security: 'Laundry Sauce Inc.',
        unitsHeld: 9370,
        issuePrice: 1.5,
        currentPrice: 6.94,
        totalInvested: 14055,
      }
    ],
    valuation: {
      latestPSS: 6.94,
      sharesOutstanding: null,
      lastValuation: null,
      history: [
        { year: 'Year 1', value: 2.5 },
        { year: 'Year 2', value: 4.1 },
        { year: 'Year 3', value: 5.8 },
        { year: 'Year 4', value: 6.94 }
      ]
    },
    fundingRounds: [
      { round: 'Seed', pss: 0.55 },
      { round: 'Seed-1', pss: 1.5 },
      { round: 'Seed-2', pss: 2.22 },
      { round: 'Seed-3', pss: 2.77 }
    ]
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayData = data || mockData;
  const holding = displayData.holdings[0];
  const currentValue = holding.unitsHeld * holding.currentPrice;
  const gainLoss = currentValue - holding.totalInvested;
  const gainLossPercent = (gainLoss / holding.totalInvested) * 100;
  const gainLossClass = gainLoss >= 0 ? 'text-emerald-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 lg:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        
        body {
          font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .font-mono {
          font-family: 'Geist Mono', monospace;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }

        .card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
        }

        .metric-value {
          font-size: clamp(1.5rem, 5vw, 2.5rem);
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .metric-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: #f1f5f9;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .table-header {
          background: #f8fafc;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
        }

        .table-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }

        .table-row:hover {
          background: #f8fafc;
        }

        .chart-container {
          padding: 24px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-up stagger-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Portfolio</h1>
          <p className="text-slate-500">{displayData.investor}</p>
        </div>

        {/* Position Overview */}
        <div className="mb-8 animate-slide-up stagger-2">
          <div className="card p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">{holding.security}</h2>
                <span className="badge">Active Holding</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="metric-label mb-2">Units Held</p>
                <p className="metric-value text-slate-900 font-mono">{holding.unitsHeld.toLocaleString()}</p>
              </div>
              <div>
                <p className="metric-label mb-2">Current Price</p>
                <p className="metric-value text-slate-900 font-mono">${holding.currentPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="metric-label mb-2">Total Invested</p>
                <p className="metric-value text-slate-900 font-mono">${holding.totalInvested.toLocaleString()}</p>
              </div>
              <div>
                <p className="metric-label mb-2">Current Value</p>
                <p className="metric-value text-slate-900 font-mono">${currentValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6 animate-slide-up stagger-3">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="metric-label mb-2">Unrealized Gain/Loss</p>
                <p className={`metric-value font-mono ${gainLossClass}`}>
                  ${gainLoss.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${gainLoss >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <TrendingUp className={`w-6 h-6 ${gainLossClass}`} />
              </div>
            </div>
            <p className={`text-sm font-mono ${gainLossClass}`}>
              {gainLossPercent.toFixed(1)}% return
            </p>
          </div>

          <div className="card p-6 animate-slide-up stagger-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="metric-label mb-2">Cost Basis Per Unit</p>
                <p className="metric-value text-slate-900 font-mono">
                  ${holding.issuePrice.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-slate-600" />
              </div>
            </div>
            <p className="text-sm text-slate-500">
              {((holding.currentPrice / holding.issuePrice - 1) * 100).toFixed(1)}x multiple
            </p>
          </div>
        </div>

        {/* Valuation History */}
        <div className="card animate-slide-up stagger-2 mb-8">
          <div className="p-6 lg:p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Per Share Valuation (PSS) Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={displayData.valuation.history}>
                <defs>
                  <linearGradient id="gradientLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="year" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0f172a" 
                  strokeWidth={2.5}
                  dot={{ fill: '#0f172a', r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funding Rounds */}
        <div className="card animate-slide-up stagger-3 mb-8">
          <div className="p-6 lg:p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">PSS by Funding Round</h3>
            <div className="space-y-4">
              {displayData.fundingRounds.map((round, idx) => (
                <div key={idx} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-slate-900">{round.round}</p>
                  </div>
                  <p className="metric-value text-slate-900 font-mono text-base">
                    ${round.pss.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-slate-500 text-sm animate-slide-up stagger-4">
          <p>Data synced from Airtable • Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
