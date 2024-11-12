import { Context } from '@finos/fdc3';

export interface CompanyDetails extends Context {
    type: 'connect.companyDetails';
    id: {
      ticker: string;
      figi?: string;
    };
    name: string;
    active: boolean;
    primaryExchange: string;
    marketCap: number;
    weightedSharesOutstanding: number;
    sicCode: string;
    sicDescription: string;
    totalEmployees: number;
    currency: string;
    listDate: string;
    delistedDate?: string;
    description: string;
    url: string;
    address?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
    };
    icon?: string;
  }
  
  export interface InstrumentPrice extends Context {
    type: 'connect.instrumentPrice';
    id: {
      ticker?: string;
    };
    price: number;
    description?: string;
    timestamp?: number;
    askPrice?: number;
    bidPrice?: number;
    askSize?: number;
    bidSize?: number;
  }

  export interface Summary extends Context {
    type: 'connect.summary';
    title: string;
    text: string;
  }