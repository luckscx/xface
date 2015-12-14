/* jshint node:true*/
"use strict";


var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var options = {
    host : 'smtp.sohu.com',
    port : 25,
    auth : {
        user : 'luck_scx@sohu.com',
        pass : 'aa123456'
    }
};


var transporter = nodemailer.createTransport(smtpTransport(options));


// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'luck_scx@sohu.com', // sender address
    to: '53733849@qq.com;', // list of receivers
    subject: 'XFace - 剑侠情缘三捏脸数据', // Subject line
    text: '您好！请到附件中查收您的捏脸数据，可以在客户端中导入哦~', // plaintext body
    attachments : [{
        filename : 'res.dat',
        path : '/data/grissom/xface/datdir/res.dat'
    }]
};

// send mail with defined transport object


var sendmail = function(recv_list,data_name,pic_name) {
    if (!recv_list) {
        console.log('no recv users');
        return;
    }
    //mailOptions.to += recv_list;
    var attfile = {
        filename : data_name,
        path : data_name, 
    };
    mailOptions.attachments = [];
    mailOptions.attachments.push(attfile);

    var picfile = {
        filename : pic_name,
        path : pic_name, 
    };

    mailOptions.attachments.push(picfile);

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            transporter.sendMail(mailOptions,function(err1) {
                if (err1) {
                    console.log('failed second time');
                }
            });
            return;
        }else{
            console.log(info);
        }
        console.log('Message sent: ' + info.response);
    });
    
};

if(require.main === module){
    var filename = 'res.dat';
    var mailrecv = 'pancheng@tencent.com';
    sendmail(mailrecv,filename);
}


module.exports = sendmail;

