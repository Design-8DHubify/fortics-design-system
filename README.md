# Fortics Design System

Design System oficial da **Fortics** — Brandbook 2026.

Construído com metodologia **Atomic Design**, HTML/CSS/JS puro, biblioteca de animações **GSAP** e ícones **Lucide**. Pronto para implementação em WordPress.

![Atomic Design](https://img.shields.io/badge/methodology-Atomic_Design-0066FF)
![GSAP](https://img.shields.io/badge/animations-GSAP_3.12-8B5CF6)
![Lucide](https://img.shields.io/badge/icons-Lucide-20D78A)
![Theme](https://img.shields.io/badge/theme-light_+_dark-FFCE44)

---

## 🚀 Quick start

```bash
# Clone
git clone https://github.com/USER/fortics-design-system.git
cd fortics-design-system

# Servir (qualquer estático funciona)
npx serve .
# OU
python3 -m http.server 8080
```

Abra `http://localhost:3000` (ou a porta indicada).

---

## 📁 Estrutura

```
fortics-design-system/
├── index.html                       # Hub do DS
├── pages/
│   ├── 01-foundations.html          # Nível 0: cores, type, space, motion, marca, shapes
│   ├── 02-atoms.html                # Nível A: 13 átomos
│   ├── 03-molecules.html            # Nível M: 11 moléculas
│   ├── 04-organisms.html            # Nível O: 12 organismos brand-expressive
│   ├── 07-spark-animations.html     # 12 animações CSS do Spark
│   ├── 08-3d-builder.html           # Builder Three.js do Spark 3D
│   └── 10-marca-segmento.html       # 7 produtos × 168 lockups
├── css/
│   ├── tokens.css                   # CSS custom properties (cores, type, etc)
│   ├── base.css                     # Reset + H1-H6 nativos
│   ├── components.css               # Botões, cards, badges, inputs, alerts (v1)
│   ├── atoms.css                    # Checkbox, radio, switch, select, spinner...
│   ├── molecules.css                # Toast, codeblock, theme-toggle, dropdown...
│   ├── organisms.css                # Navbar, hero, carousel, accordion, footer...
│   ├── spark-animations.css         # 12 animações CSS do Spark
│   └── showcase.css                 # Layout das páginas de documentação
├── js/
│   ├── fds.js                       # window.FDS.animate (GSAP)
│   ├── fds-theme.js                 # light/dark toggle persistido
│   ├── fds-toast.js                 # toasts dinâmicos
│   ├── fds-clipboard.js             # click-to-copy
│   ├── fds-codeblock.js             # preview + abas + copy
│   ├── fds-dropdown.js              # menu fechável
│   ├── fds-accordion.js             # sanfona single/multi
│   ├── fds-tabs.js                  # abas ARIA
│   ├── fds-carousel.js              # carousel full-bleed
│   ├── fds-carousel-cards.js        # carousel multi-card (scroll-snap)
│   ├── fds-hero3d.js                # parallax 3D (lessestudio)
│   ├── fds-pomelo.js                # lista interativa Pomelo
│   ├── fds-hero-banner-3d.js        # banner 3D com vidro (Three.js + GSAP)
│   ├── fds-3d-builder.js            # builder 3D OBJ + materiais
│   └── fds-brand-anim.js            # animações SVG da marca
└── assets/
    ├── 3d/Fortics.obj               # modelo 3D do símbolo
    ├── icons/                       # 13 SVGs (Spark + variantes)
    ├── logos/                       # 10 SVGs principais
    ├── patterns/                    # 4 patterns (núcleo, marinho, esmeralda, violeta)
    ├── segments/                    # 168 lockups (7 produtos × 8 cores × 3 layouts)
    └── shapes/                      # 10 PNGs decorativos + simbolo-3d.png
```

---

## 🎨 Fundamentos

### Cores de marca
| Token | Hex |
|-------|-----|
| `--fds-color-nucleo` | `#0066FF` |
| `--fds-color-marinho` | `#0B1121` |
| `--fds-color-violeta` | `#8B5CF6` |
| `--fds-color-esmeralda` | `#20D78A` |

### Tipografia
**Sora** (Google Fonts) — 7 pesos · escala fluida via `clamp()`.

### Tema
Light é o padrão. Toggle persiste em `localStorage`. Variável raiz: `data-theme="light|dark"`.

---

## 🧩 APIs JavaScript

```js
// Animações GSAP
FDS.animate.fadeIn(target, opts);
FDS.animate.slideIn(target, opts);
FDS.animate.scrollReveal(target, opts);
FDS.animate.sparkPulse(target);
// + 14 outras

// Tema
FDS.theme.set('light' | 'dark');
FDS.theme.toggle();
FDS.theme.current();

// Toasts
FDS.toast.success(title, message);
FDS.toast.error(title, message);
FDS.toast.warning(title, message);
FDS.toast.info(title, message);

// Clipboard
FDS.clipboard.copy(text, { label });

// Hero Banner 3D (component)
new FDS.HeroBanner3D(element, { objUrl, accent1, ... }).init();
```

---

## 🔌 Uso em WordPress

```php
// functions.php
add_action('wp_enqueue_scripts', function() {
  $base = get_template_directory_uri() . '/fortics-ds';
  wp_enqueue_style('fds-tokens',     "$base/css/tokens.css");
  wp_enqueue_style('fds-base',       "$base/css/base.css");
  wp_enqueue_style('fds-components', "$base/css/components.css");
  wp_enqueue_style('fds-atoms',      "$base/css/atoms.css");
  wp_enqueue_style('fds-molecules',  "$base/css/molecules.css");
  wp_enqueue_style('fds-organisms',  "$base/css/organisms.css");

  wp_enqueue_script('gsap',   'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js', [], '3.12', true);
  wp_enqueue_script('lucide', 'https://unpkg.com/lucide@latest', [], null, true);
  wp_enqueue_script('fds',        "$base/js/fds.js",        ['gsap'], null, true);
  wp_enqueue_script('fds-theme',  "$base/js/fds-theme.js",  [], null, true);
  wp_enqueue_script('fds-toast',  "$base/js/fds-toast.js",  [], null, true);
  // ...demais módulos conforme uso
});
```

---

## 📦 Componentes inclusos

- **13 Átomos**: Button, Input, Select, Checkbox, Radio, Switch, Badge, Icon, Avatar, Spinner, Divider, Link, Progress
- **11 Moléculas**: Feature Card, Stat Card, Price Card, Testimonial, Form Field, Toast, Tooltip, Dropdown, Search Bar, Notification, Alert
- **12 Organismos**: Navbar, Hero, Logo Strip, Features Grid, Stats, Pomelo Interactive, Carousel (2 variantes), Testimonial, Accordion, Tabs, CTA, Footer
- **12 Animações CSS** do Spark: draw, pulse, orbit, rotate, morph, float, burst, neon, constellation, hover, trail, glitch
- **3D Tools**: Builder com materiais físicos (Three.js) + Hero Banner 3D com vidro

---

## 📜 Licença

Propriedade da **Fortics** · Brandbook 2026 · Uso interno autorizado.

---

Construído com Atomic Design + GSAP + Lucide · ⚡ by Fortics Design Center
