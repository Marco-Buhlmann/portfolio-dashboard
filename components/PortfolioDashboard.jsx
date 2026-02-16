import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PortfolioDashboard = ({ initialData, investorName }) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [expandedHolding, setExpandedHolding] = useState(null);

  const mockData = {
    investor: investorName || '[Investor Name]',
    holdings: [
      {
        id: 1,
        security: 'Laundry Sauce Inc.',
        unitsHeld: 9370,
        issuePrice: 1.5,
        currentPrice: 6.94,
        totalInvested: 14055,
        valuationHistory: [
          { year: 'Year 1', value: 2.5 },
          { year: 'Year 2', value: 4.1 },
          { year: 'Year 3', value: 5.8 },
          { year: 'Year 4', value: 6.94 }
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
      totalInvested: 14055,
      totalCurrentValue: 65027.8,
      totalGainLoss: 50972.8,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayData = data || mockData;
  const { holdings, totals } = displayData;
  const totalGainLossClass = totals.totalGainLoss >= 0 ? 'text-emerald-600' : 'text-red-600';

  const toggleHolding = (id) => {
    setExpandedHolding(expandedHolding === id ? null : id);
  };

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
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
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

        .metric-value-sm {
          font-size: clamp(1.25rem, 4vw, 1.75rem);
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
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-up stagger-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Portfolio</h1>
          <p className="text-slate-500">{displayData.investor}</p>
        </div>

        {/* Portfolio Summary */}
        <div className="mb-8 animate-slide-up stagger-2">
          <div className="card p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-slate-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Portfolio Summary</h2>
                <p className="text-sm text-slate-500">{holdings.length} holding{holdings.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="metric-label mb-2">Total Invested</p>
                <p className="metric-value text-slate-900 font-mono">${totals.totalInvested.toLocaleString()}</p>
              </div>
              <div>
                <p className="metric-label mb-2">Current Value</p>
                <p className="metric-value text-slate-900 font-mono">${totals.totalCurrentValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="metric-label mb-2">Total Gain/Loss</p>
                <p className={`metric-value font-mono ${totalGainLossClass}`}>
                  ${totals.totalGainLoss.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="metric-label mb-2">Return</p>
                <p className={`metric-value font-mono ${totalGainLossClass}`}>
                  {totals.totalGainLossPercent.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Holdings</h2>
          <div className="space-y-4">
            {holdings.map((holding, index) => {
              const currentValue = holding.unitsHeld * holding.currentPrice;
              const gainLoss = currentValue - holding.totalInvested;
              const gainLossPercent = holding.totalInvested > 0 ? (gainLoss / holding.totalInvested) * 100 : 0;
              const gainLossClass = gainLoss >= 0 ? 'text-emerald-600' : 'text-red-600';
              const isExpanded = expandedHolding === holding.id;

              return (
                <div key={holding.id} className={`card animate-slide-up`} style={{ animationDelay: `${0.1 * (index + 3)}s` }}>
                  {/* Holding Header - Clickable */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => toggleHolding(holding.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{holding.security}</h3>
                          <span className="badge">Active Holding</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-lg font-bold font-mono ${gainLossClass}`}>
                            {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%
                          </p>
                          <p className="text-sm text-slate-500">${currentValue.toLocaleString()}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Units Held</p>
                        <p className="text-lg font-semibold font-mono text-slate-900">{holding.unitsHeld.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Price</p>
                        <p className="text-lg font-semibold font-mono text-slate-900">${holding.currentPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cost Basis</p>
                        <p className="text-lg font-semibold font-mono text-slate-900">${holding.issuePrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Gain/Loss</p>
                        <p className={`text-lg font-semibold font-mono ${gainLossClass}`}>
                          ${gainLoss.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-6 bg-slate-50/50">
                      <div className="grid lg:grid-cols-2 gap-8">
                        {/* Valuation History Chart */}
                        {holding.valuationHistory && holding.valuationHistory.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">PSS Trend</h4>
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={holding.valuationHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="year" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                                <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} />
                                <Tooltip 
                                  contentStyle={{
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                                  }}
                                  formatter={(value) => [`$${value.toFixed(2)}`, 'PSS']}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke="#0f172a" 
                                  strokeWidth={2}
                                  dot={{ fill: '#0f172a', r: 3 }}
                                  activeDot={{ r: 5 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* Funding Rounds */}
                        {holding.fundingRounds && holding.fundingRounds.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Funding Rounds</h4>
                            <div className="space-y-3">
                              {holding.fundingRounds.map((round, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                                  <p className="text-sm font-medium text-slate-700">{round.round}</p>
                                  <p className="text-sm font-semibold font-mono text-slate-900">${round.pss.toFixed(2)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm animate-slide-up stagger-4">
          <p>Data synced from Airtable - Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
