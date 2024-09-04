import passport from 'passport';
import express from 'express';
const router = express.Router();

router.post(
  '/login/callback',
  passport.authenticate('saml', {
    failureRedirect: '/',
    failureFlash: true,
  }),
  function (req, res) {
    res.redirect('/');
  }
);

router.get(
  '/auth/saml',
  passport.authenticate('saml', {
    failureRedirect: '/',
    failureFlash: true,
  }),
  function (req, res) {
    res.redirect('/');
  }
);

export default router;
