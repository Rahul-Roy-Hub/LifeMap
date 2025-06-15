import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, Sparkles, Target, TrendingUp, Globe, Zap, Shield, Crown, Star, Award, Heart } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/components/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, SlideInRight, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

const features = [
  {
    icon: <Sparkles size={20} color="#8b5cf6" />,
    title: 'AI Weekly Summaries',
    description: 'Get personalized insights and growth recommendations',
    highlight: true,
  },
  {
    icon: <Target size={20} color="#10b981" />,
    title: 'AI Feedback & Coaching',
    description: 'Receive intelligent feedback on your journal entries',
    highlight: true,
  },
  {
    icon: <TrendingUp size={20} color="#3b82f6" />,
    title: 'Advanced Analytics',
    description: 'Deep habit tracking and mood pattern analysis',
    highlight: false,
  },
  {
    icon: <Globe size={20} color="#f59e0b" />,
    title: 'Custom Domain',
    description: 'Create your branded coaching platform',
    highlight: false,
  },
  {
    icon: <Shield size={20} color="#ef4444" />,
    title: 'Priority Support',
    description: 'Get help when you need it most',
    highlight: false,
  },
  {
    icon: <Zap size={20} color="#06b6d4" />,
    title: 'Export & Backup',
    description: 'Download your data anytime, anywhere',
    highlight: false,
  }
];

