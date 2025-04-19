import ExpenseList from "../components/ExpenseList";
import CalendarSwitcher from "../components/CalendarSwitcher";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { deleteExpense, deleteIncome } from "../api/api";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  getAllExpenses,
  getAllIncomes,
  createExpense,
  createIncome,
} from "../api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCalendar } from "../context/CalendarContext";

const AddingPage = () => {
  const { isNepaliCalendar, setIsNepaliCalendar } = useCalendar();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);

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
    const fetchIncomes = async () => {
      try {
        const response = await getAllIncomes();
        setIncomes(response);
      } catch (error) {
        console.error("Error fetching incomes:", error);
      }
    };

    fetchIncomes();
    fetchExpenses();
  }, []);

  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    source: "",
    date: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Use the current date and time if no date is provided
      const now = dayjs();
      const currentDateTime = now.format("YYYY-MM-DD HH:mm");
      const dateToUse = formData.date
        ? dayjs(formData.date).format("YYYY-MM-DD HH:mm")
        : currentDateTime;

      if (formData.type === "expense") {
        const payload = {
          name: formData.source,
          amount: parseFloat(formData.amount),
          date: dateToUse,
        };
        console.log("Payload for expense:", payload);

        const newExpense = await createExpense(payload);
        console.log("Expense created:", newExpense);
        setExpenses((prevExpenses) => [newExpense, ...prevExpenses]);
        toast.success("Expense added successfully!");
      }
      if (formData.type === "income") {
        const payload = {
          name: formData.source,
          amount: parseFloat(formData.amount),
          date: dateToUse,
        };
        console.log("Payload for income:", payload);

        const newIncome = await createIncome(payload);
        console.log("Income created:", newIncome);
        setIncomes((prevIncomes) => [newIncome, ...prevIncomes]);
        toast.success("Income added successfully!");
      }

      // Reset the form after submission
      setFormData({
        type: "income",
        amount: "",
        source: "",
        date: "",
      });
    } catch (error) {
      console.error("Error submitting transaction:", error);
      toast.error("Failed to add transaction");
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense.id !== id)
      );
      toast.success("Expense deleted successfully!");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  const handleDeleteIncome = async (id) => {
    try {
      await deleteIncome(id);
      setIncomes((prevIncomes) =>
        prevIncomes.filter((income) => income.id !== id)
      );
      toast.success("Income deleted successfully!");
    } catch (error) {
      console.error("Error deleting income:", error);
      toast.error("Failed to delete income");
    }
  };

  return (
    <>
      <div className='addingPage'>
        <div className='addingPage-header'>
          <h1>Add Transaction</h1>
          <CalendarSwitcher
            isNepali={isNepaliCalendar}
            onToggle={() => setIsNepaliCalendar(!isNepaliCalendar)}
          />
        </div>
        <div className='formSection'>
          <div className='formContainer'>
            <div className='formHeader'>
              <div>
                <h3>New Transaction</h3>
                <p>Add your income or expense</p>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value='income'>Income</option>
                <option value='expense'>Expense</option>
              </select>
              <input
                type='text'
                placeholder='Source'
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
              />
              <input
                type='number'
                placeholder='Amount'
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={formData.date ? dayjs(formData.date) : null}
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      date: date ? date.format("YYYY-MM-DD HH:mm") : "",
                    })
                  }
                  format='YYYY-MM-DD HH:mm'
                  views={["year", "month", "day", "hours", "minutes"]}
                  ampm={false}
                  slotProps={{
                    textField: {
                      placeholder: "Select Date & Time",
                      className: "date-picker",
                    },
                  }}
                />
              </LocalizationProvider>
              <button type='submit'>Add Transaction</button>
            </form>
          </div>
        </div>
        <div className='listsContainer'>
          <ExpenseList
            data={incomes}
            isNepaliCalendar={isNepaliCalendar}
            showDelete={true}
            onDelete={(id) => handleDeleteIncome(id)} // Pass the correct id
          />
          <ExpenseList
            data={expenses}
            isNepaliCalendar={isNepaliCalendar}
            showDelete={true}
            onDelete={(id) => handleDeleteExpense(id)} // Pass the correct id
          />
        </div>
      </div>
      <ToastContainer
        position='top-right'
        theme='dark'
      />
    </>
  );
};

export default AddingPage;
