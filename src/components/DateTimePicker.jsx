import React from 'react';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
const CustomDateTimePicker = ({ type, value, onChange }) => {
    const dateFormat = 'dd-MM-yyyy';
    const timeFormat = 'hh:mm a';

  return (
    <div class="bg-[#D9D9D9] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
    <DateTimePicker
      onChange={onChange}
      value={value}
      format={type === 'date' ? dateFormat : timeFormat}
      calendarIcon={type === 'date' ? null : null}
      clearIcon={type === 'date' ? null : null}
      required={true}
    />
    </div>
   
  );
};

export default CustomDateTimePicker;