import {
  IntentResolutionMessage,
  AppIntentResult,
  ResolutionType,
  AppInstanceType,
  ConnectifiApp,
  ResolveCallback,
  CloseCallback,
} from "@connectifi/agent-web";

let resolverOpen: boolean = false;
let resolveResolver: ResolveCallback | undefined;
let closeResolver: CloseCallback | undefined;
let resolverElem: HTMLElement | null = null;
let resolverBGElem: HTMLElement | null = null;
let interopHost: string = "https://dev.connectifi-interop.com";

// for sorting/grouping apps by AppInstanceType
const appsorter = (a: ConnectifiApp, b: ConnectifiApp) => {
  if (a.type == b.type) {
    if (a.type === AppInstanceType.Window) {
      if (a.proximity === b.proximity) {
        return b.lastUpdate - a.lastUpdate;
      }
      return a.proximity - b.proximity;
    }
    return 0;
  } else if (a.type === AppInstanceType.Directory) {
    return 1;
  } else {
    return -1;
  }
};

const hideResolver = (): void => {
  resolverOpen = false;
  resolverElem?.classList.remove("open");
  resolverBGElem?.classList.remove("open");
};

const getContextDisplayName = (context: any) => {
  let name = context.name || context.type || "";
  if (context.type === "fdc3.instrument") {
    name = `${context.id?.ticker}`;
  }
  return name;
};

const getAppTypeDisplayName = (appType: AppInstanceType) => {
  if (appType === AppInstanceType.Directory) {
    return "Open New";
  }
  return "Send To";
};

const createAppRows = (
  resolverList: HTMLElement,
  intentRes: AppIntentResult,
  context: any,
  bridge?: boolean
) => {
  intentRes.apps.sort(appsorter);
  let group: string = "";
  intentRes.apps.forEach((app: ConnectifiApp) => {
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
  app: ConnectifiApp,
  intent: string,
  context: any,
  bridge?: boolean
): HTMLElement => {
  const isAppSecure = (app: ConnectifiApp) => {
    return app.url && app.url.startsWith("https");
  };

  const getAppTitle = (app: ConnectifiApp): string => {
    const title = app.title || app.name;
    const instTitle = app.instanceTitle;
    if (!instTitle) {
      return title || "unknown";
    }

    if (title && !instTitle.startsWith(title)) {
      return `${title} - ${app.instanceTitle}`;
    } else if (instTitle) {
      return app.instanceTitle;
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
        isAppSecure(app) ? "lock" : "warning"
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
  titleNode.setAttribute("title", `${appTitle}\n${app.url}`);
  row.appendChild(titleNode);

  // right side icons - more info
  const infoNode: Element = document.createElement("div");
  infoNode.className = "info";
  infoNode.setAttribute("title", `proximity: ${app.proximity}`);
  if (app.type !== AppInstanceType.Directory) {
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
      resolveResolver(app, intent, context, bridge || false);
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
  intentTitle.textContent = item.intent.displayName;
  intentRow.appendChild(intentTitle);
  return intentRow;
};

export const resolver = (
  message: IntentResolutionMessage,
  resolveCallback: ResolveCallback,
  closeCallback: CloseCallback
): void => {
  resolverElem = document.getElementById("resolver");
  resolverBGElem = document.getElementById("resolverBG");
  resolveResolver = resolveCallback;
  closeResolver = closeCallback;

  resolverOpen = true;
  if (resolverElem) {
    resolverElem?.classList.add("open");
    resolverBGElem?.classList.add("open");
    if (resolverBGElem) {
      resolverBGElem.style.width = `${document.body.clientWidth}px`;
      resolverBGElem.style.height = `${document.body.clientHeight}px`;
    }
  }
  // resolver "title bar close icon"
  resolverElem
    ?.querySelector(".header .dismiss > div")
    ?.addEventListener("click", () => {
      if (closeResolver) {
        closeResolver(true);
      }
      hideResolver();
    });

  // resolver "window title"
  const resTitle = resolverElem?.querySelector(
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
  }

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
      createAppRows(resolverList, intentRes, message.context);
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
};
