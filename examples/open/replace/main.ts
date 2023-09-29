import { createAgent, ConnectifiOpenMessage } from "@connectifi/agent-web";

document.addEventListener("DOMContentLoaded", async () => {
  const fdc3 = await createAgent(
    "https://dev.connectifi-interop.com",
    "example@sandbox",
    {
      headless: true,
      handleOpen: (message: ConnectifiOpenMessage) => {
        if (message.url){
          window.location.href = message.url;
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
