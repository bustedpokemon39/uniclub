import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configure date-fns localizer
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

interface CalendarViewProps {
  events: Array<{
    id?: string;
    _id?: string;
    title: string;
    startDate: string;
    endDate: string;
    eventType?: string;
    category?: string[];
    description?: string;
  }>;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
  const navigate = useNavigate();

  // Transform MongoDB events to calendar format
  const calendarEvents: CalendarEvent[] = events.map(event => ({
    id: event.id || event._id || '',
    title: event.title,
    start: new Date(event.startDate),
    end: new Date(event.endDate),
    resource: {
      eventType: event.eventType,
      category: event.category,
      description: event.description,
    },
  }));

  const handleSelectEvent = (event: CalendarEvent) => {
    navigate(`/event/${event.id}`);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const eventType = event.resource?.eventType;
    
    // Different colors for different event types while maintaining emerald theme
    let backgroundColor = '#10b981'; // emerald-500 default
    
    switch (eventType) {
      case 'Workshop':
        backgroundColor = '#10b981'; // emerald-500
        break;
      case 'Seminar':
        backgroundColor = '#059669'; // emerald-600
        break;
      case 'Hackathon':
        backgroundColor = '#047857'; // emerald-700
        break;
      case 'Meetup':
        backgroundColor = '#34d399'; // emerald-400
        break;
      case 'Bootcamp':
        backgroundColor = '#065f46'; // emerald-800
        break;
      default:
        backgroundColor = '#10b981'; // emerald-500
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer',
      }
    };
  };

  return (
    <div className="calendar-container relative">
      <style>{`
        /* Professional Calendar Styling - Emerald Theme Integration */
        .rbc-calendar {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: transparent;
          border: none;
          height: 100%;
        }

        /* Hide/remove non-functional elements */
        .rbc-btn-group .rbc-toolbar button:last-child {
          display: none; /* Hide month/week/day view switcher */
        }

        /* Professional Toolbar - Light/Dark Emerald Theme */
        .rbc-toolbar {
          background-color: #d1fae5 !important; /* emerald-100 for light mode */
          background-image: none !important;
          border: none;
          border-bottom: 1px solid #6ee7b7; /* emerald-300 for light mode */
          padding: 20px 24px;
          margin-bottom: 0;
          align-items: center;
          justify-content: space-between;
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          gap: 16px;
        }

        /* Dark mode toolbar */
        .dark .rbc-toolbar {
          background-color: #044d21 !important; /* emerald-800 for dark mode */
          border-bottom: 1px solid #065f46; /* emerald-800 for dark mode */
        }

        /* Navigation buttons - Light/Dark emerald theme */
        .rbc-toolbar button,
        .rbc-btn {
          background-color: transparent !important;
          background-image: none !important;
          border: 1px solid #10b981 !important; /* emerald-500 for light mode */
          color: #047857 !important; /* emerald-700 for light mode */
          border-radius: 0.5rem !important;
          padding: 0.5rem !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          transition: all 0.2s ease !important;
          box-shadow: none !important;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Dark mode navigation buttons */
        .dark .rbc-toolbar button,
        .dark .rbc-btn {
          border: 1px solid #059669 !important; /* emerald-600 for dark mode */
          color: #c7f0d6 !important; /* emerald-200 for dark mode */
        }

        .rbc-toolbar button:hover,
        .rbc-btn:hover {
          background-color: #10b981 !important; /* emerald-500 for light mode */
          background-image: none !important;
          color: white !important;
          border-color: #10b981 !important;
          transform: none !important;
          box-shadow: none !important;
        }

        /* Dark mode hover */
        .dark .rbc-toolbar button:hover,
        .dark .rbc-btn:hover {
          background-color: #065f46 !important; /* emerald-800 for dark mode */
          border-color: #065f46 !important; /* emerald-800 for dark mode */
        }

        .rbc-toolbar button:active,
        .rbc-btn:active,
        .rbc-toolbar button.rbc-active,
        .rbc-btn.rbc-active {
          background-color: #10b981 !important; /* emerald-500 for light mode */
          background-image: none !important;
          color: white !important;
          border-color: #10b981 !important;
          transform: none !important;
          box-shadow: none !important;
        }

        /* Dark mode active */
        .dark .rbc-toolbar button:active,
        .dark .rbc-btn:active,
        .dark .rbc-toolbar button.rbc-active,
        .dark .rbc-btn.rbc-active {
          background-color: #059669 !important; /* emerald-600 for dark mode */
          border-color: #059669 !important; /* emerald-600 for dark mode */
        }

        /* Month/Year Label - Light/Dark emerald for contrast */
        .rbc-toolbar-label {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          color: #047857 !important; /* emerald-700 for light mode */
          margin: 0 !important;
          text-align: center !important;
          letter-spacing: -0.025em;
          line-height: 1.2;
          flex: 1 !important;
          order: 0;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        /* Dark mode label */
        .dark .rbc-toolbar-label {
          color: #bbf7d0 !important; /* emerald-200 for dark mode */
        }

        /* Day headers - Light/Dark emerald theme with high contrast */
        .rbc-header {
          background-color: #d1fae5 !important; /* emerald-100 for light mode */
          background-image: none !important;
          border-bottom: 1px solid #6ee7b7 !important; /* emerald-300 for light mode */
          padding: 16px 8px;
          font-weight: 600 !important;
          color: #047857 !important; /* emerald-700 for light mode */
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Dark mode day headers */
        .dark .rbc-header {
          background-color: #064e3b !important; /* emerald-800 for dark mode */
          border-bottom: 1px solid #065f46 !important; /* emerald-800 for dark mode */
          color: #bbf7d0 !important; /* emerald-200 for dark mode */
        }
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: center;
        }

        /* Calendar Grid - Clean emerald theme */
        .rbc-month-view {
          border: 1px solid #a7f3d0;
          border-radius: 12px;
          overflow: hidden;
          background-color: white;
          box-shadow: none;
        }

        /* Day cells - Clean appearance with emerald accents */
        .rbc-day-bg {
          border-right: 1px solid #a7f3d0;
          border-bottom: 1px solid #a7f3d0;
          transition: background-color 0.2s ease;
          min-height: 100px;
        }

        .rbc-day-bg:hover {
          background-color: #ecfdf5;
        }

        /* Date numbers - Clean typography */
        .rbc-date-cell {
          padding: 12px;
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
          text-align: left;
        }

        /* Today's date - High contrast emerald highlight */
        .rbc-today {
          background-color: #ecfdf5;
          position: relative;
        }

        .rbc-today .rbc-date-cell {
          background-color: #065f46 !important;
          color: white !important;
          border-radius: 8px;
          margin: 4px;
          padding: 8px;
          text-align: center;
          min-width: 32px;
          display: inline-block;
          font-weight: 700;
        }

        /* Off-range dates (other month) - Muted greyish-blue appearance */
        .rbc-off-range-bg {
          background-color: #f1f5f9 !important;
          opacity: 1;
        }

        .rbc-off-range .rbc-date-cell {
          color: #64748b !important;
          opacity: 1;
          font-weight: 400 !important;
        }

        .rbc-off-range-bg:hover {
          background-color: #e2e8f0 !important;
          opacity: 1;
        }

        /* Events - High contrast emerald design */
        .rbc-event {
          border: none !important;
          border-radius: 0.375rem !important;
          padding: 6px 10px !important;
          margin: 2px 4px !important;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          line-height: 1.2 !important;
          background-color: #10b981 !important;
          color: white !important;
          box-shadow: none !important;
          cursor: pointer;
          transition: all 0.2s ease !important;
          min-height: 24px;
          display: flex;
          align-items: center;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .rbc-event:hover {
          background-color: #059669 !important;
          transform: none !important;
          box-shadow: none !important;
          z-index: 10;
          position: relative;
        }

        .rbc-event:active {
          background-color: #047857 !important;
          transform: none !important;
        }

        /* Event selection state */
        .rbc-event.rbc-selected {
          background-color: #065f46 !important;
          box-shadow: none !important;
        }

        /* Show more indicator - Emerald theme */
        .rbc-show-more {
          background-color: #f0fdf4 !important;
          color: #065f46 !important;
          border: 1px solid #a7f3d0 !important;
          border-radius: 0.375rem !important;
          padding: 4px 8px !important;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          margin: 2px 4px !important;
          cursor: pointer;
          transition: all 0.2s ease !important;
          box-shadow: none !important;
        }

        .rbc-show-more:hover {
          background-color: #10b981 !important;
          color: white !important;
          border-color: #10b981 !important;
        }

        /* Popup styling for event details */
        .rbc-overlay {
          background-color: white !important;
          border: 1px solid #a7f3d0 !important;
          border-radius: 12px !important;
          box-shadow: none !important;
          padding: 16px !important;
          max-width: 300px;
        }

        .rbc-overlay .rbc-overlay-header {
          font-weight: 600 !important;
          color: #065f46 !important;
          margin-bottom: 8px;
          border-bottom: 1px solid #a7f3d0 !important;
          padding-bottom: 8px;
        }

        /* Responsive design - Mobile optimization */
        @media (max-width: 768px) {
          .rbc-toolbar {
            padding: 16px 20px !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            gap: 16px !important;
            justify-content: space-between !important;
            display: flex !important;
          }
          
          .rbc-toolbar button,
          .rbc-btn {
            width: 2.25rem !important;
            height: 2.25rem !important;
            padding: 0.375rem !important;
            flex-shrink: 0 !important;
          }
          
          .rbc-toolbar-label {
            font-size: 1.1rem !important;
            order: 0;
            flex: 1 !important;
            text-align: center !important;
            margin: 0 !important;
            min-width: 0;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          .rbc-day-bg {
            min-height: 80px !important;
          }
          
          .rbc-date-cell {
            padding: 8px !important;
            font-size: 0.8rem !important;
          }
          
          .rbc-event {
            font-size: 0.7rem !important;
            padding: 4px 6px !important;
            margin: 1px 2px !important;
          }
          
          .rbc-header {
            padding: 12px 4px !important;
            font-size: 0.8rem !important;
          }
        }

        @media (max-width: 640px) {
          .rbc-toolbar {
            padding: 12px 16px !important;
            gap: 12px !important;
            flex-direction: row !important;
            display: flex !important;
            justify-content: space-between !important;
          }
          
          .rbc-toolbar button,
          .rbc-btn {
            width: 2rem !important;
            height: 2rem !important;
            padding: 0.25rem !important;
            flex-shrink: 0 !important;
          }
          
          .rbc-toolbar button svg {
            width: 1rem !important;
            height: 1rem !important;
          }
          
          .rbc-toolbar-label {
            font-size: 1rem !important;
            flex: 1 !important;
            min-width: 0;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          .rbc-day-bg {
            min-height: 70px !important;
          }
        }
      `}</style>

      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ 
          height: 650,
          width: '100%',
        }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        views={['month']}
        defaultView="month"
        popup={true}
        popupOffset={{ x: 10, y: 10 }}
        messages={{
          next: "Next",
          previous: "Previous", 
          today: "Today",
          showMore: (total) => `+${total} more events`
        }}
        dayLayoutAlgorithm="overlap"
        step={60}
        showMultiDayTimes={false}
        components={{
          toolbar: ({ label, onNavigate, onView }) => (
            <div className="rbc-toolbar">
              <button
                type="button"
                onClick={() => onNavigate('PREV')}
                className="rbc-toolbar-btn flex items-center justify-center w-10 h-10 p-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h2 className="rbc-toolbar-label">{label}</h2>
              
              <button
                type="button"
                onClick={() => onNavigate('NEXT')}
                className="rbc-toolbar-btn flex items-center justify-center w-10 h-10 p-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )
        }}
      />
    </div>
  );
};

export default CalendarView;
