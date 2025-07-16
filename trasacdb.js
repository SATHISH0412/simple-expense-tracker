const dbRequest = indexedDB.open("ExpenseTrackerDB", 1);

dbRequest.onupgradeneeded = function (e) {
  const db = e.target.result;

  if (!db.objectStoreNames.contains("users")) {
    const userStore = db.createObjectStore("users", { keyPath: "email" });
    userStore.createIndex("email", "email", { unique: true });
  }

  if (!db.objectStoreNames.contains("transactions")) {
    const transStore = db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true });
    transStore.createIndex("username", "username", { unique: false });
  }
};
