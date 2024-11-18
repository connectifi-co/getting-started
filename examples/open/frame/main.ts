import { createAgent, ConnectifiOpenMessage } from "@connectifi/agent-web";

document.addEventListener("DOMContentLoaded", async () => {
  const fdc3 = await createAgent(
    "https://platform.connectifi.app",
    "example@_global.sandbox",
    {
      headless: true,
      handleOpen: (message: ConnectifiOpenMessage) => {
        const targetContainer = document.getElementById("targetContainer");
        let target = document.getElementById("target") as HTMLIFrameElement;
        //recreate the iFrame to avoid cross-origin issues
        if (target && targetContainer) {
          targetContainer.removeChild(target);
          target = document.createElement("iframe") as HTMLIFrameElement;
          target.id = "target";
          targetContainer.appendChild(target);
          target.src = message.url || "about:blank";
        }
      },
    }
  );

  const open1Button = document.getElementById("callOpen1");
  const open2Button = document.getElementById("callOpen2");
  const open3Button = document.getElementById("callOpen3");

  open1Button?.addEventListener("click", () => {
    fdc3?.open({appId:"tradingviewChart"}, {
      type: "fdc3.instrument",
      id: { ticker: "MSFT" },
    });
  });

  open2Button?.addEventListener("click", () => {
    fdc3?.open({appId:"tradingviewChart"}, {
      type: "fdc3.instrument",
      id: { ticker: "GOOG" },
    });
  });

  open3Button?.addEventListener("click", () => {
    fdc3?.open({appId:"tradingviewChart"}, {
      type: "fdc3.instrument",
      id: { ticker: "AMZN" },
    });
  });
});
