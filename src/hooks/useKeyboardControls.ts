import { useEffect, useRef } from "react";

export interface KeyboardState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
}

const FORWARD_KEYS = ["KeyW", "ArrowUp"];
const BACKWARD_KEYS = ["KeyS", "ArrowDown"];
const LEFT_KEYS = ["KeyA", "ArrowLeft"];
const RIGHT_KEYS = ["KeyD", "ArrowRight"];
const SPRINT_KEYS = ["ShiftLeft", "ShiftRight"];

/**
 * Hook untuk membaca status tombol WASD / arrow keys + Shift (sprint).
 * Mengembalikan ref (bukan state) supaya bisa dibaca tiap frame di useFrame
 * tanpa memicu re-render React setiap keydown/keyup.
 */
export function useKeyboardControls() {
  const state = useRef<KeyboardState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (FORWARD_KEYS.includes(event.code)) state.current.forward = true;
      if (BACKWARD_KEYS.includes(event.code)) state.current.backward = true;
      if (LEFT_KEYS.includes(event.code)) state.current.left = true;
      if (RIGHT_KEYS.includes(event.code)) state.current.right = true;
      if (SPRINT_KEYS.includes(event.code)) state.current.sprint = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (FORWARD_KEYS.includes(event.code)) state.current.forward = false;
      if (BACKWARD_KEYS.includes(event.code)) state.current.backward = false;
      if (LEFT_KEYS.includes(event.code)) state.current.left = false;
      if (RIGHT_KEYS.includes(event.code)) state.current.right = false;
      if (SPRINT_KEYS.includes(event.code)) state.current.sprint = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return state;
}
