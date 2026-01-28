# 🔧 TravelOrchestrator - Guía REPLIT Paso a Paso

## 📌 ¿QUÉ ES REPLIT?

Replit es un IDE en la nube. Puedes escribir código, instalarlo y ejecutarlo **sin tocar tu máquina local**. Perfecto para desarrollo rápido.

---

## ⚡ PASO 1: CREAR REPLIT NUEVO (2 min)

### 1.1 Ir a Replit
1. Abre https://replit.com
2. Login o crea cuenta
3. Click **"+ Create"** (arriba a la izquierda)

### 1.2 Crear Proyecto Node.js
1. En "Search templates" escribe **"Node.js"**
2. Click en **"Node.js"** (el primer resultado)
3. En "Title" escribe: **"travelorchestrator-backend"**
4. Click **"Create Repl"**
5. ✅ Se abre un Replit nuevo

---

## 📁 PASO 2: CREAR ESTRUCTURA DE CARPETAS (5 min)

### 2.1 Crear Carpetas
En Replit lado izquierdo hay un árbol de archivos. Haz click derecho en la carpeta raíz y selecciona "New Folder":

```
Crea estas carpetas:
├─ src/
│  ├─ routes/
│  ├─ services/
│  ├─ middleware/
│  └─ controllers/
└─ (raíz)
```

### 2.2 Crear Archivos Principales
En la raíz (/) haz click derecho → "New File":
- `package.json`
- `.env`
- `.gitignore`

En `src/` crea:
- `app.js`

En `src/services/` crea:
- `supabaseService.js`
- `openaiService.js`
- `claudeService.js`

En `src/routes/` crea:
- `auth.js`
- `trips.js`
- `itineraries.js`
- `activities.js`
- `ai.js`

En `src/middleware/` crea:
- `auth.js`

---

## 📝 PASO 3: COPIAR CÓDIGO (15 min)

### 3.1 package.json
1. Abre `package.json` en Replit
2. Copia TODO este código:

