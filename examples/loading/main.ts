import { createAgent } from "@connectifi/agent-web";

document.addEventListener("DOMContentLoaded", async () => {
  const fdc3 = await createAgent(
    "https://platform.connectifi.app",
    "example@_global.sandbox",
    {
      logLevel: "debug",
      onWorkingChanged(working) {
        if (working) {
          const loaderEl = document.getElementById("loaderEl");
          loaderEl?.classList.add("active");
          return;
        }

        const loaderEl = document.getElementById("loaderEl");
        loaderEl?.classList.remove("active");
      },
    }
  );

  const intentButton = document.getElementById("raiseIntent");
  const joinButton = document.getElementById("joinChannel");
  const leaveButton = document.getElementById("leaveChannel");
  const openButton = document.getElementById("callOpen");

  intentButton?.addEventListener("click", () => {
    fdc3?.raiseIntent("ViewNews", {
      type: "fdc3.instrument",
      id: { ticker: "IBM" },
    });
  });

  joinButton?.addEventListener("click", () => {
    fdc3?.joinUserChannel("red");
  });

  leaveButton?.addEventListener("click", () => {
    fdc3?.leaveCurrentChannel();
  });

  openButton?.addEventListener("click", () => {
    fdc3?.open("badAppName", {
      type: "fdc3.instrument",
      id: { ticker: "MSFT" },
    });
  });
});
