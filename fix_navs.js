const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'frontend', 'views');
const files = ['admin_users.html', 'dashboard.html', 'gestion_postulantes.html', 'mis_postulaciones.html', 'perfil.html', 'postular.html', 'vacantes.html'];

files.forEach(file => {
    const filePath = path.join(viewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove existing <nav> block
    content = content.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, '');
    
    // Check if script already added
    if (!content.includes('navbar.js')) {
        const pageName = file.replace('.html', '').replace('-', '_');
        content = content.replace('</body>', `<script src="/navbar.js"></script>\n<script>renderNavbar('${pageName}');</script>\n</body>`);
        content = content.replace(/function logout\(\)\s*{[\s\S]*?}/g, '');
    }

    fs.writeFileSync(filePath, content);
    console.log('Updated ' + file);
});
