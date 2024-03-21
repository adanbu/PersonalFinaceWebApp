import UserNavigation from "../components/UserNavigation";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useEffect } from "react";
import axios from "axios";
import { Chart } from "chart.js/auto";

const Expenses1 = () => {

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tokenData = localStorage.getItem("token");
        if (tokenData) {
          const token = JSON.parse(tokenData).value;
          const response = await axios.get(
            "https://partialbackendforweb.onrender.com/pages/userHome",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const expenses = response.data.expenses

          // Update My Chart

          // Code for My Chart

          // End of My Chart code
          const latestExpensesBody = document.querySelector(
            "#latestExpensesBody"
          );

          latestExpensesBody.innerHTML = "";

          expenses.forEach((expense) => {
            const expenseRow = document.createElement("tr");
            expenseRow.classList.add(
              "border-b",
              "bg-white",
              "dark:bg-gray-900",
              "dark:border-gray-700"
            );

            expenseRow.innerHTML = `
        <td class="whitespace-nowrap px-6 py-4 font-medium">${new Date(
          expense.startDate
        ).toLocaleDateString()}</td>
        <td class="whitespace-nowrap px-6 py-4 dark:text-white">${
          expense.payee
        }</td>
        <td class="whitespace-nowrap px-6 py-4 dark:text-white">${
          expense.category
        }</td>
        <td class="whitespace-nowrap px-6 py-4 dark:text-white">$${
          expense.amount
        }</td>
      `;

            latestExpensesBody.appendChild(expenseRow);
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
          expenses.forEach((expense) => {
            const category = expense.category;
            const amount = parseFloat(expense.amount);

            // Get the month from the expense's date
            const expenseDate = new Date(expense.startDate);
            const expenseYear = expenseDate.getFullYear();

            // Get the current month
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();

            // Check if the expense's month matches the current month
            if (
              expenseYear === currentYear &&
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
          console.log(expensesByCategory);
          new Chart(
            document.getElementById("chartDoughnut"),
            configDoughnut
          );

          //Update My Chart

          const incomes = response.data.income;

          // Initialize an array to hold income for each month, starting with zeros for all months
          const monthlyIncomes = Array(12).fill(0);

          // Map income amounts to respective months
          incomes.forEach((income) => {
            const month = new Date(income.date).getMonth();
            monthlyIncomes[month] += income.amount;
          });

          // Initialize an array to hold expenses for each month, starting with zeros for all months
          const monthlyExpenses = Array(12).fill(0);

          // Map income amounts to respective months
          expenses.forEach((income) => {
            const month = new Date(income.startDate).getMonth();
            monthlyExpenses[month] += income.amount;
          });

          // If there are months without income, they will remain zero

          console.log(monthlyIncomes);
          console.log(monthlyExpenses);

          const ctx = document.getElementById("myChart").getContext("2d");
          new Chart(ctx, {
            type: "bar",
            data: {
              labels: [
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
              ], // Update with your months
              datasets: [
                {
                  label: "Income",
                  data: monthlyIncomes, // Fake data for income
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 1,
                },
                {
                  label: "Expenses",
                  data: monthlyExpenses, // Fake data for expenses
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                  borderColor: "rgba(255, 99, 132, 1)",
                  borderWidth: 1,
                },
              ],
            },
            options: {
              indexAxis: "y", // Display bars horizontally
              plugins: {
                legend: {
                  position: "right", // Position the legend to the right
                },
              },
              scales: {
                x: {
                  beginAtZero: true, // Start the scale from zero
                },
              },
            },
          });
        } else {
          console.error("Token not found in localStorage");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dark:bg-gray-700">
      <Helmet>
        <title>Document</title>
      </Helmet>

      <UserNavigation />
      <h2 className="my-8 text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white text-center">
        Expenses monitoring{" "}
      </h2>

      <div className="flex flex-col justify-between  ">
        <div className="inline-block">
          <Link
            to="/expensesAddition"
            className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold m-2 md:ml-20 py-2 px-2 rounded-md"
          >
            {" "}
            Add Expense
          </Link>
        </div>
        <div className="flex flex-col md:flex-row justify-center mx-4">
          <div className=" container  text-center p-6 my-2 shadow-lg rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-900 max-w-[900px] max-h-[800px] mr-4">
            {/* <!-- bar chart code for income and expenses --> */}
            <div className=" container flex  ">
              <canvas id="myChart" className=""></canvas>
            </div>
          </div>
          <div className=" container flex flex-col text-center p-6 my-2 shadow-lg rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-900 max-w-[500px] max-h-[500px]">
            <Link
              to={""}
              className="py-3 px-5 bg-gray-100 text-xl dark:text-white dark:bg-gray-700 font-bold text-center"
            >
              Expenses Categorization
            </Link>
            <canvas
              className="container flex p-10 dark:bg-gray-900"
              id="chartDoughnut"
            ></canvas>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center mx-4">
          {/* <!-- Transcation activity--> */}
          <div className="container flex flex-col p-2 my-2 mx-auto shadow-lg rounded-lg overflow-hidden dark:bg-gray-900 dark:border-solid dark:border-white max-w-[1200px] bg-gray-200">
            <Link
              to={""}
              className="py-3 px-5 bg-gray-100 text-center text-xl font-bold dark:text-white dark:bg-gray-700"
            >
              Latest Expenses
            </Link>
            <div className="overflow-x-auto sm:-mx-6 lg:-mx-8 ">
              <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8 ">
                <div className="overflow-hidden ">
                  <table
                    id="latestExpensesTable"
                    className="min-w-full text-left text-sm font-light dark:text-gray-400"
                  >
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
                      {/* <!-- Expense rows will be dynamically added here --> */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {/* <!--Upcoming expenses --> */}
          <div className="container flex flex-col p-2 my-2 mb-16 mx-auto shadow-lg rounded-lg overflow-hidden dark:bg-gray-900 dark:border-solid dark:border-white max-w-[1200px] bg-gray-200">
            <Link
              to={""}
              className="py-3 px-5 bg-gray-100 text-center text-xl font-bold dark:text-white dark:bg-gray-700"
            >
              Upcoming Expenses
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
                    <tbody>
                      <tr className="border-b bg-neutral-100 dark:bg-gray-900 dark:border-gray-700">
                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                          01/03/2024
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 dark:text-white">
                          Bank
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 dark:text-white">
                          Loan
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 dark:text-white">
                          $400
                        </td>
                      </tr>
                      <tr className="border-b bg-white dark:bg-gray-900 dark:border-gray-700 ">
                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                          10/03/2024
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 dark:text-white">
                          Electricity ltd
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 dark:text-white">
                          Bills
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 dark:text-white">
                          $112
                        </td>
                      </tr>
                      <tr className="border-b bg-neutral-100 dark:bg-gray-900 dark:border-gray-700">
                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                          10/03/2024
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 dark:text-white">
                          Netflix
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 dark:text-white">
                          Entertainment
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 dark:text-white">
                          $20
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <!--End of Upcoming expenses Table--> */}
      <Footer />
    </div>
  );
};

export default Expenses1;
