import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import axios from "axios";
import UserNavigation from "../components/UserNavigation";
import Footer from "../components/Footer";
import { default as Expense } from "../assets/images/Expenses.png";
import { default as IncomeIcon } from "../assets/images/incomeIcon.png";
import { default as moneyBagBlue } from "../assets/images/money-bag-blue.png";
import { Chart } from "chart.js/auto";

function getToken() {
  const tokenObj = JSON.parse(localStorage.getItem("token"));
  if (!tokenObj) {
    return null;
  }

  const currentTime = new Date().getTime();
  if (currentTime > tokenObj.expires) {
    localStorage.removeItem("token"); // Remove expired token
    return null;
  }

  return tokenObj.value; // Return the token if it hasn't expired
}

const UserHome = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Retrieve token from localStorage
    const tokenData = getToken();
    if (tokenData) {
      const token = tokenData;
      // Make GET request with token
      axios
        .get("https://partialbackendforweb.onrender.com/pages/userHome", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          // Handle successful response
          console.log("Response received:", response.data);

          const userData = response.data;
          const userName = userData.name;
          const userEmail = response.data.email;
          localStorage.setItem("userName", userName);
          localStorage.setItem("userEmail", userEmail);
          // Save username and name in local storage

          // Update the username
          const userNameHam = document.getElementById("userNameHam");
          userNameHam.textContent = userName;

          // Update the user email
          const userEmailHam = document.getElementById("userEmailHam");
          userEmailHam.textContent = userEmail;
          // Update the welcome message
          const welcomeMsgUser = document.getElementById("welcomeMsgUser");
          welcomeMsgUser.textContent = `Welcome ${userName},`;
          // Get current date
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1; // Months are zero-indexed, so add 1
          const currentYear = currentDate.getFullYear();

          // Calculate income for current month
          const currentMonthIncome = userData.income.reduce((acc, cur) => {
            const incomeDate = new Date(cur.date);
            if (
              incomeDate.getMonth() + 1 === currentMonth &&
              incomeDate.getFullYear() === currentYear
            ) {
              return acc + cur.amount;
            } else {
              return acc;
            }
          }, 0);

          // Update Income
          const incomeElement = document.getElementById("incomeCnt");
          incomeElement.textContent = `$${currentMonthIncome}`;

          // Calculate expenses for current month
          const currentMonthExpenses = userData.expenses.reduce((acc, cur) => {
            const expenseDate = new Date(cur.startDate);
            if (
              expenseDate.getMonth() + 1 === currentMonth &&
              expenseDate.getFullYear() === currentYear
            ) {
              return acc + cur.amount;
            } else {
              return acc;
            }
          }, 0);

          // Update Expenses
          const expensesElement = document.getElementById("expansesCnt");
          expensesElement.textContent = `$${currentMonthExpenses}`;

          // Get budget limit for current month
          const budgetEntry = userData.budget.find((entry) => {
            const budgetDate = new Date(entry.budgetDate);
            return (
              budgetDate.getMonth() + 1 === currentMonth &&
              budgetDate.getFullYear() === currentYear
            );
          });

          const budgetLimit = budgetEntry ? budgetEntry.limit : 0;

          // Calculate budget remaining for current month
          const budgetRemain = budgetLimit - currentMonthExpenses;

          // Update Budget Remain
          const budgetRemainElement = document.getElementById("budgetCnt");
          budgetRemainElement.textContent = `$${budgetRemain}`;

          const goalsContainer = document.querySelector(".goal-container");

          // Clear existing goals
          goalsContainer.innerHTML = "";

          // Iterate through each goal and create HTML elements dynamically
          response.data.goals.forEach((goal) => {
            const goalDiv = document.createElement("div");
            goalDiv.classList.add("shadow", "p-2", "dark:text-white");
            goalDiv.innerHTML = `
                          ${goal.name}<br>
                          Goal: ${goal.amount}<br>
                          Saved: ${goal.amountSaved}<br>
                          <div class="w-full bg-gray-50 rounded-full dark:bg-gray-700 shadow">
                              <div class="bg-lime-500 text-xs font-medium text-gray-50 text-center p-0.5 leading-none rounded-full" style="width: ${Math.floor(
                                (goal.amountSaved / goal.amount) * 100
                              )}%"> ${Math.floor(
              (goal.amountSaved / goal.amount) * 100
            )}%</div>
                          </div>
                      `;
            goalsContainer.appendChild(goalDiv);
          });

          const latestExpensesBody =
            document.getElementById("latestExpensesBody");

          // Clear existing rows
          latestExpensesBody.innerHTML = "";

          // Iterate through each expense and create HTML elements dynamically
          response.data.expenses.forEach((expense) => {
            //..............................
            const expenseDate = new Date(expense.startDate);
            const expenseMonth = expenseDate.getMonth();

            // Get the current month
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();

            if (expenseMonth == currentMonth) {
              const expenseRow = document.createElement("tr");
              expenseRow.classList.add(
                "border-b",
                "bg-white",
                "dark:bg-gray-900",
                "dark:border-gray-700"
              );

              // Add table data for each column
              expenseRow.innerHTML = `
                            <td class="whitespace-nowrap px-6 py-4 font-medium">${expense.startDate}</td>
                            <td class="whitespace-nowrap px-6 py-4 dark:text-white">${expense.payee}</td>
                            <td class="whitespace-nowrap px-6 py-4 dark:text-white">${expense.category}</td>
                            <td class="whitespace-nowrap px-6 py-4 dark:text-white">$${expense.amount}</td>
                        `;

              // Append the row to the table body
              latestExpensesBody.appendChild(expenseRow);
            }
          });

          // Update Donut

          // Define the categories to display in the donut chart
          const categoriesToShow = [
            "Shopping",
            "Food",
            "Transportation",
            "Loan",
            "Groceries",
            "Other",
          ];

          // Extract expenses data from response.data
          const expensesData = response.data.expenses;
          // console.log(expensesData);

          // Initialize an object to store total amounts for each category
          const expensesByCategory = {};

          // Initialize total amounts for each category to 0
          categoriesToShow.forEach((category) => {
            expensesByCategory[category] = 0;
          });

          // // Calculate total amount spent in each category
          // expensesData.forEach((expense) => {
          //   const category = expense.category;
          //   const amount = parseFloat(expense.amount);
          //   // If the category is in the categoriesToShow array, update the total amount
          //   if (categoriesToShow.includes(category)) {
          //     expensesByCategory[category] += amount;
          //   }
          // });
          expensesData.forEach((expense) => {
            const category = expense.category;
            const amount = parseFloat(expense.amount);

            // Get the month from the expense's date
            const expenseDate = new Date(expense.startDate);
            const expenseMonth = expenseDate.getMonth();

            // Get the current month
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();

            // Check if the expense's month matches the current month
            if (
              expenseMonth === currentMonth &&
              categoriesToShow.includes(category)
            ) {
              expensesByCategory[category] += amount;
            }
          });

          const dataDoughnut = {
            labels: categoriesToShow,
            datasets: [
              {
                data: categoriesToShow.map(
                  (category) => expensesByCategory[category]
                ),
                backgroundColor: [
                  "rgb(133, 105, 241)",
                  "rgb(164, 101, 241)",
                  "rgb(101, 143, 241)",
                  "rgb(200, 100,241)",
                  "rgb(11, 81,96)",
                ],
                hoverOffset: 4,
              },
            ],
          };

          const configDoughnut = {
            type: "doughnut",
            data: dataDoughnut,
            options: {
              plugins: {
                doughnutlabel: {
                  labels: [
                    {
                      text: "Total", // Text to display
                      font: {
                        size: "20", // Font size
                      },
                      color: "#000", // Text color
                    },
                  ],
                },
              },
            },
          };

          new Chart(document.getElementById("chartDoughnut"), configDoughnut);
        })
        .catch((error) => {
          // Handle error
          console.error("Error occurred:", error);
        });
    } else {
      navigate("/");
    }
  }, []);
  return (
    <div className="dark:bg-gray-700">
      <Helmet>
        <title>Home Screen</title>
      </Helmet>
      <UserNavigation />
      <p
        id="welcomeMsgUser"
        className="container font-bold text-2xl md:ml-52 sm:ml-8 ml-8 mt-8"
      >
        Welcome Bonnie,
      </p>

      <section className="" id="hero">
        {/* <!--Income, spendings  section--> */}
        <div className="container flex-initial  flex  flex-col items-center px-4 mx-auto mt-8 mb-6 space-x-2 space-y-0 md:space-y-0 text-lg  py-2">
          <p className="dark:text-white mb-2 font-bold">
            You&apos;ve budgeted $6000 for this month
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className=" items-center relative flex-initial w-40 md:w-60 md:h-32 flex flex-col text-center shadow p-2  block-inline  mx-auto overflow-hidden  dark:bg-gray-900 dark:text-white dark:text-xl bg-gray-100 font-bold">
              <div className="flex flex-row items-center mt-4">
                <img className="w-8 block-inline" src={IncomeIcon} />
                <p className="mt-4 ml-2">Income</p>
              </div>
              <div
                id="incomeCnt"
                className="text-lime-700 dark:text-green-500 mt-2"
              >
                $10000
              </div>
            </div>
            <div className=" items-center relative flex flex-initial w-40 md:w-60 md:h-32 flex-col text-center shadow p-2  mx-auto  dark:bg-gray-900 dark:text-white dark:text-xl font-bold bg-gray-100">
              <div className="flex flex-row items-center mt-4">
                <img className="w-8 block-inline" src={Expense} />
                <p className="mt-4 ml-2">Expenses</p>
              </div>
              <div
                id="expansesCnt"
                className="text-rose-600 dark:text-red-700 mt-2"
              >
                $2000
              </div>
            </div>
            <div className=" relative flex flex-col flex-initial w-40 md:w-60 md:h-32 text-center shadow p-2  mx-auto bg-gray-100 dark:bg-gray-900 dark:text-white dark:text-xl font-bold">
              {/* <!-- <div className="text-blue-500 dark:to-blue-700">$4000</div> --> */}
              <div className="flex flex-row items-center mt-4">
                <img
                  className="w-8 ml-6 mt-4 block-inline"
                  src={moneyBagBlue}
                />
                <p className="mt-4 ml-1">Budget remain</p>
              </div>
              <div id="budgetCnt" className="text-blue-500  dark:to-blue-700">
                $4000
              </div>
            </div>
          </div>
        </div>
        {/* <!--features panel --> */}
        <div className="container flex flex-col gap-7 items-center mx-auto ">
          {/* <!-- expenses and goals--> */}
          <div className=" container flex flex-col justify-center md:flex-row space-x-2 mx-4 px-2 ">
            {/* <!--expenses--> */}

            <div className=" container flex flex-col text-center p-6 my-2 shadow-lg rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-900 max-w-[500px] max-h-[500px]">
              <Link
                to="#"
                className="py-3 px-5 bg-gray-100 dark:text-white dark:bg-gray-700 font-bold text-center"
              >
                Expenses Tracking
              </Link>

              <canvas
                className="container flex p-10 dark:bg-gray-900"
                id="chartDoughnut"
              ></canvas>
            </div>

            {/* <!--goals--> */}
            <div
              id="GoalsContainer"
              className="container flex flex-col p-6 my-2 mx-auto shadow-lg rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-900 max-w-[500px] max-h-[500px]"
            >
              <Link
                to="#"
                className="py-3 px-5 bg-gray-100 dark:bg-gray-700 dark:text-white font-bold text-center"
              >
                Goals Tracking
              </Link>
              <div className="goal-container"></div>
            </div>
          </div>
          {/* <!-- upcoming bills and transactions--> */}
          {/* <!-- upcoming bills and transactions--> */}
          <div className="container flex flex-col space-x-2 mx-4 px-2">
            {/* <!-- Transcation activity--> */}
            <div className="container flex flex-col p-2 my-2 mx-auto shadow-lg rounded-lg overflow-hidden dark:bg-gray-900 dark:border-solid dark:border-white max-w-[1200px] bg-gray-200">
              <Link
                to="#"
                className="py-3 px-5 bg-gray-100 text-center dark:text-2xl font-bold dark:text-white dark:bg-gray-700"
              >
                Latest Expenses
              </Link>
              <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                  <div className="overflow-hidden">
                    <table className="min-w-full text-left text-sm font-light dark:text-gray-400">
                      <thead className="border-b bg-white font-medium dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          <th scope="col" className="px-6 py-4">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Payee
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Category
                          </th>
                          <th scope="col" className="px-6 py-4">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody id="latestExpensesBody">
                        {/* <!-- Table rows for expenses will be added here dynamically --> */}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default UserHome;
