const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', err =>{
    console.log('Uncaught Exception! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);  
});

dotenv.config({path: './config.env'});
const app = require('./app'); 
 

const DB = process.env.MONGO_URL.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD 
);

// , {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//     //useCreateIndex: true,
// }
mongoose.connect(DB)
.then(()=>{ 
    console.log('DB connected successfully!');
});

const port = process.env.PORT || 3000;
const server = app.listen(port, ()=>{
    console.log(`Connected to port ${port}`);
});

process.on('unhandledRejection', err =>{
    console.log('UNHANDLED REJECTION! Shutting down...');
    console.log(err.name, err.message);
    server.close(()=>{
        process.exit(1);
    });    
});

