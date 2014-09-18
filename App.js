/**
 * Created by admin on 2014/7/17.
 */
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;
cluster.setupMaster({
    exec : "server.js"
});
if (cluster.isMaster) {
    console.log("master start...");

    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();
        worker.send("启动");
    }

    cluster.on('fork', function(worker) {
        console.log("子进程" + worker.id + "开启");
    });

    cluster.on('online', function(worker) {
        console.log("接收到子进程" + worker.id + "发来的反馈");
    });

   cluster.on('listening', function(worker, address) {
        console.log("进程" + worker.id + "开启服务器监听" + address.address + "端口" + address.port);
    });

}