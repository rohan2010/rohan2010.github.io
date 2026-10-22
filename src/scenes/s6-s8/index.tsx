// Workstream 1C's entry point. The home page renders <Scenes6to8 />; 1C may
// change anything in this folder, but keep this export's name.
import "./s6-s8.css";
import { S6Memory } from "./S6Memory";
import { S7Everyone } from "./S7Everyone";
import { S8YourYear } from "./S8YourYear";

export function Scenes6to8() {
  return (
    <>
      <S6Memory />
      <S7Everyone />
      <S8YourYear />
    </>
  );
}
