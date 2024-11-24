import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login,logout } from './login'; // importing my functions
//import { updateData } from './updateSettings'; // importing my functions
import { updateSettings,updateData } from './updateSettings'; // importing my functions

// DOM ELEMENTS
const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.login--form');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

//DELEGATION
if(mapbox){
    const locations = JSON.parse(mapbox.dataset.locations);
    displayMap(locations);

}

if(loginForm)
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    }); 


if(logOutBtn){
    logOutBtn.addEventListener('click', logout)
}

if(userDataForm)
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        console.log('update Index');
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        //updateData(name, email);
        updateSettings({name,email}, 'data');
    });    

if(userPasswordForm){    
    userPasswordForm.addEventListener('submit', e => {
        e.preventDefault();
       
        console.log('update Index password');
       // document.querySelector('.btn--save-password').textContent = 'Updating';

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        updateSettings({passwordCurrent,password,passwordConfirm}, 'password');

        // document.querySelector('.btn--save-password').textContent = 'Save Password';
        // document.getElementById('password-current').value = '';
        // document.getElementById('password').value = '';
        // document.getElementById('password-confirm').value = '';
    });  
}
