# Patching bedrock-protocol to Support Minecraft Bedrock 1.26.51

## Background

The `bedrock-protocol` npm package (v3.59.0) uses `minecraft-data` (v3.116.0) for version
information, packet schemas, and protocol definitions. As of this writing, `minecraft-data`
only supports Minecraft Bedrock versions up to **1.26.45** (protocol version 2169).

If you need to connect to a server running **1.26.51**, you must patch both packages.

The official protocol version for 1.26.51 is **2193** (source: Mojang's bedrock-protocol-docs).

## What Was Patched

Six files across `minecraft-data` and one file in `bedrock-protocol` were modified. The
protocol schema (packet definitions) for 1.26.51 is copied from 1.26.45, since 1.26.51
is not yet in the upstream `minecraft-data` release. This works because the core packet
structure is largely the same between these close versions.

---

## Files Modified

All paths below are relative to `node_modules/`.

---

### 1. `minecraft-data/minecraft-data/data/bedrock/common/protocolVersions.json`

This file maps Minecraft version strings to their numeric protocol versions. Add 1.26.51
as the first entry (highest protocol number = newest version).

**Change:** Insert this object at the very top of the JSON array:

```json
{
  "version": 2193,
  "minecraftVersion": "1.26.51",
  "majorVersion": "1.26",
  "releaseType": "release"
}
```

The file should start like this after editing:

```json
[
  {
    "version": 2193,
    "minecraftVersion": "1.26.51",
    "majorVersion": "1.26",
    "releaseType": "release"
  },
  {
    "version": 2169,
    "minecraftVersion": "1.26.45",
    "majorVersion": "1.26",
    "releaseType": "release"
  },
  ...
]
```

---

### 2. `minecraft-data/minecraft-data/data/bedrock/common/versions.json`

This is the list of all supported Bedrock major version directories that have data.
Append `1.26.51` to the end of the array.

**Change:** Add `"1.26.51"` after the last entry.

```json
  "1.26.45",
  "1.26.51"
]
```

---

### 3. `minecraft-data/minecraft-data/data/bedrock/1.26.51/` (new directory)

Create this directory and populate it with two files.

#### 3a. `version.json`

```json
{
  "version": 2193,
  "minecraftVersion": "1.26.51",
  "majorVersion": "1.26",
  "releaseType": "release"
}
```

#### 3b. `protocol.json`

Copy the entire file from `minecraft-data/minecraft-data/data/bedrock/1.26.45/protocol.json`.
This file contains the full packet schema (packet types, field definitions, etc.).

```bash
cp node_modules/minecraft-data/minecraft-data/data/bedrock/1.26.45/protocol.json \
   node_modules/minecraft-data/minecraft-data/data/bedrock/1.26.51/protocol.json
```

---

### 4. `minecraft-data/minecraft-data/data/dataPaths.json`

This file tells `minecraft-data` where to find each piece of data (blocks, protocol,
items, etc.) for each version. Add a `1.26.51` entry at the end of the `bedrock` object,
right after the `1.26.45` block.

**Change:** Add this object inside the `bedrock` section, after `1.26.45`:

```json
"1.26.51": {
  "blocks": "bedrock/1.26.30",
  "blockStates": "bedrock/1.26.30",
  "blockCollisionShapes": "bedrock/1.26.30",
  "biomes": "bedrock/1.21.60",
  "entities": "bedrock/1.21.80",
  "items": "bedrock/1.26.30",
  "recipes": "bedrock/1.19.10",
  "instruments": "bedrock/1.17.0",
  "materials": "pc/1.17",
  "enchantments": "bedrock/1.19.1",
  "effects": "pc/1.17",
  "protocol": "bedrock/1.26.51",
  "windows": "bedrock/1.16.201",
  "steve": "bedrock/1.21.70",
  "blocksB2J": "bedrock/1.26.30",
  "blocksJ2B": "bedrock/1.26.30",
  "proto": "bedrock/latest",
  "types": "bedrock/latest",
  "version": "bedrock/1.26.51",
  "language": "bedrock/1.21.70"
}
```

Key difference from 1.26.45: `"protocol"` and `"version"` point to `bedrock/1.26.51`
instead of `bedrock/1.26.45`. All other data paths (blocks, items, biomes, etc.) remain
the same since those shared assets haven't changed between these versions.

---

### 5. `minecraft-data/data.js`

This is the master registry that `minecraft-data` uses to lazily load data for each
version. It maps version strings to getter functions that `require()` the actual JSON
files. Add a `1.26.51` entry inside the `bedrock` section, right after `1.26.45`.

**Change:** Add this block after the `1.26.45` entry, inside the `bedrock` object:

```javascript
'1.26.51': {
  get blocks () { return require("./minecraft-data/data/bedrock/1.26.30/blocks.json") },
  get blockStates () { return require("./minecraft-data/data/bedrock/1.26.30/blockStates.json") },
  get blockCollisionShapes () { return require("./minecraft-data/data/bedrock/1.26.30/blockCollisionShapes.json") },
  get biomes () { return require("./minecraft-data/data/bedrock/1.21.60/biomes.json") },
  get entities () { return require("./minecraft-data/data/bedrock/1.21.80/entities.json") },
  get items () { return require("./minecraft-data/data/bedrock/1.26.30/items.json") },
  get recipes () { return require("./minecraft-data/data/bedrock/1.19.10/recipes.json") },
  get instruments () { return require("./minecraft-data/data/bedrock/1.17.0/instruments.json") },
  get materials () { return require("./minecraft-data/data/pc/1.17/materials.json") },
  get enchantments () { return require("./minecraft-data/data/bedrock/1.19.1/enchantments.json") },
  get effects () { return require("./minecraft-data/data/pc/1.17/effects.json") },
  get protocol () { return require("./minecraft-data/data/bedrock/1.26.51/protocol.json") },
  get windows () { return require("./minecraft-data/data/bedrock/1.16.201/windows.json") },
  get steve () { return require("./minecraft-data/data/bedrock/1.21.70/steve.json") },
  get blocksB2J () { return require("./minecraft-data/data/bedrock/1.26.30/blocksB2J.json") },
  get blocksJ2B () { return require("./minecraft-data/data/bedrock/1.26.30/blocksJ2B.json") },
  proto: __dirname + '/minecraft-data/data/bedrock/latest/proto.yml',
  types: __dirname + '/minecraft-data/data/bedrock/latest/types.yml',
  get version () { return require("./minecraft-data/data/bedrock/1.26.51/version.json") },
  get language () { return require("./minecraft-data/data/bedrock/1.21.70/language.json") }
}
```

Note: The `protocol` and `version` getters must point to the new `1.26.51` directory.
All other getters point to the same files as `1.26.45` because those shared assets are
unchanged.

---

### 6. `bedrock-protocol/src/options.js`

This file defines the `CURRENT_VERSION` constant and builds the `Versions` map from
`minecraft-data`. The `CURRENT_VERSION` may already be set to `1.26.51` (it was in this
case). If not, update it:

```javascript
const CURRENT_VERSION = '1.26.51'
```

The `Versions` map is built dynamically from `protocolVersions.json`:

```javascript
const Versions = Object.fromEntries(
  mcData.versions.bedrock
    .filter(e => e.releaseType === 'release')
    .map(e => [e.minecraftVersion, e.version])
);
```

No change needed here since it reads from the JSON file we patched in step 1.

---

### 7. Your application's `index.js` (or wherever you create the client)

Update the version in your `createClient` call:

```javascript
client = bedrockProtocol.createClient({
  host: "your-server-ip",
  port: 19132,
  version: "1.26.51",  // <-- changed from "1.26.45"
  profilesFolder: "./profiles",
});
```

---

## Verification

After applying all patches, run this quick check:

```bash
node -e "
const mcData = require('minecraft-data');
const data = mcData('bedrock_1.26.51');
console.log('Version:', data.version.minecraftVersion);
console.log('Protocol:', data.version.version);
console.log('Protocol schema loaded:', !!data.protocol);

const Options = require('bedrock-protocol/src/options');
console.log('In Versions map:', !!Options.Versions['1.26.51']);
console.log('Protocol version:', Options.Versions['1.26.51']);
"
```

Expected output:

```
Version: 1.26.51
Protocol: 2193
Protocol schema loaded: true
In Versions map: true
Protocol version: 2193
```

---

## How It Works

The connection flow for version negotiation:

1. **Ping** - Client pings the server via RakNet to get the server advertisement (MOTD).
   The server responds with its version string (e.g., `1.26.51`).

2. **Version selection** - `createClient.js` checks if the server's version exists in
   the `Versions` map. If the user passed an explicit `version` option, that takes
   priority. Otherwise it falls back to `CURRENT_VERSION`.

3. **Validation** - `validateOptions()` in `options.js` looks up the protocol version
   number from the `Versions` map. If the version is not in the map, it throws
   `"Unsupported version"`.

4. **Schema loading** - `serializer.js` calls `require('minecraft-data')('bedrock_' + version)`
   which resolves via `data.js` -> `dataPaths.json` -> the actual `protocol.json` file.
   This loads the packet definitions for serialization/deserialization.

5. **Feature detection** - `client.js` calls `supportFeature()` to check feature flags
   (e.g., `compressorInPacketHeader`, `itemRegistryPacket`, `newLoginIdentityFields`).
   These flags are defined in `minecraft-data/data/bedrock/common/features.json` and are
   matched by version ranges, so 1.26.51 inherits the correct flags from the 1.26 range.

6. **Login** - The client sends a login packet with the `protocol_version` field set to
   2193 (for 1.26.51). The game version string `1.26.51` is embedded in the login JWT.

---

## Limitations

- The protocol schema (packet definitions) is copied from 1.26.45. Between protocol
  versions 2169 and 2193, some packets may have gained or lost fields. You may see
  deserialization warnings (e.g., `"expected 393 string"`) for packets where the schema
  doesn't perfectly match. Despite this, the bot will connect and stay connected because
  the core handshake, login, and chat packets are compatible.

- Running `npm install` or `npm ci` will overwrite all patches. To make them persistent,
  you could:
  - Fork `minecraft-data` and `bedrock-protocol`, apply patches there, and use your
    forks via `package.json`.
  - Use a post-install script (e.g., `patch-package`) to reapply patches automatically.
  - Maintain a local copy of the patched `node_modules` and restore it when needed.

---

## Quick Reference: Protocol Version Map (Recent)

| Minecraft Version | Protocol Version |
|-------------------|------------------|
| 1.26.51           | 2193             |
| 1.26.50           | 2193             |
| 1.26.45           | 2169             |
| 1.26.40           | 2168             |
| 1.26.30           | 1001             |
| 1.26.20           | 975              |
| 1.26.10           | 944              |
| 1.26.0            | 924              |

---

## Summary of All Changes

```
node_modules/minecraft-data/minecraft-data/data/bedrock/common/protocolVersions.json
  -> Added 1.26.51 entry (protocol 2193)

node_modules/minecraft-data/minecraft-data/data/bedrock/common/versions.json
  -> Added "1.26.51" to array

node_modules/minecraft-data/minecraft-data/data/bedrock/1.26.51/version.json
  -> Created (version: 2193)

node_modules/minecraft-data/minecraft-data/data/bedrock/1.26.51/protocol.json
  -> Copied from 1.26.45/protocol.json

node_modules/minecraft-data/minecraft-data/data/dataPaths.json
  -> Added 1.26.51 data path mapping

node_modules/minecraft-data/data.js
  -> Added 1.26.51 loader entry

node_modules/bedrock-protocol/src/options.js
  -> CURRENT_VERSION should be "1.26.51" (verify, may already be set)

index.js (your app)
  -> version: "1.26.51"
```
