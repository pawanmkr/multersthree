//this code is written again properly (was not working before)

require('dotenv').config();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const express = require('express');
const app = express();
const s3 = new aws.S3();

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1'
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'chatroom-scale-cloud-bucket-1',
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
}).array('file', 1);


app.post('/upload', function (req, res,next) {
    upload(req, res, function (error) {
        if (error) {
            console.log('errors', error);
            res.json({error: error});
        }
        console.log('success');
        res.json({success: true});
    });
});

app.listen(4000, () => {
    console.log('Server is running on port 3000');
})