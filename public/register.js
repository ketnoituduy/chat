import { domain } from "./config.js"

const email = document.getElementById('email')
const password = document.getElementById('password')
const btnReadyAccount = document.getElementById('btnReadyAccount')
btnReadyAccount.addEventListener('click',()=>{
    window.location = domain
})