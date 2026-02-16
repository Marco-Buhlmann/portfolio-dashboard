import PortfolioDashboard from '../components/PortfolioDashboard';
import { fetchPortfolioData } from '../lib/airtable';

export default function Home({ initialData }) {
  return <PortfolioDashboard initialData={initialData} />;
}

export async function getStaticProps() {
  try {
    const data = await fetchPortfolioData();
    return {
      props: { initialData: data },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Failed to fetch portfolio data:', error);
    return {
      props: { initialData: null },
      revalidate: 300,
    };
  }
}
