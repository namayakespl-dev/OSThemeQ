import { GameProvider } from './context/GameContext';
import { Desktop } from './components/Desktop/Desktop';

function App() {
  return (
    <GameProvider>
      <Desktop />
    </GameProvider>
  );
}

export default App;
