import { useFloat } from '../../hooks/animations';
import { OnboardingStep } from '../../components/onboarding/OnboardingStep';
import IMAGE from '../../assets/onboarding/merki.png';

export default function OnboardingStep1() {
  const float = useFloat({ distance: 10, duration: 3200 });

  return (
    <OnboardingStep
      image={IMAGE}
      title="¡Hola! Soy "
      titleAccent="Merki"
      subtitle="Tu compañero de compras. Registra cada producto y ten tu total siempre bajo control."
      imageAnimatedStyle={float}
    />
  );
}
