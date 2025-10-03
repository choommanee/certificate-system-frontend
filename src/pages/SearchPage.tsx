import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import AdvancedSearch from '../components/search/AdvancedSearch';

const SearchPage: React.FC = () => {
  return (
    <DashboardLayout>
      <AdvancedSearch />
    </DashboardLayout>
  );
};

export default SearchPage;