import {
    createAgent
  } from "@connectifi/agent-web";

  document.addEventListener('DOMContentLoaded',async () => {
    const fdc3 = await createAgent('https://nicholaskolba.connectifi-interop.com', 'example@sandbox', {
        
    });

    (window as any).fdc3 = fdc3;
    await fdc3?.addIntentListener('singletonIntent', (context) => {
        console.log('received singleton intent', context);
    });

    const singletonButton = document.getElementById('raiseSingletonIntent');
    singletonButton?.addEventListener('click', () =>{
        fdc3?.raiseIntent('singletonIntent', {type:'test', id:{name:'test'}});
    });

  });