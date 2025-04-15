import TotalResult from "../components/TotalResult";
import IncomeList from "../components/IncomeList";
import PieChartContainer from "../components/PieChartContainer";
import LineChartContainer from "../components/LineChartContainer";
import { useEffect, useState } from "react";
import { getAllIncomes, getAllExpenses, getAllGoals } from "../api/api"; // Import API functions
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import ExpenseList from "../components/ExpenseList";
import CalendarSwitcher from "../components/CalendarSwitcher";
import {
  getNepaliMonthArray,
  toNepaliDate,
  getCurrentNepaliMonth,
  getMonthArray,
} from "../utils/dateConverter";
import NepaliDate from "nepali-date-converter";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useCalendar } from "../context/CalendarContext";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const Dashboard = () => {
  const { isNepaliCalendar, setIsNepaliCalendar, timePeriod, setTimePeriod } =
    useCalendar();

  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        // Fetch incomes, expenses and goals from the backend
        const [incomeResponse, expenseResponse, goalsResponse] =
          await Promise.all([getAllIncomes(), getAllExpenses(), getAllGoals()]);

        setIncomes(incomeResponse);
        setExpenses(expenseResponse);
        setGoals(goalsResponse);

        // Initialize filtered data
        filterDataByTimePeriod(incomeResponse, expenseResponse, goalsResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Update filtered data when time period, calendar type, or raw data changes
  useEffect(() => {
    filterDataByTimePeriod(incomes, expenses, goals);
  }, [timePeriod, isNepaliCalendar, incomes, expenses, goals]);

  // Update filterDataByTimePeriod function to properly handle Nepali dates
  const filterDataByTimePeriod = (
    allIncomes = incomes,
    allExpenses = expenses,
    allGoals = goals
  ) => {
    // Handle filtering based on calendar type
    if (isNepaliCalendar) {
      // Filter using Nepali calendar logic
      filterByNepaliDates(allIncomes, allExpenses, allGoals);
    } else {
      // Filter using English calendar logic (existing implementation)
      filterByEnglishDates(allIncomes, allExpenses, allGoals);
    }
  };

  // Function to filter data using English calendar
  const filterByEnglishDates = (allIncomes, allExpenses, allGoals) => {
    const now = dayjs();
    let startDate;

    switch (timePeriod) {
      case "today":
        startDate = now.startOf("day");
        break;
      case "week":
        startDate = now.startOf("week");
        break;
      case "month":
        startDate = now.startOf("month");
        break;
      case "year":
        startDate = now.startOf("year");
        break;
      case "all":
      default:
        // If 'all', just set filteredData to all data
        setFilteredIncomes(allIncomes);
        setFilteredExpenses(allExpenses);
        setFilteredGoals(allGoals);
        return;
    }

    // Filter incomes
    setFilteredIncomes(
      allIncomes.filter((income) => {
        const incomeDate = dayjs(income.date);
        return (
          incomeDate.isAfter(startDate) || incomeDate.isSame(startDate, "day")
        );
      })
    );

    // Filter expenses
    setFilteredExpenses(
      allExpenses.filter((expense) => {
        const expenseDate = dayjs(expense.date);
        return (
          expenseDate.isAfter(startDate) || expenseDate.isSame(startDate, "day")
        );
      })
    );

    // Filter goals
    setFilteredGoals(
      allGoals.filter((goal) => {
        const goalDate = dayjs(goal.date);
        return goalDate.isAfter(startDate) || goalDate.isSame(startDate, "day");
      })
    );
  };

  // Function to filter data using Nepali calendar
  const filterByNepaliDates = (allIncomes, allExpenses, allGoals) => {
    // Get current Nepali date
    const currentNepaliDate = new NepaliDate();
    const currentNepaliYear = currentNepaliDate.getYear();
    const currentNepaliMonth = currentNepaliDate.getMonth();
    const currentNepaliDay = currentNepaliDate.getDate();

    // Calculate start date based on time period
    let startYear, startMonth, startDay;

    switch (timePeriod) {
      case "today":
        startYear = currentNepaliYear;
        startMonth = currentNepaliMonth;
        startDay = currentNepaliDay;
        break;
      case "week":
        // Get the first day of the week in Nepali calendar
        // (Nepali week starts from Sunday = 0)
        const currentDayOfWeek = currentNepaliDate.getDay();
        const startOfWeek = new NepaliDate(
          currentNepaliYear,
          currentNepaliMonth,
          currentNepaliDay - currentDayOfWeek
        );
        startYear = startOfWeek.getYear();
        startMonth = startOfWeek.getMonth();
        startDay = startOfWeek.getDate();
        break;
      case "month":
        startYear = currentNepaliYear;
        startMonth = currentNepaliMonth;
        startDay = 1; // First day of month
        break;
      case "year":
        startYear = currentNepaliYear;
        startMonth = 0; // Baisakh (first month in Nepali calendar)
        startDay = 1; // First day of year
        break;
      case "all":
      default:
        // If 'all', set filteredData to all data
        setFilteredIncomes(allIncomes);
        setFilteredExpenses(allExpenses);
        setFilteredGoals(allGoals);
        return;
    }

    // Filter incomes
    setFilteredIncomes(
      allIncomes.filter((income) => {
        try {
          // Convert stored English date to Nepali
          const nepaliDate = new NepaliDate(new Date(income.date));
          const nepaliYear = nepaliDate.getYear();
          const nepaliMonth = nepaliDate.getMonth();
          const nepaliDay = nepaliDate.getDate();

          // Compare dates
          if (nepaliYear > startYear) return true;
          if (nepaliYear < startYear) return false;
          if (nepaliMonth > startMonth) return true;
          if (nepaliMonth < startMonth) return false;
          return nepaliDay >= startDay;
        } catch (error) {
          console.error("Error converting date:", income.date, error);
          return false;
        }
      })
    );

    // Filter expenses
    setFilteredExpenses(
      allExpenses.filter((expense) => {
        try {
          // Convert stored English date to Nepali
          const nepaliDate = new NepaliDate(new Date(expense.date));
          const nepaliYear = nepaliDate.getYear();
          const nepaliMonth = nepaliDate.getMonth();
          const nepaliDay = nepaliDate.getDate();

          // Compare dates
          if (nepaliYear > startYear) return true;
          if (nepaliYear < startYear) return false;
          if (nepaliMonth > startMonth) return true;
          if (nepaliMonth < startMonth) return false;
          return nepaliDay >= startDay;
        } catch (error) {
          console.error("Error converting date:", expense.date, error);
          return false;
        }
      })
    );

    // Filter goals
    setFilteredGoals(
      allGoals.filter((goal) => {
        try {
          // Convert stored English date to Nepali
          const nepaliDate = new NepaliDate(new Date(goal.date));
          const nepaliYear = nepaliDate.getYear();
          const nepaliMonth = nepaliDate.getMonth();
          const nepaliDay = nepaliDate.getDate();

          // Compare dates
          if (nepaliYear > startYear) return true;
          if (nepaliYear < startYear) return false;
          if (nepaliMonth > startMonth) return true;
          if (nepaliMonth < startMonth) return false;
          return nepaliDay >= startDay;
        } catch (error) {
          console.error("Error converting date:", goal.date, error);
          return false;
        }
      })
    );
  };

  // Use filtered data for calculations
  const totals = {
    income: filteredIncomes.reduce((sum, income) => sum + income.amount, 0),
    expenses: filteredExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    ),
    savings: filteredGoals.reduce(
      (sum, goal) => sum + (goal.current_amount || 0),
      0
    ),
    remaining:
      filteredIncomes.reduce((sum, income) => sum + income.amount, 0) -
      filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0) -
      filteredGoals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0),
  };

  const overallData = [
    totals.income,
    totals.expenses,
    totals.savings,
    totals.remaining,
  ];

  const calculatePeriodTotals = () => {
    const currentNepaliDate = new NepaliDate(new Date());
    const currentYear = currentNepaliDate.getYear();
    const currentMonth = currentNepaliDate.getMonth();

    // Get start of current week in Nepali calendar
    const startOfWeek = new NepaliDate(new Date());
    startOfWeek.setDate(
      currentNepaliDate.getDate() - currentNepaliDate.getDay()
    );

    const calculateTotal = (items, date) => {
      try {
        const nepaliDate = new NepaliDate(new Date(date));
        return (
          nepaliDate.getYear() === currentYear && // Same year
          nepaliDate.getMonth() === currentMonth && // Same month
          nepaliDate.getDate() >= startOfWeek.getDate() // Same or later than start of week
        );
      } catch (error) {
        console.error("Error converting date:", date, error);
        return false;
      }
    };

    // Calculate weekly totals
    const weeklyIncome = incomes.reduce(
      (sum, income) =>
        sum + (calculateTotal(incomes, income.date) ? income.amount : 0),
      0
    );
    const weeklyExpense = expenses.reduce(
      (sum, expense) =>
        sum + (calculateTotal(expenses, expense.date) ? expense.amount : 0),
      0
    );
    const weeklySavings = goals.reduce(
      (sum, goal) =>
        sum + (calculateTotal(goals, goal.date) ? goal.current_amount || 0 : 0),
      0
    );
    const weeklyProfit = weeklyIncome - weeklyExpense - weeklySavings;

    const monthlyIncome = incomes.reduce((sum, income) => {
      try {
        const nepaliDate = new NepaliDate(new Date(income.date));
        return (
          sum +
          (nepaliDate.getYear() === currentYear &&
          nepaliDate.getMonth() === currentMonth
            ? income.amount
            : 0)
        );
      } catch (error) {
        console.error("Error converting date:", income.date, error);
        return sum;
      }
    }, 0);

    // Updated data array to show income, expenses, savings, and profit by Nepali calendar
    return [weeklyIncome, monthlyIncome, weeklyProfit];
  };

  const periodTotals = calculatePeriodTotals();

  const getDailyData = () => {
    // Get the full date range covering both incomes and expenses
    const allDates = [...filteredIncomes, ...filteredExpenses].map(
      (item) => new Date(item.date)
    );

    if (allDates.length === 0) {
      return {
        labels: [],
        incomeData: [],
        expenseData: [],
        dates: [],
      };
    }

    const startDate = dayjs(Math.min(...allDates));
    const endDate = dayjs(Math.max(...allDates));

    const dailyData = {};

    // Initialize dates
    for (let d = startDate; d.isSameOrBefore(endDate); d = d.add(1, "day")) {
      const dateStr = d.format("YYYY-MM-DD");
      dailyData[dateStr] = {
        income: 0,
        expense: 0,
        dayName: d.format("dddd"),
      };
    }

    // Aggregate incomes
    filteredIncomes.forEach((income) => {
      const dateStr = dayjs(income.date).format("YYYY-MM-DD");
      if (dailyData[dateStr]) {
        dailyData[dateStr].income += income.amount;
      }
    });

    // Aggregate expenses
    filteredExpenses.forEach((expense) => {
      const dateStr = dayjs(expense.date).format("YYYY-MM-DD");
      if (dailyData[dateStr]) {
        dailyData[dateStr].expense += expense.amount;
      }
    });

    return {
      labels: Object.values(dailyData).map((d) => d.dayName),
      incomeData: Object.values(dailyData).map((d) => d.income),
      expenseData: Object.values(dailyData).map((d) => d.expense),
      dates: Object.keys(dailyData),
    };
  };

  const getMonthlyData = () => {
    const months = getMonthArray(isNepaliCalendar);
    const monthlyIncomes = Array(12).fill(0);
    const monthlyExpenses = Array(12).fill(0);

    filteredIncomes.forEach((income) => {
      try {
        const month = isNepaliCalendar
          ? new NepaliDate(new Date(income.date)).getMonth()
          : new Date(income.date).getMonth();
        monthlyIncomes[month] += income.amount;
      } catch (error) {
        console.error("Error processing date:", income.date, error);
      }
    });

    filteredExpenses.forEach((expense) => {
      try {
        const month = isNepaliCalendar
          ? new NepaliDate(new Date(expense.date)).getMonth()
          : new Date(expense.date).getMonth();
        monthlyExpenses[month] += expense.amount;
      } catch (error) {
        console.error("Error processing date:", expense.date, error);
      }
    });

    return {
      labels: months,
      incomeData: monthlyIncomes,
      expenseData: monthlyExpenses,
    };
  };

  const dailyChartData = getDailyData();
  const monthlyData = getMonthlyData();

  const handleExportData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/export/data", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `financial_data_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case "today":
        return "Today's";
      case "week":
        return "This Week's";
      case "month":
        return "This Month's";
      case "year":
        return "This Year's";
      case "all":
      default:
        return "All Time";
    }
  };

  return (
    <>
      <div
        className='dashboard'
        id='dashboard-content'
      >
        <div className='dashboard-header'>
          <h1>Dashboard</h1>
          <div className='dashboard-controls'>
            <div className='time-period-selector'>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className='time-filter'
              >
                <option value='today'>Today</option>
                <option value='week'>This Week</option>
                <option value='month'>This Month</option>
                <option value='year'>This Year</option>
                <option value='all'>All Time</option>
              </select>
            </div>

            <button
              onClick={handleExportData}
              className='export-btn'
            >
              Export Data
            </button>
            <CalendarSwitcher
              isNepali={isNepaliCalendar}
              onToggle={() => setIsNepaliCalendar(!isNepaliCalendar)}
            />
          </div>
        </div>

        <div className='dashboardMain'>
          <TotalResult
            data={overallData}
            type='overall'
            timePeriod={timePeriod}
          />

          <LineChartContainer
            showBoth={true}
            chartData={getDailyData()}
            isNepaliCalendar={isNepaliCalendar}
          />
          <div className='secondaryContainer'>
            <ExpenseList
              data={filteredExpenses.slice(0, 5)}
              showControls={false}
              isNepaliCalendar={isNepaliCalendar}
            />
            <PieChartContainer
              type='pie'
              totalIncome={totals.income}
              totalExpenses={totals.expenses}
              totalSavings={totals.savings}
            />
          </div>
          <div className='secondaryContainer'>
            <PieChartContainer
              type='bar'
              monthlyData={monthlyData}
              isNepaliCalendar={isNepaliCalendar}
            />
            <ExpenseList
              data={filteredIncomes.slice(0, 5)}
              showControls={false}
              isNepaliCalendar={isNepaliCalendar}
            />
          </div>
        </div>
      </div>
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='dark'
      />
    </>
  );
};

export default Dashboard;
