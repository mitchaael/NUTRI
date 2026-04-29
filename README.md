# 🇨🇱 NutriChile

**Tu contador de calorías y macronutrientes con productos chilenos.**

Una app web progresiva (PWA-ready) diseñada específicamente para celular, con más de 138 alimentos de marcas chilenas reales.

---

## ✨ Funcionalidades

- 📊 **Dashboard** — Anillo de calorías, progreso de macros y resumen por comida
- ➕ **Agregar alimentos** — Búsqueda por nombre o marca, filtro por 18 categorías
- 🍽️ **Mi Día** — Registro completo con ajuste de cantidades por porción
- 🎯 **Objetivos** — Calculadora TDEE (Mifflin-St Jeor), selector de meta y 5 planes de alimentación

## 🛒 Base de datos

138 alimentos con macronutrientes completos (calorías, proteínas, carbohidratos, grasas, fibra) de marcas como:

> Soprole · Colun · Loncoleche · Nestlé · Danone · Kraft · Ariztía · Super Pollo · San Jorge · Montserrat · Otto Kunkel · Harry's · Bimbo · Ideal · Quaker · Costa · Nabisco · Lays · Pringles · Doritos · Coca-Cola · CCU · Watts · Andina · Cachantun · Monster · Gallo · Carozzi · Salmonte · Chef · Mazola · Hellmann's · Malloa · Iansa · y más.

## 🍽️ Planes de alimentación incluidos

1. 🔥 Pérdida de grasa
2. ⚖️ Mantenimiento
3. 💪 Recomposición corporal
4. 📈 Ganancia de masa muscular
5. 🥑 Low Carb Chilena

---

## 🚀 Instalación y uso

### Requisitos
- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/TU_USUARIO/nutrichile.git
cd nutrichile

# 2. Instala las dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm run dev
```

Luego abre [http://localhost:5173](http://localhost:5173) en tu navegador (o en tu celular si están en la misma red WiFi).

### Build para producción

```bash
npm run build
npm run preview
```

La carpeta `dist/` contendrá los archivos listos para subir a cualquier hosting (Vercel, Netlify, GitHub Pages, etc.).

---

## 🌐 Deploy en Vercel (recomendado, gratis)

1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com) y conecta tu repositorio
3. Vercel detecta Vite automáticamente — solo haz clic en **Deploy**

## 🌐 Deploy en Netlify

1. Sube el proyecto a GitHub
2. Ve a [netlify.com](https://netlify.com) → New site from Git
3. Build command: `npm run build`
4. Publish directory: `dist`

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| [React 18](https://react.dev/) | UI |
| [Vite 5](https://vitejs.dev/) | Bundler / Dev server |
| [Nunito](https://fonts.google.com/specimen/Nunito) | Tipografía (Google Fonts) |
| CSS-in-JS inline | Estilos sin dependencias externas |

---

## 📁 Estructura del proyecto

```
nutrichile/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx        ← Punto de entrada React
│   └── App.jsx         ← App completa (DB + lógica + UI)
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 📝 Licencia

MIT — Úsalo, modifícalo y compártelo libremente.

---

Hecho con 💚 para Chile 🇨🇱
