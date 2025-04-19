import { useState, useEffect } from 'react';
import Head from 'next/head';
import SEO from '@/components/SEO';
import SportsBanner from '@/components/SportsBanner';
import NewsTicker from '@/components/NewsTicker';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Player interface
interface Player {
  name: string;
  sport: string;
  age: number;
  country: string;
  olympics: number;
  championships: number;
}

// Game state interface
interface GameState {
  mysteryPlayer: Player | null;
  guesses: Player[];
  gameOver: boolean;
  won: boolean;
  gaveUp: boolean;
  loading: boolean;
  maxGuesses: number;
}

export async function getStaticProps() {
  const csvFilePath = path.join(process.cwd(), 'public', 'sportswordle.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf8');
  
  // Parse the CSV file
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    cast: (value, context) => {
      // Convert numeric values to numbers
      if (context.column === 'Age' || context.column === 'Olympics' || context.column === 'Championships') {
        return parseInt(value, 10);
      }
      return value;
    }
  });

  // Transform to match our Player interface
  const players: Player[] = records.map((record: any) => ({
    name: record.Name,
    sport: record.Sport,
    age: record.Age,
    country: record.Country,
    olympics: record.Olympics,
    championships: record.Championships
  }));

  return {
    props: {
      players
    }
  };
}

export default function Home({ players }: { players: Player[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
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
    const randomIndex = Math.floor(Math.random() * players.length);
    setGameState(prev => ({
      ...prev,
      mysteryPlayer: players[randomIndex],
      loading: false
    }));
    
    // Check if user has played before
    const hasPlayed = localStorage.getItem('cdlWordleHasPlayed');
    if (hasPlayed) {
      setShowInstructions(false);
    } else {
      localStorage.setItem('cdlWordleHasPlayed', 'true');
    }
  }, [players]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 0) {
      const filtered = players.filter(player => 
        player.name.toLowerCase().includes(term.toLowerCase()) &&
        !gameState.guesses.some(guess => guess.name === player.name)
      );
      setFilteredPlayers(filtered);
    } else {
      setFilteredPlayers([]);
    }
  };

  // Handle player selection
  const selectPlayer = (player: Player) => {
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
    const randomIndex = Math.floor(Math.random() * players.length);
    setGameState({
      mysteryPlayer: players[randomIndex],
      guesses: [],
      gameOver: false,
      won: false,
      gaveUp: false,
      loading: false,
      maxGuesses: 8
    });
  };

  // Check if a property matches the mystery player
  const isMatch = (guess: Player, property: keyof Player) => {
    if (!gameState.mysteryPlayer) return false;
    return guess[property] === gameState.mysteryPlayer[property];
  };

  // Get directional hint for numeric values
  const getDirectionalHint = (guess: Player, property: 'age' | 'olympics' | 'championships') => {
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
    <div className=" ">
      <SEO/>
      <div className="fixedBannerContainer">
        <SportsBanner />
        <NewsTicker/>
      </div>
      <main className="mainWithFixedBanner">
        {/* <h1 className="title">Sports Wordle</h1> */}
        {/* Fixed always-visible instructions section */}
        <div className="instructions">
          <p>Guess the mystery sports player in {gameState.maxGuesses} tries or less!</p>
          <p>Green cells indicate a match with the mystery player.</p>
          <p>For numeric values, arrows indicate if the mystery player's value is higher (↑) or lower (↓).</p>
          <button 
            className="instructionButton"
            onClick={() => setShowInstructions(false)}
          >
            Got it!
          </button>
        </div>
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
                {/* Parameter boxes to show what users are guessing */}
                <div className="parameterBoxesContainer">
              <div className="parameterBox sportBox">
                <span>Sport</span>
              </div>
              <div className="parameterBox countryBox">
                <span>Country</span>
              </div>
              <div className="parameterBox ageBox">
                <span>Age</span>
              </div>
              <div className="parameterBox olympicsBox">
                <span>Olympics</span>
              </div>
              <div className="parameterBox championshipsBox">
                <span>Championships</span>
              </div>
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
        <p>This site is not affiliated with any sports organization.</p>
      </footer>
    </div>
  );
}