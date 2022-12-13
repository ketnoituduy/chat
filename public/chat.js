
import { domain } from "./config.js"

const socket = io(domain)

// const ulUsername = document.querySelector('ul')
const logout = document.getElementById('logout')
// const listUser = document.getElementById('listUser')
const textSend = document.getElementById('textSend')
const btnSend = document.getElementById('btnSend')
const title = document.querySelector('.title')
const chat = document.getElementById('chat')
const btnListRooms = document.getElementById('listRooms')
const btnSetting = document.querySelector('.btnSetting')
const btnClose = document.querySelector('.bxs-x-circle')
const dropdown = document.querySelector('.dropdown')
const fileInput = document.getElementById('inputFile')
const fileChange = document.getElementById('file')
const btnChange = document.getElementById('change')

let clickLogout = false
let clickRooms = false
//let clickSetting = false
let privateChat = false
let valueBase64String = ''
let typeFile = ''
let fileUpload = ''
let fileAvatar = ''
let arrayFile = []
let count = 0
let countDelete = 0
let currentUser = ''
let visitedUser = ''
let currentEmail = ''
let visitedEmail = ''
let img = ''
let imgVisited = ''
let nameRoom = ''

fileChange.addEventListener('change', async function(e){
    const reader = new FileReader()
    reader.addEventListener('load',()=>{
        fileAvatar = reader.result
        const imgAvatar =  document.getElementById('imgAvatar')
        imgAvatar.style.background = `url(${fileAvatar})`
        imgAvatar.style.width = '150px'
        imgAvatar.style.height = '150px'    
        imgAvatar.style.backgroundPosition = 'center'
        imgAvatar.style.backgroundRepeat = 'no-repeat'
        imgAvatar.style.backgroundSize = 'cover'
        imgAvatar.style.borderRadius = '50%'
        console.log(fileChange.value)
    })
    reader.readAsDataURL(fileChange.files[0])
})

fileInput.addEventListener('change',function(e){
    const reader = new FileReader();
    reader.addEventListener('load', ()=>{
        // arrayFile.push(reader.result)
        createFileDownload(reader.result)
        const d = new Date()
        const day = d.getDate()
        const month = d.getMonth() + 1
        const year = d.getFullYear()
        const minute = d.getMinutes()
        const second = d.getSeconds()
        const hour = d.getHours()
        const dayString = hour + ':' + minute + ':' + second + ' ' + day + '/' + month + '/' + year
        if (privateChat == false){
            socket.emit('user send message',{message:'',file:fileUpload,day:dayString,username:currentUser,email:currentEmail,nameRoom:nameRoom,img:img})
        }
        else{
            socket.emit('user send privateMessage',{message:'',file:fileUpload,day:dayString,fromName:currentUser,toName:visitedUser,fromEmail:currentEmail,toEmail:visitedEmail,imgFromName:img,imgToName:imgVisited})
        }
    })
    reader.readAsDataURL(fileInput.files[0]);
})

function Download(data,filename){
    const linkSource = `data:application/${typeFile};base64,${data}`
    const downloadLink = document.createElement('a')
    const fileName =  filename + `.${typeFile}`
    downloadLink.href = linkSource
    downloadLink.download = fileName
    downloadLink.click()
}
function DownloadFile(){
    Download(valueBase64String,'test')
}
function upload(){
    const oldPass = document.getElementById('oldpassword')
    const newPass = document.getElementById('newpassword')
    const repeatPass = document.getElementById('repeatnewpassword')
    const newName = document.getElementById('newName')
    if (oldPass.value.trim() != '' && newPass.value.trim() != '' && repeatPass.value.trim() != ''){
        if (newPass.value.trim() == repeatPass.value.trim()){
            socket.emit('user change',{oldPass:oldPass.value.trim(),newPass:newPass.value.trim(),email:currentEmail,avatar:fileAvatar,name:newName.value.trim()})
        }
        else{
            alert('Nhập lai mật khẩu cho chính xác')
        }
    }
    if (oldPass.value.trim() == '' && newPass.value.trim() == '' && repeatPass.value.trim() == ''){
        if (newName.value.trim() != ''){
            socket.emit('user change',{oldPass:oldPass.value.trim(),newPass:newPass.value.trim(),email:currentEmail,avatar:fileAvatar,name:newName.value.trim()})
        }
    }
}

