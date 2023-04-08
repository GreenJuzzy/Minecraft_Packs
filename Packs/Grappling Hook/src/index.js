import { world } from "@minecraft/server"

var horizontalMultiplier = 0.35
var verticalMultiplier = 0.25


var countMap = new Map()

world.events.beforeItemUse.subscribe((data) => {
    function runItem(e) {
        var source = e.source
        if (e.item.typeId !== "minecraft:fishing_rod") return;
        var pulledState = Boolean(countMap.get(e.source.id)?.pulledOut ? 0 : 1)


        if (pulledState) {
            countMap.set(e.source.id, { pulledOut: pulledState })

            var getEntityF = world.events.entitySpawn.subscribe((a) => {
                if (a.entity.typeId !== "minecraft:fishing_hook") return
                countMap.set(source.id, { pulledOut: pulledState, entity: a.entity.id })
                world.events.entitySpawn.unsubscribe(getEntityF)
            })

        } else {

            var data = countMap.get(source.id)

            if (!data?.entity) return;

            var entity = [...e.source.dimension.getEntities()].filter(e => e.id == data.entity)[0]

            if (!entity) {
                countMap.set(source.id, { pulledOut: false, entity: undefined })
                return runItem(e)
            }

            var directionx = entity.location.x - e.source.location.x
            var directiony = entity.location.y - e.source.location.y
            var directionz = entity.location.z - e.source.location.z

            var horizontal = Math.abs(Math.sqrt(directionx * directionx + directiony * directiony + directionz * directionz) * horizontalMultiplier)
            var vertical = Math.abs((directiony == 0 ? 2 : directiony) * verticalMultiplier)

            e.source.applyKnockback(directionx, directionz, horizontal, vertical)

            countMap.delete(e.source.id)
        }
    }

    runItem(data)

})