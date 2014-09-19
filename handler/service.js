/**
 * Created by admin on 2014/7/18.
 */
var Member = require('./../util/member');

var service = module.exports = Service

function Service() {

    var member = new Member();
    var mySocket = null;

    function Protocol() {
        this.code;
        this.version;
        this.ext;
        this.isCompress;
        this.dateline;
        this.error;
        this.errorMsg;
    }

    //验证成功
    function Status() {
        this.sessionId;
        this.nickname;
    }
    Status.prototype = new Protocol();

    //验证用户
    function Auth() {
        this.nickname;
        this.userId;

    }
    Auth.prototype = new Protocol();
    //聊天
    function Msg() {
        this.sessionId;
        this.nickname;
        this.reviceSessionId;
        this.msgType;
        this.attachment;
        this.content;
    }
    Msg.prototype = new Protocol();


    //聊天确认
    function Acknowledge() {
        this.msgId;
    }
    Acknowledge.prototype = new Protocol();


    //心跳
    function KeepAlive() {

    }
    KeepAlive.prototype = new Protocol();

    function Onlines() {
        this.onlinesMemberList;
    }
    Onlines.prototype = new Protocol();

    function Exit() {
        this.sessionId;
    }
    Exit.prototype = new Protocol();

    this.authClient =  function(auth, socket) {
        var status = new Status();
        if(auth.nickname != '' && auth.userId != '' ) {
            status.code = auth.code;
            status.sessionId = auth.sessionId;
            status.nickname = auth.nickname;
            status.error = 0;
            var newMember = new Member();
            newMember.nickname = auth.nickname;
            newMember.userId = auth.userId;
            newMember.sessionId = auth.sessionId;
            newMember.socket = socket;
            member.addMember(newMember);
        } else {
            status.error = 1;
            status.errorMsg = "用户不存在";
        }
        socket.send(this.encoder(status));
    }

    this.broadcastOnlineMemberList = function(){
        var onlines = new Onlines();
        onlines.code = 10001;
        onlines.onlinesMemberList = member.getOnlineMemberInfoList();
        var currentOnlineNumber = onlines.onlinesMemberList.length;
        //console.log('online number:' + currentOnlineNumber);
        var sockets = member.getOnlineMemberSocketList();
        if(sockets != null) {
            for (var i = 0; i < sockets.length; i++) {
                sockets[i].send(this.encoder(onlines));
            }
        }
    }

    this.dialog = function(msg) {
        var sessionId = msg.sessionId;
        var nickname = msg.nickname;
        var reviceId = msg.reviceSessionId;
        var content = msg.content;
        var memberInfo = member.getDetail(reviceId);
        console.log(reviceId + ":" + memberInfo.sessionId);
        if(memberInfo != null) {
            memberInfo.socket.send(this.encoder(msg));
        } else {
            //这里用户不在线时就入数据库

        }
    }

    this.keepAlive = function(sessionId) {
        var memberInfo = member.getDetail(sessionId);
        var keepAlive = new KeepAlive();
        keepAlive.code = 10004;
        keepAlive.version = '1.0';
        keepAlive.dateline = new Date().getTime();
        if(memberInfo != null) {
            memberInfo.socket.send(this.encoder(keepAlive));
        }
    }

    this.disconnect = function(sessionId) {
        member.removeOnlines(sessionId);
        this.broadcastOnlineMemberList();
    }

    this.logOut = function(exit) {
        member.removeOnlines(exit.sessionId);
        this.broadcastOnlineMemberList();
    }

    this.encoder = function(protocol) {
        return JSON.stringify(protocol);
    }

    this.decoder = function(jsonData) {
        return JSON.parse(jsonData);
    }

    this.uuid = function uuid() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    }
}

