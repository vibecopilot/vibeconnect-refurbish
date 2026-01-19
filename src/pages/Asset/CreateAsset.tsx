import React from 'react';
import PageTitle from '../../components/ui/PageTitle';
import AssetCreateForm from '../../components/forms/AssetCreateForm';
import { useLocation } from 'react-router-dom';

const CreateAsset: React.FC = () => {
  const location = useLocation();
  const from = (location.state as any)?.from;

  const isMeter = from === 'meter';
  const parentCrumb = isMeter
    ? { label: 'Meter', path: '/asset/meter' }
    : { label: 'Asset', path: '/asset' };

  return (
    <div className="p-6">
      <PageTitle 
        title={isMeter ? 'Add Meter' : 'Add Asset'} 
        breadcrumbs={[
          parentCrumb, 
          { label: isMeter ? 'Add Meter' : 'Add Asset' }
        ]} 
      />
      
      <AssetCreateForm from={from} />
    </div>
  );
};

export default CreateAsset;
