require("dotenv").config();
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const uuid = require('uuid').v1;
const bodyParser = require('body-parser');
const aws = require('aws-sdk');
const { S3 } = require("aws-sdk");

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1'
});

const app = express(),
    s3 = new aws.S3({});

app.use(bodyParser.json());

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
    ) {
        cb(null, true);
    }
    else {
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
    }
    console.log()
};

var upload = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: 'chatroom-scale-cloud-bucket-1',
        key: (req, file, cb) => {
            cb(null, `${uuid()}-${file.originalname}`);
            console.log(file);
        }
    })
}).array('file')

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.log(err);
        }
        else {
            res.send({
                message: 'success'
            })
        }
    })
});

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if(error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                Message: "File is too large!"
            });
        }
        if(error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                Message: "File count reached!"
            });
        }
        if(error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                Message: "Only images are allowed!"
            });
        }
    }
});

app.listen(4000, () => {
    console.log("server is running on port 4000");
});

//to upload a single file

// app.post('/upload', upload.single("file"), (req, res) => {
//     res.send("success");
// });

//to upload multiple files

// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads");
//     },
//     filename: (req, file, cb) => {
//         const { originalname } = file;
//         //filename = uuid-originalname
//         cb(null, `${uuid()}-${originalname}`);
//     }
// });


//multiple-uploads
// var multiupload = upload.fields([
    //     { name: "avatar", maxCount: 1},
    //     { name: "coverpic", maxCount: 1}
    // ]);
    
    // app.post("/upload", multiupload, (req, res) => {
//     res.status(200);
//     res.send("success");
//     console.log(req.files);
// });
