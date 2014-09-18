/**
 * Created by reagan on 2014/7/20.
 */
var Map = require('./map');
var Member = module.exports = function Member() {
    this.nickname;
    this.userId;
    this.sessionId;
    this.socket;

    this.getDetail = function(sessionId) {
        return Member.members.get(sessionId);
    }

    this.addMember = function(member) {
        Member.members.put(member.sessionId, member);
    }

    this.getOnlineMemberInfoList = function() {
        var member = {nickname:'', userId:0, sessionId:''};
        var members = new Array();
        var memberList = Member.members.values();
        for (var i = 0; i < memberList.length; i++) {
            member.nickname = memberList[i].nickname;
            member.userId = memberList[i].userId;
            member.sessionId = memberList[i].sessionId;
            members[i] = member;
            member = {nickname:'', userId:0, sessionId:''};
        }
        return members;
    }

    this.getOnlineMemberSocketList = function() {
        var sockets = new Array();
        var memberList = Member.members.values();
        for(var i = 0; i < memberList.length; i++) {
            sockets[i] = memberList[i].socket;
        }
        return sockets;
    }

    this.removeOnlines = function(sessionId) {
        Member.members.remove(sessionId);
    }
}
Member.members = new Map();
