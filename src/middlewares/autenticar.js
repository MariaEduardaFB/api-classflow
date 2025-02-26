import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

const autenticar = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Token não fornecido!' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.alunoId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido ou expirado!' });
    }
};

export default autenticar;