const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ success: false, error: 'No se proporcionó un token de autenticación.' });

    const token = authHeader.split(' ')[1]; // Formato: Bearer <token>
    if (!token) return res.status(401).json({ success: false, error: 'Token inválido o malformado.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Guardamos los datos del usuario (id, rol, etc) en req.user
        next();
    } catch (error) {
        return res.status(403).json({ success: false, error: 'Token expirado o inválido.' });
    }
};

const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Usuario no autenticado.' });
        }
        
        // rolesPermitidos puede ser un string o un array de strings
        const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
        
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ success: false, error: 'Acceso Denegado: No tienes permisos suficientes.' });
        }
        
        next();
    };
};

module.exports = { verificarToken, verificarRol };
