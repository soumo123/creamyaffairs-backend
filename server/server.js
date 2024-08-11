const app = require("./app.js");


const PORT = 8000;

const server = app.listen(PORT,()=>{
    console.log(`server is running at port ${PORT}`)
})
