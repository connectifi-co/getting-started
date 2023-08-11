import { createAgent } from "@connectifi/agent-web";

document.addEventListener("DOMContentLoaded", async () => {
  const fdc3 = await createAgent(
    "https://dev.connectifi-interop.com",
    "example@sandbox",
    {
      logLevel: "debug",
      headless: true,
      onConnected: () => {
        const alertCon = document.getElementById("connected");
        const alertDCon = document.getElementById("disconnected");
        if (alertCon) {
          alertCon.classList.add("show");
        }
        if (alertDCon) {
          alertDCon.classList.remove("show");
        }
      },
      onDisconnected: () => {
        const alertCon = document.getElementById("connected");
        const alertDCon = document.getElementById("disconnected");
        if (alertCon) {
          alertCon.classList.remove("show");
        }
        if (alertDCon) {
          alertDCon.classList.add("show");
        }
      },
    }
  );
});
