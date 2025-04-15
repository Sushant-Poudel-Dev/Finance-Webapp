import NepaliDate from "nepali-date-converter";

export const toNepaliDate = (englishDate) => {
  const date = new Date(englishDate);
  const nepaliDate = new NepaliDate(date);
  return nepaliDate.format("YYYY-MM-DD");
};

export const getNepaliMonthArray = () => {
  return [
    "Baisakh",
    "Jestha",
    "Ashar",
    "Shrawan",
    "Bhadra",
    "Ashwin",
    "Kartik",
    "Mangsir",
    "Poush",
    "Magh",
    "Falgun",
    "Chaitra",
  ];
};

export const getNepaliYear = () => {
  return new NepaliDate().getYear();
};

export const getCurrentNepaliMonth = () => {
  return new NepaliDate().getMonth();
};

export const formatNepaliAmount = (amount) => {
  return amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    style: "currency",
    currency: "NPR",
  });
};

export const formatDate = (date, isNepali = false) => {
  if (isNepali) {
    return toNepaliDate(date);
  }
  return new Date(date).toISOString().split("T")[0];
};

export const formatDateForDisplay = (date, isNepali) => {
  if (isNepali) {
    return toNepaliDate(date);
  }
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getMonthArray = (isNepali = false) => {
  if (isNepali) {
    return getNepaliMonthArray();
  }
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
};
