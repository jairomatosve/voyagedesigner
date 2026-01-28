# 📱 TravelOrchestrator - Mobile App en Replit (Expo/React Native)

## 🎯 ¿QUÉ VAMOS A CREAR?

Una **app móvil nativa** (iOS + Android) a partir del código React que ya tienes. Usaremos **Expo + React Native** en Replit.

---

## ⚡ OPCIÓN RECOMENDADA: Expo en Replit

**Expo** es la forma más rápida de convertir React a mobile. Puedes:
- Testear en tu teléfono en tiempo real
- No necesitas Xcode o Android Studio
- Mismo código React (casi)
- Deploy a App Store + Google Play desde Expo

---

## 📋 PASO 1: CREAR PROYECTO EXPO EN REPLIT (3 min)

### 1.1 En Replit
1. Ve a https://replit.com
2. Click "+ Create"
3. Busca **"Expo"**
4. Click en template **"Expo"**
5. Nombre: `travelorchestrator-mobile`
6. Click "Create Repl"

### 1.2 Esperar
- Replit crea proyecto automático
- Ve el árbol de archivos a la izquierda
- ✅ Listo

---

## 📁 PASO 2: ESTRUCTURA DEL PROYECTO (2 min)

Expo crea esto automáticamente:
```
travelorchestrator-mobile/
├─ app.json (configuración)
├─ App.js (entrada principal)
├─ app/
│  ├─ (tabs)/ (carpeta con tabs)
│  ├─ index.jsx
│  └─ ...
├─ assets/
├─ package.json
└─ ...
```

**NO necesitas cambiar estructura.** Expo ya está optimizado.

---

## 🔧 PASO 3: INSTALAR DEPENDENCIAS (5 min)

### 3.1 Terminal Replit
1. Click en "Console" (abajo)
2. Escribe:
```bash
npm install axios zustand expo-secure-store @supabase/supabase-js i18next react-i18next
```

Espera a que termine.

### 3.2 Qué instalamos:
- **axios** - HTTP requests (igual que web)
- **zustand** - State management (igual que web)
- **expo-secure-store** - Guardar tokens de forma segura (mobile)
- **@supabase/supabase-js** - Conexión a Supabase
- **i18next** - Multilingüe

---

## 📝 PASO 4: CREAR CARPETAS Y SERVICIOS (10 min)

### 4.1 Crear Carpetas
En Replit, lado izquierdo, haz click derecho en la carpeta `app/` → "New Folder":

```
app/
├─ (tabs)/ (ya existe)
├─ services/ (NUEVA)
├─ store/ (NUEVA)
├─ locales/ (NUEVA)
│  ├─ en/
│  ├─ es/
│  ├─ pt/
│  └─ fr/
├─ i18n/ (NUEVA)
└─ screens/ (NUEVA)
```

### 4.2 Crear Archivos en `services/`
Haz click derecho en `app/services/` → "New File":
- `api.js` (conexión backend)
- `supabaseService.js` (Supabase)
- `authService.js` (autenticación)

---

## 🔑 PASO 5: CÓDIGO DE SERVICIOS (20 min)

### 5.1 app/services/api.js
```javascript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://tu-backend-replit.replit.dev/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor para agregar token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (name, email, password) =>
    api.post('/auth/signup', { name, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
};

export const tripsAPI = {
  getTrips: () => api.get('/trips'),
  createTrip: (data) => api.post('/trips', data),
  getTrip: (id) => api.get(`/trips/${id}`),
  updateTrip: (id, data) => api.put(`/trips/${id}`, data),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
};

export const itineraryAPI = {
  generateItinerary: (tripId, preferences) =>
    api.post(`/itineraries/generate`, { tripId, preferences }),
  getItinerary: (tripId) => api.get(`/itineraries/${tripId}`),
  updateActivity: (activityId, data) =>
    api.put(`/activities/${activityId}`, data),
};

export const aiAPI = {
  reoptimize: (tripId, failedActivityId) =>
    api.post('/ai/reoptimize', { tripId, failedActivityId }),
};

export default api;
```

