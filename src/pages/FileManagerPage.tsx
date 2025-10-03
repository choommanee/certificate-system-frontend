import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import FileManager from '../components/file-manager/FileManager';

const FileManagerPage: React.FC = () => {
  return (
    <DashboardLayout>
      <FileManager />
    </DashboardLayout>
  );
};

export default FileManagerPage;