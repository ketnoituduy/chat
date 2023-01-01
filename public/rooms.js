import { domain } from "./config.js"
const socket = io(domain)
const rooms = document.getElementById('rooms')
const danhsachRoom = document.getElementById('danhsachRoom')
const ulRoom = document.querySelector('ul')

danhsachRoom.setAttribute('method','post')
// danhsachRoom.setAttribute('action','/chat')
let email = ''
let currentUser = ''
let img = ''
socket.on('server send Rooms',data =>{
    email = data.email
    currentUser = data.username
    img = data.img
    ulRoom.innerText = ''
    data.mangRoom.forEach(element => {
        const name = document.createElement('li')
        name.style.background = 'black'
        name.style.position = 'relative'
        name.style.borderColor = 'brown'
        ulRoom.append(name)
        const submit = document.createElement('input')
        submit.style.width = '100%'
        submit.setAttribute('type','submit')
        submit.setAttribute('value',element.name)   
        submit.style.border = 'none'
        submit.style.color = 'white'
        submit.style.background = 'transparent'
        submit.style.fontSize = '1em'
        submit.style.cursor = 'pointer'
        submit.style.color = 'white'
        name.append(submit)
        submit.addEventListener('click',(e)=>{
            danhsachRoom.setAttribute('action',`/chat/${element.name}`)
            socket.emit('user vao phong chat',{nameRoom:element.name,email:email,username:currentUser,img:img})
        })

        const key = document.createElement('span')
        key.style.position = 'absolute'
        key.style.right = '5px'
        if (element.pass){
            key.innerHTML = `<i class='bx bxs-lock-alt'></i>`
            name.append(key)
        }
        // name.addEventListener('click',()=>{
        //     let xhr = new XMLHttpRequest();
        //     xhr.open("POST", '/chat',true);
        //     xhr.send({name:'vu',tuoi:1986})
        //     window.location = 'http://localhost:3000/chat'
        // })
        
    });
})