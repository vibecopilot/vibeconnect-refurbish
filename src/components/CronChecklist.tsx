import React from 'react';
import Cron from 'react-js-cron';
import 'react-js-cron/dist/styles.css';

interface CronChecklistProps {
  value: string;
  onChange: (cronExpression: string) => void;
}

const CronChecklist: React.FC<CronChecklistProps> = ({ value, onChange }) => {
  return (
    <div className="border-2 border-dashed border-border rounded-lg p-4 bg-background">
      <Cron 
        value={value} 
        setValue={onChange}
        clearButton={true}
        clearButtonText="Clear"
        className="cron-builder"
      />
    </div>
  );
};

export default CronChecklist;
