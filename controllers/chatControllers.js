const { Op } = require("sequelize")
const axios=require("axios")
const { v4 } = require("uuid")
module.exports = (io) => {
    const {  Users } = require("../models")
    let users = {}
    let adminOnline = false
    let adminSocket
    let isNewMessage = false
    const express = require("express");
    io.on('connection', async(socket) => {
        socket.on("login", async({ id }) => {
            users[socket.id] = socket.id
            const data=await axios.get("http://localhost:5011/users/"+id)
            if(!data){
                var res=await axios.post("http://localhost:5011/users",{id,socketId:socket.id})
            }else{
                var res=await axios.patch("http://localhost:5011/users/"+id,{id,socketId:socket.id})
            }
            console.log(res)
        })

        socket.on('disconnect', () => {
            if (adminSocket == socket.id) {
                adminOnline = false
            }
            delete users[socket.id]
        })
    })
    return express
}