import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  // Handle case where password is not properly hashed (during development)
  if (!stored || !stored.includes('.')) {
    return supplied === stored;
  }
  
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    return false;
  }
  
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "spacehub-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ passReqToCallback: true }, async (req, username, password, done) => {
      try {
        console.log(`Login attempt for username: ${username}, department: ${req.body.department}`);
        
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`User not found: ${username}`);
          return done(null, false);
        }
        
        const department = (req.body.department || '').toString();
        if (user.department !== department) {
          console.log(`Department mismatch: User is in ${user.department}, login attempt for ${department}`);
          return done(null, false);
        }
        
        const passwordMatches = await comparePasswords(password, user.password);
        if (!passwordMatches) {
          console.log(`Password mismatch for user: ${username}`);
          return done(null, false);
        }
        
        console.log(`Login successful for ${username} (${user.role})`);
        return done(null, user);
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, name, role, department } = req.body;
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        name,
        role,
        department
      });

      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user without the password
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials or department" });

      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        
        // Return user without the password
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Return user without the password
    const userWithoutPassword = { ...req.user };
    delete userWithoutPassword.password;
    
    res.json(userWithoutPassword);
  });
}