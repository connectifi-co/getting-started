import {
    createAgent
  } from "@connectifi/agent-web";

  document.addEventListener('DOMContentLoaded',async () => {
    const fdc3 = await createAgent('https://nicholaskolba.connectifi-interop.com', 'example@sandbox', {
        
    });

    (window as any).fdc3 = fdc3;

  });