btnChange.addEventListener('click',()=>{
    if (fileAvatar != ''){
        upload()
        btnChange.setAttribute('type','submit')
        document.querySelector('.containerSetting').setAttribute('action','/login')
    }
    else{
        upload()
    }
})
socket.on('server send update pass success',(data)=>{
    alert('Cập nhật thành công')
    currentUser = data
    document.querySelector('.containerSetting').style.display = 'none'
})
socket.on('server send update pass failed',()=>{
    alert('Cập nhật thất bại')
})

logout.addEventListener('click',()=>{
   // socket.emit('user logout')
    //location = domain
    console.log('click')
    if (!clickLogout){
        document.querySelector('.setting').style.display = 'block'
        clickLogout = true
    }
    else{
        document.querySelector('.setting').style.display = 'none'
        clickLogout = false
    }
    
})
btnListRooms.addEventListener('click',()=>{
    if (clickRooms == true){
        clickRooms = false
        dropdown.style.display = 'none'
    }
    else{
        clickRooms = true
        dropdown.style.display = 'block'
    }
})
btnSetting.addEventListener('click',()=>{
    document.querySelector('.containerSetting').style.display = 'flex'
})
btnClose.addEventListener('click',()=>{
    document.querySelector('.containerSetting').style.display = 'none'
    document.getElementById('imgAvatar').style.background = 'transparent'
    document.getElementById('imgAvatar').style.width = '0px'
    document.getElementById('imgAvatar').style.height = '0px'
    fileAvatar = ''
})

btnSend.addEventListener('click',()=>{
    
    if (textSend.value.trim()){
        const message = textSend.value
        const d = new Date()
        const day = d.getDate()
        const month = d.getMonth() + 1
        const year = d.getFullYear()
        const minute = d.getMinutes()
        const second = d.getSeconds()
        const hour = d.getHours()
        const dayString = hour + ':' + minute + ':' + second + ' ' + day + '/' + month + '/' + year
        textSend.value = ''

       // send text co emoji
        const a = message.replace(/\p{Emoji}/ug, (m, idx) =>
            `[e-${m.codePointAt(0).toString(16)}]`
        )
        if (privateChat == false){
            socket.emit('user send message',{message:a,file:'',day:dayString,username:currentUser,email:currentEmail,nameRoom:nameRoom,img:img})
        }
        else{
           
            socket.emit('user send privateMessage',{message:a,file:'',day:dayString,fromName:currentUser,toName:visitedUser,fromEmail:currentEmail,toEmail:visitedEmail,imgFromName:img,imgToName:imgVisited})
        }
       
    }
})

socket.on('server send Rooms',data =>{
    dropdown.innerText = ''
    data.mangRoom.forEach(e =>{
        // arrayRooms.push(e.name)
        const a = document.createElement('a')
        a.innerText = `${e.name}`
        dropdown.appendChild(a)
        a.addEventListener('click',()=>{
            socket.emit('user select Room',e.name)
            nameRoom = e.name
            title.innerText = nameRoom
        })
    })
})
socket.on('server send dataChat',data =>{
    privateChat = false
    count = 0
    countDelete = 0
    chat.innerText = ''
    arrayFile = []
    data.forEach(e =>{
        if (e.file && e.file != ''){
            arrayFile.push(e.file)
        }
        create_message(e)
       
    })
    chat.scrollTo(0,chat.scrollHeight)
})
socket.on('server tao phong chat',(data)=>{
   
    // if (currentEmail != ''){
    //     location = domain
    //     return
    // }
    privateChat = false
    title.innerText = data.nameRoom
    nameRoom = data.nameRoom
    if (currentUser == '' && currentEmail == ''){
        currentUser = data.currentUsername
        currentEmail = data.email
        img = data.img
    }
   
    arrayFile = []
    data.dataChat.forEach(element => {
        if (element.file && element.file != ''){
            arrayFile.push(element.file)
        }
        create_message(element)
        
    });
    chat.scrollTo(0,chat.scrollHeight)
    console.log('current Email',currentEmail,'current User',currentUser,'img',data.img)
})
socket.on('server send privateChat',data =>{
    privateChat = true
    console.log('hello privateChat',data)
    title.innerText = 'Private Chat'
    count = 0
    countDelete = 0
    chat.innerText = ''
    arrayFile = []
    data.forEach(e =>{
        if (e.file && e.file != ''){
            arrayFile.push(e.file)
        }
        create_message(e)
       
    })
    chat.scrollTo(0,chat.scrollHeight)
})
socket.on('server send message',data=>{
    if (data.message == ''){
        // dataChat.push(data)
        arrayFile.push(data.file)
        createFileDownload(data.file)
    }
  
    if (nameRoom == data.nameRoom && privateChat == false){
        // dataChat.push(data)
        create_message(data)
        chat.scrollTo(0,chat.scrollHeight)
    }
   
})
socket.on('server send message delete', (data)=>{
    const content = document.getElementById(`${data.id}`).childNodes[0]
    content.innerText = 'Tin nhắn đã bị thu hồi'
    content.style.background = 'gray'
})
socket.on('server send privateMessage delete', (data)=>{
    const content = document.getElementById(`${data.id}`).childNodes[0]
    content.innerText = 'Tin nhắn đã bị thu hồi'
    content.style.background = 'gray'
})