```json
{
  "name": "travelorchestrator-backend",
  "version": "1.0.0",
  "description": "AI-powered trip planning backend",
  "main": "src/app.js",
  "scripts": {
    "dev": "nodemon src/app.js",
    "start": "node src/app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "@supabase/supabase-js": "^2.38.4",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.0",
    "axios": "^1.6.0",
    "openai": "^4.20.0",
    "@anthropic-ai/sdk": "^0.9.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

3. Click **Ctrl+S** para guardar

### 3.2 .env
1. Abre `.env` en Replit
2. Copia esto (llenarás valores después):

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
OPENAI_API_KEY=sk_... (dejar vacío por ahora)
ANTHROPIC_API_KEY=sk-ant-... (dejar vacío por ahora)
JWT_SECRET=your_super_secret_key_change_this
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

3. **IMPORTANTE:** No cierres este archivo. Lo llenarás en el PASO 5.

### 3.3 src/app.js
1. Abre `src/app.js` en Replit
2. Copia TODO el código de REPLIT_SETUP.md sección "src/app.js"
3. Pega en Replit
4. Ctrl+S para guardar

### 3.4 src/services/supabaseService.js
1. Abre en Replit
2. Copia de REPLIT_SETUP.md
3. Pega
4. Guardar

### 3.5 src/services/openaiService.js
1. Igual proceso
2. Copia de REPLIT_SETUP.md
3. Pega en Replit
4. Guardar

### 3.6 src/services/claudeService.js
1. Igual
2. Copia de REPLIT_SETUP.md
3. Pega
4. Guardar

### 3.7 src/middleware/auth.js
1. Abre en Replit
2. Copia de REPLIT_SETUP.md
3. Pega
4. Guardar

### 3.8 src/routes/auth.js
1. Abre en Replit
2. Copia de REPLIT_SETUP.md
3. Pega
4. Guardar

### 3.9 src/routes/trips.js
1. Abre en Replit
2. Copia de REPLIT_SETUP.md
3. Pega
4. Guardar

### 3.10 src/routes/itineraries.js
1. Abre en Replit
2. Copia de REPLIT_SETUP.md
3. Pega
4. Guardar

### 3.11 src/routes/activities.js
1. Abre en Replit
2. Copia de REPLIT_SETUP.md
3. Pega
4. Guardar

### 3.12 src/routes/ai.js
1. Abre en Replit
2. Copia de REPLIT_SETUP.md
3. Pega
4. Guardar

---

## ✅ PASO 4: INSTALAR DEPENDENCIAS (3 min)

### 4.1 Abrir Terminal Replit
En Replit, abajo hay una sección "Console". Click en ella.

### 4.2 Instalar
En la terminal, escribe:
```bash
npm install
```

Espera a que termine (dice "added X packages"). ✅

---

## 🔑 PASO 5: LLENAR .env CON CREDENCIALES (10 min)

### 5.1 Crear Supabase Project
**NOTA:** Necesitas hacer esto primero (si no lo hiciste):

1. Ve a https://supabase.com
2. Click "Start your project"
3. Login/Signup
4. Click "New project"
5. Nombre: **"travelorchestrator"**
6. Espera ~2 min a que se cree
7. ✅ Proyecto creado

### 5.2 Obtener Credenciales Supabase
1. En Supabase dashboard
2. Click "Settings" (abajo izquierda)
3. Click "API"
4. Copia:
   - **Project URL** (copiar)
   - **anon public** key (copiar)
   - **service_role** secret (copiar) ← Cuidado, muy secreto

### 5.3 Llenar .env en Replit
1. Abre `.env` en Replit (derecha)
2. Busca estas líneas y reemplaza:

```bash
SUPABASE_URL=<PEGA_AQUÍ_LA_PROJECT_URL>
SUPABASE_ANON_KEY=<PEGA_AQUÍ_ANON_KEY>
SUPABASE_SERVICE_KEY=<PEGA_AQUÍ_SERVICE_KEY>
```

3. Ejemplos (NO uses estos, son fake):
```bash
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Guardar (Ctrl+S)

---

## 🗄️ PASO 6: CREAR TABLAS EN SUPABASE (5 min)

### 6.1 SQL Editor Supabase
1. En Supabase dashboard
2. Click "SQL Editor" (izquierda)
3. Click "+ New query"

### 6.2 Ejecutar Schema
1. Copia **TODO** el SQL de `Architecture.md` (sección "Base de Datos Schema")
2. Pega en SQL Editor de Supabase
3. Click "RUN" (arriba derecha)
4. Espera confirmación verde
5. ✅ Tablas creadas

---

## 🚀 PASO 7: INICIAR BACKEND (2 min)

### 7.1 En Replit - Terminal
1. Abre Console (abajo en Replit)
2. Escribe:
```bash
npm run dev
```

3. Deberías ver:
```
🚀 TravelOrchestrator Backend running on port 3000
```

4. ✅ Backend ACTIVO

### 7.2 Copiar URL
Replit te genera una URL pública. Ejemplo:
```
https://travelorchestrator-backend.replit.dev
```

Copia esta URL (la necesitarás para el frontend).

---

## 🎨 PASO 8: SETUP FRONTEND (10 min)

### 8.1 Crear OTRO Replit
1. Ve a https://replit.com
2. Click "+ Create"
3. Busca "Vite React"
4. Selecciona "Vite React"
5. Nombre: **"travelorchestrator-frontend"**
6. Click "Create Repl"

### 8.2 Instalar Dependencias
1. Terminal Replit (Console abajo)
2. Escribe:
```bash
npm install axios zustand @supabase/supabase-js i18next react-i18next i18next-browser-languagedetector
```

Espera a terminar.

