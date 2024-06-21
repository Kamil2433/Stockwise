import styles from "./navbar.module.css";
import { useState } from "react";
import { PieChartJS } from "./Piechar";
import { Chart, ArcElement } from "chart.js";
import { ClipLoader } from "react-spinners";
import BarChart from "./Bargraph";
import LineGraph from "./Linechart";

export default function Dashboard() {
  const [investmentAmount, setInvestmentamount] = useState("");
  const [returnamount, setreturnamount] = useState("");
  const [currentage, setcurrentage] = useState("");
  const [risk, setrisk] = useState("");
  const [retireage, setretireage] = useState("");
  const [inflation, setinflation] = useState(0);
  const [bardata, setbardata] = useState("");
  const [selectedOption, setselectedoption] = useState();
  const [options, setoptions] = useState();
  // const [loadingdata, setload] = useState(false);
  // const returnsip = useRef();
  // const [viewrisk, setviewrisk] = useState(false);
  const [riskoptions, setriskoption] = useState([
    "Conservative",
    "Balanced",
    "Growth",
    "Aggressive",
  ]);
  const [stock, setstock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [piedata, setpiedata] = useState([]);
  const [selecteddata, setselecteddata] = useState([]);
  const [investmentType, setInvestmentType] = useState("sip");
  const [linegraphdata, setlinegraphdata] = useState();
  const [predictions, setpredictions] = useState();
  // const [portfolioreturn, setportfolioreturn] = useState(0);

  Chart.register(ArcElement);

  const handleretireage = async (value) => {
    setretireage(value);

    setriskoption(["Conservative", "Balanced", "Growth", "Aggressive"]);

    if (value - currentage <= 10) {
      setrisk("Growth");
    } else if (retireage - currentage < 70) {
      setrisk("Balanced");
    }
  };

  const onChangeoption = (e) => {
    setlinegraphdata(predictions[e.target.value]);
  };

  function calculateSIPFutureValue(
    imonthlyInstallment,
    iannualReturnRate,
    iyears
  ) {
    let monthlyInstallment = Number(imonthlyInstallment);
    let annualReturnRate = Number(iannualReturnRate);
    let years = Number(iyears);

    // Convert annual return rate to a monthly rate
    let monthlyRate = annualReturnRate / 12 / 100;

    // Calculate the total number of installments
    let totalMonths = years * 12;

    // Calculate the future value using the compound interest formula for SIP
    let futureValue = monthlyInstallment * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate * (1 + monthlyRate);

    return futureValue.toFixed(2);
  }

  const handleInflationChange = (e) => {
    setinflation(e.target.value);
  };

  async function getProphetPredictions(inputdata, year) {
    const companynames = inputdata.map((prediction) =>
      prediction.stock.replace(".csv", "")
    );
    setoptions(companynames);

    const url = "http://localhost:3000/get_prophet_predictions";
    const data = {
      company_names: companynames,
      year: year,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const predictions = await response.json();
      setpredictions(predictions);
      setlinegraphdata(predictions[companynames[0]]);
      console.log(predictions);
      return predictions;
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  }

  const calcpiedata = async (data) => {
    // Calculate the inverse of risk for each stock
    const inverseRiskData = data.map((item) => ({
      ...item,
      inverseRisk: 1 / item.risk,
    }));

    // Calculate the total of inverse risks
    const totalInverseRisk = inverseRiskData.reduce(
      (sum, item) => sum + item.inverseRisk,
      0
    );

    // Calculate the percentage based on the inverse risk
    const result = inverseRiskData.map((item) => ({
      stock: item.stock.replace(".csv", ""),
      percentage: (item.inverseRisk / totalInverseRisk) * 100,
      return: item.average_return,
    }));

    setpiedata(result);

    setTimeout(function () {
      // Code to be executed after the timeout
      console.log("Function continued after 2 seconds!");
    }, 2000);

    // let ans;
    // if (investmentType === "sip") {
    //   ans = await calculateTotalReturnportfolio(
    //     investmentAmount*12*(retireage - currentage),
    //     retireage - currentage
    //   );
    //   setportfolioreturn(ans);
    // } else {
    //   ans = await calculateTotalReturnportfolio(
    //     investmentAmount,
    //     retireage - currentage
    //   );
    //   setportfolioreturn(ans);
    // }

    // return result;
  };


  const getcalculateReturnAmount=(inv,returnper,years)=>{
if(investmentType==='sip'){
  return calculateSIPFutureValue(inv,returnper,years);
}else{
  return calculateReturnAmount(inv,returnper,years);
}


  }


  function calculateTotalReturnportfolio(inputinv, years) {
    let investment = Number(inputinv);
    let totalReturn = 0;

    piedata.forEach((stock) => {
        console.log(stock)
        let investmentForStock = investment * (stock.percentage/ 100);
        let stockReturn = calculateReturnAmount(investmentForStock, stock.return, years);
        console.log("return for-",stock.stock,stockReturn)
        totalReturn += stockReturn;
    });

    let oneyearreturn = totalReturn / years;
    let oneyearinflation = oneyearreturn * (inflation / 100);
    let oneyearadjustment = oneyearreturn - oneyearinflation;
    let totaloutcome = oneyearadjustment * years;

    // let adjustedTotalReturn = totalReturn / Math.pow(1 + inflation / 100, years);

    // setportfolioreturn(totalReturn.toFixed(2));
    return totaloutcome.toFixed(2);
  }

  function calculateTotalReturnSIPPortfolio(monthlyInstallment, years) {
    let totalReturn = 0;

    piedata.forEach((stock) => {
        console.log(stock);
        let monthlyInvestmentForStock = monthlyInstallment * (stock.percentage / 100);
        console.log("this is monthly inv stck-",monthlyInvestmentForStock)
        let stockReturn = calculateSIPFutureValue(monthlyInvestmentForStock, stock.return, years);
        console.log("return for-", stock.stock, stockReturn);
        totalReturn += stockReturn;
    });

    totalReturn = Number(totalReturn); // Ensure totalReturn is a number
    return totalReturn;
}


  function calculateAnnualReturn(initialInvestment, totalReturn, years) {
    // Ensure the inputs are valid numbers and years is greater than 0
    if (initialInvestment <= 0 || totalReturn <= 0 || years <= 0) {
      throw new Error(
        "Invalid input values. Make sure all values are positive and years is greater than 0."
      );
    }

    // Calculate the CAGR
    const cagr =
      (Math.pow(totalReturn / initialInvestment, 1 / years) - 1) * 100;

    return cagr.toFixed(2); // Return the result rounded to 2 decimal places
  }

  function calculateReturnAmount(principal, averageReturn, years) {
    principal = Number(principal);
    averageReturn = Number(averageReturn);
    years = Number(years);

    // Convert the average return from percentage to a decimal
    const rate = averageReturn / 100;

    // Calculate the future value using the compound interest formula
    const futureValue = principal * Math.pow((1 + rate), years);
    console.log("Future value:", futureValue);

    return futureValue;
  }

  const addselecteddata = (item) => {
    const updatedArray = [...selecteddata, item];
    setselecteddata(updatedArray);
    calcpiedata(updatedArray);
  };

  const removeselecteddata = (itemToRemove) => {
    const updatedArray = selecteddata.filter(
      (item) => item.stock !== itemToRemove.stock
    );
    setselecteddata(updatedArray);
    calcpiedata(updatedArray);
  };

  const fetchstocks = async () => {
    // setload(true);
    setLoading(true);

    if (currentage >= retireage) {
      setLoading(false);

      alert("Current Age cannot be greater than Retire age");
      return;
    }

    if (currentage < 18) {
      setLoading(false);

      alert("Current Age cannot be less than 18");
      return;
    }

    if (currentage > 100 || retireage > 100) {
      setLoading(false);

      alert("Age Values cannot be more than 100");
      return;
    }

    const expectedreturn = await calculateAnnualReturn(
      investmentAmount,
      returnamount,
      retireage - currentage
    );
    let riskapetite;
    if (risk == "Aggressive") {
      riskapetite = 100;
    } else if (risk == "Growth") {
      riskapetite = 70;
    } else if (risk == "Balanced") {
      riskapetite = 50;
    } else {
      riskapetite = 20;
    }

    const url = "http://localhost:3000/get_top_stocks"; // URL of the local server

    // Data to be sent in the POST request
    const data = {
      expected_return: expectedreturn,
      expected_risk: riskapetite,
    };

    const currentDate = new Date();

    // Get the current year
    const currentYear = currentDate.getFullYear();

    const predictionyear = currentYear + (retireage - currentage);

    try {
      // Send POST request to the server
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Specify the content type
        },
        body: JSON.stringify(data), // Convert the data to a JSON string
      });

      // Check if the response is successful
      if (!response.ok) {
        setLoading(false);

        throw new Error(`Server error: ${response.statusText}`);
      }

      // Parse the response data
      const responseData = await response.json();
      getProphetPredictions(responseData, predictionyear);
      setselecteddata(responseData);
      calcpiedata(responseData);
      setbardata(responseData);
      // responseData.sort((a, b) => b.average_return - a.average_return);
      setstock(responseData);

      // Log the response data (or handle it as needed)
      console.log("Response data:", responseData);
      setLoading(false);
      return responseData; // Return the response data
    } catch (error) {
      setLoading(false);

      // Handle any errors that occur
      console.error("Fetch error:", error);
      throw error; // Rethrow the error if needed
    }
  };

  const isSelected = (stock) => {
    return selecteddata.some(
      (selectedStock) => selectedStock.stock === stock.stock
    );
  };

  const handleRiskChange = (e) => {
    setrisk(e.target.value);
    fetchstocks();
  };

  const handleInvestmentTypeChange = (e) => {
    setInvestmentType(e.target.value);
  };

  return (
    <div style={{ width: "100%" }}>
      <div className={styles.header}>
        <div className={styles.logo}>
          {" "}
          <i className="fa-solid fa-arrow-trend-up fa-lg"></i> AI Stock
          Allocation Engine
        </div>
      </div>
      {/* form-- */}
      <div className={styles.maindiv}>
        <div
          className={stock[0] ? "" : styles.formb}
          style={{
            backgroundColor: "#d0efff",
            width: "103%",
            padding: "2px",
            border: "2px solid #d0efff",
            borderRadius: "5px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              marginBottom: "20px",
              marginLeft: stock[0] ? "12%" : "12%",
              height: "10vh",
            }}
          >
            <label style={{ marginLeft: "20px" }}>
              <input
                type="radio"
                value="sip"
                checked={investmentType === "sip"}
                onChange={handleInvestmentTypeChange}
              />
              SIP (Systematic Investment Plan)
            </label>
            <label style={{ marginLeft: "5vw" }}>
              <input
                type="radio"
                value="one-time"
                checked={investmentType === "one-time"}
                onChange={handleInvestmentTypeChange}
              />
              One-time Investment
            </label>
          </div>
          <div className={styles.formdiv}>
            <label>
              {investmentType === "one-time"
                ? "Investment Amount(₹): "
                : " Monthly SIP Installment(₹)"}
              <input
                type="number"
                name="investmentAmount"
                value={investmentAmount}
                onChange={(e) => setInvestmentamount(e.target.value)}
                required
              />
            </label>

            <label>
              Expected Return Amount(₹):
              <input
                type="number"
                name="Expected Return"
                value={returnamount}
                onChange={(e) => setreturnamount(e.target.value)}
                required
              />
            </label>
          </div>
          <div className={styles.formdiv}>
            <label style={{ marginRight: "3vw", paddingLeft: "6.5vw" }}>
              Current Age:
              <input
                type="number"
                name="currentAge"
                value={currentage}
                style={{ marginLeft: "10px" }}
                onChange={(e) => setcurrentage(e.target.value)}
                required
              />
            </label>

            <label style={{ marginRight: "2vw" }}>
              Retirement Age:
              <input
                type="number"
                name="retireage"
                value={retireage}
                onChange={(e) => handleretireage(e.target.value)}
                required
              />
            </label>
          </div>
          <div
            className={styles.risk}
            style={{
              marginLeft: stock[0] ? "21vw" : "21vw",
              marginTop: "3vh",
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "18vw",
            }}
          >
            <label style={{ marginRight: "2vw", marginLeft: "1vw" }}>
              <span> Your Risk Profile:</span>

              <select name="risk" value={risk} onChange={handleRiskChange}>
                {riskoptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ marginRight: "2vw", marginLeft: "1vw" }}>
              <span>Inflation:</span>
              <select
                name="inflation"
                value={inflation}
                onChange={handleInflationChange}
              >
                {Array.from({ length: 10 }, (_, i) => i ).map((option) => (
                  <option key={option} value={option}>
                    {option}%
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              style={{ backgroundColor: "#b8bdc2", marginTop: "2vh" }}
              onClick={fetchstocks}
            >
              Next
            </button>
          </div>
        </div>

        {loading && (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: piedata[0] ? "" : "",
              marginTop: piedata[0] ? "" : "43vh",
            }}
          >
            <ClipLoader color="#3498db" loading={loading} size={50} />
          </div>
        )}

        {/* </div> */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
          }}
        >
          <div style={{ width: "53%" }}>
            {stock[0] && (
              <div style={{ marginLeft: "7vw" }}>
                {" "}
                <h2> Top 6 Stocks for You-</h2>
              </div>
            )}
            {stock[0] && (
              <div className={styles.stocklist}>
                {stock.map((stock, index) => (
                  <div className={styles.stockitem} key={index}>
                    <a
                      href={`https://www.google.com/finance/quote/${stock.stock.replace(
                        ".csv",
                        ""
                      )}:NSE`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "blue" }}
                    >
                      <div className={styles.stockname}>
                        {stock.stock.replace(".csv", "")}
                        <i
                          style={{ marginTop: "2px" }}
                          className="fa-solid fa-arrow-up-right-from-square"
                          href={`https://www.google.com/finance/quote/${stock.stock.replace(
                            ".csv",
                            ""
                          )}:NSE`}
                          target="_blank"
                          rel="noopener noreferrer"
                        ></i>
                      </div>
                    </a>
                    <div>
                      <div className={styles.stockreturn}>
                        Annual Return: {stock.average_return.toFixed(2)}%
                      </div>
                      <div className={styles.stockreturn}>
                        Expected Return:{" "}
                        {investmentType === "one-time"
                          ? calculateReturnAmount(
                              investmentAmount,
                              stock.average_return.toFixed(2),
                              retireage - currentage
                            ).toFixed(2)
                          : calculateReturnAmount(
                            investmentAmount*12*(retireage-currentage),
                              stock.average_return.toFixed(2),
                              1
                            )*retireage-currentage}
                        <div
                          style={{
                            display: "flex",
                            float: "right",
                            marginLeft: "3vw",
                          }}
                        >
                          <span>Add to Portfolio </span>{" "}
                          <input
                            type="checkbox"
                            value={stock.stock}
                            checked={isSelected(stock)}
                            onChange={() => {
                              const isChecked = isSelected(stock);
                              if (isChecked) {
                                removeselecteddata(stock);
                              } else {
                                addselecteddata(stock);
                              }
                            }}
                            className={styles.biggerCheckbox}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}{" "}
          </div>
          {piedata.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "35vw",
                height: "40vh",
                marginLeft: "7vw",
                marginTop: "13vh",
              }}
            >
              <div
                style={{
                  border: "2px solid rgb(202, 202, 240)",
                  borderRadius: "4px",
                  padding: "2px",
                  width: "100%",
                }}
              >
                <>
                  Total Return on Portfolio (₹):
                  <span>
                    {investmentType === "sip"
                      ? 
                     calculateTotalReturnportfolio(
                            investmentAmount*12*(retireage-currentage),
                            1
                          )*retireage-currentage
                        : calculateTotalReturnportfolio(
                          investmentAmount,
                          retireage - currentage
                        )}
                  </span>{" "}
                </>
              </div>
              <div style={{ height: "49vh", width: "100%" }}>
                <PieChartJS chartData={piedata} />{" "}
              </div>

              {/* <CustomLegend chartData={piedata} /> */}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          height: "70vh",
          width: "90vw",
          marginTop: "5vh",
          marginLeft: "5vw",
        }}
      >
        {bardata ? <BarChart data={bardata} /> : ""}
      </div>
      {linegraphdata && (
        <div
          style={{
            height: "70vh",
            width: "90vw",
            marginTop: "5vh",
            marginLeft: "5vw",
            border: "2px solid rgb(202, 202, 240)",
          }}
        >
          <h2>Browse Prophet Predictions</h2>{" "}
          <select value={selectedOption} onChange={onChangeoption}>
            {options &&
              options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>
          {linegraphdata ? (
            <div style={{ height: "50vh", width: "100%" }}>
              {" "}
              <LineGraph data={linegraphdata} name={selectedOption} />
            </div>
          ) : (
            "This is line div"
          )}
        </div>
      )}
    </div>
  );
}
