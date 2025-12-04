import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Doctor from '../../../../models/Doctor.js';

// Google Strategy
passport.use(
  'doctor-google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const fullName = profile.displayName;
        const profile_img_url = profile.photos[0]?.value;

        // Check if doctor exists
        let doctor = await Doctor.findOne({ email: email.toLowerCase() });

        if (doctor) {
          // Doctor exists, return doctor
          return done(null, doctor);
        }

        // Create new doctor with OAuth data
        doctor = new Doctor({
          fullName,
          email: email.toLowerCase(),
          profile_img_url:
            profile_img_url ||
            `https://avatar.iran.liara.run/username?username=${fullName}`,
          is_Verified: true, // OAuth emails are pre-verified
          account_status: 'suspended/freezed',
          onboarding_status: 'pending',
          oauth_provider: 'google',
          oauth_id: profile.id,
        });

        await doctor.save();
        return done(null, doctor);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user
passport.serializeUser((doctor, done) => {
  done(null, doctor._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const doctor = await Doctor.findById(id);
    done(null, doctor);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
