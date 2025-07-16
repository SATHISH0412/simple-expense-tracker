let months = [];
let expenses = [];
let incomes = [];
let transactionlist = [];
let myChart6Instance;


document.addEventListener("DOMContentLoaded", function () {
    const t1 = document.getElementById("myChart1").getContext('2d');
    const t2 = document.getElementById("myChart3").getContext('2d');
    const t3 = document.getElementById("myChart2").getContext('2d');
    const c6 = document.getElementById("myChart7").getContext('2d');
    const curexp = document.getElementById("curexp");
    const balance = document.getElementById("balance");


 


    const data1 = {
        labels: [],
        datasets: [
            {
                label: "Expense",
                data: [],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false,
                tension: 0.3
            },
            {
                label: "Income",
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false,
                tension: 0.3
            }
        ]
    };

       

    const expenseCategories = ['Rent', 'Essentials', 'Entertainments', 'Food', 'Travel', 'Others'];
    const data2 = {
        labels: expenseCategories,
        datasets: [{
            label: 'Expenses',
            data: Array(expenseCategories.length).fill(0),
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(121, 233, 168, 0.7)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(121, 233, 168, 1)'
            ],
            borderWidth: 1
        }]
    };

    const data3 = {
        labels: [],
        datasets: [{
            label: '',
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 205, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)'
            ],
            borderWidth: 1
        }]
    };

    
    function getTransactionsByUser(callback) {
        const username = localStorage.getItem("loggedInUser");
        if (!username) return alert("User not logged in.");
        dbRequest.onsuccess = function (e) {
            const db = e.target.result;
            const tx = db.transaction("transactions", "readonly");
            const store = tx.objectStore("transactions");
            const index = store.index("username");
            const request = index.getAll(username);

            request.onsuccess = () => {
                transactionlist = request.result;
                const allTx = request.result;
                callback(allTx);
            };
        };
    }

    function visualize() {
        getTransactionsByUser(function (allTx) {

            const now = new Date();
            const monthsData = [];
            for (let i = 0; i < 5; i++) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                monthsData.push({
                    key,
                    label: date.toLocaleString('default', { month: 'short' }),
                    expense: 0,
                    income: 0
                });
            }


            allTx.forEach(tx => {
                const txDate = new Date(tx.day);
                const key = `${txDate.getFullYear()}-${txDate.getMonth() + 1}`;
                const monthBucket = monthsData.find(d => d.key === key);


                if (monthBucket) {
                    if (tx.type === "CashOut") {
                        monthBucket.expense += Number(tx.amount);
                    } else if (tx.type === "CashIn") {
                        monthBucket.income += Number(tx.amount);
                    }
                }

                // For bar chart
                if (tx.type === "CashOut") {
                    const catIndex = expenseCategories.findIndex(cat => cat.toLowerCase() === (tx.source || '').toLowerCase());
                    if (catIndex !== -1) {
                        data2.datasets[0].data[catIndex] += Number(tx.amount);
                    } else {
                        
                        data2.datasets[0].data[expenseCategories.length - 1] += Number(tx.amount);
                    }
                }
            });

            months = monthsData.reverse().map(d => d.label);
            expenses = monthsData.map(d => d.expense);
            incomes = monthsData.map(d => d.income);

            data1.labels = months;
            data1.datasets[0].data = expenses;
            data1.datasets[1].data = incomes;


            new Chart(t1, {
                type: 'line',
                data: data1,
                options: {
                    responsive: false,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Expense vs Income (Last 5 Months)' }
                    }
                }
            });


            new Chart(t2, {
                type: 'pie',
                data: data2,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            display: true,
                            position: "left"
                        },
                        title: { display: true, text: 'Expenses by Category' }
                    }
                }
            });

            // Prepare data3 for bar chart (Income by month)
            data3.labels = months;
            data3.datasets[0].data = incomes;

            // Define config before using it
            const config = {
                type: 'bar',
                data: data3,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Income by Month'
                        }
                    }
                },
            };

            // Render bar chart for t3
            new Chart(t3, config);
            let newbud = localStorage.getItem('userbudget');
            if (newbud > 0) {
                let total = expenses[expenses.length - 1];
                curexp.value = total;
                let bal = localStorage.getItem('userbudget') - total;
                balance.value = bal;
            }
  
            let tempbud =localStorage.getItem('userbudget')-expenses[expenses.length -1];
            const data5 = {
                labels: ['Remaining-Budget', 'Expenses'],
                datasets: [{
                    label: 'My First Dataset',
                    data: [tempbud,expenses[expenses.length -1]],
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)'
                    ],
                    hoverOffset: 4
                }]
            };

            const config2 = {
                type: 'doughnut',
                data: data5,
                options:{
                    responsive:true,
               
                    maintainAspectRatio: false,
                    plugins:{
                        legend:{
                            position:'left'
                        }
                    }
                }
            };
            
            new Chart(c6,config2);


            const { labels: defaultLabels, data: defaultData } = groupExpensesByDay(transactionlist);
            renderChart(defaultLabels, defaultData);
         



        });
    }

   
    visualize();
});


function filterByDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return transactionlist.filter(tx => {
        const txDate = new Date(tx.day);
        return txDate >= start && txDate <= end;
    });
}



function groupExpensesByDay(transactions) {
    const result = {};

    transactions.forEach(tx => {
        if (tx.type === 'CashOut') {
            const day = tx.day;
            result[day] = (result[day] || 0) + Number(tx.amount);
        }
    });

    const labels = Object.keys(result).sort(); // sorted dates
    const data = labels.map(date => result[date]);

    return { labels, data };
}


function renderChart(defaultLabels, defaultData) {
    const ctx = document.getElementById('myChart6').getContext('2d');
    if (myChart6Instance) {
        myChart6Instance.destroy();
    }
    myChart6Instance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: defaultLabels,
            datasets: [{
                label: 'CashOut',
                data: defaultData,
                backgroundColor: 'rgba(255, 99, 132, 0.6)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}



function filterAndShow() {
    console.log("clicked");
    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;
    const filtered = filterByDateRange(start, end);
    const { labels, data } = groupExpensesByDay(filtered);
    renderChart(labels, data);
}






 