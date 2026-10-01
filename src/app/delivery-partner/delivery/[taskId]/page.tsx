import { redirect } from "next/navigation";

interface DeliveryPartnerDeliveryItemAliasProps {
  params: {
    taskId: string;
  };
}

export default function DeliveryPartnerDeliveryItemAliasPage({
  params,
}: DeliveryPartnerDeliveryItemAliasProps) {
  redirect(`/delivery-partner/deliveries/${params.taskId}`);
}
