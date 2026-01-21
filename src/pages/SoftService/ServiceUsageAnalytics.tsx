import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, Clock, PieChart, Table as TableIcon } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb';

const usageSummary = [
  { date: '2025-11-11', total: 270, extra: 90, usedCount: 3 },
  { date: '2025-11-10', total: 165, extra: 45, usedCount: 2 },
  { date: '2025-11-09', total: 140, extra: 20, usedCount: 2 },
  { date: '2025-11-08', total: 90, extra: 30, usedCount: 1 },
  { date: '2025-11-07', total: 60, extra: 0, usedCount: 1 },
];

const usageDetails = [
  { service: 'Cleaning', assetId: 'V001', assetName: 'Vacuum Cleaner', usedBy: 'Suresh', start: '10:00', end: '11:00', time: 60, extra: 0, condition: 'Good', status: 'Done', date: '2025-11-11' },
  { service: 'Cleaning', assetId: 'V001', assetName: 'Vacuum Cleaner', usedBy: 'Suresh', start: '14:00', end: '15:30', time: 90, extra: 30, condition: 'Good', status: 'Done', date: '2025-11-11' },
  { service: 'Maintenance', assetId: 'E020', assetName: 'Elevator Panel', usedBy: 'Ramesh', start: '09:00', end: '11:00', time: 120, extra: 60, condition: 'Working', status: 'Done', date: '2025-11-11' },
];

const barWidth = (value: number, max: number) => `${(value / max) * 100}%`;

const ServiceUsageAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const maxTotal = Math.max(...usageSummary.map((u) => u.total));
  const selectedDate = '2025-11-11';

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 pb-0 flex items-center justify-between">
        <Breadcrumb items={[
          { label: 'FM Module' },
          { label: 'Soft Services', path: '/soft-services' },
          { label: 'Service', path: id ? `/soft-services/${id}` : '/soft-services' },
          { label: 'Usage Analytics' },
        ]} />
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Date-wise Asset Usage Summary</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Date</span><span>Total / Extra</span><span>Used</span>
              </div>
              {usageSummary.map((row) => (
                <div key={row.date} className="flex items-center justify-between text-sm bg-muted/30 rounded-lg px-3 py-2">
                  <span className="font-medium">{row.date}</span>
                  <span>{row.total}m / {row.extra}m</span>
                  <span className="text-muted-foreground">{row.usedCount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Total Time per Date</span>
            </div>
            <div className="space-y-2">
              {usageSummary.map((row) => (
                <div key={row.date}>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{row.date}</span>
                    <span>{row.total} min</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: barWidth(row.total, maxTotal) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Extra Time vs Total</span>
            </div>
            <div className="space-y-2">
              {usageSummary.map((row) => (
                <div key={row.date}>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{row.date}</span>
                    <span>{row.extra} / {row.total} min</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                    <div className="h-full bg-orange-400" style={{ width: barWidth(row.extra, maxTotal) }} />
                    <div className="h-full bg-primary/40" style={{ width: barWidth(row.total - row.extra, maxTotal) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TableIcon className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Details for {selectedDate}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 pr-2 text-left font-medium">Service</th>
                    <th className="py-2 pr-2 text-left font-medium">Asset</th>
                    <th className="py-2 pr-2 text-left font-medium">Used By</th>
                    <th className="py-2 pr-2 text-left font-medium">Start</th>
                    <th className="py-2 pr-2 text-left font-medium">End</th>
                    <th className="py-2 pr-2 text-left font-medium">Time</th>
                    <th className="py-2 pr-2 text-left font-medium">Extra</th>
                    <th className="py-2 pr-2 text-left font-medium">Condition</th>
                    <th className="py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {usageDetails.filter((d) => d.date === selectedDate).map((d, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0">
                      <td className="py-2 pr-2">{d.service}</td>
                      <td className="py-2 pr-2">{d.assetId} / {d.assetName}</td>
                      <td className="py-2 pr-2">{d.usedBy}</td>
                      <td className="py-2 pr-2">{d.start}</td>
                      <td className="py-2 pr-2">{d.end}</td>
                      <td className="py-2 pr-2">{d.time} min</td>
                      <td className="py-2 pr-2 text-orange-500">{d.extra} min</td>
                      <td className="py-2 pr-2">{d.condition}</td>
                      <td className="py-2">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">More Analysis (static sample)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Total Usage Time by Service</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs"><span>Cleaning</span><span>150m</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: '100%' }} /></div>
                  <div className="flex justify-between text-xs"><span>Maintenance</span><span>120m</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary/70" style={{ width: '80%' }} /></div>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Asset Condition Breakdown</p>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded-full border border-green-200">Good</span>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full border border-blue-200">Working</span>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Extra Time Trend (by hour)</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs"><span>09:00</span><span>60m</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-orange-400" style={{ width: '100%' }} /></div>
                  <div className="flex justify-between text-xs"><span>10:00</span><span>15m</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-orange-300" style={{ width: '25%' }} /></div>
                  <div className="flex justify-between text-xs"><span>14:00</span><span>30m</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-orange-300" style={{ width: '50%' }} /></div>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Service Count by Employee</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs"><span>Suresh</span><span>2</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: '100%' }} /></div>
                  <div className="flex justify-between text-xs"><span>Ramesh</span><span>1</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary/60" style={{ width: '60%' }} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceUsageAnalytics;
