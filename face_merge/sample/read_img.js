var fs = require('fs');

var fd = fs.openSync('SCUT-FBP-22.jpg',"r");

var length = 1024*1024;

var buffer = new Buffer(length);

fs.readSync(fd,buffer,0,length,0);

console.log(buffer);


