import PortfolioDashboard from '../components/PortfolioDashboard';
import { fetchPortfolioData, fetchAllInvestors } from '../lib/airtable';

export default function InvestorPage({ initialData, investorName }) {
  return <PortfolioDashboard initialData={initialData} investorName={investorName} />;
}

export async function getStaticPaths() {
  try {
    const investors = await fetchAllInvestors();
    const paths = investors.map((investor) => ({
      params: { investor: encodeURIComponent(investor) },
    }));
    
    return {
      paths,
      fallback: 'blocking', // Generate new pages on-demand
    };
  } catch (error) {
    console.error('Failed to fetch investors:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}

export async function getStaticProps({ params }) {
  const investorName = decodeURIComponent(params.investor);
  
  try {
    const data = await fetchPortfolioData(investorName);
    
    if (!data) {
      return {
        notFound: true,
      };
    }
    
    return {
      props: { 
        initialData: data,
        investorName,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Failed to fetch portfolio data:', error);
    return {
      props: { 
        initialData: null,
        investorName,
      },
      revalidate: 300,
    };
  }
}
