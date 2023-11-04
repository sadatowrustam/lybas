const { Products,Orders,Dayincome } = require("../models")
const { Op } = require("sequelize")
const schedule = require("node-schedule")
const fs = require("fs")
const dates = schedule.scheduleJob('0 45 15 * * *', async function() {
    var expiration_days = fs.readFileSync('./config/expire_time.txt', 'utf8')
    let today = new Date().getTime()
    let expiration_time_ms = Number(expiration_days) * 86400 * 1000
    let expiration_time = today - expiration_time_ms
    
    let products = await Products.findAll({
        where: {
            is_new_expire: {
                [Op.lt]: expiration_time
            },
            isNew: true
        }
    })
    for (const product of products) {
        product.update({ isNew: false })
        console.log(`Product with id: ${product.product_id} is not new product now`)
    }
});
const orders = schedule.scheduleJob('0 45 15 * * *', async function() {
    let firstDate = new Date(startTime)
    let secondDate = new Date(endTime)
    where.createdAt = {
        [Op.gte]: firstDate,
        [Op.lte]: secondDate
    }
    where.status="Gowshuryldy"
    const now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    const then = new Date();
    then.setHours(23);
    then.setMinutes(59);
    then.setSeconds(59);
    then.setMilliseconds(0);
    let sum = await Orders.sum("total_price",{
        where
});
    let dayincome=await Dayincome.create({income:sum})
    console.log(dayincome)
})
module.exports = () => { dates }