**⚠️ IMPORTANTE:** Reemplaza `tu-backend-replit.replit.dev` con tu URL real del backend.

### 5.2 app/services/supabaseService.js
```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tu-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = 'tu_anon_key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const subscribeToTrips = (userId, callback) => {
  const subscription = supabase
    .from('trips')
    .on('*', (payload) => {
      callback(payload);
    })
    .subscribe();

  return subscription;
};

export default supabase;
```

**⚠️ IMPORTANTE:** Reemplaza con tus credenciales de Supabase.

### 5.3 app/services/authService.js
```javascript
import * as SecureStore from 'expo-secure-store';
import { authAPI } from './api';

export const saveToken = async (token) => {
  await SecureStore.setItemAsync('auth_token', token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync('auth_token');
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync('auth_token');
};

export const signup = async (name, email, password) => {
  try {
    const { data } = await authAPI.signup(name, email, password);
    if (data.token) {
      await saveToken(data.token);
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const { data } = await authAPI.login(email, password);
    if (data.token) {
      await saveToken(data.token);
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  await removeToken();
};
```

---

## 🎣 PASO 6: STATE MANAGEMENT (Zustand) (5 min)

### 6.1 app/store/appStore.js
```javascript
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export const useAppStore = create((set) => ({
  user: null,
  trips: [],
  currentTrip: null,
  language: 'es',
  loading: false,

  // Auth
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),

  // Trips
  setTrips: (trips) => set({ trips }),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  addTrip: (trip) => set((state) => ({
    trips: [...state.trips, trip],
  })),

  // Language
  setLanguage: async (lang) => {
    set({ language: lang });
    await SecureStore.setItemAsync('preferred_language', lang);
  },

  // Loading
  setLoading: (loading) => set({ loading }),

  // Initialize
  initialize: async () => {
    const lang = await SecureStore.getItemAsync('preferred_language');
    if (lang) {
      set({ language: lang });
    }
  },
}));
```

---

## 🌍 PASO 7: MULTILINGÜE i18n (10 min)

### 7.1 app/i18n/config.js
```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useAppStore } from '../store/appStore';

import enAuth from '../locales/en/auth.json';
import enTrips from '../locales/en/trips.json';
import esAuth from '../locales/es/auth.json';
import esTrips from '../locales/es/trips.json';
import ptAuth from '../locales/pt/auth.json';
import ptTrips from '../locales/pt/trips.json';
import frAuth from '../locales/fr/auth.json';
import frTrips from '../locales/fr/trips.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      auth: enAuth,
      trips: enTrips,
    },
    es: {
      auth: esAuth,
      trips: esTrips,
    },
    pt: {
      auth: ptAuth,
      trips: ptTrips,
    },
    fr: {
      auth: frAuth,
      trips: frTrips,
    },
  },
  lng: 'es',
  fallbackLng: 'en',
  defaultNS: 'auth',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

### 7.2 Copiar JSONs de Traducciones
De la documentación anterior (**I18N_MULTILINGUAL.md**), copia estos archivos a `app/locales/`:

```
app/locales/
├─ en/
│  ├─ auth.json
│  ├─ trips.json
│  └─ common.json
├─ es/
│  └─ (igual estructura)
├─ pt/
│  └─ (igual estructura)
└─ fr/
   └─ (igual estructura)