### 8.3 Crear Estructura Frontend
En el árbol de archivos (izquierda), crea carpetas:
```
src/
├─ components/
│  ├─ Auth/
│  ├─ Trip/
│  └─ LanguageSwitcher.jsx
├─ pages/
├─ services/
├─ store/
├─ locales/
│  ├─ en/
│  ├─ es/
│  ├─ pt/
│  └─ fr/
└─ i18n/
```

### 8.4 Copiar Código Frontend
De FRONTEND_COMPONENTS.md, copia archivo por archivo:

1. `src/services/api.js` → actualiza `VITE_API_URL` con tu URL de Replit backend
2. `src/store/appStore.js` → copia
3. `src/i18n/config.js` → copia
4. `src/components/LanguageSwitcher.jsx` → copia
5. `src/components/Auth/LoginPage.jsx` → copia
6. `src/components/Auth/SignupPage.jsx` → copia
7. `src/components/Trip/TripCreator.jsx` → copia
8. `src/components/Trip/ItineraryGenerator.jsx` → copia
9. `src/components/Trip/ItineraryViewer.jsx` → copia
10. `src/components/Trip/DayCard.jsx` → copia
11. `src/components/Trip/ActivityCard.jsx` → copia
12. `src/components/Trip/ReoptimizationPanel.jsx` → copia
13. `src/pages/Dashboard.jsx` → copia
14. `src/pages/TripDetail.jsx` → copia
15. `src/App.jsx` → copia
16. `src/main.jsx` → actualiza: agrega `import './i18n/config.js'`

### 8.5 Copiar Archivos i18n (JSON Traducciones)
De `I18N_MULTILINGUAL.md`, copia todos los `.json`:
- `locales/en/auth.json`
- `locales/en/trips.json`
- `locales/en/itinerary.json`
- `locales/en/common.json`
- (Igual para es/, pt/, fr/)

### 8.6 Crear .env.local Frontend
En raíz de frontend (/) crea `.env.local`:
```
VITE_API_URL=https://tu-backend-replit.replit.dev/api
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

---

## ▶️ PASO 9: EJECUTAR FRONTEND (2 min)

### 9.1 Terminal Frontend
1. Console en Replit frontend
2. Escribe:
```bash
npm run dev
```

3. Replit te dará una URL:
```
https://travelorchestrator-frontend.replit.dev
```

4. ✅ Frontend CORRIENDO

---

## 🧪 PASO 10: TESTEAR (10 min)

### 10.1 Abrir Frontend
1. Click en la URL del frontend (Replit te muestra arriba)
2. Se abre en nueva pestaña

### 10.2 Test Signup
1. Click "Sign up"
2. Llena:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123456
3. Click "Sign Up"
4. ✅ Debe redirigir a Dashboard

### 10.3 Test Create Trip
1. En dashboard, rellena:
   - Title: Vegas Trip
   - Destination: Las Vegas
   - Start: 2025-04-15
   - End: 2025-04-20
   - Budget: 2000
2. Click "Create Trip"
3. ✅ Trip aparece en lista

### 10.4 Test Generate Itinerary
1. Click en trip
2. Selecciona preferencias (cultural, nightlife)
3. Click "Generate Itinerary with AI"
4. ✅ Aparece itinerario (demo mode)

### 10.5 Test Language Switcher
1. En login/signup, ve el selector de idiomas
2. Click en 🇪🇸
3. Todo cambia a Español
4. ✅ Multilingüe funciona

---

## 🔌 PASO 11: AGREGAR KEYS IA (Cuando tengas)

### 11.1 OpenAI Key
1. Ve a https://platform.openai.com/api/keys
2. Click "Create new secret key"
3. Copia
4. En Replit backend, abre `.env`
5. Busca `OPENAI_API_KEY=sk_...`
6. Reemplaza con tu key:
```bash
OPENAI_API_KEY=sk-proj-abcdef123456...
```
7. Guardar

### 11.2 Anthropic Key
1. Ve a https://console.anthropic.com
2. Click "API keys"
3. Click "Create key"
4. Copia
5. En Replit backend, `.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-abcdef123456...
```
6. Guardar
7. Reinicia backend (detén y corre `npm run dev` de nuevo)

### 11.3 Test IA Real
1. Crea nuevo trip
2. Click "Generate Itinerary"
3. ✅ Ahora llama a OpenAI real (no demo)
4. Espera respuesta real

---

## 📊 RESUMEN: Estructura Final Replit

```
REPLIT 1: Backend
├─ src/
│  ├─ app.js ✅
│  ├─ routes/ (5 archivos) ✅
│  ├─ services/ (3 archivos) ✅
│  └─ middleware/ (1 archivo) ✅
├─ package.json ✅
├─ .env (con credenciales) ✅
└─ npm run dev → PORT 3000 ✅

