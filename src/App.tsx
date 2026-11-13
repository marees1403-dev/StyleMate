/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { BottomTabBar } from './components/BottomTabBar';
import { StylistChatModal } from './components/StylistChatModal';
import { Toast } from './components/Toast';
import { TopAppBar } from './components/TopAppBar';
import { AppProvider, useApp } from './context/AppContext';
import { AdminInventoryScreen } from './screens/AdminInventoryScreen';
import { AdminReportsScreen } from './screens/AdminReportsScreen';
import { AdminSalesScreen } from './screens/AdminSalesScreen';
import { AiPairingScreen } from './screens/AiPairingScreen';
import { AuthScreen } from './screens/AuthScreen';
import { CartScreen } from './screens/CartScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
import { HomeScreen } from './screens/HomeScreen';
import { OrderTrackingScreen } from './screens/OrderTrackingScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { VirtualTryOnScreen } from './screens/VirtualTryOnScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { ScreenId } from './types';

const TAB_SCREENS: ScreenId[] = ['home', 'discover', 'pair', 'tryon', 'profile'];

const STACK_TITLES: Partial<Record<ScreenId, string>> = {
  product: 'Product Details',
  cart: 'Shopping Bag',
  checkout: 'Secure Checkout',
  tracking: 'Order Tracking',
  feedback: 'AI Style Tuning',
  'admin-sales': 'Admin • Sales & Units',
  'admin-inventory': 'Admin • Stock Health',
  'admin-reports': 'Admin • Quality Ops',
};

const AppShell: React.FC = () => {
  const { screen } = useApp();

  const isBlankShell = screen === 'welcome' || screen === 'auth';
  const isTabShell = TAB_SCREENS.includes(screen);
  const isStackShell = !isBlankShell && !isTabShell;

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'auth':
        return <AuthScreen />;
      case 'home':
        return <HomeScreen />;
      case 'discover':
        return <DiscoverScreen />;
      case 'pair':
        return <AiPairingScreen />;
      case 'tryon':
        return <VirtualTryOnScreen />;
      case 'product':
        return <ProductDetailScreen />;
      case 'cart':
        return <CartScreen />;
      case 'checkout':
        return <CheckoutScreen />;
      case 'tracking':
        return <OrderTrackingScreen />;
      case 'feedback':
        return <FeedbackScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'admin-sales':
        return <AdminSalesScreen />;
      case 'admin-inventory':
        return <AdminInventoryScreen />;
      case 'admin-reports':
        return <AdminReportsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-dvh w-full bg-surface-container-low/60 flex justify-center selection:bg-secondary-container">
      <div className="w-full sm:max-w-[460px] min-h-dvh bg-surface flex flex-col relative sm:shadow-[0_0_60px_rgba(103,81,141,0.14)]">
        <Toast />
        {(isTabShell || isStackShell) && (
          <TopAppBar
            variant={isTabShell ? 'tab' : 'stack'}
            title={STACK_TITLES[screen]}
          />
        )}
        <main className="flex-1 flex flex-col w-full bg-surface">
          {renderScreen()}
        </main>
        {isTabShell && <BottomTabBar />}
        <StylistChatModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
