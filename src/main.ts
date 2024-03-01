import './style.css'
import { Game, GameConfig } from 'raycast-ts'
import { StartScene } from './Scenes/StartScene'

const app = document.querySelector<HTMLDivElement>('#app')!
const config = new GameConfig(app)
const game = new Game(config)

// setup loading
const loadingSpan = document.querySelector<HTMLSpanElement>("#loading")!
game.onLoadingStart = () => loadingSpan.style.visibility = "visible";
game.onLoadingEnd = () => loadingSpan.style.visibility = "hidden";

game.start(StartScene)