```

---

## 🎨 PASO 8: SCREENS (PANTALLAS) (30 min)

### 8.1 app/screens/LoginScreen.jsx
```javascript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { login } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation('auth');
  const setUser = useAppStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('fill_all_fields'));
      return;
    }
    
    try {
      setLoading(true);
      const user = await login(email, password);
      setUser(user);
      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert(t('error'), error.response?.data?.message || t('login_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('login')}</Text>
      
      <TextInput
        style={styles.input}
        placeholder={t('email')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder={t('password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? t('loading') : t('login')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>{t('no_account')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2080f8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: '#2080f8',
    textAlign: 'center',
    marginTop: 15,
  },
});
```

### 8.2 app/screens/DashboardScreen.jsx
```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { tripsAPI } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const { t } = useTranslation('trips');
  const trips = useAppStore((state) => state.trips);
  const setTrips = useAppStore((state) => state.setTrips);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const { data } = await tripsAPI.getTrips();
      setTrips(data);
    } catch (error) {
      Alert.alert('Error', t('load_failed'));
    } finally {
      setLoading(false);
    }
  };

  const renderTrip = ({ item }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => {
        useAppStore.setState({ currentTrip: item });
        navigation.navigate('TripDetail', { tripId: item.id });
      }}
    >
      <Text style={styles.tripTitle}>{item.title}</Text>
      <Text style={styles.tripDestination}>{item.destination}</Text>
      <Text style={styles.tripDate}>
        {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('my_trips')}</Text>
      
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTrip}
        onRefresh={loadTrips}
        refreshing={loading}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTrip')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    paddingTop: 40,
  },
  tripCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tripDestination: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  tripDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2080f8',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: {
    fontSize: 30,
    color: '#fff',
  },
});
```

### 8.3 app/screens/CreateTripScreen.jsx
```javascript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { tripsAPI } from '../services/api';

