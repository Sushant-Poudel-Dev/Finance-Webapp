import { useNavigate } from "react-router-dom";

const Intro = () => {
  const navigate = useNavigate();

  return (
    <div className='intro'>
      <div className='intro-content'>
        <h1>Welcome to BudgetTrace</h1>
        <p>Your personal finance companion</p>
        <div className='features'>
          <div className='feature'>
            <h3>Track Expenses</h3>
            <p>Monitor your daily spending and income with ease</p>
          </div>
          <div className='feature'>
            <h3>Set Goals</h3>
            <p>Plan and achieve your financial goals</p>
          </div>
          <div className='feature'>
            <h3>Visualize Data</h3>
            <p>View your finances through intuitive charts and graphs</p>
          </div>
        </div>
        <button onClick={() => navigate("/dashboard")}>Get Started</button>
      </div>
    </div>
  );
};

export default Intro;
