// lib/airtable.js

const AIRTABLE_PAT = process.env.NEXT_PUBLIC_AIRTABLE_PAT;
const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const TABLE_NAME = 'tbl1LhAcU2DbYtURK'; // Correct data table ID

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
  
  // Log actual field names from first record for debugging
  if (json.records.length > 0) {
    console.log('Airtable field names:', Object.keys(json.records[0].fields));
  }
  
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

// Helper to build fields object, only including non-empty values
const buildFields = (data) => {
  const fields = {};
  
  // Text fields
  if (data.investorName) fields['Investor Name'] = String(data.investorName);
  if (data.security) fields['Security'] = String(data.security);
  if (data.unitsSold) fields['Units Sold'] = String(data.unitsSold);
  if (data.valuationHistory) fields['Valuation History'] = String(data.valuationHistory);
  if (data.fundingRounds) fields['Funding Rounds'] = String(data.fundingRounds);
  
  // Number field
  const unitsHeld = parseFloat(data.unitsHeld);
  if (!isNaN(unitsHeld) && unitsHeld > 0) fields['Units Held'] = unitsHeld;
  
  const sharesOutstanding = parseFloat(data.sharesOutstanding);
  if (!isNaN(sharesOutstanding) && sharesOutstanding > 0) fields['# Shares Outstanding'] = sharesOutstanding;
  
  // Currency fields - Airtable expects just the number
  const issuePrice = parseFloat(data.issuePrice);
  if (!isNaN(issuePrice) && issuePrice > 0) fields['Issue Price / Unit'] = issuePrice;
  
  const totalInvested = parseFloat(data.totalInvested);
  if (!isNaN(totalInvested) && totalInvested > 0) fields['Total Invested'] = totalInvested;
  
  const latestPSS = parseFloat(data.latestPSS);
  if (!isNaN(latestPSS) && latestPSS > 0) fields['Latest PSS'] = latestPSS;
  
  const redemptionPrice = parseFloat(data.redemptionPrice);
  if (!isNaN(redemptionPrice) && redemptionPrice > 0) fields['RP ($)'] = redemptionPrice;
  
  const lastValuation = parseFloat(data.lastValuation);
  if (!isNaN(lastValuation) && lastValuation > 0) fields['Last Valuation'] = lastValuation;
  
  return fields;
};

// Create a new record
export const createRecord = async (data) => {
  if (!AIRTABLE_PAT || !BASE_ID) {
    throw new Error('Missing Airtable credentials');
  }

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
  const fields = buildFields(data);
  
  console.log('Creating record with fields:', JSON.stringify(fields));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{ fields }]
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log('Airtable error response:', JSON.stringify(errorData));
    throw new Error(`Airtable API error: ${JSON.stringify(errorData)}`);
  }

  return response.json();
};

// Update an existing record
export const updateRecord = async (recordId, data) => {
  if (!AIRTABLE_PAT || !BASE_ID) {
    throw new Error('Missing Airtable credentials');
  }

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;
  const fields = buildFields(data);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Airtable API error: ${JSON.stringify(errorData)}`);
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
