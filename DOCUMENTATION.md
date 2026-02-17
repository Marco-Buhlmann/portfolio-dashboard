# Portfolio Dashboard - Documentation

## Overview

A Next.js dashboard that displays portfolio data from Airtable, designed to be embedded in Squarespace (or any website) via iframe. Each investor sees only their own holdings based on URL parameter.

---

## Architecture

```
Airtable (Data Source)
    ↓ (API call filtered by Investor Name)
Next.js + React (Frontend on Vercel)
    ↓ (iframe embed)
Squarespace Website (behind user login)
```

---

## URLs & Routing

| URL Pattern | Description |
|-------------|-------------|
| `/` | Default page (shows mock data or first investor) |
| `/InvestorName` | Shows specific investor's portfolio |
| `/John%20Smith` | URL-encoded investor name with spaces |

### Examples
- `https://your-app.vercel.app/John%20Smith` → John Smith's portfolio
- `https://your-app.vercel.app/Jane%20Doe` → Jane Doe's portfolio

---

## Airtable Setup

### Table Name
`Portfolio`

### Required Fields

| Field Name | Type | Description |
|-----------|------|-------------|
| Investor Name | Single line text | Portfolio owner name (used for filtering) |
| Security | Single line text | Company/security name |
| Units Held | Number | Quantity owned |
| Issue Price / Unit | Currency | Original purchase price per unit |
| Total Invested | Currency | Total cost basis |
| Latest PSS | Currency | Current per-share valuation |
| # Shares Outstanding | Number | Company shares outstanding (optional) |
| Last Valuation | Currency | Latest company valuation (optional) |
| Valuation History | Long text | Format: "Year 1: 2.5, Year 2: 4.1, Year 3: 5.8" |
| Funding Rounds | Long text | Format: "Seed: 0.55, Seed-1: 1.5, Seed-2: 2.22" |
| Units Sold | Single line text | Units sold (optional) |
| RP ($) | Currency | Redemption price (optional) |

### Data Structure
- **One row per holding** (not per investor)
- Multiple rows can have the same "Investor Name" for investors with multiple holdings
- The dashboard aggregates all holdings for the filtered investor

---

## Environment Variables

Set these in Vercel (Settings → Environment Variables):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_AIRTABLE_PAT` | Airtable Personal Access Token |
| `NEXT_PUBLIC_AIRTABLE_BASE_ID` | Airtable Base ID (starts with `app`) |

### Current Values
```
NEXT_PUBLIC_AIRTABLE_PAT=your_airtable_personal_access_token
NEXT_PUBLIC_AIRTABLE_BASE_ID=your_airtable_base_id
```

> **Note:** Get your actual credentials from Airtable and store them securely in Vercel environment variables.

---

## Embedding in Squarespace

### Basic Embed Code
```html
<div style="width: 100%; height: 1200px; border: none;">
  <iframe 
    src="https://your-app.vercel.app/INVESTOR_NAME" 
    style="width: 100%; height: 100%; border: none; border-radius: 8px;"
    title="Portfolio Dashboard"
  ></iframe>
</div>
```

### Dynamic Embedding (per user)
If your Squarespace site has user login, dynamically set the iframe `src` based on logged-in user:

```html
<div id="portfolio-container" style="width: 100%; height: 1200px;">
  <iframe 
    id="portfolio-iframe"
    style="width: 100%; height: 100%; border: none; border-radius: 8px;"
    title="Portfolio Dashboard"
  ></iframe>
</div>

<script>
  // Replace with your method of getting the logged-in user's name
  const investorName = "John Smith"; // Get from your auth system
  const encodedName = encodeURIComponent(investorName);
  document.getElementById('portfolio-iframe').src = 
    `https://your-app.vercel.app/${encodedName}`;
</script>
```

---

## Project Structure

```
portfolio-dashboard/
├── components/
│   └── PortfolioDashboard.jsx    # Main dashboard UI component
├── lib/
│   └── airtable.js               # Airtable API integration
├── pages/
│   ├── _app.js                   # App wrapper
│   ├── index.js                  # Default route
│   └── [investor].js             # Dynamic investor route
├── styles/
│   └── globals.css               # Global styles (Tailwind)
├── .env.local                    # Environment variables (local only)
├── next.config.ts                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── package.json                  # Dependencies
```

---

## Features

### Portfolio Summary
- Total Invested across all holdings
- Total Current Value
- Total Gain/Loss ($ and %)

### Per-Holding Details
- Security name
- Units held
- Current price (PSS)
- Cost basis (issue price)
- Individual gain/loss

### Expandable Charts (click to expand)
- PSS Trend over time (line chart)
- Funding Rounds history

---

## Data Refresh

- **Static Generation (ISR)**: Pages are regenerated every hour (`revalidate: 3600`)
- **Manual Refresh**: Redeploy in Vercel dashboard, or visit the URL to trigger regeneration
- **On-Demand**: New investor URLs are generated on first visit (`fallback: 'blocking'`)

---

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000/InvestorName` to test.

---

## Deployment (Vercel)

1. Push to GitHub: `git push origin master`
2. Vercel auto-deploys on push
3. Or manually: Vercel Dashboard → Deployments → Redeploy

---

## Adding a New Investor

1. Add rows to Airtable with the new investor's name in "Investor Name" field
2. Visit `https://your-app.vercel.app/New%20Investor%20Name`
3. Page is automatically generated on first visit

---

## Troubleshooting

### "Airtable API error: Forbidden"
- Check that PAT token is valid and not expired
- Verify Base ID is correct
- Ensure PAT has access to the base

### Investor not found (404)
- Check exact spelling of investor name in Airtable
- Names are case-sensitive
- URL-encode special characters (spaces = `%20`)

### Data not updating
- Wait up to 1 hour for ISR refresh
- Or redeploy manually in Vercel
- Check Airtable has data in correct fields

### Iframe shows blank
- Check browser console for errors
- Verify Vercel deployment is successful
- Test direct URL first (without iframe)

---

## Security Notes

- Airtable credentials are in environment variables (not exposed in browser)
- No authentication on dashboard URLs - rely on parent site's login
- Consider adding basic auth or Vercel password protection for sensitive data

---

## Repository

GitHub: https://github.com/Marco-Buhlmann/portfolio-dashboard
