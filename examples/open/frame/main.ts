import { createAgent, ConnectifiOpenMessage } from "@connectifi/agent-web";

document.addEventListener("DOMContentLoaded", async () => {
  const fdc3 = await createAgent(
    "https://dev.connectifi-interop.com",
    "example@sandbox",
    {
      headless: true,
      openHandler: (message: ConnectifiOpenMessage) => {
        const targetContainer = document.getElementById("targetContainer");
        let target = document.getElementById("target") as HTMLIFrameElement;
        //recreate the iFrame to avoid cross-origin issues
        if (target && targetContainer) {
          targetContainer.removeChild(target);
          target = document.createElement("iframe") as HTMLIFrameElement;
          target.id = "target";
          targetContainer.appendChild(target);
          if (target.contentWindow) {
            //name of the target window needs the pendingId set to fetch its context
            target.contentWindow.name = message.pendingId;
          }
          target.src = message.url || "about:blank";
        }
      },
    }
  );

  const open1Button = document.getElementById("callOpen1");
  const open2Button = document.getElementById("callOpen2");
  const open3Button = document.getElementById("callOpen3");

  open1Button?.addEventListener("click", () => {
    fdc3?.open("tradingviewChart", {
      type: "fdc3.instrument",
      id: { ticker: "MSFT" },
    });
  });

  open2Button?.addEventListener("click", () => {
    fdc3?.open("tradingviewChart", {
      type: "fdc3.instrument",
      id: { ticker: "GOOG" },
    });
  });

  open3Button?.addEventListener("click", () => {
    fdc3?.open("tradingviewChart", {
      type: "fdc3.instrument",
      id: { ticker: "AMZN" },
    });
  });
});
