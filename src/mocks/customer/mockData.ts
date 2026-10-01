import {
  ServiceCategory,
  ServiceItem,
  ProviderSummary,
  CustomerProfile,
  CustomerAddress,
  Order,
} from "@/types/customer";

export const mockCategories: ServiceCategory[] = [
  {
    id: "cat-1",
    slug: "clothing-care",
    name: "Clothing Care",
    description: "Dry cleaning, alterations, and delicate fabric restoration.",
    iconName: "dry_cleaning",
    itemCount: 18,
    startingPrice: 99,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDRjTsEML_M2XwPFn1-w247Izf-Yc-jKCXzDIMeemlVW3YYApwTRB32qPhHk8XwsNZ8e5abghWAgKuScM8qg0klcH_vwJcPqsSK3LciAsVkhMuVPkPV-AM-_EblE9c9ucdeLaLerlcNs0KKZ3PsrNQukfTLuOFGNKEI3CnHRUJz9Jq-TuIPLglGUCaglJ6otPVXfKXUC0zBcErwMBrpkP-PCiAacH5O6gpsCnR_FRlaeZmhJj3YQrzzLQ",
  },
  {
    id: "cat-2",
    slug: "shoe-care",
    name: "Shoe Care",
    description: "Deep clean, deodorizing, midsole restoration, and suede reconditioning.",
    iconName: "steps",
    itemCount: 12,
    startingPrice: 299,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBHaCj_Hj25Cs019lP1ABA8rSasz5-oikWsj9ra2aLw7TIYa9YEcduck_cHcUsbt19WduXtTGgordR4F64FIobDeJEHe38ui5RgRLTyO0Fna3-XvFvxGfBUCF0uVtnwn3cCvbclKvWlZFskXgMChv6NXpExz1RxTg8x0qQKXyns6M_864AlstYgfvl4YjdJJyCjmQ_Md1OH9JgXOm5yTDNsc9pcrARIfEGNx6U47-m5J3HjPLDCZBkfGg",
  },
  {
    id: "cat-3",
    slug: "car-care",
    name: "Car Care",
    description: "Interior detailing, ceramic coating, and precision exterior steam wash.",
    iconName: "directions_car",
    itemCount: 8,
    startingPrice: 599,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA3HPDTAWgyrFogG60F2zE6jLGAEh7WIxEyp-pgVZ1p74pw2qWol5PSp1JbibNPTohxtbvTZR0I09HimWVCd4iij2z5GyPQj-aKk_v5nnX2-s594BBMc2g1YAYNW-xm4_n5iHiKhEDvJaC0Fuj_qyT9RKdW3sO-IMmNJHrT40PiNAsblDjNi2bnRhPwn-S0_CJVMnYLoVdCKefZqdiyv3UL01N_D5o-7ufUL6M-qfIeljFhAIu9QzjzFw",
  },
  {
    id: "cat-4",
    slug: "bag-luggage",
    name: "Bag & Luggage",
    description: "Premium restoration for leather goods and travel accessories.",
    iconName: "shopping_bag",
    itemCount: 6,
    startingPrice: 499,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD6xDIehUDXb0YyJpbEhof8biwlX3768S-8H69Q94QOibj5JBvfn1zN6xxo7COodPh5-vhFJ13KeUZjTDuW7dZwzCgeX9BvHO5n997zipiF2_e2mNr0112qG_VKmGysOBKe7-AqtPMDzxMmT13snf3P00DQ4tGujMbfC342a9GB5u--lGeYEisZkOYqTTQJ6RYHjfKQFW6S5s2jBWKI8BQw_1hTfSgnoi4RX9Z1PzVQvehDEI1qVfHO4g",
  },
  {
    id: "cat-5",
    slug: "helmet-riding-gear",
    name: "Helmets & Gear",
    description: "UV sanitization, foam decontamination, and scratch resistant visor polish.",
    iconName: "sports_motorsports",
    itemCount: 6,
    startingPrice: 199,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCAr8DZ3yh_TAQLOHqQOgTqm6D-YZZPTAK_2-aQY0I_pu4sqRtrf-EF3pdz4tLDzZKKwweGc6OZSmWKIgRRAX6YNOPDsM2zcD3GfVX6ZnbZfASRh-lzoKknsqkdHw-VjAQ-4z91rHWm7uiJp7Ofxr_BwYxK05V0iVgL2nHt7awyzEF3YlYI7PliKQ6r1zSCVG4ab5X67SUaDoU4lso41BgS_KffT5zU4UBwjbbLZVO4vspooyRN-yTYUg",
  },
  {
    id: "cat-6",
    slug: "express-care",
    name: "24h Express Care",
    description: "Priority same-day pickup, wash, press, and swift doorstep return.",
    iconName: "bolt",
    itemCount: 10,
    startingPrice: 129,
  },
];

