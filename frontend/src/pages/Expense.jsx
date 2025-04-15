import LineChartContainer from "../components/LineChartContainer";
import TotalResult from "../components/TotalResult";
import ExpenseList from "../components/ExpenseList";
import { useEffect, useState } from "react";
import { getAllExpenses } from "../api/api";
import dayjs from "dayjs"; // Import dayjs
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"; // Import plugins
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import NepaliDate from "nepali-date-converter";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [isNepaliCalendar, setIsNepaliCalendar] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchExpenses = async () => {
      try {
        const response = await getAllExpenses();
        setExpenses(response);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, []);

  // Helper functions to filter expenses with calendar type support
  const getTodayExpenses = () => {
    if (isNepaliCalendar) {
      // Filter by Nepali date
      const currentNepaliDate = new NepaliDate();
      const currentYear = currentNepaliDate.getYear();
      const currentMonth = currentNepaliDate.getMonth();
      const currentDay = currentNepaliDate.getDate();

      return expenses.filter((expense) => {
        try {
          const expenseDate = new NepaliDate(new Date(expense.date));
          return (
            expenseDate.getYear() === currentYear &&
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getDate() === currentDay
          );
        } catch (error) {
          console.error("Error converting date:", expense.date, error);
          return false;
        }
      });
    } else {
      // Filter by English date
      const today = dayjs().format("YYYY-MM-DD");
      return expenses.filter((expense) => expense.date.startsWith(today));
    }
  };

  const getThisWeekExpenses = () => {
    if (isNepaliCalendar) {
      // Filter by Nepali week
      const currentNepaliDate = new NepaliDate();
      const currentYear = currentNepaliDate.getYear();
      const currentMonth = currentNepaliDate.getMonth();
      const currentDay = currentNepaliDate.getDate();
      const currentDayOfWeek = currentNepaliDate.getDay();

      // Calculate start of week (Sunday)
      const startOfWeek = new NepaliDate(
        currentYear,
        currentMonth,
        currentDay - currentDayOfWeek
      );

      return expenses.filter((expense) => {
        try {
          const expenseDate = new NepaliDate(new Date(expense.date));

          if (expenseDate.getYear() < startOfWeek.getYear()) return false;
          if (expenseDate.getYear() > currentNepaliDate.getYear()) return true;

          if (
            expenseDate.getMonth() < startOfWeek.getMonth() &&
            expenseDate.getYear() === startOfWeek.getYear()
          )
            return false;
          if (
            expenseDate.getMonth() > currentNepaliDate.getMonth() &&
            expenseDate.getYear() === currentNepaliDate.getYear()
          )
            return true;

          if (
            expenseDate.getMonth() === startOfWeek.getMonth() &&
            expenseDate.getYear() === startOfWeek.getYear() &&
            expenseDate.getDate() < startOfWeek.getDate()
          )
            return false;

          if (
            expenseDate.getMonth() === currentNepaliDate.getMonth() &&
            expenseDate.getYear() === currentNepaliDate.getYear() &&
            expenseDate.getDate() > currentNepaliDate.getDate()
          )
            return false;

          return true;
        } catch (error) {
          console.error("Error converting date:", expense.date, error);
          return false;
        }
      });
    } else {
      // Filter by English week
      const startOfWeek = dayjs().startOf("week");
      const endOfWeek = dayjs().endOf("week");
      return expenses.filter(
        (expense) =>
          dayjs(expense.date).isSameOrAfter(startOfWeek, "day") &&
          dayjs(expense.date).isSameOrBefore(endOfWeek, "day")
      );
    }
  };

  const getThisMonthExpenses = () => {
    if (isNepaliCalendar) {
      // Filter by Nepali month
      const currentNepaliDate = new NepaliDate();
      const currentYear = currentNepaliDate.getYear();
      const currentMonth = currentNepaliDate.getMonth();

      return expenses.filter((expense) => {
        try {
          const expenseDate = new NepaliDate(new Date(expense.date));
          return (
            expenseDate.getYear() === currentYear &&
            expenseDate.getMonth() === currentMonth
          );
        } catch (error) {
          console.error("Error converting date:", expense.date, error);
          return false;
        }
      });
    } else {
      // Filter by English month
      const startOfMonth = dayjs().startOf("month");
      const endOfMonth = dayjs().endOf("month");
      return expenses.filter(
        (expense) =>
          dayjs(expense.date).isSameOrAfter(startOfMonth, "day") &&
          dayjs(expense.date).isSameOrBefore(endOfMonth, "day")
      );
    }
  };

  // Organize expense data by month
  const getMonthlyData = () => {
    const monthlyData = Array(12).fill(0);
    expenses.forEach((expense) => {
      try {
        const month = isNepaliCalendar
          ? new NepaliDate(new Date(expense.date)).getMonth()
          : dayjs(expense.date).month();
        monthlyData[month] += expense.amount;
      } catch (error) {
        console.error("Error processing month data:", error);
      }
    });
    return monthlyData;
  };

  // Organize expense data by days
  const getDailyData = () => {
    const sortedExpenses = [...expenses].sort((a, b) =>
      dayjs(a.date).diff(dayjs(b.date))
    );
    const dailyData = {};

    // Get date range
    if (expenses.length === 0) {
      return {
        labels: [],
        expenseData: [],
        dates: [],
      };
    }

    // Initialize all dates with 0
    const startDate = dayjs(Math.min(...expenses.map((e) => new Date(e.date))));
    const endDate = dayjs(Math.max(...expenses.map((e) => new Date(e.date))));

    for (let d = startDate; d.isSameOrBefore(endDate); d = d.add(1, "day")) {
      const dateStr = d.format("YYYY-MM-DD");
      dailyData[dateStr] = {
        amount: 0,
        dayName: d.format("dddd"),
      };
    }

    // Fill in actual data
    sortedExpenses.forEach((expense) => {
      const dateStr = dayjs(expense.date).format("YYYY-MM-DD");
      if (dailyData[dateStr]) {
        dailyData[dateStr].amount += expense.amount;
      }
    });

    return {
      labels: Object.values(dailyData).map((d) => d.dayName),
      expenseData: Object.values(dailyData).map((d) => d.amount),
      dates: Object.keys(dailyData),
    };
  };

  // Calculate totals
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const todayExpenses = getTodayExpenses().reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const thisWeekExpenses = getThisWeekExpenses().reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const thisMonthExpenses = getThisMonthExpenses().reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <>
      <div className='expensePage'>
        <div className='expense-header'>
          <h1>Expenses</h1>
        </div>
        <LineChartContainer
          type='expense'
          chartData={getDailyData()}
          isNepaliCalendar={isNepaliCalendar}
        />
        <TotalResult
          data={[todayExpenses, thisWeekExpenses, thisMonthExpenses]} // Pass the calculated totals
          type='expense'
        />
        <ExpenseList
          data={expenses}
          isNepaliCalendar={isNepaliCalendar}
        />
      </div>
    </>
  );
};

export default Expense;
