import { createAgent } from "@connectifi/agent-web";

document.addEventListener("DOMContentLoaded", async () => {
  const fdc3 = await createAgent(
    "https://dev.connectifi-interop.com",
    "example@sandbox",
    {
      logLevel: "debug",
      onLoading: () => {
        const errorEl = document.getElementById("errorEl");
        errorEl?.classList.add('show');
        const loaderEl = document.getElementById("loaderEl");
        loaderEl?.classList.add("active");
      },
      onLoadingStopped: () => {
        const loaderEl = document.getElementById("loaderEl");
        loaderEl?.classList.remove("active");
      },
    }
  );

  const intentButton = document.getElementById("raiseIntent");
  const contextButton = document.getElementById("raiseContext");
  const openButton = document.getElementById("callOpen");

  const displayError = (error : string) => {
    const errorEl = document.getElementById("errorEl");
    if (errorEl){
        errorEl.classList.add('show');
        errorEl.textContent = error;
    }
  }

  intentButton?.addEventListener("click", async () => {
    try {
        await fdc3?.raiseIntent("fakeIntent", { type: "fakeContext" });
    } catch (err) {
        displayError((err as Error).message);
    }
  });

  contextButton?.addEventListener("click", async () => {
    try {
        await fdc3?.raiseIntentForContext({type:"fakeContext"});
    } catch (err) {
        displayError((err as Error).message);
    }
  });

  openButton?.addEventListener("click", async () => {
    try {
        await fdc3?.open('fakeAppName',{type: "fdc3.instrument", id:{ticker:"MSFT"}});
    } catch (err) {
        displayError((err as Error).message);
    }
  });
});
