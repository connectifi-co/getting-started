import { createAgent } from "@connectifi/agent-web";

document.addEventListener("fdc3Ready", () => {

        const alertReady = document.getElementById("ready");
        const alertWaiting = document.getElementById("waiting");
        if (alertReady) {
          alertReady.classList.add("show");
        }
        if (alertWaiting) {
          alertWaiting.classList.remove("show");
        }

});

document.addEventListener("DOMContentLoaded", async () => {
  const fdc3 = await createAgent(
    "https://dev.connectifi-interop.com",
    "example@sandbox"
  );
    if (fdc3){
        (window as any).fdc3 = fdc3;
        document.dispatchEvent(new CustomEvent("fdc3Ready",{}));
    }
});
