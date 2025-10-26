// Élan: The Wellness App - Main Application Logic

/* ============================================
   FIREBASE CONFIGURATION & SETUP
   ============================================
   
   IMPORTANT: Replace the firebaseConfig below with your own Firebase project credentials.
   
   To get your Firebase config:
   1. Go to https://console.firebase.google.com
   2. Create a new project or select an existing one
   3. Go to Project Settings > General > Your apps
   4. Add a web app or select existing one
   5. Copy the firebaseConfig object
   
   Also enable these services in Firebase Console:
   - Authentication: Enable Email/Password, Google, and Phone providers
   - Firestore Database: Create database in test mode
   
   ============================================ */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (only if config is provided)
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let isFirebaseEnabled = false;

try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY" && typeof firebase !== 'undefined') {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseAuth = firebase.auth();
    firebaseDb = firebase.firestore();
    isFirebaseEnabled = true;
    console.log('✅ Firebase initialized successfully');
  } else {
    console.log('⚠️ Firebase not configured. Running in demo mode.');
    console.log('To enable Firebase: Replace firebaseConfig in app.js with your project credentials');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.log('Running in demo mode without Firebase');
}

// Data Storage (In-memory, since localStorage is not available in sandbox)
const appData = {
  habits: [],
  moodHistory: [],
  habitCompletions: {},
  currentDate: new Date(),
  theme: 'light',
  friends: [],
  notifications: [],
  isFirstVisit: true,
  isLoggedIn: false,
  loginMethod: null,
  userInfo: null,
  dailyQuote: null,
  quoteDate: null,
  currentWeekOffset: 0
};

// Default habits data
const defaultHabits = [
  { name: "Drink 8 glasses of water", category: "Health & Fitness", icon: "💧", type: "numeric", target: 8 },
  { name: "Exercise for 30 minutes", category: "Health & Fitness", icon: "💪", type: "duration", target: 30 },
  { name: "Read for 20 minutes", category: "Learning & Growth", icon: "📚", type: "duration", target: 20 },
  { name: "Meditate", category: "Mindfulness & Mental Health", icon: "🧘", type: "binary", target: 1 },
  { name: "Journal writing", category: "Mindfulness & Mental Health", icon: "📝", type: "binary", target: 1 },
  { name: "Walk 10,000 steps", category: "Health & Fitness", icon: "👟", type: "numeric", target: 10000 },
  { name: "Practice gratitude", category: "Mindfulness & Mental Health", icon: "🙏", type: "binary", target: 1 },
  { name: "Call a friend/family", category: "Social & Relationships", icon: "📞", type: "binary", target: 1 }
];

const habitCategories = [
  "Health & Fitness",
  "Mindfulness & Mental Health",
  "Learning & Growth",
  "Productivity",
  "Social & Relationships",
  "Finance & Organization"
];

const moodLevels = [
  { name: "Awful", emoji: "😢", value: 1, color: "#5C6BC0", label: "AWFUL" },
  { name: "Bad", emoji: "😔", value: 2, color: "#42A5F5", label: "BAD" },
  { name: "Okay", emoji: "😐", value: 3, color: "#FDD835", label: "OKAY" },
  { name: "Good", emoji: "🙂", value: 4, color: "#66BB6A", label: "GOOD" },
  { name: "Great", emoji: "😄", value: 5, color: "#4CAF50", label: "GREAT" }
];

const streakRewards = [
  { days: 3, title: "Getting Started", message: "3 days strong! You're on fire! 🔥" },
  { days: 7, title: "Week Warrior", message: "One week completed! Amazing consistency! 🏆" },
  { days: 14, title: "Two Week Champion", message: "14 days! You're building real habits! 💎" },
  { days: 30, title: "Monthly Master", message: "30 days! This is becoming second nature! 👑" },
  { days: 50, title: "Halfway Hero", message: "50 days! You're unstoppable! ⚡" },
  { days: 100, title: "Century Achiever", message: "100 days! You're a habit formation legend! 🌟" }
];

const fallbackQuotes = [
  { q: "Progress, not perfection!", a: "Élan" },
  { q: "Every journey begins with a single step.", a: "Élan" },
  { q: "Small habits, big changes!", a: "Élan" },
  { q: "You are stronger than you think!", a: "Élan" },
  { q: "Believe in yourself and all that you are.", a: "Élan" },
  { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" }
];

const insightsData = [
  { metric: "Mood", change: 16, direction: "up", habit: "Yoga", icon: "🧘", color: "purple" },
  { metric: "Deep Sleep", change: 4, direction: "down", habit: "Humidity", icon: "💧", color: "blue" },
  { metric: "Anxiety", change: 35, direction: "down", habit: "Sertraline", icon: "💊", color: "teal" },
  { metric: "Headaches", change: 19, direction: "up", habit: "Air Pressure", icon: "🌡️", color: "green" },
  { metric: "Heart Rate", change: 8, direction: "up", habit: "Caffeine", icon: "☕", color: "pink" },
  { metric: "Energy", change: 22, direction: "up", habit: "Morning Walk", icon: "🚶", color: "orange" },
  { metric: "Focus", change: 12, direction: "up", habit: "Meditation", icon: "🧘", color: "purple" },
  { metric: "Stress", change: 28, direction: "down", habit: "Journaling", icon: "📝", color: "yellow" }
];

const aiSuggestions = [
  "Based on your exercise consistency, try adding a 5-minute morning stretch routine",
  "Your reading habit is strong! Consider adding a vocabulary learning habit",
  "Since you meditate regularly, you might enjoy a breathing exercise habit",
  "Your water intake is excellent! Try tracking healthy snacks next",
  "You're great at morning habits. Consider adding an evening wind-down routine"
];

const sampleFriends = [
  { name: "Sarah Johnson", score: 850, streak: 23 },
  { name: "Michael Chen", score: 720, streak: 15 },
  { name: "Emma Williams", score: 680, streak: 12 },
  { name: "You", score: 450, streak: 8 },
  { name: "James Brown", score: 390, streak: 7 }
];

// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Initialize app
function initApp() {
  // Check if first visit
  if (appData.isFirstVisit) {
    showWelcomeScreen();
  } else {
    hideWelcomeScreen();
  }

  // Initialize with default habits if none exist
  if (appData.habits.length === 0) {
    defaultHabits.forEach(habit => {
      addHabit(habit.name, habit.category, habit.icon, habit.type, habit.target);
    });
  }

  // Initialize friends
  appData.friends = [...sampleFriends];

  // Initialize notifications
  appData.notifications = [
    { title: "Streak Alert!", text: "You're on a 5-day streak with 'Meditate'! 🔥" },
    { title: "New Achievement", text: "Unlocked: Week Warrior badge! 🏆" },
    { title: "Friend Activity", text: "Sarah Johnson completed 8/8 habits today!" }
  ];

  // Fetch daily quote
  fetchDailyQuote();

  // Set up event listeners
  setupEventListeners();

  // Render initial view
  renderDashboard();
  updateCurrentDate();
  renderNotifications();

  // Load theme
  loadTheme();
}

// Welcome screen functions
function showWelcomeScreen() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  welcomeScreen.style.display = 'flex';
}