REPLIT 2: Frontend
├─ src/
│  ├─ components/ (13 archivos) ✅
│  ├─ pages/ (2 archivos) ✅
│  ├─ services/ (1 archivo) ✅
│  ├─ store/ (1 archivo) ✅
│  ├─ locales/ (16 JSON) ✅
│  ├─ i18n/ (1 archivo) ✅
│  ├─ App.jsx ✅
│  └─ main.jsx ✅
├─ .env.local (con credenciales) ✅
└─ npm run dev → PORT 5173 ✅
```

---

## ✅ CHECKLIST FINAL

- [ ] 2 Replits creados (backend + frontend)
- [ ] Estructura de carpetas lista
- [ ] Código copiado (backend)
- [ ] Código copiado (frontend)
- [ ] package.json en ambos
- [ ] .env filled con Supabase keys
- [ ] .env.local filled con Supabase keys
- [ ] npm install (backend)
- [ ] npm install (frontend)
- [ ] SQL schema ejecutado en Supabase
- [ ] Backend corriendo (`npm run dev`)
- [ ] Frontend corriendo (`npm run dev`)
- [ ] Test signup funciona
- [ ] Test create trip funciona
- [ ] Test generate itinerary funciona
- [ ] Test language switcher funciona
- [ ] OpenAI key agregada (opcional ahora)
- [ ] Anthropic key agregada (opcional ahora)

---

## 🎯 PRÓXIMOS PASOS

1. **Juega con el app** - Prueba todos los flujos
2. **Personaliza** - Cambia colores, textos, logo
3. **Agrega keys IA** - Cuando tengas, integra
4. **Deploy a producción** - Vercel + Railway (Fase 2)
5. **Invita tu primo** - Colaboren en Vegas trip

---

## 🆘 TROUBLESHOOTING REPLIT

### "npm install falla"
- Espera a que Replit instale (puede tardar)
- Si sigue errando, cierra Replit y abre de nuevo

### "Backend no inicia"
- Chequea `.env` tiene valores correctos
- Revisa que no hay typos en rutas
- Ver logs en terminal Replit

### "Frontend no conecta a backend"
- Chequea URL del backend en `.env.local`
- Debe ser la URL pública de Replit backend
- NO debe ser http://localhost (Replit no permite eso)

### "Supabase error"
- Verifica keys en `.env`
- Chequea proyecto Supabase está activo (verde)
- Abre Supabase SQL Editor → verifica tablas existen

---

## 💡 TIPS REPLIT

- **Compartir código:** Arriba derecha hay botón "Share" para invitar colaboradores
- **Guardar:** Replit guarda automático, pero Ctrl+S es buena práctica
- **Console:** Los logs aparecen abajo (útil para debug)
- **Secrets:** Para valores sensibles, usa "Secrets" de Replit (no .env)

---

**¡Listo! Ahora tienes backend + frontend corriendo en Replit.** 🚀

**Próximo paso: TEST COMPLETO + Agregar keys IA.**

¿Necesitas ayuda en algún paso?
