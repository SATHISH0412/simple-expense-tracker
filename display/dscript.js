const dropdownData = {
  paymentMode: ["NEFT", "UPI", "cash", "Cheque", "Others"],
  expenseSource: ["Rent", "Food", "Travel", "Home"],
  cashinpaymentMode: ["NEFT", "UPI", "cash", "Cheque", "Others"],
  cashinsourceIncome: ["Salary", "Home", "Part-time", "Gift", "Others"]
};

document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
  const input = dropdown.querySelector('.dropdownInput');
  const add = dropdown.querySelector('.addOptionBtn');
  const optionsContainer = dropdown.querySelector('.dropdown-options');
  const dropdownId = dropdown.getAttribute('data-id');

  let options = dropdownData[dropdownId] || [];


  input.addEventListener("click", () => {
    optionsContainer.style.display = "block";
    renderOptions();
  });


  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      optionsContainer.style.display = "none";
    }
  });

  add.addEventListener("click", () => {
    const value = input.value.trim();
    if (!value) return alert("Please enter a value.");
    if (options.includes(value)) return alert("Option already exists.");
    options.push(value);
    dropdownData[dropdownId] = options;
    input.value = value;
    renderOptions();
    optionsContainer.style.display = "none";
  });

  function renderOptions() {
    optionsContainer.innerHTML = "";

    options.forEach((opt, index) => {
      const optionDiv = document.createElement("div");
      optionDiv.classList.add("option");
      optionDiv.style.display = "flex";
      optionDiv.style.justifyContent = "space-between";
      optionDiv.style.alignItems = "center";
      optionDiv.style.padding = "5px";
      optionDiv.style.borderBottom = "1px solid #ddd";
      optionDiv.style.cursor = "pointer";

      const span = document.createElement("span");
      span.textContent = opt;

      const btns = document.createElement("div");
      btns.className = "option-buttons";

      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.style.marginRight = "5px";
      editBtn.onclick = (e) => {
        e.stopPropagation();
        const newValue = prompt("Edit option:", opt);
        if (newValue && !options.includes(newValue)) {
          options[index] = newValue;
          dropdownData[dropdownId] = options;
          renderOptions();
        }
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        options.splice(index, 1);
        dropdownData[dropdownId] = options;
        renderOptions();
      };

      btns.appendChild(editBtn);
      btns.appendChild(deleteBtn);

      optionDiv.appendChild(span);
      optionDiv.appendChild(btns);

      optionDiv.addEventListener("click", () => {
        input.value = opt;
        optionsContainer.style.display = "none";
      });

      optionsContainer.appendChild(optionDiv);
    });
  }
});


function displayTransactions(transactions) {
  const container = document.getElementById("transactionList");
  container.innerHTML = "";

  transactions.forEach(tx => {
    const item = document.createElement("tr");
    // const amountStyle = tx.type === "CashIn" ? 'class="bg-danger"' : "";
    item.innerHTML = `
      <td>${tx?.refno}</td>
      <td>${tx.day}</td>
      <td>${tx.source}</td>
      <td>${tx.type}</td>
      <td >${tx?.amount}</td>
      <td>${tx.desc ?? "null"}</td>
      <td>${tx?.mode}</td>
      <td><button class="btn btn-primary edit px-4 me-2"  data-id= ${tx.id}>Edit</button><button class="btn btn-danger delete" data-id= ${tx.id}  >Delete</button></td>

    `;
    container.appendChild(item);
  });
}
function applyFilters() {
  const selectedType = $("#filterType").val().toLowerCase();
  const selectedSource = $("#filterSource").val().toLowerCase();

  $("#transactionList tr").each(function () {
    const row = $(this);
    const type = row.find("td:nth-child(4)").text().toLowerCase();     
    const source = row.find("td:nth-child(3)").text().toLowerCase();   

    const matchType = !selectedType || type === selectedType;
    const matchSource = !selectedSource || source === selectedSource;

    row.toggle(matchType && matchSource);
  });
}

