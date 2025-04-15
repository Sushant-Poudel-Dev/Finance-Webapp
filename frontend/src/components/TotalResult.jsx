import useCountAnimation from "../hooks/useCountAnimation";

const TotalResult = ({ data, type = "overall" }) => {
  const getTitles = () => {
    switch (type) {
      case "savings":
        return ["This Week", "This Month", "This Year"];
      case "expense":
      case "income":
        return ["Today", "This Week", "This Month"];
      case "finance": // New type for financial overview
        return ["Weekly Income", "Monthly Income", "Profit"];
      case "overall":
        return ["Total Income", "Total Expenses", "Total Savings", "Remaining"];
      default:
        return ["Income", "Expenses", "Remaining"];
    }
  };

  const getContainerClass = () => {
    return type === "finance" ? "totalResult finance-grid" : "totalResult";
  };

  const titles = getTitles();
  const values = data || Array(titles.length).fill(0);

  return (
    <div className={getContainerClass()}>
      {values.map((value, index) => (
        <div
          key={titles[index]}
          className='total-item'
        >
          <h1>{useCountAnimation(value || 0)}</h1>
          <p>{titles[index]}</p>
        </div>
      ))}
    </div>
  );
};

export default TotalResult;
