import { useState, useEffect } from 'react';
import Head from 'next/head';

// Dummy data for players
const dummyPlayers = [
  { name: "LeBron James", sport: "Basketball", age: 39, country: "USA", olympics: 3, championships: 4 },
  { name: "Lionel Messi", sport: "Soccer", age: 36, country: "Argentina", olympics: 1, championships: 1 },
  { name: "Simone Biles", sport: "Gymnastics", age: 27, country: "USA", olympics: 7, championships: 25 },
  { name: "Novak Djokovic", sport: "Tennis", age: 37, country: "Serbia", olympics: 1, championships: 24 },
  { name: "Lewis Hamilton", sport: "Formula 1", age: 39, country: "UK", olympics: 0, championships: 7 },
  { name: "Katie Ledecky", sport: "Swimming", age: 27, country: "USA", olympics: 10, championships: 21 },
  { name: "Tom Brady", sport: "Football", age: 46, country: "USA", olympics: 0, championships: 7 },
  { name: "Serena Williams", sport: "Tennis", age: 42, country: "USA", olympics: 4, championships: 23 },
  { name: "Rafael Nadal", sport: "Tennis", age: 37, country: "Spain", olympics: 2, championships: 22 },
  { name: "Sidney Crosby", sport: "Hockey", age: 36, country: "Canada", olympics: 2, championships: 3 },
];
// Game state interface
interface GameState {
  mysteryPlayer: typeof dummyPlayers[0] | null;
  guesses: typeof dummyPlayers[0][];
  gameOver: boolean;
  won: boolean;
  gaveUp: boolean;
  loading: boolean;
  maxGuesses: number;
}
export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<typeof dummyPlayers>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    mysteryPlayer: null,
    guesses: [],
    gameOver: false,
    won: false,
    gaveUp: false,
    loading: true,
    maxGuesses: 8
  });

  // Initialize game on component mount
  useEffect(() => {
    // Select a random player as the mystery player
    const randomIndex = Math.floor(Math.random() * dummyPlayers.length);
    setGameState(prev => ({
      ...prev,
      mysteryPlayer: dummyPlayers[randomIndex],
      loading: false
    }));
    
    // Check if user has played before
    const hasPlayed = localStorage.getItem('cdlWordleHasPlayed');
    if (hasPlayed) {
      setShowInstructions(false);
    } else {
      localStorage.setItem('cdlWordleHasPlayed', 'true');
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 0) {
      const filtered = dummyPlayers.filter(player => 
        player.name.toLowerCase().includes(term.toLowerCase()) &&
        !gameState.guesses.some(guess => guess.name === player.name)
      );
      setFilteredPlayers(filtered);
    } else {
      setFilteredPlayers([]);
    }
  };

  // Handle player selection
  const selectPlayer = (player: typeof dummyPlayers[0]) => {
    setSearchTerm('');
    setFilteredPlayers([]);
    
    // Check if player is already guessed
    if (gameState.guesses.some(guess => guess.name === player.name)) {
      return;
    }
    
    // Check if player is the mystery player
    const isCorrect = player.name === gameState.mysteryPlayer?.name;
    
    const newGuesses = [...gameState.guesses, player];
    
    setGameState(prev => ({
      ...prev,
      guesses: newGuesses,
      gameOver: isCorrect || newGuesses.length >= prev.maxGuesses,
      won: isCorrect
    }));
  };

  // Handle give up
  const handleGiveUp = () => {
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      gaveUp: true
    }));
  };

  // Handle new game
  const handleNewGame = () => {
    const randomIndex = Math.floor(Math.random() * dummyPlayers.length);
    setGameState({
      mysteryPlayer: dummyPlayers[randomIndex],
      guesses: [],
      gameOver: false,
      won: false,
      gaveUp: false,
      loading: false,
      maxGuesses: 8
    });
  };

  // Check if a property matches the mystery player
