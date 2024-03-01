import { Color, Scene } from "raycast-ts"

export class Map1EndingScene extends Scene {

    public preload(): void {

        this.load.texture("FIRESPELL", "./images/firespell_1.png")
        this.load.textTexture("MSG1", "You stole the fire spell!", { fontSize: 24 })
        this.load.textTexture("MSG2", "Now the witch will hunt you!", { fontSize: 24 })
        this.load.textTexture("MSG3", "Click to continue", { fontSize: 16, color: Color.YELLOW })
    }

    public init(): void {

        const resolution = this.gameInstance.resolution
        const msg1Tex = this.load.getTexture("MSG1")!
        const msg2Tex = this.load.getTexture("MSG2")!
        const msg3Tex = this.load.getTexture("MSG3")!
        const firespellTexture = this.load.getTexture("FIRESPELL")!

        this.add.text((resolution.width - msg1Tex.width) / 2, 100, "MSG1")
        this.add.text((resolution.width - msg2Tex.width) / 2, 130, "MSG2")
        this.add.text((resolution.width - msg3Tex.width) / 2, 200, "MSG3")
        this.add.rectangle((resolution.width - firespellTexture.width) / 2, 30, 46, 58, "FIRESPELL")
    }

    public onMouseClick(): void {

        // TODO: start next scene
    }
}
