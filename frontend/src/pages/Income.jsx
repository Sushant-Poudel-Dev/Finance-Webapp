import LineChartContainer from "../components/LineChartContainer";
import TotalResult from "../components/TotalResult";
import ExpenseList from "../components/ExpenseList";
import CalendarSwitcher from "../components/CalendarSwitcher";
import { useEffect, useState } from "react";
import { getAllIncomes } from "../api/api";
import dayjs from "dayjs"; // Import dayjs
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"; // Import plugins
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useCalendar } from "../context/CalendarContext";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const Income = () => {
  const { isNepaliCalendar, setIsNepaliCalendar } = useCalendar();
  const [incomes, setIncomes] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchIncomes = async () => {
      try {
        const response = await getAllIncomes();
        setIncomes(response);
      } catch (error) {
        console.error("Error fetching Incomes:", error);
      }
    };

    fetchIncomes();
  }, []);

  // Helper functions to filter incomes
  const getTodayIncome = () => {
    const today = dayjs().format("YYYY-MM-DD");
    return incomes.filter((income) => income.date === today);
  };

  const getThisWeekIncome = () => {
    const startOfWeek = dayjs().startOf("week").format("YYYY-MM-DD");
    const endOfWeek = dayjs().endOf("week").format("YYYY-MM-DD");
    return incomes.filter(
      (income) =>
        dayjs(income.date).isSameOrAfter(startOfWeek) &&
        dayjs(income.date).isSameOrBefore(endOfWeek)
    );
  };

  const getThisMonthIncome = () => {
    const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");
    return incomes.filter(
      (income) =>
        dayjs(income.date).isSameOrAfter(startOfMonth) &&
        dayjs(income.date).isSameOrBefore(endOfMonth)
    );
  };

  // Organize income data by month
  const getMonthlyData = () => {
    const monthlyData = Array(12).fill(0);
    incomes.forEach((income) => {
      const month = dayjs(income.date).month();
      monthlyData[month] += income.amount;
    });
    return monthlyData;
  };

  // Organize income data by days
  const getDailyData = () => {
    const sortedIncomes = [...incomes].sort((a, b) =>
      dayjs(a.date).diff(dayjs(b.date))
    );
    const dailyData = {};

    // Get date range
    const startDate = dayjs(Math.min(...incomes.map((i) => new Date(i.date))));
    const endDate = dayjs(Math.max(...incomes.map((i) => new Date(i.date))));

    // Initialize all dates with 0
    for (let d = startDate; d.isSameOrBefore(endDate); d = d.add(1, "day")) {
      const dateStr = d.format("YYYY-MM-DD");
      dailyData[dateStr] = {
        amount: 0,
        dayName: d.format("dddd"),
      };
    }

    // Fill in actual data
    sortedIncomes.forEach((income) => {
      const dateStr = dayjs(income.date).format("YYYY-MM-DD");
      if (dailyData[dateStr]) {
        dailyData[dateStr].amount += income.amount;
      }
    });

    return {
      labels: Object.values(dailyData).map((d) => d.dayName),
      incomeData: Object.values(dailyData).map((d) => d.amount),
      dates: Object.keys(dailyData),
    };
  };

  // Calculate totals
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const todayIncome = getTodayIncome().reduce(
    (sum, income) => sum + income.amount,
    0
  );
  const thisWeekIncome = getThisWeekIncome().reduce(
    (sum, income) => sum + income.amount,
    0
  );
  const thisMonthIncome = getThisMonthIncome().reduce(
    (sum, income) => sum + income.amount,
    0
  );

  return (
    <>
      <div className='expensePage'>
        <div className='expense-header'>
          <h1>Income</h1>
          <CalendarSwitcher
            isNepali={isNepaliCalendar}
            onToggle={() => setIsNepaliCalendar(!isNepaliCalendar)}
          />
        </div>
        <LineChartContainer
          type='income'
          chartData={getDailyData()}
        />
        <TotalResult
          data={[todayIncome, thisWeekIncome, thisMonthIncome]} // Pass the calculated totals
          type='income'
        />
        <ExpenseList
          data={incomes}
          isNepaliCalendar={isNepaliCalendar}
          showDelete={false}
          showControls={true}
        />
      </div>
    </>
  );
};

export default Income;
