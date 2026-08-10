import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GiftedChat } from 'react-native-gifted-chat';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

// ============================================================
// 🔥 FIREBASE CONFIG (YOUR CONFIG FROM FIREBASE)
// ============================================================
const firebaseConfig = {
  apiKey: 'AIzaSyAjLt_GCs9_wHro2KN1KaNnYselFlbd2Bk',
  authDomain: 'nexora-chat-app-10c89.firebaseapp.com',
  databaseURL: 'https://nexora-chat-app-10c89-default-rtdb.firebaseio.com',
  projectId: 'nexora-chat-app-10c89',
  storageBucket: 'nexora-chat-app-10c89.firebasestorage.app',
  messagingSenderId: '877046679938',
  appId: '1:877046679938:web:b6c31cd51efb208ad0e79b',
  measurementId: 'G-D0PY5096P5',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================================
// 👑 FOUNDER DETECTION (YOUR ACCOUNT)
// ============================================================
const FOUNDER_EMAIL = 'estalistan@gmail.com';
const FOUNDER_PHONE = '+2349123002161';

// ============================================================
// 🧠 GEMINI AI KEY (READY FOR INTEGRATION)
// ============================================================
// const GEMINI_API_KEY = 'AQ.Ab8RN6I86LqPEFXJkcA-kh3ZbD...';

// ============================================================
// 📱 SPLASH + LOGIN SCREEN
// ============================================================
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace('ChatList');
      }
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace('ChatList');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const normalizedEmail = email.trim().toLowerCase();

      if (normalizedEmail === FOUNDER_EMAIL) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          displayName: 'Estalistan',
          email: FOUNDER_EMAIL,
          phone: FOUNDER_PHONE,
          isFounder: true,
          isVerified: true,
          verifiedLabel: 'Official Owner of Nexora',
          premiumTier: 'diamond',
          createdAt: new Date().toISOString(),
        });
      }

      navigation.replace('ChatList');
    } catch (error) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showWelcome) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <Text style={styles.splashEmoji}>🎊</Text>
        <Text style={styles.logoText}>NEXORA</Text>
        <Text style={styles.splashSubtext}>Welcome to Nexora App 🎊🥳</Text>
        <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 30 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.loginContainer}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>NEXORA</Text>
        <Text style={styles.logoSubtext}>Connect. Chat. Conquer.</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Loading...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignUp} disabled={loading}>
          <Text style={styles.signupText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>⚡ Nexora - The Ultimate Chat Experience</Text>
    </SafeAreaView>
  );
}

