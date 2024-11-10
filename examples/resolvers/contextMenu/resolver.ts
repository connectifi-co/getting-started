import {
  IntentResolutionMessage,
  AppIntentResult,
  ResolutionType,
  IntentResultType,
  ConnectifiAppMetadata,
  ResolveCallback,
  CloseCallback,
} from "@connectifi/agent-web";

let resolverOpen: boolean = false;
let resolveResolver: ResolveCallback | undefined;
let closeResolver: CloseCallback | undefined;
let resolverElem: HTMLElement | null = null;
let interopHost: string = "https://dev.connectifi-interop.com";

// for sorting/grouping apps by AppInstanceType
const appsorter = (a: ConnectifiAppMetadata, b: ConnectifiAppMetadata) => {
  if (a.type == b.type) {
    if (a.type === 'window') {
      if (a.proximity === b.proximity && b.lastUpdate && a.lastUpdate) {
        return b.lastUpdate - a.lastUpdate;
      }
      return a.proximity - b.proximity;
    }
    return 0;
  } else if (a.type === 'directory') {
    return 1;
  } else {
    return -1;
  }
};

const hideResolver = (): void => {
  resolverOpen = false;
  resolverElem?.classList.remove("open");
};

const getContextDisplayName = (context: any) => {
  let name = context.name || context.type || "";
  if (context.type === "fdc3.instrument") {
    name = `${context.id?.ticker} - ${context.name}`;
  }
  return name;
};

const getAppTypeDisplayName = (appType: IntentResultType) => {
  if (appType === 'directory') {
    return "Open New";
  }
  return "Send To";
};

const showAppMenu = (
  event: MouseEvent,
  target: HTMLElement,
  intent: string
) => {
  //hide any open
  const openMenus = document.querySelectorAll(".appMenu.show");
  openMenus.forEach((menu) => menu.classList.remove("show"));
  const menu = document.getElementById(intent);

  if (menu) {
    menu.style.left = `${target.offsetLeft + target.offsetWidth}px`;
    menu.style.top = `${target.offsetTop}px`;
  }
  menu?.classList.add("show");
  event.stopPropagation();
  event.preventDefault();
};

const createAppRows = (
  resolverList: HTMLElement,
  intentRes: AppIntentResult,
  context: any,
  bridge?: boolean
) => {
  intentRes.apps.sort(appsorter);
  let group: string = "";
  intentRes.apps.forEach((app: ConnectifiAppMetadata) => {
    if (app.type !== group) {
      const groupRow = document.createElement("div");
      groupRow.className = "group";
      if (bridge) {
        groupRow.textContent = "Local Container";
      } else {
        groupRow.textContent = getAppTypeDisplayName(app.type);
      }
      resolverList.appendChild(groupRow);
      group = app.type;
    }
    const row = createAppRow(app, intentRes.intent.name, context, bridge);
    resolverList.appendChild(row);
  });
};

const createAppRow = (
  app: ConnectifiAppMetadata,
  intent: string,
  context: any,
  bridge?: boolean
): HTMLElement => {

  const getAppTitle = (app: ConnectifiAppMetadata): string => {
    const title = app.title || app.name;
    const instTitle = app.instanceTitle;
    if (!instTitle) {
      return title || "unknown";
    }

    if (title && !instTitle.startsWith(title)) {
      return `${title} - ${app.instanceTitle}`;
    } else if (instTitle) {
      return app.instanceTitle || '';
    }
    return "unknown";
  };

  const getIconPath = (icon: string | { src: string }): string => {
    if (icon) {
      //detect relative URL - more room for improvement here
      const url = typeof icon === "string" ? icon : icon.src;
      if (url.toLowerCase().startsWith("http")) {
        return `${url}`;
      }

      return `${interopHost}/${url}`;
    }

    return "";
  };

  const row: HTMLElement = document.createElement("div");
  row.className = "item";

  // left side icons - app type
  const iconContainer = document.createElement("div");
  iconContainer.className = "icon-container";
  // lock icon
  if (bridge !== true) {
    const lockIcon: HTMLElement = document.createElement("div");
    lockIcon.setAttribute(
      "style",
      `
        background-image: url('${interopHost}/${
        app.isSecure ? "lock" : "warning"
      }.svg');
        `
    );
    lockIcon.classList.add("icon");
    lockIcon.classList.add("mask");
    iconContainer.appendChild(lockIcon);
  }
  // app icon
  let iconNode: Element;
  if (app.icons && app.icons.length > 0) {
    iconNode = document.createElement("img");
    iconNode.className = "icon";
    const ico = app.icons[0];
    const iconPath = ico && getIconPath(ico);
    iconNode.setAttribute("src", iconPath);
  } else {
    iconNode = document.createElement("div");
    iconNode.className = "icon";
  }
  iconContainer.appendChild(iconNode);
  row.appendChild(iconContainer);

  // app name/title
  const appTitle = getAppTitle(app);
  const titleNode: Element = document.createElement("div");
  titleNode.className = "title";
  titleNode.textContent = appTitle;
  titleNode.setAttribute("title", `${appTitle}`);
  row.appendChild(titleNode);

  // right side icons - more info
  const infoNode: Element = document.createElement("div");
  infoNode.className = "info";
  infoNode.setAttribute("title", `proximity: ${app.proximity}`);
  if (app.type !== 'directory') {
    if (app.proximity > 1) {
      const appOS = app.os && app.os.toLocaleLowerCase();
      const agentNode: Element = document.createElement("div");
      agentNode.className = `os ${appOS}`;
      agentNode.setAttribute("title", `${app.os} (${app.device})`);
      agentNode.setAttribute(
        "style",
        `background-image: url('${interopHost}/${appOS}.svg')`
      );
      const agentInner: Element = document.createElement("div");
      agentNode.appendChild(agentInner);
      infoNode.appendChild(agentNode);
    }
    if (app.proximity > 0) {
      const browse = app.browser && app.browser.toLocaleLowerCase();
      const agentNode: Element = document.createElement("div");
      agentNode.className = `agent ${browse}`;
      agentNode.setAttribute("title", `${app.browser}`);
      agentNode.setAttribute(
        "style",
        `background-image: url('${interopHost}/${browse}.svg')`
      );
      const agentInner: Element = document.createElement("div");
      agentNode.appendChild(agentInner);
      infoNode.appendChild(agentNode);
    }
  }

  row.appendChild(infoNode);

  row.addEventListener("click", (event: MouseEvent) => {
    if (resolveResolver) {
      resolveResolver({ selected: app, intent: intent, context: context, bridge: bridge || false});
      hideResolver();
      event.stopPropagation();
    }
  });
  return row;
};

