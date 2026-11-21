const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const sa = require('../firebase-service-account.json');

const app = initializeApp({
  credential: cert(sa),
  projectId: sa.project_id,
});

async function run() {
  const auth = getAuth(app);
  const manager = auth.projectConfigManager();

  console.log('📡 Fetching current Identity Platform project config...');
  try {
    const currentConfig = await manager.getProjectConfig();
    console.log('✅ Current project config:\n', JSON.stringify(currentConfig, null, 2));
  } catch (e) {
    console.warn('⚠️ Could not fetch current config:', e.message);
  }

  console.log('🔧 Updating project config to turn OFF reCAPTCHA Enterprise enforcement & SMS toll fraud blocks...');
  try {
    const updated = await manager.updateProjectConfig({
      recaptchaConfig: {
        emailPasswordEnforcementState: 'OFF',
        phoneEnforcementState: 'OFF',
        useSmsTollFraudProtection: false,
      },
    });
    console.log('🎉 Project config updated successfully!');
    console.log(JSON.stringify(updated, null, 2));
  } catch (err) {
    console.error('❌ Failed to update config:', err.message, err);
  }
}

run();
