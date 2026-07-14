import { useOutletContext } from 'react-router-dom';
import { PortfolioBuilder } from '../../components/dashboard/PortfolioBuilder';

export const DashboardPortfolio = () => {
  const { activeTab } = useOutletContext<{ activeTab?: string }>() || {};

  if (activeTab === 'domain') {
    return <div className="p-8 text-center text-slate-500">Custom Domain feature coming soon...</div>;
  }

  return <PortfolioBuilder />;
};
