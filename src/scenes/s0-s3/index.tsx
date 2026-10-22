// Workstream 1A's entry point. The home page renders <Scenes0to3 />; 1A may
// change anything in this folder, but keep this export's name.
import "./s0-s3.css";
import { S0Objection } from "./S0Objection";
import { S1Ruler } from "./S1Ruler";
import { S2Handwriting } from "./S2Handwriting";
import { S3Collaborative } from "./S3Collaborative";

export function Scenes0to3() {
  return (
    <>
      <S0Objection />
      <S1Ruler />
      <S2Handwriting />
      <S3Collaborative />
    </>
  );
}
