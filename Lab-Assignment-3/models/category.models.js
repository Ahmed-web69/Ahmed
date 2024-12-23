// We make a seperate file for each collection in our mongodb
const mongoose = require("mongoose");
// make a schema
let categorySchema = new mongoose.Schema({
  category: String, // All WOmen
  slug: String, //all-women
});
//make a model
let category = mongoose.model("category", categorySchema);
//export that model
module.exports = category;