// ============================================================
// 💬 CHAT LIST SCREEN
// ============================================================
function ChatListScreen({ navigation }) {
  const [chats] = useState([
    { id: '1', name: '📢 Nexora Channel', lastMessage: 'Welcome to Nexora! 🎉', time: 'Now', unread: 1, isChannel: true, verified: true },
    { id: '2', name: '📢 Announcements', lastMessage: 'New features coming soon!', time: '5m', unread: 0, isChannel: true, verified: true },
    { id: '3', name: '🤖 Nexora Support', lastMessage: 'Type /help for assistance', time: '2h', unread: 0, isBot: true },
    { id: '4', name: '🤖 Nexora Verification', lastMessage: 'Request verification here', time: '1h', unread: 0, isBot: true },
    { id: '5', name: '🤖 Nexora Premium', lastMessage: 'Upgrade to Premium today!', time: '30m', unread: 0, isBot: true },
    { id: '6', name: 'John Doe', lastMessage: 'Hey! How are you?', time: '1h', unread: 2 },
    { id: '7', name: 'Jane Smith', lastMessage: 'See you tomorrow!', time: '3h', unread: 0 },
  ]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate('Chat', {
          name: item.name,
          isBot: item.isBot,
          isChannel: item.isChannel,
          verified: item.verified,
        })
      }
    >
      <View style={styles.avatarContainer}>
        <View
          style={[
            styles.avatar,
            item.isChannel && styles.channelAvatar,
            item.isBot && styles.botAvatar,
          ]}
        >
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        {item.verified && (
          <Text style={styles.verifiedBadgeSmall}>✓</Text>
        )}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatItemHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>

      {item.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nexora</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Text style={styles.headerIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.headerIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
      />

      <View style={styles.bottomTab}>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={[styles.tabText, styles.tabActive]}>💬 Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Calls')}
        >
          <Text style={styles.tabText}>📞 Calls</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabText}>📰 Updates</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.tabText}>⚙️ Tools</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================================
// 💬 CHAT WINDOW
// ============================================================
function ChatWindow({ route, navigation }) {
  const { name = 'Chat', isBot = false, verified = false } = route.params || {};
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([
      {
        _id: Date.now().toString(),
        text: isBot
          ? `Welcome to ${name}! How can I help you?`
          : `Welcome to ${name}! 🎉`,
        createdAt: new Date(),
        user: { _id: 2, name },
      },
    ]);
  }, [name, isBot]);

  const onSend = useCallback(
    (newMessages = []) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );

      if (isBot && newMessages.length > 0) {
        const userMessage = newMessages[0].text?.trim() || '';

        setTimeout(() => {
          let response = '';

          if (name === '🤖 Nexora Support') {
            if (userMessage === '/help') response = 'Available commands: /appeal, /report, /status';
            else if (userMessage === '/appeal') response = 'Please provide your appeal reason. Type your message below.';
            else if (userMessage === '/status') response = 'Your appeal is being reviewed. We will notify you shortly.';
            else response = 'I understand. Please type /help to see available commands.';
          } else if (name === '🤖 Nexora Verification') {
            if (userMessage === '/verify') response = 'Please provide: Full Name, Government ID, and Verified Social Media.';
            else response = 'Your verification request has been submitted. We will review within 24-48 hours.';
          } else if (name === '🤖 Nexora Premium') {
            if (userMessage === '/premium') response = 'Plans: Silver (₦2,500/mo), Gold (₦5,000/mo), Diamond (₦10,000/mo).';
            else response = 'Tap the Paystack button below to upgrade to Premium! 💎';
          } else {
            response = 'I am the Nexora AI Assistant. How can I help you today? 🤖';
          }

          const botMessage = {
            _id: Date.now().toString() + Math.random().toString(),
            text: response,
            createdAt: new Date(),
            user: { _id: 2, name },
          };

          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [botMessage])
          );
        }, 900);
      }
    },
    [isBot, name]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chatWindowHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={styles.chatHeaderTitle}>{name}</Text>
          {verified && <Text style={styles.verifiedBadgeInline}> ✓</Text>}
        </View>

        {!isBot && (
          <TouchableOpacity
            onPress={() => navigation.navigate('CallScreen', { name })}
          >
            <Text style={styles.headerIcon}>📞</Text>
          </TouchableOpacity>
        )}
      </View>

      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: 1, name: 'You' }}
        placeholder="Type a message..."
        showAvatarForEveryMessage={true}
        renderUsernameOnMessage={true}
      />

      {name === '🤖 Nexora Premium' && (
        <TouchableOpacity
          style={styles.premiumButton}
          onPress={() =>
            Alert.alert('Premium', 'Paystack payment will open here!')
          }
        >
          <Text style={styles.premiumButtonText}>💎 Upgrade to Premium</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

// ============================================================
// 📞 CALLS SCREEN
// ============================================================
function CallsScreen({ navigation }) {
  const [recentCalls] = useState([
    { id: '1', name: 'John Doe', time: '10:30 AM', type: 'incoming' },
    { id: '2', name: 'Jane Smith', time: '9:15 AM', type: 'outgoing' },
    { id: '3', name: 'Tech Group', time: 'Yesterday', type: 'missed' },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calls</Text>
      </View>

      <View style={styles.callHeader}>
        <TouchableOpacity style={styles.callActionButton}>
          <Text style={styles.callActionText}>📞 Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callActionButton}>
          <Text style={styles.callActionText}>📅 Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callActionButton}>
          <Text style={styles.callActionText}>🔢 Keypad</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={recentCalls}
        renderItem={({ item }) => (
          <View style={styles.callItem}>
            <View style={styles.callAvatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.chatInfo}>
              <Text style={styles.callName}>{item.name}</Text>
              <Text style={styles.callTime}>
                {item.time} • {item.type}
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
      />

      <View style={styles.bottomTab}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('ChatList')}
        >
          <Text style={styles.tabText}>💬 Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={[styles.tabText, styles.tabActive]}>📞 Calls</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabText}>📰 Updates</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.tabText}>⚙️ Tools</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================================
// 📞 CALL SCREEN (LiveKit Ready - Placeholder)
// ============================================================
function CallScreen({ route, navigation }) {
  const { name = 'Unknown' } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chatWindowHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.chatHeaderTitle}>Call with {name}</Text>
      </View>

      <View style={styles.callPlaceholder}>
        <Text style={styles.callPlaceholderEmoji}>📞</Text>
        <Text style={styles.callPlaceholderText}>Calling {name}...</Text>
        <Text style={styles.callPlaceholderSub}>
          LiveKit integration coming soon
        </Text>

        <TouchableOpacity
          style={styles.endCallButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.endCallText}>End Call</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================================
// ⚙️ SETTINGS SCREEN
// ============================================================
function SettingsScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        getDoc(userRef).then((docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        });
      }
    });
    return unsubscribe;
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth);
          navigation.replace('Login');
        },
      },
    ]);
  };

  const isFounder =
    userData?.isFounder ||
    (user?.email && user.email.toLowerCase() === FOUNDER_EMAIL);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.headerIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>👑</Text>
        </View>
        <View style={styles.profileInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.profileName}>
              {isFounder ? 'Estalistan' : user?.email || 'User'}
            </Text>
            {isFounder && <Text style={styles.verifiedBadgeInline}> ✓</Text>}
          </View>

          <View style={styles.verifiedRow}>
            {isFounder ? (
              <>
                <Text style={styles.verifiedBadge}>🔵 Verified</Text>
                <Text style={styles.verifiedLabel}>
                  Official Owner of Nexora
                </Text>
              </>
            ) : (
              <Text style={styles.verifiedLabel}>Nexora User</Text>
            )}
          </View>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <TouchableOpacity
          style={styles.settingsItem}
          onPress={() => navigation.navigate('Privacy')}
        >
          <Text style={styles.settingsIcon}>👤</Text>
          <Text style={styles.settingsText}>Account</Text>
          <Text style={styles.settingsArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsItem}
          onPress={() => navigation.navigate('Privacy')}
        >
          <Text style={styles.settingsIcon}>🔒</Text>
          <Text style={styles.settingsText}>Privacy</Text>
          <Text style={styles.settingsArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <Text style={styles.settingsIcon}>💬</Text>
          <Text style={styles.settingsText}>Chats</Text>
          <Text style={styles.settingsArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.settingsItem}>
          <Text style={styles.settingsIcon}>🔔</Text>
          <Text style={styles.settingsText}>Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>

        <View style={styles.settingsItem}>
          <Text style={styles.settingsIcon}>🌙</Text>
          <Text style={styles.settingsText}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>

        <TouchableOpacity
          style={styles.settingsItem}
          onPress={() =>
            Alert.alert('Premium', 'Upgrade to Premium with Paystack!')
          }
        >
          <Text style={styles.settingsIcon}>⭐</Text>
          <Text style={styles.settingsText}>Premium</Text>
          <Text style={styles.settingsBadge}>Upgrade</Text>
        </TouchableOpacity>

        {isFounder && (
          <TouchableOpacity style={styles.settingsItem}>
            <Text style={styles.settingsIcon}>📢</Text>
            <Text style={styles.settingsText}>Nexora Channel (Admin)</Text>
            <Text style={styles.settingsBadge}>👑</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ============================================================
// 🔒 PRIVACY SCREEN
// ============================================================
function PrivacyScreen({ navigation }) {
  const [toggles, setToggles] = useState({
    phone: true,
    lastSeen: true,
    profilePhoto: true,
    forwarded: true,
    addToGroups: true,
    voiceCalls: true,
    findByPhone: true,
  });

  const toggleSwitch = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const privacyOptions = [
    { key: 'phone', label: 'Show my phone number to others' },
    { key: 'lastSeen', label: 'Show when I was last online' },
    { key: 'profilePhoto', label: 'Show my profile photo to others' },
    { key: 'forwarded', label: 'Allow others to forward my messages' },
    { key: 'addToGroups', label: 'Allow others to add me to groups' },
    { key: 'voiceCalls', label: 'Allow others to call me' },
    { key: 'findByPhone', label: 'Find me by phone number' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.privacyHeader}>Who Can See My Info</Text>

      <View style={styles.settingsSection}>
        {privacyOptions.map((item) => (
          <View key={item.key} style={styles.settingsItem}>
            <Text style={[styles.settingsText, { flex: 1 }]}>{item.label}</Text>
            <Switch
              value={toggles[item.key]}
              onValueChange={() => toggleSwitch(item.key)}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.blockButton}>
        <Text style={styles.blockButtonText}>🚫 Blocked Users</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ============================================================
// 📱 NAVIGATION
// ============================================================
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ChatList" component={ChatListScreen} />
        <Stack.Screen name="Chat" component={ChatWindow} />
        <Stack.Screen name="Calls" component={CallsScreen} />
        <Stack.Screen name="CallScreen" component={CallScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ============================================================
// 🎨 STYLES
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  splashEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  splashSubtext: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
  loginContainer: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#6C63FF',
    letterSpacing: 2,
  },
  logoSubtext: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
    letterSpacing: 1,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  loginButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    color: '#6C63FF',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
  },
  footerText: {
    color: '#444',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#0a0a0f',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIcon: {
    fontSize: 22,
    color: '#fff',
    marginLeft: 15,
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a4a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelAvatar: {
    backgroundColor: '#6C63FF',
  },
  botAvatar: {
    backgroundColor: '#FF6B6B',
  },
  avatarText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  verifiedBadgeSmall: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#6C63FF',
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    width: 16,
    height: 16,
    borderRadius: 8,
    textAlign: 'center',
    lineHeight: 16,
    overflow: 'hidden',
  },
  chatInfo: {
    flex: 1,
  },
  chatItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  chatTime: {
    fontSize: 12,
    color: '#666',
  },
  chatMessage: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomTab: {
    flexDirection: 'row',
    backgroundColor: '#0f0f1a',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabText: {
    color: '#666',
    fontSize: 12,
  },
  tabActive: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  chatWindowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#0a0a0f',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  verifiedBadgeInline: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  backArrow: {
    fontSize: 24,
    color: '#6C63FF',
    paddingRight: 15,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    margin: 15,
    padding: 15,
    borderRadius: 15,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileAvatarText: {
    fontSize: 28,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  verifiedLabel: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  profileEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  settingsSection: {
    marginHorizontal: 15,
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  settingsIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  settingsText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  settingsArrow: {
    fontSize: 18,
    color: '#666',
  },
  settingsBadge: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  premiumButton: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#0a0a0f',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  callActionButton: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  callActionText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  callItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  callAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a4a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  callName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  callTime: {
    fontSize: 12,
    color: '#666',
  },
  callIcon: {
    fontSize: 22,
    color: '#6C63FF',
  },
  privacyHeader: {
    fontSize: 16,
    color: '#888',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  blockButton: {
    backgroundColor: '#FF4444',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  blockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  callPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  callPlaceholderEmoji: {
    fontSize: 70,
    marginBottom: 20,
  },
  callPlaceholderText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  callPlaceholderSub: {
    color: '#888',
    fontSize: 14,
    marginBottom: 40,
  },
  endCallButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
  },
  endCallText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
