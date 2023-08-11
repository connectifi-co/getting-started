import {
    createAgent
  } from "@connectifi/agent-web";
  
  let selectedChannel : string | null = null;

  document.addEventListener('DOMContentLoaded',async () => {
    const fdc3 = await createAgent('https://dev.connectifi-interop.com', 'example@sandbox', {
        headless:true,
        onChannelJoined: joinHandler,
        onChannelLeft: leaveHandler,
    });

    const picker = document.getElementById('picker');
    const userChannels = await fdc3?.getUserChannels();
    userChannels?.forEach((channel) => {
        const item = document.createElement('div');
        item.classList.add('channel');
        item.id = channel.id;
        item.style.backgroundColor = channel.displayMetadata?.color || '';
        item.addEventListener('click', () => {
            //if the channel selected is the current channel, then unjoin it
            if (selectedChannel === channel.id){
                fdc3?.leaveCurrentChannel();
            } else {
                fdc3?.joinUserChannel(channel.id);
            }
        })
        picker?.appendChild(item);
    });

  });

  const joinHandler = (channelId: string) => {
    //reset the selected element
    if (selectedChannel) {
        const oldChannel = document.getElementById(selectedChannel);
        if (oldChannel){
            oldChannel.textContent = '';
        }
    }
    selectedChannel = channelId;
    //mark the selected one
    const channelElement = document.getElementById(channelId);
    if (channelElement){
        channelElement.textContent = 'X';
    }
  }

  const leaveHandler = () => {
    if (selectedChannel) {
        const oldChannel = document.getElementById(selectedChannel);
        if (oldChannel){
            oldChannel.textContent = '';
        }
        selectedChannel = null;
    }
  }