const isMatch = (guess: typeof dummyPlayers[0], property: keyof typeof dummyPlayers[0]) => {
  if (!gameState.mysteryPlayer) return false;
  return guess[property] === gameState.mysteryPlayer[property];
};

  // Get directional hint for numeric values
  const getDirectionalHint = (guess: typeof dummyPlayers[0], property: 'age' | 'olympics' | 'championships') => {
    if (!gameState.mysteryPlayer) return null;
    
    if (guess[property] === gameState.mysteryPlayer[property]) {
      return null;
    }
    
    if (guess[property] < gameState.mysteryPlayer[property]) {
      return <span className={`directionalHint higher`}>↑</span>;
    } else {
      return <span className={`directionalHint lower`}>↓</span>;
    }
  };
  // Share results
  const shareResults = () => {
    if (!gameState.mysteryPlayer) return;
    
    let shareText = `Sports Wordle - ${gameState.mysteryPlayer.name}\n`;
    shareText += gameState.won ? `I got it in ${gameState.guesses.length}/${gameState.maxGuesses} guesses!` : 'I gave up!';
    shareText += '\n\n';
    
    // Add emoji grid representation of guesses
    gameState.guesses.forEach(guess => {
      const sportMatch = isMatch(guess, 'sport') ? '🟩' : '⬜';
      const countryMatch = isMatch(guess, 'country') ? '🟩' : '⬜';
      const ageMatch = isMatch(guess, 'age') ? '🟩' : '⬜';
      const olympicsMatch = isMatch(guess, 'olympics') ? '🟩' : '⬜';
      const championshipsMatch = isMatch(guess, 'championships') ? '🟩' : '⬜';
      
      shareText += `${sportMatch}${countryMatch}${ageMatch}${olympicsMatch}${championshipsMatch}\n`;
    });
    
    shareText += '\nPlay at: https://sportswordle.me';
  
    navigator.clipboard.writeText(shareText)
      .then(() => alert('Results copied to clipboard!'))
      .catch(() => alert('Failed to copy results. Please try again.'));
  };
  

  if (gameState.loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <Head>
        <title>CDL Wordle</title>
        <meta name="description" content="Guess the CDL player" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <h1 className="title">CDL Wordle</h1>
        
        {showInstructions && (
          <div className="instructions">
            <p>Guess the mystery CDL player in {gameState.maxGuesses} tries or less!</p>
            <p>Green cells indicate a match with the mystery player.</p>
            <p>For numeric values, arrows indicate if the mystery player's value is higher (↑) or lower (↓).</p>
            <button 
              className="newGameButton" 
              onClick={() => setShowInstructions(false)}
            >
              Got it!
            </button>
          </div>
        )}
        
        {!gameState.gameOver ? (
          <>
            <div className="gameControls">
              <div className="searchContainer">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Start typing to guess a player..."
                  className="searchInput"
                />
                {filteredPlayers.length > 0 && (
                  <div className="dropdown">
                    {filteredPlayers.map((player) => (
                      <div 
                        key={player.name} 
                        className="dropdownItem"
                        onClick={() => selectPlayer(player)}
                      >
                        {player.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="buttonContainer">
                <button 
                  className="guessButton"
                  onClick={() => {
                    if (filteredPlayers.length > 0) {
                      selectPlayer(filteredPlayers[0]);
                    }
                  }}
                  disabled={filteredPlayers.length === 0}
                >
                  Guess
                </button>
                <button 
                  className="giveUpButton"
                  onClick={handleGiveUp}
                  disabled={gameState.guesses.length === 0}
                >
                  Give up
                </button>
              </div>
            </div>

            <div className="guessCount">
              Guesses: {gameState.guesses.length}/{gameState.maxGuesses}
            </div>

            <div className="guessesContainer">
  {gameState.guesses.length > 0 && (
    <table className="guessTable">
      <thead>
        <tr>
          <th>Name</th>
          <th>Sport</th>
          <th>Country</th>
          <th>Age</th>
          <th>Olympics</th>
          <th>Championships</th>
        </tr>
      </thead>
      <tbody>
        {gameState.guesses.map((guess, index) => (
          <tr key={index}>
            <td>{guess.name}</td>
            <td className={isMatch(guess, 'sport') ? "match" : ''}>
              {guess.sport}
            </td>
            <td className={isMatch(guess, 'country') ? "match" : ''}>
              {guess.country}
            </td>
            <td className={isMatch(guess, 'age') ? "match" : ''}>
              {guess.age}
              {!isMatch(guess, 'age') && getDirectionalHint(guess, 'age')}
            </td>
            <td className={isMatch(guess, 'olympics') ? "match" : ''}>
              {guess.olympics}
              {!isMatch(guess, 'olympics') && getDirectionalHint(guess, 'olympics')}
            </td>
            <td className={isMatch(guess, 'championships') ? "match" : ''}>
              {guess.championships}
              {!isMatch(guess, 'championships') && getDirectionalHint(guess, 'championships')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
          </>
        ) : (
          <div className="gameOverContainer">
            <h2>The mystery player was:</h2>
            <h1 className="mysteryPlayerReveal">
              {gameState.mysteryPlayer?.name}
            </h1>
            
            {gameState.won ? (
              <p>You got it in {gameState.guesses.length} tries!</p>
            ) : (
              <p>You {gameState.gaveUp ? 'gave up' : 'ran out of guesses'} after {gameState.guesses.length} guesses.</p>
            )}
            
            <button 
              className="shareButton"
              onClick={shareResults}
            >
              Share Results
            </button>
            
            <button 
              className="newGameButton"
              onClick={handleNewGame}
            >
              New Game
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Created by Diz</p>
        <p>This site is not affiliated with the Call of Duty League or Activision.</p>
      </footer>
    </div>
  );
}