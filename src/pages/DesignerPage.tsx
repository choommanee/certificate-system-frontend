import React from 'react';
import CertificateDesigner from '../components/certificate-designer/CertificateDesigner';

const DesignerPage: React.FC = () => {
  const handleSave = (designData: any) => {
    console.log('Saving design data:', designData);
    // TODO: Implement save functionality
  };

  return <CertificateDesigner onSave={handleSave} />;
};

export default DesignerPage;
