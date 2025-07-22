
const frm = document.getElementById("form");

// frm.addEventListener('submit',(e)=>{
//   e.preventDefault();
//   console.log("submitted succesfully");
// })
function closeBudget() {
  document.getElementById("forbudget").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  const btnbud = document.getElementById("btnforbud");
  const budgetform = document.getElementById("forbudget");

  btnbud.addEventListener("click", () => {
    budgetform.style.display = "flex";
  });
  //gsap.from('.car', { x: -1000, duration: 1.2, rotation: 0, ease: "power", stagger: 0.3 });

  const authLink = document.getElementById("auth-link");
  const loggedInUser = localStorage.getItem("loggedInUser");
  const notLoggedInMsg = document.getElementById("notLoggedInMsg");

  if (loggedInUser) {
    showNotification("Successfully Logged In!");

    authLink.innerHTML = `
    <a class="nav-link" href="#">
      <button type="button" class="btn" id="logoutBtn">Logout</button>
    </a>
  `;

    if (notLoggedInMsg) {
      notLoggedInMsg.style.display = "none";
    }

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("userbudget");
      alert("Logged out successfully");
      location.reload();
    });
  } else {
    showNotificationDanger("User Not Logged In!", "danger");

    authLink.innerHTML = `
    <a class="nav-link" href="loginsignup/sign.html">
      <button type="button" class="btn">Login/SignUp</button>
    </a>
  `;

    if (notLoggedInMsg) {
      notLoggedInMsg.style.display = "block";
    }
  }


//  login signup end



const allDropdowns = document.querySelectorAll('.custom-dropdown');


const dropdownData = {
  expenseSourceDropdown: ["Rent", "Food", "Travel", "Home"],
  paymentModeDropdown: ["NEFT", "UPI", "Cash", "Cheque", "Others"],
  cashinPaymentMode: ["NEFT", "UPI", "Cash", "Cheque", "Others"],
  cashinIncomeSource: ["Salary", "Home", "Part-time", "Gift", "Others"],
};

allDropdowns.forEach(dropdown => {
  const input = dropdown.querySelector('.dropdownInput');
  const addBtn = dropdown.querySelector('.addOptionBtn');
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

  addBtn.addEventListener("click", () => {
    const value = input.value.trim();
    if (!value) return showNotificationDanger("Please enter a value to add.");
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

      const span = document.createElement("span");
      span.textContent = opt;

      const btns = document.createElement("div");
      btns.className = "option-buttons";

      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
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


  //for cashin and out form

 
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

        const amount = parseFloat(invaldata.amount);
        if (amount < 0) {
          showNotificationDanger("Please enter a valid positive amount.");
          return 1;
        }

        const username = localStorage.getItem("loggedInUser"); 
        if (!username) return confirm("User not logged in.");

        console.log({ username, ...invaldata });
        addTransaction({ username, ...invaldata });

        setTimeout(() => {
          form[0].reset();
        }, 1000);

      });
    

  });

  $(function () {
    const form = $("#cashoutform");
    // const sourceSelect = $("#outsource");
    // const customSourceInput = $("#customSource");

    // sourceSelect.on("change", function () {
    //   if ($(this).val() === "Others") {
    //     customSourceInput.show();
    //     customSourceInput.on("change", () => {
    //       let temp = customSourceInput.val();
    //       console.log(temp);
    //       const temoption = new Option(temp, temp);
    //       sourceSelect.append(temoption);
    //       sourceSelect.value = temp;
    //       customSourceInput.hide();
    //     });
    //   }
    // });
    form.on("submit", function (e) {
      e.preventDefault();

      const outvaldata = {};
      const outvalu = form.find("input[name], select[name], textarea[name]");

      outvalu.each(function () {
        const name = $(this).attr("name");
        const value = $(this).val();
        outvaldata[name] = value;
      });

      const username = localStorage.getItem("loggedInUser");
      if (!username) {
        alert("User not logged in.");
        return;
      }

      console.log({ username, ...outvaldata });
      addTransaction({ username, ...outvaldata });

      setTimeout(() => {
        form[0].reset();
      }, 1000);
    });
  });

  const curbud = document.getElementById("currbudget");

  curbud.value = localStorage.getItem("userbudget");
  //dom end
});