function hideWelcomeScreen() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  welcomeScreen.classList.add('hidden');
  // After animation completes, set display to none
  setTimeout(() => {
    if (welcomeScreen.classList.contains('hidden')) {
      welcomeScreen.style.display = 'none';
    }
  }, 300);
}

function showWelcomeScreenAgain() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  welcomeScreen.style.display = 'flex';
  welcomeScreen.classList.remove('hidden');
}

async function completeLogin(userId, email, method) {
  appData.isFirstVisit = false;
  appData.isLoggedIn = true;
  appData.userId = userId;
  appData.userEmail = email;
  appData.loginMethod = method;
  
  // If Firebase is enabled, load user data from Firestore
  if (isFirebaseEnabled && userId) {
    await loadUserDataFromFirebase(userId);
  }
  
  hideWelcomeScreen();
  
  // Show a welcome notification
  addNotification('Welcome!', `You're now logged in. Start tracking your wellness journey!`);
  renderNotifications();
  
  // Refresh all views with loaded data
  renderDashboard();
}

// Setup event listeners
function setupEventListeners() {
  // Welcome screen login buttons
  document.getElementById('mobileLoginBtn').addEventListener('click', () => {
    openModal('mobileLoginModal');
  });
  
  document.getElementById('emailLoginBtn').addEventListener('click', () => {
    openModal('emailLoginModal');
  });
  
  document.getElementById('googleLoginBtn').addEventListener('click', () => {
    openModal('googleLoginModal');
  });

  // Mobile login flow
  const phoneInput = document.getElementById('phoneNumber');
  const sendOtpBtn = document.getElementById('sendOtpBtn');
  const otpInput = document.getElementById('otpInput');
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');
  const changeNumberBtn = document.getElementById('changeNumberBtn');

  phoneInput.addEventListener('input', (e) => {
    const value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
    // Enable button when we have 10-15 digits
    sendOtpBtn.disabled = !(value.length >= 10 && value.length <= 15);
  });

  sendOtpBtn.addEventListener('click', () => {
    const phoneNumber = phoneInput.value;
    if (phoneNumber.length >= 10 && phoneNumber.length <= 15) {
      // Show success message
      showToast(`OTP sent to ${phoneNumber}`, 'success');
      document.getElementById('phoneNumberGroup').style.display = 'none';
      document.getElementById('otpGroup').style.display = 'block';
      setTimeout(() => otpInput.focus(), 100);
    } else {
      showToast('Please enter a valid 10-15 digit phone number', 'error');
    }
  });

  changeNumberBtn.addEventListener('click', () => {
    document.getElementById('phoneNumberGroup').style.display = 'block';
    document.getElementById('otpGroup').style.display = 'none';
    otpInput.value = '';
  });

  otpInput.addEventListener('input', (e) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '');
    e.target.value = value.substring(0, 6);
    // Enable verify button when we have 6 digits
    verifyOtpBtn.disabled = value.length !== 6;
  });

  // Allow Enter key to verify OTP
  otpInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !verifyOtpBtn.disabled) {
      verifyOtpBtn.click();
    }
  });

  // Allow Enter key to send OTP
  phoneInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !sendOtpBtn.disabled) {
      sendOtpBtn.click();
    }
  });

  verifyOtpBtn.addEventListener('click', async () => {
    const otp = otpInput.value;
    if (otp.length === 6 && /^[0-9]{6}$/.test(otp)) {
      verifyOtpBtn.disabled = true;
      verifyOtpBtn.textContent = 'Verifying...';
      
      // Firebase Phone Authentication
      if (isFirebaseEnabled && window.confirmationResult) {
        try {
          const result = await window.confirmationResult.confirm(otp);
          const user = result.user;
          showToast('OTP verified successfully!', 'success');
          
          // Store login info
          appData.userInfo = phoneInput.value;
          
          // Reset modal
          phoneInput.value = '';
          otpInput.value = '';
          document.getElementById('phoneNumberGroup').style.display = 'block';
          document.getElementById('otpGroup').style.display = 'none';
          sendOtpBtn.disabled = true;
          verifyOtpBtn.disabled = false;
          verifyOtpBtn.textContent = 'Verify OTP';
          
          closeModal('mobileLoginModal');
          await completeLogin(user.uid, user.phoneNumber, 'phone');
        } catch (error) {
          console.error('OTP verification error:', error);
          showToast('Invalid OTP. Please try again.', 'error');
          verifyOtpBtn.disabled = false;
          verifyOtpBtn.textContent = 'Verify OTP';
        }
      } else {
        // Demo mode - accept any 6-digit OTP
        setTimeout(async () => {
          showToast('OTP verified successfully! (Demo mode)', 'success');
          appData.userInfo = phoneInput.value;
          
          phoneInput.value = '';
          otpInput.value = '';
          document.getElementById('phoneNumberGroup').style.display = 'block';
          document.getElementById('otpGroup').style.display = 'none';
          sendOtpBtn.disabled = true;
          verifyOtpBtn.disabled = false;
          verifyOtpBtn.textContent = 'Verify OTP';
          
          closeModal('mobileLoginModal');
          await completeLogin('demo_user_' + Date.now(), phoneInput.value, 'phone');
        }, 800);
      }
    } else {
      showToast('Please enter a valid 6-digit OTP', 'error');
    }
  });

  // Email login flow
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const emailLoginBtn2 = document.getElementById('emailLoginBtn2');
  const togglePassword = document.getElementById('togglePassword');

  function validateEmail(email) {
    // Check for basic email format: xxx@xxx.xxx
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  function checkEmailLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    // Enable button only if email is valid format and password is 6+ chars
    const isValid = validateEmail(email) && password.length >= 6;
    emailLoginBtn2.disabled = !isValid;
  }

  emailInput.addEventListener('input', checkEmailLogin);
  passwordInput.addEventListener('input', checkEmailLogin);

  // Allow Enter key to submit email login
  emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !emailLoginBtn2.disabled) {
      emailLoginBtn2.click();
    }
  });

  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !emailLoginBtn2.disabled) {
      emailLoginBtn2.click();
    }
  });

  togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword.textContent = type === 'password' ? '👁️' : '👁';
  });

  emailLoginBtn2.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!validateEmail(email)) {
      showToast('Please enter a valid email address (e.g., user@example.com)', 'error');
      return;
    }
    
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    
    emailLoginBtn2.disabled = true;
    emailLoginBtn2.textContent = 'Signing in...';
    
    // Firebase Email/Password Authentication
    if (isFirebaseEnabled) {
      try {
        // Try to sign in first
        let userCredential;
        try {
          userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        } catch (signInError) {
          // If user doesn't exist, create account
          if (signInError.code === 'auth/user-not-found') {
            userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
            alert('✅ Account created successfully!');
          } else {
            throw signInError;
          }
        }
        
        const user = userCredential.user;
        showToast('Welcome back!', 'success');
        
        // Reset modal
        emailInput.value = '';
        passwordInput.value = '';
        passwordInput.type = 'password';
        togglePassword.textContent = '👁️';
        emailLoginBtn2.disabled = false;
        emailLoginBtn2.textContent = 'Login';
        
        closeModal('emailLoginModal');
        await completeLogin(user.uid, user.email, 'email');
      } catch (error) {
        console.error('Email login error:', error);
        showToast('Login failed: ' + (error.message || 'Please check your credentials'), 'error');
        emailLoginBtn2.disabled = false;
        emailLoginBtn2.textContent = 'Login';
      }
    } else {
      // Demo mode
      setTimeout(async () => {
        showToast('Welcome back! (Demo mode)', 'success');
        
        // Reset modal
        emailInput.value = '';
        passwordInput.value = '';
        passwordInput.type = 'password';
        togglePassword.textContent = '👁️';
        emailLoginBtn2.disabled = false;
        emailLoginBtn2.textContent = 'Login';
        
        closeModal('emailLoginModal');
        await completeLogin('demo_user_' + Date.now(), email, 'email');
      }, 800);
    }
  });

  // Google login
  document.getElementById('continueGoogleBtn').addEventListener('click', async () => {
    const btn = document.getElementById('continueGoogleBtn');
    btn.disabled = true;
    btn.textContent = 'Signing in...';
    
    // Firebase Google OAuth
    if (isFirebaseEnabled) {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebaseAuth.signInWithPopup(provider);
        const user = result.user;
        
        showToast('Successfully signed in with Google!', 'success');
        
        // Reset button
        btn.disabled = false;
        btn.textContent = 'Continue with Google';
        
        closeModal('googleLoginModal');
        await completeLogin(user.uid, user.email, 'google');
      } catch (error) {
        console.error('Google sign-in error:', error);
        showToast('Google sign-in failed: ' + (error.message || 'Please try again'), 'error');
        btn.disabled = false;
        btn.textContent = 'Continue with Google';
      }
    } else {
      // Demo mode
      setTimeout(async () => {
        showToast('Successfully signed in with Google! (Demo mode)', 'success');
        
        // Reset button
        btn.disabled = false;
        btn.textContent = 'Continue with Google';
        
        closeModal('googleLoginModal');
        await completeLogin('demo_user_' + Date.now(), 'demo.user@gmail.com', 'google');
      }, 1000);
    }
  });

  // Quote refresh
  document.getElementById('refreshQuoteBtn').addEventListener('click', fetchDailyQuote);

  // Week navigation for mood chart
  document.getElementById('prevWeek')?.addEventListener('click', () => {
    appData.currentWeekOffset--;
    renderMoodAnalysisChart();
  });
  
  document.getElementById('nextWeek')?.addEventListener('click', () => {
    if (appData.currentWeekOffset < 0) {
      appData.currentWeekOffset++;
      renderMoodAnalysisChart();
    }
  });
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const view = e.currentTarget.dataset.view;
      switchView(view);
    });
  });

  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Notifications
  document.getElementById('notificationsBtn').addEventListener('click', toggleNotifications);
  document.getElementById('closeNotifications').addEventListener('click', toggleNotifications);

  // Add habit modal
  document.getElementById('addHabitBtn').addEventListener('click', () => openModal('addHabitModal'));
  document.getElementById('saveHabitBtn').addEventListener('click', saveNewHabit);

  // Modal close buttons
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.currentTarget.dataset.modal;
      closeModal(modalId);
    });
  });

  // Close modals when clicking outside
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Habit type change
  document.getElementById('habitType').addEventListener('change', (e) => {
    const targetGroup = document.getElementById('targetGroup');
    const targetInput = document.getElementById('habitTarget');
    
    if (e.target.value === 'binary') {
      targetInput.value = 1;
      targetGroup.style.display = 'none';
    } else {
      targetGroup.style.display = 'block';
      if (e.target.value === 'numeric') {
        targetInput.value = 8;
      } else if (e.target.value === 'duration') {
        targetInput.value = 30;
      }
    }
  });

  // Calendar navigation
  document.getElementById('prevMonth')?.addEventListener('click', () => changeMonth(-1));
  document.getElementById('nextMonth')?.addEventListener('click', () => changeMonth(1));

  // Social sharing
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const platform = e.currentTarget.dataset.platform;
      shareProgress(platform);
    });
  });

  // Settings buttons
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('exportDataBtn')?.addEventListener('click', exportData);
  document.getElementById('importDataBtn')?.addEventListener('click', () => alert('Import functionality: Select a JSON file to import your data'));
  document.getElementById('resetDataBtn')?.addEventListener('click', resetData);
  document.getElementById('addFriendBtn')?.addEventListener('click', () => alert('Add Friend: Enter friend\'s email or username'));
}

