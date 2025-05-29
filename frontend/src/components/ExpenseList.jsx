import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import { formatNepaliAmount, toNepaliDate } from "../utils/dateConverter";
import dayjs from "dayjs";

const ExpenseList = ({
  data,
  showDelete = false,
  onDelete,
  showControls = true,
  isNepaliCalendar = true,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "descending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "ascending"
        ? "descending"
        : "ascending";
    setSortConfig({ key, direction });
  };

  const sortedList = [...data].sort((a, b) => {
    if (sortConfig.key === "date") {
      // Always sort using English dates since they are stored in that format
      const dateA = dayjs(a.date.split(" ")[0]);
      const dateB = dayjs(b.date.split(" ")[0]);
      const result = dateB.diff(dateA); // Default to newest first
      return sortConfig.direction === "ascending" ? -result : result;
    }

    const aValue = a[sortConfig.key]?.toString().toLowerCase() ?? "";
    const bValue = b[sortConfig.key]?.toString().toLowerCase() ?? "";

    if (sortConfig.direction === "ascending") {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const filteredList = sortedList.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Max number of page buttons to show
    const halfMaxPages = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1); // Always show the first page

      let startPage = Math.max(2, currentPage - halfMaxPages + 1);
      let endPage = Math.min(totalPages - 1, currentPage + halfMaxPages - 1);

      if (currentPage <= halfMaxPages) {
        endPage = maxPagesToShow - 2;
      } else if (currentPage > totalPages - halfMaxPages) {
        startPage = totalPages - maxPagesToShow + 3;
      }

      if (startPage > 2) {
        pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      pageNumbers.push(totalPages); // Always show the last page
    }
    return pageNumbers;
  };

  const formatData = (item) => {
    const [date, time] = item.date.split(" ");
    let formattedTime = "00:00";
    if (time) {
      // Take only hours and minutes from the time
      formattedTime = time.split(":").slice(0, 2).join(":");
    }

    // Convert date to Nepali if isNepaliCalendar is true
    const displayDate = isNepaliCalendar ? toNepaliDate(date) : date;

    return {
      ...item,
      displayDate,
      time: formattedTime,
      amount: formatNepaliAmount(item.amount),
    };
  };

  return (
    <div className='incomeList'>
      <div className='incomeListHeader'>
        <div>
          <h3>{data.length > 0 ? data[0].type : "Type"}</h3>
          <p>{data.length > 0 ? data[0].description : "No description"}</p>
        </div>
        {showControls && (
          <input
            type='text'
            placeholder='Search...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='searchInput'
          />
        )}
      </div>
      <table className='incomeTable'>
        <thead>
          <tr>
            <th onClick={() => handleSort("date")}>
              Date{" "}
              {sortConfig.key === "date" &&
                (sortConfig.direction === "ascending" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("name")}>
              Source{" "}
              {sortConfig.key === "name" &&
                (sortConfig.direction === "ascending" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("amount")}>
              Amount{" "}
              {sortConfig.key === "amount" &&
                (sortConfig.direction === "ascending" ? "↑" : "↓")}
            </th>
            {showDelete && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => {
            const formattedItem = formatData(item);
            return (
              <tr key={item.id || index}>
                <td className='date-cell'>
                  <div className='date-container'>
                    <span className='date'>{formattedItem.displayDate}</span>
                    <div className='time-popup'>
                      <span>{formattedItem.time}</span>
                    </div>
                  </div>
                </td>
                <td>
                  {formattedItem.name.charAt(0).toUpperCase() +
                    formattedItem.name.slice(1)}
                </td>
                <td>{formattedItem.amount}</td>
                {showDelete && (
                  <td>
                    <IconButton
                      onClick={() => onDelete(item.id)}
                      size='small'
                      className='delete-btn'
                    >
                      <DeleteIcon />
                    </IconButton>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {showControls && (
        <div className='pagination'>
          {getPageNumbers().map((number, index) => (
            <button
              key={index}
              onClick={() => typeof number === "number" && paginate(number)}
              className={currentPage === number ? "active" : ""}
              disabled={typeof number !== "number"}
            >
              {number}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
