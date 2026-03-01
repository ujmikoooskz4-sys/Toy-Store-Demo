export function requireAdmin(
  req: any,
  res: any,
  next: any
) {
  if(req.session?.user?.role === "admin") {
    return next();
  }
    return res.redirect("/admin/login.html"); // send non-admin away
  }
  