// Switch view
function switchView(viewName) {
  // Update navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.view === viewName) {
      item.classList.add('active');
    }
  });

  // Update views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  document.getElementById(`${viewName}-view`).classList.add('active');

  // Render view-specific content
  switch(viewName) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'habits':
      renderHabitsView();
      break;
    case 'calendar':
      renderCalendar();
      break;
    case 'analytics':
      renderAnalytics();
      break;
    case 'social':
      renderSocial();
      break;
    case 'settings':
      renderSettings();
      break;
  }
}

// Fetch daily quote from API
async function fetchDailyQuote() {
  const today = getDateKey(new Date());
  
  // Check if we already have today's quote
  if (appData.quoteDate === today && appData.dailyQuote) {
    displayQuote(appData.dailyQuote);
    return;
  }

  try {
    const response = await fetch('https://zenquotes.io/api/today');
    const data = await response.json();
    
    if (data && data[0]) {
      const quote = { q: data[0].q, a: data[0].a };
      appData.dailyQuote = quote;
      appData.quoteDate = today;
      displayQuote(quote);
    } else {
      displayFallbackQuote();
    }
  } catch (error) {
    console.error('Failed to fetch quote:', error);
    displayFallbackQuote();
  }
}

function displayQuote(quote) {
  document.getElementById('quoteText').textContent = `"${quote.q}"`;
  document.getElementById('quoteAuthor').textContent = `— ${quote.a}`;
}

