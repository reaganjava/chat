/**
 * Created by admin on 2014/7/18.
 */

function VProtocol() {
    this.code;
    this.version;
    this.ext;
    this.isCompress;
    this.dateline;
    this.error;
}
VProtocol.prototype.vencoder = function(vprotocol) {
    return JSON.stringify(vprotocol);
}
VProtocol.prototype.vdecoder = function(jsonData) {
    return JSON.parse(jsonData);
}
//验证用户
function VAuth() {
    this.nickname;
    this.userId;
}
VAuth.prototype = new VProtocol();

//验证成功
function VStatus() {
    this.sessionId;
    this.nickname;
}
VStatus.prototype = new VProtocol();



//聊天
function VMsg() {
    this.sessionId;
    this.nickname;
    this.reviceSessionId;
    this.msgType;
    this.attachment;
    this.content;
}
VMsg.prototype = new VProtocol();


//聊天确认
function VAcknowledge() {
    this.msgId;
}
VAcknowledge.prototype = new VProtocol();


//心跳
function VKeepAlive() {

}
VKeepAlive.prototype = new VProtocol();


function VOnlines() {
    this.onlinesMemberList;
}
VOnlines.prototype = new VProtocol();

function VExit() {
    this.sessionId;
}
VExit.prototype = new VProtocol();

