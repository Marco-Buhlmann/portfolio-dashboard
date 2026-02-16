// lib/airtable.js

const AIRTABLE_PAT = process.env.NEXT_PUBLIC_AIRTABLE_PAT;
const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const TABLE_NAME = 'Portfolio';

export const fetchPortfolioData = async () => {
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
  return transformAirtableData(json.records);
};

const transformAirtableData = (records) => {
  if (!records || records.length === 0) {
    return null;
  }

  const fields = records[0].fields;

  return {
    investor: fields['Investor Name'] || '[Investor Name]',
    holdings: [
      {
        id: records[0].id,
        security: fields['Security'] || 'Unknown',
        unitsHeld: parseFloat(fields['Units Held']) || 0,
        issuePrice: parseFloat(fields['Issue Price / Unit']) || 0,
        currentPrice: parseFloat(fields['Latest PSS']) || 0,
        totalInvested: parseFloat(fields['Total Invested']) || 0,
      }
    ],
    valuation: {
      latestPSS: parseFloat(fields['Latest PSS']) || 0,
      sharesOutstanding: fields['# Shares Outstanding'] || null,
      lastValuation: fields['Last Valuation'] || null,
      history: parseValuationHistory(fields['Valuation History'] || ''),
    },
    fundingRounds: parseFundingRounds(fields['Funding Rounds'] || ''),
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
