import { useState } from "react";
import { Paper, IconButton, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DateRangeIcon from "@mui/icons-material/DateRange";

const BillReminder = () => {
  const [bills, setBills] = useState([
    {
      id: 1,
      name: "Electricity",
      amount: 2000,
      dueDate: "2024-03-25",
      isPaid: false,
    },
    {
      id: 2,
      name: "Internet",
      amount: 1500,
      dueDate: "2024-03-28",
      isPaid: false,
    },
  ]);

  const upcomingBills = bills.filter((bill) => !bill.isPaid);

  return (
    <Paper className='bill-reminder'>
      <div className='reminder-header'>
        <h3>Upcoming Bills</h3>
        <Badge
          badgeContent={upcomingBills.length}
          color='error'
        >
          <NotificationsIcon />
        </Badge>
      </div>
      <div className='bills-list'>
        {upcomingBills.map((bill) => (
          <div
            key={bill.id}
            className='bill-item'
          >
            <div className='bill-info'>
              <h4>{bill.name}</h4>
              <p>Rs. {bill.amount}</p>
            </div>
            <div className='due-date'>
              <DateRangeIcon />
              <span>{bill.dueDate}</span>
            </div>
          </div>
        ))}
      </div>
    </Paper>
  );
};

export default BillReminder;
