import { world, system } from "@minecraft/server"
import { config } from "./config"


var tpMap = new Map()
var tpCooldown = new Map()

var command_descriptions = {
    "tpa": "Sends a teleport request",
    "tpahere": "Sends a request to teleport player to you",
    "tpaccept": "Accept incoming tpa request",
    "tpadeny": "Deny incoming tpa request",
    "tpacancel": "Cancel outgoing tpa request",
    "tpatoggle": "Toggles incoming tpa requests",
    "tpall": "Teleports everyone to you",
    "tpahelp": "List and descriptions of commands"
}

function getPlayer(name) {
    var players = [...world.getPlayers()]

    return players.find(p => p.name === name) || players.filter(p => p.name.toLowerCase().startsWith(name.toLowerCase()))[0]
}

world.events.beforeChat.subscribe((data) => {

    var sender = data.sender


    if (!data.message.startsWith(config.prefix)) return
    var command = data.message.split(" ")[0].slice(config.prefix.length).toLowerCase()
    var playerName = data.message.split(" ").slice(1).join(" ")


    if (command == "tpa") {
        data.cancel = true


        var target = [...world.getPlayers()].find(p => p.name.toLowerCase().startsWith(playerName.toLowerCase()))

        if (!playerName) return sender.sendMessage(`${config.suffix} §fMissing name argument, §b${config.prefix}tpa NAME`)

        if (!target) return sender.sendMessage(`${config.suffix} §fCouldn't find that player, maybe check your spelling?`)
        if (target.hasTag(config.tpaDisabledTag)) return sender.sendMessage(`${config.suffix} §f${target.name} has their tpa requests disabled.`)

        if (tpMap.has(sender.name)) return sender.sendMessage(`${config.suffix} §fYou already have an outgoing request to §b${tpMap.get(sender.name).name}§f.`)
        if (tpCooldown.get(sender.name) > new Date().getTime()) return sender.sendMessage(`${config.suffix} §fPlease wait ${Math.round((tpCooldown.get(sender.name) - new Date().getTime()) / 1000)}s before sending another request.`);
        if (target.name == sender.name) return sender.sendMessage(`${config.suffix} You can't teleport to yourself!`)

        if (config.plingSound) target.playSound("note.pling", { pitch: 2 })

        target.sendMessage(`${config.suffix} §fYou have an incoming request from §b${sender.name}§f!`)
        sender.sendMessage(`${config.suffix} §fTeleport request sent to §b${target.name}§f.`)
        tpMap.set(sender.name, ({ name: target.name, time: new Date().getTime() }))

        tpCooldown.set(sender.name, new Date().getTime() + config.cooldownTime * 1000)
        system.runTimeout(() => {

            tpMap.delete(sender.name)

        }, 20 * config.timeToAccept)


    } else if (command == "tpahere") {

        var target = [...world.getPlayers()].find(p => p.name.toLowerCase().startsWith(playerName.toLowerCase()))

        if (!playerName) return sender.sendMessage(`${config.suffix} §fMissing name argument, §b${config.prefix}tpahere NAME`)

        if (!target) return sender.sendMessage(`${config.suffix} §fCouldn't find that player, maybe check your spelling?`)
        if (target.hasTag(config.tpaDisabledTag)) return sender.sendMessage(`${config.suffix} §f${target.name} has their tpa requests disabled.`)

        if (tpMap.has(sender.name)) return sender.sendMessage(`${config.suffix} §fYou already have an outgoing request to §b${tpMap.get(sender.name).name}§f.`)
        if (tpCooldown.get(sender.name) > new Date().getTime()) return sender.sendMessage(`${config.suffix} §fPlease wait ${Math.round((tpCooldown.get(sender.name) - new Date().getTime()) / 1000)}s before sending another request.`);
        if (target.name == sender.name) return sender.sendMessage(`${config.suffix} You can't teleport to yourself!`)

        if (config.plingSound) target.playSound("note.pling", { pitch: 2 })

        target.sendMessage(`${config.suffix} §fYou have an incoming request from §b${sender.name}§f!`)
        sender.sendMessage(`${config.suffix} §fTeleport request sent to §b${target.name}§f.`)
        tpMap.set(sender.name, ({ name: target.name, time: new Date().getTime() }))


    } else if (command == "tpaccept") {
        data.cancel = true

        var tpTo = []
        tpMap.forEach((value, key) => {
            value.name == sender.name ? tpTo.push({ name: value.name, from: key, time: value.time }) : 0
        })
        tpTo = tpTo?.sort((a, b) => a.time - b.time)


        if (!tpTo.length) return sender.sendMessage(`${config.suffix} §fYou don't have any incoming requests!`)
        if (!playerName) { tpTo = getPlayer(tpTo[0].from) } else {
            tpTo.forEach((v) => {
                v.from.toLowerCase().startsWith(playerName.toLowerCase()) ? tpTo = getPlayer(v.from) : 0
            })
        }

        tpTo.sendMessage(`${config.suffix} §fTeleporting to §b${sender.name}§f, do not move!`)
        sender.sendMessage(`${config.suffix} §fTeleport request accepted`)




        if (config.plingSound) tpTo.playSound("note.pling", { pitch: 2 })
        if (config.plingSound) sender.playSound("note.pling", { pitch: 2 })
        tpMap.delete(tpTo.name)
        system.runTimeout(() => {

            tpTo.teleport(sender.location, sender.dimension, sender.getRotation().x, sender.getRotation().y)

        }, 10)


    } else if (command == "tpadeny") {
        data.cancel = true

        var tpTo = []
        tpMap.forEach((value, key) => {
            value.name == sender.name ? tpTo.push({ name: value.name, from: key, time: value.time }) : 0
        })
        tpTo = tpTo?.sort((a, b) => a.time - b.time)


        if (!tpTo.length) return sender.sendMessage(`${config.suffix} §fYou don't have any incoming requests!`)
        if (!playerName) { tpTo = getPlayer(tpTo[0].from) } else {
            tpTo.forEach((v) => {
                v.from == playerName ? tpTo = getPlayer(v.from) : 0
            })
        }

        tpMap.delete(tpTo.name)
        sender.sendMessage(`${config.suffix} §fTeleport request denied.`)
    } else if (command == "tpacancel") {
        data.cancel = true

        var tpTo = []
        tpMap.forEach((value, key) => {
            key == sender.name ? tpTo.push({ name: value.name, from: key, time: value.time }) : 0
        })
        tpTo = tpTo?.sort((a, b) => a.time - b.time)


        if (!tpTo.length) return sender.sendMessage(`${config.suffix} §fYou don't have any outgoing requests!`)
        if (!playerName) { tpTo = getPlayer(tpTo[0].name) } else {
            tpTo.forEach((v) => {
                v.from == playerName ? tpTo = getPlayer(v.name) : 0
            })
        }

        tpMap.delete(sender.name)
        sender.sendMessage(`${config.suffix} §fTeleport request canceled.`)

    } else if (command == "tpatoggle") {
        data.cancel = true

        if (sender.hasTag(config.tpaDisabledTag)) {
            sender.sendMessage(`${config.suffix} §fYou will now recieve incoming requests.`)
            sender.removeTag(config.tpaDisabledTag)
        } else {
            sender.sendMessage(`${config.suffix} §fYou will no longer recieve incoming requests.`)
            sender.addTag(config.tpaDisabledTag)
        }

    } else if (command == "tpall") {
        data.cancel = true

        if (!sender.hasTag(config.adminTag)) return sender.sendMessage(`${config.suffix} §fYou do not have the permissions to use this command.`)

        sender.sendMessage(`${config.suffix} §fTeleported everyone to you!`)
        sender.runCommandAsync(`tellraw @a[rm=1] {"rawtext":[{"text":"${config.suffix} §fYou've been teleported to §b${sender.name}§f!"}]}`)
        sender.runCommandAsync(`tp @a[rm=1] @s`)

    } else if (command == "tpahelp") {
        data.cancel = true

        if (!playerName || playerName == "tpahelp") return sender.sendMessage(`§6-----------\n§f+ §fMade by GreenJuzzy#3436 & Neb#9990\n§f+ §fPrefix: ${config.prefix}\n\n+ §btpa §f<name>\n+ §btpaccept §f<?name> \n+ §btpadeny §f<?name> §f\n+ §btpacancel§f\n+ §btpatoggle§f\n+ §btpall§f\n+ §btpahelp §f<?command>§f\n§6-----------`)

        sender.sendMessage(`§6+ §b${playerName} §f${command_descriptions[playerName]}`)


    }
})