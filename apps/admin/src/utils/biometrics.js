import { NativeBiometric } from 'capacitor-native-biometric';

/**
 * Checks if biometric authentication is available on the device.
 */
export const checkBiometricsAvailable = async () => {
  try {
    const result = await NativeBiometric.isAvailable();
    return !!result.isAvailable;
  } catch (error) {
    console.error('Biometric availability check failed:', error);
    return false;
  }
};

/**
 * Triggers a biometric authentication prompt.
 */
export const authenticateWithBiometrics = async (reason = 'Authenticate to continue') => {
  try {
    const available = await checkBiometricsAvailable();
    if (!available) return false;

    await NativeBiometric.verifyIdentity({
      reason,
      title: 'Log in',
      subtitle: 'Scan your finger to continue',
      description: reason,
    });

    return true;
  } catch (error) {
    // Error code 100 means user cancelled (usually). We don't alert for cancellations.
    if (error.code !== 100) {
        console.error('Biometric Auth Error:', error.message);
    }
    return false;
  }
};
