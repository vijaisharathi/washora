import {
  ServiceCategory,
  ServiceItem,
  ProviderSummary,
  Order,
  BookingDraft,
  NotificationItem,
  Coupon,
  OrderStatus,
} from "@/types/customer";
import {
  mockCategories,
  mockServiceItems,
  mockProviders,
  mockOrders,
  mockAddresses,
} from "@/mocks/customer/mockData";
import { customerApi } from "@/features/customer/api/customerApi";
import { isLiveMode } from "@/lib/api";

const STORAGE_ORDERS_KEY = "washora_customer_orders";
const STORAGE_CART_KEY = "washora_customer_booking_draft";
const STORAGE_NOTIFS_KEY = "washora_customer_notifications";

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Order #WSH-98214 in Inspection",
    message: "LuxeCare Studio has received your garments and started fabric verification.",
    type: "ORDER_UPDATE",
    read: false,
    createdAt: "10 mins ago",
    actionUrl: "/customer/orders/ord-1",
  },
  {
    id: "notif-2",
    title: "Specialty Saree Care Offer",
    message: "Get 20% off on all heavy silk and bridal wear cleaning this weekend.",
    type: "PROMOTION",
    read: false,
    createdAt: "2 hours ago",
    actionUrl: "/customer/services?category=specialty-care",
  },
  {
    id: "notif-3",
    title: "Phone Verified Successfully",
    message: "Your mobile number +91 98765 43210 is now protected with 2FA.",
    type: "SECURITY",
    read: true,
    createdAt: "Yesterday",
    actionUrl: "/customer/profile",
  },
];

export const MOCK_COUPONS: Coupon[] = [
  {
    code: "WASHORA20",
    description: "20% off on your first specialty order",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderValue: 299,
    maxDiscount: 150,
    expiryDate: "30 Sep 2026",
  },
  {
    code: "SNEAKERFIX",
    description: "Flat ₹150 off on sneaker restoration",
    discountType: "FLAT",
    discountValue: 150,
    minOrderValue: 499,
    expiryDate: "15 Oct 2026",
  },
  {
    code: "EXPRESS50",
    description: "Flat ₹50 off on 24h express laundry",
    discountType: "FLAT",
    discountValue: 50,
    minOrderValue: 199,
    expiryDate: "31 Dec 2026",
  },
];

export interface ICustomerService {
  getCategories(): Promise<ServiceCategory[]>;
  getCategoryBySlug(slug: string): Promise<ServiceCategory | null>;
  getServiceItems(filter?: { categorySlug?: string; query?: string }): Promise<ServiceItem[]>;
  getServiceItemById(id: string): Promise<ServiceItem | null>;
  getProviders(filter?: { query?: string; categorySlug?: string }): Promise<ProviderSummary[]>;
  getProviderById(id: string): Promise<ProviderSummary | null>;
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  createOrder(orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "timeline">): Promise<Order>;
  cancelOrder(id: string, reason: string): Promise<Order>;
  getBookingDraft(): Promise<BookingDraft>;
  saveBookingDraft(draft: BookingDraft): Promise<BookingDraft>;
  clearBookingDraft(): Promise<void>;
  getNotifications(): Promise<NotificationItem[]>;
  markNotificationRead(id: string): Promise<void>;
  validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message: string }>;
  submitSupportTicket(data: { category: string; subject: string; message: string; orderId?: string }): Promise<{ ticketId: string; status: string }>;
}

