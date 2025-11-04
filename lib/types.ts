

export interface items {
  _id?: string; 
  productName: string;
  inventory: {
    S: number;
    M: number;
    L: number;
    XL: number;
  };
}
