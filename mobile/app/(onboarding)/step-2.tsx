import { useFloat } from '../../hooks/animations';
import { OnboardingStep } from '../../components/onboarding/OnboardingStep';
import IMAGE from '../../assets/onboarding/merki_calculator.png';

export default function OnboardingStep2() {
  const float = useFloat({ distance: 10, duration: 3200 });

  return (
    <OnboardingStep
      image={IMAGE}
      title="Calcula sobre la "
      titleAccent="marcha"
      subtitle="Adiós a las sumas de cabeza. Mira el total de tu carrito al instante, en Bolívares y en dólares."
      imageAnimatedStyle={float}
    />
  );
}
