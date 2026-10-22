// Workstream 1B's entry point. The home page renders <Scenes4to5 />; 1B may
// change anything in this folder, but keep this export's name.
import "./s4-s5.css";
import { S4Taught } from "./S4Taught";
import { S5Act } from "./S5Act";

export function Scenes4to5() {
  return (
    <>
      <S4Taught />
      <S5Act />
    </>
  );
}
