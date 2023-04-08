import { world } from "@minecraft/server"
import { MessageFormData, ActionFormData } from "@minecraft/server-ui"


var invSeeAccess_Filter = (player) => player.hasTag("invSeeAccess")


function page_listPlayers(player) {
    const players = [...world.getPlayers()]

    const modal = new ActionFormData()
    modal.title("Inventory See - Press a player")
    players.forEach((player) => modal.button(`§c${player.name}\n§7Click to show inventory`))
    modal.button("§cExit\n§7Press to close the menu")

    modal.show(player).then(response => {
        if (response.cancelationReason == "userBusy") return page_listPlayers(player)
        if (response.cancelationReason == "userClosed") return

        if (response.selection == players.length) return // Exit

        page_listPlayerInventory(player, players[response.selection])

    })

}

function page_listPlayerInventory(player, target) {

    var inventory = target.getComponent("inventory").container
    var itemList = []

    const modal = new ActionFormData()
    modal.title(`Inventory See - ${target.name}`)

    for (let i = 0; i < inventory.size; i++) {
        var slot = inventory.getSlot(i)
        var item = inventory.getItem(i)

        if (slot.typeId == undefined) continue;
        itemList.push(slot)
        modal.button(`${slot.amount}x §c${item.typeId.split("minecraft:")[1]}\n§7Press to show info`)
    }
    modal.button("§cBack\n§7Press to go back")

    modal.show(player).then(response => {
        if (response.cancelationReason == "userClosed") return

        if (response.selection == itemList.length) return page_listPlayers(player)

        page_item(player, target, itemList[response.selection])

    })

}

function page_item(player, target, item) {


    const modal = new ActionFormData()
    modal.title(`${target.name} - ${item.typeId.split("minecraft:")[1]}`)
    modal.button(`§cEnchantments\n§7Press to view`)
    modal.button("§cDelete\n§7Press to view")
    modal.button("§cBack\n§7Press to go back")

    modal.show(player).then(response => {
        if (response.cancelationReason == "userClosed") return


        if (response.selection == 0) page_item_enchantments(player, target, item)
        if (response.selection == 1) page_item_warning("§fAre you sure you want to §cdelete§f the item in this slot §cforever§f?\n\n§cIf target moves the item, the slot the item was in will be cleared. This can not be undone.", player, target, item, () => page_item(player, target, item), () => item.setItem())
        if (response.selection == 2) page_listPlayerInventory(player, target)

    })

}

function page_item_enchantments(player, target, item) {
    var itemStack = item.getItem()

    const modal = new ActionFormData()
    modal.title(`${target.name} - ${item.typeId.split("minecraft:")[1]}`)

    var enchComp = itemStack.getComponent("enchantments") // Enchantment list

    var enchantments = [...enchComp.enchantments]

    enchantments.forEach(enchantment => {
        var type = enchantment.type.id.charAt(0).toUpperCase() + enchantment.type.id.substr(1, enchantment.type.id.length)
        modal.button(`§c${type} ${enchantment.level}`)
    })

    modal.button("§cBack\n§7Press to go back")

    modal.show(player).then(response => {
        if (response.cancelationReason == "userClosed") return

        if (response.selection == enchantments.length) return page_item(player, target, item)
        page_item_enchantments(player, target, item)

    })

}

function page_item_warning(message, player, target, item, cancel, cb) {

    const modal = new MessageFormData()
    modal.title(`§f- §cWarning§f -`)
    modal.body(message)
    modal.button1("§cCONTIUNUE")
    modal.button2("§cCANCEL")

    modal.show(player).then(response => {
        if (response.cancelationReason == "userClosed") return

        if (response.selection == 1) cb(player, target, item)
        if (response.selection == 2) cancel()

    })

}

world.events.beforeChat.subscribe((data) => {
    if (data.message == "-invsee" && invSeeAccess_Filter(data.sender)) {
        data.cancel = true
        page_listPlayers(data.sender)
    }
})
