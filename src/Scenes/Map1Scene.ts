import { AudioType, Clock, Color, FieldOfViewEffect, RaycastScene, Side, Sprite, Vec2D } from "raycast-ts"
import { MinimapMarker } from "raycast-ts/src/models/MinimapMarker"
import { Minimap } from "raycast-ts/src/objects/Minimap"
import { TextureUtils } from "raycast-ts/src/utils/Texture.utils"
import { Projectile } from "raycast-ts/src/objects/Projectile"
import { Map1EndingScene } from "./Map1EndingScene"

export class Map1Scene extends RaycastScene {

    public ambientLight: number = 0.8
    public distanceShadeFactor = 0.05
    protected distanceShade = (distance: number): number => 1.0 - distance * this.distanceShadeFactor

    private gotKey = false
    private hasSpell = false
    private spellRecharging = false
    private spellCooldown = 400
    private ghostKilled = false
    private bat: Sprite | null = null

    public preload(): void {

        this.load.map("./maps/map1.json")
        this.load.texture("GRASS-2", "./images/grass-02.png")
        this.load.texture("GRASS-3", "./images/grass-03.png")
        this.load.texture("DOOR", "./images/door.png")
        this.load.texture("GATE", "./images/gate.png")
        this.load.texture("BAT", "./images/bat.png")
        this.load.texture("FIREBAT", "./images/fire-bat.png")
        this.load.texture("RUNE", "./images/rune.png")
        this.load.texture("SMILE_STICKER", "./images/smile-sticker.png")
        this.load.texture("SMILE_STICKER_BURN", "./images/smile-sticker-1.png")
        this.load.texture("KEY", "./images/key.png")
        this.load.texture("GHOST", "./images/ghost.png")
        this.load.texture("GHOST-1", "./images/ghost-1.png")
        this.load.texture("FIRESPELL", "./images/fire-spell.png")
        this.load.texture("FIRESPELL_1", "./images/firespell_1.png")
        this.load.textTexture("TEXT_FIND_KEY", "Find the key!", { fontSize: 12, color: Color.YELLOW })
        this.load.textTexture("TEXT_OPEN_DOOR", "Open the door (\"E\" key)", { fontSize: 12, color: Color.BROWN })
        this.load.textTexture("TEXT_FIRE_SPELL", "Get the Fire spell!", { fontSize: 12, color: Color.RED })
        this.load.textTexture("TEXT_BURN_1", "Use the fire spell (Mouse click)", { fontSize: 12, color: Color.YELLOW })
        this.load.textTexture("TEXT_BURN_2", "on the rune outside the house", { fontSize: 12, color: Color.YELLOW })
        this.load.textTexture("TEXT_KILL_GHOST", "Kill the ghosts!", { fontSize: 12, color: Color.WHITE })
        this.load.textTexture("TEXT_FIND_EXIT", "Find the gate and exit (\"E\" key)", { fontSize: 12, color: Color.DARK_GREEN })

        this.load.audio("MUSIC", AudioType.MUSIC, "./audios/lostdrone-ballon.mp3")
        this.load.audio("GOT_KEY_SOUND", AudioType.MUSIC, "./audios/heal.ogg")
        this.load.audio("GOT_SPELL_SOUND", AudioType.MUSIC, "./audios/explode1.ogg")
        this.load.audio("SPELL_SOUND", AudioType.MUSIC, "./audios/shot.ogg")
    }

