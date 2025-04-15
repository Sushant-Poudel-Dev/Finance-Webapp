import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <>
      <div className='sidebar'>
        <div className='sidebarHeader'>
          <h3>BudgetTrace</h3>
          <p>Plan your budget and record finances</p>
        </div>
        <div className='sidebarLinks'>
          <ul>
            <NavLink
              to='/dashboard'
              end
            >
              {({ isActive }) => (
                <li className={isActive ? "active" : ""}>Dashboard</li>
              )}
            </NavLink>
            <NavLink to='/dashboard/expense'>
              {({ isActive }) => (
                <li className={isActive ? "active" : ""}>Expense</li>
              )}
            </NavLink>
            <NavLink to='/dashboard/income'>
              {({ isActive }) => (
                <li className={isActive ? "active" : ""}>Income</li>
              )}
            </NavLink>
            <NavLink to='/dashboard/planner'>
              {({ isActive }) => (
                <li className={isActive ? "active" : ""}>Planner</li>
              )}
            </NavLink>
            <NavLink to='/dashboard/addingPage'>
              {({ isActive }) => (
                <li className={isActive ? "active" : ""}>Logger</li>
              )}
            </NavLink>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
