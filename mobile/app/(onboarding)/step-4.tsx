import { useRouter } from 'expo-router';
import { useHeartbeat } from '../../hooks/animations';
import { OnboardingStep } from '../../components/onboarding/OnboardingStep';
import IMAGE from '../../assets/onboarding/merki_checkout.png';

export default function OnboardingStep4() {
  const router = useRouter();
  const heartbeat = useHeartbeat({ to: 1.06, beat: 240, rest: 2200 });

  return (
    <OnboardingStep
      image={IMAGE}
      title="Cuentas claras y adiós "
      titleAccent="pena"
      subtitle="Llega a la caja sabiendo exactamente cuánto vas a pagar. Sin sorpresas, sin caras rojas."
      stepIndex={4}
      totalSteps={4}
      imageAnimatedStyle={heartbeat}
      showBack
      onBack={() => router.back()}
      onNext={() => router.push('/(onboarding)/login-choice')}
    />
  );
}
