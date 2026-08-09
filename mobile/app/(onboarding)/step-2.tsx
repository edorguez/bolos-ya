import { useRouter } from 'expo-router';
import { useSway } from '../../hooks/animations';
import { OnboardingStep } from '../../components/onboarding/OnboardingStep';
import IMAGE from '../../assets/onboarding/merki_calculator.png';

export default function OnboardingStep2() {
  const router = useRouter();
  const sway = useSway({ degrees: 4, duration: 3600 });

  return (
    <OnboardingStep
      image={IMAGE}
      title="Calcula sobre la "
      titleAccent="marcha"
      subtitle="Adiós a las sumas de cabeza. Mira el total de tu carrito al instante, en Bolívares y en dólares."
      stepIndex={2}
      totalSteps={4}
      imageAnimatedStyle={sway}
      showBack
      onBack={() => router.back()}
      onNext={() => router.push('/(onboarding)/step-3')}
    />
  );
}
