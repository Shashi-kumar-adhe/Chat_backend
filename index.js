const express = require('express')
const dotenv = require('dotenv')
const mongoose = require("mongoose")
const cors = require('cors')
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const app = express()
dotenv.config()


app.use(
    cors({
      origin: "*",
    })
  );

  const userRoutes = require("./Routes/userRoutes");
  const chatRoutes = require("./Routes/chatRoutes");
  const messageRoutes = require("./Routes/messageRoutes");
const { Socket } = require('socket.io');



mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("Database Connected Successfully")
}).catch((err)=>{
    console.log("Database Not connected",err)
})

app.use(express.json())

app.get("/", (req, res) => {
  res.send("API is running123");
});

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);



const PORT = process.env.PORT || 5000
const server=app.listen(PORT,console.log("Server is listening..."))


const io = require('socket.io')(server,{
  cors:{
    origin:"*",
  },
  pingTimeout:60000,
});

io.on("connection",(socket)=>{
  socket.on("setup",(user)=>{
    socket.join(user.data._id);
    socket.emit("connected");
  });

socket.on("join chat",(room)=>{
  socket.jpim(room);
}); 

socket.on("new message",(newMessageStatus)=>{
  var chat = newMessageStatus.chat;
  if(!chat.users){
    return console.log("chat.users not defined");
  }
  chat.users.forEach((user)=>{
    if(user._id == newMessageStatus.sender._id) return;
    socket.in(user._id).emit("message received",newMessageRecieved)
  });
});
});