socket.on('server send privateMessage',data =>{
    if (data.message == ''){
        arrayFile.push(data.file)
        createFileDownload(data.file)
    }
    if(((data.toEmail == visitedEmail && data.fromEmail == currentEmail)||(data.toEmail == currentEmail && data.fromEmail == visitedEmail)) && privateChat == true){
        create_message(data)
        chat.scrollTo(0,chat.scrollHeight)
    }
    
})

function create_message(data){
    const wrapperContent = document.createElement('div')
    wrapperContent.setAttribute('id',`wrapper${countDelete}`)
    wrapperContent.style.display = 'flex'
    wrapperContent.style.width = '100%'
    wrapperContent.style.padding = '5px'
    wrapperContent.style.backgroundImage = 'linear-gradient(to right, black,gray)'
    chat.appendChild(wrapperContent)

    const content = document.createElement('div')
    content.setAttribute('id','contentMessage')
    // content.style.display = 'inline-block'
    content.style.position = 'relative'
    content.style.borderRadius = '7px'
    content.style.padding = '5px'
    content.style.maxWidth = '250px'

    const name = document.createElement('div')
    name.style.cursor = 'pointer'
    name.style.textTransform = 'capitalize'
    name.style.color = 'red'
    name.style.fontSize = '1.3em'
    name.style.margin = '0'
    name.innerText = data.username + ':'
    content.appendChild(name)


    
   
    if (privateChat == false){
        const avatar = document.createElement('div')
        avatar.style.background = `url(${data.img})`
        avatar.style.backgroundSize = 'cover'
        avatar.style.backgroundPosition = 'center'
        avatar.style.backgroundRepeat = 'no-repeat'
        avatar.style.width = '50px'
        avatar.style.height = '50px'
        avatar.style.borderRadius = '50%'
        avatar.style.marginRight = '5px'
        wrapperContent.appendChild(avatar)
        if (data.email == currentEmail){
            wrapperContent.style.justifyContent = 'flex-end'
            const btnDelete = document.createElement('button')
            btnDelete.style.display = 'flex'
            btnDelete.style.alignItems = 'center'
            btnDelete.style.justifyContent = 'center'
            btnDelete.innerHTML = `<i class='bx bxs-message-square-x'></i>`
            btnDelete.style.position = 'absolute'
            btnDelete.style.width = '25px'
            btnDelete.style.height = '25px'
            btnDelete.style.right = '5px'
            btnDelete.style.top = '-5px'
            btnDelete.style.cursor = 'pointer'
            btnDelete.style.fontSize = '1.2em'
            btnDelete.style.color = 'red'
            content.appendChild(btnDelete)
    
            btnDelete.addEventListener('click',(e)=>{
                const id = btnDelete.parentNode.parentNode.id
                socket.emit('user delete message',{day:data.day,id:id})
            })
        }
        else{
            name.addEventListener('click',()=>{
                privateChat = true
                const fromEmail = currentEmail
                const toEmail = data.email
                visitedEmail = toEmail
                visitedUser = data.username
                socket.emit('currentUser send visitedUser',{fromEmail:fromEmail,toEmail:toEmail})
            })
            wrapperContent.style.justifyContent = 'flex-start'
            name.style.color = 'blue'
        }
    }
    else{
        const avatar = document.createElement('div')
        avatar.style.background = `url(${data.imgFromName})`
        avatar.style.backgroundSize = 'cover'
        avatar.style.backgroundPosition = 'center'
        avatar.style.backgroundRepeat = 'no-repeat'
        avatar.style.width = '50px'
        avatar.style.height = '50px'
        avatar.style.borderRadius = '50%'
        avatar.style.marginRight = '5px'
        wrapperContent.appendChild(avatar)
        if (data.fromEmail == currentEmail ){
            name.innerText = data.fromName + ':'
            wrapperContent.style.justifyContent = 'flex-end'
            const btnDelete = document.createElement('button')
            btnDelete.style.display = 'flex'
            btnDelete.style.alignItems = 'center'
            btnDelete.style.justifyContent = 'center'
            btnDelete.innerHTML = `<i class='bx bxs-message-square-x'></i>`
            btnDelete.style.position = 'absolute'
            btnDelete.style.width = '25px'
            btnDelete.style.height = '25px'
            btnDelete.style.right = '5px'
            btnDelete.style.top = '-5px'
            btnDelete.style.cursor = 'pointer'
            btnDelete.style.fontSize = '1.2em'
            btnDelete.style.color = 'red'
            content.appendChild(btnDelete)
    
            btnDelete.addEventListener('click',(e)=>{
                const id = btnDelete.parentNode.parentNode.id
                socket.emit('user delete privateMessage',{day:data.day,id:id,fromEmail:currentEmail,toEmail:visitedEmail})
            })
        }
        else{
            if (privateChat != true){
                name.addEventListener('click',()=>{
                    privateChat = true
                    const fromEmail = currentEmail
                    const toEmail = data.email
                    visitedEmail = toEmail
                    visitedUser = data.username
                    socket.emit('currentUser send visitedUser',{fromEmail:fromEmail,toEmail:toEmail})
                })
            }
            wrapperContent.style.justifyContent = 'flex-start'
            name.innerText = data.fromName + ':'
            name.style.color = 'blue'
            
        }
    }
    
    content.style.background = 'white'
    wrapperContent.appendChild(content)

    const message = document.createElement('div')
    if (data.message != '' && (data.file == '' || data.file == null)){
        //tai text co chua emoji
        const a = data.message.replace(/\[e-([0-9a-fA-F]+)\]/g, (match, hex) =>
            String.fromCodePoint(Number.parseInt(hex, 16))
        );
        message.innerText = a
        message.style.fontSize = '1.2em'
        message.style.color = 'black'
    }
    if(data.message == '' && data.file != ''){
        message.style.background = `url(${data.file})`
        message.style.width = '200px';
        message.style.height = '200px';
        message.style.backgroundPosition = 'center';
        message.style.backgroundRepeat = 'no-repeat';
        message.style.backgroundSize = 'cover';
        message.style.borderRadius = '5px';

        const btnDownload = document.createElement('button')
        btnDownload.style.display = 'flex'
        btnDownload.style.alignItems = 'center'
        btnDownload.style.justifyContent = 'center'
        btnDownload.innerHTML = `<i class='bx bxs-download'></i>`
        btnDownload.style.position = 'absolute'
        btnDownload.style.width = '25px'
        btnDownload.style.height = '25px'
        btnDownload.style.right = '5px'
        btnDownload.style.bottom = '-7px'
        btnDownload.style.cursor = 'pointer'
        btnDownload.style.fontSize = '1.2em'
        btnDownload.style.color = 'blue'
        btnDownload.setAttribute('id',`${count}`)
        content.appendChild(btnDownload)
        btnDownload.addEventListener('click',(e)=>{
            createFileDownload(arrayFile[btnDownload.id])
            DownloadFile()
        })
        count++
    }
    content.appendChild(message)
    const day = document.createElement('i')
    day.style.color = 'gray'
    day.innerText = data.day
    content.appendChild(day)
    countDelete++
    if (data.message == '' && data.file == ''){
        message.innerText = 'Removed'
        content.style.background = 'gray'
        day.style.color = 'black'
    }
    
}

function createFileDownload(file){
    fileUpload = file
    var replaceValue = fileUpload.split(',')[0]
    var base64String = fileUpload.replace(replaceValue + ',','')
    valueBase64String = base64String
    const num1 = replaceValue.indexOf('/')
    const num2 = replaceValue.indexOf(';')
    const num = num2 - num1 - 1
    typeFile = replaceValue.substr(num1+1,num)
}


