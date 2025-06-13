import Purchases, { CustomerInfo, PurchasesConfiguration, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';

// Replace with your actual API key from RevenueCat dashboard
const REVENUECAT_API_KEY = 'YOUR_API_KEY';

class RevenueCatService {
  private static instance: RevenueCatService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async initialize(userId?: string) {
    if (this.isInitialized) return;

    // Only initialize on native platforms
    if (Platform.OS === 'web') {
      console.log('RevenueCat is not supported on web platform');
      this.isInitialized = true;
      return;
    }

    try {
      const configuration: PurchasesConfiguration = {
        apiKey: REVENUECAT_API_KEY,
        appUserID: userId,
      };

      await Purchases.configure(configuration);
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    if (Platform.OS === 'web') {
      console.log('RevenueCat is not supported on web platform');
      return null;
    }

    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      throw error;
    }
  }

  async purchasePackage(packageToPurchase: any) {
    if (Platform.OS === 'web') {
      console.log('RevenueCat is not supported on web platform');
      return null;
    }

    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return customerInfo;
    } catch (error) {
      console.error('Error purchasing package:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo | null> {
    if (Platform.OS === 'web') {
      console.log('RevenueCat is not supported on web platform');
      return null;
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (Platform.OS === 'web') {
      console.log('RevenueCat is not supported on web platform');
      return null;
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('Error getting customer info:', error);
      throw error;
    }
  }

  // Helper method to check if user has active entitlement
  async hasActiveEntitlement(entitlementId: string): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('RevenueCat is not supported on web platform');
      return false;
    }

    try {
      const customerInfo = await this.getCustomerInfo();
      return customerInfo?.entitlements.active[entitlementId] !== undefined;
    } catch (error) {
      console.error('Error checking entitlement:', error);
      return false;
    }
  }
}

export const revenueCatService = RevenueCatService.getInstance(); 