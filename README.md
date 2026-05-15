# 🦸 Alcalá Cómics — App de Staff

App móvil interna para consultar **precio y stock** de cualquier producto mediante escáner de código de barras o búsqueda manual.

---

## 📲 Descargar la app (empleados)

> **Una vez configurado por el responsable**, los empleados solo tienen que ir a la sección **Releases** del repositorio y descargar el APK.

**Android:**
1. Ir a **[Releases](../../releases/latest)**
2. Descargar `alcala-comics-staff.apk`
3. Abrirlo en el móvil → instalar (aceptar "fuentes desconocidas" si lo pide)

**iPhone:**
1. Instalar **Expo Go** desde App Store
2. Pedir el QR de desarrollo al responsable

---

## 🛠 Configuración inicial (solo una vez, lo hace el responsable)

### Paso 1 — Crear cuenta en GitHub
Ve a [github.com](https://github.com) → Sign up (gratis)

### Paso 2 — Crear repositorio privado
- Pulsa **"New repository"**
- Nombre: `alcala-comics-app`
- Visibilidad: **Private** ✅
- No marques ningún checkbox extra
- Pulsa **"Create repository"**

### Paso 3 — Subir el proyecto

Descarga e instala [GitHub Desktop](https://desktop.github.com/) (no hace falta terminal).

1. Abre GitHub Desktop → **File → Add local repository**
2. Selecciona la carpeta `alcala-comics-app`
3. Pulsa **"Publish repository"** → asegúrate de marcar **"Keep this code private"**

### Paso 4 — Añadir las claves de API como Secrets

> ⚠️ Esto es lo más importante. Las claves NUNCA van en el código, van aquí.

En GitHub, dentro de tu repositorio:

1. Ve a **Settings** → **Secrets and variables** → **Actions**
2. Pulsa **"New repository secret"** y añade estos tres:

| Nombre | Valor |
|--------|-------|
| `EXPO_PUBLIC_WC_URL` | `https://www.alcalacomics.com/wp-json/wc/v3` |
| `EXPO_PUBLIC_WC_KEY` | `ck_947905b0...` *(tu clave real)* |
| `EXPO_PUBLIC_WC_SECRET` | `cs_227ee806...` *(tu secreto real)* |

### Paso 5 — Activar GitHub Actions

1. En tu repositorio, ve a la pestaña **Actions**
2. Si aparece un aviso, pulsa **"I understand my workflows, enable them"**

### Paso 6 — Compilar la app

La compilación se lanza **automáticamente** cada vez que subas cambios.

Para lanzarla manualmente:
1. Ve a **Actions** → **"Build Android APK"**
2. Pulsa **"Run workflow"** → **"Run workflow"**
3. Espera ~10-15 minutos
4. El APK aparecerá en **[Releases](../../releases/latest)**

---

## 🔄 Actualizar la app

Cada vez que se haga un cambio en el código y se suba a GitHub, la compilación se lanza sola y genera un nuevo APK en Releases.

---

## 📁 Estructura del proyecto

```
alcala-comics-app/
├── .github/workflows/
│   └── build-android.yml   ← Compilación automática
├── app/                    ← Pantallas (rutas)
│   ├── _layout.tsx         ← Navegación tabs
│   ├── index.tsx           ← Panel principal
│   ├── scanner.tsx         ← Escáner
│   └── search.tsx          ← Buscador
├── src/
│   ├── screens/            ← Código de cada pantalla
│   ├── components/         ← Tarjeta producto, detalle
│   ├── services/
│   │   └── productService.ts  ← Conexión WooCommerce
│   └── utils/theme.ts      ← Colores y estilos
├── .env.example            ← Plantilla de variables (SIN claves reales)
└── README.md
```

---

## ❓ Problemas frecuentes

**La compilación falla en GitHub Actions**
→ Comprueba que los 3 Secrets están bien escritos (sin espacios)

**El escáner no encuentra el producto**
→ El código de barras debe coincidir con el SKU del producto en WooCommerce

**"Instalar de fuentes desconocidas" en Android**
→ Es normal para apps no publicadas en Play Store. Es seguro aceptarlo.

---

*App interna de [Alcalá Cómics](https://www.alcalacomics.com) · Alcalá de Henares desde 1995*
