import { Color, Scene } from "raycast-ts"
import { Map1Scene } from "./Map1Scene"

export class StartScene extends Scene {

    public preload(): void {

        this.load.texture("FIRESPELL", "./images/firespell_1.png")
        this.load.textTexture("MSG1", "Welcome, Adventurer!", { fontSize: 24, color: Color.DARK_GREEN })
        this.load.textTexture("MSG2", "Your mission is to steal the", { fontSize: 24 })
        this.load.textTexture("MSG3", "fire spell from the witch", { fontSize: 24 })
        this.load.textTexture("MSG4", "Click to continue", { fontSize: 16, color: Color.YELLOW })
    }

    public init(): void {

        const resolution = this.gameInstance.resolution
        const msg1Tex = this.load.getTexture("MSG1")!
        const msg2Tex = this.load.getTexture("MSG2")!
        const msg3Tex = this.load.getTexture("MSG3")!
        const msg4Tex = this.load.getTexture("MSG4")!
        const firespellTexture = this.load.getTexture("FIRESPELL")!

        this.add.text((resolution.width - msg1Tex.width) / 2, 30, "MSG1")
        this.add.text((resolution.width - msg2Tex.width) / 2, 80, "MSG2")
        this.add.text((resolution.width - msg3Tex.width) / 2, 100, "MSG3")

        this.add.text((resolution.width - msg4Tex.width) / 2, 200, "MSG4")
        this.add.rectangle((resolution.width - firespellTexture.width) / 2, 130, 46, 58, "FIRESPELL")
    }

    public onMouseClick(): void {

        this.gameInstance.start(Map1Scene)
    }
}
