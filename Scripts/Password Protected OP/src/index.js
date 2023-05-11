import { system, world } from "@minecraft/server"


// DO NOT SHARE THE PASSWORD TO ANYONE WHO SHOULDN'T HAVE OP (obv)
var password = "PUT YOUR OPERATOR PASSWORD HERE"



var playerStatus = []

system.runInterval(() => {

    world.getAllPlayers().forEach(player => {
        if (!playerStatus[player.name]) playerStatus[player.name] = false
        if (player.isOp() && playerStatus[player.name] == false) {
            player.setOp(false)
        }
    })


})

world.events.beforeChat.subscribe((data) => {

    if (data.message.startsWith("-op")) {
        data.cancel = true

        if (data.message.split(" ")[1] == password) {
            playerStatus[data.sender.name] = true
            data.sender.setOp(true)
            data.sender.sendMessage("Opped!")

        }

    }

})

world.events.playerLeave.subscribe((p) => {
    delete playerStatus[p.playerName]
})