export default function CreateTripScreen({ navigation }) {
  const { t } = useTranslation('trips');
  const addTrip = useAppStore((state) => state.addTrip);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !destination || !budget) {
      Alert.alert('Error', t('fill_all_fields'));
      return;
    }

    try {
      setLoading(true);
      const { data } = await tripsAPI.createTrip({
        title,
        destination,
        budget: parseFloat(budget),
        start_date: startDate,
        end_date: endDate,
      });
      addTrip(data);
      Alert.alert('Success', t('trip_created'));
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', t('creation_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('create_trip')}</Text>

      <TextInput
        style={styles.input}
        placeholder={t('title')}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder={t('destination')}
        value={destination}
        onChangeText={setDestination}
      />

      <TextInput
        style={styles.input}
        placeholder={t('budget')}
        value={budget}
        onChangeText={setBudget}
        keyboardType="decimal-pad"
      />

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowStartPicker(true)}
      >
        <Text>{t('start_date')}: {startDate.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowEndPicker(true)}
      >
        <Text>{t('end_date')}: {endDate.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? t('creating') : t('create')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2080f8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

---

## 📱 PASO 9: ACTUALIZAR App.js (Navigation) (10 min)

### 9.1 Reemplazar App.js Completo
En la raíz, abre `App.js` y reemplaza TODO con:

```javascript
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from './app/store/appStore';
import './app/i18n/config';

// Import Screens
import LoginScreen from './app/screens/LoginScreen';
import DashboardScreen from './app/screens/DashboardScreen';
import CreateTripScreen from './app/screens/CreateTripScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const user = useAppStore((state) => state.user);
  const initialize = useAppStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: 'My Trips' }}
            />
            <Stack.Screen
              name="CreateTrip"
              component={CreateTripScreen}
              options={{ title: 'Create Trip' }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 9.2 Instalar React Navigation
En terminal Replit:
```bash
npm install @react-navigation/native @react-navigation/stack react-native-screens react-native-safe-area-context
```

---

## 🚀 PASO 10: EJECUTAR EN REPLIT (2 min)

### 10.1 Terminal
1. Console en Replit (abajo)
2. Escribe:
```bash
npm start
```

### 10.2 Escanear QR
- Aparece un QR en la terminal
- Abre **Expo Go** en tu teléfono (App Store o Google Play)
- Escanea el QR
- ✅ App corre en tu teléfono

---

## 📊 PASO 11: VALIDACIÓN (5 min)

### 11.1 Test en tu Teléfono
1. ✅ Login funciona
2. ✅ Dashboard carga trips
3. ✅ Crear trip funciona
4. ✅ Cambiar idioma funciona

### 11.2 Si Hay Errores
- Revisa console en Replit (abajo)
- Busca el error rojo
- Generalmente es falta de módulo o typo

---

## 📦 PASO 12: BUILD PARA PRODUCCIÓN (Fase 2)

Cuando estés listo para publicar en App Store + Google Play:

### 12.1 Usar EAS Build (Expo)
```bash
npm install -g eas-cli
eas build --platform all
```

### 12.2 Push a App Store
- EAS maneja automático
- No necesitas Xcode/Android Studio
- ~$99/año certificado Apple

---

## ✅ ESTRUCTURA FINAL MOBILE

```
travelorchestrator-mobile/
├─ app/
│  ├─ screens/
│  │  ├─ LoginScreen.jsx ✅
│  │  ├─ DashboardScreen.jsx ✅
│  │  ├─ CreateTripScreen.jsx ✅
│  │  └─ TripDetailScreen.jsx (próximo)
│  ├─ services/
│  │  ├─ api.js ✅
│  │  ├─ authService.js ✅
│  │  └─ supabaseService.js ✅
│  ├─ store/
│  │  └─ appStore.js ✅
│  ├─ locales/ (16 JSON) ✅
│  └─ i18n/
│     └─ config.js ✅
├─ App.js ✅
├─ app.json (configuración)
├─ package.json ✅
└─ eas.json (para deploy)
```

---

## 🎯 DIFERENCIAS WEB vs MOBILE

| Aspecto | Web | Mobile |
|---------|-----|--------|
| **Componentes** | HTML/CSS | React Native |
| **Storage** | localStorage | expo-secure-store |
| **Navigation** | react-router | react-navigation |
| **Styling** | TailwindCSS | StyleSheet |
| **HTTP** | axios | axios (igual) |
| **State** | zustand | zustand (igual) |
| **i18n** | i18next | i18next (igual) |

**Lógica es la misma. Solo UI diferente.**

---

## 💡 TIPS MOBILE

1. **Expo Go** es para development. Escanea QR en tu teléfono.
2. **Hot Reload** funciona. Cambia código y actualiza automático.
3. **Debugging** con expo CLI en terminal.
4. **iOS requiere Mac** para build final (pero Expo lo soluciona).
5. **Testing on device** es más realista que emulador.

---

## 🆘 TROUBLESHOOTING MOBILE

### "QR no funciona"
- Asegurate Replit tenga internet
- Teléfono debe estar en mismo WiFi (o usar tunnel)
- Reinstala Expo Go

### "axios no conecta a backend"
- URL del backend debe ser pública (no localhost)
- Chequea en api.js la URL correcta
- Backend debe estar corriendo

### "Errores de módulos"
- Borra node_modules: `rm -rf node_modules`
- Reinstala: `npm install`
- Limpia cache: `npm start -- --clear`

### "Supabase errors"
- Verifica keys en environment
- Chequea que proyecto Supabase está activo
- Si cambias .env, reinicia con `npm start`

---

## 🎬 PRÓXIMA SESIÓN

1. **Copiar código exacto** a Replit
2. **npm install**
3. **Actualizar URLs** (backend + Supabase)
4. **npm start**
5. **Escanear QR**
6. **Test en teléfono**
7. **Agregar screens faltantes**

---

## 📱 FULL STACK AHORA

```
✅ BACKEND    (Replit Node.js)
✅ WEB        (Replit React + Vite)
✅ MOBILE     (Replit Expo/React Native)
    ↓
MISMO código, 3 plataformas
```

---

**¿Tienes preguntas antes de copiar el código?**

Si todo está claro, **pasamos al siguiente paso: copiar código a Replit mobile.**

