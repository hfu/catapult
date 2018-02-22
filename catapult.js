const Database = require('better-sqlite3')
const VectorTile = require('@mapbox/vector-tile').VectorTile
const Protobuf = require('pbf')
const zlib = require('zlib')

const params = {
  src: '/export/unmap_global.mbtiles'
//  src: '/export/points.mbtiles'
}

const db = new Database(params.src)
let count = 0
for (const r of db.prepare('SELECT * FROM tiles').iterate()) {
  const z = r.zoom_level
  const x = r.tile_column
  const y = (1 << z) - r.tile_row - 1
  const data = zlib.gunzipSync(r.tile_data)
  try {
    const tile = new VectorTile(new Protobuf(data))
    console.log(`${z} ${x} ${y}`)
    for (const l in tile.layers) {
      for (let i = 0; i < tile.layers[l].length; i++) {
        const feature = tile.layers[l].feature(i)
        console.log(JSON.stringify(feature.toGeoJSON(x, y, z), null, 2))
      }
    }
    count++
  } catch (err) {
    console.log(err)
  }
  if(count === 1000) break
}
