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
        console.log("CONNECTED")
        socket.on("login", async( id ) => {
            console.log(14,id)
            users[socket.id] = socket.id
            try {
                var data=await axios.get("http://localhost:5011/users/"+id)
            } catch (error) {
                console.log(error)
            }
            if(!data){
                var res=await axios.post("http://localhost:5011/users",{id,socketId:socket.id})
            }else{
                var res=await axios.patch("http://localhost:5011/users/"+id,{id,socketId:socket.id})
            }
        })
        socket.on("seller-login", async( id ) => {
            console.log(14,id)
            users[socket.id] = socket.id
            try {
                var data=await axios.get("http://localhost:5011/seller/"+id)
            } catch (error) {
                console.log("error")
            }
            if(!data){
                var res=await axios.post("http://localhost:5011/seller",{id,socketId:socket.id})
            }else{
                var res=await axios.patch("http://localhost:5011/seller/"+id,{id,socketId:socket.id})
            }
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