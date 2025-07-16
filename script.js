
const frm = document.getElementById("form");

// frm.addEventListener('submit',(e)=>{
//   e.preventDefault();
//   console.log("submitted succesfully");
// })

document.addEventListener("DOMContentLoaded", function () {

  // setTimeout(()=>{
  //   if (!localStorage.getItem("loggedInUser")) {
  //   window.location.href = "loginsignup/sign.html";
  // }
  // },3000);


  gsap.from('.car', { x: -1000, duration: 1.2, rotation: 0, ease: "power", stagger: 0.3 });

  const authLink = document.getElementById("auth-link");
  const loggedInUser = localStorage.getItem("loggedInUser");

  // if (loggedInUser) {
  //   showNotification("successfully Logged In!");
  //   authLink.innerHTML = `
  //     <a class="nav-link" href="#"><button type="button" class="btn" id="logoutBtn">
  //       Logout
  //     </button></a>
  //   `;

  //   document.getElementById("logoutBtn").addEventListener("click", () => {
  //     localStorage.removeItem("loggedInUser");
  //     localStorage.removeItem("userbudget");
  //     alert("Logged out successfully");
  //     location.reload();
  //   });
  // } else {
  //   showNotificationDanger("User Not Logged In!");
  //   authLink.innerHTML = `
  //     <a class="nav-link" href="loginsignup/sign.html"><button type="button" class="btn">
  //       Login/SignUp
  //     </button></a>
  //   `;
    

  // }
  const notLoggedInMsg = document.getElementById("notLoggedInMsg");

if (loggedInUser) {
  showNotification("Successfully Logged In!");

  authLink.innerHTML = `
    <a class="nav-link" href="#">
      <button type="button" class="btn" id="logoutBtn">Logout</button>
    </a>
  `;

  // Hide the not-logged-in message
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
  showNotification("User Not Logged In!", "danger");

  authLink.innerHTML = `
    <a class="nav-link" href="loginsignup/sign.html">
      <button type="button" class="btn">Login/SignUp</button>
    </a>
  `;

  // Show the not-logged-in message
  if (notLoggedInMsg) {
    notLoggedInMsg.style.display = "block";
  }
}





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



  //for cashoutform

  // $(function () {
  //   const form = $('#cashoutform');

  //   if (form.length === 0) {
  //     console.warn("#cashoutform not found in DOM");
  //   } else {
  //     form.on('submit', function (e) {
  //       e.preventDefault();
  //       const outvaldata = {};
  //       const outvalu = form.find('input[name], select[name],textarea[name]');

  //       outvalu.each(function () {
  //         const name = $(this).attr('name');
  //         const value = $(this).val();
  //         outvaldata[name] = value;
  //       });
  //       const username = localStorage.getItem("loggedInUser"); // from login
  //       if (!username) return ("User not logged in.");



  //       console.log({ username, ...outvaldata });
  //       addTransaction({ username, ...outvaldata });

  //       setTimeout(() => {
  //         form[0].reset();
  //       }, 1000);

  //     });
  //   }

  // });

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



  const curbud = document.getElementById("currbudget");

  curbud.value = localStorage.getItem("userbudget");
  //dom end
});


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

function signupUser(username, password, email) {
  const tx = db.transaction("users", "readwrite");
  const store = tx.objectStore("users");

  const user = {
    username: username,
    password: password,
    email: email,
    budget: null
  };

  const request = store.add(user);
  request.onsuccess = () => alert("User registered!");
  request.onerror = () => alert("Username or email already exists!");
}


// function loginUser(emailid, password) {
//   const tx = db.transaction("users", "readonly");
//   const store = tx.objectStore("users");
//   const request = store.get(emailid);

//   request.onsuccess = function (e) {
//     const user = e.target.result;
//     if (user && user.password === password) {
//       localStorage.setItem("loggedInUser", username);

//     } else {
//       alert("Invalid username or password");
//     }
//   };
// }


function loginUser(emailid, password) {
  const tx = db.transaction("users", "readonly");
  const store = tx.objectStore("users");
  const index = store.index("email"); // using the 'email' index

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



const signup = document.getElementById('signup');
const signform = {};

signup.addEventListener('submit', function (e) {
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


const login = document.getElementById('loginpage');
const logindata = {};

login.addEventListener('submit', (e) => {
  e.preventDefault();

  const inval = login.querySelectorAll('input[name]');

  inval.forEach((ele) => {
    logindata[ele.name] = ele.value;
  })
  loginUser(logindata.emailid, logindata.password);

})

function checkBudget(data) {
  const lastAmount = expenses[expenses.length - 1];
  const budget = Number(localStorage.getItem('userbudget')) || 0;
  const testbudget = budget - (lastAmount + Number(data.amount));

  if (testbudget < 0) {
    showNotificationDanger("You reached your budget limit.");
  }

  return true;
}



async function addTransaction(data) {

  if (data.type === 'CashOut') {
    const allowed = checkBudget(data);
    if (!allowed) return;
  }

  const amount = parseFloat(data.amount);
        if (isNaN(amount) || amount < 0) {
          alert("Please enter a valid positive amount.");
          return;
        }

  const dbRequest = indexedDB.open("ExpenseTrackerDB", 1);


  dbRequest.onsuccess = function (e) {
    const db = e.target.result;
    const tx = db.transaction("transactions", "readwrite");
    const store = tx.objectStore("transactions");

    store.add(data);

    tx.oncomplete = () => {
      showNotification("Transaction saved.Please Refresh !");
    };

    tx.onerror = () => {
      alert("Failed to save transaction.");
    };
  };
}



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

// Example usage
function saveExampleTransaction() {
  const username = localStorage.getItem("loggedInUser"); // from login
  if (!username) return alert("User not logged in.");

  const transaction = {
    username,
    amount: 2000,
    type: "CashOut",
    source: "Rent",
    desc: "Monthly apartment rent",
    supportFile: "rent_receipt.pdf",
    day: "2025-07-01"
  };

  addTransaction(transaction);
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

    user.budget = document.getElementById("currbudget").value;

    const updateRequest = store.put(user);

    updateRequest.onsuccess = () => {
      console.log("Budget set successfully:", user);
      localStorage.setItem('userbudget', document.getElementById("currbudget").value);
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
