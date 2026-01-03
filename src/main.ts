import "./style.css";
import { makeGame, startGame, updateGame, drawGame } from "./game";

window.onload = () => {
  const game = makeGame();
  (window as any).game = game;

  startGame(game);

  const loop = (now: number) => {
    updateGame(game, now);
    drawGame(game);
    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
};
