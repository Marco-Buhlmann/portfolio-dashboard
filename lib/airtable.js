// lib/airtable.js

const AIRTABLE_PAT = process.env.NEXT_PUBLIC_AIRTABLE_PAT;
const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const TABLE_NAME = 'Portfolio';

export const fetchPortfolioData = async (investorName = null) => {
  if (!AIRTABLE_PAT || !BASE_ID) {
    throw new Error('Missing Airtable credentials');
  }

  let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
  
  // Filter by investor name if provided
  if (investorName) {
    const formula = encodeURIComponent(`{Investor Name}="${investorName}"`);
    url += `?filterByFormula=${formula}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.statusText}`);
  }

  const json = await response.json();
  return transformAirtableData(json.records);
};

// Get list of all unique investors (for reference/admin)
export const fetchAllInvestors = async () => {
  if (!AIRTABLE_PAT || !BASE_ID) {
    throw new Error('Missing Airtable credentials');
  }

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?fields%5B%5D=Investor%20Name`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.statusText}`);
  }

  const json = await response.json();
  const investors = [...new Set(json.records.map(r => r.fields['Investor Name']).filter(Boolean))];
  return investors;
};

const transformAirtableData = (records) => {
  if (!records || records.length === 0) {
    return null;
  }

  const investorName = records[0].fields['Investor Name'] || '[Investor Name]';
  
  // Map all records to holdings
  const holdings = records.map((record) => ({
    id: record.id,
    security: record.fields['Security'] || 'Unknown',
    unitsHeld: parseFloat(record.fields['Units Held']) || 0,
    issuePrice: parseFloat(record.fields['Issue Price / Unit']) || 0,
    currentPrice: parseFloat(record.fields['Latest PSS']) || 0,
    totalInvested: parseFloat(record.fields['Total Invested']) || 0,
    valuationHistory: parseValuationHistory(record.fields['Valuation History'] || ''),
    fundingRounds: parseFundingRounds(record.fields['Funding Rounds'] || ''),
    lastValuation: record.fields['Last Valuation'] || null,
    sharesOutstanding: record.fields['# Shares Outstanding'] || null,
  }));

  // Calculate totals across all holdings
  const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvested, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + (h.unitsHeld * h.currentPrice), 0);

  return {
    investor: investorName,
    holdings,
    totals: {
      totalInvested,
      totalCurrentValue,
      totalGainLoss: totalCurrentValue - totalInvested,
      totalGainLossPercent: totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0,
    },
  };
};

const parseValuationHistory = (historyString) => {
  if (!historyString) return [];
  
  try {
    return historyString.split(',').map((entry, idx) => {
      const [label, value] = entry.trim().split(':');
      return {
        year: label.trim(),
        value: parseFloat(value.trim()),
      };
    });
  } catch {
    return [];
  }
};

const parseFundingRounds = (roundsString) => {
  if (!roundsString) return [];
  
  try {
    return roundsString.split(',').map((entry) => {
      const [round, pss] = entry.trim().split(':');
      return {
        round: round.trim(),
        pss: parseFloat(pss.trim()),
      };
    });
  } catch {
    return [];
  }
};
