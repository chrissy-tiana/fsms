import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyDtgYaJPlRzda-NZe9mr1pI0Cs_bhueYT8",
//   authDomain: "fsms-fb.firebaseapp.com",
//   databaseURL: "https://fsms-fb-default-rtdb.firebaseio.com",
//   projectId: "fsms-fb",
//   storageBucket: "fsms-fb.firebasestorage.app",
//   messagingSenderId: "22385539603",
//   appId: "1:22385539603:web:5c0c67d91a3790d8f7dde6",
//   measurementId: "G-T6RY6WKVR7",
// };

const firebaseConfig = {
  apiKey: "AIzaSyB-B8DlNFlfd_JPyvOHooyDXYSMMv-4ljQ",
  authDomain: "filling-station-5e129.firebaseapp.com",
  databaseURL: "https://filling-station-5e129-default-rtdb.firebaseio.com",
  projectId: "filling-station-5e129",
  storageBucket: "filling-station-5e129.firebasestorage.app",
  messagingSenderId: "534032097688",
  appId: "1:534032097688:web:15b5027ad1dfff931a0bed",
  measurementId: "G-RMVBYY1ELJ",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

signInWithEmailAndPassword(auth, "christyminiproject@gmail.com", "1234567890")
  .then((userCredential) => {
    console.log("Signed in as:", userCredential.user.uid);

    // Write data
    const refPath = ref(db, "messages/firstMessage");
    return set(refPath, {
      text: "Hello FSMS!",
      createdBy: userCredential.user.email,
    });
  })
  .then(() => {
    console.log("Data written successfully!");
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });

export { database };