$(function () {
  $("#searchInput").on("keyup", function () {
    const value = $(this).val().toLowerCase();
    $("#transactionList tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
});



$("#filterType, #filterSource").on("change", applyFilters);

$(function () {
  const form = $('#cashinform');


  form.on('submit', function (e) {
    e.preventDefault();

    const invaldata = {};
    const invalu = form.find('input[name], select[name],textarea[name]');

    invalu.each(function () {
      const name = $(this).attr('name');
      const value = $(this).val();
      invaldata[name] = value;
    });

    const username = localStorage.getItem("loggedInUser");
    if (!username) return alert("User not logged in.");

    const editId = form.data("edit-id");
    if (editId !== undefined) {
      updateTransaction(editId, { username, ...invaldata });
      form.removeData("edit-id"); 
    } else {
      addTransaction({ username, ...invaldata });
      loadUserTransactions();
    }

    setTimeout(() => {
      form[0].reset();
    }, 1000);
  });
});




$(function () {
  const form = $('#cashoutform');
  // const sourceSelect = $('#outsource');
  // const customSourceInput = $('#customSource');

  // sourceSelect.on('change', function () {
  //   if ($(this).val() === 'Others') {
  //     customSourceInput.show();
  //     customSourceInput.on('change', () => {
  //       const temp = customSourceInput.val();
  //       const newOption = new Option(temp, temp);
  //       sourceSelect.append(newOption);
  //       sourceSelect.val(temp);
  //       customSourceInput.hide();
  //     });
  //   }
  // });

  form.on('submit', function (e) {
    e.preventDefault();

    const outvaldata = {};
    const outvalu = form.find('input[name], select[name], textarea[name]');

    outvalu.each(function () {
      const name = $(this).attr('name');
      const value = $(this).val();
      outvaldata[name] = value;
    });

    const username = localStorage.getItem("loggedInUser");
    if (!username) return alert("User not logged in.");

    const editId = form.data("edit-id");
    if (editId !== undefined) {
      updateTransaction(editId, { username, ...outvaldata });
      form.removeData("edit-id");
    } else {
      addTransaction({ username, ...outvaldata });
    }

    setTimeout(() => {
      form[0].reset();
    }, 1000);
  });
});


function getTransactionsByUser(username, callback) {
  const dbRequest = indexedDB.open("ExpenseTrackerDB", 1);

  dbRequest.onsuccess = function (e) {
    const db = e.target.result;
    const tx = db.transaction("transactions", "readonly");
    const store = tx.objectStore("transactions");
    const index = store.index("username");

    const request = index.getAll(username);

    request.onsuccess = () => {
      callback(request.result);
    };
  };
}

function loadUserTransactions(callback) {
  const username = localStorage.getItem("loggedInUser");
  if (!username) return alert("User not logged in.");

  getTransactionsByUser(username, (transactions) => {
    displayTransactions(transactions);
    if (callback) callback(transactions);
  });
}

loadUserTransactions();

$(function () {
  $(document).on("click", '.delete', function () {
    console.log($(this).data("id"));
    const id = parseInt($(this).data("id"));
    const a = confirm("plese Confirm before you delete");
    if(!a){return};
    deleteTransactionById(id);
    $(this).parent().parent().remove();
    // showNotificationDanger("successfully Trasaction deleted");
  })
});

$(function () {
  $(document).on("click", '.edit', function () {
    const id = parseInt($(this).data("id"));
    $(this).parent().parent().remove();
    editRecord(id);
  });
});



function editRecord(id) {
  const dbRequest = indexedDB.open("ExpenseTrackerDB", 1);
  dbRequest.onsuccess = function (e) {
    const db = e.target.result;
    const tx = db.transaction("transactions", "readonly");
    const store = tx.objectStore("transactions");
    const editreq = store.get(id);

    editreq.onsuccess = () => {
      localStorage.setItem('editRecordId', id);
      launchEditModal(id);
    };
  };
}



function launchEditModal(id) {
  const dbRequest = indexedDB.open("ExpenseTrackerDB", 1);

  dbRequest.onsuccess = function (e) {
    const db = e.target.result;
    const tx = db.transaction("transactions", "readonly");
    const store = tx.objectStore("transactions");

    const req = store.get(Number(id));

    req.onsuccess = function () {
      const txData = req.result;
      if (txData) {
        const modalId = txData.type === "CashOut" ? "staticBackdrop1" : "staticBackdrop";
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();

        const form = $(`#${modalId}`).find("form");

        
        form.find('input[name], select[name], textarea[name]').each(function () {
          const fieldName = $(this).attr('name');
          if (txData.hasOwnProperty(fieldName)) {
            $(this).val(txData[fieldName]);
          }
        });

       
        form.data("edit-id", txData.id);
      }
    };
  };
}

function calculateCurrentMonthExpenses(transactions) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let total = 0;

  transactions.forEach(tx => {
    if (tx.type === 'CashOut') {
      const txDate = new Date(tx.day);
      if (
        txDate.getFullYear() === currentYear &&
        txDate.getMonth() === currentMonth
      ) {
        total += Number(tx.amount);
      }
    }
  });

  return total;
}

function checkBudget2(data) {
  loadUserTransactions((transactions) => {
    const lastAmount = calculateCurrentMonthExpenses(transactions);
    const budget = Number(localStorage.getItem("userbudget")) || 0;
    const testbudget = budget - (lastAmount + Number(data));

    if (testbudget < 0) {
      showNotificationDanger("You reached your budget limit.");
    }
    return true;
  });
}


function updateTransaction(id, updatedData) {
  const dbRequest = indexedDB.open("ExpenseTrackerDB", 1);

  dbRequest.onsuccess = function (e) {
    const db = e.target.result;
    const tx = db.transaction("transactions", "readwrite");
    const store = tx.objectStore("transactions");

    const getRequest = store.get(id);

    getRequest.onsuccess = function () {
      const existing = getRequest.result;
      if (existing) {
        const updated = { ...existing, ...updatedData };
        store.put(updated);
        
        showNotification("Transaction updated successfully.Please refresh!");
        loadUserTransactions();
        checkBudget2(updated.amount);
      }
    };
  };
}


// const myModal = new bootstrap.Modal(document.getElementById('staticBackdrop1'));
// myModal.show();

function deleteTransactionById(id) {
  const dbRequest = indexedDB.open("ExpenseTrackerDB", 1);

  dbRequest.onsuccess = function (e) {
    const db = e.target.result;
    const tx = db.transaction("transactions", "readwrite");
    const store = tx.objectStore("transactions");

    const deleteRequest = store.delete(id);

    deleteRequest.onsuccess = () => {
      showNotificationDanger("Transaction deleted successfully");
    };

    deleteRequest.onerror = () => {
      showNotificationDanger("Failed to delete transaction");
    };
  };
}

function getUserTransactions(callback) {
  const dbRequest = indexedDB.open("ExpenseTrackerDB", 1);
  const username = localStorage.getItem("loggedInUser");

  dbRequest.onsuccess = function (e) {
    const db = e.target.result;
    const tx = db.transaction("transactions", "readonly");
    const store = tx.objectStore("transactions");
    const index = store.index("username");
    const request = index.getAll(username);

    request.onsuccess = () => callback(request.result);
  };
}


function filterByDate() {
  const start = new Date(document.getElementById('startdate').value);
  const end = new Date(document.getElementById('enddate').value);

  if(start>end){
    alert("Give a valid date.")
    return;
  }
end.setHours(23, 59, 59, 999);


  if(isNaN(start) || isNaN(end)){
    alert("enter the valid daate");
  }
    console.log("working")
    getUserTransactions((transactions) => {
    const filtered = transactions.filter(tx => {
      const txDate = new Date(tx.day);
      return txDate >= start && txDate <= end;
    });

    displayTransactions(filtered);
  });
  
}


function showNotification(content) {
  const bdy = document.body;

  const tab = document.createElement('div');
  tab.classList.add('toast-notification');


  tab.innerHTML = `<p>${content}</p>`;

  bdy.appendChild(tab);


  setTimeout(() => {
    tab.remove();
  }, 3000);
}


function showNotificationDanger(content) {
  const bdy = document.body;

  const tab = document.createElement('div');
  tab.classList.add('toast-notificationdanger');


  tab.innerHTML = `<p>${content}</p>`;

  bdy.appendChild(tab);


  setTimeout(() => {
    tab.remove();
  }, 3000);
}



function exportdata1() {
  const username = localStorage.getItem("loggedInUser");
  if (!username) return alert("User not logged in.");

  getTransactionsByUser(username, (transactions) => {
    exportData(transactions);
  });
}


function exportData(transaction) {
  console.log(transaction);
  const csvContent = "data:text/csv;charset=utf-8,"
    + "Date,Description,Category,Type,Amount,Reference\n"
    + transaction.map(t =>
      `${t.day},${t.desc},${t.mode},${t.type},${t.amount},${t.refno ?? ""}`
    ).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);  
  link.setAttribute("download", "transactions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showNotification('Data exported successfully!', 'success');
}


$(function () {
  $('#dateFilter').on('change', function () {
    const selected = $(this).val();
    loadfilterdata(selected);
  });
});


function loadfilterdata(type) {
  const username = localStorage.getItem("loggedInUser");
  if (!username) return alert("User not logged in.");

  getTransactionsByUser(username, (transactions) => {
    filterByDat1(transactions, type);
  });
}

function filterByDat1(transactionlist, type) {
  const now = new Date();
  let filtered = [];

  switch (type) {
    case 'week': {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); 
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      filtered = transactionlist.filter(tx => {
        const txDate = new Date(tx.day);
        return txDate >= startOfWeek && txDate <= endOfWeek;
      });
      break;
    }

    case 'month': {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      filtered = transactionlist.filter(tx => {
        const txDate = new Date(tx.day);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      });
      break;
    }

    case 'year': {
      const currentYear = now.getFullYear();

      filtered = transactionlist.filter(tx => {
        const txDate = new Date(tx.day);
        return txDate.getFullYear() === currentYear;
      });
      break;
    }

    case 'all':
    default:
      filtered = transactionlist;
      break;
  }

  displayTransactions(filtered);
}

//for cash-out
// $(function () {
//   const form = $('#cashoutform');
//   const sourceSelect = $('#outsource');
//   const customSourceInput = $('#customSource');

//   sourceSelect.on('change', function () {
//     if ($(this).val() === 'Others') {
//      customSourceInput.show();
//       customSourceInput.on('change',()=>{
      
//         let temp = customSourceInput.val();
//         console.log(temp);
//       const temoption = new Option(temp,temp);
//       sourceSelect.append(temoption);
//       sourceSelect.value = temp; 
//       customSourceInput.hide();
//       })
    
//     }
//   });
//   form.on('submit', function (e) {
//     e.preventDefault();

//     const outvaldata = {};
//     const outvalu = form.find('input[name], select[name], textarea[name]');

//     outvalu.each(function () {
//       const name = $(this).attr('name');
//       const value = $(this).val();
//       outvaldata[name] = value;
//     });



    

//     const username = localStorage.getItem("loggedInUser");
//     if (!username) {
//       alert("User not logged in.");
//       return;
//     }

//     console.log({ username, ...outvaldata });
//     addTransaction({ username, ...outvaldata });

//     setTimeout(() => {
//       form[0].reset();
//     }, 1000);
//   });
// });
// function launchEditModal(id) {
//   const dbRequest = indexedDB.open("ExpenseTrackerDB", 1);

//   dbRequest.onsuccess = function (e) {
//     const db = e.target.result;
//     const tx = db.transaction("transactions", "readonly");
//     const store = tx.objectStore("transactions");

//     const req = store.get(Number(id));

//     req.onsuccess = function () {
//       const txData = req.result;
//       if (txData) {
//         const modalId = txData.type === "CashOut" ? "staticBackdrop1" : "staticBackdrop";
//         const modal = new bootstrap.Modal(document.getElementById(modalId));
//         modal.show();


//         const form = $(`#${modalId}`).find("form");


//         form.find('input[name], select[name], textarea[name]').each(function () {
//           const fieldName = $(this).attr('name');
//           if (txData.hasOwnProperty(fieldName)) {
//             $(this).val(txData[fieldName]);
//           }
//         });


//         window.currentEditId = txData.id;
//         deleteTransactionById(id);
//       }
//     };
//   };
// }

//for cash in
// $(function () {
//   const form = $('#cashinform');
//   if (form.length === 0) {
//     console.warn("#cashinform not found in DOM");
//   } else {
//     form.on('submit', function (e) {

//       e.preventDefault();
//       const invaldata = {};
//       const invalu = form.find('input[name], select[name],textarea[name]');

//       invalu.each(function () {
//         const name = $(this).attr('name');
//         const value = $(this).val();
//         invaldata[name] = value;
//       });
//       const username = localStorage.getItem("loggedInUser"); // from login
//       if (!username) return confirm("User not logged in.");




//       console.log({ username, ...invaldata });
//       addTransaction({ username, ...invaldata });

//       setTimeout(() => {
//         form[0].reset();
//       }, 1000);

//     });
//   }

// });
