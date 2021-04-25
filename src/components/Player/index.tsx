import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePlayer } from '../../contexts/PlayerContext';
import styles from './styles.module.scss';
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0); //Tempo em segundos do progresso do episódio

    const { 
        episodeList, 
        currentEpisodeIndex, 
        isPlaying, 
        togglePlay,
        setPlayingState,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious,
        isLooping,
        toggleLoop,
        toggleShuffle,
        isShuffling,
        clearPlayerState,
    } = usePlayer();

    //Podcast que está tocando agora
    const episode = episodeList[currentEpisodeIndex];

    useEffect(() => {
        if(!audioRef.current) {
            return;
        }

        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    //Ouvindo o progresso do progress (do audio do episódio)
    function setupProgressListener() {
        audioRef.current.currentTime = 0; //Voltando o time do player p/ estaca zero

        //Ouvindo evento do audio tocando
        audioRef.current.addEventListener('timeupdate', () => {
            //O evento é disparado o tempo todo enquanto o audio está tocando
            const currentTimePlayer = audioRef.current.currentTime; //Retorna o tempo atual do player
            setProgress(Math.floor(currentTimePlayer));
        });
    }

    //Função p/ movimentar o slider
    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount; //Atualizar o audio com o tanto que a pessoa correu o audio
        setProgress(amount); //Atualizar na variavel de progresso com o tanto que a pessoa correu o audio
    }

    //Função disparada quando um episódio termina de tocar
    function handleEpisodeEnded() {
        if (hasNext) {
            //Se tiver um proximo episódio ele toca o próximo
            playNext();
        } else {
            //Se não tiver um proximo episódio ele limpa o estado
            clearPlayerState();
        }
    }

    return(
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora"/>
                <strong>Tocando agora</strong>
            </header>

            { episode ? (
                <div className={styles.currentEpisode}>
                    <Image
                        width={592}
                        height={592}
                        src={episode.thumbnail}
                        objectFit="cover"
                    />
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            )}

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        { episode ? (
                            <Slider
                                value={progress}
                                max={episode.duration}
                                onChange={handleSeek}
                                trackStyle={{ backgroundColor: '#04d361' }}
                                railStyle={{ backgroundColor: '#9f75ff' }}
                                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
                            />
                        ) : (
                            <div className={styles.emptySlider} />
                        )}
                    </div>
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                { episode && (
                    <audio 
                        ref={audioRef}
                        src={episode.url}
                        autoPlay
                        onEnded={handleEpisodeEnded}
                        loop={isLooping}
                        onPlay={() => setPlayingState(true)}
                        onPause={() => setPlayingState(false)}
                        onLoadedMetadata={setupProgressListener}
                    />
                )}

                <div className={styles.buttons}>
                    <button 
                        type="button" 
                        disabled={!episode || episodeList.length === 1}
                        onClick={toggleShuffle}
                        className={isShuffling ? styles.isActive : ''}
                    >
                        <img src="/shuffle.svg" alt="Embaralhar"/>
                    </button>
                    <button 
                        onClick={playPrevious} 
                        type="button" 
                        disabled={!episode || !hasPrevious}
                    >
                        <img src="/play-previous.svg" alt="Tocar anterior"/>
                    </button>
                    <button 
                        onClick={togglePlay} 
                        type="button" 
                        className={styles.playButton} 
                        disabled={!episode}
                    >
                        { isPlaying ? (
                            <img src="/pause.svg" alt="Tocar"/>
                        ) : (
                            <img src="/play.svg" alt="Tocar"/>
                        ) }
                    </button>
                    <button 
                        onClick={playNext} 
                        type="button" 
                        disabled={!episode || !hasNext}
                    >
                        <img src="/play-next.svg" alt="Tocar próxima"/>
                    </button>
                    <button 
                        type="button" 
                        disabled={!episode}
                        onClick={toggleLoop}
                        className={isLooping ? styles.isActive : ''}
                    >
                        <img src="/repeat.svg" alt="Repetir"/>
                    </button>
                </div>
            </footer>
        </div>
    );
}