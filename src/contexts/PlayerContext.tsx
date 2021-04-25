import { createContext, ReactNode, useContext, useState } from 'react';

type Episode = {
    title: string;
    members: string;
    thumbnail: string;
    duration: number;
    url: string;
}

type PlayerContextData = {
    episodeList: Episode[];
    currentEpisodeIndex: number; //Indice do episóde atual q está tocando (vai apontar em qual posição da lista é o episódio que está tocando atualmente)
    isPlaying: boolean; //Define se algum audio está tocando
    play: (episode: Episode) => void;
    playList: (list: Episode[], index: number) => void;
    togglePlay: () => void;
    setPlayingState: (state: boolean) => void;
    playNext: () => void;
    playPrevious: () => void;
    hasNext: boolean;
    hasPrevious: boolean;
    toggleLoop: () => void;
    isLooping: boolean;
    toggleShuffle: () => void;
    isShuffling: boolean;
    clearPlayerState: () => void;
}

//Atribuindo um tipo de formato de dado para o contexto:
const PlayerContext = createContext({} as PlayerContextData);

type PlayerContextProviderProps = {
    children: ReactNode;
}

export function PlayerContextProvider({ children }: PlayerContextProviderProps) {
  const [episodeList, setEpisodeList] = useState([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const hasPrevious = currentEpisodeIndex > 0;
  const hasNext = isShuffling || (currentEpisodeIndex + 1) < episodeList.length;

  //Tocar um episódio
  function play(episode: Episode) {
    setEpisodeList([episode]);
    setCurrentEpisodeIndex(0);
    setIsPlaying(true);
  }

  //Tocar a lista de episódios e estabelecer o index do episódio clicado
  function playList(list: Episode[], index: number) {
    setEpisodeList(list);
    setCurrentEpisodeIndex(index);
    setIsPlaying(true);
  }

  //Trocar estado de Play e Pause para ícones
  function togglePlay() {
    setIsPlaying(!isPlaying);
  }

  //Controla se o play está em loop ou não
  function toggleLoop() {
    setIsLooping(!isLooping);
  }

  //Controla se o play está em shuffle ou não
  function toggleShuffle() {
    setIsShuffling(!isShuffling);
  }

  //Trocar estado de Play e Pause para a tag audio
  function setPlayingState(state: boolean) {
    setIsPlaying(state);
  }

  //Tocar próximo episódio
  function playNext() {
      if(isShuffling) {
          //Caso a lista esteja embaralhada
          const nextRandomEpisodeIndex = Math.floor(Math.random() * episodeList.length);
          setCurrentEpisodeIndex(nextRandomEpisodeIndex);
      }else if (hasNext) {
        //Caso a lista não esteja embaralhada
        setCurrentEpisodeIndex(currentEpisodeIndex + 1);
      }
  }

  //Tocar episódio anterior
  function playPrevious() {
      if(hasPrevious) {
          setCurrentEpisodeIndex(currentEpisodeIndex - 1);
      }
  }

  //Limpando a lista de episódios
  function clearPlayerState() {
      setEpisodeList([]);
      setCurrentEpisodeIndex(0);
  }

  return (
    <PlayerContext.Provider 
        value={{ 
            episodeList, 
            currentEpisodeIndex, 
            isPlaying, 
            hasNext,
            hasPrevious,
            play, 
            togglePlay, 
            setPlayingState,
            playList,
            playNext,
            playPrevious,
            toggleLoop,
            isLooping,
            toggleShuffle,
            isShuffling,
            clearPlayerState,
        }}>
            {children}
        </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
    return useContext(PlayerContext);
}
 