import { domain } from "./config.js"

const socket = io(domain)
const txtName = document.getElementById('txtName')
const txtPass = document.getElementById('txtPass')
const btnAdd = document.getElementById('btnAdd')

//form
const createRoom = document.getElementById('createRoom')
createRoom.setAttribute('method','post')
createRoom.setAttribute('action','/chat')

btnAdd.addEventListener('click',()=>{
    socket.emit('user create Room',{nameRoom:txtName.value,passRoom:txtPass.value})
})
