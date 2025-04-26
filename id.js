const time = document.querySelector(".time_text");
const params = new URLSearchParams(window.location.search);

document.addEventListener('click', () => {
  if (document.fullscreenElement == null) {
    document.body.requestFullscreen().catch(console.error);
  }
});

const firstname = params.get("firstname") || "JAN";
const surname = params.get("surname") || "KOWALSKI";
const borndate = params.get("borndate") || "01.01.1990";
const pesel = params.get("pesel") || "90010112345";

document.querySelector(".firstname").textContent = firstname.toUpperCase();
document.querySelector(".surname").textContent = surname.toUpperCase();
document.querySelector(".borndate").textContent = borndate;
document.querySelector(".pesel").textContent = pesel;

setClock();
function setClock() {
  const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
  const now = new Date();
  time.textContent = `Czas: ${now.toLocaleTimeString("pl-PL")} ${now.toLocaleDateString("pl-PL", options)}`;
  setTimeout(setClock, 1000);
}

document.querySelector('.bottom_update_value').textContent = new Date().toLocaleDateString("pl-PL");

// Profile image from IndexedDB
document.addEventListener('DOMContentLoaded', getImageFromIndexedDB);

function getImageFromIndexedDB() {
  const request = indexedDB.open("PWAStorage", 1);

  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains("images")) {
      db.createObjectStore("images", { keyPath: "id" });
    }
  };

  request.onsuccess = (e) => {
    const db = e.target.result;
    const tx = db.transaction("images", "readonly");
    const store = tx.objectStore("images");
    const getReq = store.get("profileImage");

    getReq.onsuccess = () => {
      if (getReq.result) {
        document.querySelector('.id_own_image').style.backgroundImage = `url('${getReq.result.data}')`;
      } else {
        console.log("No image found, showing upload option");
        showImageUploadOption();
      }
    };
  };
}

function showImageUploadOption() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.click();
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      storeImageInIndexedDB(dataUrl);
      document.querySelector('.id_own_image').style.backgroundImage = `url('${dataUrl}')`;
    };
    reader.readAsDataURL(file);
  };
}

function storeImageInIndexedDB(dataUrl) {
  const request = indexedDB.open("PWAStorage", 1);
  request.onsuccess = (e) => {
    const db = e.target.result;
    const tx = db.transaction("images", "readwrite");
    const store = tx.objectStore("images");
    store.put({ id: "profileImage", data: dataUrl });
  };
}
