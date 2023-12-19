require('dotenv').config()
const { connect } = require('mongoose')
const { hash, compare } = require('bcrypt');
const userSchema = require('../schema/users')
const { sign } = require('jsonwebtoken')
const nodemailer = require("nodemailer");
var Mailgen = require('mailgen');

// const signup = async (req, res) => {
//     const { name, email, gender, password } = req.body;
//     try {
//         const db = await connect(process.env.MONGO_URI)
//         const create_user = await userSchema.create({ name, email, gender, password: await hash(password, 16) })
//         res.status(201).json({ message: "User Successfully Created" })
//     }
//     catch (error) {
//         res.status(400).send(error.message)
//     }
// }
const signup = async (req, res) => {
    const { name, email, password, gender } = req.body;

    if (name && email && password && gender) {
        try {
            await connect(process.env.MONGO_URI)
            // const checkUser = await UserSchema.findOne({ email })
            const checkUser = await userSchema.exists({ email })
            if (!checkUser) {
                await userSchema.create({ name, email, gender, password: await hash(password, 16) })
                res.status(201).json({ message: "User Created Successfully" })
            }

            else {
                res.json({
                    message: "user already Exists"
                })
            }
        }

        catch (error) {
            res.status(400).json({
                message: error.message
            })
        }
    }

    else {
        res.status(403).json({
            message: "Required Field Missing"
        })
    }
}

const user = (req, res) => {
    res.send("Hello I am " + req.body.name)
}


const login = async (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
        try {
            await connect(process.env.MONGO_URI)
            const checkUser = await userSchema.findOne({ email })
            if (checkUser) {
                const decryptpass = await compare(password, checkUser.password)
                if (decryptpass && email == checkUser.email) {

                    const token = sign(
                        {
                            name: checkUser.name,
                            email: checkUser.email,
                            gender: checkUser.gender
                        },

                        process.env.JWT_SECRET
                    )

                    res.json({
                        message: "Successfully Login",
                        token
                    })

                }


                else {
                    res.status(400).json({ message: "Incorrect Password" })
                }
            }
            else {
                res.status(404).json({ message: "User Not Found" })
            }
        }
        catch (error) {
            res.status(400).json({ message: error.message })
        }
    }
    else {
        res.status(400).json({ message: "Required Field Misssing" })
    }

}



const allusers = async (req, res) => {
    try {
        const db = await connect(process.env.MONGO_URI)
        const allusers = await userSchema.find()
        res.status(201).json({ users: allusers })
    }
    catch (error) {
        res.status(400).send(error.message)
    }
}
const userById = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connect(process.env.MONGO_URI)
        const allusers = await userSchema.findOne({ _id: id })
        res.status(201).json({ user: allusers })
    }
    catch (error) {
        res.status(400).send(error.message)
    }
}

const updateUsers = async (req, res) => {
    const { email, name, profile_pic, gender } = req.body;

    try {
        const filter = { email }
        const update = { name, profile_pic, gender }
        await connect(process.env.MONGO_URI)

        const checkUser = await userSchema.exists({ email })

        if (checkUser) {
            const doc = await userSchema.findOneAndUpdate(filter, update, {
                new: true
            });

            res.json({ user: doc, message: "Profile Updated Sucessfully" })
        }

        else {
            res.status(404).json({ message: "Profile Not Found" })
        }






    }
    catch (error) {
        res.status(400).json({ message: error.message })

    }
}


const deleteUsers = async (req, res) => {

    // res.json({ email: req.body.email })

    try {
        await connect(process.env.MONGO_URI)

        await userSchema.findOneAndDelete({ email: req.body.email })
        const updatedusers = await userSchema.find()
        res.json({
            message: "Successfully Deleted",
            users: updatedusers
        })


    }

    catch (error) {
        res.status(400).json({ message: error.message })
    }
}
const newsletter = async (req, res) => {
    const { email } = req.body;

    const config = {
        service: "gmail",
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PASSWORD,
        },
    }

    const transporter = nodemailer.createTransport(config);


    var mailGenerator = new Mailgen({
        theme: 'salted',
        product: {
            // Appears in header & footer of e-mails
            name: 'Fast NUCES',
            link: 'https://www.nu.edu.pk/',
            logo: 'https://khi.nu.edu.pk/wp-content/uploads/2023/01/FAST-NU-logo.png'
        }
    });

    var emailDetails = {
        body: {
            name: 'User',
            intro: 'Thanks for Subscribing us, you will get all the updates on your email',
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.',
            table: {
                data: [
                    {
                        name: "laiba",
                        email: "hello123@gmail.com"
                    },
                    {
                        name: "esha",
                        email: "esha@gmail.com"
                    }
                ]
            },

            action: [
                {
                    instructions: 'To get started with Mailgen, please click here:',
                    button: {
                        color: '#22BC66',
                        text: 'Confirm your account',
                        link: 'https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010',
                        fallback: true
                    }
                },
                {
                    instructions: 'To read our frequently asked questions, please click here:',
                    button: {
                        text: 'Read our FAQ',
                        link: 'https://mailgen.js/faq',
                        fallback: {
                            text: 'This is my custom text for fallback'
                        }
                    }
                }
            ]

        }
    };

    var emailBody = mailGenerator.generate(emailDetails);

    if (!email) {
        res.status(404).json({ message: "Email Required" })
    }

    else {
        try {

            const emailText = {
                from: process.env.NODEMAILER_EMAIL, // sender address
                to: email, // list of receivers
                subject: "Thanks for Subscribing to Us", // Subject line
                html: emailBody, // html body
            }
            const info = await transporter.sendMail(emailText);
            res.json({ message: "EMAIL SENT SUCCESSFULLY" })
        }
        catch (error) { res.json({ message: error.message }) }

    }
}
module.exports = { newsletter, allusers, userById, updateUsers, deleteUsers, signup, login }