export default function PaywallContent() {
  const { subscription, updateSubscription } = useUser();

  // Animation values
  const sparkleRotation = useSharedValue(0);
  const pulseValue = useSharedValue(1);

  useEffect(() => {
    // Sparkle rotation animation
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1,
      false
    );

    // Pulse animation for CTA
    pulseValue.value = withRepeat(
      withTiming(1.05, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const handleSubscribe = () => {
    // Mock RevenueCat purchase flow
    Alert.alert(
      'RevenueCat Integration',
      'This is a demo version. In production, RevenueCat would handle the subscription process securely through Apple/Google billing.\n\nTo integrate RevenueCat:\n1. Export project locally\n2. Install RevenueCat SDK\n3. Configure products in RevenueCat dashboard\n4. Replace this mock with actual purchase flow',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Activate Pro (Demo)', 
          onPress: () => {
            updateSubscription('pro');
            Alert.alert('Welcome to Pro!', 'You now have access to all Pro features.', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        }
      ]
    );
  };

  const handleRestore = () => {
    Alert.alert('Restore Purchases', 'No previous purchases found to restore.');
  };

  // Responsive calculations for iPad support
  const isTablet = width >= 768;
  const isSmallScreen = width < 375;

  // Feature grid layout
  const getFeatureLayout = () => {
    if (isTablet) {
      return {
        columns: 2,
        gap: 20,
      };
    }
    return {
      columns: 1,
      gap: 12,
    };
  };

  const featureLayout = getFeatureLayout();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, isTablet && styles.scrollContentTablet]}
      >
        {/* Enhanced Header with iPad support */}
        <Animated.View entering={FadeInUp} style={styles.headerContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={[styles.header, isTablet && styles.headerTablet]}>
              <TouchableOpacity onPress={() => router.back()} style={[styles.closeButton, isTablet && styles.closeButtonTablet]}>
                <X size={isTablet ? 28 : 24} color="#ffffff" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Animated.View style={[styles.heroIcon, isTablet && styles.heroIconTablet, sparkleStyle]}>
                  <Crown size={isTablet ? 40 : 32} color="#fbbf24" />
                </Animated.View>
                <Text style={[styles.heroTitle, isTablet && styles.heroTitleTablet]}>Unlock Your Full Potential</Text>
                <Text style={[styles.heroSubtitle, isTablet && styles.heroSubtitleTablet]}>
                  Upgrade to LifeMap Pro and get AI-powered insights for your personal growth journey
                </Text>
                
                {/* Social proof badges */}
                <View style={[styles.socialProofBadges, isTablet && styles.socialProofBadgesTablet]}>
                  <View style={styles.socialBadge}>
                    <Star size={12} color="#fbbf24" />
                    <Text style={styles.socialBadgeText}>4.9★</Text>
                  </View>
                  <View style={styles.socialBadge}>
                    <Heart size={12} color="#ef4444" />
                    <Text style={styles.socialBadgeText}>10K+ users</Text>
                  </View>
                  <View style={styles.socialBadge}>
                    <Award size={12} color="#10b981" />
                    <Text style={styles.socialBadgeText}>Editor's Choice</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Current Plan Status with iPad styling */}
        {subscription.plan === 'free' && (
          <Animated.View entering={FadeInDown.delay(100)} style={[styles.currentPlanContainer, isTablet && styles.currentPlanContainerTablet]}>
            <LinearGradient
              colors={['#fef3c7', '#fde68a']}
              style={[styles.currentPlan, isTablet && styles.currentPlanTablet]}
            >
              <View style={styles.currentPlanHeader}>
                <Text style={[styles.currentPlanTitle, isTablet && styles.currentPlanTitleTablet]}>Current: LifeMap Free</Text>
                <View style={[styles.limitBadge, isTablet && styles.limitBadgeTablet]}>
                  <Text style={[styles.limitBadgeText, isTablet && styles.limitBadgeTextTablet]}>Limited</Text>
                </View>
              </View>
              <Text style={[styles.currentPlanText, isTablet && styles.currentPlanTextTablet]}>
                {subscription.entriesThisMonth}/{subscription.maxEntriesPerMonth} entries used this month
              </Text>
              <View style={[styles.progressBar, isTablet && styles.progressBarTablet]}>
                <View style={[
                  styles.progressFill,
                  { width: `${(subscription.entriesThisMonth / subscription.maxEntriesPerMonth) * 100}%` }
                ]} />
              </View>
              <Text style={[styles.progressText, isTablet && styles.progressTextTablet]}>
                {subscription.maxEntriesPerMonth - subscription.entriesThisMonth} entries remaining this month
              </Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Enhanced Features List with iPad layout */}
        <Animated.View entering={SlideInRight.delay(200)} style={[styles.featuresSection, isTablet && styles.featuresSectionTablet]}>
          <Text style={[styles.featuresTitle, isTablet && styles.featuresTitleTablet]}>What's included in Pro:</Text>
          <View style={[
            styles.featuresGrid,
            isTablet && styles.featuresGridTablet,
            { gap: featureLayout.gap }
          ]}>
            {features.map((feature, index) => (
              <Animated.View 
                key={index} 
                entering={FadeInDown.delay(300 + index * 50)}
                style={[
                  styles.featureItem,
                  isTablet && styles.featureItemTablet,
                  feature.highlight && styles.featureItemHighlight,
                  isTablet && feature.highlight && styles.featureItemHighlightTablet,
                  isTablet ? { width: '48%' } : { width: '100%' }
                ]}
              >
                <View style={[styles.featureIcon, isTablet && styles.featureIconTablet]}>
                  {feature.icon}
                </View>
                <View style={styles.featureContent}>
                  <View style={styles.featureHeader}>
                    <Text style={[styles.featureTitle, isTablet && styles.featureTitleTablet]}>{feature.title}</Text>
                    {feature.highlight && (
                      <View style={[styles.popularBadge, isTablet && styles.popularBadgeTablet]}>
                        <Text style={[styles.popularBadgeText, isTablet && styles.popularBadgeTextTablet]}>Popular</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.featureDescription, isTablet && styles.featureDescriptionTablet]}>{feature.description}</Text>
                </View>
                <Check size={isTablet ? 20 : 16} color="#10b981" />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Enhanced Pricing with iPad styling */}
        <Animated.View entering={FadeInDown.delay(400)} style={[styles.pricingSection, isTablet && styles.pricingSectionTablet]}>
          <View style={[styles.pricingCard, isTablet && styles.pricingCardTablet]}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={[styles.pricingGradient, isTablet && styles.pricingGradientTablet]}
            >
              <View style={styles.pricingHeader}>
                <View style={styles.pricingTitleContainer}>
                  <Crown size={isTablet ? 28 : 24} color="#f59e0b" />
                  <Text style={[styles.pricingTitle, isTablet && styles.pricingTitleTablet]}>LifeMap Pro</Text>
                </View>
                <View style={[styles.mostPopularBadge, isTablet && styles.mostPopularBadgeTablet]}>
                  <Text style={[styles.mostPopularBadgeText, isTablet && styles.mostPopularBadgeTextTablet]}>Most Popular</Text>
                </View>
              </View>
              
              <View style={styles.pricingPrice}>
                <Text style={[styles.priceAmount, isTablet && styles.priceAmountTablet]}>$9.99</Text>
                <Text style={[styles.pricePeriod, isTablet && styles.pricePeriodTablet]}>/month</Text>
              </View>
              
              <View style={styles.pricingFeatures}>
                <Text style={[styles.pricingDescription, isTablet && styles.pricingDescriptionTablet]}>
                  Cancel anytime • 7-day free trial included
                </Text>
                <View style={[styles.savingsBadge, isTablet && styles.savingsBadgeTablet]}>
                  <Text style={[styles.savingsText, isTablet && styles.savingsTextTablet]}>Same 30 monthly entries + AI insights</Text>
                </View>
              </View>

              {/* Value proposition for tablets */}
              {isTablet && (
                <View style={styles.valueProposition}>
                  <Text style={styles.valueTitle}>Why upgrade now?</Text>
                  <View style={styles.valuePoints}>
                    <View style={styles.valuePoint}>
                      <Check size={16} color="#10b981" />
                      <Text style={styles.valuePointText}>AI-powered weekly summaries</Text>
                    </View>
                    <View style={styles.valuePoint}>
                      <Check size={16} color="#10b981" />
                      <Text style={styles.valuePointText}>Intelligent feedback on entries</Text>
                    </View>
                    <View style={styles.valuePoint}>
                      <Check size={16} color="#10b981" />
                      <Text style={styles.valuePointText}>Professional coaching tools</Text>
                    </View>
                  </View>
                </View>
              )}
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Enhanced CTA Section with iPad styling */}
        <Animated.View entering={FadeInDown.delay(500)} style={[styles.ctaSection, isTablet && styles.ctaSectionTablet]}>
          <Animated.View style={pulseStyle}>
            <TouchableOpacity style={[styles.subscribeButton, isTablet && styles.subscribeButtonTablet]} onPress={handleSubscribe}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.subscribeGradient, isTablet && styles.subscribeGradientTablet]}
              >
                <Sparkles size={isTablet ? 24 : 20} color="#ffffff" />
                <Text style={[styles.subscribeButtonText, isTablet && styles.subscribeButtonTextTablet]}>Start Free Trial</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          
          <TouchableOpacity style={[styles.restoreButton, isTablet && styles.restoreButtonTablet]} onPress={handleRestore}>
            <Text style={[styles.restoreButtonText, isTablet && styles.restoreButtonTextTablet]}>Restore Purchases</Text>
          </TouchableOpacity>

          <View style={[styles.guaranteeContainer, isTablet && styles.guaranteeContainerTablet]}>
            <Shield size={isTablet ? 20 : 16} color="#10b981" />
            <Text style={[styles.guaranteeText, isTablet && styles.guaranteeTextTablet]}>
              7-day money-back guarantee
            </Text>
          </View>
        </Animated.View>

        {/* Social Proof with iPad styling */}
        <Animated.View entering={FadeInDown.delay(600)} style={[styles.socialProofSection, isTablet && styles.socialProofSectionTablet]}>
          <Text style={[styles.socialProofTitle, isTablet && styles.socialProofTitleTablet]}>Join thousands of users</Text>
          <View style={[styles.statsContainer, isTablet && styles.statsContainerTablet]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, isTablet && styles.statNumberTablet]}>10K+</Text>
              <Text style={[styles.statLabel, isTablet && styles.statLabelTablet]}>Active Users</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, isTablet && styles.statNumberTablet]}>4.9★</Text>
              <Text style={[styles.statLabel, isTablet && styles.statLabelTablet]}>App Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, isTablet && styles.statNumberTablet]}>50K+</Text>
              <Text style={[styles.statLabel, isTablet && styles.statLabelTablet]}>Entries Created</Text>
            </View>
          </View>

          {/* Testimonial for tablets */}
          {isTablet && (
            <View style={styles.testimonial}>
              <Text style={styles.testimonialText}>
                "LifeMap Pro transformed my self-awareness journey. The AI insights are incredibly accurate and helpful."
              </Text>
              <Text style={styles.testimonialAuthor}>- Sarah K., Life Coach</Text>
            </View>
          )}
        </Animated.View>

        {/* Footer with iPad styling */}
        <Animated.View entering={FadeInDown.delay(700)} style={[styles.footer, isTablet && styles.footerTablet]}>
          <Text style={[styles.footerText, isTablet && styles.footerTextTablet]}>
            By subscribing, you agree to our Terms of Service and Privacy Policy. 
            Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
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
  scrollContentTablet: {
    paddingBottom: 48,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerTablet: {
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 56,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  closeButtonTablet: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 28,
  },
  headerContent: {
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroIconTablet: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroTitleTablet: {
    fontSize: 36,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  heroSubtitleTablet: {
    fontSize: 20,
    lineHeight: 30,
    marginBottom: 32,
  },
  socialProofBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  socialProofBadgesTablet: {
    gap: 16,
  },
  socialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 4,
  },
  socialBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  currentPlanContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  currentPlanContainerTablet: {
    marginBottom: 32,
  },
  currentPlan: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  currentPlanTablet: {
    borderRadius: 24,
    padding: 28,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  currentPlanTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#92400e',
  },
  currentPlanTitleTablet: {
    fontSize: 20,
  },
  limitBadge: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  limitBadgeTablet: {
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  limitBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  limitBadgeTextTablet: {
    fontSize: 12,
  },
  currentPlanText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#78350f',
    marginBottom: 12,
  },
  currentPlanTextTablet: {
    fontSize: 16,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarTablet: {
    height: 10,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#78350f',
  },
  progressTextTablet: {
    fontSize: 14,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresSectionTablet: {
    marginBottom: 48,
  },
  featuresTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  featuresTitleTablet: {
    fontSize: 28,
    marginBottom: 28,
    paddingHorizontal: 0,
  },
  featuresGrid: {
    paddingHorizontal: 20,
    gap: 12,
  },
  featuresGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  featureItemTablet: {
    borderRadius: 20,
    padding: 20,
  },
  featureItemHighlight: {
    borderColor: '#3b82f6',
    backgroundColor: '#fefefe',
  },
  featureItemHighlightTablet: {
    borderWidth: 2,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureIconTablet: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 20,
  },
  featureContent: {
    flex: 1,
    marginRight: 12,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    flex: 1,
  },
  featureTitleTablet: {
    fontSize: 18,
  },
  popularBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  popularBadgeTablet: {
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  popularBadgeText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  popularBadgeTextTablet: {
    fontSize: 10,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    lineHeight: 20,
  },
  featureDescriptionTablet: {
    fontSize: 16,
    lineHeight: 24,
  },
  pricingSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  pricingSectionTablet: {
    marginBottom: 48,
    marginHorizontal: 0,
  },
  pricingCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  pricingCardTablet: {
    borderRadius: 24,
    borderWidth: 3,
  },
  pricingGradient: {
    padding: 24,
  },
  pricingGradientTablet: {
    padding: 32,
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pricingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pricingTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
  },
  pricingTitleTablet: {
    fontSize: 24,
  },
  mostPopularBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  mostPopularBadgeTablet: {
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  mostPopularBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  mostPopularBadgeTextTablet: {
    fontSize: 14,
  },
  pricingPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  priceAmount: {
    fontSize: 40,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
  },
  priceAmountTablet: {
    fontSize: 48,
  },
  pricePeriod: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginLeft: 4,
  },
  pricePeriodTablet: {
    fontSize: 20,
    marginLeft: 6,
  },
  pricingFeatures: {
    gap: 8,
  },
  pricingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  pricingDescriptionTablet: {
    fontSize: 16,
  },
  savingsBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  savingsBadgeTablet: {
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  savingsText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#16a34a',
  },
  savingsTextTablet: {
    fontSize: 14,
  },
  valueProposition: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  valueTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  valuePoints: {
    gap: 12,
  },
  valuePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valuePointText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  ctaSectionTablet: {
    paddingHorizontal: 0,
    marginBottom: 48,
    gap: 20,
  },
  subscribeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  subscribeButtonTablet: {
    borderRadius: 20,
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  subscribeGradientTablet: {
    padding: 24,
    gap: 12,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  subscribeButtonTextTablet: {
    fontSize: 22,
  },
  restoreButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  restoreButtonTablet: {
    borderRadius: 16,
    padding: 20,
  },
  restoreButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
  },
  restoreButtonTextTablet: {
    fontSize: 18,
  },
  guaranteeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  guaranteeContainerTablet: {
    gap: 12,
  },
  guaranteeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10b981',
  },
  guaranteeTextTablet: {
    fontSize: 16,
  },
  socialProofSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  socialProofSectionTablet: {
    marginHorizontal: 0,
    borderRadius: 24,
    padding: 32,
    marginBottom: 48,
  },
  socialProofTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  socialProofTitleTablet: {
    fontSize: 22,
    marginBottom: 28,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 0,
  },
  statsContainerTablet: {
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#3b82f6',
  },
  statNumberTablet: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    marginTop: 4,
  },
  statLabelTablet: {
    fontSize: 14,
    marginTop: 6,
  },
  testimonial: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  testimonialText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 12,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
  },
  footer: {
    paddingHorizontal: 20,
  },
  footerTablet: {
    paddingHorizontal: 0,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerTextTablet: {
    fontSize: 14,
    lineHeight: 22,
  },
});