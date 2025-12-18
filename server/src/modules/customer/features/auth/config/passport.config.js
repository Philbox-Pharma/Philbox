import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Customer from '../../../../../models/Customer.js';
import Role from '../../../../../models/Role.js';

passport.use(
  'customer-google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CUSTOMER_CALLBACK_URL, // Ensure this env var exists
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const fullName = profile.displayName;
        const profile_img_url = profile.photos[0]?.value;

        // Check if Customer exists
        let customer = await Customer.findOne({ email: email.toLowerCase() });

        if (customer) {
          // If customer exists but no OAuth ID linked, link it
          if (!customer.oauthId) {
            customer.oauthId = profile.id;
            await customer.save();
          }
          return done(null, customer);
        }

        // Create new Customer
        // 🔐 RBAC - Fetch customer role for new OAuth user
        const customerRole = await Role.findOne({ name: 'customer' });
        if (!customerRole) {
          throw new Error('CUSTOMER_ROLE_NOT_FOUND');
        }

        customer = new Customer({
          fullName,
          email: email.toLowerCase(),
          profile_img_url: profile_img_url,
          is_Verified: true, // Google trusted
          account_status: 'active',
          oauthId: profile.id,
          roleId: customerRole._id, // 🔐 RBAC - Assign customer role
          created_at: Date.now(),
          updated_at: Date.now(),
        });

        await customer.save();
        return done(null, customer);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user
passport.serializeUser((customer, done) => {
  done(null, customer._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const customer = await Customer.findById(id);
    done(null, customer);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
