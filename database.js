
let db;
const request = indexedDB.open("userDB", 1);

request.onupgradeneeded = function (e) {
  db = e.target.result;
  const store = db.createObjectStore("users", { keyPath: "username" });
  store.createIndex("email", "email", { unique: true });
};

request.onsuccess = function (e) {
  db = e.target.result;
  console.log(" db connected success");
};

request.onerror = function () {
  alert("IndexedDB failed to load.");
};  