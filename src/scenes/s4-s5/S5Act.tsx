import { Scene, SceneHeading, SceneSlot } from "@/components/scene/Scene";

// PLACEHOLDER (phase 0). Owner: 1B. THE PEAK: the page's largest type and its
// only full-bleed block. The document line is drawn by 1B.
export function S5Act() {
  return (
    <Scene id="act" layout="peak">
      <SceneSlot slot="wide">
        <SceneHeading id="act" size="display">
          Machines that act
        </SceneHeading>
      </SceneSlot>
      <SceneSlot slot="text">
        <p>
          In 2022 and 2023 language models learned to use tools. At my day job I build agents that call tools to check a seller’s KYC, tax and legal
          documents, with retries when a check fails. Schema checks, fallbacks and an eval set keep them dependable.
        </p>
      </SceneSlot>
      <SceneSlot slot="note">
        <ul className="s5-metrics">
          <li>
            <strong>days → minutes</strong> seller activation
          </li>
          <li>
            <strong>−40%</strong> listing time
          </li>
          <li>
            <strong>−30%</strong> storefront time-to-market
          </li>
        </ul>
      </SceneSlot>
    </Scene>
  );
}
