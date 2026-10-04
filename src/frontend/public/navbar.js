// Fetch Interceptor for JWT
const originalFetch = window.fetch;
window.fetch = async function() {
    let [resource, config] = arguments;
    if (typeof resource === 'string' && resource.startsWith('/api/') && !resource.startsWith('/api/auth/login') && !resource.startsWith('/api/auth/register')) {
        const token = localStorage.getItem('token');
        if (token) {
            config = config || {};
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return originalFetch(resource, config);
};

async function renderNavbar(activePage = '') {
    const navContainer = document.createElement('div');
    document.body.insertBefore(navContainer, document.body.firstChild);
    
    const userData = localStorage.getItem('user');
    if (!userData) return; // Si no hay usuario, no renderizamos o redirigimos
    
    let user = null;
    try {
        user = JSON.parse(userData);
    } catch(e) {
        return;
    }

    let linksHTML = '';
    if (user.rol === 'admin') {
        linksHTML = `
            <li class="nav-item"><a class="nav-link ${activePage==='dashboard'?'active fw-bold':''}" href="/dashboard"><i class="bi bi-speedometer2 me-1"></i>Dashboard</a></li>
            <li class="nav-item"><a class="nav-link ${activePage==='admin_users'?'active fw-bold':''}" href="/admin-users"><i class="bi bi-people me-1"></i>GestiÃ³n Usuarios</a></li>
        `;
    } else if (user.rol === 'reclutador') {
        linksHTML = `
            <li class="nav-item"><a class="nav-link ${activePage==='dashboard'?'active fw-bold':''}" href="/dashboard"><i class="bi bi-house-door me-1"></i>Inicio</a></li>
            <li class="nav-item"><a class="nav-link ${activePage==='vacantes'?'active fw-bold':''}" href="/vacantes"><i class="bi bi-briefcase me-1"></i>Mis Vacantes</a></li>
            <li class="nav-item"><a class="nav-link ${activePage==='evaluar'?'active fw-bold':''}" href="/gestion-postulantes"><i class="bi bi-person-check me-1"></i>Evaluar Candidatos</a></li>
        `;
    } else if (user.rol === 'postulante') {
        linksHTML = `
            <li class="nav-item"><a class="nav-link ${activePage==='dashboard'?'active fw-bold':''}" href="/dashboard"><i class="bi bi-house-door me-1"></i>Inicio</a></li>
            <li class="nav-item"><a class="nav-link ${activePage==='vacantes'?'active fw-bold':''}" href="/vacantes"><i class="bi bi-search me-1"></i>Buscar Vacantes</a></li>
            <li class="nav-item"><a class="nav-link ${activePage==='mis_postulaciones'?'active fw-bold':''}" href="/mis-postulaciones"><i class="bi bi-send-check me-1"></i>Mis Postulaciones</a></li>
            <li class="nav-item"><a class="nav-link ${activePage==='perfil'?'active fw-bold':''}" href="/perfil"><i class="bi bi-person me-1"></i>Mi Perfil</a></li>
        `;
    }

    navContainer.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm fixed-top">
        <div class="container-fluid px-4">
            <a class="navbar-brand fw-bold d-flex align-items-center" href="/dashboard">
                <img src="/Horizontal.jpg" alt="Logo UTA" class="logo-navbar" style="height: 40px; margin-right: 10px; border-radius: 4px;">
                Licitaciones UTA
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    ${linksHTML}
                </ul>
                <div class="d-flex align-items-center mt-2 mt-lg-0">
                    <div class="me-3 dropdown" id="chat-notification-container">
                        <div class="position-relative" style="cursor:pointer;" data-bs-toggle="dropdown" aria-expanded="false" onclick="cargarDetalleNotificaciones()">
                            <i class="bi bi-bell-fill text-light fs-5"></i>
                            <span id="chat-badge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none">
                                0
                            </span>
                        </div>
                        <ul class="dropdown-menu dropdown-menu-end shadow-sm" style="width: 300px; max-height: 400px; overflow-y: auto;" id="notificaciones-dropdown">
                            <li><span class="dropdown-item text-center text-muted small">Cargando...</span></li>
                        </ul>
                    </div>
                    <span class="me-3 fw-medium text-light"><i class="bi bi-person-circle me-1"></i>${user.nombre_completo.split(' ')[0]} (${user.rol})</span>
                    <button class="btn btn-outline-danger btn-sm" onclick="logout()">
                        <i class="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    </nav>
    <div style="height: 70px;"></div> <!-- Spacer para fixed-top -->
    `;
    
    
    if(user.rol === 'postulante' || user.rol === 'reclutador') {
        checkNotificaciones(); // Llama al inicio para ver si hay mensajes viejos
        inicializarSocket(user.id); // Reemplaza al polling
    }
}

function inicializarSocket(userId) {
    // Inyectar el script de socket.io dinámicamente si no existe
    if (!document.getElementById('socketio-script')) {
        const script = document.createElement('script');
        script.id = 'socketio-script';
        script.src = '/socket.io/socket.io.js';
        script.onload = () => {
            window.socket = io();
            window.socket.emit('register', userId);

            window.socket.on('nuevo_mensaje', (msg) => {
                // Si el chat está abierto y corresponde a esta postulación, lo pintamos
                const chatPostulacionId = document.getElementById('chat-postulacion-id');
                if (chatPostulacionId && chatPostulacionId.value == msg.postulacion_id) {
                    if (typeof cargarMensajesChat === 'function') {
                        cargarMensajesChat(msg.postulacion_id);
                    }
                } else {
                    // Si no está abierto, incrementamos la campanita
                    checkNotificaciones();
                }
            });
        };
        document.head.appendChild(script);
    }
}

async function checkNotificaciones() {
    try {
        const res = await fetch('/api/chat/notificaciones/noleidos');
        const data = await res.json();
        if(data.success) {
            const badge = document.getElementById('chat-badge');
            if(data.count > 0) {
                badge.textContent = data.count;
                badge.classList.remove('d-none');
            } else {
                badge.classList.add('d-none');
            }
        }
    } catch(e) {
        console.error('Error fetching notifications');
    }
}

async function cargarDetalleNotificaciones() {
    try {
        const res = await fetch('/api/chat/notificaciones/detalle');
        const data = await res.json();
        const drop = document.getElementById('notificaciones-dropdown');
        
        if (data.success) {
            if (data.data.length === 0) {
                drop.innerHTML = '<li><span class="dropdown-item text-center text-muted small">No hay mensajes nuevos</span></li>';
                return;
            }
            let html = '';
            data.data.forEach(m => {
                html += `
                    <li>
                        <a class="dropdown-item border-bottom py-2" href="#" onclick="abrirChatDesdeNotificacion(${m.postulacion_id}, ${m.oferta_id}); return false;">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <strong class="small text-primary">${m.remitente}</strong>
                                <small class="text-muted" style="font-size:0.65rem;">${new Date(m.fecha_envio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                            </div>
                            <div class="small text-truncate text-muted">${m.mensaje}</div>
                            <div class="small text-truncate" style="font-size:0.7rem; color:#6c757d;"><i class="bi bi-briefcase me-1"></i>${m.oferta_titulo}</div>
                        </a>
                    </li>
                `;
            });
            html += '<li><hr class="dropdown-divider"></li>';
            html += '<li><div class="d-flex justify-content-between px-3 pb-2 pt-1"><a class="btn btn-sm btn-outline-secondary w-100 me-1" href="#" onclick="limpiarNotificaciones(); return false;">Limpiar alertas</a><a class="btn btn-sm btn-primary w-100 ms-1" href="' + (JSON.parse(localStorage.getItem('user')).rol==='postulante'?'/mis-postulaciones':'/gestion-postulantes') + '">Ir al Panel</a></div></li>';
            drop.innerHTML = html;
        }
    } catch(e) {
        console.error(e);
    }
}

async function limpiarNotificaciones() {
    try {
        const res = await fetch('/api/chat/notificaciones/marcar-leido', { method: 'PUT' });
        const data = await res.json();
        if (data.success) {
            // Refrescar el badge y el dropdown
            document.getElementById('chat-badge').classList.add('d-none');
            const drop = document.getElementById('notificaciones-dropdown');
            drop.innerHTML = '<li><span class="dropdown-item text-center text-muted small">No hay mensajes nuevos</span></li>';
        }
    } catch (e) {
        console.error('Error al limpiar notificaciones:', e);
    }
}

function abrirChatDesdeNotificacion(postulacionId, ofertaId = null) {
    // Si estamos en la página correcta, llamamos a la función de abrir modal
    if (typeof abrirModalCV === 'function') {
        // En gestion_postulantes
        if (ofertaId) {
            // Seleccionamos la oferta y le decimos que auto-abra el chat de este postulante
            selectOferta(ofertaId, null, postulacionId);
        } else {
            abrirModalCV(postulacionId);
        }
    } else if (typeof openDetalle === 'function' && typeof postulacionesList !== 'undefined') {
        // En mis_postulaciones, necesitamos el índice.
        const index = postulacionesList.findIndex(p => p.postulacion_id == postulacionId);
        if (index !== -1) {
            openDetalle(index);
        } else {
            window.location.href = '/mis-postulaciones?openChat=' + postulacionId;
        }
    } else {
        // Si no estamos en la vista adecuada, redirigir con los parámetros openChat y ofertaId
        const user = JSON.parse(localStorage.getItem('user'));
        const link = user.rol === 'postulante' ? '/mis-postulaciones' : '/gestion-postulantes';
        window.location.href = link + '?openChat=' + postulacionId + (ofertaId ? '&ofertaId=' + ofertaId : '');
    }
    
    // Refrescar notificaciones para apagar la campanita (porque al abrir el chat, el backend las marcará como leídas)
    setTimeout(checkNotificaciones, 1000);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Importante para limpiar la sesion antigua
    window.location.href = '/login';
}