function mapBookingToOrder(b: any): Order {
  return {
    id: b.id,
    orderNumber: b.bookingNumber || b.orderNumber || `WSH-${(b.id || "").slice(0, 5).toUpperCase()}`,
    customerId: b.customerId || "cust-demo-1",
    providerId: b.providerId || "prov-1",
    providerName: b.providerName || b.provider?.businessName || "LuxeCare Master Studio",
    status: (b.status as OrderStatus) || "PICKUP_SCHEDULED",
    createdAt: b.createdAt || new Date().toISOString(),
    pickupDate: b.scheduledPickupAt ? new Date(b.scheduledPickupAt).toLocaleDateString() : "Tomorrow",
    pickupTimeSlot: "10:00 AM - 12:00 PM",
    deliveryDate: b.scheduledDeliveryAt ? new Date(b.scheduledDeliveryAt).toLocaleDateString() : "Day after Tomorrow",
    deliveryTimeSlot: "04:00 PM - 06:00 PM",
    deliveryAddress: b.deliveryAddress || b.address
      ? {
          id: b.deliveryAddress?.id || b.address?.id || "addr-1",
          customerId: "cust-current",
          label: b.deliveryAddress?.tag || b.address?.tag || "Home",
          recipientName: b.deliveryAddress?.recipientName || b.address?.recipientName || "Customer",
          phoneNumber: b.deliveryAddress?.phoneNumber || b.address?.phoneNumber || "+91 98765 43210",
          streetAddress: b.deliveryAddress?.addressLine1 || b.address?.addressLine1 || "",
          apartmentSuite: b.deliveryAddress?.apartmentSuite || b.address?.apartmentSuite || b.address?.addressLine2,
          city: b.deliveryAddress?.city || b.address?.city || "Bangalore",
          state: b.deliveryAddress?.state || b.address?.state,
          postalCode: b.deliveryAddress?.postalCode || b.address?.postalCode || "560038",
          landmark: b.deliveryAddress?.landmark || b.address?.landmark,
          isDefault: true,
        }
      : mockAddresses[0],
    pickupAddress: b.address

      ? {
          id: b.address.id,
          customerId: "cust-current",
          label: b.address.tag || "Home",
          recipientName: b.address.recipientName || "Customer",
          phoneNumber: b.address.phoneNumber || "+91 98765 43210",
          streetAddress: b.address.addressLine1 || "",
          apartmentSuite: b.address.apartmentSuite || b.address.addressLine2,
          city: b.address.city || "Bangalore",
          state: b.address.state,
          postalCode: b.address.postalCode || "560038",
          landmark: b.address.landmark,
          isDefault: true,
        }
      : mockAddresses[0],
    items: Array.isArray(b.items) && b.items.length > 0
      ? b.items.map((it: any) => ({
          serviceId: it.serviceId || "srv-1",
          serviceName: it.service?.name || it.serviceName || "Premium Wash",
          variantId: it.serviceVariantId || it.variantId || "v-1",
          variantName: it.variant?.name || it.variantName || "Standard",
          quantity: it.quantity || 1,
          unitPrice: Number(it.unitPrice) || 99,
          selectedAddonIds: [],
        }))
      : [
          {
            serviceId: "srv-1",
            serviceName: "Premium Wash",
            variantId: "v-1",
            variantName: "Standard",
            quantity: 2,
            unitPrice: 99,
            selectedAddonIds: [],
          },
        ],
    subtotal: Number(b.subtotalAmount || b.subtotal) || 198,
    taxes: Number(b.taxAmount || b.taxes) || 35,
    deliveryFee: Number(b.deliveryFee) || 0,
    discount: Number(b.discountAmount || b.discount) || 0,
    total: Number(b.totalAmount || b.total) || 233,
    paymentMethod: b.paymentMethod || "UPI",
    paymentStatus: b.paymentStatus || "PAID",
    timeline: Array.isArray(b.statusHistory) && b.statusHistory.length > 0
      ? b.statusHistory.map((h: any, i: number) => ({
          id: h.id || `t-${i}`,
          title: h.status || "Status Update",
          description: h.note || "",
          status: i === 0 ? ("COMPLETED" as const) : ("ACTIVE" as const),
          timestamp: h.createdAt ? new Date(h.createdAt).toLocaleTimeString() : "Recently",
        }))
      : [
          {
            id: "t-1",
            title: "Order Placed & Confirmed",
            description: "Pickup slot locked with driver assigned",
            status: "COMPLETED",
            timestamp: "Just now",
          },
        ],
  };
}

class CustomerService implements ICustomerService {
  private getStoredOrders(): Order[] {
    if (typeof window === "undefined") return mockOrders;
    try {
      const stored = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return mockOrders;
  }

  private setStoredOrders(orders: Order[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }

  async getCategories(): Promise<ServiceCategory[]> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.catalog.getCategories();
        const data = Array.isArray(res.data) ? res.data : [];
        return (data as any[]).map((c) => ({
          id: c.id,
          slug: c.slug || c.name.toLowerCase().replace(/\s+/g, "-"),
          name: c.name,
          description: c.description || "",
          iconName: c.iconName || "Shirt",
          itemCount: c.servicesCount || c.itemCount || 10,
          startingPrice: Number(c.startingPrice) || 49,
          imageUrl: c.imageUrl,
        }));
      } catch (err: unknown) {
        throw err;
      }
    }

