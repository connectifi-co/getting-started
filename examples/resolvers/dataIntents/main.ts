import { createAgent } from "@connectifi/agent-web";
import { resolver } from "./resolver";
import { CompanyDetails, InstrumentPrice, Summary } from "./types";


const createHeader = (title: string, subtitle?: string): HTMLElement => {
  const head = document.createElement('div');
  head.classList.add('header');
  const titleRow = document.createElement('div');
  titleRow.classList.add('title');
  titleRow.textContent = title;
  head.appendChild(titleRow);
  if (subtitle){
    const subtitleRow = document.createElement('div');
    subtitleRow.classList.add('subtitle');
    subtitleRow.textContent = subtitle;
    head.appendChild(subtitleRow);
  }
  return head;
};



const createDataRow = (name: string, value: string): HTMLElement => {
  const row = document.createElement('div');
  row.classList.add('dataRow');
  const label = document.createElement('div');
  label.classList.add('label');
  label.textContent = name;
  row.appendChild(label);
  const content = document.createElement('div');
  content.classList.add('value');
  content.textContent = value;
  row.appendChild(content);
  return row;
};

const setLoading = () => {
  const target = document.getElementById('intentResult');
  if (target) {
    target.innerHTML = '';
    const row = document.createElement('div');
    row.classList.add('loadingRow');
    const loading = document.createElement('div');
    loading.classList.add('loader');
    loading.classList.add('active');
    row.appendChild(loading);
    target.appendChild(row);
  }
};

const renderSummary = (data: Summary) => {
  const target = document.getElementById('intentResult');
  if (target) {
    target.innerHTML = '';
    const header = createHeader(data.title || 'Unknown');
    target.appendChild(header);
    const summaryRow = createDataRow('summary', data.text);
    target.appendChild(summaryRow);
  }
}

const renderPrice = (data: InstrumentPrice) => {
  const target = document.getElementById('intentResult');
  if (target) {
    target.innerHTML = '';
    const header = createHeader(data.id.ticker || 'Unknown', data.name);
    target.appendChild(header);
    const priceRow = createDataRow('price', `$${data.price}`);
    target.appendChild(priceRow)

    const optionalFields = ['askPrice', 'askSize', 'bidPrice', 'bidSize', 'description'];
    optionalFields.forEach((field) => {
      if (data[field]){
        let value =  (typeof data[field] === 'string')? data[field] : `$${data[field]}`;
        const row = createDataRow(field, value);
        target.appendChild(row);
      }
    })
  }
};

const renderDetails = (data: CompanyDetails) => {
  const target = document.getElementById('intentResult');
  if (target) {
    target.innerHTML = '';
    const header = createHeader(data.name || 'Unknown', `${data.id.ticker} (${data.id.figi})`);
    target.appendChild(header);

    const optionalFields = ['description', 'currency', 'primaryExchange', 'marketCap'];
    optionalFields.forEach((field) => {
      if (data[field]){
        let value =  (typeof data[field] === 'string')? data[field] : `${data[field]}`;
        const row = createDataRow(field, value);
        target.appendChild(row);
      }
    })
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const fdc3 = await createAgent(
    "https://dev.connectifi-interop.com",
    "example@DataIntents",
    {
      headless: true,
      handleIntentResolution: resolver,
    }
  );

  const ticker = {
    type: "fdc3.instrument",
    name: "International Business Machines",
    id: { ticker: "IBM", },
  };

  const priceButton = document.getElementById("getPriceButton");
  if (priceButton) {
    priceButton.addEventListener("click", async (event: MouseEvent) => {
      if (fdc3){
        setLoading();
        const intentResult = await fdc3.raiseIntent("GetPrice", ticker);
        const dataResult = await intentResult.getResult() as InstrumentPrice;
        renderPrice(dataResult);
      }
    });
  }

  const detailsButton = document.getElementById("getDetailsButton");
  if (detailsButton) {
    detailsButton.addEventListener("click", async (event: MouseEvent) => {
      if (fdc3){
        setLoading();
        const intentResult = await fdc3.raiseIntent("GetDetails", ticker);
        const dataResult = await intentResult.getResult() as CompanyDetails;
        renderDetails(dataResult);
      }
    });
  }

  const summaryButton = document.getElementById("getSummaryButton");
  if (summaryButton) {
    summaryButton.addEventListener("click", async (event: MouseEvent) => {
      if (fdc3){
        setLoading();
        const intentResult = await fdc3.raiseIntent("Summarize", ticker);
        const dataResult = await intentResult.getResult() as Summary;
        renderSummary(dataResult);
      }
    });
  }

});
