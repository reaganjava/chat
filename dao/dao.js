/**
 * Created by admin on 2014/7/16.
 */
var mysql = require('mysql');

var Dao = module.exports = function Dao(host, user, password, database, port) {
    this.host = host;
    this.user = user;
    this.password = password;
    this.database = database;
    this.port = port;

    this.pool = mysql.createPool({
        host: this.host,
        user: this.user,
        password: this.password,
        database: this.database,
        port: this.port
    });
}

Dao.prototype.execSQL = function (sql, args) {
    this.pool.getConnection(function (err, conn) {
        if (err) {
            console.log("获取连接池出现错误！" + err);
        } else {
            conn.query(sql, args, function (err) {
                if (err) console.log("sql 执行出现异常" + err);
            });
            conn.release();
        }
    });
}
Dao.prototype.query = function(queryString, args, callback) {
    this.pool.getConnection(function(err, conn) {
        if(err) {
            console.log("获取连接池出现错误！" + err);
        } else {
            conn.query(queryString, args, callback);
        }
        conn.release();
    });
}



var dao = new Dao("localhost", "root", "1234", "chefu", 3306);
var insrtSQL = "INSERT INTO chat SET ?";
console.log(dao.execSQL);

//dao.execSQL(insrtSQL, {id:1,reviceId:1,routeId:1,nickname:'reagan',dateline:12345678,msgType:1,sendId:1,sendName:'kokomi',content:"hello", isSend:0, isView:1})
console.log(dao.query);

dao.query("select * from chat", null, function(err, rows) {
    for(var i = 0; i < rows.length; i++) {
        console.log(rows[i].nickname);
    }
})
