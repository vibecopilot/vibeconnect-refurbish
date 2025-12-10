import { useState } from 'react';

const MonthlyExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add expense logic here
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Monthly Expense</h2>
        <p className="text-gray-600 mt-1">Track and manage monthly expenses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Expense Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Add New Expense</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="maintenance">Maintenance</option>
                <option value="utilities">Utilities</option>
                <option value="security">Security</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter expense details..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Expense
            </button>
          </form>
        </div>

        {/* Expense Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Expense Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total This Month</span>
              <span className="text-xl font-bold text-gray-800">₹0.00</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Last Month</span>
              <span className="text-lg font-semibold text-gray-700">₹0.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Expenses</h3>
        <div className="text-center text-gray-500 py-8">
          No expenses recorded yet
        </div>
      </div>
    </div>
  );
};

export default MonthlyExpense;
