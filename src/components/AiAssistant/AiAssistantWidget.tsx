import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Dices,
  Bot,
  User,
  Loader2,
  Film,
  ArrowRight,
  Bookmark,
  MessageSquare,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  generateAiRecommendation,
  spinRandomizer,
  type ChatMessage,
} from '../../services/aiRecommendationService';
import type { Movie } from '../../types';
import './AiAssistantWidget.css';

interface AiAssistantWidgetProps {
  userWatchlist?: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export const AiAssistantWidget: React.FC<AiAssistantWidgetProps> = ({
  userWatchlist = [],
  onSelectMovie,
}) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'randomizer'>('chat');

  /* Chat State */
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: t('aiGreeting'),
      timestamp: new Date(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);

  /* Scroll Ref */
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  /* Randomizer State */
  const [rouletteSource, setRouletteSource] = useState<'watchlist' | 'trending' | 'genre'>('trending');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [randomPick, setRandomPick] = useState<Movie | null>(null);

  /* Auto-scroll to bottom whenever messages change or AI finishes thinking */
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, activeTab]);

  /* Send Message Logic */
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputQuery;
    if (!textToSend.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputQuery('');
    setIsThinking(true);

    try {
      const response = await generateAiRecommendation(textToSend, userWatchlist, language);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        recommendations: response.recommendations,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text:
          language === 'ko'
            ? '죄송합니다. 추천 결과를 불러오는 중에 문제가 발생했습니다.'
            : 'Sorry, I ran into an issue finding recommendations. Please try again!',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  /* Spin Randomizer Logic */
  const handleSpinRoulette = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setRandomPick(null);

    setTimeout(async () => {
      try {
        const movie = await spinRandomizer(rouletteSource, userWatchlist);
        setRandomPick(movie);
      } catch {
        setRandomPick(null);
      } finally {
        setIsSpinning(false);
      }
    }, 1200);
  };

  return (
    <div className="ai-widget-wrapper">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="ai-trigger-btn"
          onClick={() => setIsOpen(true)}
          title={t('aiTriggerTitle')}
        >
          <div className="trigger-glow" />
          <Sparkles className="trigger-icon" />
          <span className="trigger-text">{t('aiTriggerTitle')}</span>
        </button>
      )}

      {/* Drawer Overlay Window */}
      {isOpen && (
        <div className="ai-drawer-card">
          {/* Header Bar */}
          <div className="ai-drawer-header">
            <div className="ai-brand-title">
              <div className="bot-avatar-badge">
                <Sparkles className="bot-sparkle-icon" />
              </div>
              <div>
                <h3>{t('aiWidgetHeader')}</h3>
                <span className="ai-status-indicator">• Online</span>
              </div>
            </div>
            <button
              type="button"
              className="ai-close-btn"
              onClick={() => setIsOpen(false)}
              title={t('modalClose')}
            >
              <X className="close-icon" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="ai-drawer-tabs">
            <button
              type="button"
              className={`ai-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare className="tab-icon" />
              <span>{t('tabAiChat')}</span>
            </button>
            <button
              type="button"
              className={`ai-tab-btn ${activeTab === 'randomizer' ? 'active' : ''}`}
              onClick={() => setActiveTab('randomizer')}
            >
              <Dices className="tab-icon" />
              <span>{t('tabRandomizer')}</span>
            </button>
          </div>

          {/* TAB 1: AI CHAT ASSISTANT */}
          {activeTab === 'chat' && (
            <div className="ai-chat-body">
              {/* Quick Chip Prompts */}
              <div className="quick-chips-row">
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => handleSendMessage(t('chipSciFi'))}
                >
                  {t('chipSciFi')}
                </button>
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => handleSendMessage(t('chipKdrama'))}
                >
                  {t('chipKdrama')}
                </button>
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => handleSendMessage(t('chipQuick'))}
                >
                  {t('chipQuick')}
                </button>
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => handleSendMessage(t('chipWatchlist'))}
                >
                  {t('chipWatchlist')}
                </button>
              </div>

              {/* Chat Stream */}
              <div className="chat-messages-container" ref={chatContainerRef}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-bubble-wrapper ${
                      msg.sender === 'user' ? 'user-msg' : 'ai-msg'
                    }`}
                  >
                    <div className="msg-avatar">
                      {msg.sender === 'user' ? (
                        <User className="avatar-icon" />
                      ) : (
                        <Bot className="avatar-icon" />
                      )}
                    </div>
                    <div className="msg-content-box">
                      <p className="msg-text">{msg.text}</p>

                      {/* Attached Recommendation Cards */}
                      {msg.recommendations && msg.recommendations.length > 0 && (
                        <div className="chat-recommendations-grid">
                          {msg.recommendations.map((movie) => (
                            <div
                              key={movie.imdbID}
                              className="chat-rec-card"
                              onClick={() => {
                                onSelectMovie(movie);
                                setIsOpen(false);
                              }}
                            >
                              <img
                                src={
                                  movie.Poster && movie.Poster !== 'N/A'
                                    ? movie.Poster
                                    : 'https://via.placeholder.com/150x225?text=No+Poster'
                                }
                                alt={movie.Title}
                                className="chat-rec-poster"
                              />
                              <div className="chat-rec-info">
                                <h4 className="chat-rec-title" title={movie.Title}>
                                  {movie.Title}
                                </h4>
                                <span className="chat-rec-year">
                                  {movie.Year} • {movie.Type}
                                </span>
                                <button type="button" className="chat-rec-view-btn">
                                  <span>{t('viewMovieDetails')}</span>
                                  <ArrowRight className="rec-arrow" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="message-bubble-wrapper ai-msg">
                    <div className="msg-avatar">
                      <Bot className="avatar-icon" />
                    </div>
                    <div className="msg-content-box thinking-box">
                      <Loader2 className="thinking-spinner" />
                      <span>{t('botThinking')}</span>
                    </div>
                  </div>
                )}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                className="chat-input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input
                  type="text"
                  className="chat-input-field"
                  placeholder={t('aiPromptPlaceholder')}
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  disabled={isThinking}
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={!inputQuery.trim() || isThinking}
                  title="Send message"
                >
                  <Send className="send-icon" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: MOVIE ROULETTE */}
          {activeTab === 'randomizer' && (
            <div className="ai-randomizer-body">
              <div className="randomizer-intro">
                <div className={`roulette-wheel-graphic ${isSpinning ? 'spinning' : ''}`}>
                  <Dices className="roulette-icon" />
                </div>
                <h3>{t('randomizerTitle')}</h3>
                <p>{t('randomizerSubtitle')}</p>
              </div>

              {/* Source Selector */}
              <div className="source-selector-group">
                <label className="source-label">{t('randomizerSourceLabel')}</label>
                <div className="source-buttons">
                  <button
                    type="button"
                    className={`source-opt-btn ${rouletteSource === 'trending' ? 'active' : ''}`}
                    onClick={() => setRouletteSource('trending')}
                  >
                    <Film className="opt-icon" />
                    <span>{t('sourceTrending')}</span>
                  </button>
                  <button
                    type="button"
                    className={`source-opt-btn ${rouletteSource === 'watchlist' ? 'active' : ''}`}
                    onClick={() => setRouletteSource('watchlist')}
                  >
                    <Bookmark className="opt-icon" />
                    <span>{t('sourceWatchLater')}</span>
                  </button>
                  <button
                    type="button"
                    className={`source-opt-btn ${rouletteSource === 'genre' ? 'active' : ''}`}
                    onClick={() => setRouletteSource('genre')}
                  >
                    <Sparkles className="opt-icon" />
                    <span>{t('sourceGenre')}</span>
                  </button>
                </div>
              </div>

              {/* Spin Action */}
              <button
                type="button"
                className="spin-roulette-btn"
                onClick={handleSpinRoulette}
                disabled={isSpinning}
              >
                {isSpinning ? (
                  <>
                    <Loader2 className="spin-spinner" />
                    <span>{t('spinning')}</span>
                  </>
                ) : (
                  <>
                    <Dices className="spin-btn-icon" />
                    <span>{t('spinBtn')}</span>
                  </>
                )}
              </button>

              {/* Revealed Movie Pick Card */}
              {!isSpinning && randomPick && (
                <div className="random-result-card animate-reveal">
                  <img
                    src={
                      randomPick.Poster && randomPick.Poster !== 'N/A'
                        ? randomPick.Poster
                        : 'https://via.placeholder.com/200x300?text=No+Poster'
                    }
                    alt={randomPick.Title}
                    className="result-poster"
                  />
                  <div className="result-details">
                    <span className="result-badge">🎲 Winner Movie Pick</span>
                    <h4 className="result-title">{randomPick.Title}</h4>
                    <p className="result-meta">{randomPick.Year} • {randomPick.Type}</p>
                    <div className="result-actions">
                      <button
                        type="button"
                        className="result-details-btn"
                        onClick={() => {
                          onSelectMovie(randomPick);
                          setIsOpen(false);
                        }}
                      >
                        {t('viewMovieDetails')}
                      </button>
                      <button
                        type="button"
                        className="result-again-btn"
                        onClick={handleSpinRoulette}
                      >
                        {t('spinAgain')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!isSpinning && !randomPick && rouletteSource === 'watchlist' && userWatchlist.length === 0 && (
                <p className="randomizer-empty-notice">
                  {t('emptyRandomizerWatchlist')}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiAssistantWidget;
