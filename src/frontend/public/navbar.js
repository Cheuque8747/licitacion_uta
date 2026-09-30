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
                    <span class="me-3 fw-medium text-light"><i class="bi bi-person-circle me-1"></i>${user.nombre_completo.split(' ')[0]} (${user.rol})</span>
                    <button class="btn btn-outline-danger btn-sm" onclick="logout()">
                        <i class="bi bi-box-arrow-right me-1"></i>Cerrar SesiÃ³n
                    </button>
                </div>
            </div>
        </div>
    </nav>
    <div style="height: 70px;"></div> <!-- Spacer para fixed-top -->
    `;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Importante para limpiar la sesion antigua
    window.location.href = '/login';
}

