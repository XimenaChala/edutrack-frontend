# EduTrack — Frontend Application
Distributed school-tracking platform for parents and guardians — Distributed Systems 2026-B, Team G1.

## 🚀 Tecnologías
- **HTML5 + Vanilla Modern JavaScript + CSS3**
- **Vite** como empaquetador ultraligero
- **Nginx Alpine + Docker** para contenedorización multi-stage
- **Figma Design System** (`EduTrack-Mockups-MVP1.fig`)

## 🔗 Conexión con el Backend
La aplicación frontend se comunica con el microservicio de comunicación (`edutrack-backeng`) a través de la variable de entorno:
- `VITE_API_URL`: URL base de la API REST (por defecto: `http://localhost:8085/api/v1`).

### Flujo de Conexión
1. **Health check**: Verifica el estado del microservicio en `GET /api/v1/messages/health`.
2. **Carga de conversación**: Consulta el historial mediante `GET /api/v1/messages/conversation?user1=...&user2=...`.
3. **Envío de mensajes**: Realiza un `POST /api/v1/messages` con el payload JSON correspondiente.

## 📦 Ejecución con Docker Compose
```bash
docker compose up --build -d
```
Acceder en el navegador: [http://localhost:3000](http://localhost:3000)

## 💻 Ejecución Local (Modo Desarrollo)
```bash
npm install
npm run dev
```
Acceder en: [http://localhost:3000](http://localhost:3000) (o el puerto asignado por Vite).
