import { useState } from 'react';

const UnitConfig = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Unit Configuration</h2>
        <p className="text-gray-600 mt-1">Configure unit-specific billing settings</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Unit Billing Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default CAM Charges (per sq.ft)
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Billing Cycle
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half-yearly">Half-Yearly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Day of Month)
            </label>
            <input
              type="number"
              min="1"
              max="31"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="15"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grace Period (Days)
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitConfig;
