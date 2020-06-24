import { System } from "ecsy"
import { InputState } from "../components/InputState"
import { GamepadInputState } from "../components/GamepadInputState"
export class GamepadInputSystem extends System {
  set debug(debug: boolean) {
    this.debug = debug
  }
  queries = {
    gamepad: {
      components: [GamepadInputState, InputState],
      listen: {
        added: true,
        removed: true
      },
      added: [],
      results: []
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(delta: number, time: number): void {
    this.queries.gamepad.added.forEach(ent => {
      const gp = ent.getMutableComponent(GamepadInputState)
      window.addEventListener("gamepadconnected", (event: any) => {
        console.log("A gamepad connected:", event.gamepad)
        gp.connected = true
      })
      window.addEventListener("gamepaddisconnected", (event: any) => {
        console.log("A gamepad disconnected:", event.gamepad)
        gp.connected = false
      })
    })
    this.queries.gamepad.results.forEach(ent => {
      const gp = ent.getMutableComponent(GamepadInputState)
      if (gp.connected) {
        this._scan_gamepads(gp, ent.getMutableComponent(InputState))
      }
    })
  }

  _scan_gamepads(gp: GamepadInputState, inp: InputState): void {
    const gamepads = navigator.getGamepads()
    gamepads.forEach(gamepad => {
      if (gamepad.axes) {
        if (gamepad.axes.length >= 2) {
          this.scan_x(gp, gamepad.axes[0], inp)
          this.scan_y(gp, gamepad.axes[1], inp)
        }
      }
    })
  }

  scan_x(gp: GamepadInputState, x: number, input: InputState): void {
    if (x < -gp.axis_threshold) {
      input.states.left = true
      input.states.right = false
      return
    }
    if (x > gp.axis_threshold) {
      input.states.left = false
      input.states.right = true
      return
    }
    input.states.left = false
    input.states.right = false

    if (this.debug) console.log("left: " + input.states.left)
    if (this.debug) console.log("right: " + input.states.right)
  }

  scan_y(gp: GamepadInputState, y: number, input: InputState): void {
    if (y < -gp.axis_threshold) {
      input.states.up = false
      input.states.down = true
      return
    }
    if (y > gp.axis_threshold) {
      input.states.up = true
      input.states.down = false
      return
    }
    input.states.up = false
    input.states.down = false

    if (this.debug) console.log("up: " + input.states.up)
    if (this.debug) console.log("down: " + input.states.down)
  }
}