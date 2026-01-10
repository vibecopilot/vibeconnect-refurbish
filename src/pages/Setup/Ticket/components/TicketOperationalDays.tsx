import React, { useState } from "react";
import FormSection from "../../../../components/ui/FormSection";

interface OperationalDay {
  id: string;
  day: string;
  enabled: boolean;
  start: string;
  end: string;
}

const initialDays: OperationalDay[] = [
  { id: "mon", day: "Monday", enabled: false, start: "13:45", end: "19:45" },
  { id: "tue", day: "Tuesday", enabled: false, start: "13:45", end: "16:45" },
  { id: "wed", day: "Wednesday", enabled: false, start: "15:45", end: "16:45" },
  { id: "thu", day: "Thursday", enabled: false, start: "14:45", end: "06:45" },
  { id: "fri", day: "Friday", enabled: false, start: "09:45", end: "13:45" },
  { id: "sat", day: "Saturday", enabled: false, start: "08:45", end: "13:45" },
  { id: "sun", day: "Sunday", enabled: false, start: "12:45", end: "13:45" },
];

const TicketOperationalDays: React.FC = () => {
  const [days, setDays] = useState<OperationalDay[]>(initialDays);

  const handleToggle = (id: string) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === id ? { ...day, enabled: !day.enabled } : day
      )
    );
  };

  const handleTimeChange = (
    id: string,
    field: "start" | "end",
    value: string
  ) => {
    setDays((prev) =>
      prev.map((day) => (day.id === id ? { ...day, [field]: value } : day))
    );
  };

  return (
    <FormSection title="Operational Days">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-secondary/60">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">
                Enable
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">
                Day
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">
                Start Time
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">
                End Time
              </th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.id} className="border-b border-border">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={() => handleToggle(day.id)}
                    className="h-4 w-4"
                  />
                </td>
                <td className="px-4 py-2 text-sm text-foreground">
                  {day.day}
                </td>
                <td className="px-4 py-2">
                  <input
                    type="time"
                    value={day.start}
                    onChange={(e) =>
                      handleTimeChange(day.id, "start", e.target.value)
                    }
                    className="w-40 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="time"
                    value={day.end}
                    onChange={(e) =>
                      handleTimeChange(day.id, "end", e.target.value)
                    }
                    className="w-40 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg">
          Submit
        </button>
      </div>
    </FormSection>
  );
};

export default TicketOperationalDays;
