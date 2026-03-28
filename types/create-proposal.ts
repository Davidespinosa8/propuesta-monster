export interface RefItem {
  id: string;
  task: string;
  unit: string;
  price: number;
}

export interface SelectedItem extends RefItem {
  qty: number;
  customPrice: number;
  category: string;
}

export interface DigitalService {
  id: string;
  title: string;
  price: number;
  desc: string;
}