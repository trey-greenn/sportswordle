import { useState, useEffect } from 'react';
import Head from 'next/head';
import SEO from '@/components/SEO';
import SportsBanner from '@/components/SportsBanner';
import NewsTicker from '@/components/NewsTicker';
import SportFilter from '@/components/SportFilter';
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
  const [showMobileFilter, setShowMobileFilter] = useState(false);

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
  
  return guess[property] < gameState.mysteryPlayer[property] ? 'higher' : 'lower';
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
<div className="w-full">
<SEO/>
      <div className="fixedBannerContainer ">
        <SportsBanner />
      </div>
      <main className="mainWithFixedBanner flex flex-col items-center">        
        <div className="w-full flex flex-col items-center">
          {/* Mobile sport filter toggle */}
          {/* <div className="md:hidden mb-4">
            <button className="w-full py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" 
                    onClick={() => setShowMobileFilter(prev => !prev)}>
              Filter Sports {showMobileFilter ? '↑' : '↓'}
            </button>
            {showMobileFilter && (
              // <div className="mt-2">
              //   <SportFilter />
              // </div>
            )}
          </div> */}
          
          {/* Desktop sidebar */}
          {/* <div className="hidden md:block md:w-1/5 lg:w-1/6 flex-shrink-0 md:sticky md:top-20 md:h-screen md:pt-6 md:pr-4">
            <SportFilter />
          </div> */}
          
          {/* Main content */}
          <div className="">
            {/* Centered Game Controls Section with border and background */}
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6 mb-8">
              {/* Instructions Section */}
              <div className="instructions mb-6 text-center">
                <p>Guess the mystery sports player in {gameState.maxGuesses} tries or less!</p>
                <p>Green cells indicate a match with the mystery player.</p>
                <p>For numeric values, arrows indicate if the mystery player's value is higher (↑) or lower (↓).</p>
                <button 
                  className="instructionButton mx-auto mt-2"
                  onClick={() => setShowInstructions(false)}
                >
                  Got it!
                </button>
              </div>
              
              {!gameState.gameOver ? (
                <>
                  <div className="gameControls mb-5 flex flex-col items-center">
                    <div className="searchContainer w-full max-w-xl">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Start typing to guess a player..."
                        className="searchInput w-full"
                      />
                      {filteredPlayers.length > 0 && (
                        <div className="dropdown w-full">
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
                    
                    <div className="buttonContainer mt-4 flex justify-center space-x-4">
                      <button 
                        className="guessButton min-w-[100px] px-4 py-2"
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
                        className="giveUpButton min-w-[100px] px-4 py-2"
                        onClick={handleGiveUp}
                        disabled={gameState.guesses.length === 0}
                      >
                        Give up
                      </button>
                    </div>
                  </div>

                  <div className="guessCount text-center px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md font-medium">
                    Guesses: <span className="font-bold">{gameState.guesses.length}/{gameState.maxGuesses}</span>
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
            </div>
            
            {/* Game content with wider table - full width */}
            {!gameState.gameOver && (
              <div className="game-content w-full pb-12">
        
                {/* Parameter Boxes aligned with table columns */}
                <div className="parameterBoxesContainer mb-2 w-full">
                  <div className="parameterBox sportBox">
                    <span>Name</span>
                  </div>
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
                
                {/* Table with colgroup to enforce column widths */}
                <table className="guessTable mt-10 w-full table-fixed">
                  <colgroup>
                    <col className="w-1/5" /> {/* Name column - 20% */}
                    <col className="w-[15%]" /> {/* Sport column - 15% */}
                    <col className="w-[15%]" /> {/* Country column - 15% */}
                    <col className="w-[15%]" /> {/* Age column - 15% */}
                    <col className="w-[15%]" /> {/* Olympics column - 15% */}
                    <col className="w-1/5" /> {/* Championships column - 20% */}
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left bg-gray-100 dark:bg-gray-700">Name</th>
                      <th className="px-4 py-3 text-left bg-gray-100 dark:bg-gray-700">Sport</th>
                      <th className="px-4 py-3 text-left bg-gray-100 dark:bg-gray-700">Country</th>
                      <th className="px-4 py-3 text-left bg-gray-100 dark:bg-gray-700">Age</th>
                      <th className="px-4 py-3 text-left bg-gray-100 dark:bg-gray-700">Olympics</th>
                      <th className="px-4 py-3 text-left bg-gray-100 dark:bg-gray-700">Championships</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameState.guesses.map((guess, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 truncate">{guess.name}</td>
                        <td className={`px-4 py-3 truncate ${isMatch(guess, 'sport') ? "match" : ''}`}>
                          {guess.sport}
                        </td>
                        <td className={`px-4 py-3 truncate ${isMatch(guess, 'country') ? "match" : ''}`}>
                          {guess.country}
                        </td>
                        <td className={`px-4 py-3 ${isMatch(guess, 'age') ? "match" : ''}`}>
                          {guess.age}
                          {!isMatch(guess, 'age') && getDirectionalHint(guess, 'age') && (
                            <span className={`directional-hint-${getDirectionalHint(guess, 'age')} ml-2 ${getDirectionalHint(guess, 'age') === 'higher' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}`}>
                              {getDirectionalHint(guess, 'age') === 'higher' ? '↑' : '↓'}
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3 ${isMatch(guess, 'olympics') ? "match" : ''}`}>
                          {guess.olympics}
                          {!isMatch(guess, 'olympics') && getDirectionalHint(guess, 'olympics') && (
                            <span className={`directional-hint-${getDirectionalHint(guess, 'olympics')} ml-2 ${getDirectionalHint(guess, 'olympics') === 'higher' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}`}>
                              {getDirectionalHint(guess, 'olympics') === 'higher' ? '↑' : '↓'}
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3 ${isMatch(guess, 'championships') ? "match" : ''}`}>
                          {guess.championships}
                          {!isMatch(guess, 'championships') && getDirectionalHint(guess, 'championships') && (
                            <span className={`directional-hint-${getDirectionalHint(guess, 'championships')} ml-2 ${getDirectionalHint(guess, 'championships') === 'higher' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}`}>
                              {getDirectionalHint(guess, 'championships') === 'higher' ? '↑' : '↓'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
            )}
          </div>
        </div>
      </main>
      {/* Add a visual divider between game and blog section */}
      {/* <div className="my-36 border-t border-gray-200 dark:border-gray-700"></div> */}
      
      {/* Blog Section for SEO */}
      <section className="blog-section bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6 text-center">In The World Of Sports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Daily Post */}
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">TODAY'S PUZZLE</span>
              <h3 className="text-xl font-bold mt-2 mb-3">
                <a href="/blog/todays-mlb-wordle-april-23-2025" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Today's MLB Wordle – April 23, 2025 (Hint & Stats)
                </a>
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Struggling with today's MLB Wordle? Here's a subtle hint: This All-Star has dominated the American League for years. Plus check out today's most common first guesses!
              </p>
              <a href="/blog/todays-mlb-wordle-april-23-2025" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                Read more →
              </a>
            </article>
            
            {/* Evergreen Content */}
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <span className="text-xs text-green-600 dark:text-green-400 font-semibold">STRATEGY GUIDE</span>
              <h3 className="text-xl font-bold mt-2 mb-3">
                <a href="/blog/how-to-win-mlb-wordle-every-time" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  How to Win MLB Wordle Every Time: Pro Tips & Strategies
                </a>
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Master the daily MLB player guessing game with our expert strategies. Learn which players to guess first, how to use process of elimination, and win MLB Wordle in fewer guesses!
              </p>
              <a href="/blog/how-to-win-mlb-wordle-every-time" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                Read more →
              </a>
            </article>
          </div>
          
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* More SEO-rich content blocks */}
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold mb-2">
                <a href="/blog/mlb-wordle-vs-traditional-wordle" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  MLB Wordle vs Traditional Wordle: Key Differences Explained
                </a>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                How our baseball-themed word game puts a unique spin on the classic formula for MLB fans.
              </p>
            </article>
            
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold mb-2">
                <a href="/blog/most-guessed-players-mlb-wordle" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  10 Most Guessed Players in MLB Wordle History
                </a>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                From Mike Trout to Shohei Ohtani: See which baseball stars everyone tries first in our daily baseball guessing game.
              </p>
            </article>
            
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold mb-2">
                <a href="/blog/baseball-word-games-history" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  The History of Baseball Word Games and Puzzles
                </a>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                From baseball crosswords to modern MLB Wordle - explore how America's pastime has inspired word puzzles through the decades.
              </p>
            </article>
          </div>
          
          {/* Rich SEO footer with long-tail keywords */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-4 text-gray-700 dark:text-gray-300">Popular MLB Wordle Topics</h4>
            <div className="flex flex-wrap gap-2 text-sm">
              <a href="/tags/daily-baseball-puzzle" className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">daily baseball puzzle</a>
              <a href="/tags/mlb-word-game" className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">mlb word game</a>
              <a href="/tags/baseball-wordle" className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">baseball wordle</a>
              <a href="/tags/guess-the-mlb-player" className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">guess the mlb player</a>
              <a href="/tags/baseball-guessing-game" className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">baseball guessing game</a>
              <a href="/tags/mlb-player-quiz" className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">mlb player quiz</a>
              <a href="/tags/baseball-stats-game" className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">baseball stats game</a>
              <a href="/tags/daily-mlb-challenge" className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">daily mlb challenge</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer py-8 text-center mb-10">
        <p className="text-sm text-gray-600 dark:text-gray-300 pt-4">This site is not affiliated with any sports organization.</p>
        <div className="footer-links mt-6">
          <h4 className="font-medium mb-3">Explore More Wordle Games:</h4>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 list-none">

            <li>
              <a href="https://ufcwordle.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                UFC Wordle
              </a>
            </li>
            <li>
              <a href="https://mlbwordle.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                MLB Wordle
              </a>
            </li>
            <li>
              <a href="https://tvwordle.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                TV Wordle
              </a>
            </li>
            <li>
              <a href="https://businesswordle.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                Business Wordle
              </a>
            </li>
            <li>
              <a href="https://historywordle.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                History Wordle
              </a>
            </li>
          </ul>
        </div>
      </footer>

      <div>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `{
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "SportsWordle",
              "url": "https://www.sportswordle.com"
            }`
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `{
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.sportswordle.com"
              }]
            }`
          }}
        />
      </div>

      {/* Replace the fixed table with a responsive card-based layout on mobile */}
      <div className="md:hidden">
        {gameState.guesses.map((guess, index) => (
          <div key={index} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="font-bold mb-2">{guess.name}</div>
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-2 rounded ${isMatch(guess, 'sport') ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-700"}`}>
                <span className="text-xs font-medium">Sport</span>
                <div>{guess.sport}</div>
              </div>
              {/* More properties in grid layout */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}