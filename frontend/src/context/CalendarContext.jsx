import React, { createContext, useContext, useState, useEffect } from "react";

const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {
  const [isNepaliCalendar, setIsNepaliCalendar] = useState(() => {
    const savedValue = localStorage.getItem("isNepaliCalendar");
    return savedValue !== null ? JSON.parse(savedValue) : true;
  });

  const [timePeriod, setTimePeriod] = useState(() => {
    const savedValue = localStorage.getItem("timePeriod");
    return savedValue || "month"; // Default to "month"
  });

  useEffect(() => {
    localStorage.setItem("isNepaliCalendar", JSON.stringify(isNepaliCalendar));
  }, [isNepaliCalendar]);

  useEffect(() => {
    localStorage.setItem("timePeriod", timePeriod);
  }, [timePeriod]);

  return (
    <CalendarContext.Provider
      value={{
        isNepaliCalendar,
        setIsNepaliCalendar,
        timePeriod,
        setTimePeriod,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => useContext(CalendarContext);
