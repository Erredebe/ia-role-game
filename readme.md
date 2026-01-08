# Juego de Rol con IA

¡Bienvenido a la Mazmorra de Inteligencia Artificial! Este proyecto es un juego de rol narrativo e interactivo de vanguardia, donde una IA (Maestro de Calabozo) guía tu historia basándose en tus decisiones.

## 🌟 Características Destacadas

- **Narrativa Evolutiva**: La IA genera la historia basándose en tus acciones previas.
- **Ficha de Personaje en Vivo**: Visualización dinámica de Salud (HP), Maná e Inventario que se actualizan según los eventos de la historia.
- **Acciones Sugeridas**: La IA propone tres caminos posibles para agilizar la partida, aunque siempre puedes escribir tu propia acción.
- **Estética Gamer Premium**: Interfaz moderna con efectos de cristal (glassmorphism), tipografía futurista y diseño responsivo.
- **Arquitectura Escalable**: Separación limpia entre Backend y Frontend con el uso de Signals, TypeScript y Patrones de Diseño.

## 🛠️ Tecnologías

- **Backend**: Node.js, Express, TypeScript, Axios (Comunicación con IA).
- **Frontend**: Angular 18+, Signals (Estado Reactivo), CSS Moderno, DiceBear Avatars.
- **IA**: Compatible con LM Studio (Soporta modelos tipo OpenAI API).

## 🚀 Instalación y Uso

### Requisitos Previos

1.  **LM Studio**: Instalado y con un modelo de lenguaje cargado (ej. Llama 3 o Mistral).
2.  **Servidor Local de IA**: Inicia el servidor local en LM Studio (generalmente en el puerto `1234`).

### Configuración del Proyecto

1.  Clona el repositorio.
2.  Instala las dependencias en la raíz:
    ```bash
    npm install
    ```

### Ejecutar la Aplicación

Desde la carpeta raíz, simplemente ejecuta:
```bash
npm run dev
```
Este comando iniciará simultáneamente:
- **Frontend**: `http://localhost:4200`
- **Backend**: `http://localhost:3000`

## 🕹️ Cómo Jugar

1.  Una vez iniciada la aplicación, verás tu ficha de personaje a la izquierda.
2.  El Maestro de Calabozo iniciará la narrativa en el chat.
3.  Utiliza los **botones de sugerencia** para actuar rápido o **escribe tu propia acción** en el cuadro de texto.
4.  Observa cómo cambian tus estadísticas y tu inventario según lo que sucede en el mundo.

## 📐 Estructura del Código

- `/backend`: Lógica del servidor, controladores y servicio de adaptador para la IA.
- `/frontend`: Componentes de Angular, servicios de estado con Signals y estilos visuales.
- `/package.json`: Script raíz para ejecución concurrente.

---
© 2026 - IA Role Game
