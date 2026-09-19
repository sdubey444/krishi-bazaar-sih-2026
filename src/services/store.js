// Krishi Bazaar Stateful Reactive Store (Dual-Mode & Standalone Prototype Support)
// Persists to localStorage with automatic fallback and seed restoration

import { SEED_USERS, SEED_LISTINGS, SEED_REQUIREMENTS, SEED_ORDERS, SEED_LOGISTICS_PARTNERS } from '../data/seedData.js';

const STORAGE_KEYS = {
  CURRENT_USER: 'kb_current_user',
  USERS: 'kb_users',
  LISTINGS: 'kb_listings',
  REQUIREMENTS: 'kb_requirements',
  ORDERS: 'kb_orders',
  LOGISTICS_PARTNERS: 'kb_logistics_partners'
};

class Store {
  constructor() {
    this.listeners = new Set();
    this.init();
  }

  init() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        this.users = storedUsers ? JSON.parse(storedUsers) : [...SEED_USERS];

        const storedListings = localStorage.getItem(STORAGE_KEYS.LISTINGS);
        this.listings = storedListings ? JSON.parse(storedListings) : [...SEED_LISTINGS];

        const storedReqs = localStorage.getItem(STORAGE_KEYS.REQUIREMENTS);
        this.requirements = storedReqs ? JSON.parse(storedReqs) : [...SEED_REQUIREMENTS];

        const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
        this.orders = storedOrders ? JSON.parse(storedOrders) : [...SEED_ORDERS];

        const storedPartners = localStorage.getItem(STORAGE_KEYS.LOGISTICS_PARTNERS);
        this.logisticsPartners = storedPartners ? JSON.parse(storedPartners) : [...SEED_LOGISTICS_PARTNERS];

