import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, Image, Linking } from 'react-native';
import { useState } from 'react';
import { User, Crown, Globe, Bell, Shield, LogOut, ChevronRight, Sparkles, Settings as SettingsIcon, CircleHelp as HelpCircle, Mail, FileText, ArrowRight, CreditCard as Edit } from 'lucide-react-native';
import { useUser } from '@/components/UserContext';
import { useAuthContext } from '@/components/AuthProvider';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function SettingsContent() {
  const { subscription, setCustomDomain, updateSubscription } = useUser();
  const { profile, signOut } = useAuthContext();
  const [customDomainInput, setCustomDomainInput] = useState(subscription.customDomain || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleDomainSave = async () => {
    if (subscription.plan !== 'pro') {
      router.push('/paywall');
      return;
    }

    if (customDomainInput.trim()) {
      const { error } = await setCustomDomain(customDomainInput.trim());
      if (error) {
        Alert.alert('Error', 'Failed to save custom domain');
      } else {
        Alert.alert('Domain Saved', 'Your custom domain has been saved successfully!');
      }
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your data will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setIsSigningOut(true);
              console.log('Starting sign out process...');
              
              const { error } = await signOut();
              
              if (error) {
                console.error('Sign out error:', error);
                Alert.alert('Error', 'Failed to sign out. Please try again.');
              } else {
                console.log('Sign out successful');
                // The auth state change should automatically redirect to login
              }
            } catch (error) {
              console.error('Unexpected sign out error:', error);
              Alert.alert('Error', 'An unexpected error occurred while signing out.');
            } finally {
              setIsSigningOut(false);
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/profile-edit');
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your LifeMap Pro subscription? You will lose access to Pro features immediately.',
      [
        { text: 'Keep Pro', style: 'cancel' },
        {
          text: 'Cancel Pro',
          style: 'destructive',
          onPress: async () => {
            const { error } = await updateSubscription('free');
            if (error) {
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            } else {
              Alert.alert('Subscription Canceled', 'You have been downgraded to the Free plan.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Enhanced Header */}
        <Animated.View entering={FadeInUp} style={styles.headerContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Settings</Text>
                <Text style={styles.headerSubtitle}>Customize your LifeMap experience</Text>
              </View>
              <View style={styles.headerIcon}>
                <SettingsIcon size={24} color="#ffffff" />
              </View>
              <TouchableOpacity
                style={{ position: 'absolute', top: 20, right: 80, zIndex: 10 }}
                onPress={() => Linking.openURL('https://bolt.new/')}
                activeOpacity={0.7}
              >
                <Image
                  source={require('../assets/images/black_circle_360x360.png')}
                  style={{ width: 56, height: 56 }}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Enhanced Profile Section */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.profileGradient}
            >
              <View style={styles.profileInfo}>
                <View style={styles.avatarContainer}>
                  {profile?.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <User size={24} color="#667eea" />
                    </View>
                  )}
                </View>
                <View style={styles.profileDetails}>
                  <Text style={styles.profileName}>
                    {profile?.full_name || 'LifeMap User'}
                  </Text>
                  <Text style={styles.profileEmail}>
                    {profile?.email || 'user@lifemap.com'}
                  </Text>
                  <View style={styles.profileStats}>
                    <Text style={styles.profileStatsText}>
                      Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Edit size={14} color="#667eea" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Enhanced Subscription Section */}
        <Animated.View entering={SlideInRight.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.subscriptionCard}>
            <LinearGradient
              colors={subscription.plan === 'pro' ? ['#fef3c7', '#fde68a'] : ['#dbeafe', '#bfdbfe']}
              style={styles.subscriptionGradient}
            >
              <View style={styles.subscriptionHeader}>
                <View style={styles.subscriptionTitle}>
                  {subscription.plan === 'pro' && <Crown size={20} color="#f59e0b" />}
                  <Text style={styles.subscriptionPlan}>
                    {subscription.plan === 'pro' ? 'LifeMap Pro' : 'LifeMap Free'}
                  </Text>
                  {subscription.plan === 'pro' && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity 
                  style={[
                    styles.subscriptionButton,
                    subscription.plan === 'pro' ? styles.manageButton : styles.upgradeButton
                  ]}
                  onPress={() => {
                    if (subscription.plan === 'free') {
                      router.push('/paywall');
                    } else if (subscription.plan === 'pro') {
                      handleCancelSubscription();
                    }
                  }}
                >
                  <Text style={styles.subscriptionButtonText}>
                    {subscription.plan === 'pro' ? 'Manage' : 'Upgrade'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.subscriptionDescription}>
                {subscription.plan === 'pro' 
                  ? 'Up to 48 entries per week, AI insights, and custom domains'
                  : 'Limited to 7 entries per week'
                }
              </Text>
              {subscription.plan === 'pro' && (
                <View style={styles.subscriptionFeatures}>
                  <View style={styles.featureItem}>
                    <Sparkles size={14} color="#f59e0b" />
                    <Text style={styles.featureText}>AI Weekly Summaries</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Globe size={14} color="#f59e0b" />
                    <Text style={styles.featureText}>Custom Domain</Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Enhanced Custom Domain Section */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Domain</Text>
          <View style={styles.domainCard}>
            <View style={styles.domainHeader}>
              <Globe size={20} color="#3b82f6" />
              <Text style={styles.domainTitle}>Share Your LifeMap</Text>
              {subscription.plan !== 'pro' && (
                <View style={styles.proBadge}>
                  <Crown size={12} color="#ffffff" />
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
            </View>
            <Text style={styles.domainDescription}>
              Create a branded version for coaching or sharing with your community
            </Text>
            
            <View style={styles.domainInputContainer}>
              <View style={styles.domainInputWrapper}>
                <TextInput
                  style={[
                    styles.domainInput,
                    subscription.plan !== 'pro' && styles.domainInputDisabled
                  ]}
                  placeholder="yourname"
                  placeholderTextColor="#9ca3af"
                  value={customDomainInput}
                  onChangeText={setCustomDomainInput}
                  editable={subscription.plan === 'pro'}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.domainSuffix}>.lifemap.app</Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.domainSaveButton,
                  subscription.plan !== 'pro' && styles.domainSaveButtonDisabled
                ]}
                onPress={handleDomainSave}
              >
                <Text style={styles.domainSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
            
            {subscription.customDomain && (
              <View style={styles.domainPreview}>
                <Text style={styles.domainPreviewLabel}>Your domain:</Text>
                <Text style={styles.domainPreviewUrl}>
                  https://{subscription.customDomain}.lifemap.app
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Enhanced App Settings */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Bell size={20} color="#64748b" />
              </View>
              <View>
                <Text style={styles.settingText}>Notifications</Text>
                <Text style={styles.settingSubtext}>Daily reminders and insights</Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {notificationsEnabled ? 'On' : 'Off'}
              </Text>
              <ChevronRight size={16} color="#9ca3af" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Shield size={20} color="#64748b" />
              </View>
              <View>
                <Text style={styles.settingText}>Privacy & Security</Text>
                <Text style={styles.settingSubtext}>Data protection settings</Text>
              </View>
            </View>
            <ChevronRight size={16} color="#9ca3af" />
          </TouchableOpacity>
        </Animated.View>

        {/* Enhanced Support Section */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Legal</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <HelpCircle size={20} color="#64748b" />
              </View>
              <Text style={styles.settingText}>Help Center</Text>
            </View>
            <ChevronRight size={16} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Mail size={20} color="#64748b" />
              </View>
              <Text style={styles.settingText}>Contact Us</Text>
            </View>
            <ChevronRight size={16} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <FileText size={20} color="#64748b" />
              </View>
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <ChevronRight size={16} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <FileText size={20} color="#64748b" />
              </View>
              <Text style={styles.settingText}>Terms of Service</Text>
            </View>
            <ChevronRight size={16} color="#9ca3af" />
          </TouchableOpacity>
        </Animated.View>

        {/* Enhanced Danger Zone */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
          <TouchableOpacity 
            style={[styles.dangerButton, isSigningOut && styles.dangerButtonDisabled]} 
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            <View style={styles.dangerButtonContent}>
              <View style={styles.dangerIcon}>
                <LogOut size={20} color="#ef4444" />
              </View>
              <View>
                <Text style={styles.dangerButtonText}>
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </Text>
                <Text style={styles.dangerButtonSubtext}>Your data will be saved</Text>
              </View>
            </View>
            <ChevronRight size={16} color="#ef4444" />
          </TouchableOpacity>
        </Animated.View>

        {/* App Version */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.versionContainer}>
          <Text style={styles.versionText}>LifeMap v1.0.0</Text>
          <Text style={styles.versionSubtext}>Made with ❤️ for personal growth</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    marginTop: 4,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  profileCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  profileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginTop: 2,
  },
  profileStats: {
    marginTop: 4,
  },
  profileStatsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
  },
  subscriptionCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  subscriptionGradient: {
    padding: 20,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subscriptionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  subscriptionPlan: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
  },
  activeBadge: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  activeBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  subscriptionButton: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  upgradeButton: {
    backgroundColor: '#3b82f6',
  },
  manageButton: {
    backgroundColor: '#3b82f6',
  },
  subscriptionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  subscriptionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginBottom: 12,
  },
  subscriptionFeatures: {
    flexDirection: 'row',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#78350f',
  },
  domainCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  domainTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    flex: 1,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    gap: 2,
  },
  proBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  domainDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  domainInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  domainInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  domainInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  domainInputDisabled: {
    color: '#9ca3af',
  },
  domainSuffix: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  domainSaveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  domainSaveButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  domainSaveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  domainPreview: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 12,
  },
  domainPreviewLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#0ea5e9',
    marginBottom: 4,
  },
  domainPreviewUrl: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0369a1',
  },
  settingItem: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  settingSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  dangerButton: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dangerButtonDisabled: {
    opacity: 0.6,
  },
  dangerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dangerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ef4444',
  },
  dangerButtonSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#9ca3af',
  },
  versionSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#d1d5db',
    marginTop: 4,
  },
});