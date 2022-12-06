import { domainRegister } from "./config.js"

const create = document.getElementById('singup')
create.addEventListener('click',()=>{
    window.location = domainRegister
})