const createIntentRow = (item: AppIntentResult): HTMLElement => {
  const intentRow: HTMLElement = document.createElement("div");
  intentRow.className = "intentRow";
  const intentTitle = document.createElement("div");
  intentTitle.className = "intentTitle";
  intentTitle.textContent = item.intent.name;
  intentRow.addEventListener("click", (event: MouseEvent) => {
    showAppMenu(event, intentRow, item.intent.name);
  });
  intentRow.appendChild(intentTitle);
  return intentRow;
};

export const positionResolver = (x: number, y: number) => {
  resolverElem = document.getElementById("resolver");
  if (resolverElem) {
    resolverElem.style.position = "absolute";
    resolverElem.style.left = `${x}px`;
    resolverElem.style.top = `${y}px`;
  }
};

export const resolver = (
  message: IntentResolutionMessage,
  resolveCallback: ResolveCallback,
  closeCallback: CloseCallback
): void => {
  resolverElem = document.getElementById("resolver");
  resolveResolver = resolveCallback;
  closeResolver = closeCallback;

  resolverOpen = true;
  if (resolverElem) {
    resolverElem?.classList.add("open");
  }
  // resolver "title bar close icon"
  /*   resolverElem
        ?.querySelector(".header .dismiss > div")
        ?.addEventListener("click", () => {
          if (closeResolver){
            closeResolver(true);
          }
          hideResolver();
        });*/

  // resolver "window title"
  /*  const resTitle = resolverElem?.querySelector(
        ".header .title span"
      ) as HTMLDivElement;
      const ctxName = getContextDisplayName(message.context);
      if (message.resolutionType === ResolutionType.Intent) {
        const intent = (message.data as AppIntentResult).intent;
        const title = `${intent.displayName} for ${ctxName}`;
        resTitle.innerHTML = title;
        resTitle.setAttribute("title", title);
      } else if (message.resolutionType === ResolutionType.Context) {
        resTitle.innerHTML = ctxName;
      }*/

  // resolver list
  const resolverList = resolverElem?.querySelector(".list") as HTMLDivElement;
  resolverList.innerHTML = "";

  if (message.resolutionType === ResolutionType.Intent) {
    const intentRes = message.data as AppIntentResult;
    createAppRows(resolverList, intentRes, message.context);
    if (message.bridgeData) {
      const bridgeRes = message.bridgeData as AppIntentResult;
      createAppRows(resolverList, bridgeRes, message.context, true);
    }
  } else if (message.resolutionType === ResolutionType.Context) {
    const results = message.data as AppIntentResult[];
    results.forEach((intentRes: AppIntentResult) => {
      const row = createIntentRow(intentRes);
      resolverList.appendChild(row);
      const appMenu = document.createElement("div");
      appMenu.id = intentRes.intent.name;
      appMenu.classList.add("appMenu");
      createAppRows(appMenu, intentRes, message.context);
      resolverList.appendChild(appMenu);
    });

    if (message.bridgeData) {
      const bridgeResults = message.bridgeData as AppIntentResult[];

      bridgeResults.forEach((intentRes: AppIntentResult) => {
        const row = createIntentRow(intentRes);
        resolverList.appendChild(row);
        createAppRows(resolverList, intentRes, message.context, true);
      });
    }
  }
  console.log("here");
  document.body.addEventListener(
    "click",
    () => {
      if (closeResolver) {
        closeResolver();
      }
      hideResolver();
    },
    {
      once: true,
    }
  );
};
