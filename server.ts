import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

const DEFAULT_PROFILE = {
  role: "",
  responsibilityArea: "",
  teamPosition: "",
  availability: "",
  bio: "",
  emailNotifications: true,
  showRole: true,
  publicVisibility: false,
  profileCompleted: true,
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const DB_PATH = path.join(process.cwd(), "db.json");

  const getDb = () => {
    if (!fs.existsSync(DB_PATH)) {
      return { users: [], projects: [], tasks: [], evaluations: [] };
    }
    const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    if (!data.users) data.users = [];
    if (!data.projects) data.projects = [];
    if (!data.tasks) data.tasks = [];
    if (!data.evaluations) data.evaluations = [];
    return data;
  };

  /** Normalize a task to ensure explicit completion fields exist */
  const normalizeTask = (t: any) => ({
    ...t,
    isCompleted: t.isCompleted ?? t.completed ?? false,
    completedByUserId: t.completedByUserId ?? null,
    completedAt: t.completedAt ?? null,
  });

  const saveDb = (data: any) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  };

  const sanitizeUser = (user: any) => {
    const { password, ...safeUser } = user;
    return safeUser;
  };

  app.post("/api/auth/register", (req, res) => {
    const db = getDb();
    const { email, password, name, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const resolvedName =
      name?.trim() ||
      [firstName, lastName].filter(Boolean).join(" ").trim();

    if (!resolvedName) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (db.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newUser = {
      id: Math.random().toString(36).substring(7),
      email,
      password,
      name: resolvedName,
      firstName: firstName?.trim() || resolvedName.split(" ")[0] || "",
      lastName: lastName?.trim() || resolvedName.split(" ").slice(1).join(" ") || "",
      ...DEFAULT_PROFILE,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDb(db);

    res.status(201).json(sanitizeUser(newUser));
  });

  app.post("/api/auth/login", (req, res) => {
    const db = getDb();
    const { email, password } = req.body;

    const user = db.users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json(sanitizeUser(user));
  });

  app.get("/api/users/profile", (req, res) => {
    const db = getDb();
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = db.users.find((u: any) => u.email === email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(sanitizeUser(user));
  });

  app.get("/api/users/by-email", (req, res) => {
    const db = getDb();
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = db.users.find((u: any) => u.email === email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      email: user.email,
      name: user.name,
      role: user.role || "",
      showRole: user.showRole ?? true,
    });
  });

  app.put("/api/users/profile", (req, res) => {
    const db = getDb();
    const { email, ...updates } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const index = db.users.findIndex((u: any) => u.email === email);
    if (index === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const allowedFields = [
      "name",
      "firstName",
      "lastName",
      "role",
      "responsibilityArea",
      "teamPosition",
      "availability",
      "bio",
      "emailNotifications",
      "showRole",
      "publicVisibility",
      "profileCompleted",
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        db.users[index][field] = updates[field];
      }
    }

    if (updates.firstName || updates.lastName) {
      const first = updates.firstName ?? db.users[index].firstName ?? "";
      const last = updates.lastName ?? db.users[index].lastName ?? "";
      db.users[index].name = `${first} ${last}`.trim();
    }

    saveDb(db);
    res.json(sanitizeUser(db.users[index]));
  });

  app.get("/api/evaluations", (req, res) => {
    const db = getDb();
    const projectId = req.query.projectId as string;
    const email = req.query.email as string;

    let evaluations = db.evaluations;

    if (projectId) {
      evaluations = evaluations.filter((item: any) => item.projectId === projectId);
    }

    if (email) {
      evaluations = evaluations.filter(
        (item: any) => item.evaluatorEmail === email || item.targetEmail === email
      );
    }

    res.json(evaluations);
  });

  // Shared project evaluations endpoint — strips anonymous identity server-side
  app.get("/api/evaluations/project/:projectId", (req, res) => {
    const db = getDb();
    const projectId = req.params.projectId;

    const projectEvaluations = db.evaluations
      .filter((e: any) => e.projectId === projectId)
      .map((e: any) => {
        const targetUser = db.users.find((u: any) => u.email === e.targetEmail);
        const targetName = targetUser?.name || e.targetEmail.split("@")[0];

        if (e.mode === "anonymous") {
          return {
            id: e.id,
            projectId: e.projectId,
            evaluatorEmail: "anonymous",
            evaluatorName: "Anonymous",
            targetEmail: e.targetEmail,
            targetName,
            score: e.score,
            comment: e.comment || "",
            mode: e.mode,
            createdAt: e.createdAt,
          };
        }

        const evaluatorUser = db.users.find((u: any) => u.email === e.evaluatorEmail);
        return {
          id: e.id,
          projectId: e.projectId,
          evaluatorEmail: e.evaluatorEmail,
          evaluatorName: evaluatorUser?.name || e.evaluatorEmail.split("@")[0],
          targetEmail: e.targetEmail,
          targetName,
          score: e.score,
          comment: e.comment || "",
          mode: e.mode,
          createdAt: e.createdAt,
        };
      });

    res.json(projectEvaluations);
  });

  app.post("/api/evaluations", (req, res) => {
    const db = getDb();
    const { projectId, evaluatorEmail, targetEmail, score, comment, mode } = req.body;

    if (!projectId || !evaluatorEmail || !targetEmail || !score) {
      return res.status(400).json({ error: "Missing required evaluation fields" });
    }

    const existingIndex = db.evaluations.findIndex(
      (item: any) =>
        item.projectId === projectId &&
        item.evaluatorEmail === evaluatorEmail &&
        item.targetEmail === targetEmail
    );

    const evaluation = {
      id: existingIndex >= 0 ? db.evaluations[existingIndex].id : Math.random().toString(36).substring(7),
      projectId,
      evaluatorEmail,
      targetEmail,
      score,
      comment: comment || "",
      mode: mode || "identified",
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      db.evaluations[existingIndex] = evaluation;
    } else {
      db.evaluations.push(evaluation);
    }

    saveDb(db);
    res.status(existingIndex >= 0 ? 200 : 201).json(evaluation);
  });

  app.get("/api/users/:email/peer-score", (req, res) => {
    const db = getDb();
    const email = req.params.email;
    const projectId = req.query.projectId as string | undefined;

    let evaluations = db.evaluations.filter((item: any) => item.targetEmail === email);
    if (projectId) {
      evaluations = evaluations.filter((item: any) => item.projectId === projectId);
    }

    if (evaluations.length === 0) {
      return res.json({ score: null, count: 0 });
    }

    const average =
      evaluations.reduce((sum: number, item: any) => sum + Number(item.score), 0) / evaluations.length;

    res.json({ score: Number(average.toFixed(1)), count: evaluations.length });
  });

  app.get("/api/projects", (req, res) => {
    const db = getDb();
    const email = req.query.email as string;

    if (email) {
      const userProjects = db.projects.filter(
        (p: any) =>
          p.ownerId === email || (p.members && p.members.some((m: any) => m.email === email))
      );
      res.json(userProjects);
    } else {
      res.json(db.projects);
    }
  });

  app.post("/api/projects", (req, res) => {
    const db = getDb();
    const newProject = req.body;
    db.projects.push(newProject);
    saveDb(db);
    res.status(201).json(newProject);
  });

  app.get("/api/tasks", (req, res) => {
    const db = getDb();
    const email = req.query.email as string;

    if (email) {
      const userProjects = db.projects.filter(
        (p: any) =>
          p.ownerId === email || (p.members && p.members.some((m: any) => m.email === email))
      );
      const projectIds = userProjects.map((p: any) => p.id);
      const userTasks = db.tasks.filter((t: any) => projectIds.includes(t.projectId));
      res.json(userTasks.map(normalizeTask));
    } else {
      res.json(db.tasks.map(normalizeTask));
    }
  });

  app.get("/api/tasks/:projectId", (req, res) => {
    const db = getDb();
    const projectId = req.params.projectId;
    const tasks = db.tasks.filter((t: any) => t.projectId === projectId);
    res.json(tasks.map(normalizeTask));
  });

  app.post("/api/tasks", (req, res) => {
    const db = getDb();
    const newTask = req.body;
    db.tasks.push(newTask);
    saveDb(db);
    res.status(201).json(newTask);
  });

  app.patch("/api/tasks/:taskId", (req, res) => {
    const db = getDb();
    const taskId = req.params.taskId;
    const updates = req.body;

    db.tasks = db.tasks.map((t: any) => (t.id === taskId ? { ...t, ...updates } : t));

    saveDb(db);
    res.json({ success: true });
  });

  app.put("/api/projects/:projectId", (req, res) => {
    const db = getDb();
    const projectId = req.params.projectId;
    const updatedProject = req.body;

    const index = db.projects.findIndex((p: any) => p.id === projectId);
    if (index !== -1) {
      db.projects[index] = { ...db.projects[index], ...updatedProject };
      saveDb(db);
      res.json(db.projects[index]);
    } else {
      res.status(404).json({ error: "Project not found" });
    }
  });

  app.put("/api/tasks/:taskId", (req, res) => {
    const db = getDb();
    const taskId = req.params.taskId;
    const updatedTask = req.body;

    const index = db.tasks.findIndex((t: any) => t.id === taskId);
    if (index !== -1) {
      db.tasks[index] = { ...db.tasks[index], ...updatedTask };
      saveDb(db);
      res.json(db.tasks[index]);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  });

  app.delete("/api/projects/:projectId", (req, res) => {
    const db = getDb();
    const projectId = req.params.projectId;

    db.projects = db.projects.filter((p: any) => p.id !== projectId);
    db.tasks = db.tasks.filter((t: any) => t.projectId !== projectId);
    db.evaluations = db.evaluations.filter((item: any) => item.projectId !== projectId);
    saveDb(db);
    res.json({ success: true });
  });

  app.delete("/api/tasks/:taskId", (req, res) => {
    const db = getDb();
    const taskId = req.params.taskId;

    db.tasks = db.tasks.filter((t: any) => t.id !== taskId);
    saveDb(db);
    res.json({ success: true });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
