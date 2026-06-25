# 🎨 Sistema de Temas (Dark / Light)

## Tabla de Contenidos

1. [Arquitectura](#1-arquitectura)
2. [El JSON de Configuración](#2-el-json-de-configuracion)
3. [Cómo fluye el tema desde el backend hasta el DOM](#3-como-fluye-el-tema)
4. [Configuración de Tailwind CSS v4](#4-configuracion-de-tailwind-css-v4)
5. [El Mapa de Conversión](#5-el-mapa-de-conversion)
6. [Cómo agregar dark mode a un componente nuevo](#6-como-agregar-dark-mode)
7. [Reglas de oro](#7-reglas-de-oro)
8. [Preguntas frecuentes](#8-preguntas-frecuentes)

---

## 1. Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│                      Settings Page                       │
│  (toggleTheme, setLanguage, toggleNotification)           │
└──────────────┬───────────────────────────────────────────┘
               │ PATCH /profile/settings { theme: "dark" }
               ▼
┌──────────────────────────────────────────────────────────┐
│                  Profile Controller                      │
│  PATCH /profile/settings → UpdateSettingsUseCase         │
│  → merge profundo → guarda JSONB en Profile.settings     │
└──────────────┬───────────────────────────────────────────┘
               │ Response: UserSettings completo
               ▼
┌──────────────────────────────────────────────────────────┐
│                   AuthService                            │
│  settings = signal<UserSettings>(DEFAULT_SETTINGS)        │
│                                                          │
│  effect(() => {                                          │
│    document.documentElement                              │
│      .classList.toggle('dark', theme === 'dark')         │
│  })                                                      │
└──────────────┬───────────────────────────────────────────┘
               │ Clase "dark" en <html>
               ▼
┌──────────────────────────────────────────────────────────┐
│           Tailwind CSS v4 @custom-variant dark            │
│  dark:bg-slate-900, dark:text-slate-100, etc.             │
└──────────────────────────────────────────────────────────┘
```

### Los pilares del sistema

1. **Backend**: columna `settings jsonb` en la entidad `Profile` — guarda un objeto JSON con theme, language y notifications
2. **API**: `GET /profile/settings` y `PATCH /profile/settings` (JWT protegido)
3. **AuthService**: señal `settings` global que se carga al login o al iniciar la app
4. **Effect**: un `effect()` de Angular escucha la señal y pone/remueve la clase `dark` en `<html>`
5. **Tailwind v4**: usa la variante `dark:` para aplicar estilos cuando la clase `dark` está presente

---

## 2. El JSON de Configuración

### Estructura completa

```typescript
interface UserSettings {
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  notifications: {
    email: {
      newMember: boolean;
      taskAssigned: boolean;
      taskCompleted: boolean;
      dailyDigest: boolean;
    };
  };
}
```

### Valores por defecto (cuando la BD está vacía)

```typescript
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',        // ← Light mode por defecto
  language: 'es',        // ← Español por defecto
  notifications: {
    email: {
      newMember: true,    // Notificar cuando alguien se une a un workspace
      taskAssigned: true, // Notificar cuando te asignan una tarea
      taskCompleted: false, // No notificar cuando completan una tarea
      dailyDigest: false, // No enviar resumen diario
    },
  },
};
```

### Lo que viaja por la red

**Request** (`PATCH /profile/settings`):

Solo enviamos lo que cambia — el backend hace merge profundo:

```json
{
  "theme": "dark"
}
```

**Response** (`GET /profile/settings`):

Siempre devuelve el objeto completo con los defaults mergeados:

```json
{
  "theme": "dark",
  "language": "es",
  "notifications": {
    "email": {
      "newMember": true,
      "taskAssigned": true,
      "taskCompleted": false,
      "dailyDigest": false
    }
  }
}
```

### Cómo funciona el merge profundo en el backend

```typescript
// Si la BD guarda:  { theme: "dark" }
// Y los defaults son:
//   { theme: "light", language: "es",
//     notifications: { email: { newMember: true, taskAssigned: true, ... } } }
//
// El resultado es:
//   { theme: "dark", language: "es",
//     notifications: { email: { newMember: true, taskAssigned: true, ... } } }
//
// La "theme" del usuario reemplaza el default,
// pero language y notifications se toman de los defaults
// porque el usuario nunca los cambió.
```

---

## 3. Cómo fluye el tema

### Al iniciar sesión

```
1. El usuario hace login → POST /auth/login
2. El AuthService recibe el token
3. Llama a loadProfile():
   a. GET /profile/me        → guarda en currentUserProfile
   b. GET /profile/settings  → guarda en settings signal
4. El effect() detecta que settings cambió
5. Si theme === 'dark' → document.documentElement.classList.add('dark')
   Si theme === 'light' → document.documentElement.classList.remove('dark')
```

### Al recargar la página

```
1. AuthService se construye
2. Si hay token en localStorage → llama a loadProfile()
3. Mismo flujo que arriba
4. El tema persiste porque el servidor lo guarda en la BD
```

### Al cambiar el tema desde Settings

```
1. Usuario togglea el switch → updateSetting('theme', 'dark')
2. SettingsPage llama a PATCH /profile/settings { theme: 'dark' }
3. Recibe el UserSettings actualizado
4. Actualiza authService.settings.set(updated)
5. AuthService settings cambia → effect() → dark class
6. Toda la UI se repinta con los estilos dark:
```

### Cómo se propaga por la UI

El cambio es **inmediato** y **global**. No hay "carga" ni "flash":

```
AuthService.settings (signal)
        │
        ├── effect() → document.documentElement.classList
        │                  │
        │                  ▼
        │           Todos los componentes con dark:
        │           bg cambia, texto cambia, bordes cambian
        │
        └── SettingsPage (lectura directa de la signal)
```

---

## 4. Configuración de Tailwind CSS v4

### El secreto: `@custom-variant dark`

Por defecto, Tailwind v4 usa `prefers-color-scheme` (la preferencia del sistema operativo). Nosotros queremos controlar el tema **manualmente** desde nuestra app.

Para eso existe `@custom-variant`:

```css
/* styles.css */
@import 'tailwindcss';

/* Cambia dark mode de "media query" a "clase en el HTML" */
@custom-variant dark (&:where(.dark, .dark *));
```

Esto le dice a Tailwind: "Cada vez que veas `dark:` en una clase, aplicala SOLO si el elemento ancestro tiene la clase `.dark`".

**Importante**: La clase `.dark` se pone en `<html>`, no en `<body>`, porque `:where(.dark, .dark *)` selecciona el elemento con clase `.dark` y todos sus hijos.

### Las variables CSS con tema

Algunos componentes usan variables CSS definidas en `:root`. Para dark mode, añadimos `:root.dark`:

```css
:root {
  /* ── Modo Light ── */
  --bg-base: #f1f5f9;
  --bg-raised: #ffffff;
  --text-primary: #0f172a;
  --border-subtle: rgba(0, 0, 0, 0.06);
  /* ... más variables */
}

:root.dark {
  /* ── Modo Dark ── */
  --bg-base: #0f172a;
  --bg-raised: #1e293b;
  --text-primary: #f1f5f9;
  --border-subtle: rgba(255, 255, 255, 0.06);
  /* ... más variables */
}
```

### Por qué no usamos variables CSS para TODO

Las variables CSS son geniales, pero tenemos 21+ archivos HTML con cientos de clases de Tailwind escritas directamente. Sería una tarea titánica migrar todo a variables.

La estrategia es **dual**:
- Componentes que YA usan variables CSS → `:root.dark` las actualiza automáticamente
- Componentes con clases Tailwind directas → agregamos `dark:` en cada clase

---

## 5. El Mapa de Conversión

Esta es la tabla que usamos para migrar cualquier componente.

### Fondos (backgrounds)

| Light | Dark |
|---|---|
| `bg-white` | `dark:bg-slate-900` |
| `bg-slate-50` | `dark:bg-slate-950` |
| `bg-slate-100` | `dark:bg-slate-800/50` |
| `bg-slate-200` | `dark:bg-slate-700` |
| `bg-slate-300` | `dark:bg-slate-600` |
| `bg-slate-50/30` | `dark:bg-slate-950/30` |
| `bg-slate-50/50` | `dark:bg-slate-950/50` |
| `bg-slate-50/70` | `dark:bg-slate-950/70` |
| `bg-slate-100/40` | `dark:bg-slate-800/20` |
| `bg-slate-100/60` | `dark:bg-slate-800/30` |
| `bg-slate-100/80` | `dark:bg-slate-800/40` |
| `bg-slate-100/80` | `dark:bg-slate-800/50` |
| `bg-slate-100` (badges) | `dark:bg-slate-700/50` |

### Texto

| Light | Dark |
|---|---|
| `text-slate-800` | `dark:text-slate-100` |
| `text-slate-700` | `dark:text-slate-200` |
| `text-slate-600` | `dark:text-slate-300` |
| `text-slate-500` | `dark:text-slate-400` |
| `text-slate-400` | `dark:text-slate-500` |
| `text-slate-300` | `dark:text-slate-600` |

### Bordes

| Light | Dark |
|---|---|
| `border-slate-100` | `dark:border-slate-700/50` |
| `border-slate-200` | `dark:border-slate-700` |
| `border-slate-300` | `dark:border-slate-600` |
| `border-slate-100/60` | `dark:border-slate-700/30` |
| `border-slate-200/50` | `dark:border-slate-700/50` |
| `border-slate-200/70` | `dark:border-slate-700/50` |

### Sombras

En dark mode las sombras apenas se ven. Las reemplazamos por bordes sutiles:

| Light | Dark |
|---|---|
| `shadow-sm` | `dark:shadow-none dark:border dark:border-slate-700/50` |
| `shadow-md` | `dark:shadow-none` |
| `shadow-lg` | `dark:shadow-none` |
| `shadow-2xl` | `dark:shadow-none` |
| `shadow-red-500/25` | `dark:shadow-red-500/10` (más sutil) |

### Hovers

| Light | Dark |
|---|---|
| `hover:bg-slate-50` | `dark:hover:bg-slate-800/50` |
| `hover:bg-slate-100` | `dark:hover:bg-slate-800` |
| `hover:bg-slate-100/80` | `dark:hover:bg-slate-800/40` |
| `hover:text-slate-800` | `dark:hover:text-slate-100` |
| `hover:text-slate-600` | `dark:hover:text-slate-300` |
| `hover:border-slate-200` | `dark:hover:border-slate-600` |
| `hover:border-slate-300` | `dark:hover:border-slate-500` |

### Badges de estado semántico

| Light | Dark |
|---|---|
| `bg-red-50 text-red-600` | `dark:bg-red-500/10 dark:text-red-400` |
| `bg-emerald-50 text-emerald-600` | `dark:bg-emerald-500/10 dark:text-emerald-400` |
| `bg-amber-50 text-amber-600` | `dark:bg-amber-500/10 dark:text-amber-400` |
| `bg-violet-50 text-violet-600` | `dark:bg-violet-500/10 dark:text-violet-400` |

### Lo que NO cambia con el tema

- **El color de marca `#ef4444`** — Es el Red Thread signature. Los botones rojos, las barras de acento, los focus rings rojos se mantienen igual.
- **`text-white` sobre fondos `bg-[#ef4444]`** — Se mantiene.
- **Los iconos SVG con stroke/color fijo** — A menos que usen `currentColor`.

---

## 6. Cómo agregar dark mode a un componente nuevo

Digamos que creaste un nuevo componente `my-card`. Sigue estos pasos:

### Paso 1: Identificar los colores light

```html
<div class="bg-white border border-slate-100 shadow-sm rounded-xl p-6">
  <h3 class="text-slate-800 text-lg font-semibold">Título</h3>
  <p class="text-slate-500 text-sm">Descripción</p>
</div>
```

### Paso 2: Aplicar el mapa de conversión

```html
<div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 
            shadow-sm dark:shadow-none rounded-xl p-6">
  <h3 class="text-slate-800 dark:text-slate-100 text-lg font-semibold">Título</h3>
  <p class="text-slate-500 dark:text-slate-400 text-sm">Descripción</p>
</div>
```

### Paso 3: Verificar en el navegador

1. Abrí las DevTools (F12)
2. En el inspector, seleccioná `<html>`
3. Agregale la clase `dark` manualmente
4. Verificá que el componente se vea correcto
5. Sacale la clase y verificá que vuelva a light

### Paso 4: Probar el toggle en Settings

1. Andá a `/profile/settings`
2. Activá Dark mode
3. Navegá por toda la app para detectar fugas visuales
4. Volvé a Light mode y verificá que no haya residuos

### Patrón visual de ejemplo

Así se ve un card en ambos modos:

```
MODO LIGHT                     MODO DARK
┌────────────────────┐        ┌────────────────────┐
│ bg-white           │        │ bg-slate-900       │
│ border-slate-100   │        │ border-slate-700/50│
│                    │        │                    │
│  Título (slate-800)│        │  Título (slate-100)│
│  Descripción       │        │  Descripción       │
│  (slate-500)       │        │  (slate-400)       │
└────────────────────┘        └────────────────────┘
```

---

## 7. Reglas de Oro

### 1. **Siempre en pares**

Cada clase light debe tener su contraparte dark. No dejes clases sin su par. Si ves:

```html
<div class="bg-white p-4">
```

Debe ser:

```html
<div class="bg-white dark:bg-slate-900 p-4">
```

### 2. **Las sombras se convierten en bordes**

En dark mode las sombras no se ven. En lugar de `shadow-sm`, usá `dark:border dark:border-slate-700/50`.

### 3. **El brand red es sagrado**

`bg-[#ef4444]`, `text-[#ef4444]`, `focus:ring-[#ef4444]/20` → **NO se tocan**. Son el Red Thread.

### 4. **Las opacidades se heredan**

Si tenés `bg-slate-50/50`, en dark sería `dark:bg-slate-950/50`. Mantené la misma opacidad, solo cambiá el color base.

### 5. **Los badges semánticos cambian el tono, no el matiz**

- Danger: `bg-red-50 text-red-600` → `dark:bg-red-500/10 dark:text-red-400`
- Success: `bg-emerald-50 text-emerald-600` → `dark:bg-emerald-500/10 dark:text-emerald-400`

### 6. **Probá en ambos modos antes de dar por terminado**

Siempre verificá que el componente se vea bien en light y dark. Un error común es:
- Texto oscuro sobre fondo oscuro (ilegible)
- Texto claro sobre fondo claro (ilegible)
- Bordes que desaparecen en dark

### 7. **No uses el `dark:` en las clases de la marca**

```html
<!-- ❌ MAL: El botón rojo se mantiene rojo en dark -->
<button class="bg-[#ef4444] dark:bg-[#ef4444]">

<!-- ✅ BIEN: El botón rojo es igual en ambos modos -->
<button class="bg-[#ef4444]">
```

---

## 8. Preguntas Frecuentes

### ¿Por qué no usamos `prefers-color-scheme`?

Porque queremos que el usuario elija manualmente el tema desde la página de Settings, independientemente de la configuración de su sistema operativo.

### ¿Cómo agrego un nuevo campo al JSON de settings?

1. Backend: agregá el campo a la interface `UserSettings` y a `DEFAULT_SETTINGS` en `settings.interface.ts`
2. Backend: agregá el campo al DTO `UpdateSettingsDto`
3. Frontend: agregá el campo a la interface `UserSettings` y a `DEFAULT_SETTINGS` en `profile.models.ts`
4. Frontend: creá el UI control en `settings-page.html`
5. Backend: el merge profundo lo maneja automáticamente

### ¿Los datos se pierden si cierro sesión?

No. Las settings se guardan en la BD (columna `settings jsonb` en `Profile`). Al volver a iniciar sesión, se cargan automáticamente.

### ¿Cómo comparto settings entre web y mobile?

Usan el mismo backend. Mobile llama a `GET /profile/settings` con el mismo JWT y recibe el mismo JSON. Cada plataforma renderiza según sus capacidades.

### ¿Qué pasa si la columna `settings` es `{}` en la BD?

El backend siempre mergea con `DEFAULT_SETTINGS`. Así que el usuario siempre recibe un objeto completo, incluso si nunca configuró nada.

### ¿Hay flash de contenido sin estilo al recargar?

No, porque:
1. El token está en localStorage (síncrono)
2. `AuthService` se construye antes de que Angular renderice componentes
3. `loadProfile()` se llama en el constructor
4. `effect()` se ejecuta en la misma tick que la renderización

Pero si querés estar seguro, podés agregar `dark` class desde el servidor renderizando el theme en el `<html>` inicial.
