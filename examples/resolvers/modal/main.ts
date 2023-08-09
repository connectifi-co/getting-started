import { createAgent } from "@connectifi/agent-web";
import { resolver } from "./resolver";

document.addEventListener("DOMContentLoaded", async () => {
  const fdc3 = await createAgent(
    "https://dev.connectifi-interop.com",
    "example@sandbox",
    {
      headless: true,
      resolverHandler: resolver,
    }
  );

  const button = document.getElementById("intentButton");
  if (button) {
    button.addEventListener("click", (event: MouseEvent) => {
      fdc3?.raiseIntent("ViewChart", {
        type: "fdc3.instrument",
        name: "International Business Machines",
        id: { ticker: "IBM", },
      });
    });
  }

  const contextButton = document.getElementById("contextButton");
  if (contextButton) {
    contextButton.addEventListener("click", (event: MouseEvent) => {
      fdc3?.raiseIntentForContext({
        type: "fdc3.instrument",
        name: "International Business Machines",
        id: { ticker: "IBM",},
      });
    });
  }
});
