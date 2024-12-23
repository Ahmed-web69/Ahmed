// We make a seperate file for each collection in our mongodb
const mongoose = require("mongoose");
// make a schema
let OrderSchema = new mongoose.Schema({
    UserName: String,
    Email: String,
    Address: String,
    Total: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    products: [{
        description: String,
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 }
    }]
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
});
//make a model
let Order = mongoose.model("Order", OrderSchema);
//export that model
module.exports = Order;