var process = require('child_process');

function check(stat, src, dest){
    return function(){
        if (!stat.stdout._readableState.ended){
            console.log("primary save fails")
            stat.kill("SIGKILL");
            backup(src, dest);
        }
    }
}

function check2(stat){
    return function(){
        if (!stat.stdout._readableState.ended){
            console.log("nothing to do"); 
            stat.kill("SIGKILL");
        }
        else console.log("Image saved in backup");
    }
}

function backup(src, dest){
    console.log("backup activated"); 
    stat = process.spawn('mv', [src, dest+'bk']);
    setTimeout(check2(stat), 2000);
}

exports.move = function(src, dest){
    stat = process.spawn('mv', [src, dest]);
    setTimeout(check(stat, src, dest), 2000);
}