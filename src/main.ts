import './style.css'
import { Game, GameConfig } from 'raycast-ts'
import { StartScene } from './Scenes/StartScene'

const app = document.querySelector<HTMLDivElement>('#app')!
const config = new GameConfig(app)
const game = new Game(config)

game.start(StartScene)
