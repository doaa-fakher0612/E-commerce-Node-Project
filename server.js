const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
dotenv.config({
    path:"config.env"
})


// connect with database
mongoose.connect(process.env.DB_URI).then((conn)=>{
    console.log(`Database Connected: ${conn.connection.host}`)
}).catch((err)=>{
    console.error(`Database Error: ${err}`)
    process.exit(1)
})
const app = express()
//  using morgan middleware
if (process.env.NODE_ENV === "development"){
    app.use(morgan('dev'))
    console.log(`mode : ${process.env.NODE_ENV }`)
}

app.use(express.json())

// // 1- create schema
// const catSchema =  mongoose.Schema({
//     name:String,
// })

// //2- covert it to model
// const CatModel = mongoose.model('Category', catSchema)

// //routes
// app.post('/', (req, res)=>{
//     const name = req.body.name;
//     console.log( req.body)

//     const newCtegory = new CatModel({name})
//     newCtegory.save().then((doc)=>{
//         res.json(doc)
//     }).catch((err)=>{
//         res.json(err)
//     })
// })


// Routes

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=>{
    console.log("APP Running vs")
})

app.get('/', (req, res) => {
    res.send(`Our API on port ${PORT}`)
})
