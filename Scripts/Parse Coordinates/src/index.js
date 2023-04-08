/**
 * 
 * @param {string} input The position to add, example ~5 ~3 ~2
 * @param {({x: number, y: number, z: number})} vector3 Position of the player
 * @param {Boolean} floor Whether it should return the number floored
 * @returns New Vector3
 */

function parseCoords(input, vector3, floor = true) {
    const parts = input.split(" ")
    const axes = ["x", "y", "z"]
    let coordinates = {}

    parts.forEach((pos, i) => {

        let axis = axes[i]
        floor ? coordinates[axis] = Math.floor(pos.includes("~") ? (parseInt(pos.replace("~", "")) || 0) + vector3[axis] : parseInt(pos)) : pos.includes("~") ? (parseInt(pos.replace("~", "")) || 0) + vector3[axis] : parseInt(pos)

    })

    return coordinates
}

/**
 * Examples
 * 
 * parseCoords("~10 ~5 ~1", { x: 100, y: 123, z: 12 })
 * ^ Returns - { "x": 110, "y": 128, "z": 13 }
 * 
 * parseCoords("25 30 ~11", { x: 245, y: 96, z: -32 })
 * ^ Returns - { "x": 25, "y": 30, "z": -21 }
 * 
 */