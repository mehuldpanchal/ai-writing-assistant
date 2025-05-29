import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import Button from '../components/ui/Button'
import StyleButton from '../components/ui/StyleButton'
import { createEditor, Node } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSpellCheck, FaPenAlt, FaMagic, FaArrowLeft, FaCopy, FaFeatherAlt } from 'react-icons/fa'

const humorousPhrases = [
  'Consulting the Oxford Oracle…',
  'Refining your linguistic brilliance…',
  'Tickling the thesaurus…',
  'Whipping out the red pen…',
  'Beautifying your babble…'
]

const writingStyles = ['Professional', 'Casual', '#Social', 'Polite', 'Emojify', 'Funny', 'Sarcastic', 'Puns', 'Shorten', 'Proofread', 'Supportive']

export default function Home() {
  const editor = useMemo(() => withReact(createEditor()), [])
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: '' }]
    }
  ])
  const [originalText, setOriginalText] = useState('')
  const [correctedText, setCorrectedText] = useState('')
  const [correctedRanges, setCorrectedRanges] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0)
  const [showWritingStyles, setShowWritingStyles] = useState(false)
  const [styledText, setStyledText] = useState('')
  const [selectedStyle, setSelectedStyle] = useState(null)
  const hiddenTextareaRef = useRef(null)

  // Update originalText when value changes
  useEffect(() => {
    const plainText = value.map((node) => Node.string(node)).join('\\n')
    setOriginalText(plainText)
  }, [value])

  // Rotate loading phrases
  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setLoadingPhraseIndex((i) => (i + 1) % humorousPhrases.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [loading])

  // Handle Spelling and Grammar button click
  const getUserId = () => {
    let userId = localStorage.getItem('userId')
    if (!userId) {
      userId = 'user-' + Math.random().toString(36).substring(2, 9)
      localStorage.setItem('userId', userId)
    }
    return userId
  }

  const handleSpellingGrammar = async () => {
    if (!originalText.trim()) return
    setLoading(true)
    setShowWritingStyles(false)
    setStyledText('')
    setSelectedStyle(null)
    try {
      const userId = getUserId()
      const res = await fetch('/api/spelling-grammar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({ text: originalText })
      })
      
      if (res.status === 429) {
        const data = await res.json()
        alert(`Daily credit limit reached. You have ${data.creditsRemaining} credits remaining.`)
        return
      }

      const data = await res.json()
      if (data.correctedText) {
        setCorrectedText(data.correctedText)
        const corrections = findCorrections(originalText, data.correctedText)
        setCorrectedRanges(corrections)
      }
    } catch (error) {
      console.error(error)
      alert('Failed to check spelling and grammar. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Writing Style button click
  const handleWritingStyle = () => {
    if (!originalText.trim()) return
    setShowWritingStyles(true)
    setCorrectedText('')
    setCorrectedRanges([])
    setStyledText('')
    setSelectedStyle(null)
  }

  // Handle style selection
  const handleStyleSelect = async (style) => {
    setLoading(true)
    setSelectedStyle(style)
    setStyledText('')
    try {
      const userId = getUserId()
      const res = await fetch('/api/writing-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({ text: originalText, style })
      })
      
      if (res.status === 429) {
        const data = await res.json()
        alert(`Daily credit limit reached. You have ${data.creditsRemaining} credits remaining.`)
        return
      }

      const data = await res.json()
      if (data.styledText) {
        setStyledText(data.styledText)
      }
    } catch (error) {
      console.error(error)
      alert('Failed to apply writing style. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Copy plain text to clipboard
  const handleCopy = async () => {
    try {
      const textToCopy = correctedText || styledText || originalText
      await navigator.clipboard.writeText(textToCopy)
    } catch (error) {
      console.error('Failed to copy text:', error)
      alert('Copy failed. Please try again or check browser permissions.')
    }
  }

  // Render text with underlined corrected words
  const renderCorrectedText = () => {
    if (!correctedText || correctedRanges.length === 0) {
      return <p className="whitespace-pre-wrap">{correctedText || originalText}</p>
    }
    const elements = []
    let lastIndex = 0
    correctedRanges.forEach(({ offset, length }, i) => {
      if (offset > lastIndex) {
        elements.push(
          <span key={`text-${i}-normal`}>
            {correctedText.slice(lastIndex, offset)}
          </span>
        )
      }
      elements.push(
        <span key={`text-${i}-underline`} className="underline">
          {correctedText.slice(offset, offset + length)}
        </span>
      )
      lastIndex = offset + length
    })
    if (lastIndex < correctedText.length) {
      elements.push(
        <span key="text-last">{correctedText.slice(lastIndex)}</span>
      )
    }
    return <p className="whitespace-pre-wrap">{elements}</p>
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] relative text-white p-4 sm:p-6 flex flex-col items-center overflow-hidden">
      <div className="glow-behind"></div>
      <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 select-none flex items-center justify-center gap-2 sm:gap-3 text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <FaFeatherAlt className="text-blue-400 text-2xl" />
          <span className="text-white">Grammar & Writing Style</span>
        </motion.div>
      </div>
      <div className="w-full max-w-lg sm:max-w-2xl md:max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="glassmorphism p-3 sm:p-6 md:p-8 flex flex-col"
        >
        <Slate editor={editor} value={value} onChange={setValue}>
          <Editable
            className="min-h-[250px] bg-transparent outline-none text-lg leading-relaxed placeholder-gray-400"
            placeholder="Start typing or paste your text here..."
            readOnly={loading}
          />
        </Slate>
        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
          <Button
            icon={FaSpellCheck}
            onClick={handleSpellingGrammar}
            disabled={loading}
            className="w-full sm:flex-1 text-sm sm:text-base"
          >
            Spelling and Grammar
          </Button>
          <Button
            icon={FaPenAlt}
            onClick={handleWritingStyle}
            disabled={loading}
            className="w-full sm:flex-1 text-sm sm:text-base"
          >
            Writing Style
          </Button>
        </div>

        {/* Display corrected text with underlines */}
        {correctedText && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-display relative"
          >
            <button
              onClick={() => navigator.clipboard.writeText(correctedText)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition"
              aria-label="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            {renderCorrectedText()}
          </motion.div>
        )}

        {/* Writing Style Modal */}
        {showWritingStyles && !loading && (
          <AnimatePresence>
            {showWritingStyles && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98, height: 0 }}
                animate={{ opacity: 1, y: 0, scale: 1, height: "auto" }}
                exit={{ opacity: 0, y: -20, scale: 0.98, height: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 sm:p-8 w-full mt-6"
                style={{ overflow: "hidden" }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Transform Your Writing Style
                  </h2>
                  <button
                    onClick={() => setShowWritingStyles(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                  {writingStyles.map((style) => (
                    <StyleButton
                      key={style}
                      style={style}
                      selectedStyle={selectedStyle}
                      onClick={() => handleStyleSelect(style)}
                    >
                      {style}
                    </StyleButton>
                  ))}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Display styled text */}
        {styledText && !loading && (
          <motion.div
            key={selectedStyle}
            className="mt-6 text-display relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button
              onClick={() => navigator.clipboard.writeText(styledText)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition"
              aria-label="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            {styledText}
          </motion.div>
        )}
        </motion.div>
      </div>


      {/* Fullscreen loader modal */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="loader-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="morphing-blob"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
            />
            <motion.div
              key={loadingPhraseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="neon-text"
            >
              {humorousPhrases[loadingPhraseIndex]}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper function to find corrections between original and corrected text
function findCorrections(original, corrected) {
  const corrections = []
  const originalWords = original.split(/\\b/)
  const correctedWords = corrected.split(/\\b/)

  let index = 0
  for (let i = 0; i < originalWords.length; i++) {
    const origWord = originalWords[i]
    const corrWord = correctedWords[i] || ''
    if (origWord !== corrWord) {
      corrections.push({ offset: index, length: origWord.length })
    }
    index += origWord.length
  }
  return corrections
}