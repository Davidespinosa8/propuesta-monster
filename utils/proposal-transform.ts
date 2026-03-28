import { ProposalService } from "@/types/proposal";

export interface EditableSelectedItem {
  id: string;
  task: string;
  unit: string;
  price: number;
  qty: number;
  customPrice: number;
  category: string;
}

export interface EditableDigitalService {
  id: string;
  title: string;
  price: number;
  desc: string;
}

export const mapStoredServicesToEditableState = (
  services: ProposalService[]
): {
  selectedItems: EditableSelectedItem[];
  digitalServices: EditableDigitalService[];
  digitalBasePrice: number;
} => {
  const selectedItems: EditableSelectedItem[] = [];
  const digitalServices: EditableDigitalService[] = [];
  let digitalBasePrice = 0;

  services.forEach((service) => {
    if (service.kind === "base" || service.id === "base") {
      digitalBasePrice = service.price;
      return;
    }

    if (
      service.kind === "reference" ||
      service.qty !== undefined ||
      service.unit ||
      service.category ||
      service.task
    ) {
      selectedItems.push({
        id: service.id,
        task: service.task || service.title || "",
        unit: service.unit || "u",
        price:
          service.qty && service.qty > 0
            ? service.price / service.qty
            : service.customPrice || service.price,
        qty: service.qty || 1,
        customPrice:
          service.customPrice ||
          (service.qty && service.qty > 0
            ? service.price / service.qty
            : service.price),
        category: service.category || "digital",
      });
      return;
    }

    digitalServices.push({
      id: service.id,
      title: service.title || "",
      price: service.price,
      desc: service.desc || "",
    });
  });

  return {
    selectedItems,
    digitalServices,
    digitalBasePrice,
  };
};

export const mapEditableStateToStoredServices = ({
  selectedItems,
  digitalServices,
  digitalBasePrice,
}: {
  selectedItems: EditableSelectedItem[];
  digitalServices: EditableDigitalService[];
  digitalBasePrice: number;
}): ProposalService[] => {
  const referenceServices: ProposalService[] = selectedItems.map((item) => ({
    id: item.id,
    title: `${item.qty}x ${item.task}`,
    task: item.task,
    price: item.customPrice * item.qty,
    customPrice: item.customPrice,
    qty: item.qty,
    unit: item.unit,
    category: item.category,
    kind: "reference",
    desc: `Unidad: ${item.unit} - Rubro: ${item.category}`,
  }));

  const manualServices: ProposalService[] = digitalServices.map((service) => ({
    id: service.id,
    title: service.title,
    price: service.price,
    desc: service.desc,
    kind: "manual",
  }));

  const baseService: ProposalService[] =
    digitalBasePrice > 0
      ? [
          {
            id: "base",
            title: "Honorarios Base",
            price: digitalBasePrice,
            desc: "Gestión",
            kind: "base",
          },
        ]
      : [];

  return [...referenceServices, ...manualServices, ...baseService];
};