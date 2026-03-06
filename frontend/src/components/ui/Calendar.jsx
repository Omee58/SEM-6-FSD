import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function isSameDay(a, b) {
  if (!a || !b) return false;
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
}

export default function Calendar({
  bookedDates = [],
  blockedDates = [],
  selectedDate,
  onSelectDate,
  interactive = true,
  onToggleBlock,
  vendorMode = false,
}) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isBooked = (date) => bookedDates.some(d => isSameDay(d, date));
  const isBlocked = (date) => blockedDates.some(d => isSameDay(d, date));
  const isPast = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };
  const isToday = (date) => isSameDay(date, today);
  const isSelected = (date) => isSameDay(date, selectedDate);

  const cells = [];

  // Prev month days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, current: false });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, date: new Date(viewYear, viewMonth, d) });
  }
  // Next month days to fill grid
  const rem = 42 - cells.length;
  for (let d = 1; d <= rem; d++) {
    cells.push({ day: d, current: false });
  }

  const handleClick = (cell) => {
    if (!cell.current || !cell.date) return;
    if (isPast(cell.date) && !vendorMode) return;
    if (isBooked(cell.date) && !vendorMode) return;

    if (vendorMode && onToggleBlock) {
      if (!isBooked(cell.date)) onToggleBlock(cell.date);
      return;
    }

    if (!interactive) return;
    if (isBooked(cell.date) || isBlocked(cell.date)) return;
    if (onSelectDate) onSelectDate(cell.date);
  };

  const getDayClass = (cell) => {
    if (!cell.current) return 'calendar-day other-month';
    const { date } = cell;
    if (isSelected(date)) return 'calendar-day selected';
    if (isBooked(date)) return 'calendar-day booked';
    if (isBlocked(date)) return `calendar-day ${vendorMode ? 'blocked-vendor' : 'blocked'}`;
    if (isPast(date) && !vendorMode) return 'calendar-day past';
    if (isToday(date)) return 'calendar-day available today';
    return 'calendar-day available';
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E4] p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-[#FCE7F3] flex items-center justify-center text-[#6B6B65] hover:text-[#BE185D] transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="font-semibold text-[#1A1A18] text-sm">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-[#FCE7F3] flex items-center justify-center text-[#6B6B65] hover:text-[#BE185D] transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="calendar-grid mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-[#6B6B65] py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="calendar-grid">
        {cells.map((cell, i) => (
          <div
            key={i}
            className={getDayClass(cell)}
            onClick={() => handleClick(cell)}
            title={
              cell.current && cell.date
                ? isBooked(cell.date) ? 'Already booked'
                : isBlocked(cell.date) ? 'Vendor unavailable'
                : isPast(cell.date) && !vendorMode ? 'Past date'
                : vendorMode ? 'Click to block/unblock'
                : 'Click to select'
                : ''
            }
          >
            {cell.day}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[#E8E8E4]">
        {!vendorMode && (
          <div className="flex items-center gap-1.5 text-xs text-[#6B6B65]">
            <div className="w-3 h-3 rounded bg-[#BE185D]" />
            Selected
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-[#6B6B65]">
          <div className="w-3 h-3 rounded bg-[#F3F4F6]" />
          Booked
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#6B6B65]">
          <div className="w-3 h-3 rounded bg-[#FFEDD5]" />
          Blocked
        </div>
        {!vendorMode && (
          <div className="flex items-center gap-1.5 text-xs text-[#6B6B65]">
            <div className="w-3 h-3 rounded border border-[#BE185D]" />
            Available
          </div>
        )}
      </div>
    </div>
  );
}
