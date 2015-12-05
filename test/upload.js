/* jshint node:true*/
"use strict";

var fs = require('fs');
var request = require('request');

var formData = {
  my_field: 'my_value',
  my_buffer: new Buffer([1, 2, 3]),
  picfile: fs.createReadStream(__dirname + '/111.txt'),
  // Pass optional meta-data with an 'options' object with style: {value: DATA, options: OPTIONS}
  // Use case: for some types of streams, you'll need to provide "file"-related information manually.
  // See the `form-data` README for more information about options: https://github.com/form-data/form-data

  custom_file: {
    picfile: fs.createReadStream(__dirname + '/111.txt'),
    options: {
      filename: 'topsecret.jpg',
      contentType: 'image/jpg'
    }
  }
};
request.post({url:'http://10.1.163.59:8080/uploadpic', formData: formData}, function(err, httpResponse, body) {
  if (err) {
    return console.error('upload failed:', err);
  }
  console.log('Upload successful!  Server responded with:', body);
});


