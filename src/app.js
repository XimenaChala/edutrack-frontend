import { checkBackendHealth, fetchConversation, sendMessageApi } from './api.js';

// Constants for Mocked Users in EduTrack (Parent & Teacher)
const CURRENT_USER_ID = '11111111-1111-1111-1111-111111111111'; // Ximena Zambrano (Padre)
const TEACHER_USER_ID = '22222222-2222-2222-2222-222222222222'; // Prof. Carlos Mendoza

// DOM Elements
const messagesBody = document.getElementById('messages-body');
const messageForm = document.getElementById('message-form');
const messageContentInput = document.getElementById('message-content');
const charCountSpan = document.getElementById('char-count');
const btnSend = document.getElementById('btn-send');
const btnRefresh = document.getElementById('btn-refresh');
const errorBanner = document.getElementById('error-banner');
const errorMessageSpan = document.getElementById('error-message');
const btnCloseAlert = document.getElementById('btn-close-alert');
const backendLabel = document.getElementById('backend-label');
const backendStatusDot = document.querySelector('.status-dot');
const kpiTotalMessages = document.getElementById('kpi-total-messages');
const convPreview = document.getElementById('conv-preview');

// State
let isSending = false;

// Format timestamp to localized readable string
function formatTimestamp(isoString) {
  if (!isoString) return 'Justo ahora';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Show/Hide Error Banner
function showError(msg) {
  errorMessageSpan.textContent = msg;
  errorBanner.style.display = 'flex';
}

function hideError() {
  errorBanner.style.display = 'none';
}

// Render Conversation
function renderMessages(messages) {
  messagesBody.innerHTML = '';

  if (!messages || messages.length === 0) {
    messagesBody.innerHTML = `
      <div class="loading-spinner">
        No hay mensajes previos en esta conversación.<br>
        <small style="color: #64748b;">Escribe el primer mensaje a continuación.</small>
      </div>
    `;
    kpiTotalMessages.textContent = '0';
    convPreview.textContent = 'Sin mensajes previos';
    return;
  }

  kpiTotalMessages.textContent = messages.length;
  const lastMsg = messages[messages.length - 1];
  convPreview.textContent = lastMsg.content || 'Sin contenido';

  messages.forEach(msg => {
    const isSentByMe = msg.senderId === CURRENT_USER_ID;
    const row = document.createElement('div');
    row.className = `message-row ${isSentByMe ? 'sent' : 'received'}`;

    row.innerHTML = `
      <div class="message-bubble">
        ${escapeHtml(msg.content)}
      </div>
      <div class="message-meta">
        <span>${isSentByMe ? 'Tú' : 'Prof. Carlos Mendoza'}</span>
        <span>•</span>
        <span>${formatTimestamp(msg.createdAt)}</span>
        ${isSentByMe ? '<span>✓✓</span>' : ''}
      </div>
    `;

    messagesBody.appendChild(row);
  });

  // Scroll to bottom
  messagesBody.scrollTop = messagesBody.scrollHeight;
}

// Simple HTML Escaper
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

// Load conversation from Backend
async function loadConversation() {
  try {
    const messages = await fetchConversation(CURRENT_USER_ID, TEACHER_USER_ID);
    renderMessages(messages);
  } catch (err) {
    console.error('Error cargando conversación:', err);
    showError('No se pudo conectar con el microservicio: ' + err.message);
  }
}

// Check Backend Health
async function updateBackendStatus() {
  const isHealthy = await checkBackendHealth();
  if (isHealthy) {
    backendStatusDot.className = 'status-dot online';
    backendLabel.textContent = 'Conectado (8085)';
  } else {
    backendStatusDot.className = 'status-dot offline';
    backendLabel.textContent = 'Desconectado';
  }
}

// Handle Send Message
async function handleSendMessage(e) {
  e.preventDefault();
  hideError();

  const content = messageContentInput.value.trim();
  if (!content) {
    showError('El mensaje no puede estar vacío.');
    return;
  }

  try {
    isSending = true;
    btnSend.disabled = true;
    btnSend.querySelector('span').textContent = 'Enviando...';

    await sendMessageApi({
      senderId: CURRENT_USER_ID,
      receiverId: TEACHER_USER_ID,
      content: content
    });

    // Reset input
    messageContentInput.value = '';
    charCountSpan.textContent = '0';

    // Refresh messages
    await loadConversation();
  } catch (err) {
    showError(err.message);
  } finally {
    isSending = false;
    btnSend.disabled = false;
    btnSend.querySelector('span').textContent = 'Enviar';
  }
}

// Character counter
messageContentInput.addEventListener('input', () => {
  charCountSpan.textContent = messageContentInput.value.length;
});

// Allow Enter to submit (Shift+Enter for newline)
messageContentInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    messageForm.requestSubmit();
  }
});

// Event Listeners
messageForm.addEventListener('submit', handleSendMessage);
btnRefresh.addEventListener('click', () => {
  loadConversation();
  updateBackendStatus();
});
btnCloseAlert.addEventListener('click', hideError);

// Initialization
updateBackendStatus();
loadConversation();

// Auto refresh every 5 seconds
setInterval(() => {
  if (!isSending) {
    loadConversation();
    updateBackendStatus();
  }
}, 5000);
