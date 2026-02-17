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

// Fetch all records for admin view
export const fetchAllRecords = async () => {
  if (!AIRTABLE_PAT || !BASE_ID) {
    throw new Error('Missing Airtable credentials');
  }

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

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
  return json.records.map((record) => ({
    id: record.id,
    investorName: record.fields['Investor Name'] || '',
    security: record.fields['Security'] || '',
    unitsHeld: record.fields['Units Held'] || 0,
    issuePrice: record.fields['Issue Price / Unit'] || 0,
    totalInvested: record.fields['Total Invested'] || 0,
    latestPSS: record.fields['Latest PSS'] || 0,
    unitsSold: record.fields['Units Sold'] || '',
    redemptionPrice: record.fields['RP ($)'] || 0,
    valuationHistory: record.fields['Valuation History'] || '',
    fundingRounds: record.fields['Funding Rounds'] || '',
    lastValuation: record.fields['Last Valuation'] || 0,
    sharesOutstanding: record.fields['# Shares Outstanding'] || 0,
  }));
};

// Create a new record
export const createRecord = async (data) => {
  if (!AIRTABLE_PAT || !BASE_ID) {
    throw new Error('Missing Airtable credentials');
  }

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{
        fields: {
          'Investor Name': data.investorName,
          'Security': data.security,
          'Units Held': parseFloat(data.unitsHeld) || 0,
          'Issue Price / Unit': parseFloat(data.issuePrice) || 0,
          'Total Invested': parseFloat(data.totalInvested) || 0,
          'Latest PSS': parseFloat(data.latestPSS) || 0,
          'Units Sold': data.unitsSold || '',
          'RP ($)': parseFloat(data.redemptionPrice) || 0,
          'Valuation History': data.valuationHistory || '',
          'Funding Rounds': data.fundingRounds || '',
          'Last Valuation': parseFloat(data.lastValuation) || 0,
          '# Shares Outstanding': parseFloat(data.sharesOutstanding) || 0,
        }
      }]
    }),
  });

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.statusText}`);
  }

  return response.json();
};

// Update an existing record
export const updateRecord = async (recordId, data) => {
  if (!AIRTABLE_PAT || !BASE_ID) {
    throw new Error('Missing Airtable credentials');
  }

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        'Investor Name': data.investorName,
        'Security': data.security,
        'Units Held': parseFloat(data.unitsHeld) || 0,
        'Issue Price / Unit': parseFloat(data.issuePrice) || 0,
        'Total Invested': parseFloat(data.totalInvested) || 0,
        'Latest PSS': parseFloat(data.latestPSS) || 0,
        'Units Sold': data.unitsSold || '',
        'RP ($)': parseFloat(data.redemptionPrice) || 0,
        'Valuation History': data.valuationHistory || '',
        'Funding Rounds': data.fundingRounds || '',
        'Last Valuation': parseFloat(data.lastValuation) || 0,
        '# Shares Outstanding': parseFloat(data.sharesOutstanding) || 0,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.statusText}`);
  }

  return response.json();
};

// Delete a record
export const deleteRecord = async (recordId) => {
  if (!AIRTABLE_PAT || !BASE_ID) {
    throw new Error('Missing Airtable credentials');
  }

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.statusText}`);
  }

  return response.json();
};
