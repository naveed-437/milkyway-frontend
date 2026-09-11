import { useAppStore } from '../../store/useAppStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MonthCalendar() {
  const { selectedDate, setSelectedDate } = useAppStore();
  
  const currentDate = new Date(selectedDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const handleMonthChange = (direction: 'next' | 'prev') => {
    const nextMonth = direction === 'next' ? month + 1 : month - 1;
    const nextDate = new Date(year, nextMonth, 1);
    
    // Safely pad the navigation months too
    const paddedM = String(nextDate.getMonth() + 1).padStart(2, '0');
    const targetString = `${nextDate.getFullYear()}-${paddedM}-01`;
    setSelectedDate(targetString);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 text-sm tracking-tight">
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-1">
          <button onClick={() => handleMonthChange('prev')} className="p-1 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => handleMonthChange('next')} className="p-1 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {paddingArray.map(p => <div key={`pad-${p}`} />)}
        {daysArray.map(day => {
          const paddedMonth = String(month + 1).padStart(2, '0');
          const paddedDay = String(day).padStart(2, '0');
          const dateString = `${year}-${paddedMonth}-${paddedDay}`;
          const isSelected = selectedDate === dateString;
          
          const todayStr = new Date().toISOString().split('T')[0];
          const isToday = todayStr === dateString;

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(dateString)}
              className={`py-1.5 text-xs font-bold rounded-xl transition duration-150 ${
                isSelected 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                  : isToday
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-slate-700 hover:bg-slate-100/70'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
