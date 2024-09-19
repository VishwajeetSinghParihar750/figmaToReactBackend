export const checkAuthenticated = (req, res, next) => {
  console.log("Session: ", req.session);
  console.log("User: ", req.user);
  console.log("Is Authenticated: ", req.isAuthenticated());
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.status(401).json({ error: true, message: "Not authenticated" });
  }
};
