#!/usr/bin/env bash
# setup.sh — Configuración inicial para desarrollo local
# Ejecutar solo si quieres probar la app en tu ordenador

set -e

echo ""
echo "🦸 Alcalá Cómics Staff App — Setup local"
echo "========================================="
echo ""

# Comprobar Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js no está instalado."
  echo "   Descárgalo en: https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Necesitas Node.js 18 o superior (tienes $(node -v))"
  exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Crear .env si no existe
if [ ! -f ".env" ]; then
  echo ""
  echo "📝 Creando archivo .env desde la plantilla..."
  cp .env.example .env
  echo "⚠️  Edita el archivo .env con las claves reales de WooCommerce antes de continuar."
  echo ""
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

echo ""
echo "✅ ¡Todo listo!"
echo ""
echo "Para arrancar la app:"
echo "  npm start"
echo ""
echo "Luego escanea el QR con Expo Go en tu móvil."
echo ""