async function addTransaction(data) {
  if (data.type === "CashOut") {
    const allowed = checkBudget(data);
    if (!allowed) return;
  }
  const dbRequest = indexedDB.open("ExpenseTrackerDB", 1);

  dbRequest.onsuccess = function (e) {
    const db = e.target.result;
    const tx = db.transaction("transactions", "readwrite");
    const store = tx.objectStore("transactions");

    store.add(data);
    showNotification("successfully data Added. Please Refresh!");
    tx.onerror = () => {
      alert("Failed to save transaction.");
    };
  };
}


function signupUser(username, password, email) {
  const tx = db.transaction("users", "readwrite");
  const store = tx.objectStore("users");

  const user = {
    username: username,
    password: password,
    email: email,
    budget: null,
  };

  const request = store.add(user);
  request.onsuccess = () => alert("User registered!");
  request.onerror = () => alert("Username or email already exists!");
}

function loginUser(emailid, password) {
  const tx = db.transaction("users", "readonly");
  const store = tx.objectStore("users");
  const index = store.index("email");

  const request = index.get(emailid);

  request.onsuccess = function (e) {
    const user = e.target.result;

    if (user && user.password === password) {
      localStorage.setItem("loggedInUser", user.username);
      localStorage.setItem("userbudget", user.budget);
      showNotification("successfully logged In!");
      window.location.href = "../index.html";
    } else {
      showNotificationDanger("Invalid email or password");
    }
  };

  request.onerror = function () {
    showNotificationDanger("Login failed due to a database error.");
  };
}

const signup = document.getElementById("signup");
const signform = {};

signup.addEventListener("submit", function (e) {
  e.preventDefault();

  const inputs = signup.querySelectorAll("input[name], select[name]");

  inputs.forEach((ele) => {
    if (ele.name) {
      signform[ele.name] = ele.value;
    }
  });
  signupUser(signform.fname, signform.password, signform.emailid);

  wrapper.classList.add("active");
});

const login = document.getElementById("loginpage");
const logindata = {};

login.addEventListener("submit", (e) => {
  e.preventDefault();

  const inval = login.querySelectorAll("input[name]");

  inval.forEach((ele) => {
    logindata[ele.name] = ele.value;
  });
  loginUser(logindata.emailid, logindata.password);
});

function checkBudget(data) {
  const lastAmount = expenses[expenses.length - 1];
  const budget = Number(localStorage.getItem("userbudget")) || 0;
  const testbudget = budget - (lastAmount + Number(data.amount));

  if (testbudget < 0) {
    showNotificationDanger("You reached your budget limit.");
  }
 

  return true;
}






function setBudget() {
  const username = localStorage.getItem("loggedInUser");
  if (!username) return showNotificationDanger("User not logged in.");

  const tx = db.transaction("users", "readwrite");
  const store = tx.objectStore("users");

  const request = store.get(username);

  request.onsuccess = () => {
    const user = request.result;

    if (!user) {
      showNotificationdanger("User not found in database.");
      return;
    }
    let curbudget = document.getElementById("budval").value;

    user.budget = document.getElementById("budval").value;

    const updateRequest = store.put(user);

    updateRequest.onsuccess = () => {
      console.log("Budget set successfully:", user);
      localStorage.setItem("userbudget", curbudget);
      showNotification("Budget updated successfully!");
    };

    updateRequest.onerror = () => {
      console.error("Failed to update budget.");
      showNotificationDanger("Failed to update budget.");
    };
  };

  request.onerror = () => {
    console.error("Failed to retrieve user.");
    alert("Error fetching user data.");
  };
  budgetform.style.display = "none";
  window.location.reload();
}

