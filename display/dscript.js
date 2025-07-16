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
    const type = row.find("td:nth-child(4)").text().toLowerCase();     // 4th column = Type
    const source = row.find("td:nth-child(3)").text().toLowerCase();   // 3rd column = Source

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
  if (form.length === 0) {
    console.warn("#cashinform not found in DOM");
  } else {
    form.on('submit', function (e) {

      e.preventDefault();
      const invaldata = {};
      const invalu = form.find('input[name], select[name],textarea[name]');

      invalu.each(function () {
        const name = $(this).attr('name');
        const value = $(this).val();
        invaldata[name] = value;
      });
      const username = localStorage.getItem("loggedInUser"); // from login
      if (!username) return confirm("User not logged in.");




      console.log({ username, ...invaldata });
      addTransaction({ username, ...invaldata });

      setTimeout(() => {
        form[0].reset();
      }, 1000);

    });
  }

});

$(function () {
  const form = $('#cashoutform');
  const sourceSelect = $('#outsource');
  const customSourceInput = $('#customSource');

  if (form.length === 0) {
    console.warn("#cashoutform not found in DOM");
    return;
  }

  sourceSelect.on('change', function () {
    if ($(this).val() === 'Others') {
      customSourceInput.show().prop('required', true);
    } else {
      customSourceInput.hide().val('').prop('required', false);
    }
  });

  form.on('submit', function (e) {
    e.preventDefault();

    const outvaldata = {};
    const outvalu = form.find('input[name], select[name], textarea[name]');

    outvalu.each(function () {
      const name = $(this).attr('name');
      const value = $(this).val();
      outvaldata[name] = value;
    });


    if (sourceSelect.val() === 'Others') {
      const customValue = customSourceInput.val().trim();
      if (!customValue) {
        alert("Please enter a custom source.");
        return;
      }
      outvaldata['source'] = customValue;
    }

    const username = localStorage.getItem("loggedInUser");
    if (!username) {
      alert("User not logged in.");
      return;
    }

    console.log({ username, ...outvaldata });
    addTransaction({ username, ...outvaldata });

    setTimeout(() => {
      form[0].reset();
      customSourceInput.hide(); // Hide custom field on reset
    }, 1000);
  });
});


// $(function () {
//   const form = $('#cashoutform');
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

function loadUserTransactions() {
  const username = localStorage.getItem("loggedInUser");
  if (!username) return alert("User not logged in.");

  getTransactionsByUser(username, (transactions) => {
    displayTransactions(transactions);
  });
}

loadUserTransactions();

$(function () {
  $(document).on("click", '.delete', function () {
    console.log($(this).data("id"));
    const id = parseInt($(this).data("id"));
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


        window.currentEditId = txData.id;
        deleteTransactionById(id);
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


  end.setHours(23, 59, 59, 999);

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
  console.log("cliked");
  const csvContent = "data:text/csv;charset=utf-8,"
    + "Date,Description,Category,Type,Amount\n"
    + transaction.map(t =>
      `${t.day},${t.desc},${t.mode},${t.type},${t.amount},${t.reference}`
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
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
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

