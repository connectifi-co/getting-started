# Getting Started with Connectifi

Connectifi is a cloud service that securely connects applications for interoperability across different technologies and devices.  It is the easiest way to use the [FDC3](https://fdc3.finos.org) standard and works without installs so that FDC3 can be used directly in a browser, bridging across desktop containers, and even in mobile and across devices.  Integrating your app with Connectifi consists of 3 basic steps:

- Add the Connectifi Agent module to your application
- Make a connection to a directory
- Add FDC3 hooks into your application

Let’s go through each step in detail.

# Using the Customization Examples

Connectifi is built to work with the brand and UX of your platform. To help you get started fast, this repo is home to a collection of code examples detailing how to customize the Connectifi Agent.  All the code is open source and can be found in the `/examples` directory.  To try it out:

- clone this repo
- `npm install`
- `npm run dev`
- go to http://localhost:9090/examples/index.html for a list of all examples

Got a use case you don't see here? [Create an issue](https://github.com/connectifi-co/getting-started/issues/new) and let us know about it.

**note:** For examples of how to use FDC3 API, the best place to start is with the [Connectifi FDC3 Sandbox](https://apps.connectifi-interop.com/sandbox).
# Setting up the Agent

The Connectifi Agent is a small javascript module that lives in your application and is used to make and manage the connection to the Connectifi service and translate this into a standard FDC3 API for the consuming application.   The module also provides some default UI which can be fully customized.

The agent is available as a [NPM module](https://www.npmjs.com/package/@connectifi/agent-web) and can be integrated into your application through standard web toolchains.  

Install into your code using NPM:

```
npm i @connectifi/agent-web
```

or, access via CDN:

`https://unpkg.com/@connectifi/agent-web/dist/main.js`

# Connecting to a Directory

With Connectifi, applications participate in interop by connecting to the same directory.  The directory determines what applications can participate and what the security parameters will be.

To connect to a directory, use the `createAgent` function exported from the agent-web module, and pass in the service URL and the identity of your application.  This will return a Promise resolving to a standard [FDC3 API](https://fdc3.finos.org/docs/api/ref/DesktopAgent).

```js
import { createAgent } from '@connectifi/agent-web';

        const fdc3 = await createAgent(
              `https://[ME].connectifi-interop.com`,
              `$[appName]@$[directoryName]`,
            );

```

Note: Because the FDC3 api is returned as a scoped variable, your application can leverage any number of approaches to FDC3.  For example, the  API can be used in module scope - allowing for multiple connections on a page, or it can be declared as a global - providing backwards compatibility with desktop container patterns.   Also, the connection to the service can be multiplexed to allow for multiple FDC3 'apps' in a single page.  For an example of multiplexing, see this [open source repo](https://github.com/connectifi-co/fdc3-web-portal).


## Using the Connectifi Sandbox Directory

You can use Connectifi’s [FDC3 Sandbox](https://apps.connectifi-interop.com/sandbox) to build and test your own FDC3 applications.  Use this code to make the connection:

```js

        const fdc3 = await createAgent(
              `https://dev.connectifi-interop.com`,
              `*@sandbox`,
            );

```

**note:** the '*' in '*@sandbox' is a convention for unregistered apps to connect to what's called an *open* directory.  Since the sandbox directory is meant to be for development purposes only, it doesn't require registry or identity validation of the apps connecting in to it.

# Adding FDC3 to Your App

FDC3 standardizes nouns and verbs that apps can exchange to discover functionality and share data.  Apps can both be emitters and consumers of FDC3 data and events.  Connecting your apps with FDC3 is mostly a matter of identifying those touch points.

## Emitting Events

Typically, anywhere that you display a data entity in your app that has applicability elsewhere is a good candidate to emit FDC3 events.  For example, if you are displaying a list of contacts in a CRM each contact is a potential input into any number of other systems, such as chat, telephony, internal databases,  or external services such as KYC screening, or pulling credit reporting on the contact's organization.  Depending on the focus of your app, the specific workflow, and ecosystem you are interacting with, there are a number of approaches that can be taken for integrating FDC3.

### broadcast

The FDC3 *broadcast* API allows an application to make a context available to any connected apps that are listening.  For example, if a user selects a contact in their CRM, an FDC3 broadcast would make the details of that contact available to any other connected applications.  It is up to the consuming applications to determine what they will do with the broadcast context - a chat application, for example, may respond by bringing all chats for that contact into focus.   

There are a few different ways to broadcast context with FDC3.  The simplest one looks like this:

```js
    //broadcast an fdc3 context
    fdc3.broadcast({
    type: "fdc3.contact",
    name: "Jane Doe",
    id: {
        email: "jane.doe@mail.com"
    }
    });

```


### raiseIntent

Raising an intent is a way for applications to defer functionality to the end user's environment.  This allows the application raising the intent to create a stickier experience where the end user can choose their tools and guide the workflow.  For example, an application displaying overview data for financial instruments may wish to defer the charting function to the end user to choose.  The overview app would raise an intent to 'ViewChart' and the user would be presented with a number of charting applications to choose from (and the overview app doesn't have to know about any of them).  

Then code would look like this:

```js
    fdc3.raiseIntent('ViewChart', {
    type: 'fdc3.instrument',
    id: {
        ticker: 'AAPL'
    }
 });
```

When an intent is raised, if there is more than one app that can handle the intent, the end user is presented with options in what's called an *intent resolver*.  The default resolver UI in Connectifi looks like this:


![intent-resolver](https://user-images.githubusercontent.com/1150874/232145356-64cc4054-673a-4b24-b417-c670e54867d9.png)

*Note that the resolver distinguishes between already running apps that the intent can be sent to and apps from the directory that can be opened with the intent.**

### raiseIntentForContext

Like *raiseIntent*, an app can also provide a context and enable the end user to choose between all available apps with intents that take the given context as an input.  The code is very similar to the call for *raiseIntent*:

```js
    fdc3.raiseIntentForContext({
    type: 'fdc3.instrument',
    id: {
        ticker: 'AAPL'
    }
 });
```

And the resolver UI is similar as well:

![context-intent-resolver](https://user-images.githubusercontent.com/1150874/232145355-58fba30e-3eca-4f20-9d8f-a1141d11bc83.png)


## Consuming Events

There are number of ways that applications can listen for and respond to FDC3 events.  The simplest way is to set listeners on the top level FDC3 api.  When adding listeners, you will want to consider: 
- Query string or form inputs that drive what data is displayed by your app (these may be context data)
- Does your app have a clear main function? (this is likely an intent)
- Additional, discreet functions or modes of your app (these may be additional intents)


### addContextListener

Context listeners added to the top-level fdc3 API will be triggered when a matching context is broadcast from a connected app.  In general, apps are *connected* when they are joined to the same user/system channel (see *joiningChannels* below).  When setting a context listener, a context *type* can be specified as a filter on context events to listen to.  If a filter is specified.  All context events, regardless of type, will be sent to the listener.   The listener has a callback function which passed the broadcast FDC3 context.  Any number of listeners can be set and will be called when a matching context broadcast occurs.

Adding a context listener looks like this:

```js

const listener = await fdc3.addContextListener('fdc3.instrument', (context) => {
    console.log("got an instrument context!", context);
});

``` 

### addIntentListener

Intent listeners are very similar to context listeners.  When adding a listener, the name of the intent to be handled must be specified.   

Adding an intent listener looks like this:

```js

const listener = await fdc3.addIntentListener('ViewChart', (context) => {
    drawChart(context);
});

``` 

### unsubscribing listeners

Adding a context or an intent listener returns a *Listener* object.  This object can be used to unsubscribe the listener.  

Unsubscrbiing a listener looks like this:

```js
const listener = fdc3.addContextListener('fdc3.instrument', (context) => {
    console.log("got an instrument context!", context);
});

listener.unsubscribe();

``` 

### joiningChannels

Apps can be joined to a user channel (*system* channel in FDC3 1.x) by the end user.  This effectively links any apps on a channel, so that a call to *fdc3.broadcast* is routed to context listeners set through  *fdc3.addContextListener* from any other app on the same channel.  An app can only be joined to one channel at a time.

Channels can be joined programmatically or using UI.

![join-channel](https://user-images.githubusercontent.com/1150874/232145353-371ce0de-3fd6-4ae3-8c4f-fd614f0026c9.png)

*joining a channel using the default UI in Connectifi*


Joining a channel through the FDC3 API looks like this:

```js

    await fdc3.joinUserChannel('red');
    console.log('red channel joined!');

    //you can also leave the channel
    fdc3.leaveCurrentChannel();
```


## Working with Channels

There's a lot that can be done with channels in FDC3.  Here are some basic concepts to get going with.

### Joining vs Subscribing

Joining a channel, as noted above, impacts the scope of the *fdc3.broadcast* and *fdc3.addContextListener* calls.   An app can also explicitly get a reference to a channel and broadcast and/or add listeners to it.  Some key differences between joining and explicitly attaching to channels are:

- Joining channels can be done by the end user via the UI of the FDC3 provider (e.g. the Connectifi agent UI).
- Only one channel can be joined at a time, any number of channels can be subscribed to programmatically.
- When a channel is joined, it will automatically receive the current context for the channel.  When subscribing to a channel programmatically, the current context needs to be acquired manually.

### Getting a channel

The *getOrCreateChannel* provides a reference to a channel object that can be used to broadcast, assign listeners, and query for context state.  For example:

```js
    //programmatically subscribe the 'red' system channel
    const redChannel = await fdc3.getOrCreateChannel('red');
    const listener = redChannel.addContextListener('fdc3.instrument', (context) => {
        /* listener logic */
    });
    //get the latest context on the channel
    const currentContext = await redChannel.getCurrentContext('fdc3.instrument');
    //broadcast a context on the channel
    redChannel.broadcast(myContext);

    //get or create an 'app' channel
    const myChannel = await fdc3.getOrCreateChannel('myChannel');

```
**note:**  The *getOrCreateChannel* API can be used to either get a *system*/*user* channel or to get or create an *app* channel.  App channels are application defined as opposed to being defined and controlled by the FDC3 provider.  Since Connectifi directories can restrict what apps have access to interop in a specific directory as well as verify the identity of apps connecting into the directory, app channels can have a much higher security profile than on a desktop bus.


### Uses for app channels

App channels are very useful for more advanced orchestration of behavior between applications - especially when there is a singleton or platform application which is orchestrating a number of child or satellite applications.  Some example use cases are:

- tracking state of a singleton application across multiple tech stacks
- publishing application data being shared outside of intents or other user actions
- synchronizing user state for a session across multiple applications and tech stacks

# Using the Connectifi sandbox directory

You can use Connectifi’s free sandbox directory to try out the above with your own applications!  Just load the agent module in your app and use this code to make the connection:

```js
 const fdc3 = await createAgent(
              `https://dev.connectifi-interop.com`,
              `*@sandbox`,
            );
```

**note:** the '*' in '*@sandbox' is a convention for unregistered apps to connect to what's called an open directory.  Since the sandbox directory is meant to be for development purposes, it doesn't require registry or identity validation of the apps connecting in to it.