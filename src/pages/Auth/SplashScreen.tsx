import { useEffect } from "react";
import "./SplashScreen.css";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000); // ⏳ Dura 2 segundos
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-container">
      <div className="splash-logo">
        <img src="/logo-licosys.svg" alt="LicoSys" className="splash-icon" />
        <h1 className="splash-title">LicoSys</h1>
        <p className="splash-subtitle">Sistema de gestión de licorería</p>
      </div>
    </div>
  );
}
