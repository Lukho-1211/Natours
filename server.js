const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({path: './config.env'});
const app = require('./app'); 


const DB = process.env.MONGO_URL.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD 
);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
})
.then(()=>{ 
    console.log('DB connected successfully!');
});

const port = process.env.PORT || 3000;


app.listen(port, ()=>{
    console.log(`Connected to port ${port}`);
});