    public init(): void {

        this.camera.angle = 5.2

        this.map.skybox = TextureUtils.makeSkyBoxNightTexture(this.gameInstance.resolution.height)

        const minimap = new Minimap(this.map, this.camera)
        this.add.object(minimap)

        const music = this.load.getAudio("MUSIC")

        if (music) {

            music.volume = 0.4
            music.play()
        }

        // random grass
        for (const _ of new Array(30).keys()) {

            // tall grass
            let x = 0, y = 0

            while (this.map.getTile(x, y)?.solid) {

                x = Math.floor(Math.random() * this.map.size.width)
                y = Math.floor(Math.random() * this.map.size.height)
            }

            this.add.sprite(x, y, 0.3, 0.3, "GRASS-2", {})

            // short grass
            x = 0, y = 0

            while (this.map.getTile(x, y)?.solid) {

                x = Math.floor(Math.random() * this.map.size.width)
                y = Math.floor(Math.random() * this.map.size.height)
            }

            this.add.sprite(x, y, 0.2, 0.2, "GRASS-3", {})
        }

        // add bat
        this.bat = this.add.sprite(10, 10, 0.3, 0.6, "BAT", { frameWidth: 125, frameHeight: 300 })

        this.bat.onProjectileHit = () => {

            const angle = this.bat!.angle
            this.bat!.visible = false
            this.bat = this.add.sprite(10, 10, 0.3, 0.6, "FIREBAT", { frameWidth: 125, frameHeight: 300 })
            this.bat.angle = angle
        }

        // quest-1: get the key
        const keySprite = <Sprite>this.getObject("KEY")!
        const findKeyText = this.add.text(36, 16, "TEXT_FIND_KEY")!
        const keyRect = this.add.rectangle(10, 10, 24, 24, "KEY")!
        const keyMarker = new MinimapMarker(keySprite.x, keySprite.y, Color.YELLOW)
        minimap.addMarker(keyMarker)

        // quest-2: open the door
        const doorRect = this.add.rectangle(10, 10, 24, 24, "DOOR")
        const openDoorText = this.add.text(36, 16, "TEXT_OPEN_DOOR")
        const doorTile = this.map.getTile(16, 5)!
        const doorMarker = new MinimapMarker(doorTile.position.x, doorTile.position.y, Color.BROWN)
        doorRect.visible = false
        openDoorText.visible = false

        // quest-3: get the fire spell
        const firespellSprite = this.add.sprite(18, 2, 0.5, 0.5, "FIRESPELL", { frameWidth: 128, frameHeight: 128, frameChangeTime: 50 })
        const firespellRect = this.add.rectangle(10, 10, 23, 29, "FIRESPELL_1")
        const firespellText = this.add.text(36, 16, "TEXT_FIRE_SPELL")
        const firespellMarker = new MinimapMarker(firespellSprite.x, firespellSprite.y, Color.RED)
        firespellRect.visible = false
        firespellText.visible = false

        // quest-4: use firespell on rune
        const runeTile = this.map.getTile(14, 5)!
        const runeMarker = new MinimapMarker(runeTile.position.x, runeTile.position.y, Color.BLACK)
        const runeText1 = this.add.text(36, 16, "TEXT_BURN_1")
        const runeText2 = this.add.text(36, 32, "TEXT_BURN_2")
        const runeIcon = this.add.rectangle(10, 10, 24, 32, "RUNE")
        runeText1.visible = false
        runeText2.visible = false
        runeIcon.visible = false

        // quest-5: kill the ghost
        const ghost = this.add.sprite(10, 10, 0.5, 0.8, "GHOST", { frameWidth: 196, frameHeight: 299 })
        const ghostRect = this.add.rectangle(10, 10, 32, 24, "GHOST-1")
        const textKillGhost = this.add.text(48, 16, "TEXT_KILL_GHOST")
        ghost.visible = false
        ghostRect.visible = false
        textKillGhost.visible = false

        // quest-6: find the exit
        const gateTile = this.map.getTile(18, 19)!
        const gateMarker = new MinimapMarker(gateTile.position.x, gateTile.position.y, Color.DARK_GREEN)
        const gateText = this.add.text(40, 16, "TEXT_FIND_EXIT")
        const gateRect = this.add.rectangle(10, 10, 24, 32, "GATE")
        gateText.visible = false
        gateRect.visible = false

        // found the key
        keySprite.onCollision = () => {

            keySprite.visible = false
            findKeyText.visible = false
            keyRect.visible = false
            doorRect.visible = true
            openDoorText.visible = true
            this.gotKey = true
            minimap.removeMarker(keyMarker)
            minimap.addMarker(doorMarker)
            this.load.getAudio("GOT_KEY_SOUND")?.play()
        }

        // opened the door
        doorTile.onUse = () => {

            if (!this.gotKey) return

            doorTile.collision = false
            doorTile.solid = false
            doorRect.visible = false
            openDoorText.visible = false
            firespellRect.visible = true
            firespellText.visible = true
            minimap.removeMarker(doorMarker)
            minimap.addMarker(firespellMarker)
        }

        // got firespell
        firespellSprite.onCollision = () => {

            this.hasSpell = true
            firespellSprite.visible = false
            firespellRect.visible = false
            firespellText.visible = false
            runeText1.visible = true
            runeText2.visible = true
            runeIcon.visible = true
            minimap.removeMarker(firespellMarker)
            minimap.addMarker(runeMarker)
            new FieldOfViewEffect(this.gameInstance.config, 2500)
            this.load.getAudio("GOT_SPELL_SOUND")?.play()
        }

        // burn rune
        runeTile.onProjectileHit = () => {

            if (this.ghostKilled) return

            runeTile.detail[Side.WEST] = null
            runeIcon.visible = false
            runeText1.visible = false
            runeText2.visible = false
            minimap.removeMarker(runeMarker)
            ghost.visible = true
            ghostRect.visible = true
            textKillGhost.visible = true
        }

        const stickerTile = this.map.getTile(14, 1)!
        stickerTile.onProjectileHit = () => {

            stickerTile.detail[Side.EAST] = this.load.getTexture("SMILE_STICKER_BURN")
        }

        // ghost killed
        ghost.onProjectileHit = () => {

            ghost.visible = false
            ghostRect.visible = false
            textKillGhost.visible = false
            this.ghostKilled = true
            gateRect.visible = true
            gateText.visible = true
            minimap.addMarker(gateMarker)
        }

        // gate use
        gateTile.onUse = () => {

            if (!this.ghostKilled) return

            this.load.getAudio("MUSIC")?.pause()
            this.gameInstance.start(Map1EndingScene)
        }
    }

    public update(clock: Clock): void {

        super.update(clock)
        this.birdMovement(clock)
    }

    public birdMovement(clock: Clock): void {

        const center = new Vec2D(11, 11)

        this.bat!.x = center.x + Math.cos(this.bat!.angle) * 1.5
        this.bat!.y = center.y + Math.sin(this.bat!.angle) * 1.5
        this.bat!.angle += 2 * clock.deltaTime
    }

    public onMouseClick(): void {

        if (this.hasSpell && !this.spellRecharging) {

            this.spellRecharging = true
            const projectile = new Projectile(this.camera, 10.0, "FIRESPELL", { frameWidth: 128, frameHeight: 128, frameChangeTime: 50 })
            this.add.object(projectile)
            setTimeout(() => this.spellRecharging = false, this.spellCooldown)
            this.load.getAudio("SPELL_SOUND")?.play()
        }
    }
}
