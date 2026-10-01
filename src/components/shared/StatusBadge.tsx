import React from "react";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types/customer";

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "PENDING_CONFIRMATION":
      return <Badge variant="secondary">Pending Confirmation</Badge>;
    case "PICKUP_SCHEDULED":
      return <Badge variant="default">Pickup Scheduled</Badge>;
    case "DRIVER_EN_ROUTE_PICKUP":
      return <Badge variant="accent">Driver En Route</Badge>;
    case "PICKED_UP":
    case "IN_TRANSIT_TO_WORKSHOP":
      return <Badge variant="accent">In Transit</Badge>;
    case "ITEM_INTAKE_INSPECTION":
      return <Badge variant="default">Inspection</Badge>;
    case "WASHING_PROCESSING":
      return <Badge variant="default">Washing & Care</Badge>;
    case "QUALITY_CHECK":
      return <Badge variant="default">Quality Check</Badge>;
    case "READY_FOR_DELIVERY":
      return <Badge variant="success">Ready for Delivery</Badge>;
    case "OUT_FOR_DELIVERY":
      return <Badge variant="accent">Out for Delivery</Badge>;
    case "DELIVERED":
      return <Badge variant="success">Delivered</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    case "ISSUE_REPORTED":
      return <Badge variant="destructive">Issue Reported</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
