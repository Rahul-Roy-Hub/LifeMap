import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react-native';
import { useAuthContext } from './AuthProvider';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function AuthScreen() {
  const { signIn, signUp, resetPassword } = useAuthContext();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleAuth = async () => {
    if (!email.trim() || (!isResetPassword && !password.trim())) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Prevent spaces in password during sign up
    if (isSignUp && /\s/.test(password)) {
      Alert.alert('Error', 'Password cannot contain spaces');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      if (isResetPassword) {
        const { error } = await resetPassword(email);
        if (error) {
          Alert.alert('Error', error.message);
        } else {
          Alert.alert('Success', 'Password reset email sent!');
          setIsResetPassword(false);
        }
      } else if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          Alert.alert('Error', error.message);
        } else {
          Alert.alert(
            'Account Created Successfully! 🎉',
            'Your LifeMap account has been created. Please check your email to verify your account and start your personal growth journey.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Reset form and switch to sign in mode
                  resetForm();
                  switchMode('signIn');
                }
              }
            ]
          );
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          Alert.alert('Error', error.message);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setShowPassword(false);
  };

  const switchMode = (mode: 'signIn' | 'signUp' | 'reset') => {
    resetForm();
    setIsSignUp(mode === 'signUp');
    setIsResetPassword(mode === 'reset');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeInUp} style={styles.headerContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.header}>
                {/* Black Circle in Top Right as Hyperlink */}
                <TouchableOpacity
                  style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}
                  onPress={() => Linking.openURL('https://bolt.new/')}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require('../assets/images/black_circle_360x360.png')}
                    style={styles.blackCircle}
                  />
                </TouchableOpacity>
                <View style={styles.logoContainer}>
                  <View style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: '#fb923c',
                  }}>
                    <Image source={require('../assets/images/lifemaplogo.png')} style={{ width: 56, height: 56, borderRadius: 28, resizeMode: 'contain' }} />
                  </View>
                </View>
                <Text style={styles.appTitle}>LifeMap</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={styles.appSubtitle}>Your personal growth journey</Text>
                  <Text style={{ fontSize: 18, marginLeft: 6 }}>🌱</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.formContainer}>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {isResetPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
              </Text>
              <Text style={styles.formSubtitle}>
                {isResetPassword
                  ? 'Enter your email to reset your password'
                  : isSignUp
                  ? 'Start your journey with LifeMap'
                  : 'Sign in to continue your growth'}
              </Text>

              <View style={styles.inputContainer}>
                {isSignUp && (
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'fullName' && { borderColor: '#fb923c', borderWidth: 2 }
                  ]}>
                    <View style={styles.inputIcon}>
                      <User size={20} color="#64748b" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#9ca3af"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                      autoCorrect={false}
                      onFocus={() => setFocusedInput('fullName')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                )}

                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'email' && { borderColor: '#fb923c', borderWidth: 2 }
                ]}>
                  <View style={styles.inputIcon}>
                    <Mail size={20} color="#64748b" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>

                {!isResetPassword && (
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'password' && { borderColor: '#fb923c', borderWidth: 2 }
                  ]}>
                    <View style={styles.inputIcon}>
                      <Lock size={20} color="#64748b" />
                    </View>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Password"
                      placeholderTextColor="#9ca3af"
                      value={password}
                      onChangeText={text => setPassword(text.replace(/\s/g, ''))}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#64748b" />
                      ) : (
                        <Eye size={20} color="#64748b" />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleAuth}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#9ca3af', '#6b7280'] : ['#667eea', '#764ba2']}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitButtonText}>
                    {loading
                      ? 'Loading...'
                      : isResetPassword
                      ? 'Send Reset Email'
                      : isSignUp
                      ? 'Create Account'
                      : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.linkContainer}>
                {!isResetPassword && (
                  <TouchableOpacity onPress={() => switchMode(isSignUp ? 'signIn' : 'signUp')}>
                    <Text style={styles.linkText}>
                      {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </Text>
                  </TouchableOpacity>
                )}

                {!isSignUp && (
                  <TouchableOpacity
                    onPress={() => switchMode(isResetPassword ? 'signIn' : 'reset')}
                    style={styles.forgotPasswordLink}
                  >
                    <Text style={styles.linkText}>
                      {isResetPassword ? 'Back to Sign In' : 'Forgot Password?'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Features */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Why LifeMap?</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureEmoji}>📝</Text>
                <Text style={styles.featureText}>Daily journaling made simple</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureEmoji}>📊</Text>
                <Text style={styles.featureText}>Track your mood and habits</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureEmoji}>🤖</Text>
                <Text style={styles.featureText}>AI-powered insights</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 32,
  },
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  formTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
  },
  passwordInput: {
    paddingRight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.1,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  linkContainer: {
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
    textAlign: 'center',
  },
  forgotPasswordLink: {
    marginTop: 8,
  },
  featuresContainer: {
    paddingHorizontal: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresList: {
    gap: 16,
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
    borderColor: '#e2e8f0',
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1e293b',
    flex: 1,
  },
  blackCircle: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 56,
    height: 56,
    zIndex: 10,
  },
});