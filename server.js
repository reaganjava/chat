/**
 * Created by admin on 2014/7/15.
 */
var http = require('http');
var fs = require('fs');
var io = require('socket.io');
var path = require('path');
var express = require('express');
//var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var Service = require("./handler/service");
var formidable = require("formidable");
//npm install node-uuid
var uuid = require('node-uuid');
//npm install buffer-crc32
var crc32 = require('buffer-crc32');


var app = express();

app.use(cookieParser());
app.use(session({secret: '123456'}));
//设置静态目录
app.use(express.static(path.join(__dirname, 'plugin')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'resource')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/images', express.static(path.join(__dirname, 'images')));
//设置页面模板
app.set('view engine', 'ejs');
//处理HTML
app.engine('html', require('ejs').renderFile);
//创建服务器
var server = http.createServer(app);
var sessionId = '';
app.get('/', function(req, res) {
    res.render('index.html');
});

app.get('/file', function(req, res) {
    res.render('file.html', {thumbnail:''});
})

app.post('/send', function(req, res) {
    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';        //设置编辑
    form.uploadDir = "./resource";     //设置上传目录
    form.keepExtensions = true;     //保留后缀
    form.maxFieldsSize = 10 * 1024 * 1024;
    form.parse(req, function(err, fields, files) {
        var name = files.thumbnail.name;
        var extName = name.substring(name.lastIndexOf("."));
        console.log(extName);
        var filename = crc32.unsigned(uuid.v1()) + extName;
        console.log(filename);
        var thumbnailPath = form.uploadDir + '/' + filename;
       // console.log(files.thumbnail);
        fs.renameSync(files.thumbnail.path, thumbnailPath);
        res.render('file.html', {thumbnail:filename});
    });
})


//监听端口
server.listen(1337);
var socket = io.listen(server);
//创建业务类
var service = new Service();
//监听SOCKET.IO
socket.on('connection', function(socket) {
    //接收到事件
    socket.on('message', function(jsonData) {
        //解析协议
        var protocol = service.decoder(jsonData);
        switch(protocol.code) {
            //验证用户
            case 10000: {
                sessionId = service.uuid();
                protocol.sessionId = sessionId;
                service.authClient(protocol, socket);
                break;
            }
           /* //获取用户列表
            case 10001: {
                service.broadcastOnlineMemberList(sessionId);
                break;
            }*/
            //用户退出
            case 10002: {
                service.logOut(protocol);
                break;
            }
            //用户对话
            case 10003: {
                service.dialog(protocol);
                //socket.broadcast.send(msg.content);
                break;
            }
            //心跳检测
            case 10004: {
                service.keepAlive(sessionId);
                service.broadcastOnlineMemberList();
                break;
            }

        }
    })
    //断开连接监听
    socket.on('disconnect', function() {
        console.log("client disconnect:" + sessionId);
    })
});


