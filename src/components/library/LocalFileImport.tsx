import { useRef, useState } from 'react';
import { usePlayerContext } from '../../context/PlayerContext';
import { importLocalFiles, getAudioDuration } from '../../services/LocalFileService';

export function LocalFileImport() {
  const { addToQueue, updateSongDuration } = usePlayerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (files: FileList) => {
    const songs = importLocalFiles(files);
    for (const song of songs) {
      addToQueue(song);
      const durationMs = await getAudioDuration(song.previewUrl);
      if (durationMs > 0) {
        updateSongDuration(song.id, durationMs);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      className={`file-import ${isDragging ? 'file-import--dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="file-import__input"
        onChange={handleFileChange}
      />
      <span className="file-import__icon">🎵</span>
      <p className="file-import__text">
        {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos de audio o haz clic para importar'}
      </p>
    </div>
  );
}
