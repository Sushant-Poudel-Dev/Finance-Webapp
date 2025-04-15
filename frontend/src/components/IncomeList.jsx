const IncomeList = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No data available</p>; // Fallback for empty data
  }

  return (
    <div className='incomeList'>
      <h3>Income List</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.name}</td>
              <td>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncomeList;
