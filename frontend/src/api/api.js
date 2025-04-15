import axios from "axios";

const BASE_URL = "http://localhost:8000";

export const getAllExpenses = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/expense/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
};

export const getExpenseById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/expense/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expense:", error);
    throw error;
  }
};

export const createExpense = async (expense) => {
  try {
    const response = await axios.post(`${BASE_URL}/expense/`, expense);
    return response.data;
  } catch (error) {
    console.error("Error creating expense:", error);
    throw error;
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/expense/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};

export const addExpense = async (expense) => {
  try {
    const response = await axios.post(`${BASE_URL}/expense/`, expense);
    return response.data;
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
};

export const getAllIncomes = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/income/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching incomes:", error);
    throw error;
  }
};

export const getIncomeById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/income/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching income:", error);
    throw error;
  }
};

export const createIncome = async (income) => {
  try {
    const response = await axios.post(`${BASE_URL}/income/`, income);
    return response.data;
  } catch (error) {
    console.error("Error creating income:", error);
    throw error;
  }
};

export const deleteIncome = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/income/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting income:", error);
    throw error;
  }
};

export const getAllGoals = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/goal/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching goals:", error);
    throw error;
  }
};

export const getGoalById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/goal/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching goal:", error);
    throw error;
  }
};

export const createGoal = async (goal) => {
  try {
    console.log("Creating goal with data:", goal); // Add debug log
    const response = await axios.post(`${BASE_URL}/goal/`, goal);
    return response.data;
  } catch (error) {
    console.error("Error creating goal:", error.response?.data || error); // Improved error logging
    throw error;
  }
};

export const deleteGoal = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/goal/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting goal:", error);
    throw error;
  }
};

export const addGoalProgress = async (goalId, progress) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/goal/${goalId}/progress`,
      progress
    );
    return response.data;
  } catch (error) {
    console.error("Error adding goal progress:", error);
    throw error;
  }
};
