import { useState, useEffect } from "react";
import TotalResult from "../components/TotalResult";
import Calendar from "react-calendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "react-calendar/dist/Calendar.css";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, CircularProgress, Box, Modal } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FlagIcon from "@mui/icons-material/Flag";
import AddIcon from "@mui/icons-material/Add";
import {
  createGoal,
  getAllGoals,
  addGoalProgress,
  deleteGoal,
  addExpense,
} from "../api/api";
import ExpenseList from "../components/ExpenseList";
import CalendarSwitcher from "../components/CalendarSwitcher";
import NepaliDate from "nepali-date-converter";
import {
  getNepaliMonthArray,
  toNepaliDate,
  getCurrentNepaliMonth,
} from "../utils/dateConverter";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Planner = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchGoals();
  }, []);

  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    title: "",
    amount: "",
    targetAmount: "",
    deadline: "",
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [goalStats, setGoalStats] = useState([0, 0, 0]); // Add this for TotalResult
  const [openModal, setOpenModal] = useState(false);
  const [newSavingGoal, setNewSavingGoal] = useState({
    title: "",
    targetAmount: "",
    deadline: "",
  });

  const [formData, setFormData] = useState({
    goalId: "",
    amount: "",
    date: "",
  });

  const [savingsHistory, setSavingsHistory] = useState([]);
  const [isNepaliCalendar, setIsNepaliCalendar] = useState(true);

  const calculateTotalSavings = (goalsList) => {
    const now = new Date();

    const weekly = goalsList.reduce((sum, goal) => {
      if (isInSameWeek(new Date(goal.date), now)) {
        return (goal.current_amount || 0) + sum;
      }
      return sum;
    }, 0);

    const monthly = goalsList.reduce(
      (sum, goal) =>
        new Date(goal.date).getMonth() === now.getMonth()
          ? (goal.current_amount || 0) + sum
          : sum,
      0
    );

    const yearly = goalsList.reduce(
      (sum, goal) =>
        new Date(goal.date).getFullYear() === now.getFullYear()
          ? (goal.current_amount || 0) + sum
          : sum,
      0
    );

    return [weekly, monthly, yearly];
  };

  const fetchGoals = async () => {
    try {
      const data = await getAllGoals();
      setGoals(data);

      // Transform goals progress into a format compatible with ExpenseList
      const progressHistory = data.flatMap((goal) => {
        // If goal has no progress, don't include it
        if (!goal.current_amount) return [];

        return [
          {
            id: goal.id,
            date: goal.date,
            name: goal.name,
            amount: goal.current_amount,
            type: "Savings",
            description: "Savings Progress",
          },
        ];
      });

      setSavingsHistory(progressHistory);
      setGoalStats(calculateTotalSavings(data));
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (newGoal.title && newGoal.targetAmount) {
      const goalDate =
        newGoal.deadline || new Date().toISOString().split("T")[0];
      const newGoalItem = {
        ...newGoal,
        id: Date.now(),
        deadline: goalDate,
        completed: false,
        currentAmount: Number(newGoal.amount) || 0,
        targetAmount: Number(newGoal.targetAmount),
      };
      setGoals([...goals, newGoalItem]);

      // Update goal stats for TotalResult
      const amount = Number(newGoal.amount) || 0;
      setGoalStats((prev) => {
        const today = new Date();
        const goalDeadline = new Date(goalDate);
        return [
          prev[0] + (isInSameWeek(today, goalDeadline) ? amount : 0),
          prev[1] + (goalDeadline.getMonth() === today.getMonth() ? amount : 0),
          prev[2] +
            (goalDeadline.getFullYear() === today.getFullYear() ? amount : 0),
        ];
      });

      setNewGoal({ title: "", amount: "", targetAmount: "", deadline: "" });
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (newSavingGoal.title && newSavingGoal.targetAmount) {
      try {
        const newGoalItem = {
          name: newSavingGoal.title,
          amount: parseInt(newSavingGoal.targetAmount),
          date: dayjs(newSavingGoal.deadline).format("YYYY-MM-DD"),
        };

        await createGoal(newGoalItem);
        await fetchGoals();

        toast.success("Goal created successfully!");
        setOpenModal(false);
        setNewSavingGoal({ title: "", targetAmount: "", deadline: "" });
      } catch (error) {
        console.error("Error creating goal:", error);
        toast.error("Failed to create goal");
      }
    }
  };

  const handleAddAmount = async (e) => {
    e.preventDefault();
    if (formData.goalId && formData.amount) {
      try {
        const progress = {
          goal_id: formData.goalId,
          amount: parseInt(formData.amount),
          date: formData.date || dayjs().format("YYYY-MM-DD"),
        };

        await addGoalProgress(formData.goalId, progress);
        await fetchGoals(); // Refresh goals to get updated amounts

        toast.success("Progress added successfully!");
        setFormData({ goalId: "", amount: "", date: "" });
      } catch (error) {
        if (error.response?.status === 400) {
          toast.error(error.response.data.detail);
        } else {
          console.error("Error adding progress:", error);
          toast.error("Failed to add progress");
        }
      }
    }
  };

  const isInSameWeek = (date1, date2) => {
    // Get the year and week number for both dates
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    // Get ISO week number (Monday-Sunday)
    const getWeekNumber = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
      return [d.getFullYear(), weekNo];
    };

    const [year1, week1] = getWeekNumber(d1);
    const [year2, week2] = getWeekNumber(d2);

    return year1 === year2 && week1 === week2;
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await deleteGoal(goalId);
      await fetchGoals(); // This will also update the total savings
      toast.success("Goal deleted successfully!");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  const handleMarkGoalAsDone = async (goal) => {
    try {
      // Add the saving goal as an expense
      const expense = {
        name: goal.name,
        amount: goal.current_amount || 0,
        date: new Date().toISOString().split("T")[0],
        category: "Savings", // You can adjust the category as needed
      };
      await addExpense(expense);

      // Remove the saving goal
      await deleteGoal(goal.id);

      // Refresh the goals list
      await fetchGoals();

      toast.success("Goal marked as done and added to expenses!");
    } catch (error) {
      console.error("Error marking goal as done:", error);
      toast.error("Failed to mark goal as done");
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const getTileClassName = ({ date }) => {
    const dateStr = date.toDateString();
    const hasDeadline = goals.some(
      (goal) => new Date(goal.date).toDateString() === dateStr
    );
    return hasDeadline ? "calendar-deadline" : "";
  };

  const isGoalOnSelectedDate = (goalDate) => {
    return new Date(goalDate).toDateString() === selectedDate.toDateString();
  };

  const calculateTimeProgress = (deadline) => {
    const total = new Date(deadline) - new Date();
    const daysLeft = Math.ceil(total / (1000 * 60 * 60 * 24));
    const progress = Math.max(0, Math.min(100, (daysLeft / 30) * 100));
    return { progress: 100 - progress, daysLeft };
  };

  const calculateProgress = (goal) => {
    const timeProgress = calculateTimeProgress(goal.date);
    const amountProgress = (goal.current_amount / goal.amount) * 100;
    return {
      progress: Math.min(amountProgress, 100),
      daysLeft: timeProgress.daysLeft,
      amountLeft: goal.amount - goal.current_amount,
    };
  };

  const getStats = () => {
    return {
      count: goals.length,
    };
  };

  const getFormattedDate = (date) => {
    if (isNepaliCalendar) {
      return toNepaliDate(date);
    }
    return new Date(date).toLocaleDateString();
  };

  const formatCalendarDate = (date) => {
    try {
      if (isNepaliCalendar) {
        const nepDate = new NepaliDate(date);
        return nepDate.getDate();
      }
      return date.getDate();
    } catch (error) {
      console.error("Error formatting date:", error);
      return date.getDate();
    }
  };

  const formatCalendarMonth = (locale, date) => {
    try {
      if (isNepaliCalendar) {
        const nepDate = new NepaliDate(date);
        const nepaliMonths = [
          "बैशाख",
          "जेठ",
          "असार",
          "श्रावण",
          "भदौ",
          "असोज",
          "कार्तिक",
          "मंसिर",
          "पुष",
          "माघ",
          "फाल्गुन",
          "चैत",
        ];
        return nepaliMonths[nepDate.getMonth()];
      }
      return date.toLocaleString("default", { month: "long" });
    } catch (error) {
      console.error("Error formatting month:", error);
      return date.toLocaleString("default", { month: "long" });
    }
  };

  const formatCalendarYear = (locale, date) => {
    try {
      if (isNepaliCalendar) {
        const nepDate = new NepaliDate(date);
        return nepDate.getYear();
      }
      return date.getFullYear();
    } catch (error) {
      console.error("Error formatting year:", error);
      return date.getFullYear();
    }
  };

  return (
    <>
      <div className='planner'>
        <div className='planner-header'>
          <h1>Planner</h1>
          <CalendarSwitcher
            isNepali={isNepaliCalendar}
            onToggle={() => setIsNepaliCalendar(!isNepaliCalendar)}
          />
        </div>
        <TotalResult
          data={goalStats}
          type='savings'
        />

        {/* New Modal Design */}
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          aria-labelledby='new-goal-modal'
          className='newGoalModal'
          BackdropProps={{
            style: {
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
            },
          }}
        >
          <div className='modalWrapper'>
            <div className='modalHeader'>
              <h2>New Saving Goal</h2>
              <p>Plan your future savings</p>
            </div>
            <form onSubmit={handleModalSubmit}>
              <div className='inputGroup'>
                <label>Goal Title</label>
                <input
                  type='text'
                  placeholder='What are you saving for?'
                  value={newSavingGoal.title}
                  onChange={(e) =>
                    setNewSavingGoal({
                      ...newSavingGoal,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className='inputGroup'>
                <label>Target Amount</label>
                <input
                  type='number'
                  placeholder='How much do you need?'
                  value={newSavingGoal.targetAmount}
                  onChange={(e) =>
                    setNewSavingGoal({
                      ...newSavingGoal,
                      targetAmount: e.target.value,
                    })
                  }
                />
              </div>
              <div className='inputGroup'>
                <label>Target Date</label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={
                      newSavingGoal.deadline
                        ? dayjs(newSavingGoal.deadline)
                        : null
                    }
                    onChange={(date) =>
                      setNewSavingGoal({
                        ...newSavingGoal,
                        deadline: date ? date.format("YYYY-MM-DD") : "",
                      })
                    }
                    slotProps={{
                      textField: {
                        placeholder: "When do you need this?",
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
              <div className='modalActions'>
                <button
                  type='button'
                  onClick={() => setOpenModal(false)}
                  className='cancelBtn'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='createBtn'
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </Modal>

        <div className='plannerMain'>
          <div className='formSection'>
            <div className='formContainer'>
              <div className='formHeader'>
                <div>
                  <h3>Add Progress</h3>
                  <p>Add amount to your saving goal</p>
                </div>
              </div>
              <form onSubmit={handleAddAmount}>
                <select
                  value={formData.goalId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      goalId: e.target.value,
                    })
                  }
                >
                  <option value=''>Select Goal</option>
                  {goals.map((goal) => (
                    <option
                      key={goal.id}
                      value={goal.id}
                    >
                      {goal.name} (Current: Rs {goal.current_amount || 0} /
                      Target: Rs {goal.amount})
                    </option>
                  ))}
                </select>
                <input
                  type='number'
                  placeholder='Amount'
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: e.target.value,
                    })
                  }
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={formData.date ? dayjs(formData.date) : null}
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        date: date ? date.format("YYYY-MM-DD") : "",
                      })
                    }
                    slotProps={{
                      textField: {
                        placeholder: "Select Date",
                        className: "date-picker",
                      },
                    }}
                  />
                </LocalizationProvider>
                <button type='submit'>Add Amount</button>
              </form>
            </div>
          </div>

          <div className='secondaryContainer'>
            <div className='goalsList'>
              <div className='goalsListHeader'>
                <div>
                  <h3>Goals List</h3>
                  <p>Track your progress</p>
                </div>
              </div>
              <div className='goals-grid'>
                {goals.map((goal) => {
                  const { progress, daysLeft, amountLeft } =
                    calculateProgress(goal);
                  return (
                    <div
                      key={goal.id}
                      className={`goal-card ${
                        isGoalOnSelectedDate(goal.date)
                          ? "highlighted-card"
                          : ""
                      }`}
                    >
                      <Box className='progress-wrapper'>
                        <CircularProgress
                          variant='determinate'
                          value={progress}
                          size={80}
                          className={progress === 100 ? "completed" : ""}
                        />
                        <Box className='progress-content'>
                          {progress === 100 ? (
                            <CheckCircleIcon className='check-icon' />
                          ) : (
                            <span className='progress-text'>
                              {Math.round(progress)}%
                            </span>
                          )}
                        </Box>
                      </Box>
                      <div className='goal-info'>
                        <h4>{goal.name}</h4>
                        <p className='amount'>
                          Rs {goal.current_amount || 0} / Rs {goal.amount}
                        </p>
                        <p className='deadline'>
                          {getFormattedDate(goal.date)}
                        </p>
                      </div>
                      <IconButton
                        onClick={() => handleDeleteGoal(goal.id)}
                        size='small'
                        className='delete-btn'
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleMarkGoalAsDone(goal)}
                        size='small'
                        className='done-btn'
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className='calendarContainer'>
              <div className='statsGrid'>
                <div className='stat-card'>
                  <div className='stat-info-container'>
                    <div className='stat-icon goals'>
                      <FlagIcon />
                    </div>
                    <div className='stat-info'>
                      <p>Total Saving Times</p>
                      <h3>{getStats().count}</h3>
                    </div>
                  </div>
                  <button
                    className='addGoalBtn'
                    onClick={() => setOpenModal(true)}
                  >
                    <AddIcon /> New Goal
                  </button>
                </div>
              </div>
              <div className='calendarHeader'>
                <div className='calendarHeaderTop'>
                  <div>
                    <h3>Calendar</h3>
                    <p>Set reminders</p>
                  </div>
                  {/* <CalendarSwitcher
                    isNepali={isNepaliCalendar}
                    onToggle={() => setIsNepaliCalendar(!isNepaliCalendar)}
                  /> */}
                </div>
              </div>
              <div className='calendarBody'>
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  tileClassName={getTileClassName}
                  formatDay={(locale, date) => formatCalendarDate(date)}
                  formatMonth={(locale, date) =>
                    formatCalendarMonth(locale, date)
                  }
                  formatYear={(locale, date) =>
                    formatCalendarYear(locale, date)
                  }
                  navigationLabel={({ date, label, locale, view }) =>
                    formatCalendarMonth(locale, date) +
                    " " +
                    formatCalendarYear(locale, date)
                  }
                  locale='ne'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position='top-right'
        theme='dark'
      />
    </>
  );
};

export default Planner;
