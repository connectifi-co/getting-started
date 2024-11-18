import { createAgent } from "@connectifi/agent-web";

document.addEventListener("DOMContentLoaded", async () => {
  const fdc3 = await createAgent(
    "https://platform.connectifi.app",
    "example@_global.sandbox",
    {
      props: {
        position: "mr",
      },
    }
  );
});
