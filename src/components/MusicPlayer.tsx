import { useCallback, useEffect, useRef, useState } from 'react'
import { ExternalLink, Pause, Play, Volume2 } from 'lucide-react'

const CNY_MUSIC_SOURCES = [
  '/audio/cny.mp3',
  '/audio/music.mp3',
  '/audio/bgm.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
]
const DOWNLOAD_HINT_URL = 'https://pixabay.com/music/search/chinese%20new%20year/'

function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.6)
  const [hasError, setHasError] = useState(false)
  const [sourceIndex, setSourceIndex] = useState(0)

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume
  }, [volume])

  const tryNextSource = useCallback(() => {
    setSourceIndex((i) => {
      const next = i + 1
      if (next >= CNY_MUSIC_SOURCES.length) {
        setHasError(true)
        return i
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (!audioRef.current) return
    setHasError(false)
    if (isPlaying) audioRef.current.play().catch(tryNextSource)
  }, [sourceIndex, isPlaying, tryNextSource])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      setHasError(false)
      audioRef.current.play().catch(tryNextSource)
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-ink-red-500/20 bg-white/80 px-3 py-2">
      <div className="flex items-center gap-2">
      <audio
        key={sourceIndex}
        ref={audioRef}
        src={CNY_MUSIC_SOURCES[sourceIndex]}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={tryNextSource}
      />
      <button
        type="button"
        onClick={togglePlay}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-red-500/20 text-ink-red-600 transition hover:bg-ink-red-500/30"
        title={isPlaying ? '暂停' : '播放'}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <div className="flex items-center gap-1">
        <Volume2 className="h-4 w-4 text-ink-ink/60" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="h-1 w-16 accent-ink-red-500"
        />
      </div>
      <span className="text-xs text-ink-ink/60">喜庆乐曲</span>
      </div>
      {hasError && (
        <a
          href={DOWNLOAD_HINT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-ink-red-600 hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          将 MP3 放入 public/audio/cny.mp3 或 music.mp3
        </a>
      )}
    </div>
  )
}

export default MusicPlayer
