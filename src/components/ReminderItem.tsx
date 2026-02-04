import React from 'react';
import { CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Reminder {
  id: string;
  title: string;
  date: string;
  is_completed: boolean;
}

interface ReminderItemProps {
  reminder: Reminder;
  petName: string;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ReminderItem: React.FC<ReminderItemProps> = ({ reminder, petName, onToggle, onDelete }) => {
  const date = new Date(reminder.date);
  
  return (
    <div 
      className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer group ${
        reminder.is_completed 
          ? 'bg-gray-50 border-gray-100 opacity-75' 
          : 'bg-white border-gray-100 shadow-sm hover:border-familiar-200'
      }`}
      onClick={() => onToggle(reminder.id)}
    >
      <div className={`mr-4 transition-colors ${reminder.is_completed ? 'text-green-500' : 'text-gray-300 group-hover:text-familiar-400'}`}>
        {reminder.is_completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium truncate ${reminder.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
          {reminder.title}
        </h4>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <span className="font-semibold text-familiar-600 bg-familiar-50 px-1.5 py-0.5 rounded mr-2 truncate max-w-[100px]">
            {petName}
          </span>
          <div className="flex items-center whitespace-nowrap">
            <Clock size={12} className="mr-1" />
            {format(date, 'h:mm a')} • {format(date, 'MMM d')}
          </div>
        </div>
      </div>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(reminder.id);
          }}
          className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Delete reminder"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
};