function displayFallbackQuote() {
  const quote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  displayQuote(quote);
}

// Render Dashboard
function renderDashboard() {
  // Mood selector
  renderMoodSelector();

  // Today's habits
  renderTodayHabits();

  // Active streaks
  renderActiveStreaks();

  // Mood analysis chart
  renderMoodAnalysisChart();

  // Insights
  renderInsights();
}

// Render mood selector
function renderMoodSelector() {
  const container = document.getElementById('moodSelector');
  const today = getDateKey(new Date());
  const todayMood = appData.moodHistory.find(m => m.date === today);

  container.innerHTML = moodLevels.map(mood => `
    <button class="mood-btn ${todayMood && todayMood.value === mood.value ? 'selected' : ''}" 
            style="border-color: ${todayMood && todayMood.value === mood.value ? mood.color : 'var(--color-border)'};"
            onclick="selectMood(${mood.value})">
      <span class="mood-emoji">${mood.emoji}</span>
      <span class="mood-label">${mood.label}</span>
    </button>
  `).join('');
}

// Select mood
async function selectMood(value) {
  const today = getDateKey(new Date());
  const existingIndex = appData.moodHistory.findIndex(m => m.date === today);
  
  if (existingIndex >= 0) {
    appData.moodHistory[existingIndex].value = value;
  } else {
    appData.moodHistory.push({ date: today, value });
  }

  // Save to Firebase if enabled
  if (isFirebaseEnabled && appData.userId) {
    try {
      await firebaseDb.collection('users').doc(appData.userId).collection('moods').doc(today).set({
        date: today,
        value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving mood to Firebase:', error);
    }
  }

  renderMoodSelector();
  renderMoodAnalysisChart();
}

// Render mood analysis chart
function renderMoodAnalysisChart() {
  const ctx = document.getElementById('moodAnalysisChart');
  if (!ctx) return;

  // Destroy existing chart
  if (window.moodAnalysisChartInstance) {
    window.moodAnalysisChartInstance.destroy();
  }

  const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const data = [];
  const colors = [];
  const emojis = [];

  // Get dates for the week based on offset
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + mondayOffset + i + (appData.currentWeekOffset * 7));
    const dateKey = getDateKey(date);
    
    const mood = appData.moodHistory.find(m => m.date === dateKey);
    if (mood) {
      data.push(mood.value);
      const moodLevel = moodLevels.find(m => m.value === mood.value);
      colors.push(moodLevel.color);
      emojis.push(moodLevel.emoji);
    } else {
      data.push(null);
      colors.push('#E0E0E0');
      emojis.push('');
    }
  }

  window.moodAnalysisChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        borderColor: '#4CAF50',
        backgroundColor: 'transparent',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 8,
        pointHoverRadius: 10,
        pointBackgroundColor: colors,
        pointBorderColor: colors,
        pointBorderWidth: 3,
        segment: {
          borderColor: (ctx) => {
            if (ctx.p0.parsed.y !== null && ctx.p1.parsed.y !== null) {
              const idx = ctx.p0DataIndex;
              return colors[idx] || '#4CAF50';
            }
            return '#E0E0E0';
          }
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const idx = context.dataIndex;
              const emoji = emojis[idx];
              const moodLevel = moodLevels.find(m => m.value === context.parsed.y);
              return emoji + ' ' + (moodLevel ? moodLevel.name : '');
            }
          }
        }
      },
      scales: {
        y: {
          display: false,
          min: 0,
          max: 6
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

// Render insights
function renderInsights() {
  const container = document.getElementById('insightsGrid');
  
  const insightsHTML = insightsData.slice(0, 6).map(insight => {
    const arrow = insight.direction === 'up' ? '↑' : '↓';
    return `
      <div class="insight-card ${insight.color}">
        <div class="insight-metric">
          <span>${insight.metric}</span>
        </div>
        <div class="insight-change">
          <span class="insight-arrow">${arrow}</span>
          ${insight.change}%
        </div>
        <div class="insight-connector">with</div>
        <div class="insight-habit">
          <span class="insight-icon">${insight.icon}</span>
          <span>${insight.habit}</span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = insightsHTML;
}

// Render today's habits
function renderTodayHabits() {
  const container = document.getElementById('todayHabits');
  const today = getDateKey(new Date());
  
  let completedCount = 0;
  const totalCount = appData.habits.length;
  
  // Add staggered animation delay
  let animationDelay = 0;

  const habitsHTML = appData.habits.map((habit, index) => {
    const completion = getHabitCompletion(habit.id, today);
    const isCompleted = completion && completion.value >= habit.target;
    if (isCompleted) completedCount++;

    let actionHTML = '';
    if (habit.type === 'binary') {
      actionHTML = `
        <button class="check-btn ${isCompleted ? 'checked' : ''}" 
                onclick="toggleHabit(${index})">
          ${isCompleted ? '✓' : ''}
        </button>
      `;
    } else if (habit.type === 'numeric') {
      actionHTML = `
        <input type="number" class="habit-input" 
               value="${completion ? completion.value : 0}" 
               onchange="updateHabitValue(${index}, this.value)" 
               min="0" max="${habit.target * 2}">
        <span class="habit-meta">/ ${habit.target}</span>
      `;
    } else if (habit.type === 'duration') {
      actionHTML = `
        <input type="number" class="habit-input" 
               value="${completion ? completion.value : 0}" 
               onchange="updateHabitValue(${index}, this.value)" 
               min="0" max="${habit.target * 2}">
        <span class="habit-meta">/ ${habit.target} min</span>
      `;
    }

    animationDelay += 0.05;
    return `
      <div class="habit-item ${isCompleted ? 'completed' : ''}" style="animation-delay: ${animationDelay}s;">
        <span class="habit-icon">${habit.icon}</span>
        <div class="habit-info">
          <div class="habit-name">${habit.name}</div>
          <div class="habit-meta">${habit.category}</div>
        </div>
        <div class="habit-actions">
          ${actionHTML}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = habitsHTML || '<p class="text-secondary">No habits yet. Add your first habit!</p>';

  // Update progress
  document.getElementById('completedCount').textContent = completedCount;
  document.getElementById('totalCount').textContent = totalCount;
  
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  document.getElementById('progressPercent').textContent = `${percentage}%`;
  document.querySelector('#todayProgress .progress-fill').style.width = `${percentage}%`;
}

// Toggle binary habit
function toggleHabit(index) {
  const habit = appData.habits[index];
  const today = getDateKey(new Date());
  const completion = getHabitCompletion(habit.id, today);

  if (completion && completion.value >= habit.target) {
    // Uncomplete
    completion.value = 0;
  } else {
    // Complete
    setHabitCompletion(habit.id, today, habit.target);
    checkStreakReward(habit);
  }

  renderTodayHabits();
  renderActiveStreaks();
}

// Update habit value
function updateHabitValue(index, value) {
  const habit = appData.habits[index];
  const today = getDateKey(new Date());
  const numValue = parseInt(value) || 0;
  
  setHabitCompletion(habit.id, today, numValue);
  
  if (numValue >= habit.target) {
    checkStreakReward(habit);
  }

  renderTodayHabits();
  renderActiveStreaks();
}

// Check for streak rewards
function checkStreakReward(habit) {
  const streak = calculateStreak(habit.id);
  const reward = streakRewards.find(r => r.days === streak);
  
  if (reward) {
    showAchievement(reward.title, reward.message);
  }
}

// Show achievement modal
function showAchievement(title, message) {
  document.getElementById('achievementTitle').textContent = title;
  document.getElementById('achievementMessage').textContent = message;
  openModal('achievementModal');
}

// Render active streaks
function renderActiveStreaks() {
  const container = document.getElementById('activeStreaks');
  
  const streaksHTML = appData.habits.slice(0, 4).map(habit => {
    const streak = calculateStreak(habit.id);
    return `
      <div class="streak-card">
        <div class="habit-icon">${habit.icon}</div>
        <div class="streak-count">${streak}</div>
        <div class="streak-label">${habit.name}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = streaksHTML || '<p class="text-secondary">Complete habits to build streaks!</p>';
}

// Render Habits View
function renderHabitsView() {
  const container = document.getElementById('habitsByCategory');
  
  const categoriesHTML = habitCategories.map(category => {
    const categoryHabits = appData.habits.filter(h => h.category === category);
    
    if (categoryHabits.length === 0) return '';

    const habitsHTML = categoryHabits.map((habit, index) => {
      const globalIndex = appData.habits.indexOf(habit);
      const streak = calculateStreak(habit.id);
      const completion = calculateCompletionRate(habit.id, 7);

      return `
        <div class="habit-item">
          <span class="habit-icon">${habit.icon}</span>
          <div class="habit-info">
            <div class="habit-name">${habit.name}</div>
            <div class="habit-meta">
              🔥 ${streak} day streak • ${completion}% this week
            </div>
          </div>
          <button class="btn btn--outline" onclick="deleteHabit(${globalIndex})" style="padding: 8px 12px;">
            🗑️
          </button>
        </div>
      `;
    }).join('');

    return `
      <div class="category-section">
        <div class="category-header">
          <h3 class="category-title">${category}</h3>
        </div>
        <div class="habits-list">
          ${habitsHTML}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = categoriesHTML || '<p class="text-secondary">No habits yet. Add your first habit!</p>';
}

// Delete habit
function deleteHabit(index) {
  if (confirm('Are you sure you want to delete this habit?')) {
    const habitName = appData.habits[index].name;
    appData.habits.splice(index, 1);
    showToast(`"${habitName}" deleted`, 'info');
    renderHabitsView();
  }
}

// Render Calendar
function renderCalendar() {
  const calendarGrid = document.getElementById('calendarGrid');
  const calendarMonth = document.getElementById('calendarMonth');
  
  const year = appData.currentDate.getFullYear();
  const month = appData.currentDate.getMonth();
  
  calendarMonth.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let calendarHTML = dayNames.map(day => `
    <div class="calendar-day" style="font-weight: bold; border: none; cursor: default;">
      ${day}
    </div>
  `).join('');
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    calendarHTML += '<div class="calendar-day" style="visibility: hidden;"></div>';
  }
  
  // Days of month
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = getDateKey(date);
    const isToday = date.toDateString() === today.toDateString();
    
    let completedCount = 0;
    const totalCount = appData.habits.length;
    
    appData.habits.forEach(habit => {
      const completion = getHabitCompletion(habit.id, dateKey);
      if (completion && completion.value >= habit.target) {
        completedCount++;
      }
    });
    
    let className = 'calendar-day';
    if (isToday) className += ' today';
    if (completedCount === totalCount && totalCount > 0) className += ' completed';
    else if (completedCount > 0) className += ' partial';
    
    const indicator = completedCount > 0 ? `<div class="day-indicator">${completedCount}/${totalCount}</div>` : '';
    
    calendarHTML += `
      <div class="${className}" onclick="showDayDetails('${dateKey}')">
        <div class="day-number">${day}</div>
        ${indicator}
      </div>
    `;
  }
  
  calendarGrid.innerHTML = calendarHTML;
}

// Show day details
function showDayDetails(dateKey) {
  const dayDetails = document.getElementById('dayDetails');
  const dayDetailsContent = document.getElementById('dayDetailsContent');
  
  const detailsHTML = appData.habits.map(habit => {
    const completion = getHabitCompletion(habit.id, dateKey);
    const value = completion ? completion.value : 0;
    const isCompleted = value >= habit.target;
    
    return `
      <div class="habit-item ${isCompleted ? 'completed' : ''}">
        <span class="habit-icon">${habit.icon}</span>
        <div class="habit-info">
          <div class="habit-name">${habit.name}</div>
          <div class="habit-meta">
            ${habit.type === 'binary' ? (isCompleted ? 'Completed' : 'Not completed') : `${value} / ${habit.target}`}
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  dayDetailsContent.innerHTML = `
    <h4 style="margin-bottom: 16px;">${new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
    ${detailsHTML}
  `;
  
  dayDetails.style.display = 'block';
}

// Change month
function changeMonth(delta) {
  appData.currentDate.setMonth(appData.currentDate.getMonth() + delta);
  renderCalendar();
}

// Render Analytics
function renderAnalytics() {
  // Calculate stats
  const longestStreak = Math.max(...appData.habits.map(h => calculateStreak(h.id)), 0);
  const totalCompleted = Object.values(appData.habitCompletions).reduce((sum, dates) => sum + Object.keys(dates).length, 0);
  const avgCompletion = calculateAverageCompletion();
  const avgMood = calculateAverageMood();
  
  document.getElementById('longestStreak').textContent = longestStreak;
  document.getElementById('totalCompleted').textContent = totalCompleted;
  document.getElementById('avgCompletion').textContent = `${avgCompletion}%`;
  document.getElementById('avgMood').textContent = avgMood;
  
  // Render charts
  renderWeeklyChart();
  renderHabitPerformanceChart();
  renderMoodChart();
}

// Render weekly chart
function renderWeeklyChart() {
  const ctx = document.getElementById('weeklyChart');
  if (!ctx) return;
  
  // Destroy existing chart
  if (window.weeklyChartInstance) {
    window.weeklyChartInstance.destroy();
  }
  
  const labels = [];
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    
    const dateKey = getDateKey(date);
    let completed = 0;
    const total = appData.habits.length;
    
    appData.habits.forEach(habit => {
      const completion = getHabitCompletion(habit.id, dateKey);
      if (completion && completion.value >= habit.target) {
        completed++;
      }
    });
    
    data.push(total > 0 ? Math.round((completed / total) * 100) : 0);
  }
  
  window.weeklyChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Completion %',
        data: data,
        borderColor: '#21808D',
        backgroundColor: 'rgba(33, 128, 141, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

// Render habit performance chart
function renderHabitPerformanceChart() {
  const ctx = document.getElementById('habitPerformanceChart');
  if (!ctx) return;
  
  if (window.habitPerformanceChartInstance) {
    window.habitPerformanceChartInstance.destroy();
  }
  
  const labels = appData.habits.slice(0, 6).map(h => h.name);
  const data = appData.habits.slice(0, 6).map(h => calculateCompletionRate(h.id, 30));
  
  window.habitPerformanceChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Completion Rate (%)',
        data: data,
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

// Render mood chart
function renderMoodChart() {
  const ctx = document.getElementById('moodChart');
  if (!ctx) return;
  
  if (window.moodChartInstance) {
    window.moodChartInstance.destroy();
  }
  
  const labels = [];
  const data = [];
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    const dateKey = getDateKey(date);
    const mood = appData.moodHistory.find(m => m.date === dateKey);
    data.push(mood ? mood.value : null);
  }
  
  window.moodChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Mood Level',
        data: data,
        borderColor: '#21808D',
        backgroundColor: 'rgba(33, 128, 141, 0.1)',
        tension: 0.4,
        fill: true,
        spanGaps: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// Render Social
function renderSocial() {
  // Render leaderboard
  const leaderboard = document.getElementById('leaderboard');
  const sortedFriends = [...appData.friends].sort((a, b) => b.score - a.score);
  
  leaderboard.innerHTML = sortedFriends.map((friend, index) => `
    <div class="leaderboard-item">
      <div class="rank">#${index + 1}</div>
      <div class="user-info">
        <div class="user-name">${friend.name}</div>
        <div class="habit-meta">🔥 ${friend.streak} day streak</div>
      </div>
      <div class="user-score">${friend.score}</div>
    </div>
  `).join('');
  
  // Render friends list
  const friendsList = document.getElementById('friendsList');
  friendsList.innerHTML = appData.friends.filter(f => f.name !== 'You').map(friend => `
    <div class="friend-item">
      <div class="user-info">
        <div class="user-name">${friend.name}</div>
        <div class="habit-meta">Score: ${friend.score} • Streak: ${friend.streak}</div>
      </div>
      <button class="btn btn--secondary" onclick="cheerFriend('${friend.name}')" style="padding: 8px 16px;">
        👏 Cheer
      </button>
    </div>
  `).join('');
}

// Cheer friend with animation
function cheerFriend(name) {
  // Create claps container if it doesn't exist
  let container = document.querySelector('.claps-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'claps-container';
    document.body.appendChild(container);
  }

  // Disable all cheer buttons
  const cheerButtons = document.querySelectorAll('[onclick*="cheerFriend"]');
  cheerButtons.forEach(btn => btn.disabled = true);

  // Create 10 clap emojis with random positions
  const numberOfClaps = 10;
  for (let i = 0; i < numberOfClaps; i++) {
    const clap = document.createElement('div');
    clap.className = 'clap-emoji';
    clap.textContent = '👏';
    
    // Random horizontal spread
    const randomX = (Math.random() - 0.5) * 200;
    clap.style.setProperty('--clap-x', `${randomX}px`);
    
    // Stagger the animations
    clap.style.animationDelay = `${i * 0.15}s`;
    
    container.appendChild(clap);
  }

  // Show notification
  setTimeout(() => {
    addNotification('Cheers sent! 👏', `You cheered for ${name}!`);
    renderNotifications();
  }, 500);

  // Clean up after animation completes and re-enable buttons
  setTimeout(() => {
    container.innerHTML = '';
    cheerButtons.forEach(btn => btn.disabled = false);
  }, 2500);
}

// Share progress
function shareProgress(platform) {
  const completionRate = calculateAverageCompletion();
  const longestStreak = Math.max(...appData.habits.map(h => calculateStreak(h.id)), 0);
  const message = `I'm building better habits with Élan! 🌟 ${completionRate}% completion rate and ${longestStreak} day streak! #ElanWellness #Habits`;
  
  if (platform === 'copy') {
    showToast('Progress summary copied to clipboard!', 'success');
  } else {
    showToast(`Shared to ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`, 'success');
  }
}

// Render Settings
function renderSettings() {
  // AI Suggestions
  const suggestionsContainer = document.getElementById('aiSuggestions');
  suggestionsContainer.innerHTML = aiSuggestions.map(suggestion => `
    <div class="suggestion-item">
      <span class="suggestion-icon">💡</span>
      <span class="suggestion-text">${suggestion}</span>
    </div>
  `).join('');
  
  // Achievements
  renderAchievements();
}

// Render achievements
function renderAchievements() {
  const container = document.getElementById('achievementsGrid');
  
  const maxStreak = Math.max(...appData.habits.map(h => calculateStreak(h.id)), 0);
  
  const achievementsHTML = streakRewards.map(reward => {
    const unlocked = maxStreak >= reward.days;
    return `
      <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-badge">${unlocked ? '🏆' : '🔒'}</div>
        <div class="achievement-title">${reward.title}</div>
        <div class="achievement-desc">${reward.days} days</div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = achievementsHTML;
}

// Modal functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Save new habit
function saveNewHabit() {
  const name = document.getElementById('habitName').value.trim();
  const category = document.getElementById('habitCategory').value;
  const icon = document.getElementById('habitIcon').value.trim() || '🎯';
  const type = document.getElementById('habitType').value;
  const target = parseInt(document.getElementById('habitTarget').value) || 1;
  
  if (!name) {
    showToast('Please enter a habit name', 'error');
    return;
  }
  
  showToast('Habit added successfully!', 'success');
  
  addHabit(name, category, icon, type, target);
  
  // Reset form
  document.getElementById('habitName').value = '';
  document.getElementById('habitIcon').value = '';
  document.getElementById('habitTarget').value = '1';
  
  closeModal('addHabitModal');
  
  // Refresh views
  renderDashboard();
  renderHabitsView();
}

// Add habit
async function addHabit(name, category, icon, type, target) {
  const habit = {
    id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    category,
    icon,
    type,
    target,
    createdAt: new Date().toISOString()
  };
  
  appData.habits.push(habit);
  
  // Save to Firebase if enabled
  if (isFirebaseEnabled && appData.userId) {
    try {
      await firebaseDb.collection('users').doc(appData.userId).collection('habits').doc(habit.id).set(habit);
      console.log('Habit saved to Firebase');
    } catch (error) {
      console.error('Error saving habit to Firebase:', error);
    }
  }
}

// Helper functions
function getDateKey(date) {
  return date.toISOString().split('T')[0];
}

function getHabitCompletion(habitId, dateKey) {
  if (!appData.habitCompletions[habitId]) return null;
  return appData.habitCompletions[habitId][dateKey] || null;
}

async function setHabitCompletion(habitId, dateKey, value) {
  if (!appData.habitCompletions[habitId]) {
    appData.habitCompletions[habitId] = {};
  }
  appData.habitCompletions[habitId][dateKey] = { value, timestamp: new Date().toISOString() };
  
  // Save to Firebase if enabled
  if (isFirebaseEnabled && appData.userId) {
    try {
      await firebaseDb.collection('users').doc(appData.userId).collection('completions').doc(`${habitId}_${dateKey}`).set({
        habitId,
        date: dateKey,
        value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving completion to Firebase:', error);
    }
  }
}

function calculateStreak(habitId) {
  const habit = appData.habits.find(h => h.id === habitId);
  if (!habit) return 0;
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = getDateKey(date);
    
    const completion = getHabitCompletion(habitId, dateKey);
    if (completion && completion.value >= habit.target) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateCompletionRate(habitId, days) {
  const habit = appData.habits.find(h => h.id === habitId);
  if (!habit) return 0;
  
  let completed = 0;
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = getDateKey(date);
    
    const completion = getHabitCompletion(habitId, dateKey);
    if (completion && completion.value >= habit.target) {
      completed++;
    }
  }
  
  return Math.round((completed / days) * 100);
}

function calculateAverageCompletion() {
  if (appData.habits.length === 0) return 0;
  
  const rates = appData.habits.map(h => calculateCompletionRate(h.id, 7));
  const avg = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  
  return Math.round(avg);
}

function calculateAverageMood() {
  if (appData.moodHistory.length === 0) return '-';
  
  const recentMoods = appData.moodHistory.slice(-7);
  const avg = recentMoods.reduce((sum, m) => sum + m.value, 0) / recentMoods.length;
  
  const moodLevel = moodLevels.find(m => m.value === Math.round(avg));
  return moodLevel ? moodLevel.emoji : '😐';
}

// Add some sample mood data for demonstration
function addSampleMoodData() {
  const sampleMoods = [3, 4, 2, 3, 4, null, null];
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

  // Only add historical data, NOT today's mood
  for (let i = 0; i < 6; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + mondayOffset + i);
    const dateKey = getDateKey(date);
    const todayKey = getDateKey(new Date());
    
    // Skip today - user must select their own mood
    if (dateKey !== todayKey && sampleMoods[i] && !appData.moodHistory.find(m => m.date === dateKey)) {
      appData.moodHistory.push({ date: dateKey, value: sampleMoods[i] });
    }
  }
}

// Theme functions
function toggleTheme() {
  appData.theme = appData.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-color-scheme', appData.theme);
  
  const themeIcon = document.querySelector('.theme-icon');
  themeIcon.textContent = appData.theme === 'light' ? '🌙' : '☀️';
}

function loadTheme() {
  document.documentElement.setAttribute('data-color-scheme', appData.theme);
  const themeIcon = document.querySelector('.theme-icon');
  themeIcon.textContent = appData.theme === 'light' ? '🌙' : '☀️';
}

// Notifications
function toggleNotifications() {
  const panel = document.getElementById('notificationPanel');
  panel.classList.toggle('active');
}

function addNotification(title, text) {
  appData.notifications.unshift({ title, text });
  // Keep only last 10 notifications
  if (appData.notifications.length > 10) {
    appData.notifications = appData.notifications.slice(0, 10);
  }
  // Update badge
  const badge = document.getElementById('notifBadge');
  if (badge) {
    badge.textContent = appData.notifications.length;
  }
}

// Logout function
async function logout() {
  if (confirm('Are you sure you want to logout?')) {
    // Sign out from Firebase if enabled
    if (isFirebaseEnabled) {
      try {
        await firebaseAuth.signOut();
        console.log('Signed out from Firebase');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
    
    appData.isLoggedIn = false;
    appData.isFirstVisit = true;
    appData.loginMethod = null;
    appData.userInfo = null;
    appData.userId = null;
    showWelcomeScreenAgain();
    // Switch to dashboard view
    switchView('dashboard');
  }
}

function renderNotifications() {
  const container = document.getElementById('notificationList');
  container.innerHTML = appData.notifications.map(notif => `
    <div class="notification-item">
      <div class="notification-title">${notif.title}</div>
      <div class="notification-text">${notif.text}</div>
    </div>
  `).join('');
}

// Data management
function exportData() {
  const data = JSON.stringify(appData, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `elan-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported successfully!', 'success');
}

function resetData() {
  if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
    appData.habits = [];
    appData.habitCompletions = {};
    appData.moodHistory = [];
    showToast('All data has been reset.', 'info');
    setTimeout(() => location.reload(), 1000);
  }
}

// Update current date
function updateCurrentDate() {
  const dateElement = document.getElementById('currentDate');
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateElement.textContent = new Date().toLocaleDateString('en-US', options);
}

/* ============================================
   FIREBASE HELPER FUNCTIONS
   ============================================ */

// Load user data from Firebase Firestore
async function loadUserDataFromFirebase(userId) {
  if (!isFirebaseEnabled) return;
  
  try {
    console.log('Loading user data from Firebase...');
    
    // Load habits
    const habitsSnapshot = await firebaseDb.collection('users').doc(userId).collection('habits').get();
    if (!habitsSnapshot.empty) {
      appData.habits = habitsSnapshot.docs.map(doc => doc.data());
      console.log(`Loaded ${appData.habits.length} habits from Firebase`);
    }
    
    // Load completions
    const completionsSnapshot = await firebaseDb.collection('users').doc(userId).collection('completions').get();
    if (!completionsSnapshot.empty) {
      completionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!appData.habitCompletions[data.habitId]) {
          appData.habitCompletions[data.habitId] = {};
        }
        appData.habitCompletions[data.habitId][data.date] = {
          value: data.value,
          timestamp: data.timestamp
        };
      });
      console.log('Loaded habit completions from Firebase');
    }
    
    // Load moods
    const moodsSnapshot = await firebaseDb.collection('users').doc(userId).collection('moods').get();
    if (!moodsSnapshot.empty) {
      appData.moodHistory = moodsSnapshot.docs.map(doc => doc.data());
      console.log(`Loaded ${appData.moodHistory.length} mood entries from Firebase`);
    }
    
    console.log('✅ User data loaded from Firebase successfully');
  } catch (error) {
    console.error('Error loading user data from Firebase:', error);
  }
}

// Listen to Firebase auth state changes
if (isFirebaseEnabled) {
  firebaseAuth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log('User signed in:', user.email || user.phoneNumber);
      // User is signed in - this will be handled by completeLogin
    } else {
      console.log('User signed out');
    }
  });
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addSampleMoodData();
    initApp();
  });
} else {
  addSampleMoodData();
  initApp();
}