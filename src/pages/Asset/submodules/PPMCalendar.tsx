import React, { useCallback, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getPPMCalendar, getPPMTask } from '../../../api';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import toast from "react-hot-toast";

interface PPMCalendarProps {
  searchValue: string;
}

const PPMCalendar: React.FC<PPMCalendarProps> = ({ searchValue }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate] = useState(new Date());
  const [modal, setModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const mapTaskEvents = (tasks: any[]) =>
    tasks.map((task: any) => ({
      title: task?.asset_name || "No Title",
      start: task?.start_time || new Date().toISOString(),
      extendedProps: {
        assignTo: task?.assigned_to_name || "Unassigned",
        status: task?.status || "unknown",
        checklistName: task?.checklist_name || "",
      },
    }));

  const mapCalendarEvents = (items: any[]) =>
    items.map((event: any) => ({
      title: event?.title || "No Title",
      start: event?.start || new Date().toISOString(),
      extendedProps: {
        assignTo: event?.assigned_to || "Unassigned",
        status: event?.status || "unknown",
        checklistName: event?.checklist_name || "",
      },
    }));

  const fetchPPMTask = useCallback(async () => {
    setLoading(true);
    setError(null);
    toast.loading("Please wait...");
    try {
      const taskResponse = await getPPMTask();
      const formattedEvents = mapTaskEvents(taskResponse.data.activities || []);
      setEvents(formattedEvents);
      toast.dismiss();
      toast.success("PPM Calendar data loaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      toast.dismiss();
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPPMCalendar = useCallback(async () => {
    if (!startDate || !endDate) return;
    if (startDate >= endDate) {
      toast.error("Start date must be before End date");
      return;
    }
    setLoading(true);
    setError(null);
    toast.loading("Please wait...");
    try {
      const response = await getPPMCalendar(startDate, endDate);
      const formattedEvents = mapCalendarEvents(response.data || []);
      setEvents(formattedEvents);
      toast.dismiss();
      toast.success("PPM Calendar data loaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      toast.dismiss();
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchPPMTask();
  }, [fetchPPMTask]);

  const handleEvent = (eventInfo: any) => {
    setSelectedEvent(eventInfo.event);
    setModal(true);
  };

  const oncloseModal = () => {
    setSelectedEvent(null);
    setModal(false);
  };

  // Filter events based on search
  const filteredEvents = events.filter(event => 
    !searchValue || 
    event.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
    event.extendedProps.checklistName?.toLowerCase().includes(searchValue.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading PPM calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Calendar</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl shadow-lg border border-border p-4 bg-card">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
          <div className="flex flex-col">
            <label className="text-sm text-muted-foreground mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 bg-background text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-muted-foreground mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 bg-background text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchPPMCalendar}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              disabled={!startDate || !endDate}
            >
              Apply
            </button>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                fetchPPMTask();
              }}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
            >
              Clear
            </button>
          </div>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev",
            center: "title",
            right: "next dayGridMonth,timeGridWeek,timeGridDay",
          }}
          views={{
            fortnightlyView: {
              type: "dayGrid",
              duration: { weeks: 2 },
              buttonText: "fortnight",
            },
          }}
          initialDate={selectedDate}
          events={filteredEvents}
          eventClick={handleEvent}
          eventTextColor="white"
          height={"85vh"}
          allDayText="All Day"
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }}
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }}
          eventClassNames={(eventInfo) => {
            return eventInfo.event.extendedProps.status === "inprogress"
              ? "bg-yellow-500"
              : eventInfo.event.extendedProps.status === "complete"
              ? "bg-green-500"
              : "bg-red-500";
          }}
          eventContent={(eventInfo) => (
            <div className="p-1 text-xs">
              <b>{eventInfo.event.title}</b>
              <br />
              <span>Assigned To: {eventInfo.event.extendedProps.assignTo}</span>
              <br />
              <span>Status: {eventInfo.event.extendedProps.status}</span>
            </div>
          )}
        />
      </div>

      {/* Modal */}
      {modal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={oncloseModal}>
          <div className="bg-card rounded-xl p-6 shadow-xl max-w-md w-full mx-4 border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-foreground text-center">
                {selectedEvent.title}
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold text-muted-foreground">Assigned To:</span>{" "}
                  <span className="text-foreground">{selectedEvent.extendedProps.assignTo}</span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-muted-foreground">Status:</span>{" "}
                  <span className="text-foreground capitalize">{selectedEvent.extendedProps.status}</span>
                </p>
                {selectedEvent.extendedProps.checklistName && (
                  <p className="text-sm">
                    <span className="font-semibold text-muted-foreground">Checklist:</span>{" "}
                    <span className="text-foreground">{selectedEvent.extendedProps.checklistName}</span>
                  </p>
                )}
              </div>
              <button
                onClick={oncloseModal}
                className="mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PPMCalendar;
