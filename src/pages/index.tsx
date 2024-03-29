import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { api } from '../services/api';
import Image from 'next/image';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import styles from './home.module.scss';
import { usePlayer } from '../contexts/PlayerContext';

type Episode = {
  id: string;
  title: string;
  members: string;
  publishedAt: string;
  thumbnail: string;
  duration: number;
  durationAsString: string;
  url: string;
}

type HomeProps = {
  latestEpsodes: Array<Episode>;
  allEpisodes:  Array<Episode>;
}

export default function Home({ latestEpsodes, allEpisodes }: HomeProps) {
  const { playList } = usePlayer();

  //Criando uma só lista de episódios (Lista completa de episódios)
  const episodeList = [...latestEpsodes, ...allEpisodes];

  return (
    <div className={styles.homePage}>
        <Head>
          <title>Podcastr | Home</title>
        </Head>

        <section className={styles.latestEpisodes}>
          <h2>Últimos lançamentos</h2>

          <ul>
            { latestEpsodes.map( (episode, index) => (
              <li key={episode.id}>
                <div className={styles.imageContainer}>
                  <Image 
                    width={192}
                    height={192}
                    objectFit="cover"
                    src={episode.thumbnail} 
                    alt={episode.title} 
                  />
                </div>

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Tocar episódio"/>
                </button>
              </li>
            )) }
          </ul>
        </section>

        <section className={styles.allEpisodes}>
          <h2>Todos episódios</h2>

          <table cellSpacing={0}>
              <thead>
                <tr>
                  <th></th>
                  <th>Podcasts</th>
                  <th>Integrantes</th>
                  <th>Data</th>
                  <th>Duração</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {allEpisodes.map((episode, index) => (
                  <tr key={episode.id}>
                    <td style={{ width: 72 }}>
                      <Image
                        width={120}
                        height={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover"
                      />
                    </td>
                    <td>
                      <Link href={`/episodes/${episode.id}`}>
                        <a>{episode.title}</a>
                      </Link>
                    </td>
                    <td>{episode.members}</td>
                    <td style={{ width: 100 }}>{episode.publishedAt}</td>
                    <td>{episode.durationAsString}</td>
                    <td>
                      <button 
                        type="button" 
                        onClick={() => playList(episodeList, index + latestEpsodes.length)}
                      >
                        <img src="/play-green.svg" alt="Tocar episódio"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </section>
    </div>
  );
}

export const  getStaticProps: GetStaticProps = async () => {
  //Recuperando os episódios de forma estática:
  const { data } = await api.get('/episodes',  {
    params: {
      _limit: 12, //Limite de episódios na requisição
      _sort: 'published_at', //Ordenação
      _order: 'desc', //Ordenação na ordem decrescente
    }
  });

  //Formatamdo episódios antes de mostrar na tela: 
  const episodes = data.map((episode) => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url,
    }
  });

  const latestEpsodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpsodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8,
  }
}