export const mockServiceItems: ServiceItem[] = [
  {
    id: "srv-1",
    categoryId: "cat-2",
    name: "Sneaker Deep Clean",
    description:
      "Comprehensive interior and exterior cleaning for premium sneakers using specialized non-abrasive foams.",
    basePrice: 299,
    unit: "per pair",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDclkeaOgVBIKSESyOvINj4z2t5BQ30JRlzfg6mfJlea8SS9YzqCuHXDEDCt0b937c8GMexhong7IEmhUt48AJFxgjrTCIyzr4otPdqY2wECR9Yf81wPcqNng5xi0DPw45Es0VjZ6m9ejdFvvqEJgcBjxRey9nj0B-ZdcUtAFWdkXqg9uTcLoo93SDHO8_pKD8WqX-mLSn8s_3v6RXgqLVsXpSl7psA09TLiNcjjH-ikZbvW1KVyBoYmw",
    variants: [
      { id: "v-1", name: "Standard Sneaker Clean", price: 299, turnaroundHours: 24 },
      { id: "v-2", name: "Midsole Restoration & Whitening", price: 449, turnaroundHours: 48 },
    ],
    addons: [],
  },
  {
    id: "srv-2",
    categoryId: "cat-2",
    name: "Leather Shoe Care",
    description:
      "Conditioning, waxing, and high-gloss polishing for formal leather footwear to restore original luster.",
    basePrice: 450,
    unit: "per pair",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC3tqsc18Vle_YtBoOeqkS7UhPxXDiwNJS9Kk-g3BaESfBosZoyKhK3ZlEAnGlQrU73nKBQX6NZ8iAqYIPeWyQkzxvfqrm5ppnwUOKWH9Lfbc6MpVPExcDTbNKBQye_FSOeQWLJI6XLstoMS75HFo7gYyo8kWX-UOezVzZOTYIalwWYg_LdylD8BJNvTWTfPZRTdaR0PDOdmwPSOcuq0PJAKxKQLmibXP_zgG_QiIoseJyD_a4s3Bzazw",
    variants: [
      { id: "v-3", name: "Condition & High Gloss", price: 450, turnaroundHours: 36 },
      { id: "v-4", name: "Full Edge & Sole Re-dye", price: 650, turnaroundHours: 48 },
    ],
    addons: [],
  },
  {
    id: "srv-3",
    categoryId: "cat-2",
    name: "Suede Restoration",
    description:
      "Specialized dry brushing and protective coating application for delicate suede and nubuck materials.",
    basePrice: 399,
    unit: "per pair",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCvlit3hfvdjbVmnX_3jxjoNibDz7gKDBj_Y3Kzrq7HcatVqLHBdzUwXx1jE-ddsHpXqePzUg-tDSvgkkvQJ9RyjkNl7-OWGLMoLR4LfbOle-JETeI5aNcsoD1crfUxsOgAsSS54avsu-6F_1SUm94rIUBPtBReJv1V33t4EP6Ezn2MoPixUjiNxlJjn_O7xJyCvrWtyrINQGAkTease4Qak-h4AIMO1Oiiq1V6Tg2JX-Gkt0BUNQhESg",
    variants: [
      { id: "v-5", name: "Suede Dry Clean", price: 399, turnaroundHours: 48 },
      { id: "v-6", name: "Hydrophobic Shield Coating", price: 549, turnaroundHours: 48 },
    ],
    addons: [],
  },
  {
    id: "srv-4",
    categoryId: "cat-1",
    name: "Delicate Silk Saree Dry Clean",
    description:
      "Zero-damage perchloroethylene-free solvent treatment for heavy zaris, banarasi silks, and designer sarees.",
    basePrice: 299,
    unit: "per item",
    variants: [
      { id: "v-7", name: "Single Saree Roll Press", price: 299, turnaroundHours: 36 },
      { id: "v-8", name: "Bridal Heavy Zari Spa", price: 499, turnaroundHours: 48 },
    ],
    addons: [],
  },
  {
    id: "srv-5",
    categoryId: "cat-1",
    name: "2-Piece Formal Suit Dry Clean",
    description:
      "Bespoke dry cleaning with steam hanger shaping and stain extraction for luxury wool and linen blazers.",
    basePrice: 399,
    unit: "per set",
    variants: [
      { id: "v-9", name: "2-Piece Suit", price: 399, turnaroundHours: 24 },
      { id: "v-10", name: "3-Piece Tuxedo Special", price: 549, turnaroundHours: 36 },
    ],
    addons: [],
  },
  {
    id: "srv-6",
    categoryId: "cat-4",
    name: "Luxury Handbag Restoration & Spa",
    description:
      "Deep leather conditioning, edge re-glazing, hardware polishing, and color touch-up for designer bags.",
    basePrice: 699,
    unit: "per item",
    variants: [
      { id: "v-11", name: "Tote & Shoulder Bag", price: 699, turnaroundHours: 72 },
    ],
    addons: [],
  },
  {
    id: "srv-7",
    categoryId: "cat-5",
    name: "Full Helmet Sanitization & Visor Buff",
    description:
      "Anti-bacterial foam extraction, lining deodorization, and optical grade visor buff.",
    basePrice: 199,
    unit: "per item",
    variants: [
      { id: "v-12", name: "Full Face / Modular", price: 249, turnaroundHours: 24 },
    ],
    addons: [],
  },
  {
    id: "srv-8",
    categoryId: "cat-3",
    name: "Ceramic Foam Exterior & Interior Detail",
    description:
      "Touchless foam wash, high-gloss tire dressing, glass descaling, and cabin ozone sanitization.",
    basePrice: 799,
    unit: "per item",
    variants: [
      { id: "v-13", name: "Hatchback / Sedan", price: 799, turnaroundHours: 12 },
      { id: "v-14", name: "SUV / Luxury", price: 1099, turnaroundHours: 12 },
    ],
    addons: [],
  },
];

