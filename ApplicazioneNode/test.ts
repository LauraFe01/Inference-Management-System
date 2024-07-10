import { Request, Response, NextFunction } from 'express';

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
    const{email, password}= req.body;
    console.log(`[${new Date().toISOString()}] ${email} ${password}`);
    next(); // Passa il controllo al prossimo middleware
}