// $(function () {
//   $('#source').on('change', function () {
//     if ($(this).val() === 'Others') {
//       $('#custom-source').removeClass('d-none');
//     } else {
//       $('#custom-source').addClass('d-none');
//       $('#custom-source').val('');
//     }
//   });
// });
// function getTransactionsByUser(username) {
//   const dbRequest = indexedDB.open("ExpenseTrackerDB", 1);

//   dbRequest.onsuccess = function (e) {
//     const db = e.target.result;
//     const tx = db.transaction("transactions", "readonly");
//     const store = tx.objectStore("transactions");
//     const index = store.index("username");

//     const request = index.getAll(username);

//     request.onsuccess = () => {
//       return request.result;
//     };
//   };
// }

// function loadUserTransactions() {
//   const username = localStorage.getItem("loggedInUser");
//   if (!username) return alert("User not logged in.");

//   getTransactionsByUser(username);
// }

// function addTransaction(data) {
//   const dbRequest = indexedDB.open("ExpenseTrackerDB", 1);

//   dbRequest.onsuccess = function (e) {
//     const db = e.target.result;
//     const tx = db.transaction("transactions", "readwrite");
//     const store = tx.objectStore("transactions");

//     store.add(data);

//     tx.oncomplete = () => {
//       alert("Transaction saved!");
//     };

//     tx.onerror = () => {
//       alert("Failed to save transaction.");
//     };
//   };
// }

// function saveExampleTransaction() {
//   const username = localStorage.getItem("loggedInUser"); 
//   if (!username) return alert("User not logged in.");

//   const transaction = {
//     username,
//     amount: 2000,
//     type: "CashOut",
//     source: "Rent",
//     desc: "Monthly apartment rent",
//     supportFile: "rent_receipt.pdf",
//     day: "2025-07-01",
//   };

//   addTransaction(transaction);
// }

// const input = document.getElementById("dropdownInput");
// const dropdown = document.getElementById("customDropdown");
// const optionsContainer = document.getElementById("dropdownOptions");
// const addBtn = document.getElementById("addOptionBtn");


// let options = ["Rent", "Food", "Travel", "Home"];

// function renderOptions() {
//   optionsContainer.innerHTML = "";

//   options.forEach((opt, index) => {
//     const optionDiv = document.createElement("div");
//     optionDiv.classList.add("option");

//     const span = document.createElement("span");
//     span.textContent = opt;

//     const btns = document.createElement("div");
//     btns.className = "option-buttons";

//     const editBtn = document.createElement("button");
//     editBtn.textContent = "✏️";
//     editBtn.onclick = (e) => {
//       e.stopPropagation();
//       const newValue = prompt("Edit option:", opt);
//       if (newValue && !options.includes(newValue)) {
//         options[index] = newValue;
//         renderOptions();
//       }
//     };

//     const deleteBtn = document.createElement("button");
//     deleteBtn.textContent = "🗑️";
//     deleteBtn.onclick = (e) => {
//       e.stopPropagation();
//       options.splice(index, 1);
//       renderOptions();
//     };

//     btns.appendChild(editBtn);
//     btns.appendChild(deleteBtn);

//     optionDiv.appendChild(span);
//     optionDiv.appendChild(btns);

//     optionDiv.addEventListener("click", () => {
//       input.value = opt;
//       optionsContainer.style.display = "none";
//     });

//     optionsContainer.appendChild(optionDiv);
//   });
// }

// dropdown.addEventListener("click", () => {
//   optionsContainer.style.display = "block";
//   renderOptions();
// });


// dropdown.addEventListener("mouseleave", () => {
//   optionsContainer.style.display = "none";
// });

// addBtn.addEventListener("click", () => {
//   const value = input.value.trim();
//   if (value === "") return alert("Please enter a value to add.");
//   if (options.includes(value)) return alert("Option already exists.");
//   options.push(value);
//   input.value = value;
//   renderOptions();
//   optionsContainer.style.display = "none";
// });

