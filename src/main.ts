import { setupChat } from "./chat";

import Smile from "./Smile.json";
import OMEGALUL from "./OMEGALUL.json";
import xdd from "./xdd.json";

declare global {
  interface Console {
    chat: ReturnType<typeof setupChat>;
  }
}

if ("chat" in globalThis.console) {
  console.warn("chat is already in use");
} else {
  const EMOJIS = {
    Smile,
    OMEGALUL,
    xdd,
  };

  const chat = setupChat(EMOJIS);

  console.chat = chat;
}
