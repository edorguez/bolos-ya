import { useRouter } from 'expo-router';
import { useFloat } from '../../hooks/animations';
import { OnboardingStep } from '../../components/onboarding/OnboardingStep';
import IMAGE from '../../assets/onboarding/merki.png';

export default function OnboardingStep1() {
  const router = useRouter();
  const float = useFloat({ distance: 10, duration: 3200 });

  return (
    <OnboardingStep
      image={IMAGE}
      title="¡Hola! Soy "
      titleAccent="Merki"
      subtitle="Bienvenido a MercadoLibreta, tu libreta de compras. Registra cada producto y ten tu total siempre bajo control."
      stepIndex={1}
      totalSteps={4}
      imageAnimatedStyle={float}
      onNext={() => router.push('/(onboarding)/step-2')}
    />
  );
}