    await new Promise((res) => setTimeout(res, 200));
    return mockCategories;
  }

  async getCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.catalog.getCategoryBySlug(slug);
        const c = res.data as any;
        if (c) {
          return {
            id: c.id,
            slug: c.slug || slug,
            name: c.name,
            description: c.description || "",
            iconName: c.iconName || "Shirt",
            itemCount: c.servicesCount || c.itemCount || 10,
            startingPrice: Number(c.startingPrice) || 49,
            imageUrl: c.imageUrl,
          };
        }
        return null;
      } catch (err: unknown) {
        throw err;
      }
    }

    await new Promise((res) => setTimeout(res, 150));
    return mockCategories.find((c) => c.slug === slug) || null;
  }

  async getServiceItems(filter?: { categorySlug?: string; query?: string }): Promise<ServiceItem[]> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.catalog.getServices({
          categorySlug: filter?.categorySlug,
          search: filter?.query,
        });
        const items = Array.isArray(res.data) ? res.data : [];
        return (items as any[]).map((s) => ({
          id: s.id,
          categoryId: s.categoryId || "",
          name: s.name,
          description: s.description || "",
          basePrice: Number(s.basePrice) || 99,
          unit: (s.unit as any) || "per item",
          variants: Array.isArray(s.variants)
            ? s.variants.map((v: any) => ({
                id: v.id,
                name: v.name,
                price: Number(v.price) || 0,
                description: v.description,
                turnaroundHours: v.turnaroundHours || 24,
              }))
            : [],
          addons: Array.isArray(s.addons) ? s.addons : [],
          imageUrl: s.imageUrl,
          popular: s.popular ?? true,
        }));
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.getServiceItemsMock(filter);
  }

  private async getServiceItemsMock(filter?: { categorySlug?: string; query?: string }): Promise<ServiceItem[]> {
    await new Promise((res) => setTimeout(res, 250));
    let items = [...mockServiceItems];

    if (filter?.categorySlug) {
      const cat = mockCategories.find((c) => c.slug === filter.categorySlug);
      if (cat) {
        items = items.filter((i) => i.categoryId === cat.id);
      }
    }

    if (filter?.query) {
      const q = filter.query.toLowerCase().trim();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }

    return items;
  }

  async getServiceItemById(id: string): Promise<ServiceItem | null> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.catalog.getServiceById(id);
        const s = res.data as any;
        if (s) {
          return {
            id: s.id,
            categoryId: s.categoryId || "",
            name: s.name,
            description: s.description || "",
            basePrice: Number(s.basePrice) || 99,
            unit: (s.unit as any) || "per item",
            variants: Array.isArray(s.variants)
              ? s.variants.map((v: any) => ({
                  id: v.id,
                  name: v.name,
                  price: Number(v.price) || 0,
                  description: v.description,
                  turnaroundHours: v.turnaroundHours || 24,
                }))
              : [],
            addons: Array.isArray(s.addons) ? s.addons : [],
            imageUrl: s.imageUrl,
            popular: s.popular ?? true,
          };
        }
        return null;
      } catch (err: unknown) {
        throw err;
      }
    }

    await new Promise((res) => setTimeout(res, 150));
    return mockServiceItems.find((i) => i.id === id) || null;
  }

  async getProviders(filter?: { query?: string; categorySlug?: string }): Promise<ProviderSummary[]> {
    await new Promise((res) => setTimeout(res, 250));
    let list = [...mockProviders];

    if (filter?.query) {
      const q = filter.query.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.businessName.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async getProviderById(id: string): Promise<ProviderSummary | null> {
    await new Promise((res) => setTimeout(res, 150));
    return mockProviders.find((p) => p.id === id) || null;
  }

  async getOrders(): Promise<Order[]> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.bookings.list();
        const data = Array.isArray(res.data) ? res.data : [];
        const liveOrders = data.map(mapBookingToOrder);
        this.setStoredOrders(liveOrders);
        return liveOrders;
      } catch (err: unknown) {
        throw err;
      }
    }

    await new Promise((res) => setTimeout(res, 300));
    return this.getStoredOrders();
  }

  async getOrderById(id: string): Promise<Order | null> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.bookings.getById(id);
        if (res.data) {
          return mapBookingToOrder(res.data);
        }
        return null;
      } catch (err: unknown) {
        throw err;
      }
    }

    await new Promise((res) => setTimeout(res, 200));
    const list = this.getStoredOrders();
    return list.find((o) => o.id === id) || null;
  }

  async createOrder(
    orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "timeline">
  ): Promise<Order> {
    if (isLiveMode()) {
      try {
        const bookingPayload = {
          addressId: orderData.pickupAddress.id,
          scheduledPickupAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          specialInstructions: orderData.instructions,
          items: orderData.items.map((it) => ({
            serviceId: it.serviceId,
            serviceVariantId: it.variantId,
            quantity: it.quantity,
          })),
        };

        const res = await customerApi.bookings.create(bookingPayload);
        const createdOrder = mapBookingToOrder(res.data);
        const orders = this.getStoredOrders();
        this.setStoredOrders([createdOrder, ...orders]);
        await this.clearBookingDraft();
        return createdOrder;
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.createOrderMock(orderData);
  }

  private async createOrderMock(
    orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "timeline">
  ): Promise<Order> {
    await new Promise((res) => setTimeout(res, 600));

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `WSH-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "PICKUP_SCHEDULED",
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          title: "Order Placed & Confirmed",
          description: "Pickup slot locked with driver assigned",
          status: "COMPLETED",
          timestamp: "Just now",
        },
        {
          id: `t-${Date.now()}-2`,
          title: "Doorstep Pickup",
          description: `Scheduled for ${orderData.pickupDate} (${orderData.pickupTimeSlot})`,
          status: "ACTIVE",
          timestamp: "Upcoming",
        },
        {
          id: `t-${Date.now()}-3`,
          title: "Fabric Inspection & Washing",
          description: "Ultrasonic cleaning and eco-wash treatments",
          status: "PENDING",
        },
        {
          id: `t-${Date.now()}-4`,
          title: "Quality Check & Steam Finishing",
          description: "Wrinkle-free pressing & garment packaging",
          status: "PENDING",
        },
        {
          id: `t-${Date.now()}-5`,
          title: "Delivered to Doorstep",
          description: `Scheduled for ${orderData.deliveryDate} (${orderData.deliveryTimeSlot})`,
          status: "PENDING",
        },
      ],
      assignedDriver: {
        id: "drv-101",
        name: "Vikram Singh",
        phone: "+91 98450 11223",
        rating: 4.9,
        vehicleNumber: "KA 03 EN 4821",
      },
      pickupOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
      deliveryOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };

    const orders = this.getStoredOrders();
    const updated = [newOrder, ...orders];
    this.setStoredOrders(updated);
    await this.clearBookingDraft();
    return newOrder;
  }

  async cancelOrder(id: string, reason: string): Promise<Order> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.bookings.cancel(id, { reason });
        const updatedOrder = mapBookingToOrder(res.data);
        const orders = this.getStoredOrders();
        this.setStoredOrders(orders.map((o) => (o.id === id ? updatedOrder : o)));
        return updatedOrder;
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.cancelOrderMock(id, reason);
  }

  private async cancelOrderMock(id: string, reason: string): Promise<Order> {
    await new Promise((res) => setTimeout(res, 400));
    const orders = this.getStoredOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) throw new Error("Order not found");

    const updatedOrder: Order = {
      ...orders[index],
      status: "CANCELLED",
      timeline: [
        ...orders[index].timeline,
        {
          id: `t-${Date.now()}-c`,
          title: "Order Cancelled",
          description: `Reason: ${reason}`,
          status: "FAILED",
          timestamp: "Just now",
        },
      ],
    };

    orders[index] = updatedOrder;
    this.setStoredOrders(orders);
    return updatedOrder;
  }

  async getBookingDraft(): Promise<BookingDraft> {
    if (typeof window === "undefined") {
      return {
        items: [
          {
            serviceId: "srv-1",
            serviceName: "Premium Steam Press & Wash",
            variantId: "v-1",
            variantName: "Standard Hanger",
            quantity: 2,
            unitPrice: 99,
            selectedAddonIds: [],
          },
        ],
        pickupDate: "Tomorrow",
        pickupTimeSlot: "10:00 AM - 12:00 PM",
        deliveryDate: "Day after Tomorrow",
        deliveryTimeSlot: "04:00 PM - 06:00 PM",
      };
    }

    try {
      const stored = localStorage.getItem(STORAGE_CART_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }

    return {
      items: [
        {
          serviceId: "srv-1",
          serviceName: "Premium Steam Press & Wash",
          variantId: "v-1",
          variantName: "Standard Hanger",
          quantity: 2,
          unitPrice: 99,
          selectedAddonIds: [],
        },
      ],
      pickupDate: "Tomorrow",
      pickupTimeSlot: "10:00 AM - 12:00 PM",
      deliveryDate: "Day after Tomorrow",
      deliveryTimeSlot: "04:00 PM - 06:00 PM",
    };
  }

  async saveBookingDraft(draft: BookingDraft): Promise<BookingDraft> {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(draft));
      } catch {
        // ignore
      }
    }
    return draft;
  }

  async clearBookingDraft(): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_CART_KEY);
      } catch {
        // ignore
      }
    }
  }

  async getNotifications(): Promise<NotificationItem[]> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.notifications.list();
        const data = Array.isArray(res.data) ? res.data : [];
        return (data as any[]).map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message || n.body || "",
          type: n.type || "ORDER_UPDATE",
          read: n.isRead ?? false,
          createdAt: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Recently",
          actionUrl: n.actionUrl || "/customer/dashboard",
        }));
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.getNotificationsMock();
  }

  private async getNotificationsMock(): Promise<NotificationItem[]> {
    await new Promise((res) => setTimeout(res, 200));
    if (typeof window === "undefined") return MOCK_NOTIFICATIONS;
    try {
      const stored = localStorage.getItem(STORAGE_NOTIFS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return MOCK_NOTIFICATIONS;
  }

  async markNotificationRead(id: string): Promise<void> {
    if (isLiveMode()) {
      try {
        await customerApi.notifications.markAsRead(id);
      } catch {
        // Continue to update local storage cache
      }
    }

    if (typeof window === "undefined") return;
    try {
      const notifs = await this.getNotificationsMock();
      const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  async validateCoupon(
    code: string,
    subtotal: number
  ): Promise<{ valid: boolean; discount: number; message: string }> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.coupons.validate({ code, subtotal });
        const data = res.data as any;
        return {
          valid: data.valid ?? true,
          discount: Number(data.discountAmount || data.discount) || 0,
          message: data.message || `${code} applied successfully!`,
        };
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.validateCouponMock(code, subtotal);
  }

  private async validateCouponMock(
    code: string,
    subtotal: number
  ): Promise<{ valid: boolean; discount: number; message: string }> {
    await new Promise((res) => setTimeout(res, 300));
    const cleanCode = code.toUpperCase().trim();
    const coupon = MOCK_COUPONS.find((c) => c.code === cleanCode);

    if (!coupon) {
      return { valid: false, discount: 0, message: "Invalid promo code" };
    }

    if (subtotal < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order value for ${cleanCode} is ₹${coupon.minOrderValue}`,
      };
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return {
      valid: true,
      discount,
      message: `${cleanCode} applied successfully! You save ₹${discount}`,
    };
  }

  async submitSupportTicket(data: {
    category: string;
    subject: string;
    message: string;
    orderId?: string;
  }): Promise<{ ticketId: string; status: string }> {
    if (isLiveMode()) {
      try {
        const res = await customerApi.support.createTicket({
          category: data.category,
          subject: data.subject,
          description: data.message,
          message: data.message,
          priority: "MEDIUM",
          bookingId: data.orderId,
        });
        const ticket = res.data as any;
        return {
          ticketId: ticket.ticketNumber || ticket.id || `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
          status: ticket.status || "OPEN_ASSIGNED",
        };
      } catch (err: unknown) {
        throw err;
      }
    }

    return this.submitSupportTicketMock();
  }

  private async submitSupportTicketMock(): Promise<{ ticketId: string; status: string }> {
    await new Promise((res) => setTimeout(res, 500));
    return {
      ticketId: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "OPEN_ASSIGNED",
    };
  }
}

export const customerService = new CustomerService();
