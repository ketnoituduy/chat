


const DB_PORT = process.env.PORT || 3000
// const DB_HOST = process.env.DB_HOST || 'localhost'
// const DB_USER = process.env.DB_USER || 'root'
// const DB_PASSWORD = process.env.DB_PASSWORD || '123'
// const DB_NAME = process.env.DB_NAME || 'chatDatabase'

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
const mysql = require('mysql2')
const { json } = require('express')
const dbChat = mysql.createConnection({
    user:'root',
    password:'ketGIW2NkSM8oBTibS7w',
    host:'containers-us-west-148.railway.app',
    database:'railway',
    port:6777
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
                const query = `select username,imgURL from account where (email = '${email}');`
                dbChat.query(query,(err,result)=>{
                    if (err){
                        console.log(err)
                    }
                    else{
                        const index = mangEmail.indexOf(email)
                        if (index == -1){
                            const kq = JSON.parse(JSON.stringify(result))
                            currentUsername = kq[0].username
                            currentImgURL = kq[0].imgURL
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
// app.post('/createRoom',(req,res)=>{
//     res.render('createRoom')
// })
//vao phong chat
app.post('/chat/:id',(req,res) =>{
    nameRoom = req.params.id
    console.log('param',req.params)
    if (enterRoom == true){
        res.render('chat')
    }
   
})
const fileUploader = require('./public/cloudinary');
app.post('/login',fileUploader.single('file'),(req,res,next)=>{
    if(!req.file){
        next(new Error('No file uploaded!'));
        return;
    }
    else{
       // console.log(req.file.path)
        const query1 = `update account set imgURL = '${req.file.path}' where email = '${currentEmail}'`
        dbChat.query(query1,(err,result)=>{
            if(err){
                console.log(err)
            }
            else{
                console.log('upload thanh cong')
            }
        })
        const query2 = `update chat set img = '${req.file.path}' where email = '${currentEmail}'`
        dbChat.query(query2,(err,result)=>{
            if(err){
                console.log(err)
            }
            else{
                console.log('upload thanh cong')
            }
        })
        res.render('login',{result:[]})
    }
})

let currentEmail = ''
let currentUsername = ''
let currentImgURL = ''
// let mangUser = []
let mangRoom = []
let mangEmail = []
let enterRoom = false
let dataChat = []
let nameRoom = ''
let users = []


//maxHttp dung de tang dung luong tai hon 1MB
const io = require('socket.io')(server,{
    maxHttpBufferSize: 1e8, pingTimeout: 60000
})
       
io.on('connection',socket =>{
    console.log('ket noi thanh cong',socket.id)
    
    users[currentEmail] = socket.id
    const query = `insert into connection (email) values ('${currentEmail}');`
    dbChat.query(query,(err,result)=>{
        if (err){
            console.log(err)
        }
        else{
            const query = `select email from connection`
            dbChat.query(query,(err,result)=>{
                mangEmail = []
                if (err){
                    console.log(err)
                }
                else{
                    const kq = JSON.parse(JSON.stringify(result))
                    kq.forEach(e => {
                        mangEmail.push(e.email)
                    });
                }
            })
        }
    })
    socket.userName = currentUsername
    socket.email = currentEmail
    socket.img = currentImgURL
    socket.on('disconnect',()=>{
        console.log('mat ket noi',socket.id)
        currentUsername = socket.userName
        currentEmail = socket.email
        currentImgURL = socket.img
        const query = `delete from connection where (email = '${socket.email}');`
        dbChat.query(query,(err,result)=>{
            if (err){
                console.log(err)
            }
            else{
                const query = `select email from connection`
                dbChat.query(query,(err,result)=>{
                    mangEmail = []
                    if (err){
                        console.log(err)
                    }
                    else{
                        const kq = JSON.parse(JSON.stringify(result))
                        kq.forEach(e => {
                            mangEmail.push(e.email)
                        });
                    }
                })
            }
        })
       
    })
    socket.emit('server send Rooms',{mangRoom:mangRoom,email:socket.email,username:currentUsername,img:currentImgURL})
    socket.on('user vao phong chat',(data)=>{
        currentEmail = data.email
        currentUsername = data.username
        currentImgURL = data.img
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
        let query = `insert into chat (nameRoom,username,email,message,day,file,img) values ('${data.nameRoom}','${data.username}','${data.email}','${data.message}','${data.day}','${data.file}','${data.img}')`
        dbChat.query(query,(err,result) =>{
            if (err){
                console.log(err)
            }
            else{
                io.sockets.emit('server send message',data)
            }
        })
     })
    socket.emit('server tao phong chat',{dataChat:dataChat,nameRoom:nameRoom,currentUsername:currentUsername,email:currentEmail,img:currentImgURL})
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
    socket.on('user delete message',data =>{
        console.log('delete message')
        const query = `update chat set message = '', file = '' where (day = '${data.day}')`
        dbChat.query(query,(err,result) =>{
            if (err){
                console.log(err)
            }
            else{
                io.sockets.emit('server send message delete',data)
            }
        })  
    })
    socket.on('user delete privateMessage',data =>{
        console.log('delete messsagePrivate')
        const query = `update privateChat set message = '', file = '' where (day = '${data.day}')`
        dbChat.query(query,(err,result) =>{
            if (err){
                console.log(err)
            }
            else{
                io.to(users[data.fromEmail]).emit('server send privateMessage delete',data)
                io.to(users[data.toEmail]).emit('server send privateMessage delete',data)
            }
        })
    })
    socket.on('currentUser send visitedUser',data =>{
        const query = `select * from privateChat where ((fromEmail = '${data.fromEmail}') and (toEmail = '${data.toEmail}')) or ((fromEmail = '${data.toEmail}') and (toEmail = '${data.fromEmail}')) ;`
        dbChat.query(query,(err,result)=>{
            if (err){
                console.log(err)
            }
            else{
                const kq = JSON.parse(JSON.stringify(result))
                socket.emit('server send privateChat',kq)
            }
        })

    })
    socket.on('user send privateMessage',data =>{
        const query = `insert into privateChat (fromEmail,toEmail,message,file,day,fromName,toName,imgFromName,imgToName) values ('${data.fromEmail}','${data.toEmail}','${data.message}','${data.file}','${data.day}','${data.fromName}','${data.toName}','${data.imgFromName}','${data.imgToName}');`
        dbChat.query(query,(err,result) =>{
            if (err){
                console.log(err)
            }
            else{
                io.to(users[data.fromEmail]).emit('server send privateMessage',data)
                io.to(users[data.toEmail]).emit('server send privateMessage',data)
            }
        })
    })

    socket.on('user change',data=>{
        if (data.name == ''){
            const query = `update account set password = '${data.newPass}' where (password = '${data.oldPass}' and email = '${data.email}');`
            dbChat.query(query,(err,result)=>{
                if(err){
                    console.log(err)
                }
                else{
                    const kq = JSON.parse(JSON.stringify(result))
                    
                    if (kq.affectedRows != 0){
                        socket.emit('server send update pass success')
                    }
                    else{
                        socket.emit('server send update pass failed')
                    }
                }
            })
        }
        if (data.name != '' && data.newPass != ''){
            const query1 = `update account set username = '${data.name}',password = '${data.newPass}' where (password = '${data.oldPass}' and email = '${data.email}');`
            dbChat.query(query1,(err,result)=>{
                if(err){
                    console.log(err)
                }
                else{
                    const kq = JSON.parse(JSON.stringify(result))
                    
                    if (kq.affectedRows != 0){
                        socket.emit('server send update pass success')
                    }
                    else{
                        socket.emit('server send update pass failed')
                    }
                }
            })
            const query2 = `update chat set username = '${data.name}' where email = '${data.email}'`
            dbChat.query(query2,(err,result)=>{
                if(err){
                    console.log(err)
                }
            })
            const query3 = `update privateChat set fromName = '${data.name}' where fromEmail = '${data.email}'`
            dbChat.query(query3,(err,result)=>{
                if(err){
                    console.log(err)
                }
            })

        }
        if (data.name != '' && data.newPass == ''){
            const query = `update account set username = '${data.name}' where (email = '${data.email}');`
            dbChat.query(query,(err,result)=>{
                if(err){
                    console.log(err)
                }
                else{
                    const kq = JSON.parse(JSON.stringify(result))
                    
                    if (kq.affectedRows != 0){
                        socket.emit('server send update pass success',data.name)
                    }
                    else{
                        socket.emit('server send update pass failed')
                    }
                }
            })
            const query2 = `update chat set username = '${data.name}' where email = '${data.email}'`
            dbChat.query(query2,(err,result)=>{
                if(err){
                    console.log(err)
                }
            })
            const query3 = `update privateChat set fromName = '${data.name}' where fromEmail = '${data.email}'`
            dbChat.query(query3,(err,result)=>{
                if(err){
                    console.log(err)
                }
            })
        }
        
    })
})