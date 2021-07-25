export interface Iingredients {
  /**
   * @type {number}
   * @memberof Iingredients
   */
  salad: number;
  /**
   * @type {number}
   * @memberof Iingredients
   */
  bacon: number;
  /**
   * @type {number}
   * @memberof Iingredients
   */
  cheese: number;
  /**
   * @type {number}
   * @memberof Iingredients
   */
  meat: number;
}

export interface IDbOrder {
  basicInfo: {
    name: string;
    phone: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  deliveryMethod: string;
  ingredients: Iingredients;
  date: string;
  price: string;
}
export interface IDbOrders {
  [x: string]: IDbOrder;
}

export interface IordersReducerState {
  orders: IDbOrders;
  loading: boolean;
  error: (Error & { [x: string]: any }) | false;
}
