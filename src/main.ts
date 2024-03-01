import './style.css'
import { Game, GameConfig } from 'raycast-ts'
import { StartScene } from './Scenes/StartScene'
import GUI from 'lil-gui'
import { Map1Scene } from './Scenes/Map1Scene'
import { Map2Scene } from './Scenes/Map2Scene'

const app = document.querySelector<HTMLDivElement>('#app')!
const config = new GameConfig(app)
const game = new Game(config)
const gui = new GUI()

/**
 * setup loading
 */
const loadingSpan = document.querySelector<HTMLSpanElement>("#loading")!
game.onLoadingStart = () => loadingSpan.style.visibility = "visible";
game.onLoadingEnd = () => loadingSpan.style.visibility = "hidden";

/**
 * setup lil-gui
 */
const setupGUI = () => {

    const guiObject = {
        ambientLight: 0,
        fieldOfView: 0,
        distanceShade: 0,
        fps: "0",
        memory: "0",
    }

    gui.add(guiObject, 'fps').listen(true).disable()
    gui.add(guiObject, 'memory').listen(true).disable()
    gui.add(guiObject, 'fieldOfView', 0, 2 * Math.PI).listen(true).onChange((value: number) => game.config.fieldOfView = value)
    gui.add(guiObject, 'ambientLight', 0, 1).listen(true).onChange((value: number) => {

        if (game.currentScene instanceof Map1Scene || game.currentScene instanceof Map2Scene) {
            game.currentScene.ambientLight = value
        }
    })
    gui.add(guiObject, 'distanceShade', 0, 1).listen(true).onChange((value: number) => {

        if (game.currentScene instanceof Map1Scene || game.currentScene instanceof Map2Scene) {
            game.currentScene.distanceShadeFactor = value
        }
    })

    // update fps
    game.onFpsChange = (fps: number) => guiObject.fps = fps.toString()

    // update memory
    setInterval(() => guiObject.memory = `${((window.performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`, 2000)

    // update fieldOfView, ambientLight and distanceShade
    setInterval(() => {

        guiObject.fieldOfView = game.config.fieldOfView

        if (game.currentScene instanceof Map1Scene || game.currentScene instanceof Map2Scene) {
            guiObject.ambientLight = game.currentScene.ambientLight
            guiObject.distanceShade = game.currentScene.distanceShadeFactor
        }
    }, 500)
}

/**
 * start game
 */
(async () => {

    await game.start(StartScene)
    setupGUI()

})()
