import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login,logout } from './login';
import { updateData } from './updateSettings';

// DOM ELEMENTS
const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.login--form');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');

//DELEGATION
if(mapbox){
    const locations = JSON.parse(mapbox.dataset.locations);
    displayMap(locations);

}

if(loginForm){
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    }); 
}

if(logOutBtn){
    logOutBtn.addEventListener('click', logout)
}

if(userDataForm){
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        updateData(name, email);
    });    
}