export const mockProviders: ProviderSummary[] = [
  {
    id: "prov-1",
    businessName: "LuxeCare Garment Studio",
    tagline: "Specialized in couture, suits & silk care",
    rating: 4.9,
    reviewCount: 342,
    distanceKm: 1.8,
    estimatedHours: 24,
    isVerified: true,
    badge: "Top Rated",
    priceRange: "₹₹₹",
  },
  {
    id: "prov-2",
    businessName: "EcoWash Fabric Cleaners",
    tagline: "100% organic, plant-based dry cleaning",
    rating: 4.8,
    reviewCount: 218,
    distanceKm: 2.4,
    estimatedHours: 24,
    isVerified: true,
    badge: "Eco-Friendly",
    priceRange: "₹₹",
  },
  {
    id: "prov-3",
    businessName: "SpeedySteam Express Hub",
    tagline: "Same-day turnaround for daily laundry",
    rating: 4.7,
    reviewCount: 512,
    distanceKm: 3.1,
    estimatedHours: 12,
    isVerified: true,
    badge: "Express",
    priceRange: "₹",
  },
  {
    id: "prov-4",
    businessName: "Apex Leather & Shoe Lab",
    tagline: "Specialized sneaker restoration & handbag spa",
    rating: 5.0,
    reviewCount: 189,
    distanceKm: 2.9,
    estimatedHours: 48,
    isVerified: true,
    badge: "Top Rated",
    priceRange: "₹₹₹",
  },
];

export const mockCustomerProfile: CustomerProfile = {
  id: "cust-1",
  userId: "user-1",
  name: "Arjun Verma",
  email: "arjun.verma@example.com",
  phone: "+91 98765 43210",
  isPhoneVerified: true,
  memberSince: "March 2024",
};

export const mockAddresses: CustomerAddress[] = [
  {
    id: "addr-1",
    customerId: "cust-1",
    label: "Home",
    recipientName: "Arjun Verma",
    phoneNumber: "+91 98765 43210",
    streetAddress: "Flat 402, Lotus Orchid, 12th Main Road",
    apartmentSuite: "4th Floor",
    city: "Bangalore",
    postalCode: "560038",
    landmark: "Near Metro Station, Indiranagar",
    isDefault: true,
  },
  {
    id: "addr-2",
    customerId: "cust-1",
    label: "Work",
    recipientName: "Arjun Verma",
    phoneNumber: "+91 98765 43210",
    streetAddress: "7th Floor, Queryholic Tech Hub, Outer Ring Road",
    city: "Bangalore",
    postalCode: "560103",
    isDefault: false,
  },
];

export const mockOrders: Order[] = [
  {
    id: "ord-1",
    orderNumber: "WSH-98214",
    customerId: "cust-1",
    providerId: "prov-1",
    providerName: "LuxeCare Garment Studio",
    status: "ITEM_INTAKE_INSPECTION",
    items: [
      {
        serviceId: "srv-1",
        serviceName: "Sneaker Deep Clean",
        variantId: "v-1",
        variantName: "Standard Sneaker Clean",
        quantity: 1,
        unitPrice: 299,
        selectedAddonIds: [],
      },
    ],
    subtotal: 299,
    discount: 50,
    deliveryFee: 49,
    taxes: 24,
    total: 322,
    pickupAddress: mockAddresses[0],
    deliveryAddress: mockAddresses[0],
    pickupDate: "Today",
    pickupTimeSlot: "10:00 AM - 12:00 PM",
    deliveryDate: "Tomorrow",
    deliveryTimeSlot: "04:00 PM - 06:00 PM",
    timeline: [
      {
        id: "t-1",
        title: "Pickup Completed",
        description: "Garments collected by driver",
        status: "COMPLETED",
        timestamp: "Today, 11:15 AM",
      },
      {
        id: "t-2",
        title: "Intake & Material Inspection",
        description: "Studio verifying fabric conditions",
        status: "ACTIVE",
        timestamp: "In Progress",
      },
      {
        id: "t-3",
        title: "Bespoke Cleaning",
        description: "Organic solvent wash & steam finishing",
        status: "PENDING",
      },
      {
        id: "t-4",
        title: "Out for Delivery",
        description: "Delivering to your doorstep",
        status: "PENDING",
      },
    ],
    createdAt: new Date().toISOString(),
  },
];
