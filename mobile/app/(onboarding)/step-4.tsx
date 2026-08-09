import { useRouter } from 'expo-router';
import { useFloat } from '../../hooks/animations';
import { OnboardingStep } from '../../components/onboarding/OnboardingStep';
import IMAGE from '../../assets/onboarding/merki_checkout.png';

export default function OnboardingStep4() {
  const router = useRouter();
  const float = useFloat({ distance: 10, duration: 3200 });

  return (
    <OnboardingStep
      image={IMAGE}
      title="Cuentas claras y adiós "
      titleAccent="pena"
      subtitle="Llega a la caja sabiendo exactamente cuánto vas a pagar. Sin sorpresas, sin caras rojas."
      stepIndex={4}
      totalSteps={4}
      imageAnimatedStyle={float}
      showBack
      onBack={() => router.back()}
      onNext={() => router.push('/(onboarding)/login-choice')}
    />
  );
}
