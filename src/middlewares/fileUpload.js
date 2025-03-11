import multer from 'multer';
 import path from 'path';
 

 const storage = multer.diskStorage({
   destination: './uploads/',
   filename: function (req, file, cb) {
     cb(
       null,
       file.fieldname + '-' + Date.now() + path.extname(file.originalname)
     );
   },
 });
 

 const upload = multer({
   storage: storage,
   limits: { fileSize: 1000000 }, 
   fileFilter: function (req, file, cb) {
     checkFileType(file, cb);
   },
 }).single('arquivo');
 
 
 function checkFileType(file, cb) {
 
   const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
   
   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
 
   const mimetype = filetypes.test(file.mimetype);
 
   if (mimetype && extname) {
     return cb(null, true);
   } else {
     cb('Error: Images Only!');
   }
 }
 
 // Middleware function
 export const uploadFileMiddleware = (req, res, next) => {
   upload(req, res, function (err) {
     if (err) {
       return res.status(400).send({ message: err });
     }
     next();
   });
 };