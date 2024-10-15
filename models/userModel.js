const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please provide your name']
    },
    email:{
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, ' Please provide a valid email']
    },
    photo: String,
    role:{
        type: String,
        enum: ['user','guide','lead-guide','admin'],
        default: 'user'
    },
    password:{
        type: String,
        required: [true, 'Please provide password'],
        minlength: 8,
        select: false
    },
    passwordConfirm:{ 
        type: String,
        required: [true, 'Please enter confirm password'],
        validate: {
            //This only works on CREATE SAVE!!!
            validator: function(el){
                return el === this.password;
            },
            message: "Passwords are not the same"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
});


userSchema.pre('save', async function(next){
    // Only run this function if password was actually modified
    if(!this.isModified('password')) return next();
    // Has the password wwith cost of 12 
    this.password = await bcrypt.hash(this.password, 12);
    //Delete assword field
    this.passwordConfirm = undefined;

    next();
});

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt= Date.now() - 1000;
    next();
})



// This is a universal method[instent]. can be found everywhere
// checks if encrypted entered password same as in the database encrypted password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
};

// This is a universal method. can be found everywhere
userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        //console.log(changeTimestamp, JWTTimestamp);
        
        return JWTTimestamp < changeTimestamp; 
    }

    // false means not changed
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    //1) create Token with a build in Libry[crypto]
    const resetToken = crypto.randomBytes(32).toString('hex');

    //2) assigning values to Database reset and expires
    //a) Encrypt resetToken then assasign
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    //console.log({resetToken}, this.passwordResetToken);
    //make 10min then assign
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}       

const User = mongoose.model('User', userSchema);
module.exports = User;