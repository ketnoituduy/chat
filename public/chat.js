const socket = io('https://chat-production-049e.up.railway.app/')

// const ulUsername = document.querySelector('ul')
const logout = document.getElementById('logout')
// const listUser = document.getElementById('listUser')
const textSend = document.getElementById('textSend')
const btnSend = document.getElementById('btnSend')
const title = document.querySelector('.title')
const chat = document.getElementById('chat')
const btnListRooms = document.getElementById('listRooms')
const dropdown = document.querySelector('.dropdown')
const fileInput = document.getElementById('inputFile')

let valueBase64String = ''
let typeFile = ''
let fileUpload = ''
let arrayFile = []
let count = 0
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
        const hour = d.getHours()
        const dayString = hour + ':' + minute + ' ' + day + '/' + month + '/' + year
        socket.emit('user send message',{message:'',file:fileUpload,day:dayString,username:currentUser,email:currentEmail,nameRoom:nameRoom})
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

let currentUser = ''
let currentEmail = ''
let nameRoom = ''
// let arrayRooms = []


logout.addEventListener('click',()=>{
    location = 'https://chat-production-049e.up.railway.app/'
})
btnSend.addEventListener('click',()=>{
    
    if (textSend.value.trim()){
        const message = textSend.value
        const d = new Date()
        const day = d.getDate()
        const month = d.getMonth() + 1
        const year = d.getFullYear()
        const minute = d.getMinutes()
        const hour = d.getHours()
        const dayString = hour + ':' + minute + ' ' + day + '/' + month + '/' + year
        textSend.value = ''

       // send text co emoji
        const a = message.replace(/\p{Emoji}/ug, (m, idx) =>
            `[e-${m.codePointAt(0).toString(16)}]`
        )
        console.log('asdsad',a)

        socket.emit('user send message',{message:a,file:'',day:dayString,username:currentUser,email:currentEmail,nameRoom:nameRoom})
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
    count = 0
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
    title.innerText = data.nameRoom
    nameRoom = data.nameRoom
    currentUser = data.currentUsername
    currentEmail = data.email
    arrayFile = []
    data.dataChat.forEach(element => {
        if (element.file && element.file != ''){
            arrayFile.push(element.file)
        }
        create_message(element)
    });
    chat.scrollTo(0,chat.scrollHeight)
})
socket.on('server send message',data=>{
    if (data.message == ''){
        arrayFile.push(data.file)
        createFileDownload(data.file)
    }
    console.log('typeFile',fileUpload,typeFile)
    if (nameRoom == data.nameRoom){
        create_message(data)
        chat.scrollTo(0,chat.scrollHeight)
    }
   
})

function create_message(data){
    const wrapperContent = document.createElement('div')
    wrapperContent.style.display = 'flex'
    wrapperContent.style.width = '100%'
    wrapperContent.style.padding = '5px'
    wrapperContent.style.backgroundImage = 'linear-gradient(to right, black,gray)'
    chat.appendChild(wrapperContent)

    const content = document.createElement('div')
    // content.style.display = 'inline-block'
    content.style.position = 'relative'
    content.style.borderRadius = '7px'
    content.style.padding = '5px'
    content.style.maxWidth = '250px'
    if (data.email == currentEmail){
        wrapperContent.style.justifyContent = 'flex-end'
    }
    else{
        wrapperContent.style.justifyContent = 'flex-start'
    }
    content.style.background = 'white'
    wrapperContent.appendChild(content)

    const name = document.createElement('div')
    name.style.textTransform = 'capitalize'
    name.style.color = 'red'
    name.style.fontSize = '1.3em'
    name.style.margin = '0'
    name.innerText = data.username + ':'
    content.appendChild(name)

    const message = document.createElement('div')
    if (data.message != ''){
        //tai text co chua emoji
        const a = data.message.replace(/\[e-([0-9a-fA-F]+)\]/g, (match, hex) =>
            String.fromCodePoint(Number.parseInt(hex, 16))
        );
        message.innerText = a
        message.style.fontSize = '1.2em'
        message.style.color = 'black'
    }
    else{
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
        btnDownload.style.width = '30px'
        btnDownload.style.height = '30px'
        btnDownload.style.right = '5px'
        btnDownload.style.top = '-5px'
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


