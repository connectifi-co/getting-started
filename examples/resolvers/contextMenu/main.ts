import { createAgent } from "@connectifi/agent-web";
import { resolver, positionResolver } from "./resolver";

document.addEventListener("DOMContentLoaded", async () => {
  const fdc3 = await createAgent(
    "https://platform.connectifi.app",
    "example@_global.sandbox",
    {
      headless: true,
      handleIntentResolution: resolver,
    }
  );

  const button = document.getElementById("intentButton");
  if (button) {
    button.addEventListener("click", () => {
      fdc3?.raiseIntent("ViewChart", {
        type: "fdc3.instrument",
        name: "International Business Machines",
        id: { ticker: "IBM",},
      });
      const y = button.offsetTop + button.clientHeight + 10;
      const x = button.offsetLeft;
      positionResolver(x, y);
    });
  }

  const ifcButton = document.getElementById("intentContextButton");
  if (ifcButton) {
    ifcButton.addEventListener("click", () => {
      fdc3?.raiseIntentForContext({
        type: "fdc3.instrument",
        name: "International Business Machines",
        id: { ticker: "IBM",},
      });
      const y = ifcButton.offsetTop + ifcButton.clientHeight + 10;
      const x = ifcButton.offsetLeft;
      positionResolver(x, y);
    });
  }
});