        const storedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (storedCurrentUser && storedCurrentUser !== 'null' && storedCurrentUser !== 'undefined') {
          this.currentUser = JSON.parse(storedCurrentUser);
        } else {
          this.currentUser = null;
        }
      } else {
        this.users = [...SEED_USERS];
        this.listings = [...SEED_LISTINGS];
        this.requirements = [...SEED_REQUIREMENTS];
        this.orders = [...SEED_ORDERS];
        this.logisticsPartners = [...SEED_LOGISTICS_PARTNERS];
        this.currentUser = null;
      }
    } catch (e) {
      this.users = [...SEED_USERS];
      this.listings = [...SEED_LISTINGS];
      this.requirements = [...SEED_REQUIREMENTS];
      this.orders = [...SEED_ORDERS];
      this.logisticsPartners = [...SEED_LOGISTICS_PARTNERS];
      this.currentUser = null;
    }
  }

  save() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(this.listings));
        localStorage.setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(this.requirements));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
        localStorage.setItem(STORAGE_KEYS.LOGISTICS_PARTNERS, JSON.stringify(this.logisticsPartners));
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      }
    } catch (e) {
      // Ignore in non-browser environments
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.getState());
      } catch (e) {
        console.error('Store listener error:', e);
      }
    }
  }

  getState() {
    return {
      currentUser: this.currentUser,
      users: this.users,
      listings: this.listings,
      requirements: this.requirements,
      orders: this.orders,
      logisticsPartners: this.logisticsPartners
    };
  }

  setCurrentUser(userOrId) {
    if (typeof userOrId === 'string') {
      const found = this.users.find(u => u.id === userOrId);
      if (found) this.currentUser = found;
    } else if (userOrId && userOrId.id) {
      this.currentUser = userOrId;
    }
    this.save();
  }

  register(userData) {
    const role = (userData.role || 'farmer').toLowerCase();
    const newUser = {
      id: `${role}_${Date.now()}`,
      name: userData.name?.trim() || (role === 'farmer' ? 'Kisan Member' : role === 'buyer' ? 'Buyer Member' : role === 'logistics' ? 'Logistics Partner' : 'Admin Directorate'),
      role,
      location: userData.location || 'Prayagraj',
      organization: userData.organization || (role === 'farmer' ? 'Kisan Cooperative Union' : role === 'buyer' ? 'Agro Foods Ltd' : role === 'logistics' ? 'Express Krishi Transport' : 'Krishi Directorate'),
      email: userData.email?.trim() || `${role}_${Date.now()}@krishibazaar.in`,
      phone: userData.phone?.trim() || '+91 98765 43210',
      password: userData.password || 'password123',
      vehicleNumber: userData.vehicleNumber || (role === 'logistics' ? 'UP70 AB 1234' : undefined),
      vehicleType: userData.vehicleType || (role === 'logistics' ? 'Mini Truck (Tata 407)' : undefined),
      capacityTons: userData.capacityTons || (role === 'logistics' ? 5 : undefined),
      createdAt: new Date().toISOString()
    };
    this.users.unshift(newUser);
    this.currentUser = newUser;
    this.save();
    return newUser;
  }

  login(roleOrId, identifier = null, password = null) {
    let role = roleOrId;
    let actualId = identifier;

    // If identifier not provided as 2nd param, inspect first param
    if (!actualId && roleOrId) {
      const isRole = ['farmer', 'buyer', 'logistics', 'admin'].includes(String(roleOrId).toLowerCase());
      if (!isRole || String(roleOrId).includes('@') || /\d{5,}/.test(String(roleOrId))) {
        actualId = roleOrId;
        const low = String(roleOrId).toLowerCase();
        if (low.includes('admin')) {
          role = 'admin';
        } else if (low.includes('logistics') || low.includes('transport') || low.includes('driver')) {
          role = 'logistics';
        } else if (low.includes('buyer') || low.includes('procurement')) {
          role = 'buyer';
        } else {
          role = null;
        }
      }
    }

    let user = null;
    const cleanId = (actualId || '').trim().toLowerCase();
    const digits = cleanId.replace(/\D/g, '');

    // 1. Search existing users by email, phone, or name
    if (cleanId) {
      user = this.users.find(u => {
        const uEmail = (u.email || '').toLowerCase();
        const uPhone = (u.phone || '').replace(/\D/g, '');
        const uName = (u.name || '').toLowerCase();
        
        if (uEmail === cleanId || (u.id || '').toLowerCase() === cleanId) return true;
        if (cleanId.includes('admin') && u.role === 'admin') return true;
        if (digits.length >= 7 && uPhone.includes(digits)) return true;
        if (uName === cleanId) return true;
        return false;
      });
    }

    // 2. Match by role from existing users if no exact identifier matched
    if (!user && role) {
      user = this.users.find(u => u.role.toLowerCase() === String(role).toLowerCase());
    }

    // 3. If still no user exists, create prototype user
    if (!user) {
      const isEmail = cleanId.includes('@');
      user = {
        id: `${(role || 'farmer').toLowerCase()}_${Date.now()}`,
        name: cleanId ? (cleanId.charAt(0).toUpperCase() + cleanId.slice(1)) : (role === 'farmer' ? 'Farmer Member' : role === 'buyer' ? 'Buyer Member' : role === 'logistics' ? 'Logistics Partner' : 'Admin Directorate'),
        role: (role || 'farmer').toLowerCase(),
        location: 'Prayagraj',
        phone: !isEmail && cleanId ? cleanId : '+91 98000 00000',
        email: isEmail ? cleanId : `${(role || 'farmer').toLowerCase()}@krishibazaar.in`,
        password: password || 'password123'
      };
      this.users.unshift(user);
    }

    this.currentUser = user;
    this.save();
    return user;
  }

  logout() {
    this.currentUser = null;
    this.save();
  }

  addListing(listing) {
    const newListing = {
      ...listing,
      id: `list_${Date.now()}`,
      availableQuantity: Number(listing.quantity),
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    this.listings.unshift(newListing);
    this.save();
    return newListing;
  }

  updateListing(id, updates) {
    this.listings = this.listings.map(l => l.id === id ? { ...l, ...updates } : l);
    this.save();
  }

  deactivateListing(id) {
    this.listings = this.listings.map(l => l.id === id ? { ...l, status: 'Deactivated' } : l);
    this.save();
  }

  reactivateListing(id) {
    this.listings = this.listings.map(l => l.id === id ? { ...l, status: 'Active' } : l);
    this.save();
  }

  deleteListing(id) {
    const prevCount = this.listings.length;
    this.listings = this.listings.filter(l => l.id !== id);
    this.save();
    return this.listings.length < prevCount;
  }

  addBulkRequirement(req) {
    const newReq = {
      ...req,
      id: `req_${Date.now()}`,
      buyerId: this.currentUser?.id || 'buyer_1',
      buyerName: this.currentUser?.name || 'Avadh Agro Mills (Buyer)',
      status: 'Pending Match',
      createdAt: new Date().toISOString()
    };
    this.requirements.unshift(newReq);
    this.save();
    return newReq;
  }

  createOrder(orderData) {
    const primaryAlloc = Array.isArray(orderData.allocations) && orderData.allocations.length > 0 ? orderData.allocations[0] : null;
    const initialStatus = orderData.status || 'Confirmed';
    const nowIso = new Date().toISOString();
    const qty = Number(orderData.totalQuantity || orderData.quantity || 100);
    const unit = orderData.unit || (qty >= 100 && qty % 100 === 0 ? 'Quintal' : 'KG');
    const priceKg = Number(orderData.pricePerKg || primaryAlloc?.pricePerKg || 28);
    const prodAmount = Number(orderData.produceAmount || orderData.farmerProduceValue || (priceKg * qty));
    const isPickup = Boolean(
      orderData.fulfillmentMethod === 'self_pickup' ||
      orderData.logisticsOption === 'self_pickup' ||
      orderData.deliveryMethod === 'Self Pickup' ||
      orderData.isSelfPickup ||
      orderData.logisticsCost === 0
    );
    const logCost = isPickup ? 0 : Number(orderData.logisticsCost !== undefined ? orderData.logisticsCost : 350);
    const platFee = Number(orderData.platformFee !== undefined ? orderData.platformFee : Math.round(prodAmount * 0.015));
    const totAmount = Number(orderData.totalAmount !== undefined ? orderData.totalAmount : (prodAmount + logCost + platFee));

    const farmerId = orderData.farmerId || primaryAlloc?.farmerId || 'farmer_a';
    const farmerName = orderData.farmerName || primaryAlloc?.farmerName || 'Ramesh Patel (FPO Prayagraj)';
    const fpoName = orderData.fpoName || primaryAlloc?.fpoName || 'Prayagraj Agro FPO';

    const allocations = (Array.isArray(orderData.allocations) && orderData.allocations.length > 0)
      ? orderData.allocations
      : [{
          farmerId,
          farmerName,
          fpoName,
          allocatedQuantity: qty,
          farmerEarnings: prodAmount,
          pricePerKg: priceKg,
          location: orderData.pickupLocation || 'Prayagraj',
          qualityGrade: orderData.qualityGrade || 'Grade A'
        }];

    const newOrder = {
      ...orderData,
      id: orderData.id || `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: orderData.createdAt || nowIso,
      orderDate: orderData.orderDate || nowIso,
      buyerId: orderData.buyerId || this.currentUser?.id || 'buyer_1',
      buyerName: orderData.buyerName || this.currentUser?.name || 'Avadh Agro Mills (Buyer)',
      farmerId,
      farmerName,
      fpoName,
      produce: orderData.produce || 'Wheat',
      quantity: orderData.quantity || qty,
      totalQuantity: qty,
      unit,
      quantityDisplay: orderData.quantityDisplay || `${orderData.quantity || qty} ${unit}`,
      pricePerKg: priceKg,
      produceAmount: prodAmount,
      farmerProduceValue: prodAmount,
      fulfillmentMethod: isPickup ? 'self_pickup' : 'logistics',
      deliveryMethod: isPickup ? 'Self Pickup' : 'Logistics Support',
      logisticsOption: isPickup ? 'self_pickup' : 'logistics',
      isSelfPickup: isPickup,
      logisticsCost: logCost,
      platformFee: platFee,
      totalAmount: totAmount,
      status: initialStatus,
      allocations,
      statusHistory: orderData.statusHistory || [
        { status: initialStatus, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]
    };

    // Deduct quantities from affected listings
    if (Array.isArray(orderData.allocations)) {
      orderData.allocations.forEach(alloc => {
        if (alloc.listingId) {
          this.listings = this.listings.map(l => {
            if (l.id === alloc.listingId) {
              const rem = Math.max(0, (l.availableQuantity || l.quantity) - alloc.allocatedQuantity);
              return {
                ...l,
                availableQuantity: rem,
                status: rem === 0 ? 'Fully Allocated' : l.status
              };
            }
            return l;
          });
        }
      });
    }

    this.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    this.orders = this.orders.map(order => {
      if (order.id === orderId) {
        const history = [...(order.statusHistory || [])];
        if (!history.some(h => h.status === newStatus)) {
          history.push({
            status: newStatus,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
        return {
          ...order,
          status: newStatus,
          statusHistory: history
        };
      }
      return order;
    });
    this.save();
    return this.orders.find(o => o.id === orderId);
  }

  registerLogisticsPartner(partnerData) {
    const newPartner = {
      id: `lp_${Date.now()}`,
      name: partnerData.name,
      phone: partnerData.phone,
      vehicleType: partnerData.vehicleType || 'Mini Truck',
      vehicleModel: partnerData.vehicleModel || 'Standard Commercial',
      capacityTons: Number(partnerData.capacityTons) || 5,
      capacityKg: (Number(partnerData.capacityTons) || 5) * 1000,
      vehicleNumber: (partnerData.vehicleNumber || '').toUpperCase().trim(),
      serviceArea: partnerData.serviceArea || 'Prayagraj',
      availability: 'Available',
      verificationStatus: 'Pending', // New partners start as Pending Verification
      perKmRate: partnerData.capacityTons > 10 ? 40 : partnerData.capacityTons > 5 ? 32 : 24,
      rating: 5.0,
      tripsCompleted: 0,
      createdAt: new Date().toISOString()
    };

    this.logisticsPartners.push(newPartner);
    this.save();
    return newPartner;
  }

  verifyLogisticsPartner(partnerId, newStatus) {
    let updatedPartner = null;
    this.logisticsPartners = this.logisticsPartners.map(p => {
      if (p.id === partnerId) {
        updatedPartner = {
          ...p,
          verificationStatus: newStatus // 'Approved' or 'Rejected'
        };
        return updatedPartner;
      }
      return p;
    });
    this.save();
    return updatedPartner;
  }

  getApprovedLogisticsPartners() {
    return (this.logisticsPartners || []).filter(
      p => p.verificationStatus === 'Approved' && p.availability === 'Available'
    );
  }

  resetSeedData() {
    this.users = [...SEED_USERS];
    this.listings = [...SEED_LISTINGS];
    this.requirements = [...SEED_REQUIREMENTS];
    this.orders = [...SEED_ORDERS];
    this.logisticsPartners = [...SEED_LOGISTICS_PARTNERS];
    this.currentUser = null;
    this.save();
  }
}

export const store = new Store();
