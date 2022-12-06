
const DB_PORT = process.env.PORT || 3000
const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_USER = process.env.DB_USER || 'root'
const DB_PASSWORD = process.env.DB_PASSWORD || '123'
const DB_NAME = process.env.DB_NAME || 'chatDatabase'

const express = require('express')
const app = express()
const server = require('http').Server(app)

server.listen(DB_PORT, ()=>{
    console.log('listen port 3000')
})

const router = express.Router()
router.get('/',(req,res) =>{
   res.render('login',{result:[]})
    // res.json({message:"helloooooooo"})
})
//body parse
var bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

//database
const mysql = require('mysql')
const dbChat = mysql.createConnection({
    user:DB_USER,
    password:DB_PASSWORD,
    host:DB_HOST,
    database:DB_NAME,
    port:DB_PORT
})

// const dbChat = mysql.createConnection({
//     user:'root',
//     password:'root123',
//     host:'localhost',
//     database:'chatDatabase'
// })

app.set('view engine','ejs')
app.set('views','./views')
app.use('/',router)
app.get('/register',(req,res) =>{
    res.render('register')
})
app.use(express.static(__dirname + '/public'));

//tao tai khoan
app.post('/',(req,res) =>{
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const rePassword = req.body.rePassword
    if (name && email && password && rePassword && (password == rePassword)){
        const query = `select * from account where (email = '${email}')`
        dbChat.query(query,(err,result) =>{
            if (err){
                console.log(err)
            }
            else{
                const kq = JSON.parse(JSON.stringify(result))
                if (kq.length > 0){
                    console.log('tai khoan khong hop le')
                }
                else{
                    const info = `insert into account (username, email, password) values ('${name}','${email}','${password}');`
                    dbChat.query(info,(err,result) =>{
                        if (err){
                            console.log(err)
                        }
                        else{
                            currentEmail = email
                            currentPassword = password
                            currentUsername = name
                            res.render('login',{result: [name,email,password]})
                        }
                    })
                }
            }
        })
    }
    else{
        console.log('thieu thong tin dang nhap hoac dien sai thong tin')
    }
    
})

//kiem tra login
app.post('/rooms',(req,res)=>{
    const email = req.body.email
    const password = req.body.pass
    const query = `select * from account where (email = '${email}') and (password = '${password}');`
    dbChat.query(query,(err,result) =>{
        if (err){
            console.log(err)
        }
        else{
            const kq = JSON.parse(JSON.stringify(result))
            //neu da co tai khoan thi dang nhap thanh cong
            if (kq.length > 0){
                const username = `select username from account where (email = '${email}');`
                dbChat.query(username,(err,result)=>{
                    if (err){
                        console.log(err)
                    }
                    else{
                        const index = mangEmail.indexOf(email)
                        if (index == -1){
                            const kq = JSON.parse(JSON.stringify(result))
                            currentUsername = kq[0].username
                            currentEmail = email
                            res.render('rooms')
    
                            const query = `select name,pass,email from rooms;`
                            dbChat.query(query,(err,result)=>{
                                if (err){
                                    console.log(err)
                                }
                                else{
                                    const kq = JSON.parse(JSON.stringify(result))
                                    mangRoom = kq
                                }
                            })
                        }
                        else{
                            console.log('tai khoan da dang nhap')
                        }
                        
                    }
                })
                
            }
            else{
                console.log('thong tin dang nhap khong chinh xac')
            }
        }
    })
})
//tao room
app.post('/createRoom',(req,res)=>{
    res.render('createRoom')
})
//vao phong chat
app.post('/chat/:id',(req,res) =>{
    nameRoom = req.params.id
    if (enterRoom == true){
        res.render('chat')
    }
   
})
//chat room 
// app.post('/chat',(req,res) =>{
   
//     const name = req.body.name
//     const pass = req.body.pass
    
//     if (name){
//         const query = `insert into rooms (name,pass,email) values ('${name}','${pass}','${currentEmail}')`
//         dbRooms.query(query,(err,result)=>{
//             if (err){
//                 console.log(err)
//             }
//             else{
//                 res.render('chat')
//             }
//         })
//     }
//     else{
//         res.render('rooms')
//     }
// })

let currentEmail = ''
let currentUsername = ''
// let mangUser = []
let mangRoom = []
let mangEmail = []
let enterRoom = false
let dataChat = []
let nameRoom = ''

//maxHttp dung de tang dung luong tai hon 1MB
const io = require('socket.io')(server,{
    maxHttpBufferSize: 1e8, pingTimeout: 60000
})
       
io.on('connection',socket =>{
    console.log('ket noi thanh cong')
    mangEmail.push(currentEmail)
    socket.userName = currentUsername
    socket.email = currentEmail
    // mangUser.push(currentUsername)
    // socket.emit('server send user',socket.userName)
    // io.sockets.emit('danh sach user',mangUser)
    socket.on('disconnect',()=>{
        // const number = mangUser.indexOf(socket.userName)
        // mangUser.splice(number,1)
        // socket.broadcast.emit('danh sach user',mangUser)
        const num = mangEmail.indexOf(socket.email)
        mangEmail.splice(num,1)
        console.log('mat ket noi')
    })
    socket.emit('server send Rooms',{mangRoom:mangRoom,email:socket.email,username:currentUsername})
    socket.on('user vao phong chat',(data)=>{
        currentEmail = data.email
        currentUsername = data.username
        enterRoom = true
        nameRoom = data.nameRoom
        let query = `select * from chat where (nameRoom = '${nameRoom}')`
        dbChat.query(query,(err,result) =>{
        if (err){
            console.log(err)
        }
        else{
            const kq = JSON.parse(JSON.stringify(result))
            dataChat = kq
        }
        })
    })
    socket.on('user send message', (data)=>{
        console.log('hello data')
        let query = `insert into chat (nameRoom,username,email,message,day,file) values ('${data.nameRoom}','${data.username}','${data.email}','${data.message}','${data.day}','${data.file}')`
        dbChat.query(query,(err,result) =>{
            if (err){
                console.log(err)
            }
            else{
                io.sockets.emit('server send message',data)
            }
        })
     })
    socket.emit('server tao phong chat',{dataChat:dataChat,nameRoom:nameRoom,currentUsername:currentUsername,email:currentEmail})
    socket.on('user select Room',name =>{
    const query = `select * from chat where (nameRoom = '${name}')`
    dbChat.query(query,(err,result)=>{
        if (err){
            console.log(err)
        }
        else{
            const kq = JSON.parse(JSON.stringify(result))
            socket.emit('server send dataChat',kq)
        }
    })
    })
    
})