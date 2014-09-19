/**
 * Created by admin on 2014/9/19.
 */
var isLogin = false;
var sessionId = '';
var nickname = '';
var socket = null;
var currentSessionId = '';
$(document).ready(function() {
    socket = io.connect();
    socket.on('connect', function() {
        jPrompt('输入用户名', '', '登录聊天', function(nickname) {
            var auth = new VAuth();
            auth.code = 10000;
            auth.version = '1.0';
            auth.dateline = new Date().getTime();
            auth.nickname = nickname;
            auth.userId = 1;
            login(auth);
        });
    });

    socket.on('message', function(jsonData) {
        var protocol = new VProtocol();
        protocol = protocol.vdecoder(jsonData);
        switch(protocol.code) {
            case 10000: {
                var status = new VStatus();
                status = status.vdecoder(jsonData);
                if(status.error == 0) {
                    loginSuccess(status);
                } else {
                    alert(status.errorMsg);
                }
                break;
            }
            case 10001: {
                var onlines = new VOnlines();
                onlines = onlines.vdecoder(jsonData);
                refreshList(onlines.onlinesMemberList);
                break;
            }
            case 10003: {
                var msg = new VMsg();
                msg = msg.vdecoder(jsonData);
                refreshMessage(msg);
                break;
            }
            case 10004: {
                break;
            }
        }
    })

    $('#msgList').val('');
});
function login(auth) {
    socket.send(auth.vencoder(auth));
}
function loginSuccess(status) {
    isLogin = true;
    sessionId = status.sessionId;
    nickname = status.nickname;
    //getOnlinesList();
    keepAlive();
}
function keepAlive() {
    setInterval(function(){
        var keepAlive = new VKeepAlive()
        keepAlive.code = 10004;
        keepAlive.version = '1.0';
        keepAlive.dateline = new Date().getTime();
        socket.send(keepAlive.vencoder(keepAlive));
    }, 1000);
}
function getOnlinesList() {
    var protocol = new VProtocol();
    protocol.code = 10001;
    socket.send(protocol.vencoder(protocol));
}
function refreshList(memberArray) {
    $('#onlines').empty();
    for(var i = 0; i < memberArray.length; i++) {
        //$('#onlines').append('<option value=' + memberArray[i].sessionId + '>' + memberArray[i].nickname + '<//option>');
        $('#onlines').append('<li class="" id="' + memberArray[i].sessionId +  '"><label class="online"></label><a onclick=clickOnline("' + memberArray[i].sessionId + '");><img src="img/default.png"></a><a class="chat03_name"  onclick=clickOnline("' + memberArray[i].sessionId + '");>' + memberArray[i].nickname + '</a></li>');
    }
}
function disconnect() {
    if(sessionId != '') {
        var exit = new VExit();
        exit.code = 10002
        exit.sessionId = sessionId;
        socket.send(exit.encoder(exit));
        socket.disconnect();
    }
}
function refreshMessage(msg) {
    var msgListContent = $('#msgList').val();
    var viewContent = '';
    alert(msg.attachment);
    if(msg.attachment != '') {
        viewContent += '<a href=' + msg.attachment + ' target="new"><img src=' + msg.attachment + ' width="120" height="64" /></a></br>';
        viewContent += msg.content;
    } else {
        viewContent += msg.content;
    }
    //$("#onlines option[value=' + sessionId + ']").attr("selected", true);
    var chatContentDiv = '<div class="message clearfix"><div class="user-logo"><img src="./img/default.png">'
        + '</div><div class="wrap-text"><h5 class="clearfix">' + msg.nickname + '</h5><div>' + viewContent + '</div></div><div class="wrap-ri"><div clsss="clearfix">'
        + '<span>' + msg.dateline + '</span></div></div><div style="clear:both;"></div></div>'
    $('#msgList').append(chatContentDiv);
}
function clickOnline(sessionId){
    //$('#onlines').find('option[value='+ sessionId +']').attr('selected', true);
    $('#' + currentSessionId).removeClass('choosed');
    $('#' + sessionId).addClass('choosed');
    currentSessionId = sessionId;
    alert(currentSessionId);
}
function sendMessage() {
    if(isLogin) {
        var viewContent = '';
        var sendMsg = $('#dialog').val();
        var isThumbnail = $('#isThumbnail').val();
        var msg = new VMsg();
        msg.code = 10003;
        msg.version = '1.0';
        msg.sessionId = sessionId;
        msg.nickname = nickname;
        msg.dateline = dateformat("yyyy-MM-dd hh:mm:ss");
        if(isThumbnail == 1) {
            alert($('#thumbnailURL')[0].src)
            msg.attachment = $('#thumbnailURL')[0].src;
            msg.msgType = 2;
            msg.content = sendMsg;
            viewContent += '<img src=' + msg.attachment + ' width="120" height="64" /></br>';
            viewContent += sendMsg;
        } else {
            msg.msgType = 1;
            msg.content = sendMsg;
            viewContent = sendMsg;
        }
        alert(currentSessionId);
        //获取列表选中的用户
        msg.reviceSessionId = currentSessionId;
        var chatContentDiv = '<div class="message clearfix"><div class="user-logo"><img src="./img/default.png">'
        + '</div><div class="wrap-text"><h5 class="clearfix">您说</h5><div>' + viewContent + '</div></div><div class="wrap-ri"><div clsss="clearfix">'
        + '<span>' + msg.dateline + '</span></div></div><div style="clear:both;"></div></div>'
        $('#msgList').append(chatContentDiv);
        $('#dialog').val('');
        socket.send(msg.vencoder(msg));
    }

    function dateformat(format)
    {
        var date = new Date();
        var o = {
            "M+" : date.getMonth()+1, //month
            "d+" : date.getDate(),    //day
            "h+" : date.getHours(),   //hour
            "m+" : date.getMinutes(), //minute
            "s+" : date.getSeconds(), //second
            "q+" : Math.floor((date.getMonth()+3)/3),  //quarter
            "S" : date.getMilliseconds() //millisecond
        }
        if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
            (date.getFullYear()+"").substr(4- RegExp.$1.length));
        for(var k in o)if(new RegExp("("+ k +")").test(format))
            format = format.replace(RegExp.$1,
                    RegExp.$1.length==1? o[k] :
                    ("00"+ o[k]).substr((""+ o[k]).length));
        return format;
    }
}

