import axios from "axios";
import { showAlert } from "./alert";

export const login = async (email, password) => {
  try {
    const url = "/api/v1/users/login";
    const payload = {
      email,
      password,
    };

    const request = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!request.ok) throw Error("Failed to login", request.statusText);

    const res = await request.json();

    if (res.data.status === "success") {
      // from the api
      showAlert("success", "Logged in successfully!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", "Password or email is wrong, Please try again!");
  }
};

export const logout = async () => {
  try {
    debugger;

    const res = await axios({
      method: "GET",
      url: "/api/v1/users/logout",
    });

    if (res.data.status === "success") location.reload(true); // helps to reload page straight from the server
  } catch (err) {
    console.log(err.response);
    showAlert("error", "Error logging out! Try again");
  }
};

// const login = async(email, password) => {
//     try {
//         const res = await axios({
//             method: 'POST',
//             url: 'http://127.0.0.1:3000/api/v1/users/login',
//             data: {
//                 email,
//                 password
//             }
//         })
//         //console.log(res);
//     if(res.data.status === 'success'){ // from the api
//         alert('Logged in successfully!');
//         window.setTimeout(()=>{
//             location.assign('/');
//         }, 1500);  //1,5 milliseconds
//     }
//     } catch (err) {
//         alert(err.response.data.message);
//     }

// };

// console.log('File loaded');

// document.querySelector('.form').addEventListener('submit', (e) => {
//     e.preventDefault();
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     login(email, password);
// });
