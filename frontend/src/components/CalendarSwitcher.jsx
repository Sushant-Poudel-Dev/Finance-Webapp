import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const CalendarSwitcher = ({ isNepali, onToggle }) => {
  return (
    <div className='calendar-switcher'>
      <CalendarMonthIcon />
      <div className='switcher-options'>
        <button
          className={!isNepali ? "active" : ""}
          onClick={() => onToggle(false)}
        >
          EN
        </button>
        <button
          className={isNepali ? "active" : ""}
          onClick={() => onToggle(true)}
        >
          NE
        </button>
      </div>
    </div>
  );
};

export default CalendarSwitcher;
